import axios from 'axios';

// Define the Oanda API client interface
interface OandaClient {
  getCandles: (instrument: string, params: any) => Promise<any>;
  getPricing: (instruments: string) => Promise<any>;
  getInstruments: () => Promise<any>;
  getAccounts: () => Promise<any>;
  getAccountSummary: (accountId: string) => Promise<any>;
  placeOrder: (accountId: string, order: any) => Promise<any>;
}

// Global client instance
let oandaClient: OandaClient | null = null;

// Error class for Oanda API issues
class OandaApiError extends Error {
  constructor(message: string, public data?: any) {
    super(message);
    this.name = 'OandaApiError';
  }
}

/**
 * Create an Oanda API client
 * Uses environment variables for API credentials
 */
export function createOandaClient(): OandaClient {
  // Get API token from environment variables
  const apiToken = process.env.OANDA_API_TOKEN;
  
  if (!apiToken) {
    throw new OandaApiError('Oanda API token not found in environment variables');
  }
  
  // Define the API base URL - Oanda has both practice and live environments
  // By default, use the practice environment
  const apiUrl = process.env.OANDA_API_URL || 'https://api-fxpractice.oanda.com';
  const apiVersion = 'v3';
  
  // Account ID for Oanda API calls that require it
  // This is fetched later using the getAccounts method if needed
  let accountId = process.env.OANDA_ACCOUNT_ID || '';
  
  // Create an axios instance with default headers
  const api = axios.create({
    baseURL: `${apiUrl}/${apiVersion}`,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  });
  
  // Implement the client interface with API methods
  const client: OandaClient = {
    /**
     * Get candlestick data for an instrument
     * @param instrument Forex pair in format EUR_USD
     * @param params Query parameters like granularity, count, etc.
     * @returns Promise with candle data
     */
    getCandles: async (instrument: string, params: any = {}) => {
      try {
        const response = await api.get(`/instruments/${instrument}/candles`, {
          params: {
            price: 'M', // 'M' for midpoint price (average of bid/ask)
            ...params
          }
        });
        
        return response.data;
      } catch (error) {
        console.error('Oanda API error in getCandles:', error);
        throw new OandaApiError(
          `Failed to fetch candles for ${instrument}`, 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get current pricing for an instrument
     * @param instruments Comma-separated list of instruments (e.g., "EUR_USD,GBP_USD")
     * @returns Promise with pricing data
     */
    getPricing: async (instruments: string) => {
      try {
        // If no account ID is set, fetch the accounts first
        if (!accountId) {
          const accounts = await client.getAccounts();
          if (accounts && accounts.accounts && accounts.accounts.length > 0) {
            accountId = accounts.accounts[0].id;
            console.log(`Using Oanda account ID: ${accountId}`);
          }
        }
        
        if (!accountId) {
          throw new OandaApiError('No Oanda account ID available');
        }
        
        const response = await api.get(`/accounts/${accountId}/pricing`, {
          params: {
            instruments
          }
        });
        
        return response.data;
      } catch (error) {
        console.error('Oanda API error in getPricing:', error);
        throw new OandaApiError(
          `Failed to fetch pricing for ${instruments}`, 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get list of available instruments (forex pairs)
     * @returns Promise with instruments data
     */
    getInstruments: async () => {
      try {
        // If no account ID is set, fetch the accounts first
        if (!accountId) {
          const accounts = await client.getAccounts();
          if (accounts && accounts.accounts && accounts.accounts.length > 0) {
            accountId = accounts.accounts[0].id;
            console.log(`Using Oanda account ID: ${accountId}`);
          }
        }
        
        if (!accountId) {
          throw new OandaApiError('No Oanda account ID available');
        }
        
        const response = await api.get(`/accounts/${accountId}/instruments`);
        return response.data;
      } catch (error) {
        console.error('Oanda API error in getInstruments:', error);
        throw new OandaApiError(
          'Failed to fetch instruments', 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get list of accounts
     * @returns Promise with accounts data
     */
    getAccounts: async () => {
      try {
        const response = await api.get('/accounts');
        return response.data;
      } catch (error) {
        console.error('Oanda API error in getAccounts:', error);
        throw new OandaApiError(
          'Failed to fetch accounts', 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Get account summary
     * @param accountId Account ID
     * @returns Promise with account summary data
     */
    getAccountSummary: async (accountId: string) => {
      try {
        const response = await api.get(`/accounts/${accountId}/summary`);
        return response.data;
      } catch (error) {
        console.error(`Oanda API error in getAccountSummary for account ${accountId}:`, error);
        throw new OandaApiError(
          `Failed to fetch account summary for ${accountId}`, 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    },
    
    /**
     * Place a trade order
     * @param accountId Account ID
     * @param order Order object with instrument, units, etc.
     * @returns Promise with order confirmation
     */
    placeOrder: async (accountId: string, order: any) => {
      try {
        const response = await api.post(`/accounts/${accountId}/orders`, {
          order
        });
        
        return response.data;
      } catch (error) {
        console.error('Oanda API error in placeOrder:', error);
        throw new OandaApiError(
          'Failed to place order', 
          axios.isAxiosError(error) ? error.response?.data : error
        );
      }
    }
  };
  
  return client;
}

/**
 * Get the Oanda client instance, creating it if necessary
 * @returns OandaClient instance
 */
export function getOandaClient(): OandaClient {
  if (!oandaClient) {
    try {
      oandaClient = createOandaClient();
      console.log('Oanda client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Oanda client:', error);
      throw error;
    }
  }
  
  return oandaClient;
}

/**
 * Reset the Oanda client instance (useful for testing or after environment changes)
 */
export function resetOandaClient(): void {
  oandaClient = null;
}

/**
 * Check if the Oanda API connection is working
 * @returns Promise<boolean> true if connected successfully
 */
export async function checkOandaConnection(): Promise<boolean> {
  try {
    const client = getOandaClient();
    const accounts = await client.getAccounts();
    
    return !!(accounts && accounts.accounts && accounts.accounts.length > 0);
  } catch (error) {
    console.error('Oanda connection check failed:', error);
    return false;
  }
}