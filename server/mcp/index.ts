/**
 * MCP Server Main Module
 * 
 * This is the main entry point for the MCP (Message Control Plane) Server.
 * It initializes and coordinates all aspects of the message processing system.
 */

import { Server } from 'http';
import { Express, Request, Response, NextFunction } from 'express';
import { MCPServer } from './core/mcp-server';
import { MCPConfig, MCPMessageType } from './config/mcp-config';
import { TimeInterval } from './data/market-data-interface';
import { registerSignalProcessors } from './processors/signal-processor';
import { registerNotificationProcessors } from './processors/notification-processor';
import { registerTradeProcessor } from './processors/trade-execution-processor';
import { handleTradingViewWebhook } from './handlers/tradingview-webhook-handler-express';
import { 
  handleTradingViewDiscordWebhook,
  handlePythonMCPWebhook,
  handleTradeExecutionWebhook,
  handleTradeClosedWebhook
} from './handlers/tradingview-discord-handler-fixed';
import { initializeBrokerConnectionService } from './adapters/broker-connection-service';
import { initializeMarketDataManager } from './data/market-data-manager';
import { initializeSignalService } from './services/signal-service';
import { initializeSmartSignalRouter } from './processors/smart-signal-router';
import { initializeMarketInsightsService } from './services/market-insights-service';
import { initializeUserProfileService } from './services/user-profile-service';
import { initializeWebhookService } from './services/webhook-service';

// Singleton MCP server instance
let mcpServer: MCPServer | null = null;

/**
 * Initialize the MCP server
 */
export function initializeMCPServer(): MCPServer {
  if (!mcpServer) {
    console.log('[MCP] Initializing MCP Server...');
    mcpServer = MCPServer.getInstance();
    
    // Start the MCP server
    mcpServer.start();
    
    // Register processors
    registerSignalProcessors(mcpServer);
    registerNotificationProcessors(mcpServer);
    registerTradeProcessor(mcpServer);
    
    // Initialize broker connection service
    mcpServer.brokerConnectionService = initializeBrokerConnectionService(mcpServer);
    
    // Initialize market data manager
    mcpServer.marketDataManager = initializeMarketDataManager(mcpServer);
    
    // Initialize enhanced services
    mcpServer.signalService = initializeSignalService(mcpServer);
    mcpServer.smartSignalRouter = initializeSmartSignalRouter(mcpServer);
    mcpServer.marketInsightsService = initializeMarketInsightsService(mcpServer);
    mcpServer.userProfileService = initializeUserProfileService(mcpServer);
    mcpServer.webhookService = initializeWebhookService(mcpServer);
    
    console.log('[MCP] MCP Server initialized successfully with all services');
  }
  
  return mcpServer;
}

/**
 * Register MCP-related routes with Express
 */
