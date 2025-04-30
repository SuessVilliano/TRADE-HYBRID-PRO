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
      console.log('Loading matrix referral data from blockchain...');
      
      // Import database for persistent storage
      const { storage } = await import('../../../storage');
      
      try {
        // First check if we have cached referral data in database
        const referralData = await storage.getMatrixReferrals();
        
        if (referralData && referralData.length > 0) {
          console.log(`Loaded ${referralData.length} referral relationships from database`);
          
          // Populate the referral map from database
          referralData.forEach(data => {
            if (data.wallet && data.referrer) {
              this.referralMap.set(data.wallet, data.referrer);
              
              // Also add to direct referrals cache
              const directReferrals = this.directReferralsCache.get(data.referrer) || [];
              if (!directReferrals.includes(data.wallet)) {
                directReferrals.push(data.wallet);
                this.directReferralsCache.set(data.referrer, directReferrals);
              }
            }
          });
          return;
        }
      } catch (dbError) {
        console.warn('Could not load referral data from database, will try blockchain:', dbError);
      }
      
      // If no data in database, try to analyze blockchain transactions
      // Look for token transfers that might indicate referral relationships
      try {
        // Get the program address for the THC token
        const tokenAddress = MATRIX_CONFIG.thcTokenAddress;
        
        // Get transaction history for the company wallet
        const companyWallet = MATRIX_CONFIG.companyWalletAddress;
        const transactions = await this.solanaService.getTokenTransactions(
          companyWallet, 
          tokenAddress,
          100 // Limit to most recent 100 transactions
        );
        
        console.log(`Analyzing ${transactions.length} company wallet transactions for referral patterns`);
        
        // Build a map of transaction patterns that might indicate referrals
        const potentialReferrals = new Map<string, string>();
        
        // For each transaction from the company wallet to a user, check if there's metadata or a memo
        // that contains referral information
        for (const tx of transactions) {
          // Referral data might be encoded in transaction memo or in token transfer metadata
          // This is a simplified example - real implementation would depend on how the data is stored
          try {
            const txDetails = await this.solanaService.getTransactionDetails(tx.txHash);
            
            // Check if this transaction includes memo data that indicates a referral
            if (txDetails && txDetails.memo) {
              const memo = txDetails.memo.toLowerCase();
              
              // Example format: "ref:REFERRER_WALLET:USER_WALLET"
              if (memo.startsWith('ref:')) {
                const parts = memo.split(':');
                if (parts.length === 3) {
                  const referrer = parts[1];
                  const user = parts[2];
                  
                  // Validate both addresses
                  try {
                    new PublicKey(referrer);
                    new PublicKey(user);
                    
                    // Store the referral relationship
                    potentialReferrals.set(user, referrer);
                    
                    // Also add to our referral map
                    this.referralMap.set(user, referrer);
                    
                    // Update direct referrals cache
                    const directReferrals = this.directReferralsCache.get(referrer) || [];
                    if (!directReferrals.includes(user)) {
                      directReferrals.push(user);
                      this.directReferralsCache.set(referrer, directReferrals);
                    }
                  } catch (e) {
                    // Not valid addresses, skip
                  }
                }
              }
            }
          } catch (txError) {
            // Skip transactions we can't analyze
            console.log(`Skipping transaction ${tx.txHash} due to error:`, txError);
          }
        }
        
        console.log(`Found ${potentialReferrals.size} potential referral relationships from blockchain data`);
        
        // Save the discovered referrals to the database for future use
        if (potentialReferrals.size > 0) {
          try {
            const referralsToSave = [];
            
            for (const [wallet, referrer] of potentialReferrals.entries()) {
              referralsToSave.push({
                wallet,
                referrer,
                timestamp: Date.now()
              });
            }
            
            await storage.saveMatrixReferrals(referralsToSave);
            console.log(`Saved ${referralsToSave.length} referral relationships to database`);
          } catch (saveError) {
            console.error('Error saving referral data to database:', saveError);
          }
        }
      } catch (blockchainError) {
        console.error('Error analyzing blockchain for referral data:', blockchainError);
      }
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
    try {
      console.log(`Analyzing ${transactions.length} transactions for wallet ${walletAddress} to determine slots`);
      
      // Import database for persistent storage
      const { storage } = await import('../../../storage');
      
      // First check if we have cached slot data in database
      try {
        const slotData = await storage.getMatrixSlots(walletAddress);
        
        if (slotData && slotData.length > 0) {
          console.log(`Loaded ${slotData.length} matrix slots from database for wallet ${walletAddress}`);
          return slotData;
        }
      } catch (dbError) {
        console.warn('Could not load slot data from database, will analyze transactions:', dbError);
      }
      
      // No cached data, analyze transactions
      const slots: MatrixSlot[] = [];
      
      // Sort transactions by timestamp (oldest first)
      const sortedTx = [...transactions].sort((a, b) => 
        (a.blockTime || 0) - (b.blockTime || 0)
      );
      
      // Used to track which slots have been processed
      const processedSlots = new Set<number>();
      const companyWallet = MATRIX_CONFIG.companyWalletAddress;
      
      // Analyze outgoing transactions to company wallet (slot purchases)
      // and incoming transactions from company wallet (earnings)
      for (const tx of sortedTx) {
        try {
          // Get transaction details to analyze memo field and transaction type
          const txDetails = await this.solanaService.getTransactionDetails(tx.txHash);
          
          if (!txDetails) continue;
          
          // If this is a transfer to the company wallet, it might be a slot purchase
          if (tx.receiver === companyWallet) {
            // Check memo field for slot information
            if (txDetails.memo) {
              const memo = txDetails.memo.toLowerCase();
              
              // Look for slot purchase pattern in memo, e.g. "slot:3" or "purchase-slot-3"
              const slotMatch = memo.match(/slot[-:]?(\d+)/i) || memo.match(/purchase[-:]?slot[-:]?(\d+)/i);
              
              if (slotMatch && slotMatch[1]) {
                const slotNumber = parseInt(slotMatch[1], 10);
                
                if (slotNumber >= 1 && slotNumber <= 12 && !processedSlots.has(slotNumber)) {
                  processedSlots.add(slotNumber);
                  
                  const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
                  
                  slots.push({
                    id: `slot-${slotNumber}-${tx.txHash.substring(0, 8)}`,
                    slotNumber,
                    price,
                    currency: 'THC',
                    purchaseDate: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                    isActive: true,
                    earningsFromSlot: 0,
                    referrals: []
                  });
                  
                  console.log(`Found slot purchase transaction for slot ${slotNumber}`);
                }
              }
            }
          }
          // If this is a transfer from the company wallet, it might be earnings
          else if (tx.sender === companyWallet) {
            // Check memo field for earnings information
            if (txDetails.memo) {
              const memo = txDetails.memo.toLowerCase();
              
              // Look for earnings pattern in memo, e.g. "earnings:3" or "slot-3-earnings"
              const earningsMatch = memo.match(/earnings[-:]?slot[-:]?(\d+)/i) || 
                                    memo.match(/slot[-:]?(\d+)[-:]?earnings/i);
              
              if (earningsMatch && earningsMatch[1]) {
                const slotNumber = parseInt(earningsMatch[1], 10);
                
                // Find matching slot or create a new one
                let slot = slots.find(s => s.slotNumber === slotNumber);
                
                if (!slot) {
                  // This is earnings for a slot we haven't seen purchase transaction for
                  // Create the slot entry
                  const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
                  
                  slot = {
                    id: `slot-${slotNumber}-earnings-${tx.txHash.substring(0, 8)}`,
                    slotNumber,
                    price,
                    currency: 'THC',
                    purchaseDate: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                    isActive: true,
                    earningsFromSlot: 0,
                    referrals: []
                  };
                  
                  slots.push(slot);
                  processedSlots.add(slotNumber);
                }
                
                // Extract amount from transaction
                const amountValue = parseFloat(tx.amount);
                if (!isNaN(amountValue) && amountValue > 0) {
                  slot.earningsFromSlot += amountValue;
                  
                  // Check if there's referral information in the memo
                  const referrerMatch = memo.match(/referrer[-:]?([a-zA-Z0-9]+)/i);
                  
                  if (referrerMatch && referrerMatch[1]) {
                    const referrerAddress = referrerMatch[1];
                    
                    // Add to slot referrals
                    slot.referrals.push({
                      address: referrerAddress,
                      slotFilled: slot.referrals.length + 1,
                      earnings: amountValue,
                      date: tx.blockTime ? tx.blockTime * 1000 : Date.now()
                    });
                  }
                }
                
                console.log(`Found earnings transaction for slot ${slotNumber}: ${amountValue} THC`);
              }
            }
          }
        } catch (txError) {
          console.warn(`Error analyzing transaction ${tx.txHash}:`, txError);
          continue;
        }
      }
      
      // If no slots were found from real transactions, check if we can infer some from token balances
      if (slots.length === 0) {
        const walletInfo = await this.solanaService.getWalletInfo(walletAddress);
        
        // Look for THC token balance
        const thcBalance = walletInfo.tokenBalances.find(tb => 
          tb.token.address === MATRIX_CONFIG.thcTokenAddress);
        
        if (thcBalance) {
          const balance = parseFloat(thcBalance.balance) / (10 ** thcBalance.token.decimals);
          
          // Determine potential slots based on balance thresholds
          // Simple heuristic: higher balance = higher level matrix slots
          if (balance >= MATRIX_CONFIG.slotPrices[0]) {
            // Create at least one basic slot if there's a balance
            const slotNumber = 1;
            const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
            
            slots.push({
              id: `slot-${slotNumber}-inferred-${walletAddress.substring(0, 8)}`,
              slotNumber,
              price,
              currency: 'THC',
              purchaseDate: Date.now() - (7 * 24 * 60 * 60 * 1000), // A week ago
              isActive: true,
              earningsFromSlot: 0,
              referrals: []
            });
            
            // If balance is high enough for higher slots, add more
            if (balance >= MATRIX_CONFIG.slotPrices[1]) {
              const slotNumber = 2;
              const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
              
              slots.push({
                id: `slot-${slotNumber}-inferred-${walletAddress.substring(0, 8)}`,
                slotNumber,
                price,
                currency: 'THC',
                purchaseDate: Date.now() - (5 * 24 * 60 * 60 * 1000), // 5 days ago
                isActive: true,
                earningsFromSlot: 0,
                referrals: []
              });
            }
          }
        }
      }
      
      // Store the discovered slots in database for future use
      if (slots.length > 0) {
        try {
          await storage.saveMatrixSlots(walletAddress, slots);
          console.log(`Saved ${slots.length} slots to database for wallet ${walletAddress}`);
        } catch (saveError) {
          console.error('Error saving slot data to database:', saveError);
        }
      }
      
      return slots;
    } catch (error) {
      console.error('Error analyzing slots from transactions:', error);
      
      // Return empty array in case of error
      return [];
    }
  }
  
  /**
   * Get direct referrals for a wallet
   */
  private async getDirectReferrals(walletAddress: string): Promise<string[]> {
    try {
      console.log(`Getting direct referrals for wallet ${walletAddress}`);
      
      // First check the direct referrals cache
      const cachedReferrals = this.directReferralsCache.get(walletAddress);
      if (cachedReferrals && cachedReferrals.length > 0) {
        return cachedReferrals;
      }
      
      // Import database for persistent storage
      const { storage } = await import('../../../storage');
      
      // Check if we have referral data in the database
      try {
        const referralData = await storage.getDirectReferrals(walletAddress);
        
        if (referralData && referralData.length > 0) {
          console.log(`Found ${referralData.length} direct referrals in database for ${walletAddress}`);
          this.directReferralsCache.set(walletAddress, referralData);
          return referralData;
        }
      } catch (dbError) {
        console.warn('Could not load direct referrals from database:', dbError);
      }
      
      // No data in cache or database, query from blockchain
      // For the real implementation, we'll look at the referral map which was populated
      // during the loadReferralData method
      const directReferrals: string[] = [];
      
      // Search through the referral map for entries where this wallet is the referrer
      for (const [wallet, referrer] of this.referralMap.entries()) {
        if (referrer === walletAddress) {
          directReferrals.push(wallet);
        }
      }
      
      // If we found direct referrals, save them to the database for future use
      if (directReferrals.length > 0) {
        console.log(`Found ${directReferrals.length} direct referrals from referral map for ${walletAddress}`);
        try {
          await storage.saveDirectReferrals(walletAddress, directReferrals);
          console.log(`Saved direct referrals to database for ${walletAddress}`);
        } catch (saveError) {
          console.error('Error saving direct referrals to database:', saveError);
        }
        
        // Update the cache
        this.directReferralsCache.set(walletAddress, directReferrals);
      }
      
      return directReferrals;
    } catch (error) {
      console.error('Error getting direct referrals:', error);
      return [];
    }
  }
  
  /**
   * Get registration time based on first transaction or cached data
   */
  private async getRegistrationTime(walletAddress: string): Promise<number> {
    try {
      // Import database for persistent storage
      const { storage } = await import('../../../storage');
      
      // Check if we have registration data in the database
      try {
        const registrationData = await storage.getMatrixRegistrationTime(walletAddress);
        
        if (registrationData && registrationData.timestamp) {
          return registrationData.timestamp;
        }
      } catch (dbError) {
        console.warn('Could not load registration time from database:', dbError);
      }
      
      // No data in database, try to determine from transactions
      // Get the earliest transaction for this wallet
      let earliestTimestamp = Date.now();
      
      try {
        // Get token transactions for this wallet
        const tokenTransactions = await this.solanaService.getTokenTransactions(
          walletAddress,
          MATRIX_CONFIG.thcTokenAddress,
          50 // Limit to 50 transactions
        );
        
        // Sort transactions by blockTime (oldest first)
        const sortedTransactions = [...tokenTransactions].sort((a, b) => 
          (a.blockTime || 0) - (b.blockTime || 0)
        );
        
        // If we have transactions, use the oldest one's timestamp
        if (sortedTransactions.length > 0 && sortedTransactions[0].blockTime) {
          earliestTimestamp = sortedTransactions[0].blockTime * 1000;
        }
      } catch (txError) {
        console.warn('Error getting token transactions for registration time:', txError);
      }
      
      // If we couldn't determine from token transactions, try SOL transactions
      if (earliestTimestamp === Date.now()) {
        try {
          // Get SOL transactions
          const solTransactions = await this.solanaService.getSolTransactions(walletAddress, 20);
          
          // Sort transactions by blockTime (oldest first)
          const sortedTransactions = [...solTransactions].sort((a, b) => 
            (a.blockTime || 0) - (b.blockTime || 0)
          );
          
          // If we have transactions, use the oldest one's timestamp
          if (sortedTransactions.length > 0 && sortedTransactions[0].blockTime) {
            earliestTimestamp = sortedTransactions[0].blockTime * 1000;
          }
        } catch (solTxError) {
          console.warn('Error getting SOL transactions for registration time:', solTxError);
        }
      }
      
      // Save the registration time to database for future use
      try {
        await storage.saveMatrixRegistrationTime(walletAddress, earliestTimestamp);
        console.log(`Saved registration time (${new Date(earliestTimestamp).toISOString()}) to database for ${walletAddress}`);
      } catch (saveError) {
        console.error('Error saving registration time to database:', saveError);
      }
      
      return earliestTimestamp;
    } catch (error) {
      console.error('Error determining registration time:', error);
      return Date.now() - (30 * 24 * 60 * 60 * 1000); // Default to 30 days ago
    }
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