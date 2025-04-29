/**
 * Notification Processor for MCP Server
 * 
 * Handles all notification-related messages in the MCP server, including:
 * - Signal notifications to WebSocket clients
 * - Trade notifications
 * - System notifications
 */

import { MCPMessage, MCPServer } from '../core/mcp-server';
import { MCPMessageType, MCPPriority } from '../config/mcp-config';
import { MultiplayerServer } from '../../multiplayer';

/**
 * Register notification processors with the MCP server
 */
export function registerNotificationProcessors(mcpServer: MCPServer): void {
  mcpServer.registerProcessor(MCPMessageType.SIGNAL_NOTIFICATION, (message: MCPMessage) => 
    handleSignalNotification(message, mcpServer)
  );
  
  mcpServer.registerProcessor(MCPMessageType.TRADE_NOTIFICATION, (message: MCPMessage) => 
    handleTradeNotification(message, mcpServer)
  );
  
  mcpServer.registerProcessor(MCPMessageType.SYSTEM_NOTIFICATION, (message: MCPMessage) => 
    handleSystemNotification(message, mcpServer)
  );
  
  console.log('[MCP] Notification processors registered');
}

/**
 * Handle a signal notification
 */
export async function handleSignalNotification(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { signalId, symbol, provider, direction, entry, status, profit } = message.payload;
  
  console.log(`[MCP] Processing signal notification for ${signalId || symbol}`);
  
  try {
    // Get the multiplayer server instance
    if (!MultiplayerServer.instance) {
      console.error('[MCP] Cannot send notification: MultiplayerServer instance not available');
      return;
    }
    
    // If it's a status update notification
    if (status) {
      // Get the signal state from MCP
      const signalState = mcpServer.getSignalState(signalId);
      if (!signalState) {
        console.warn(`[MCP] Signal ${signalId} not found for notification`);
        return;
      }
      
      // Create WebSocket message for signal status update
      const wsMessage = {
        type: 'trading_signal_update',
        data: {
          signalId,
          status,
          profit: profit !== undefined ? profit : signalState.profit,
          symbol: signalState.symbol,
          provider: signalState.provider
        }
      };
      
      // Get connected user IDs
      const userIds = MultiplayerServer.instance.getUserIds?.();
      if (userIds && userIds.length > 0) {
        console.log(`[MCP] Broadcasting signal update to ${userIds.length} connected users`);
        userIds.forEach(userId => {
          MultiplayerServer.instance.sendToUser(userId, wsMessage);
        });
      } else {
        console.warn('[MCP] No connected users for signal update notification');
      }
      
      return;
    }
    
    // Determine timeframe based on provider
    let timeframe = message.payload.timeframe || '1d';
    if (provider) {
      const providerName = provider.toLowerCase();
      if (providerName.includes('hybrid')) {
        timeframe = '10m';
      } else if (providerName.includes('paradox')) {
        timeframe = '30m';
      } else if (providerName.includes('solaris')) {
        timeframe = '5m';
      }
    }
    
    // Get the signal state from MCP if available
    const signalState = signalId ? mcpServer.getSignalState(signalId) : null;
    
    // Create the client signal format
    const clientSignal = {
      symbol: symbol || (signalState?.symbol),
      side: direction?.toLowerCase() || (signalState?.type),
      action: direction?.toLowerCase() || (signalState?.type),
      entryPrice: entry || (signalState?.entry),
      entry: entry || (signalState?.entry),
      takeProfit: signalState?.takeProfit,
      stopLoss: signalState?.stopLoss,
      timeframe: timeframe,
      description: signalState?.notes || `${direction} signal for ${symbol} from ${provider}`
    };
    
    // Create WebSocket message
    const wsMessage = {
      type: 'trading_signal',
      data: {
        signal: clientSignal,
        provider: provider || signalState?.provider || 'system'
      }
    };
    
    // Get connected user IDs
    const userIds = MultiplayerServer.instance.getUserIds?.();
    if (userIds && userIds.length > 0) {
      console.log(`[MCP] Broadcasting signal to ${userIds.length} connected users`);
      userIds.forEach(userId => {
        MultiplayerServer.instance.sendToUser(userId, wsMessage);
      });
    } else {
      console.warn('[MCP] No connected users for signal notification');
    }
    
    console.log(`[MCP] Signal notification processed successfully`);
  } catch (error) {
    console.error(`[MCP] Error processing signal notification:`, error);
  }
}

/**
 * Handle a trade notification
 */
export async function handleTradeNotification(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { userId, tradeId, action, symbol, price } = message.payload;
  
  console.log(`[MCP] Processing trade notification for user ${userId}`);
  
  try {
    // Get the multiplayer server instance
    if (!MultiplayerServer.instance) {
      console.error('[MCP] Cannot send notification: MultiplayerServer instance not available');
      return;
    }
    
    // Create WebSocket message
    const wsMessage = {
      type: 'trade_notification',
      data: {
        tradeId,
        action,
        symbol,
        price,
        timestamp: Date.now()
      }
    };
    
    // If specific user targeted, send only to them
    if (userId) {
      MultiplayerServer.instance.sendToUser(userId, wsMessage);
      console.log(`[MCP] Trade notification sent to user ${userId}`);
    } else {
      // Otherwise broadcast to all connected users
      const userIds = MultiplayerServer.instance.getUserIds?.();
      if (userIds && userIds.length > 0) {
        console.log(`[MCP] Broadcasting trade notification to ${userIds.length} connected users`);
        userIds.forEach(userId => {
          MultiplayerServer.instance.sendToUser(userId, wsMessage);
        });
      } else {
        console.warn('[MCP] No connected users for trade notification');
      }
    }
    
    console.log(`[MCP] Trade notification processed successfully`);
  } catch (error) {
    console.error(`[MCP] Error processing trade notification:`, error);
  }
}

/**
 * Handle a system notification
 */
export async function handleSystemNotification(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { title, message: notificationMessage, level, userId } = message.payload;
  
  console.log(`[MCP] Processing system notification: ${title}`);
  
  try {
    // Get the multiplayer server instance
    if (!MultiplayerServer.instance) {
      console.error('[MCP] Cannot send notification: MultiplayerServer instance not available');
      return;
    }
    
    // Create WebSocket message
    const wsMessage = {
      type: 'system_notification',
      data: {
        title,
        message: notificationMessage,
        level: level || 'info',
        timestamp: Date.now()
      }
    };
    
    // If specific user targeted, send only to them
    if (userId) {
      MultiplayerServer.instance.sendToUser(userId, wsMessage);
      console.log(`[MCP] System notification sent to user ${userId}`);
    } else {
      // Otherwise broadcast to all connected users
      const userIds = MultiplayerServer.instance.getUserIds?.();
      if (userIds && userIds.length > 0) {
        console.log(`[MCP] Broadcasting system notification to ${userIds.length} connected users`);
        userIds.forEach(userId => {
          MultiplayerServer.instance.sendToUser(userId, wsMessage);
        });
      } else {
        console.warn('[MCP] No connected users for system notification');
      }
    }
    
    console.log(`[MCP] System notification processed successfully`);
  } catch (error) {
    console.error(`[MCP] Error processing system notification:`, error);
  }
}