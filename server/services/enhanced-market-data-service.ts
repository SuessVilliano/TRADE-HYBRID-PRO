/**
 * Enhanced Market Data Service
 * Provides unified access to multiple market data providers including RapidAPI
 */

import axios from 'axios';
import { getAlpacaClient } from './alpaca-service';
import { getOandaClient } from './oanda-service';
import { RapidAPIService, getRapidAPIService } from './rapidapi-service';
import { 
  convertTwelveDataToCandles, 
  convertBinanceKlinesToCandles, 
  convertAlphaVantageToCandles,
  convertIntervalForProvider,
  convertTwelveDataQuoteToTick,
  convertBinanceTickerToTick,
  mapSymbolForProvider,
  selectBestProviderForSymbol
} from '../lib/rapidapi-adapters';
import { CandleData, TickData, TimeInterval } from '../mcp/data/market-data-interface';

/**
 * Market data provider options
 */
export interface MarketDataOptions {
  rapidApiKey?: string;
  preferredProvider?: string;
  fallbackToSimulated?: boolean;
}

/**
 * Market data result
 */
export interface MarketDataResult<T> {
  data: T;
  provider: string;
  symbol: string;
  status: 'success' | 'error';
  message?: string;
  error?: any;
}

/**
 * Enhanced Market Data Service
 */
export class EnhancedMarketDataService {
  private rapidApiKey?: string;
  rapidApiService?: RapidAPIService;
  private preferredProvider?: string;
  private fallbackToSimulated: boolean;

  constructor(options: MarketDataOptions = {}) {
    this.rapidApiKey = options.rapidApiKey;
    this.preferredProvider = options.preferredProvider;
    this.fallbackToSimulated = options.fallbackToSimulated ?? false;

    // Initialize RapidAPI service if key is provided
    if (this.rapidApiKey) {
      this.rapidApiService = new RapidAPIService(this.rapidApiKey);
    }
  }

  /**
   * Get current price for a symbol
   */
  async getQuote(symbol: string): Promise<MarketDataResult<TickData | null>> {
    const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    const isForex = this.isForexSymbol(cleanSymbol);
    
    // Try sources in this order: preferred provider, RapidAPI, Alpaca or Oanda
    let tick: TickData | null = null;
    let provider = '';
    let error = null;

    // 1. Try preferred provider if specified
    if (this.preferredProvider) {
      try {
        const result = await this.getQuoteFromProvider(cleanSymbol, this.preferredProvider);
        if (result.data) {
          return result;
        }
      } catch (err) {
        console.error(`Error getting quote from preferred provider ${this.preferredProvider}:`, err);
        error = err;
      }
    }

    // 2. Try RapidAPI if available
    if (this.rapidApiService) {
      try {
        // Select best RapidAPI provider for this symbol
        const bestProvider = selectBestProviderForSymbol(cleanSymbol, 'quote');
        const result = await this.getQuoteFromProvider(cleanSymbol, bestProvider);
        if (result.data) {
          return result;
        }
      } catch (err) {
        console.error('Error getting quote from RapidAPI:', err);
        error = err;
      }
    }

    // 3. Try Oanda for forex or Alpaca for others
    try {
      if (isForex) {
        // Use Oanda for forex
        const oandaSymbol = this.formatOandaSymbol(cleanSymbol);
        const oandaClient = getOandaClient();
        
        try {
          const response = await oandaClient.getPricing(oandaSymbol);
          
          if (response && response.prices && response.prices.length > 0) {
            const price = response.prices[0];
            tick = {
              timestamp: new Date(price.time).getTime(),
              price: (parseFloat(price.ask) + parseFloat(price.bid)) / 2,
              symbol: cleanSymbol,
              bid: parseFloat(price.bid),
              ask: parseFloat(price.ask)
            };
            provider = 'oanda';
          }
        } catch (oandaErr) {
          console.error('Error getting quote from Oanda:', oandaErr);
          error = oandaErr;
        }
      } else {
        // Use Alpaca for stocks and crypto
        const alpacaClient = getAlpacaClient();
        
        try {
          const response = await alpacaClient.getQuote(cleanSymbol);
          
          if (response) {
            // Handle different response formats
            let price = null;
            let bidPrice = null;
            let askPrice = null;
            
            if (response.askprice !== undefined && response.bidprice !== undefined) {
              price = (response.askprice + response.bidprice) / 2;
              bidPrice = response.bidprice;
              askPrice = response.askprice;
            } else if (response.ap !== undefined && response.bp !== undefined) {
              price = (parseFloat(response.ap) + parseFloat(response.bp)) / 2;
              bidPrice = parseFloat(response.bp);
              askPrice = parseFloat(response.ap);
            }
            
            if (price !== null) {
              tick = {
                timestamp: response.timestamp ? new Date(response.timestamp).getTime() : Date.now(),
                price,
                symbol: cleanSymbol,
                bid: bidPrice,
                ask: askPrice
              };
              provider = 'alpaca';
            }
          }
        } catch (alpacaErr) {
          console.error('Error getting quote from Alpaca:', alpacaErr);
          error = alpacaErr;
        }
      }
    } catch (err) {
      console.error('Error during provider fallback for quote:', err);
      error = err;
    }

    // Return the result
    if (tick) {
      return {
        data: tick,
        provider,
        symbol: cleanSymbol,
        status: 'success'
      };
    } else {
      return {
        data: null,
        provider: 'none',
        symbol: cleanSymbol,
        status: 'error',
        message: 'Failed to get quote from any provider',
        error
      };
    }
  }

