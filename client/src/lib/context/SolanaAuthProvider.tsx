import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '../stores/useUserStore';
import { PublicKey, Connection } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';
import { THC_TOKEN } from '../constants';

// Define membership tiers based on THC token holdings
export enum MembershipTier {
  BASIC = 'basic',
  ADVANCED = 'advanced',
  PREMIUM = 'premium',
  ELITE = 'elite'
}

export interface TokenMembership {
  tier: MembershipTier;
  tokenBalance: number;
  feeDiscount: number;
}

interface SolanaAuthContextProps {
  loginWithSolana: () => Promise<boolean>;
  logoutFromSolana: () => void;
  isAuthenticatingWithSolana: boolean;
  solanaAuthError: string | null;
  isWalletAuthenticated: boolean;
  walletAddress?: string;
  isPhantomAvailable?: boolean;
  checkTHCTokenMembership: () => Promise<TokenMembership>;
  tokenMembership?: TokenMembership;
}

const SolanaAuthContext = createContext<SolanaAuthContextProps>({
  loginWithSolana: async () => false,
  logoutFromSolana: () => {},
  isAuthenticatingWithSolana: false,
  solanaAuthError: null,
  isWalletAuthenticated: false,
  walletAddress: undefined,
  isPhantomAvailable: false,
  checkTHCTokenMembership: async () => ({
    tier: MembershipTier.BASIC,
    tokenBalance: 0,
    feeDiscount: 0
  }),
});

interface SolanaAuthProviderProps {
  children: ReactNode;
}

