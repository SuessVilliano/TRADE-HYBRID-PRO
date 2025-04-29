/**
 * Match Trader Broker Adapter
 * 
 * Handles connections and trade execution with Match Trader
 * Multi-asset trading platform used by various brokers
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * Match Trader Broker Connection
 * Implementation of BrokerConnection for Match Trader
 */
export class MatchTraderBrokerConnection implements BrokerConnection {
  private apiKey: string;
  private username: string | null;
  private password: string | null;
  private sessionToken: string | null = null;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;
  private accountId: string | null = null;
  private brokerId: string;

  constructor(config: { 
    apiKey: string, 
    username?: string, 
    password?: string, 
    sessionToken?: string,
    baseUrl?: string,
    brokerId?: string
  }) {
    this.apiKey = config.apiKey;
    this.username = config.username || null;
    this.password = config.password || null;
    this.sessionToken = config.sessionToken || null;
    this.brokerId = config.brokerId || 'matchtrader';
    
    // Different brokers use different Match Trader servers
    this.baseUrl = config.baseUrl || 'https://api.matchtrader.net';
    
    console.log(`Match Trader broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return `Match Trader (${this.brokerId})`;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !!this.sessionToken;
  }

  /**
   * Connect to Match Trader API
   */
  async connect(): Promise<boolean> {
    try {
      // If we already have a session token, validate it
      if (this.sessionToken) {
        const validated = await this.validateSession();
        if (validated) {
          return true;
        }
        // If validation failed, need to login again
      }
      
      // Need username/password to login
      if (!this.username || !this.password) {
        console.error('No username/password or valid session token for Match Trader');
        return false;
      }
      
      // Login to get session token
      const loginResponse = await fetch(`${this.baseUrl}/user/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey
        },
        body: JSON.stringify({
          username: this.username,
          password: this.password
        })
      });
      
      if (!loginResponse.ok) {
        const errorText = await loginResponse.text();
        console.error(`Failed to login to Match Trader: ${loginResponse.status} ${errorText}`);
        return false;
      }
      
      const loginData = await loginResponse.json();
      this.sessionToken = loginData.sessionToken;
      
      // Get account information
      await this.fetchAccountList();
      
      this.connected = true;
      console.log(`Connected to Match Trader account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Match Trader:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from Match Trader
   */
  async disconnect(): Promise<void> {
    if (this.sessionToken) {
      try {
        // Logout
        await fetch(`${this.baseUrl}/user/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-KEY': this.apiKey,
            'X-SESSION': this.sessionToken
          }
        });
      } catch (error) {
        console.error('Error logging out from Match Trader:', error);
      }
    }
    
    this.sessionToken = null;
    this.connected = false;
    this.accountInfo = null;
    this.accountId = null;
    console.log('Disconnected from Match Trader');
  }

  /**
   * Execute a market order on Match Trader
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Match Trader API');
      }
    }

    try {
      // Get instrument info to validate
      const instrumentInfo = await this.getInstrumentInfo(params.symbol);
      
      // Build order request
      const orderRequest = {
        accountId: this.accountId,
        instrumentId: instrumentInfo.id,
        orderType: 'MARKET',
        orderSide: params.side.toUpperCase(),
        volume: params.quantity,
        comment: params.metadata ? JSON.stringify(params.metadata) : ''
      };

      // Execute the order
      const response = await fetch(`${this.baseUrl}/trading/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SESSION': this.sessionToken as string
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Match Trader order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      console.log(`Match Trader order executed: ${orderResult.orderId}`);
      
      // Handle stop loss and take profit
      if (params.stopLoss || params.takeProfit) {
        const positionId = orderResult.positionId;
        
        if (positionId) {
          await this.updatePositionProtection(
            positionId,
            params.stopLoss,
            params.takeProfit
          );
        }
      }
      
      return orderResult;
    } catch (error) {
      console.error('Error executing Match Trader market order:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Match Trader API');
      }
    }

    try {
      // Fetch account details
      const response = await fetch(`${this.baseUrl}/trading/accounts/${this.accountId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SESSION': this.sessionToken as string
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Match Trader account info: ${response.status} ${errorText}`);
      }

      this.accountInfo = await response.json();
      
      return {
        accountId: this.accountId,
        balance: this.accountInfo.balance,
        equity: this.accountInfo.equity,
        margin: this.accountInfo.margin,
        freeMargin: this.accountInfo.freeMargin,
        marginLevel: this.accountInfo.marginLevel,
        profitLoss: this.accountInfo.profitLoss,
        currency: this.accountInfo.currency,
        leverage: this.accountInfo.leverage,
        status: this.accountInfo.status,
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting Match Trader account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Match Trader API');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/trading/accounts/${this.accountId}/positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SESSION': this.sessionToken as string
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Match Trader positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.instrument.symbol,
        side: pos.direction.toLowerCase(),
        quantity: pos.volume,
        entryPrice: pos.openPrice,
        currentPrice: pos.marketPrice,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit,
        swap: pos.swap,
        profit: pos.profit,
        openTime: new Date(pos.openTime).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting Match Trader positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Forex', 'Indices', 'Commodities', 'Stocks', 'Crypto', 'ETFs'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('Match Trader connection test failed:', error);
      return false;
    }
  }

  /**
   * Validate session token
   */
  private async validateSession(): Promise<boolean> {
    try {
      // A simple endpoint to validate session, like getting user profile
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-API-KEY': this.apiKey,
          'X-SESSION': this.sessionToken as string
        }
      });
      
      if (!response.ok) {
        return false;
      }
      
      // If we have a session but no account ID, get the account list
      if (!this.accountId) {
        await this.fetchAccountList();
      }
      
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Fetch account list and select the first one
   */
  private async fetchAccountList(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/trading/accounts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-SESSION': this.sessionToken as string
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Match Trader accounts: ${response.status} ${errorText}`);
    }

    const accounts = await response.json();
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No Match Trader accounts found');
    }
    
    // Use the first account
    this.accountId = accounts[0].id;
    this.accountInfo = accounts[0];
  }

  /**
   * Get instrument information
   */
  private async getInstrumentInfo(symbol: string): Promise<any> {
    // Search for the instrument by symbol
    const response = await fetch(`${this.baseUrl}/trading/instruments?symbol=${encodeURIComponent(symbol)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-SESSION': this.sessionToken as string
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to find Match Trader instrument: ${response.status} ${errorText}`);
    }

    const instruments = await response.json();
    
    if (!instruments || instruments.length === 0) {
      throw new Error(`Instrument not found: ${symbol}`);
    }
    
    return instruments[0];
  }

  /**
   * Update position stop loss and take profit
   */
  private async updatePositionProtection(
    positionId: string,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<any> {
    const updateRequest: any = {};
    
    if (stopLoss !== undefined) {
      updateRequest.stopLoss = stopLoss;
    }
    
    if (takeProfit !== undefined) {
      updateRequest.takeProfit = takeProfit;
    }
    
    if (Object.keys(updateRequest).length === 0) {
      return null;
    }
    
    const response = await fetch(`${this.baseUrl}/trading/positions/${positionId}/protection`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': this.apiKey,
        'X-SESSION': this.sessionToken as string
      },
      body: JSON.stringify(updateRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to update Match Trader position protection: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
}

/**
 * Match Trader Broker Adapter Factory
 */
export class MatchTraderBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to Match Trader
   */
  createConnection(config: any): BrokerConnection {
    return new MatchTraderBrokerConnection(config);
  }

  /**
   * Get the connection type needed for Match Trader
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.USERNAME_PASSWORD;
  }

  /**
   * Get Match Trader capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: true,
      supportsStocks: true,
      supportsForex: true,
      supportsFutures: false,
      supportsOptions: false,
      supportsFractionalShares: false,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for Match Trader
   */
  getRequiredFields(): string[] {
    return ['apiKey', 'username', 'password', 'baseUrl', 'brokerId'];
  }
}

/**
 * Create and register a Match Trader broker adapter
 */
export function createMatchTraderAdapter(
  apiKey: string,
  username: string,
  password: string,
  baseUrl?: string,
  brokerId?: string
): BrokerConnection {
  const factory = new MatchTraderBrokerAdapterFactory();
  return factory.createConnection({ 
    apiKey, 
    username, 
    password, 
    baseUrl,
    brokerId
  });
}