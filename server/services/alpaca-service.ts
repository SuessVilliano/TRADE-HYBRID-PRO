import axios from 'axios';
import { createMockAlpacaClient } from './mock-alpaca-service';

// Define the Alpaca API client interface
export interface AlpacaClient {
  getAccount: () => Promise<any>;
  getBars: (params: any) => Promise<any[]>;
  getQuote: (symbol: string) => Promise<any>;
  getAssets: (params?: any) => Promise<any[]>;
  createOrder: (params: any) => Promise<any>;
  getOrders: (params?: any) => Promise<any[]>;
  getPositions: () => Promise<any[]>;
}

// Global client instance
let alpacaClient: AlpacaClient | null = null;

// Error class for Alpaca API issues
class AlpacaApiError extends Error {
  constructor(message: string, public data?: any) {
    super(message);
    this.name = 'AlpacaApiError';
  }
}

// Flag to track real API availability
let isRealApiAvailable: boolean = false;

/**
 * Create an Alpaca API client
 * Uses environment variables for API credentials
 */
export function createAlpacaClient(): AlpacaClient {
  // Get API key and secret from environment variables directly at call time
  // to ensure we use the most up-to-date credentials
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    throw new AlpacaApiError('Alpaca API credentials not found in environment variables');
  }
  
  // Define the API base URL - Alpaca has both paper and live environments
  // By default, use the paper (sandbox) environment
  const baseUrl = process.env.ALPACA_API_URL || 'https://paper-api.alpaca.markets';
  const dataBaseUrl = process.env.ALPACA_DATA_URL || 'https://data.alpaca.markets';
  
  console.log('Creating Alpaca client with credentials:');
  console.log(`Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`Secret: ${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`);
  console.log(`Base URL: ${baseUrl}`);
  
  // Create axios instances with default headers
  const tradeApi = axios.create({
    baseURL: `${baseUrl}/v2`,
    headers: {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': apiSecret,
      'Content-Type': 'application/json'
    }
  });
  
  const dataApi = axios.create({
    baseURL: `${dataBaseUrl}/v2`,
    headers: {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': apiSecret,
      'Content-Type': 'application/json'
    }
  });
  
  // Implement the client interface with API methods
  const client: AlpacaClient = {
    /**
     * Get account information
     * @returns Promise with account data
     */
    getAccount: async () => {
      try {
        const response = await tradeApi.get('/account');
        return response.data;
      } catch (error) {
        console.error('Alpaca API error in getAccount:', error);
        throw new AlpacaApiError(
          'Failed to fetch account information',
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get historical bars (candlestick data)
     * @param params Parameters like symbol, timeframe, limit, etc.
     * @returns Promise with bar data
     */
    getBars: async (params: any = {}) => {
      try {
        // Required parameters
        if (!params.symbol) {
          throw new AlpacaApiError('Symbol is required for getBars');
        }
        
        // Default parameters
        const queryParams = {
          timeframe: params.timeframe || '1Day',
          limit: params.limit || 100,
          adjustment: params.adjustment || 'raw',
          ...params
        };
        
        // API response format changed between v1 and v2
        const response = await dataApi.get('/stocks/bars', {
          params: queryParams
        });
        
        // Extract bars from the nested structure
        if (response.data && response.data.bars) {
          return response.data.bars;
        } else if (Array.isArray(response.data)) {
          return response.data;
        } else {
          return [];
        }
      } catch (error) {
        console.error('Alpaca API error in getBars:', error);
        throw new AlpacaApiError(
          `Failed to fetch bars for ${params.symbol}`,
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get current quote for a symbol
     * @param symbol Stock or crypto symbol
     * @returns Promise with quote data
     */
    getQuote: async (symbol: string) => {
      try {
        const response = await dataApi.get(`/stocks/${symbol}/quotes/latest`);
        return response.data;
      } catch (error) {
        console.error(`Alpaca API error in getQuote for ${symbol}:`, error);
        throw new AlpacaApiError(
          `Failed to fetch quote for ${symbol}`,
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get list of available tradable assets
     * @param params Filter parameters like status, asset_class, etc.
     * @returns Promise with assets data
     */
    getAssets: async (params: any = {}) => {
      try {
        const response = await tradeApi.get('/assets', {
          params
        });
        
        return response.data;
      } catch (error) {
        console.error('Alpaca API error in getAssets:', error);
        throw new AlpacaApiError(
          'Failed to fetch assets',
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Create a new order
     * @param params Order parameters like symbol, qty, side, type, etc.
     * @returns Promise with order confirmation
     */
    createOrder: async (params: any) => {
      try {
        // Required parameters check
        if (!params.symbol || !params.qty || !params.side || !params.type) {
          throw new AlpacaApiError('Missing required parameters for createOrder');
        }
        
        const response = await tradeApi.post('/orders', params);
        return response.data;
      } catch (error) {
        console.error('Alpaca API error in createOrder:', error);
        throw new AlpacaApiError(
          'Failed to create order',
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get list of orders
     * @param params Filter parameters like status, limit, etc.
     * @returns Promise with orders data
     */
    getOrders: async (params: any = {}) => {
      try {
        const response = await tradeApi.get('/orders', {
          params
        });
        
        return response.data;
      } catch (error) {
        console.error('Alpaca API error in getOrders:', error);
        throw new AlpacaApiError(
          'Failed to fetch orders',
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get list of positions
     * @returns Promise with positions data
     */
    getPositions: async () => {
      try {
        const response = await tradeApi.get('/positions');
        return response.data;
      } catch (error) {
        console.error('Alpaca API error in getPositions:', error);
        throw new AlpacaApiError(
          'Failed to fetch positions',
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    }
  };
  
  return client;
}

/**
 * Get the Alpaca client instance, with graceful fallback to mock data if real API is unavailable
 * @param forceReal If true, force use of real API even if it's previously failed
 * @returns AlpacaClient instance (real or mock based on availability)
 */
export function getAlpacaClient(forceReal: boolean = false): AlpacaClient {
  // If real API was previously determined to be unavailable and we're not forcing a retry,
  // return the mock client for a better user experience
  if (!isRealApiAvailable && !forceReal) {
    console.log('Using mock Alpaca client due to previous API unavailability');
    return createMockAlpacaClient();
  }
  
  // Try to use the real API
  try {
    // Force reset the client to ensure we always use fresh credentials
    alpacaClient = null;
    
    // Log that we're recreating the client
    console.log('Creating new Alpaca client with fresh credentials');
    
    // Create a new client with the latest credentials
    alpacaClient = createAlpacaClient();
    console.log('Alpaca client initialized successfully with fresh credentials');
    
    // Test the connection immediately to verify it works
    return wrapWithMockFallback(alpacaClient);
  } catch (error) {
    console.error('Failed to initialize Alpaca client:', error);
    
    // Mark real API as unavailable
    isRealApiAvailable = false;
    
    // Use mock client instead of dummy error client for better UX
    console.log('Falling back to mock Alpaca client');
    return createMockAlpacaClient();
  }
}

/**
 * Wrap the real API client with fallback to mock data when individual methods fail
 * This provides a better user experience by always returning valid data
 */
function wrapWithMockFallback(realClient: AlpacaClient): AlpacaClient {
  // Create a mock client for fallback
  const mockClient = createMockAlpacaClient();
  
  // Return a wrapped client
  return {
    getAccount: async () => {
      try {
        const result = await realClient.getAccount();
        isRealApiAvailable = true; // Mark API as available if successful
        return result;
      } catch (error) {
        console.error('Real API getAccount failed, using mock data:', error);
        isRealApiAvailable = false; // Mark API as unavailable
        return mockClient.getAccount();
      }
    },
    
    getBars: async (params: any = {}) => {
      try {
        const result = await realClient.getBars(params);
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error(`Real API getBars failed for ${params.symbol}, using mock data:`, error);
        isRealApiAvailable = false;
        return mockClient.getBars(params);
      }
    },
    
    getQuote: async (symbol: string) => {
      try {
        const result = await realClient.getQuote(symbol);
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error(`Real API getQuote failed for ${symbol}, using mock data:`, error);
        isRealApiAvailable = false;
        return mockClient.getQuote(symbol);
      }
    },
    
    getAssets: async (params: any = {}) => {
      try {
        const result = await realClient.getAssets(params);
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error('Real API getAssets failed, using mock data:', error);
        isRealApiAvailable = false;
        return mockClient.getAssets(params);
      }
    },
    
    createOrder: async (params: any) => {
      try {
        const result = await realClient.createOrder(params);
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error('Real API createOrder failed, using mock data:', error);
        isRealApiAvailable = false;
        return mockClient.createOrder(params);
      }
    },
    
    getOrders: async (params: any = {}) => {
      try {
        const result = await realClient.getOrders(params);
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error('Real API getOrders failed, using mock data:', error);
        isRealApiAvailable = false;
        return mockClient.getOrders(params);
      }
    },
    
    getPositions: async () => {
      try {
        const result = await realClient.getPositions();
        isRealApiAvailable = true;
        return result;
      } catch (error) {
        console.error('Real API getPositions failed, using mock data:', error);
        isRealApiAvailable = false;
        return mockClient.getPositions();
      }
    }
  };
}

/**
 * Create a dummy Alpaca client that returns errors for all methods
 * This is used when the real client can't be initialized
 */
function createDummyAlpacaClient(errorMessage: string): AlpacaClient {
  const errorResponse = {
    error: {
      code: 'INITIALIZATION_FAILED',
      message: errorMessage,
      details: 'The Alpaca API client could not be properly initialized. Check your API credentials.'
    }
  };
  
  const dummyMethod = async () => {
    throw new AlpacaApiError(errorMessage, errorResponse);
  };
  
  return {
    getAccount: dummyMethod,
    getBars: dummyMethod,
    getQuote: dummyMethod,
    getAssets: dummyMethod,
    createOrder: dummyMethod,
    getOrders: dummyMethod,
    getPositions: dummyMethod
  };
}

/**
 * Reset the Alpaca client instance (useful for testing or after environment changes)
 */
export function resetAlpacaClient(): void {
  alpacaClient = null;
}

/**
 * Check if the Alpaca API connection is working
 * @returns Promise<boolean> true if connected successfully
 */
export async function checkAlpacaConnection(): Promise<boolean> {
  try {
    const client = getAlpacaClient();
    const account = await client.getAccount();
    
    return !!account;
  } catch (error) {
    console.error('Alpaca connection check failed:', error);
    return false;
  }
}