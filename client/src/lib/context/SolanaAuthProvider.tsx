import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import bs58 from 'bs58';
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
      // Try connecting with window.phantom approach first (modern method)
      if (typeof window !== 'undefined' && window.phantom?.solana) {
        try {
          console.log('Detected Phantom wallet via window.phantom.solana, attempting direct connection...');
          const phantomWallet = window.phantom?.solana;
          
          if (!phantomWallet.isConnected) {
            const resp = await phantomWallet.connect();
            console.log('Direct Phantom connection successful:', resp.publicKey.toString());
            
            // Give wallet adapter context time to update
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } catch (directConnectErr) {
          console.warn('Direct Phantom connection failed, falling back to adapter:', directConnectErr);
          // Continue with wallet adapter approach
        }
      }
      
      // Continue with wallet adapter approach if we're still not connected
      if (!walletConnected) {
        console.log('Wallet adapter not connected, attempting to connect via adapter...');
        
        // Check if wallet adapter is installed
        if (typeof window !== 'undefined' && !window.solana && !window.phantom?.solana) {
          setError('Phantom wallet extension not detected. Please install the Phantom wallet browser extension and reload the page.');
          console.error('Phantom wallet extension not detected');
          return false;
        }
        
        // Check if wallet is available through adapter
        if (!wallet.wallet) {
          console.log('Wallet not selected in adapter, attempting to select Phantom...');
          try {
            // Try multiple wallet selection approaches to increase compatibility
            if (wallet.wallets && wallet.wallets.length > 0) {
              // Find Phantom wallet in the list if available
              const phantomWallet = wallet.wallets.find(w => 
                w.adapter.name.toLowerCase().includes('phantom')
              );
              
              if (phantomWallet) {
                console.log('Found Phantom wallet in wallet list, selecting...');
                await wallet.select(phantomWallet.adapter.name);
              } else {
                console.log('Phantom wallet not found in list, trying default method...');
                // Try generic method if we can't find Phantom specifically
                await wallet.select('phantom' as any);
              }
            } else {
              // Fallback to direct method
              console.log('No wallet list available, using direct select method...');
              await wallet.select('phantom' as any);
            }
          } catch (selectErr) {
            console.error('Error selecting wallet:', selectErr);
            setError('Unable to select wallet. Please make sure Phantom is installed and try again.');
            return false;
          }
        }
        
        try {
          console.log('Attempting to connect to selected wallet via adapter...');
          await wallet.connect();
        } catch (connectErr) {
          console.error('Error connecting to wallet via adapter:', connectErr);
          setError('Unable to connect to wallet. Please make sure Phantom is unlocked and try again.');
          return false;
        }
      }
      
      // Try to get public key from multiple sources
      const adapterPublicKey = wallet.publicKey?.toString();
      const directPublicKey = window.phantom?.solana?.publicKey?.toString();
      const legacyPublicKey = window.solana?.publicKey?.toString();
      
      console.log('Public key sources:', {
        adapter: adapterPublicKey,
        direct: directPublicKey,
        legacy: legacyPublicKey
      });
      
      if (!wallet.connected && !adapterPublicKey && !directPublicKey && !legacyPublicKey) {
        console.error('Wallet seems connected but no public key is available from any source');
        setError('Failed to establish a proper connection with your wallet. Please try refreshing the page.');
        return false;
      }
      
      console.log('Wallet connected successfully with public key:', adapterPublicKey || directPublicKey || legacyPublicKey);
      
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