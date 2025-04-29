/**
 * MetaTrader Broker Adapter
 * 
 * Handles connections and trade execution with MetaTrader 4 and 5
 * Uses MT4/MT5 bridge APIs
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

// MetaTrader version enum
export enum MetaTraderVersion {
  MT4 = '4',
  MT5 = '5'
}

/**
 * MetaTrader Broker Connection
 * Implementation of BrokerConnection for MetaTrader 4 and 5
 */
export class MetaTraderConnection implements BrokerConnection {
  private apiToken: string;
  private accountNumber: string;
  private password: string;
  private server: string;
  private baseUrl: string;
  private version: MetaTraderVersion;
  private connected: boolean = false;
  private accountInfo: any = null;

  constructor(config: { 
    apiToken: string, 
    accountNumber: string, 
    password: string, 
    server: string,
    baseUrl?: string,
    version: MetaTraderVersion
  }) {
    this.apiToken = config.apiToken;
    this.accountNumber = config.accountNumber;
    this.password = config.password;
    this.server = config.server;
    this.version = config.version;
    
    // Use provided URL or default based on version
    this.baseUrl = config.baseUrl || 
      (config.version === MetaTraderVersion.MT4 
        ? 'https://mt4bridge.trade' 
        : 'https://mt5bridge.trade');
    
    console.log(`MetaTrader ${this.version} broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return `MetaTrader ${this.version}`;
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to MetaTrader API
   */
  async connect(): Promise<boolean> {
    try {
      // Connect to MetaTrader bridge
      const connectResponse = await fetch(`${this.baseUrl}/api/mt${this.version}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify({
          account: this.accountNumber,
          password: this.password,
          server: this.server
        })
      });

      if (!connectResponse.ok) {
        const errorText = await connectResponse.text();
        console.error(`Failed to connect to MetaTrader ${this.version}: ${connectResponse.status} ${errorText}`);
        this.connected = false;
        return false;
      }

      const connectResult = await connectResponse.json();
      
      if (!connectResult.connected) {
        console.error(`Failed to connect to MetaTrader ${this.version}: ${connectResult.message || 'Unknown error'}`);
        this.connected = false;
        return false;
      }
      
      // Get account info to verify connection
      await this.fetchAccountInfo();
      
