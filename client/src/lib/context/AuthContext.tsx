
import { createContext, useContext, ReactNode, useState } from 'react';
import { authService } from '../services/auth-service';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (whopId: string) => Promise<any>;
  getCurrentUser: () => Promise<any>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const value = {
    isAuthenticated,
    login: async (whopId: string) => {
      const userData = await authService.login(whopId);
      setIsAuthenticated(true);
      return userData;
    },
    getCurrentUser: async () => {
      const userData = await authService.getCurrentUser();
      setIsAuthenticated(true);
      return userData;
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
