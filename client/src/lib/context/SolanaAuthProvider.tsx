import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
// Replace direct bs58 import with a browser-compatible approach
import useLocalStorage from '../hooks/useLocalStorage';

// Add interface to detect Solana in window
interface SolanaWallet {
  isPhantom?: boolean;
  isConnected?: boolean;
  publicKey?: { toString(): string };
  connect: () => Promise<{ publicKey: string }>;
  disconnect: () => Promise<void>;
  signMessage?: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  signTransaction?: (transaction: any) => Promise<any>;
}

interface PhantomProvider {
  solana?: SolanaWallet;
}

// Extend Window interface
declare global {
  interface Window {
    solana?: SolanaWallet;
    phantom?: PhantomProvider;
  }
}

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
  isWalletAuthenticated: boolean; // Added for backward compatibility
  isAuthenticating: boolean;
  username: string | null;
  walletAddress: string | null; // Added for NFT marketplace
  publicKey?: string | null; // For compatibility with wallet.publicKey
  tokenMembership: TokenMembership | null;
  login: () => Promise<boolean>;
  logout: () => Promise<void>;
  logoutFromSolana: () => Promise<void>; // Added for NFT marketplace
  loginWithSolana: () => Promise<boolean>; // Added for NFT marketplace
  error: string | null;
  connectAndAuthenticate: () => Promise<boolean>;
  authenticateWithCredentials: (username: string, password: string) => Promise<boolean>;
}

