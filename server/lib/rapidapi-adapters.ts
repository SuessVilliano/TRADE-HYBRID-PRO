/**
 * RapidAPI Adapters
 * 
 * This library provides standardization functions to convert data from various
 * RapidAPI providers into a consistent format used by the platform.
 */

import { RapidAPIProvider } from '../services/rapidapi-service';

/**
 * Standardize candle data from various providers
 * @param data The raw data from the provider
 * @param provider The provider that returned the data
 * @returns Standardized candle data in a common format
 */
export function standardizeCandles(data: any, provider: RapidAPIProvider): any[] {
  if (!data) {
    throw new Error('No data received from provider');
  }
  
  console.log(`Standardizing candles from ${provider}`);
  
  try {
    switch (provider) {
      case RapidAPIProvider.TWELVE_DATA:
        return standardizeTwelveDataCandles(data);
      case RapidAPIProvider.YAHOO_FINANCE:
        return standardizeYahooFinanceCandles(data);
      case RapidAPIProvider.ALPHA_VANTAGE:
        return standardizeAlphaVantageCandles(data);
      case RapidAPIProvider.BINANCE:
        return standardizeBinanceCandles(data);
      case RapidAPIProvider.TRADINGVIEW:
        return standardizeTradingViewCandles(data);
      case RapidAPIProvider.COINGECKO:
        return standardizeCoinGeckoCandles(data);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error standardizing candles from ${provider}:`, error);
    throw error;
  }
}

/**
 * Standardize quote data from various providers
 * @param data The raw data from the provider
 * @param provider The provider that returned the data
 * @returns Standardized quote data in a common format
 */
export function standardizeQuote(data: any, provider: RapidAPIProvider): any {
  if (!data) {
    throw new Error('No data received from provider');
  }
  
  console.log(`Standardizing quote from ${provider}`);
  
  try {
    switch (provider) {
      case RapidAPIProvider.TWELVE_DATA:
        return standardizeTwelveDataQuote(data);
      case RapidAPIProvider.YAHOO_FINANCE:
        return standardizeYahooFinanceQuote(data);
      case RapidAPIProvider.ALPHA_VANTAGE:
        return standardizeAlphaVantageQuote(data);
      case RapidAPIProvider.BINANCE:
        return standardizeBinanceQuote(data);
      case RapidAPIProvider.TRADINGVIEW:
        return standardizeTradingViewQuote(data);
      case RapidAPIProvider.COINGECKO:
        return standardizeCoinGeckoQuote(data);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error standardizing quote from ${provider}:`, error);
    throw error;
  }
}

/**
 * Standardize symbol search results from various providers
 * @param data The raw data from the provider
 * @param provider The provider that returned the data
 * @returns Standardized symbol search results in a common format
 */
