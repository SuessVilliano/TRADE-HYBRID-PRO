import axios, { AxiosInstance } from 'axios';
import { db } from '../db';
import { 
  tradingPlatforms, 
  userPlatformConnections, 
  tradingPlatformAccounts, 
  platformTrades,
  TradingPlatform,
  UserPlatformConnection,
  TradingPlatformAccount,
  PlatformTrade
} from '../../shared/schema-trading-platforms';
import { eq, and } from 'drizzle-orm';

interface PlatformCredentials {
  username?: string;
  password?: string;
  apiKey?: string;
  apiSecret?: string;
  server?: string;
  demo?: boolean;
}

interface AccountInfo {
  accountNumber: string;
  accountName: string;
  accountType: 'demo' | 'live' | 'prop';
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
}

interface TradeInfo {
  platformTradeId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  orderType: 'market' | 'limit' | 'stop';
  commission: number;
  swap: number;
  profit: number;
  openTime?: Date;
  closeTime?: Date;
}

export class TradingPlatformService {
  private platforms: Map<string, AxiosInstance> = new Map();

  constructor() {
    this.initializePlatforms();
  }

  private async initializePlatforms() {
    // Initialize platform configurations
    await this.ensurePlatformsExist();
  }

  private async ensurePlatformsExist() {
    const platformConfigs = [
      {
        name: 'DX Trade',
        platformType: 'dxtrade',
        apiBaseUrl: 'https://demo.dx.trade/api',
        webTradeUrl: 'https://demo.dx.trade/traders',
        authType: 'credentials',
        configuration: {
          demo: true,
          supportsAPI: true,
          supportsWebTrading: true
        }
      },
      {
        name: 'Match Trader',
        platformType: 'matchtrader',
        apiBaseUrl: 'https://api.match-trader.com',
        webTradeUrl: 'https://mtr.gooeytrade.com/dashboard',
        authType: 'api_key',
        configuration: {
          demo: true,
          supportsAPI: true,
          supportsWebTrading: true,
          whiteLabelUrl: 'https://mtr.gooeytrade.com'
        }
      },
      {
        name: 'cTrader',
        platformType: 'ctrader',
        apiBaseUrl: 'https://api.ctrader.com',
        webTradeUrl: 'https://ct.icmarkets.com',
        authType: 'oauth',
        configuration: {
          demo: true,
          supportsAPI: true,
          supportsWebTrading: true,
          oauthEndpoint: 'https://openapi.ctrader.com/apps/token'
        }
      },
      {
        name: 'Rithmic',
        platformType: 'rithmic',
        apiBaseUrl: 'https://api.rithmic.com',
        webTradeUrl: 'https://rtraderpro.rithmic.com/rtraderpro-web',
        authType: 'credentials',
        configuration: {
          demo: true,
          supportsAPI: true,
          supportsWebTrading: true,
          rTraderProUrl: 'https://www.rithmic.com/rtraderpro'
        }
      }
    ];

    for (const config of platformConfigs) {
      const existing = await db.select().from(tradingPlatforms)
        .where(eq(tradingPlatforms.platformType, config.platformType))
        .limit(1);

      if (existing.length === 0) {
        await db.insert(tradingPlatforms).values(config);
        console.log(`✅ Added ${config.name} platform to database`);
      }
    }
  }

  async getPlatforms(): Promise<TradingPlatform[]> {
    return await db.select().from(tradingPlatforms).where(eq(tradingPlatforms.isActive, true));
  }

