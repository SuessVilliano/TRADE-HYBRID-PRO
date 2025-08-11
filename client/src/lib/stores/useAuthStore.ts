
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
  walletAddress?: string;
  membershipLevel?: string;
  thcTokenHolder?: boolean;
  hasConnectedApis?: boolean;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  setUser: (user: UserData | null) => void;
  login: (user: UserData) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      login: (user) => set({ user, isAuthenticated: true, error: null }),
      logout: () => set({ user: null, isAuthenticated: false, error: null }),
      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
