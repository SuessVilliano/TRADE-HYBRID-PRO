import express from 'express';
import { BrokerCredentials } from '../lib/services/broker-connection-service';
import { AlpacaService } from '../lib/services/alpaca-service';
import { AlpacaBrokerService } from '../lib/services/alpaca-broker-service';
import { isAuthenticated } from '../middleware/auth';

const router = express.Router();

// Get broker types
router.get('/broker-types', async (req, res) => {
  try {
    // For testing purposes, just return a predefined list of broker types
    const brokerTypes = [
      {
        id: 'alpaca',
        name: 'Alpaca',
        logo: '/broker-icons/alpaca.svg',
        requires_key: true,
        requires_secret: true,
        supports_demo: true
      },
      {
        id: 'thinkorswim',
        name: 'TD Ameritrade / ThinkOrSwim',
        logo: '/broker-icons/td-ameritrade.svg',
        requires_key: true,
        requires_secret: false,
        supports_demo: true
      },
      {
        id: 'oanda',
        name: 'Oanda',
        logo: '/broker-icons/oanda.svg',
        requires_key: true,
        requires_token: true,
        supports_demo: true
      }
    ];
    
    res.json(brokerTypes);
  } catch (error: any) {
    console.error('Error fetching broker types:', error);
    res.status(500).json({ error: error.message });
  }
});

// Import the broker factory
import { BrokerFactory } from '../lib/services/broker-factory';

// Test broker connection with given credentials
router.post('/test-connection', async (req, res) => {
  try {
    const { brokerTypeId, credentials, isLiveTrading = false } = req.body;
    
    // Extract any broker-specific options from request
    const options = { 
      isPaper: !isLiveTrading 
    };
    
    // Map broker types to factory types
    let factoryType: 'alpaca' | 'alpaca-broker' | 'mock';
    
    switch (brokerTypeId) {
      case 'alpaca':
        factoryType = 'alpaca';
        break;
      case 'alpaca-broker':
        factoryType = 'alpaca-broker';
        break;
      default:
        // Check if we should use mock for unimplemented broker types
        if (process.env.ALLOW_MOCK_BROKERS === 'true') {
          console.log(`Using mock service for unimplemented broker type: ${brokerTypeId}`);
          factoryType = 'mock';
        } else {
          return res.status(400).json({ 
            success: false, 
            message: `Broker type ${brokerTypeId} not supported yet` 
          });
        }
    }
    
    // Use credentials provided or environment variables
    const creds: BrokerCredentials = {
      apiKey: credentials?.apiKey || process.env[`${brokerTypeId.toUpperCase()}_API_KEY`] || '',
      secretKey: credentials?.secretKey || process.env[`${brokerTypeId.toUpperCase()}_API_SECRET`] || '',
      accountId: credentials?.accountId || ''
    };
    
    // Log the API keys being used (only partial for security)
    if (creds.apiKey) {
      console.log(`Using ${brokerTypeId} API Key: ${creds.apiKey.substring(0, 4)}...`);
    }
    
    try {
      // Test the connection using the factory
      const success = await BrokerFactory.testConnection(factoryType, creds, options);
      
      if (success) {
        console.log(`Successfully connected to ${brokerTypeId} API`);
        res.json({ success: true, message: `Successfully connected to ${brokerTypeId}` });
      } else {
        console.error(`Failed to connect to ${brokerTypeId} API`);
        res.status(400).json({ 
          success: false, 
          message: `Failed to connect to ${brokerTypeId}`,
          fallbackAvailable: process.env.USE_MOCK_SERVICE === 'true'
        });
      }
    } catch (error: any) {
      console.error(`Error connecting to ${brokerTypeId}:`, error);
      res.status(400).json({ 
        success: false, 
        message: `Failed to connect to ${brokerTypeId}`, 
        error: error.message,
        fallbackAvailable: process.env.USE_MOCK_SERVICE === 'true'
      });
    }
  } catch (error: any) {
    console.error('Error testing broker connection:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get broker connections for authenticated user
router.get('/connections', isAuthenticated, async (req, res) => {
  try {
    // For testing, return some sample connections
    const connections = [
      {
        id: 1,
        name: 'My Alpaca Paper',
        brokerTypeId: 'alpaca',
        isDemo: true,
        isActive: true,
        lastConnectedAt: new Date(),
        createdAt: new Date()
      }
    ];
    
    res.json(connections);
  } catch (error: any) {
    console.error('Error fetching broker connections:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;