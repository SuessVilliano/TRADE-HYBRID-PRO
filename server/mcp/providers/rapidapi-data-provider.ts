/**
 * RapidAPI Data Provider
 * 
 * Implements MarketDataProvider interface using RapidAPI services
 * Supports Twelve Data, Binance, and other RapidAPI providers
 */

import { 
  MarketDataProvider, 
  MarketDataCapabilities, 
  MarketInfo, 
  CandleData, 
  TickData, 
  OrderBookData,
  MarketDataSubscription,
  TimeInterval
} from '../data/market-data-interface';
import { 
  getRapidAPIService, 
  RAPIDAPI_PROVIDERS 
} from '../../services/rapidapi-service';
import { 
  selectBestProviderForSymbol,
  mapSymbolForProvider,
  convertIntervalForProvider,
  convertTwelveDataToCandles,
  convertBinanceKlinesToCandles,
  convertAlphaVantageToCandles,
  convertTwelveDataQuoteToTick,
  convertBinanceTickerToTick
} from '../../lib/rapidapi-adapters';

interface RapidAPIDataProviderConfig {
  apiKey: string;
  preferredProvider?: string;
  providerPreference?: string[];
}

// Provider list in order of preference 
const DEFAULT_PROVIDER_PREFERENCE = ['twelve_data', 'binance', 'alpha_vantage', 'yh_finance'];

// RapidAPI Data Provider implementing MarketDataProvider interface
export class RapidAPIDataProvider implements MarketDataProvider {
  private apiKey: string;
  private preferredProvider?: string;
  private providerPreference: string[];
  private rapidApiService: any; // Type from rapidapi-service
  private connected: boolean = false;
  private subscriptions: Map<string, any> = new Map();
  
  constructor(config: RapidAPIDataProviderConfig) {
    this.apiKey = config.apiKey;
    this.preferredProvider = config.preferredProvider;
    this.providerPreference = config.providerPreference || DEFAULT_PROVIDER_PREFERENCE;
    
    // Initialize service
    this.rapidApiService = getRapidAPIService(this.apiKey);
  }
  
  /**
   * Get provider capabilities
   */
  getCapabilities(): MarketDataCapabilities {
    return {
      supportsHistoricalData: true,
      supportsRealTimeData: false,
      supportsOrderBook: false,
      supportedIntervals: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
      supportedMarkets: ['stocks', 'forex', 'crypto', 'indices', 'etfs'],
      maxCandleCount: 5000,
      requiresAuthentication: true
    };
  }
  
