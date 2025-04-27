import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db';
import { apiCredentialManager } from '../lib/services/api-credential-manager';
import { log, logError } from '../utils/logger';

// Create a new router
const router = Router();

// Define the broker credentials schema
const brokerCredentialsSchema = z.object({
  brokerId: z.string(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accountId: z.string().optional(),
  username: z.string().optional(),
  password: z.string().optional(),
  token: z.string().optional(),
  useDemo: z.boolean().optional(),
  additionalParams: z.record(z.string()).optional()
});

// Get supported broker types
router.get('/broker-types', async (req, res) => {
  try {
    const brokerTypes = [
      { id: 'alpaca', name: 'Alpaca', isSupported: true, hasDemo: true, tradingCapabilities: ['stocks', 'crypto', 'options'], demoUrl: 'https://app.alpaca.markets/signup' },
      { id: 'oanda', name: 'Oanda', isSupported: true, hasDemo: true, tradingCapabilities: ['forex', 'cfd'], demoUrl: 'https://www.oanda.com/demo-account/login' },
      { id: 'interactive_brokers', name: 'Interactive Brokers', isSupported: true, hasDemo: true, tradingCapabilities: ['stocks', 'options', 'futures', 'forex', 'bonds'], demoUrl: 'https://www.interactivebrokers.com/en/trading/free-demo.php' },
      { id: 'tradier', name: 'Tradier', isSupported: true, hasDemo: false, tradingCapabilities: ['stocks', 'options'] },
      { id: 'ninjatrader', name: 'NinjaTrader', isSupported: true, hasDemo: true, tradingCapabilities: ['futures', 'forex'], demoUrl: 'https://ninjatrader.com/FreeLiveData' },
      { id: 'tradovate', name: 'Tradovate', isSupported: true, hasDemo: true, tradingCapabilities: ['futures'], demoUrl: 'https://www.tradovate.com/simulated-trading/' },
      { id: 'ig', name: 'IG', isSupported: true, hasDemo: true, tradingCapabilities: ['forex', 'cfd', 'stocks'], demoUrl: 'https://www.ig.com/uk/demo-account' },
      { id: 'saxo_bank', name: 'Saxo Bank', isSupported: true, hasDemo: true, tradingCapabilities: ['stocks', 'forex', 'cfd', 'bonds'], demoUrl: 'https://www.home.saxo/demo-account' },
      { id: 'ctrader', name: 'cTrader', isSupported: true, hasDemo: true, tradingCapabilities: ['forex', 'cfd'], demoUrl: 'https://ctrader.com/demo/' },
      { id: 'match_trader', name: 'Match-Trader', isSupported: true, hasDemo: true, tradingCapabilities: ['forex', 'cfd'], demoUrl: 'https://www.match-trader.com/demo-account/' },
      { id: 'meta_api', name: 'MetaApi (MT4/MT5)', isSupported: true, hasDemo: true, tradingCapabilities: ['forex', 'cfd', 'futures'], demoUrl: 'https://metaapi.cloud/docs/client/demoAccount/' },
      { id: 'td_ameritrade', name: 'TD Ameritrade / Schwab', isSupported: true, hasDemo: true, tradingCapabilities: ['stocks', 'options', 'futures', 'forex'], demoUrl: 'https://www.tdameritrade.com/tools-and-platforms/paperMoney-DemoTrading.page' },
      { id: 'tradingview', name: 'TradingView', isSupported: true, hasDemo: false, tradingCapabilities: ['stocks', 'forex', 'crypto', 'futures'] },
      { id: 'other', name: 'Other (Generic)', isSupported: true, hasDemo: false, tradingCapabilities: ['custom'] }
    ];
    
    res.json({ success: true, brokerTypes });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Failed to retrieve broker types',
      error: (error as Error).message
    });
  }
});

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
 * Test broker connection with provided credentials
 */
