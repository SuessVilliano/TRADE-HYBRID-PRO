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
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'pending' | 'filled' | 'cancelled';
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
 * Interface for broker services
 */
export interface BrokerService {
  /**
   * Connect to the broker API
   */
  connect(): Promise<void>;
  
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
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string>;
  
  /**
   * Get order history
   */
  getOrderHistory(): Promise<OrderHistory[]>;
  
  /**
   * Subscribe to real-time market data for a symbol
   */
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void;
  
  /**
   * Unsubscribe from market data for a symbol
   */
  unsubscribeFromMarketData(symbol: string): void;
}