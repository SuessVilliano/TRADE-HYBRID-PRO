import React, { FC, ReactNode, useMemo, useState, useEffect } from 'react';
import { 
  ConnectionProvider, 
  WalletProvider as SolanaWalletProvider 
} from '@solana/wallet-adapter-react';
import { 
  PhantomWalletAdapter 
} from '@solana/wallet-adapter-phantom';
import { 
  WalletModalProvider, 
} from '@solana/wallet-adapter-react-ui';
import { Adapter } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Import wallet adapter stylesheet
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: FC<WalletProviderProps> = ({ children }) => {
  const [rpcEndpoint, setRpcEndpoint] = useState<string>('');
  
  // Set up endpoint to use custom RPC URL if available, otherwise fall back to mainnet-beta
  const endpoint = useMemo(() => {
    // If we have a custom RPC URL from environment variables, use it
    if (rpcEndpoint) {
      return rpcEndpoint;
    }
    // Otherwise fall back to the default mainnet URL
    return clusterApiUrl('mainnet-beta');
  }, [rpcEndpoint]);
  
  // Fetch the RPC URL from environment variables on component mount
  useEffect(() => {
    const fetchRpcUrl = async () => {
      try {
        // Try to get the SOLANA_RPC_URL from the server
        const response = await fetch('/api/config/rpc-url');
        const data = await response.json();
        
        if (data.rpcUrl) {
          console.log('WalletProvider using custom Solana RPC URL');
          setRpcEndpoint(data.rpcUrl);
        } else {
          console.log('WalletProvider: No custom RPC URL found, using default Solana endpoint');
          setRpcEndpoint(clusterApiUrl('mainnet-beta'));
        }
      } catch (error) {
        console.error('WalletProvider: Error fetching RPC URL:', error);
        console.log('WalletProvider: Falling back to default Solana endpoint due to error');
        setRpcEndpoint(clusterApiUrl('mainnet-beta'));
      }
    };
    
    fetchRpcUrl();
  }, []);
  
  console.log('WalletProvider connecting to Solana network:', endpoint);

  // Set up wallet adapters
  const wallets = useMemo(() => {
    const phantom = new PhantomWalletAdapter();
    const phantomAvailable = 
      typeof window !== 'undefined' && 
      'phantom' in window && 
      (window as any).phantom?.solana !== undefined;
      
    console.log("WalletProvider initializing, Phantom available:", phantomAvailable);
    return [phantom] as Adapter[]; // Cast to Adapter[] to satisfy TypeScript
  }, []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

// This component is provided for backwards compatibility
export default WalletProvider;