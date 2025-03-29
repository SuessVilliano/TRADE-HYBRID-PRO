// Define types for wallet adapters and expose for use with @solana wallet libraries.
// These are mockups to help TypeScript compilation but allow the actual implementations
// to be properly used at runtime.

// Define a WalletName type to satisfy the type checker
declare module '@solana/wallet-adapter-base' {
  export type WalletName<T extends string = string> = T & { __brand__: 'WalletName' };
  
  export interface WalletAdapterProps<Name extends string = string> {
    name: WalletName<Name>;
    url: string;
    icon: string;
    autoConnect?: boolean;
  }
  
  export interface Adapter extends WalletAdapterProps<string> {
    // Add any necessary Adapter properties
    publicKey: any;
    connecting: boolean;
    connected: boolean;
    readyState: any;
    
    connect(): Promise<void>;
    disconnect(): Promise<void>;
  }
  
  export interface SignerWalletAdapter extends Adapter {
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
    signMessage?(message: Uint8Array): Promise<Uint8Array>;
  }
  
  export interface MessageSignerWalletAdapter extends Adapter {
    signMessage(message: Uint8Array): Promise<Uint8Array>;
  }
}

// Define Phantom wallet adapter
declare module '@solana/wallet-adapter-phantom' {
  import { Adapter } from '@solana/wallet-adapter-base';
  export class PhantomWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
}

// Define other wallet adapters
declare module '@solana/wallet-adapter-wallets' {
  import { Adapter } from '@solana/wallet-adapter-base';
  
  export class BackpackWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
  
  export class SolflareWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
  
  export class TorusWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
  
  export class LedgerWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
  
  export class SlopeWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
  
  export class GlowWalletAdapter implements Adapter {
    // Implementation details will come from the actual library
  }
}