import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { TradingSignal } from '../../../shared/models/UserContext';

interface SignalsState {
  signals: TradingSignal[];
  activeSignal: TradingSignal | null;
  favoriteSymbols: string[];
  
  // Actions
  setSignals: (signals: TradingSignal[]) => void;
  addSignal: (signal: TradingSignal) => void;
  removeSignal: (signalId: string) => void;
  updateSignal: (signalId: string, updatedSignal: Partial<TradingSignal>) => void;
  setActiveSignal: (signal: TradingSignal | null) => void;
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
  clearAll: () => void;
}

/**
 * Trading Signals Store
 * 
 * Manages all trading signals across the application. This store contains
 * signals from various sources, including AI-generated signals, user-created
 * signals, and signals from external webhook sources.
 * 
 * It also manages favorites and the currently active signal.
 */
export const useSignals = create<SignalsState>()(
  persist(
    (set, get) => ({
      signals: [],
      activeSignal: null,
      favoriteSymbols: [],
      
      // Set all signals
      setSignals: (signals) => {
        set({ signals });
      },
      
      // Add a new signal
      addSignal: (signal) => {
        set((state) => {
          // Check if signal with same ID already exists
          const existingIndex = state.signals.findIndex(s => s.id === signal.id);
          
          if (existingIndex !== -1) {
            // Replace existing signal
            const updatedSignals = [...state.signals];
            updatedSignals[existingIndex] = signal;
            return { signals: updatedSignals };
          }
          
          // Add new signal
          return { signals: [...state.signals, signal] };
        });
      },
      
      // Remove a signal
      removeSignal: (signalId) => {
        set((state) => ({
          signals: state.signals.filter(signal => signal.id !== signalId),
          // Also clear activeSignal if it's the one being removed
          activeSignal: state.activeSignal?.id === signalId 
            ? null 
            : state.activeSignal
        }));
      },
      
      // Update specific fields of a signal
      updateSignal: (signalId, updatedFields) => {
        set((state) => {
          const signalIndex = state.signals.findIndex(s => s.id === signalId);
          
          // Signal not found
          if (signalIndex === -1) return state;
          
          // Create updated signals array
          const updatedSignals = [...state.signals];
          updatedSignals[signalIndex] = {
            ...updatedSignals[signalIndex],
            ...updatedFields
          };
          
          // Also update activeSignal if it's the same signal
          const updatedActiveSignal = state.activeSignal?.id === signalId
            ? { ...state.activeSignal, ...updatedFields }
            : state.activeSignal;
            
          return { 
            signals: updatedSignals,
            activeSignal: updatedActiveSignal
          };
        });
      },
      
      // Set the active signal
      setActiveSignal: (signal) => {
        set({ activeSignal: signal });
      },
      
      // Add a symbol to favorites
      addFavoriteSymbol: (symbol) => {
        set((state) => {
          // Don't add duplicates
          if (state.favoriteSymbols.includes(symbol)) {
            return state;
          }
          
          return {
            favoriteSymbols: [...state.favoriteSymbols, symbol]
          };
        });
      },
      
      // Remove a symbol from favorites
      removeFavoriteSymbol: (symbol) => {
        set((state) => ({
          favoriteSymbols: state.favoriteSymbols.filter(s => s !== symbol)
        }));
      },
      
      // Clear all data
      clearAll: () => {
        set({
          signals: [],
          activeSignal: null,
          // Keep favorites
        });
      },
    }),
    {
      name: 'trade-hybrid-signals-store',
      // Only persist these fields
      partialize: (state) => ({
        favoriteSymbols: state.favoriteSymbols,
      })
    }
  )
);