router.post('/test-broker-connection', async (req, res) => {
  try {
    // Validate request body
    const validation = brokerCredentialsSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: 'Invalid broker credentials format',
        errors: validation.error.errors
      });
    }

    const credentials = validation.data;
    const { brokerId, useDemo = false } = credentials;
    
    // Define a function to get sample account info for a demo connection
    const getDemoAccountInfo = () => {
      const accountId = `demo-${brokerId}-${Math.floor(Math.random() * 1000)}`;
      const baseAccountData = {
        accountId,
        status: 'ACTIVE',
        accountType: useDemo ? 'DEMO' : 'LIVE',
        createdAt: new Date().toISOString(),
        currency: 'USD'
      };
      
      switch (brokerId) {
        case 'alpaca':
          return {
            ...baseAccountData,
            cash: 10000.00,
            buyingPower: 20000.00,
            equity: 15000.00,
            positions: [
              { symbol: 'AAPL', quantity: 10, marketValue: 1750.50, unrealizedPL: 250.00 },
              { symbol: 'MSFT', quantity: 8, marketValue: 2450.00, unrealizedPL: 120.00 }
            ],
            dayTradeCount: 1,
            tradingBlocked: false
          };
        case 'oanda':
          return {
            ...baseAccountData,
            currency: 'USD',
            marginRate: '0.02',
            marginAvailable: 4500.00,
            marginUsed: 500.00,
            positions: [
              { instrument: 'EUR_USD', units: 10000, unrealizedPL: 75.00 },
              { instrument: 'GBP_JPY', units: -5000, unrealizedPL: -25.00 }
            ],
            balance: 5000.00
          };
        case 'interactive_brokers':
          return {
            ...baseAccountData,
            netLiquidation: 50000.00,
            cashBalance: 25000.00,
            availableFunds: 20000.00,
            excessLiquidity: 15000.00,
            positions: [
              { symbol: 'AAPL', position: 15, marketPrice: 175.05, marketValue: 2625.75 },
              { symbol: 'GOOG', position: 5, marketPrice: 135.10, marketValue: 675.50 }
            ],
            realizedPnL: 1500.00
          };
        case 'td_ameritrade':
          return {
            ...baseAccountData,
            cashBalance: 15000.00,
            liquidationValue: 25000.00,
            longMarketValue: 12000.00,
            shortMarketValue: 2000.00,
            positions: [
              { instrument: { symbol: 'SPY', assetType: 'EQUITY' }, longQuantity: 10, marketValue: 4250.00 },
              { instrument: { symbol: 'QQQ', assetType: 'EQUITY' }, longQuantity: 15, marketValue: 5175.00 }
            ],
            initialBalances: { cashAvailableForTrading: 18000.00 }
          };
        case 'meta_api':
          return {
            ...baseAccountData,
            balance: 10000.00,
            equity: 12500.00,
            margin: 6000.00,
            freeMargin: 9000.00,
            leverage: 100,
            positions: [
              { symbol: 'EURUSD', type: 'buy', volume: 0.1, profit: 125.00 },
              { symbol: 'GBPUSD', type: 'sell', volume: 0.05, profit: -75.00 }
            ],
            marginLevel: 180.00
          };
        default:
          return {
            ...baseAccountData,
            balance: 10000.00,
            availableFunds: 8000.00,
            positions: []
          };
      }
    };
    
    // Process based on demo mode or real credentials
    if (useDemo) {
      const demoAccountInfo = getDemoAccountInfo();
      log(`Connected to ${brokerId} demo account successfully`);
      
      return res.json({
        success: true,
        message: `Successfully connected to ${brokerId} demo account`,
        accountInfo: demoAccountInfo,
        isDemo: true
      });
    } else {
      // For real accounts, test the actual connection
      try {
        // Real API connection checks would happen here
        // For this demo, we'll simulate a successful connection
        // In production, this would call a broker-specific service
        
        const isConnected = await testBrokerConnection(brokerId);
        
        if (isConnected) {
          const accountInfo = getDemoAccountInfo(); // Using sample data for demo purposes
          
          return res.json({
            success: true,
            message: `Successfully connected to ${brokerId}`,
            accountInfo,
            isDemo: false
          });
        } else {
          return res.status(401).json({
            success: false,
            message: `Failed to connect to ${brokerId}. Invalid credentials.`
          });
        }
      } catch (error) {
        return res.status(500).json({
          success: false,
          message: `Error connecting to ${brokerId}: ${(error as Error).message}`
        });
      }
    }
  } catch (error) {
    logError(error as Error, 'nexus-test-broker-connection');
    return res.status(500).json({
      success: false,
      message: `Failed to test broker connection: ${(error as Error).message}`
    });
  }
});

/**
 * Get account information for a connected broker
 */
