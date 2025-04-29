/**
 * cTrader Broker Adapter
 * 
 * Handles connections and trade execution with cTrader API
 * Used by multiple brokers including IC Markets, Pepperstone, and others
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * cTrader Broker Connection
 * Implementation of BrokerConnection for cTrader
 */
export class CTraderBrokerConnection implements BrokerConnection {
  private clientId: string;
  private clientSecret: string;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;
  private accountId: string | null = null;

  constructor(config: { 
    clientId: string, 
    clientSecret: string, 
    accessToken?: string, 
    refreshToken?: string,
    accountId?: string,
    cTraderUrl?: string 
  }) {
    this.clientId = config.clientId;
    this.clientSecret = config.clientSecret;
    this.accessToken = config.accessToken || null;
    this.refreshToken = config.refreshToken || null;
    this.accountId = config.accountId || null;
    
    // Use provided URL or default
    // Different brokers have different cTrader API endpoints
    this.baseUrl = config.cTraderUrl || 'https://api.ctrader.com';
    
    console.log(`cTrader broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'cTrader';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !!this.accessToken;
  }

  /**
   * Connect to cTrader API
   */
  async connect(): Promise<boolean> {
    try {
      // If we don't have tokens, we need to authenticate
      if (!this.accessToken) {
        if (!this.refreshToken) {
          // Would need to implement full OAuth flow for cTrader
          // This typically involves redirecting to cTrader login page
          console.error('No access or refresh token available for cTrader');
          return false;
        }
        
        // Try to use refresh token
        await this.refreshAccessToken();
      }
      
      // Validate access token by fetching accounts
      const response = await fetch(`${this.baseUrl}/cserver/api/v2/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to get cTrader accounts: ${response.status} ${errorText}`);
        
        // Try refresh if unauthorized
        if (response.status === 401 && this.refreshToken) {
          await this.refreshAccessToken();
          return this.connect(); // try again
        }
        
        this.connected = false;
        return false;
      }

      const accounts = await response.json();
      if (!accounts || accounts.length === 0) {
        console.error('No cTrader accounts found');
        this.connected = false;
        return false;
      }

      // Use provided account ID or first account
      if (!this.accountId) {
        this.accountId = accounts[0].accountId;
      }
      
      // Get account details
      await this.fetchAccountInfo();
      
      this.connected = true;
      console.log(`Connected to cTrader account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to cTrader:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from cTrader
   */
  async disconnect(): Promise<void> {
    // For OAuth, we should ideally revoke the token
    this.connected = false;
    this.accountInfo = null;
    console.log('Disconnected from cTrader');
  }

  /**
   * Execute a market order on cTrader
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to cTrader API');
      }
    }

    try {
      // Get symbol data to determine contract size
      const symbolInfo = await this.getSymbolInfo(params.symbol);
      
      // Calculate volume in lots
      const volume = params.quantity / symbolInfo.contractSize;
      
      // Build order request
      const orderRequest = {
        accountId: this.accountId,
        symbolId: symbolInfo.symbolId,
        orderType: 'Market',
        tradeSide: params.side === 'buy' ? 'Buy' : 'Sell',
        volume: volume,
        comment: params.metadata ? JSON.stringify(params.metadata) : undefined
      };

      // Execute the order
      const response = await fetch(`${this.baseUrl}/cserver/api/v2/trading/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`cTrader order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      console.log(`cTrader order executed: ${orderResult.orderId}`);
      
      // Handle stop loss and take profit (modification of position)
      if (params.stopLoss || params.takeProfit) {
        await this.modifyPosition(
          orderResult.positionId,
          params.stopLoss,
          params.takeProfit
        );
      }
      
      return orderResult;
    } catch (error) {
      console.error('Error executing cTrader market order:', error);
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
        throw new Error('Not connected to cTrader API');
      }
    }

    try {
      await this.fetchAccountInfo();
      
      return {
        accountId: this.accountId,
        balance: this.accountInfo.balance,
        equity: this.accountInfo.equity,
        margin: this.accountInfo.margin,
        freeMargin: this.accountInfo.freeMargin,
        marginLevel: this.accountInfo.marginLevel,
        currency: this.accountInfo.currency,
        leverage: this.accountInfo.leverage,
        status: 'active',
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting cTrader account info:', error);
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
        throw new Error('Not connected to cTrader API');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/cserver/api/v2/trading/positions?accountId=${this.accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get cTrader positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.symbol,
        side: pos.tradeSide.toLowerCase(),
        quantity: pos.volume,
        entryPrice: pos.openPrice,
        currentPrice: pos.currentPrice,
        stopLoss: pos.stopLoss,
        takeProfit: pos.takeProfit,
        swap: pos.swap,
        commission: pos.commission,
        grossProfit: pos.grossProfit,
        netProfit: pos.netProfit,
        openTime: new Date(pos.openTimestamp).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting cTrader positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Forex', 'Indices', 'Commodities', 'Crypto', 'Stocks', 'ETFs'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('cTrader connection test failed:', error);
      return false;
    }
  }

  /**
   * Refresh access token using refresh token
   */
  private async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken) {
      throw new Error('No refresh token available for cTrader');
    }
    
    const tokenRequest = {
      grant_type: 'refresh_token',
      refresh_token: this.refreshToken,
      client_id: this.clientId,
      client_secret: this.clientSecret
    };
    
    const response = await fetch(`${this.baseUrl}/connect/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: new URLSearchParams(tokenRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to refresh cTrader token: ${response.status} ${errorText}`);
    }
    
