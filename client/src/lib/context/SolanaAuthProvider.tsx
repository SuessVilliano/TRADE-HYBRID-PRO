import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
import { useLocalStorage } from '../hooks/useLocalStorage';

// Define available membership tiers
export enum MembershipTier {
  None = 0,
  Basic = 1,
  Advanced = 2,
  Premium = 3,
  Elite = 4
}

// Define token membership type
export interface TokenMembership {
  tier: MembershipTier;
  balance: number;
  expiry: Date | null; // null means lifetime membership
}

// Define auth context type
export interface SolanaAuthContextType {
  walletConnected: boolean;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  username: string | null;
  tokenMembership: TokenMembership | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  error: string | null;
  connectAndAuthenticate: () => Promise<boolean>;
  authenticateWithCredentials: (username: string, password: string) => Promise<boolean>;
}

// Create context with default values
const SolanaAuthContext = createContext<SolanaAuthContextType>({
  walletConnected: false,
  isAuthenticated: false,
  isAuthenticating: false,
  username: null,
  tokenMembership: null,
  login: async () => false,
  logout: async () => {},
  error: null,
  connectAndAuthenticate: async () => false,
  authenticateWithCredentials: async () => false
});

interface SolanaAuthProviderProps {
  children: ReactNode;
}

export const SolanaAuthProvider: React.FC<SolanaAuthProviderProps> = ({ children }) => {
  const wallet = useWallet();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [tokenMembership, setTokenMembership] = useState<TokenMembership | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Store auth token in local storage
  const [authToken, setAuthToken] = useLocalStorage<string | null>('solana_auth_token', null);
  
  // Check if wallet is connected
  const walletConnected = wallet.connected && wallet.publicKey !== null;

  // Reset auth state when wallet disconnects
  useEffect(() => {
    if (!walletConnected && isAuthenticated) {
      setIsAuthenticated(false);
      setUsername(null);
      setTokenMembership(null);
      setAuthToken(null);
    }
  }, [walletConnected, isAuthenticated, setAuthToken]);
  
  // Try to restore session from token
  useEffect(() => {
    const verifyToken = async () => {
      if (authToken && walletConnected) {
        try {
          // Mock verification for now - in a real app, we'd verify with the server
          setIsAuthenticated(true);
          setUsername('TradeHybridUser');
          
          // Mock token membership data
          setTokenMembership({
            tier: MembershipTier.Premium,
            balance: 1250,
            expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
          });
        } catch (err) {
          console.error('Failed to verify token:', err);
          setAuthToken(null);
          setError('Session expired. Please sign in again.');
        }
      }
    };
    
    verifyToken();
  }, [authToken, walletConnected, setAuthToken]);
  
  // Login function - sign a message with wallet to prove ownership
  const login = async (): Promise<boolean> => {
    if (!walletConnected) {
      setError('Please connect your wallet first');
      return false;
    }
    
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // Create the message to sign
      const message = `Sign this message to authenticate with Trade Hybrid: ${Date.now()}`;
      const encodedMessage = new TextEncoder().encode(message);
      
      // Request signature from wallet
      const signedMessage = await wallet.signMessage?.(encodedMessage);
      
      if (!signedMessage) {
        throw new Error('Failed to sign message');
      }
      
      // Convert signature to base58 for sending to server
      const signature = bs58.encode(signedMessage);
      
      // Mock authentication response - in a real app, we'd verify with the server
      // Here we're just setting the auth state based on having a valid signature
      const mockToken = `mock_token_${Date.now()}`;
      setAuthToken(mockToken);
      setIsAuthenticated(true);
      setUsername('TradeHybridUser');
      
      // Set mock membership data
      setTokenMembership({
        tier: MembershipTier.Premium, 
        balance: 1250,
        expiry: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 days from now
      });
      
      return true;
    } catch (err) {
      console.error('Authentication error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Logout function
  const logout = async (): Promise<void> => {
    setAuthToken(null);
    setIsAuthenticated(false);
    setUsername(null);
    setTokenMembership(null);
  };
  
  // Connect wallet and authenticate
  const connectAndAuthenticate = async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // First try to connect wallet if not already connected
      if (!walletConnected) {
        if (!wallet.wallet) {
          // Using any to bypass type checking temporarily
          await wallet.select('phantom' as any);
        }
        
        await wallet.connect();
      }
      
      if (!wallet.connected || !wallet.publicKey) {
        throw new Error('Failed to connect wallet');
      }
      
      // Now proceed with authentication
      return await login();
    } catch (err) {
      console.error('Connect and authenticate error:', err);
      setError(err instanceof Error ? err.message : 'Failed to connect wallet and authenticate');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  // Authenticate with username and password
  const authenticateWithCredentials = async (username: string, password: string): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      // In a real application, we would make an API call to authenticate
      // For demo purposes, we'll just simulate a successful auth with mock data
      if (username === 'demo' && password === 'password') {
        // Simulate successful authentication
        const mockToken = `credential_auth_${Date.now()}`;
        setAuthToken(mockToken);
        setIsAuthenticated(true);
        setUsername(username);
        
        // Set demo membership data
        setTokenMembership({
          tier: MembershipTier.Basic,
          balance: 250,
          expiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        });
        
        return true;
      } else {
        // Any other credentials will result in an error
        throw new Error('Invalid username or password');
      }
    } catch (err) {
      console.error('Credential authentication error:', err);
      setError(err instanceof Error ? err.message : 'Failed to authenticate with credentials');
      return false;
    } finally {
      setIsAuthenticating(false);
    }
  };
  
  return (
    <SolanaAuthContext.Provider
      value={{
        walletConnected,
        isAuthenticated,
        isAuthenticating,
        username,
        tokenMembership,
        login,
        logout,
        error,
        connectAndAuthenticate,
        authenticateWithCredentials
      }}
    >
      {children}
    </SolanaAuthContext.Provider>
  );
};

// Hook for accessing the auth context
export const useSolanaAuth = () => useContext(SolanaAuthContext);

export default SolanaAuthProvider;