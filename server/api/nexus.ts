import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { apiCredentialManager } from '../lib/services/api-credential-manager';
import { log, logError } from '../utils/logger';

// Create a new router
const router = Router();

// Initialize in-memory state for Nexus (Advanced Broker Aggregation & Trade Execution View)
let nexusState = {
  enabled: false,
  connected: false,
  activeConnections: [] as string[],
  ordersProcessed: 0,
  averageExecutionTime: 0,
  activeStrategies: 0,
  executionPreset: 'bestPrice',
  lastInitialized: null as Date | null,
};

// Schema for toggling Nexus
const toggleNexusSchema = z.object({
  enabled: z.boolean()
});

/**
 * Get the status of the Nexus system
 */
router.get('/status', async (req, res) => {
  try {
    // If Nexus is initialized, refresh the active connections
    if (nexusState.connected) {
      // Check each supported broker to see if it's connected
      const activeConnections = [];
      
      // Map of broker IDs to their credential requirements
      const brokerCredentialChecks = {
        'alpaca': async () => {
          const creds = await apiCredentialManager.getCredentials('alpaca');
          return creds?.apiKey && creds?.secretKey;
        },
        'oanda': async () => {
          const creds = await apiCredentialManager.getCredentials('oanda');
          return creds?.apiKey;
        },
        'ninjatrader': async () => {
          const creds = await apiCredentialManager.getCredentials('ninjatrader');
          return !!creds;
        },
        'interactive_brokers': async () => {
          const creds = await apiCredentialManager.getCredentials('interactive_brokers');
          return creds?.userId && creds?.apiKey;
        },
        'tradier': async () => {
          const creds = await apiCredentialManager.getCredentials('tradier');
          return creds?.apiKey && creds?.accountId;
        },
        'ig': async () => {
          const creds = await apiCredentialManager.getCredentials('ig');
          return creds?.apiKey && creds?.username && creds?.password;
        },
        'saxo_bank': async () => {
          const creds = await apiCredentialManager.getCredentials('saxo_bank');
          return creds?.apiKey && creds?.appKey && creds?.accountKey;
        },
        'ctrader': async () => {
          const creds = await apiCredentialManager.getCredentials('ctrader');
          return creds?.apiKey && creds?.apiSecret && creds?.accountId;
        },
        'match_trader': async () => {
          const creds = await apiCredentialManager.getCredentials('match_trader');
          return creds?.apiKey && creds?.secretKey && creds?.userId;
        },
        'meta_api': async () => {
          const creds = await apiCredentialManager.getCredentials('meta_api');
          return creds?.apiToken && creds?.accountId;
        },
        'td_ameritrade': async () => {
          const creds = await apiCredentialManager.getCredentials('td_ameritrade');
          return creds?.consumerKey && creds?.refreshToken && creds?.accountId;
        },
        'tradovate': async () => {
          const creds = await apiCredentialManager.getCredentials('tradovate');
          return !!creds;
        }
      };
      
      // Check each broker and add to activeConnections if connected
      for (const [brokerId, checkCredentials] of Object.entries(brokerCredentialChecks)) {
        try {
          if (await checkCredentials()) {
            const connected = await testBrokerConnection(brokerId);
            if (connected) {
              activeConnections.push(brokerId);
              log(`${brokerId} broker connected successfully`);
            }
          }
        } catch (err) {
          logError(err as Error, `nexus-${brokerId}`);
        }
      }
      
      // Update the active connections in the state
      nexusState.activeConnections = activeConnections;
    }
    
    // Return the current status
    return res.json({
      success: true,
      ...nexusState
    });
  } catch (err) {
    logError(err as Error, 'nexus');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve Nexus status'
    });
  }
});

/**
 * Initialize or reset the Nexus system
 */
router.post('/initialize', async (req, res) => {
  try {
    // Initialize the Nexus system
    nexusState.connected = true;
    nexusState.lastInitialized = new Date();
    
    // Reset metrics
    if (!nexusState.enabled) {
      nexusState.ordersProcessed = 0;
      nexusState.averageExecutionTime = 0;
      nexusState.activeStrategies = 0;
    }
    
    // Check which brokers are connected
    const activeConnections = [];
    
    // List of supported brokers to check
    const brokersToCheck = [
      'alpaca', 
      'oanda', 
      'ninjatrader', 
      'interactive_brokers',
      'tradier',
      'ig',
      'saxo_bank',
      'ctrader',
      'match_trader',
      'meta_api',
      'td_ameritrade',
      'tradovate'
    ];
    
    // Check each broker
    for (const brokerId of brokersToCheck) {
      try {
        const connected = await testBrokerConnection(brokerId);
        if (connected) {
          activeConnections.push(brokerId);
          log(`${brokerId} broker connected during Nexus initialization`);
        }
      } catch (err) {
        logError(err as Error, `nexus-init-${brokerId}`);
      }
    }
    
    // Update active connections
    nexusState.activeConnections = activeConnections;
    
    // Return the updated status
    return res.json({
      success: true,
      message: 'Nexus system initialized successfully',
      ...nexusState
    });
  } catch (err) {
    logError(err as Error, 'nexus');
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize Nexus system'
    });
  }
});

