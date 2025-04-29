/**
 * Market Data Interfaces
 * 
 * Common interfaces for all market data providers
 */

// OHLCV candle data
export interface CandleData {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  symbol: string;
  interval: string;
}

// Timeframe intervals
export enum TimeInterval {
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  TWO_HOURS = '2h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

// Price tick data
export interface TickData {
  timestamp: number;
  price: number;
  volume?: number;
  symbol: string;
  bid?: number;
  ask?: number;
  trades?: number;
}

// Order book data
export interface OrderBookEntry {
  price: number;
  quantity: number;
}

export interface OrderBookData {
  symbol: string;
  timestamp: number;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
}

// Market data subscription options
export interface MarketDataSubscription {
  symbol: string;
  interval?: TimeInterval;
  type: 'candles' | 'ticks' | 'orderbook';
  depth?: number; // For order book depth
}

// Historical data request options
export interface HistoricalDataRequest {
  symbol: string;
  interval: TimeInterval;
  from: Date | number; // Timestamp or Date
  to: Date | number; // Timestamp or Date
  limit?: number; // Max number of candles
}

// Market data info
export interface MarketInfo {
  symbol: string;
  baseAsset?: string;
  quoteAsset?: string;
  minPrice?: number;
  maxPrice?: number;
  tickSize?: number;
  minQuantity?: number;
  maxQuantity?: number;
  stepSize?: number;
  exchange?: string;
  category?: string;
  description?: string;
  lastUpdated?: number;
}

// Market data provider capability flags
export interface MarketDataCapabilities {
  supportsRealtime: boolean;
  supportsHistorical: boolean;
  supportsOrderBook: boolean;
  supportsTicks: boolean;
  supportsCandles: boolean;
  supportedTimeframes: TimeInterval[];
  supportedAssetClasses: string[];
  maxSubscriptions?: number;
  maxHistoricalBars?: number;
  rateLimit?: number; // Requests per minute
}

/**
 * Market Data Provider interface
 * 
 * Base interface that all market data providers should implement
 */
export interface MarketDataProvider {
  // Provider info
  getName(): string;
  getCapabilities(): MarketDataCapabilities;
  
  // Connection management
  connect(): Promise<boolean>;
  disconnect(): Promise<void>;
  isConnected(): boolean;
  
  // Market data methods
  getSymbolInfo(symbol: string): Promise<MarketInfo>;
  searchSymbols(query: string): Promise<MarketInfo[]>;
  
  // Historical data
  getHistoricalCandles(request: HistoricalDataRequest): Promise<CandleData[]>;
  
  // Real-time data
  subscribeToCandles(subscription: MarketDataSubscription, callback: (data: CandleData) => void): string;
  subscribeToTicks(subscription: MarketDataSubscription, callback: (data: TickData) => void): string;
  subscribeToOrderBook(subscription: MarketDataSubscription, callback: (data: OrderBookData) => void): string;
  unsubscribe(subscriptionId: string): void;
  
  // Utility methods
  formatSymbol(symbol: string, targetFormat?: string): string;
}