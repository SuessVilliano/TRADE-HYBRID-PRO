/**
 * RapidAPI Service
 * 
 * This service handles interactions with various RapidAPI providers
 * to fetch market data for stocks, cryptocurrencies, and forex.
 */

import axios from 'axios';
import { TimeInterval } from '../mcp/data/market-data-interface';

// Providers available through RapidAPI
export enum RapidAPIProvider {
  TWELVE_DATA = 'twelve-data',
  YAHOO_FINANCE = 'yahoo-finance',
  ALPHA_VANTAGE = 'alpha-vantage',
  BINANCE = 'binance',
  TRADINGVIEW = 'tradingview',
  COINGECKO = 'coingecko'
}

// Export as RAPIDAPI_PROVIDERS for compatibility with existing code
export const RAPIDAPI_PROVIDERS = RapidAPIProvider;

// API endpoints configuration
const apiEndpoints = {
  [RapidAPIProvider.TWELVE_DATA]: {
    baseURL: 'https://twelve-data1.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'twelve-data1.p.rapidapi.com'
    },
    endpoints: {
      timeSeries: '/time_series',
      quote: '/quote',
      search: '/symbol_search'
    }
  },
  [RapidAPIProvider.YAHOO_FINANCE]: {
    baseURL: 'https://yahoo-finance15.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'yahoo-finance15.p.rapidapi.com'
    },
    endpoints: {
      historicalData: '/api/yahoo/hi/history',
      quote: '/api/yahoo/qu/quote',
      search: '/api/yahoo/au/autocomplete'
    }
  },
  [RapidAPIProvider.ALPHA_VANTAGE]: {
    baseURL: 'https://alpha-vantage.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'alpha-vantage.p.rapidapi.com'
    },
    endpoints: {
      timeSeries: '/query',
      quote: '/query',
      search: '/query'
    }
  },
  [RapidAPIProvider.BINANCE]: {
    baseURL: 'https://binance-crypto-exchange.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'binance-crypto-exchange.p.rapidapi.com'
    },
    endpoints: {
      klines: '/klines',
      ticker: '/ticker/24hr',
      search: '/ticker/price'
    }
  },
  [RapidAPIProvider.TRADINGVIEW]: {
    baseURL: 'https://tradingview.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'tradingview.p.rapidapi.com'
    },
    endpoints: {
      chart: '/market/get-chart',
      quotes: '/market/get-quotes',
      search: '/market/search'
    }
  },
  [RapidAPIProvider.COINGECKO]: {
    baseURL: 'https://coingecko.p.rapidapi.com',
    headers: {
      'X-RapidAPI-Key': process.env.RAPID_API_KEY || '',
      'X-RapidAPI-Host': 'coingecko.p.rapidapi.com'
    },
    endpoints: {
      coins: '/coins/markets',
      history: '/coins/{id}/market_chart',
      search: '/search'
    }
  }
};

class RapidAPIService {
  private static instance: RapidAPIService;
  private lastRequestTimestamps: Map<string, number> = new Map();
  private requestCounters: Map<string, number> = new Map();
  private readonly requestLimits: Map<string, number> = new Map();
  private readonly rateLimitTimeout: number = 60000; // 1 minute timeout for rate limiting

  private constructor() {
    // Set request limits for each provider (requests per minute)
    this.requestLimits.set(RapidAPIProvider.TWELVE_DATA, 8);
    this.requestLimits.set(RapidAPIProvider.YAHOO_FINANCE, 5);
    this.requestLimits.set(RapidAPIProvider.ALPHA_VANTAGE, 5);
    this.requestLimits.set(RapidAPIProvider.BINANCE, 10);
    this.requestLimits.set(RapidAPIProvider.TRADINGVIEW, 5);
    this.requestLimits.set(RapidAPIProvider.COINGECKO, 10);

    // Initialize request counters
    Object.values(RapidAPIProvider).forEach(provider => {
      this.requestCounters.set(provider, 0);
    });
  }

  public static getInstance(): RapidAPIService {
    if (!RapidAPIService.instance) {
      RapidAPIService.instance = new RapidAPIService();
    }
    return RapidAPIService.instance;
  }

