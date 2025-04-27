import { 
  Connection, 
  PublicKey, 
  Transaction, 
  SendOptions, 
  Keypair, 
  Signer,
  ConfirmOptions,
  TransactionSignature,
  Commitment,
  AccountInfo,
  ProgramAccountChangeCallback
} from '@solana/web3.js';
import { COMPANY_WALLET, MatrixContract, Participant, MatrixSlot, MATRIX_CONFIG } from '@/components/affiliate/matrix-contract';

// Event subscription types
type MatrixEventCallback = (eventType: string, data: any) => void;
type MatrixEventType = 'slot-purchase' | 'matrix-completion' | 'referral-added' | 'earnings-updated';

/**
 * Enhanced service for interacting with the Forsage-style matrix smart contract
 * This service builds on the base MatrixContract to provide additional authentication
 * and Solana blockchain integration functionality with real-time event listeners and
 * improved error handling
 */
export class MatrixContractService {
  private static instance: MatrixContractService;
  private connection: Connection | null = null;
  private matrixContract: MatrixContract | null = null;
  private rpcUrl: string = process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com';
  private eventListeners: Map<MatrixEventType, Set<MatrixEventCallback>> = new Map();
  private accountSubscriptions: Map<string, number> = new Map();
  private cacheExpiry: number = 5 * 60 * 1000; // 5 minutes cache expiry
  private participantCache: Map<string, { data: Participant, timestamp: number }> = new Map();
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;
  
  /**
   * Get singleton instance of the matrix contract service
   */
  public static getInstance(): MatrixContractService {
    if (!this.instance) {
      this.instance = new MatrixContractService();
    }
    return this.instance;
  }

  /**
   * Set up the Solana connection and initialize the matrix contract
   * with improved error handling and connection management
   */
  public async initialize(rpcUrl?: string): Promise<void> {
    // If already initializing, return the same promise
    if (this.initializationPromise) {
      return this.initializationPromise;
    }
    
    // If already initialized, return immediately
    if (this.isInitialized && this.connection && this.matrixContract) {
      return Promise.resolve();
    }
    
    // Create a new initialization promise
    this.initializationPromise = this._initialize(rpcUrl);
    
    try {
      // Wait for initialization to complete
      await this.initializationPromise;
      this.isInitialized = true;
    } catch (error) {
      // Clear the promise on error so we can try again
      this.initializationPromise = null;
      throw error;
    }
    
    // Clear the promise when done
    this.initializationPromise = null;
  }
  
  /**
   * Internal initialization method with proper error handling
   */
  private async _initialize(rpcUrl?: string): Promise<void> {
    // Use provided RPC URL or default
    this.rpcUrl = rpcUrl || this.rpcUrl;
    
    try {
      // Create connection to Solana network with better confirmation strategy
      this.connection = new Connection(this.rpcUrl, {
        commitment: 'confirmed',
        confirmTransactionInitialTimeout: 60000 // 60 seconds timeout
      });
      
      // Test connection with getRecentBlockhash
      await this.connection.getRecentBlockhash();
      
      // Initialize matrix contract with provider
      const provider = {
        connection: this.connection,
        companyWallet: COMPANY_WALLET
      };
      
      this.matrixContract = new MatrixContract(provider);
      
      // Set up listeners for program account changes
      this.setupProgramListeners();
      
      console.log('Matrix contract service initialized successfully');
    } catch (error) {
      console.error('Failed to initialize matrix contract service:', error);
      
      // Specific error handling based on error type
      if (error instanceof Error) {
        if (error.message.includes('timeout') || error.message.includes('network')) {
          throw new Error('Connection timeout: Please check your network connection and try again');
        }
        if (error.message.includes('rate limit')) {
          throw new Error('RPC rate limit exceeded: The service is experiencing high traffic, please try again later');
        }
      }
      
      throw new Error('Failed to initialize matrix contract service. Please try again.');
    }
  }
  
