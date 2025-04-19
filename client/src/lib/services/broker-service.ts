/**
 * Order side - buy or sell
 */
export type OrderSide = 'buy' | 'sell';

/**
 * Order type - market, limit, stop, etc.
 */
export type OrderType = 'market' | 'limit' | 'stop' | 'stop_limit';

/**
 * Order time-in-force - day, gtc, ioc, etc.
 */
export type OrderTimeInForce = 'day' | 'gtc' | 'ioc' | 'fok';

/**
 * Account balance information
 */
export interface AccountBalance {
  total: number;
  cash: number;
  positions: number;
}

/**
 * Trading position information
 */
export interface BrokerPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

/**
 * Order history record
 */
export interface OrderHistory {
  orderId: string;
  symbol: string;
  side: OrderSide;
  quantity: number;
  price: number;
  status: string;
  timestamp: number;
  broker: string;
}

/**
 * Real-time market data
 */
export interface MarketData {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
}

/**
 * Asset information
 */
export interface AssetInfo {
  symbol: string;
  name: string;
  exchange: string;
  isTradeble: boolean;
  isFractionable?: boolean;
  lastPrice?: number;
  lastUpdated?: number;
}

/**
 * Interface for broker services
 */
export interface BrokerService {
  /**
   * Connect to the broker API
   */
  connect(): Promise<void>;
  
  /**
   * Get detailed account information
   */
  getAccountInfo(): Promise<any>;
  
  /**
   * Get account balance
   */
  getBalance(): Promise<AccountBalance>;
  
  /**
   * Get current positions
   */
  getPositions(): Promise<BrokerPosition[]>;
  
  /**
   * Place a new order
   */
  placeOrder(order: {
    symbol: string;
    side: OrderSide;
    quantity: number;
    type: OrderType;
    timeInForce: OrderTimeInForce;
    limit_price?: number;
    stop_price?: number;
  }): Promise<any>;
  
  /**
   * Get order history
   */
  getOrderHistory(): Promise<any[]>;
  
  /**
   * Get asset details
   */
  getAssetDetails?(symbol: string): Promise<AssetInfo>;
  
  /**
   * Subscribe to real-time market data for a symbol
   */
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void;
  
  /**
   * Unsubscribe from market data for a symbol
   */
  unsubscribeFromMarketData(symbol: string): void;
}