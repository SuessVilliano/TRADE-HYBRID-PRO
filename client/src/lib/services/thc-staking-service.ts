import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { calculateStakingApy } from '../contracts/thc-token-info';

// Constants
export const THC_TOKEN_MINT = new PublicKey('4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4');
export const VALIDATOR_IDENTITY = new PublicKey('5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej');
export const SOLANA_MAINNET_ENDPOINT = 'https://api.mainnet-beta.solana.com';

// Interfaces for our stake data
export interface StakeAccount {
  owner: string;
  depositAmount: number;
  startTime: number;
  unlockTime: number;
  apy: number;
  rewardsClaimed: number;
  lastClaimedTime: number;
  isActive: boolean;
  
  // Enhanced properties for UI experience
  stakeId?: string;                 // Unique identifier for this stake
  lockPeriodDays?: number;          // Original lock period in days
  formattedStartDate?: string;      // Human-readable start date
  formattedEndDate?: string;        // Human-readable end date
  stakingTier?: string;             // Tier name (e.g., "Diamond Tier")
  estimatedRewardsAtMaturity?: number; // Estimated rewards at full term
}

export interface StakingStats {
  totalStaked: number;
  stakerCount: number;
  validator: string;
  apyTiers: Array<{period: number, apy: number}>;
  
  // Enhanced stats data
  validatorUptime?: string;
  epoch?: number;
  epochProgress?: number;
  rewardsDistributed?: number;
}

/**
 * THCStakingService provides methods to interact with the Solana-based THC staking program
 * This is a simplified implementation that will be replaced with a full Anchor program integration
 */
export class THCStakingService {
  private connection: Connection;
  private wallet: any; // Connected wallet
  private mockStakeData: Map<string, StakeAccount> = new Map();
  private mockStakingStats: StakingStats = {
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

  /**
   * Initialize the THC Staking Service
   * 
   * @param wallet Connected wallet from Phantom or other adapter
   * @param endpoint Optional Solana cluster endpoint (defaults to mainnet)
   */
  constructor(wallet: any, endpoint: string = SOLANA_MAINNET_ENDPOINT) {
    this.wallet = wallet;
    this.connection = new Connection(endpoint, 'confirmed');
    
    // For demo purposes, let's simulate some existing stake data
    this.initializeMockData();
  }

  /**
   * Initialize mock data for demo purposes
   * In the real implementation, this would be replaced with Anchor program calls
   */
  private initializeMockData(): void {
    // Randomize total staked amount between 50k and 150k THC
    this.mockStakingStats.totalStaked = 50000 + Math.floor(Math.random() * 100000);
    
    // Randomize staker count between 500 and 1500
    this.mockStakingStats.stakerCount = 500 + Math.floor(Math.random() * 1000);
    
    // Add enhanced validator stats
    this.mockStakingStats.validatorUptime = "99.8%";
    this.mockStakingStats.epoch = 422;
    this.mockStakingStats.epochProgress = 68;
    this.mockStakingStats.rewardsDistributed = 25000;
    
    // Create a demo stake for the current user if wallet is connected
    if (this.wallet && this.wallet.publicKey) {
      const publicKeyStr = this.wallet.publicKey.toString();
      
      // Only create if one doesn't already exist
      if (!this.mockStakeData.has(publicKeyStr)) {
        const currentTime = Math.floor(Date.now() / 1000);
        
        // Create a stake that started 30 days ago with 90 day term
        const startTime = currentTime - (30 * 86400);
        const unlockTime = startTime + (90 * 86400);
        const stakeId = `stake_${startTime}_${Math.random().toString(36).substring(2, 10)}`;
        
        // Demo stake with 100 THC for 90 days
        const stakeAccount: StakeAccount = {
          owner: publicKeyStr,
          depositAmount: 100,
          startTime: startTime,
          unlockTime: unlockTime,
          apy: 8, // 8% for 90 day term
          rewardsClaimed: 0,
          lastClaimedTime: startTime,
          isActive: true,
          
          // Enhanced details for UI
          stakeId: stakeId,
          lockPeriodDays: 90,
          formattedStartDate: new Date(startTime * 1000).toLocaleDateString(),
          formattedEndDate: new Date(unlockTime * 1000).toLocaleDateString(),
          stakingTier: this.getStakingTierName(90),
          estimatedRewardsAtMaturity: (100 * 8 / 100) * (90 / 365)
        };
        
        // Add to mock data
        this.mockStakeData.set(publicKeyStr, stakeAccount);
        console.log(`[Mock] Created demo stake of 100 THC for connected wallet`);
      }
    }
  }

  /**
   * Get staking program stats
   * Retrieves global staking program statistics
   */
  async getStakingStats(): Promise<StakingStats> {
    // In a real implementation, this would fetch data from the Anchor program
    // For demo, just return our mock data
    return this.mockStakingStats;
  }

  /**
   * Get user's stake account data
   * Retrieves all information about a user's stake
   */
  async getUserStakeAccount(): Promise<StakeAccount | null> {
    if (!this.wallet || !this.wallet.publicKey) {
      return null;
    }
    
    const publicKeyStr = this.wallet.publicKey.toString();
    
    // Check if this wallet has any stake data
    if (this.mockStakeData.has(publicKeyStr)) {
      return this.mockStakeData.get(publicKeyStr) || null;
    }
    
    return null;
  }

  /**
   * Stake THC tokens
   * 
   * @param amount Amount of THC tokens to stake
   * @param lockPeriodDays Duration of staking in days
   */
  async stakeTokens(amount: number, lockPeriodDays: number): Promise<string> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    // Validate input
    if (amount <= 0) {
      throw new Error('Stake amount must be greater than 0');
    }
    
    const validPeriods = [30, 90, 180, 365];
    if (!validPeriods.includes(lockPeriodDays)) {
      throw new Error('Invalid staking period. Must be one of: 30, 90, 180, or 365 days');
    }

    // Mock transaction hash - in real implementation this would be a blockchain tx
    const txHash = 'mock_tx_' + Math.random().toString(36).substring(2, 15);
    
    // Get current time
    const currentTime = Math.floor(Date.now() / 1000);
    
    // Calculate unlock time
    const unlockTime = currentTime + (lockPeriodDays * 86400); // 86400 seconds = 1 day
    
    // Calculate APY based on staking period
    const apy = calculateStakingApy(lockPeriodDays);
    
    // Create a unique stake ID for this stake
    const stakeId = `stake_${currentTime}_${Math.random().toString(36).substring(2, 10)}`;
    
    // Create stake account with enhanced details
    const stakeAccount: StakeAccount = {
      owner: this.wallet.publicKey.toString(),
      depositAmount: amount,
      startTime: currentTime,
      unlockTime: unlockTime,
      apy: apy,
      rewardsClaimed: 0,
      lastClaimedTime: currentTime,
      isActive: true,
      
      // Enhanced details for UI
      stakeId: stakeId,
      lockPeriodDays: lockPeriodDays,
      formattedStartDate: new Date(currentTime * 1000).toLocaleDateString(),
      formattedEndDate: new Date(unlockTime * 1000).toLocaleDateString(),
      stakingTier: this.getStakingTierName(lockPeriodDays),
      estimatedRewardsAtMaturity: (amount * apy / 100) * (lockPeriodDays / 365)
    };
    
    // Save stake account
    this.mockStakeData.set(this.wallet.publicKey.toString(), stakeAccount);
    
    // Update stats
    this.mockStakingStats.totalStaked += amount;
    this.mockStakingStats.stakerCount += 1;
    
    console.log(`[Mock] Staked ${amount} THC for ${lockPeriodDays} days at ${apy}% APY`);
    console.log(`[Mock] Stake ID: ${stakeId}, Unlock date: ${new Date(unlockTime * 1000).toLocaleDateString()}`);
    
    // In a real implementation, this would return the transaction signature
    return txHash;
  }
  
