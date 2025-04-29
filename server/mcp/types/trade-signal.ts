/**
 * Trade Signal Types
 * 
 * Defines the types for trade signals used throughout the MCP server
 */

export interface TradeSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: string;
  source: string;
  risk?: number;
  notes?: string;
  timeframe?: string;
  status: SignalStatus;
  quantity?: number;
  targetBroker?: string;
}

export type SignalStatus = 'active' | 'filled' | 'cancelled' | 'expired';

export type SignalExecutionStrategy = 'auto' | 'all' | 'primary' | 'specific';

export interface SignalExecutionResult {
  signalId: string;
  success: boolean;
  brokerId?: string;
  orderId?: string;
  status?: string;
  timestamp: string;
  error?: string;
}

export interface SignalFilter {
  status?: SignalStatus | SignalStatus[];
  source?: string | string[];
  timeframe?: string | string[];
  symbol?: string | string[];
  dateRange?: {
    from: Date | string;
    to: Date | string;
  };
}

export interface SignalProviderInfo {
  id: string; 
  name: string;
  description?: string;
  timeframes: string[];
  markets: string[];
  averageSignals: number; // Average signals per week
  winRate?: number; // Win rate percentage
  subscription?: {
    required: boolean;
    level?: string;
  }
}