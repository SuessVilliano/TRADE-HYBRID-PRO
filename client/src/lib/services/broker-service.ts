
export interface MarketData {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
}

export interface AccountBalance {
  total: number;
  cash: number;
  positions: number;
}

export interface BrokerPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

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
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void;
  unsubscribeFromMarketData(symbol: string): void;
}
