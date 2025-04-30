/**
 * Enhanced Market Data Service for Trade Hybrid
 * 
 * This service provides a unified interface to access market data
 * from multiple providers with automatic fallback and caching.
 */

import { 
  CandleData, 
  TickData, 
  TimeInterval 
} from '../mcp/data/market-data-interface';
import { getRapidAPIService, RapidAPIProvider } from './rapidapi-service';
import {
  selectBestProviderForSymbol,
  convertTwelveDataToCandles,
  convertBinanceKlinesToCandles,
  convertAlphaVantageToCandles,
  convertYahooFinanceToCandles,
  convertTwelveDataQuoteToTick,
  convertBinanceTickerToTick,
  convertAlphaVantageQuoteToTick,
  convertYahooFinanceQuoteToTick,
  mapSymbolForProvider
} from '../lib/rapidapi-adapters';

// Cache item interfaces
interface CandleCacheItem {
  data: CandleData[];
  timestamp: number;
  symbol: string;
  interval: TimeInterval;
  from: number;
  to: number;
}

interface TickCacheItem {
  data: TickData;
  timestamp: number;
  symbol: string;
}

class EnhancedMarketDataService {
  private static instance: EnhancedMarketDataService;
  private candleCache: Map<string, CandleCacheItem> = new Map();
  private tickCache: Map<string, TickCacheItem> = new Map();
  private rapidApiService: any;
  
  private constructor() {
    this.rapidApiService = getRapidAPIService();
    
    // Setup cache expiration
    this.setupCacheExpiration();
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): EnhancedMarketDataService {
    if (!EnhancedMarketDataService.instance) {
      EnhancedMarketDataService.instance = new EnhancedMarketDataService();
    }
    return EnhancedMarketDataService.instance;
  }
  
  /**
   * Setup cache expiration timers
   */
  private setupCacheExpiration(): void {
    // Clear expired candle cache items every 15 minutes
    setInterval(() => {
      const now = Date.now();
      const candleCacheKeys = Array.from(this.candleCache.keys());
      
      for (const key of candleCacheKeys) {
        const cacheItem = this.candleCache.get(key);
        if (cacheItem) {
          // Expire candle cache after 30 minutes
          const expiryTime = 30 * 60 * 1000; // 30 minutes
          if (now - cacheItem.timestamp > expiryTime) {
            this.candleCache.delete(key);
          }
        }
      }
    }, 15 * 60 * 1000); // Run every 15 minutes
    
    // Clear expired tick cache items every 1 minute
    setInterval(() => {
      const now = Date.now();
      const tickCacheKeys = Array.from(this.tickCache.keys());
      
      for (const key of tickCacheKeys) {
        const cacheItem = this.tickCache.get(key);
        if (cacheItem) {
          // Expire tick cache after 1 minute
          const expiryTime = 60 * 1000; // 1 minute
          if (now - cacheItem.timestamp > expiryTime) {
            this.tickCache.delete(key);
          }
        }
      }
    }, 60 * 1000); // Run every 1 minute
  }
  
