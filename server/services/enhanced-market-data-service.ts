/**
 * Enhanced Market Data Service
 * 
 * Service that combines multiple data providers to deliver reliable market data
 * with automatic failover and standardized responses across providers.
 */

import { 
  CandleData, 
  TickData 
} from '../mcp/data/market-data-interface';
import { 
  getRapidAPIService, 
  RAPIDAPI_PROVIDERS 
} from './rapidapi-service';
import { 
  selectBestProviderForSymbol,
  mapSymbolForProvider,
  convertIntervalForProvider,
  convertTwelveDataToCandles,
  convertBinanceKlinesToCandles,
  convertAlphaVantageToCandles,
  convertTwelveDataQuoteToTick,
  convertBinanceTickerToTick
} from '../lib/rapidapi-adapters';

// Provider list in order of preference
const DEFAULT_PROVIDER_PREFERENCE = ['twelve_data', 'binance', 'alpha_vantage', 'yh_finance'];

// Result object for service responses
interface MarketDataResult<T> {
  status: 'success' | 'error';
  message?: string;
  data: T;
  provider?: string;
}

// Configuration options for the market data service
interface EnhancedMarketDataOptions {
  rapidApiKey?: string;
  preferredProvider?: string;
  providerPreference?: string[];
  maxRetries?: number;
  timeout?: number;
}

// The Enhanced Market Data Service class
class EnhancedMarketDataService {
  private options: EnhancedMarketDataOptions;
  private rapidApiKey: string | undefined;
  
  constructor(options: EnhancedMarketDataOptions = {}) {
    this.options = {
      maxRetries: 2,
      timeout: 10000,
      providerPreference: DEFAULT_PROVIDER_PREFERENCE,
      ...options
    };
    
    this.rapidApiKey = options.rapidApiKey;
  }
  
  /**
   * Get historical candle data for a symbol
   * @param symbol Symbol to get data for
   * @param interval Timeframe interval (e.g. '1h', '1d')
   * @param limit Number of candles to return
   * @returns Promise with standardized candle data or error
   */
  async getCandles(
    symbol: string,
    interval: string,
    limit: number = 100
  ): Promise<MarketDataResult<CandleData[]>> {
    // Get preferred provider (or determine best provider for the symbol)
    const providers = this.getProviderSequence(symbol, 'candles');
    let lastError: any = null;
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        if (!this.rapidApiKey) {
          return {
            status: 'error',
            message: 'RapidAPI key is required but not provided',
            data: []
          };
        }
        
        // Map symbol and interval to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        const mappedInterval = convertIntervalForProvider(interval, provider);
        
        // Get RapidAPI service
        const rapidApiService = getRapidAPIService(this.rapidApiKey);
        
        switch (provider) {
          case 'twelve_data': {
            // Fetch data from Twelve Data
            const response = await rapidApiService.makeRequest(
              provider,
              '/time_series',
              {
                symbol: mappedSymbol,
                interval: mappedInterval,
                outputsize: limit
              }
            );
            
            // Convert to standard format
            const candles = convertTwelveDataToCandles(response, symbol, interval);
            
            return {
              status: 'success',
              data: candles,
              provider
            };
          }
          
          case 'binance': {
            // Check if this is a crypto symbol
            if (!mappedSymbol.includes('USDT') && !mappedSymbol.includes('BTC')) {
              // Skip to next provider for non-crypto
              continue;
            }
            
            // Fetch data from Binance
            const response = await rapidApiService.makeRequest(
              provider,
              '/klines',
              {
                symbol: mappedSymbol,
                interval: mappedInterval,
                limit
              }
            );
            
            // Convert to standard format
            const candles = convertBinanceKlinesToCandles(response, symbol, interval);
            
            return {
              status: 'success',
              data: candles,
              provider
            };
          }
          
          case 'alpha_vantage': {
            // Determine which function to use based on asset type
            let timeSeriesFunction = 'TIME_SERIES_DAILY';
            if (interval !== '1d') {
              timeSeriesFunction = 'TIME_SERIES_INTRADAY';
            }
            
            // Fetch data from Alpha Vantage
            const response = await rapidApiService.makeRequest(
              provider,
              '/query',
              {
                function: timeSeriesFunction,
                symbol: mappedSymbol,
                interval: mappedInterval,
                outputsize: 'compact'
              }
            );
            
            // Convert to standard format
            const candles = convertAlphaVantageToCandles(response, symbol, interval);
            
            return {
              status: 'success',
              data: candles,
              provider
            };
          }
          
          default:
            // Skip unknown providers
            continue;
        }
      } catch (error) {
        console.error(`Error fetching candles from ${provider}:`, error);
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    return {
      status: 'error',
      message: lastError ? `Failed to fetch candles: ${lastError.message}` : 'All providers failed',
      data: [],
      provider: providers[0] // Just indicate we started with this provider
    };
  }
  
