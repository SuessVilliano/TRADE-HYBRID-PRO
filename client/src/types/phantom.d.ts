// Types for Phantom Wallet
interface PhantomWindow extends Window {
  phantom?: {
    solana?: {
      isPhantom?: boolean;
      connect: () => Promise<{ publicKey: { toString: () => string } }>;
      disconnect: () => Promise<void>;
    };
  };
}

declare global {
  interface Window extends PhantomWindow {}
}

export {};