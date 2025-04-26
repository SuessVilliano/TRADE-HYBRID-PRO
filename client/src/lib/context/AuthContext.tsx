
import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { authService } from '../services/auth-service';

// Define a more structured user type
interface User {
  id: number;
  username: string;
  email: string;
  walletAddress?: string | null;
  profileImage?: string | null;
  authenticated: boolean;
  membershipLevel: string;
  membershipExpiresAt?: string;
  isAdmin?: boolean;
  whopId?: string;
  whopPlanId?: string;
  whopProductId?: string;
  hasConnectedApis?: boolean;
  isTokenHolder?: boolean;
  features?: {
    trade: boolean;
    journal: boolean;
    metaverse: boolean;
    learn: boolean;
    signals: boolean;
    leaderboard: boolean;
    bots: boolean;
    news: boolean;
    profile: boolean;
    settings: boolean;
    staking: boolean;
    validator: boolean;
    aiSignals: boolean;
    multiExchange: boolean;
    customizableUi: boolean;
    advancedAnalytics: boolean;
    solarisCrypto: boolean;
    paradoxForex: boolean;
    tradingWorkspace: boolean;
  };
}

interface AuthContextType {
  isAuthenticated: boolean;
  currentUser: User | null;
  user: User | null; // Adding user as alias for currentUser for backward compatibility
  membershipLevel: string;
  isPaidUser: boolean;
  isProUser: boolean;
  login: (whopId: string) => Promise<any>;
  loginWithDemo: () => Promise<any>;
  getCurrentUser: () => Promise<any>;
  logout: () => Promise<void>;
  hasAccess: (feature: string) => boolean;
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
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  // Get membership level from current user
  const membershipLevel = currentUser?.membershipLevel || 'free';
  
  // Determine if user has paid access
  const isPaidUser: boolean = Boolean(currentUser && ['paid', 'beginner', 'intermediate', 'advanced', 'expert', 'pro', 'admin', 'demo'].includes(membershipLevel));
  
  // Determine if user has pro access
  const isProUser: boolean = Boolean(currentUser && ['pro', 'admin', 'demo'].includes(membershipLevel));

  // Function to check if user has access to a specific feature
  const hasAccess = (feature: string): boolean => {
    // Demo users have access to everything
    if (membershipLevel === 'demo') return true;
    
    // Admin users have access to everything
    if (currentUser?.isAdmin) return true;
    
    // User has explicit access to this feature
    if (currentUser?.features && feature in currentUser.features) {
      return currentUser.features[feature as keyof typeof currentUser.features];
    }
    
    // Default feature access based on membership level
    const basicFeatures = ['trade', 'journal', 'learn', 'profile', 'settings'];
    const paidFeatures = [...basicFeatures, 'signals', 'leaderboard', 'news'];
    const advancedFeatures = [...paidFeatures, 'bots', 'paradoxForex', 'staking'];
    const proFeatures = [...advancedFeatures, 'validator', 'aiSignals', 'multiExchange', 'customizableUi', 'advancedAnalytics', 'solarisCrypto', 'tradingWorkspace', 'metaverse'];
    
    if (basicFeatures.includes(feature)) {
      return true; // All users have access to basic features
    }
    
    if (paidFeatures.includes(feature)) {
      return isPaidUser; // Paid users have access to paid features
    }
    
    if (advancedFeatures.includes(feature)) {
      return ['intermediate', 'advanced', 'expert', 'pro', 'admin'].includes(membershipLevel);
    }
    
    if (proFeatures.includes(feature)) {
      return isProUser; // Pro users have access to pro features
    }
    
    return false; // Default deny for unknown features
  };

  // Check for existing authentication on mount
  useEffect(() => {
    const authTimeoutRef = setTimeout(() => {
      console.error('Auth check timed out - resetting state');
      setIsAuthenticated(false);
      setCurrentUser(null);
    }, 15000); // 15 second timeout
    
    const checkAuth = async () => {
      try {
        // Check for demo user in localStorage
        const demoUser = localStorage.getItem('demoUser');
        if (demoUser) {
          try {
            const parsedUser = JSON.parse(demoUser);
            setCurrentUser({
              ...parsedUser,
              membershipLevel: 'demo' // Ensure demo users have demo membership level
            });
            setIsAuthenticated(true);
            clearTimeout(authTimeoutRef);
            return;
          } catch (parseError) {
            console.error('Failed to parse demo user:', parseError);
            localStorage.removeItem('demoUser'); // Remove corrupt data
          }
        }
        
        // Otherwise check for server-side auth with a timeout
        try {
          const userData = await Promise.race([
            authService.getCurrentUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Auth check timed out')), 10000)
            )
          ]);
          
          if (userData && userData.authenticated) {
            setCurrentUser(userData);
            setIsAuthenticated(true);
          } else {
            // No user found or not authenticated
            setIsAuthenticated(false);
            setCurrentUser(null);
          }
        } catch (serverError) {
          console.error('Server auth check failed:', serverError);
          setIsAuthenticated(false);
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
        setCurrentUser(null);
      } finally {
        clearTimeout(authTimeoutRef);
      }
    };
    
    checkAuth();
    
    // Cleanup function
    return () => {
      clearTimeout(authTimeoutRef);
    };
  }, []);

