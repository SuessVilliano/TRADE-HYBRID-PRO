import axios from 'axios';
import { generateId } from '../utils';

// Define base URLs for Oanda
const OANDA_PRACTICE_URL = 'https://api-fxpractice.oanda.com';
const OANDA_LIVE_URL = 'https://api-fxtrade.oanda.com';

// Interface for Oanda credentials
interface OandaCredentials {
  userId: string;
  apiToken: string;
  accountId: string;
  isPractice: boolean;
  label: string;
  isDefault: boolean;
  createdAt: Date;
}

// In-memory store for user credentials (would be in DB in production)
const userCredentials = new Map<string, OandaCredentials[]>();

/**
 * Save a user's Oanda API credentials
 */
export const saveOandaCredentials = (
  userId: string,
  apiToken: string,
  accountId: string,
  isPractice: boolean = true,
  label: string = 'Default',
  isDefault: boolean = true
): OandaCredentials => {
  if (!userCredentials.has(userId)) {
    userCredentials.set(userId, []);
  }
  
  // If setting as default, unset any other defaults
  if (isDefault) {
    const userCreds = userCredentials.get(userId) || [];
    userCreds.forEach(cred => {
      cred.isDefault = false;
    });
  }
  
  const credentials: OandaCredentials = {
    userId,
    apiToken,
    accountId,
    isPractice,
    label,
    isDefault,
    createdAt: new Date()
  };
  
  userCredentials.get(userId)?.push(credentials);
  
  return credentials;
};

/**
 * Get a user's default Oanda credentials
 */
export const getDefaultOandaCredentials = (userId: string): OandaCredentials | null => {
  const userCreds = userCredentials.get(userId);
  if (!userCreds || userCreds.length === 0) {
    return null;
  }
  
  // Find default credentials or use first set
  return userCreds.find(cred => cred.isDefault) || userCreds[0];
};

/**
 * Create Oanda API client with proper headers
 */
const createOandaClient = (apiToken: string, isPractice: boolean = true) => {
  const baseURL = isPractice ? OANDA_PRACTICE_URL : OANDA_LIVE_URL;
  
  return axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept-Datetime-Format': 'RFC3339'
    }
  });
};

/**
 * Test connection to Oanda API with provided credentials
 */
export const testOandaConnection = async (
  apiToken: string,
  accountId: string,
  isPractice: boolean = true
): Promise<boolean> => {
  try {
    const client = createOandaClient(apiToken, isPractice);
    const response = await client.get(`/v3/accounts/${accountId}`);
    return response.status === 200;
  } catch (error) {
    console.error('Error testing Oanda connection:', error);
    return false;
  }
};

/**
 * Execute a trade through Oanda
 */
