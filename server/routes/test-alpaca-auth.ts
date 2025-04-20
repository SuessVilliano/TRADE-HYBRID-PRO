import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// GET /api/test-alpaca-auth
// Direct Alpaca API test with new credentials
router.get('/', async (req: Request, res: Response) => {
  try {
    console.log('Testing Alpaca API with new direct credentials...');
    
    // Always use the new credentials explicitly
    const apiKey = 'PKCBXRXBYIZ100B87CO0';
    const apiSecret = '4tZAchGqy3EWSdAycUeywGcjgaGsBOz9LNKnkOJL';
    const baseUrl = 'https://paper-api.alpaca.markets/v2';
    
    console.log(`Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Make direct API call
    const response = await axios.get(`${baseUrl}/account`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.status === 200) {
      console.log('Alpaca direct API connection successful!');
      
      return res.json({
        success: true,
        message: 'Successfully connected to Alpaca API with direct credentials',
        account: response.data,
        timestamp: new Date().toISOString()
      });
    } else {
      throw new Error(`Unexpected status code: ${response.status}`);
    }
  } catch (error) {
    console.error('Error testing Alpaca connection:', error);
    
    let errorMessage = 'Failed to connect to Alpaca API';
    let statusCode = 500;
    let errorDetails = null;
    
    if (axios.isAxiosError(error)) {
      errorMessage = `HTTP Error: ${error.message}`;
      statusCode = error.response?.status || 500;
      errorDetails = error.response?.data || null;
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return res.status(statusCode).json({
      success: false,
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    });
  }
});

export default router;