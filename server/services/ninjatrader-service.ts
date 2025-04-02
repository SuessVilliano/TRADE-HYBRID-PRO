import axios from 'axios';
import { generateId } from '../utils';

// NinjaTrader doesn't have a direct API, so this service will
// help manage and route commands to a local client or desktop extension
// that can communicate with NinjaTrader

interface NinjaTraderConfig {
  userId: string;
  endpoint: string; // Usually a local endpoint like http://localhost:port
  apiKey?: string;
  account?: string;
  label: string;
  isDefault: boolean;
  createdAt: Date;
}

// In-memory store for user configurations (would be in DB in production)
const userConfigs = new Map<string, NinjaTraderConfig[]>();

/**
 * Save a user's NinjaTrader configuration
 */
export const saveNinjaTraderConfig = (
  userId: string,
  endpoint: string,
  apiKey?: string,
  account?: string,
  label: string = 'Default',
  isDefault: boolean = true
): NinjaTraderConfig => {
  if (!userConfigs.has(userId)) {
    userConfigs.set(userId, []);
  }
  
  // If setting as default, unset any other defaults
  if (isDefault) {
    const configs = userConfigs.get(userId) || [];
    configs.forEach(config => {
      config.isDefault = false;
    });
  }
  
  const config: NinjaTraderConfig = {
    userId,
    endpoint,
    apiKey,
    account,
    label,
    isDefault,
    createdAt: new Date()
  };
  
  userConfigs.get(userId)?.push(config);
  
  return config;
};

/**
 * Get a user's default NinjaTrader configuration
 */
export const getDefaultNinjaTraderConfig = (userId: string): NinjaTraderConfig | null => {
  const configs = userConfigs.get(userId);
  if (!configs || configs.length === 0) {
    return null;
  }
  
  // Find default config or use first
  return configs.find(config => config.isDefault) || configs[0];
};

/**
 * Test connection to NinjaTrader local client
 */
export const testNinjaTraderConnection = async (
  endpoint: string,
  apiKey?: string
): Promise<boolean> => {
  try {
    // Try to call the health/ping endpoint of the local client
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    const response = await axios.get(`${endpoint}/ping`, { headers });
    return response.status === 200;
  } catch (error) {
    console.error('Error testing NinjaTrader connection:', error);
    return false;
  }
};

/**
 * Send a command to NinjaTrader
 */