/**
 * Toggle the Nexus system on/off
 */
router.post('/toggle', async (req, res) => {
  try {
    // Validate request body
    const validation = toggleNexusSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { enabled } = validation.data;
    
    // Update the enabled state
    nexusState.enabled = enabled;
    
    // If enabling, verify that the system is connected
    if (enabled && !nexusState.connected) {
      // Initialize the system if it's not already connected
      nexusState.connected = true;
      nexusState.lastInitialized = new Date();
    }
    
    return res.json({
      success: true,
      enabled,
      message: `Nexus system ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (err) {
    logError(err as Error, 'nexus');
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle Nexus system'
    });
  }
});

/**
 * Helper function to test a broker connection
 */
async function testBrokerConnection(brokerId: string): Promise<boolean> {
  const credentials = await apiCredentialManager.getCredentials(brokerId);
  
  if (!credentials) {
    return false;
  }
  
  try {
    // Handle different broker types
    switch (brokerId) {
      case 'alpaca':
        // Test Alpaca connection
        if (!credentials.apiKey || !credentials.secretKey) {
          return false;
        }
        
        // Simple check against Alpaca API
        const alpacaResponse = await fetch('https://api.alpaca.markets/v2/account', {
          headers: {
            'APCA-API-KEY-ID': credentials.apiKey,
            'APCA-API-SECRET-KEY': credentials.secretKey
          }
        });
        
        // If we get a 200 response, the connection is valid
        return alpacaResponse.status === 200;
        
      case 'oanda':
        // Test Oanda connection
        if (!credentials.apiKey || !credentials.accountId) {
          return false;
        }
        
        // Simple check against Oanda API
        const oandaResponse = await fetch(`https://api-fxpractice.oanda.com/v3/accounts/${credentials.accountId}`, {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        
        // If we get a 200 response, the connection is valid
        return oandaResponse.status === 200;
        
      case 'ninjatrader':
        // For NinjaTrader, we would typically connect to a local instance
        // This is a simplified check - in reality would need a more complex procedure
        const ninjaResponse = await fetch('http://localhost:8000/ninjatrader/status');
        return ninjaResponse.status === 200;
      
      case 'interactive_brokers':
        // Test connection to Interactive Brokers Client Portal API
        if (!credentials.apiKey) {
          return false;
        }
        
        // Simple check against IB API
        const ibResponse = await fetch('https://localhost:5000/v1/portal/iserver/auth/status', {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`
          }
        });
        return ibResponse.status === 200;
        
      case 'tradier':
        // Test Tradier connection
        if (!credentials.apiKey) {
          return false;
        }
        
        // Simple check against Tradier API
        const tradierResponse = await fetch('https://api.tradier.com/v1/user/profile', {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`,
            'Accept': 'application/json'
          }
        });
        return tradierResponse.status === 200;
      
      case 'ig':
        // Test IG connection
        if (!credentials.apiKey || !credentials.username || !credentials.password) {
          return false;
        }
        
        // Simple check against IG API
        const igResponse = await fetch('https://demo-api.ig.com/gateway/deal/session', {
          method: 'POST',
          headers: {
            'X-IG-API-KEY': credentials.apiKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            identifier: credentials.username,
            password: credentials.password,
            encryptedPassword: false
          })
        });
        return igResponse.status === 200;
      
      case 'saxo_bank':
        // Test Saxo Bank connection
        if (!credentials.apiKey) {
          return false;
        }
        
        // Simple check against Saxo OpenAPI
        const saxoResponse = await fetch('https://gateway.saxobank.com/sim/openapi/port/v1/balances', {
          headers: {
            'Authorization': `Bearer ${credentials.apiKey}`
          }
        });
        return saxoResponse.status === 200;
      
      case 'ctrader':
        // For cTrader, the API is typically accessed through WebSocket
        // This is a simplified check
        return !!credentials.apiKey && !!credentials.apiSecret;
      
      case 'match_trader':
        // Simple validation of credentials for Match-Trader
        return !!credentials.apiKey && !!credentials.secretKey;
      
      case 'meta_api':
        // Test MetaApi connection
        if (!credentials.apiToken || !credentials.accountId) {
          return false;
        }
        
        // Simple check against MetaApi
        const metaApiResponse = await fetch(`https://api.metaapi.cloud/api/account/${credentials.accountId}`, {
          headers: {
            'auth-token': credentials.apiToken
          }
        });
        return metaApiResponse.status === 200;
      
      case 'td_ameritrade':
        // Test TD Ameritrade connection
        if (!credentials.consumerKey || !credentials.refreshToken) {
          return false;
        }
        
        // In a real app, we would refresh the access token using the refresh token
        // For this simulation, we'll just check that the credentials exist
        return true;
      
      case 'tradovate':
        // Simple validation for Tradovate
        return !!credentials.username && !!credentials.password;
        
      default:
        // For all other broker types, return false
        return false;
    }
  } catch (err) {
    logError(err as Error, `nexus-${brokerId}`);
    return false;
  }
}

export default router;