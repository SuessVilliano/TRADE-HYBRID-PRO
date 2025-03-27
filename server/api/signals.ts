import { Request, Response } from 'express';
import { randomUUID } from 'crypto';

// In-memory store for signals (in production, use a database)
let signals: any[] = [
  // Add some sample signals to test with
  {
    id: "1",
    timestamp: new Date(),
    symbol: "BTCUSD",
    action: "buy",
    price: 37250.50,
    entryPrice: 37250.50,
    stopLoss: 36500.00,
    takeProfit1: 38000.00,
    takeProfit2: 39000.00,
    takeProfit3: 40000.00,
    source: "Trade Hybrid",
    strategy: "BTC Breakout Strategy",
    message: "BTC breaking out of consolidation pattern. Strong buy signal with support at $36,500.",
    confidence: 85,
    timeframe: "4h",
    indicators: {
      "RSI": "72",
      "MACD": "bullish",
      "MA": "above 200 EMA"
    },
    read: false
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
    symbol: "ETHUSD",
    action: "buy",
    price: 2150.75,
    entryPrice: 2150.75,
    stopLoss: 2050.00,
    takeProfit1: 2250.00,
    takeProfit2: 2350.00,
    takeProfit3: 2450.00,
    source: "Trade Hybrid",
    strategy: "ETH Multi-Timeframe Strategy",
    message: "ETH showing strong momentum on multiple timeframes. Buy signal with 3:1 risk-reward ratio.",
    confidence: 78,
    timeframe: "1d",
    indicators: {
      "RSI": "65",
      "Volume": "increasing",
      "Stochastic": "bullish crossover"
    },
    read: false
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    symbol: "EURUSD",
    action: "sell",
    price: 1.0850,
    entryPrice: 1.0850,
    stopLoss: 1.0920,
    takeProfit1: 1.0780,
    takeProfit2: 1.0720,
    takeProfit3: 1.0650,
    source: "Trade Hybrid",
    strategy: "Forex Reversal Pattern",
    message: "EUR/USD showing bearish reversal pattern at resistance level. Sell signal with tight stop.",
    confidence: 72,
    timeframe: "4h",
    indicators: {
      "RSI": "28",
      "Bollinger Bands": "upper band rejection",
      "ADX": "21"
    },
    read: false
  }
];

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
      source: payload.source || 'Trade Hybrid',
      strategy: payload.strategy || payload.name || 'Trade Hybrid',
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