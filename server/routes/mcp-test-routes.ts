import express, { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { MCPServer } from '../mcp/core/mcp-server';
import { SignalProcessor } from '../mcp/processors/signal-processor';
import { NotificationProcessor } from '../mcp/processors/notification-processor';

const router = express.Router();

// Endpoint for sending test signals
router.get('/signal', async (req: Request, res: Response) => {
  try {
    const { provider = 'hybrid', symbol = 'BTCUSDT', direction = 'buy' } = req.query;
    
    // Create a unique signal ID
    const signalId = uuidv4();
    
    // Get message processor instance
    const mcpServer = MCPServer.getInstance();
    const signalProcessor = mcpServer.getProcessor('signal') as SignalProcessor;
    
    if (!signalProcessor) {
      return res.status(500).json({ error: 'Signal processor not available' });
    }
    
    // Create a synthetic signal message
    const signalMessage = {
      id: signalId,
      providerId: provider,
      symbol: symbol,
      side: direction,
      entryPrice: 35000, // Mock price, in reality would be fetched from market data
      stopLoss: direction === 'buy' ? 34000 : 36000,
      takeProfit: direction === 'buy' ? 37000 : 33000,
      description: `${direction.toUpperCase()} ${symbol} signal from ${provider}`,
      timestamp: new Date(),
      status: 'active',
      metadata: {
        market_type: symbol.includes('USD') ? 'crypto' : 'forex',
        timeframe: provider === 'hybrid' ? '10m' : (provider === 'paradox' ? '30m' : '5m'),
        provider_name: provider,
        original_payload: JSON.stringify({
          symbol,
          direction,
          provider,
          test: true
        })
      }
    };
    
    // Process the signal
    await signalProcessor.processMessage(signalMessage);
    
    // Also send a notification about the new signal
    const notificationProcessor = mcpServer.getProcessor('notification') as NotificationProcessor;
    if (notificationProcessor) {
      await notificationProcessor.processMessage({
        title: 'New Trading Signal',
        message: `${direction.toUpperCase()} ${symbol} signal from ${provider}`,
        type: 'signal',
        level: 'info',
        metadata: {
          signalId,
          provider,
          symbol,
          direction
        }
      });
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      signalId,
      clientCount: mcpServer.getClientCount(),
      message: `Test signal sent via MCP system`
    });
  } catch (error) {
    console.error('Error sending test signal:', error);
    return res.status(500).json({ error: 'Failed to send test signal', details: error.message });
  }
});

// Endpoint for updating a signal status
router.get('/signal-update', async (req: Request, res: Response) => {
  try {
    const { signalId, status = 'closed', profit = 0 } = req.query;
    
    if (!signalId) {
      return res.status(400).json({ error: 'Signal ID is required' });
    }
    
    // Get message processor instance
    const mcpServer = MCPServer.getInstance();
    const signalProcessor = mcpServer.getProcessor('signal') as SignalProcessor;
    
    if (!signalProcessor) {
      return res.status(500).json({ error: 'Signal processor not available' });
    }
    
    // Update the signal
    const success = await signalProcessor.updateSignalStatus(
      signalId as string, 
      status as string, 
      Number(profit)
    );
    
    if (!success) {
      return res.status(404).json({ error: 'Signal not found or could not be updated' });
    }
    
    // Also send a notification about the updated signal
    const notificationProcessor = mcpServer.getProcessor('notification') as NotificationProcessor;
    if (notificationProcessor) {
      let title = 'Signal Updated';
      let message = `Signal #${signalId} status updated to ${status}`;
      let level = 'info';
      
      if (status === 'tp_hit') {
        title = 'Take Profit Hit!';
        message = `Take profit target reached for signal #${signalId} with profit of $${profit}`;
        level = 'success';
      } else if (status === 'sl_hit') {
        title = 'Stop Loss Hit';
        message = `Stop loss triggered for signal #${signalId} with loss of $${profit}`;
        level = 'warning';
      }
      
      await notificationProcessor.processMessage({
        title,
        message,
        type: 'signal_update',
        level,
        metadata: {
          signalId,
          status,
          profit
        }
      });
    }
    
    // Return success
    return res.status(200).json({
      success: true,
      signalId,
      status,
      profit,
      message: `Signal status updated to ${status}`
    });
  } catch (error) {
    console.error('Error updating signal:', error);
    return res.status(500).json({ error: 'Failed to update signal', details: error.message });
  }
});

// Endpoint for sending test system notifications
router.get('/notification', async (req: Request, res: Response) => {
  try {
    const { 
      title = 'System Notification', 
      message = 'Test notification', 
      level = 'info' 
    } = req.query;
    
    // Get message processor instance
    const mcpServer = MCPServer.getInstance();
    const notificationProcessor = mcpServer.getProcessor('notification') as NotificationProcessor;
    
    if (!notificationProcessor) {
      return res.status(500).json({ error: 'Notification processor not available' });
    }
    
    // Process the notification
    await notificationProcessor.processMessage({
      title: title as string,
      message: message as string,
      type: 'system',
      level: level as string,
      metadata: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });
    
    // Return success
    return res.status(200).json({
      success: true,
      clientCount: mcpServer.getClientCount(),
      message: 'Test notification sent via MCP system'
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    return res.status(500).json({ error: 'Failed to send notification', details: error.message });
  }
});

// Endpoint to get live MCP statistics
router.get('/stats', (req: Request, res: Response) => {
  try {
    const mcpServer = MCPServer.getInstance();
    
    return res.status(200).json({
      clientCount: mcpServer.getClientCount(),
      queueStats: mcpServer.getQueueStats(),
      processors: mcpServer.getProcessors().map(p => p.getId()),
      handlers: mcpServer.getHandlerCount(),
      uptime: Math.floor((Date.now() - mcpServer.getStartTime()) / 1000)
    });
  } catch (error) {
    console.error('Error fetching MCP stats:', error);
    return res.status(500).json({ error: 'Failed to fetch MCP stats', details: error.message });
  }
});

export default router;