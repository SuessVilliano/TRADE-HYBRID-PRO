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
  // Use a safe default to prevent white screen errors
  const [rpcEndpoint, setRpcEndpoint] = useState<string>(clusterApiUrl('mainnet-beta'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Set the network to use custom RPC URL, with a fallback to default
  const endpoint = useMemo(() => {
    // Always return a valid endpoint to prevent connection errors
    return rpcEndpoint;
  }, [rpcEndpoint]);
  
  // Fetch the RPC URL from API
  useEffect(() => {
    const fetchRpcUrl = async () => {
      setIsLoading(true);
      try {
        // Try to get the SOLANA_RPC_URL from the server
        // This prevents issues with process.env access in the browser
        const response = await fetch('/api/config/rpc-url');
        const data = await response.json();
        
        if (data && data.rpcUrl) {
          console.log('Using custom Solana RPC URL');
          setRpcEndpoint(data.rpcUrl);
        } else {
          console.log('No custom RPC URL found, using default Solana endpoint');
          // Keep using the default we already set
        }
        setError(null);
      } catch (error) {
        console.error('Error fetching RPC URL:', error);
        console.log('Falling back to default Solana endpoint due to error');
        setError('Failed to fetch Solana RPC URL, using default endpoint');
        // Keep using the default we already set
      } finally {
        setIsLoading(false);
      }
    };
    
    // Immediately invoke function
    fetchRpcUrl();
  }, []);
  
  console.log('Connecting to Solana network:', endpoint);

  // Initialize the PhantomWalletAdapter with enhanced connection handling
  const wallets = useMemo(
    () => {
      try {
        // Do a more thorough check for Phantom wallet availability
        const phantomNewExists = typeof window !== 'undefined' && 
          'phantom' in window && 
          !!(window as any).phantom?.solana;
          
        const phantomChromeExists = typeof window !== 'undefined' && 
          'solana' in window && 
          !!(window as any).solana?.isPhantom;
        
        const phantomAvailable = phantomNewExists || phantomChromeExists;
        
        console.log('Initializing wallets, Phantom available:', phantomAvailable, {
          newMethod: phantomNewExists,
          chromeExtension: phantomChromeExists,
          connectMethod: phantomNewExists 
            ? typeof (window as any).phantom?.solana?.connect 
            : (phantomChromeExists ? typeof (window as any).solana?.connect : 'undefined')
        });
        
        // Create PhantomWalletAdapter with strict connection options for better reliability
        const phantomAdapter = new PhantomWalletAdapter({
          // Force detached mode for mobile compatibility
          detached: false,
          // Use a longer timeout to allow connection to stabilize
          appIdentity: {
            name: "Trade Hybrid Platform",
            icon: typeof window !== 'undefined' ? `${window.location.origin}/logo.png` : undefined
          }
        });
        
        // Cast to Adapter[] to satisfy TypeScript
        return [phantomAdapter] as Adapter[];
      } catch (err) {
        console.error('Error initializing phantom wallet:', err);
        // Return empty array to prevent crashes
        return [] as Adapter[];
      }
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