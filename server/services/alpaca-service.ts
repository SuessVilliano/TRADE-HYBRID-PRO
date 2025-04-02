import axios from 'axios';
import { generateId } from '../utils';

// Environment variables for Alpaca API credentials
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;
const ALPACA_BASE_URL = 'https://paper-api.alpaca.markets'; // Use paper trading by default

// Store user API keys for multi-user support
interface AlpacaCredentials {
  userId: string;
  apiKey: string;
  apiSecret: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
}

// In-memory store for user credentials (would be in DB in production)
const userCredentials = new Map<string, AlpacaCredentials[]>();

/**
 * Save a user's Alpaca API credentials
 */
export const saveAlpacaCredentials = (
  userId: string, 
  apiKey: string, 
  apiSecret: string,
  label: string = 'Default',
  isDefault: boolean = true
): AlpacaCredentials => {
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
  
  const credentials: AlpacaCredentials = {
    userId,
    apiKey,
    apiSecret,
    label,
    isDefault,
    createdAt: new Date()
  };
  
  userCredentials.get(userId)?.push(credentials);
  
  return credentials;
};

/**
 * Get a user's default Alpaca credentials
 */
export const getDefaultAlpacaCredentials = (userId: string): AlpacaCredentials | null => {
  const userCreds = userCredentials.get(userId);
  if (!userCreds || userCreds.length === 0) {
    return null;
  }
  
  // Find default credentials or use first set
  return userCreds.find(cred => cred.isDefault) || userCreds[0];
};

/**
 * Create Alpaca API instance with proper headers
 */
const createAlpacaClient = (apiKey?: string, apiSecret?: string) => {
  const key = apiKey || ALPACA_API_KEY;
  const secret = apiSecret || ALPACA_API_SECRET;
  
  if (!key || !secret) {
    throw new Error('Alpaca API credentials not configured');
  }
  
  return axios.create({
    baseURL: ALPACA_BASE_URL,
    headers: {
      'APCA-API-KEY-ID': key,
      'APCA-API-SECRET-KEY': secret,
      'Content-Type': 'application/json'
    }
  });
};

/**
 * Test connection to Alpaca API with provided credentials
 */
export const testAlpacaConnection = async (apiKey?: string, apiSecret?: string): Promise<boolean> => {
  try {
    const client = createAlpacaClient(apiKey, apiSecret);
    const response = await client.get('/v2/account');
    return response.status === 200;
  } catch (error) {
    console.error('Error testing Alpaca connection:', error);
    return false;
  }
};

/**
 * Execute a trade through Alpaca
 */
export const executeTrade = async (
  symbol: string, 
  side: 'buy' | 'sell', 
  quantity: number, 
  orderType: string = 'market',
  limitPrice?: number,
  stopPrice?: number,
  timeInForce: string = 'day',
  clientOrderId?: string,
  takeProfitPrice?: number,
  stopLossPrice?: number,
  extendedHours: boolean = false,
  userId?: string
) => {
  try {
    let apiKey = ALPACA_API_KEY;
    let apiSecret = ALPACA_API_SECRET;
    
    // If userId is provided, try to use their credentials
    if (userId) {
      const userCreds = getDefaultAlpacaCredentials(userId);
      if (userCreds) {
        apiKey = userCreds.apiKey;
        apiSecret = userCreds.apiSecret;
      }
    }
    
    const client = createAlpacaClient(apiKey, apiSecret);
    
    // Prepare the order payload
    const orderPayload: any = {
      symbol,
      qty: quantity,
      side,
      type: orderType,
      time_in_force: timeInForce,
      extended_hours: extendedHours,
      client_order_id: clientOrderId || generateId()
    };
    
    // Add limit price if provided and order type is appropriate
    if (limitPrice && (orderType === 'limit' || orderType === 'stop_limit')) {
      orderPayload.limit_price = limitPrice;
    }
    
    // Add stop price if provided and order type is appropriate
    if (stopPrice && (orderType === 'stop' || orderType === 'stop_limit')) {
      orderPayload.stop_price = stopPrice;
    }
    
    // Submit the order
    const response = await client.post('/v2/orders', orderPayload);
    
    // If we have take profit or stop loss, create bracket orders
    if (response.status === 200 && (takeProfitPrice || stopLossPrice)) {
      const orderId = response.data.id;
      
      // Create take profit order if specified
      if (takeProfitPrice) {
        await client.post('/v2/orders', {
          symbol,
          qty: quantity,
          side: side === 'buy' ? 'sell' : 'buy', // Opposite of entry
          type: 'limit',
          time_in_force: 'gtc',
          limit_price: takeProfitPrice,
          order_class: 'oto',
          order_attributes: {
            original_order_id: orderId
          }
        });
      }
      
      // Create stop loss order if specified
      if (stopLossPrice) {
        await client.post('/v2/orders', {
          symbol,
          qty: quantity,
          side: side === 'buy' ? 'sell' : 'buy', // Opposite of entry
          type: 'stop',
          time_in_force: 'gtc',
          stop_price: stopLossPrice,
          order_class: 'oto',
          order_attributes: {
            original_order_id: orderId
          }
        });
      }
    }
    
    return response.data;
  } catch (error: any) {
    console.error('Error executing Alpaca trade:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get account info from Alpaca
 */
export const getAccountInfo = async (userId?: string) => {
  try {
    let apiKey = ALPACA_API_KEY;
    let apiSecret = ALPACA_API_SECRET;
    
    // If userId is provided, try to use their credentials
    if (userId) {
      const userCreds = getDefaultAlpacaCredentials(userId);
      if (userCreds) {
        apiKey = userCreds.apiKey;
        apiSecret = userCreds.apiSecret;
      }
    }
    
    const client = createAlpacaClient(apiKey, apiSecret);
    const response = await client.get('/v2/account');
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting Alpaca account info:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get open positions from Alpaca
 */
export const getPositions = async (userId?: string) => {
  try {
    let apiKey = ALPACA_API_KEY;
    let apiSecret = ALPACA_API_SECRET;
    
    // If userId is provided, try to use their credentials
    if (userId) {
      const userCreds = getDefaultAlpacaCredentials(userId);
      if (userCreds) {
        apiKey = userCreds.apiKey;
        apiSecret = userCreds.apiSecret;
      }
    }
    
    const client = createAlpacaClient(apiKey, apiSecret);
    const response = await client.get('/v2/positions');
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting Alpaca positions:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Close all positions with Alpaca
 */
export const closeAllPositions = async (userId?: string) => {
  try {
    let apiKey = ALPACA_API_KEY;
    let apiSecret = ALPACA_API_SECRET;
    
    // If userId is provided, try to use their credentials
    if (userId) {
      const userCreds = getDefaultAlpacaCredentials(userId);
      if (userCreds) {
        apiKey = userCreds.apiKey;
        apiSecret = userCreds.apiSecret;
      }
    }
    
    const client = createAlpacaClient(apiKey, apiSecret);
    const response = await client.delete('/v2/positions');
    
    return response.data;
  } catch (error: any) {
    console.error('Error closing Alpaca positions:', error.response?.data || error.message);
    throw error;
  }
};