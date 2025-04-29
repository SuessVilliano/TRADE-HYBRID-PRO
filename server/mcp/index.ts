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
import { initializeBrokerConnectionService } from './adapters/broker-connection-service';
import { initializeMarketDataManager } from './data/market-data-manager';
import { initializeSignalService } from './services/signal-service';
import { initializeSmartSignalRouter } from './processors/smart-signal-router';
import { initializeMarketInsightsService } from './services/market-insights-service';

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