export const executeOandaTrade = async (
  instrument: string,
  units: number, // Positive for buy, negative for sell
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'MARKET_IF_TOUCHED' = 'MARKET',
  price?: number,
  takeProfitPrice?: number,
  stopLossPrice?: number,
  trailingStopDistance?: number,
  timeInForce: 'GTC' | 'GTD' | 'GFD' | 'FOK' | 'IOC' = 'GTC',
  clientId?: string,
  userId?: string
) => {
  try {
    // Get user credentials if provided
    let apiToken: string;
    let accountId: string;
    let isPractice: boolean;
    
    if (userId) {
      const userCreds = getDefaultOandaCredentials(userId);
      if (!userCreds) {
        throw new Error('No Oanda credentials found for user');
      }
      apiToken = userCreds.apiToken;
      accountId = userCreds.accountId;
      isPractice = userCreds.isPractice;
    } else {
      // Fall back to environment variables
      apiToken = process.env.OANDA_API_TOKEN || '';
      accountId = process.env.OANDA_ACCOUNT_ID || '';
      isPractice = process.env.OANDA_USE_PRACTICE === 'true';
      
      if (!apiToken || !accountId) {
        throw new Error('Oanda API credentials not configured');
      }
    }
    
    const client = createOandaClient(apiToken, isPractice);
    
    // Prepare the order payload
    const orderPayload: any = {
      order: {
        type: orderType,
        instrument,
        units: units.toString(),
        timeInForce,
        positionFill: 'DEFAULT',
        clientExtensions: {
          id: clientId || generateId()
        }
      }
    };
    
    // Add price for non-MARKET orders
    if (price && orderType !== 'MARKET') {
      orderPayload.order.price = price.toString();
    }
    
    // Add take profit if specified
    if (takeProfitPrice) {
      orderPayload.order.takeProfitOnFill = {
        price: takeProfitPrice.toString()
      };
    }
    
    // Add stop loss if specified
    if (stopLossPrice) {
      orderPayload.order.stopLossOnFill = {
        price: stopLossPrice.toString()
      };
    }
    
    // Add trailing stop if specified
    if (trailingStopDistance) {
      orderPayload.order.trailingStopLossOnFill = {
        distance: trailingStopDistance.toString()
      };
    }
    
    // Submit the order
    const response = await client.post(`/v3/accounts/${accountId}/orders`, orderPayload);
    
    return response.data;
  } catch (error: any) {
    console.error('Error executing Oanda trade:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get account info from Oanda
 */
export const getAccountInfo = async (userId?: string) => {
  try {
    // Get user credentials if provided
    let apiToken: string;
    let accountId: string;
    let isPractice: boolean;
    
    if (userId) {
      const userCreds = getDefaultOandaCredentials(userId);
      if (!userCreds) {
        throw new Error('No Oanda credentials found for user');
      }
      apiToken = userCreds.apiToken;
      accountId = userCreds.accountId;
      isPractice = userCreds.isPractice;
    } else {
      // Fall back to environment variables
      apiToken = process.env.OANDA_API_TOKEN || '';
      accountId = process.env.OANDA_ACCOUNT_ID || '';
      isPractice = process.env.OANDA_USE_PRACTICE === 'true';
      
      if (!apiToken || !accountId) {
        throw new Error('Oanda API credentials not configured');
      }
    }
    
    const client = createOandaClient(apiToken, isPractice);
    const response = await client.get(`/v3/accounts/${accountId}`);
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting Oanda account info:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get open positions from Oanda
 */
export const getPositions = async (userId?: string) => {
  try {
    // Get user credentials if provided
    let apiToken: string;
    let accountId: string;
    let isPractice: boolean;
    
    if (userId) {
      const userCreds = getDefaultOandaCredentials(userId);
      if (!userCreds) {
        throw new Error('No Oanda credentials found for user');
      }
      apiToken = userCreds.apiToken;
      accountId = userCreds.accountId;
      isPractice = userCreds.isPractice;
    } else {
      // Fall back to environment variables
      apiToken = process.env.OANDA_API_TOKEN || '';
      accountId = process.env.OANDA_ACCOUNT_ID || '';
      isPractice = process.env.OANDA_USE_PRACTICE === 'true';
      
      if (!apiToken || !accountId) {
        throw new Error('Oanda API credentials not configured');
      }
    }
    
    const client = createOandaClient(apiToken, isPractice);
    const response = await client.get(`/v3/accounts/${accountId}/openPositions`);
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting Oanda positions:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Close a specific position in Oanda
 */
export const closePosition = async (instrument: string, userId?: string) => {
  try {
    // Get user credentials if provided
    let apiToken: string;
    let accountId: string;
    let isPractice: boolean;
    
    if (userId) {
      const userCreds = getDefaultOandaCredentials(userId);
      if (!userCreds) {
        throw new Error('No Oanda credentials found for user');
      }
      apiToken = userCreds.apiToken;
      accountId = userCreds.accountId;
      isPractice = userCreds.isPractice;
    } else {
      // Fall back to environment variables
      apiToken = process.env.OANDA_API_TOKEN || '';
      accountId = process.env.OANDA_ACCOUNT_ID || '';
      isPractice = process.env.OANDA_USE_PRACTICE === 'true';
      
      if (!apiToken || !accountId) {
        throw new Error('Oanda API credentials not configured');
      }
    }
    
    const client = createOandaClient(apiToken, isPractice);
    const response = await client.put(`/v3/accounts/${accountId}/positions/${instrument}/close`, {
      longUnits: 'ALL',
      shortUnits: 'ALL'
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error closing Oanda position:', error.response?.data || error.message);
    throw error;
  }
};