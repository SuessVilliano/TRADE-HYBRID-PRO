import { 
  FC, 
  ReactNode, 
  useMemo 
} from 'react';
import { 
  ConnectionProvider, 
  WalletProvider 
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { Adapter } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

// Default styles for wallet adapter
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // Set the network to Mainnet for validator staking
  // This is required because our validator is on mainnet
  const endpoint = useMemo(() => clusterApiUrl('mainnet-beta'), []);
  
  console.log('Connecting to Solana network:', endpoint);

  // Initialize the PhantomWalletAdapter
  const wallets = useMemo(
    () => {
      const phantomAvailable = 
        typeof window !== 'undefined' && 
        'phantom' in window && 
        (window as any).phantom?.solana !== undefined;
        
      console.log('Initializing wallets, Phantom available:', phantomAvailable);
      
      // Cast to Adapter[] to satisfy TypeScript
      return [new PhantomWalletAdapter()] as Adapter[];
    },
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};