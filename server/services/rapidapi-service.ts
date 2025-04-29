/**
 * RapidAPI Service
 * 
 * Provides a unified interface for accessing various RapidAPI endpoints
 * for market data and financial information.
 */

import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// RapidAPI provider configuration
export interface RapidAPIProvider {
  id: string;
  name: string;
  host: string;
  baseUrl: string;
  description: string;
  type: 'rapidapi';
  requires_api_key: boolean;
  asset_classes: string[];
  supportedMarkets: string[];
  endpoints: {
    [key: string]: {
      path: string;
      method: string;
      params: {
        [key: string]: {
          type: string;
          required: boolean;
          description: string;
        };
      };
    };
  };
}

// Define available RapidAPI providers
export const RAPIDAPI_PROVIDERS: { [key: string]: RapidAPIProvider } = {
  twelve_data: {
    id: 'twelve_data',
    name: 'Twelve Data',
    host: 'twelve-data1.p.rapidapi.com',
    baseUrl: 'https://twelve-data1.p.rapidapi.com',
    description: 'Real-time and historical market data for stocks, forex, and crypto',
    type: 'rapidapi',
    requires_api_key: true,
    asset_classes: ['stocks', 'forex', 'crypto', 'etf', 'indices'],
    supportedMarkets: ['US', 'Global'],
    endpoints: {
      '/time_series': {
        path: '/time_series',
        method: 'GET',
        params: {
          symbol: {
            type: 'string',
            required: true,
            description: 'Symbol to get data for'
          },
          interval: {
            type: 'string',
            required: true,
            description: 'Time interval (1min, 5min, 15min, 30min, 1h, 2h, 4h, 1day, 1week, 1month)'
          },
          outputsize: {
            type: 'number',
            required: false,
            description: 'Number of data points to return'
          },
          format: {
            type: 'string',
            required: false,
            description: 'Output format (json or csv)'
          }
        }
      },
      '/quote': {
        path: '/quote',
        method: 'GET',
        params: {
          symbol: {
            type: 'string',
            required: true,
            description: 'Symbol to get quote for'
          },
          interval: {
            type: 'string',
            required: false,
            description: 'Time interval (1min, 5min, 15min, 30min, 1h, 2h, 4h, 1day, 1week, 1month)'
          }
        }
      }
    }
  },
  alpha_vantage: {
    id: 'alpha_vantage',
    name: 'Alpha Vantage',
    host: 'alpha-vantage.p.rapidapi.com',
    baseUrl: 'https://alpha-vantage.p.rapidapi.com',
    description: 'Realtime and historical stock data with technical indicators',
    type: 'rapidapi',
    requires_api_key: true,
    asset_classes: ['stocks', 'forex', 'crypto'],
    supportedMarkets: ['US', 'Global'],
    endpoints: {
      '/query': {
        path: '/query',
        method: 'GET',
        params: {
          function: {
            type: 'string',
            required: true,
            description: 'The Alpha Vantage function to call'
          },
          symbol: {
            type: 'string',
            required: true,
            description: 'The symbol to get data for'
          },
          interval: {
            type: 'string',
            required: false,
            description: 'Time interval (1min, 5min, 15min, 30min, 60min, daily, weekly, monthly)'
          },
          outputsize: {
            type: 'string',
            required: false,
            description: 'Output size (compact or full)'
          }
        }
      }
    }
  },
  yh_finance: {
    id: 'yh_finance',
    name: 'Yahoo Finance',
    host: 'yahoo-finance15.p.rapidapi.com',
    baseUrl: 'https://yahoo-finance15.p.rapidapi.com',
    description: 'Comprehensive market data from Yahoo Finance',
    type: 'rapidapi',
    requires_api_key: true,
    asset_classes: ['stocks', 'etf', 'indices', 'mutual_funds'],
    supportedMarkets: ['US', 'Global'],
    endpoints: {
      '/stock/v3/get-chart': {
        path: '/stock/v3/get-chart',
        method: 'GET',
        params: {
          symbol: {
            type: 'string',
            required: true,
            description: 'Symbol to get chart data for'
          },
          interval: {
            type: 'string',
            required: false,
            description: 'Time interval (1m, 5m, 15m, 1d, 1wk, 1mo)'
          },
          range: {
            type: 'string',
            required: false,
            description: 'Time range (1d, 5d, 1mo, 3mo, 6mo, 1y, 2y, 5y, 10y, ytd, max)'
          },
          region: {
            type: 'string',
            required: false,
            description: 'Region for the symbol (US, BR, AU, CA, FR, DE, HK, IN, IT, ES, GB, SG)'
          }
        }
      },
      '/market/v2/get-quotes': {
        path: '/market/v2/get-quotes',
        method: 'GET',
        params: {
          region: {
            type: 'string',
            required: true,
            description: 'Region for the symbol (US, BR, AU, CA, FR, DE, HK, IN, IT, ES, GB, SG)'
          },
          symbols: {
            type: 'string',
            required: true,
            description: 'Symbols to get quotes for, comma-separated'
          }
        }
      }
    }
  },
  binance: {
    id: 'binance',
    name: 'Binance',
    host: 'binance43.p.rapidapi.com',
    baseUrl: 'https://binance43.p.rapidapi.com',
    description: 'Access to Binance cryptocurrency exchange data',
    type: 'rapidapi',
    requires_api_key: true,
    asset_classes: ['crypto'],
    supportedMarkets: ['Global'],
    endpoints: {
      '/klines': {
        path: '/klines',
        method: 'GET',
        params: {
          symbol: {
            type: 'string',
            required: true,
            description: 'Symbol to get data for'
          },
          interval: {
            type: 'string',
            required: true,
            description: 'Time interval (1m, 3m, 5m, 15m, 30m, 1h, 2h, 4h, 6h, 8h, 12h, 1d, 3d, 1w, 1M)'
          },
          limit: {
            type: 'number',
            required: false,
            description: 'Number of candles to return'
          }
        }
      },
      '/ticker/24hr': {
        path: '/ticker/24hr',
        method: 'GET',
        params: {
          symbol: {
            type: 'string',
            required: true,
            description: 'Symbol to get data for'
          }
        }
      }
    }
  },
  coinranking: {
    id: 'coinranking',
    name: 'Coinranking',
    host: 'coinranking1.p.rapidapi.com',
    baseUrl: 'https://coinranking1.p.rapidapi.com',
    description: 'Cryptocurrency prices, markets, and data',
    type: 'rapidapi',
    requires_api_key: true,
    asset_classes: ['crypto'],
    supportedMarkets: ['Global'],
    endpoints: {
      '/coin/{uuid}/history': {
        path: '/coin/{uuid}/history',
        method: 'GET',
        params: {
          uuid: {
            type: 'string',
            required: true,
            description: 'UUID of the coin'
          },
          timePeriod: {
            type: 'string',
            required: false,
            description: 'Time period (24h, 7d, 30d, 3m, 1y, 3y, 5y)'
          }
        }
      },
      '/coin/{uuid}': {
        path: '/coin/{uuid}',
        method: 'GET',
        params: {
          uuid: {
            type: 'string',
            required: true,
            description: 'UUID of the coin'
          }
        }
      }
    }
  }
};