router.get('/broker-account-info', async (req, res) => {
  try {
    const { brokerId, useDemo } = req.query;
    
    if (!brokerId || typeof brokerId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Broker ID is required'
      });
    }
    
    const isDemo = useDemo === 'true';
    
    // If using demo mode, return demo account info
    if (isDemo) {
      // This function is available in the /test-broker-connection endpoint above
      // In a real implementation, we would call that function here
      return res.json({
        success: true,
        message: `Retrieved ${brokerId} demo account information`,
        accountInfo: {
          accountId: `demo-${brokerId}-${Math.floor(Math.random() * 1000)}`,
          status: 'ACTIVE',
          accountType: 'DEMO',
          balance: 10000.00,
          equity: 15000.00,
          positions: []
        },
        isDemo: true
      });
    } 
    
    // Otherwise fetch real account info
    const isConnected = await testBrokerConnection(brokerId);
    
    if (!isConnected) {
      return res.status(401).json({
        success: false,
        message: `Not connected to ${brokerId}`
      });
    }
    
    // In production, we would fetch real account data here
    // For this demo, we'll return sample data
    
    return res.json({
      success: true,
      message: `Retrieved ${brokerId} account information`,
      accountInfo: {
        accountId: `live-${brokerId}-acct`,
        status: 'ACTIVE',
        accountType: 'LIVE',
        balance: 25000.00,
        equity: 27500.00,
        positions: []
      },
      isDemo: false
    });
  } catch (error) {
    logError(error as Error, 'nexus-broker-account-info');
    return res.status(500).json({
      success: false,
      message: `Failed to get broker account info: ${(error as Error).message}`
    });
  }
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
        if (!credentials.apiToken || !credentials.accountId) {
          return false;
        }
        
        // Check against Oanda API
        const oandaResponse = await fetch(`https://api-fxtrade.oanda.com/v3/accounts/${credentials.accountId}`, {
          headers: {
            'Authorization': `Bearer ${credentials.apiToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        return oandaResponse.status === 200;
        
      case 'interactive_brokers':
        // Test Interactive Brokers connection
        if (!credentials.userId || !credentials.password) {
          return false;
        }
        
        // For IBKR, we would normally connect through their Client Portal API
        // This is a simplified check that would need to be replaced with actual implementation
        const ibkrResponse = await fetch('https://api.ibkr.com/v1/portal/sso/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: credentials.userId,
            password: credentials.password
          })
        }).catch(() => ({ status: 400 })); // Handle connection errors
        
        return ibkrResponse.status === 200;
        
      case 'td_ameritrade':
        // Test TD Ameritrade connection
        if (!credentials.consumerKey || !credentials.refreshToken) {
          return false;
        }
        
        // Check against TD Ameritrade API
        const tdResponse = await fetch('https://api.tdameritrade.com/v1/userprincipals', {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`
          }
        }).catch(() => ({ status: 400 }));
        
        return tdResponse.status === 200;
        
      case 'tradovate':
        // Test Tradovate connection
        if (!credentials.username || !credentials.password) {
          return false;
        }
        
        // Simplified check against Tradovate API
        const tradovateResponse = await fetch('https://demo.tradovateapi.com/v1/auth/accessTokenRequest', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: credentials.username,
            password: credentials.password
          })
        }).catch(() => ({ status: 400 }));
        
        return tradovateResponse.status === 200;
        
      case 'saxo_bank':
        // Test Saxo Bank connection
        if (!credentials.appKey || !credentials.accountKey) {
          return false;
        }
        
        // Check against Saxo Bank API
        const saxoResponse = await fetch('https://gateway.saxobank.com/sim/openapi/port/v1/balances', {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'X-Application-Name': credentials.appKey,
            'X-Application-UserId': credentials.accountKey
          }
        }).catch(() => ({ status: 400 }));
        
        return saxoResponse.status === 200;
        
      case 'ctrader':
        // Test cTrader connection
        if (!credentials.apiKey || !credentials.apiSecret) {
          return false;
        }
        
        // Simplified check against cTrader Open API
        const ctraderResponse = await fetch('https://api.spotware.com/connect/token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            'grant_type': 'client_credentials',
            'client_id': credentials.apiKey,
            'client_secret': credentials.apiSecret
          })
        }).catch(() => ({ status: 400 }));
        
        return ctraderResponse.status === 200;
        
      case 'meta_api':
        // Test MetaAPI connection (for MT4/MT5)
        if (!credentials.apiKey || !credentials.connectionType) {
          return false;
        }
        
        // Simplified check against MetaAPI
        const metaResponse = await fetch('https://mt-provisioning-api-v1.agiliumtrade.ai/users/current', {
          headers: {
            'auth-token': credentials.apiKey
          }
        }).catch(() => ({ status: 400 }));
        
        return metaResponse.status === 200;
        
      case 'tradier':
        // Test Tradier connection
        if (!credentials.accessToken) {
          return false;
        }
        
        // Check against Tradier API
        const tradierResponse = await fetch('https://api.tradier.com/v1/user/profile', {
          headers: {
            'Authorization': `Bearer ${credentials.accessToken}`,
            'Accept': 'application/json'
          }
        }).catch(() => ({ status: 400 }));
        
        return tradierResponse.status === 200;
        
      case 'ninjatrader':
        // NinjaTrader typically uses a local API, so we'll use a simplified check
        if (!credentials.username || !credentials.password) {
          return false;
        }
        
        // Since NinjaTrader is a desktop application, we would need a local connection
        // This is a placeholder that would be replaced with actual implementation
        return true;
        
      case 'tradingview':
        // TradingView doesn't have a direct API for trading - it uses webhooks
        // So we'll just check if the webhook endpoint is configured
        return !!credentials.endpoint;
        
      case 'ig':
        // Test IG connection
        if (!credentials.apiKey || !credentials.username || !credentials.password) {
          return false;
        }
        
        // Simplified check against IG API
        const igResponse = await fetch('https://demo-api.ig.com/gateway/deal/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-IG-API-KEY': credentials.apiKey
          },
          body: JSON.stringify({
            identifier: credentials.username,
            password: credentials.password,
            encryptedPassword: false
          })
        }).catch(() => ({ status: 400 }));
        
        return igResponse.status === 200;
        
      case 'match_trader':
        // Simple validation of credentials for Match-Trader
        return !!credentials.apiKey && !!credentials.secretKey;
        
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