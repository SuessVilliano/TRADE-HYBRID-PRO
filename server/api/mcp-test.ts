/**
 * MCP Test Endpoints
 * 
 * This module provides test endpoints for the MCP server.
 */

import { Request, Response } from 'express';
import { MCPServer } from '../mcp/core/mcp-server';
import { MCPMessageType, MCPPriority } from '../mcp/config/mcp-config';
import { MultiplayerServer } from '../multiplayer';

/**
 * Test sending a signal through the MCP system
 */
export const testMCPSignal = async (req: Request, res: Response): Promise<void> => {
  try {
    const { provider, symbol, direction, timeframe } = req.query;
    
    // Validate required parameters
    if (!provider || !symbol || !direction) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters. Please provide provider, symbol, and direction.'
      });
      return;
    }
    
    // Validate direction
    if (direction !== 'buy' && direction !== 'sell') {
      res.status(400).json({ 
        success: false, 
        message: 'Invalid direction. Must be "buy" or "sell".'
      });
      return;
    }
    
    console.log(`[MCP-TEST] Sending test ${direction} signal for ${symbol} from ${provider}`);
    
    // Get the MCP server instance
    const mcpServer = MCPServer.getInstance();
    
    // Determine entry price (for testing)
    const entryPrice = 69420.50;
    
    // Determine timeframe based on provider if not specified
    let signalTimeframe = timeframe as string || '15m';
    if (!timeframe) {
      const providerName = provider as string;
      if (providerName.toLowerCase().includes('solaris')) {
        signalTimeframe = '5m';
      } else if (providerName.toLowerCase().includes('hybrid')) {
        signalTimeframe = '10m';
      } else if (providerName.toLowerCase().includes('paradox')) {
        signalTimeframe = '30m';
      }
    }
    
    // Generate a signal ID
    const signalId = `test_sig_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    
    // Publish the signal to the MCP server
    mcpServer.publish('trading-signals', {
      type: MCPMessageType.NEW_SIGNAL,
      priority: MCPPriority.HIGH,
      payload: {
        id: signalId,
        symbol,
        direction,
        provider,
        entry: entryPrice,
        entryPrice,
        stopLoss: direction === 'buy' ? entryPrice * 0.98 : entryPrice * 1.02,
        takeProfit: direction === 'buy' ? entryPrice * 1.05 : entryPrice * 0.95,
        timeframe: signalTimeframe,
        notes: `Test ${direction} signal for ${symbol} from ${provider} with ${signalTimeframe} timeframe`
      },
      source: 'test-api'
    });
    
    // Get connected client count for the response
    let clientCount = 0;
    if (MultiplayerServer.instance) {
      clientCount = MultiplayerServer.instance.getClientsCount();
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Test signal sent through MCP system',
      signalId,
      clientCount,
      signal: {
        symbol,
        direction,
        provider,
        entryPrice,
        timeframe: signalTimeframe
      }
    });
  } catch (error) {
    console.error('[MCP-TEST] Error sending test signal:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error processing test signal',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Test sending a signal status update through the MCP system
 */
export const testMCPSignalUpdate = async (req: Request, res: Response): Promise<void> => {
  try {
    const { signalId, status, profit } = req.query;
    
    // Validate required parameters
    if (!signalId || !status) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters. Please provide signalId and status.'
      });
      return;
    }
    
    // Validate status
    const validStatuses = ['active', 'completed', 'cancelled', 'sl_hit', 'tp_hit'];
    if (!validStatuses.includes(status as string)) {
      res.status(400).json({ 
        success: false, 
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      });
      return;
    }
    
    console.log(`[MCP-TEST] Sending test signal update for ${signalId} with status: ${status}`);
    
    // Get the MCP server instance
    const mcpServer = MCPServer.getInstance();
    
    // Publish the signal update to the MCP server
    mcpServer.publish('trading-signals', {
      type: MCPMessageType.UPDATE_SIGNAL,
      priority: MCPPriority.HIGH,
      payload: {
        signalId,
        status,
        pnl: profit ? parseFloat(profit as string) : undefined,
        notes: `Signal status updated to ${status} via test API`
      },
      source: 'test-api'
    });
    
    // Get connected client count for the response
    let clientCount = 0;
    if (MultiplayerServer.instance) {
      clientCount = MultiplayerServer.instance.getClientsCount();
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Test signal update sent through MCP system',
      signalId,
      status,
      profit: profit ? parseFloat(profit as string) : undefined,
      clientCount
    });
  } catch (error) {
    console.error('[MCP-TEST] Error sending test signal update:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error processing test signal update',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};

/**
 * Test sending a system notification through the MCP system
 */
export const testMCPNotification = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, message, level } = req.query;
    
    // Validate required parameters
    if (!title || !message) {
      res.status(400).json({ 
        success: false, 
        message: 'Missing required parameters. Please provide title and message.'
      });
      return;
    }
    
    console.log(`[MCP-TEST] Sending test notification: ${title}`);
    
    // Get the MCP server instance
    const mcpServer = MCPServer.getInstance();
    
    // Publish the notification to the MCP server
    mcpServer.publish('notifications', {
      type: MCPMessageType.SYSTEM_NOTIFICATION,
      priority: MCPPriority.HIGH,
      payload: {
        title,
        message,
        level: level || 'info'
      },
      source: 'test-api'
    });
    
    // Get connected client count for the response
    let clientCount = 0;
    if (MultiplayerServer.instance) {
      clientCount = MultiplayerServer.instance.getClientsCount();
    }
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Test notification sent through MCP system',
      title,
      notificationMessage: message,
      level: level || 'info',
      clientCount
    });
  } catch (error) {
    console.error('[MCP-TEST] Error sending test notification:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error processing test notification',
      error: error instanceof Error ? error.message : String(error)
    });
  }
};