export function registerMCPRoutes(app: Express, server: Server): void {
  const mcp = initializeMCPServer();
  
  // TradingView webhook endpoint
  app.post(MCPConfig.integrations.tradingView.webhookPath, (req: Request, res: Response) => {
    handleTradingViewWebhook(req, res, mcp);
  });
  
  // TradingView Discord webhook endpoint
  app.post('/api/webhooks/tradingview-discord', (req: Request, res: Response) => {
    handleTradingViewDiscordWebhook(req, res, mcp);
  });
  
  // Python MCP webhook endpoint
  app.post('/api/webhooks/python-mcp', (req: Request, res: Response) => {
    handlePythonMCPWebhook(req, res, mcp);
  });
  
  // Trade execution webhook endpoint
  app.post('/api/webhooks/trade-execution', (req: Request, res: Response) => {
    handleTradeExecutionWebhook(req, res, mcp);
  });
  
  // Trade closed webhook endpoint
  app.post('/api/webhooks/trade-closed', (req: Request, res: Response) => {
    handleTradeClosedWebhook(req, res, mcp);
  });
  
  // MCP status endpoint
  app.get('/api/mcp/status', (req: Request, res: Response) => {
    res.json({
      status: 'running',
      stats: mcp.getStatus()
    });
  });
  
  // Broker account info endpoint
  app.get('/api/mcp/brokers/:brokerId/account', async (req: Request, res: Response) => {
    try {
      const brokerId = req.params.brokerId;
      
      // Get broker connection service
      const brokerService = mcp.brokerConnectionService;
      if (!brokerService) {
        return res.status(500).json({ error: 'Broker connection service not initialized' });
      }
      
      // Get account info
      const accountInfo = await brokerService.getAccountInfo(brokerId);
      
      res.json({
        status: 'success',
        accountInfo
      });
    } catch (error) {
      console.error('Error fetching broker account info:', error);
      res.status(500).json({ 
        error: 'Failed to fetch broker account information',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Market data historical candles endpoint
  app.get('/api/mcp/market-data/candles', async (req: Request, res: Response) => {
    try {
      const { symbol, interval, from, to, provider } = req.query;
      
      if (!symbol || !interval || !from || !to) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['symbol', 'interval', 'from', 'to']
        });
      }
      
      // Get market data service
      const marketDataManager = mcp.marketDataManager;
      if (!marketDataManager) {
        return res.status(500).json({ error: 'Market data manager not initialized' });
      }
      
      // Get historical candles
      const candles = await marketDataManager.getHistoricalCandles(
        symbol as string,
        interval as TimeInterval,
        new Date(from as string),
        new Date(to as string),
        provider as string | undefined
      );
      
      res.json({
        status: 'success',
        symbol,
        interval,
        from,
        to,
        provider: provider || 'auto',
        candles
      });
    } catch (error) {
      console.error('Error fetching market data:', error);
      res.status(500).json({ 
        error: 'Failed to fetch market data',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Enhanced signals endpoint
  app.get('/api/mcp/signals', async (req: Request, res: Response) => {
    try {
      const { source, timeframe } = req.query;
      
      // Get signal service
      const signalService = mcp.signalService;
      if (!signalService) {
        return res.status(500).json({ error: 'Signal service not initialized' });
      }
      
      // Fetch signals with automatic retry
      const signals = await signalService.fetchSignals(
        source as string | undefined,
        timeframe as string | undefined
      );
      
      res.json({
        status: 'success',
        count: signals.length,
        source: source || 'all',
        timeframe: timeframe || 'all',
        signals
      });
    } catch (error) {
      console.error('Error fetching signals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch signals',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Technical analysis endpoint
  app.get('/api/mcp/analysis/technical', async (req: Request, res: Response) => {
    try {
      const { symbol, timeframe, refresh } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['symbol']
        });
      }
      
      // Get market insights service
      const insightsService = mcp.marketInsightsService;
      if (!insightsService) {
        return res.status(500).json({ error: 'Market insights service not initialized' });
      }
      
      // Get technical analysis
      const analysis = await insightsService.getTechnicalAnalysis(
        symbol as string,
        (timeframe as TimeInterval) || TimeInterval.ONE_HOUR,
        refresh === 'true'
      );
      
      res.json({
        status: 'success',
        analysis
      });
    } catch (error) {
      console.error('Error generating technical analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate technical analysis',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Market sentiment endpoint
  app.get('/api/mcp/analysis/sentiment', async (req: Request, res: Response) => {
    try {
      const { symbol, refresh } = req.query;
      
      // Get market insights service
      const insightsService = mcp.marketInsightsService;
      if (!insightsService) {
        return res.status(500).json({ error: 'Market insights service not initialized' });
      }
      
      // Get sentiment analysis
      const sentiment = await insightsService.getMarketSentiment(
        symbol as string | undefined,
        refresh === 'true'
      );
      
      res.json({
        status: 'success',
        sentiment
      });
    } catch (error) {
      console.error('Error generating market sentiment:', error);
      res.status(500).json({ 
        error: 'Failed to generate market sentiment',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Volatility analysis endpoint
  app.get('/api/mcp/analysis/volatility', async (req: Request, res: Response) => {
    try {
      const { symbol, timeframe, refresh } = req.query;
      
      if (!symbol) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['symbol']
        });
      }
      
      // Get market insights service
      const insightsService = mcp.marketInsightsService;
      if (!insightsService) {
        return res.status(500).json({ error: 'Market insights service not initialized' });
      }
      
      // Get volatility analysis
      const volatility = await insightsService.getVolatilityAnalysis(
        symbol as string,
        (timeframe as TimeInterval) || TimeInterval.ONE_DAY,
        refresh === 'true'
      );
      
      res.json({
        status: 'success',
        volatility
      });
    } catch (error) {
      console.error('Error generating volatility analysis:', error);
      res.status(500).json({ 
        error: 'Failed to generate volatility analysis',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Smart signal routing endpoint
  app.post('/api/mcp/signals/route', async (req: Request, res: Response) => {
    try {
      const { signalId, userId, strategy } = req.body;
      
      if (!signalId || !userId) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['signalId', 'userId']
        });
      }
      
      // Get signal service & router
      const signalService = mcp.signalService;
      const signalRouter = mcp.smartSignalRouter;
      
      if (!signalService || !signalRouter) {
        return res.status(500).json({ error: 'Signal services not initialized' });
      }
      
      // Get signal
      const signals = await signalService.getActiveSignals();
      const signal = signals.find(s => s.id === signalId);
      
      if (!signal) {
        return res.status(404).json({ error: `Signal not found: ${signalId}` });
      }
      
      // Route the signal
      const result = await signalRouter.routeSignal(signal, userId, strategy || 'auto');
      
      res.json({
        status: 'success',
        routing: result
      });
    } catch (error) {
      console.error('Error routing signal:', error);
      res.status(500).json({ 
        error: 'Failed to route signal',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // User profile endpoints
  
  // Get user profile
  app.get('/api/mcp/user/:userId/profile', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get user profile
      const profile = await userProfileService.getUserProfile(userId);
      
      if (!profile) {
        return res.status(404).json({ error: `User profile not found: ${userId}` });
      }
      
      res.json({
        status: 'success',
        profile
      });
    } catch (error) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user profile',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update user profile
  app.patch('/api/mcp/user/:userId/profile', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const updates = req.body;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Update user profile
      const updatedProfile = await userProfileService.updateUserProfile(userId, updates);
      
      res.json({
        status: 'success',
        profile: updatedProfile
      });
    } catch (error) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ 
        error: 'Failed to update user profile',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get user broker connections
  app.get('/api/mcp/user/:userId/broker-connections', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get broker connections
      const connections = await userProfileService.getUserBrokerConnections(userId);
      const connectionsArray = Array.from(connections.entries()).map(([brokerId, connection]) => ({
        brokerId,
        ...connection
      }));
      
      res.json({
        status: 'success',
        count: connectionsArray.length,
        connections: connectionsArray
      });
    } catch (error) {
      console.error('Error fetching user broker connections:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user broker connections',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add broker connection for user
  app.post('/api/mcp/user/:userId/broker-connections', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const { brokerId, credentials } = req.body;
      
      if (!brokerId || !credentials) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['brokerId', 'credentials']
        });
      }
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get broker service
      const brokerService = mcp.brokerConnectionService;
      if (!brokerService) {
        return res.status(500).json({ error: 'Broker connection service not initialized' });
      }
      
      // Create broker connection
      const connection = await brokerService.createBrokerConnection(brokerId, credentials);
      
      // Add to user profile
      const result = await userProfileService.addUserBrokerConnection(
        userId, 
        brokerId, 
        connection
      );
      
      res.json({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error adding broker connection for user:', error);
      res.status(500).json({ 
        error: 'Failed to add broker connection',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Remove broker connection for user
  app.delete('/api/mcp/user/:userId/broker-connections/:brokerId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const brokerId = req.params.brokerId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Remove broker connection
      const result = await userProfileService.removeUserBrokerConnection(userId, brokerId);
      
      res.json({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error removing broker connection for user:', error);
      res.status(500).json({ 
        error: 'Failed to remove broker connection',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get user signals
  app.get('/api/mcp/user/:userId/signals', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get signals
      const signals = await userProfileService.getUserSignals(userId);
      
      res.json({
        status: 'success',
        count: signals.length,
        signals
      });
    } catch (error) {
      console.error('Error fetching user signals:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user signals',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add custom signal for user
  app.post('/api/mcp/user/:userId/signals', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const signal = req.body;
      
      if (!signal.symbol || !signal.type) {
        return res.status(400).json({ 
          error: 'Missing required signal parameters',
          requiredParams: ['symbol', 'type']
        });
      }
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Add signal
      const result = await userProfileService.addUserSignal(userId, signal);
      
      res.json({
        status: 'success',
        result,
        signalId: signal.id
      });
    } catch (error) {
      console.error('Error adding signal for user:', error);
      res.status(500).json({ 
        error: 'Failed to add signal',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Remove custom signal for user
  app.delete('/api/mcp/user/:userId/signals/:signalId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const signalId = req.params.signalId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Remove signal
      const result = await userProfileService.removeUserSignal(userId, signalId);
      
      res.json({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error removing signal for user:', error);
      res.status(500).json({ 
        error: 'Failed to remove signal',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get user journal entries
  app.get('/api/mcp/user/:userId/journal-entries', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get journal entries
      const entries = await userProfileService.getUserJournalEntries(userId);
      
      res.json({
        status: 'success',
        count: entries.length,
        entries
      });
    } catch (error) {
      console.error('Error fetching user journal entries:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user journal entries',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add journal entry for user
  app.post('/api/mcp/user/:userId/journal-entries', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const entry = req.body;
      
      if (!entry.title || !entry.content) {
        return res.status(400).json({ 
          error: 'Missing required journal entry parameters',
          requiredParams: ['title', 'content']
        });
      }
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Add entry
      const result = await userProfileService.addUserJournalEntry(userId, {
        ...entry,
        userId,
        dateCreated: entry.dateCreated || new Date().toISOString()
      });
      
      res.json({
        status: 'success',
        result,
        entryId: entry.id
      });
    } catch (error) {
      console.error('Error adding journal entry for user:', error);
      res.status(500).json({ 
        error: 'Failed to add journal entry',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update journal entry for user
  app.patch('/api/mcp/user/:userId/journal-entries/:entryId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const entryId = req.params.entryId;
      const updates = req.body;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Update entry
      const result = await userProfileService.updateUserJournalEntry(userId, entryId, updates);
      
      res.json({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error updating journal entry for user:', error);
      res.status(500).json({ 
        error: 'Failed to update journal entry',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get user wallet info
  app.get('/api/mcp/user/:userId/wallet', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get wallet
      const wallet = await userProfileService.getUserWallet(userId);
      
      if (!wallet) {
        return res.status(404).json({ error: `User wallet not found: ${userId}` });
      }
      
      res.json({
        status: 'success',
        wallet
      });
    } catch (error) {
      console.error('Error fetching user wallet:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user wallet',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update user wallet info
  app.patch('/api/mcp/user/:userId/wallet', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const updates = req.body;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Update wallet
      const updatedWallet = await userProfileService.updateUserWallet(userId, updates);
      
      res.json({
        status: 'success',
        wallet: updatedWallet
      });
    } catch (error) {
      console.error('Error updating user wallet:', error);
      res.status(500).json({ 
        error: 'Failed to update user wallet',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get user trade history
  app.get('/api/mcp/user/:userId/trades', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Get trades
      const trades = await userProfileService.getUserTrades(userId);
      
      res.json({
        status: 'success',
        count: trades.length,
        trades
      });
    } catch (error) {
      console.error('Error fetching user trades:', error);
      res.status(500).json({ 
        error: 'Failed to fetch user trades',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Add trade record for user
  app.post('/api/mcp/user/:userId/trades', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const trade = req.body;
      
      if (!trade.symbol || !trade.type || !trade.entryPrice) {
        return res.status(400).json({ 
          error: 'Missing required trade record parameters',
          requiredParams: ['symbol', 'type', 'entryPrice']
        });
      }
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Add trade
      const result = await userProfileService.addUserTrade(userId, {
        ...trade,
        userId,
        entryDate: trade.entryDate || new Date().toISOString(),
        status: trade.status || 'open',
        profitLoss: trade.profitLoss || 0
      });
      
      res.json({
        status: 'success',
        result,
        tradeId: trade.id
      });
    } catch (error) {
      console.error('Error adding trade for user:', error);
      res.status(500).json({ 
        error: 'Failed to add trade',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Update trade record for user
  app.patch('/api/mcp/user/:userId/trades/:tradeId', async (req: Request, res: Response) => {
    try {
      const userId = req.params.userId;
      const tradeId = req.params.tradeId;
      const updates = req.body;
      
      // Get user profile service
      const userProfileService = mcp.userProfileService;
      if (!userProfileService) {
        return res.status(500).json({ error: 'User profile service not initialized' });
      }
      
      // Update trade
      const result = await userProfileService.updateUserTrade(userId, tradeId, updates);
      
      res.json({
        status: 'success',
        result
      });
    } catch (error) {
      console.error('Error updating trade for user:', error);
      res.status(500).json({ 
        error: 'Failed to update trade',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Discord webhook endpoints
  
  // Send signal notification to Discord
  app.post('/api/mcp/webhook/signal', async (req: Request, res: Response) => {
    try {
      const signal = req.body;
      
      if (!signal.symbol || !signal.type) {
        return res.status(400).json({ 
          error: 'Missing required signal parameters',
          requiredParams: ['symbol', 'type']
        });
      }
      
      // Get webhook service
      const webhookService = mcp.webhookService;
      if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
      }
      
      // Send signal alert
      const result = await webhookService.sendSignalAlert(signal);
      
      res.json({
        status: result ? 'success' : 'error',
        message: result ? 'Signal notification sent to Discord' : 'Failed to send signal notification'
      });
    } catch (error) {
      console.error('Error sending signal webhook:', error);
      res.status(500).json({ 
        error: 'Failed to send signal webhook',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Send trade execution notification to Discord
  app.post('/api/mcp/webhook/trade-execution', async (req: Request, res: Response) => {
    try {
      const trade = req.body;
      
      if (!trade.symbol || !trade.type || !trade.entryPrice) {
        return res.status(400).json({ 
          error: 'Missing required trade parameters',
          requiredParams: ['symbol', 'type', 'entryPrice']
        });
      }
      
      // Get webhook service
      const webhookService = mcp.webhookService;
      if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
      }
      
      // Send trade execution alert
      const result = await webhookService.sendTradeExecutionAlert(trade);
      
      res.json({
        status: result ? 'success' : 'error',
        message: result ? 'Trade execution notification sent to Discord' : 'Failed to send trade execution notification'
      });
    } catch (error) {
      console.error('Error sending trade execution webhook:', error);
      res.status(500).json({ 
        error: 'Failed to send trade execution webhook',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Send trade closed notification to Discord
  app.post('/api/mcp/webhook/trade-closed', async (req: Request, res: Response) => {
    try {
      const trade = req.body;
      
      if (!trade.symbol || !trade.type || !trade.entryPrice || !trade.exitPrice) {
        return res.status(400).json({ 
          error: 'Missing required trade closure parameters',
          requiredParams: ['symbol', 'type', 'entryPrice', 'exitPrice']
        });
      }
      
      // Get webhook service
      const webhookService = mcp.webhookService;
      if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
      }
      
      // Send trade closed alert
      const result = await webhookService.sendTradeClosedAlert(trade);
      
      res.json({
        status: result ? 'success' : 'error',
        message: result ? 'Trade closed notification sent to Discord' : 'Failed to send trade closed notification'
      });
    } catch (error) {
      console.error('Error sending trade closed webhook:', error);
      res.status(500).json({ 
        error: 'Failed to send trade closed webhook',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Send custom message to Discord
  app.post('/api/mcp/webhook/custom', async (req: Request, res: Response) => {
    try {
      const { title, message, color } = req.body;
      
      if (!title || !message) {
        return res.status(400).json({ 
          error: 'Missing required parameters',
          requiredParams: ['title', 'message']
        });
      }
      
      // Get webhook service
      const webhookService = mcp.webhookService;
      if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
      }
      
      // Send custom message
      const result = await webhookService.sendCustomMessage(title, message, color);
      
      res.json({
        status: result ? 'success' : 'error',
        message: result ? 'Custom message sent to Discord' : 'Failed to send custom message'
      });
    } catch (error) {
      console.error('Error sending custom webhook:', error);
      res.status(500).json({ 
        error: 'Failed to send custom webhook',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Get webhook status
  app.get('/api/mcp/webhook/status', (req: Request, res: Response) => {
    try {
      // Get webhook service
      const webhookService = mcp.webhookService;
      if (!webhookService) {
        return res.status(500).json({ error: 'Webhook service not initialized' });
      }
      
      // Get status
      const status = webhookService.getStatus();
      
      res.json({
        status: 'success',
        webhookStatus: status
      });
    } catch (error) {
      console.error('Error checking webhook status:', error);
      res.status(500).json({ 
        error: 'Failed to check webhook status',
        message: error instanceof Error ? error.message : String(error)
      });
    }
  });

  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[MCP] Error in MCP route:', err);
    res.status(500).json({ error: 'Internal server error in MCP subsystem' });
  });
  
  console.log('[MCP] MCP routes registered with enhanced endpoints');
}

/**
 * Gracefully shut down the MCP server
 */
export function shutdownMCPServer(): void {
  if (mcpServer) {
    console.log('[MCP] Shutting down MCP Server...');
    mcpServer.stop();
    mcpServer = null;
    console.log('[MCP] MCP Server shut down successfully');
  }
}

/**
 * Send a test signal through the MCP system
 */
export function sendTestSignal(provider: string, symbol: string, direction: 'buy' | 'sell'): void {
  if (!mcpServer) {
    console.error('[MCP] Cannot send test signal: MCP Server not initialized');
    return;
  }
  
  const timeframe = 
    provider.toLowerCase() === 'solaris' ? '5m' :
    provider.toLowerCase() === 'hybrid' ? '10m' :
    provider.toLowerCase() === 'paradox' ? '30m' : '15m';
  
  const entryPrice = 69420.50;
  
  mcpServer.publish('trading-signals', {
    type: MCPMessageType.NEW_SIGNAL,
    priority: 1,
    payload: {
      symbol,
      provider,
      direction,
      entry: entryPrice,
      stopLoss: direction === 'buy' ? entryPrice * 0.98 : entryPrice * 1.02,
      takeProfit: direction === 'buy' ? entryPrice * 1.05 : entryPrice * 0.95,
      timeframe,
      notes: `Test ${direction.toUpperCase()} signal for ${symbol} from ${provider} with ${timeframe} timeframe`
    }
  });
  
  console.log(`[MCP] Test signal sent: ${direction} ${symbol} from ${provider}`);
}