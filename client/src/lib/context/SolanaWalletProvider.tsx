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

// Default styles for wallet adapter
require('@solana/wallet-adapter-react-ui/styles.css');

// Direct imports for each wallet adapter
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { clusterApiUrl } from '@solana/web3.js';

// Define adapter network values directly
const ADAPTER_NETWORK = {
  Mainnet: 'mainnet-beta',
  Testnet: 'testnet',
  Devnet: 'devnet'
} as const;

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // You can also provide a custom RPC endpoint
  const network = ADAPTER_NETWORK.Devnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Only include the PhantomWalletAdapter for now
  const wallets = useMemo(
    () => {
      // Check if we're in a browser environment and phantom exists
      if (typeof window !== 'undefined' && window.phantom) {
        return [new PhantomWalletAdapter()];
      }
      
      // Fallback empty array if phantom is not available (for SSR compatibility)
      return [new PhantomWalletAdapter()];
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