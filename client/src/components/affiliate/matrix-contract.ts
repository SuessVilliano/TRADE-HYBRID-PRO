import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';

// Interface for tiered matrix participant
export interface Participant {
  address: PublicKey;
  referrer: PublicKey | null;
  registrationTime: number;
  activeSlots: MatrixSlot[];  // All slots the user has activated
  directReferrals: PublicKey[];
  totalEarnings: number;
  totalSlotsValue: number;  // Total value of all slots purchased
  preferredCurrency: 'THC' | 'SOL' | 'USDC';
}

// Interface for a slot in the matrix
export interface MatrixSlot {
  id: string;
  slotNumber: number;  // 1-12 for the 12 slots
  price: number;       // Price paid for this slot
  currency: 'THC' | 'SOL' | 'USDC';
  purchaseDate: number;
  isActive: boolean;
  earningsFromSlot: number;
  referrals: {
    address: PublicKey;
    slotFilled: number; // Which slot they filled in your matrix
    earnings: number;   // How much you earned from this referral
    date: number;       // When they joined
  }[];
}

// Configuration values for the matrix
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
};

/**
 * This class represents the Solana program (smart contract) for the spillover affiliate matrix
 */
export class MatrixContract {
  private connection: Connection;
  private programId: PublicKey;
  
  constructor(connection: Connection, programId: string) {
    this.connection = connection;
    this.programId = new PublicKey(programId);
  }
  
