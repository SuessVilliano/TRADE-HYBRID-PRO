import { SignalProcessor } from '../processors/signal-processor';
import { v4 as uuidv4 } from 'uuid';

/**
 * TradingViewWebhookHandler
 * 
 * Handles incoming webhook messages from TradingView
 */
export class TradingViewWebhookHandler {
  private signalProcessor: SignalProcessor;
  
  constructor(signalProcessor: SignalProcessor) {
    this.signalProcessor = signalProcessor;
    console.log('TradingView Webhook Handler initialized');
  }
  
  /**
   * Handle a webhook message from TradingView
   */
  public async handleWebhook(payload: any): Promise<boolean> {
    console.log('Received TradingView webhook:', payload);
    
    try {
      // Generate a unique ID for this signal
      const signalId = uuidv4();
      
      // Determine market type based on symbol
      let marketType = 'unknown';
      if (payload.symbol?.includes('USD')) {
        marketType = 'crypto';
      } else if (['EUR', 'GBP', 'JPY', 'AUD', 'NZD', 'CAD', 'CHF'].some(
        currency => payload.symbol?.includes(currency))) {
        marketType = 'forex';
      } else if (payload.symbol?.includes('!')) {
        marketType = 'futures';
      } else if (payload.symbol?.includes(':')) {
        marketType = 'stocks';
      }
      
      // Determine provider based on passphrase or other identifiers
      let providerId = 'tradingview';
      let providerName = 'TradingView';
      let timeframe = '15m'; // Default
      
      // If payload contains specific provider info, use it
      if (payload.passphrase === 'hybrid-ai') {
        providerId = 'hybrid';
        providerName = 'Hybrid AI';
        timeframe = '10m';
      } else if (payload.passphrase === 'paradox-signals') {
        providerId = 'paradox';
        providerName = 'Paradox AI';
        timeframe = '30m';
      } else if (payload.passphrase === 'solaris-signals') {
        providerId = 'solaris';
        providerName = 'Solaris AI';
        timeframe = '5m';
      }
      
      // Convert payload to signal format
      const signal = {
        id: signalId,
        providerId,
        symbol: payload.symbol,
        side: payload.side || payload.direction || 'buy',
        entryPrice: payload.entry || payload.price || 0,
        stopLoss: payload.stop || payload.stopLoss || 0,
        takeProfit: payload.target || payload.takeProfit || 0,
        description: payload.description || `${payload.side || 'Signal'} alert for ${payload.symbol}`,
        timestamp: new Date(),
        status: 'active',
        metadata: {
          market_type: marketType,
          timeframe,
          provider_name: providerName,
          original_payload: JSON.stringify(payload)
        }
      };
      
      // Process the signal
      await this.signalProcessor.processMessage(signal);
      
      return true;
    } catch (error) {
      console.error('Error handling TradingView webhook:', error);
      return false;
    }
  }
}