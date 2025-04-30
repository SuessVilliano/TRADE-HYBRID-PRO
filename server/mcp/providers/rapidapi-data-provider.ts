/**
 * RapidAPI Data Provider
 * 
 * This provider integrates with the enhanced market data service to provide
 * robust market data through multiple RapidAPI providers with automatic fallback.
 */

import {
  TimeInterval,
  CandleData,
  TickData
} from '../data/market-data-interface';
import { getEnhancedMarketDataService } from '../../services/enhanced-market-data-service';

// Define our own interfaces to match the expected MarketDataProvider
export enum MarketDataProviderType {
  REST_API = 'REST_API',
  WEBSOCKET = 'WEBSOCKET',
  HYBRID = 'HYBRID'
}

export enum MarketDataSubscriptionType {
  CANDLES = 'CANDLES',
  QUOTES = 'QUOTES',
  ORDERBOOK = 'ORDERBOOK'
}

export interface MarketDataCapabilities {
  symbols: string[];
  intervals: string[];
  subscriptionTypes: MarketDataSubscriptionType[];
  historical: boolean;
  realtime: boolean;
  maxHistoryBars: number;
  maxSubscriptions: number;
}

export interface SymbolInfo {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
  currency: string;
}

export interface OrderBookData {
  symbol: string;
  timestamp: number;
  bids: { price: number; quantity: number }[];
  asks: { price: number; quantity: number }[];
}

export enum MarketDataErrorType {
  PROVIDER_ERROR = 'PROVIDER_ERROR',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_SYMBOL = 'INVALID_SYMBOL',
  INVALID_INTERVAL = 'INVALID_INTERVAL',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  UNSUPPORTED_OPERATION = 'UNSUPPORTED_OPERATION'
}

// Define the MarketDataProvider interface
export interface MarketDataProvider {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly type: MarketDataProviderType;
  readonly capabilities: MarketDataCapabilities;

  initialize(): Promise<void>;
  searchSymbols(query: string): Promise<SymbolInfo[]>;
  getHistoricalCandles(symbol: string, interval: TimeInterval, from: number, to?: number): Promise<CandleData[]>;
  getLatestPrice(symbol: string): Promise<TickData>;
  subscribe(subscriptionType: MarketDataSubscriptionType, symbol: string, interval?: TimeInterval, callback?: (data: any) => void): Promise<string>;
  unsubscribe(subscriptionId: string): Promise<void>;
  getOrderBook(symbol: string): Promise<OrderBookData>;
  dispose(): Promise<void>;
}

interface RapidAPIProviderOptions {
  apiKey: string;
  preferredProvider?: string;
  providerPreference?: string[];
}

export function createRapidAPIDataProvider(options: RapidAPIProviderOptions): RapidAPIDataProvider {
  const provider = new RapidAPIDataProvider(options);
  return provider;
}

export class RapidAPIDataProvider implements MarketDataProvider {
  private enhancedMarketDataService = getEnhancedMarketDataService();
  private subscriptions = new Map<string, any>();
  private apiKey: string;
  private preferredProvider?: string;
  private providerPreference?: string[];
  
  // Provider information
  public readonly id = 'rapidapi';
  public readonly name = 'RapidAPI Market Data';
  public readonly description = 'Multi-provider market data through RapidAPI';
  public readonly type = MarketDataProviderType.REST_API;
  public readonly capabilities: MarketDataCapabilities = {
    symbols: ['stocks', 'forex', 'crypto', 'indices', 'futures'],
    intervals: ['1m', '5m', '15m', '30m', '1h', '4h', '1d', '1w', '1M'],
    subscriptionTypes: [MarketDataSubscriptionType.CANDLES, MarketDataSubscriptionType.QUOTES],
    historical: true,
    realtime: true,
    maxHistoryBars: 5000,
    maxSubscriptions: 50
  };
  
  constructor(options: RapidAPIProviderOptions) {
    this.apiKey = options.apiKey;
    this.preferredProvider = options.preferredProvider;
    this.providerPreference = options.providerPreference;
    
    // Set the API key in process.env for the enhanced market data service
    process.env.RAPID_API_KEY = this.apiKey;
  }
  
  /**
   * Initialize the provider
   */
  public async initialize(): Promise<void> {
    console.log('RapidAPI Data Provider initialized');
  }
  
