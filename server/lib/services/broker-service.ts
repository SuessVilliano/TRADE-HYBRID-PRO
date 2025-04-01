/**
 * Base broker service class that defines the interface for all broker services
 * This is an abstract class that should be extended by specific broker implementations
 */
export abstract class BrokerService {
  protected apiKey: string;
  protected apiSecret: string;
  protected passphrase: string | null;
  protected isDemo: boolean;
  protected additionalConfig: Record<string, any>;

  constructor(
    apiKey: string,
    apiSecret: string,
    isDemo: boolean = false,
    passphrase: string | null = null,
    additionalConfig: Record<string, any> = {}
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    this.passphrase = passphrase;
    this.isDemo = isDemo;
    this.additionalConfig = additionalConfig;
  }

  /**
   * Initialize the broker service
   * This might include setting up API clients, connecting to WebSocket feeds, etc.
   */
  abstract initialize(): Promise<void>;

  /**
   * Validate the API credentials by making a test request
   */
  abstract validateCredentials(): Promise<boolean>;

  /**
   * Get account information including balances, margins, etc.
   */
  abstract getAccountInfo(): Promise<BrokerAccountInfo>;

  /**
   * Get current positions
   */
  abstract getPositions(): Promise<BrokerPosition[]>;

  /**
   * Place an order with the broker
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

// Standardized interfaces for broker requests and responses

export interface BrokerOrderRequest {
  symbol: string;             // Trading symbol
  quantity: number;           // Number of shares/contracts/units
  side: 'buy' | 'sell';       // Order side
  type: 'market' | 'limit' | 'stop' | 'stop_limit'; // Order type
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';      // Time in force
  limitPrice?: number;        // Price for limit orders
  stopPrice?: number;         // Price for stop orders
  clientOrderId?: string;     // Client-generated order ID
  extendedHours?: boolean;    // Whether to allow extended hours trading
  metadata?: Record<string, any>; // Additional broker-specific parameters
}

export interface BrokerOrderResponse {
  success: boolean;          // Whether the order was successfully placed
  orderId?: string;          // Broker-assigned order ID
  clientOrderId?: string;    // Client-assigned order ID (echoed back)
  status: 'accepted' | 'rejected' | 'filled' | 'partial_fill' | 'canceled' | 'pending';
  filledQuantity?: number;   // Amount filled (if any)
  remainingQuantity?: number; // Amount remaining to be filled
  avgFillPrice?: number;     // Average fill price (if any)
  commission?: number;       // Commission charged
  reason?: string;           // Reason for rejection or other status
  createdAt: number;         // Timestamp when order was created (milliseconds since epoch)
  updatedAt: number;         // Timestamp when order was last updated
  raw?: any;                 // Raw broker response (for debugging)
}

export interface BrokerPosition {
  symbol: string;            // Trading symbol
  quantity: number;          // Current position size (negative for short positions)
  entryPrice: number;        // Average entry price
  currentPrice: number;      // Current market price
  marketValue: number;       // Current market value of position
  unrealizedPnl: number;     // Unrealized profit/loss
  unrealizedPnlPercent: number; // Unrealized P&L as percentage
  todayPnl?: number;         // P&L for today's trading
  costBasis: number;         // Total cost to establish position
  exchange?: string;         // Exchange where the position is held
  assetType: 'stock' | 'option' | 'future' | 'forex' | 'crypto'; // Asset type
  lastUpdated: number;       // Timestamp when position was last updated
}

export interface BrokerAccountInfo {
  accountId: string;         // Account ID at the broker
  accountNumber?: string;    // Account number (if different from ID)
  accountType: 'cash' | 'margin' | 'pdt' | 'other'; // Account type
  accountName?: string;      // User-friendly account name
  cash: number;              // Cash available for trading
  cashWithdrawable?: number; // Cash available for withdrawal
  equity: number;            // Total account value
  longMarketValue: number;   // Market value of long positions
  shortMarketValue: number;  // Market value of short positions
  marginUsed?: number;       // Amount of margin used
  marginAvailable?: number;  // Amount of margin available
  buyingPower: number;       // Buying power for securities
  optionBuyingPower?: number; // Buying power for options
  futureBuyingPower?: number; // Buying power for futures
  dayTradeBuyingPower?: number; // Buying power for day trading
  currency: string;          // Account currency (USD, EUR, etc.)
  isLive: boolean;           // Whether this is a live or paper account
  isBlocked?: boolean;       // Whether account is blocked from trading
  isDayTrader?: boolean;     // Whether account is flagged as pattern day trader
  lastUpdated: number;       // Timestamp when account was last updated
}