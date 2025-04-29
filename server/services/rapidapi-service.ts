/**
 * RapidAPI Service
 * Provides unified access to market data providers through RapidAPI
 */

import axios, { AxiosResponse } from 'axios';

export const RAPIDAPI_PROVIDERS = {
  twelve_data: {
    host: 'twelve-data1.p.rapidapi.com',
    baseUrl: 'https://twelve-data1.p.rapidapi.com',
    description: 'Financial market data for stocks, forex, and cryptocurrencies',
    supportedMarkets: ['stocks', 'forex', 'crypto']
  },
  binance: {
    host: 'binance43.p.rapidapi.com',
    baseUrl: 'https://binance43.p.rapidapi.com',
    description: 'Cryptocurrency exchange data',
    supportedMarkets: ['crypto']
  },
  coinranking: {
    host: 'coinranking1.p.rapidapi.com',
    baseUrl: 'https://coinranking1.p.rapidapi.com',
    description: 'Cryptocurrency prices, markets, and data',
    supportedMarkets: ['crypto']
  },
  yh_finance: {
    host: 'yh-finance.p.rapidapi.com',
    baseUrl: 'https://yh-finance.p.rapidapi.com',
    description: 'Real-time stock data and news',
    supportedMarkets: ['stocks', 'etfs', 'indices']
  },
  alpha_vantage: {
    host: 'alpha-vantage.p.rapidapi.com',
    baseUrl: 'https://alpha-vantage.p.rapidapi.com',
    description: 'Realtime and historical stock data APIs',
    supportedMarkets: ['stocks', 'forex', 'crypto']
  },
  tradingview: {
    host: 'trading-view.p.rapidapi.com',
    baseUrl: 'https://trading-view.p.rapidapi.com',
    description: 'Market movers and trading data',
    supportedMarkets: ['stocks', 'forex', 'crypto', 'futures']
  }
};

/**
 * RapidAPI Service for accessing market data providers
 */
export class RapidAPIService {
  private apiKey: string;
  private clients: Record<string, ReturnType<typeof axios.create>> = {};

  /**
   * Create a new RapidAPI service
   * @param apiKey RapidAPI key
   */
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    console.log('Initializing RapidAPI service...');
    
    // Initialize clients for each provider
    for (const [provider, config] of Object.entries(RAPIDAPI_PROVIDERS)) {
      this.clients[provider] = axios.create({
        baseURL: config.baseUrl,
        headers: {
          'x-rapidapi-host': config.host,
          'x-rapidapi-key': this.apiKey
        }
      });
    }
  }

  /**
   * Make a request to a specific RapidAPI provider
   * @param provider Provider ID (e.g., 'twelve_data', 'binance')
   * @param endpoint API endpoint (e.g., '/quote', '/time_series')
   * @param params Request parameters
   * @returns Promise with response data
   */
  async makeRequest<T = any>(
    provider: keyof typeof RAPIDAPI_PROVIDERS | string,
    endpoint: string,
    params: Record<string, any> = {}
  ): Promise<T> {
    const providerKey = provider as keyof typeof RAPIDAPI_PROVIDERS;
    
    if (!this.clients[providerKey]) {
      throw new Error(`Provider ${provider} not supported by RapidAPI service`);
    }

    try {
      // Make sure the endpoint starts with a slash
      const formattedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
      
      // Make the request
      const response: AxiosResponse<T> = await this.clients[providerKey].get(formattedEndpoint, { params });
      
      return response.data;
    } catch (error) {
      console.error(`Error making RapidAPI request to ${provider}${endpoint}:`, error);
      throw error;
    }
  }

  /**
   * Get a list of all supported providers
   * @returns Array of provider information
   */
  getProviders() {
    return Object.entries(RAPIDAPI_PROVIDERS).map(([id, config]) => ({
      id,
      name: id.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      host: config.host,
      baseUrl: config.baseUrl,
      description: config.description,
      supportedMarkets: config.supportedMarkets
    }));
  }
}

// Singleton instance
let rapidApiServiceInstance: RapidAPIService | null = null;

/**
 * Get or create the RapidAPI service instance
 * @param apiKey RapidAPI key
 * @returns RapidAPI service instance
 */
export function getRapidAPIService(apiKey: string): RapidAPIService {
  if (!rapidApiServiceInstance && apiKey) {
    rapidApiServiceInstance = new RapidAPIService(apiKey);
  }
  return rapidApiServiceInstance as RapidAPIService;
}

/**
 * Reset the RapidAPI service instance
 */
export function resetRapidAPIService(): void {
  rapidApiServiceInstance = null;
}