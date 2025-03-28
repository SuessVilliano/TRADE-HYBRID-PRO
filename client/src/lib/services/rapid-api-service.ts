import { ask_secrets, check_secrets } from '../utils';

export interface RapidAPIConfig {
  key: string;
  host: string;
}

export interface CoinRankingData {
  status: string;
  data: {
    stats: {
      total: number;
      totalCoins: number;
      totalMarkets: number;
      totalExchanges: number;
      totalMarketCap: string;
      total24hVolume: string;
    };
    coins: Array<{
      uuid: string;
      symbol: string;
      name: string;
      price: string;
      change: string;
      iconUrl: string;
      marketCap: string;
      volume24h: string;
      rank: number;
    }>;
  };
}

export interface NewsItem {
  title: string;
  link: string;
  description: string;
  date: string;
  imageUrl: string;
  source: string;
  language: string;
  category: string[];
}

export interface NewsResponse {
  status: string;
  totalResults: number;
  articles: NewsItem[];
}

export class RapidAPIService {
  private rapidApiKey: string = '';
  private initialized = false;

  constructor() {}

  async initialize(): Promise<boolean> {
    try {
      // Check if API key exists
      const hasKey = await check_secrets(['RAPIDAPI_KEY']);
      if (!hasKey) {
        console.log('RapidAPI key not found, will use default');
        this.rapidApiKey = '39b9c246b0msh8981e7993ba7354p1804d6jsn4711338b7ff9'; // Default key from the provided documentation
      } else {
        // Get from environment
        this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize RapidAPI service:', error);
      return false;
    }
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Makes a request to any RapidAPI endpoint
   */
  async makeRequest(config: {
    host: string;
    path: string;
    method?: 'GET' | 'POST';
    params?: Record<string, string>;
    body?: any;
  }): Promise<any> {
    await this.ensureInitialized();

    const { host, path, method = 'GET', params, body } = config;
    
    let url = `https://${host}${path}`;
    
    // Add query parameters if any
    if (params && Object.keys(params).length > 0) {
      const queryParams = new URLSearchParams();
      for (const key in params) {
        queryParams.append(key, params[key]);
      }
      url += `?${queryParams.toString()}`;
    }
    
    const options: RequestInit = {
      method,
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': host,
        'Content-Type': 'application/json'
      }
    };
    
    if (body) {
      options.body = JSON.stringify(body);
    }
    
    try {
      const response = await fetch(url, options);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`RapidAPI request failed: ${response.status} - ${errorText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('RapidAPI request error:', error);
      throw error;
    }
  }

  /**
   * Get cryptocurrency data from Coinranking
   */
  async getCryptoData(limit: number = 50): Promise<CoinRankingData> {
    return this.makeRequest({
      host: 'coinranking1.p.rapidapi.com',
      path: '/coins',
      params: {
        referenceCurrencyUuid: 'yhjMzLPhuIDl', // USD
        timePeriod: '24h',
        'tiers[0]': '1',
        orderBy: 'marketCap',
        orderDirection: 'desc',
        limit: limit.toString(),
        offset: '0'
      }
    });
  }

  /**
   * Get crypto stats overview
   */
  async getCryptoStats(): Promise<any> {
    return this.makeRequest({
      host: 'coinranking1.p.rapidapi.com',
      path: '/stats',
      params: {
        referenceCurrencyUuid: 'yhjMzLPhuIDl' // USD
      }
    });
  }

  /**
   * Get news data from Real-Time News API
   */
  async getNews(query: string, limit: number = 20): Promise<NewsResponse> {
    return this.makeRequest({
      host: 'real-time-news-data.p.rapidapi.com',
      path: '/search',
      params: {
        query,
        limit: limit.toString(),
        time_published: 'anytime',
        country: 'US',
        lang: 'en'
      }
    });
  }

  /**
   * Get financial news for a specific stock/symbol
   */
  async getStockNews(symbol: string, limit: number = 10): Promise<NewsResponse> {
    return this.getNews(symbol, limit);
  }

  /**
   * Get stock market movers from TradingView
   */
  async getMarketMovers(category: 'volume_gainers' | 'percent_change_gainers' | 'percent_change_losers' = 'percent_change_gainers'): Promise<any> {
    return this.makeRequest({
      host: 'trading-view.p.rapidapi.com',
      path: '/market/get-movers',
      params: {
        exchange: 'US',
        name: category,
        locale: 'en'
      }
    });
  }

  /**
   * Get stock data from Alpha Vantage
   */
  async getStockData(symbol: string): Promise<any> {
    return this.makeRequest({
      host: 'alpha-vantage.p.rapidapi.com',
      path: '/query',
      params: {
        function: 'TIME_SERIES_DAILY',
        symbol,
        outputsize: 'compact',
        datatype: 'json'
      }
    });
  }

  /**
   * Get Binance crypto market data
   */
  async getBinanceMarketData(): Promise<any> {
    return this.makeRequest({
      host: 'binance43.p.rapidapi.com',
      path: '/ticker/24hr'
    });
  }

  /**
   * Get options pricing data
   */
  async getOptionsData(symbol: string, type: 'Call' | 'Put' = 'Call'): Promise<any> {
    const today = new Date();
    const nextYear = new Date(today.getFullYear() + 1, today.getMonth(), today.getDate());
    const formattedNextYear = nextYear.toISOString().split('T')[0];
    
    return this.makeRequest({
      host: 'quotient.p.rapidapi.com',
      path: '/options/prices',
      params: {
        symbol,
        type,
        max_expiry: formattedNextYear
      }
    });
  }
}

// Export a singleton instance
export const rapidApiService = new RapidAPIService();