export function standardizeSymbolSearch(data: any, provider: RapidAPIProvider): any[] {
  if (!data) {
    throw new Error('No data received from provider');
  }
  
  console.log(`Standardizing symbol search from ${provider}`);
  
  try {
    switch (provider) {
      case RapidAPIProvider.TWELVE_DATA:
        return standardizeTwelveDataSearch(data);
      case RapidAPIProvider.YAHOO_FINANCE:
        return standardizeYahooFinanceSearch(data);
      case RapidAPIProvider.ALPHA_VANTAGE:
        return standardizeAlphaVantageSearch(data);
      case RapidAPIProvider.BINANCE:
        return standardizeBinanceSearch(data);
      case RapidAPIProvider.TRADINGVIEW:
        return standardizeTradingViewSearch(data);
      case RapidAPIProvider.COINGECKO:
        return standardizeCoinGeckoSearch(data);
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  } catch (error) {
    console.error(`Error standardizing symbol search from ${provider}:`, error);
    throw error;
  }
}

//=====================================================================
// TWELVE DATA ADAPTERS
//=====================================================================

/**
 * Standardize candle data from Twelve Data
 */
function standardizeTwelveDataCandles(data: any): any[] {
  if (!data || !data.values || !Array.isArray(data.values)) {
    throw new Error('Invalid Twelve Data candle format');
  }
  
  return data.values.map((candle: any) => ({
    timestamp: new Date(candle.datetime).getTime(),
    open: parseFloat(candle.open),
    high: parseFloat(candle.high),
    low: parseFloat(candle.low),
    close: parseFloat(candle.close),
    volume: parseFloat(candle.volume || 0)
  }));
}

/**
 * Standardize quote data from Twelve Data
 */
function standardizeTwelveDataQuote(data: any): any {
  if (!data || !data.symbol || !data.close) {
    throw new Error('Invalid Twelve Data quote format');
  }
  
  return {
    symbol: data.symbol,
    price: parseFloat(data.close),
    change: parseFloat(data.percent_change || 0),
    timestamp: new Date(data.datetime || Date.now()).getTime()
  };
}

/**
 * Standardize symbol search results from Twelve Data
 */
function standardizeTwelveDataSearch(data: any): any[] {
  if (!data || !data.data || !Array.isArray(data.data)) {
    throw new Error('Invalid Twelve Data search format');
  }
  
  return data.data.map((item: any) => ({
    symbol: item.symbol,
    name: item.instrument_name,
    type: item.instrument_type,
    exchange: item.exchange,
    currency: item.currency_base || 'USD'
  }));
}

//=====================================================================
// YAHOO FINANCE ADAPTERS
//=====================================================================

/**
 * Standardize candle data from Yahoo Finance
 */
function standardizeYahooFinanceCandles(data: any): any[] {
  if (!data || !data.indicators || !data.indicators.quote || !Array.isArray(data.indicators.quote) || !data.timestamp) {
    throw new Error('Invalid Yahoo Finance candle format');
  }
  
  const quotes = data.indicators.quote[0];
  const timestamps = data.timestamp;
  
  const candles = [];
  for (let i = 0; i < timestamps.length; i++) {
    candles.push({
      timestamp: timestamps[i] * 1000, // Convert seconds to milliseconds
      open: quotes.open[i],
      high: quotes.high[i],
      low: quotes.low[i],
      close: quotes.close[i],
      volume: quotes.volume[i] || 0
    });
  }
  
  return candles;
}

/**
 * Standardize quote data from Yahoo Finance
 */
function standardizeYahooFinanceQuote(data: any): any {
  if (!data || !data.quoteResponse || !data.quoteResponse.result || !Array.isArray(data.quoteResponse.result) || !data.quoteResponse.result[0]) {
    throw new Error('Invalid Yahoo Finance quote format');
  }
  
  const quote = data.quoteResponse.result[0];
  
  return {
    symbol: quote.symbol,
    price: quote.regularMarketPrice,
    change: quote.regularMarketChangePercent || 0,
    timestamp: quote.regularMarketTime * 1000 // Convert seconds to milliseconds
  };
}

/**
 * Standardize symbol search results from Yahoo Finance
 */
function standardizeYahooFinanceSearch(data: any): any[] {
  if (!data || !data.ResultSet || !data.ResultSet.Result || !Array.isArray(data.ResultSet.Result)) {
    throw new Error('Invalid Yahoo Finance search format');
  }
  
  return data.ResultSet.Result.map((item: any) => ({
    symbol: item.symbol,
    name: item.name,
    type: item.typeDisp,
    exchange: item.exchDisp,
    currency: 'USD' // Yahoo Finance doesn't provide currency in search results
  }));
}

//=====================================================================
// ALPHA VANTAGE ADAPTERS
//=====================================================================

/**
 * Standardize candle data from Alpha Vantage
 */
function standardizeAlphaVantageCandles(data: any): any[] {
  if (!data || !data['Time Series (Daily)']) {
    throw new Error('Invalid Alpha Vantage candle format');
  }
  
  const timeSeries = data['Time Series (Daily)'];
  const dates = Object.keys(timeSeries);
  
  return dates.map(date => {
    const candle = timeSeries[date];
    return {
      timestamp: new Date(date).getTime(),
      open: parseFloat(candle['1. open']),
      high: parseFloat(candle['2. high']),
      low: parseFloat(candle['3. low']),
      close: parseFloat(candle['4. close']),
      volume: parseFloat(candle['5. volume'] || 0)
    };
  });
}

/**
 * Standardize quote data from Alpha Vantage
 */
function standardizeAlphaVantageQuote(data: any): any {
  if (!data || !data['Global Quote']) {
    throw new Error('Invalid Alpha Vantage quote format');
  }
  
  const quote = data['Global Quote'];
  
  return {
    symbol: quote['01. symbol'],
    price: parseFloat(quote['05. price']),
    change: parseFloat(quote['10. change percent'].replace('%', '')),
    timestamp: Date.now() // Alpha Vantage doesn't provide timestamp in quotes
  };
}

/**
 * Standardize symbol search results from Alpha Vantage
 */
function standardizeAlphaVantageSearch(data: any): any[] {
  if (!data || !data.bestMatches || !Array.isArray(data.bestMatches)) {
    throw new Error('Invalid Alpha Vantage search format');
  }
  
  return data.bestMatches.map((item: any) => ({
    symbol: item['1. symbol'],
    name: item['2. name'],
    type: item['3. type'],
    exchange: item['4. region'],
    currency: item['8. currency'] || 'USD'
  }));
}

//=====================================================================
// BINANCE ADAPTERS
//=====================================================================

/**
 * Standardize candle data from Binance
 */
function standardizeBinanceCandles(data: any): any[] {
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid Binance candle format');
  }
  
  return data.map((candle: any) => ({
    timestamp: candle[0], // Binance timestamps are already in milliseconds
    open: parseFloat(candle[1]),
    high: parseFloat(candle[2]),
    low: parseFloat(candle[3]),
    close: parseFloat(candle[4]),
    volume: parseFloat(candle[5])
  }));
}