  /**
   * Connect to the service
   */
  async connect(): Promise<boolean> {
    try {
      // Test connection by getting providers
      const providers = this.rapidApiService.getProviders();
      
      if (Array.isArray(providers) && providers.length > 0) {
        this.connected = true;
        console.log(`Connected to RapidAPI with ${providers.length} available providers`);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error connecting to RapidAPI:', error);
      return false;
    }
  }
  
  /**
   * Disconnect from the service
   */
  async disconnect(): Promise<boolean> {
    this.connected = false;
    return true;
  }
  
  /**
   * Check if connected to the service
   */
  isConnected(): boolean {
    return this.connected;
  }
  
  /**
   * Get supported symbols
   */
  async getSupportedSymbols(): Promise<MarketInfo[]> {
    // This would be a huge list, so we'll just return an empty array
    // Clients should use searchSymbols instead
    return [];
  }
  
  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<MarketInfo[]> {
    // Not implemented for RapidAPI - would require specific endpoints
    // Return empty array for now
    return [];
  }
  
  /**
   * Get historical candle data
   */
  async getHistoricalData(params: any): Promise<CandleData[]> {
    if (!this.connected) {
      throw new Error('Not connected to RapidAPI service');
    }
    
    const { symbol, interval, limit } = params;
    
    // Get provider sequence to try
    const providers = this.getProviderSequence(symbol, 'candles');
    let lastError: any = null;
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        // Map symbol and interval to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        const mappedInterval = convertIntervalForProvider(interval, provider);
        
        switch (provider) {
          case 'twelve_data': {
            // Fetch data from Twelve Data
            const response = await this.rapidApiService.makeRequest(
              provider,
              '/time_series',
              {
                symbol: mappedSymbol,
                interval: mappedInterval,
                outputsize: limit
              }
            );
            
            // Convert to standard format
            return convertTwelveDataToCandles(response, symbol, interval);
          }
          
          case 'binance': {
            // Check if this is a crypto symbol
            if (!mappedSymbol.includes('USDT') && !mappedSymbol.includes('BTC')) {
              // Skip to next provider for non-crypto
              continue;
            }
            
            // Fetch data from Binance
            const response = await this.rapidApiService.makeRequest(
              provider,
              '/klines',
              {
                symbol: mappedSymbol,
                interval: mappedInterval,
                limit
              }
            );
            
            // Convert to standard format
            return convertBinanceKlinesToCandles(response, symbol, interval);
          }
          
          case 'alpha_vantage': {
            // Determine which function to use based on asset type
            let timeSeriesFunction = 'TIME_SERIES_DAILY';
            if (interval !== '1d') {
              timeSeriesFunction = 'TIME_SERIES_INTRADAY';
            }
            
            // Fetch data from Alpha Vantage
            const response = await this.rapidApiService.makeRequest(
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
            return convertAlphaVantageToCandles(response, symbol, interval);
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
    throw new Error(lastError ? 
      `Failed to fetch candles: ${lastError.message}` : 
      'All providers failed to fetch data'
    );
  }
  
  /**
   * Subscribe to real-time data
   */
  subscribeToRealtimeData(symbol: string, callback: (data: TickData) => void): MarketDataSubscription {
    // Real-time data not supported with RapidAPI
    // This would require websocket connections to each service
    throw new Error('Real-time data not supported with RapidAPI');
  }
  
  /**
   * Unsubscribe from real-time data
   */
  unsubscribeFromRealtimeData(subscription: MarketDataSubscription): boolean {
    return true;
  }
  
  /**
   * Subscribe to order book data
   */
  subscribeToOrderBook(symbol: string, callback: (data: OrderBookData) => void): MarketDataSubscription {
    // Order book data not supported with RapidAPI
    throw new Error('Order book data not supported with RapidAPI');
  }
  
  /**
   * Unsubscribe from order book data
   */
  unsubscribeFromOrderBook(subscription: MarketDataSubscription): boolean {
    return true;
  }
  
  /**
   * Get the latest price for a symbol
   */
  async getLatestPrice(symbol: string): Promise<TickData> {
    if (!this.connected) {
      throw new Error('Not connected to RapidAPI service');
    }
    
    // Get provider sequence to try
    const providers = this.getProviderSequence(symbol, 'quote');
    let lastError: any = null;
    
    // Try each provider in sequence
    for (const provider of providers) {
      try {
        // Map symbol to provider-specific format
        const mappedSymbol = mapSymbolForProvider(symbol, provider);
        
        switch (provider) {
          case 'twelve_data': {
            // Fetch quote from Twelve Data
            const response = await this.rapidApiService.makeRequest(
              provider,
              '/quote',
              {
                symbol: mappedSymbol
              }
            );
            
            // Convert to standard format
            const tick = convertTwelveDataQuoteToTick(response, symbol);
            
            if (tick) {
              return tick;
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
            const response = await this.rapidApiService.makeRequest(
              provider,
              '/ticker/24hr',
              {
                symbol: mappedSymbol
              }
            );
            
            // Convert to standard format
            const tick = convertBinanceTickerToTick(response, symbol);
            
            if (tick) {
              return tick;
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
    throw new Error(lastError ? 
      `Failed to fetch quote: ${lastError.message}` : 
      'All providers failed to fetch data'
    );
  }
  
  /**
   * Get provider sequence to try
   */
  private getProviderSequence(symbol: string, dataType: string): string[] {
    // Start with preferred provider if specified
    if (this.preferredProvider && RAPIDAPI_PROVIDERS[this.preferredProvider]) {
      // Start with preferred, then add the rest
      const providers = [this.preferredProvider];
      
      // Add the remaining providers from the preference list
      for (const provider of this.providerPreference) {
        if (provider !== this.preferredProvider) {
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
    for (const provider of this.providerPreference) {
      if (provider !== bestProvider) {
        providers.push(provider);
      }
    }
    
    return providers;
  }
}

/**
 * Create a RapidAPI data provider
 */
export function createRapidAPIDataProvider(config: RapidAPIDataProviderConfig): MarketDataProvider {
  return new RapidAPIDataProvider(config);
}