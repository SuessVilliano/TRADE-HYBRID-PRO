import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// In-memory store for signals (in production, use a database)
let signals: any[] = [];

// Add the webhook endpoint to receive signals from TradingView
export const receiveWebhook = (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Received webhook signal:', payload);

    // Validate the payload (basic validation)
    if (!payload || typeof payload !== 'object') {
      return res.status(400).send({ error: 'Invalid webhook payload' });
    }

    // Create a new signal object with required fields
    const signal = {
      id: randomUUID(),
      timestamp: new Date(),
      // Extract data from the payload, with fallbacks for missing fields
      symbol: payload.symbol || 'UNKNOWN',
      action: normalizeAction(payload.action || payload.signal || payload.side || 'neutral'),
      price: parseFloat(payload.price) || 0,
      entryPrice: parseFloat(payload.entryPrice || payload.entry || payload.price) || 0,
      stopLoss: parseFloat(payload.stopLoss || payload.sl) || 0,
      takeProfit1: parseFloat(payload.takeProfit1 || payload.tp1 || payload.tp) || 0,
      takeProfit2: parseFloat(payload.takeProfit2 || payload.tp2) || 0,
      takeProfit3: parseFloat(payload.takeProfit3 || payload.tp3) || 0,
      source: payload.source || 'TradingView',
      strategy: payload.strategy || payload.name || 'Unknown Strategy',
      message: payload.message || `${normalizeAction(payload.action || 'Signal')} on ${payload.symbol}`,
      confidence: parseFloat(payload.confidence || '50'),
      timeframe: payload.timeframe || payload.interval || '1d',
      indicators: payload.indicators || {},
      read: false
    };

    // Add to signals store
    signals.unshift(signal);
    
    // Keep only the last 100 signals
    if (signals.length > 100) {
      signals = signals.slice(0, 100);
    }

    return res.status(200).send({ success: true, signalId: signal.id });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send({ error: 'Failed to process signal' });
  }
};

// Endpoint to get all signals
export const getSignals = (_req: Request, res: Response) => {
  res.status(200).json(signals);
};

// Utility function to normalize action values
function normalizeAction(action: string): 'buy' | 'sell' | 'neutral' {
  const normalized = action.toLowerCase();
  
  if (['buy', 'long', 'bullish', 'call', 'purchase'].some(term => normalized.includes(term))) {
    return 'buy';
  } else if (['sell', 'short', 'bearish', 'put'].some(term => normalized.includes(term))) {
    return 'sell';
  } else {
    return 'neutral';
  }
}