export const executeNinjaTraderCommand = async (
  action: 'BUY' | 'SELL' | 'FLATTEN',
  symbol: string,
  quantity: number,
  orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' = 'MARKET',
  limitPrice?: number,
  stopPrice?: number,
  account?: string,
  template?: string,
  userId?: string
) => {
  try {
    // Get user config if provided
    let endpoint: string;
    let apiKey: string | undefined;
    let configAccount: string | undefined;
    
    if (userId) {
      const config = getDefaultNinjaTraderConfig(userId);
      if (!config) {
        throw new Error('No NinjaTrader configuration found for user');
      }
      endpoint = config.endpoint;
      apiKey = config.apiKey;
      configAccount = config.account;
    } else {
      // Fall back to environment variables
      endpoint = process.env.NINJATRADER_ENDPOINT || '';
      apiKey = process.env.NINJATRADER_API_KEY;
      configAccount = process.env.NINJATRADER_ACCOUNT;
      
      if (!endpoint) {
        throw new Error('NinjaTrader endpoint not configured');
      }
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    // Prepare the command payload
    interface NinjaTraderCommandPayload {
      action: 'BUY' | 'SELL' | 'FLATTEN';
      symbol: string;
      quantity: number;
      orderType: 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT';
      account?: string;
      template?: string;
      id: string;
      limitPrice?: number;
      stopPrice?: number;
    }
    
    const commandPayload: NinjaTraderCommandPayload = {
      action,
      symbol,
      quantity,
      orderType,
      account: account || configAccount,
      template,
      id: generateId()
    };
    
    // Add prices if provided
    if (limitPrice && (orderType === 'LIMIT' || orderType === 'STOP_LIMIT')) {
      commandPayload.limitPrice = limitPrice;
    }
    
    if (stopPrice && (orderType === 'STOP' || orderType === 'STOP_LIMIT')) {
      commandPayload.stopPrice = stopPrice;
    }
    
    // Send the command to the local client
    const response = await axios.post(`${endpoint}/command`, commandPayload, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error('Error executing NinjaTrader command:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get account information from NinjaTrader
 * Note: This may not be available in all NinjaTrader local clients
 */
export const getNinjaTraderAccountInfo = async (userId?: string) => {
  try {
    // Get user config if provided
    let endpoint: string;
    let apiKey: string | undefined;
    let account: string | undefined;
    
    if (userId) {
      const config = getDefaultNinjaTraderConfig(userId);
      if (!config) {
        throw new Error('No NinjaTrader configuration found for user');
      }
      endpoint = config.endpoint;
      apiKey = config.apiKey;
      account = config.account;
    } else {
      // Fall back to environment variables
      endpoint = process.env.NINJATRADER_ENDPOINT || '';
      apiKey = process.env.NINJATRADER_API_KEY;
      account = process.env.NINJATRADER_ACCOUNT;
      
      if (!endpoint) {
        throw new Error('NinjaTrader endpoint not configured');
      }
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    // Request account info
    const response = await axios.get(`${endpoint}/account${account ? `/${account}` : ''}`, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting NinjaTrader account info:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Get positions from NinjaTrader
 * Note: This may not be available in all NinjaTrader local clients
 */
export const getNinjaTraderPositions = async (userId?: string) => {
  try {
    // Get user config if provided
    let endpoint: string;
    let apiKey: string | undefined;
    let account: string | undefined;
    
    if (userId) {
      const config = getDefaultNinjaTraderConfig(userId);
      if (!config) {
        throw new Error('No NinjaTrader configuration found for user');
      }
      endpoint = config.endpoint;
      apiKey = config.apiKey;
      account = config.account;
    } else {
      // Fall back to environment variables
      endpoint = process.env.NINJATRADER_ENDPOINT || '';
      apiKey = process.env.NINJATRADER_API_KEY;
      account = process.env.NINJATRADER_ACCOUNT;
      
      if (!endpoint) {
        throw new Error('NinjaTrader endpoint not configured');
      }
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    // Request positions
    const response = await axios.get(
      `${endpoint}/positions${account ? `?account=${account}` : ''}`,
      { headers }
    );
    
    return response.data;
  } catch (error: any) {
    console.error('Error getting NinjaTrader positions:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Send a FLATTEN command to NinjaTrader to close all positions
 */
export const closeAllNinjaTraderPositions = async (userId?: string) => {
  try {
    // Get user config if provided
    let endpoint: string;
    let apiKey: string | undefined;
    let account: string | undefined;
    
    if (userId) {
      const config = getDefaultNinjaTraderConfig(userId);
      if (!config) {
        throw new Error('No NinjaTrader configuration found for user');
      }
      endpoint = config.endpoint;
      apiKey = config.apiKey;
      account = config.account;
    } else {
      // Fall back to environment variables
      endpoint = process.env.NINJATRADER_ENDPOINT || '';
      apiKey = process.env.NINJATRADER_API_KEY;
      account = process.env.NINJATRADER_ACCOUNT;
      
      if (!endpoint) {
        throw new Error('NinjaTrader endpoint not configured');
      }
    }
    
    // Prepare headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };
    
    if (apiKey) {
      headers['X-API-Key'] = apiKey;
    }
    
    // Send FLATTEN command
    const commandPayload = {
      action: 'FLATTEN',
      account,
      id: generateId()
    };
    
    const response = await axios.post(`${endpoint}/command`, commandPayload, { headers });
    
    return response.data;
  } catch (error: any) {
    console.error('Error closing NinjaTrader positions:', error.response?.data || error.message);
    throw error;
  }
};