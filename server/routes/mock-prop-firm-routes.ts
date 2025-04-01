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

export default router;