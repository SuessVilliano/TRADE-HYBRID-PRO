import { 
  FC, 
  ReactNode, 
  useMemo,
  useEffect,
  useState
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
  const [rpcEndpoint, setRpcEndpoint] = useState<string>('');
  
  // Set the network to use custom RPC URL if available, otherwise fall back to default mainnet
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
          console.log('Using custom Solana RPC URL');
          setRpcEndpoint(data.rpcUrl);
        } else {
          console.log('No custom RPC URL found, using default Solana endpoint');
          setRpcEndpoint(clusterApiUrl('mainnet-beta'));
        }
      } catch (error) {
        console.error('Error fetching RPC URL:', error);
        console.log('Falling back to default Solana endpoint due to error');
        setRpcEndpoint(clusterApiUrl('mainnet-beta'));
      }
    };
    
    fetchRpcUrl();
  }, []);
  
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