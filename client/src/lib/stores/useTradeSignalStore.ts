import { create } from 'zustand';
import { TradeSignal } from '../types';
import axios from 'axios';

interface TradeSignalStore {
  signals: TradeSignal[];
  isLoading: boolean;
  error: string | null;
  fetchSignals: () => Promise<void>;
  copySignal: (signalId: string, autoExecute: boolean) => Promise<void>;
}

export const useTradeSignalStore = create<TradeSignalStore>((set, get) => ({
  signals: [],
  isLoading: false,
  error: null,
  
  fetchSignals: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get('/api/trading-signals');
      set({ signals: response.data, isLoading: false });
    } catch (error) {
      console.error('Error fetching trade signals:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch trade signals', 
        isLoading: false 
      });
    }
  },
  
  copySignal: async (signalId: string, autoExecute: boolean) => {
    try {
      const signal = get().signals.find(s => s.id === signalId);
      if (!signal) {
        throw new Error('Signal not found');
      }
      
      // If auto-execute is enabled, send to broker API
      if (autoExecute) {
        await axios.post('/api/broker/execute-trade', { 
          signalId,
          symbol: signal.symbol,
          side: signal.side,
          price: signal.entryPrice,
          stopLoss: signal.stopLoss,
          takeProfit: signal.takeProfit,
        });
      } else {
        // Otherwise just copy signal to clipboard or trading panel
        // This could be implemented as an event that the trading panel listens to
        // For now we'll just dispatch a custom event
        const event = new CustomEvent('copy-trade-signal', { 
          detail: { 
            signal,
            timestamp: new Date().toISOString()
          } 
        });
        window.dispatchEvent(event);
      }
      
      // Log the copy action
      await axios.post('/api/trading-signals/copy', { 
        signalId,
        autoExecute
      });
      
    } catch (error) {
      console.error('Error copying trade signal:', error);
      set({ 
        error: error instanceof Error ? error.message : 'Failed to copy trade signal'
      });
    }
  }
}));