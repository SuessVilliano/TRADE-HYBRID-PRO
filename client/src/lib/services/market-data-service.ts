import axios from 'axios';

// Types for market data
export interface MarketDataSource {
  id: string;
  name: string;
  description: string;
  type: 'free' | 'premium' | 'enterprise';
  asset_classes: string[];
  endpoints: string[];
  logo: string;
  requires_api_key: boolean;
  documentation_url: string;
}

export interface MarketDataResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class MarketDataService {
  private apiKeys: Record<string, string> = {};
  private baseUrl = '/api/market-data';
  
  // Additional market data sources
  private dataSources: MarketDataSource[] = [
    {
      id: 'finnhub',
      name: 'Finnhub',
      description: 'Real-time RESTful APIs for stocks, forex, and crypto',
      type: 'premium',
      asset_classes: ['Stocks', 'Forex', 'Crypto', 'Indices'],
      endpoints: ['/quote', '/candle', '/news', '/sentiment'],
      logo: '/logos/finnhub.svg',
      requires_api_key: true,
      documentation_url: 'https://finnhub.io/docs/api'
    },
    {
      id: 'polygon',
      name: 'Polygon.io',
      description: 'Financial market data platform for stocks, options, forex and crypto',
      type: 'premium',
      asset_classes: ['Stocks', 'Options', 'Forex', 'Crypto'],
      endpoints: ['/tickers', '/quotes', '/trades', '/aggregates'],
      logo: '/logos/polygon.svg',
      requires_api_key: true,
      documentation_url: 'https://polygon.io/docs'
    },
    {
      id: 'coinapi',
      name: 'CoinAPI',
      description: 'All cryptocurrency exchanges integrated under a single API',
      type: 'premium',
      asset_classes: ['Crypto'],
      endpoints: ['/ohlcv', '/trades', '/quotes', '/orderbooks'],
      logo: '/logos/coinapi.svg',
      requires_api_key: true,
      documentation_url: 'https://docs.coinapi.io/'
    },
    {
      id: 'alpha_vantage',
      name: 'Alpha Vantage',
      description: 'Realtime and historical market data with powerful technical indicators',
      type: 'premium',
      asset_classes: ['Stocks', 'Forex', 'Crypto', 'Commodities'],
      endpoints: ['/time_series', '/technical_indicators', '/forex', '/crypto'],
      logo: '/logos/alpha-vantage.svg',
      requires_api_key: true,
      documentation_url: 'https://www.alphavantage.co/documentation/'
    },
    {
      id: 'marketstack',
      name: 'Marketstack',
      description: 'Real-time, intraday and historical market data API',
      type: 'premium',
      asset_classes: ['Stocks'],
      endpoints: ['/eod', '/intraday', '/tickers', '/exchanges'],
      logo: '/logos/marketstack.svg',
      requires_api_key: true,
      documentation_url: 'https://marketstack.com/documentation'
    },
    {
      id: 'iex_cloud',
      name: 'IEX Cloud',
      description: 'Financial data infrastructure for developers and enterprises',
      type: 'enterprise',
      asset_classes: ['Stocks', 'ETFs', 'Mutual Funds', 'Forex', 'Crypto'],
      endpoints: ['/stock', '/forex', '/crypto', '/options', '/commodities'],
      logo: '/logos/iex-cloud.svg',
      requires_api_key: true,
      documentation_url: 'https://iexcloud.io/docs/api/'
    },
    {
      id: 'fmp',
      name: 'Financial Modeling Prep',
      description: 'Financial statements, stock prices, ratios and economic data',
      type: 'premium',
      asset_classes: ['Stocks', 'ETFs', 'Mutual Funds', 'Indices'],
      endpoints: ['/quote', '/profile', '/financial-statements', '/historical-price'],
      logo: '/logos/fmp.svg',
      requires_api_key: true,
      documentation_url: 'https://site.financialmodelingprep.com/developer/docs/'
    },
    {
      id: 'tradier',
      name: 'Tradier Market Data',
      description: 'Comprehensive market data API for stocks and options',
      type: 'premium',
      asset_classes: ['Stocks', 'Options'],
      endpoints: ['/quotes', '/history', '/options/chains', '/markets/calendar'],
      logo: '/logos/tradier.svg',
      requires_api_key: true,
      documentation_url: 'https://documentation.tradier.com/'
    }
  ];

  // Get all available data sources
  public getDataSources(): MarketDataSource[] {
    return this.dataSources;
  }

  // Save an API key for a specific data source
  public setApiKey(sourceId: string, apiKey: string): void {
    this.apiKeys[sourceId] = apiKey;
    // Save to localStorage for persistence
    try {
      const savedKeys = JSON.parse(localStorage.getItem('market_data_api_keys') || '{}');
      savedKeys[sourceId] = apiKey;
      localStorage.setItem('market_data_api_keys', JSON.stringify(savedKeys));
    } catch (error) {
      console.error('Error saving API key to localStorage:', error);
    }
  }

  // Load saved API keys
  public loadSavedApiKeys(): void {
    try {
      const savedKeys = JSON.parse(localStorage.getItem('market_data_api_keys') || '{}');
      this.apiKeys = savedKeys;
    } catch (error) {
      console.error('Error loading API keys from localStorage:', error);
    }
  }

  // Get an API key for a specific data source
  public getApiKey(sourceId: string): string | undefined {
    return this.apiKeys[sourceId];
  }

  // Check if a data source has an API key configured
  public hasApiKey(sourceId: string): boolean {
    return !!this.apiKeys[sourceId];
  }

  // Get stock quotes from a specific data source
  public async getStockQuote(sourceId: string, symbol: string): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/quote`, {
        params: { symbol, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching stock quote from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get historical price data from a specific data source
  public async getHistoricalPrices(
    sourceId: string, 
    symbol: string, 
    interval: 'day' | 'hour' | 'minute' = 'day',
    from?: string,
    to?: string
  ): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/historical`, {
        params: { symbol, interval, from, to, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching historical prices from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get company information from a specific data source
  public async getCompanyInfo(sourceId: string, symbol: string): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/company`, {
        params: { symbol, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching company info from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get news from a specific data source
  public async getMarketNews(
    sourceId: string, 
    symbol?: string,
    category?: string,
    limit: number = 10
  ): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/news`, {
        params: { symbol, category, limit, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching news from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get forex data from a specific data source
  public async getForexData(
    sourceId: string,
    base: string,
    quote: string
  ): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/forex`, {
        params: { base, quote, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching forex data from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Get crypto data from a specific data source
  public async getCryptoData(
    sourceId: string,
    symbol: string
  ): Promise<MarketDataResponse<any>> {
    try {
      const apiKey = this.getApiKey(sourceId);
      if (!apiKey) {
        return { success: false, error: 'API key not configured for this data source' };
      }

      const response = await axios.get(`${this.baseUrl}/${sourceId}/crypto`, {
        params: { symbol, apiKey }
      });

      return { success: true, data: response.data };
    } catch (error) {
      console.error(`Error fetching crypto data from ${sourceId}:`, error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}

export const marketDataService = new MarketDataService();
export default marketDataService;