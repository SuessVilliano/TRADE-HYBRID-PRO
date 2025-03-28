import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar: string;
  createdAt: Date;
  balance: {
    USD: number;
    THC: number;
    ETH?: number;
    USDT?: number;
  };
  wallet?: {
    address: string;
    type: string;
    network: string;
  };
  tradingExperience: 'beginner' | 'intermediate' | 'advanced';
  biography: string;
  socialLinks: {
    twitter?: string;
    discord?: string;
    telegram?: string;
  };
  preferences: {
    darkMode: boolean;
    notifications: boolean;
    sounds: boolean;
    showTutorials: boolean;
  };
  achievements: {
    id: string;
    name: string;
    description: string;
    unlockedAt: Date;
    icon: string;
  }[];
  statistics: {
    tradesCompleted: number;
    winRate: number;
    averageProfit: number;
    largestWin: number;
    largestLoss: number;
    totalProfit: number;
  };
  favoriteSymbols: string[];
  activeBots: string[];
  badges: {
    id: string;
    name: string;
    icon: string;
  }[];
  level: number;
  experience: number;
  nextLevelExperience: number;
  isVerified: boolean;
  roles: string[];
}

interface UserState {
  user: UserProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  fetchUserData: () => Promise<void>;
  addFavoriteSymbol: (symbol: string) => void;
  removeFavoriteSymbol: (symbol: string) => void;
  updateBalance: (currency: 'USD' | 'THC', amount: number) => void;
  awardAchievement: (achievement: UserProfile['achievements'][0]) => void;
  addExperience: (amount: number) => void;
  togglePreference: (preference: keyof UserProfile['preferences']) => void;
}

// Mock initial user data for development purposes
const mockUser: UserProfile = {
  id: '1234567890',
  username: 'crypto_trader',
  email: 'trader@example.com',
  avatar: '/images/avatars/default.png',
  createdAt: new Date('2023-01-01'),
  balance: {
    USD: 10000,
    THC: 5000,
    ETH: 1.5,
    USDT: 2500,
  },
  wallet: {
    address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
    type: 'MetaMask',
    network: 'Ethereum',
  },
  tradingExperience: 'intermediate',
  biography: 'Passionate crypto trader focused on technical analysis and swing trading strategies.',
  socialLinks: {
    twitter: 'crypto_trader',
    discord: 'crypto_trader#1234',
  },
  preferences: {
    darkMode: true,
    notifications: true,
    sounds: true,
    showTutorials: true,
  },
  achievements: [
    {
      id: 'first-trade',
      name: 'First Trade',
      description: 'Completed your first trade',
      unlockedAt: new Date('2023-01-02'),
      icon: '🎯',
    },
    {
      id: 'profitable-week',
      name: 'Profitable Week',
      description: 'Achieved positive returns for an entire week',
      unlockedAt: new Date('2023-01-09'),
      icon: '📈',
    },
  ],
  statistics: {
    tradesCompleted: 42,
    winRate: 0.68,
    averageProfit: 320,
    largestWin: 1250,
    largestLoss: -550,
    totalProfit: 5800,
  },
  favoriteSymbols: ['BTCUSD', 'ETHUSD', 'SOLUSDT'],
  activeBots: ['momentum_bot', 'dca_bot'],
  badges: [
    {
      id: 'verified_trader',
      name: 'Verified Trader',
      icon: '✅',
    },
    {
      id: 'diamond_hands',
      name: 'Diamond Hands',
      icon: '💎',
    },
  ],
  level: 5,
  experience: 1250,
  nextLevelExperience: 2000,
  isVerified: true,
  roles: ['trader', 'premium'],
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      user: null, // Use null for initial state in production
      isLoggedIn: false,
      isLoading: false,
      error: null,
      
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          // For now, simulate a successful login with mock data
          await new Promise(resolve => setTimeout(resolve, 800));
          
          set({ user: mockUser, isLoggedIn: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      register: async (email, username, password) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const newUser = { 
            ...mockUser, 
            email,
            username,
            id: Math.random().toString(36).substring(2, 15),
            createdAt: new Date(),
            balance: { USD: 5000, THC: 100 },
            achievements: [],
            statistics: {
              tradesCompleted: 0,
              winRate: 0,
              averageProfit: 0,
              largestWin: 0,
              largestLoss: 0,
              totalProfit: 0,
            },
            level: 1,
            experience: 0,
            nextLevelExperience: 500,
          };
          
          set({ user: newUser, isLoggedIn: true, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      logout: () => {
        set({ user: null, isLoggedIn: false });
      },
      
      updateProfile: async (data) => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 500));
          
          const currentUser = get().user;
          if (!currentUser) throw new Error('User not found');
          
          set({ 
            user: { ...currentUser, ...data },
            isLoading: false,
          });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      fetchUserData: async () => {
        set({ isLoading: true, error: null });
        try {
          // In a real app, we would call an API here
          await new Promise(resolve => setTimeout(resolve, 800));
          
          // For demo, just refresh with mock data
          if (get().isLoggedIn) {
            set({ user: mockUser, isLoading: false });
          } else {
            set({ isLoading: false });
          }
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },
      
      addFavoriteSymbol: (symbol) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        if (!currentUser.favoriteSymbols.includes(symbol)) {
          set({
            user: {
              ...currentUser,
              favoriteSymbols: [...currentUser.favoriteSymbols, symbol],
            },
          });
        }
      },
      
      removeFavoriteSymbol: (symbol) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({
          user: {
            ...currentUser,
            favoriteSymbols: currentUser.favoriteSymbols.filter(s => s !== symbol),
          },
        });
      },
      
      updateBalance: (currency, amount) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({
          user: {
            ...currentUser,
            balance: {
              ...currentUser.balance,
              [currency]: currentUser.balance[currency] + amount,
            },
          },
        });
      },
      
      awardAchievement: (achievement) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        const hasAchievement = currentUser.achievements.some(a => a.id === achievement.id);
        if (hasAchievement) return;
        
        set({
          user: {
            ...currentUser,
            achievements: [...currentUser.achievements, achievement],
          },
        });
      },
      
      addExperience: (amount) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        let newExperience = currentUser.experience + amount;
        let newLevel = currentUser.level;
        let newNextLevelExperience = currentUser.nextLevelExperience;
        
        // Level up if experience exceeds the requirement
        while (newExperience >= newNextLevelExperience) {
          newExperience -= newNextLevelExperience;
          newLevel += 1;
          // Each level needs 20% more experience than the previous
          newNextLevelExperience = Math.floor(newNextLevelExperience * 1.2);
        }
        
        set({
          user: {
            ...currentUser,
            experience: newExperience,
            level: newLevel,
            nextLevelExperience: newNextLevelExperience,
          },
        });
      },
      
      togglePreference: (preference) => {
        const currentUser = get().user;
        if (!currentUser) return;
        
        set({
          user: {
            ...currentUser,
            preferences: {
              ...currentUser.preferences,
              [preference]: !currentUser.preferences[preference],
            },
          },
        });
      },
    }),
    {
      name: 'user-storage', // Name for the persisted store in localStorage
      partialize: (state) => ({ user: state.user, isLoggedIn: state.isLoggedIn }),
    }
  )
);