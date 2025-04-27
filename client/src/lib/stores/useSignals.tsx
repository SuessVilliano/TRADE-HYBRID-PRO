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

// Webhook URL: https://app.tradehybrid.co/api/webhooks/signals

export const useSignals = create<SignalsState>((set, get) => ({
  signals: [],
  loading: false,
  error: null,
  lastFetched: null,
  
  fetchSignals: async () => {
    try {
      set({ loading: true, error: null });
      console.log('Fetching real trading signals from API...');
      
      // Fetch from the correct endpoint that serves webhook data
      const response = await fetch('/api/signals/trading-signals?marketType=all');
      
      if (!response.ok) {
        throw new Error('Failed to fetch trading signals');
      }
      
      const responseData = await response.json();
      console.log('Raw signals response:', responseData);
      
      // Handle different response formats (direct array or {signals: []})
      const rawSignals = Array.isArray(responseData) ? responseData : responseData.signals || [];
      
      // Transform the webhook signals format to our app format
      const formattedSignals = rawSignals.map((signal: any) => ({
        id: signal.id || `signal-${Date.now()}-${Math.random()}`,
        symbol: signal.Symbol || signal.Asset || '',
        type: (signal.Direction || '').toLowerCase(),
        entry: signal['Entry Price'] || 0,
        stopLoss: signal['Stop Loss'] || 0,
        takeProfit: signal['Take Profit'] || signal.TP1 || 0,
        timestamp: new Date(signal.Date || signal.Time || new Date()),
        source: signal.Provider || 'Unknown',
        risk: 1, // Default risk level
        notes: signal.Notes || '',
        timeframe: signal.Timeframe || '30m',
        status: signal.Status || 'active'
      }));
      
      console.log('Refreshed signals:', formattedSignals);
      
      set({ 
        signals: formattedSignals, 
        loading: false,
        lastFetched: new Date()
      });
      
      // Add notification if enabled
      if (formattedSignals.length > 0 && window.Notification && Notification.permission === 'granted') {
        try {
          const latestSignal = formattedSignals[0];
          new Notification('New Trading Signal', {
            body: `${latestSignal.type.toUpperCase()} ${latestSignal.symbol} at $${latestSignal.entry}`,
            icon: '/logo.png'
          });
        } catch (e) {
          console.error('Notification error:', e);
        }
      }
      
    } catch (error) {
      console.error('Error fetching trading signals:', error);
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