  /**
   * Get a human-readable tier name based on staking period
   */
  private getStakingTierName(days: number): string {
    if (days >= 365) return 'Diamond Tier';
    if (days >= 180) return 'Gold Tier';
    if (days >= 90) return 'Silver Tier';
    return 'Bronze Tier';
  }

  /**
   * Unstake THC tokens
   * Withdraws principal and rewards if the lock period has ended
   */
  async unstakeTokens(): Promise<string> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const publicKeyStr = this.wallet.publicKey.toString();
    
    // Check if this wallet has any stake
    if (!this.mockStakeData.has(publicKeyStr)) {
      throw new Error('No active stake found');
    }
    
    const stakeAccount = this.mockStakeData.get(publicKeyStr)!;
    
    // Check if the lock period has ended
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime < stakeAccount.unlockTime) {
      throw new Error('Staking period has not ended yet');
    }
    
    // Calculate rewards
    const rewards = await this.calculateAvailableRewards();
    
    // Mock transaction hash
    const txHash = 'mock_tx_' + Math.random().toString(36).substring(2, 15);
    
    // Update stats
    this.mockStakingStats.totalStaked -= stakeAccount.depositAmount;
    this.mockStakingStats.stakerCount -= 1;
    
    // Mark as inactive
    stakeAccount.isActive = false;
    this.mockStakeData.set(publicKeyStr, stakeAccount);
    
    console.log(`[Mock] Unstaked ${stakeAccount.depositAmount} THC with ${rewards} THC rewards`);
    
    return txHash;
  }

  /**
   * Claim accrued staking rewards without unstaking principal
   * Allows users to harvest rewards while keeping their tokens staked
   */
  async claimRewards(): Promise<string> {
    if (!this.wallet || !this.wallet.publicKey) {
      throw new Error('Wallet not connected');
    }
    
    const publicKeyStr = this.wallet.publicKey.toString();
    
    // Check if this wallet has any stake
    if (!this.mockStakeData.has(publicKeyStr)) {
      throw new Error('No active stake found');
    }
    
    const stakeAccount = this.mockStakeData.get(publicKeyStr)!;
    
    // Check if stake is active
    if (!stakeAccount.isActive) {
      throw new Error('Stake is not active');
    }
    
    // Calculate rewards
    const rewards = await this.calculateAvailableRewards();
    
    if (rewards <= 0) {
      throw new Error('No rewards available for claiming');
    }
    
    // Mock transaction hash
    const txHash = 'mock_tx_' + Math.random().toString(36).substring(2, 15);
    
    // Update stake account
    const currentTime = Math.floor(Date.now() / 1000);
    stakeAccount.rewardsClaimed += rewards;
    stakeAccount.lastClaimedTime = currentTime;
    this.mockStakeData.set(publicKeyStr, stakeAccount);
    
    console.log(`[Mock] Claimed ${rewards} THC rewards`);
    
    return txHash;
  }

  /**
   * Calculate available rewards for a user
   * Estimate current rewards without claiming
   */
  async calculateAvailableRewards(): Promise<number> {
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
    const apy = stakeAccount.apy / 100; // Convert from percentage to decimal
    
    const rewards = stakeAccount.depositAmount * apy * timeInYears;
    
    return rewards;
  }
}

export default THCStakingService;