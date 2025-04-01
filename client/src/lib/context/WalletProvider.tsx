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
  // Set up endpoint (devnet)
  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);

  // Set up wallet adapters
  const wallets = useMemo(() => {
    const phantom = new PhantomWalletAdapter();
    console.log("Initializing wallets, Phantom available:", phantom.ready);
    return [phantom];
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

// We don't need this anymore as we are using SolanaWalletProvider
export default WalletProvider;