// Create context with default values
const SolanaAuthContext = createContext<SolanaAuthContextType>({
  walletConnected: false,
  isAuthenticated: false,
  isWalletAuthenticated: false,
  isAuthenticating: false,
  username: null,
  walletAddress: null,
  publicKey: null,
  tokenMembership: null,
  login: async () => false,
  logout: async () => {},
  logoutFromSolana: async () => {},
  loginWithSolana: async () => false,
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
  // Set wallet address from the connected wallet
  const walletAddress = wallet.publicKey?.toString() || null;

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
      
      // Use a browser-compatible method to encode the signature
      // Convert Uint8Array to hex string instead of using bs58
      const signature = Array.from(signedMessage)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      
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
  
  // Logout from Solana wallet
  const logoutFromSolana = async (): Promise<void> => {
    try {
      // Disconnect the wallet
      if (wallet.wallet && wallet.connected) {
        await wallet.disconnect();
      }
      
      // Clear authentication state
      setAuthToken(null);
      setIsAuthenticated(false);
      setUsername(null);
      setTokenMembership(null);
    } catch (err) {
      console.error('Error disconnecting wallet:', err);
      setError('Failed to disconnect wallet. Please try again.');
    }
  };
  
  // Login specifically with Solana wallet
  const loginWithSolana = async (): Promise<boolean> => {
    try {
      if (!walletConnected) {
        // First connect the wallet
        const connected = await connectAndAuthenticate();
        return connected;
      } else {
        // If already connected, just authenticate
        return await login();
      }
    } catch (err) {
      console.error('Error logging in with Solana:', err);
      setError(err instanceof Error ? err.message : 'Failed to login with Solana wallet');
      return false;
    }
  };
  
  // Connect wallet and authenticate
  const connectAndAuthenticate = async (): Promise<boolean> => {
    setIsAuthenticating(true);
    setError(null);
    
    try {
      console.log('Starting wallet connection process...');
      
      // First check if Phantom is available
      const isPhantomInstalled = 
        (typeof window !== 'undefined' && window.phantom?.solana) || 
        (typeof window !== 'undefined' && window.solana?.isPhantom);
      
      if (!isPhantomInstalled) {
        console.error('Phantom wallet extension not detected');
        setError('Phantom wallet extension not detected. Please install the Phantom wallet browser extension and reload the page.');
        return false;
      }
      
      // Try using wallet adapter first (preferred method)
      if (!walletConnected && wallet) {
        try {
          if (!wallet.wallet && wallet.wallets && wallet.select) {
            // Find and select Phantom
            const phantomWallet = wallet.wallets.find(w => 
              w.adapter.name.toLowerCase().includes('phantom')
            );
            
            if (phantomWallet) {
              console.log('Found Phantom wallet in adapter list, selecting...');
              await wallet.select(phantomWallet.adapter.name);
            }
          }
          
          // Connect to wallet if it's available but not connected
          if (wallet.wallet && !wallet.connected) {
            console.log('Connecting via wallet adapter...');
            await wallet.connect();
            console.log('Wallet adapter connection successful');
            
            // Give the wallet connection time to stabilize
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } catch (adapterError) {
          console.error('Error connecting via wallet adapter:', adapterError);
          // Fall through to direct connection methods
        }
      }
      
      // If wallet adapter didn't work, try direct connection
      if (!wallet.connected && typeof window !== 'undefined') {
        try {
          // Try modern method first
          if (window.phantom?.solana && !window.phantom.solana.isConnected) {
            console.log('Attempting direct connection via window.phantom.solana...');
            const resp = await window.phantom.solana.connect();
            console.log('Direct Phantom connection successful:', resp.publicKey.toString());
            
            // Synchronize state with the adapter
            await new Promise(resolve => setTimeout(resolve, 800));
          } 
          // Try legacy method as fallback
          else if (window.solana?.isPhantom && !window.solana.isConnected) {
            console.log('Attempting legacy connection via window.solana...');
            const resp = await window.solana.connect();
            console.log('Legacy Phantom connection successful');
            
            // Synchronize state with the adapter
            await new Promise(resolve => setTimeout(resolve, 800));
          }
        } catch (directError) {
          console.error('Error with direct wallet connection:', directError);
          setError('Unable to connect to Phantom wallet. Please ensure Phantom is unlocked and try again.');
          return false;
        }
      }
      
      // Check connection status from multiple sources
      const isAdapterConnected = wallet.connected && wallet.publicKey !== null;
      const isDirectConnected = window.phantom?.solana?.isConnected || false;
      const isLegacyConnected = window.solana?.isConnected || false;
      
      console.log('Connection status check:', {
        adapter: isAdapterConnected,
        direct: isDirectConnected,
        legacy: isLegacyConnected
      });
      
      // Get public key from available sources
      const adapterPublicKey = wallet.publicKey?.toString();
      const directPublicKey = window.phantom?.solana?.publicKey?.toString();
      const legacyPublicKey = window.solana?.publicKey?.toString();
      
      console.log('Public keys available:', {
        adapter: adapterPublicKey ? `${adapterPublicKey.slice(0, 4)}...${adapterPublicKey.slice(-4)}` : null,
        direct: directPublicKey ? `${directPublicKey.slice(0, 4)}...${directPublicKey.slice(-4)}` : null,
        legacy: legacyPublicKey ? `${legacyPublicKey.slice(0, 4)}...${legacyPublicKey.slice(-4)}` : null
      });
      
      // Verify we have a successful connection
      if (!isAdapterConnected && !isDirectConnected && !isLegacyConnected) {
        console.error('Failed to connect to wallet through any available method');
        setError('Failed to connect to your wallet. Please ensure Phantom is unlocked and try again.');
        return false;
      }
      
      // Connection successful!
      console.log('Wallet connection successful!');
      
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
  
  // For backward compatibility
  const isWalletAuthenticated = isAuthenticated && walletConnected;
  
  return (
    <SolanaAuthContext.Provider
      value={{
        walletConnected,
        isAuthenticated,
        isWalletAuthenticated,
        isAuthenticating,
        username,
        walletAddress,
        publicKey: walletAddress, // Expose as publicKey too for compatibility
        tokenMembership,
        login,
        logout,
        logoutFromSolana,
        loginWithSolana,
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