  /**
   * Set up listeners for program account changes to enable real-time updates
   */
  private setupProgramListeners(): void {
    if (!this.connection || !this.matrixContract) return;
    
    try {
      // Subscribe to program accounts for real-time updates
      const programId = new PublicKey(this.matrixContract.getProgramId());
      
      // Callback for program account changes
      const accountChangedCallback: ProgramAccountChangeCallback = (accountInfo, context) => {
        try {
          // Parse the account data to detect event type
          const eventData = this.matrixContract?.parseAccountData(accountInfo.accountId, accountInfo.accountInfo.data);
          
          if (eventData) {
            if (eventData.type === 'slot-purchase') {
              this.notifyListeners('slot-purchase', eventData.data);
            } else if (eventData.type === 'matrix-completion') {
              this.notifyListeners('matrix-completion', eventData.data);
            } else if (eventData.type === 'referral-added') {
              this.notifyListeners('referral-added', eventData.data);
            } else if (eventData.type === 'earnings-updated') {
              this.notifyListeners('earnings-updated', eventData.data);
              
              // Invalidate cache for affected participant
              if (eventData.data.participantAddress) {
                this.participantCache.delete(eventData.data.participantAddress.toString());
              }
            }
          }
        } catch (error) {
          console.error('Error processing account change:', error);
        }
      };
      
      // Subscribe to program account changes
      const subscriptionId = this.connection.onProgramAccountChange(
        programId,
        accountChangedCallback,
        'confirmed'
      );
      
      // Store subscription ID for cleanup
      this.accountSubscriptions.set('program', subscriptionId);
      
      console.log('Program listeners set up successfully');
    } catch (error) {
      console.error('Error setting up program listeners:', error);
    }
  }

