/**
 * RapidAPI Adapter Functions
 * 
 * This module provides adapter functions to normalize data from 
 * different RapidAPI providers into our standard format
 */

import { CandleData, TickData } from '../mcp/data/market-data-interface';

// Map of asset types to providers that support them
const PROVIDER_ASSET_MAP = {
  stocks: ['twelve_data', 'alpha_vantage', 'yh_finance', 'tradingview'],
  forex: ['twelve_data', 'alpha_vantage', 'tradingview'],
  crypto: ['binance', 'twelve_data', 'coinranking', 'alpha_vantage']
};

/**
 * Select the best provider for a given symbol and data type
 */
export function selectBestProviderForSymbol(
  symbol: string,
  dataType: 'quote' | 'candles'
): string {
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
  
  // Select provider based on asset type and data type
  if (assetType === 'crypto') {
    if (
      upperSymbol.endsWith('USDT') || 
      upperSymbol.endsWith('BTC') || 
      upperSymbol.endsWith('ETH')
    ) {
      return 'binance'; // Binance is best for common crypto pairs
    }
    return 'twelve_data'; // Fallback to Twelve Data for other crypto
  } else if (assetType === 'forex') {
    return 'twelve_data'; // Twelve Data is good for forex
  } else {
    // For stocks and general cases
    return dataType === 'quote' ? 'twelve_data' : 'yh_finance';
  }
}

/**
 * Map a symbol to the format expected by a specific provider
 */
export function mapSymbolForProvider(symbol: string, provider: string): string {
  const upperSymbol = symbol.toUpperCase();
  
  // Handle special cases for different providers
  switch (provider) {
    case 'binance':
      // For Binance, just return the symbol as is (e.g., BTCUSDT)
      return upperSymbol;
    
    case 'twelve_data':
      // For forex pairs, Twelve Data uses the slash format (e.g., EUR/USD)
      if (/^[A-Z]{3}_[A-Z]{3}$/.test(upperSymbol)) {
        return upperSymbol.replace('_', '/');
      }
      // If it's a 6-character forex pair without separator (e.g., EURUSD)
      else if (/^[A-Z]{6}$/.test(upperSymbol) && 
               ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
                 currency => upperSymbol.includes(currency)
               )) {
        return `${upperSymbol.substring(0, 3)}/${upperSymbol.substring(3, 6)}`;
      }
      return upperSymbol;
    
    case 'yh_finance':
      // Yahoo Finance uses regular stock symbols
      return upperSymbol;
    
    case 'alpha_vantage':
      // For forex pairs, Alpha Vantage uses special format
      if (/^[A-Z]{3}\/[A-Z]{3}$/.test(upperSymbol) || /^[A-Z]{3}_[A-Z]{3}$/.test(upperSymbol)) {
        const [base, quote] = upperSymbol.includes('/') 
          ? upperSymbol.split('/') 
          : upperSymbol.split('_');
        return `${base}${quote}`;
      }
      return upperSymbol;
    
    default:
      return upperSymbol;
  }
}

/**
 * Convert interval string to provider-specific format
 */
export function convertIntervalForProvider(interval: string, provider: string): string {
  switch (provider) {
    case 'binance':
      // Binance uses: 1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M
      return interval;
    
    case 'twelve_data':
      // Twelve Data uses: 1min, 5min, 15min, 30min, 45min, 1h, 2h, 4h, 1day, 1week, 1month
      if (interval === '1m') return '1min';
      if (interval === '5m') return '5min';
      if (interval === '15m') return '15min';
      if (interval === '30m') return '30min';
      if (interval === '1h') return '1h';
      if (interval === '4h') return '4h';
      if (interval === '1d') return '1day';
      if (interval === '1w') return '1week';
      if (interval === '1M') return '1month';
      return interval;
    
    case 'alpha_vantage':
      // Alpha Vantage uses: 1min, 5min, 15min, 30min, 60min, daily, weekly, monthly
      if (interval === '1m') return '1min';
      if (interval === '5m') return '5min';
      if (interval === '15m') return '15min';
      if (interval === '30m') return '30min';
      if (interval === '1h') return '60min';
      if (interval === '1d') return 'daily';
      if (interval === '1w') return 'weekly';
      if (interval === '1M') return 'monthly';
      return interval;
    
    case 'yh_finance':
      // Yahoo Finance uses: 1m, 2m, 5m, 15m, 30m, 60m, 90m, 1h, 1d, 5d, 1wk, 1mo, 3mo
      if (interval === '1h') return '60m';
      if (interval === '1d') return '1d';
      if (interval === '1w') return '1wk';
      if (interval === '1M') return '1mo';
      return interval;
    
    default:
      return interval;
  }
}

/**
 * Convert Twelve Data time series to our standard CandleData format
 */
export function convertTwelveDataToCandles(
  data: any,
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    console.error('Invalid Twelve Data time series format:', data);
    return [];
  }
  
  return data.values.map((candle: any) => ({
    timestamp: new Date(candle.datetime).getTime(),
    open: parseFloat(candle.open),
    high: parseFloat(candle.high),
    low: parseFloat(candle.low),
    close: parseFloat(candle.close),
    volume: parseFloat(candle.volume) || 0,
    symbol,
    interval
  }));
}

/**
 * Convert Binance klines to our standard CandleData format
 */
export function convertBinanceKlinesToCandles(
  data: any,
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !Array.isArray(data)) {
    console.error('Invalid Binance klines format:', data);
    return [];
  }
  
  return data.map((candle: any) => ({
    timestamp: candle[0], // Open time
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5]),
    symbol,
    interval
  }));
}

/**
 * Convert Alpha Vantage time series to our standard CandleData format
 */
export function convertAlphaVantageToCandles(
  data: any,
  symbol: string,
  interval: string
): CandleData[] {
  if (!data || !data['Time Series (Daily)']) {
    console.error('Invalid Alpha Vantage time series format:', data);
    return [];
  }
  
  const timeSeriesKey = 'Time Series (Daily)';
  const timeSeriesData = data[timeSeriesKey];
  
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
 * Convert Twelve Data quote to our standard TickData format
 */
export function convertTwelveDataQuoteToTick(
  data: any,
  symbol: string
): TickData | null {
  if (!data || !data.price) {
    console.error('Invalid Twelve Data quote format:', data);
    return null;
  }
  
  return {
    timestamp: data.timestamp ? new Date(data.timestamp).getTime() : Date.now(),
    price: parseFloat(data.price),
    bid: data.bid ? parseFloat(data.bid) : undefined,
    ask: data.ask ? parseFloat(data.ask) : undefined,
    symbol
  };
}

/**
 * Convert Binance ticker to our standard TickData format
 */
export function convertBinanceTickerToTick(
  data: any,
  symbol: string
): TickData | null {
  if (!data || !data.lastPrice) {
    console.error('Invalid Binance ticker format:', data);
    return null;
  }
  
  return {
    timestamp: Date.now(),
    price: parseFloat(data.lastPrice),
    bid: parseFloat(data.bidPrice),
    ask: parseFloat(data.askPrice),
    volume: parseFloat(data.volume),
    symbol
  };
}