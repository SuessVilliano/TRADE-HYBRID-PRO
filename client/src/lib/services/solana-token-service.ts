import { THC_TOKEN } from '../constants';

const MORALIS_API_KEY = process.env.MORALIS_API_KEY;

interface TokenPrice {
  nativePrice?: {
    value: string;
    decimals: number;
    name: string;
    symbol: string;
  };
  usdPrice: number;
  exchangeAddress?: string;
  exchangeName?: string;
}

export async function getSolanaTokenPrice(tokenAddress: string): Promise<TokenPrice | null> {
  try {
    if (!MORALIS_API_KEY) {
      console.warn('Moralis API key not found, using simulated data');
      return simulatedTokenPrice();
    }
    
    const response = await fetch(`https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/price`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching Solana token price:', await response.text());
      return simulatedTokenPrice();
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getSolanaTokenPrice:', error);
    return simulatedTokenPrice();
  }
}

// For demonstration/fallback when the API is not available
function simulatedTokenPrice(): TokenPrice {
  return {
    usdPrice: 2.45 + (Math.random() * 0.4 - 0.2), // Random value around $2.45
    nativePrice: {
      value: '29000000',
      decimals: 9,
      name: 'Solana',
      symbol: 'SOL'
    }
  };
}

export async function getThcTokenPrice(): Promise<TokenPrice | null> {
  return getSolanaTokenPrice(THC_TOKEN.address);
}

export async function getSolanaTokenHistory(tokenAddress: string, days = 7): Promise<any | null> {
  try {
    if (!MORALIS_API_KEY) {
      console.warn('Moralis API key not found, using simulated data');
      return simulatedTokenHistory(days);
    }
    
    const response = await fetch(`https://solana-gateway.moralis.io/token/mainnet/${tokenAddress}/price/history?days=${days}`, {
      method: 'GET',
      headers: {
        'accept': 'application/json',
        'X-API-Key': MORALIS_API_KEY
      }
    });
    
    if (!response.ok) {
      console.error('Error fetching Solana token history:', await response.text());
      return simulatedTokenHistory(days);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error in getSolanaTokenHistory:', error);
    return simulatedTokenHistory(days);
  }
}

function simulatedTokenHistory(days: number) {
  const now = Date.now();
  const basePrice = 2.45;
  const history = [];
  
  for (let i = 0; i < days * 24; i++) {
    const timePoint = now - (days * 24 - i) * 3600 * 1000;
    const randomFactor = 1 + (Math.random() * 0.2 - 0.1); // +/- 10%
    const price = basePrice * randomFactor;
    
    history.push({
      timestamp: new Date(timePoint).toISOString(),
      priceUsd: price
    });
  }
  
  return { history };
}

export async function getThcTokenHistory(days = 7): Promise<any | null> {
  return getSolanaTokenHistory(THC_TOKEN.address, days);
}