      this.connected = true;
      console.log(`Connected to MetaTrader ${this.version} account: ${this.accountNumber}`);
      return true;
    } catch (error) {
      console.error(`Error connecting to MetaTrader ${this.version}:`, error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from MetaTrader
   */
  async disconnect(): Promise<void> {
    if (!this.connected) {
      return;
    }
    
    try {
      // Disconnect from MetaTrader bridge
      await fetch(`${this.baseUrl}/api/mt${this.version}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify({
          account: this.accountNumber
        })
      });
    } catch (error) {
      console.error(`Error disconnecting from MetaTrader ${this.version}:`, error);
    }
    
    this.connected = false;
    this.accountInfo = null;
    console.log(`Disconnected from MetaTrader ${this.version}`);
  }

  /**
   * Execute a market order on MetaTrader
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error(`Not connected to MetaTrader ${this.version} API`);
      }
    }

    try {
      // Build order request - note that MT has different parameter naming
      const orderRequest: any = {
        symbol: params.symbol,
        type: params.side === 'buy' ? 'BUY' : 'SELL',
        volume: params.quantity,
        comment: params.metadata ? JSON.stringify(params.metadata) : ''
      };

      // Add stop loss if specified
      if (params.stopLoss) {
        orderRequest.sl = params.stopLoss;
      }

      // Add take profit if specified
      if (params.takeProfit) {
        orderRequest.tp = params.takeProfit;
      }

      // Execute the order
      const response = await fetch(`${this.baseUrl}/api/mt${this.version}/trade`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`MetaTrader ${this.version} order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      
      if (!orderResult.success) {
        throw new Error(`MetaTrader ${this.version} order failed: ${orderResult.message || 'Unknown error'}`);
      }
      
      console.log(`MetaTrader ${this.version} order executed: ${orderResult.ticket}`);
      
      return {
        ticket: orderResult.ticket,
        openPrice: orderResult.price,
        stopLoss: orderResult.sl,
        takeProfit: orderResult.tp,
        symbol: params.symbol,
        type: params.side,
        volume: params.quantity,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error executing MetaTrader ${this.version} market order:`, error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error(`Not connected to MetaTrader ${this.version} API`);
      }
    }

    try {
      await this.fetchAccountInfo();
      
      // Transform to standard format
      return {
        accountId: this.accountNumber,
        balance: this.accountInfo.balance,
        equity: this.accountInfo.equity,
        margin: this.accountInfo.margin,
        freeMargin: this.accountInfo.marginFree,
        marginLevel: this.accountInfo.marginLevel,
        currency: this.accountInfo.currency,
        leverage: this.accountInfo.leverage,
        profit: this.accountInfo.profit,
        server: this.server,
        name: this.accountInfo.name,
        broker: this.accountInfo.company,
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error(`Error getting MetaTrader ${this.version} account info:`, error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error(`Not connected to MetaTrader ${this.version} API`);
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/api/mt${this.version}/positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiToken}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get MetaTrader ${this.version} positions: ${response.status} ${errorText}`);
      }

      const positionsData = await response.json();
      
      if (!positionsData.success) {
        throw new Error(`Failed to get MetaTrader ${this.version} positions: ${positionsData.message || 'Unknown error'}`);
      }
      
      const positions = positionsData.positions || [];
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.symbol,
        side: pos.type.toLowerCase(),
        ticket: pos.ticket,
        quantity: pos.volume,
        entryPrice: pos.openPrice,
        currentPrice: pos.currentPrice,
        stopLoss: pos.sl,
        takeProfit: pos.tp,
        swap: pos.swap,
        profit: pos.profit,
        openTime: new Date(pos.openTime).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error(`Error getting MetaTrader ${this.version} positions:`, error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    const supportedMarkets = ['Forex', 'Commodities', 'Indices', 'Stocks'];
    
    // MT5 also supports Crypto and ETFs
    if (this.version === MetaTraderVersion.MT5) {
      supportedMarkets.push('Crypto', 'ETFs');
    }
    
    return supportedMarkets;
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error(`MetaTrader ${this.version} connection test failed:`, error);
      return false;
    }
  }

  /**
   * Fetch account information from MetaTrader
   */
  private async fetchAccountInfo(): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/mt${this.version}/account`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiToken}`
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get MetaTrader ${this.version} account info: ${response.status} ${errorText}`);
    }

    const accountData = await response.json();
    
    if (!accountData.success) {
      throw new Error(`Failed to get MetaTrader ${this.version} account info: ${accountData.message || 'Unknown error'}`);
    }
    
    this.accountInfo = accountData.account;
  }
}

/**
 * MetaTrader Broker Adapter Factory
 */
export class MetaTraderAdapterFactory implements BrokerAdapterFactory {
  private version: MetaTraderVersion;
  
  constructor(version: MetaTraderVersion) {
    this.version = version;
  }
  
  /**
   * Create a connection to MetaTrader
   */
  createConnection(config: any): BrokerConnection {
    return new MetaTraderConnection({
      ...config,
      version: this.version
    });
  }

  /**
   * Get the connection type needed for MetaTrader
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.USERNAME_PASSWORD;
  }

  /**
   * Get MetaTrader capabilities
   */
  getCapabilities(): BrokerCapabilities {
    // Base capabilities for MT4
    const capabilities: BrokerCapabilities = {
      supportsCrypto: false,
      supportsStocks: true,
      supportsForex: true,
      supportsFutures: false,
      supportsOptions: false,
      supportsFractionalShares: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
    
    // Add MT5 specific capabilities
    if (this.version === MetaTraderVersion.MT5) {
      capabilities.supportsCrypto = true;
      capabilities.supportsFutures = true;
    }
    
    return capabilities;
  }

  /**
   * Get required connection fields for MetaTrader
   */
  getRequiredFields(): string[] {
    return ['apiToken', 'accountNumber', 'password', 'server', 'baseUrl'];
  }
}

/**
 * Create and register a MetaTrader 4 broker adapter
 */
export function createMT4Adapter(
  apiToken: string,
  accountNumber: string,
  password: string,
  server: string,
  baseUrl?: string
): BrokerConnection {
  const factory = new MetaTraderAdapterFactory(MetaTraderVersion.MT4);
  return factory.createConnection({ 
    apiToken, 
    accountNumber, 
    password, 
    server,
    baseUrl
  });
}

/**
 * Create and register a MetaTrader 5 broker adapter
 */
export function createMT5Adapter(
  apiToken: string,
  accountNumber: string,
  password: string,
  server: string,
  baseUrl?: string
): BrokerConnection {
  const factory = new MetaTraderAdapterFactory(MetaTraderVersion.MT5);
  return factory.createConnection({ 
    apiToken, 
    accountNumber, 
    password, 
    server,
    baseUrl
  });
}