  /**
   * Get historical candle data with auto fallback between providers
   */
  public async getHistoricalCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<CandleData[]> {
    const cacheKey = `${symbol}-${interval}-${from}-${to || 'latest'}`;
    const cachedData = this.candleCache.get(cacheKey);
    
    // If we have cached data and it's not expired, return it
    if (cachedData) {
      return cachedData.data;
    }
    
    // If not in cache, fetch from providers with fallback
    let candles: CandleData[] = [];
    const providers = this.getPriorityProvidersForSymbol(symbol, 'candles');
    
    // Try each provider in order of priority
    for (const provider of providers) {
      try {
        console.log(`Attempting to fetch candles for ${symbol} from ${provider}`);
        
        // Map the symbol for this provider
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Fetch data from the provider
        const data = await this.rapidApiService.getHistoricalCandles(
          provider as RapidAPIProvider,
          mappedSymbol,
          interval,
          from,
          to
        );
        
        // Convert the data to our standard format
        switch (provider) {
          case RapidAPIProvider.TWELVE_DATA:
            candles = convertTwelveDataToCandles(data, symbol, interval);
            break;
          case RapidAPIProvider.BINANCE:
            candles = convertBinanceKlinesToCandles(data, symbol, interval);
            break;
          case RapidAPIProvider.ALPHA_VANTAGE:
            candles = convertAlphaVantageToCandles(data, symbol, interval);
            break;
          case RapidAPIProvider.YAHOO_FINANCE:
            candles = convertYahooFinanceToCandles(data, symbol, interval);
            break;
          default:
            console.warn(`No converter available for provider ${provider}`);
            candles = [];
        }
        
        // If we got data, cache it and return
        if (candles && candles.length > 0) {
          console.log(`Successfully fetched ${candles.length} candles for ${symbol} from ${provider}`);
          
          // Cache the data
          this.candleCache.set(cacheKey, {
            data: candles,
            timestamp: Date.now(),
            symbol,
            interval,
            from,
            to: to || Date.now()
          });
          
          return candles;
        } else {
          console.warn(`No data returned from ${provider} for ${symbol}`);
        }
      } catch (error) {
        console.error(`Error fetching candles from ${provider} for ${symbol}:`, error);
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    console.error(`All providers failed to fetch candles for ${symbol}`);
    
    // Return empty array
    return [];
  }
  
  /**
   * Get the latest price with auto fallback between providers
   */
  public async getLatestPrice(symbol: string): Promise<TickData> {
    const cacheKey = symbol;
    const cachedData = this.tickCache.get(cacheKey);
    
    // If we have cached data and it's not expired, return it
    if (cachedData && (Date.now() - cachedData.timestamp < 60000)) { // Cache for 1 minute
      return cachedData.data;
    }
    
    // If not in cache, fetch from providers with fallback
    let price: TickData = {
      symbol,
      price: 0,
      timestamp: Date.now(),
      bid: 0,
      ask: 0,
      volume: 0
    };
    
    const providers = this.getPriorityProvidersForSymbol(symbol, 'quote');
    
    // Try each provider in order of priority
    for (const provider of providers) {
      try {
        console.log(`Attempting to fetch price for ${symbol} from ${provider}`);
        
        // Map the symbol for this provider
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Fetch data from the provider
        const data = await this.rapidApiService.getLatestQuote(
          provider as RapidAPIProvider,
          mappedSymbol
        );
        
        // Convert the data to our standard format
        switch (provider) {
          case RapidAPIProvider.TWELVE_DATA:
            price = convertTwelveDataQuoteToTick(data, symbol);
            break;
          case RapidAPIProvider.BINANCE:
            price = convertBinanceTickerToTick(data, symbol);
            break;
          case RapidAPIProvider.ALPHA_VANTAGE:
            price = convertAlphaVantageQuoteToTick(data, symbol);
            break;
          case RapidAPIProvider.YAHOO_FINANCE:
            price = convertYahooFinanceQuoteToTick(data, symbol);
            break;
          default:
            console.warn(`No converter available for provider ${provider}`);
            price.price = 0;
        }
        
        // If we got data, cache it and return
        if (price.price > 0) {
          console.log(`Successfully fetched price for ${symbol} from ${provider}: ${price.price}`);
          
          // Cache the data
          this.tickCache.set(cacheKey, {
            data: price,
            timestamp: Date.now(),
            symbol
          });
          
          return price;
        } else {
          console.warn(`No price data returned from ${provider} for ${symbol}`);
        }
      } catch (error) {
        console.error(`Error fetching price from ${provider} for ${symbol}:`, error);
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    console.error(`All providers failed to fetch price for ${symbol}`);
    
    // Return empty price
    return price;
  }
  
  /**
   * Search for symbols across multiple providers
   */
  public async searchSymbols(query: string): Promise<any[]> {
    // Try multiple providers and aggregate results
    const results: any[] = [];
    
    // Try these providers in order
    const providers = [
      RapidAPIProvider.YAHOO_FINANCE,
      RapidAPIProvider.TWELVE_DATA,
      RapidAPIProvider.BINANCE,
      RapidAPIProvider.COINGECKO
    ];
    
    for (const provider of providers) {
      try {
        console.log(`Searching for symbols matching "${query}" on ${provider}`);
        
        // Fetch data from the provider
        const data = await this.rapidApiService.searchSymbols(
          provider as RapidAPIProvider,
          query
        );
        
        // Process the results based on provider
        switch (provider) {
          case RapidAPIProvider.TWELVE_DATA:
            if (data && data.data) {
              data.data.forEach((item: any) => {
                results.push({
                  symbol: item.symbol,
                  name: item.instrument_name,
                  provider,
                  type: item.type || 'unknown',
                  exchange: item.exchange || 'unknown',
                  country: item.country || 'unknown'
                });
              });
            }
            break;
          
          case RapidAPIProvider.YAHOO_FINANCE:
            if (data && data.ResultSet && data.ResultSet.Result) {
              data.ResultSet.Result.forEach((item: any) => {
                results.push({
                  symbol: item.symbol,
                  name: item.name,
                  provider,
                  type: item.typeDisp || 'unknown',
                  exchange: item.exchDisp || 'unknown',
                  country: 'unknown'
                });
              });
            }
            break;
          
          case RapidAPIProvider.BINANCE:
            if (data && Array.isArray(data)) {
              data.forEach((item: any) => {
                if (item.symbol.toLowerCase().includes(query.toLowerCase())) {
                  results.push({
                    symbol: item.symbol,
                    name: item.symbol,
                    provider,
                    type: 'crypto',
                    exchange: 'Binance',
                    country: 'global'
                  });
                }
              });
            }
            break;
          
          case RapidAPIProvider.COINGECKO:
            if (data && data.coins) {
              data.coins.forEach((item: any) => {
                results.push({
                  symbol: item.symbol.toUpperCase(),
                  name: item.name,
                  provider,
                  type: 'crypto',
                  exchange: 'CoinGecko',
                  country: 'global'
                });
              });
            }
            break;
          
          default:
            console.warn(`No result processor available for provider ${provider}`);
        }
      } catch (error) {
        console.error(`Error searching symbols on ${provider}:`, error);
        // Continue to next provider
      }
    }
    
    // Filter out duplicates by symbol
    const uniqueResults = Array.from(
      new Map(results.map(item => [item.symbol, item])).values()
    );
    
    return uniqueResults;
  }
  
  /**
   * Get priority providers for a symbol and data type
   */
  private getPriorityProvidersForSymbol(symbol: string, dataType: string): string[] {
    // Get the best provider for this symbol and data type
    const bestProvider = selectBestProviderForSymbol(symbol, dataType);
    
    // Add fallback providers in order of priority
    let providers: string[] = [bestProvider];
    
    if (dataType === 'candles') {
      // Set different fallback chains based on the best provider
      switch (bestProvider) {
        case RapidAPIProvider.BINANCE:
          providers = providers.concat([
            RapidAPIProvider.TWELVE_DATA,
            RapidAPIProvider.COINGECKO,
            RapidAPIProvider.YAHOO_FINANCE
          ]);
          break;
        
        case RapidAPIProvider.ALPHA_VANTAGE:
          providers = providers.concat([
            RapidAPIProvider.TWELVE_DATA,
            RapidAPIProvider.YAHOO_FINANCE
          ]);
          break;
        
        case RapidAPIProvider.YAHOO_FINANCE:
          providers = providers.concat([
            RapidAPIProvider.ALPHA_VANTAGE,
            RapidAPIProvider.TWELVE_DATA
          ]);
          break;
        
        default:
          providers = providers.concat([
            RapidAPIProvider.YAHOO_FINANCE,
            RapidAPIProvider.ALPHA_VANTAGE,
            RapidAPIProvider.BINANCE,
            RapidAPIProvider.COINGECKO
          ]);
      }
    } else if (dataType === 'quote') {
      // Set different fallback chains for quotes (prioritize speed)
      switch (bestProvider) {
        case RapidAPIProvider.BINANCE:
          providers = providers.concat([
            RapidAPIProvider.TWELVE_DATA,
            RapidAPIProvider.COINGECKO,
            RapidAPIProvider.YAHOO_FINANCE
          ]);
          break;
        
        case RapidAPIProvider.TWELVE_DATA:
          providers = providers.concat([
            RapidAPIProvider.ALPHA_VANTAGE,
            RapidAPIProvider.YAHOO_FINANCE
          ]);
          break;
        
        default:
          providers = providers.concat([
            RapidAPIProvider.TWELVE_DATA,
            RapidAPIProvider.BINANCE,
            RapidAPIProvider.ALPHA_VANTAGE,
            RapidAPIProvider.YAHOO_FINANCE
          ]);
      }
    }
    
    // Remove duplicates and return
    return [...new Set(providers)];
  }
  
  /**
   * Clear the cache
   */
  public clearCache(): void {
    this.candleCache.clear();
    this.tickCache.clear();
    console.log('Enhanced market data service cache cleared');
  }
}

/**
 * Get the singleton instance of the enhanced market data service
 */
export function getEnhancedMarketDataService(): EnhancedMarketDataService {
  return EnhancedMarketDataService.getInstance();
}