  async connectPlatform(userId: number, platformId: number, credentials: PlatformCredentials): Promise<boolean> {
    try {
      const platform = await db.select().from(tradingPlatforms)
        .where(eq(tradingPlatforms.id, platformId))
        .limit(1);

      if (platform.length === 0) {
        throw new Error('Platform not found');
      }

      const platformData = platform[0];
      let connectionResult;

      switch (platformData.platformType) {
        case 'dxtrade':
          connectionResult = await this.connectDXTrade(credentials);
          break;
        case 'matchtrader':
          connectionResult = await this.connectMatchTrader(credentials);
          break;
        case 'ctrader':
          connectionResult = await this.connectCTrader(credentials);
          break;
        case 'rithmic':
          connectionResult = await this.connectRithmic(credentials);
          break;
        default:
          throw new Error('Unsupported platform type');
      }

      if (connectionResult.success) {
        // Store connection in database
        const connection = await db.insert(userPlatformConnections).values({
          userId,
          platformId,
          accountId: connectionResult.accountId,
          credentials: credentials, // Should be encrypted in production
          accessToken: connectionResult.accessToken,
          refreshToken: connectionResult.refreshToken,
          tokenExpiry: connectionResult.tokenExpiry,
          isConnected: true,
          connectionData: connectionResult.connectionData
        }).returning();

        // Sync account data
        await this.syncAccountData(connection[0].id);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Platform connection error:', error);
      return false;
    }
  }

  private async connectDXTrade(credentials: PlatformCredentials) {
    // DX Trade API connection
    const response = await axios.post('https://demo.dx.trade/api/v1/login', {
      username: credentials.username,
      password: credentials.password,
      demo: credentials.demo || true
    });

    if (response.data.success) {
      return {
        success: true,
        accountId: response.data.accountId,
        accessToken: response.data.token,
        connectionData: response.data
      };
    }

    throw new Error('DX Trade connection failed');
  }

  private async connectMatchTrader(credentials: PlatformCredentials) {
    // Match Trader API connection
    const response = await axios.post('https://api.match-trader.com/v1/auth/login', {
      apiKey: credentials.apiKey,
      apiSecret: credentials.apiSecret
    });

    if (response.data.success) {
      return {
        success: true,
        accountId: response.data.accountId,
        accessToken: response.data.accessToken,
        connectionData: response.data
      };
    }

    throw new Error('Match Trader connection failed');
  }

  private async connectCTrader(credentials: PlatformCredentials) {
    // cTrader OAuth connection
    const response = await axios.post('https://openapi.ctrader.com/apps/token', {
      grant_type: 'password',
      username: credentials.username,
      password: credentials.password,
      client_id: process.env.CTRADER_CLIENT_ID,
      client_secret: process.env.CTRADER_CLIENT_SECRET
    });

    if (response.data.access_token) {
      return {
        success: true,
        accountId: response.data.accountId,
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        tokenExpiry: new Date(Date.now() + response.data.expires_in * 1000),
        connectionData: response.data
      };
    }

    throw new Error('cTrader connection failed');
  }

  private async connectRithmic(credentials: PlatformCredentials) {
    // Rithmic API connection
    const response = await axios.post('https://api.rithmic.com/v1/login', {
      username: credentials.username,
      password: credentials.password,
      server: credentials.server || 'Rithmic Test'
    });

    if (response.data.success) {
      return {
        success: true,
        accountId: response.data.accountNumber,
        accessToken: response.data.sessionId,
        connectionData: response.data
      };
    }

    throw new Error('Rithmic connection failed');
  }

  async syncAccountData(connectionId: number) {
    try {
      const connection = await db.select().from(userPlatformConnections)
        .where(eq(userPlatformConnections.id, connectionId))
        .limit(1);

      if (connection.length === 0) return;

      const conn = connection[0];
      const platform = await db.select().from(tradingPlatforms)
        .where(eq(tradingPlatforms.id, conn.platformId))
        .limit(1);

      if (platform.length === 0) return;

      const platformData = platform[0];
      let accountInfo: AccountInfo;

      switch (platformData.platformType) {
        case 'dxtrade':
          accountInfo = await this.getDXTradeAccountInfo(conn);
          break;
        case 'matchtrader':
          accountInfo = await this.getMatchTraderAccountInfo(conn);
          break;
        case 'ctrader':
          accountInfo = await this.getCTraderAccountInfo(conn);
          break;
        case 'rithmic':
          accountInfo = await this.getRithmicAccountInfo(conn);
          break;
        default:
          return;
      }

      // Update or insert account data
      const existingAccount = await db.select().from(tradingPlatformAccounts)
        .where(eq(tradingPlatformAccounts.connectionId, connectionId))
        .limit(1);

      if (existingAccount.length > 0) {
        await db.update(tradingPlatformAccounts)
          .set({
            balance: accountInfo.balance.toString(),
            equity: accountInfo.equity.toString(),
            margin: accountInfo.margin.toString(),
            freeMargin: accountInfo.freeMargin.toString(),
            lastUpdated: new Date(),
            updatedAt: new Date()
          })
          .where(eq(tradingPlatformAccounts.id, existingAccount[0].id));
      } else {
        await db.insert(tradingPlatformAccounts).values({
          connectionId,
          accountNumber: accountInfo.accountNumber,
          accountName: accountInfo.accountName,
          accountType: accountInfo.accountType,
          currency: accountInfo.currency,
          balance: accountInfo.balance.toString(),
          equity: accountInfo.equity.toString(),
          margin: accountInfo.margin.toString(),
          freeMargin: accountInfo.freeMargin.toString()
        });
      }

      // Update last sync time
      await db.update(userPlatformConnections)
        .set({ lastSyncAt: new Date() })
        .where(eq(userPlatformConnections.id, connectionId));

    } catch (error) {
      console.error('Account sync error:', error);
    }
  }

  private async getDXTradeAccountInfo(connection: UserPlatformConnection): Promise<AccountInfo> {
    const response = await axios.get('https://demo.dx.trade/api/v1/account', {
      headers: { Authorization: `Bearer ${connection.accessToken}` }
    });

    return {
      accountNumber: response.data.accountNumber,
      accountName: response.data.accountName,
      accountType: response.data.demo ? 'demo' : 'live',
      currency: response.data.currency,
      balance: response.data.balance,
      equity: response.data.equity,
      margin: response.data.margin,
      freeMargin: response.data.freeMargin
    };
  }

  private async getMatchTraderAccountInfo(connection: UserPlatformConnection): Promise<AccountInfo> {
    const response = await axios.get('https://api.match-trader.com/v1/account', {
      headers: { Authorization: `Bearer ${connection.accessToken}` }
    });

    return {
      accountNumber: response.data.accountNumber,
      accountName: response.data.accountName,
      accountType: response.data.accountType,
      currency: response.data.currency,
      balance: response.data.balance,
      equity: response.data.equity,
      margin: response.data.margin,
      freeMargin: response.data.freeMargin
    };
  }

  private async getCTraderAccountInfo(connection: UserPlatformConnection): Promise<AccountInfo> {
    const response = await axios.get('https://api.ctrader.com/v1/accounts', {
      headers: { Authorization: `Bearer ${connection.accessToken}` }
    });

    const account = response.data.accounts[0];
    return {
      accountNumber: account.accountNumber,
      accountName: account.accountName,
      accountType: account.demo ? 'demo' : 'live',
      currency: account.currency,
      balance: account.balance,
      equity: account.equity,
      margin: account.margin,
      freeMargin: account.freeMargin
    };
  }

  private async getRithmicAccountInfo(connection: UserPlatformConnection): Promise<AccountInfo> {
    const response = await axios.get('https://api.rithmic.com/v1/account', {
      headers: { 'X-Session-ID': connection.accessToken }
    });

    return {
      accountNumber: response.data.accountNumber,
      accountName: response.data.accountName,
      accountType: response.data.accountType,
      currency: response.data.currency,
      balance: response.data.balance,
      equity: response.data.equity,
      margin: response.data.margin,
      freeMargin: response.data.freeMargin
    };
  }

  async getUserConnections(userId: number): Promise<any[]> {
    const connections = await db.select({
      connection: userPlatformConnections,
      platform: tradingPlatforms,
      account: tradingPlatformAccounts
    })
    .from(userPlatformConnections)
    .leftJoin(tradingPlatforms, eq(userPlatformConnections.platformId, tradingPlatforms.id))
    .leftJoin(tradingPlatformAccounts, eq(tradingPlatformAccounts.connectionId, userPlatformConnections.id))
    .where(eq(userPlatformConnections.userId, userId));

    return connections;
  }

  async disconnectPlatform(userId: number, connectionId: number): Promise<boolean> {
    try {
      await db.update(userPlatformConnections)
        .set({ isConnected: false })
        .where(and(
          eq(userPlatformConnections.id, connectionId),
          eq(userPlatformConnections.userId, userId)
        ));
      return true;
    } catch (error) {
      console.error('Platform disconnect error:', error);
      return false;
    }
  }
}

export const tradingPlatformService = new TradingPlatformService();