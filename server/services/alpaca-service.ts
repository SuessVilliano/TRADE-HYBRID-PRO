import axios from 'axios';

// Define the Alpaca API client interface
interface AlpacaClient {
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

/**
 * Create an Alpaca API client
 * Uses environment variables for API credentials
 */
export function createAlpacaClient(): AlpacaClient {
  // Get API key and secret from environment variables
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
 * Get the Alpaca client instance, creating it if necessary
 * @returns AlpacaClient instance
 */
export function getAlpacaClient(): AlpacaClient {
  if (!alpacaClient) {
    try {
      const apiKey = process.env.ALPACA_API_KEY;
      const apiSecret = process.env.ALPACA_API_SECRET;
      
      if (!apiKey || !apiSecret) {
        console.warn('Alpaca API credentials not found in environment variables');
        throw new AlpacaApiError('Alpaca API credentials not found in environment variables');
      }
      
      // Log partial credentials for debugging (only first 4 chars)
      const keyPreview = apiKey.substring(0, 4) + '...';
      const secretPreview = apiSecret.substring(0, 4) + '...';
      console.log(`Initializing Alpaca client with key: ${keyPreview}, secret: ${secretPreview}`);
      
      alpacaClient = createAlpacaClient();
      console.log('Alpaca client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Alpaca client:', error);
      
      // Create a dummy client that returns appropriate errors
      alpacaClient = createDummyAlpacaClient(String(error));
      
      // Don't throw the error as this would crash the server
      // Instead, the dummy client will return errors when methods are called
    }
  }
  
  return alpacaClient;
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