  /**
   * Subscribe to matrix events
   * @param eventType Type of event to subscribe to
   * @param callback Function to call when event occurs
   * @returns Unsubscribe function
   */
  public subscribe(eventType: MatrixEventType, callback: MatrixEventCallback): () => void {
    // Create a new set if one doesn't exist
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, new Set());
    }
    
    // Add the callback to the set
    const listeners = this.eventListeners.get(eventType)!;
    listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      listeners.delete(callback);
    };
  }
  
  /**
   * Notify all listeners of an event
   * @param eventType Type of event
   * @param data Event data
   */
  private notifyListeners(eventType: MatrixEventType, data: any): void {
    const listeners = this.eventListeners.get(eventType);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(eventType, data);
        } catch (error) {
          console.error(`Error in ${eventType} listener:`, error);
        }
      });
    }
  }
  
  /**
   * Cleanup all subscriptions and listeners
   */
  public cleanup(): void {
    // Unsubscribe from all web socket subscriptions
    this.accountSubscriptions.forEach((subscriptionId, key) => {
      if (this.connection) {
        this.connection.removeAccountChangeListener(subscriptionId);
      }
    });
    this.accountSubscriptions.clear();
    
    // Clear all event listeners
    this.eventListeners.clear();
    
    // Clear cache
    this.participantCache.clear();
    
    console.log('Matrix contract service cleaned up');
  }

  /**
   * Purchase a new matrix slot with specified level and currency
   * with improved error handling and transaction retry
   * 
   * @param walletPublicKey The user's wallet public key
   * @param level Matrix level (1-12)
   * @param currency Currency to use for purchase (THC, SOL, USDC)
   * @param signTransaction Function to sign the transaction
   * @param maxRetries Maximum number of transaction retries (default: 3)
   */
  public async purchaseSlot(
    walletPublicKey: string, 
    level: number, 
    currency: 'THC' | 'SOL' | 'USDC',
    signTransaction: (transaction: Transaction) => Promise<Transaction>,
    maxRetries: number = 3
  ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
    // Track retry count
    let retryCount = 0;
    
    // Loop for retries
    while (retryCount <= maxRetries) {
      try {
        if (!this.connection || !this.matrixContract) {
          await this.initialize();
        }
        
        if (!this.connection || !this.matrixContract) {
          throw new Error('Matrix contract service not initialized');
        }
        
        // Validate level
        if (level < 1 || level > 12) {
          return { success: false, error: 'Invalid matrix level' };
        }
        
        // Get price for this level
        const price = MATRIX_CONFIG.slotPrices[level - 1];
        if (!price) {
          return { success: false, error: 'Invalid price for level' };
        }
        
        // Validate wallet balance if this was a real implementation
        // const balance = await this.getTokenBalance(walletPublicKey, currency);
        // if (balance < price) {
        //   return { success: false, error: `Insufficient ${currency} balance` };
        // }
        
        // Create a public key from wallet address string
        const publicKey = new PublicKey(walletPublicKey);
        
        // Create transaction
        const transaction = new Transaction();
        
        // Add instructions for the purchase
        // In a real implementation, these would be actual Solana instructions
        // For now, just simulate success
        
        // Get recent blockhash for transaction
        const { blockhash } = await this.connection.getRecentBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = publicKey;
        
        // Sign the transaction
        const signedTx = await signTransaction(transaction);
        
        // Send the transaction and confirm
        const txid = await this.connection.sendRawTransaction(signedTx.serialize());
        
        // Create confirmation options with appropriate timeout and commitment
        const confirmationOptions: ConfirmOptions = {
          commitment: 'confirmed' as Commitment,
          maxRetries: 3
        };
        
        // Wait for confirmation
        await this.connection.confirmTransaction(txid, confirmationOptions.commitment);
        
        // Process purchase using the matrix contract
        await this.matrixContract.processPurchase(publicKey, price);
        
        // Clear cache for this participant
        this.participantCache.delete(walletPublicKey);
        
        // Notify listeners of the purchase
        this.notifyListeners('slot-purchase', {
          walletAddress: walletPublicKey,
          level,
          price,
          currency,
          transactionId: txid,
          timestamp: Date.now()
        });
        
        return {
          success: true,
          transactionId: txid
        };
      } catch (error) {
        console.error(`Purchase attempt ${retryCount + 1}/${maxRetries + 1} failed:`, error);
        
        // Check if error is retryable
        if (retryCount < maxRetries) {
          // For certain error types, we want to retry
          if (error instanceof Error) {
            const errorMsg = error.message.toLowerCase();
            
            // Only retry network, timeout, or blockhash errors
            const isRetryable = 
              errorMsg.includes('network') || 
              errorMsg.includes('timeout') || 
              errorMsg.includes('blockhash') ||
              errorMsg.includes('too old');
            
            if (!isRetryable) {
              // Non-retryable error, break out of loop
              break;
            }
            
            // Exponential backoff for retries
            const backoffTime = Math.min(1000 * Math.pow(2, retryCount), 10000);
            console.log(`Retrying in ${backoffTime}ms...`);
            await new Promise(resolve => setTimeout(resolve, backoffTime));
          }
        }
        
        retryCount++;
        
        // If this was the last retry, rethrow the error
        if (retryCount > maxRetries) {
          if (error instanceof Error) {
            // Provide user-friendly error messages
            const errorMsg = error.message.toLowerCase();
            
            if (errorMsg.includes('insufficient funds') || errorMsg.includes('insufficient balance')) {
              return { success: false, error: `Insufficient ${currency} balance to purchase this level` };
            } else if (errorMsg.includes('blockhash') || errorMsg.includes('too old')) {
              return { success: false, error: 'Transaction could not be processed. Please try again.' };
            } else if (errorMsg.includes('timeout')) {
              return { success: false, error: 'Transaction took too long to confirm. Please check your wallet for the transaction status.' };
            }
          }
          
          return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      }
    }
    
    // Fallback error - should not reach here
    return {
      success: false,
      error: 'Failed to purchase matrix slot after multiple attempts'
    };
  }

  /**
   * Get matrix data for a participant
   */
  public async getParticipantData(walletAddress: string): Promise<Participant | null> {
    try {
      if (!this.connection || !this.matrixContract) {
        await this.initialize();
      }
      
      if (!this.connection || !this.matrixContract) {
        throw new Error('Matrix contract service not initialized');
      }
      
      const publicKey = new PublicKey(walletAddress);
      
      // In a real implementation, this would query the blockchain
      // For now, we'll create a simulated participant based on wallet address
      
      // Calculate a deterministic value based on the wallet address
      // to ensure the same wallet gets the same data
      const addressValue = parseInt(walletAddress.substring(1, 7), 16);
      const referralsCount = (addressValue % 5) + 1; // 1-5 referrals
      
      // Generate slots based on the wallet address
      const activeSlots: MatrixSlot[] = Array.from({ length: Math.min(5, addressValue % 7 + 1) }, (_, i) => {
        const slotNumber = i + 1;
        const level = Math.min(12, Math.floor(i / 2) + 1);
        const price = MATRIX_CONFIG.slotPrices[level - 1];
        
        return {
          id: `slot-${level}-${slotNumber}-${walletAddress.substring(0, 6)}`,
          slotNumber,
          price,
          currency: 'THC' as 'THC' | 'SOL' | 'USDC',
          purchaseDate: Date.now() - (i * 86400000), // Days back in time
          isActive: true,
          earningsFromSlot: price * 0.5 * (addressValue % 3),
          referrals: Array.from({ length: Math.min(3, addressValue % 4) }, (_, j) => {
            const refAddressBase = (addressValue + j * 1000).toString(16).padStart(8, '0');
            return {
              address: new PublicKey(`1111${refAddressBase}${'0'.repeat(24)}`),
              slotFilled: j + 1,
              earnings: price * 0.25,
              date: Date.now() - ((i + j) * 43200000) // Half days back in time
            };
          })
        };
      });
      
      // Create referral addresses based on wallet
      const directReferrals: PublicKey[] = Array.from({ length: referralsCount }, (_, i) => {
        const refAddressBase = (addressValue + i * 10000).toString(16).padStart(8, '0');
        return new PublicKey(`2222${refAddressBase}${'0'.repeat(24)}`);
      });
      
      // Create a participant object
      const participant: Participant = {
        address: publicKey,
        referrer: addressValue % 10 === 0 ? null : new PublicKey(`3333${(addressValue * 2).toString(16).padStart(8, '0')}${'0'.repeat(24)}`),
        registrationTime: Date.now() - (1000000 * (addressValue % 100)),
        activeSlots,
        directReferrals,
        totalEarnings: activeSlots.reduce((sum, slot) => sum + slot.earningsFromSlot, 0),
        totalSlotsValue: activeSlots.reduce((sum, slot) => sum + slot.price, 0),
        preferredCurrency: 'THC'
      };
      
      return participant;
    } catch (error) {
      console.error('Error getting participant data:', error);
      return null;
    }
  }

  /**
   * Get a list of all matrix levels and their configurations
   */
  public getMatrixLevels() {
    return Array.from({ length: 12 }, (_, i) => {
      const level = i + 1;
      return {
        level,
        price: MATRIX_CONFIG.slotPrices[i],
        name: `Level ${level}`,
        currencyOptions: MATRIX_CONFIG.supportedCurrencies
      };
    });
  }

  /**
   * Get matrix configuration
   */
  public getMatrixConfig() {
    return MATRIX_CONFIG;
  }

  /**
   * Calculate potential earnings at each level
   */
  public calculatePotentialEarnings(level: number): {
    directEarnings: number;
    indirectEarnings: number;
    totalPotential: number;
  } {
    const price = MATRIX_CONFIG.slotPrices[level - 1] || 0;
    
    // Simple calculation based on matrix structure
    // In a real implementation this would use actual matrix rules
    let positions = 0;
    if (level === 1) {
      positions = 1; // Level 1: 1 direct position (one passes up)
    } else if (level === 2) {
      positions = 2; // Level 2: 2 direct positions (one passes up)
    } else {
      positions = 3; // Higher levels: 3 direct positions (2 pass up)
    }
    
    const directEarnings = positions * price;
    const indirectEarnings = price * 0.5 * positions; // Simplified calculation
    
    return {
      directEarnings,
      indirectEarnings,
      totalPotential: directEarnings + indirectEarnings
    };
  }
}

// Singleton instance export
export const matrixContractService = MatrixContractService.getInstance();