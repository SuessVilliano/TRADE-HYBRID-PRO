/**
 * Solana Blockchain Service for the Trade Hybrid platform
 * 
 * This service provides comprehensive Solana blockchain data integration for the MCP server.
 * It combines data from various sources including direct Solana RPC connections and the Solscan API.
 */

import { Connection, PublicKey, LAMPORTS_PER_SOL, VersionedTransaction } from '@solana/web3.js';
import { SolscanAdapter } from '../adapters/solscan-adapter';
import EventEmitter from 'events';

// Define interfaces for token data
export interface TokenInfo {
  symbol: string;
  name: string;
  address: string;
  iconUrl?: string;
  decimals: number;
  totalSupply?: string;
  marketCap?: number;
  price?: number;
  priceChange24h?: number;
  volume24h?: number;
}

export interface TokenBalance {
  token: TokenInfo;
  balance: string;
  balanceUsd?: number;
}

export interface WalletInfo {
  address: string;
  solBalance: number;
  tokenBalances: TokenBalance[];
  lastUpdated: Date;
}

export interface ValidatorInfo {
  identity: string;
  vote: string;
  commission: number;
  activatedStake: number;
  lastVote: number;
  rootSlot: number;
  credits: string;
}

export interface TokenTransaction {
  txHash: string;
  blockTime: number;
  slot: number;
  fee: number;
  status: string;
  sender: string;
  receiver: string;
  amount: string;
  type: 'transfer' | 'swap' | 'mint' | 'burn' | 'unknown';
}

// Cached token price data
interface TokenPriceData {
  price: number;
  priceChange24h: number;
  lastUpdated: Date;
}

/**
 * Solana Blockchain Service class
 */
export class SolanaBlockchainService extends EventEmitter {
  private connection: Connection;
  private solscanAdapter: SolscanAdapter;
  private initialized: boolean = false;
  private tokenPriceCache: Map<string, TokenPriceData> = new Map();
  private static instance: SolanaBlockchainService;

  // Singleton pattern
  static getInstance(): SolanaBlockchainService {
    if (!SolanaBlockchainService.instance) {
      SolanaBlockchainService.instance = new SolanaBlockchainService();
    }
    return SolanaBlockchainService.instance;
  }

  private constructor() {
    super();
    
    // Get the Solana RPC URL from environment variables
    const rpcUrl = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
    
    // Initialize Solana connection
    this.connection = new Connection(rpcUrl, 'confirmed');
    
    // Initialize Solscan adapter
    this.solscanAdapter = new SolscanAdapter();
  }

  /**
   * Initialize the Solana blockchain service
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }

    try {
      console.log('Initializing Solana Blockchain Service...');
      
      // Initialize Solscan adapter
      const solscanInitialized = await this.solscanAdapter.initialize();
      
      if (!solscanInitialized) {
        console.warn('Solscan adapter failed to initialize. Some functionality may be limited.');
      }
      
      // Test connection to Solana RPC
      const blockHeight = await this.connection.getBlockHeight();
      console.log(`Connected to Solana network. Current block height: ${blockHeight}`);
      
      // Fetch THC token info for cache
      await this.updateTHCTokenInfo();
      
      this.initialized = true;
      console.log('Solana Blockchain Service initialized successfully');
      
      // Setup periodic cache updates
      this.setupPeriodicUpdates();
      
      return true;
    } catch (error) {
      console.error('Failed to initialize Solana Blockchain Service:', error);
      return false;
    }
  }

  /**
   * Setup periodic updates for cached data
   */
  private setupPeriodicUpdates() {
    // Update THC token info every 30 minutes
    setInterval(() => {
      this.updateTHCTokenInfo().catch(err => {
        console.error('Error updating THC token info:', err);
      });
    }, 30 * 60 * 1000);
  }

  /**
   * Update THC token information in cache
   */
  private async updateTHCTokenInfo(): Promise<void> {
    try {
      const tokenInfo = await this.solscanAdapter.getTHCTokenInfo();
      
      // Cache the token price data
      this.tokenPriceCache.set('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4', {
        price: tokenInfo.marketCap ? (tokenInfo.marketCap / Number(tokenInfo.totalSupply)) : 0,
        priceChange24h: 0, // Solscan doesn't provide this directly
        lastUpdated: new Date()
      });
      
      // Emit token price update event
      this.emit('tokenPriceUpdated', {
        tokenAddress: '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4',
        price: tokenInfo.marketCap ? (tokenInfo.marketCap / Number(tokenInfo.totalSupply)) : 0
      });
      
    } catch (error) {
      console.error('Error updating THC token information:', error);
    }
  }

