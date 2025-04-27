import express from 'express';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { and, eq, sql } from 'drizzle-orm';
import { Request, Response } from 'express';
import { TradingSignal, WalletData, JournalEntry, WebhookConfig, AIAnalysis } from '../../shared/models/UserContext';
import { apiCredentialManager } from '../services/api-credential-manager';
import { Connection, PublicKey } from '@solana/web3.js';
import { getMarketData } from '../services/market-data-service';

const router = express.Router();

// Middleware to check authentication
const requireAuth = (req: Request, res: Response, next: Function) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Unauthorized' });
  }
  next();
};

// Get user profile
router.get('/users/:userId/profile', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own profile
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query user from database
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, userId),
      columns: {
        id: true,
        email: true,
        username: true,
        membershipLevel: true,
        createdAt: true,
        lastLogin: true
      }
    });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({
      success: true,
      profile: user
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile' });
  }
});

// Get user wallet data
router.get('/users/:userId/wallet', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own wallet
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query wallet from database
    const wallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, userId)
    });
    
    if (!wallet) {
      return res.status(404).json({ 
        success: false, 
        message: 'Wallet not found',
        walletConnected: false
      });
    }
    
    // Start with basic wallet data
    const walletData: Partial<WalletData> = {
      address: wallet.address,
      balances: {
        sol: 0,
        thc: 0,
        usdc: 0
      },
      transactions: [],
      nfts: []
    };
    
    // If wallet is connected, fetch additional Solana data
    if (wallet.address) {
      try {
        // Get Solana RPC URL from environment
        const solanaRpcUrl = process.env.SOLANA_RPC_URL;
        
        if (solanaRpcUrl) {
          // Create a Solana connection
          const connection = new Connection(solanaRpcUrl);
          
          // Get SOL balance
          const publicKey = new PublicKey(wallet.address);
          const balance = await connection.getBalance(publicKey);
          walletData.balances!.sol = balance / 1e9; // Convert lamports to SOL
          
          // Get THC token balance (if we have the token address)
          const thcTokenAddress = process.env.THC_TOKEN_ADDRESS;
          if (thcTokenAddress) {
            // In a full implementation, we would fetch the token balance here
            // But we'll leave this for future implementation
          }
          
          // Recent transactions (would normally fetch from Solana)
          // This is a placeholder for real implementation
          walletData.transactions = await db.query.transactions.findMany({
            where: eq(schema.transactions.walletAddress, wallet.address),
            orderBy: [{ createdAt: 'desc' }],
            limit: 10
          });
          
          // NFTs (would normally fetch from Solana)
          // This is a placeholder for real implementation
          walletData.nfts = await db.query.nfts.findMany({
            where: eq(schema.nfts.owner, wallet.address),
            orderBy: [{ createdAt: 'desc' }],
            limit: 20
          });
        }
      } catch (error) {
        console.error('Error fetching Solana data:', error);
        // Continue with basic wallet data even if Solana fetch fails
      }
    }
    
    res.json({
      success: true,
      walletConnected: true,
      ...walletData
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet data' });
  }
});

// Get connected brokers
router.get('/users/:userId/brokers', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own brokers
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query connected brokers from database
    const brokers = await db.query.brokerConnections.findMany({
      where: eq(schema.brokerConnections.userId, userId),
      columns: {
        id: true,
        brokerId: true,
        name: true,
        isDemo: true,
        lastSynced: true,
        status: true,
        accountIds: true,
        createdAt: true,
        updatedAt: true
      }
    });
    
    // For security, we don't include actual credentials in the response
    const safeData = brokers.map(broker => ({
      id: broker.brokerId,
      name: broker.name,
      isDemo: broker.isDemo,
      lastSynced: broker.lastSynced,
      status: broker.status,
      accountIds: broker.accountIds || [],
      hasValidCredentials: true
    }));
    
    res.json(safeData);
  } catch (error) {
    console.error('Error fetching connected brokers:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch broker connections' });
  }
});