// RapidAPI Service Class
class RapidAPIService {
  private apiKey: string;
  private clients: Map<string, AxiosInstance> = new Map();
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.initializeClients();
  }
  
  /**
   * Initialize Axios clients for each provider
   */
  private initializeClients(): void {
    for (const [providerId, provider] of Object.entries(RAPIDAPI_PROVIDERS)) {
      const client = axios.create({
        baseURL: provider.baseUrl,
        headers: {
          'X-RapidAPI-Key': this.apiKey,
          'X-RapidAPI-Host': provider.host
        }
      });
      
      this.clients.set(providerId, client);
    }
  }
  
  /**
   * Make a request to a RapidAPI endpoint
   * @param providerId Provider ID (e.g., 'twelve_data', 'binance')
   * @param endpoint Endpoint path (e.g., '/time_series', '/klines')
   * @param params Request parameters
   * @param options Additional Axios request options
   * @returns Promise with the response data
   */
  async makeRequest(
    providerId: string,
    endpoint: string,
    params: Record<string, any>,
    options: AxiosRequestConfig = {}
  ): Promise<any> {
    // Check if we have a client for this provider
    if (!this.clients.has(providerId)) {
      throw new Error(`Unknown RapidAPI provider: ${providerId}`);
    }
    
    // Check if the provider supports this endpoint
    const provider = RAPIDAPI_PROVIDERS[providerId];
    const endpointConfig = provider.endpoints[endpoint];
    
    if (!endpointConfig) {
      throw new Error(`Unknown endpoint '${endpoint}' for provider ${provider.name}`);
    }
    
    // Validate required parameters
    for (const [paramName, paramConfig] of Object.entries(endpointConfig.params)) {
      if (paramConfig.required && !params[paramName]) {
        throw new Error(`Missing required parameter '${paramName}' for endpoint ${endpoint}`);
      }
    }
    
    // Get the client and make the request
    const client = this.clients.get(providerId);
    const method = endpointConfig.method.toLowerCase();
    
    try {
      const fullEndpoint = endpointConfig.path || endpoint;
      let response;
      
      if (method === 'get') {
        response = await client!.get(fullEndpoint, { ...options, params });
      } else if (method === 'post') {
        response = await client!.post(fullEndpoint, params, options);
      } else {
        throw new Error(`Unsupported HTTP method: ${method}`);
      }
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // Server responded with a non-2xx status
        console.error(`RapidAPI error (${provider.name}):`, error.response.status, error.response.data);
        throw new Error(`RapidAPI error (${provider.name}): ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // Request was made but no response was received
        console.error(`RapidAPI no response (${provider.name}):`, error.message);
        throw new Error(`RapidAPI no response (${provider.name}): ${error.message}`);
      } else {
        // Something else went wrong
        console.error(`RapidAPI request error (${provider.name}):`, error.message);
        throw error;
      }
    }
  }
  
  /**
   * Get the list of supported providers
   * @returns Array of provider info objects
   */
  getProviders(): any[] {
    return Object.values(RAPIDAPI_PROVIDERS).map(provider => ({
      id: provider.id,
      name: provider.name,
      description: provider.description,
      type: provider.type,
      requires_api_key: provider.requires_api_key,
      asset_classes: provider.asset_classes,
      supportedMarkets: provider.supportedMarkets
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
  if (!rapidApiServiceInstance || !apiKey) {
    rapidApiServiceInstance = new RapidAPIService(apiKey);
  }
  
  return rapidApiServiceInstance;
}

/**
 * Reset the RapidAPI service instance
 */
export function resetRapidAPIService(): void {
  rapidApiServiceInstance = null;
}