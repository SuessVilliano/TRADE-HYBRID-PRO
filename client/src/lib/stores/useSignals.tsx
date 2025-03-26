import { create } from 'zustand';

export interface TradingSignal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'neutral';
  price: number;
  timestamp: Date;
  source: string;
  strategy: string;
  message: string;
  confidence: number; // 0-100%
  timeframe: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  takeProfit3?: number;
  indicators?: Record<string, number | string>;
  read?: boolean;
}

interface SignalsState {
  signals: TradingSignal[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  
  // Actions
  fetchSignals: () => Promise<void>;
  addSignal: (signal: TradingSignal) => void;
  clearSignals: () => void;
  markSignalRead: (id: string) => void;
}

// Webhook URL: https://apps.taskmagic.com/api/v1/webhooks/Ec3lDNCfkpQtHNbWk16mA

export const useSignals = create<SignalsState>((set, get) => ({
  signals: [],
  loading: false,
  error: null,
  lastFetched: null,
  
  fetchSignals: async () => {
    try {
      set({ loading: true, error: null });
      
      // In a real implementation, this would be a fetch request to your API
      // that retrieves signals from your database
      // For now, we'll simulate some data
      
      // Simulated API response delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const response = await fetch('/api/signals');
      
      if (!response.ok) {
        throw new Error('Failed to fetch signals');
      }
      
      const data = await response.json();
      
      set({ 
        signals: data, 
        loading: false,
        lastFetched: new Date()
      });
      
    } catch (error) {
      console.error('Error fetching signals:', error);
      set({ 
        loading: false, 
        error: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    }
  },
  
  addSignal: (signal) => {
    set(state => ({
      signals: [signal, ...state.signals].slice(0, 100) // Keep only the most recent 100 signals
    }));
  },
  
  clearSignals: () => {
    set({ signals: [] });
  },
  
  markSignalRead: (id) => {
    set(state => ({
      signals: state.signals.map(signal => 
        signal.id === id ? { ...signal, read: true } : signal
      )
    }));
  }
}));