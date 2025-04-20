import express from 'express';
import { apiCredentialManager } from '../lib/services/api-credential-manager';
import { AlpacaService } from '../lib/services/alpaca-service';
import { BrokerCredentials } from '../lib/services/broker-connection-service';

const router = express.Router();

/**
 * Test API credentials for various brokers
 * This is a utility endpoint for testing and debugging connections
 */

// Test Alpaca credentials
router.get('/alpaca', async (req, res) => {
  try {
    // First initialize the credential manager
    await apiCredentialManager.initialize();

    // Get system-level Alpaca credentials
    const credentials = await apiCredentialManager.getCredentials('alpaca');

    if (!credentials || !credentials.apiKey || !credentials.secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Alpaca credentials not found',
        error: 'Missing API key or secret'
      });
    }

    // Log a masked version of the credentials for debugging
    console.log(`Testing Alpaca credentials: ${credentials.apiKey.substring(0, 4)}...${credentials.apiKey.substring(credentials.apiKey.length - 4)}`);
    
    // Test the connection with the credentials
    const alpacaService = new AlpacaService(credentials, { isPaper: true });
    
    try {
      // Try to get account info
      const accountInfo = await alpacaService.getAccountInfo();
      
      // Connection successful
      return res.json({
        success: true,
        message: 'Successfully connected to Alpaca API',
        accountInfo
      });
    } catch (connectionError: any) {
      // Connection failed
      return res.status(401).json({
        success: false,
        message: 'Failed to connect to Alpaca API',
        error: connectionError.message
      });
    }
  } catch (error: any) {
    console.error('Error testing Alpaca credentials:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test credentials with provided keys
router.post('/alpaca/test', async (req, res) => {
  try {
    const { apiKey, secretKey } = req.body;
    
    if (!apiKey || !secretKey) {
      return res.status(400).json({
        success: false,
        message: 'Missing required credentials',
        error: 'API key and secret key are required'
      });
    }
    
    // Create temporary credentials
    const credentials: BrokerCredentials = {
      apiKey,
      secretKey
    };
    
    // Test the connection
    const isValid = await apiCredentialManager.validateCredentials('alpaca', credentials);
    
    if (isValid) {
      return res.json({
        success: true,
        message: 'Credentials are valid'
      });
    } else {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
  } catch (error: any) {
    console.error('Error testing provided Alpaca credentials:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Add other broker test endpoints here as needed

export default router;