import { FC, ReactNode, useMemo, createContext, useContext, useState } from 'react';

// Create a mock context for Solana wallet
interface SolanaWalletContextValue {
  publicKey: string | null;
  connected: boolean;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signAllTransactions: (transactions: any[]) => Promise<any[]>;
  signMessage: (message: Uint8Array) => Promise<Uint8Array>;
}

const SolanaWalletContext = createContext<SolanaWalletContextValue>({
  publicKey: null,
  connected: false,
  connecting: false,
  connect: async () => {},
  disconnect: async () => {},
  signTransaction: async (transaction) => transaction,
  signAllTransactions: async (transactions) => transactions,
  signMessage: async (message) => message
});

export const useSolanaWallet = () => useContext(SolanaWalletContext);

interface SolanaWalletProviderProps {
  children: ReactNode;
}

export const SolanaWalletProvider: FC<SolanaWalletProviderProps> = ({ children }) => {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const connect = async () => {
    try {
      setConnecting(true);
      // Mock connection logic
      setPublicKey('11111111111111111111111111111111');
      setConnected(true);
      console.log("Mock wallet connected");
    } catch (error) {
      console.error("Error connecting wallet:", error);
    } finally {
      setConnecting(false);
    }
  };

  const disconnect = async () => {
    setPublicKey(null);
    setConnected(false);
    console.log("Mock wallet disconnected");
  };

  const signTransaction = async (transaction: any) => {
    console.log("Mock transaction signing");
    return transaction;
  };

  const signAllTransactions = async (transactions: any[]) => {
    console.log("Mock signing all transactions");
    return transactions;
  };

  const signMessage = async (message: Uint8Array) => {
    console.log("Mock message signing");
    return message;
  };

  const value = {
    publicKey,
    connected,
    connecting,
    connect,
    disconnect,
    signTransaction,
    signAllTransactions,
    signMessage
  };

  return (
    <SolanaWalletContext.Provider value={value}>
      {children}
    </SolanaWalletContext.Provider>
  );
};