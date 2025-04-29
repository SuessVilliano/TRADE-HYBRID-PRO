/**
 * TradingView Discord Handler
 * 
 * This handler processes TradingView webhook signals and forwards them to Discord
 * It parses the TradingView format and converts it to our internal TradeSignal format
 */

import { Request, Response } from 'express';
import { MCPServer } from '../core/mcp-server';
import { TradeSignal } from '../types/trade-signal';

/**
 * Handle TradingView webhook and send to Discord
 */
export async function handleTradingViewDiscordWebhook(req: Request, res: Response, mcp: MCPServer): Promise<void> {
  try {
    console.log('Received TradingView webhook for Discord notification');
    
    // Validate request
    const payload = req.body;
    if (!payload || !payload.symbol || !payload.strategy || !payload.direction) {
      console.error('Invalid TradingView webhook payload:', payload);
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }
    
    // Convert TradingView webhook to TradeSignal format
    const signal: TradeSignal = {
      id: `tv_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      symbol: payload.symbol,
      type: payload.direction.toLowerCase() === 'buy' ? 'buy' : 'sell',
      entry: parseFloat(payload.entry_price) || 0,
      stopLoss: parseFloat(payload.stop_loss) || 0,
      takeProfit: parseFloat(payload.take_profit) || 0,
      timestamp: new Date().toISOString(),
      source: 'TradingView',
      timeframe: payload.timeframe || '1h',
      notes: payload.message || `${payload.strategy} ${payload.direction} signal`,
      risk: payload.risk ? parseFloat(payload.risk) : 1,
      status: 'active'
    };
    
    console.log('Converted TradingView webhook to signal:', signal);
    
    // Get webhook service
    const webhookService = mcp.webhookService;
    if (!webhookService) {
      console.error('Webhook service not initialized');
      res.status(500).json({ error: 'Webhook service not initialized' });
      return;
    }
    
    // Send to Discord
    const result = await webhookService.sendSignalAlert(signal);
    
    // For now, we'll just skip adding the signal to the service since we're testing
    // In a production environment, we would store it in the database
    console.log('Signal sent to Discord successfully - skipping storage in signal service for testing');
    
    res.json({
      status: result ? 'success' : 'error',
      message: result ? 'TradingView signal sent to Discord' : 'Failed to send signal to Discord',
      signal_id: signal.id
    });
  } catch (error) {
    console.error('Error processing TradingView webhook for Discord:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}

/**
 * Handle Python MCP signal webhook and send to Discord
 * This is a handler for the Python MCP server's signals
 */
export async function handlePythonMCPWebhook(req: Request, res: Response, mcp: MCPServer): Promise<void> {
  try {
    console.log('Received Python MCP webhook for Discord notification');
    
    // Validate request
    const payload = req.body;
    if (!payload || !payload.symbol || !payload.direction) {
      console.error('Invalid Python MCP webhook payload:', payload);
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }
    
    // Convert Python MCP webhook to TradeSignal format
    const signal: TradeSignal = {
      id: `mcp_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      symbol: payload.symbol,
      type: payload.direction.toLowerCase() === 'buy' ? 'buy' : 'sell',
      entry: parseFloat(payload.entry_price) || 0,
      stopLoss: parseFloat(payload.stop_loss) || 0,
      takeProfit: parseFloat(payload.take_profit_1) || parseFloat(payload.take_profit) || 0,
      timestamp: new Date().toISOString(),
      source: payload.provider || 'MCP Python',
      timeframe: payload.timeframe || '1h',
      notes: payload.notes || `${payload.provider || 'MCP'} ${payload.direction} signal`,
      risk: payload.risk ? parseFloat(payload.risk) : 1,
      status: 'active'
    };
    
    console.log('Converted Python MCP webhook to signal:', signal);
    
    // Get webhook service
    const webhookService = mcp.webhookService;
    if (!webhookService) {
      console.error('Webhook service not initialized');
      res.status(500).json({ error: 'Webhook service not initialized' });
      return;
    }
    
    // Send to Discord
    const result = await webhookService.sendSignalAlert(signal);
    
    // For now, we'll just skip adding the signal to the service since we're testing
    // In a production environment, we would store it in the database
    console.log('Signal sent to Discord successfully - skipping storage in signal service for testing');
    
    res.json({
      status: result ? 'success' : 'error',
      message: result ? 'Python MCP signal sent to Discord' : 'Failed to send signal to Discord',
      signal_id: signal.id
    });
  } catch (error) {
    console.error('Error processing Python MCP webhook for Discord:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}

/**
 * Handle trade execution webhook and send to Discord
 */
export async function handleTradeExecutionWebhook(req: Request, res: Response, mcp: MCPServer): Promise<void> {
  try {
    console.log('Received trade execution webhook for Discord notification');
    
    // Validate request
    const payload = req.body;
    if (!payload || !payload.symbol || !payload.type) {
      console.error('Invalid trade execution webhook payload:', payload);
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }
    
    // Get webhook service
    const webhookService = mcp.webhookService;
    if (!webhookService) {
      console.error('Webhook service not initialized');
      res.status(500).json({ error: 'Webhook service not initialized' });
      return;
    }
    
    // Send trade execution alert to Discord
    const result = await webhookService.sendTradeExecutionAlert(payload);
    
    // For testing, we'll skip adding the trade to a user profile
    console.log('Trade execution sent to Discord successfully - skipping storage in user profile for testing');
    
    res.json({
      status: result ? 'success' : 'error',
      message: result ? 'Trade execution sent to Discord' : 'Failed to send trade execution to Discord'
    });
  } catch (error) {
    console.error('Error processing trade execution webhook for Discord:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}

/**
 * Handle trade closed webhook and send to Discord
 */
export async function handleTradeClosedWebhook(req: Request, res: Response, mcp: MCPServer): Promise<void> {
  try {
    console.log('Received trade closed webhook for Discord notification');
    
    // Validate request
    const payload = req.body;
    if (!payload || !payload.symbol || !payload.type || !payload.id) {
      console.error('Invalid trade closed webhook payload:', payload);
      res.status(400).json({ error: 'Invalid webhook payload' });
      return;
    }
    
    // Get webhook service
    const webhookService = mcp.webhookService;
    if (!webhookService) {
      console.error('Webhook service not initialized');
      res.status(500).json({ error: 'Webhook service not initialized' });
      return;
    }
    
    // Calculate profit/loss if not provided
    if (payload.entryPrice && payload.exitPrice && !payload.profitLoss) {
      if (payload.type === 'buy') {
        payload.profitLoss = (payload.exitPrice - payload.entryPrice) * (payload.quantity || 1);
      } else {
        payload.profitLoss = (payload.entryPrice - payload.exitPrice) * (payload.quantity || 1);
      }
    }
    
    // Send trade closed alert to Discord
    const result = await webhookService.sendTradeClosedAlert(payload);
    
    // For testing, we'll skip updating the trade in a user profile
    console.log('Trade closed alert sent to Discord successfully - skipping profile update for testing');
    
    res.json({
      status: result ? 'success' : 'error',
      message: result ? 'Trade closure sent to Discord' : 'Failed to send trade closure to Discord'
    });
  } catch (error) {
    console.error('Error processing trade closed webhook for Discord:', error);
    res.status(500).json({ error: 'Error processing webhook' });
  }
}