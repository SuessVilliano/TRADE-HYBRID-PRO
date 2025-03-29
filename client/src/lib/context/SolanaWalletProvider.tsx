import { FC, ReactNode, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { 
  BackpackWalletAdapter,
  SolflareWalletAdapter, 
  TorusWalletAdapter,
  LedgerWalletAdapter,
  SlopeWalletAdapter,
  GlowWalletAdapter
} from '@solana/wallet-adapter-wallets';

// Import styles for the wallet modal UI
import '@solana/wallet-adapter-react-ui/styles.css';

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'
  const network = WalletAdapterNetwork.Testnet;

  // Use the Solana testnet API endpoint
  const endpoint = useMemo(() => "https://api.testnet.solana.com", []);

  // Configure the available wallets
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter(),
    new BackpackWalletAdapter(),
    new TorusWalletAdapter(),
    new LedgerWalletAdapter(),
    new SlopeWalletAdapter(),
    new GlowWalletAdapter()
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};