  /**
   * Connect to the provider
   * @returns true if connection was successful
   */
  public async connect(): Promise<boolean> {
    try {
      // Just verify that we can connect to enhanced market data service
      console.log('Connecting to RapidAPI providers...');
      
      // Try a simple test lookup to confirm API key works
      try {
        const results = await this.enhancedMarketDataService.searchSymbols('AAPL');
        console.log(`Successfully connected to RapidAPI providers. Found ${results.length} results for test query.`);
        return true;
      } catch (error) {
        console.error('Error testing RapidAPI connection:', error);
        return false;
      }
    } catch (error) {
      console.error('Failed to connect to RapidAPI:', error);
      return false;
    }
  }
  
  /**
   * Search for symbols
   * @param query The search query
   * @returns Array of symbol information
   */
  public async searchSymbols(query: string): Promise<SymbolInfo[]> {
    try {
      const results = await this.enhancedMarketDataService.searchSymbols(query);
      
      // Convert to standard format
      return results.map((result: any) => ({
        symbol: result.symbol,
        name: result.name,
        type: result.type,
        exchange: result.exchange,
        currency: result.currency
      }));
    } catch (error) {
      console.error('Error searching symbols:', error);
      throw {
        type: MarketDataErrorType.PROVIDER_ERROR,
        message: `Failed to search symbols: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Get historical candles
   * @param symbol The symbol to get data for
   * @param interval The time interval
   * @param from The start timestamp
   * @param to The end timestamp (optional)
   * @returns Array of candle data
   */
  public async getHistoricalCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<CandleData[]> {
    try {
      const candles = await this.enhancedMarketDataService.getHistoricalCandles(
        symbol,
        interval,
        from,
        to
      );
      
      // Return in the standard format
      return candles.map((candle: any) => ({
        symbol,
        timestamp: candle.timestamp,
        open: candle.open,
        high: candle.high,
        low: candle.low,
        close: candle.close,
        volume: candle.volume
      }));
    } catch (error) {
      console.error(`Error getting historical candles for ${symbol}:`, error);
      throw {
        type: MarketDataErrorType.PROVIDER_ERROR,
        message: `Failed to get historical candles: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Get latest price for a symbol
   * @param symbol The symbol to get price for
   * @returns The latest price data
   */
  public async getLatestPrice(symbol: string): Promise<TickData> {
    try {
      const quote = await this.enhancedMarketDataService.getLatestPrice(symbol);
      
      return {
        symbol,
        price: quote.price,
        timestamp: quote.timestamp,
        bid: quote.price, // Use price as bid if not available
        ask: quote.price, // Use price as ask if not available
        volume: 0 // Not available from all providers
      };
    } catch (error) {
      console.error(`Error getting latest price for ${symbol}:`, error);
      throw {
        type: MarketDataErrorType.PROVIDER_ERROR,
        message: `Failed to get latest price: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Subscribe to market data (not implemented for REST-based provider)
   */
  public async subscribe(
    subscriptionType: MarketDataSubscriptionType,
    symbol: string,
    interval?: TimeInterval,
    callback?: (data: any) => void
  ): Promise<string> {
    // Create a subscription ID
    const subscriptionId = `${subscriptionType}-${symbol}-${interval || 'tick'}-${Date.now()}`;
    
    // Store the subscription
    this.subscriptions.set(subscriptionId, {
      type: subscriptionType,
      symbol,
      interval,
      callback
    });
    
    console.log(`RapidAPI subscription created: ${subscriptionId}`);
    
    // Return the subscription ID
    return subscriptionId;
  }
  
  /**
   * Unsubscribe from market data
   * @param subscriptionId The subscription ID to unsubscribe
   */
  public async unsubscribe(subscriptionId: string): Promise<void> {
    if (this.subscriptions.has(subscriptionId)) {
      this.subscriptions.delete(subscriptionId);
      console.log(`RapidAPI subscription removed: ${subscriptionId}`);
    }
  }
  
  /**
   * Get order book data (not implemented for most RapidAPI providers)
   */
  public async getOrderBook(symbol: string): Promise<OrderBookData> {
    throw {
      type: MarketDataErrorType.UNSUPPORTED_OPERATION,
      message: 'Order book data is not supported by RapidAPI provider'
    };
  }
  
  /**
   * Clean up resources
   */
  public async dispose(): Promise<void> {
    // Clear all subscriptions
    this.subscriptions.clear();
    console.log('RapidAPI Data Provider disposed');
  }
}