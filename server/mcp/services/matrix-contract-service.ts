/**
 * Matrix Contract Service for the Trade Hybrid platform
 * 
 * This service provides integration between the frontend matrix system and the Solana blockchain.
 * It uses SolanaBlockchainService for blockchain data access and operations.
 */

import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { SolanaBlockchainService, TokenTransaction, WalletInfo } from './solana-blockchain-service';

// Import types from frontend (could be moved to a shared types folder)
export interface Participant {
  address: string;
  referrer: string | null;
  registrationTime: number;
  activeSlots: MatrixSlot[];
  directReferrals: string[];
  totalEarnings: number;
  totalSlotsValue: number;
  preferredCurrency: 'THC' | 'SOL' | 'USDC';
}

export interface MatrixSlot {
  id: string;
  slotNumber: number;
  price: number;
  currency: 'THC' | 'SOL' | 'USDC';
  purchaseDate: number;
  isActive: boolean;
  earningsFromSlot: number;
  referrals: {
    address: string;
    slotFilled: number;
    earnings: number;
    date: number;
  }[];
}

// Matrix configuration values
export const MATRIX_CONFIG = {
  slotPrices: [
    25,     // Slot 1: $25
    50,     // Slot 2: $50
    100,    // Slot 3: $100
    200,    // Slot 4: $200
    400,    // Slot 5: $400
    800,    // Slot 6: $800
    1600,   // Slot 7: $1600
    3200,   // Slot 8: $3200
    6400,   // Slot 9: $6400
    12800,  // Slot 10: $12800
    25600,  // Slot 11: $25600
    51200   // Slot 12: $51200
  ],
  supportedCurrencies: ['THC', 'SOL', 'USDC'],
  // Commission distribution rates per level (must sum to 1)
  commissionDistribution: {
    directReferrer: 0.5,    // 50% to direct referrer
    uplineReferrers: 0.3,   // 30% distributed among upline referrers
    companyPool: 0.2        // 20% to company pool for platform development
  },
  spilloverMethod: 'balanced', // 'balanced' or 'first-available'
  thcTokenAddress: '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4',
  usdcTokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  companyWalletAddress: 'G41txkaT1pwuGjkRy1PfoGiCE8LmrJNTBxFvHHV8Fx2n'
};

/**
 * Matrix Contract Service class
 */
export class MatrixContractService {
  private solanaService: SolanaBlockchainService;
  private referralMap: Map<string, string> = new Map(); // wallet -> referrer
  private slotCache: Map<string, MatrixSlot[]> = new Map(); // wallet -> slots
  private directReferralsCache: Map<string, string[]> = new Map(); // wallet -> direct referrals
  
  constructor(private connection: Connection) {
    // Use the singleton instance to ensure we have the same configuration
    this.solanaService = SolanaBlockchainService.getInstance();
    this.loadReferralData();
  }
  
  /**
   * Load referral relationships from blockchain or database
   */
  private async loadReferralData() {
    try {
      // In a real implementation, this would load data from a database or from on-chain storage
      console.log('Loading matrix referral data...');
      
      // For now, we'll use some simulated data for testing
      // In production, this would fetch real referral relationships
      
      // TODO: Replace with actual data source integration
    } catch (error) {
      console.error('Error loading referral data:', error);
    }
  }
  
  /**
   * Get a user's matrix data from blockchain and cached sources
   */
  public async getUserMatrix(walletAddress: string): Promise<Participant> {
    try {
      const publicKey = new PublicKey(walletAddress);
      
      // Get wallet info including token balances
      const walletInfo = await this.solanaService.getWalletInfo(walletAddress);
      
      // Get transfer transactions to analyze matrix activity
      const transactions = await this.solanaService.getTokenTransactions(
        walletAddress, 
        MATRIX_CONFIG.thcTokenAddress, 
        20
      );
      
      // Get active slots (either from cache or by analyzing transactions)
      let activeSlots = this.slotCache.get(walletAddress);
      if (!activeSlots) {
        activeSlots = await this.analyzeTransactionsForSlots(walletAddress, transactions);
        this.slotCache.set(walletAddress, activeSlots);
      }
      
      // Get direct referrals
      let directReferrals = this.directReferralsCache.get(walletAddress) || [];
      if (!directReferrals.length) {
        directReferrals = await this.getDirectReferrals(walletAddress);
        this.directReferralsCache.set(walletAddress, directReferrals);
      }
      
      // Calculate total earnings
      const totalEarnings = activeSlots.reduce((sum, slot) => 
        sum + slot.earningsFromSlot, 0);
      
      // Calculate total slots value
      const totalSlotsValue = activeSlots.reduce((sum, slot) => 
        sum + slot.price, 0);
      
      // Get referrer
      const referrer = this.referralMap.get(walletAddress) || null;
      
      // Determine preferred currency (use THC by default)
      const preferredCurrency = 'THC';
      
      return {
        address: walletAddress,
        referrer,
        registrationTime: this.getRegistrationTime(walletAddress),
        activeSlots,
        directReferrals,
        totalEarnings,
        totalSlotsValue,
        preferredCurrency
      };
    } catch (error) {
      console.error('Error getting user matrix data:', error);
      throw new Error('Failed to fetch matrix data.');
    }
  }
  
