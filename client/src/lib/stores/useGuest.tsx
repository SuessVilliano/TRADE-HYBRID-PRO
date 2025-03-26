import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuestState {
  isGuest: boolean;
  isLoggedIn: boolean;
  guestId: string;
  guestUsername: string;
  
  // Profile
  hasAccess: {
    tradingSpace: boolean;
    signalTowers: boolean;
    tradeHouse: boolean;
    fullTrading: boolean;
  };
  
  // Actions
  login: () => void;
  logout: () => void;
  grantAccess: (area: keyof GuestState['hasAccess']) => void;
  
  // Helpers
  canAccess: (area: keyof GuestState['hasAccess']) => boolean;
}

// List of adjectives for generating guest names
const ADJECTIVES = [
  'Swift', 'Smart', 'Quick', 'Bold', 'Bright', 
  'Clever', 'Eager', 'Fresh', 'Keen', 'Lively',
  'Nimble', 'Sharp', 'Vital', 'Wise', 'Active'
];

// List of trading-related nouns for generating guest names
const NOUNS = [
  'Trader', 'Investor', 'Bull', 'Bear', 'Chart',
  'Candlestick', 'Market', 'Stock', 'Crypto', 'Forex',
  'Signal', 'Portfolio', 'Analyst', 'Broker', 'Exchange'
];

// Generate a random guest name
const generateGuestName = (): string => {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  return `${adjective}${noun}`;
};

// Generate a random guest ID
const generateGuestId = (): string => {
  return Math.random().toString(36).substring(2, 10);
};

// Create the guest store with persistence
export const useGuest = create<GuestState>()(
  persist(
    (set, get) => ({
      isGuest: true,
      isLoggedIn: false,
      guestId: generateGuestId(),
      guestUsername: generateGuestName(),
      
      // Default access permissions for guests
      hasAccess: {
        tradingSpace: true,      // Can access main trading space
        signalTowers: false,     // Cannot access signal towers
        tradeHouse: false,       // Cannot access trade house
        fullTrading: false,      // Cannot access full trading features
      },
      
      // Login as registered user - this grants access to all areas
      login: () => set({ 
        isGuest: false, 
        isLoggedIn: true,
        hasAccess: {
          tradingSpace: true,
          signalTowers: true,
          tradeHouse: true,
          fullTrading: true,
        }
      }),
      
      // Logout back to guest with restricted access
      logout: () => set({
        isGuest: true,
        isLoggedIn: false,
        guestId: generateGuestId(),
        guestUsername: generateGuestName(),
        hasAccess: {
          tradingSpace: true,
          signalTowers: false,
          tradeHouse: false,
          fullTrading: false,
        }
      }),
      
      // Grant access to specific area
      grantAccess: (area) => set((state) => ({
        hasAccess: {
          ...state.hasAccess,
          [area]: true
        }
      })),
      
      // Helper to check if user can access an area
      // This handles both guest access restrictions and logged-in permissions
      canAccess: (area) => {
        const state = get();
        
        // Logged-in users always have access to the trading space
        if (area === 'tradingSpace') return true;
        
        // Non-guests (logged in users) have access to everything
        if (!state.isGuest) return true;
        
        // Otherwise check the specific permission
        return state.hasAccess[area];
      }
    }),
    {
      name: 'trade-hybrid-guest',
    }
  )
);