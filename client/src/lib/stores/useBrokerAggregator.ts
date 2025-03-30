// Broker Aggregator Store
import { create } from 'zustand';
import { brokerAggregatorService, SUPPORTED_BROKERS, BrokerCredentials, 
         BrokerPriceComparison, AccountInfo, Position, OrderRequest, OrderResponse } from '../services/broker-aggregator-service';

// Added: Broker Orchestrator class
class BrokerOrchestrator {
  async executeTrade(userId: string, order: OrderRequest, brokerId?: string): Promise<OrderResponse> {
    // Simulate broker selection logic (replace with actual logic)
    const broker = brokerId || this.selectBestBroker();
    console.log(`Executing trade for user ${userId} on broker ${broker} for order:`, order);
    // Simulate trade execution on chosen broker (replace with actual API call)

    return new Promise(resolve => setTimeout(()=>resolve({orderId: 'simulated-order-id', status: 'filled', message: 'Order filled'}), 1000)) ;
  }

  selectBestBroker(): string {
    // Simulate broker selection based on some criteria (replace with your logic)
    return 'alpaca'; // Replace with dynamic broker selection
  }
}

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
  userId: string; // Added: User ID for trade execution
  hasAlpacaAccess: boolean; // Added: Flag for Alpaca crypto access

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
  userId: '', // Initialize userId (needs to be set during authentication)
  hasAlpacaAccess: false, // Initialize hasAlpacaAccess (needs to be set per user)

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
          error: null,
          userId: credentials.userId || '', // Set userId from credentials
          hasAlpacaAccess: credentials.hasAlpacaAccess || false // Set Alpaca access from credentials
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
      error: null,
      userId: '', // Reset userId on logout
      hasAlpacaAccess: false // Reset Alpaca access on logout
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
      const orchestrator = new BrokerOrchestrator();

      // Special handling for Alpaca crypto
      if (order.asset.type === 'crypto' && get().hasAlpacaAccess) {
        const result = await orchestrator.executeTrade(get().userId, order, 'alpaca');

        // If order was successful, refresh account info and positions
        if (result.status === 'filled' || result.status === 'pending') {
          await get().getAccountInfo();
          await get().getPositions();
        }
        set({ isLoading: false });
        return result;
      }

      // Let orchestrator choose best broker
      const result = await orchestrator.executeTrade(get().userId, order);

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