  /**
   * Get current price quote for a symbol
   * @param symbol Symbol to get quote for
   * @returns Promise with standardized tick data or error
   */
  async getQuote(symbol: string): Promise<MarketDataResult<TickData | null>> {
    // Get preferred provider (or determine best provider for the symbol)
    const providers = this.getProviderSequence(symbol, 'quote');
    let lastError: any = null;
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        if (!this.rapidApiKey) {
          return {
            status: 'error',
            message: 'RapidAPI key is required but not provided',
            data: null
          };
        }
        
        // Map symbol to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Get RapidAPI service
        const rapidApiService = getRapidAPIService(this.rapidApiKey);
        
        switch (provider) {
          case 'twelve_data': {
            // Fetch quote from Twelve Data
            const response = await rapidApiService.makeRequest(
              provider,
              '/quote',
              {
                symbol: mappedSymbol
              }
            );
            
            // Convert to standard format
            const tick = convertTwelveDataQuoteToTick(response, symbol);
            
            if (tick) {
              return {
                status: 'success',
                data: tick,
                provider
              };
            }
            // If null, continue to next provider
            break;
          }
          
          case 'binance': {
            // Check if this is a crypto symbol
            if (!mappedSymbol.includes('USDT') && !mappedSymbol.includes('BTC')) {
              // Skip to next provider for non-crypto
              continue;
            }
            
            // Fetch quote from Binance
            const response = await rapidApiService.makeRequest(
              provider,
              '/ticker/24hr',
              {
                symbol: mappedSymbol
              }
            );
            
            // Convert to standard format
            const tick = convertBinanceTickerToTick(response, symbol);
            
            if (tick) {
              return {
                status: 'success',
                data: tick,
                provider
              };
            }
            // If null, continue to next provider
            break;
          }
          
          default:
            // Skip unknown providers
            continue;
        }
      } catch (error) {
        console.error(`Error fetching quote from ${provider}:`, error);
        lastError = error;
        // Continue to next provider
      }
    }
    
    // If we get here, all providers failed
    return {
      status: 'error',
      message: lastError ? `Failed to fetch quote: ${lastError.message}` : 'All providers failed',
      data: null,
      provider: providers[0] // Just indicate we started with this provider
    };
  }
  
  /**
   * Get an array of providers to try, in order
   * @param symbol Symbol to get data for
   * @param dataType Type of data (candles, quote, etc.)
   * @returns Array of provider IDs
   */
  private getProviderSequence(symbol: string, dataType: string): string[] {
    const preferredProvider = this.options.preferredProvider;
    
    // Start with preferred provider if specified
    if (preferredProvider && RAPIDAPI_PROVIDERS[preferredProvider]) {
      // Start with preferred, then add the rest
      const providers = [preferredProvider];
      
      // Add the remaining providers from the preference list
      for (const provider of (this.options.providerPreference || DEFAULT_PROVIDER_PREFERENCE)) {
        if (provider !== preferredProvider) {
          providers.push(provider);
        }
      }
      
      return providers;
    }
    
    // Otherwise, select best provider for this symbol
    const bestProvider = selectBestProviderForSymbol(symbol, dataType);
    
    // Start with best, then add the rest
    const providers = [bestProvider];
    
    // Add the remaining providers from the preference list
    for (const provider of (this.options.providerPreference || DEFAULT_PROVIDER_PREFERENCE)) {
      if (provider !== bestProvider) {
        providers.push(provider);
      }
    }
    
    return providers;
  }
}

// Service factory function
let serviceInstance: EnhancedMarketDataService | null = null;

export function getEnhancedMarketDataService(options: EnhancedMarketDataOptions = {}): EnhancedMarketDataService {
  if (!serviceInstance || options.rapidApiKey) {
    serviceInstance = new EnhancedMarketDataService(options);
  }
  
  return serviceInstance;
}

// Reset service instance (for testing)
export function resetEnhancedMarketDataService(): void {
  serviceInstance = null;
}