// Connect a new broker
router.post('/users/:userId/brokers', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const brokerData = req.body;
    
    // Verify the user is adding to their own account
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Basic validation
    if (!brokerData.id || !brokerData.credentials) {
      return res.status(400).json({ success: false, message: 'Missing required broker data' });
    }
    
    // Store broker API credentials securely
    await apiCredentialManager.saveCredentials(
      brokerData.id, 
      brokerData.credentials,
      userId
    );
    
    // Add broker connection to database
    const broker = await db.insert(schema.brokerConnections).values({
      userId,
      brokerId: brokerData.id,
      name: brokerData.name,
      isDemo: brokerData.isDemo || false,
      status: 'connected',
      accountIds: brokerData.accountIds || [],
      lastSynced: new Date()
    }).returning();
    
    res.json({
      success: true,
      broker: {
        id: brokerData.id,
        name: brokerData.name,
        isDemo: brokerData.isDemo || false,
        status: 'connected',
        lastSynced: new Date(),
        accountIds: brokerData.accountIds || []
      }
    });
  } catch (error) {
    console.error('Error connecting broker:', error);
    res.status(500).json({ success: false, message: 'Failed to connect broker' });
  }
});

// Disconnect a broker
router.delete('/users/:userId/brokers/:brokerId', requireAuth, async (req, res) => {
  try {
    const { userId, brokerId } = req.params;
    const isDemo = req.query.isDemo === 'true';
    
    // Verify the user is removing from their own account
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Remove broker connection from database
    await db.delete(schema.brokerConnections).where(
      and(
        eq(schema.brokerConnections.userId, userId),
        eq(schema.brokerConnections.brokerId, brokerId),
        eq(schema.brokerConnections.isDemo, isDemo)
      )
    );
    
    // Remove stored credentials
    await apiCredentialManager.deleteCredentials(brokerId, userId);
    
    res.json({
      success: true,
      message: 'Broker disconnected successfully'
    });
  } catch (error) {
    console.error('Error disconnecting broker:', error);
    res.status(500).json({ success: false, message: 'Failed to disconnect broker' });
  }
});

// Get user's saved trading signals
router.get('/users/:userId/signals', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own signals
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query signals from database
    const signals = await db.query.tradingSignals.findMany({
      where: eq(schema.tradingSignals.userId, userId),
      orderBy: [{ timestamp: 'desc' }]
    });
    
    res.json({
      success: true,
      signals
    });
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch trading signals' });
  }
});

// Save a trading signal
router.post('/users/:userId/signals', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const signalData: TradingSignal = req.body;
    
    // Verify the user is saving to their own account
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Basic validation
    if (!signalData.id || !signalData.symbol) {
      return res.status(400).json({ success: false, message: 'Missing required signal data' });
    }
    
    // Check if signal already exists
    const existingSignal = await db.query.tradingSignals.findFirst({
      where: and(
        eq(schema.tradingSignals.id, signalData.id),
        eq(schema.tradingSignals.userId, userId)
      )
    });
    
    if (existingSignal) {
      return res.status(400).json({ success: false, message: 'Signal already saved' });
    }
    
    // Save signal to database
    const signal = await db.insert(schema.tradingSignals).values({
      ...signalData,
      userId,
      timestamp: new Date(signalData.timestamp)
    }).returning();
    
    res.json({
      success: true,
      signal: signal[0]
    });
  } catch (error) {
    console.error('Error saving trading signal:', error);
    res.status(500).json({ success: false, message: 'Failed to save trading signal' });
  }
});

// Get user's journal entries
router.get('/users/:userId/journal', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own journal
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query journal entries from database
    const entries = await db.query.journalEntries.findMany({
      where: eq(schema.journalEntries.userId, userId),
      orderBy: [{ timestamp: 'desc' }]
    });
    
    res.json(entries);
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch journal entries' });
  }
});

// Add a journal entry
router.post('/users/:userId/journal', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const entryData: Omit<JournalEntry, 'id'> = req.body;
    
    // Verify the user is adding to their own journal
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Basic validation
    if (!entryData.title || !entryData.content) {
      return res.status(400).json({ success: false, message: 'Missing required journal data' });
    }
    
    // Add entry to database
    const entry = await db.insert(schema.journalEntries).values({
      userId,
      title: entryData.title,
      content: entryData.content,
      mood: entryData.mood || 'neutral',
      tags: entryData.tags || [],
      tradeIds: entryData.tradeIds || [],
      attachments: entryData.attachments || [],
      isPrivate: entryData.isPrivate || false,
      timestamp: new Date(entryData.timestamp) || new Date()
    }).returning();
    
    res.json(entry[0]);
  } catch (error) {
    console.error('Error adding journal entry:', error);
    res.status(500).json({ success: false, message: 'Failed to add journal entry' });
  }
});

