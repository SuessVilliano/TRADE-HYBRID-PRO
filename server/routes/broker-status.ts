import express, { Request, Response } from 'express';
import { checkAlpacaConnection } from '../services/alpaca-service';
import { checkOandaConnection } from '../services/oanda-service';

const router = express.Router();

// GET /api/broker-status
// Check the connection status of all configured brokers
router.get('/', async (req: Request, res: Response) => {
  try {
    // Check Alpaca API connection
    const alpacaStatus = await checkAlpacaStatus();
    
    // Check Oanda API connection
    const oandaStatus = await checkOandaStatus();
    
    // Return the status of all brokers
    return res.json({
      status: 'success',
      brokers: {
        alpaca: alpacaStatus,
        oanda: oandaStatus
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking broker status:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Failed to check broker status',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/broker-status/alpaca
// Check only the Alpaca API connection
router.get('/alpaca', async (req: Request, res: Response) => {
  try {
    const status = await checkAlpacaStatus();
    
    return res.json({
      status: 'success',
      broker: 'alpaca',
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Alpaca status:', error);
    return res.status(500).json({
      status: 'error',
      broker: 'alpaca',
      error: 'Failed to check Alpaca status',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/broker-status/oanda
// Check only the Oanda API connection
router.get('/oanda', async (req: Request, res: Response) => {
  try {
    const status = await checkOandaStatus();
    
    return res.json({
      status: 'success',
      broker: 'oanda',
      ...status,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Oanda status:', error);
    return res.status(500).json({
      status: 'error',
      broker: 'oanda',
      error: 'Failed to check Oanda status',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// Helper function to check Alpaca API status
async function checkAlpacaStatus() {
  try {
    // Get API key from environment variables
    const apiKey = process.env.ALPACA_API_KEY;
    const apiSecret = process.env.ALPACA_API_SECRET;
    
    // Check if credentials are available
    if (!apiKey || !apiSecret) {
      return {
        connected: false,
        available: false,
        configuredCredentials: false,
        error: 'Alpaca API credentials not configured'
      };
    }
    
    // Check the connection
    const connected = await checkAlpacaConnection();
    
    return {
      connected,
      available: true,
      configuredCredentials: true,
      error: connected ? null : 'Failed to connect to Alpaca API'
    };
  } catch (error) {
    console.error('Error in checkAlpacaStatus:', error);
    return {
      connected: false,
      available: false,
      configuredCredentials: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Helper function to check Oanda API status
async function checkOandaStatus() {
  try {
    // Get API token from environment variables
    const apiToken = process.env.OANDA_API_TOKEN;
    
    // Check if token is available
    if (!apiToken) {
      return {
        connected: false,
        available: false,
        configuredCredentials: false,
        error: 'Oanda API token not configured'
      };
    }
    
    // Check the connection
    const connected = await checkOandaConnection();
    
    return {
      connected,
      available: true,
      configuredCredentials: true,
      error: connected ? null : 'Failed to connect to Oanda API'
    };
  } catch (error) {
    console.error('Error in checkOandaStatus:', error);
    return {
      connected: false,
      available: false,
      configuredCredentials: true,
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

export default router;