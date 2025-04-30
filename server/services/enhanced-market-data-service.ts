/**
 * Enhanced Market Data Service for Trade Hybrid
 * 
 * This service provides a unified interface to access market data
 * from multiple providers with automatic fallback and caching.
 */

import { CandleData, TickData, TimeInterval } from '../mcp/data/market-data-interface';
import { getRapidAPIService } from './rapidapi-service';
import { 
  convertTwelveDataToCandles,
  convertBinanceKlinesToCandles,
  convertAlphaVantageToCandles,
  convertYahooFinanceToCandles,
  convertTwelveDataQuoteToTick,
  convertBinanceTickerToTick,
  convertAlphaVantageQuoteToTick,
  convertYahooFinanceQuoteToTick,
  selectBestProviderForSymbol,
  mapSymbolForProvider,
  convertIntervalForProvider
} from '../lib/rapidapi-adapters';

// Cache TTL in milliseconds
const CANDLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const TICK_CACHE_TTL = 10 * 1000;       // 10 seconds

// Provider sequence for fallback
const PROVIDER_SEQUENCE = [
  'twelve_data',
  'binance',
  'alpha_vantage',
  'yh_finance'
];

// Cache structures
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
    try {
      this.rapidApiService = getRapidAPIService();
      console.log('Enhanced Market Data Service initialized');
    } catch (error) {
      console.error('Error initializing Enhanced Market Data Service:', error);
    }
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
   * Get historical candle data with auto fallback between providers
   */
  public async getHistoricalCandles(
    symbol: string,
    interval: TimeInterval,
    from: Date | number,
    to: Date | number = Date.now()
  ): Promise<CandleData[]> {
    // Convert dates to timestamps
    const fromTs = typeof from === 'number' ? from : from.getTime();
    const toTs = typeof to === 'number' ? to : to.getTime();
    
    // Check cache first
    const cacheKey = `${symbol}_${interval}_${fromTs}_${toTs}`;
    const cachedData = this.candleCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < CANDLE_CACHE_TTL) {
      console.log(`Using cached candle data for ${symbol} (${interval})`);
      return cachedData.data;
    }
    
    // Determine best provider sequence for this symbol
    const bestProvider = selectBestProviderForSymbol(symbol, 'candles');
    
    // Create a custom provider sequence with best provider first
    const providerSequence = [bestProvider, 
      ...PROVIDER_SEQUENCE.filter(p => p !== bestProvider)];
    
    // Try each provider in sequence
    for (const provider of providerSequence) {
      try {
        console.log(`Fetching candles for ${symbol} (${interval}) from ${provider}`);
        
        // Map symbol and interval to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        const mappedInterval = convertIntervalForProvider(interval, provider);
        
        // Adjust parameters based on provider
        let params: Record<string, any> = {};
        
        switch (provider) {
          case 'twelve_data':
            params = {
              symbol: mappedSymbol,
              interval: mappedInterval,
              outputsize: 5000,
              start_date: new Date(fromTs).toISOString().split('T')[0],
              end_date: new Date(toTs).toISOString().split('T')[0]
            };
            break;
            
          case 'binance':
            params = {
              symbol: mappedSymbol,
              interval: mappedInterval,
              limit: 1000,
              startTime: fromTs,
              endTime: toTs
            };
            break;
            
          case 'alpha_vantage':
            params = {
              function: interval === '1d' ? 'TIME_SERIES_DAILY' : 'TIME_SERIES_INTRADAY',
              symbol: mappedSymbol,
              interval: mappedInterval,
              outputsize: 'full'
            };
            break;
            
          case 'yh_finance':
            params = {
              symbol: mappedSymbol,
              interval: mappedInterval,
              period1: Math.floor(fromTs / 1000),
              period2: Math.floor(toTs / 1000),
              region: 'US'
            };
            break;
            
          default:
            continue; // Skip unknown providers
        }
        
        // Get the appropriate endpoint for this provider
        let endpoint: string;
        switch (provider) {
          case 'twelve_data':
            endpoint = '/time_series';
            break;
          case 'binance':
            endpoint = '/klines';
            break;
          case 'alpha_vantage':
            endpoint = '/query';
            break;
          case 'yh_finance':
            endpoint = '/stock/v3/get-historical-data';
            break;
          default:
            continue; // Skip unknown providers
        }
        
        // Make the request
        const data = await this.rapidApiService.makeRequest(provider, endpoint, params);
        
        // Convert to standard format
        let candles: CandleData[] = [];
        switch (provider) {
          case 'twelve_data':
            candles = convertTwelveDataToCandles(data, symbol, interval);
            break;
          case 'binance':
            candles = convertBinanceKlinesToCandles(data, symbol, interval);
            break;
          case 'alpha_vantage':
            candles = convertAlphaVantageToCandles(data, symbol, interval);
            break;
          case 'yh_finance':
            candles = convertYahooFinanceToCandles(data, symbol, interval);
            break;
        }
        
        // If we got data, cache it and return
        if (candles.length > 0) {
          // Cache the results
          this.candleCache.set(cacheKey, {
            data: candles,
            timestamp: Date.now(),
            symbol,
            interval,
            from: fromTs,
            to: toTs
          });
          
          return candles;
        }
      } catch (error) {
        console.error(`Error fetching candles from ${provider}:`, error);
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    throw new Error(`Failed to fetch candle data for ${symbol} (${interval})`);
  }
  
  /**
   * Get the latest price with auto fallback between providers
   */
  public async getLatestPrice(symbol: string): Promise<TickData> {
    // Check cache first
    const cacheKey = `${symbol}_tick`;
    const cachedData = this.tickCache.get(cacheKey);
    
    if (cachedData && Date.now() - cachedData.timestamp < TICK_CACHE_TTL) {
      console.log(`Using cached tick data for ${symbol}`);
      return cachedData.data;
    }
    
    // Determine best provider sequence for this symbol
    const bestProvider = selectBestProviderForSymbol(symbol, 'quote');
    
    // Create a custom provider sequence with best provider first
    const providerSequence = [bestProvider, 
      ...PROVIDER_SEQUENCE.filter(p => p !== bestProvider)];
    
    // Try each provider in sequence
    for (const provider of providerSequence) {
      try {
        console.log(`Fetching tick data for ${symbol} from ${provider}`);
        
        // Map symbol to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Get the appropriate endpoint and params for this provider
        let endpoint: string;
        let params: Record<string, any> = {};
        
        switch (provider) {
          case 'twelve_data':
            endpoint = '/quote';
            params = { symbol: mappedSymbol };
            break;
          case 'binance':
            endpoint = '/ticker/24hr';
            params = { symbol: mappedSymbol };
            break;
          case 'alpha_vantage':
            endpoint = '/query';
            params = { 
              function: 'GLOBAL_QUOTE',
              symbol: mappedSymbol
            };
            break;
          case 'yh_finance':
            endpoint = '/market/v2/get-quotes';
            params = { 
              symbols: mappedSymbol,
              region: 'US'
            };
            break;
          default:
            continue; // Skip unknown providers
        }
        
        // Make the request
        const data = await this.rapidApiService.makeRequest(provider, endpoint, params);
        
        // Convert to standard format
        let tick: TickData | null = null;
        switch (provider) {
          case 'twelve_data':
            tick = convertTwelveDataQuoteToTick(data, symbol);
            break;
          case 'binance':
            tick = convertBinanceTickerToTick(data, symbol);
            break;
          case 'alpha_vantage':
            tick = convertAlphaVantageQuoteToTick(data, symbol);
            break;
          case 'yh_finance':
            tick = convertYahooFinanceQuoteToTick(data, symbol);
            break;
        }
        
        // If we got data, cache it and return
        if (tick) {
          // Cache the results
          this.tickCache.set(cacheKey, {
            data: tick,
            timestamp: Date.now(),
            symbol
          });
          
          return tick;
        }
      } catch (error) {
        console.error(`Error fetching tick data from ${provider}:`, error);
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    throw new Error(`Failed to fetch tick data for ${symbol}`);
  }
  
  /**
   * Search for symbols across multiple providers
   */
  public async searchSymbols(query: string): Promise<any[]> {
    const results: any[] = [];
    
    // Try each provider in sequence
    for (const provider of PROVIDER_SEQUENCE) {
      try {
        let endpoint: string;
        let params: Record<string, any> = {};
        
        switch (provider) {
          case 'twelve_data':
            endpoint = '/symbol_search';
            params = { 
              symbol: query,
              outputsize: 10
            };
            break;
          case 'yh_finance':
            endpoint = '/auto-complete';
            params = { 
              query,
              region: 'US'
            };
            break;
          default:
            continue; // Skip providers without search
        }
        
        // Make the request
        const data = await this.rapidApiService.makeRequest(provider, endpoint, params);
        
        // Process results
        switch (provider) {
          case 'twelve_data':
            if (data.data && Array.isArray(data.data)) {
              data.data.forEach((item: any) => {
                results.push({
                  symbol: item.symbol,
                  name: item.instrument_name,
                  exchange: item.exchange,
                  type: item.type,
                  source: 'twelve_data'
                });
              });
            }
            break;
          case 'yh_finance':
            if (data.quotes && Array.isArray(data.quotes)) {
              data.quotes.forEach((item: any) => {
                results.push({
                  symbol: item.symbol,
                  name: item.shortname || item.longname,
                  exchange: item.exchange,
                  type: item.quoteType,
                  source: 'yh_finance'
                });
              });
            }
            break;
        }
        
        // If we have enough results, return early
        if (results.length >= 20) {
          return results.slice(0, 20);
        }
      } catch (error) {
        console.error(`Error searching symbols with ${provider}:`, error);
        // Continue to next provider
      }
    }
    
    return results;
  }
  
  /**
   * Clear the cache
   */
  public clearCache(): void {
    this.candleCache.clear();
    this.tickCache.clear();
    console.log('Market data cache cleared');
  }
}

// Export singleton getter
export function getEnhancedMarketDataService(): EnhancedMarketDataService {
  return EnhancedMarketDataService.getInstance();
}