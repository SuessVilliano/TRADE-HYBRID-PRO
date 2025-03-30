
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UserData {
  id: number;
  username: string;
  email: string;
  avatar?: string;
  balance: number;
}

interface AuthState {
  user: UserData | null;
  isAuthenticated: boolean;
  setUser: (user: UserData | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      logout: () => set({ user: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
    }
  )
);
