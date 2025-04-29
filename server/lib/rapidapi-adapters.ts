/**
 * RapidAPI Adapters
 * Utility functions to convert data from RapidAPI providers into standardized formats
 */

import { CandleData, TickData, TimeInterval } from '../mcp/data/market-data-interface';

/**
 * Converts Twelve Data time series response to standardized candle format
 */
export function convertTwelveDataToCandles(
  data: any, 
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    return [];
  }

  return data.values.map((item: any) => ({
    timestamp: new Date(item.datetime).getTime(),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseFloat(item.volume),
    symbol,
    interval
  }));
}

/**
 * Converts Binance klines data to standardized candle format
 */
export function convertBinanceKlinesToCandles(
  data: any,
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }

  return data.map((item: any) => ({
    timestamp: item[0], // Timestamp
    open: parseFloat(item[1]), // Open
    high: parseFloat(item[2]), // High
    low: parseFloat(item[3]), // Low
    close: parseFloat(item[4]), // Close
    volume: parseFloat(item[5]), // Volume
    symbol,
    interval
  }));
}

/**
 * Converts Alpha Vantage time series data to standardized candle format
 */
export function convertAlphaVantageToCandles(
  data: any,
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !data['Time Series (Daily)']) {
    return [];
  }

  const timeSeriesData = data['Time Series (Daily)'];
  
  return Object.entries(timeSeriesData).map(([date, values]: [string, any]) => ({
    timestamp: new Date(date).getTime(),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseFloat(values['5. volume']),
    symbol,
    interval
  }));
}

/**
 * Convert interval string to appropriate format for each provider
 */
export function convertIntervalForProvider(
  interval: TimeInterval | string,
  provider: string
): string {
  switch (provider) {
    case 'twelve_data':
      // Convert to Twelve Data format (1min, 5min, 1h, 1day, etc.)
      switch (interval) {
        case '1m': return '1min';
        case '5m': return '5min';
        case '15m': return '15min';
        case '30m': return '30min';
        case '1h': return '1h';
        case '4h': return '4h';
        case '1d': return '1day';
        case '1w': return '1week';
        default: return '1h';
      }
    
    case 'binance':
      // Convert to Binance format (1m, 5m, 1h, 1d, etc.)
      switch (interval) {
        case '1m': return '1m';
        case '5m': return '5m';
        case '15m': return '15m';
        case '30m': return '30m';
        case '1h': return '1h';
        case '4h': return '4h';
        case '1d': return '1d';
        case '1w': return '1w';
        default: return '1h';
      }
    
    case 'alpha_vantage':
      // Alpha Vantage has limited intervals through RapidAPI
      // Available: daily, weekly, monthly
      switch (interval) {
        case '1d': return 'daily';
        case '1w': return 'weekly';
        case '1M': return 'monthly';
        default: return 'daily';
      }
      
    default:
      return interval;
  }
}

/**
 * Converts Twelve Data quote response to standardized tick format
 */
export function convertTwelveDataQuoteToTick(
  data: any,
  symbol: string
): TickData | null {
  if (!data || !data.price) {
    return null;
  }

  return {
    timestamp: Date.now(),
    price: parseFloat(data.price),
    symbol,
    bid: data.bid ? parseFloat(data.bid) : undefined,
    ask: data.ask ? parseFloat(data.ask) : undefined
  };
}

/**
 * Converts Binance ticker data to standardized tick format
 */
export function convertBinanceTickerToTick(
  data: any,
  symbol: string
): TickData | null {
  if (!data || !data.lastPrice) {
    return null;
  }

  return {
    timestamp: Date.now(),
    price: parseFloat(data.lastPrice),
    symbol,
    bid: data.bidPrice ? parseFloat(data.bidPrice) : undefined,
    ask: data.askPrice ? parseFloat(data.askPrice) : undefined,
    volume: data.volume ? parseFloat(data.volume) : undefined
  };
}

/**
 * Converts Yahoo Finance quote data to standardized tick format
 */
export function convertYahooFinanceToTick(
  data: any,
  symbol: string
): TickData | null {
  if (!data || !data.price || !data.price.regularMarketPrice) {
    return null;
  }

  const price = data.price;
  
  return {
    timestamp: Date.now(),
    price: price.regularMarketPrice.raw,
    symbol,
    volume: price.regularMarketVolume ? price.regularMarketVolume.raw : undefined
  };
}

/**
 * Map symbol to provider-specific format
 */
export function mapSymbolForProvider(
  symbol: string,
  provider: string
): string {
  // Remove any exchange prefix (e.g., BINANCE:BTCUSDT -> BTCUSDT)
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  switch (provider) {
    case 'twelve_data':
      return cleanSymbol;
      
    case 'binance':
      // Binance requires no special formatting
      return cleanSymbol;
      
    case 'alpha_vantage':
      return cleanSymbol;
      
    case 'yh_finance':
      return cleanSymbol;
      
    case 'coinranking':
      // Coinranking might need different formatting, check their API docs
      return cleanSymbol;
      
    default:
      return cleanSymbol;
  }
}

/**
 * Determine the best RapidAPI provider for a given symbol and data type
 */
export function selectBestProviderForSymbol(
  symbol: string,
  dataType: 'quote' | 'candles'
): string {
  // Clean the symbol
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  // Check for crypto symbols (common endings for crypto pairs)
  if (cleanSymbol.endsWith('USDT') || cleanSymbol.endsWith('BTC') || cleanSymbol.endsWith('ETH')) {
    return dataType === 'quote' ? 'binance' : 'binance';
  }
  
  // Check for forex symbols
  if (isForexSymbol(cleanSymbol)) {
    return 'twelve_data';
  }
  
  // Default to twelve_data for stocks and other symbols
  return 'twelve_data';
}

/**
 * Check if a symbol is a forex pair
 */
function isForexSymbol(symbol: string): boolean {
  // Check for common forex pair formats
  return /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol) || // Format: EUR/USD
         /^[A-Z]{3}_[A-Z]{3}$/.test(symbol) || // Format: EUR_USD
         (/^[A-Z]{6}$/.test(symbol) && // Format: EURUSD
          ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
            currency => symbol.includes(currency)
          ));
}