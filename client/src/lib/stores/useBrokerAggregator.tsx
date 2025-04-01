import { create } from 'zustand';
import { AccountBalance, TradePosition, OrderDetails, TradeUpdate } from '../services/broker-aggregator-service';

// Create interface for compatibility with both implementations
interface BrokerService {
  placeOrder: (order: any) => Promise<string>;
}

// Helper function to type-check the broker aggregator
function isBrokerAggregator(obj: any): obj is BrokerAggregatorService {
  return obj && typeof obj === 'object';
}

// Import with compatibility for both old and new service structures
interface BrokerAggregatorService {
  // Methods the service needs to implement
  getBroker?: (brokerId: string) => BrokerService;
  executeTrade?: (details: TradeDetails) => Promise<{success: boolean; orderId?: string; broker?: string; error?: string}>;
  subscribeToMarketData?: (symbol: string) => Promise<void>;
  getAllBrokerComparisons?: (symbol: string) => BrokerComparison[];
  
  // Add any other methods that might be needed for compatibility
  getAvailableBrokers?: () => string[];
  isConnectedToBroker?: (brokerId: string) => boolean;
  getAccountBalances?: (brokerId: string) => Promise<AccountBalance[]>;
  getPositions?: (brokerId: string) => Promise<TradePosition[]>;
}

// Compatibility interfaces for both old and new versions
export interface BrokerComparison {
  symbol: string;
  timestamp: number;
  prices: Array<{
    brokerId: string;
    price: number;
    spread: number;
    latency?: number;
    score?: number;
  }>;
}

export interface TradeDetails {
  symbol: string;
  action: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'stop' | 'stop_limit';
  limitPrice?: number;
  stopPrice?: number;
}

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
      // Import the broker aggregator singleton instance directly
      const { brokerAggregator } = await import('../services/broker-aggregator-service');
      
      // Type check the aggregator to make sure it's valid
      if (!isBrokerAggregator(brokerAggregator)) {
        throw new Error('Invalid broker aggregator instance');
      }
      
      // Set the aggregator state with the singleton instance and cast to our interface
      set({ 
        aggregator: brokerAggregator as unknown as BrokerAggregatorService,
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
        if (aggregator.executeTrade) {
          return await aggregator.executeTrade(details);
        } else {
          // Fallback to default method if executeTrade is not available
          console.warn('ABATEV executeTrade not available, using fallback');
          return { success: false, error: 'ABATEV executeTrade not available' };
        }
      } else if (selectedBroker) {
        // Use the manually selected broker
        if (!aggregator.getBroker) {
          return { success: false, error: 'getBroker method not available' };
        }
        
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
      // Check if the method exists before calling it
      if (aggregator.subscribeToMarketData) {
        // Subscribe to market data for this symbol if not already
        await aggregator.subscribeToMarketData(symbol);
        
        // Wait a short time for data to arrive
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.warn('subscribeToMarketData method not available');
      }
      
      // Get the comparisons
      if (aggregator.getAllBrokerComparisons) {
        const comparisons = aggregator.getAllBrokerComparisons(symbol);
        set({ currentComparisons: comparisons, isLoading: false });
        return comparisons;
      } else {
        console.warn('getAllBrokerComparisons method not available, using empty array');
        set({ isLoading: false });
        return [];
      }
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