  /**
   * Analyze transactions to determine active slots
   */
  private async analyzeTransactionsForSlots(
    walletAddress: string, 
    transactions: TokenTransaction[]
  ): Promise<MatrixSlot[]> {
    // In a real implementation, this would analyze actual transactions
    // to determine which slots the user has purchased
    
    // For now, return simulated data
    const slots: MatrixSlot[] = [];
    
    // Determine number of slots based on transactions
    // This would be more sophisticated in production
    const txCount = transactions.length;
    const slotCount = Math.min(Math.max(1, Math.floor(txCount / 2)), 5);
    
    for (let i = 0; i < slotCount; i++) {
      // Get a slot number between 1-12
      const slotNumber = i + 1;
      const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
      
      // Generate 0-3 referrals for the slot
      const referralCount = Math.min(3, Math.floor(Math.random() * 4));
      const referrals = [];
      
      let slotEarnings = 0;
      
      for (let j = 0; j < referralCount; j++) {
        const earnings = price * 0.1 * (j + 1); // Simulated earnings
        slotEarnings += earnings;
        
        // Use actual transactions for timestamps if available
        const txTimestamp = transactions[j]?.timestamp || Date.now() - (Math.random() * 30 * 24 * 60 * 60 * 1000);
        
        referrals.push({
          address: transactions[j]?.sender || this.generateRandomWalletAddress(),
          slotFilled: j + 1,
          earnings,
          date: txTimestamp
        });
      }
      
      slots.push({
        id: `slot-${slotNumber}-${walletAddress.substring(0, 8)}`,
        slotNumber,
        price,
        currency: 'THC',
        purchaseDate: transactions[i]?.timestamp || Date.now() - (Math.random() * 60 * 24 * 60 * 60 * 1000),
        isActive: true,
        earningsFromSlot: slotEarnings,
        referrals
      });
    }
    
    return slots;
  }
  
  /**
   * Get direct referrals for a wallet
   */
  private async getDirectReferrals(walletAddress: string): Promise<string[]> {
    // In a real implementation, this would query a database or blockchain
    // for users that were referred by this wallet
    
    // For now, return some simulated referrals
    const referralCount = Math.floor(Math.random() * 5);
    const referrals: string[] = [];
    
    for (let i = 0; i < referralCount; i++) {
      referrals.push(this.generateRandomWalletAddress());
    }
    
    return referrals;
  }
  
  /**
   * Get registration time based on first transaction or cached data
   */
  private getRegistrationTime(walletAddress: string): number {
    // In a real implementation, this would be based on the first matrix transaction
    // or stored in a database
    return Date.now() - (Math.random() * 90 * 24 * 60 * 60 * 1000);
  }
  
  /**
   * Generate a random Solana-like wallet address for demo purposes
   */
  private generateRandomWalletAddress(): string {
    return Keypair.generate().publicKey.toString();
  }
  
