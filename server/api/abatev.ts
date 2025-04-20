import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { apiCredentialManager } from '../lib/services/api-credential-manager';
import { log, logError } from '../utils/logger';

// Create a new router
const router = Router();

// Initialize in-memory state for ABATEV (Advanced Broker Aggregation & Trade Execution View)
let abatevState = {
  enabled: false,
  connected: false,
  activeConnections: [] as string[],
  ordersProcessed: 0,
  averageExecutionTime: 0,
  activeStrategies: 0,
  executionPreset: 'bestPrice',
  lastInitialized: null as Date | null,
};

// Schema for toggling ABATEV
const toggleAbatevSchema = z.object({
  enabled: z.boolean()
});

/**
 * Get the status of the ABATEV system
 */
router.get('/status', async (req, res) => {
  try {
    // If ABATEV is initialized, refresh the active connections
    if (abatevState.connected) {
      // Check each supported broker to see if it's connected
      const activeConnections = [];
      
      // Check Alpaca
      const alpacaCredentials = await apiCredentialManager.getCredentials('alpaca');
      if (alpacaCredentials?.apiKey && alpacaCredentials?.secretKey) {
        try {
          const alpacaConnected = await testBrokerConnection('alpaca');
          if (alpacaConnected) {
            activeConnections.push('alpaca');
          }
        } catch (err) {
          logError(err as Error, 'abatev');
        }
      }
      
      // Check Oanda
      const oandaCredentials = await apiCredentialManager.getCredentials('oanda');
      if (oandaCredentials?.apiKey) { // Support apiKey instead of apiToken
        try {
          const oandaConnected = await testBrokerConnection('oanda');
          if (oandaConnected) {
            activeConnections.push('oanda');
          }
        } catch (err) {
          logError(err as Error, 'abatev');
        }
      }
      
      // Check NinjaTrader (if applicable)
      const ninjaCredentials = await apiCredentialManager.getCredentials('ninjatrader');
      if (ninjaCredentials) {
        try {
          const ninjaConnected = await testBrokerConnection('ninjatrader');
          if (ninjaConnected) {
            activeConnections.push('ninjatrader');
          }
        } catch (err) {
          logError(err as Error, 'abatev');
        }
      }
      
      // Update the active connections in the state
      abatevState.activeConnections = activeConnections;
    }
    
    // Return the current status
    return res.json({
      success: true,
      ...abatevState
    });
  } catch (err) {
    logError(err as Error, 'abatev');
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve ABATEV status'
    });
  }
});

/**
 * Initialize or reset the ABATEV system
 */
router.post('/initialize', async (req, res) => {
  try {
    // Initialize the ABATEV system
    abatevState.connected = true;
    abatevState.lastInitialized = new Date();
    
    // Reset metrics
    if (!abatevState.enabled) {
      abatevState.ordersProcessed = 0;
      abatevState.averageExecutionTime = 0;
      abatevState.activeStrategies = 0;
    }
    
    // Check which brokers are connected
    const activeConnections = [];
    
    // Check Alpaca
    const alpacaCredentials = await apiCredentialManager.getCredentials('alpaca');
    if (alpacaCredentials?.apiKey && alpacaCredentials?.secretKey) {
      try {
        const alpacaConnected = await testBrokerConnection('alpaca');
        if (alpacaConnected) {
          activeConnections.push('alpaca');
        }
      } catch (err) {
        logError(err as Error, 'abatev');
      }
    }
    
    // Check Oanda
    const oandaCredentials = await apiCredentialManager.getCredentials('oanda');
    if (oandaCredentials?.apiKey && oandaCredentials?.accountId) {
      try {
        const oandaConnected = await testBrokerConnection('oanda');
        if (oandaConnected) {
          activeConnections.push('oanda');
        }
      } catch (err) {
        logError(err as Error, 'abatev');
      }
    }
    
    // Check NinjaTrader (if applicable)
    const ninjaCredentials = await apiCredentialManager.getCredentials('ninjatrader');
    if (ninjaCredentials) {
      try {
        const ninjaConnected = await testBrokerConnection('ninjatrader');
        if (ninjaConnected) {
          activeConnections.push('ninjatrader');
        }
      } catch (err) {
        logError(err as Error, 'abatev');
      }
    }
    
    // Update active connections
    abatevState.activeConnections = activeConnections;
    
    // Return the updated status
    return res.json({
      success: true,
      message: 'ABATEV system initialized successfully',
      ...abatevState
    });
  } catch (err) {
    logError(err as Error, 'abatev');
    return res.status(500).json({
      success: false,
      message: 'Failed to initialize ABATEV system'
    });
  }
});

/**
 * Toggle the ABATEV system on/off
 */
router.post('/toggle', async (req, res) => {
  try {
    // Validate request body
    const validation = toggleAbatevSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid request data',
        errors: validation.error.errors
      });
    }
    
    const { enabled } = validation.data;
    
    // Update the enabled state
    abatevState.enabled = enabled;
    
    // If enabling, verify that the system is connected
    if (enabled && !abatevState.connected) {
      // Initialize the system if it's not already connected
      abatevState.connected = true;
      abatevState.lastInitialized = new Date();
    }
    
    return res.json({
      success: true,
      enabled,
      message: `ABATEV system ${enabled ? 'enabled' : 'disabled'} successfully`
    });
  } catch (err) {
    logError(err as Error, 'abatev');
    return res.status(500).json({
      success: false,
      message: 'Failed to toggle ABATEV system'
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
  
  // Handle different broker types
  switch (brokerId) {
    case 'alpaca':
      // Test Alpaca connection
      try {
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
      } catch (err) {
        logError(err as Error, 'abatev');
        return false;
      }
      
    case 'oanda':
      // Test Oanda connection
      try {
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
      } catch (err) {
        logError(err as Error, 'abatev');
        return false;
      }
      
    case 'ninjatrader':
      // For NinjaTrader, we would typically connect to a local instance
      // This is a simplified check - in reality would need a more complex procedure
      try {
        // Check if the local NinjaTrader service is responding
        const ninjaResponse = await fetch('http://localhost:8000/ninjatrader/status');
        return ninjaResponse.status === 200;
      } catch (err) {
        // Most likely the local NinjaTrader service is not running
        return false;
      }
      
    default:
      return false;
  }
}

export default router;