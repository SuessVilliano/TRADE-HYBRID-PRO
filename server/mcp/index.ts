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
import { registerSignalProcessors } from './processors/signal-processor';
import { registerNotificationProcessors } from './processors/notification-processor';
import { handleTradingViewWebhook } from './handlers/tradingview-webhook-handler-express';

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
    
    console.log('[MCP] MCP Server initialized successfully');
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
  
  // Error handling middleware
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[MCP] Error in MCP route:', err);
    res.status(500).json({ error: 'Internal server error in MCP subsystem' });
  });
  
  console.log('[MCP] MCP routes registered');
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