  /**
   * Purchase a new slot in the matrix
   */
  public async purchaseSlot(
    walletAddress: string, 
    slotNumber: number, 
    currency: 'THC' | 'SOL' | 'USDC'
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      if (slotNumber < 1 || slotNumber > 12) {
        return { success: false, error: 'Invalid slot number.' };
      }
      
      // Get slot price
      const slotPrice = MATRIX_CONFIG.slotPrices[slotNumber - 1];
      
      // Check if user has sufficient balance
      const walletInfo = await this.solanaService.getWalletInfo(walletAddress);
      let hasBalance = false;
      
      if (currency === 'THC') {
        const thcBalance = walletInfo.tokenBalances.find(tb => 
          tb.token.address === MATRIX_CONFIG.thcTokenAddress);
        const balance = thcBalance ? parseFloat(thcBalance.balance) / (10 ** thcBalance.token.decimals) : 0;
        hasBalance = balance >= slotPrice;
      } else if (currency === 'SOL') {
        const solBalance = walletInfo.solBalance;
        // Convert price to SOL (simplified conversion)
        const solPrice = slotPrice / 100; // Example: $100 = 1 SOL
        hasBalance = solBalance >= solPrice;
      } else if (currency === 'USDC') {
        const usdcBalance = walletInfo.tokenBalances.find(tb => 
          tb.token.address === MATRIX_CONFIG.usdcTokenAddress);
        const balance = usdcBalance ? parseFloat(usdcBalance.balance) / (10 ** usdcBalance.token.decimals) : 0;
        hasBalance = balance >= slotPrice;
      }
      
      if (!hasBalance) {
        return { success: false, error: `Insufficient ${currency} balance.` };
      }
      
      // In a real implementation, this would execute the actual transfer
      // to the appropriate recipient wallet based on matrix rules
      
      // For now, we'll just simulate a successful purchase
      console.log(`Simulating purchase of slot ${slotNumber} for ${slotPrice} ${currency}`);
      
      // Update the cache to reflect the new slot
      const publicKey = new PublicKey(walletAddress);
      const activeSlots = this.slotCache.get(walletAddress) || [];
      
      activeSlots.push({
        id: `slot-${slotNumber}-${Date.now()}`,
        slotNumber,
        price: slotPrice,
        currency,
        purchaseDate: Date.now(),
        isActive: true,
        earningsFromSlot: 0,
        referrals: []
      });
      
      this.slotCache.set(walletAddress, activeSlots);
      
      return { 
        success: true, 
        signature: `simulated-tx-${Date.now()}` 
      };
    } catch (error) {
      console.error('Error purchasing slot:', error);
      return { 
        success: false, 
        error: 'Failed to complete transaction. Please try again.' 
      };
    }
  }
  
  /**
   * Recycle a slot in the matrix to create a new position
   */
  public async recycleSlot(
    walletAddress: string, 
    slotNumber: number
  ): Promise<{ success: boolean; signature?: string; error?: string }> {
    try {
      // Get the user's active slots
      const activeSlots = this.slotCache.get(walletAddress) || [];
      
      // Find the slot to recycle
      const slotIndex = activeSlots.findIndex(slot => slot.slotNumber === slotNumber);
      
      if (slotIndex === -1) {
        return { success: false, error: 'Slot not found or not active.' };
      }
      
      // In a real implementation, this would execute the actual recycling transaction
      // on the blockchain including creating a new position
      
      // For now, simulate a successful recycling
      console.log(`Simulating recycling of slot ${slotNumber}`);
      
      // Update the slot in the cache
      activeSlots[slotIndex] = {
        ...activeSlots[slotIndex],
        recycleCount: (activeSlots[slotIndex].recycleCount || 0) + 1,
        recycledAt: Date.now(),
        referrals: [] // Reset referrals for the recycled slot
      };
      
      this.slotCache.set(walletAddress, activeSlots);
      
      return { 
        success: true, 
        signature: `simulated-recycle-tx-${Date.now()}` 
      };
    } catch (error) {
      console.error('Error recycling slot:', error);
      return { 
        success: false, 
        error: 'Failed to recycle slot. Please try again.' 
      };
    }
  }
  
  /**
   * Claim commissions from the matrix
   */
  public async claimCommissions(
    walletAddress: string
  ): Promise<{ success: boolean; signature?: string; error?: string; amount?: number }> {
    try {
      // Get the user's active slots to calculate available earnings
      const activeSlots = this.slotCache.get(walletAddress) || [];
      
      // Calculate total available earnings
      const totalEarnings = activeSlots.reduce((sum, slot) => 
        sum + slot.earningsFromSlot, 0);
      
      if (totalEarnings <= 0) {
        return { success: false, error: 'No earnings available to claim.' };
      }
      
      // In a real implementation, this would execute the actual token transfer
      // from the contract to the user's wallet
      
      // For now, simulate a successful claim
      console.log(`Simulating claim of ${totalEarnings} THC tokens`);
      
      // Reset earnings in cache
      activeSlots.forEach(slot => {
        slot.earningsFromSlot = 0;
      });
      
      this.slotCache.set(walletAddress, activeSlots);
      
      return { 
        success: true, 
        signature: `simulated-claim-tx-${Date.now()}`,
        amount: totalEarnings
      };
    } catch (error) {
      console.error('Error claiming commissions:', error);
      return { 
        success: false, 
        error: 'Failed to claim commissions. Please try again.' 
      };
    }
  }
  
  /**
   * Set a wallet's referrer
   */
  public async setReferrer(
    walletAddress: string, 
    referrerAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if wallet already has a referrer
      if (this.referralMap.has(walletAddress)) {
        return { 
          success: false, 
          error: 'Wallet already has a referrer.' 
        };
      }
      
      // Validate referrer address is a valid public key
      try {
        new PublicKey(referrerAddress);
      } catch (e) {
        return { 
          success: false, 
          error: 'Invalid referrer address.' 
        };
      }
      
      // In a real implementation, this would store the referrer relationship
      // in a database or on the blockchain
      
      // For now, store in memory
      this.referralMap.set(walletAddress, referrerAddress);
      
      // Add to direct referrals of the referrer
      const referrerReferrals = this.directReferralsCache.get(referrerAddress) || [];
      referrerReferrals.push(walletAddress);
      this.directReferralsCache.set(referrerAddress, referrerReferrals);
      
      return { success: true };
    } catch (error) {
      console.error('Error setting referrer:', error);
      return { 
        success: false, 
        error: 'Failed to set referrer. Please try again.' 
      };
    }
  }
}

// Singleton pattern for the service
let matrixServiceInstance: MatrixContractService | null = null;

/**
 * Get the MatrixContractService instance
 */
export function getMatrixContractService(connection: Connection): MatrixContractService {
  if (!matrixServiceInstance) {
    matrixServiceInstance = new MatrixContractService(connection);
  }
  return matrixServiceInstance;
}