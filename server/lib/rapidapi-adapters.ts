/**
 * RapidAPI Adapters
 * 
 * This library provides adapter functions to convert data from different
 * RapidAPI providers to standardized formats for the Trade Hybrid platform.
 */

import { CandleData, TickData, TimeInterval } from '../mcp/data/market-data-interface';
import { RapidAPIProvider } from '../services/rapidapi-service';

/**
 * Select the best provider for a symbol based on the data type
 * 
 * @param symbol The symbol to get data for
 * @param dataType The type of data to get ('candles', 'quote', 'search')
 * @returns The best provider for the symbol and data type
 */
export function selectBestProviderForSymbol(symbol: string, dataType: string): string {
  // Determine if this is a crypto, forex, or stock symbol
  if (isCryptoSymbol(symbol)) {
    // For cryptocurrencies, use Binance for live data and CoinGecko for historical
    if (dataType === 'quote') {
      return RapidAPIProvider.BINANCE;
    } else if (dataType === 'candles') {
      return RapidAPIProvider.BINANCE;
    } else {
      return RapidAPIProvider.COINGECKO;
    }
  } else if (isForexPair(symbol)) {
    // For forex, use Twelve Data or Alpha Vantage
    if (dataType === 'quote') {
      return RapidAPIProvider.TWELVE_DATA;
    } else {
      return RapidAPIProvider.ALPHA_VANTAGE;
    }
  } else {
    // For stocks and other instruments, use Yahoo Finance
    return RapidAPIProvider.YAHOO_FINANCE;
  }
}

/**
 * Check if the symbol is a cryptocurrency
 */
export function isCryptoSymbol(symbol: string): boolean {
  return symbol.endsWith('USDT') || 
         symbol.endsWith('USD') && (symbol.startsWith('BTC') || 
                                    symbol.startsWith('ETH') ||
                                    symbol.startsWith('SOL') ||
                                    symbol.startsWith('BNB') ||
                                    symbol.startsWith('XRP'));
}

/**
 * Check if the symbol is a stock
 */
export function isStockSymbol(symbol: string): boolean {
  return symbol.includes('.') || // Has exchange identifier
         (symbol.length <= 5 && !/[^A-Z]/.test(symbol)); // All caps, up to 5 chars
}

/**
 * Check if the symbol is a forex pair
 */
export function isForexPair(symbol: string): boolean {
  return symbol === 'EURUSD' || 
         symbol === 'GBPUSD' || 
         symbol === 'USDJPY' || 
         symbol === 'AUDUSD' ||
         symbol === 'USDCAD' ||
         symbol === 'NZDUSD';
}

/**
 * Map symbol to provider-specific format
 * 
 * @param symbol The symbol to map
 * @param provider The provider to map for
 * @returns The mapped symbol
 */
export function mapSymbolForProvider(symbol: string, provider: string): string {
  switch (provider) {
    case RapidAPIProvider.BINANCE:
      // Binance requires USDT pairs for crypto
      if (symbol.endsWith('USD') && !symbol.endsWith('USDT') && isCryptoSymbol(symbol)) {
        return symbol.replace('USD', 'USDT');
      }
      return symbol;
    
    case RapidAPIProvider.ALPHA_VANTAGE:
      // Alpha Vantage uses a specific format for forex
      if (isForexPair(symbol)) {
        return symbol.substring(0, 3) + '/' + symbol.substring(3);
      }
      return symbol;
    
    case RapidAPIProvider.YAHOO_FINANCE:
      // Yahoo Finance may require exchange suffix for some stocks
      if (isStockSymbol(symbol) && !symbol.includes('.')) {
        return symbol + '.US';
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
    case RapidAPIProvider.TWELVE_DATA:
      const twelveDataMap: Record<TimeInterval, string> = {
        '1m': '1min',
        '5m': '5min',
        '15m': '15min',
        '30m': '30min',
        '1h': '1h',
        '4h': '4h',
        '1d': '1day',
        '1w': '1week',
        '1M': '1month'
      };
      return twelveDataMap[interval] || '1day';
    
    case RapidAPIProvider.YAHOO_FINANCE:
      const yahooMap: Record<TimeInterval, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
        '1w': '1wk',
        '1M': '1mo'
      };
      return yahooMap[interval] || '1d';
    
    case RapidAPIProvider.ALPHA_VANTAGE:
      if (interval === '1m') return 'TIME_SERIES_INTRADAY&interval=1min';
      if (interval === '5m') return 'TIME_SERIES_INTRADAY&interval=5min';
      if (interval === '15m') return 'TIME_SERIES_INTRADAY&interval=15min';
      if (interval === '30m') return 'TIME_SERIES_INTRADAY&interval=30min';
      if (interval === '1h') return 'TIME_SERIES_INTRADAY&interval=60min';
      if (interval === '4h') return 'TIME_SERIES_INTRADAY&interval=60min'; // Not supported, use 60min
      if (interval === '1d') return 'TIME_SERIES_DAILY';
      if (interval === '1w') return 'TIME_SERIES_WEEKLY';
      if (interval === '1M') return 'TIME_SERIES_MONTHLY';
      return 'TIME_SERIES_DAILY';
    
    case RapidAPIProvider.BINANCE:
      const binanceMap: Record<TimeInterval, string> = {
        '1m': '1m',
        '5m': '5m',
        '15m': '15m',
        '30m': '30m',
        '1h': '1h',
        '4h': '4h',
        '1d': '1d',
        '1w': '1w',
        '1M': '1M'
      };
      return binanceMap[interval] || '1d';
    
    default:
      return interval;
  }
}

