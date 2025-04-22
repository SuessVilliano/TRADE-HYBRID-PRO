// THC Token Information and Staking Helpers

/**
 * THC Token metadata and configuration
 */
export const THC_TOKEN = {
  name: 'TradeHybrid Coin',
  symbol: 'THC',
  decimals: 6,
  tokenAddress: '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4',
  validatorIdentity: '5Mp3EF1donYwLxhe5hs6HoWpAucZGLZ76NKRNztkjEej',
  voteAddress: '3QHakLBiTrmXaEcFnjeGFf8ScD4Yp6cxHSdMinEqBjWy',
  stakingApyTiers: [
    { period: 30, apy: 5 },
    { period: 90, apy: 8 },
    { period: 180, apy: 12 },
    { period: 365, apy: 15 }
  ]
};

/**
 * Calculate staking APY based on staking period in days
 * 
 * @param days Number of days to stake
 * @returns APY percentage (e.g., 8 for 8%)
 */
export function calculateStakingApy(days: number): number {
  if (days >= 365) return 15;
  if (days >= 180) return 12;
  if (days >= 90) return 8;
  return 5; // Default for any period less than 90 days
}

/**
 * Calculate staking rewards for a given amount and period
 * 
 * @param amount Amount of THC tokens to stake
 * @param days Number of days to stake
 * @returns Estimated rewards in THC
 */
export function calculateStakingRewards(amount: number, days: number): number {
  const apy = calculateStakingApy(days);
  return (amount * apy / 100) * (days / 365);
}

/**
 * Format token amount with symbol
 * 
 * @param amount Amount of tokens
 * @param includeCurrency Whether to include the currency symbol
 * @returns Formatted string (e.g., "10.50 THC")
 */
export function formatTokenAmount(amount: number, includeCurrency = true): string {
  const formatted = amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return includeCurrency ? `${formatted} ${THC_TOKEN.symbol}` : formatted;
}

/**
 * Convert token amount to lamports (atomic units)
 * 
 * @param amount Amount in THC
 * @returns Amount in lamports (smallest unit)
 */
export function tokenToLamports(amount: number): number {
  return Math.floor(amount * Math.pow(10, THC_TOKEN.decimals));
}

/**
 * Convert lamports to token amount
 * 
 * @param lamports Amount in lamports (smallest unit)
 * @returns Amount in THC
 */
export function lamportsToToken(lamports: number): number {
  return lamports / Math.pow(10, THC_TOKEN.decimals);
}

/**
 * Calculate trading fee discount based on THC token holdings
 * The more THC tokens a user holds, the lower their trading fees
 * 
 * @param baseFee Base fee percentage (1 = 1%)
 * @param thcBalance User's THC token balance
 * @returns Calculated trading fee percentage after discount
 */
export function calculateTradingFee(baseFee: number, thcBalance: number): number {
  // No discount if no THC tokens
  if (!thcBalance || thcBalance <= 0) {
    return baseFee;
  }
  
  // Define discount tiers based on THC holdings
  // The more THC a user holds, the higher the discount
  let discountPercent = 0;
  
  if (thcBalance >= 1000) discountPercent = 50; // 50% discount
  else if (thcBalance >= 500) discountPercent = 35; // 35% discount
  else if (thcBalance >= 250) discountPercent = 20; // 20% discount
  else if (thcBalance >= 100) discountPercent = 10; // 10% discount
  else if (thcBalance >= 50) discountPercent = 5; // 5% discount
  
  // Apply discount to base fee
  const discountedFee = baseFee * (100 - discountPercent) / 100;
  
  // Return fee with 2 decimal precision
  return Math.round(discountedFee * 100) / 100;
}

export default THC_TOKEN;