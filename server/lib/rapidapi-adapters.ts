/**
 * RapidAPI Adapters
 * 
 * Adapters to convert between different RapidAPI provider formats
 * and our standard formats for candles, ticks, etc.
 */

import { CandleData, TickData } from '../mcp/data/market-data-interface';

/**
 * Select the best provider for a symbol based on asset type
 * @param symbol Symbol to get provider for
 * @param dataType Type of data requested (candles, quote, etc.)
 * @returns Provider ID
 */
export function selectBestProviderForSymbol(symbol: string, dataType: string): string {
  // Normalize symbol and detect asset type
  const upperSymbol = symbol.toUpperCase();
  
  // Check for crypto
  if (
    upperSymbol.endsWith('BTC') ||
    upperSymbol.endsWith('ETH') ||
    upperSymbol.endsWith('USDT') ||
    upperSymbol.includes('BITCOIN') ||
    upperSymbol.includes('BNB')
  ) {
    return dataType === 'candles' ? 'binance' : 'binance';
  }
  
  // Check for forex
  if (
    /^[A-Z]{3}\/[A-Z]{3}$/.test(upperSymbol) || // Format: EUR/USD
    /^[A-Z]{3}_[A-Z]{3}$/.test(upperSymbol) || // Format: EUR_USD
    (
      /^[A-Z]{6}$/.test(upperSymbol) && // Format: EURUSD
      ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
        currency => upperSymbol.includes(currency)
      )
    )
  ) {
    return 'twelve_data';
  }
  
  // Default to Twelve Data for stocks
  return 'twelve_data';
}

/**
 * Map symbol to format expected by provider
 * @param symbol Original symbol
 * @param provider Provider ID
 * @returns Mapped symbol
 */
export function mapSymbolForProvider(symbol: string, provider: string): string {
  // Extract the ticker symbol from formats like BINANCE:BTCUSDT
  const parts = symbol.split(':');
  const baseSymbol = parts.length > 1 ? parts[1] : symbol;
  
  switch (provider) {
    case 'binance':
      // Add USDT suffix for BTC, ETH, etc. if not present
      if (
        ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE', 'AVAX'].includes(baseSymbol) &&
        !baseSymbol.includes('USDT')
      ) {
        return `${baseSymbol}USDT`;
      }
      return baseSymbol;
      
    case 'twelve_data':
      // Handle forex pairs
      if (
        /^[A-Z]{3}\/[A-Z]{3}$/.test(baseSymbol) || // Format: EUR/USD
        /^[A-Z]{3}_[A-Z]{3}$/.test(baseSymbol)    // Format: EUR_USD
      ) {
        // Convert to EUR/USD format if needed
        if (baseSymbol.includes('_')) {
          return baseSymbol.replace('_', '/');
        }
        return baseSymbol;
      }
      
      // Handle traditional forex format (EURUSD -> EUR/USD)
      if (
        /^[A-Z]{6}$/.test(baseSymbol) && 
        ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
          currency => baseSymbol.includes(currency)
        )
      ) {
        return `${baseSymbol.substring(0, 3)}/${baseSymbol.substring(3, 6)}`;
      }
      
      return baseSymbol;
      
    case 'alpha_vantage':
      // Alpha Vantage doesn't support some crypto symbols directly
      if (baseSymbol.endsWith('USDT')) {
        return baseSymbol.replace('USDT', '-USD');
      }
      
      // Handle forex pairs
      if (
        /^[A-Z]{3}\/[A-Z]{3}$/.test(baseSymbol) || // Format: EUR/USD
        /^[A-Z]{3}_[A-Z]{3}$/.test(baseSymbol)    // Format: EUR_USD
      ) {
        // Convert to EUR/USD format if needed
        if (baseSymbol.includes('_')) {
          return baseSymbol.replace('_', '/');
        }
        return baseSymbol;
      }
      
      return baseSymbol;
      
    case 'yh_finance':
      // Yahoo Finance expects crypto symbols in BTC-USD format
      if (
        ['BTC', 'ETH', 'SOL', 'ADA', 'DOT', 'DOGE', 'AVAX'].includes(baseSymbol) ||
        baseSymbol.endsWith('USDT')
      ) {
        return baseSymbol.replace('USDT', '-USD');
      }
      
      return baseSymbol;
      
    default:
      return baseSymbol;
  }
}

/**
 * Convert interval to format expected by provider
 * @param interval Original interval (e.g., '1h', '1d')
 * @param provider Provider ID
 * @returns Mapped interval
 */
