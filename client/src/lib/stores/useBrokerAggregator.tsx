import { create } from 'zustand';
import { BrokerAggregatorService, BrokerComparison, TradeDetails } from '../services/broker-aggregator-service';

interface BrokerAggregatorState {
  aggregator: BrokerAggregatorService | null;
  isConnected: boolean;
  activeBrokers: string[];
  selectedBroker: string | null;
  isLoading: boolean;
  error: string | null;
  currentComparisons: BrokerComparison[] | null;
  useABATEV: boolean;

  // Methods
  initializeAggregator: () => Promise<void>;
  selectBroker: (brokerId: string | null) => void;
  toggleABATEV: () => void;
  executeTrade: (details: TradeDetails) => Promise<{ 
    success: boolean; 
    orderId?: string; 
    broker?: string; 
    error?: string;
  }>;
  compareForSymbol: (symbol: string) => Promise<BrokerComparison[]>;
}

export const useBrokerAggregator = create<BrokerAggregatorState>((set, get) => ({
  aggregator: null,
  isConnected: false,
  activeBrokers: [],
  selectedBroker: null,
  isLoading: false,
  error: null,
  currentComparisons: null,
  useABATEV: true, // Default to using ABATEV's automatic selection

  initializeAggregator: async () => {
    set({ isLoading: true, error: null });
    
    try {
      const aggregator = await BrokerAggregatorService.createDefault();
      
      set({ 
        aggregator, 
        isConnected: true,
        activeBrokers: ['ironbeam', 'alpaca', 'bitfinex', 'etrade'], // Default brokers including new integrations
        isLoading: false 
      });
      
      console.log('Broker aggregator initialized');
    } catch (error) {
      console.error('Failed to initialize broker aggregator:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize broker aggregator' 
      });
    }
  },

  selectBroker: (brokerId) => {
    set({ selectedBroker: brokerId });
  },

  toggleABATEV: () => {
    set(state => ({ 
      useABATEV: !state.useABATEV,
      // If turning off ABATEV, default to first broker if none selected
      selectedBroker: !state.useABATEV ? null : (state.selectedBroker || state.activeBrokers[0] || null)
    }));
  },

  executeTrade: async (details) => {
    const { aggregator, selectedBroker, useABATEV } = get();
    
    if (!aggregator) {
      return { success: false, error: 'Broker aggregator not initialized' };
    }

    try {
      if (useABATEV) {
        // Use ABATEV to automatically find the best broker
        return await aggregator.executeTrade(details);
      } else if (selectedBroker) {
        // Use the manually selected broker
        const broker = aggregator.getBroker(selectedBroker);
        if (!broker) {
          return { success: false, error: `Selected broker ${selectedBroker} not available` };
        }
        
        const orderId = await broker.placeOrder({
          symbol: details.symbol,
          side: details.action,
          quantity: details.quantity,
          type: details.orderType,
          limitPrice: details.limitPrice
        });
        
        return {
          success: true,
          orderId,
          broker: selectedBroker
        };
      } else {
        return { success: false, error: 'No broker selected' };
      }
    } catch (error) {
      console.error('Error executing trade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error executing trade'
      };
    }
  },

  compareForSymbol: async (symbol) => {
    const { aggregator } = get();
    set({ isLoading: true, error: null });
    
    if (!aggregator) {
      set({ isLoading: false, error: 'Broker aggregator not initialized' });
      return [];
    }
    
    try {
      // Subscribe to market data for this symbol if not already
      await aggregator.subscribeToMarketData(symbol);
      
      // Wait a short time for data to arrive
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the comparisons
      const comparisons = aggregator.getAllBrokerComparisons(symbol);
      set({ currentComparisons: comparisons, isLoading: false });
      return comparisons;
    } catch (error) {
      console.error('Error comparing brokers:', error);
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error comparing brokers' 
      });
      return [];
    }
  }
}));