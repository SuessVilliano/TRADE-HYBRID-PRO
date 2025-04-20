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

// Test Oanda credentials
router.get('/oanda', async (req, res) => {
  try {
    // First initialize the credential manager
    await apiCredentialManager.initialize();

    // Get system-level Oanda credentials
    const credentials = await apiCredentialManager.getCredentials('oanda');

    if (!credentials || !credentials.apiKey) {
      return res.status(400).json({
        success: false,
        message: 'Oanda credentials not found',
        error: 'Missing API token'
      });
    }

    // The API token is stored in the apiKey property
    const apiToken = credentials.apiKey;

    // Log a masked version of the credentials for debugging
    console.log(`Testing Oanda credentials: ${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}`);
    
    // Construct an account endpoint URL
    // If account ID is available, use it for a specific account lookup
    // Otherwise, fallback to the accounts list endpoint
    const isPractice = credentials.isPractice !== false;
    const baseUrl = isPractice ? 'https://api-fxpractice.oanda.com' : 'https://api-fxtrade.oanda.com';
    
    let url;
    if (credentials.accountId) {
      console.log(`Using Oanda account ID: ${credentials.accountId}`);
      url = `${baseUrl}/v3/accounts/${credentials.accountId}`;
    } else {
      console.log('No specific Oanda account ID provided, using accounts list endpoint');
      url = `${baseUrl}/v3/accounts`;
    }
    
    try {
      // Try to get account info
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        
        // Connection successful
        if (credentials.accountId) {
          // Single account response
          return res.json({
            success: true,
            message: 'Successfully connected to Oanda API',
            accountInfo: data.account
          });
        } else {
          // Accounts list response
          return res.json({
            success: true, 
            message: 'Successfully connected to Oanda API',
            accounts: data.accounts
          });
        }
      } else {
        const errorText = await response.text();
        // Connection failed
        return res.status(401).json({
          success: false,
          message: 'Failed to connect to Oanda API',
          error: errorText
        });
      }
    } catch (connectionError: any) {
      // Connection failed
      return res.status(401).json({
        success: false,
        message: 'Failed to connect to Oanda API',
        error: connectionError.message
      });
    }
  } catch (error: any) {
    console.error('Error testing Oanda credentials:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Test Oanda credentials with provided keys
router.post('/oanda/test', async (req, res) => {
  try {
    const { apiToken, accountId, isPractice } = req.body;
    
    if (!apiToken) {
      return res.status(400).json({
        success: false,
        message: 'Missing required credentials',
        error: 'API token is required'
      });
    }
    
    // Create temporary credentials
    const credentials: BrokerCredentials = {
      apiKey: apiToken, // Store as apiKey for consistency with our updated credential system
      accountId: accountId || 'primary',
      isPractice: isPractice !== false
    };
    
    // Test the connection
    const isValid = await apiCredentialManager.validateCredentials('oanda', credentials);
    
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
    console.error('Error testing provided Oanda credentials:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
});

// Add other broker test endpoints here as needed

export default router;