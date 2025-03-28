import { check_secrets } from '../utils';
import { apiKeyManager } from './api-key-manager';

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
      btcDominance?: string;
    };
    coins: Array<{
      uuid: string;
      symbol: string;
      name: string;
      price: string;
      change: string;
      iconUrl: string;
      marketCap: string;
      volume24h?: string;
      '24hVolume'?: string;
      rank: number;
      sparkline?: string[];
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
  private rateLimits = {
    requestsPerMinute: 0,
    requestsPerDay: 0,
    requestsRemaining: 0,
    resetTime: 0
  };
  private requestLog: Array<{ timestamp: number, endpoint: string }> = [];

  constructor() {}

  async initialize(): Promise<boolean> {
    try {
      // First try to get the API key from the API key manager
      await apiKeyManager.initialize();
      const apiKeyConfig = await apiKeyManager.getApiKey('rapidapi');
      
      if (apiKeyConfig && apiKeyConfig.isValid) {
        this.rapidApiKey = apiKeyConfig.key;
        if (apiKeyConfig.rateLimits) {
          this.rateLimits.requestsPerMinute = apiKeyConfig.rateLimits.requestsPerMinute || 10;
          this.rateLimits.requestsPerDay = apiKeyConfig.rateLimits.requestsPerDay || 500;
          this.rateLimits.requestsRemaining = apiKeyConfig.rateLimits.requestsRemaining || 500;
        }
        console.log('Using RapidAPI key from API Key Manager');
      } else {
        // Fall back to checking environment variables directly
        const hasKey = await check_secrets(['RAPIDAPI_KEY']);
        if (!hasKey) {
          console.log('RapidAPI key not found, will use default');
          this.rapidApiKey = '39b9c246b0msh8981e7993ba7354p1804d6jsn4711338b7ff9'; // Default key from the provided documentation
        } else {
          // Get from environment
          this.rapidApiKey = process.env.RAPIDAPI_KEY || '';
        }
        
        // Update the API key manager with this key
        await apiKeyManager.setApiKey('rapidapi', {
          key: this.rapidApiKey,
          isValid: true,
          tier: 'basic',
          rateLimits: {
            requestsPerMinute: 10,
            requestsPerDay: 500
          }
        });
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
   * Check if we're within rate limits
   */
  private checkRateLimits(endpoint: string): boolean {
    const now = Date.now();
    
    // Clean up old requests (older than 1 day)
    this.requestLog = this.requestLog.filter(req => now - req.timestamp < 24 * 60 * 60 * 1000);
    
    // Check daily limit
    if (this.rateLimits.requestsPerDay > 0 && this.requestLog.length >= this.rateLimits.requestsPerDay) {
      console.warn('RapidAPI daily rate limit reached');
      return false;
    }
    
    // Check per-minute limit
    const lastMinuteRequests = this.requestLog.filter(req => now - req.timestamp < 60 * 1000);
    if (this.rateLimits.requestsPerMinute > 0 && lastMinuteRequests.length >= this.rateLimits.requestsPerMinute) {
      console.warn('RapidAPI per-minute rate limit reached, waiting a bit...');
      return false;
    }
    
    // Log this request
    this.requestLog.push({ timestamp: now, endpoint });
    return true;
  }

  /**
   * Get cryptocurrency data from Coinranking API
   */
  async getCryptoData(limit: number = 50): Promise<CoinRankingData | null> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('coinranking/coins')) {
      console.warn('Rate limit hit, returning null for getCryptoData');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'coinranking1.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://coinranking1.p.rapidapi.com/coins?limit=${limit}&sparkline=true`, options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cryptocurrency data:', error);
      return null;
    }
  }

  /**
   * Get cryptocurrency stats from Coinranking API
   */
  async getCryptoStats(): Promise<CoinRankingData | null> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('coinranking/stats')) {
      console.warn('Rate limit hit, returning null for getCryptoStats');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'coinranking1.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch('https://coinranking1.p.rapidapi.com/stats', options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cryptocurrency stats:', error);
      return null;
    }
  }

  /**
   * Get news articles from Bing News Search API
   */
  async getNews(query: string, count: number = 10): Promise<NewsResponse | null> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('bing-news')) {
      console.warn('Rate limit hit, returning null for getNews');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'bing-news-search1.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://bing-news-search1.p.rapidapi.com/news/search?q=${encodeURIComponent(query)}&count=${count}&freshness=Day&textFormat=Raw&safeSearch=Off`, options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform the data into our expected format
      const articles = data.value.map((item: any) => ({
        title: item.name,
        link: item.url,
        description: item.description || '',
        date: item.datePublished,
        imageUrl: item.image?.thumbnail?.contentUrl || '',
        source: item.provider[0]?.name || 'Unknown',
        language: 'en',
        category: item.category ? [item.category] : []
      }));
      
      return {
        status: 'ok',
        totalResults: articles.length,
        articles
      };
    } catch (error) {
      console.error('Error fetching news:', error);
      return null;
    }
  }

  /**
   * Get stock data from Alpha Vantage API
   */
  async getStockData(symbol: string): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('alpha-vantage')) {
      console.warn('Rate limit hit, returning null for getStockData');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://alpha-vantage.p.rapidapi.com/query?function=GLOBAL_QUOTE&symbol=${symbol}`, options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      return null;
    }
  }
  
  /**
   * Search for stocks via Alpha Vantage
   */
  async searchStocks(query: string): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('alpha-vantage-search')) {
      console.warn('Rate limit hit, returning null for searchStocks');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://alpha-vantage.p.rapidapi.com/query?function=SYMBOL_SEARCH&keywords=${encodeURIComponent(query)}`, options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error searching stocks for "${query}":`, error);
      return null;
    }
  }
  
  /**
   * Get Binance market data for cryptocurrencies
   */
  async getBinanceMarketData(): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('binance-ticker')) {
      console.warn('Rate limit hit, returning null for getBinanceMarketData');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'binance43.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch('https://binance43.p.rapidapi.com/ticker/24hr', options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching Binance market data:', error);
      return null;
    }
  }

  /**
   * Get technical indicators from Alpha Vantage
   */
  async getTechnicalIndicators(symbol: string, indicator: string, interval: string = 'daily'): Promise<any> {
    await this.ensureInitialized();
    
    if (!this.checkRateLimits('alpha-vantage-technical')) {
      console.warn('Rate limit hit, returning null for getTechnicalIndicators');
      return null;
    }
    
    const options = {
      method: 'GET',
      headers: {
        'x-rapidapi-key': this.rapidApiKey,
        'x-rapidapi-host': 'alpha-vantage.p.rapidapi.com'
      }
    };

    try {
      const response = await fetch(`https://alpha-vantage.p.rapidapi.com/query?function=${indicator}&symbol=${symbol}&interval=${interval}`, options);
      if (!response.ok) {
        throw new Error(`API returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error fetching technical indicators for ${symbol}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const rapidApiService = new RapidAPIService();