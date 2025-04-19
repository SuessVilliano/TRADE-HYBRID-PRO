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

// Test broker connection with given credentials
router.post('/test-connection', async (req, res) => {
  try {
    const { brokerTypeId, credentials, isLiveTrading = false } = req.body;
    
    // Test connection based on broker type
    if (brokerTypeId === 'alpaca') {
      try {
        // Use environment variables if credentials not provided
        const envApiKey = process.env.ALPACA_API_KEY;
        const envSecretKey = process.env.ALPACA_API_SECRET;
        
        // Log the API keys being used (only partial for security)
        if (envApiKey) console.log(`Using Alpaca API Key from env: ${envApiKey.substring(0, 4)}...`);
        
        const creds: BrokerCredentials = {
          apiKey: credentials?.apiKey || envApiKey || '',
          secretKey: credentials?.secretKey || envSecretKey || ''
        };
        
        const alpacaService = new AlpacaService(creds, { isPaper: !isLiveTrading });
        
        // Test the connection by calling an API
        await alpacaService.initialize();
        
        console.log('Successfully connected to Alpaca broker API');
        res.json({ success: true, message: 'Successfully connected to Alpaca' });
      } catch (error: any) {
        console.error('Error connecting to Alpaca:', error);
        res.status(400).json({ success: false, message: 'Failed to connect to Alpaca', error: error.message });
      }
    } else {
      // For other broker types that we haven't implemented yet
      res.status(400).json({ success: false, message: `Broker type ${brokerTypeId} not supported yet` });
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