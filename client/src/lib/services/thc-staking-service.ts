import { Program, AnchorProvider, Idl, web3 } from '@project-serum/anchor';
import { Connection, PublicKey, SystemProgram, Transaction } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, Token } from '@solana/spl-token';
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token';
import idl from '../idl/thc-staking.json';

// Constants
export const THC_TOKEN_MINT = new PublicKey('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
export const VALIDATOR_IDENTITY = new PublicKey('5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej');
export const STAKING_PROGRAM_ID = new PublicKey('tHCStAk1ng1111111111111111111111111111111'); // Replace with actual deployed program ID
export const SOLANA_MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';

/**
 * THCStakingService provides methods to interact with the Solana-based THC staking program
 */
export class THCStakingService {
  private connection: Connection;
  private program: Program;
  private walletProvider: any; // Connected wallet

  /**
   * Initialize the THC Staking Service
   * 
   * @param wallet Connected wallet from Phantom or other adapter
   * @param endpoint Optional Solana cluster endpoint (defaults to mainnet)
   */
  constructor(wallet: any, endpoint: string = SOLANA_MAINNET_ENDPOINT) {
    this.walletProvider = wallet;
    this.connection = new Connection(endpoint, 'confirmed');
    
    // Create provider
    const provider = new AnchorProvider(
      this.connection,
      wallet,
      { commitment: 'confirmed' }
    );
    
    // Initialize program
    this.program = new Program(idl as Idl, STAKING_PROGRAM_ID, provider);
  }

  /**
   * Get staking authority PDA
   * This is the central authority account that manages the staking program
   */
  async getStakingAuthorityPDA(): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from('staking_authority'),
        THC_TOKEN_MINT.toBuffer()
      ],
      this.program.programId
    );
  }

  /**
   * Get user's stake account PDA
   * Each user has a unique stake account for THC tokens
   */
  async getUserStakeAccountPDA(userWallet: PublicKey): Promise<[PublicKey, number]> {
    return await PublicKey.findProgramAddress(
      [
        Buffer.from('stake_account'),
        userWallet.toBuffer(),
        THC_TOKEN_MINT.toBuffer()
      ],
      this.program.programId
    );
  }

  /**
   * Get or create a token account for the user
   * Makes sure the user has a valid THC token account
   */
  async getOrCreateTokenAccount(owner: PublicKey): Promise<PublicKey> {
    try {
      const associatedTokenAddress = await getAssociatedTokenAddress(
        THC_TOKEN_MINT,
        owner,
        false
      );
      
      // Check if account exists
      const tokenAccount = await this.connection.getAccountInfo(associatedTokenAddress);
      
      if (!tokenAccount) {
        // Create associated token account if it doesn't exist
        const transaction = new Transaction().add(
          createAssociatedTokenAccountInstruction(
            owner,
            associatedTokenAddress,
            owner,
            THC_TOKEN_MINT
          )
        );
        
        const signature = await this.walletProvider.sendTransaction(transaction, this.connection);
        await this.connection.confirmTransaction(signature, 'confirmed');
        console.log('Created associated token account:', associatedTokenAddress.toString());
      }
      
      return associatedTokenAddress;
    } catch (error) {
      console.error('Error creating token account:', error);
      throw error;
    }
  }

  /**
   * Get staking vault token account
   * The vault holds staked tokens
   */
  async getStakingVaultTokenAccount(stakingAuthorityPDA: PublicKey): Promise<PublicKey> {
    return await getAssociatedTokenAddress(
      THC_TOKEN_MINT,
      stakingAuthorityPDA,
      true // Allow PDA as token owner
    );
  }

  /**
   * Get rewards pool token account
   * The rewards pool holds THC tokens for rewards distribution
   */
  async getRewardsPoolTokenAccount(stakingAuthorityPDA: PublicKey): Promise<PublicKey> {
    // In a real implementation, this would be a different account
    // For simplicity in this example, we use the same vault for both staking and rewards
    return await getAssociatedTokenAddress(
      THC_TOKEN_MINT,
      stakingAuthorityPDA,
      true // Allow PDA as token owner
    );
  }

  /**
   * Initialize the staking program (admin only)
   * This is a one-time setup for the staking program
   */
  async initialize(): Promise<string> {
    try {
      const [stakingAuthorityPDA, _] = await this.getStakingAuthorityPDA();
      const rewardsPool = await this.getRewardsPoolTokenAccount(stakingAuthorityPDA);
      
      const tx = await this.program.methods
        .initialize()
        .accounts({
          authority: this.walletProvider.publicKey,
          stakingAuthority: stakingAuthorityPDA,
          rewardsPool: rewardsPool,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('Staking program initialized with transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Error initializing staking program:', error);
      throw error;
    }
  }

  /**
   * Stake THC tokens
   * 
   * @param amount Amount of THC tokens to stake (in token units)
   * @param lockPeriodDays Duration of staking in days
   */
  async stakeTokens(amount: number, lockPeriodDays: number): Promise<string> {
    try {
      const userWallet = this.walletProvider.publicKey;
      
      // Get PDAs and token accounts
      const [stakingAuthorityPDA, _] = await this.getStakingAuthorityPDA();
      const [userStakeAccountPDA, __] = await this.getUserStakeAccountPDA(userWallet);
      const userTokenAccount = await this.getOrCreateTokenAccount(userWallet);
      const stakingVault = await this.getStakingVaultTokenAccount(stakingAuthorityPDA);
      
      // Convert amount to lamports (considering token decimals, THC has 6 decimals)
      const amountLamports = amount * Math.pow(10, 6);
      
      const tx = await this.program.methods
        .stake(amountLamports, lockPeriodDays)
        .accounts({
          owner: userWallet,
          stakingAuthority: stakingAuthorityPDA,
          stakeAccount: userStakeAccountPDA,
          tokenAccount: userTokenAccount,
          stakingVault: stakingVault,
          tokenProgram: TOKEN_PROGRAM_ID,
          systemProgram: SystemProgram.programId,
        })
        .rpc();
      
      console.log('Staked tokens with transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Error staking tokens:', error);
      throw error;
    }
  }

  /**
   * Unstake THC tokens
   * Withdraws principal and rewards if the lock period has ended
   */
  async unstakeTokens(): Promise<string> {
    try {
      const userWallet = this.walletProvider.publicKey;
      
      // Get PDAs and token accounts
      const [stakingAuthorityPDA, _] = await this.getStakingAuthorityPDA();
      const [userStakeAccountPDA, __] = await this.getUserStakeAccountPDA(userWallet);
      const userTokenAccount = await this.getOrCreateTokenAccount(userWallet);
      const stakingVault = await this.getStakingVaultTokenAccount(stakingAuthorityPDA);
      const rewardsPool = await this.getRewardsPoolTokenAccount(stakingAuthorityPDA);
      
      const tx = await this.program.methods
        .unstake()
        .accounts({
          owner: userWallet,
          stakingAuthority: stakingAuthorityPDA,
          stakeAccount: userStakeAccountPDA,
          tokenAccount: userTokenAccount,
          stakingVault: stakingVault,
          rewardsPool: rewardsPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      console.log('Unstaked tokens with transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Error unstaking tokens:', error);
      throw error;
    }
  }

  /**
   * Claim accrued staking rewards without unstaking principal
   * Allows users to harvest rewards while keeping their tokens staked
   */
  async claimRewards(): Promise<string> {
    try {
      const userWallet = this.walletProvider.publicKey;
      
      // Get PDAs and token accounts
      const [stakingAuthorityPDA, _] = await this.getStakingAuthorityPDA();
      const [userStakeAccountPDA, __] = await this.getUserStakeAccountPDA(userWallet);
      const userTokenAccount = await this.getOrCreateTokenAccount(userWallet);
      const rewardsPool = await this.getRewardsPoolTokenAccount(stakingAuthorityPDA);
      
      const tx = await this.program.methods
        .claimRewards()
        .accounts({
          owner: userWallet,
          stakingAuthority: stakingAuthorityPDA,
          stakeAccount: userStakeAccountPDA,
          tokenAccount: userTokenAccount,
          rewardsPool: rewardsPool,
          tokenProgram: TOKEN_PROGRAM_ID,
        })
        .rpc();
      
      console.log('Claimed rewards with transaction:', tx);
      return tx;
    } catch (error) {
      console.error('Error claiming rewards:', error);
      throw error;
    }
  }

  /**
   * Get user's stake account data
   * Retrieves all information about a user's stake
   */
  async getUserStakeAccount(): Promise<any | null> {
    try {
      const userWallet = this.walletProvider.publicKey;
      const [userStakeAccountPDA, _] = await this.getUserStakeAccountPDA(userWallet);
      
      // Fetch account data
      const stakeAccount = await this.program.account.stakeAccount.fetch(userStakeAccountPDA);
      return stakeAccount;
    } catch (error) {
      // If account doesn't exist, return null
      console.log('No stake account found or error:', error);
      return null;
    }
  }

  /**
   * Get staking program stats
   * Retrieves global staking program statistics
   */
  async getStakingStats(): Promise<any> {
    try {
      const [stakingAuthorityPDA, _] = await this.getStakingAuthorityPDA();
      
      // Fetch account data
      const stakingAuthority = await this.program.account.stakingAuthority.fetch(stakingAuthorityPDA);
      
      // Calculate APY tiers based on staking period
      const apyTiers = [
        { period: 30, apy: 5 },
        { period: 90, apy: 8 },
        { period: 180, apy: 12 },
        { period: 365, apy: 15 }
      ];
      
      return {
        totalStaked: stakingAuthority.totalStaked / Math.pow(10, 6), // Convert to THC
        stakerCount: stakingAuthority.stakerCount.toString(),
        validator: stakingAuthority.validator.toString(),
        apyTiers
      };
    } catch (error) {
      console.error('Error getting staking stats:', error);
      // Return default stats if program not initialized
      return {
        totalStaked: 0,
        stakerCount: 0,
        validator: VALIDATOR_IDENTITY.toString(),
        apyTiers: [
          { period: 30, apy: 5 },
          { period: 90, apy: 8 },
          { period: 180, apy: 12 },
          { period: 365, apy: 15 }
        ]
      };
    }
  }

  /**
   * Calculate available rewards for a user
   * Estimate current rewards without claiming
   */
  async calculateAvailableRewards(): Promise<number> {
    try {
      const stakeAccount = await this.getUserStakeAccount();
      
      if (!stakeAccount || !stakeAccount.isActive) {
        return 0;
      }
      
      // Get current time
      const currentTime = Math.floor(Date.now() / 1000);
      
      // Calculate time difference in seconds
      const timeDiff = currentTime - stakeAccount.lastClaimedTime;
      
      // Convert time difference to years
      const timeInYears = timeDiff / (365 * 86400);
      
      // Calculate rewards: principal * APY * time in years
      const depositAmount = stakeAccount.depositAmount / Math.pow(10, 6); // Convert to THC
      const apy = stakeAccount.apy / 100; // Convert from percentage to decimal
      
      const rewards = depositAmount * apy * timeInYears;
      
      return rewards;
    } catch (error) {
      console.error('Error calculating available rewards:', error);
      return 0;
    }
  }
}

export default THCStakingService;