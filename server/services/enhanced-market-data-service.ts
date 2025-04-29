/**
 * Enhanced Market Data Service
 * 
 * Provides a unified interface for accessing market data from various providers
 * with support for failover between providers if one fails.
 */

import { 
  CandleData, 
  TickData, 
  MarketDataResult,
  MarketDataRequestOptions
} from '../mcp/data/market-data-interface';

import { 
  getRapidAPIService, 
  resetRapidAPIService 
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

// Enhanced Market Data Service configuration
interface EnhancedMarketDataConfig {
  rapidApiKey?: string;
  preferredProvider?: string;
  maxRetries?: number;
  timeout?: number;
}

/**
 * Enhanced Market Data Service
 * Provides access to market data with automatic failover between providers
 */
class EnhancedMarketDataService {
  private config: EnhancedMarketDataConfig;
  private fallbackProviders: { [type: string]: string[] } = {
    crypto: ['binance', 'twelve_data', 'coinranking', 'alpha_vantage'],
    stocks: ['twelve_data', 'yh_finance', 'alpha_vantage'],
    forex: ['twelve_data', 'alpha_vantage']
  };

  constructor(config: EnhancedMarketDataConfig = {}) {
    this.config = {
      rapidApiKey: config.rapidApiKey,
      preferredProvider: config.preferredProvider,
      maxRetries: config.maxRetries || 2,
      timeout: config.timeout || 30000
    };

    console.log('Enhanced Market Data Service initialized');
  }

  /**
   * Get historical candle data for a symbol
   * @param symbol Symbol to get data for
   * @param interval Time interval (e.g., '1h', '1d')
   * @param limit Maximum number of candles to return
   * @returns Promise with candle data
   */
  async getCandles(
    symbol: string,
    interval: string,
    limit: number = 100
  ): Promise<MarketDataResult<CandleData[]>> {
    // Ensure we have a RapidAPI key
    if (!this.config.rapidApiKey) {
      return {
        data: [],
        provider: 'none',
        symbol,
        status: 'error',
        message: 'RapidAPI key is required for market data'
      };
    }

    // Determine the best provider for this symbol
    let provider = this.config.preferredProvider || selectBestProviderForSymbol(symbol, 'candles');
    let providers = this.getProvidersForSymbol(symbol);
    let attempts = 0;
    let error: any = null;

    // Try each provider until we get a successful response or run out of providers
    while (attempts < Math.min(providers.length, this.config.maxRetries || 2)) {
      try {
        console.log(`Fetching ${symbol} candles with provider: ${provider}`);
        
        // Map the symbol to the format expected by the provider
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Convert the interval to the format expected by the provider
        const mappedInterval = convertIntervalForProvider(interval, provider);
        
        // Get the RapidAPI service
        const rapidApiService = getRapidAPIService(this.config.rapidApiKey);
        
        // Make the request to the appropriate provider endpoint
        let data;
        switch (provider) {
          case 'twelve_data':
            data = await rapidApiService.makeRequest('twelve_data', '/time_series', {
              symbol: mappedSymbol,
              interval: mappedInterval,
              outputsize: limit
            });
            return {
              data: convertTwelveDataToCandles(data, symbol, interval),
              provider,
              symbol,
              status: 'success'
            };
            
          case 'binance':
            data = await rapidApiService.makeRequest('binance', '/klines', {
              symbol: mappedSymbol,
              interval: mappedInterval,
              limit
            });
            return {
              data: convertBinanceKlinesToCandles(data, symbol, interval),
              provider,
              symbol,
              status: 'success'
            };
            
          case 'alpha_vantage':
            data = await rapidApiService.makeRequest('alpha_vantage', '/query', {
              function: 'TIME_SERIES_DAILY',
              symbol: mappedSymbol,
              outputsize: limit > 100 ? 'full' : 'compact'
            });
            return {
              data: convertAlphaVantageToCandles(data, symbol, interval),
              provider,
              symbol,
              status: 'success'
            };
            
          case 'yh_finance':
            // Yahoo Finance charts endpoint
            data = await rapidApiService.makeRequest('yh_finance', `/stock/v3/get-chart`, {
              symbol: mappedSymbol,
              interval: mappedInterval,
              range: '1mo',
              region: 'US'
            });
            
            // Convert Yahoo Finance format to our standard format
            if (data && data.chart && data.chart.result && data.chart.result.length > 0) {
              const result = data.chart.result[0];
              const timestamps = result.timestamp;
              const quotes = result.indicators.quote[0];
              const candles: CandleData[] = [];
              
              for (let i = 0; i < timestamps.length; i++) {
                candles.push({
                  timestamp: timestamps[i] * 1000, // Convert to milliseconds
                  open: quotes.open[i],
                  high: quotes.high[i],
                  low: quotes.low[i],
                  close: quotes.close[i],
                  volume: quotes.volume[i],
                  symbol,
                  interval
                });
              }
              
              return {
                data: candles,
                provider,
                symbol,
                status: 'success'
              };
            }
            
            break;
          
          default:
            throw new Error(`Unsupported provider: ${provider}`);
        }
      } catch (err) {
        console.error(`Error fetching candles from ${provider}:`, err);
        error = err;
        
        // Try the next provider
        provider = providers[++attempts];
      }
    }

    // If we get here, all providers failed
    return {
      data: [],
      provider,
      symbol,
      status: 'error',
      message: `Failed to fetch candles after ${attempts} attempts`,
      error
    };
  }

  /**
   * Get current price quote for a symbol
   * @param symbol Symbol to get quote for
   * @returns Promise with tick data
   */
  async getQuote(symbol: string): Promise<MarketDataResult<TickData | null>> {
    // Ensure we have a RapidAPI key
    if (!this.config.rapidApiKey) {
      return {
        data: null,
        provider: 'none',
        symbol,
        status: 'error',
        message: 'RapidAPI key is required for market data'
      };
    }

    // Determine the best provider for this symbol
    let provider = this.config.preferredProvider || selectBestProviderForSymbol(symbol, 'quote');
    let providers = this.getProvidersForSymbol(symbol);
    let attempts = 0;
    let error: any = null;

    // Try each provider until we get a successful response or run out of providers
    while (attempts < Math.min(providers.length, this.config.maxRetries || 2)) {
      try {
        console.log(`Fetching ${symbol} quote with provider: ${provider}`);
        
        // Map the symbol to the format expected by the provider
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        // Get the RapidAPI service
        const rapidApiService = getRapidAPIService(this.config.rapidApiKey);
        
        // Make the request to the appropriate provider endpoint
        let data;
        switch (provider) {
          case 'twelve_data':
            data = await rapidApiService.makeRequest('twelve_data', '/quote', {
              symbol: mappedSymbol
            });
            
            const tickData = convertTwelveDataQuoteToTick(data, symbol);
            if (tickData) {
              return {
                data: tickData,
                provider,
                symbol,
                status: 'success'
              };
            }
            break;
            
          case 'binance':
            data = await rapidApiService.makeRequest('binance', '/ticker/24hr', {
              symbol: mappedSymbol
            });
            
            const binanceTickData = convertBinanceTickerToTick(data, symbol);
            if (binanceTickData) {
              return {
                data: binanceTickData,
                provider,
                symbol,
                status: 'success'
              };
            }
            break;
            
          case 'alpha_vantage':
            data = await rapidApiService.makeRequest('alpha_vantage', '/query', {
              function: 'GLOBAL_QUOTE',
              symbol: mappedSymbol
            });
            
            if (data && data['Global Quote']) {
              const quote = data['Global Quote'];
              const tickData: TickData = {
                timestamp: Date.now(),
                price: parseFloat(quote['05. price']),
                symbol,
                volume: parseFloat(quote['06. volume'])
              };
              
              return {
                data: tickData,
                provider,
                symbol,
                status: 'success'
              };
            }
            break;
            
          case 'yh_finance':
            data = await rapidApiService.makeRequest('yh_finance', '/market/v2/get-quotes', {
              region: 'US',
              symbols: mappedSymbol
            });
            
            if (data && data.quoteResponse && data.quoteResponse.result && data.quoteResponse.result.length > 0) {
              const quote = data.quoteResponse.result[0];
              const tickData: TickData = {
                timestamp: Date.now(),
                price: quote.regularMarketPrice,
                bid: quote.bid,
                ask: quote.ask,
                symbol,
                volume: quote.regularMarketVolume
              };
              
              return {
                data: tickData,
                provider,
                symbol,
                status: 'success'
              };
            }
            break;
          
          default:
            throw new Error(`Unsupported provider: ${provider}`);
        }
      } catch (err) {
        console.error(`Error fetching quote from ${provider}:`, err);
        error = err;
        
        // Try the next provider
        provider = providers[++attempts];
      }
    }

    // If we get here, all providers failed
    return {
      data: null,
      provider,
      symbol,
      status: 'error',
      message: `Failed to fetch quote after ${attempts} attempts`,
      error
    };
  }

  /**
   * Get providers that can handle this symbol
   * @param symbol Symbol to get providers for
   * @returns Array of provider IDs
   */
  private getProvidersForSymbol(symbol: string): string[] {
    // Normalize symbol and detect asset type
    const upperSymbol = symbol.toUpperCase();
    let assetType = 'stocks'; // Default assumption
    
    // Check for crypto
    if (
      upperSymbol.endsWith('BTC') ||
      upperSymbol.endsWith('ETH') ||
      upperSymbol.endsWith('USDT') ||
      upperSymbol.includes('BITCOIN') ||
      upperSymbol.includes('BNB')
    ) {
      assetType = 'crypto';
    }
    
    // Check for forex
    else if (
      /^[A-Z]{3}\/[A-Z]{3}$/.test(upperSymbol) || // Format: EUR/USD
      /^[A-Z]{3}_[A-Z]{3}$/.test(upperSymbol) || // Format: EUR_USD
      (
        /^[A-Z]{6}$/.test(upperSymbol) && // Format: EURUSD
        ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
          currency => upperSymbol.includes(currency)
        )
      )
    ) {
      assetType = 'forex';
    }
    
    return this.fallbackProviders[assetType] || this.fallbackProviders.stocks;
  }
}

// Singleton instance
let enhancedMarketDataServiceInstance: EnhancedMarketDataService | null = null;

/**
 * Get or create the Enhanced Market Data Service instance
 * @param config Service configuration
 * @returns Enhanced Market Data Service instance
 */
export function getEnhancedMarketDataService(config: EnhancedMarketDataConfig = {}): EnhancedMarketDataService {
  if (!enhancedMarketDataServiceInstance) {
    enhancedMarketDataServiceInstance = new EnhancedMarketDataService(config);
  } else if (config.rapidApiKey) {
    // If the API key changes, reset the instance
    enhancedMarketDataServiceInstance = new EnhancedMarketDataService(config);
  }
  
  return enhancedMarketDataServiceInstance;
}

/**
 * Reset the Enhanced Market Data Service instance
 */
export function resetEnhancedMarketDataService(): void {
  enhancedMarketDataServiceInstance = null;
  resetRapidAPIService();
}