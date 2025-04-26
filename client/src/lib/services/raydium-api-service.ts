/**
 * Raydium API Service
 * A service to fetch token price and liquidity data from Raydium DEX
 */

import axios from 'axios';

// Raydium pool data types
export interface RaydiumPoolData {
  price: number;
  priceChange24h: number;
  liquidity: number;
  volume24h: number;
  lpAddress: string;
  lastUpdated: Date;
}

export interface RaydiumLPInfo {
  lpAddress: string;
  name: string;
  liquidityUsd: number;
  apr: number;
  volume24h: number;
  fee24h: number;
  volume7d: number;
  fee7d: number;
  price: number;
  priceChange24h: number;
}

// Constants
const RAYDIUM_API_BASE_URL = 'https://api.raydium.io/v2/main';
const THC_TOKEN_ADDRESS = '4kXPBvQthvpes9TC7h6tXsYxWPUbYWpocBMVUG3eBLy4'; // THC token contract address
const THC_USDC_LP_ADDRESS = '8d2s5dqNZqH6c9vZzP5LnFbqhYbWUvkNJ8rYF15TJ7Wm'; // THC-USDC liquidity pool address

/**
 * Fetch THC token data from Raydium API
 * @returns Promise<RaydiumPoolData> with price, liquidity and volume data
 */
export async function fetchRaydiumTokenData(): Promise<RaydiumPoolData> {
  try {
    console.log('Fetching Raydium pool data...');
    
    // Fetch all pairs data from Raydium
    const response = await axios.get(`${RAYDIUM_API_BASE_URL}/pairs`);
    
    // Find THC-USDC pair by LP address
    let thcPoolData = response.data.find((pair: any) => 
      pair.lpMint === THC_USDC_LP_ADDRESS ||
      // Also check if either token in the pair is THC
      pair.baseMint === THC_TOKEN_ADDRESS || 
      pair.quoteMint === THC_TOKEN_ADDRESS
    );
    
    // If we don't find by LP address, try to find by name containing THC
    if (!thcPoolData) {
      thcPoolData = response.data.find((pair: any) => 
        pair.name && pair.name.includes('THC')
      );
    }
    
    if (thcPoolData) {
      return {
        price: thcPoolData.price || 0,
        priceChange24h: thcPoolData.priceChange24h || 0,
        liquidity: thcPoolData.liquidity || 0,
        volume24h: thcPoolData.volume24h || 0,
        lpAddress: thcPoolData.lpMint || '',
        lastUpdated: new Date()
      };
    }
    
    // If we can't find THC pool data, try the alternate endpoint
    return fetchRaydiumAlternative();
  } catch (error) {
    console.error('Error fetching Raydium pool data:', error);
    return fetchRaydiumAlternative();
  }
}

/**
 * Alternative method to fetch THC token data from Raydium API
 * Uses the ammV3 endpoint which has more detailed LP information
 */
async function fetchRaydiumAlternative(): Promise<RaydiumPoolData> {
  try {
    console.log('Trying alternative Raydium API endpoint...');
    
    // Try the ammV3 endpoint
    const response = await axios.get(`${RAYDIUM_API_BASE_URL}/ammV3/pairs`);
    
    // Find THC-USDC pair
    const thcPool = response.data.find((pair: any) => 
      (pair.baseMint === THC_TOKEN_ADDRESS || pair.quoteMint === THC_TOKEN_ADDRESS) ||
      (pair.name && pair.name.includes('THC'))
    );
    
    if (thcPool) {
      // Scale price if needed (in case decimals are different)
      const price = thcPool.price || 0;
      
      return {
        price: price,
        priceChange24h: thcPool.priceChange24h || 0,
        liquidity: thcPool.liquidity || 0,
        volume24h: thcPool.volume24h || 0,
        lpAddress: thcPool.id || '',
        lastUpdated: new Date()
      };
    }
    
    // If we still can't find it, throw an error
    throw new Error('THC pool not found in Raydium API');
  } catch (error) {
    console.error('Error in alternative Raydium fetch:', error);
    
    // If all API methods fail, return a structure with zeros
    return {
      price: 0,
      priceChange24h: 0,
      liquidity: 0,
      volume24h: 0,
      lpAddress: '',
      lastUpdated: new Date()
    };
  }
}

/**
 * Fetch detailed Raydium LP farm information for THC
 * @returns Promise<RaydiumLPInfo | null> with LP info or null if not found
 */
export async function fetchRaydiumLPInfo(): Promise<RaydiumLPInfo | null> {
  try {
    console.log('Fetching Raydium LP farm data...');
    
    // Fetch farm info from Raydium
    const response = await axios.get(`${RAYDIUM_API_BASE_URL}/farms`);
    
    // Find THC farm by LP mint or name
    const thcFarm = response.data.officialFarms.find((farm: any) => 
      farm.lpMint === THC_USDC_LP_ADDRESS || 
      (farm.name && farm.name.includes('THC'))
    );
    
    if (thcFarm) {
      return {
        lpAddress: thcFarm.lpMint,
        name: thcFarm.name,
        liquidityUsd: thcFarm.liquidity,
        apr: thcFarm.apr,
        volume24h: thcFarm.volume24h || 0,
        fee24h: thcFarm.fee24h || 0,
        volume7d: thcFarm.volume7d || 0,
        fee7d: thcFarm.fee7d || 0,
        price: thcFarm.price || 0,
        priceChange24h: thcFarm.priceChange24h || 0
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching Raydium LP farm data:', error);
    return null;
  }
}

export default {
  fetchRaydiumTokenData,
  fetchRaydiumLPInfo
};