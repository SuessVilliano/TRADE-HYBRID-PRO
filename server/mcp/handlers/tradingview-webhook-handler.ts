/**
 * TradingView Webhook Handler
 * 
 * Processes incoming webhook requests from TradingView alerts
 */

import crypto from 'crypto';
import { SignalProcessor } from '../processors/signal-processor';
import { MessageHandler } from './handler-registry';

export class TradingViewWebhookHandler implements MessageHandler {
  private signalProcessor: SignalProcessor;
  
  constructor(signalProcessor: SignalProcessor) {
    this.signalProcessor = signalProcessor;
    console.log('TradingView Webhook Handler initialized');
  }
  
  /**
   * Handle a message (implements MessageHandler interface)
   */
  public async handleMessage(message: any): Promise<void> {
    await this.handleWebhook(message);
  }
  
  /**
   * Get handler ID (implements MessageHandler interface)
   */
  public getId(): string {
    return 'tradingview';
  }
  
  /**
   * Handle an incoming webhook payload from TradingView
   */
  public async handleWebhook(payload: any): Promise<boolean> {
    try {
      // Parse the incoming payload
      const signal = this.parseTradingViewPayload(payload);
      
      // Process the signal
      await this.signalProcessor.processMessage({
        id: signal.id,
        type: 'trading_signal',
        priority: 1,
        signal: signal,
        timestamp: new Date().toISOString()
      });
      
      return true;
    } catch (error) {
      console.error('Error handling TradingView webhook:', error);
      return false;
    }
  }
  
  /**
   * Parse TradingView webhook payload into a structured signal
   */
  private parseTradingViewPayload(payload: any): any {
    // Ensure we have a properly structured payload
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
    
    // Determine asset type based on symbol
    const assetType = this.determineAssetType(symbol);
    
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
      providerId: data.provider || 'TradingView',
      symbol: symbol,
      side: normalizedDirection as 'buy' | 'sell',
      entryPrice: parsePrice(data.entry || data.Entry || data['Entry Price'] || entryPrice),
      stopLoss: parsePrice(data.sl || data['Stop Loss'] || data.stop_loss || 0),
      takeProfit: parsePrice(data.tp || data['Take Profit'] || data.take_profit || 0),
      description: data.notes || data.message || `TradingView Alert for ${symbol}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      metadata: {
        market_type: assetType,
        timeframe: data.timeframe || '1d',
        provider_name: data.provider || 'TradingView'
      }
    };
    
    console.log(`[MCP] Parsed TradingView signal: ${JSON.stringify(signal)}`);
    return signal;
  }
  
  /**
   * Determine the asset type based on the symbol
   */
  private determineAssetType(symbol: string): string {
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
  }
}