import { useEffect, useState } from 'react';
import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@project-serum/anchor';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { TOKEN_PROGRAM_ID, getAssociatedTokenAddress } from '@solana/spl-token';

// Program ID for the THC Staking program
// Using a valid Solana system program ID as a placeholder (this works for testing)
const THC_STAKING_PROGRAM_ID = SystemProgram.programId;

// Safely create THC Token Mint address - Using a default if there's any issue
// In production, this would be the actual THC token mint address
const THC_TOKEN_MINT = (() => {
  try {
    return new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
  } catch (err) {
    console.error("Failed to create THC token mint public key:", err);
    // Return a valid fallback public key (Solana system program)
    return SystemProgram.programId;
  }
})();

// Function to safely create a PublicKey or return null if invalid
const safeCreatePublicKey = (address: string | null | undefined): PublicKey | null => {
  if (!address) {
    console.warn("Attempted to create PublicKey with null or undefined address");
    return null;
  }
  
  try {
    return new PublicKey(address);
  } catch (err) {
    console.error("Invalid public key format:", address, err);
    return null;
  }
};

// Known PDAs that would be computed from the program
const getStakingAuthorityPDA = async () => {
  try {
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from("staking_authority"), THC_TOKEN_MINT.toBuffer()],
      THC_STAKING_PROGRAM_ID
    );
    return pda;
  } catch (err) {
    console.error("Error in getStakingAuthorityPDA:", err);
    // Return a default public key that's valid but won't be used for actual transactions
    return SystemProgram.programId;
  }
};

const getStakeAccountPDA = async (owner: PublicKey | null | undefined) => {
  try {
    // Validate inputs first to prevent cryptic errors
    if (!owner) {
      console.error("getStakeAccountPDA: owner is null or undefined");
      // Return a default valid public key instead of throwing
      return SystemProgram.programId;
    }
    
    // Verify if the owner is a valid PublicKey
    if (!(owner instanceof PublicKey)) {
      console.error("getStakeAccountPDA: owner is not a valid PublicKey instance");
      return SystemProgram.programId;
    }
    
    const [pda] = await PublicKey.findProgramAddress(
      [Buffer.from("stake_account"), owner.toBuffer(), THC_TOKEN_MINT.toBuffer()],
      THC_STAKING_PROGRAM_ID
    );
    return pda;
  } catch (err) {
    console.error("Error in getStakeAccountPDA:", err);
    // Return a default public key that's valid but won't be used for actual transactions
    return SystemProgram.programId;
  }
};

