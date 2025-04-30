/**
 * RapidAPI Adapters
 * 
 * This library provides adapter functions to convert data from different
 * RapidAPI providers to standardized formats for the Trade Hybrid platform.
 */

import { CandleData, TickData, OrderBookData, TimeInterval } from '../mcp/data/market-data-interface';

// Symbol class detection and mapping functions

/**
 * Select the best provider for a specific symbol and data type
 */
export function selectBestProviderForSymbol(symbol: string, dataType: string): string {
  // Default provider preference order
  const defaultPreference = ['twelve_data', 'binance', 'alpha_vantage', 'yh_finance'];
  
  // Check if this is a crypto symbol
  if (isCryptoSymbol(symbol)) {
    // For crypto, prefer Binance for most data types
    if (dataType === 'candles' || dataType === 'quote') {
      return 'binance';
    }
  }
  
  // For stocks, prefer Twelve Data or Alpha Vantage
  if (isStockSymbol(symbol)) {
    if (dataType === 'candles') {
      return 'twelve_data';
    }
    if (dataType === 'quote') {
      return 'alpha_vantage';
    }
  }
  
  // For forex, prefer Twelve Data
  if (isForexPair(symbol)) {
    return 'twelve_data';
  }
  
  // Default to the first provider
  return defaultPreference[0];
}

/**
 * Check if the symbol is a cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  // Common crypto patterns: BTCUSDT, ETH/USD, etc.
  return /^(BTC|ETH|SOL|XRP|ADA|DOT|AVAX|MATIC|BNB|LINK|DOGE|SHIB|LTC)/i.test(symbol) ||
    symbol.includes('USDT') ||
    symbol.includes('BTC') ||
    symbol.includes('/USD');
}

/**
 * Check if the symbol is a stock
 */
export function isStockSymbol(symbol: string): boolean {
  // Most stock symbols are 1-5 letters without special characters
  // This is a simplified check and not comprehensive
  return /^[A-Z]{1,5}$/.test(symbol) ||
    symbol.endsWith('.N') ||  // NYSE
    symbol.endsWith('.O') ||  // NASDAQ
    symbol.endsWith('.OQ') || // NASDAQ
    symbol.endsWith('.K');    // NYSE
}

/**
 * Check if the symbol is a forex pair
 */
export function isForexPair(symbol: string): boolean {
  // Common forex patterns: EUR/USD, GBP/JPY, etc.
  return /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol) || 
    /^[A-Z]{6}$/.test(symbol) && /^(EUR|USD|GBP|JPY|AUD|CAD|CHF|NZD)/.test(symbol);
}

// Symbol mapping functions

/**
 * Map a symbol to provider-specific format
 */
export function mapSymbolForProvider(symbol: string, provider: string): string {
  switch (provider) {
    case 'binance':
      // Binance doesn't use slashes, USD/BTC becomes BTCUSD
      return symbol.replace('/', '');
      
    case 'twelve_data':
      // Twelve Data uses slashes for forex pairs
      if (isForexPair(symbol) && !symbol.includes('/')) {
        return `${symbol.slice(0, 3)}/${symbol.slice(3, 6)}`;
      }
      return symbol;
      
    case 'alpha_vantage':
      // Alpha Vantage doesn't use slashes for forex
      if (isForexPair(symbol) && symbol.includes('/')) {
        return symbol.replace('/', '');
      }
      return symbol;
      
    case 'yh_finance':
      // Yahoo Finance uses different suffixes for exchanges
      if (symbol.endsWith('.N')) {
        return symbol.replace('.N', '');
      }
      if (symbol.endsWith('.O') || symbol.endsWith('.OQ')) {
        return symbol.replace(/\.(O|OQ)$/, '');
      }
      return symbol;
      
    default:
      return symbol;
  }
}

/**
 * Convert interval to provider-specific format
 */
export function convertIntervalForProvider(interval: TimeInterval, provider: string): string {
  switch (provider) {
    case 'binance':
      // Binance uses: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
      return interval;
      
    case 'twelve_data':
      // Twelve Data uses: 1min, 5min, 15min, 30min, 45min, 1h, 2h, 4h, 1day, 1week, 1month
      if (interval.endsWith('m')) {
        return interval.replace('m', 'min');
      }
      if (interval === '1d') {
        return '1day';
      }
      if (interval === '1w') {
        return '1week';
      }
      if (interval === '1M') {
        return '1month';
      }
      return interval;
      
    case 'alpha_vantage':
      // Alpha Vantage uses: 1min, 5min, 15min, 30min, 60min, daily, weekly, monthly
      if (interval.endsWith('m')) {
        return interval.replace('m', 'min');
      }
      if (interval === '1h') {
        return '60min';
      }
      if (interval === '1d') {
        return 'daily';
      }
      if (interval === '1w') {
        return 'weekly';
      }
      if (interval === '1M') {
        return 'monthly';
      }
      return interval;
      
    case 'yh_finance':
      // Yahoo Finance uses: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
      if (interval === '1w') {
        return '1wk';
      }
      if (interval === '1M') {
        return '1mo';
      }
      return interval;
      
    default:
      return interval;
  }
}

// Data conversion functions

/**
 * Convert Twelve Data time series to standard candle format
 */
