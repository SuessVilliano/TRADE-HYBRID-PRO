import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  amount: number;
  entryDate: string;
  exitDate?: string;
  status: 'open' | 'closed';
  pnl?: number;
  pnlPercentage?: number;
  brokerId: string;
  stopLoss?: number;
  takeProfit?: number;
  fees?: number;
  notes?: string;
}

export interface BrokerConnection {
  id: string;
  name: string;
  apiKey: string;
  secretKey?: string;
  accountId?: string;
  isConnected: boolean;
  lastConnected?: string;
  type: 'alpaca' | 'binance' | 'oanda' | 'ironbeam' | 'kraken' | 'coinbase';
}

export interface UserPreferences {
  theme: 'light' | 'dark';
  showRealTimeNotifications: boolean;
  defaultTimeframe: string;
  defaultLeverage: number;
  defaultTradeSize: number;
  riskPercentage: number;
  defaultFees: number;
  showDemoAccount: boolean;
  showPnlInHeader: boolean;
  enableAdvancedMode: boolean;
  enableOneTapTrading: boolean;
  autoABATEV: boolean;
}

export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface UserState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    avatar?: string;
    joinDate?: string;
    lastLogin?: string;
    role?: 'user' | 'premium' | 'admin';
    apiKeys?: Record<string, string>;
    walletAddress?: string;
    walletSignature?: string;
    walletAuthEnabled?: boolean;
  };
  demoBalances: AccountBalance[];
  liveBalances: AccountBalance[];
  tradeHistory: Trade[];
  brokerConnections: BrokerConnection[];
  preferences: UserPreferences;
  notifications: {
    id: string;
    type: 'info' | 'warning' | 'success' | 'error';
    message: string;
    timestamp: string;
    read: boolean;
  }[];
  watchlists: {
    id: string;
    name: string;
    symbols: string[];
  }[];
  
  // Actions
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<UserState['user']>) => void;
  updatePreferences: (preferences: Partial<UserPreferences>) => void;
  addTrade: (trade: Omit<Trade, 'id'>) => string;
  updateTrade: (id: string, tradeData: Partial<Trade>) => boolean;
  closeTrade: (id: string, exitPrice: number, exitDate?: string) => boolean;
  deleteTrade: (id: string) => boolean;
  addBrokerConnection: (connection: Omit<BrokerConnection, 'id' | 'isConnected' | 'lastConnected'>) => string;
  updateBrokerConnection: (id: string, data: Partial<BrokerConnection>) => boolean;
  deleteBrokerConnection: (id: string) => boolean;
  markNotificationAsRead: (id: string) => void;
  clearNotifications: () => void;
  addToWatchlist: (watchlistId: string, symbol: string) => boolean;
  removeFromWatchlist: (watchlistId: string, symbol: string) => boolean;
  createWatchlist: (name: string) => string;
  deleteWatchlist: (id: string) => boolean;
}

// Initial state for preferences
const defaultPreferences: UserPreferences = {
  theme: 'dark',
  showRealTimeNotifications: true,
  defaultTimeframe: '1h',
  defaultLeverage: 1,
  defaultTradeSize: 0.01,
  riskPercentage: 1,
  defaultFees: 0.1,
  showDemoAccount: true,
  showPnlInHeader: true,
  enableAdvancedMode: false,
  enableOneTapTrading: false,
  autoABATEV: true
};

