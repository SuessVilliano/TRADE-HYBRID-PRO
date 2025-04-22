import { useState, useEffect, useMemo } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import THCStakingService, { StakeAccount, StakingStats } from '../services/thc-staking-service';
import { calculateStakingApy } from '../contracts/thc-token-info';

/**
 * Custom hook for using the THC staking functionality
 * Provides an easy-to-use interface for all staking operations
 */
export const useThcStaking = () => {
  const { publicKey, wallet, connected } = useWallet();
  const { connection } = useConnection();
  
  // States
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [statsLoaded, setStatsLoaded] = useState<boolean>(false);
  
  // Staking data
  const [stakeAccount, setStakeAccount] = useState<StakeAccount | null>(null);
  const [stakingStats, setStakingStats] = useState<StakingStats>({
    totalStaked: 0,
    stakerCount: 0,
    validator: '',
    apyTiers: []
  });
  const [availableRewards, setAvailableRewards] = useState<number>(0);
  
  // Create service instance when wallet is connected
  const stakingService = useMemo(() => {
    if (!connected || !publicKey || !wallet) {
      return null;
    }
    
    // Create a simplified wallet adapter
    const adapter = {
      publicKey,
      // We'll use a simplified adapter for our mock implementation
      sendTransaction: async () => 'mock_tx'
    };
    
    return new THCStakingService(adapter, connection.rpcEndpoint);
  }, [publicKey, wallet, connected, connection]);
  
  // Load staking data when service is available
  useEffect(() => {
    if (!stakingService) {
      return;
    }
    
    const loadStakingData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get staking stats
        const stats = await stakingService.getStakingStats();
        setStakingStats(stats);
        setStatsLoaded(true);
        
        // Get user's stake account if available
        const userStake = await stakingService.getUserStakeAccount();
        setStakeAccount(userStake);
        
        // Calculate available rewards
        if (userStake && userStake.isActive) {
          const rewards = await stakingService.calculateAvailableRewards();
          setAvailableRewards(rewards);
        }
        
        setIsInitialized(true);
      } catch (err) {
        console.error('Error loading staking data:', err);
        setError('Failed to load staking data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    loadStakingData();
    
    // Set up a refresh interval for rewards (every 60 seconds)
    const refreshInterval = setInterval(async () => {
      if (stakingService && stakeAccount && stakeAccount.isActive) {
        try {
          const rewards = await stakingService.calculateAvailableRewards();
          setAvailableRewards(rewards);
        } catch (err) {
          console.error('Error refreshing rewards:', err);
        }
      }
    }, 60000);
    
    return () => clearInterval(refreshInterval);
  }, [stakingService, stakeAccount?.isActive]);
  
  /**
   * Stake THC tokens
   */
  const stakeTokens = async (amount: number, lockPeriodDays: number) => {
    if (!stakingService || !connected) {
      setError('Wallet not connected');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await stakingService.stakeTokens(amount, lockPeriodDays);
      
      // Reload stake account data
      const userStake = await stakingService.getUserStakeAccount();
      setStakeAccount(userStake);
      
      // Update staking stats
      const stats = await stakingService.getStakingStats();
      setStakingStats(stats);
      
      return tx;
    } catch (err: any) {
      console.error('Error staking tokens:', err);
      setError(err.message || 'Failed to stake tokens. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Unstake THC tokens
   */
  const unstakeTokens = async () => {
    if (!stakingService || !connected) {
      setError('Wallet not connected');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await stakingService.unstakeTokens();
      
      // Reload stake account data
      const userStake = await stakingService.getUserStakeAccount();
      setStakeAccount(userStake);
      
      // Update staking stats
      const stats = await stakingService.getStakingStats();
      setStakingStats(stats);
      
      // Reset available rewards
      setAvailableRewards(0);
      
      return tx;
    } catch (err: any) {
      console.error('Error unstaking tokens:', err);
      setError(err.message || 'Failed to unstake tokens. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Claim staking rewards
   */
  const claimRewards = async () => {
    if (!stakingService || !connected) {
      setError('Wallet not connected');
      return null;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const tx = await stakingService.claimRewards();
      
      // Reload stake account data
      const userStake = await stakingService.getUserStakeAccount();
      setStakeAccount(userStake);
      
      // Reset available rewards
      setAvailableRewards(0);
      
      return tx;
    } catch (err: any) {
      console.error('Error claiming rewards:', err);
      setError(err.message || 'Failed to claim rewards. Please try again.');
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Calculate estimated rewards for given amount and duration
   */
  const calculateEstimatedRewards = (amount: number, days: number) => {
    const apy = calculateStakingApy(days);
    const dailyRate = apy / 365 / 100;
    return amount * dailyRate * days;
  };
  
  /**
   * Get current stake status
   */
  const getStakeStatus = () => {
    if (!stakeAccount || !stakeAccount.isActive) {
      return 'not-staked';
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    if (currentTime >= stakeAccount.unlockTime) {
      return 'unlocked';
    }
    
    return 'locked';
  };
  
  /**
   * Get time remaining until unlock
   */
  const getTimeUntilUnlock = () => {
    if (!stakeAccount || !stakeAccount.isActive) {
      return 0;
    }
    
    const currentTime = Math.floor(Date.now() / 1000);
    return Math.max(0, stakeAccount.unlockTime - currentTime);
  };
  
  return {
    // State
    loading,
    error,
    isInitialized,
    statsLoaded,
    
    // Data
    stakeAccount,
    stakingStats,
    availableRewards,
    
    // Status helpers
    stakeStatus: getStakeStatus(),
    timeUntilUnlock: getTimeUntilUnlock(),
    hasActiveStake: stakeAccount?.isActive || false,
    
    // Actions
    stakeTokens,
    unstakeTokens,
    claimRewards,
    calculateEstimatedRewards
  };
};

export default useThcStaking;