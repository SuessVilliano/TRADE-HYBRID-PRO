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
  price: 0.0425,              // Base price in USD
  priceChange24h: 2.85,       // 24h price change percentage
  totalSupply: 1000000000,    // 1 billion total supply
  circulatingSupply: 250000000, // 250 million in circulation
  marketCap: 10625000,        // Market cap in USD
  tradingVolume24h: 875000,   // 24h trading volume
  holderCount: 12350,         // Number of token holders
  stakingApy: 9.5,            // Current staking APY
  stakingApyTiers: [
    { period: 30, apy: 5 },
    { period: 90, apy: 8 },
    { period: 180, apy: 12 },
    { period: 365, apy: 15 }
  ],
  // Fee for purchasing THC (in percentage)
  purchaseFee: 1.5,
  // Simulated historical price data
  priceHistory: [
    { date: '2025-04-19', price: 0.0402 },
    { date: '2025-04-20', price: 0.0410 },
    { date: '2025-04-21', price: 0.0407 },
    { date: '2025-04-22', price: 0.0415 },
    { date: '2025-04-23', price: 0.0420 },
    { date: '2025-04-24', price: 0.0418 },
    { date: '2025-04-25', price: 0.0425 }
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

/**
 * Simulate dynamic price change based on market factors
 * This function simulates real-world price movements
 * In production, this would be replaced with actual market data
 * 
 * @returns Updated token price
 */
export function updateTokenPrice(): number {
  // Simulate market volatility with random movements
  // Weighted towards small changes with occasional larger moves
  const randomFactor = Math.random();
  let percentChange = 0;
  
  if (randomFactor > 0.95) {
    // Large move (5% probability)
    percentChange = (Math.random() - 0.5) * 5;
  } else if (randomFactor > 0.7) {
    // Medium move (25% probability)
    percentChange = (Math.random() - 0.5) * 1;
  } else {
    // Small move (70% probability)
    percentChange = (Math.random() - 0.5) * 0.5;
  }
  
  // Update price
  const newPrice = THC_TOKEN.price * (1 + percentChange / 100);
  
  // Ensure price stays within reasonable bounds (0.01 to 0.10)
  const boundedPrice = Math.max(0.01, Math.min(0.10, newPrice));
  
  // Update token data
  THC_TOKEN.price = parseFloat(boundedPrice.toFixed(6));
  
  // Calculate 24h change based on yesterday's price
  const yesterdayPrice = THC_TOKEN.priceHistory[THC_TOKEN.priceHistory.length - 2]?.price || THC_TOKEN.price * 0.97;
  THC_TOKEN.priceChange24h = parseFloat(((THC_TOKEN.price / yesterdayPrice - 1) * 100).toFixed(2));
  
  // Update market cap
  THC_TOKEN.marketCap = THC_TOKEN.price * THC_TOKEN.circulatingSupply;
  
  // Add to price history if it's a new day
  const today = new Date().toISOString().split('T')[0];
  const lastPriceEntry = THC_TOKEN.priceHistory[THC_TOKEN.priceHistory.length - 1];
  
  if (lastPriceEntry.date !== today) {
    THC_TOKEN.priceHistory.push({
      date: today,
      price: THC_TOKEN.price
    });
    
    // Keep only the last 30 days of history
    if (THC_TOKEN.priceHistory.length > 30) {
      THC_TOKEN.priceHistory.shift();
    }
  } else {
    // Update today's price
    lastPriceEntry.price = THC_TOKEN.price;
  }
  
  return THC_TOKEN.price;
}

/**
 * Calculate the USD value of THC tokens
 * 
 * @param tokenAmount Amount of THC tokens
 * @returns USD value
 */
export function calculateTokenValue(tokenAmount: number): number {
  return tokenAmount * THC_TOKEN.price;
}

/**
 * Calculate the amount of THC tokens that can be purchased with a given USD amount
 * 
 * @param usdAmount Amount in USD
 * @param tokenPrice Current token price (defaults to THC_TOKEN.price if not provided)
 * @returns Amount of THC tokens
 */
export function calculateTokensFromUsd(usdAmount: number, tokenPrice?: number): number {
  // Use provided price or fall back to THC_TOKEN.price
  const price = tokenPrice !== undefined ? tokenPrice : THC_TOKEN.price;
  
  // Calculate tokens before fee
  const fee = usdAmount * (THC_TOKEN.purchaseFee / 100);
  const netAmount = usdAmount - fee;
  return netAmount / price;
}

/**
 * Format USD amount
 * 
 * @param amount Amount in USD
 * @returns Formatted string (e.g., "$10.50")
 */
export function formatUsdAmount(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6
  }).format(amount);
}

export default THC_TOKEN;