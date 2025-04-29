/**
 * Market Data Interfaces
 * 
 * This file contains interfaces for market data structures used throughout the platform
 */

/**
 * Time intervals for market data
 */
export type TimeInterval = 
  | '1m'  // 1 minute
  | '5m'  // 5 minutes
  | '15m' // 15 minutes
  | '30m' // 30 minutes
  | '1h'  // 1 hour
  | '4h'  // 4 hours
  | '1d'  // 1 day
  | '1w'  // 1 week
  | '1M'; // 1 month

/**
 * Tick data represents a single price point in time
 */
export interface TickData {
  timestamp: number;         // Unix timestamp in milliseconds
  price: number;             // Current price
  symbol: string;            // Ticker symbol
  bid?: number;              // Best bid price (optional)
  ask?: number;              // Best ask price (optional)
  volume?: number;           // Trading volume (optional)
  source?: string;           // Data source (optional)
}

/**
 * Candle data represents OHLCV data for a time interval
 */
export interface CandleData {
  timestamp: number;         // Unix timestamp in milliseconds (open time)
  open: number;              // Open price
  high: number;              // High price
  low: number;               // Low price
  close: number;             // Close price
  volume: number;            // Trading volume
  symbol: string;            // Ticker symbol
  interval: string;          // Time interval
  source?: string;           // Data source (optional)
}

/**
 * Market Symbol information
 */
export interface MarketSymbol {
  symbol: string;            // Ticker symbol
  name: string;              // Display name
  type: string;              // Asset type (stock, forex, crypto, etc.)
  exchange?: string;         // Exchange (optional)
  provider?: string;         // Data provider (optional)
  isActive?: boolean;        // Whether the symbol is active (optional)
}

/**
 * Market Data Provider information
 */
export interface MarketDataProvider {
  id: string;                // Provider ID
  name: string;              // Provider name
  description: string;       // Provider description
  type: 'traditional' | 'rapidapi'; // Provider type
  asset_classes: string[];   // Supported asset classes
  requires_api_key: boolean; // Whether API key is required
  documentation_url: string; // Link to documentation
}

/**
 * Market Data Request Options
 */
export interface MarketDataRequestOptions {
  provider?: string;         // Preferred provider (optional)
  apiKey?: string;           // API key (optional)
  retries?: number;          // Number of retries (optional)
  timeout?: number;          // Request timeout in ms (optional)
}

/**
 * Market Data Result
 */
export interface MarketDataResult<T> {
  data: T;                   // Result data
  provider: string;          // Data provider
  symbol: string;            // Symbol requested
  status: 'success' | 'error'; // Request status
  message?: string;          // Optional message (for errors)
  error?: any;               // Optional error details
}

/**
 * Market Data Capabilities interface
 */
export interface MarketDataCapabilities {
  supportsRealtime: boolean;         // Whether provider supports real-time data
  supportsHistorical: boolean;       // Whether provider supports historical data
  supportsOrderBook: boolean;        // Whether provider supports order book data
  supportsTicks: boolean;            // Whether provider supports tick data
  supportsCandles: boolean;          // Whether provider supports candle data
  supportedTimeframes: string[];     // Supported timeframes
  supportedAssetClasses: string[];   // Supported asset classes
  maxSubscriptions?: number;         // Maximum number of subscriptions
  rateLimit?: number;                // Rate limit in requests per minute
}

/**
 * Historical Data Request interface
 */
export interface HistoricalDataRequest {
  symbol: string;                    // Symbol to fetch data for
  interval: string;                  // Time interval
  from: number | Date;               // Start time
  to: number | Date;                 // End time
  limit?: number;                    // Maximum number of records
}

/**
 * Market Data Subscription interface
 */
export interface MarketDataSubscription {
  symbol: string;                    // Symbol to subscribe to
  interval?: string;                 // Time interval (for candles)
  depth?: number;                    // Order book depth
}

/**
 * Order Book Data interface
 */
export interface OrderBookData {
  symbol: string;                    // Symbol
  timestamp: number;                 // Unix timestamp in milliseconds
  bids: [number, number][];          // Bids [price, amount][]
  asks: [number, number][];          // Asks [price, amount][]
}

/**
 * Market Information interface
 */
export interface MarketInfo {
  symbol: string;                    // Symbol
  baseAsset?: string;                // Base asset
  quoteAsset?: string;               // Quote asset
  minPrice?: number;                 // Minimum price
  maxPrice?: number;                 // Maximum price
  tickSize?: number;                 // Tick size
  minQuantity?: number;              // Minimum quantity
  maxQuantity?: number;              // Maximum quantity
  stepSize?: number;                 // Step size
  exchange?: string;                 // Exchange
  category?: string;                 // Category/type
  description?: string;              // Description
  lastUpdated?: number;              // Last updated timestamp
}