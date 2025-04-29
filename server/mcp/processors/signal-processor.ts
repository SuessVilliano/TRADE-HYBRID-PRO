/**
 * Signal Processor for MCP Server
 * 
 * Handles all signal-related messages in the MCP server, including:
 * - New signals from TradingView and other sources
 * - Signal status updates
 * - Signal analysis results
 */

import { MCPMessage, MCPServer } from '../core/mcp-server';
import { MCPMessageType, MCPPriority } from '../config/mcp-config';
import { storage } from '../../storage';

// Type definitions for signals
export interface TradeSignal {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  stopLoss?: number;
  takeProfit?: number;
  timestamp: Date;
  provider: string;
  timeframe: string;
  status: 'active' | 'completed' | 'cancelled' | 'sl_hit' | 'tp_hit';
  notes?: string;
  metadata?: Record<string, any>;
}

interface SignalAnalysisResult {
  signalId: string;
  confidence: number;
  riskLevel: 'low' | 'medium' | 'high';
  analysis: string;
  recommendedActions?: string[];
}

/**
 * Process a new signal message
 */
export async function processNewSignal(message: MCPMessage, mcpServer?: MCPServer): Promise<TradeSignal> {
  console.log('Processing new signal:', message.payload.symbol);
  
  // Extract signal data from the message
  const { 
    symbol, 
    direction, 
    entryPrice, 
    stopLoss,
    takeProfit,
    provider,
    timeframe, 
    notes = '',
    metadata = {} 
  } = message.payload;
  
  // Create a new signal object
  const signal: TradeSignal = {
    id: `sig_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    symbol,
    direction,
    entryPrice,
    stopLoss,
    takeProfit,
    timestamp: new Date(),
    provider,
    timeframe,
    status: 'active',
    notes,
    metadata: {
      ...metadata,
      source: message.source || 'unknown',
      mcpMessageId: message.id
    }
  };
  
  // Store the signal in the database
  try {
    // Convert to storage format
    const dbSignal = {
      id: signal.id,
      providerId: provider,
      symbol,
      side: direction.toLowerCase(),
      entryPrice,
      stopLoss,
      takeProfit,
      description: notes,
      timestamp: signal.timestamp,
      status: 'active',
      metadata: {
        market_type: metadata.marketType || 'crypto',
        timeframe,
        provider_name: provider,
        original_payload: JSON.stringify(message.payload).substring(0, 1000)
      }
    };
    
    await storage.saveTradeSignal(dbSignal);
    console.log(`Signal ${signal.id} saved to database`);
  } catch (error) {
    console.error('Error saving signal to database:', error);
  }
  
  // Queue for analysis
  queueSignalForAnalysis(signal);
  
  // Publish notification for WebSocket broadcast
  if (mcpServer) {
    mcpServer.publish('notifications', {
      type: MCPMessageType.SIGNAL_NOTIFICATION,
      priority: MCPPriority.HIGH,
      payload: {
        signalId: signal.id,
        symbol,
        provider,
        direction,
        entry: entryPrice,
        timeframe
      }
    });
    console.log(`Signal notification queued for broadcast: ${signal.id}`);
  } else {
    console.warn('No MCPServer instance provided, skipping notification broadcast');
  }
  
  // Return the created signal
  return signal;
}

/**
 * Process a signal update message
 */
export async function processSignalUpdate(message: MCPMessage, mcpServer?: MCPServer): Promise<TradeSignal | null> {
  const { signalId, status, pnl, notes, metadata } = message.payload;
  
  console.log(`Updating signal ${signalId} to status: ${status}`);
  
  // Retrieve the current signal from the database
  // TODO: Implement actual database retrieval
  const signal: TradeSignal = {
    id: signalId,
    symbol: '',
    direction: 'buy',
    entryPrice: 0,
    timestamp: new Date(),
    provider: '',
    timeframe: '',
    status: 'active'
  };
  
  // Update the signal
  signal.status = status;
  if (notes) signal.notes = notes;
  if (metadata) signal.metadata = { ...signal.metadata, ...metadata };
  
  // TODO: Update the signal in the database
  
  // Publish status update notification for WebSocket broadcast
  if (mcpServer && (status === 'completed' || status === 'sl_hit' || status === 'tp_hit' || status === 'cancelled')) {
    mcpServer.publish('notifications', {
      type: MCPMessageType.SIGNAL_NOTIFICATION,
      priority: MCPPriority.HIGH,
      payload: {
        signalId,
        status,
        symbol: signal.symbol,
        provider: signal.provider,
        profit: pnl
      }
    });
    console.log(`Signal status update notification queued for broadcast: ${signalId} -> ${status}`);
  }
  
  console.log(`Signal ${signalId} updated to status: ${status}`);
  
  return signal;
}

/**
 * Process a signal analysis result message
 */
export async function processSignalAnalysis(message: MCPMessage): Promise<SignalAnalysisResult> {
  const analysis: SignalAnalysisResult = message.payload;
  console.log(`Received analysis for signal ${analysis.signalId} with confidence: ${analysis.confidence}%`);
  
  // TODO: Update the signal in the database with the analysis results
  
  return analysis;
}

/**
 * Queue a signal for AI analysis
 */
function queueSignalForAnalysis(signal: TradeSignal): void {
  // This would actually queue a message in the MCP server
  console.log(`Queuing signal ${signal.id} for AI analysis`);
  
  // In a real implementation, we would:
  // 1. Send a message to the trade-analysis queue
  // 2. The AI analysis processor would pick it up
  // 3. Results would be saved back to the signal
}

/**
 * Register all signal-related processors with the MCP server
 */
export function registerSignalProcessors(mcpServer: MCPServer): void {
  // Bind the MCPServer instance to the processor functions
  mcpServer.registerProcessor(MCPMessageType.NEW_SIGNAL, (message: MCPMessage) => 
    processNewSignal(message, mcpServer)
  );
  mcpServer.registerProcessor(MCPMessageType.UPDATE_SIGNAL, (message: MCPMessage) => 
    processSignalUpdate(message, mcpServer)
  );
  mcpServer.registerProcessor(MCPMessageType.SIGNAL_ANALYZED, (message: MCPMessage) => 
    processSignalAnalysis(message, mcpServer)
  );
  
  console.log('Signal processors registered with MCP server');
}