    const tokenData = await response.json();
    this.accessToken = tokenData.access_token;
    this.refreshToken = tokenData.refresh_token;
  }

  /**
   * Fetch account details from cTrader
   */
  private async fetchAccountInfo(): Promise<void> {
    if (!this.accessToken || !this.accountId) {
      throw new Error('Not properly authenticated with cTrader');
    }

    const response = await fetch(`${this.baseUrl}/cserver/api/v2/accounts/${this.accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get cTrader account info: ${response.status} ${errorText}`);
    }

    this.accountInfo = await response.json();
  }

  /**
   * Get symbol information
   */
  private async getSymbolInfo(symbol: string): Promise<any> {
    // Symbol lookup by name
    const response = await fetch(`${this.baseUrl}/cserver/api/v2/symbols?name=${encodeURIComponent(symbol)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get cTrader symbol info: ${response.status} ${errorText}`);
    }

    const symbols = await response.json();
    
    if (!symbols || symbols.length === 0) {
      throw new Error(`Symbol not found: ${symbol}`);
    }
    
    return symbols[0];
  }

  /**
   * Modify an existing position (add SL/TP)
   */
  private async modifyPosition(
    positionId: string,
    stopLoss?: number,
    takeProfit?: number
  ): Promise<any> {
    if (!positionId) return null;
    
    const modifyRequest: any = {
      positionId: positionId
    };
    
    if (stopLoss) {
      modifyRequest.stopLoss = stopLoss;
    }
    
    if (takeProfit) {
      modifyRequest.takeProfit = takeProfit;
    }
    
    const response = await fetch(`${this.baseUrl}/cserver/api/v2/trading/positions/${positionId}/modify`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(modifyRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to modify cTrader position: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
}

/**
 * cTrader Broker Adapter Factory
 */
export class CTraderBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to cTrader
   */
  createConnection(config: any): BrokerConnection {
    return new CTraderBrokerConnection(config);
  }

  /**
   * Get the connection type needed for cTrader
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.OAUTH;
  }

  /**
   * Get cTrader capabilities
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
   * Get required connection fields for cTrader
   */
  getRequiredFields(): string[] {
    return ['clientId', 'clientSecret', 'accessToken', 'refreshToken', 'accountId', 'cTraderUrl'];
  }
}

/**
 * Create and register a cTrader broker adapter
 */
export function createCTraderAdapter(
  clientId: string,
  clientSecret: string,
  accessToken?: string,
  refreshToken?: string,
  accountId?: string,
  cTraderUrl?: string
): BrokerConnection {
  const factory = new CTraderBrokerAdapterFactory();
  return factory.createConnection({ 
    clientId, 
    clientSecret, 
    accessToken, 
    refreshToken,
    accountId,
    cTraderUrl
  });
}