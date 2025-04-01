// Broker types supported by the platform
export type BrokerType = 'crypto' | 'forex' | 'stocks' | 'futures';

// Market data interface
export interface MarketData {
  symbol: string;
  price: number;
  timestamp: number;
  volume: number;
}

// Account balance interface
export interface AccountBalance {
  total: number;
  cash: number;
  positions: number;
}

// Broker position interface
export interface BrokerPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

// Order history interface
export interface OrderHistory {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  status: 'filled' | 'pending' | 'cancelled';
  timestamp: number;
  broker: string;
}

// Broker service interface
export interface BrokerService {
  connect(): Promise<void>;
  getBalance(): Promise<AccountBalance>;
  getPositions(): Promise<BrokerPosition[]>;
  placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string>;
  getOrderHistory(): Promise<OrderHistory[]>;
  getQuote(symbol: string): Promise<{ bid: number; ask: number } | null>;
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void;
  unsubscribeFromMarketData(symbol: string): void;
}