// Mock demo balances for demonstration
const initialDemoBalances: AccountBalance[] = [
  { asset: 'USD', free: 10000, locked: 0, total: 10000 },
  { asset: 'BTC', free: 0.1, locked: 0, total: 0.1 },
  { asset: 'ETH', free: 1.5, locked: 0, total: 1.5 },
  { asset: 'THC', free: 5000, locked: 0, total: 5000 }
];

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      isAuthenticated: false,
      user: {},
      demoBalances: initialDemoBalances,
      liveBalances: [],
      tradeHistory: [],
      brokerConnections: [],
      preferences: defaultPreferences,
      notifications: [],
      watchlists: [
        {
          id: 'default',
          name: 'Default Watchlist',
          symbols: ['BTCUSD', 'ETHUSD', 'AAPLM', 'EURUSD']
        }
      ],
      
      // Authentication actions
      login: async (username: string, password: string): Promise<boolean> => {
        try {
          // In production, this would be an actual API call
          // const response = await fetch('/api/auth/login', {
          //   method: 'POST',
          //   headers: { 'Content-Type': 'application/json' },
          //   body: JSON.stringify({ username, password }),
          // });
          // const data = await response.json();

          // Special demo admin account for unlocking all features
          if (username === 'demo' && password === 'password') {
            const demoAdminUser = {
              id: 'demo-admin-123',
              username: 'demo',
              email: 'demo@tradehybrid.com',
              firstName: 'Demo',
              lastName: 'Admin',
              avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
              joinDate: new Date().toISOString(),
              lastLogin: new Date().toISOString(),
              role: 'admin' as const,
              apiKeys: {},
              isDemoAccount: true
            };
            
            // Set a custom demo balance with higher amounts
            const demoAdminBalances: AccountBalance[] = [
              { asset: 'USD', free: 100000, locked: 0, total: 100000 },
              { asset: 'BTC', free: 5, locked: 0, total: 5 },
              { asset: 'ETH', free: 50, locked: 0, total: 50 },
              { asset: 'THC', free: 10000, locked: 0, total: 10000 }
            ];
            
            set({
              isAuthenticated: true,
              user: demoAdminUser,
              demoBalances: demoAdminBalances
            });
            
            // Store demo user level as EXPERT to unlock all features
            localStorage.setItem('userExperienceLevel', 'expert');
            
            // Show success notification for demo login
            set({
              notifications: [
                ...get().notifications,
                {
                  id: Date.now().toString(),
                  type: 'success',
                  message: 'Demo mode activated! All features are now unlocked.',
                  timestamp: new Date().toISOString(),
                  read: false
                }
              ]
            });
            
            return true;
          }
          
          // Regular user simulation for demo
          const mockUser = {
            id: '123456789',
            username,
            email: `${username}@example.com`,
            firstName: 'John',
            lastName: 'Doe',
            avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
            joinDate: new Date().toISOString(),
            lastLogin: new Date().toISOString(),
            role: 'user' as const,
            apiKeys: {}
          };
          
          set({
            isAuthenticated: true,
            user: mockUser,
            notifications: [
              ...get().notifications,
              {
                id: Date.now().toString(),
                type: 'success',
                message: 'Successfully logged in. Welcome back!',
                timestamp: new Date().toISOString(),
                read: false
              }
            ]
          });
          
          return true;
        } catch (error) {
          set({
            notifications: [
              ...get().notifications,
              {
                id: Date.now().toString(),
                type: 'error',
                message: 'Login failed. Please check your credentials and try again.',
                timestamp: new Date().toISOString(),
                read: false
              }
            ]
          });
          
          return false;
        }
      },
      
      logout: () => {
        // Reset user experience level to beginner when logging out
        localStorage.setItem('userExperienceLevel', 'beginner');
        
        // Reset to initial demo balances
        set({
          isAuthenticated: false,
          user: {},
          demoBalances: initialDemoBalances,
          tradeHistory: [],
          brokerConnections: [],
          notifications: []
        });
      },
      
      updateUser: (userData) => {
        set({ user: { ...get().user, ...userData } });
      },
      
      updatePreferences: (preferences) => {
        set({ preferences: { ...get().preferences, ...preferences } });
        
        // If theme was updated, apply it to the document
        if (preferences.theme) {
          if (preferences.theme === 'dark') {
            document.documentElement.classList.add('dark');
            document.documentElement.style.colorScheme = 'dark';
          } else {
            document.documentElement.classList.remove('dark');
            document.documentElement.style.colorScheme = 'light';
          }
        }
      },
      
      // Trade actions
      addTrade: (trade) => {
        const id = Date.now().toString();
        const newTrade: Trade = {
          id,
          ...trade,
          status: 'open'
        };
        
        set({ tradeHistory: [...get().tradeHistory, newTrade] });
        
        // Update balances
        const balances = trade.brokerId === 'demo' ? [...get().demoBalances] : [...get().liveBalances];
        // In a real app, you would update the balances here
        
        // Add notification
        set({
          notifications: [
            ...get().notifications,
            {
              id: Date.now().toString(),
              type: 'success',
              message: `New ${trade.type} trade opened for ${trade.symbol}`,
              timestamp: new Date().toISOString(),
              read: false
            }
          ]
        });
        
        return id;
      },
      
      updateTrade: (id, tradeData) => {
        const trades = get().tradeHistory;
        const tradeIndex = trades.findIndex(t => t.id === id);
        
        if (tradeIndex === -1) return false;
        
        const updatedTrades = [...trades];
        updatedTrades[tradeIndex] = {
          ...updatedTrades[tradeIndex],
          ...tradeData
        };
        
        set({ tradeHistory: updatedTrades });
        return true;
      },
      
      closeTrade: (id, exitPrice, exitDate = new Date().toISOString()) => {
        const trades = get().tradeHistory;
        const tradeIndex = trades.findIndex(t => t.id === id);
        
        if (tradeIndex === -1) return false;
        
        const trade = trades[tradeIndex];
        if (trade.status === 'closed') return false;
        
        // Calculate P&L
        const entryAmount = trade.amount * trade.entryPrice;
        const exitAmount = trade.amount * exitPrice;
        let pnl = 0;
        
        if (trade.type === 'buy') {
          pnl = exitAmount - entryAmount;
        } else if (trade.type === 'sell') {
          pnl = entryAmount - exitAmount;
        }
        
        // Calculate P&L percentage
        const pnlPercentage = (pnl / entryAmount) * 100;
        
        const updatedTrade: Trade = {
          ...trade,
          exitPrice,
          exitDate,
          status: 'closed',
          pnl,
          pnlPercentage
        };
        
        const updatedTrades = [...trades];
        updatedTrades[tradeIndex] = updatedTrade;
        
        set({ tradeHistory: updatedTrades });
        
        // Add notification
        set({
          notifications: [
            ...get().notifications,
            {
              id: Date.now().toString(),
              type: pnl >= 0 ? 'success' : 'warning',
              message: `Trade closed for ${trade.symbol}: ${pnl >= 0 ? 'Profit' : 'Loss'} of $${Math.abs(pnl).toFixed(2)} (${pnlPercentage.toFixed(2)}%)`,
              timestamp: new Date().toISOString(),
              read: false
            }
          ]
        });
        
        return true;
      },
      
      deleteTrade: (id) => {
        const trades = get().tradeHistory;
        const updatedTrades = trades.filter(t => t.id !== id);
        
        if (updatedTrades.length === trades.length) return false;
        
        set({ tradeHistory: updatedTrades });
        return true;
      },
      
      // Broker connection actions
      addBrokerConnection: (connection) => {
        const id = Date.now().toString();
        const newConnection: BrokerConnection = {
          id,
          ...connection,
          isConnected: true,
          lastConnected: new Date().toISOString()
        };
        
        set({ brokerConnections: [...get().brokerConnections, newConnection] });
        
        // Add notification
        set({
          notifications: [
            ...get().notifications,
            {
              id: Date.now().toString(),
              type: 'success',
              message: `Connected to ${connection.name} successfully`,
              timestamp: new Date().toISOString(),
              read: false
            }
          ]
        });
        
        return id;
      },
      
      updateBrokerConnection: (id, data) => {
        const connections = get().brokerConnections;
        const connectionIndex = connections.findIndex(c => c.id === id);
        
        if (connectionIndex === -1) return false;
        
        const updatedConnections = [...connections];
        updatedConnections[connectionIndex] = {
          ...updatedConnections[connectionIndex],
          ...data
        };
        
        set({ brokerConnections: updatedConnections });
        return true;
      },
      
      deleteBrokerConnection: (id) => {
        const connections = get().brokerConnections;
        const updatedConnections = connections.filter(c => c.id !== id);
        
        if (updatedConnections.length === connections.length) return false;
        
        set({ brokerConnections: updatedConnections });
        
        // Add notification
        set({
          notifications: [
            ...get().notifications,
            {
              id: Date.now().toString(),
              type: 'info',
              message: 'Broker connection removed',
              timestamp: new Date().toISOString(),
              read: false
            }
          ]
        });
        
        return true;
      },
      
      // Notification actions
      markNotificationAsRead: (id) => {
        const notifications = get().notifications;
        const notificationIndex = notifications.findIndex(n => n.id === id);
        
        if (notificationIndex === -1) return;
        
        const updatedNotifications = [...notifications];
        updatedNotifications[notificationIndex] = {
          ...updatedNotifications[notificationIndex],
          read: true
        };
        
        set({ notifications: updatedNotifications });
      },
      
      clearNotifications: () => {
        set({ notifications: [] });
      },
      
      // Watchlist actions
      addToWatchlist: (watchlistId, symbol) => {
        const watchlists = get().watchlists;
        const watchlistIndex = watchlists.findIndex(w => w.id === watchlistId);
        
        if (watchlistIndex === -1) return false;
        
        const watchlist = watchlists[watchlistIndex];
        if (watchlist.symbols.includes(symbol)) return true;
        
        const updatedWatchlists = [...watchlists];
        updatedWatchlists[watchlistIndex] = {
          ...watchlist,
          symbols: [...watchlist.symbols, symbol]
        };
        
        set({ watchlists: updatedWatchlists });
        return true;
      },
      
      removeFromWatchlist: (watchlistId, symbol) => {
        const watchlists = get().watchlists;
        const watchlistIndex = watchlists.findIndex(w => w.id === watchlistId);
        
        if (watchlistIndex === -1) return false;
        
        const watchlist = watchlists[watchlistIndex];
        if (!watchlist.symbols.includes(symbol)) return true;
        
        const updatedWatchlists = [...watchlists];
        updatedWatchlists[watchlistIndex] = {
          ...watchlist,
          symbols: watchlist.symbols.filter(s => s !== symbol)
        };
        
        set({ watchlists: updatedWatchlists });
        return true;
      },
      
      createWatchlist: (name) => {
        const id = Date.now().toString();
        const newWatchlist = {
          id,
          name,
          symbols: []
        };
        
        set({ watchlists: [...get().watchlists, newWatchlist] });
        return id;
      },
      
      deleteWatchlist: (id) => {
        // Don't allow deleting the default watchlist
        if (id === 'default') return false;
        
        const watchlists = get().watchlists;
        const updatedWatchlists = watchlists.filter(w => w.id !== id);
        
        if (updatedWatchlists.length === watchlists.length) return false;
        
        set({ watchlists: updatedWatchlists });
        return true;
      }
    }),
    {
      name: 'trade-hybrid-user-storage',
      partialize: (state) => ({
        // Don't persist sensitive information
        isAuthenticated: state.isAuthenticated,
        user: {
          id: state.user.id,
          username: state.user.username,
          email: state.user.email,
          firstName: state.user.firstName,
          lastName: state.user.lastName,
          avatar: state.user.avatar,
          joinDate: state.user.joinDate,
          lastLogin: state.user.lastLogin,
          role: state.user.role,
          walletAddress: state.user.walletAddress,
          walletAuthEnabled: state.user.walletAuthEnabled
          // Note: walletSignature is intentionally not persisted for security
        },
        demoBalances: state.demoBalances,
        tradeHistory: state.tradeHistory,
        // Don't persist API keys and sensitive broker data
        brokerConnections: state.brokerConnections.map(conn => ({
          ...conn,
          apiKey: '', // Clear sensitive data
          secretKey: '',
          accountId: ''
        })),
        preferences: state.preferences,
        notifications: state.notifications,
        watchlists: state.watchlists
      })
    }
  )
);

// Export a hook to use the theme from anywhere
export const useTheme = () => {
  const theme = useUserStore(state => state.preferences.theme);
  const updatePreferences = useUserStore(state => state.updatePreferences);
  
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    updatePreferences({ theme: newTheme });
  };
  
  return { theme, toggleTheme };
};