  /**
   * Get historical market data for a symbol
   */
  async getCandles(
    symbol: string, 
    interval: TimeInterval | string = '1h',
    limit: number = 100
  ): Promise<MarketDataResult<CandleData[]>> {
    const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
    const isForex = this.isForexSymbol(cleanSymbol);
    
    // Try sources in this order: preferred provider, RapidAPI, Alpaca or Oanda
    let candles: CandleData[] = [];
    let provider = '';
    let error = null;

    // 1. Try preferred provider if specified
    if (this.preferredProvider) {
      try {
        const result = await this.getCandlesFromProvider(cleanSymbol, interval.toString(), limit, this.preferredProvider);
        if (result.data && result.data.length > 0) {
          return result;
        }
      } catch (err) {
        console.error(`Error getting candles from preferred provider ${this.preferredProvider}:`, err);
        error = err;
      }
    }

    // 2. Try RapidAPI if available
    if (this.rapidApiService) {
      try {
        // Select best RapidAPI provider for this symbol
        const bestProvider = selectBestProviderForSymbol(cleanSymbol, 'candles');
        const result = await this.getCandlesFromProvider(cleanSymbol, interval.toString(), limit, bestProvider);
        if (result.data && result.data.length > 0) {
          return result;
        }
      } catch (err) {
        console.error('Error getting candles from RapidAPI:', err);
        error = err;
      }
    }

    // 3. Try Oanda for forex or Alpaca for others
    try {
      if (isForex) {
        // Use Oanda for forex
        const oandaSymbol = this.formatOandaSymbol(cleanSymbol);
        const oandaClient = getOandaClient();
        
        try {
          // Convert interval to Oanda granularity format
          let granularity = 'H1'; // Default 1 hour
          
          switch (interval.toLowerCase()) {
            case '1m': granularity = 'M1'; break;
            case '5m': granularity = 'M5'; break;
            case '15m': granularity = 'M15'; break;
            case '30m': granularity = 'M30'; break;
            case '1h': granularity = 'H1'; break;
            case '4h': granularity = 'H4'; break;
            case '1d': granularity = 'D'; break;
            case '1w': granularity = 'W'; break;
          }
          
          const response = await oandaClient.getCandles(oandaSymbol, {
            granularity,
            count: limit
          });
          
          if (response && response.candles) {
            candles = response.candles.map((candle: any) => ({
              timestamp: new Date(candle.time).getTime(),
              open: parseFloat(candle.mid.o),
              high: parseFloat(candle.mid.h),
              low: parseFloat(candle.mid.l),
              close: parseFloat(candle.mid.c),
              volume: 0, // Oanda doesn't provide volume for forex
              symbol: cleanSymbol,
              interval: interval.toString()
            }));
            provider = 'oanda';
          }
        } catch (oandaErr) {
          console.error('Error getting candles from Oanda:', oandaErr);
          error = oandaErr;
        }
      } else {
        // Use Alpaca for stocks and crypto
        const alpacaClient = getAlpacaClient();
        
        try {
          // Convert interval to Alpaca timeframe format
          let timeframe = '1Hour'; // Default 1 hour
          
          switch (interval.toLowerCase()) {
            case '1m': timeframe = '1Min'; break;
            case '5m': timeframe = '5Min'; break;
            case '15m': timeframe = '15Min'; break;
            case '30m': timeframe = '30Min'; break;
            case '1h': timeframe = '1Hour'; break;
            case '1d': timeframe = '1Day'; break;
            case '1w': timeframe = '1Week'; break;
          }
          
          const barset = await alpacaClient.getBars({
            symbol: cleanSymbol,
            timeframe,
            limit
          });
          
          if (barset) {
            candles = barset.map((bar: any) => ({
              timestamp: new Date(bar.t).getTime(),
              open: bar.o,
              high: bar.h,
              low: bar.l,
              close: bar.c,
              volume: bar.v,
              symbol: cleanSymbol,
              interval: interval.toString()
            }));
            provider = 'alpaca';
          }
        } catch (alpacaErr) {
          console.error('Error getting candles from Alpaca:', alpacaErr);
          error = alpacaErr;
        }
      }
    } catch (err) {
      console.error('Error during provider fallback for candles:', err);
      error = err;
    }

    // Return the result
    if (candles.length > 0) {
      return {
        data: candles,
        provider,
        symbol: cleanSymbol,
        status: 'success'
      };
    } else {
      return {
        data: [],
        provider: 'none',
        symbol: cleanSymbol,
        status: 'error',
        message: 'Failed to get candles from any provider',
        error
      };
    }
  }

