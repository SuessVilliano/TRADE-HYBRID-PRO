/**
 * RapidAPI Service for Trade Hybrid platform
 * 
 * This service handles interactions with RapidAPI and provides
 * normalized access to financial data from multiple providers
 */

import axios from 'axios';
import { sleep } from '../utils';

// Provider configuration for RapidAPI
export const RAPIDAPI_PROVIDERS: Record<string, { 
  host: string;
  endpoints: Record<string, { 
    path: string; 
    method: string;
    params: Record<string, { 
      type: string; 
      required: boolean;
      description: string;
    }>;
  }>;
}> = {
  // Twelve Data provider
  twelve_data: {
    host: 'twelve-data1.p.rapidapi.com',
    endpoints: {
      // Time series endpoint for historical candle data
      '/time_series': {
        path: '/time_series',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' },
          interval: { type: 'string', required: true, description: 'Time interval' },
          outputsize: { type: 'number', required: false, description: 'Number of candles to return' },
          format: { type: 'string', required: false, description: 'Response format' }
        }
      },
      // Quote endpoint for current price information
      '/quote': {
        path: '/quote',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' },
          interval: { type: 'string', required: false, description: 'Time interval' }
        }
      },
      // Symbol search endpoint
      '/symbol_search': {
        path: '/symbol_search',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to search for' },
          outputsize: { type: 'number', required: false, description: 'Number of results to return' }
        }
      }
    }
  },
  // Binance provider
  binance: {
    host: 'binance43.p.rapidapi.com',
    endpoints: {
      // Klines (candles) endpoint
      '/klines': {
        path: '/klines',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' },
          interval: { type: 'string', required: true, description: 'Time interval' },
          limit: { type: 'number', required: false, description: 'Number of candles to return' }
        }
      },
      // 24hr ticker endpoint for current price information
      '/ticker/24hr': {
        path: '/ticker/24hr',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' }
        }
      },
      // Exchange information endpoint
      '/exchangeInfo': {
        path: '/exchangeInfo',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: false, description: 'Symbol to get info for' }
        }
      }
    }
  },
  // Alpha Vantage provider
  alpha_vantage: {
    host: 'alpha-vantage.p.rapidapi.com',
    endpoints: {
      // Query endpoint for all Alpha Vantage data
      '/query': {
        path: '/query',
        method: 'GET',
        params: {
          function: { type: 'string', required: true, description: 'Function to call' },
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' },
          interval: { type: 'string', required: false, description: 'Time interval' },
          outputsize: { type: 'string', required: false, description: 'Size of data to return' }
        }
      }
    }
  },
  // Yahoo Finance provider
  yh_finance: {
    host: 'apidojo-yahoo-finance-v1.p.rapidapi.com',
    endpoints: {
      // Market history endpoint for historical data
      '/stock/v3/get-historical-data': {
        path: '/stock/v3/get-historical-data',
        method: 'GET',
        params: {
          symbol: { type: 'string', required: true, description: 'Symbol to get data for' },
          region: { type: 'string', required: false, description: 'Region code' }
        }
      },
      // Quote endpoint for current price information
      '/market/v2/get-quotes': {
        path: '/market/v2/get-quotes',
        method: 'GET',
        params: {
          symbols: { type: 'string', required: true, description: 'Symbols to get data for' },
          region: { type: 'string', required: false, description: 'Region code' }
        }
      },
      // Search endpoint
      '/auto-complete': {
        path: '/auto-complete',
        method: 'GET',
        params: {
          query: { type: 'string', required: true, description: 'Search query' },
          region: { type: 'string', required: false, description: 'Region code' }
        }
      }
    }
  }
};

// Rate limits (to be safe)
const RATE_LIMITS: Record<string, number> = {
  twelve_data: 1000, // 1 request per second
  binance: 500,      // 2 requests per second
  alpha_vantage: 1000, // 1 request per second
  yh_finance: 500    // 2 requests per second
};

/**
 * RapidAPI Service class
 */
class RapidAPIService {
  private apiKey: string;
  private lastRequestTime: Record<string, number> = {};
  
  constructor(apiKey: string) {
    this.apiKey = apiKey;
    
    // Initialize last request time for each provider
    Object.keys(RAPIDAPI_PROVIDERS).forEach(provider => {
      this.lastRequestTime[provider] = 0;
    });
  }
  
  /**
   * Get available providers
   */
  getProviders(): string[] {
    return Object.keys(RAPIDAPI_PROVIDERS);
  }
  
  /**
   * Get provider information
   */
  getProviderInfo(provider: string): any {
    return RAPIDAPI_PROVIDERS[provider];
  }
  
  /**
   * Check if a provider is supported
   */
  isProviderSupported(provider: string): boolean {
    return !!RAPIDAPI_PROVIDERS[provider];
  }
  
  /**
   * Apply rate limiting for a provider
   */
  private async applyRateLimit(provider: string): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime[provider];
    const rateLimit = RATE_LIMITS[provider] || 1000; // Default to 1 request per second
    
    if (timeSinceLastRequest < rateLimit && this.lastRequestTime[provider] > 0) {
      const waitTime = rateLimit - timeSinceLastRequest;
      console.log(`Rate limiting ${provider} API - waiting ${waitTime}ms`);
      await sleep(waitTime);
    }
    
    this.lastRequestTime[provider] = Date.now();
  }
  
  /**
   * Make a request to a RapidAPI provider
   */
  async makeRequest(
    provider: string, 
    endpoint: string, 
    params: Record<string, any> = {}
  ): Promise<any> {
    // Check if provider is supported
    if (!this.isProviderSupported(provider)) {
      throw new Error(`Unsupported RapidAPI provider: ${provider}`);
    }
    
    // Check if endpoint is supported
    const providerConfig = RAPIDAPI_PROVIDERS[provider];
    
    if (!providerConfig.endpoints[endpoint]) {
      throw new Error(`Unsupported endpoint ${endpoint} for provider ${provider}`);
    }
    
    // Apply rate limiting
    await this.applyRateLimit(provider);
    
    // Build request
    const endpointConfig = providerConfig.endpoints[endpoint];
    const url = `https://${providerConfig.host}${endpointConfig.path}`;
    
    const headers = {
      'X-RapidAPI-Key': this.apiKey,
      'X-RapidAPI-Host': providerConfig.host
    };
    
    // Make request
    try {
      const response = await axios.request({
        method: endpointConfig.method,
        url,
        params,
        headers
      });
      
      return response.data;
    } catch (error: any) {
      console.error(`Error making request to ${provider} ${endpoint}:`, error.response?.status, error.response?.data || error.message);
      throw error;
    }
  }
}

// Service instance cache
let serviceInstance: RapidAPIService | null = null;

/**
 * Get RapidAPI service instance
 */
export function getRapidAPIService(apiKey?: string): RapidAPIService {
  if (!serviceInstance || apiKey) {
    const key = apiKey || process.env.RAPIDAPI_KEY || '';
    
    if (!key) {
      throw new Error('RapidAPI key is required');
    }
    
    serviceInstance = new RapidAPIService(key);
  }
  
  return serviceInstance;
}

/**
 * Reset the RapidAPI service instance
 */
export function resetRapidAPIService(): void {
  serviceInstance = null;
}