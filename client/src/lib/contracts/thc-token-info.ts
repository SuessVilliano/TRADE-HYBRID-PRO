/**
 * Trade Hybrid Coin (THC) token information
 * 
 * This file contains the token specifications, supply details, and utility functions
 * for the Trade Hybrid Coin, the native token used for fee reduction in the platform.
 */

// In production, these would be actual Solana addresses
export const THC_TOKEN_CONFIG = {
  // Token details
  name: "Trade Hybrid Coin",
  symbol: "THC",
  decimals: 6,
  totalSupply: 1_000_000_000, // 1 billion tokens
  initialCirculatingSupply: 250_000_000, // 25% in initial circulation
  
  // Token distribution
  distribution: {
    trading: 400_000_000, // 40% for trading fee rewards
    staking: 200_000_000, // 20% for staking rewards
    team: 150_000_000, // 15% for team (locked with vesting)
    marketing: 100_000_000, // 10% for marketing
    ecosystem: 100_000_000, // 10% for ecosystem development
    reserve: 50_000_000 // 5% reserve
  },
  
  // Fee reduction tiers
  feeReductionTiers: [
    { minHolding: 0, reduction: 0 }, // 0% reduction with 0 THC
    { minHolding: 100, reduction: 10 }, // 10% reduction with 100 THC
    { minHolding: 1000, reduction: 25 }, // 25% reduction with 1,000 THC
    { minHolding: 10000, reduction: 40 }, // 40% reduction with 10,000 THC
    { minHolding: 100000, reduction: 50 } // 50% reduction with 100,000 THC
  ],
  
  // Staking APY tiers
  stakingApyTiers: [
    { minStakingPeriod: 30, apy: 5 }, // 5% APY for 30-day staking
    { minStakingPeriod: 90, apy: 8 }, // 8% APY for 90-day staking
    { minStakingPeriod: 180, apy: 12 }, // 12% APY for 180-day staking
    { minStakingPeriod: 365, apy: 15 } // 15% APY for 365-day staking
  ]
};

// Calculate fee reduction based on THC holding
export function calculateFeeReduction(thcHolding: number): number {
  const tiers = THC_TOKEN_CONFIG.feeReductionTiers;
  
  // Find the highest tier the user qualifies for
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (thcHolding >= tiers[i].minHolding) {
      return tiers[i].reduction;
    }
  }
  
  return 0;
}

// Calculate APY based on staking period (in days)
export function calculateStakingApy(stakingPeriod: number): number {
  const tiers = THC_TOKEN_CONFIG.stakingApyTiers;
  
  // Find the highest tier the user qualifies for
  for (let i = tiers.length - 1; i >= 0; i--) {
    if (stakingPeriod >= tiers[i].minStakingPeriod) {
      return tiers[i].apy;
    }
  }
  
  return 0;
}

// Calculate staking rewards
export function calculateStakingRewards(
  thcAmount: number,
  stakingPeriodDays: number
): number {
  const apy = calculateStakingApy(stakingPeriodDays);
  const dailyRate = apy / 365 / 100;
  
  return thcAmount * dailyRate * stakingPeriodDays;
}

// Calculate trading fee with THC reduction
export function calculateTradingFee(
  tradeAmount: number,
  thcHolding: number,
  baseFeePercentage: number = 0.25
): number {
  const reduction = calculateFeeReduction(thcHolding);
  const reducedFeePercentage = baseFeePercentage * (1 - reduction / 100);
  
  return tradeAmount * reducedFeePercentage / 100;
}