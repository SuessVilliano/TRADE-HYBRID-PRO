/**
 * TradingView Webhook Handler for MCP Server
 * 
 * Processes incoming webhook requests from TradingView and converts them into
 * MCP messages for signal processing.
 */

import { Request, Response } from 'express';
import { MCPServer } from '../core/mcp-server';
import { MCPMessageType, MCPPriority } from '../config/mcp-config';

/**
 * Handler for TradingView webhook requests
 */
export async function handleTradingViewWebhook(req: Request, res: Response, mcpServer: MCPServer): Promise<void> {
  console.log('[MCP] Received TradingView webhook request');
  
  try {
    // Validate the request
    if (!req.body) {
      res.status(400).json({ error: 'Request body is required' });
      return;
    }
    
    // Parse the Trading View payload
    const payload = parseTradingViewPayload(req.body);
    if (!payload) {
      res.status(400).json({ error: 'Invalid TradingView payload format' });
      return;
    }
    
    // Publish the signal to the MCP server
    const messageId = mcpServer.publish('trading-signals', {
      type: MCPMessageType.NEW_SIGNAL,
      priority: MCPPriority.HIGH,
      payload,
      source: 'tradingview-webhook'
    });
    
    console.log(`[MCP] Published new signal from TradingView webhook: ${messageId}`);
    
    // Return success response
    res.status(200).json({
      success: true,
      message: 'Signal received and queued for processing',
      signalId: payload.id || messageId
    });
  } catch (error) {
    console.error('[MCP] Error processing TradingView webhook:', error);
    res.status(500).json({ error: 'Internal server error processing webhook' });
  }
}

/**
 * Parse the TradingView webhook payload into a standardized format
 */
function parseTradingViewPayload(body: any): any {
  // Get the original payload for debugging and auditing
  const originalPayload = JSON.stringify(body).substring(0, 1000);
  
  // Process different types of TradingView payloads
  try {
    // Check if this is a standard TradingView alert format
    if (typeof body === 'object' && body !== null) {
      if (body.strategy && body.ticker) {
        // This is likely a strategy alert
        return parseStrategyAlert(body);
      } else if (body.content && body.channel_name) {
        // This appears to be a CashCow format alert
        return parseCashCowAlert(body);
      } else if (body.pair && body.orderType) {
        // This appears to be a direct trading signal
        return parseDirectSignal(body);
      } else if (typeof body.symbol === 'string' && typeof body.side === 'string') {
        // This is a standard Trade Hybrid format
        return parseTradeHybridFormat(body);
      }
    }
    
    // Handle simple string payloads
    if (typeof body === 'string') {
      return parseStringPayload(body);
    }
    
    // Default parsing for unknown formats
    return {
      symbol: body.ticker || body.symbol || body.pair || 'UNKNOWN',
      direction: parseDirection(body),
      entryPrice: parsePrice(body),
      stopLoss: parseStopLoss(body),
      takeProfit: parseTakeProfit(body),
      provider: parseProvider(body),
      timeframe: parseTimeframe(body),
      notes: parseNotes(body),
      metadata: {
        originalPayload,
        source: 'tradingview'
      }
    };
  } catch (error) {
    console.error('[MCP] Error parsing TradingView payload:', error);
    // Return a default payload with the error
    return {
      symbol: 'ERROR',
      direction: 'buy',
      entryPrice: 0,
      provider: 'unknown',
      timeframe: '1h',
      notes: 'Error parsing TradingView payload',
      metadata: {
        error: error.message,
        originalPayload
      }
    };
  }
}

/**
 * Parse a strategy alert from TradingView
 */
function parseStrategyAlert(body: any): any {
  return {
    id: `tv_${Date.now()}`,
    symbol: body.ticker,
    direction: body.strategy.order_action === 'buy' ? 'buy' : 'sell',
    entryPrice: body.strategy.order_price || 0,
    stopLoss: body.strategy.stop_loss || null,
    takeProfit: body.strategy.take_profit || null,
    provider: body.strategy.strategy_name || 'TradingView Strategy',
    timeframe: body.timeframe || '1h',
    notes: body.strategy.comment || '',
    metadata: {
      strategyName: body.strategy.strategy_name,
      position_size: body.strategy.position_size,
      order_id: body.strategy.order_id,
      originalSource: 'tradingview-strategy'
    }
  };
}

/**
 * Parse a CashCow format alert from TradingView
 */