  /**
   * Check if a request can be made to the provider
   * @param provider The RapidAPI provider
   * @returns True if a request can be made, false otherwise
   */
  private canMakeRequest(provider: RapidAPIProvider): boolean {
    const now = Date.now();
    const lastRequestTime = this.lastRequestTimestamps.get(provider) || 0;
    const requestCount = this.requestCounters.get(provider) || 0;
    const requestLimit = this.requestLimits.get(provider) || 5;

    // Reset counter if more than rate limit timeout has passed
    if (now - lastRequestTime > this.rateLimitTimeout) {
      this.requestCounters.set(provider, 0);
      return true;
    }

    // Check if we've exceeded the request limit
    return requestCount < requestLimit;
  }

  /**
   * Update the request counter for a provider
   * @param provider The RapidAPI provider
   */
  private updateRequestCounter(provider: RapidAPIProvider): void {
    const now = Date.now();
    const lastRequestTime = this.lastRequestTimestamps.get(provider) || 0;
    let requestCount = this.requestCounters.get(provider) || 0;

    // Reset counter if more than rate limit timeout has passed
    if (now - lastRequestTime > this.rateLimitTimeout) {
      requestCount = 0;
    }

    // Update counter and timestamp
    this.requestCounters.set(provider, requestCount + 1);
    this.lastRequestTimestamps.set(provider, now);
  }

