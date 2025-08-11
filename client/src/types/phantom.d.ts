// Types for Phantom Wallet
interface PhantomSolana {
  isPhantom?: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  publicKey?: { toString: () => string };
}

interface PhantomWindow extends Window {
  phantom?: {
    solana?: PhantomSolana;
  };
  solana?: PhantomSolana;
}

declare global {
  interface Window extends PhantomWindow {}
}

export {};