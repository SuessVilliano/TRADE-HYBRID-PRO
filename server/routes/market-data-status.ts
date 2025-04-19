import express, { Request, Response } from 'express';
import { checkAlpacaConnection } from '../services/alpaca-service';
import { getOandaClient } from '../services/oanda-service';

const router = express.Router();

// GET /api/market-data-status
// Check the connection status of all market data providers
router.get('/', async (req: Request, res: Response) => {
  const statuses: Record<string, any> = {};
  let overallStatus = 'operational';
  
  // Check Alpaca connection
  try {
    const alpacaConnected = await checkAlpacaConnection();
    statuses.alpaca = {
      status: alpacaConnected ? 'operational' : 'degraded',
      message: alpacaConnected ? 
        'Connected to Alpaca API' : 
        'Using fallback data - Alpaca API connection failed',
      type: alpacaConnected ? 'real' : 'simulated',
      timestamp: new Date().toISOString()
    };
    
    if (!alpacaConnected) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    statuses.alpaca = {
      status: 'degraded',
      message: 'Using fallback data - Error checking Alpaca API',
      error: error instanceof Error ? error.message : String(error),
      type: 'simulated',
      timestamp: new Date().toISOString()
    };
    overallStatus = 'degraded';
  }
  
  // Check Oanda connection
  try {
    const oandaClient = getOandaClient();
    const accounts = await oandaClient.getAccounts();
    
    statuses.oanda = {
      status: accounts ? 'operational' : 'degraded',
      message: accounts ? 
        'Connected to Oanda API' : 
        'Using fallback data - Oanda API connection failed',
      type: accounts ? 'real' : 'simulated',
      timestamp: new Date().toISOString()
    };
    
    if (!accounts) {
      overallStatus = 'degraded';
    }
  } catch (error) {
    statuses.oanda = {
      status: 'degraded',
      message: 'Using fallback data - Error checking Oanda API',
      error: error instanceof Error ? error.message : String(error),
      type: 'simulated',
      timestamp: new Date().toISOString()
    };
    overallStatus = 'degraded';
  }
  
  // Return the provider statuses
  return res.json({
    status: overallStatus,
    providers: statuses,
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

export default router;