function parseCashCowAlert(body: any): any {
  // Try to parse the content field
  const content = body.content || '';
  
  // CashCow format often has these in the content field
  const symbolMatch = content.match(/Symbol:\s*([A-Za-z0-9]+)/i);
  const directionMatch = content.match(/(buy|sell|long|short)/i);
  const entryMatch = content.match(/Entry:?\s*([\d.]+)/i);
  const slMatch = content.match(/Stop:?\s*([\d.]+)/i);
  const tpMatch = content.match(/Target:?\s*([\d.]+)/i);
  
  return {
    id: `cc_${Date.now()}`,
    symbol: symbolMatch ? symbolMatch[1] : 'UNKNOWN',
    direction: directionMatch ? (directionMatch[1].toLowerCase() === 'buy' || directionMatch[1].toLowerCase() === 'long' ? 'buy' : 'sell') : 'buy',
    entryPrice: entryMatch ? parseFloat(entryMatch[1]) : 0,
    stopLoss: slMatch ? parseFloat(slMatch[1]) : null,
    takeProfit: tpMatch ? parseFloat(tpMatch[1]) : null,
    provider: body.channel_name || 'CashCow',
    timeframe: extractTimeframe(content) || '1h',
    notes: content.substring(0, 200),
    metadata: {
      channel: body.channel_name,
      originalSource: 'cashcow'
    }
  };
}

/**
 * Parse a direct trading signal
 */
function parseDirectSignal(body: any): any {
  return {
    id: `direct_${Date.now()}`,
    symbol: body.pair,
    direction: body.orderType === 'buy' || body.orderType === 'long' ? 'buy' : 'sell',
    entryPrice: parseFloat(body.price || '0'),
    stopLoss: parseFloat(body.stopLoss || '0') || null,
    takeProfit: parseFloat(body.takeProfit || '0') || null,
    provider: body.provider || body.source || 'Direct',
    timeframe: body.timeframe || '1h',
    notes: body.notes || body.comment || '',
    metadata: {
      originalSource: 'direct-signal'
    }
  };
}

/**
 * Parse the standard Trade Hybrid format
 */
function parseTradeHybridFormat(body: any): any {
  return {
    id: body.id || `th_${Date.now()}`,
    symbol: body.symbol,
    direction: body.side.toLowerCase(),
    entryPrice: parseFloat(body.entry || body.entryPrice || '0'),
    stopLoss: parseFloat(body.sl || body.stopLoss || '0') || null,
    takeProfit: parseFloat(body.tp || body.takeProfit || '0') || null,
    provider: body.provider || 'Trade Hybrid',
    timeframe: body.timeframe || '1h',
    notes: body.notes || body.description || '',
    metadata: {
      marketType: body.marketType || 'crypto',
      originalSource: 'trade-hybrid'
    }
  };
}

/**
 * Parse a simple string payload
 */
function parseStringPayload(body: string): any {
  // Try to extract information from the string
  const symbolMatch = body.match(/([A-Za-z0-9]+)(\/USDT?)?/i);
  const directionMatch = body.match(/(buy|sell|long|short)/i);
  const priceMatch = body.match(/(\d+\.\d+)/);
  
  return {
    id: `str_${Date.now()}`,
    symbol: symbolMatch ? symbolMatch[0] : 'UNKNOWN',
    direction: directionMatch ? (directionMatch[1].toLowerCase() === 'buy' || directionMatch[1].toLowerCase() === 'long' ? 'buy' : 'sell') : 'buy',
    entryPrice: priceMatch ? parseFloat(priceMatch[1]) : 0,
    provider: 'String Alert',
    timeframe: extractTimeframe(body) || '1h',
    notes: body.substring(0, 200),
    metadata: {
      originalPayload: body,
      originalSource: 'string-payload'
    }
  };
}

/**
 * Helper function to parse the trading direction
 */
function parseDirection(body: any): 'buy' | 'sell' {
  if (typeof body.direction === 'string') {
    return body.direction.toLowerCase() === 'buy' || body.direction.toLowerCase() === 'long' ? 'buy' : 'sell';
  } else if (typeof body.side === 'string') {
    return body.side.toLowerCase() === 'buy' || body.side.toLowerCase() === 'long' ? 'buy' : 'sell';
  } else if (typeof body.orderType === 'string') {
    return body.orderType.toLowerCase() === 'buy' || body.orderType.toLowerCase() === 'long' ? 'buy' : 'sell';
  } else if (typeof body.type === 'string') {
    return body.type.toLowerCase() === 'buy' || body.type.toLowerCase() === 'long' ? 'buy' : 'sell';
  } else if (typeof body.action === 'string') {
    return body.action.toLowerCase() === 'buy' || body.action.toLowerCase() === 'long' ? 'buy' : 'sell';
  }
  
  // Default to buy if direction cannot be determined
  return 'buy';
}