// Get user's webhooks
router.get('/users/:userId/webhooks', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own webhooks
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query webhooks from database
    const webhooks = await db.query.webhooks.findMany({
      where: eq(schema.webhooks.userId, userId)
    });
    
    // For security, don't include webhook secrets in the response
    const safeWebhooks = webhooks.map(webhook => ({
      ...webhook,
      secret: webhook.secret ? '********' : undefined
    }));
    
    res.json(safeWebhooks);
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch webhooks' });
  }
});

// Create a webhook
router.post('/users/:userId/webhooks', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const webhookData: Omit<WebhookConfig, 'id' | 'createdAt'> = req.body;
    
    // Verify the user is creating their own webhook
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Basic validation
    if (!webhookData.name || !webhookData.url) {
      return res.status(400).json({ success: false, message: 'Missing required webhook data' });
    }
    
    // Generate a webhook secret if not provided
    if (!webhookData.secret) {
      webhookData.secret = generateWebhookSecret();
    }
    
    // Add webhook to database
    const webhook = await db.insert(schema.webhooks).values({
      userId,
      name: webhookData.name,
      url: webhookData.url,
      brokerTarget: webhookData.brokerTarget,
      signalTarget: webhookData.signalTarget,
      journalTarget: webhookData.journalTarget || false,
      active: webhookData.active !== undefined ? webhookData.active : true,
      secret: webhookData.secret,
      customFields: webhookData.customFields || {},
      createdAt: new Date()
    }).returning();
    
    // For security, don't return the secret directly
    const safeWebhook = {
      ...webhook[0],
      secret: '********'
    };
    
    res.json(safeWebhook);
  } catch (error) {
    console.error('Error creating webhook:', error);
    res.status(500).json({ success: false, message: 'Failed to create webhook' });
  }
});

// Get AI analysis for a symbol
router.get('/analysis/:symbol', async (req, res) => {
  try {
    const { symbol } = req.params;
    
    // Check if we have any cached analysis first
    const cachedAnalysis = await db.query.aiAnalysis.findFirst({
      where: eq(schema.aiAnalysis.symbol, symbol),
      orderBy: [{ timestamp: 'desc' }]
    });
    
    // If we have recent analysis (less than 1 hour old), return it
    if (cachedAnalysis && 
        ((new Date().getTime() - new Date(cachedAnalysis.timestamp).getTime()) < 60 * 60 * 1000)) {
      return res.json(cachedAnalysis);
    }
    
    // Otherwise, get market data to generate analysis
    const marketData = await getMarketData(symbol);
    
    if (!marketData) {
      return res.status(404).json({ success: false, message: 'No market data available for this symbol' });
    }
    
    // Generate analysis based on market data
    // In a full implementation, this would call an AI service
    // For now, we'll create a simplified version
    const analysis: AIAnalysis = {
      id: `${symbol}-${Date.now()}`,
      timestamp: new Date(),
      symbol,
      timeframe: '1d',
      direction: marketData.priceChange > 0 ? 'bullish' : marketData.priceChange < 0 ? 'bearish' : 'neutral',
      confidence: Math.min(Math.abs(marketData.priceChangePercent) / 10, 0.9),
      signals: [],
      supportLevels: [
        marketData.price * 0.95,
        marketData.price * 0.90
      ],
      resistanceLevels: [
        marketData.price * 1.05,
        marketData.price * 1.10
      ],
      keyMetrics: {
        volume: marketData.volume,
        volatility: marketData.volatility || 0,
        rsi: marketData.rsi || 50
      },
      summary: `Analysis based on recent market data. ${
        marketData.priceChange > 0 
          ? 'Price is showing upward momentum.' 
          : marketData.priceChange < 0 
            ? 'Price is in a downtrend.' 
            : 'Price is consolidating.'
      }`
    };
    
    // In a real implementation, we would store this analysis
    await db.insert(schema.aiAnalysis).values(analysis);
    
    res.json(analysis);
  } catch (error) {
    console.error('Error getting AI analysis:', error);
    res.status(500).json({ success: false, message: 'Failed to get AI analysis' });
  }
});

