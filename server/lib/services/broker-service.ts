/**
 * Common interfaces for broker services
 */

// Interface for broker account information
export interface BrokerAccountInfo {
  accountId: string;
  accountType: string;
  balance: number;
  equity?: number;
  marginAvailable?: number;
  marginUsed?: number;
  currency: string;
  positions?: BrokerPosition[];
}

// Interface for a position/holding in a broker account
export interface BrokerPosition {
  symbol: string;
  quantity: number;
  entryPrice: number;
  marketPrice: number;
  marketValue: number;
  unrealizedPnL: number;
  unrealizedPnLPercent?: number;
  side: 'long' | 'short';
  leverage?: number;
  liquidationPrice?: number;
}

// Interface for order creation
export interface BrokerOrderRequest {
  symbol: string;
  quantity: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  price?: number;
  stopPrice?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
  reduceOnly?: boolean;
  postOnly?: boolean;
  clientOrderId?: string;
}

// Interface for order response
export interface BrokerOrderResponse {
  orderId: string;
  status: 'accepted' | 'rejected' | 'filled' | 'partial_fill' | 'canceled' | 'pending';
  filledQuantity?: number;
  averagePrice?: number;
  message?: string;
  orderRequest: BrokerOrderRequest;
}

/**
 * Base broker service class that defines the interface for all broker services
 */
export abstract class BrokerService {
  /**
   * Initialize the broker service
   */
  abstract initialize(): Promise<void>;
  
  /**
   * Validate the API credentials
   */
  abstract validateCredentials(): Promise<boolean>;
  
  /**
   * Get account information including balances
   */
  abstract getAccountInfo(): Promise<BrokerAccountInfo>;
  
  /**
   * Get current positions (holdings)
   */
  abstract getPositions(): Promise<BrokerPosition[]>;
  
  /**
   * Place an order
   */
  abstract placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse>;
  
  /**
   * Get order history
   */
  abstract getOrderHistory(): Promise<any[]>;
  
  /**
   * Get a quote for a symbol
   */
  abstract getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number; }>;
  
  /**
   * Close a position
   */
  abstract closePosition(symbol: string, quantity?: number): Promise<any>;
  
  /**
   * Cancel an open order
   */
  abstract cancelOrder(orderId: string): Promise<boolean>;
  
  /**
   * Get order status
   */
  abstract getOrderStatus(orderId: string): Promise<any>;
}