/**
 * Helper function to parse the price
 */
function parsePrice(body: any): number {
  if (typeof body.price === 'number') {
    return body.price;
  } else if (typeof body.price === 'string') {
    return parseFloat(body.price);
  } else if (typeof body.entry === 'number') {
    return body.entry;
  } else if (typeof body.entry === 'string') {
    return parseFloat(body.entry);
  } else if (typeof body.entryPrice === 'number') {
    return body.entryPrice;
  } else if (typeof body.entryPrice === 'string') {
    return parseFloat(body.entryPrice);
  }
  
  // Default to 0 if price cannot be determined
  return 0;
}

/**
 * Helper function to parse the stop loss
 */
function parseStopLoss(body: any): number | null {
  if (typeof body.stopLoss === 'number') {
    return body.stopLoss;
  } else if (typeof body.stopLoss === 'string') {
    return parseFloat(body.stopLoss);
  } else if (typeof body.sl === 'number') {
    return body.sl;
  } else if (typeof body.sl === 'string') {
    return parseFloat(body.sl);
  } else if (typeof body.stop === 'number') {
    return body.stop;
  } else if (typeof body.stop === 'string') {
    return parseFloat(body.stop);
  }
  
  // Return null if stop loss cannot be determined
  return null;
}

/**
 * Helper function to parse the take profit
 */
function parseTakeProfit(body: any): number | null {
  if (typeof body.takeProfit === 'number') {
    return body.takeProfit;
  } else if (typeof body.takeProfit === 'string') {
    return parseFloat(body.takeProfit);
  } else if (typeof body.tp === 'number') {
    return body.tp;
  } else if (typeof body.tp === 'string') {
    return parseFloat(body.tp);
  } else if (typeof body.target === 'number') {
    return body.target;
  } else if (typeof body.target === 'string') {
    return parseFloat(body.target);
  }
  
  // Return null if take profit cannot be determined
  return null;
}

/**
 * Helper function to parse the provider
 */
function parseProvider(body: any): string {
  if (typeof body.provider === 'string') {
    return body.provider;
  } else if (typeof body.source === 'string') {
    return body.source;
  } else if (typeof body.strategy?.strategy_name === 'string') {
    return body.strategy.strategy_name;
  } else if (typeof body.channel_name === 'string') {
    return body.channel_name;
  }
  
  // Determine provider from other fields
  if (body.content && body.content.toLowerCase().includes('paradox')) {
    return 'paradox';
  } else if (body.content && body.content.toLowerCase().includes('solaris')) {
    return 'solaris';
  } else if (body.content && body.content.toLowerCase().includes('hybrid')) {
    return 'hybrid';
  }
  
  // Default provider
  return 'tradingview';
}

/**
 * Helper function to parse the timeframe
 */
function parseTimeframe(body: any): string {
  if (typeof body.timeframe === 'string') {
    return body.timeframe;
  } else if (typeof body.tf === 'string') {
    return body.tf;
  } else if (typeof body.interval === 'string') {
    return body.interval;
  }
  
  // Try to determine timeframe from the provider
  const provider = parseProvider(body);
  if (provider.toLowerCase().includes('paradox')) {
    return '30m';
  } else if (provider.toLowerCase().includes('solaris')) {
    return '5m';
  } else if (provider.toLowerCase().includes('hybrid')) {
    return '10m';
  }
  
  // Default timeframe
  return '1h';
}

/**
 * Helper function to parse notes
 */
function parseNotes(body: any): string {
  if (typeof body.notes === 'string') {
    return body.notes;
  } else if (typeof body.comment === 'string') {
    return body.comment;
  } else if (typeof body.description === 'string') {
    return body.description;
  } else if (typeof body.content === 'string') {
    return body.content.substring(0, 200);
  } else if (typeof body.message === 'string') {
    return body.message;
  }
  
  // Default notes
  return '';
}

/**
 * Extract timeframe from a string
 */
function extractTimeframe(str: string): string | null {
  const timeframeMatch = str.match(/\b(1m|5m|15m|30m|1h|2h|4h|6h|8h|12h|1d|3d|1w|1M)\b/i);
  return timeframeMatch ? timeframeMatch[1] : null;
}