import fetch from 'node-fetch';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and, desc, sql } from 'drizzle-orm';

// Cache market data to avoid excessive API calls
const marketDataCache: Record<string, { data: any, timestamp: number }> = {};
// Cache expiry in milliseconds (5 minutes)
const CACHE_EXPIRY = 5 * 60 * 1000;

interface MarketDataSource {
  name: string;
  baseUrl: string;
  apiKeyParam?: string;
  apiKeyValue?: string;
  formatSymbol: (symbol: string) => string;
  parseResponse: (data: any) => any;
  endpoints: {
    price: string;
    ohlc: string;
    marketInfo: string;
  };
}

// Configure market data sources - these will be used to get real data
const dataSources: Record<string, MarketDataSource> = {
  'birdeye': {
    name: 'Birdeye',
    baseUrl: 'https://public-api.birdeye.so',
    apiKeyParam: 'x-api-key',
    apiKeyValue: process.env.BIRDEYE_API_KEY,
    formatSymbol: (symbol: string) => {
      // Birdeye requires Solana token addresses
      // We'll handle common symbols like SOL/USD specially
      if (symbol === 'SOL/USD' || symbol === 'SOLUSD') {
        return 'So11111111111111111111111111111111111111112'; // SOL token address
      }
      return symbol.split('/')[0]; // For other symbols, just use the base token for now
    },
    parseResponse: (data: any) => {
      if (!data) return null;
      return {
        price: data.value,
        priceChange: data.priceChange24h,
        priceChangePercent: data.priceChange24hPercent,
        volume: data.volume24h,
        marketCap: data.marketCap,
        source: 'birdeye'
      };
    },
    endpoints: {
      price: '/public/tokenPrice', // ?address={symbol}
      ohlc: '/public/candles', // ?address={symbol}&timeframe=1d
      marketInfo: '/public/tokenInfo' // ?address={symbol}
    }
  },
  'raydium': {
    name: 'Raydium',
    baseUrl: 'https://api.raydium.io',
    formatSymbol: (symbol: string) => {
      // For Raydium, we need to format the symbol appropriately
      return symbol.replace('/', '_');
    },
    parseResponse: (data: any) => {
      if (!data) return null;
      return {
        price: data.price,
        priceChange: data.priceChange24h,
        priceChangePercent: data.priceChangePercent24h,
        volume: data.volume24h,
        marketCap: data.marketCap,
        source: 'raydium'
      };
    },
    endpoints: {
      price: '/v2/main/price', // ?pair={symbol}
      ohlc: '/v2/main/chart', // ?pair={symbol}&type=day
      marketInfo: '/v2/main/info' // ?pair={symbol}
    }
  },
  'alpaca': {
    name: 'Alpaca',
    baseUrl: 'https://data.alpaca.markets/v2',
    apiKeyParam: 'APCA-API-KEY-ID',
    apiKeyValue: process.env.ALPACA_API_KEY,
    formatSymbol: (symbol: string) => {
      // Alpaca uses standard symbols
      return symbol.replace('/', '');
    },
    parseResponse: (data: any) => {
      if (!data || !data.bars || data.bars.length === 0) return null;
      
      const latestBar = data.bars[data.bars.length - 1];
      const previousBar = data.bars.length > 1 ? data.bars[data.bars.length - 2] : null;
      const priceChange = previousBar ? latestBar.c - previousBar.c : 0;
      const priceChangePercent = previousBar ? (priceChange / previousBar.c) * 100 : 0;
      
      return {
        price: latestBar.c,
        priceChange,
        priceChangePercent,
        volume: latestBar.v,
        high: latestBar.h,
        low: latestBar.l,
        open: latestBar.o,
        close: latestBar.c,
        source: 'alpaca'
      };
    },
    endpoints: {
      price: '/stocks/{symbol}/bars', // ?timeframe=1D&limit=1
      ohlc: '/stocks/{symbol}/bars', // ?timeframe=1D
      marketInfo: '/stocks/{symbol}/snapshot'
    }
  }
};

/**
 * Get market data for a symbol from multiple sources
 */