/**
 * Convert Twelve Data historical data to standard candle format
 */
export function convertTwelveDataToCandles(
  data: any,
  symbol: string,
  interval: TimeInterval
): CandleData[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    return [];
  }

  return data.values.map((item: any) => ({
    symbol,
    timestamp: new Date(item.datetime).getTime(),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseFloat(item.volume),
    interval
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
    return [];
  }

  return data.map((item: any) => ({
    symbol,
    timestamp: parseInt(item[0], 10),
    open: parseFloat(item[1]),
    high: parseFloat(item[2]),
    low: parseFloat(item[3]),
    close: parseFloat(item[4]),
    volume: parseFloat(item[5]),
    interval
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
  if (!data) {
    return [];
  }

  // Determine which time series field to use based on interval
  let timeSeriesKey = '';
  if (interval === '1d') {
    timeSeriesKey = 'Time Series (Daily)';
  } else if (interval === '1w') {
    timeSeriesKey = 'Weekly Time Series';
  } else if (interval === '1M') {
    timeSeriesKey = 'Monthly Time Series';
  } else {
    // Intraday time series
    timeSeriesKey = `Time Series (${convertIntervalForProvider(interval, RapidAPIProvider.ALPHA_VANTAGE).split('&')[1]})`;
  }

  const timeSeries = data[timeSeriesKey];
  if (!timeSeries) {
    return [];
  }

  return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
    symbol,
    timestamp: new Date(date).getTime(),
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseFloat(values['5. volume']),
    interval
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
  if (!data || !data.chart || !data.chart.result || data.chart.result.length === 0) {
    return [];
  }

  const result = data.chart.result[0];
  const timestamps = result.timestamp || [];
  const quotes = result.indicators.quote[0] || {};
  const opens = quotes.open || [];
  const highs = quotes.high || [];
  const lows = quotes.low || [];
  const closes = quotes.close || [];
  const volumes = quotes.volume || [];

  return timestamps.map((timestamp: number, index: number) => ({
    symbol,
    timestamp: timestamp * 1000, // Convert to milliseconds
    open: opens[index] || 0,
    high: highs[index] || 0,
    low: lows[index] || 0,
    close: closes[index] || 0,
    volume: volumes[index] || 0,
    interval
  }));
}

/**
 * Convert Twelve Data quote to standard tick format
 */
export function convertTwelveDataQuoteToTick(
  data: any,
  symbol: string
): TickData {
  if (!data) {
    return {
      symbol,
      price: 0,
      timestamp: Date.now(),
      bid: 0,
      ask: 0,
      volume: 0
    };
  }

  return {
    symbol,
    price: parseFloat(data.close),
    timestamp: new Date(data.datetime).getTime(),
    bid: parseFloat(data.previous_close),
    ask: parseFloat(data.close),
    volume: parseFloat(data.volume)
  };
}

/**
 * Convert Binance ticker to standard tick format
 */
export function convertBinanceTickerToTick(
  data: any,
  symbol: string
): TickData {
  if (!data) {
    return {
      symbol,
      price: 0,
      timestamp: Date.now(),
      bid: 0,
      ask: 0,
      volume: 0
    };
  }

  return {
    symbol,
    price: parseFloat(data.lastPrice),
    timestamp: data.closeTime,
    bid: parseFloat(data.bidPrice),
    ask: parseFloat(data.askPrice),
    volume: parseFloat(data.volume)
  };
}

/**
 * Convert Alpha Vantage quote to standard tick format
 */
export function convertAlphaVantageQuoteToTick(
  data: any,
  symbol: string
): TickData {
  if (!data || !data['Global Quote']) {
    return {
      symbol,
      price: 0,
      timestamp: Date.now(),
      bid: 0,
      ask: 0,
      volume: 0
    };
  }

  const quote = data['Global Quote'];

  return {
    symbol,
    price: parseFloat(quote['05. price']),
    timestamp: Date.now(), // Alpha Vantage doesn't provide a timestamp
    bid: parseFloat(quote['05. price']) * 0.9999, // Approximation
    ask: parseFloat(quote['05. price']) * 1.0001, // Approximation
    volume: parseFloat(quote['06. volume'])
  };
}

/**
 * Convert Yahoo Finance quote to standard tick format
 */
export function convertYahooFinanceQuoteToTick(
  data: any,
  symbol: string
): TickData {
  if (!data || !data.quoteResponse || !data.quoteResponse.result || data.quoteResponse.result.length === 0) {
    return {
      symbol,
      price: 0,
      timestamp: Date.now(),
      bid: 0,
      ask: 0,
      volume: 0
    };
  }

  const quote = data.quoteResponse.result[0];

  return {
    symbol,
    price: quote.regularMarketPrice,
    timestamp: quote.regularMarketTime * 1000, // Convert to milliseconds
    bid: quote.bid || quote.regularMarketPrice * 0.9999, // Fallback if bid is not available
    ask: quote.ask || quote.regularMarketPrice * 1.0001, // Fallback if ask is not available
    volume: quote.regularMarketVolume
  };
}