export const useThcStakingService = () => {
  const { connection } = useConnection();
  const { connected, publicKey, signTransaction, sendTransaction } = useWallet();
  
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stakingStats, setStakingStats] = useState<any>(null);
  const [userStake, setUserStake] = useState<any>(null);
  const [availableRewards, setAvailableRewards] = useState<number>(0);
  
  // Debug wallet connection
  useEffect(() => {
    console.log("THC Staking service - wallet status:", { 
      connected, 
      publicKey: publicKey?.toString(),
      validPublicKey: publicKey ? "Valid" : "Invalid"
    });
  }, [connected, publicKey]);
  
  // Initialize the Anchor program
  const getProgram = () => {
    if (!connection || !publicKey) return null;
    
    // Provider creation
    const provider = new anchor.AnchorProvider(
      connection,
      {
        publicKey,
        signTransaction: signTransaction!,
        signAllTransactions: async (txs: Transaction[]) => {
          return txs.map(tx => signTransaction!(tx));
        },
      },
      { commitment: 'confirmed' }
    );
    
    // This is a placeholder for a real IDL that would be loaded from a JSON file
    // In production, we would use something like:
    // const idl = require("@/idl/thc_staking.json");
    // return new anchor.Program(idl, THC_STAKING_PROGRAM_ID, provider);
    
    return null; // Would return the program in production
  };
  
  // Load user's stake data
  const loadUserStake = async () => {
    if (!publicKey) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch the stake account
      // const program = getProgram();
      // const stakePDA = await getStakeAccountPDA(publicKey);
      // const stakeAccount = await program.account.stakeAccount.fetchNullable(stakePDA);
      
      // For demo purposes, just simulate some data
      setTimeout(() => {
        setUserStake({
          isActive: false,
          amount: 0,
          lockPeriod: 0,
          rewards: 0,
          apy: 0,
          start: null,
          end: null
        });
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Failed to load stake data:", err);
      setError("Failed to load your staking data. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Load staking statistics
  const loadStakingStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would fetch staking program stats
      // const program = getProgram();
      // const authorityPDA = await getStakingAuthorityPDA();
      // const stats = await program.methods.getStakingStats().accounts({ stakingAuthority: authorityPDA }).view();
      
      // For demo purposes, simulate some data
      setTimeout(() => {
        setStakingStats({
          totalStaked: 100000,
          stakerCount: 245,
          apyTiers: [
            { periodDays: 30, apyBps: 500 },
            { periodDays: 90, apyBps: 800 },
            { periodDays: 180, apyBps: 1200 },
            { periodDays: 365, apyBps: 1500 }
          ]
        });
        setIsLoading(false);
      }, 1000);
      
    } catch (err) {
      console.error("Failed to load staking stats:", err);
      setError("Failed to load staking statistics. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Stake THC tokens
  const stakeTokens = async (amount: number, lockPeriodDays: number) => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would execute the stake transaction
      // const program = getProgram();
      // const stakePDA = await getStakeAccountPDA(publicKey);
      // const userTokenAccount = await getAssociatedTokenAddress(THC_TOKEN_MINT, publicKey);
      // const stakingAuthority = await getStakingAuthorityPDA();
      // const stakingVault = await getAssociatedTokenAddress(THC_TOKEN_MINT, stakingAuthority, true);
      
      // Create transaction
      // const tx = await program.methods
      //   .stake(new anchor.BN(amount), lockPeriodDays)
      //   .accounts({
      //     owner: publicKey,
      //     stakingAuthority,
      //     stakeAccount: stakePDA,
      //     tokenAccount: userTokenAccount,
      //     stakingVault,
      //     tokenProgram: TOKEN_PROGRAM_ID,
      //     systemProgram: SystemProgram.programId,
      //   })
      //   .transaction();
      
      // Execute transaction
      // const signature = await sendTransaction(tx, connection);
      // await connection.confirmTransaction(signature, 'confirmed');
      
      // Simulate success
      setTimeout(() => {
        setUserStake({
          isActive: true,
          amount: amount,
          lockPeriod: lockPeriodDays,
          rewards: 0,
          apy: lockPeriodDays >= 365 ? 15 : 
               lockPeriodDays >= 180 ? 12 : 
               lockPeriodDays >= 90 ? 8 : 5,
          start: new Date(),
          end: new Date(Date.now() + lockPeriodDays * 24 * 60 * 60 * 1000)
        });
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error("Failed to stake tokens:", err);
      setError("Failed to stake tokens. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Unstake THC tokens
  const unstakeTokens = async () => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }
    
    if (!userStake?.isActive) {
      setError("No active stake found");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would execute the unstake transaction
      // Similar to stakeTokens but calling the unstake instruction
      
      // Simulate success
      setTimeout(() => {
        setUserStake({
          ...userStake,
          isActive: false,
          amount: 0,
          rewards: 0
        });
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error("Failed to unstake tokens:", err);
      setError("Failed to unstake tokens. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Claim rewards
  const claimRewards = async () => {
    if (!publicKey || !signTransaction) {
      setError("Wallet not connected");
      return;
    }
    
    if (!userStake?.isActive) {
      setError("No active stake found");
      return;
    }
    
    if (availableRewards <= 0) {
      setError("No rewards available to claim");
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // In a real implementation, this would execute the claim rewards transaction
      // Similar to stakeTokens but calling the claimRewards instruction
      
      // Simulate success
      setTimeout(() => {
        setAvailableRewards(0);
        setUserStake({
          ...userStake,
          rewards: userStake.rewards + availableRewards
        });
        setIsLoading(false);
      }, 2000);
      
    } catch (err) {
      console.error("Failed to claim rewards:", err);
      setError("Failed to claim rewards. Please try again.");
      setIsLoading(false);
    }
  };
  
  // Calculate available rewards
  const calculateRewards = async () => {
    if (!publicKey || !userStake?.isActive) return;
    
    try {
      // In a real implementation, this would call the calculate_rewards instruction
      // const program = getProgram();
      // const stakePDA = await getStakeAccountPDA(publicKey);
      // const authorityPDA = await getStakingAuthorityPDA();
      // const result = await program.methods
      //   .calculateRewards()
      //   .accounts({
      //     stakeAccount: stakePDA,
      //     stakingAuthority: authorityPDA,
      //   })
      //   .view();
      
      // Simulate some rewards
      const stakedDays = (Date.now() - userStake.start.getTime()) / (24 * 60 * 60 * 1000);
      const apy = userStake.apy / 100;
      const yearFraction = stakedDays / 365;
      const rewards = userStake.amount * apy * yearFraction;
      
      setAvailableRewards(rewards);
      
    } catch (err) {
      console.error("Failed to calculate rewards:", err);
    }
  };
  
  // Initialize
  useEffect(() => {
    // Always load basic staking stats, even if wallet isn't connected
    if (!isInitialized) {
      console.log("THC Staking service - initializing stats");
      loadStakingStats();
      setIsInitialized(true);
    }

    // Only attempt to load user data if we have a valid publicKey
    if (connected && publicKey) {
      console.log("THC Staking service - loading user data with key:", publicKey.toString());
      try {
        loadUserStake();
      } catch (err) {
        console.error("Error in useEffect initialization:", err);
        setError(`Wallet connection error: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
    
    // Reset user-specific data when wallet disconnects
    if (!connected || !publicKey) {
      if (userStake !== null) {
        console.log("THC Staking service - resetting user data");
        setUserStake(null);
        setAvailableRewards(0);
      }
    }
  }, [connected, publicKey, isInitialized]);
  
  // Calculate rewards periodically
  useEffect(() => {
    if (userStake?.isActive) {
      calculateRewards();
      const interval = setInterval(calculateRewards, 60 * 1000); // Update every minute
      return () => clearInterval(interval);
    }
  }, [userStake]);
  
  return {
    isLoading,
    error,
    stakingStats,
    userStake,
    availableRewards,
    stakeTokens,
    unstakeTokens,
    claimRewards,
    loadUserStake,
    loadStakingStats
  };
};