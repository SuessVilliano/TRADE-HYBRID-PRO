/**
 * Broker Interface
 * 
 * Defines the common interface that all broker adapters must implement
 * This ensures consistent functionality across different broker platforms
 */

export interface BrokerConnection {
  /**
   * Get the name of the broker
   */
  getBrokerName(): string;
  
  /**
   * Check if currently connected to the broker
   */
  isConnected(): boolean;
  
  /**
   * Connect to the broker API or service
   */
  connect(): Promise<boolean>;
  
  /**
   * Disconnect from the broker API or service
   */
  disconnect(): Promise<void>;
  
  /**
   * Execute a market order
   */
  executeMarketOrder(params: TradeParams): Promise<any>;
  
  /**
   * Get account information
   */
  getAccountInfo(): Promise<any>;
  
  /**
   * Get supported markets/assets
   */
  getSupportedMarkets?(): Promise<string[]>;
  
  /**
   * Get open positions
   */
  getOpenPositions?(): Promise<any[]>;
  
  /**
   * Test connection to broker
   */
  testConnection(): Promise<boolean>;
}

/**
 * Trade parameters for executing orders
 */
export interface TradeParams {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
  metadata?: any;
}

/**
 * Account information interface
 */
export interface AccountInfo {
  accountId: string;
  balance: number;
  equity: number;
  currency: string;
  leverage: number;
  marginUsed?: number;
  marginAvailable?: number;
  status: 'active' | 'inactive' | 'restricted';
  metadata?: any;
}

/**
 * Position information interface
 */
export interface Position {
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  unrealizedPnl: number;
  openTime: string;
  metadata?: any;
}

/**
 * Broker connection types
 */
export enum BrokerConnectionType {
  API_KEY = 'api_key',
  OAUTH = 'oauth',
  TOKEN = 'token',
  USERNAME_PASSWORD = 'username_password',
  COOKIE = 'cookie',
  CUSTOM = 'custom'
}

/**
 * Broker capabilities
 */
export interface BrokerCapabilities {
  supportsCrypto: boolean;
  supportsStocks: boolean;
  supportsForex: boolean;
  supportsFutures: boolean;
  supportsOptions: boolean;
  supportsFractionalShares: boolean;
  supportsStopLoss: boolean;
  supportsTakeProfit: boolean;
  supportsMarketData: boolean;
  supportsAccountHistory: boolean;
}

/**
 * Broker adapter factory interface
 */
export interface BrokerAdapterFactory {
  /**
   * Create a broker connection
   */
  createConnection(config: any): BrokerConnection;
  
  /**
   * Get connection type needed for this broker
   */
  getConnectionType(): BrokerConnectionType;
  
  /**
   * Get broker capabilities
   */
  getCapabilities(): BrokerCapabilities;
  
  /**
   * Get required connection fields
   */
  getRequiredFields(): string[];
}