import { useState, useEffect, useCallback } from 'react';

interface UseConnectWalletReturn {
  isConnected: boolean;
  walletAddress: string | null;
  provider: any | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
  isLoading: boolean;
  error: Error | null;
}

export function useConnectWallet(): UseConnectWalletReturn {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [provider, setProvider] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Check if wallet is already connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      try {
        // Check if Phantom wallet is available
        const isPhantomAvailable = 
          window && 
          (window as any).solana && 
          (window as any).solana.isPhantom;
        
        console.log("Phantom wallet availability check:", { 
          exists: isPhantomAvailable, 
          connectMethod: isPhantomAvailable ? typeof (window as any).solana.connect : "N/A" 
        });
        
        if (isPhantomAvailable) {
          const solanaProvider = (window as any).solana;
          
          // Try to auto-connect if previously connected
          if (solanaProvider.isConnected) {
            const publicKey = solanaProvider.publicKey?.toString();
            if (publicKey) {
              setIsConnected(true);
              setWalletAddress(publicKey);
              setProvider(solanaProvider);
            }
          }
        }
      } catch (err) {
        console.error("Error checking wallet connection:", err);
      }
    };
    
    checkWalletConnection();
    
    // Attach event listeners for wallet state changes
    const handleAccountsChanged = (publicKey: string) => {
      if (publicKey) {
        setWalletAddress(publicKey);
        setIsConnected(true);
      } else {
        disconnectWallet();
      }
    };
    
    // Set up event listeners
    if (window && (window as any).solana) {
      (window as any).solana.on('connect', handleAccountsChanged);
      (window as any).solana.on('disconnect', disconnectWallet);
    }
    
    return () => {
      // Clean up event listeners
      if (window && (window as any).solana) {
        (window as any).solana.removeListener('connect', handleAccountsChanged);
        (window as any).solana.removeListener('disconnect', disconnectWallet);
      }
    };
  }, []);

  // Connect wallet function
  const connectWallet = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Check if Phantom is installed
      const isPhantomAvailable = 
        window && 
        (window as any).solana && 
        (window as any).solana.isPhantom;
      
      if (!isPhantomAvailable) {
        throw new Error("Phantom wallet is not installed");
      }
      
      const solanaProvider = (window as any).solana;
      
      // Request connection to the wallet
      await solanaProvider.connect();
      
      // Get the public key (wallet address)
      const publicKey = solanaProvider.publicKey.toString();
      
      // Update state
      setIsConnected(true);
      setWalletAddress(publicKey);
      setProvider(solanaProvider);
      
      return publicKey;
    } catch (err) {
      console.error("Error connecting wallet:", err);
      setError(err instanceof Error ? err : new Error("Failed to connect wallet"));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet function
  const disconnectWallet = useCallback(() => {
    try {
      if (provider && provider.disconnect) {
        provider.disconnect();
      }
      
      setIsConnected(false);
      setWalletAddress(null);
      setProvider(null);
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  }, [provider]);

  return {
    isConnected,
    walletAddress,
    provider,
    connectWallet,
    disconnectWallet,
    isLoading,
    error
  };
}