export const SolanaAuthProvider: FC<SolanaAuthProviderProps> = ({ children }) => {
  const { publicKey, connected, disconnect, signMessage } = useWallet();
  const { isAuthenticated, login, logout, updateUser, user } = useUserStore();
  const [isAuthenticatingWithSolana, setIsAuthenticatingWithSolana] = useState(false);
  const [solanaAuthError, setSolanaAuthError] = useState<string | null>(null);
  const [isWalletAuthenticated, setIsWalletAuthenticated] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | undefined>(undefined);
  const [tokenMembership, setTokenMembership] = useState<TokenMembership>({
    tier: MembershipTier.BASIC,
    tokenBalance: 0,
    feeDiscount: 0.05 // 5% discount for basic tier
  });

  // Check for Phantom Wallet extension
  const [isPhantomAvailable, setIsPhantomAvailable] = useState<boolean>(false);
  
  // Detect Phantom wallet
  useEffect(() => {
    const checkPhantomAvailability = () => {
      const phantomExists = typeof window !== 'undefined' && 
        'phantom' in window && 
        !!(window as any).phantom?.solana;
      
      console.log('Phantom wallet availability check:', { 
        exists: phantomExists,
        connectMethod: phantomExists ? typeof (window as any).phantom?.solana?.connect : 'undefined'
      });
      
      setIsPhantomAvailable(phantomExists);
    };
    
    // Check immediately and also set up listener for changes
    checkPhantomAvailability();
    
    // Listen for phantom object appearing (sometimes it loads after page)
    const phantomCheckInterval = setInterval(checkPhantomAvailability, 1000);
    
    return () => {
      clearInterval(phantomCheckInterval);
    };
  }, []);

  // Check if the current user is authenticated with Solana
  useEffect(() => {
    console.log('Checking wallet authentication state:', {
      isAuthenticated,
      userWalletAddress: user.walletAddress,
      connected,
      publicKey: publicKey?.toString(),
      isPhantomAvailable
    });

    // Auto-authenticate if conditions are right
    if (connected && publicKey && !isWalletAuthenticated) {
      const currentWalletAddress = publicKey.toString();
      setWalletAddress(currentWalletAddress);
      
      if (isAuthenticated && user.walletAddress) {
        // If user already has a wallet address, check if it matches the connected one
        if (currentWalletAddress === user.walletAddress) {
          console.log('Wallet addresses match, setting isWalletAuthenticated to true');
          setIsWalletAuthenticated(true);
        } else {
          console.log('Wallet addresses do not match:', { 
            currentWalletAddress, 
            userWalletAddress: user.walletAddress 
          });
          // Could prompt user to update their wallet address here
        }
      } else {
        // User connected wallet but hasn't signed message yet
        console.log('Wallet connected but not authenticated. Ready for sign & verify.');
      }
    } else if (!connected || !publicKey) {
      console.log('No wallet connected:', { 
        connected, 
        hasPublicKey: !!publicKey
      });
      setIsWalletAuthenticated(false);
      setWalletAddress(undefined);
    }
  }, [isAuthenticated, user.walletAddress, connected, publicKey, isPhantomAvailable]);

  // Verify the signed message
  const verifySignature = (message: Uint8Array, signature: Uint8Array, publicKey: PublicKey): boolean => {
    return nacl.sign.detached.verify(
      message,
      signature,
      publicKey.toBytes()
    );
  };

  // Try to connect using Phantom directly if wallet-adapter fails
  const tryPhantomDirectConnect = async (): Promise<PublicKey | null> => {
    if (isPhantomAvailable && (window as any).phantom?.solana) {
      try {
        console.log('Attempting direct Phantom connection');
        const response = await (window as any).phantom.solana.connect();
        const phantomPublicKey = new PublicKey(response.publicKey.toString());
        console.log('Connected to Phantom directly:', phantomPublicKey.toString());
        return phantomPublicKey;
      } catch (error) {
        console.error('Direct Phantom connection failed:', error);
        return null;
      }
    }
    return null;
  };

  const loginWithSolana = async (): Promise<boolean> => {
    console.log('loginWithSolana called with state:', { 
      connected, 
      publicKeyExists: !!publicKey, 
      signMessageExists: !!signMessage,
      isPhantomAvailable,
      walletAddress: walletAddress
    });

    let walletPubKey = publicKey;
    let needsPhantomSignature = false;

    // If wallet-adapter isn't connected but Phantom is available, try direct connection
    if ((!connected || !publicKey) && isPhantomAvailable) {
      const phantomKey = await tryPhantomDirectConnect();
      if (phantomKey) {
        walletPubKey = phantomKey;
        needsPhantomSignature = true;
        console.log("Using Phantom directly since wallet-adapter isn't connected");
      }
    }

    if (!walletPubKey) {
      console.log('No wallet public key available, cannot proceed');
      setSolanaAuthError('No wallet connected. Please connect your Solana wallet first.');
      return false;
    }

    try {
      setIsAuthenticatingWithSolana(true);
      setSolanaAuthError(null);

      // Create a challenge message that includes the wallet address
      const currentWalletAddress = walletPubKey.toString();
      setWalletAddress(currentWalletAddress);
      console.log('Proceeding with wallet address:', currentWalletAddress);
      
      const message = `Sign this message to verify your wallet ownership: ${currentWalletAddress}`;
      const encodedMessage = new TextEncoder().encode(message);

      console.log('Requesting signature from wallet...');
      
      // Request signature from wallet - either via adapter or directly
      let signatureBytes: Uint8Array;
      
      if (needsPhantomSignature && isPhantomAvailable) {
        console.log('Using direct Phantom signing');
        try {
          const sigData = await (window as any).phantom.solana.signMessage(encodedMessage, 'utf8');
          signatureBytes = new Uint8Array(sigData.signature);
        } catch (signError) {
          console.error('Phantom direct sign error:', signError);
          throw new Error('Failed to sign message with Phantom. Please try again.');
        }
      } else if (signMessage) {
        // Use wallet adapter
        signatureBytes = await signMessage(encodedMessage);
      } else {
        throw new Error('No signing method available');
      }
      
      console.log('Signature received, verifying...');
      
      // Verify signature
      const isValid = verifySignature(encodedMessage, signatureBytes, walletPubKey);
      console.log('Signature validation result:', isValid);

      if (!isValid) {
        throw new Error('Invalid signature. Authentication failed.');
      }

      // In a real application, you would send this signature to your backend to verify
      // and create a user account or session. Here we're doing it client-side for demo purposes.
      
      // Get the signature in base58 format for storage
      const signatureBase58 = bs58.encode(signatureBytes);

      // Create or update user profile
      const walletUser = {
        username: `sol_${currentWalletAddress.substring(0, 6)}`,
        walletAddress: currentWalletAddress,
        walletSignature: signatureBase58,
        // Keep any existing user data if already logged in
        ...(isAuthenticated ? user : {}),
      };

      console.log('Created wallet user:', walletUser);

      // Update user store
      if (isAuthenticated) {
        console.log('User already authenticated, updating user data');
        updateUser(walletUser);
      } else {
        console.log('Logging in user with wallet auth');
        // Login with a blank password since we've verified via wallet
        await login(walletUser.username, 'wallet-auth');
        updateUser(walletUser);
      }

      setIsWalletAuthenticated(true);
      console.log('Wallet authentication successful');
      
      return true;
    } catch (error) {
      console.error('Solana wallet authentication error:', error);
      setSolanaAuthError(error instanceof Error ? error.message : 'Failed to authenticate with Solana wallet');
      return false;
    } finally {
      setIsAuthenticatingWithSolana(false);
    }
  };

  const logoutFromSolana = () => {
    if (isWalletAuthenticated) {
      // Clear wallet-related info from user but keep other data
      updateUser({
        walletAddress: undefined,
        walletSignature: undefined
      });
      
      // If you want to also disconnect the wallet
      if (disconnect) {
        disconnect();
      }

      setIsWalletAuthenticated(false);
      
      // Reset token membership to basic tier
      setTokenMembership({
        tier: MembershipTier.BASIC,
        tokenBalance: 0,
        feeDiscount: 0.05
      });
    }
  };
  
  // Check THC token balance and determine membership tier
  const checkTHCTokenMembership = async (): Promise<TokenMembership> => {
    if (!connected || !publicKey || !isWalletAuthenticated) {
      console.log('No authenticated wallet connected for THC token check');
      return {
        tier: MembershipTier.BASIC,
        tokenBalance: 0,
        feeDiscount: 0.05 // 5% discount for basic tier
      };
    }
    
    try {
      console.log(`Checking THC token balance for wallet: ${publicKey.toString()}`);
      
      // Create connection to Solana network
      const connection = new Connection('https://api.mainnet-beta.solana.com');
      
      // THC Token mint address
      const thcTokenMint = new PublicKey(THC_TOKEN.contractAddress);
      
      // In a real implementation, this would query the actual token balance using:
      // 1. Find the associated token account for this wallet
      // 2. Query the token balance from that account
      // For demonstration, we're using a simulated balance based on wallet address
      
      // Simulated token balance based on last few chars of wallet address
      // This is just for demo purposes - real implementation would query blockchain
      const addressHash = publicKey.toString().slice(-6);
      const simulatedBalance = parseInt(addressHash, 16) % 100000; // Random value based on address
      
      console.log(`Simulated THC token balance: ${simulatedBalance}`);
      
      // Determine membership tier based on token balance
      let tier = MembershipTier.BASIC;
      let feeDiscount = 0.05; // 5% for basic
      
      if (simulatedBalance >= 50000) {
        tier = MembershipTier.ELITE;
        feeDiscount = 0.50; // 50% discount
      } else if (simulatedBalance >= 10000) {
        tier = MembershipTier.PREMIUM;
        feeDiscount = 0.35; // 35% discount
      } else if (simulatedBalance >= 1000) {
        tier = MembershipTier.ADVANCED;
        feeDiscount = 0.25; // 25% discount
      }
      
      const membership: TokenMembership = {
        tier,
        tokenBalance: simulatedBalance,
        feeDiscount
      };
      
      console.log('Membership tier determined:', membership);
      
      // Update state with the membership details
      setTokenMembership(membership);
      
      return membership;
    } catch (error) {
      console.error('Error checking THC token balance:', error);
      return tokenMembership; // Return current state if error
    }
  };
  
  // Check token membership when wallet connects or changes
  useEffect(() => {
    if (isWalletAuthenticated && publicKey) {
      checkTHCTokenMembership();
    }
  }, [isWalletAuthenticated, publicKey]);

  return (
    <SolanaAuthContext.Provider
      value={{
        loginWithSolana,
        logoutFromSolana,
        isAuthenticatingWithSolana,
        solanaAuthError,
        isWalletAuthenticated,
        walletAddress,
        isPhantomAvailable,
        checkTHCTokenMembership,
        tokenMembership
      }}
    >
      {children}
    </SolanaAuthContext.Provider>
  );
};

export const useSolanaAuth = () => useContext(SolanaAuthContext);