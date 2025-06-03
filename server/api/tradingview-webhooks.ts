import { Request, Response } from 'express';
import crypto from 'crypto';
import { processWebhookSignal } from './signals';
import { MultiplayerServer } from '../multiplayer';

// Simple logging function
const log = (message: string, category: string = 'general') => {
  console.log(`[${category}] ${message}`);
};

// Regular Expression to extract placeholders in the format: {{variable}}
const PLACEHOLDER_REGEX = /\{\{([^}]+)\}\}/g;

/**
 * Parse TradingView alert data
 * 
 * TradingView alerts can be customized with templates like:
 * {
 *   "symbol": "{{ticker}}",
 *   "side": "{{strategy.order.action}}",
 *   "price": {{close}},
 *   "tp": {{plot("Take Profit")}}
 * }
 * 
 * @param payload The raw webhook payload
 * @returns Parsed trading signal in platform format
 */
export const parseTradingViewAlert = (payload: any) => {
  try {
    // If payload is a string (common with TradingView), try to parse it
    const data = typeof payload === 'string' ? JSON.parse(payload) : payload;
    
    // Extract required fields from the TradingView format
    const symbol = data.symbol || data.ticker || '';
    const direction = (data.side || data.action || '').toLowerCase();
    const entryPrice = parseFloat(data.price || data.close || 0);
    
    // Normalize direction to our platform format
    let normalizedDirection = 'buy';
    if (direction.includes('sell') || direction.includes('short')) {
      normalizedDirection = 'sell';
    }
    
    // Determine asset type
    const assetType = determineAssetType(symbol);
    
    // Get correct decimal precision based on asset type
    // Use more decimal places for forex (5) than for other assets
    const isForex = assetType === 'forex';
    
    // Parse price values with full precision - don't lose decimals
    const parsePrice = (value: any): number | null => {
      if (!value) return null;
      
      // Ensure we get the full precision for the value
      const parsed = typeof value === 'string' ? parseFloat(value) : value;
      return parsed || null;
    };
    
    // Map to our standardized format
    const signal = {
      id: crypto.randomUUID(),
      Symbol: symbol,
      Asset: assetType,
      Direction: normalizedDirection,
      'Entry Price': parsePrice(data.entry || data.Entry || data['Entry Price'] || entryPrice),
      'Stop Loss': parsePrice(data.sl || data['Stop Loss'] || data.stop_loss || 0),
      'Take Profit': parsePrice(data.tp || data['Take Profit'] || data.take_profit || 0),
      TP1: parsePrice(data.tp1 || data.TP1 || data.tp || 0),
      TP2: parsePrice(data.tp2 || data.TP2 || 0),
      TP3: parsePrice(data.tp3 || data.TP3 || 0),
      Status: 'active',
      Date: new Date().toISOString(),
      Time: new Date().toTimeString().substring(0, 8),
      Provider: data.provider || 'TradingView',
      Notes: data.notes || data.message || `TradingView Alert for ${symbol}`
    };
    
    log(`Parsed TradingView signal: ${JSON.stringify(signal)}`, 'webhook');
    return signal;
  } catch (error) {
    log(`Error parsing TradingView alert: ${error}`, 'webhook');
    throw new Error(`Failed to parse TradingView alert: ${error}`);
  }
};

/**
 * Attempt to determine the asset type based on the symbol
 */
const determineAssetType = (symbol: string): string => {
  symbol = symbol.toUpperCase();
  
  // Check for common forex pairs
  if (/^(EUR|USD|GBP|JPY|AUD|NZD|CAD|CHF)[A-Z]{3}$/.test(symbol)) {
    return 'forex';
  }
  
  // Check for common crypto tickers
  if (symbol.includes('BTC') || symbol.includes('ETH') || 
      symbol.includes('USDT') || symbol.includes('BNB') ||
      symbol.endsWith('PERP')) {
    return 'crypto';
  }
  
  // Check for futures symbols
  if (symbol.includes('F') || symbol.endsWith('F') || 
      symbol.includes('_F') || /\d{4}/.test(symbol)) {
    return 'futures';
  }
  
  // Default to stocks
  return 'stocks';
};

/**
 * Process TradingView webhook and send signal to the correct user
 */