export function convertIntervalForProvider(interval: string, provider: string): string {
  const lowerInterval = interval.toLowerCase();
  
  switch (provider) {
    case 'binance':
      // Binance already uses the 1h, 1d format
      return lowerInterval;
      
    case 'twelve_data':
      // Convert our internal format to Twelve Data format
      switch (lowerInterval) {
        case '1m': return '1min';
        case '5m': return '5min';
        case '15m': return '15min';
        case '30m': return '30min';
        case '1h': return '1h';
        case '2h': return '2h';
        case '4h': return '4h';
        case '1d': return '1day';
        case '1w': return '1week';
        case '1M': return '1month';
        default: return '1h';
      }
      
    case 'alpha_vantage':
      // Convert our internal format to Alpha Vantage format
      switch (lowerInterval) {
        case '1m': return '1min';
        case '5m': return '5min';
        case '15m': return '15min';
        case '30m': return '30min';
        case '1h': return '60min';
        case '1d': return 'daily';
        case '1w': return 'weekly';
        case '1M': return 'monthly';
        default: return 'daily';
      }
      
    case 'yh_finance':
      // Convert our internal format to Yahoo Finance format
      switch (lowerInterval) {
        case '1m': return '1m';
        case '5m': return '5m';
        case '15m': return '15m';
        case '30m': return '30m';
        case '1h': return '1h';
        case '1d': return '1d';
        case '1w': return '1wk';
        case '1M': return '1mo';
        default: return '1d';
      }
      
    default:
      return lowerInterval;
  }
}

/**
 * Convert Twelve Data time_series response to CandleData[]
 * @param data Raw Twelve Data response
 * @param symbol Original symbol
 * @param interval Original interval
 * @returns Array of standardized candle data
 */
export function convertTwelveDataToCandles(data: any, symbol: string, interval: string): CandleData[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    return [];
  }
  
  return data.values.map((item: any) => ({
    timestamp: new Date(item.datetime).getTime(),
    open: parseFloat(item.open),
    high: parseFloat(item.high),
    low: parseFloat(item.low),
    close: parseFloat(item.close),
    volume: parseInt(item.volume, 10),
    symbol,
    interval
  }));
}

/**
 * Convert Binance klines response to CandleData[]
 * @param data Raw Binance response
 * @param symbol Original symbol
 * @param interval Original interval
 * @returns Array of standardized candle data
 */
export function convertBinanceKlinesToCandles(data: any, symbol: string, interval: string): CandleData[] {
  if (!data || !Array.isArray(data)) {
    return [];
  }
  
  return data.map((kline: any) => ({
    timestamp: kline[0], // First element is open time
    open: parseFloat(kline[1]),
    high: parseFloat(kline[2]),
    low: parseFloat(kline[3]),
    close: parseFloat(kline[4]),
    volume: parseFloat(kline[5]),
    symbol,
    interval
  }));
}

/**
 * Convert Alpha Vantage response to CandleData[]
 * @param data Raw Alpha Vantage response
 * @param symbol Original symbol
 * @param interval Original interval
 * @returns Array of standardized candle data
 */
export function convertAlphaVantageToCandles(data: any, symbol: string, interval: string): CandleData[] {
  if (!data || !data['Time Series (Daily)']) {
    return [];
  }
  
  const timeSeries = data['Time Series (Daily)'];
  const candles: CandleData[] = [];
  
  for (const date in timeSeries) {
    if (Object.prototype.hasOwnProperty.call(timeSeries, date)) {
      const item = timeSeries[date];
      candles.push({
        timestamp: new Date(date).getTime(),
        open: parseFloat(item['1. open']),
        high: parseFloat(item['2. high']),
        low: parseFloat(item['3. low']),
        close: parseFloat(item['4. close']),
        volume: parseInt(item['5. volume'], 10),
        symbol,
        interval
      });
    }
  }
  
  // Sort by timestamp in descending order (newest first)
  return candles.sort((a, b) => b.timestamp - a.timestamp);
}

/**
 * Convert Twelve Data quote response to TickData
 * @param data Raw Twelve Data response
 * @param symbol Original symbol
 * @returns Standardized tick data or null if invalid
 */
export function convertTwelveDataQuoteToTick(data: any, symbol: string): TickData | null {
  if (!data || !data.price) {
    return null;
  }
  
  return {
    timestamp: new Date(data.timestamp * 1000).getTime(), // Convert to milliseconds
    price: parseFloat(data.price),
    bid: data.bid ? parseFloat(data.bid) : undefined,
    ask: data.ask ? parseFloat(data.ask) : undefined,
    symbol
  };
}

/**
 * Convert Binance ticker response to TickData
 * @param data Raw Binance response
 * @param symbol Original symbol
 * @returns Standardized tick data or null if invalid
 */
export function convertBinanceTickerToTick(data: any, symbol: string): TickData | null {
  if (!data || !data.lastPrice) {
    return null;
  }
  
  return {
    timestamp: Date.now(),
    price: parseFloat(data.lastPrice),
    bid: data.bidPrice ? parseFloat(data.bidPrice) : undefined,
    ask: data.askPrice ? parseFloat(data.askPrice) : undefined,
    symbol,
    volume: parseFloat(data.volume)
  };
}