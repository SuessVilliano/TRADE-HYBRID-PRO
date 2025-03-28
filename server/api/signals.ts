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
    console.log('Received webhook signal:', JSON.stringify(payload, null, 2));

    // Validate the payload (basic validation)
    if (!payload || typeof payload !== 'object') {
      console.error('Invalid webhook payload, not an object:', payload);
      return res.status(400).send({ error: 'Invalid webhook payload' });
    }

    // Determine the source based on the webhook URL or payload
    let source = 'Trade Hybrid';
    let strategy = payload.strategy || payload.name || 'Trade Hybrid';
    
    // Check the URL path to determine the source 
    const url = req.originalUrl || '';
    console.log('Webhook URL:', url);

    if (url.includes('IjU3NjUwNTY4MDYzNjA0MzQ1MjZhNTUzMTUxMzci')) {
      source = 'Paradox AI';
      strategy = 'Solana Signals';
    } else if (url.includes('tUOebm12d8na01WofspmU')) {
      source = 'Paradox AI';
      strategy = payload.symbol && payload.symbol.includes('BTC') ? 'Bitcoin Signals' : 'Ethereum Signals';
    }

    // Extract symbol, making sure it exists
    const symbol = payload.symbol || payload.ticker || payload.pair || payload.instrument || 'UNKNOWN';
    console.log(`Processing signal for symbol: ${symbol}`);

    // Process entry price, stop loss, and take profits - these might be provided in multiple formats
    let entryPrice = 0;
    if (payload.entryPrice !== undefined) entryPrice = parseFloat(payload.entryPrice);
    else if (payload.entry !== undefined) entryPrice = parseFloat(payload.entry);
    else if (payload.price !== undefined) entryPrice = parseFloat(payload.price);
    
    let stopLoss = 0;
    if (payload.stopLoss !== undefined) stopLoss = parseFloat(payload.stopLoss);
    else if (payload.sl !== undefined) stopLoss = parseFloat(payload.sl);
    
    let takeProfit1 = 0, takeProfit2 = 0, takeProfit3 = 0;
    
    // Parse TP values in different formats
    if (payload.takeProfit1 !== undefined) takeProfit1 = parseFloat(payload.takeProfit1);
    else if (payload.tp1 !== undefined) takeProfit1 = parseFloat(payload.tp1);
    else if (payload.tp !== undefined) takeProfit1 = parseFloat(payload.tp);
    
    if (payload.takeProfit2 !== undefined) takeProfit2 = parseFloat(payload.takeProfit2);
    else if (payload.tp2 !== undefined) takeProfit2 = parseFloat(payload.tp2);
    
    if (payload.takeProfit3 !== undefined) takeProfit3 = parseFloat(payload.takeProfit3);
    else if (payload.tp3 !== undefined) takeProfit3 = parseFloat(payload.tp3);
    
    // Support for arrays of take profits
    if (Array.isArray(payload.takeProfits) && payload.takeProfits.length > 0) {
      if (payload.takeProfits[0] !== undefined) takeProfit1 = parseFloat(payload.takeProfits[0]);
      if (payload.takeProfits[1] !== undefined) takeProfit2 = parseFloat(payload.takeProfits[1]);
      if (payload.takeProfits[2] !== undefined) takeProfit3 = parseFloat(payload.takeProfits[2]);
    } else if (Array.isArray(payload.tps) && payload.tps.length > 0) {
      if (payload.tps[0] !== undefined) takeProfit1 = parseFloat(payload.tps[0]);
      if (payload.tps[1] !== undefined) takeProfit2 = parseFloat(payload.tps[1]);
      if (payload.tps[2] !== undefined) takeProfit3 = parseFloat(payload.tps[2]);
    }
    
    console.log(`Entry: ${entryPrice}, SL: ${stopLoss}, TP1: ${takeProfit1}, TP2: ${takeProfit2}, TP3: ${takeProfit3}`);

    // Determine action type (buy, sell, etc.)
    const action = normalizeAction(
      payload.action || 
      payload.signal || 
      payload.side || 
      payload.direction || 
      payload.type || 
      'neutral'
    );
    console.log(`Signal action: ${action}`);

    // Create a new signal object with required fields
    const signal = {
      id: randomUUID(),
      timestamp: new Date(),
      symbol: symbol,
      action: action,
      price: parseFloat(payload.price) || entryPrice || 0,
      entryPrice: entryPrice,
      stopLoss: stopLoss,
      takeProfit1: takeProfit1,
      takeProfit2: takeProfit2,
      takeProfit3: takeProfit3,
      source: payload.source || source,
      strategy: strategy,
      message: payload.message || `${action.toUpperCase()} signal on ${symbol}`,
      confidence: parseFloat(payload.confidence || '50'),
      timeframe: payload.timeframe || payload.interval || '1d',
      indicators: payload.indicators || {},
      read: false
    };

    console.log('Created signal object:', signal);

    // Add to signals store
    signals.unshift(signal);
    
    // Keep only the last 100 signals
    if (signals.length > 100) {
      signals = signals.slice(0, 100);
    }

    return res.status(200).send({ 
      success: true, 
      signalId: signal.id,
      message: 'Signal processed successfully'
    });
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
  if (!action || typeof action !== 'string') {
    console.log('Invalid action value received:', action);
    return 'neutral';
  }
  
  const normalized = action.toLowerCase().trim();
  console.log('Normalizing action value:', normalized);
  
  // Buy signals
  if (['buy', 'long', 'bullish', 'call', 'purchase', 'up', 'enter long', 'open long', 'entry long'].some(term => normalized.includes(term))) {
    return 'buy';
  }
  // Sell signals 
  else if (['sell', 'short', 'bearish', 'put', 'down', 'enter short', 'open short', 'entry short'].some(term => normalized.includes(term))) {
    return 'sell';
  }
  // Single character indicators
  else if (normalized === 'b' || normalized === 'l' || normalized === '1') {
    return 'buy';
  }
  else if (normalized === 's' || normalized === '0' || normalized === '-1') {
    return 'sell';
  }
  // Numeric indicators sometimes used by algorithmic systems
  else if (normalized === '1.0' || normalized === '+1') {
    return 'buy';
  }
  else if (normalized === '-1.0') {
    return 'sell';
  }
  // Default when no match
  else {
    console.log('Action defaulted to neutral:', normalized);
    return 'neutral';
  }
}