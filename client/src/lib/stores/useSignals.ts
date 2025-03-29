import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { toast } from 'sonner';

// Define the shape of a trading signal
export interface TradingSignal {
  id: string;
  timestamp: Date;
  symbol: string;
  action: 'buy' | 'sell' | 'neutral';
  price: number;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  takeProfit3?: number;
  source: string;
  strategy: string;
  message: string;
  confidence: number;
  timeframe: string;
  indicators?: Record<string, string>;
  read: boolean;
}

interface SignalsState {
  signals: TradingSignal[];
  loading: boolean;
  error: string | null;
  lastFetched: Date | null;
  fetchSignals: () => Promise<void>;
  markAsRead: (signalId: string) => void;
  markAllAsRead: () => void;
  clearSignals: () => void;
}

// Helper function to convert plain objects to class instances 
const fixSignalDates = (signals: any[]): TradingSignal[] => {
  return signals.map(signal => ({
    ...signal,
    timestamp: new Date(signal.timestamp),
  }));
};

// Create the store with persistence
export const useSignals = create<SignalsState>()(
  persist(
    (set, get) => ({
      signals: [],
      loading: false,
      error: null,
      lastFetched: null,
      
      fetchSignals: async () => {
        set({ loading: true, error: null });
        
        try {
          const response = await axios.get('/api/signals');
          
          if (response.status === 200) {
            // Parse and fix dates from the response
            const signals = fixSignalDates(response.data);
            
            // Determine if there are any new signals
            const currentSignals = get().signals;
            const newSignals = signals.filter(signal => 
              !currentSignals.some(currentSignal => currentSignal.id === signal.id)
            );
            
            // Show toast notification if there are new signals
            if (newSignals.length > 0 && get().lastFetched !== null) {
              toast.success(`${newSignals.length} new trading signal${newSignals.length === 1 ? '' : 's'} received`);
              
              // Optional: Play a notification sound for new signals
              const audio = new Audio('/assets/sounds/notification.mp3');
              audio.volume = 0.5;
              audio.play().catch(err => console.log('Audio play failed:', err));
            }
            
            set({ 
              signals, 
              loading: false,
              lastFetched: new Date()
            });
          } else {
            throw new Error('Failed to fetch signals');
          }
        } catch (error) {
          console.error('Error fetching signals:', error);
          set({ 
            loading: false, 
            error: 'Failed to fetch signals. Please try again later.' 
          });
        }
      },
      
      markAsRead: (signalId: string) => {
        set(state => ({
          signals: state.signals.map(signal => 
            signal.id === signalId 
              ? { ...signal, read: true } 
              : signal
          )
        }));
      },
      
      markAllAsRead: () => {
        set(state => ({
          signals: state.signals.map(signal => ({ ...signal, read: true }))
        }));
      },
      
      clearSignals: () => {
        set({ signals: [] });
      }
    }),
    {
      name: 'trading-signals-storage',
      partialize: (state) => ({ 
        signals: state.signals,
        lastFetched: state.lastFetched 
      }),
    }
  )
);

// Additional hooks for filtering signals
export const useFilteredSignals = (
  source?: string,
  symbol?: string,
  action?: 'buy' | 'sell' | 'neutral',
  timeframe?: string
) => {
  const { signals } = useSignals();
  
  return signals.filter(signal => 
    (source ? signal.source === source : true) &&
    (symbol ? signal.symbol === symbol : true) &&
    (action ? signal.action === action : true) &&
    (timeframe ? signal.timeframe === timeframe : true)
  );
};

// Hook to get unread signal count
export const useUnreadSignalCount = () => {
  const { signals } = useSignals();
  return signals.filter(signal => !signal.read).length;
};