// Connect wallet to user account
router.post('/users/:userId/wallet', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const { provider, address } = req.body;
    
    // Verify the user is connecting to their own account
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Basic validation
    if (!address) {
      return res.status(400).json({ success: false, message: 'Missing wallet address' });
    }
    
    // Validate as Solana public key
    try {
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid Solana address' });
    }
    
    // Check if user already has a wallet
    const existingWallet = await db.query.wallets.findFirst({
      where: eq(schema.wallets.userId, userId)
    });
    
    if (existingWallet) {
      // Update existing wallet
      await db.update(schema.wallets)
        .set({
          address,
          provider: provider || existingWallet.provider,
          updatedAt: new Date()
        })
        .where(eq(schema.wallets.userId, userId));
    } else {
      // Add new wallet
      await db.insert(schema.wallets).values({
        userId,
        address,
        provider: provider || 'unknown',
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    res.json({
      success: true,
      walletConnected: true,
      address
    });
  } catch (error) {
    console.error('Error connecting wallet:', error);
    res.status(500).json({ success: false, message: 'Failed to connect wallet' });
  }
});

// Get wallet balances and transactions
router.get('/wallet/:address/balances', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Validate as Solana public key
    try {
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({ success: false, message: 'Invalid Solana address' });
    }
    
    // Get Solana RPC URL from environment
    const solanaRpcUrl = process.env.SOLANA_RPC_URL;
    
    if (!solanaRpcUrl) {
      return res.status(500).json({ success: false, message: 'Solana RPC URL not configured' });
    }
    
    // Create a Solana connection
    const connection = new Connection(solanaRpcUrl);
    
    // Get SOL balance
    const publicKey = new PublicKey(address);
    const balance = await connection.getBalance(publicKey);
    
    const balances = {
      sol: balance / 1e9, // Convert lamports to SOL
      thc: 0,
      usdc: 0
    };
    
    // Get THC token balance (if we have the token address)
    const thcTokenAddress = process.env.THC_TOKEN_ADDRESS;
    if (thcTokenAddress) {
      // In a full implementation, we would fetch the token balance here
      // But we'll leave this for future implementation
    }
    
    // Get recent transactions
    // In a full implementation, we would get real transactions from Solana
    const transactions = await db.query.transactions.findMany({
      where: eq(schema.transactions.walletAddress, address),
      orderBy: [{ createdAt: 'desc' }],
      limit: 10
    });
    
    res.json({
      success: true,
      address,
      balances,
      transactions
    });
  } catch (error) {
    console.error('Error fetching wallet data:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch wallet data' });
  }
});

// Get user preferences
router.get('/users/:userId/preferences', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Verify the user is requesting their own preferences
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Query preferences from database
    const preferences = await db.query.userPreferences.findFirst({
      where: eq(schema.userPreferences.userId, userId)
    });
    
    if (!preferences) {
      // Return default preferences
      return res.json({
        darkMode: true,
        notificationsEnabled: true,
        aiEnabled: true
      });
    }
    
    res.json(preferences.preferences);
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user preferences' });
  }
});

// Update user preferences and sync other data
router.post('/users/:userId/sync', requireAuth, async (req, res) => {
  try {
    const { userId } = req.params;
    const updates = req.body;
    
    // Verify the user is updating their own data
    if (req.session.userId !== userId) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }
    
    // Update preferences if provided
    if (updates.preferences) {
      const existingPrefs = await db.query.userPreferences.findFirst({
        where: eq(schema.userPreferences.userId, userId)
      });
      
      if (existingPrefs) {
        await db.update(schema.userPreferences)
          .set({
            preferences: {
              ...existingPrefs.preferences,
              ...updates.preferences
            },
            updatedAt: new Date()
          })
          .where(eq(schema.userPreferences.userId, userId));
      } else {
        await db.insert(schema.userPreferences).values({
          userId,
          preferences: updates.preferences,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }
    
    // Update favorite symbols if provided
    if (updates.favoriteSymbols) {
      await db.update(schema.users)
        .set({
          favoriteSymbols: updates.favoriteSymbols,
          updatedAt: new Date()
        })
        .where(eq(schema.users.id, userId));
    }
    
    res.json({
      success: true,
      message: 'User data synced successfully'
    });
  } catch (error) {
    console.error('Error syncing user data:', error);
    res.status(500).json({ success: false, message: 'Failed to sync user data' });
  }
});

// Helper function to generate a random webhook secret
function generateWebhookSecret() {
  return Buffer.from(Math.random().toString(36).substring(2) + Date.now().toString()).toString('base64');
}

export default router;