/**
 * Standardize quote data from Binance
 */
function standardizeBinanceQuote(data: any): any {
  if (!data || !data.symbol || !data.lastPrice) {
    throw new Error('Invalid Binance quote format');
  }
  
  return {
    symbol: data.symbol,
    price: parseFloat(data.lastPrice),
    change: parseFloat(data.priceChangePercent),
    timestamp: Date.now() // Binance doesn't provide timestamp in ticker
  };
}

/**
 * Standardize symbol search results from Binance
 */
function standardizeBinanceSearch(data: any): any[] {
  if (!data || !Array.isArray(data)) {
    throw new Error('Invalid Binance search format');
  }
  
  return data.map((item: any) => ({
    symbol: item.symbol,
    name: item.symbol,
    type: 'CRYPTO',
    exchange: 'BINANCE',
    currency: item.symbol.endsWith('USDT') ? 'USDT' : 'USD'
  }));
}

//=====================================================================
// TRADINGVIEW ADAPTERS
//=====================================================================

/**
 * Standardize candle data from TradingView
 */
function standardizeTradingViewCandles(data: any): any[] {
  if (!data || !data.bars || !Array.isArray(data.bars)) {
    throw new Error('Invalid TradingView candle format');
  }
  
  return data.bars.map((candle: any) => ({
    timestamp: candle.time * 1000, // Convert seconds to milliseconds
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume || 0
  }));
}

/**
 * Standardize quote data from TradingView
 */
function standardizeTradingViewQuote(data: any): any {
  if (!data || !data.quotes || !Array.isArray(data.quotes) || !data.quotes[0]) {
    throw new Error('Invalid TradingView quote format');
  }
  
  const quote = data.quotes[0];
  
  return {
    symbol: quote.symbol,
    price: quote.lp,
    change: quote.chp || 0,
    timestamp: Date.now() // TradingView doesn't provide timestamp in quotes
  };
}

/**
 * Standardize symbol search results from TradingView
 */
function standardizeTradingViewSearch(data: any): any[] {
  if (!data || !data.symbols || !Array.isArray(data.symbols)) {
    throw new Error('Invalid TradingView search format');
  }
  
  return data.symbols.map((item: any) => ({
    symbol: item.symbol,
    name: item.description,
    type: item.type,
    exchange: item.exchange,
    currency: item.currency_code || 'USD'
  }));
}

//=====================================================================
// COINGECKO ADAPTERS
//=====================================================================

/**
 * Standardize candle data from CoinGecko
 */
function standardizeCoinGeckoCandles(data: any): any[] {
  if (!data || !data.prices || !Array.isArray(data.prices)) {
    throw new Error('Invalid CoinGecko candle format');
  }
  
  // CoinGecko only provides price data, not OHLCV
  // We'll create mock candles with the price as both open and close
  return data.prices.map((price: any) => ({
    timestamp: price[0], // CoinGecko timestamps are already in milliseconds
    open: price[1],
    high: price[1],
    low: price[1],
    close: price[1],
    volume: 0
  }));
}

/**
 * Standardize quote data from CoinGecko
 */
function standardizeCoinGeckoQuote(data: any): any {
  if (!data || !Array.isArray(data) || !data[0]) {
    throw new Error('Invalid CoinGecko quote format');
  }
  
  const coin = data[0];
  
  return {
    symbol: coin.symbol.toUpperCase(),
    price: coin.current_price,
    change: coin.price_change_percentage_24h || 0,
    timestamp: Date.now() // CoinGecko doesn't provide timestamp in quotes
  };
}

/**
 * Standardize symbol search results from CoinGecko
 */
function standardizeCoinGeckoSearch(data: any): any[] {
  if (!data || !data.coins || !Array.isArray(data.coins)) {
    throw new Error('Invalid CoinGecko search format');
  }
  
  return data.coins.map((coin: any) => ({
    symbol: coin.symbol.toUpperCase(),
    name: coin.name,
    type: 'CRYPTO',
    exchange: 'CRYPTO',
    currency: 'USD'
  }));
}