export async function getMarketData(symbol: string, preferredSource?: string): Promise<any> {
  try {
    // Check cache first
    const cacheKey = `${symbol}:${preferredSource || 'all'}`;
    const cached = marketDataCache[cacheKey];
    
    if (cached && (Date.now() - cached.timestamp) < CACHE_EXPIRY) {
      return cached.data;
    }
    
    // Check if this symbol exists in our database cache
    const dbCachedData = await db.query.marketData.findFirst({
      where: and(
        eq(schema.marketData.symbol, symbol),
        sql`"updated_at" > NOW() - INTERVAL '5 minutes'`
      )
    });
    
    if (dbCachedData) {
      // Update in-memory cache and return
      marketDataCache[cacheKey] = {
        data: dbCachedData.data,
        timestamp: Date.now()
      };
      return dbCachedData.data;
    }
    
    // Determine what sources to use
    const sources = preferredSource ? 
      [dataSources[preferredSource]].filter(Boolean) : 
      Object.values(dataSources);
    
    if (sources.length === 0) {
      throw new Error('No valid market data sources available');
    }
    
    // Try each source until we get data
    let marketData = null;
    let errors = [];
    
    for (const source of sources) {
      try {
        const data = await fetchFromSource(symbol, source);
        if (data) {
          marketData = {
            ...data,
            symbol,
            timestamp: new Date(),
            source: source.name
          };
          break;
        }
      } catch (error) {
        errors.push(`${source.name}: ${error.message}`);
        continue;
      }
    }
    
    if (!marketData) {
      // If we couldn't get data from any source, try our database for any cached data
      const oldData = await db.query.marketData.findFirst({
        where: eq(schema.marketData.symbol, symbol),
        orderBy: [{ updatedAt: 'desc' }]
      });
      
      if (oldData) {
        return oldData.data;
      }
      
      throw new Error(`Failed to get market data for ${symbol}: ${errors.join(', ')}`);
    }
    
    // Cache the data
    marketDataCache[cacheKey] = {
      data: marketData,
      timestamp: Date.now()
    };
    
    // Store in database for future use
    await db.insert(schema.marketData).values({
      symbol,
      source: marketData.source,
      data: marketData,
      createdAt: new Date(),
      updatedAt: new Date()
    }).onConflictDoUpdate({
      target: [schema.marketData.symbol],
      set: {
        data: marketData,
        source: marketData.source,
        updatedAt: new Date()
      }
    });
    
    return marketData;
  } catch (error) {
    console.error(`Error getting market data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Fetch data from a specific source
 */
async function fetchFromSource(symbol: string, source: MarketDataSource): Promise<any> {
  // Format the symbol for this source
  const formattedSymbol = source.formatSymbol(symbol);
  
  // Build the URL
  let url = `${source.baseUrl}${source.endpoints.price}`;
  url = url.replace('{symbol}', formattedSymbol);
  
  // Add query parameters
  const separator = url.includes('?') ? '&' : '?';
  if (url.includes('birdeye')) {
    url += `${separator}address=${formattedSymbol}`;
  } else if (url.includes('raydium')) {
    url += `${separator}pair=${formattedSymbol}`;
  } else if (url.includes('alpaca')) {
    url += `${separator}timeframe=1D&limit=2`;
  }
  
  // Make the request
  const headers: Record<string, string> = {};
  if (source.apiKeyParam && source.apiKeyValue) {
    headers[source.apiKeyParam] = source.apiKeyValue;
  }
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Failed to fetch from ${source.name}: ${response.status} ${response.statusText}`);
  }
  
  const data = await response.json();
  
  // Parse the response
  return source.parseResponse(data);
}

/**
 * Get OHLC data for a symbol
 */