  const value = {
    isAuthenticated,
    currentUser,
    user: currentUser, // Add user as alias for currentUser
    membershipLevel,
    isPaidUser,
    isProUser,
    hasAccess,
    
    login: async (whopId: string) => {
      try {
        console.log('Starting login process with Whop ID:', whopId);
        
        // First try direct Whop authentication
        try {
          console.log('Attempting direct Whop authentication...');
          const userData = await Promise.race([
            authService.loginWithWhop(whopId),
            // Add a timeout to prevent hanging authentication
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Whop authentication timed out')), 10000)
            )
          ]) as User;
          
          console.log('Direct Whop authentication successful');
          setCurrentUser(userData);
          setIsAuthenticated(true);
          return userData;
        } catch (whopError) {
          // Detailed logging of the Whop authentication failure
          console.log('Direct Whop auth failed, error:', whopError);
          console.log('Falling back to regular login...');
          
          // Fallback to regular login if direct auth fails
          const userData = await Promise.race([
            authService.login(whopId),
            // Add a timeout to prevent hanging authentication
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Login timed out')), 10000)
            )
          ]) as User;
          
          console.log('Regular login authentication successful');
          setCurrentUser(userData);
          setIsAuthenticated(true);
          return userData;
        }
      } catch (error) {
        console.error('All login attempts failed:', error);
        throw error; // Re-throw to handle in the UI
      }
    },
    
    loginWithDemo: async () => {
      try {
        console.log('Starting demo login process...');
        
        // Simulate a brief network delay for realism
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Create demo user data that matches the User interface
        const demoUser: User = {
          id: 1,
          username: 'demo_user',
          email: 'demo@tradehybrid.com',
          membershipLevel: 'demo',
          authenticated: true,
          membershipExpiresAt: '2030-01-01',
          isAdmin: true,
          walletAddress: '0xDemoWalletAddress',
          profileImage: '/images/default-avatar.png',
          hasConnectedApis: true,
          isTokenHolder: true,
          features: {           
            trade: true,
            journal: true,
            metaverse: true,
            learn: true,
            signals: true,
            leaderboard: true,
            bots: true,
            news: true,
            profile: true,
            settings: true,
            staking: true,
            validator: true,
            aiSignals: true,
            multiExchange: true,
            customizableUi: true,
            advancedAnalytics: true,
            solarisCrypto: true,
            paradoxForex: true,
            tradingWorkspace: true
          }
        };
        
        // Store in localStorage
        localStorage.setItem('demoUser', JSON.stringify(demoUser));
        
        // Update state
        setCurrentUser(demoUser);
        setIsAuthenticated(true);
        
        console.log('Demo login successful, user data:', demoUser);
        
        return demoUser;
      } catch (error) {
        console.error('Demo login process failed:', error);
        throw new Error('Demo login failed unexpectedly');
      }
    },
    
    getCurrentUser: async () => {
      // Check for demo user in localStorage first
      const demoUser = localStorage.getItem('demoUser');
      if (demoUser) {
        try {
          const parsedUser = JSON.parse(demoUser) as User;
          // Make sure all required User properties are available
          if (!parsedUser.membershipLevel) {
            parsedUser.membershipLevel = 'demo';
          }
          setCurrentUser(parsedUser);
          setIsAuthenticated(true);
          return parsedUser;
        } catch (error) {
          console.error('Failed to parse demo user:', error);
          localStorage.removeItem('demoUser'); // Remove invalid demo user data
        }
      }
      
      // Otherwise check server
      try {
        const userData = await authService.getCurrentUser();
        if (userData && userData.authenticated) {
          // Ensure required fields for User interface
          if (!userData.membershipLevel) {
            userData.membershipLevel = userData.membership || 'free';
          }
          setCurrentUser(userData as User);
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
