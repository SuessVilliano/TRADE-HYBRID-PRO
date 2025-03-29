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

// Import the PhantomWalletAdapter directly from the node_modules
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

  // Only include the PhantomWalletAdapter for now to simplify
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter()
    ],
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