export async function getOHLCData(symbol: string, timeframe: string = '1d', limit: number = 30, source?: string): Promise<any[]> {
  try {
    // Handle different sources
    const sourceObj = source ? dataSources[source] : Object.values(dataSources)[0];
    
    if (!sourceObj) {
      throw new Error('No valid market data source available');
    }
    
    // Format the symbol
    const formattedSymbol = sourceObj.formatSymbol(symbol);
    
    // Build the URL
    let url = `${sourceObj.baseUrl}${sourceObj.endpoints.ohlc}`;
    url = url.replace('{symbol}', formattedSymbol);
    
    // Add query parameters
    const separator = url.includes('?') ? '&' : '?';
    if (url.includes('birdeye')) {
      url += `${separator}address=${formattedSymbol}&timeframe=${timeframe}`;
    } else if (url.includes('raydium')) {
      url += `${separator}pair=${formattedSymbol}&type=${timeframe === '1d' ? 'day' : timeframe}`;
    } else if (url.includes('alpaca')) {
      url += `${separator}timeframe=${timeframe}&limit=${limit}`;
    }
    
    // Make the request
    const headers: Record<string, string> = {};
    if (sourceObj.apiKeyParam && sourceObj.apiKeyValue) {
      headers[sourceObj.apiKeyParam] = sourceObj.apiKeyValue;
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch OHLC data: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Process the data based on the source
    if (url.includes('birdeye')) {
      return data.data || [];
    } else if (url.includes('raydium')) {
      return data.data || [];
    } else if (url.includes('alpaca')) {
      return data.bars || [];
    }
    
    return [];
  } catch (error) {
    console.error(`Error getting OHLC data for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Get comprehensive market info for a symbol
 */
export async function getMarketInfo(symbol: string, source?: string): Promise<any> {
  try {
    // Get basic market data first
    const marketData = await getMarketData(symbol, source);
    
    if (!marketData) {
      throw new Error(`No market data available for ${symbol}`);
    }
    
    // Get OHLC data for additional metrics
    const ohlcData = await getOHLCData(symbol, '1d', 30, source);
    
    // Calculate additional metrics
    const volatility = calculateVolatility(ohlcData);
    const rsi = calculateRSI(ohlcData);
    
    return {
      ...marketData,
      volatility,
      rsi,
      ohlc: ohlcData.slice(0, 10) // Include recent OHLC data
    };
  } catch (error) {
    console.error(`Error getting market info for ${symbol}:`, error);
    throw error;
  }
}

/**
 * Calculate volatility from OHLC data
 */
function calculateVolatility(ohlcData: any[]): number {
  if (!ohlcData || ohlcData.length < 2) return 0;
  
  // Calculate daily returns
  const returns = [];
  for (let i = 1; i < ohlcData.length; i++) {
    const prevClose = ohlcData[i - 1].c || ohlcData[i - 1].close;
    const currClose = ohlcData[i].c || ohlcData[i].close;
    
    if (prevClose && currClose) {
      returns.push((currClose - prevClose) / prevClose);
    }
  }
  
  // Calculate standard deviation of returns
  const mean = returns.reduce((sum, value) => sum + value, 0) / returns.length;
  const squaredDiffs = returns.map(value => Math.pow(value - mean, 2));
  const variance = squaredDiffs.reduce((sum, value) => sum + value, 0) / returns.length;
  const stdDev = Math.sqrt(variance);
  
  // Annualize by multiplying by sqrt(252) (252 trading days in a year)
  const annualizedVolatility = stdDev * Math.sqrt(252);
  
  return annualizedVolatility;
}

/**
 * Calculate RSI from OHLC data
 */
function calculateRSI(ohlcData: any[], period: number = 14): number {
  if (!ohlcData || ohlcData.length < period + 1) return 50; // Default to neutral
  
  // Calculate price changes
  const changes = [];
  for (let i = 1; i < ohlcData.length; i++) {
    const prevClose = ohlcData[i - 1].c || ohlcData[i - 1].close;
    const currClose = ohlcData[i].c || ohlcData[i].close;
    
    if (prevClose && currClose) {
      changes.push(currClose - prevClose);
    }
  }
  
  // Calculate average gains and losses
  let gains = 0;
  let losses = 0;
  
  for (let i = 0; i < period; i++) {
    if (changes[i] >= 0) {
      gains += changes[i];
    } else {
      losses -= changes[i];
    }
  }
  
  // Calculate average gain and loss
  let avgGain = gains / period;
  let avgLoss = losses / period;
  
  // Calculate subsequent values using the Wilder smoothing method
  for (let i = period; i < changes.length; i++) {
    const change = changes[i];
    
    if (change >= 0) {
      avgGain = (avgGain * (period - 1) + change) / period;
      avgLoss = (avgLoss * (period - 1)) / period;
    } else {
      avgGain = (avgGain * (period - 1)) / period;
      avgLoss = (avgLoss * (period - 1) - change) / period;
    }
  }
  
  // Calculate RS and RSI
  if (avgLoss === 0) return 100;
  
  const rs = avgGain / avgLoss;
  const rsi = 100 - (100 / (1 + rs));
  
  return rsi;
}