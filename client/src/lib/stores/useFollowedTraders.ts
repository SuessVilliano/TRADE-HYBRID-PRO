import { create } from 'zustand';

export interface FollowedTrader {
  id: string;
  username: string;
  avatar: string;
  signals: boolean; // Whether to receive signals from this trader
  trades: boolean;  // Whether to copy trades from this trader
  education: boolean; // Whether to receive educational content
  lastActive: Date;
  pnl: number;
  winRate: number;
  signalCount: number;
  tradeCount: number;
}

interface FollowedTradersState {
  // State
  followedTraders: FollowedTrader[];
  isLoadingTraders: boolean;
  followedSignals: any[]; // Signals from followed traders
  error: string | null;
  
  // Actions
  followTrader: (traderId: string) => Promise<void>;
  unfollowTrader: (traderId: string) => Promise<void>;
  toggleSignals: (traderId: string, enabled: boolean) => void;
  toggleTrades: (traderId: string, enabled: boolean) => void;
  toggleEducation: (traderId: string, enabled: boolean) => void;
  fetchFollowedTraders: () => Promise<void>;
  fetchFollowedSignals: () => Promise<void>;
}

export const useFollowedTraders = create<FollowedTradersState>((set, get) => ({
  followedTraders: [],
  isLoadingTraders: false,
  followedSignals: [],
  error: null,
  
  followTrader: async (traderId: string) => {
    set({ isLoadingTraders: true });
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Simulate API response
      const traderData = {
        id: traderId,
        username: `Trader${traderId.substring(0, 5)}`,
        avatar: `/avatars/trader${Math.floor(Math.random() * 10) + 1}.png`,
        signals: true,
        trades: false,
        education: true,
        lastActive: new Date(),
        pnl: Math.random() * 10000 - 2000,
        winRate: Math.random() * 40 + 50,
        signalCount: Math.floor(Math.random() * 50) + 10,
        tradeCount: Math.floor(Math.random() * 100) + 20
      };
      
      set(state => ({
        followedTraders: [...state.followedTraders, traderData],
        error: null
      }));
      
    } catch (error) {
      console.error('Error following trader:', error);
      set({ error: 'Failed to follow trader. Please try again.' });
    } finally {
      set({ isLoadingTraders: false });
    }
  },
  
  unfollowTrader: async (traderId: string) => {
    set({ isLoadingTraders: true });
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 300));
      
      set(state => ({
        followedTraders: state.followedTraders.filter(t => t.id !== traderId),
        error: null
      }));
      
    } catch (error) {
      console.error('Error unfollowing trader:', error);
      set({ error: 'Failed to unfollow trader. Please try again.' });
    } finally {
      set({ isLoadingTraders: false });
    }
  },
  
  toggleSignals: (traderId: string, enabled: boolean) => {
    set(state => ({
      followedTraders: state.followedTraders.map(trader => 
        trader.id === traderId ? { ...trader, signals: enabled } : trader
      )
    }));
  },
  
  toggleTrades: (traderId: string, enabled: boolean) => {
    set(state => ({
      followedTraders: state.followedTraders.map(trader => 
        trader.id === traderId ? { ...trader, trades: enabled } : trader
      )
    }));
  },
  
  toggleEducation: (traderId: string, enabled: boolean) => {
    set(state => ({
      followedTraders: state.followedTraders.map(trader => 
        trader.id === traderId ? { ...trader, education: enabled } : trader
      )
    }));
  },
  
  fetchFollowedTraders: async () => {
    set({ isLoadingTraders: true });
    
    try {
      // In a real implementation, this would call an API
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // For demo purposes, generate 3 random followed traders
      const traders = Array.from({ length: 3 }, (_, i) => ({
        id: `trader-${Date.now()}-${i}`,
        username: `Trader${Math.random().toString(36).substring(2, 7)}`,
        avatar: `/avatars/trader${Math.floor(Math.random() * 10) + 1}.png`,
        signals: Math.random() > 0.3, // 70% chance of having signals enabled
        trades: Math.random() > 0.7,  // 30% chance of having trade copying enabled
        education: Math.random() > 0.2, // 80% chance of having education enabled
        lastActive: new Date(Date.now() - Math.random() * 86400000 * 5), // Active in last 5 days
        pnl: Math.random() * 20000 - 5000,
        winRate: Math.random() * 40 + 50, // 50-90%
        signalCount: Math.floor(Math.random() * 50) + 10,
        tradeCount: Math.floor(Math.random() * 100) + 20
      }));
      
      set({ followedTraders: traders, error: null });
      
    } catch (error) {
      console.error('Error fetching followed traders:', error);
      set({ error: 'Failed to load followed traders. Please try again.' });
    } finally {
      set({ isLoadingTraders: false });
    }
  },
  
  fetchFollowedSignals: async () => {
    try {
      const { followedTraders } = get();
      const enabledTraderIds = followedTraders
        .filter(trader => trader.signals)
        .map(trader => trader.id);
      
      if (enabledTraderIds.length === 0) {
        set({ followedSignals: [], error: null });
        return;
      }
      
      // In a real implementation, this would call an API to get signals from these traders
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Generate some mock signals for demo purposes
      const signals = [];
      for (const traderId of enabledTraderIds) {
        const trader = followedTraders.find(t => t.id === traderId);
        
        // Generate 1-3 signals per trader
        const traderSignalCount = Math.floor(Math.random() * 3) + 1;
        
        for (let i = 0; i < traderSignalCount; i++) {
          const symbols = ['BTCUSD', 'ETHUSD', 'EURUSD', 'XAUUSD', 'THCUSD'];
          const symbol = symbols[Math.floor(Math.random() * symbols.length)];
          const action = Math.random() > 0.5 ? 'buy' : 'sell';
          const price = symbol === 'BTCUSD' ? 70000 + Math.random() * 5000 :
                        symbol === 'ETHUSD' ? 3000 + Math.random() * 1000 :
                        symbol === 'EURUSD' ? 1.05 + Math.random() * 0.1 :
                        symbol === 'XAUUSD' ? 2100 + Math.random() * 200 :
                        0.85 + Math.random() * 0.2; // THCUSD
          
          signals.push({
            id: `signal-${Date.now()}-${i}-${traderId}`,
            trader: {
              id: traderId,
              username: trader?.username || `Trader${traderId.substring(0, 5)}`,
              avatar: trader?.avatar || '/avatars/default.png'
            },
            symbol,
            action,
            price,
            timestamp: new Date(Date.now() - Math.random() * 86400000), // Within the last 24h
            confidence: Math.floor(Math.random() * 35) + 60, // 60-95%
            message: `${action.toUpperCase()} signal for ${symbol} at ${price.toFixed(2)}`,
            status: Math.random() > 0.7 ? 'pending' : Math.random() > 0.5 ? 'success' : 'fail'
          });
        }
      }
      
      // Sort by timestamp (newest first)
      signals.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      set({ followedSignals: signals, error: null });
      
    } catch (error) {
      console.error('Error fetching trader signals:', error);
      set({ error: 'Failed to load trader signals. Please try again.' });
    }
  }
}));