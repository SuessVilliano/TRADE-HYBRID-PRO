declare module '@solana/wallet-adapter-phantom' {
  import { WalletAdapter } from '@solana/wallet-adapter-base';
  
  export class PhantomWalletAdapter implements WalletAdapter {
    // Basic properties and methods
    connecting: boolean;
    connected: boolean;
    readyState: any;
    publicKey: any;
    name: string;
    icon: string;
    
    // Methods
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    sendTransaction(transaction: any, connection: any): Promise<string>;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
    signMessage(message: Uint8Array): Promise<Uint8Array>;
  }
}

declare module '@solana/wallet-adapter-wallets' {
  import { WalletAdapter } from '@solana/wallet-adapter-base';
  
  export class BackpackWalletAdapter implements WalletAdapter {}
  export class SolflareWalletAdapter implements WalletAdapter {}
  export class TorusWalletAdapter implements WalletAdapter {}
  export class LedgerWalletAdapter implements WalletAdapter {}
  export class SlopeWalletAdapter implements WalletAdapter {}
  export class GlowWalletAdapter implements WalletAdapter {}
}