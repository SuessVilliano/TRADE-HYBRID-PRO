/**
 * Signal Handlers
 * 
 * Handlers for processing signal-related messages in the MCP system.
 * These handlers process trading signals from various sources and update their status.
 */

import { MCPMessage, MCPServer } from '../core/mcp-server';
import { MCPMessageType, MCPPriority } from '../config/mcp-config';
import { QueueManager } from '../queues/queue-manager';
import { storage } from '../../storage';

/**
 * Handle a new trading signal
 */
export async function handleNewSignal(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { symbol, provider, direction, entry, stopLoss, takeProfit, timeframe, notes } = message.payload;
  
  console.log(`[MCP] Processing new ${direction} signal for ${symbol} from ${provider}`);
  
  try {
    // Generate a unique ID for the signal
    const signalId = `${provider}_${symbol}_${Date.now()}`;
    
    // Determine market type based on symbol
    const marketType = determineMarketType(symbol);
    
    // Create signal in the MCP state
    mcpServer.updateSignalState(signalId, {
      id: signalId,
      symbol,
      type: direction.toLowerCase(),
      provider,
      entry: parseFloat(entry),
      stopLoss: parseFloat(stopLoss),
      takeProfit: parseFloat(takeProfit),
      timeframe,
      notes,
      status: 'active',
      createdAt: new Date().toISOString(),
      metadata: {
        market_type: marketType,
        source: message.source || 'unknown'
      }
    });
    
    // Save to database for persistence
    try {
      await saveSignalToDatabase(signalId, {
        id: signalId,
        providerId: provider,
        symbol,
        side: direction.toLowerCase() === 'buy' ? 'buy' : 'sell',
        entryPrice: parseFloat(entry),
        stopLoss: parseFloat(stopLoss),
        takeProfit: parseFloat(takeProfit),
        description: notes || `${direction} signal for ${symbol}`,
        timestamp: new Date(),
        status: 'active',
        metadata: {
          market_type: marketType,
          timeframe,
          provider_name: provider,
          source: message.source || 'system'
        }
      });
    } catch (error) {
      console.error(`[MCP] Error saving signal to database:`, error);
    }
    
    // Queue for analysis
    mcpServer.publish('trade-analysis', {
      type: MCPMessageType.TRADE_ANALYSIS_REQUEST,
      priority: MCPPriority.MEDIUM,
      payload: {
        signalId,
        symbol,
        provider,
        direction
      }
    });
    
    // Queue for notification
    mcpServer.publish('notifications', {
      type: MCPMessageType.SIGNAL_NOTIFICATION,
      priority: MCPPriority.HIGH,
      payload: {
        signalId,
        symbol,
        provider,
        direction,
        entry
      }
    });
    
    console.log(`[MCP] Signal ${signalId} processed successfully`);
  } catch (error) {
    console.error(`[MCP] Error processing new signal:`, error);
  }
}

/**
 * Handle a signal status update
 */
export async function handleSignalUpdate(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { signalId, status, currentPrice, profit } = message.payload;
  
  console.log(`[MCP] Updating signal ${signalId} to status: ${status}`);
  
  try {
    // Get the current signal state
    const signalState = mcpServer.getSignalState(signalId);
    if (!signalState) {
      console.warn(`[MCP] Cannot update signal ${signalId}: not found in state`);
      return;
    }
    
    // Update the signal state
    mcpServer.updateSignalState(signalId, {
      ...signalState,
      status,
      currentPrice: currentPrice || signalState.currentPrice,
      profit: profit !== undefined ? profit : signalState.profit,
      updatedAt: new Date().toISOString()
    });
    
    // Update in database
    try {
      // Update implementation will be based on your database structure
      // This is a placeholder for now
      console.log(`[MCP] Would update signal ${signalId} in database with status: ${status}`);
    } catch (error) {
      console.error(`[MCP] Error updating signal in database:`, error);
    }
    
    // If status is 'completed' or 'stopped', queue for notification
    if (status === 'completed' || status === 'stopped') {
      mcpServer.publish('notifications', {
        type: MCPMessageType.SIGNAL_NOTIFICATION,
        priority: MCPPriority.HIGH,
        payload: {
          signalId,
          status,
          profit
        }
      });
    }
    
    console.log(`[MCP] Signal ${signalId} updated successfully`);
  } catch (error) {
    console.error(`[MCP] Error updating signal:`, error);
  }
}

/**
 * Handle signal analysis results
 */
export async function handleSignalAnalysis(message: MCPMessage, mcpServer: MCPServer): Promise<void> {
  const { signalId, analysis } = message.payload;
  
  console.log(`[MCP] Processing analysis for signal ${signalId}`);
  
  try {
    // Get the current signal state
    const signalState = mcpServer.getSignalState(signalId);
    if (!signalState) {
      console.warn(`[MCP] Cannot update signal ${signalId}: not found in state`);
      return;
    }
    
    // Update the signal state with analysis
    mcpServer.updateSignalState(signalId, {
      ...signalState,
      analysis,
      analysisTimestamp: new Date().toISOString()
    });
    
    console.log(`[MCP] Analysis for signal ${signalId} processed successfully`);
  } catch (error) {
    console.error(`[MCP] Error processing signal analysis:`, error);
  }
}

/**
 * Save a signal to the database
 */
async function saveSignalToDatabase(signalId: string, signal: any): Promise<void> {
  try {
    await storage.saveTradeSignal(signal);
    console.log(`[MCP] Signal ${signalId} saved to database`);
  } catch (error) {
    console.error(`[MCP] Error saving signal ${signalId} to database:`, error);
    throw error;
  }
}

/**
 * Determine the market type based on the symbol
 */
function determineMarketType(symbol: string): string {
  // This is a simple heuristic and can be improved based on your needs
  if (symbol.includes('/') || symbol.includes('USD')) {
    return 'crypto';
  } else if (symbol.length <= 5) {
    return 'stocks';
  } else if (symbol.includes('_')) {
    return 'forex';
  } else {
    return 'other';
  }
}