  /**
   * Get SOL balance for a wallet address
   */
  async getSolBalance(walletAddress: string): Promise<number> {
    try {
      const publicKey = new PublicKey(walletAddress);
      const balance = await this.connection.getBalance(publicKey);
      return balance / LAMPORTS_PER_SOL; // Convert lamports to SOL
    } catch (error) {
      console.error(`Error getting SOL balance for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get token balance for a specific token and wallet
   */
  async getTokenBalance(walletAddress: string, tokenAddress: string): Promise<string> {
    try {
      // For simplicity, we're not implementing the full token account lookup logic here
      // In a complete implementation, we would:
      // 1. Find the associated token account for the wallet and token
      // 2. Get the account info and parse it to extract the token balance
      // 3. Return the balance formatted according to token decimals
      
      // This is a placeholder that would be replaced with actual token balance lookup
      const publicKey = new PublicKey(walletAddress);
      const tokenAccounts = await this.connection.getParsedTokenAccountsByOwner(
        publicKey,
        { mint: new PublicKey(tokenAddress) }
      );
      
      if (tokenAccounts.value.length === 0) {
        return '0';
      }
      
      // Get the first token account (generally there's only one per mint)
      const tokenAccount = tokenAccounts.value[0];
      const accountData = tokenAccount.account.data.parsed.info;
      
      return accountData.tokenAmount.amount;
    } catch (error) {
      console.error(`Error getting token balance for ${walletAddress} (${tokenAddress}):`, error);
      return '0';
    }
  }

  /**
   * Get THC token balance for a wallet
   */
  async getTHCTokenBalance(walletAddress: string): Promise<string> {
    return await this.getTokenBalance(walletAddress, '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
  }

  /**
   * Get comprehensive wallet information
   */
  async getWalletInfo(walletAddress: string): Promise<WalletInfo> {
    try {
      // Get SOL balance
      const solBalance = await this.getSolBalance(walletAddress);
      
      // Get THC token balance
      const thcBalance = await this.getTHCTokenBalance(walletAddress);
      
      // Get THC token info
      const thcTokenInfo = await this.getTokenInfo('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
      
      // Create token balances array
      const tokenBalances: TokenBalance[] = [
        {
          token: {
            symbol: 'SOL',
            name: 'Solana',
            address: 'native',
            decimals: 9,
          },
          balance: (solBalance * LAMPORTS_PER_SOL).toString(),
        },
        {
          token: thcTokenInfo,
          balance: thcBalance,
        }
      ];
      
      return {
        address: walletAddress,
        solBalance,
        tokenBalances,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error(`Error getting wallet info for ${walletAddress}:`, error);
      throw error;
    }
  }

  /**
   * Get token information by address
   */
  async getTokenInfo(tokenAddress: string): Promise<TokenInfo> {
    try {
      // Use Solscan adapter to get token info
      const solscanTokenInfo = await this.solscanAdapter.getTokenInfo(tokenAddress);
      
      // Get price data from cache or use defaults
      const priceData = this.tokenPriceCache.get(tokenAddress) || {
        price: 0,
        priceChange24h: 0,
        lastUpdated: new Date()
      };
      
      return {
        symbol: solscanTokenInfo.symbol,
        name: solscanTokenInfo.name,
        address: solscanTokenInfo.address,
        iconUrl: solscanTokenInfo.icon,
        decimals: solscanTokenInfo.decimals,
        totalSupply: solscanTokenInfo.totalSupply,
        marketCap: solscanTokenInfo.marketCap,
        price: priceData.price,
        priceChange24h: priceData.priceChange24h,
      };
    } catch (error) {
      console.error(`Error getting token info for ${tokenAddress}:`, error);
      
      // Return a minimal token info object if the request fails
      return {
        symbol: 'UNKNOWN',
        name: 'Unknown Token',
        address: tokenAddress,
        decimals: 9,
      };
    }
  }

  /**
   * Get THC token information
   */
  async getTHCTokenInfo(): Promise<TokenInfo> {
    return await this.getTokenInfo('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
  }

  /**
   * Get Trade Hybrid validator information
   */
  async getValidatorInfo(): Promise<ValidatorInfo> {
    try {
      // Use Solscan adapter to get validator info
      const validatorInfo = await this.solscanAdapter.getTradeHybridValidatorInfo();
      
      return {
        identity: '5Mp3EF1donYxLxhe5hs6HoWpAucZGLZ76NKRNztkjEej',
        vote: validatorInfo.vote || '',
        commission: validatorInfo.commission || 1,
        activatedStake: validatorInfo.activatedStake || 0,
        lastVote: validatorInfo.lastVote || 0,
        rootSlot: validatorInfo.rootSlot || 0,
        credits: validatorInfo.credits || '0',
      };
    } catch (error) {
      console.error('Error getting Trade Hybrid validator info:', error);
      
      // Return default validator info if the request fails
      return {
        identity: '5Mp3EF1donYxLxhe5hs6HoWpAucZGLZ76NKRNztkjEej',
        vote: '',
        commission: 1,
        activatedStake: 0,
        lastVote: 0,
        rootSlot: 0,
        credits: '0',
      };
    }
  }

  /**
   * Get recent transactions for a wallet
   */
  async getRecentTransactions(walletAddress: string, limit: number = 10): Promise<TokenTransaction[]> {
    try {
      // Use Solscan adapter to get transactions
      const solscanTxns = await this.solscanAdapter.getTransactions(walletAddress, limit);
      
      // Map to our internal transaction format
      return solscanTxns.map(tx => {
        // This is a simplified mapping - a full implementation would properly parse
        // the instructions to determine the transaction type and other details
        return {
          txHash: tx.txHash,
          blockTime: tx.blockTime,
          slot: tx.slot,
          fee: tx.fee,
          status: tx.status,
          sender: tx.signer[0] || walletAddress,
          receiver: '', // Would be determined from instruction parsing
          amount: '', // Would be determined from instruction parsing
          type: 'unknown', // Would be determined from instruction analysis
        };
      });
    } catch (error) {
      console.error(`Error getting transactions for ${walletAddress}:`, error);
      return [];
    }
  }

  /**
   * Get current Solana network status
   */
  async getNetworkStatus(): Promise<{blockHeight: number, blockTime: number}> {
    try {
      const blockHeight = await this.connection.getBlockHeight();
      const slot = await this.connection.getSlot();
      const blockTime = await this.connection.getBlockTime(slot);
      
      return {
        blockHeight,
        blockTime: blockTime || 0,
      };
    } catch (error) {
      console.error('Error getting Solana network status:', error);
      throw error;
    }
  }
}