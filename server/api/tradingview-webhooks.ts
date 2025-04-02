import { Request, Response } from 'express';
import { storage } from '../storage';
import { sql } from 'drizzle-orm';
import { userWebhooks } from '../../shared/schema';
import { eq } from 'drizzle-orm';

// Define types
interface TradingViewAlert {
  token: string;
  exchange?: string;
  ticker?: string;
  bar?: {
    time: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  };
  strategy?: {
    position_size?: number;
    order_price?: number;
    order_action?: string;
    order_contracts?: number;
    order_id?: string;
    market_position?: string;
    market_position_size?: number;
    prev_market_position?: string;
    prev_market_position_size?: number;
  };
  close?: number;
  time?: string;
  message?: string;
  // Allow dynamic properties from TradingView
  [key: string]: any;
}

/**
 * Process incoming TradingView webhook alerts
 */
export const processTradingViewAlert = async (req: Request, res: Response) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(400).json({ error: 'Missing token parameter' });
    }

    // Validate the webhook token
    const webhook = await storage.query.userWebhooks.findFirst({
      where: eq(storage.schema.userWebhooks.token, token)
    });

    if (!webhook) {
      return res.status(404).json({ error: 'Invalid webhook token' });
    }

    const payload: TradingViewAlert = req.body;

    // Ensure the payload has the minimum required fields
    if (!payload) {
      return res.status(400).json({ error: 'Invalid or empty payload' });
    }

    // Standardize the alert format for internal use
    const signalContent = formatTradingViewAlert(payload);

    // Update webhook statistics
    await storage.update(storage.schema.userWebhooks)
      .set({
        signalCount: webhook.signalCount + 1,
        lastUsedAt: new Date().toISOString()
      })
      .where(eq(storage.schema.userWebhooks.id, webhook.id));

    // Process the signal using the existing signals processor
    const { processWebhookSignal } = await import('./signals');
    
    // Format the payload to match expected format
    const formattedPayload = {
      content: `TradingView Alert: ${signalContent.action} ${signalContent.symbol} at ${signalContent.price}`,
      channel_name: 'tradingview-signals',
      market_type: signalContent.exchange === 'CRYPTO' ? 'crypto' : 
                   signalContent.exchange === 'FOREX' ? 'forex' : 'stocks',
      metadata: signalContent
    };
    
    // Process the signal for broadcasting
    await processWebhookSignal(formattedPayload, webhook.userId);

    return res.status(200).json({
      success: true,
      message: 'TradingView alert processed successfully'
    });
  } catch (error) {
    console.error('Error processing TradingView alert:', error);
    return res.status(500).json({ error: 'Failed to process TradingView alert' });
  }
};

/**
 * Format TradingView alert data into a standardized signal format
 */
function formatTradingViewAlert(payload: TradingViewAlert): any {
  // Default values
  let signalType = 'ALERT';
  let action = 'NOTIFICATION';
  let symbol = payload.ticker || '';
  let exchange = payload.exchange || '';
  let message = payload.message || '';
  let price = payload.close || (payload.bar?.close || 0);
  let entryPrice = 0;
  let stopLoss = 0;
  let takeProfit = 0;
  
  // Try to extract information from message if it exists
  if (message) {
    // Check for common strategy patterns
    if (message.includes('BUY') || message.includes('LONG')) {
      signalType = 'ENTRY';
      action = 'BUY';
    } else if (message.includes('SELL') || message.includes('SHORT')) {
      signalType = 'ENTRY';
      action = 'SELL';
    } else if (message.includes('EXIT') || message.includes('CLOSE')) {
      signalType = 'EXIT';
      action = 'CLOSE';
    }
    
    // Try to extract symbol if not provided
    if (!symbol) {
      const symbolMatch = message.match(/\b[A-Z]+\/[A-Z]+\b|\b[A-Z]+[A-Z0-9]*\b/);
      if (symbolMatch) {
        symbol = symbolMatch[0];
      }
    }
    
    // Try to extract price levels
    const priceMatch = message.match(/price[:\s]+(\d+\.?\d*)/i);
    if (priceMatch) {
      entryPrice = parseFloat(priceMatch[1]);
    }
    
    const slMatch = message.match(/stop[:\s]+(\d+\.?\d*)|SL[:\s]+(\d+\.?\d*)/i);
    if (slMatch) {
      stopLoss = parseFloat(slMatch[1] || slMatch[2]);
    }
    
    const tpMatch = message.match(/target[:\s]+(\d+\.?\d*)|TP[:\s]+(\d+\.?\d*)/i);
    if (tpMatch) {
      takeProfit = parseFloat(tpMatch[1] || tpMatch[2]);
    }
  }
  
  // If strategy data is available, use it
  if (payload.strategy) {
    if (payload.strategy.order_action === 'buy') {
      signalType = 'ENTRY';
      action = 'BUY';
    } else if (payload.strategy.order_action === 'sell') {
      signalType = 'ENTRY';
      action = 'SELL';
    }
    
    if (payload.strategy.order_price) {
      entryPrice = payload.strategy.order_price;
    }
  }
  
  // Return standardized format
  return {
    signalType,
    action,
    symbol,
    exchange,
    message,
    price,
    levels: {
      entry: entryPrice || price,
      stopLoss: stopLoss,
      takeProfit: takeProfit
    },
    metadata: {
      source: 'tradingview',
      originalPayload: payload
    },
    timestamp: new Date().toISOString()
  };
}

/**
 * Generate a sample TradingView alert payload for users
 */
export const getTradingViewAlertTemplate = () => {
  return {
    basicTemplate: `{
  "token": "{{token}}",
  "exchange": "{{exchange}}",
  "ticker": "{{ticker}}",
  "close": {{close}},
  "message": "{{strategy.order.action}} Alert: {{ticker}} at {{close}}"
}`,
    advancedTemplate: `{
  "token": "{{token}}",
  "exchange": "{{exchange}}",
  "ticker": "{{ticker}}",
  "bar": {
    "time": "{{time}}",
    "open": {{open}},
    "high": {{high}},
    "low": {{low}},
    "close": {{close}},
    "volume": {{volume}}
  },
  "strategy": {
    "position_size": {{strategy.position_size}},
    "order_action": "{{strategy.order.action}}",
    "order_price": {{strategy.order.price}},
    "market_position": "{{strategy.market_position}}"
  },
  "message": "{{strategy.order.action}} Alert: {{ticker}} at {{close}}, SL: {{plot_0}}, TP: {{plot_1}}"
}`
  };
};