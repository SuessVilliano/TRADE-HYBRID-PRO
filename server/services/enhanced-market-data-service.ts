/**
 * Enhanced Market Data Service
 * 
 * This service integrates multiple data providers to provide a robust and reliable
 * market data experience with automatic fallback capabilities.
 */

import { TimeInterval } from '../mcp/data/market-data-interface';
import { RapidAPIProvider, getRapidAPIService } from './rapidapi-service';
import { standardizeCandles, standardizeQuote, standardizeSymbolSearch } from '../lib/rapidapi-adapters';

class EnhancedMarketDataService {
  private static instance: EnhancedMarketDataService;
  private rapidApiService = getRapidAPIService();
  
  // Provider rotation order for fallback
  private readonly providerFallbackOrder: RapidAPIProvider[] = [
    RapidAPIProvider.TWELVE_DATA,
    RapidAPIProvider.YAHOO_FINANCE,
    RapidAPIProvider.ALPHA_VANTAGE,
    RapidAPIProvider.BINANCE,
    RapidAPIProvider.TRADINGVIEW,
    RapidAPIProvider.COINGECKO
  ];
  
  // Cache for market data
  private priceCache: Map<string, { price: number, timestamp: number }> = new Map();
  private candleCache: Map<string, { candles: any[], timestamp: number }> = new Map();
  private searchCache: Map<string, { results: any[], timestamp: number }> = new Map();
  private readonly CACHE_TTL = 60 * 1000; // 1 minute cache TTL
  
  private constructor() {
    console.log('Enhanced Market Data Service initialized');
  }
  
  public static getInstance(): EnhancedMarketDataService {
    if (!EnhancedMarketDataService.instance) {
      EnhancedMarketDataService.instance = new EnhancedMarketDataService();
    }
    return EnhancedMarketDataService.instance;
  }
  
  /**
   * Get historical candles with automatic provider fallback
   * @param symbol The symbol to get data for
   * @param interval The time interval for candles
   * @param from The start timestamp
   * @param to The end timestamp (optional)
   * @returns The standardized candle data
   */
  public async getHistoricalCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any[]> {
    // Check cache first
    const cacheKey = `${symbol}-${interval}-${from}-${to || 'now'}`;
    const cached = this.candleCache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Enhanced Market Data: Using cached candles for ${symbol} (${interval})`);
      return cached.candles;
    }
    
    // Try each provider in fallback order
    const errors: Error[] = [];
    
    for (const provider of this.providerFallbackOrder) {
      try {
        console.log(`Enhanced Market Data: Fetching candles for ${symbol} from ${provider}`);
        
        const rawData = await this.rapidApiService.getHistoricalCandles(
          provider,
          symbol,
          interval,
          from,
          to
        );
        
        const standardizedCandles = standardizeCandles(rawData, provider);
        
        // Cache the results
        this.candleCache.set(cacheKey, {
          candles: standardizedCandles,
          timestamp: Date.now()
        });
        
        return standardizedCandles;
      } catch (error) {
        console.error(`Enhanced Market Data: Error getting candles from ${provider}:`, error);
        errors.push(error as Error);
      }
    }
    
    // If we reach here, all providers failed
    console.error('Enhanced Market Data: All providers failed to get candles');
    throw new Error(`Failed to get candles for ${symbol}: ${errors.map(e => e.message).join(', ')}`);
  }
  
  /**
   * Get latest price with automatic provider fallback
   * @param symbol The symbol to get data for
   * @returns The standardized price data
   */
  public async getLatestPrice(symbol: string): Promise<any> {
    // Check cache first
    const cached = this.priceCache.get(symbol);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Enhanced Market Data: Using cached price for ${symbol}`);
      return { price: cached.price, symbol };
    }
    
    // Try each provider in fallback order
    const errors: Error[] = [];
    
    for (const provider of this.providerFallbackOrder) {
      try {
        console.log(`Enhanced Market Data: Fetching price for ${symbol} from ${provider}`);
        
        const rawData = await this.rapidApiService.getLatestQuote(provider, symbol);
        const standardizedQuote = standardizeQuote(rawData, provider);
        
        // Cache the results
        this.priceCache.set(symbol, {
          price: standardizedQuote.price,
          timestamp: Date.now()
        });
        
        return standardizedQuote;
      } catch (error) {
        console.error(`Enhanced Market Data: Error getting price from ${provider}:`, error);
        errors.push(error as Error);
      }
    }
    
    // If we reach here, all providers failed
    console.error('Enhanced Market Data: All providers failed to get price');
    throw new Error(`Failed to get price for ${symbol}: ${errors.map(e => e.message).join(', ')}`);
  }
  
  /**
   * Search for symbols with automatic provider fallback
   * @param query The search query
   * @returns The standardized search results
   */
  public async searchSymbols(query: string): Promise<any[]> {
    // Check cache first
    const cached = this.searchCache.get(query);
    
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      console.log(`Enhanced Market Data: Using cached search results for ${query}`);
      return cached.results;
    }
    
    // Try each provider in fallback order
    const errors: Error[] = [];
    
    for (const provider of this.providerFallbackOrder) {
      try {
        console.log(`Enhanced Market Data: Searching for ${query} using ${provider}`);
        
        const rawData = await this.rapidApiService.searchSymbols(provider, query);
        const standardizedResults = standardizeSymbolSearch(rawData, provider);
        
        // Cache the results
        this.searchCache.set(query, {
          results: standardizedResults,
          timestamp: Date.now()
        });
        
        return standardizedResults;
      } catch (error) {
        console.error(`Enhanced Market Data: Error searching symbols from ${provider}:`, error);
        errors.push(error as Error);
      }
    }
    
    // If we reach here, all providers failed
    console.error('Enhanced Market Data: All providers failed to search symbols');
    throw new Error(`Failed to search for ${query}: ${errors.map(e => e.message).join(', ')}`);
  }
  
  /**
   * Clear all caches
   */
  public clearCaches(): void {
    this.priceCache.clear();
    this.candleCache.clear();
    this.searchCache.clear();
    console.log('Enhanced Market Data: All caches cleared');
  }
}

/**
 * Get the Enhanced Market Data Service singleton instance
 */
export function getEnhancedMarketDataService(): EnhancedMarketDataService {
  return EnhancedMarketDataService.getInstance();
}