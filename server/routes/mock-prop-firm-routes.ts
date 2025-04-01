import express from 'express';
import { MockPropFirmService } from '../lib/services/mock-prop-firm-service';
import { authMiddleware } from '../middleware/auth-middleware';
import { featureAccessMiddleware } from '../middleware/feature-access-middleware';

// Type definition for Express User - this augmentation is already done in server/types/express/index.d.ts

// Helper function to safely get user from request
const getUser = (req: express.Request) => {
  // Use type assertion to access user property safely
  return (req as any).user;
};

// Helper function to check if user is admin
const isAdmin = (req: express.Request) => {
  const user = getUser(req);
  return user && user.isAdmin === true;
};

// Helper function to check if user has access to an account
const userHasAccessToAccount = (account: any, req: express.Request) => {
  const user = getUser(req);
  
  if (!user) {
    return false;
  }
  
  return account.userId === user.id || user.isAdmin;
};

// We are now using the actual middleware imported at the top of the file
// No need for the mock middleware definitions here anymore

const router = express.Router();
const propFirmService = new MockPropFirmService();

// Initialize Alpaca broker connection when the router is first loaded
(async () => {
  try {
    await propFirmService.initAlpacaBroker();
    console.log('Alpaca broker initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Alpaca broker:', error);
  }
})();

/**
 * Get all challenges
 */
