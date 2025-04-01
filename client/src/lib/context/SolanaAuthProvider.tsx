import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import axios from 'axios';

// Membership tiers for THC staking
export enum MembershipTier {
  NONE = 0,
  BASIC = 1,
  ADVANCED = 2,
  PREMIUM = 3,
  ELITE = 4
}

// Membership interface
interface TokenMembership {
  tier: MembershipTier;
  balance: number;
  expiry: Date | null;
}

interface SolanaAuthContextType {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  walletConnected: boolean;
  userId: number | null;
  username: string | null;
  error: string | null;
  tokenMembership?: TokenMembership; // Add this for membership tier functionality
  connectAndAuthenticate: () => Promise<boolean | void>; // Allow for both return types
  logout: () => Promise<boolean>; 
  linkWalletToUser: (userId: number) => Promise<boolean>;
  authenticateWithCredentials: (username: string, password: string) => Promise<boolean>;
}

const SolanaAuthContext = createContext<SolanaAuthContextType | undefined>(undefined);

export function useSolanaAuth() {
  const context = useContext(SolanaAuthContext);
  if (!context) {
    throw new Error('useSolanaAuth must be used within a SolanaAuthProvider');
  }
  return context;
}

interface SolanaAuthProviderProps {
  children: ReactNode;
}

export function SolanaAuthProvider({ children }: SolanaAuthProviderProps) {
  const wallet = useWallet();
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userId, setUserId] = useState<number | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const walletConnected = wallet.connected && !!wallet.publicKey;
  
  // Check if user is already authenticated
  useEffect(() => {
    async function checkAuthentication() {
      try {
        const response = await axios.get('/api/auth/user');
        if (response.data.authenticated) {
          setIsAuthenticated(true);
          setUserId(response.data.userId);
          setUsername(response.data.username);
        }
      } catch (error) {
        console.error('Failed to check authentication status', error);
      }
    }
    
    checkAuthentication();
  }, []);
  
  // Connect wallet and authenticate
  const connectAndAuthenticate = async () => {
    if (!wallet.connected) {
      try {
        setIsAuthenticating(true);
        setError(null);
        
        // Connect wallet if not connected
        if (wallet.connect && wallet.publicKey === null) {
          await wallet.connect();
        }
        
        // Check if wallet is connected after attempt
        if (!wallet.connected || !wallet.publicKey) {
          throw new Error('Failed to connect wallet');
        }
        
        // Sign message to authenticate
        const walletAddress = wallet.publicKey.toString();
        console.log('Connected wallet address:', walletAddress);
        
        // Authenticate with the server
        const response = await axios.post('/api/auth/wallet-login', {
          walletAddress,
        });
        
        if (response.data.success) {
          setIsAuthenticated(true);
          setUserId(response.data.userId);
          setUsername(response.data.username);
        } else {
          throw new Error(response.data.error || 'Authentication failed');
        }
      } catch (err: any) {
        console.error('Authentication error:', err);
        setError(err.message || 'Authentication failed');
        setIsAuthenticated(false);
      } finally {
        setIsAuthenticating(false);
      }
    }
  };
  
  // Link wallet to existing user account
  const linkWalletToUser = async (userId: number) => {
    try {
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Wallet not connected');
      }
      
      const walletAddress = wallet.publicKey.toString();
      const response = await axios.post('/api/identity/link-wallet', {
        userId,
        walletAddress,
      });
      
      return response.data.success;
    } catch (err: any) {
      console.error('Error linking wallet:', err);
      setError(err.message || 'Failed to link wallet');
      return false;
    }
  };
  
  // Authenticate with username and password
  const authenticateWithCredentials = async (username: string, password: string) => {
    try {
      setIsAuthenticating(true);
      setError(null);
      
      const response = await axios.post('/api/auth/login', {
        username,
        password,
      });
      
      if (response.data.success) {
        setIsAuthenticated(true);
        setUserId(response.data.userId);
        setUsername(response.data.username);
        return true;
      } else {
        throw new Error(response.data.error || 'Authentication failed');
      }
    } catch (err: any) {
      console.error('Authentication error:', err);
      setError(err.message || 'Authentication failed');
      setIsAuthenticated(false);
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Logout
  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
      
      if (wallet.disconnect) {
        await wallet.disconnect();
      }
      
      setIsAuthenticated(false);
      setUserId(null);
      setUsername(null);
      return true;
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Logout failed');
      return false;
    }
  };
  
  // Add minimal tokenMembership object for display purposes
  const mockTokenMembership: TokenMembership = {
    tier: MembershipTier.BASIC,
    balance: 500,
    expiry: null
  };

  const contextValue: SolanaAuthContextType = {
    isAuthenticating,
    isAuthenticated,
    walletConnected,
    userId,
    username,
    error,
    tokenMembership: mockTokenMembership, // Add this to fix missing property
    connectAndAuthenticate,
    logout,
    linkWalletToUser,
    authenticateWithCredentials,
  };
  
  return (
    <SolanaAuthContext.Provider value={contextValue}>
      {children}
    </SolanaAuthContext.Provider>
  );
}