export function convertTwelveDataToCandles(
  data: any, 
  symbol: string, 
  interval: TimeInterval
): CandleData[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    console.error('Invalid data received from Twelve Data:', data);
    return [];
  }
  
  return data.values.map((item: any) => ({
    symbol,
    interval,
    timestamp: new Date(item.datetime).getTime(),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseInt(item.volume, 10)
  }));
}

/**
 * Convert Binance klines to standard candle format
 */
export function convertBinanceKlinesToCandles(
  data: any, 
  symbol: string, 
  interval: TimeInterval
): CandleData[] {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid data received from Binance:', data);
    return [];
  }
  
  return data.map((item: any) => ({
    symbol,
    interval,
    timestamp: parseInt(item[0], 10), // Open time
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5])
  }));
}

/**
 * Convert Alpha Vantage data to standard candle format
 */
export function convertAlphaVantageToCandles(
  data: any, 
  symbol: string, 
  interval: TimeInterval
): CandleData[] {
  if (!data || !data['Time Series (Daily)']) {
    console.error('Invalid data received from Alpha Vantage:', data);
    return [];
  }
  
  const timeSeriesKey = Object.keys(data).find(key => key.startsWith('Time Series'));
  
  if (!timeSeriesKey || !data[timeSeriesKey]) {
    console.error('Invalid time series data from Alpha Vantage:', data);
    return [];
  }
  
  const timeSeries = data[timeSeriesKey];
  
  return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    symbol,
    interval,
    timestamp: new Date(date).getTime(),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'], 10)
  }));
}

/**
 * Convert Yahoo Finance data to standard candle format
 */
export function convertYahooFinanceToCandles(
  data: any, 
  symbol: string, 
  interval: TimeInterval
): CandleData[] {
  if (!data || !data.chart || !data.chart.result || !data.chart.result[0]) {
    console.error('Invalid data received from Yahoo Finance:', data);
    return [];
  }
  
  const result = data.chart.result[0];
  const timestamps = result.timestamp;
  const quotes = result.indicators.quote[0];
  
  if (!timestamps || !quotes) {
    console.error('Missing data in Yahoo Finance response:', result);
    return [];
  }
  
  return timestamps.map((timestamp: number, i: number) => ({
    symbol,
    interval,
    timestamp: timestamp * 1000, // Convert to milliseconds
    open: quotes.open[i],
    high: quotes.high[i],
    low: quotes.low[i],
    close: quotes.close[i],
    volume: quotes.volume[i]
  }));
}

/**
 * Convert Twelve Data quote to standard tick format
 */
export function convertTwelveDataQuoteToTick(
  data: any, 
  symbol: string
): TickData | null {
  if (!data || !data.price) {
    console.error('Invalid quote data received from Twelve Data:', data);
    return null;
  }
  
  return {
    symbol,
    timestamp: new Date().getTime(), // Current time as timestamp
    price: parseFloat(data.price),
    volume: parseInt(data.volume || '0', 10),
    bid: parseFloat(data.bid || data.price),
    ask: parseFloat(data.ask || data.price),
    high: parseFloat(data.day_high || data.price),
    low: parseFloat(data.day_low || data.price)
  };
}

/**
 * Convert Binance ticker to standard tick format
 */
export function convertBinanceTickerToTick(
  data: any, 
  symbol: string
): TickData | null {
  if (!data || !data.lastPrice) {
    console.error('Invalid ticker data received from Binance:', data);
    return null;
  }
  
  return {
    symbol,
    timestamp: new Date().getTime(), // Current time as timestamp
    price: parseFloat(data.lastPrice),
    volume: parseFloat(data.volume),
    bid: parseFloat(data.bidPrice),
    ask: parseFloat(data.askPrice),
    high: parseFloat(data.highPrice),
    low: parseFloat(data.lowPrice)
  };
}

/**
 * Convert Alpha Vantage quote to standard tick format
 */
export function convertAlphaVantageQuoteToTick(
  data: any, 
  symbol: string
): TickData | null {
  if (!data || !data['Global Quote'] || !data['Global Quote']['05. price']) {
    console.error('Invalid quote data received from Alpha Vantage:', data);
    return null;
  }
  
  const quote = data['Global Quote'];
  
  return {
    symbol,
    timestamp: new Date().getTime(), // Current time as timestamp
    price: parseFloat(quote['05. price']),
    volume: parseInt(quote['06. volume'], 10),
    bid: parseFloat(quote['05. price']), // Alpha Vantage doesn't provide bid/ask
    ask: parseFloat(quote['05. price']),
    high: parseFloat(quote['03. high']),
    low: parseFloat(quote['04. low'])
  };
}

/**
 * Convert Yahoo Finance quote to standard tick format
 */
export function convertYahooFinanceQuoteToTick(
  data: any, 
  symbol: string
): TickData | null {
  if (!data || !data.quoteResponse || !data.quoteResponse.result || !data.quoteResponse.result[0]) {
    console.error('Invalid quote data received from Yahoo Finance:', data);
    return null;
  }
  
  const quote = data.quoteResponse.result[0];
  
  return {
    symbol,
    timestamp: new Date().getTime(), // Current time as timestamp
    price: quote.regularMarketPrice,
    volume: quote.regularMarketVolume,
    bid: quote.bid || quote.regularMarketPrice,
    ask: quote.ask || quote.regularMarketPrice,
    high: quote.regularMarketDayHigh,
    low: quote.regularMarketDayLow
  };
}