  /**
   * Get quote from a specific provider
   */
  private async getQuoteFromProvider(
    symbol: string,
    provider: string
  ): Promise<MarketDataResult<TickData | null>> {
    if (!this.rapidApiService) {
      return {
        data: null,
        provider: 'none',
        symbol,
        status: 'error',
        message: 'RapidAPI service not available'
      };
    }

    try {
      const mappedSymbol = mapSymbolForProvider(symbol, provider);
      
      switch (provider) {
        case 'twelve_data':
          const twelveDataQuote = await this.rapidApiService.makeRequest(
            'twelve_data',
            '/quote',
            { symbol: mappedSymbol }
          );
          
          const tick = convertTwelveDataQuoteToTick(twelveDataQuote, symbol);
          return {
            data: tick,
            provider: 'twelve_data',
            symbol,
            status: tick ? 'success' : 'error',
            message: tick ? undefined : 'Failed to parse Twelve Data quote'
          };
        
        case 'binance':
          const binanceTicker = await this.rapidApiService.makeRequest(
            'binance',
            '/ticker/24hr',
            { symbol: mappedSymbol }
          );
          
          const binanceTick = convertBinanceTickerToTick(binanceTicker, symbol);
          return {
            data: binanceTick,
            provider: 'binance',
            symbol,
            status: binanceTick ? 'success' : 'error',
            message: binanceTick ? undefined : 'Failed to parse Binance ticker'
          };
          
        case 'yh_finance':
          const yahooQuote = await this.rapidApiService.makeRequest(
            'yh_finance',
            '/stock/v2/get-summary',
            { symbol: mappedSymbol, region: 'US' }
          );
          
          // For Yahoo Finance, we need to manually create the tick
          if (yahooQuote && yahooQuote.price && yahooQuote.price.regularMarketPrice) {
            const price = yahooQuote.price;
            const tick: TickData = {
              timestamp: Date.now(),
              price: price.regularMarketPrice.raw,
              symbol,
              volume: price.regularMarketVolume ? price.regularMarketVolume.raw : undefined
            };
            return {
              data: tick,
              provider: 'yh_finance',
              symbol,
              status: 'success'
            };
          }
          return {
            data: null,
            provider: 'yh_finance',
            symbol,
            status: 'error',
            message: 'Failed to parse Yahoo Finance quote'
          };
        
        default:
          return {
            data: null,
            provider,
            symbol,
            status: 'error',
            message: `Provider ${provider} not supported for quotes`
          };
      }
    } catch (error) {
      console.error(`Error fetching quote from ${provider}:`, error);
      return {
        data: null,
        provider,
        symbol,
        status: 'error',
        message: `Error fetching quote from ${provider}`,
        error
      };
    }
  }

