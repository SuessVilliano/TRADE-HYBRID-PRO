/**
 * MoralisService
 * 
 * This service provides an interface to work with wallet data.
 * In a production environment, this would use the Moralis API for blockchain data.
 * For now, we'll implement a simplified version that provides the essential functionality
 * without requiring API keys.
 */

import { Connection, LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { toast } from 'sonner';

// Token interface
interface TokenBalance {
  balance: string;
  token?: {
    address: string;
    name: string;
    symbol: string;
    decimals: number;
    logo?: string;
  };
}

// Staking position interface
export interface StakingPosition {
  id: string;
  token: string;
  tokenSymbol: string;
  amount: number;
  apy: number;
  startDate: Date;
  endDate: Date;
  estimatedReward: number;
  status: 'active' | 'completed' | 'cancelled';
}

// Transaction interface
interface Transaction {
  id: string;
  type: 'stake' | 'unstake' | 'claim' | 'purchase' | 'transfer';
  token: string;
  amount: number;
  status: 'pending' | 'confirmed' | 'failed';
  timestamp: Date;
  txHash?: string;
}

export class MoralisService {
  private connection: Connection | null = null;
  private rpcUrl: string = '';
  private userStakingPositions: Map<string, StakingPosition[]> = new Map();
  private userTransactions: Map<string, Transaction[]> = new Map();
  
  constructor() {
    // We'll initialize the connection lazily
  }
  
  // Initialize the service
  async initialize(): Promise<void> {
    try {
      // Get RPC URL from server config
      const response = await fetch('/api/config/rpc-url');
      
      if (!response.ok) {
        throw new Error(`Error fetching RPC URL: ${response.status}`);
      }
      
      const data = await response.json();
      this.rpcUrl = data.rpcUrl;
      
      console.log('Moralis service initialized with RPC URL:', this.rpcUrl);
      
      // Create connection to Solana network
      this.connection = new Connection(this.rpcUrl);
    } catch (error) {
      console.error('Error initializing Moralis service:', error);
      throw error;
    }
  }
  
  // Get SOL balance for a wallet address
  async getSOLBalance(address: string): Promise<TokenBalance> {
    try {
      if (!this.connection) {
        await this.initialize();
      }
      
      if (!this.connection) {
        throw new Error('Failed to initialize Solana connection');
      }
      
      // Get the balance
      const publicKey = new PublicKey(address);
      const balanceInLamports = await this.connection.getBalance(publicKey);
      const balanceInSOL = balanceInLamports / LAMPORTS_PER_SOL;
      
      return {
        balance: balanceInSOL.toString(),
        token: {
          address: 'native',
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
          logo: '/images/crypto/sol.png'
        }
      };
    } catch (error) {
      console.error('Error getting SOL balance:', error);
      return {
        balance: '0',
        token: {
          address: 'native',
          name: 'Solana',
          symbol: 'SOL',
          decimals: 9,
          logo: '/images/crypto/sol.png'
        }
      };
    }
  }
  
  // Get THC token balance (in a production app, this would query the actual token account)
  async getTHCBalance(address: string): Promise<TokenBalance> {
    try {
      if (!this.connection) {
        await this.initialize();
      }
      
      // In a real implementation, this would query the SPL token account
      // For now, we'll return a simulated balance based on the address
      // In production, this would be replaced with a real token account query
      
      // Use a hash of the address to generate a "random but consistent" balance
      const hashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
      };
      
      const addressHash = hashCode(address);
      const simulatedBalance = addressHash % 10000;
      
      return {
        balance: simulatedBalance.toString(),
        token: {
          address: 'THC_TOKEN_ADDRESS',
          name: 'Trade Hybrid Coin',
          symbol: 'THC',
          decimals: 6,
          logo: '/images/crypto/thc.png'
        }
      };
    } catch (error) {
      console.error('Error getting THC balance:', error);
      return {
        balance: '0',
        token: {
          address: 'THC_TOKEN_ADDRESS',
          name: 'Trade Hybrid Coin',
          symbol: 'THC',
          decimals: 6,
          logo: '/images/crypto/thc.png'
        }
      };
    }
  }
  
  // Get NFTs owned by the wallet
  async getNFTs(address: string): Promise<any[]> {
    try {
      if (!this.connection) {
        await this.initialize();
      }
      
      // Generate deterministic NFTs based on wallet address
      const hashCode = (str: string): number => {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
          const char = str.charCodeAt(i);
          hash = ((hash << 5) - hash) + char;
          hash = hash & hash; // Convert to 32bit integer
        }
        return Math.abs(hash);
      };
      
      const addressHash = hashCode(address);
      
      // Generate NFTs based on hash
      const nfts = [];
      
      // VIP Access NFT (all addresses get this)
      nfts.push({
        mint: `NFT_MINT_${address.slice(0, 8)}`,
        name: 'TradeHybrid VIP Access',
        image: '/images/nfts/vip-access.png', 
        attributes: [
          { trait_type: 'Tier', value: 'Gold' },
          { trait_type: 'Valid Until', value: '2025-12-31' }
        ]
      });
      
      // If addressHash divisible by 3, add another NFT
      if (addressHash % 3 === 0) {
        nfts.push({
          mint: `NFT_MINT_${address.slice(0, 8)}_2`,
          name: 'Signal Provider Access',
          image: '/images/nfts/signal-provider.png', 
          attributes: [
            { trait_type: 'Type', value: 'Signal Provider' },
            { trait_type: 'Level', value: 'Premium' }
          ]
        });
      }
      
      return nfts;
    } catch (error) {
      console.error('Error getting NFTs:', error);
      return [];
    }
  }
  
  // Get wallet transactions
  async getTransactions(address: string): Promise<any[]> {
    try {
      if (!this.connection) {
        await this.initialize();
      }
      
      if (!this.connection) {
        throw new Error('Failed to initialize Solana connection');
      }
      
      // Get recent transactions
      const publicKey = new PublicKey(address);
      const transactions = await this.connection.getSignaturesForAddress(publicKey, {
        limit: 10
      });
      
      return transactions.map(tx => ({
        signature: tx.signature,
        blockTime: tx.blockTime,
        confirmationStatus: tx.confirmationStatus,
        slot: tx.slot
      }));
    } catch (error) {
      console.error('Error getting wallet transactions:', error);
      return [];
    }
  }
  
  // Stake tokens (THC or SOL)
  async stakeTokens(
    walletAddress: string, 
    tokenSymbol: string, 
    amount: number, 
    lockupPeriodDays: number, 
    apy: number
  ): Promise<StakingPosition> {
    try {
      // In a real implementation, this would create a staking transaction on the blockchain
      
      // Create a staking position
      const now = new Date();
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + lockupPeriodDays);
      
      const position: StakingPosition = {
        id: `staking_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        token: tokenSymbol === 'SOL' ? 'native' : 'THC_TOKEN_ADDRESS',
        tokenSymbol,
        amount,
        apy,
        startDate: now,
        endDate,
        estimatedReward: amount * (apy / 100) * (lockupPeriodDays / 365),
        status: 'active'
      };
      
      // Add the position to user's staking positions
      const userPositions = this.userStakingPositions.get(walletAddress) || [];
      userPositions.push(position);
      this.userStakingPositions.set(walletAddress, userPositions);
      
      // Add a transaction record
      this.recordTransaction(walletAddress, {
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'stake',
        token: tokenSymbol,
        amount,
        status: 'confirmed',
        timestamp: now,
        txHash: `simulated_tx_${Date.now()}`
      });
      
      return position;
    } catch (error) {
      console.error('Error staking tokens:', error);
      toast.error(`Failed to stake ${tokenSymbol}`, {
        description: 'There was an error processing your staking request'
      });
      throw error;
    }
  }
  
  // Get active staking positions for a wallet
  async getStakingPositions(walletAddress: string): Promise<StakingPosition[]> {
    // Return user's staking positions or empty array if none exist
    return this.userStakingPositions.get(walletAddress) || [];
  }
  
  // Unstake tokens (end staking position early)
  async unstakeTokens(walletAddress: string, positionId: string): Promise<boolean> {
    try {
      // Get user's staking positions
      const positions = this.userStakingPositions.get(walletAddress) || [];
      
      // Find the position to unstake
      const positionIndex = positions.findIndex(p => p.id === positionId);
      
      if (positionIndex === -1) {
        throw new Error('Staking position not found');
      }
      
      // Mark position as cancelled
      positions[positionIndex].status = 'cancelled';
      
      // Record transaction
      this.recordTransaction(walletAddress, {
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'unstake',
        token: positions[positionIndex].tokenSymbol,
        amount: positions[positionIndex].amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: `simulated_tx_${Date.now()}`
      });
      
      return true;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      toast.error('Failed to unstake tokens', {
        description: 'There was an error processing your unstaking request'
      });
      return false;
    }
  }
  
  // Purchase THC tokens
  async purchaseTHC(walletAddress: string, amount: number): Promise<boolean> {
    try {
      // Record transaction for the purchase
      this.recordTransaction(walletAddress, {
        id: `tx_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        type: 'purchase',
        token: 'THC',
        amount,
        status: 'confirmed',
        timestamp: new Date(),
        txHash: `purchase_tx_${Date.now()}`
      });
      
      return true;
    } catch (error) {
      console.error('Error purchasing THC:', error);
      toast.error('Failed to purchase THC', {
        description: 'There was an error processing your purchase'
      });
      return false;
    }
  }
  
  // Get user transactions history
  async getUserTransactions(walletAddress: string): Promise<Transaction[]> {
    return this.userTransactions.get(walletAddress) || [];
  }
  
  // Record a new transaction
  private recordTransaction(walletAddress: string, transaction: Transaction): void {
    const transactions = this.userTransactions.get(walletAddress) || [];
    transactions.unshift(transaction); // Add new transaction at the beginning
    this.userTransactions.set(walletAddress, transactions);
  }
}