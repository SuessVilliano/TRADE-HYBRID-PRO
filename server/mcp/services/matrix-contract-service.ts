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
      const { storage } = await import('../../storage');
      
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
      const { storage } = await import('../../storage');
      
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
            // Check if amount matches a slot price
            let matchedSlotNumber = -1;
            const txAmount = parseFloat(tx.amount);
            
            // First check if the memo contains explicit slot information
            if (txDetails.memo) {
              const memo = txDetails.memo.toLowerCase();
              
              // Look for slot purchase patterns in memo
              // Format 1: "slot:3" or "purchase-slot-3"
              const slotMatch = memo.match(/slot[-:]?(\d+)/i) || 
                               memo.match(/purchase[-:]?slot[-:]?(\d+)/i) ||
                               memo.match(/buy[-:]?slot[-:]?(\d+)/i);
              
              if (slotMatch && slotMatch[1]) {
                matchedSlotNumber = parseInt(slotMatch[1], 10);
              }
              // Format 2: "matrix level 5" or "level:5"
              else {
                const levelMatch = memo.match(/matrix[-\s]?level[-:\s]?(\d+)/i) || 
                                  memo.match(/level[-:\s]?(\d+)/i);
                
                if (levelMatch && levelMatch[1]) {
                  matchedSlotNumber = parseInt(levelMatch[1], 10);
                }
              }
            }
            
            // If no slot info in memo, try to match by amount
            if (matchedSlotNumber === -1 && !isNaN(txAmount)) {
              for (let i = 0; i < MATRIX_CONFIG.slotPrices.length; i++) {
                const price = MATRIX_CONFIG.slotPrices[i];
                
                // Check if transaction amount is within 1% of a slot price (to account for fees)
                if (Math.abs(txAmount - price) / price < 0.01) {
                  matchedSlotNumber = i + 1; // +1 because slot numbers are 1-based
                  break;
                }
              }
            }
            
            // If we identified a valid slot number and haven't processed it yet
            if (matchedSlotNumber >= 1 && matchedSlotNumber <= 12 && !processedSlots.has(matchedSlotNumber)) {
              processedSlots.add(matchedSlotNumber);
              
              const price = MATRIX_CONFIG.slotPrices[matchedSlotNumber - 1];
              
              // Create the slot entry
              const newSlot: MatrixSlot = {
                id: `slot-${matchedSlotNumber}-${tx.txHash.substring(0, 8)}`,
                slotNumber: matchedSlotNumber,
                price,
                currency: 'THC', // Default to THC, but could be derived from tx data
                purchaseDate: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                isActive: true,
                earningsFromSlot: 0,
                referrals: []
              };
              
              // Check for referrer info in transaction
              if (txDetails.memo) {
                const memo = txDetails.memo.toLowerCase();
                
                // Check various referrer patterns in memo
                const referrerPatterns = [
                  /ref(?:errer)?[-:\s]([a-zA-Z0-9]{32,44})/i,  // referrer:address
                  /ref(?:erral)?[-:\s]from[-:\s]([a-zA-Z0-9]{32,44})/i,  // referral from address
                  /via[-:\s]([a-zA-Z0-9]{32,44})/i,  // via:address
                  /referred[-:\s]by[-:\s]([a-zA-Z0-9]{32,44})/i  // referred by address
                ];
                
                for (const pattern of referrerPatterns) {
                  const match = memo.match(pattern);
                  if (match && match[1]) {
                    // Found a referrer for this slot purchase
                    const referrerAddress = match[1];
                    
                    // Update referral map
                    this.referralMap.set(walletAddress, referrerAddress);
                    
                    // Update direct referrals cache
                    const directReferrals = this.directReferralsCache.get(referrerAddress) || [];
                    if (!directReferrals.includes(walletAddress)) {
                      directReferrals.push(walletAddress);
                      this.directReferralsCache.set(referrerAddress, directReferrals);
                    }
                    
                    break;
                  }
                }
              }
              
              slots.push(newSlot);
              console.log(`Found slot purchase transaction for slot ${matchedSlotNumber}`);
            }
          }
          // If this is a transfer from the company wallet, it might be earnings
          else if (tx.sender === companyWallet) {
            // Check memo field for earnings information
            if (txDetails.memo) {
              const memo = txDetails.memo.toLowerCase();
              
              // Look for various earnings patterns in memo
              const earningsPatterns = [
                /earnings[-:\s]?slot[-:\s]?(\d+)/i,   // earnings:slot:3
                /slot[-:\s]?(\d+)[-:\s]?earnings/i,   // slot-3-earnings
                /commission[-:\s]?slot[-:\s]?(\d+)/i, // commission:slot:3
                /slot[-:\s]?(\d+)[-:\s]?commission/i, // slot-3-commission
                /matrix[-:\s]?level[-:\s]?(\d+)[-:\s]?(?:earnings|commission)/i,  // matrix level 3 earnings
                /(?:earnings|commission)[-:\s]?(?:for|from)[-:\s]?(?:level|slot)[-:\s]?(\d+)/i  // earnings from level 3
              ];
              
              let matchedSlotNumber = -1;
              
              // Try to match any of the earnings patterns
              for (const pattern of earningsPatterns) {
                const match = memo.match(pattern);
                if (match && match[1]) {
                  matchedSlotNumber = parseInt(match[1], 10);
                  break;
                }
              }
              
              // If no explicit slot match, try to determine from the amount
              if (matchedSlotNumber === -1) {
                const txAmount = parseFloat(tx.amount);
                
                if (!isNaN(txAmount) && txAmount > 0) {
                  // Calculate expected commission amounts for each slot
                  for (let i = 0; i < MATRIX_CONFIG.slotPrices.length; i++) {
                    const slotPrice = MATRIX_CONFIG.slotPrices[i];
                    const directCommission = slotPrice * MATRIX_CONFIG.commissionDistribution.directReferrer;
                    
                    // Check if amount matches a typical commission amount (within 5%)
                    if (Math.abs(txAmount - directCommission) / directCommission < 0.05) {
                      matchedSlotNumber = i + 1; // +1 because slot numbers are 1-based
                      break;
                    }
                  }
                }
              }
              
              // If we identified a valid slot number
              if (matchedSlotNumber >= 1 && matchedSlotNumber <= 12) {
                // Find matching slot or create a new one
                let slot = slots.find(s => s.slotNumber === matchedSlotNumber);
                
                if (!slot) {
                  // This is earnings for a slot we haven't seen purchase transaction for
                  // Create the slot entry
                  const price = MATRIX_CONFIG.slotPrices[matchedSlotNumber - 1];
                  
                  slot = {
                    id: `slot-${matchedSlotNumber}-earnings-${tx.txHash.substring(0, 8)}`,
                    slotNumber: matchedSlotNumber,
                    price,
                    currency: 'THC',
                    purchaseDate: tx.blockTime ? tx.blockTime * 1000 : Date.now(),
                    isActive: true,
                    earningsFromSlot: 0,
                    referrals: []
                  };
                  
                  slots.push(slot);
                  processedSlots.add(matchedSlotNumber);
                }
                
                // Add earnings to the slot
                const amountValue = parseFloat(tx.amount);
                if (!isNaN(amountValue) && amountValue > 0) {
                  slot.earningsFromSlot += amountValue;
                  
                  // Try to identify the referral source from the memo
                  const referrerPatterns = [
                    /ref(?:errer)?[-:\s]([a-zA-Z0-9]{32,44})/i,
                    /commission[-:\s]from[-:\s]([a-zA-Z0-9]{32,44})/i,
                    /earnings[-:\s]via[-:\s]([a-zA-Z0-9]{32,44})/i,
                    /referred[-:\s]by[-:\s]([a-zA-Z0-9]{32,44})/i
                  ];
                  
                  let referrerAddress = null;
                  
                  for (const pattern of referrerPatterns) {
                    const match = memo.match(pattern);
                    if (match && match[1]) {
                      referrerAddress = match[1];
                      break;
                    }
                  }
                  
                  // If we couldn't identify a referrer from the memo, look in the transaction logs
                  if (!referrerAddress && txDetails.logs) {
                    // Analyze logs for patterns indicating the source of the commission
                    for (const log of txDetails.logs) {
                      // Look for specific program invocations or transfer instructions
                      // that might indicate the source of the referral
                      if (log.includes('Transfer') && log.includes('From:')) {
                        const transferMatch = log.match(/From: ([a-zA-Z0-9]{32,44})/);
                        if (transferMatch && transferMatch[1] && transferMatch[1] !== companyWallet) {
                          referrerAddress = transferMatch[1];
                          break;
                        }
                      }
                    }
                  }
                  
                  // Add the referral information to the slot
                  if (referrerAddress) {
                    // Check if we already have this referrer in the slot
                    const existingReferral = slot.referrals.find(r => r.address === referrerAddress);
                    
                    if (existingReferral) {
                      // Update existing referral
                      existingReferral.earnings += amountValue;
                    } else {
                      // Add new referral
                      slot.referrals.push({
                        address: referrerAddress,
                        slotFilled: slot.referrals.length + 1,
                        earnings: amountValue,
                        date: tx.blockTime ? tx.blockTime * 1000 : Date.now()
                      });
                      
                      // Also update our referral maps
                      this.referralMap.set(referrerAddress, walletAddress);
                      
                      // Update direct referrals cache
                      const directReferrals = this.directReferralsCache.get(walletAddress) || [];
                      if (!directReferrals.includes(referrerAddress)) {
                        directReferrals.push(referrerAddress);
                        this.directReferralsCache.set(walletAddress, directReferrals);
                      }
                    }
                  }
                  
                  console.log(`Found earnings transaction for slot ${matchedSlotNumber}: ${amountValue} THC`);
                }
              }
            }
          }
        } catch (txError) {
          console.warn(`Error analyzing transaction ${tx.txHash}:`, txError);
          continue;
        }
      }
      
      // If no slots were found from real transactions, try to identify potential slots
      // by analyzing other transaction data and wallet activity
      if (slots.length === 0) {
        console.log(`No slot transactions found directly, checking for additional evidence`);
        
        try {
          // Get all transaction history for this wallet, not just token transfers
          const allTransactions = await this.solanaService.getRecentTransactions(walletAddress, 50);
          
          // Check if any transactions involve the company wallet
          let hasInteractedWithCompany = false;
          let oldestInteraction = 0;
          
          for (const tx of allTransactions) {
            if (tx.from === companyWallet || tx.to === companyWallet || 
                tx.signers?.includes(companyWallet) || tx.signers?.includes(walletAddress)) {
              hasInteractedWithCompany = true;
              if (tx.blockTime && (!oldestInteraction || tx.blockTime < oldestInteraction)) {
                oldestInteraction = tx.blockTime;
              }
            }
          }
          
          // If there's interaction with the company wallet, they likely have at least slot 1
          if (hasInteractedWithCompany) {
            console.log(`Found evidence of interaction with company wallet, inferring basic slot`);
            
            const slotNumber = 1;
            const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
            const purchaseDate = oldestInteraction ? oldestInteraction * 1000 : Date.now() - (30 * 24 * 60 * 60 * 1000);
            
            slots.push({
              id: `slot-${slotNumber}-inferred-${walletAddress.substring(0, 8)}`,
              slotNumber,
              price,
              currency: 'THC',
              purchaseDate,
              isActive: true,
              earningsFromSlot: 0,
              referrals: []
            });
          }
        } catch (txError) {
          console.warn(`Error analyzing general transactions:`, txError);
        }
        
        // If still no slots found, check token balances as a last resort
        if (slots.length === 0) {
          try {
            console.log(`Checking token balances for evidence of matrix participation`);
            
            const walletInfo = await this.solanaService.getWalletInfo(walletAddress);
            
            // Look for THC token balance
            const thcBalance = walletInfo.tokenBalances.find(tb => 
              tb.token.address === MATRIX_CONFIG.thcTokenAddress);
            
            // Look for transaction volume
            let transactionVolume = 0;
            if (walletInfo.stats && walletInfo.stats.transactionVolume) {
              transactionVolume = walletInfo.stats.transactionVolume;
            }
            
            // Check if user has sufficient balance or transaction volume to suggest matrix participation
            const hasBalance = thcBalance && parseFloat(thcBalance.balance) / (10 ** thcBalance.token.decimals) >= MATRIX_CONFIG.slotPrices[0];
            const hasVolume = transactionVolume > 0;
            
            if (hasBalance || hasVolume) {
              console.log(`Found evidence of THC token activity, inferring basic slot`);
              
              // Create the most basic slot as a starting point
              const slotNumber = 1;
              const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
              
              slots.push({
                id: `slot-${slotNumber}-token-evidence-${walletAddress.substring(0, 8)}`,
                slotNumber,
                price,
                currency: 'THC',
                purchaseDate: Date.now() - (30 * 24 * 60 * 60 * 1000), // Default to a month ago
                isActive: true,
                earningsFromSlot: 0,
                referrals: []
              });
            }
          } catch (walletError) {
            console.warn(`Error checking wallet info:`, walletError);
          }
        }
      }
      
      // If we still have no information, check our referral map
      // If this wallet is a referrer for others, they must have at least one slot
      if (slots.length === 0 && this.directReferralsCache.has(walletAddress)) {
        const referrals = this.directReferralsCache.get(walletAddress);
        if (referrals && referrals.length > 0) {
          console.log(`Wallet ${walletAddress} has ${referrals.length} referrals but no detected slots, inferring slot 1`);
          
          const slotNumber = 1;
          const price = MATRIX_CONFIG.slotPrices[slotNumber - 1];
          
          slots.push({
            id: `slot-${slotNumber}-referred-${walletAddress.substring(0, 8)}`,
            slotNumber,
            price,
            currency: 'THC',
            purchaseDate: Date.now() - (45 * 24 * 60 * 60 * 1000), // Default to 45 days ago (before referrals)
            isActive: true,
            earningsFromSlot: referrals.length * price * 0.1, // Rough estimate based on referrals
            referrals: []
          });
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
      const { storage } = await import('../../storage');
      
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
      const { storage } = await import('../../storage');
      
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