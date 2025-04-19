import express, { Request, Response } from 'express';
import { resetAlpacaClient, getAlpacaClient } from '../services/alpaca-service';

const router = express.Router();

// GET /api/alpaca-test
// Test the Alpaca API connection
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Testing Alpaca API connection...');
    console.log('Current environment variables:');
    console.log(`ALPACA_API_KEY: ${process.env.ALPACA_API_KEY?.substring(0, 4)}...${process.env.ALPACA_API_KEY?.substring(process.env.ALPACA_API_KEY.length - 4)}`);
    console.log(`ALPACA_API_SECRET: ${process.env.ALPACA_API_SECRET?.substring(0, 4)}...${process.env.ALPACA_API_SECRET?.substring(process.env.ALPACA_API_SECRET.length - 4)}`);
    
    // Reset the client to ensure it picks up new credentials
    resetAlpacaClient();
    console.log('Alpaca client reset, getting new instance...');
    
    // Get a fresh client instance
    const client = getAlpacaClient();
    
    // Try to get account info
    console.log('Attempting to fetch account information...');
    try {
      const account = await client.getAccount();
      
      return res.json({
        success: true,
        message: 'Alpaca API connection successful',
        account,
        timestamp: new Date().toISOString()
      });
    } catch (accountError) {
      console.error('Error fetching account:', accountError);
      
      // Try to get assets as a fallback
      try {
        console.log('Trying to fetch assets instead...');
        const assets = await client.getAssets({ status: 'active' });
        
        return res.json({
          success: true,
          message: 'Could not fetch account but assets request succeeded',
          assetsCount: assets.length,
          timestamp: new Date().toISOString()
        });
      } catch (assetsError) {
        console.error('Error fetching assets:', assetsError);
        throw assetsError;
      }
    }
  } catch (error) {
    console.error('Error testing Alpaca API:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to connect to Alpaca API',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;