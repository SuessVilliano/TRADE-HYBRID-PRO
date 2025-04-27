import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserState {
  user: {
    id?: string;
    username?: string;
    email?: string;
    membershipLevel?: 'free' | 'basic' | 'premium' | 'institutional';
    authenticated: boolean;
  };
  isLoading: boolean;
  error: string | null;
  walletConnected: boolean;
  walletAddress?: string;
  walletProvider?: 'phantom' | 'web3auth' | 'slope' | 'solflare' | 'other';
  
  // Actions
  setUser: (user: any) => void;
  setWallet: (walletInfo: { address: string; provider: string }) => void;
  disconnectWallet: () => void;
  logout: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: {
        authenticated: false,
      },
      isLoading: false,
      error: null,
      walletConnected: false,
      
      // Actions
      setUser: (user) => set({
        user: {
          ...user,
          authenticated: true,
        },
        error: null,
      }),
      
      setWallet: (walletInfo) => set({
        walletConnected: true,
        walletAddress: walletInfo.address,
        walletProvider: walletInfo.provider as any,
        error: null,
      }),
      
      disconnectWallet: () => set({
        walletConnected: false,
        walletAddress: undefined,
        walletProvider: undefined,
      }),
      
      logout: () => set({
        user: {
          authenticated: false,
        },
        walletConnected: false,
        walletAddress: undefined,
        walletProvider: undefined,
      }),
      
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'trade-hybrid-user-store',
      partialize: (state) => ({
        user: state.user,
        walletConnected: state.walletConnected,
        walletAddress: state.walletAddress,
        walletProvider: state.walletProvider,
      }),
    }
  )
);