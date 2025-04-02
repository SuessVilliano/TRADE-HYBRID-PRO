// Trade Signal types
export interface TradeSignal {
  id: string;
  providerId: string;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  description?: string;
  timestamp: string;
  status: 'active' | 'closed' | 'cancelled';
  closePrice?: number;
  pnl?: number;
  closedAt?: string;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}