router.get('/challenges', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const challenges = await propFirmService.getAllChallenges();
    res.json(challenges);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get challenge by ID
 */
router.get('/challenges/:id', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const challenge = await propFirmService.getChallengeById(Number(req.params.id));
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.json(challenge);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create a new challenge (admin only)
 */
router.post('/challenges', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const challenge = await propFirmService.createChallenge(req.body);
    res.status(201).json(challenge);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update a challenge (admin only)
 */
router.put('/challenges/:id', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const challenge = await propFirmService.updateChallenge(Number(req.params.id), req.body);
    res.json(challenge);
  } catch (err: any) {
    if (err.message === 'Challenge not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Delete a challenge (admin only)
 */
router.delete('/challenges/:id', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    await propFirmService.deleteChallenge(Number(req.params.id));
    res.status(204).end();
  } catch (err: any) {
    if (err.message === 'Challenge not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Sign up for a challenge
 */
router.post('/challenges/:id/signup', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const { accountName } = req.body;
    // Type assertion to safely access user properties
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = user.id;
    const challengeId = Number(req.params.id);
    
    if (!accountName) {
      return res.status(400).json({ error: 'Account name is required' });
    }
    
    const account = await propFirmService.signUpForChallenge(userId, challengeId, accountName);
    res.status(201).json(account);
  } catch (err: any) {
    if (err.message === 'Challenge not found' || err.message === 'This challenge is not currently active') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get user accounts
 */
router.get('/accounts', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    // Type assertion to safely access user properties
    const user = (req as any).user;
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const userId = user.id;
    const accounts = await propFirmService.getUserAccounts(userId);
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Create a new trading account (admin only)
 */
router.post('/admin/accounts', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const { 
      userId, 
      challengeId, 
      accountName, 
      accountType, 
      marketType, 
      brokerModel, 
      accountSize 
    } = req.body;
    
    if (!userId || !accountName || !accountType || !marketType || !brokerModel || !accountSize) {
      return res.status(400).json({ 
        error: 'Missing required fields. Required: userId, accountName, accountType, marketType, brokerModel, accountSize'
      });
    }
    
    // Get all accounts first
    const allAccounts = await propFirmService.getAllAccounts();
    
    // Create a new account entry
    const newId = Math.max(...allAccounts.map((a: any) => a.id)) + 1;
    
    const newAccount = {
      id: newId,
      userId,
      challengeId: challengeId || null,
      accountName,
      accountType,
      marketType,
      brokerModel,
      accountSize,
      currentBalance: accountSize,
      currentEquity: accountSize,
      profitTarget: null,
      maxDailyDrawdown: req.body.maxDailyDrawdown || 10,
      maxTotalDrawdown: req.body.maxTotalDrawdown || 20,
      minTradingDays: null,
      maxTradingDays: null,
      tradingAllowed: true,
      status: 'active',
      profitSplit: req.body.profitSplit || 80,
      startDate: new Date(),
      endDate: null,
      createdAt: new Date(),
      brokerLoginUrl: 'https://app.alpaca.markets/login',
      brokerLoginCredentials: {
        username: `trader_${userId}_${newId}`,
        password: `Generated password will be emailed to the trader`
      }
    };
    
    // Add the account to the service by creating a function
    await propFirmService.createChallenge(newAccount);
    
    res.status(201).json({
      success: true,
      account: newAccount,
      message: "Account created successfully. Broker login credentials will be provided to the trader."
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get all accounts (admin only)
 */
router.get('/admin/accounts', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const accounts = await propFirmService.getAllAccounts();
    res.json(accounts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get account by ID
 */
router.get('/accounts/:id', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const account = await propFirmService.getAccountById(Number(req.params.id));
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(account);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update account (admin only)
 */
router.put('/accounts/:id', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const account = await propFirmService.updateAccount(Number(req.params.id), req.body);
    res.json(account);
  } catch (err: any) {
    if (err.message === 'Account not found') {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get account trades
 */
router.get('/accounts/:id/trades', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trades = await propFirmService.getAccountTrades(accountId);
    res.json(trades);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add a trade to an account
 */
router.post('/accounts/:id/trades', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Get user safely
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add the user ID to the trade data
    const tradeData = {
      ...req.body,
      userId: user.id
    };
    
    const trade = await propFirmService.addTrade(accountId, tradeData);
    res.status(201).json(trade);
  } catch (err: any) {
    if (err.message === 'Account not found' || err.message === 'Trading is not allowed on this account') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update a trade
 */
router.put('/trades/:id', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const tradeId = Number(req.params.id);
    const originalTrade = await propFirmService.getTradeById(tradeId);
    
    if (!originalTrade) {
      return res.status(404).json({ error: 'Trade not found' });
    }
    
    // Get user safely
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Check if current user has access to this trade
    if (originalTrade.userId !== user.id && !user.isAdmin) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const trade = await propFirmService.updateTrade(tradeId, req.body);
    res.json(trade);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get account metrics
 */
router.get('/accounts/:id/metrics', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    let startDate, endDate;
    if (req.query.startDate && req.query.endDate) {
      startDate = new Date(req.query.startDate as string);
      endDate = new Date(req.query.endDate as string);
    }
    
    const metrics = await propFirmService.getAccountMetrics(accountId, startDate, endDate);
    res.json(metrics);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Add a daily metric
 */
router.post('/accounts/:id/metrics', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Only admins can manually add metrics
    if (!isAdmin(req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const metric = await propFirmService.addMetric(accountId, req.body);
    res.status(201).json(metric);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get account payouts
 */
router.get('/accounts/:id/payouts', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const payouts = await propFirmService.getAccountPayouts(accountId);
    res.json(payouts);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Request a payout
 */
router.post('/accounts/:id/payouts', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const { amount, paymentMethod } = req.body;
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Only funded accounts can request payouts
    if (account.accountType !== 'funded') {
      return res.status(400).json({ error: 'Only funded accounts can request payouts' });
    }
    
    const payout = await propFirmService.requestPayout(accountId, amount, paymentMethod);
    res.status(201).json(payout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Update payout status (admin only)
 */
router.put('/payouts/:id', authMiddleware, featureAccessMiddleware('prop_firm_admin'), async (req, res) => {
  try {
    const payoutId = Number(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: 'Status is required' });
    }
    
    const payout = await propFirmService.updatePayoutStatus(payoutId, status);
    
    if (!payout) {
      return res.status(404).json({ error: 'Payout not found' });
    }
    
    res.json(payout);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get broker data for a crypto trading account
 */
router.get('/accounts/:id/broker-data', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // If the account is of type crypto and using Alpaca
    if (account.marketType === 'crypto' && account.brokerModel === 'alpaca') {
      try {
        // Get broker data
        const brokerData = await propFirmService.getBrokerAccountData('alpaca');
        
        if (brokerData) {
          return res.json({
            success: true,
            account,
            brokerData
          });
        } else {
          return res.status(400).json({ 
            error: 'Unable to retrieve broker data',
            account 
          });
        }
      } catch (error: any) {
        return res.status(500).json({ 
          error: `Error retrieving broker data: ${error.message}`,
          account
        });
      }
    } else {
      return res.status(400).json({ 
        error: 'This endpoint is only available for crypto accounts using Alpaca',
        account
      });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Evaluate a challenge account
 */
router.post('/accounts/:id/evaluate', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    const result = await propFirmService.evaluateChallenge(accountId);
    res.json(result);
  } catch (err: any) {
    if (err.message === 'This account is not a challenge' || err.message === 'Challenge details not found') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get available crypto symbols for trading
 */
router.get('/crypto/symbols', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    // Initialize broker if needed
    if (!propFirmService.alpacaService) {
      await propFirmService.initAlpacaBroker();
    }
    
    if (!propFirmService.alpacaService) {
      return res.status(500).json({ error: 'Broker service not initialized' });
    }
    
    // This should be replaced with actual alpacaService.getAvailableAssets() method
    // For now, return a list of common crypto symbols
    const cryptoSymbols = [
      { symbol: 'BTC/USD', name: 'Bitcoin', description: 'Bitcoin cryptocurrency' },
      { symbol: 'ETH/USD', name: 'Ethereum', description: 'Ethereum cryptocurrency' },
      { symbol: 'SOL/USD', name: 'Solana', description: 'Solana cryptocurrency' },
      { symbol: 'AVAX/USD', name: 'Avalanche', description: 'Avalanche cryptocurrency' },
      { symbol: 'ADA/USD', name: 'Cardano', description: 'Cardano cryptocurrency' },
      { symbol: 'DOT/USD', name: 'Polkadot', description: 'Polkadot cryptocurrency' },
      { symbol: 'DOGE/USD', name: 'Dogecoin', description: 'Dogecoin cryptocurrency' },
      { symbol: 'SHIB/USD', name: 'Shiba Inu', description: 'Shiba Inu cryptocurrency' },
      { symbol: 'MATIC/USD', name: 'Polygon', description: 'Polygon cryptocurrency' },
      { symbol: 'LINK/USD', name: 'Chainlink', description: 'Chainlink cryptocurrency' }
    ];
    
    res.json(cryptoSymbols);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Get current market data for a specific crypto symbol
 */
router.get('/crypto/market-data/:symbol', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const symbol = req.params.symbol;
    
    // Initialize broker if needed
    if (!propFirmService.alpacaService) {
      await propFirmService.initAlpacaBroker();
    }
    
    if (!propFirmService.alpacaService) {
      return res.status(500).json({ error: 'Broker service not initialized' });
    }
    
    try {
      const quote = await propFirmService.alpacaService.getQuote(symbol);
      
      if (quote) {
        res.json(quote);
      } else {
        res.status(404).json({ error: `No market data found for symbol: ${symbol}` });
      }
    } catch (error: any) {
      res.status(400).json({ error: `Error fetching market data: ${error.message}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * Place a crypto trade for an account
 */
router.post('/accounts/:id/crypto/trade', authMiddleware, featureAccessMiddleware('prop_firm'), async (req, res) => {
  try {
    const accountId = Number(req.params.id);
    const account = await propFirmService.getAccountById(accountId);
    
    if (!account) {
      return res.status(404).json({ error: 'Account not found' });
    }
    
    // Check if current user has access to this account
    if (!userHasAccessToAccount(account, req)) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    // Verify this is a crypto account using Alpaca
    if (account.marketType !== 'crypto' || account.brokerModel !== 'alpaca') {
      return res.status(400).json({ 
        error: 'This endpoint is only available for crypto accounts using Alpaca'
      });
    }
    
    // Get user safely
    const user = getUser(req);
    if (!user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    // Add the user ID to the trade data
    const tradeData = {
      ...req.body,
      userId: user.id
    };
    
    // Place the trade through the propFirmService
    const trade = await propFirmService.addTrade(accountId, tradeData);
    res.status(201).json(trade);
  } catch (err: any) {
    if (err.message === 'Account not found' || err.message === 'Trading is not allowed on this account') {
      return res.status(400).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

export default router;