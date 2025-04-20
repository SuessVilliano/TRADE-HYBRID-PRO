
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { authService } from '../services/auth-service';

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: any | null;
  user: any | null; // Adding user as alias for currentUser for backward compatibility
  login: (whopId: string) => Promise<any>;
  loginWithDemo: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
  logout: () => Promise<void>;
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
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check for demo user in localStorage
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          const parsedUser = JSON.parse(demoUser);
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          return;
        }
        
        // Otherwise check for server-side auth
        const userData = await authService.getCurrentUser();
        if (userData && userData.authenticated) {
          setCurrentUser(userData);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
      }
    };
    
    checkAuth();
  }, []);

  const value = {
    isAuthenticated,
    currentUser,
    user: currentUser, // Add user as alias for currentUser
    
    login: async (whopId: string) => {
      try {
        // First try direct Whop authentication
        const userData = await authService.loginWithWhop(whopId);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return userData;
      } catch (error) {
        // Fallback to regular login if direct auth fails
        console.log('Direct Whop auth failed, falling back to regular login');
        const userData = await authService.login(whopId);
        setCurrentUser(userData);
        setIsAuthenticated(true);
        return userData;
      }
    },
    
    loginWithDemo: async () => {
      // Create demo user data
      const demoUser = {
        id: 1,
        username: 'demo_user',
        email: 'demo@tradehybrid.com',
        membership: 'lifetime',
        isAuthenticated: true,
        authenticated: true,  // Add this property to match server authentication check
        features: {           // Add feature access permissions for the demo user
          trade: true,
          journal: true,
          metaverse: true,
          learn: true,
          signals: true,
          leaderboard: true,
          bots: true,
          news: true,
          profile: true,
          settings: true
        }
      };
      
      // Store in localStorage
      localStorage.setItem('demoUser', JSON.stringify(demoUser));
      
      // Update state
      setCurrentUser(demoUser);
      setIsAuthenticated(true);
      
      console.log('Demo login successful, user data:', demoUser);
      
      return demoUser;
    },
    
    getCurrentUser: async () => {
      // Check for demo user in localStorage first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        const parsedUser = JSON.parse(demoUser);
        setCurrentUser(parsedUser);
        setIsAuthenticated(true);
        return parsedUser;
      }
      
      // Otherwise check server
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.authenticated) {
          setCurrentUser(userData);
          setIsAuthenticated(true);
          return userData;
        }
        return null;
      } catch (error) {
        console.error('Failed to get current user:', error);
        return null;
      }
    },
    
    logout: async () => {
      // Clear demo user if exists
      localStorage.removeItem('demoUser');
      
      // Clear server session
      try {
        await authService.logout();
      } catch (error) {
        console.error('Logout error:', error);
      }
      
      // Update state
      setCurrentUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
