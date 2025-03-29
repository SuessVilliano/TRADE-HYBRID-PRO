import { create } from 'zustand';
import axios from 'axios';
import { persist } from 'zustand/middleware';
import { SignalNotificationService } from '../services/signal-notification-service';

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
  notificationsEnabled: boolean;
  fetchSignals: () => Promise<void>;
  markAsRead: (signalId: string) => void;
  markAllAsRead: () => void;
  clearSignals: () => void;
  setNotificationsEnabled: (enabled: boolean) => void;
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
      notificationsEnabled: true, // Notifications enabled by default
      
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
            
            // Show toast notifications if there are new signals and notifications are enabled
            if (newSignals.length > 0 && get().lastFetched !== null && get().notificationsEnabled) {
              // If there's only one new signal, show a detailed notification
              if (newSignals.length === 1) {
                SignalNotificationService.showSignalNotification(newSignals[0]);
              } 
              // If there are multiple new signals, show a summary notification
              else if (newSignals.length > 1) {
                SignalNotificationService.showMultipleSignalsNotification(newSignals);
              }
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
      },
      
      setNotificationsEnabled: (enabled: boolean) => {
        set({ notificationsEnabled: enabled });
      }
    }),
    {
      name: 'trading-signals-storage',
      partialize: (state) => ({ 
        signals: state.signals,
        lastFetched: state.lastFetched,
        notificationsEnabled: state.notificationsEnabled
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

// Helper function to show a signal notification manually
export const showSignalNotification = (signal: TradingSignal) => {
  SignalNotificationService.showSignalNotification(signal);
};