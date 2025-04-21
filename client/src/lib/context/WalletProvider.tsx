import React, { FC, ReactNode, useMemo } from 'react';
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
  // Set up endpoint to mainnet-beta for validator staking
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  
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