  /**
   * Get candles from a specific provider
   */
  private async getCandlesFromProvider(
    symbol: string,
    interval: string,
    limit: number,
    provider: string
  ): Promise<MarketDataResult<CandleData[]>> {
    if (!this.rapidApiService) {
      return {
        data: [],
        provider: 'none',
        symbol,
        status: 'error',
        message: 'RapidAPI service not available'
      };
    }

    try {
      const mappedSymbol = mapSymbolForProvider(symbol, provider);
      const providerInterval = convertIntervalForProvider(interval, provider);
      
      switch (provider) {
        case 'twelve_data':
          const twelveDataTimeSeries = await this.rapidApiService.makeRequest(
            'twelve_data',
            '/time_series',
            {
              symbol: mappedSymbol,
              interval: providerInterval,
              outputsize: limit
            }
          );
          
          const candles = convertTwelveDataToCandles(twelveDataTimeSeries, symbol, interval);
          return {
            data: candles,
            provider: 'twelve_data',
            symbol,
            status: candles.length > 0 ? 'success' : 'error',
            message: candles.length > 0 ? undefined : 'Failed to parse Twelve Data time series'
          };
        
        case 'binance':
          const binanceKlines = await this.rapidApiService.makeRequest(
            'binance',
            '/klines',
            {
              symbol: mappedSymbol,
              interval: providerInterval,
              limit
            }
          );
          
          const binanceCandles = convertBinanceKlinesToCandles(binanceKlines, symbol, interval);
          return {
            data: binanceCandles,
            provider: 'binance',
            symbol,
            status: binanceCandles.length > 0 ? 'success' : 'error',
            message: binanceCandles.length > 0 ? undefined : 'Failed to parse Binance klines'
          };
          
        case 'alpha_vantage':
          const alphaVantageData = await this.rapidApiService.makeRequest(
            'alpha_vantage',
            '/query',
            {
              function: 'TIME_SERIES_DAILY',
              symbol: mappedSymbol,
              outputsize: 'compact',
              datatype: 'json'
            }
          );
          
          const alphaCandles = convertAlphaVantageToCandles(alphaVantageData, symbol, interval);
          return {
            data: alphaCandles,
            provider: 'alpha_vantage',
            symbol,
            status: alphaCandles.length > 0 ? 'success' : 'error',
            message: alphaCandles.length > 0 ? undefined : 'Failed to parse Alpha Vantage time series'
          };
        
        default:
          return {
            data: [],
            provider,
            symbol,
            status: 'error',
            message: `Provider ${provider} not supported for candles`
          };
      }
    } catch (error) {
      console.error(`Error fetching candles from ${provider}:`, error);
      return {
        data: [],
        provider,
        symbol,
        status: 'error',
        message: `Error fetching candles from ${provider}`,
        error
      };
    }
  }

  /**
   * Check if a symbol is a forex pair
   */
  private isForexSymbol(symbol: string): boolean {
    // Check for common forex pair formats
    return /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol) || // Format: EUR/USD
           /^[A-Z]{3}_[A-Z]{3}$/.test(symbol) || // Format: EUR_USD
           (/^[A-Z]{6}$/.test(symbol) && // Format: EURUSD
            ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
              currency => symbol.includes(currency)
            ));
  }

  /**
   * Format a symbol for Oanda
   */
  private formatOandaSymbol(symbol: string): string {
    // Convert to Oanda's required format (EUR_USD)
    if (/^[A-Z]{6}$/.test(symbol)) {
      return `${symbol.substring(0, 3)}_${symbol.substring(3, 6)}`;
    } else if (/^[A-Z]{3}\/[A-Z]{3}$/.test(symbol)) {
      return symbol.replace('/', '_');
    }
    return symbol;
  }
}

// Create singleton instance
let enhancedMarketDataServiceInstance: EnhancedMarketDataService | null = null;

/**
 * Get or create the Enhanced Market Data Service instance
 */
export function getEnhancedMarketDataService(options: MarketDataOptions = {}): EnhancedMarketDataService {
  if (!enhancedMarketDataServiceInstance) {
    enhancedMarketDataServiceInstance = new EnhancedMarketDataService(options);
  }
  
  // Update options if needed
  if (options.rapidApiKey && !enhancedMarketDataServiceInstance.rapidApiService) {
    enhancedMarketDataServiceInstance = new EnhancedMarketDataService(options);
  }
  
  return enhancedMarketDataServiceInstance;
}

/**
 * Reset the service instance
 */
export function resetEnhancedMarketDataService(): void {
  enhancedMarketDataServiceInstance = null;
}