// Broker Aggregator Store
import { create } from 'zustand';
import { brokerAggregatorService, SUPPORTED_BROKERS, BrokerCredentials, 
         BrokerPriceComparison, AccountInfo, Position, OrderRequest, OrderResponse } from '../services/broker-aggregator-service';

interface BrokerAggregatorState {
  isAuthenticated: boolean;
  demoMode: boolean;
  isLoading: boolean;
  currentSymbol: string;
  currentBroker: string | null;
  currentBrokerInfo: any;
  brokerComparisons: BrokerPriceComparison[];
  accountInfo: AccountInfo | null;
  positions: Position[];
  error: string | null;
  isConnected: boolean;
  selectedBroker: string;
  useABATEV: boolean;
  
  // Actions
  authenticateBroker: (credentials: BrokerCredentials) => Promise<boolean>;
  logout: () => void;
  compareBrokerPrices: (symbol: string) => Promise<void>;
  getAccountInfo: () => Promise<void>;
  getPositions: () => Promise<void>;
  placeOrder: (order: OrderRequest) => Promise<OrderResponse>;
  closePosition: (symbol: string) => Promise<OrderResponse>;
  setCurrentSymbol: (symbol: string) => void;
  toggleDemoMode: () => void;
  getSupportedBrokers: () => typeof SUPPORTED_BROKERS;
  
  // Additional actions needed for SignalsList
  initializeAggregator: () => Promise<boolean>;
  executeTrade: (order: OrderRequest) => Promise<any>;
  selectBroker: (brokerId: string) => void;
  toggleABATEV: () => void;
}

export const useBrokerAggregator = create<BrokerAggregatorState>((set, get) => ({
  isAuthenticated: false,
  demoMode: true,
  isLoading: false,
  currentSymbol: 'BTCUSD',
  currentBroker: null,
  currentBrokerInfo: null,
  brokerComparisons: [],
  accountInfo: null,
  positions: [],
  error: null,
  isConnected: false,
  selectedBroker: 'alpaca',
  useABATEV: true,
  
  authenticateBroker: async (credentials: BrokerCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const success = await brokerAggregatorService.initialize(credentials);
      
      if (success) {
        set({
          isAuthenticated: true,
          demoMode: !!credentials.demoMode,
          currentBroker: credentials.brokerId,
          currentBrokerInfo: brokerAggregatorService.getCurrentBroker(),
          error: null
        });
        
        // Get initial account info and positions
        await get().getAccountInfo();
        await get().getPositions();
      } else {
        set({
          error: 'Authentication failed. Please check your credentials and try again.',
          isAuthenticated: false
        });
      }
      
      set({ isLoading: false });
      return success;
    } catch (error) {
      console.error('Error authenticating broker:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown authentication error',
        isAuthenticated: false
      });
      return false;
    }
  },
  
  logout: () => {
    brokerAggregatorService.logout();
    set({
      isAuthenticated: false,
      currentBroker: null,
      currentBrokerInfo: null,
      accountInfo: null,
      positions: [],
      error: null
    });
  },
  
  compareBrokerPrices: async (symbol: string) => {
    set({ isLoading: true, error: null, currentSymbol: symbol });
    try {
      const comparisons = await brokerAggregatorService.getBrokerPriceComparisons(symbol);
      set({ brokerComparisons: comparisons, isLoading: false });
    } catch (error) {
      console.error('Error comparing broker prices:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to compare broker prices',
        brokerComparisons: []
      });
    }
  },
  
  getAccountInfo: async () => {
    if (!get().isAuthenticated) return;
    
    set({ isLoading: true, error: null });
    try {
      const accountInfo = await brokerAggregatorService.getAccountInfo();
      set({ accountInfo, isLoading: false });
    } catch (error) {
      console.error('Error getting account info:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get account information'
      });
    }
  },
  
  getPositions: async () => {
    if (!get().isAuthenticated) return;
    
    set({ isLoading: true, error: null });
    try {
      const positions = await brokerAggregatorService.getPositions();
      set({ positions, isLoading: false });
    } catch (error) {
      console.error('Error getting positions:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to get positions',
        positions: []
      });
    }
  },
  
  placeOrder: async (order: OrderRequest) => {
    set({ isLoading: true, error: null });
    try {
      const result = await brokerAggregatorService.placeOrder(order);
      
      // If order was successful, refresh account info and positions
      if (result.status === 'filled' || result.status === 'pending') {
        await get().getAccountInfo();
        await get().getPositions();
      }
      
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Error placing order:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to place order'
      });
      
      return {
        orderId: '',
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Failed to place order'
      };
    }
  },
  
  closePosition: async (symbol: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await brokerAggregatorService.closePosition(symbol);
      
      // If position was closed successfully, refresh account info and positions
      if (result.status === 'filled') {
        await get().getAccountInfo();
        await get().getPositions();
      }
      
      set({ isLoading: false });
      return result;
    } catch (error) {
      console.error('Error closing position:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to close position'
      });
      
      return {
        orderId: '',
        status: 'rejected',
        message: error instanceof Error ? error.message : 'Failed to close position'
      };
    }
  },
  
  setCurrentSymbol: (symbol: string) => {
    set({ currentSymbol: symbol });
    // Also update broker comparisons
    get().compareBrokerPrices(symbol);
  },
  
  toggleDemoMode: () => {
    // Only toggle if not authenticated
    if (!get().isAuthenticated) {
      set(state => ({ demoMode: !state.demoMode }));
    } else {
      set({ error: 'Please logout before switching between demo and live modes.' });
    }
  },
  
  getSupportedBrokers: () => {
    return SUPPORTED_BROKERS;
  },
  
  // Additional actions implementation for SignalsList
  initializeAggregator: async () => {
    set({ isLoading: true, error: null });
    try {
      // Simulate connection to broker aggregator service
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isConnected: true, isLoading: false });
      return true;
    } catch (error) {
      console.error('Error initializing broker aggregator:', error);
      set({
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to initialize broker aggregator',
        isConnected: false
      });
      return false;
    }
  },
  
  executeTrade: async (order: OrderRequest) => {
    return get().placeOrder(order);
  },
  
  selectBroker: (brokerId: string) => {
    set({ selectedBroker: brokerId });
  },
  
  toggleABATEV: () => {
    set(state => ({ useABATEV: !state.useABATEV }));
  }
}));