  /**
   * Get historical candle data from a specific provider
   * @param provider The RapidAPI provider to use
   * @param symbol The symbol to get data for
   * @param interval The time interval for candles
   * @param from The start timestamp
   * @param to The end timestamp (optional)
   * @returns The candle data
   */
  public async getHistoricalCandles(
    provider: RapidAPIProvider,
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    if (!this.canMakeRequest(provider)) {
      throw new Error(`Rate limit exceeded for provider ${provider}`);
    }

    try {
      this.updateRequestCounter(provider);
      const endpoint = apiEndpoints[provider];

      switch (provider) {
        case RapidAPIProvider.TWELVE_DATA:
          return this.getTwelveDataCandles(symbol, interval, from, to);
        case RapidAPIProvider.YAHOO_FINANCE:
          return this.getYahooFinanceCandles(symbol, interval, from, to);
        case RapidAPIProvider.ALPHA_VANTAGE:
          return this.getAlphaVantageCandles(symbol, interval, from, to);
        case RapidAPIProvider.BINANCE:
          return this.getBinanceCandles(symbol, interval, from, to);
        case RapidAPIProvider.TRADINGVIEW:
          return this.getTradingViewCandles(symbol, interval, from, to);
        case RapidAPIProvider.COINGECKO:
          return this.getCoinGeckoCandles(symbol, interval, from, to);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error getting historical candles from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get the latest quote for a symbol from a specific provider
   * @param provider The RapidAPI provider to use
   * @param symbol The symbol to get data for
   * @returns The latest quote
   */
  public async getLatestQuote(
    provider: RapidAPIProvider,
    symbol: string
  ): Promise<any> {
    if (!this.canMakeRequest(provider)) {
      throw new Error(`Rate limit exceeded for provider ${provider}`);
    }

    try {
      this.updateRequestCounter(provider);
      const endpoint = apiEndpoints[provider];

      switch (provider) {
        case RapidAPIProvider.TWELVE_DATA:
          return this.getTwelveDataQuote(symbol);
        case RapidAPIProvider.YAHOO_FINANCE:
          return this.getYahooFinanceQuote(symbol);
        case RapidAPIProvider.ALPHA_VANTAGE:
          return this.getAlphaVantageQuote(symbol);
        case RapidAPIProvider.BINANCE:
          return this.getBinanceQuote(symbol);
        case RapidAPIProvider.TRADINGVIEW:
          return this.getTradingViewQuote(symbol);
        case RapidAPIProvider.COINGECKO:
          return this.getCoinGeckoQuote(symbol);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error getting latest quote from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Search for symbols from a specific provider
   * @param provider The RapidAPI provider to use
   * @param query The search query
   * @returns The search results
   */
  public async searchSymbols(
    provider: RapidAPIProvider,
    query: string
  ): Promise<any> {
    if (!this.canMakeRequest(provider)) {
      throw new Error(`Rate limit exceeded for provider ${provider}`);
    }

    try {
      this.updateRequestCounter(provider);
      const endpoint = apiEndpoints[provider];

      switch (provider) {
        case RapidAPIProvider.TWELVE_DATA:
          return this.searchTwelveData(query);
        case RapidAPIProvider.YAHOO_FINANCE:
          return this.searchYahooFinance(query);
        case RapidAPIProvider.ALPHA_VANTAGE:
          return this.searchAlphaVantage(query);
        case RapidAPIProvider.BINANCE:
          return this.searchBinance(query);
        case RapidAPIProvider.TRADINGVIEW:
          return this.searchTradingView(query);
        case RapidAPIProvider.COINGECKO:
          return this.searchCoinGecko(query);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      console.error(`Error searching symbols from ${provider}:`, error);
      throw error;
    }
  }

  /**
   * Get historical candles from Twelve Data
   */
  private async getTwelveDataCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TWELVE_DATA];
    
    // Convert interval to Twelve Data format
    const intervalMap: Record<TimeInterval, string> = {
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
    
    const twelveDataInterval = intervalMap[interval] || '1day';
    
    // Calculate the number of data points
    const fromDate = new Date(from);
    const toDate = to ? new Date(to) : new Date();
    const diffTime = Math.abs(toDate.getTime() - fromDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Determine the appropriate number of data points
    let outputsize = '5000'; // Maximum output size
    if (diffDays <= 7) {
      outputsize = '100';
    } else if (diffDays <= 30) {
      outputsize = '500';
    } else if (diffDays <= 90) {
      outputsize = '1000';
    }
    
    const params = {
      symbol,
      interval: twelveDataInterval,
      outputsize,
      format: 'json'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.timeSeries, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from Twelve Data
   */
  private async getTwelveDataQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TWELVE_DATA];
    
    const params = {
      symbol,
      format: 'json'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.quote, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using Twelve Data
   */
  private async searchTwelveData(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TWELVE_DATA];
    
    const params = {
      symbol: query,
      outputsize: '30',
      format: 'json'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get historical candles from Yahoo Finance
   */
  private async getYahooFinanceCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.YAHOO_FINANCE];
    
    // Convert interval to Yahoo Finance format
    const intervalMap: Record<TimeInterval, string> = {
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
    
    const yahooInterval = intervalMap[interval] || '1d';
    
    // Convert timestamps to Unix time
    const period1 = Math.floor(from / 1000);
    const period2 = to ? Math.floor(to / 1000) : Math.floor(Date.now() / 1000);
    
    const params = {
      symbol,
      interval: yahooInterval,
      period1: period1.toString(),
      period2: period2.toString()
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.historicalData, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from Yahoo Finance
   */
  private async getYahooFinanceQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.YAHOO_FINANCE];
    
    const params = {
      symbol
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.quote, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using Yahoo Finance
   */
  private async searchYahooFinance(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.YAHOO_FINANCE];
    
    const params = {
      query,
      lang: 'en',
      region: 'US'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get historical candles from Alpha Vantage
   */
  private async getAlphaVantageCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.ALPHA_VANTAGE];
    
    // Convert interval to Alpha Vantage format
    const intervalMap: Record<TimeInterval, string> = {
      '1m': 'TIME_SERIES_INTRADAY&interval=1min',
      '5m': 'TIME_SERIES_INTRADAY&interval=5min',
      '15m': 'TIME_SERIES_INTRADAY&interval=15min',
      '30m': 'TIME_SERIES_INTRADAY&interval=30min',
      '1h': 'TIME_SERIES_INTRADAY&interval=60min',
      '4h': 'TIME_SERIES_INTRADAY&interval=60min', // Not supported, use 60min
      '1d': 'TIME_SERIES_DAILY',
      '1w': 'TIME_SERIES_WEEKLY',
      '1M': 'TIME_SERIES_MONTHLY'
    };
    
    const functionParam = intervalMap[interval] || 'TIME_SERIES_DAILY';
    
    const params: Record<string, string> = {
      symbol,
      function: functionParam.split('&')[0]
    };
    
    // Add interval parameter if needed
    if (functionParam.includes('&interval=')) {
      params.interval = functionParam.split('&interval=')[1];
    }
    
    // Add outputsize parameter
    params.outputsize = 'full';
    
    // Add datatype parameter
    params.datatype = 'json';
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.timeSeries, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from Alpha Vantage
   */
  private async getAlphaVantageQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.ALPHA_VANTAGE];
    
    const params = {
      function: 'GLOBAL_QUOTE',
      symbol,
      datatype: 'json'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.quote, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using Alpha Vantage
   */
  private async searchAlphaVantage(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.ALPHA_VANTAGE];
    
    const params = {
      function: 'SYMBOL_SEARCH',
      keywords: query,
      datatype: 'json'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get historical candles from Binance
   */
  private async getBinanceCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.BINANCE];
    
    // Convert interval to Binance format
    const intervalMap: Record<TimeInterval, string> = {
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
    
    const binanceInterval = intervalMap[interval] || '1d';
    
    // Process symbol for Binance format (remove USD for crypto pairs)
    let binanceSymbol = symbol;
    if (symbol.endsWith('USD') && !symbol.endsWith('USDT')) {
      binanceSymbol = symbol.replace('USD', '') + 'USDT';
    }
    
    const params = {
      symbol: binanceSymbol,
      interval: binanceInterval,
      startTime: from.toString(),
      endTime: to ? to.toString() : Date.now().toString(),
      limit: '1000'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.klines, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from Binance
   */
  private async getBinanceQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.BINANCE];
    
    // Process symbol for Binance format (remove USD for crypto pairs)
    let binanceSymbol = symbol;
    if (symbol.endsWith('USD') && !symbol.endsWith('USDT')) {
      binanceSymbol = symbol.replace('USD', '') + 'USDT';
    }
    
    const params = {
      symbol: binanceSymbol
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.ticker, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using Binance
   */
  private async searchBinance(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.BINANCE];
    
    // For Binance, we can't really search, so we'll return a specific ticker
    // Alternatively, we could list all tickers and filter
    const params = {};
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    // Filter the response to find matching symbols
    const allTickers = response.data;
    const filteredTickers = allTickers.filter((ticker: any) => 
      ticker.symbol.toLowerCase().includes(query.toLowerCase())
    );
    
    return filteredTickers.slice(0, 10); // Limit to 10 results
  }

  /**
   * Get historical candles from TradingView
   */
  private async getTradingViewCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TRADINGVIEW];
    
    // Convert interval to TradingView format
    const intervalMap: Record<TimeInterval, string> = {
      '1m': '1',
      '5m': '5',
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
      '1w': 'W',
      '1M': 'M'
    };
    
    const tvInterval = intervalMap[interval] || 'D';
    
    // TradingView needs a market and symbolId
    let market = 'crypto';
    let symbolId = symbol;
    
    // Determine market based on symbol
    if (symbol.includes('/') || symbol.endsWith('USD') || symbol.endsWith('USDT')) {
      market = 'crypto';
      // Format symbol for crypto
      symbolId = symbol.replace('/', '');
      if (!symbolId.endsWith('USD') && !symbolId.endsWith('USDT')) {
        symbolId = symbolId + 'USD';
      }
    } else if (symbol.includes('.')) {
      market = 'stock';
    } else if (symbol.length === 6 && !isNaN(Number(symbol[0]))) {
      market = 'futures';
    } else if (
      symbol === 'EURUSD' || 
      symbol === 'GBPUSD' || 
      symbol === 'USDJPY' || 
      symbol === 'AUDUSD'
    ) {
      market = 'forex';
    }
    
    // Format symbol ID for TradingView based on market
    switch (market) {
      case 'stock':
        // Keep as is
        break;
      case 'forex':
        symbolId = `OANDA:${symbolId}`;
        break;
      case 'futures':
        symbolId = `CME:${symbolId}`;
        break;
      case 'crypto':
        symbolId = `BINANCE:${symbolId}`;
        break;
      default:
        symbolId = `BINANCE:${symbolId}`;
    }
    
    const params = {
      symbol: symbolId,
      resolution: tvInterval,
      from: Math.floor(from / 1000).toString(),
      to: to ? Math.floor(to / 1000).toString() : Math.floor(Date.now() / 1000).toString(),
      countback: '500'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.chart, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from TradingView
   */
  private async getTradingViewQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TRADINGVIEW];
    
    // TradingView needs a market and symbolId
    let market = 'crypto';
    let symbolId = symbol;
    
    // Determine market based on symbol
    if (symbol.includes('/') || symbol.endsWith('USD') || symbol.endsWith('USDT')) {
      market = 'crypto';
      // Format symbol for crypto
      symbolId = symbol.replace('/', '');
      if (!symbolId.endsWith('USD') && !symbolId.endsWith('USDT')) {
        symbolId = symbolId + 'USD';
      }
    } else if (symbol.includes('.')) {
      market = 'stock';
    } else if (symbol.length === 6 && !isNaN(Number(symbol[0]))) {
      market = 'futures';
    } else if (
      symbol === 'EURUSD' || 
      symbol === 'GBPUSD' || 
      symbol === 'USDJPY' || 
      symbol === 'AUDUSD'
    ) {
      market = 'forex';
    }
    
    // Format symbol ID for TradingView based on market
    switch (market) {
      case 'stock':
        // Keep as is
        break;
      case 'forex':
        symbolId = `OANDA:${symbolId}`;
        break;
      case 'futures':
        symbolId = `CME:${symbolId}`;
        break;
      case 'crypto':
        symbolId = `BINANCE:${symbolId}`;
        break;
      default:
        symbolId = `BINANCE:${symbolId}`;
    }
    
    const params = {
      symbols: symbolId
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.quotes, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using TradingView
   */
  private async searchTradingView(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.TRADINGVIEW];
    
    const params = {
      text: query
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get historical candles from CoinGecko
   */
  private async getCoinGeckoCandles(
    symbol: string,
    interval: TimeInterval,
    from: number,
    to?: number
  ): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.COINGECKO];
    
    // CoinGecko requires a coin ID, but we're given a symbol like "BTC"
    // We need to convert it to a CoinGecko ID like "bitcoin"
    // This requires a separate API call to map the symbol to an ID
    
    // First, search for the coin to get its ID
    const searchResponse = await this.searchCoinGecko(symbol);
    
    if (!searchResponse.coins || searchResponse.coins.length === 0) {
      throw new Error(`Symbol ${symbol} not found in CoinGecko`);
    }
    
    // Find the best match (assume it's the first result)
    const coinId = searchResponse.coins[0].id;
    
    // Convert interval to CoinGecko format (days)
    const intervalInDays: Record<TimeInterval, number> = {
      '1m': 1,    // Minimum is 1 day
      '5m': 1,    // Minimum is 1 day
      '15m': 1,   // Minimum is 1 day
      '30m': 1,   // Minimum is 1 day
      '1h': 1,    // Minimum is 1 day
      '4h': 1,    // Minimum is 1 day
      '1d': 1,
      '1w': 7,
      '1M': 30
    };
    
    const days = intervalInDays[interval] || 1;
    
    // CoinGecko's endpoint format includes the coin ID
    const historyEndpoint = endpoint.endpoints.history.replace('{id}', coinId);
    
    const params = {
      vs_currency: 'usd',
      days: days.toString(),
      interval: days <= 1 ? 'hour' : 'day'
    };
    
    const response = await axios.get(endpoint.baseURL + historyEndpoint, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Get latest quote from CoinGecko
   */
  private async getCoinGeckoQuote(symbol: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.COINGECKO];
    
    // For CoinGecko, we'll use the markets endpoint to get the latest price
    // We need to search for the symbol first
    const searchResponse = await this.searchCoinGecko(symbol);
    
    if (!searchResponse.coins || searchResponse.coins.length === 0) {
      throw new Error(`Symbol ${symbol} not found in CoinGecko`);
    }
    
    // Find the best match (assume it's the first result)
    const coinId = searchResponse.coins[0].id;
    
    const params = {
      vs_currency: 'usd',
      ids: coinId,
      order: 'market_cap_desc',
      per_page: '1',
      page: '1',
      sparkline: 'false'
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.coins, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }

  /**
   * Search symbols using CoinGecko
   */
  private async searchCoinGecko(query: string): Promise<any> {
    const endpoint = apiEndpoints[RapidAPIProvider.COINGECKO];
    
    const params = {
      query
    };
    
    const response = await axios.get(endpoint.baseURL + endpoint.endpoints.search, {
      headers: endpoint.headers,
      params
    });
    
    return response.data;
  }
}

export function getRapidAPIService(): RapidAPIService {
  return RapidAPIService.getInstance();
}