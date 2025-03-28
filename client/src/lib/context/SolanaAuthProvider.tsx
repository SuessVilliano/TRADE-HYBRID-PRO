import { FC, ReactNode, createContext, useContext, useEffect, useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useUserStore } from '../stores/useUserStore';
import { PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';
import bs58 from 'bs58';

interface SolanaAuthContextProps {
  loginWithSolana: () => Promise<boolean>;
  logoutFromSolana: () => void;
  isAuthenticatingWithSolana: boolean;
  solanaAuthError: string | null;
  isWalletAuthenticated: boolean;
}

const SolanaAuthContext = createContext<SolanaAuthContextProps>({
  loginWithSolana: async () => false,
  logoutFromSolana: () => {},
  isAuthenticatingWithSolana: false,
  solanaAuthError: null,
  isWalletAuthenticated: false,
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

  // Check if the current user is authenticated with Solana
  useEffect(() => {
    if (isAuthenticated && user.walletAddress && connected && publicKey) {
      const currentWalletAddress = publicKey.toString();
      if (currentWalletAddress === user.walletAddress) {
        setIsWalletAuthenticated(true);
      } else {
        setIsWalletAuthenticated(false);
      }
    } else {
      setIsWalletAuthenticated(false);
    }
  }, [isAuthenticated, user.walletAddress, connected, publicKey]);

  // Verify the signed message
  const verifySignature = (message: Uint8Array, signature: Uint8Array, publicKey: PublicKey): boolean => {
    return nacl.sign.detached.verify(
      message,
      signature,
      publicKey.toBytes()
    );
  };

  const loginWithSolana = async (): Promise<boolean> => {
    if (!connected || !publicKey || !signMessage) {
      setSolanaAuthError('Wallet not connected. Please connect your Solana wallet first.');
      return false;
    }

    try {
      setIsAuthenticatingWithSolana(true);
      setSolanaAuthError(null);

      // Create a challenge message that includes the wallet address
      const walletAddress = publicKey.toString();
      const message = `Sign this message to verify your wallet ownership: ${walletAddress}`;
      const encodedMessage = new TextEncoder().encode(message);

      // Request signature from wallet
      const signatureBytes = await signMessage(encodedMessage);
      
      // Verify signature
      const isValid = verifySignature(encodedMessage, signatureBytes, publicKey);

      if (!isValid) {
        throw new Error('Invalid signature. Authentication failed.');
      }

      // In a real application, you would send this signature to your backend to verify
      // and create a user account or session. Here we're doing it client-side for demo purposes.
      
      // Get the signature in base58 format for storage
      const signatureBase58 = bs58.encode(signatureBytes);

      // Create or update user profile
      const walletUser = {
        username: `sol_${walletAddress.substring(0, 6)}`,
        walletAddress,
        walletSignature: signatureBase58,
        // Keep any existing user data if already logged in
        ...(isAuthenticated ? user : {}),
      };

      // Update user store
      if (isAuthenticated) {
        updateUser(walletUser);
      } else {
        // Login with a blank password since we've verified via wallet
        await login(walletUser.username, 'wallet-auth');
        updateUser(walletUser);
      }

      setIsWalletAuthenticated(true);
      
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
    }
  };

  return (
    <SolanaAuthContext.Provider
      value={{
        loginWithSolana,
        logoutFromSolana,
        isAuthenticatingWithSolana,
        solanaAuthError,
        isWalletAuthenticated
      }}
    >
      {children}
    </SolanaAuthContext.Provider>
  );
};

export const useSolanaAuth = () => useContext(SolanaAuthContext);