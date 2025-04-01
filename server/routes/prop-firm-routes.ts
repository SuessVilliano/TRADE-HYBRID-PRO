import express, { Request, Response } from 'express';
import { z } from 'zod';
import { auth } from '../middleware/auth-middleware';
import { admin } from '../middleware/admin-middleware';
import { PropFirmService } from '../lib/services/prop-firm-service';
import { validateRequest } from '../middleware/validation-middleware';

const router = express.Router();
const propFirmService = new PropFirmService();

/**
 * Schema for creating a new challenge
 */
const createChallengeSchema = z.object({
  name: z.string().min(3).max(100),
  description: z.string().min(10).max(500),
  accountSize: z.number().positive(),
  targetProfitPhase1: z.number().positive(),
  targetProfitPhase2: z.number().positive().optional(),
  maxDailyDrawdown: z.number().min(0).max(100),
  maxTotalDrawdown: z.number().min(0).max(100),
  durationDays: z.number().int().positive(),
  minTradingDays: z.number().int().min(0).optional(),
  brokerTypeId: z.number().int().positive().optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for signing up for a challenge
 */
const signupChallengeSchema = z.object({
  challengeId: z.number().int().positive(),
  accountName: z.string().min(3).max(50),
});

/**
 * Schema for adding a trade
 */
const addTradeSchema = z.object({
  accountId: z.number().int().positive(),
  symbol: z.string().min(1).max(20),
  direction: z.enum(['buy', 'sell', 'Buy', 'Sell']),
  entryPrice: z.number().positive(),
  exitPrice: z.number().positive().optional(),
  quantity: z.number().positive(),
  profit: z.number().optional(),
  entryTimestamp: z.string().datetime().optional(),
  exitTimestamp: z.string().datetime().optional(),
  active: z.boolean().optional(),
});

/**
 * Schema for requesting a payout
 */
const requestPayoutSchema = z.object({
  accountId: z.number().int().positive(),
  amount: z.number().positive(),
  paymentMethod: z.string().min(3).max(50),
});

/**
 * Schema for evaluating a challenge
 */
const evaluateChallengeSchema = z.object({
  accountId: z.number().int().positive(),
});

/**
 * Schema for adding a daily metric
 */
const addMetricSchema = z.object({
  accountId: z.number().int().positive(),
  date: z.string().datetime(),
  balance: z.number().positive(),
  equity: z.number().positive(),
  dailyPnl: z.number(),
  dailyPnlPercent: z.number(),
  drawdown: z.number().min(0),
  drawdownPercent: z.number().min(0),
  totalTrades: z.number().int().min(0),
  winningTrades: z.number().int().min(0),
  losingTrades: z.number().int().min(0),
  winRate: z.number().min(0).max(100),
});

/**
 * Schema for getting metrics with date range
 */
const getMetricsSchema = z.object({
  startDate: z.string().datetime(),
  endDate: z.string().datetime(),
});

// Get all challenges (public)
router.get('/challenges', async (req: Request, res: Response) => {
  try {
    const challenges = await propFirmService.getAllChallenges();
    res.status(200).json(challenges);
  } catch (error) {
    console.error('Error fetching challenges:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get a challenge by ID (public)
router.get('/challenges/:id', async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    const challenge = await propFirmService.getChallengeById(id);
    
    if (!challenge) {
      return res.status(404).json({ error: 'Challenge not found' });
    }
    
    res.status(200).json(challenge);
  } catch (error) {
    console.error('Error fetching challenge:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new challenge (admin only)
router.post('/challenges', 
  auth, 
  admin, 
  validateRequest(createChallengeSchema), 
  async (req: Request, res: Response) => {
    try {
      const challenge = await propFirmService.createChallenge(req.body);
      res.status(201).json(challenge);
    } catch (error) {
      console.error('Error creating challenge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update a challenge (admin only)
router.put('/challenges/:id', 
  auth, 
  admin, 
  validateRequest(createChallengeSchema), 
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const challenge = await propFirmService.updateChallenge(id, req.body);
      
      if (!challenge) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
      
      res.status(200).json(challenge);
    } catch (error) {
      console.error('Error updating challenge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Delete a challenge (admin only)
router.delete('/challenges/:id', 
  auth, 
  admin, 
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const success = await propFirmService.deleteChallenge(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Challenge not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Sign up for a challenge (authenticated users)
router.post('/signup', 
  auth, 
  validateRequest(signupChallengeSchema), 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = req.user.id;
      const { challengeId, accountName } = req.body;
      
      const account = await propFirmService.signUpForChallenge(userId, challengeId, accountName);
      res.status(201).json(account);
    } catch (error: any) {
      console.error('Error signing up for challenge:', error);
      
      if (error.message === 'Challenge not found' || error.message === 'Challenge is not active') {
        return res.status(404).json({ error: error.message });
      }
      
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get user's accounts
router.get('/accounts', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const userId = req.user.id;
      const accounts = await propFirmService.getUserAccounts(userId);
      res.status(200).json(accounts);
    } catch (error) {
      console.error('Error fetching accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get all accounts (admin only)
router.get('/admin/accounts', 
  auth, 
  admin, 
  async (req: Request, res: Response) => {
    try {
      const accounts = await propFirmService.getAllAccounts();
      res.status(200).json(accounts);
    } catch (error) {
      console.error('Error fetching all accounts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get account by ID
router.get('/accounts/:id', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const id = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(id);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      res.status(200).json(account);
    } catch (error) {
      console.error('Error fetching account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update account (admin only)
router.put('/admin/accounts/:id', 
  auth, 
  admin, 
  async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const account = await propFirmService.updateAccount(id, req.body);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      res.status(200).json(account);
    } catch (error) {
      console.error('Error updating account:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get account trades
router.get('/accounts/:id/trades', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const trades = await propFirmService.getAccountTrades(accountId);
      res.status(200).json(trades);
    } catch (error) {
      console.error('Error fetching trades:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Add a trade to an account
router.post('/accounts/:id/trades', 
  auth, 
  validateRequest(addTradeSchema), 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Check if trading is allowed
      if (!account.tradingAllowed) {
        return res.status(403).json({ error: 'Trading is not allowed for this account' });
      }
      
      const trade = await propFirmService.addTrade(accountId, req.body);
      res.status(201).json(trade);
    } catch (error) {
      console.error('Error adding trade:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Update a trade
router.put('/trades/:id', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const tradeId = parseInt(req.params.id);
      const trade = await propFirmService.getTradeById(tradeId);
      
      if (!trade) {
        return res.status(404).json({ error: 'Trade not found' });
      }
      
      // Get account associated with this trade
      const account = await propFirmService.getAccountById(trade.accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const updatedTrade = await propFirmService.updateTrade(tradeId, req.body);
      res.status(200).json(updatedTrade);
    } catch (error) {
      console.error('Error updating trade:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get account metrics
router.get('/accounts/:id/metrics', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Parse date range if provided
      let startDate, endDate;
      if (req.query.startDate && req.query.endDate) {
        try {
          const result = getMetricsSchema.parse({
            startDate: req.query.startDate,
            endDate: req.query.endDate
          });
          startDate = new Date(result.startDate);
          endDate = new Date(result.endDate);
        } catch (error) {
          return res.status(400).json({ error: 'Invalid date format' });
        }
      }
      
      const metrics = await propFirmService.getAccountMetrics(accountId, startDate, endDate);
      res.status(200).json(metrics);
    } catch (error) {
      console.error('Error fetching metrics:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Add a daily metric
router.post('/accounts/:id/metrics', 
  auth, 
  validateRequest(addMetricSchema), 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // For metrics, only admin can add them
      if (!req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const metric = await propFirmService.addMetric(accountId, req.body);
      res.status(201).json(metric);
    } catch (error) {
      console.error('Error adding metric:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Get account payouts
router.get('/accounts/:id/payouts', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      const payouts = await propFirmService.getAccountPayouts(accountId);
      res.status(200).json(payouts);
    } catch (error) {
      console.error('Error fetching payouts:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Request a payout
router.post('/accounts/:id/payouts', 
  auth, 
  validateRequest(requestPayoutSchema), 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account
      if (account.userId !== req.user.id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Check if account is funded
      if (account.accountType !== 'funded' || account.status !== 'active') {
        return res.status(403).json({ error: 'Only funded accounts can request payouts' });
      }
      
      const { amount, paymentMethod } = req.body;
      
      // Calculate available payout amount
      const profit = account.currentBalance - account.accountSize;
      const availableAmount = profit * (account.profitSplit / 100);
      
      if (amount > availableAmount || profit <= 0) {
        return res.status(400).json({ 
          error: 'Requested amount exceeds available payout amount',
          availableAmount
        });
      }
      
      const payout = await propFirmService.requestPayout(accountId, amount, paymentMethod);
      res.status(201).json(payout);
    } catch (error) {
      console.error('Error requesting payout:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Process a payout (admin only)
router.put('/admin/payouts/:id', 
  auth, 
  admin, 
  async (req: Request, res: Response) => {
    try {
      const payoutId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status || !['processed', 'paid', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
      }
      
      const payout = await propFirmService.updatePayoutStatus(payoutId, status);
      
      if (!payout) {
        return res.status(404).json({ error: 'Payout not found' });
      }
      
      res.status(200).json(payout);
    } catch (error) {
      console.error('Error processing payout:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Evaluate a challenge
router.post('/accounts/:id/evaluate', 
  auth, 
  async (req: Request, res: Response) => {
    try {
      if (!req.user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      
      const accountId = parseInt(req.params.id);
      const account = await propFirmService.getAccountById(accountId);
      
      if (!account) {
        return res.status(404).json({ error: 'Account not found' });
      }
      
      // Check if user owns this account or is admin
      if (account.userId !== req.user.id && !req.user.isAdmin) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      // Check if account is a challenge
      if (!account.accountType.startsWith('challenge_') || account.status !== 'active') {
        return res.status(400).json({ error: 'Only active challenges can be evaluated' });
      }
      
      const result = await propFirmService.evaluateChallenge(accountId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error evaluating challenge:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

export default router;