export const processTradingViewWebhook = async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    const payload = req.body;
    
    console.log(`[DEBUG] TradingView webhook received with payload:`, JSON.stringify(payload));
    
    if (!token) {
      log('TradingView webhook missing token', 'webhook');
      console.error('TradingView webhook missing token');
      return res.status(400).json({ error: 'Missing token parameter' });
    }
    
    log(`Received TradingView webhook with token: ${token}`, 'webhook');
    console.log(`[DEBUG] Received TradingView webhook with token: ${token}`);
    
    // Get userId from token (via user-webhooks module)
    try {
      // Directly import to avoid circular dependencies
      const { getUserWebhookByToken, processUserWebhook } = require('./user-webhooks');
      
      const webhook = await getUserWebhookByToken(token);
      if (!webhook) {
        log(`Invalid webhook token: ${token}`, 'webhook');
        console.error(`[ERROR] Invalid webhook token: ${token}`);
        return res.status(404).json({ error: 'Webhook not found' });
      }
      
      console.log(`[DEBUG] Found webhook for token ${token}, userId: ${webhook.userId}`);
      
      // Parse the TradingView alert format
      const parsedSignal = parseTradingViewAlert(payload);
      console.log(`[DEBUG] Parsed TradingView signal:`, JSON.stringify(parsedSignal));
      
      // Process the signal through the regular webhook system
      const success = await processUserWebhook(token, parsedSignal);
      console.log(`[DEBUG] Process webhook result: ${success ? "Success" : "Failed"}`);
      
      if (success) {
        // If we have a multiplayer server instance, send directly to the user
        if (MultiplayerServer.instance && webhook.userId) {
          // Determine timeframe based on provider
          let timeframe = payload.timeframe || '1d';
          if (parsedSignal.Provider) {
            const provider = parsedSignal.Provider.toLowerCase();
            if (provider.includes('hybrid')) {
              timeframe = '10m';
            } else if (provider.includes('paradox')) {
              timeframe = '30m';
            } else if (provider.includes('solaris')) {
              timeframe = '5m';
            }
          }
          
          // Convert the server-side signal format to client-side format
          const clientSignal = {
            symbol: parsedSignal.Symbol,
            side: parsedSignal.Direction.toLowerCase() as 'buy' | 'sell',
            entryPrice: parsedSignal['Entry Price'],
            takeProfit: parsedSignal['Take Profit'],
            stopLoss: parsedSignal['Stop Loss'],
            timeframe: timeframe,
            description: parsedSignal.Notes
          };
          
          console.log(`[DEBUG] Sending trading signal to user ${webhook.userId}:`, JSON.stringify(clientSignal));
          
          // Send the signal to the specific user
          MultiplayerServer.instance.sendToUser(webhook.userId, {
            type: 'trading_signal',
            data: {
              signal: clientSignal,
              provider: parsedSignal.Provider,
              rawPayload: payload // Include raw payload for debugging
            }
          });
          
          // Also trigger notification service with real data
          MultiplayerServer.instance.sendToUser(webhook.userId, {
            type: 'webhook_notification',
            data: {
              title: `${parsedSignal.Direction.toUpperCase()} Signal: ${parsedSignal.Symbol}`,
              body: `Entry: ${parsedSignal['Entry Price']} | SL: ${parsedSignal['Stop Loss']} | TP: ${parsedSignal['Take Profit']}`,
              metadata: {
                symbol: parsedSignal.Symbol,
                type: parsedSignal.Direction.toLowerCase(),
                price: parsedSignal['Entry Price'],
                stopLoss: parsedSignal['Stop Loss'],
                takeProfit: parsedSignal['Take Profit'],
                provider: parsedSignal.Provider,
                rawPayload: JSON.stringify(payload)
              }
            }
          });
          
          // Note: We can't use broadcast directly as it's private
          // Instead, we'll log this for debugging purposes
          console.log(`Would broadcast signal to all users as fallback, but method is private`);
          
          // Save signal to in-memory storage for the global signals API endpoint
          try {
            const { processWebhookSignal } = require('./signals');
            processWebhookSignal({
              channel_name: parsedSignal.Asset || 'crypto',
              content: `Symbol: ${parsedSignal.Symbol} Direction: ${parsedSignal.Direction}`,
              metadata: {
                symbol: parsedSignal.Symbol,
                action: parsedSignal.Direction,
                price: parsedSignal['Entry Price'],
                timeframe: timeframe,
                levels: {
                  entry: parsedSignal['Entry Price'],
                  stopLoss: parsedSignal['Stop Loss'],
                  takeProfit: parsedSignal['Take Profit'],
                }
              }
            }, webhook.userId);
            console.log(`Added signal to in-memory storage`);
          } catch (storageError) {
            console.error(`Error adding signal to storage:`, storageError);
          }
          
          log(`Sent trading signal to user ${webhook.userId}`, 'webhook');
          console.log(`[DEBUG] Sent trading signal to user ${webhook.userId}`);
        } else {
          console.log(`[ERROR] Cannot send signal - MultiplayerServer.instance: ${!!MultiplayerServer.instance}, userId: ${webhook?.userId}`);
        }
        
        return res.status(200).json({ success: true, message: 'Webhook processed successfully' });
      } else {
        console.error(`[ERROR] Failed to process webhook`);
        return res.status(500).json({ error: 'Failed to process webhook' });
      }
    } catch (error) {
      log(`Error processing TradingView webhook: ${error}`, 'webhook');
      console.error(`[ERROR] Error processing TradingView webhook:`, error);
      return res.status(500).json({ error: `Error processing webhook: ${error}` });
    }
  } catch (error) {
    log(`TradingView webhook error: ${error}`, 'webhook');
    console.error(`[ERROR] TradingView webhook error:`, error);
    return res.status(500).json({ error: `Server error: ${error}` });
  }
};