  /**
   * Register a new user to the matrix
   * 
   * @param wallet The wallet of the user registering
   * @param referrer The address of the referrer
   * @returns Transaction signature
   */
  async registerUser(
    wallet: { publicKey: PublicKey, signTransaction: (tx: Transaction) => Promise<Transaction> },
    referrer: PublicKey
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    // Encode the instruction data
    const data = Buffer.from([0]); // 0 = register instruction
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: referrer, isSigner: false, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.programId,
      data
    });
    
    // Create and send the transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;
    const blockHash = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    
    const signed = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }
  
  /**
   * Purchase a slot in the matrix
   * 
   * @param wallet The wallet of the user purchasing the slot
   * @param slotNumber The slot number to purchase (1-12)
   * @param currency The currency to use for purchase
   * @returns Transaction signature
   */
  async purchaseSlot(
    wallet: { publicKey: PublicKey, signTransaction: (tx: Transaction) => Promise<Transaction> },
    slotNumber: number,
    currency: 'THC' | 'SOL' | 'USDC' = 'THC'
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    if (slotNumber < 1 || slotNumber > 12) {
      throw new Error("Invalid slot number. Must be between 1 and 12.");
    }
    
    // Get the slot price
    const slotPrice = MATRIX_CONFIG.slotPrices[slotNumber - 1];
    
    // Encode the instruction data
    // 2 = purchase slot instruction, followed by slot number and currency
    const currencyId = MATRIX_CONFIG.supportedCurrencies.indexOf(currency);
    if (currencyId === -1) {
      throw new Error(`Unsupported currency: ${currency}`);
    }
    
    const data = Buffer.from([2, slotNumber, currencyId]);
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.programId,
      data
    });
    
    // Create and send the transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;
    const blockHash = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    
    const signed = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    
    console.log(`Purchased slot ${slotNumber} for ${slotPrice} ${currency}`);
    
    // In a real implementation, this would trigger the commission distribution
    // and referral chain updates on-chain
    await this.distributeCommissions(slotPrice, slotNumber, wallet.publicKey, currency);
    
    return signature;
  }
  
  /**
   * Recycle a slot to continue earning from it
   * 
   * @param wallet The wallet of the user recycling the slot
   * @param slotNumber The slot number to recycle (1-12)
   * @returns Transaction signature
   */
  async recycleSlot(
    wallet: { publicKey: PublicKey, signTransaction: (tx: Transaction) => Promise<Transaction> },
    slotNumber: number
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    if (slotNumber < 1 || slotNumber > 12) {
      throw new Error("Invalid slot number. Must be between 1 and 12.");
    }
    
    // Check if the user has this slot
    const participant = await this.getUserMatrix(wallet.publicKey);
    const slot = participant.activeSlots.find(s => s.slotNumber === slotNumber);
    
    if (!slot) {
      throw new Error(`You don't have slot ${slotNumber}`);
    }
    
    // Encode the instruction data
    // 3 = recycle slot instruction, followed by slot number
    const data = Buffer.from([3, slotNumber]);
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.programId,
      data
    });
    
    // Create and send the transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;
    const blockHash = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    
    const signed = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    
    console.log(`Recycled slot ${slotNumber}`);
    
    return signature;
  }
  
  /**
   * Get the matrix data for a specific user
   * 
   * @param userAddress The address of the user
   * @returns Participant object containing active slots and other data
   */
  async getUserMatrix(userAddress: PublicKey): Promise<Participant> {
    // In a real implementation, this would fetch data from the program account
    // For this example, we'll generate mock data
    
    // This would be replaced with actual on-chain data in production
    const now = Date.now();
    const mockParticipant: Participant = {
      address: userAddress,
      referrer: new PublicKey('11111111111111111111111111111111'),
      registrationTime: now - 30 * 24 * 60 * 60 * 1000, // Joined 30 days ago
      activeSlots: [
        {
          id: '1',
          slotNumber: 1,
          price: MATRIX_CONFIG.slotPrices[0],
          currency: 'THC',
          purchaseDate: now - 30 * 24 * 60 * 60 * 1000,
          isActive: true,
          earningsFromSlot: 75,
          referrals: [
            {
              address: new PublicKey('22222222222222222222222222222222'),
              slotFilled: 1,
              earnings: 12.5,
              date: now - 25 * 24 * 60 * 60 * 1000
            },
            {
              address: new PublicKey('33333333333333333333333333333333'),
              slotFilled: 1,
              earnings: 12.5,
              date: now - 20 * 24 * 60 * 60 * 1000
            },
            {
              address: new PublicKey('44444444444444444444444444444444'),
              slotFilled: 1,
              earnings: 12.5,
              date: now - 15 * 24 * 60 * 60 * 1000
            }
          ]
        },
        {
          id: '2',
          slotNumber: 2,
          price: MATRIX_CONFIG.slotPrices[1],
          currency: 'THC',
          purchaseDate: now - 20 * 24 * 60 * 60 * 1000,
          isActive: true,
          earningsFromSlot: 50,
          referrals: [
            {
              address: new PublicKey('55555555555555555555555555555555'),
              slotFilled: 2,
              earnings: 25,
              date: now - 10 * 24 * 60 * 60 * 1000
            },
            {
              address: new PublicKey('66666666666666666666666666666666'),
              slotFilled: 2,
              earnings: 25,
              date: now - 5 * 24 * 60 * 60 * 1000
            }
          ]
        }
      ],
      directReferrals: [
        new PublicKey('22222222222222222222222222222222'),
        new PublicKey('33333333333333333333333333333333'),
        new PublicKey('44444444444444444444444444444444'),
        new PublicKey('55555555555555555555555555555555')
      ],
      totalEarnings: 125,
      totalSlotsValue: MATRIX_CONFIG.slotPrices[0] + MATRIX_CONFIG.slotPrices[1],
      preferredCurrency: 'THC'
    };
    
    return mockParticipant;
  }
  
  /**
   * Calculate the placement of a new user in the matrix using the spillover rules
   * 
   * This is the core algorithm for the spillover matrix placement:
   * 1. Check if the direct referrer has an available position
   * 2. If not, traverse up the tree to find the first available position
   * 3. Place the new user in that position
   * 
   * @param referrer The address of the referrer
   * @returns The position ID where the new user will be placed
   */
  async calculatePlacement(referrer: PublicKey): Promise<string> {
    // This is a simplified version that would be replaced by on-chain logic
    // The actual implementation would:
    // 1. Use breadth-first search to find the first available position
    // 2. Ensure the matrix maintains its integrity
    // 3. Handle the infinite depth aspect
    
    // Mock implementation returning a fixed position
    return '9';
  }
  
  /**
   * Distribute commissions to upline participants based on the matrix rules
   * 
   * @param amount The amount to distribute
   * @param slotNumber The slot number that generated the commission (1-12)
   * @param participantAddress The address of the participant generating the commission
   * @param currency The currency being used ('THC', 'SOL', 'USDC')
   * @returns Array of distribution transactions
   */
  async distributeCommissions(
    amount: number,
    slotNumber: number,
    participantAddress: PublicKey,
    currency: 'THC' | 'SOL' | 'USDC' = 'THC'
  ): Promise<{ 
    recipient: PublicKey, 
    amount: number,
    reason: 'direct_referral' | 'upline' | 'company_pool'
  }[]> {
    // In a real implementation, this would be handled by the smart contract
    // Following our distribution rules: 50% to direct referrer, 30% to upline, 20% to company
    
    // Get the participant's referrer
    const participant = await this.getUserMatrix(participantAddress);
    
    if (!participant.referrer) {
      // If no referrer, everything goes to company pool
      return [{ 
        recipient: new PublicKey('CompanyPoolAddressXXXXXXXXXXXXXXXX'), 
        amount: amount,
        reason: 'company_pool'
      }];
    }
    
    // Get upline (referrer chain)
    const directReferrer = participant.referrer;
    
    // Get upline referrers (would be fetched from chain in real implementation)
    const uplineReferrers = [
      new PublicKey('55555555555555555555555555555555'),
      new PublicKey('66666666666666666666666666666666'),
      new PublicKey('77777777777777777777777777777777')
    ];
    
    // Create the distribution
    const distributions = [];
    
    // Direct referrer gets 50%
    distributions.push({
      recipient: directReferrer,
      amount: amount * MATRIX_CONFIG.commissionDistribution.directReferrer,
      reason: 'direct_referral' as const
    });
    
    // Upline referrers split 30%
    const uplineAmount = amount * MATRIX_CONFIG.commissionDistribution.uplineReferrers;
    const uplineShare = uplineAmount / uplineReferrers.length;
    
    for (const referrer of uplineReferrers) {
      distributions.push({
        recipient: referrer,
        amount: uplineShare,
        reason: 'upline' as const
      });
    }
    
    // Company pool gets 20%
    distributions.push({
      recipient: new PublicKey('CompanyPoolAddressXXXXXXXXXXXXXXXX'),
      amount: amount * MATRIX_CONFIG.commissionDistribution.companyPool,
      reason: 'company_pool' as const
    });
    
    return distributions;
  }
  
  /**
   * Claim accumulated commissions
   * 
   * @param wallet The wallet claiming commissions
   * @returns Transaction signature
   */
  async claimCommissions(
    wallet: { publicKey: PublicKey, signTransaction: (tx: Transaction) => Promise<Transaction> }
  ): Promise<string> {
    if (!wallet.publicKey) {
      throw new Error("Wallet not connected");
    }
    
    // Encode the instruction data
    const data = Buffer.from([1]); // 1 = claim commissions instruction
    
    // Create the transaction instruction
    const instruction = new TransactionInstruction({
      keys: [
        { pubkey: wallet.publicKey, isSigner: true, isWritable: true },
        { pubkey: SystemProgram.programId, isSigner: false, isWritable: false }
      ],
      programId: this.programId,
      data
    });
    
    // Create and send the transaction
    const transaction = new Transaction().add(instruction);
    transaction.feePayer = wallet.publicKey;
    const blockHash = await this.connection.getRecentBlockhash();
    transaction.recentBlockhash = blockHash.blockhash;
    
    const signed = await wallet.signTransaction(transaction);
    const signature = await this.connection.sendRawTransaction(signed.serialize());
    await this.connection.confirmTransaction(signature);
    
    return signature;
  }
  
  /**
   * Get the statistics for the matrix program
   * 
   * @returns Object containing global stats
   */
  async getGlobalStats(): Promise<{
    totalParticipants: number;
    totalCommissionsPaid: number;
    topEarners: { address: PublicKey, earnings: number }[];
  }> {
    // In a real implementation, this would fetch data from the program account
    
    return {
      totalParticipants: 1258,
      totalCommissionsPaid: 156750,
      topEarners: [
        { address: new PublicKey('77777777777777777777777777777777'), earnings: 12500 },
        { address: new PublicKey('88888888888888888888888888888888'), earnings: 9800 },
        { address: new PublicKey('99999999999999999999999999999999'), earnings: 7600 }
      ]
    };
  }
}

// Create a singleton instance that can be imported throughout the app
// Note: Replace the program ID with the actual deployed program in production
let matrixContractInstance: MatrixContract | null = null;

export const getMatrixContract = (connection: Connection): MatrixContract => {
  if (!matrixContractInstance) {
    // This is a mock program ID - would be replaced with the actual deployed program ID
    const programId = 'ThMAt1xpFWNcgHpXhbMCMvchUhGmpBXPYGcYNM88wWW';
    matrixContractInstance = new MatrixContract(connection, programId);
  }
  return matrixContractInstance;
};