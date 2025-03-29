import { 
  Connection, 
  PublicKey, 
  Keypair,
  Transaction, 
  TransactionInstruction,
  SystemProgram,
  sendAndConfirmTransaction
} from '@solana/web3.js';

// Interface for matrix participant
export interface Participant {
  address: PublicKey;
  referrer: PublicKey | null;
  registrationTime: number;
  matrixPositions: MatrixPosition[];
  directReferrals: PublicKey[];
  totalEarnings: number;
}

// Interface for a position in the matrix
export interface MatrixPosition {
  id: string;
  level: number;
  position: number;
  parentPosition: string | null;
  children: string[];
  isActive: boolean;
  earningsFromPosition: number;
}

// Configuration values for the matrix
export const MATRIX_CONFIG = {
  registrationFee: 100, // In THC tokens
  width: 2,  // Binary structure (2 positions per level)
  depth: 3,  // Initial depth is 3 levels, but can expand infinitely
  commissionRates: [0.05, 0.03, 0.02], // 5%, 3%, 2% for first 3 levels
  additionalLevelRate: 0.01, // 1% for levels beyond the initial depth
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
   * Get the matrix data for a specific user
   * 
   * @param userAddress The address of the user
   * @returns Participant object containing matrix positions and other data
   */
  async getUserMatrix(userAddress: PublicKey): Promise<Participant> {
    // In a real implementation, this would fetch data from the program account
    // For this example, we'll generate mock data
    
    // This would be replaced with actual on-chain data in production
    const mockParticipant: Participant = {
      address: userAddress,
      referrer: new PublicKey('11111111111111111111111111111111'),
      registrationTime: Date.now(),
      matrixPositions: [
        {
          id: '1',
          level: 0,
          position: 0,
          parentPosition: null,
          children: ['2', '3'],
          isActive: true,
          earningsFromPosition: 50
        },
        {
          id: '8',
          level: 1,
          position: 1,
          parentPosition: '4',
          children: [],
          isActive: true,
          earningsFromPosition: 25
        }
      ],
      directReferrals: [
        new PublicKey('22222222222222222222222222222222'),
        new PublicKey('33333333333333333333333333333333')
      ],
      totalEarnings: 75
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
   * @param participantAddress The address of the participant generating the commission
   * @returns Array of distribution transactions
   */
  async distributeCommissions(
    amount: number, 
    participantAddress: PublicKey
  ): Promise<{ recipient: PublicKey, amount: number }[]> {
    // This would be handled by the smart contract automatically
    // For this example, we'll return a mock distribution
    
    return [
      { 
        recipient: new PublicKey('44444444444444444444444444444444'), 
        amount: amount * 0.05 // 5% to direct referrer
      },
      { 
        recipient: new PublicKey('55555555555555555555555555555555'), 
        amount: amount * 0.03 // 3% to level 2
      },
      { 
        recipient: new PublicKey('66666666666666666666666666666666'), 
        amount: amount * 0.02 // 2% to level 3
      }
    ];
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