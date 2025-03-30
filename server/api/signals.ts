import { Request, Response } from 'express';
import { randomUUID } from 'crypto';
import { sheetsService, SIGNAL_SOURCES } from './sheets-service';
import { getAIMarketAnalysis } from './ai-market-analysis';
import { getCurrentPrice } from './market';
import { SheetsSignal, ProcessedSignal } from '../../shared/schema'; // Updated import path
import brokerAggregator from '../lib/broker-aggregator';

interface SignalSource {
  id: string;
  range: string;
  name: string; // Added 'name' field for source identification
  type: 'crypto' | 'futures' | 'forex';
}

// Updated SIGNAL_SOURCES to include names
const SIGNAL_SOURCES: SignalSource[] = [
  {
    id: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Paradox!A:Z',
    name: 'Paradox',
    type: 'crypto'
  },
  {
    id: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Hybrid!A:Z',
    name: 'Hybrid',
    type: 'futures'
  },
  {
    id: '1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8',
    range: 'Solaris!A:Z',
    name: 'Solaris',
    type: 'forex'
  }
];

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

// Function to process Cash Cow format signals which come in these formats:
// Forex: "SELL ALERT Symbol: USDJPY Entry: 150.532 Stop Loss: 150.61 - 7.8 pips Take Profit: 150.142 - 39 pips"
// Futures: "BUY ALERT Symbol: MGC1! Entry: 2738 Stop Loss: 2731.7 - 63 pips Take Profit: 2769.5 - 315 pips"
// Hybrid AI with multiple TPs: "SELL ALERT Symbol: NQ1! Entry: 20135.25 Stop Loss: 20152.36 (+17.11 points) TP1: 20101.04 (-34.21 points) R:R = 2 TP2: 20083.93 (-51.32 points) R:R = 3 TP3: 20066.82 (-68.43 points) R:R = 4"
function processCashCowSignal(payload: any, res: Response) {
  try {
    console.log('Processing Cash Cow style signal:', payload.content);

    // Extract the message content
    const content = payload.content.trim();

    // Basic validation
    if (!content || content.length < 10) {
      console.error('Invalid Cash Cow signal content (too short):', content);
      return res.status(400).send({ error: 'Invalid signal content' });
    }

    // Determine which channel/type the signal is from based on payload metadata or URL
    let source = 'Cash Cow';
    let strategy = 'Premium Signals';

    if (payload.channel_name) {
      if (payload.channel_name.toLowerCase().includes('forex')) {
        strategy = 'Forex Signals';
      } else if (payload.channel_name.toLowerCase().includes('futures')) {
        strategy = 'Futures Signals';
      } else if (payload.channel_name.toLowerCase().includes('hybrid')) {
        source = 'Hybrid AI';
        strategy = 'AI-Generated Signals';
      } else if (payload.channel_name.toLowerCase().includes('crypto')) {
        strategy = 'Crypto Signals';
      }
    }

    // Extract action (BUY/SELL ALERT)
    let action = 'neutral';
    if (content.toLowerCase().includes('buy alert')) {
      action = 'buy';
    } else if (content.toLowerCase().includes('sell alert')) {
      action = 'sell';
    }

    // Extract symbol using regex
    let symbol = 'UNKNOWN';
    const symbolMatch = content.match(/Symbol:\s*([A-Z0-9!]+)/i);
    if (symbolMatch && symbolMatch[1]) {
      symbol = symbolMatch[1].trim();
    }

    // Extract entry price
    let entryPrice = 0;
    const entryMatch = content.match(/Entry:\s*(\d+\.?\d*)/i);
    if (entryMatch && entryMatch[1]) {
      entryPrice = parseFloat(entryMatch[1]);
    }

    // Extract stop loss
    let stopLoss = 0;
    const slMatch = content.match(/Stop Loss:\s*(\d+\.?\d*)/i);
    if (slMatch && slMatch[1]) {
      stopLoss = parseFloat(slMatch[1]);
    }

    // Extract take profit(s)
    let takeProfit1 = 0;
    let takeProfit2 = 0;
    let takeProfit3 = 0;

    // Check for multiple TPs format (Hybrid AI format)
    const tp1Match = content.match(/TP1:\s*(\d+\.?\d*)/i);
    const tp2Match = content.match(/TP2:\s*(\d+\.?\d*)/i);
    const tp3Match = content.match(/TP3:\s*(\d+\.?\d*)/i);

    if (tp1Match && tp1Match[1]) {
      takeProfit1 = parseFloat(tp1Match[1]);
    }

    if (tp2Match && tp2Match[1]) {
      takeProfit2 = parseFloat(tp2Match[1]);
    }

    if (tp3Match && tp3Match[1]) {
      takeProfit3 = parseFloat(tp3Match[1]);
    }

    // Check for single TP format (Forex/Futures format)
    if (!takeProfit1) {
      const tpMatch = content.match(/Take Profit:\s*(\d+\.?\d*)/i);
      if (tpMatch && tpMatch[1]) {
        takeProfit1 = parseFloat(tpMatch[1]);
      }
    }

    // Extract risk:reward ratios if available
    const indicators: Record<string, string> = {};

    const rr1Match = content.match(/R:R\s*=\s*(\d+)/i);
    const rr2Match = content.match(/R:R\s*=\s*(\d+)/g);

    if (rr1Match && rr1Match[1]) {
      indicators["Risk:Reward"] = rr1Match[1];
    }

    // Extract pip information
    const slPipsMatch = content.match(/Stop Loss:.*?(\d+\.?\d*)\s*(?:pips|points)/i);
    const tpPipsMatch = content.match(/Take Profit:.*?(\d+\.?\d*)\s*(?:pips|points)/i);

    if (slPipsMatch && slPipsMatch[1]) {
      indicators["SL Pips"] = slPipsMatch[1];
    }

    if (tpPipsMatch && tpPipsMatch[1]) {
      indicators["TP Pips"] = tpPipsMatch[1];
    }

    // Extract the warning message about risk amount
    if (content.includes("DO NOT RISK MORE THAN")) {
      const riskMatch = content.match(/DO NOT RISK MORE THAN\s*([\d\.\-\%]+)/i);
      if (riskMatch && riskMatch[1]) {
        indicators["Max Risk"] = riskMatch[1];
      } else {
        indicators["Max Risk"] = "0.25-1%";
      }
    }

    // Set confidence level based on signal source and quality factors
    // Default base confidence levels per source
    let confidence = 75; // Default baseline

    // Adjust base confidence by source
    if (source === 'Hybrid AI') {
      confidence = 85; // Higher confidence for Hybrid AI signals
    } else if (source === 'Paradox AI') {
      confidence = 80; // Slightly higher confidence for Paradox AI
    } else if (source === 'Solaris AI') {
      confidence = 78; // Slightly higher confidence for Solaris AI forex signals
    }

    // Adjust confidence based on signal quality factors

    // 1. Presence of multiple take profit levels increases confidence
    if (takeProfit1 > 0 && takeProfit2 > 0 && takeProfit3 > 0) {
      confidence += 5; // All three take profits specified
    } else if (takeProfit1 > 0 && takeProfit2 > 0) {
      confidence += 3; // Two take profits specified
    }

    // 2. Presence of stop loss increases confidence
    if (stopLoss > 0) {
      confidence += 3;
    }

    // 3. Confidence boost for signals with risk-reward ratio data
    if (indicators["Risk:Reward"]) {
      const rr = parseFloat(indicators["Risk:Reward"]);
      if (rr >= 3) {
        confidence += 5; // Excellent R:R ratio
      } else if (rr >= 2) {
        confidence += 3; // Good R:R ratio
      } else if (rr >= 1) {
        confidence += 1; // Acceptable R:R ratio
      }
    }

    // Cap confidence at 95 (nothing is 100% certain in trading)
    confidence = Math.min(confidence, 95);

    // Get timestamp from payload if available, otherwise use current time
    let timestamp = new Date();
    if (payload.timestamp) {
      timestamp = new Date(payload.timestamp);
    }

    console.log(`Extracted data - Symbol: ${symbol}, Action: ${action}`);
    console.log(`Prices - Entry: ${entryPrice}, SL: ${stopLoss}, TP1: ${takeProfit1}, TP2: ${takeProfit2}, TP3: ${takeProfit3}`);

    // Create a new signal object
    const signal = {
      id: randomUUID(),
      timestamp: timestamp,
      symbol: symbol,
      action: action,
      price: entryPrice || 0,
      entryPrice: entryPrice,
      stopLoss: stopLoss,
      takeProfit1: takeProfit1,
      takeProfit2: takeProfit2,
      takeProfit3: takeProfit3,
      source: source,
      strategy: strategy,
      message: content,
      confidence: confidence,
      timeframe: payload.timeframe || '1h', // Default timeframe
      indicators: indicators,
      read: false
    };

    console.log('Created Cash Cow signal:', signal);

    // Add to signals store
    signals.unshift(signal);

    // Keep only the last 100 signals
    if (signals.length > 100) {
      signals = signals.slice(0, 100);
    }

    return res.status(200).send({
      success: true,
      signalId: signal.id,
      message: 'Cash Cow signal processed successfully'
    });
  } catch (error) {
    console.error('Error processing Cash Cow signal:', error);
    return res.status(500).send({ error: 'Failed to process Cash Cow signal' });
  }
}

// Add the webhook endpoint to receive signals from TradingView
export const receiveWebhook = async (req: Request, res: Response) => {
  try {
    const payload = req.body;
    console.log('Received webhook signal:', JSON.stringify(payload, null, 2));

    // Validate the payload (basic validation)
    if (!payload || typeof payload !== 'object') {
      console.error('Invalid webhook payload, not an object:', payload);
      return res.status(400).send({ error: 'Invalid webhook payload' });
    }

    // Parse Discord-style messages from Cash Cow or similar formats
    // Format: "SELL ALERT Symbol: USDJPY Entry: 150.532 Stop Loss: 150.61 - 7.8 pips Take Profit: 150.142 - 39 pips"
    if (payload.content && typeof payload.content === 'string') {
      return processCashCowSignal(payload, res);
    }

    // Determine the source based on the webhook URL or payload
    let source = 'Trade Hybrid';
    let strategy = payload.strategy || payload.name || 'Trade Hybrid';

    // Check the URL path to determine the source
    const url = req.originalUrl || '';
    console.log('Webhook URL:', url);

    // Determine source based on URL
    if (url.includes('IjU3NjUwNTY4MDYzNjA0MzQ1MjZhNTUzMTUxMzci')) {
      source = 'Paradox AI';
      strategy = 'SOLUSDT Signals';
    } else if (url.includes('tUOebm12d8na01WofspmU')) {
      source = 'Paradox AI';
      strategy = 'BTC/ETH Signals';
      // Try to determine if it's BTC or ETH based on the payload
      if (payload.symbol) {
        if (payload.symbol.toUpperCase().includes('BTC')) {
          strategy = 'BTCUSDT Signals';
        } else if (payload.symbol.toUpperCase().includes('ETH')) {
          strategy = 'ETHUSDT Signals';
        }
      }
    } else if (url.includes('Ec3lDNCfkpQtHNbWk16mA')) {
      source = 'Hybrid AI';
      strategy = 'MNQ Futures Signals';
    } else if (url.includes('OXdqSQ0du1D7gFEEDBUsS')) {
      // Solaris AI forex signals can include multiple currency pairs
      source = 'Solaris AI';

      // Determine specific forex pair based on symbol in payload
      if (payload.symbol) {
        const symbol = payload.symbol.toUpperCase();
        if (symbol.includes('EURUSD')) {
          strategy = 'EURUSD Forex Signals';
        } else if (symbol.includes('AUDUSD')) {
          strategy = 'AUDUSD Forex Signals';
        } else {
          strategy = 'Forex Signals'; // Generic fallback
        }
      } else {
        strategy = 'Forex Signals';
      }
    } else if (url.includes('taskmagic') || url.includes('pabbly')) {
      // Generic sources
      source = payload.source || 'Cash Cow';
      strategy = payload.strategy || 'Premium Signals';
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

    // Process the signal using the new processSignal function
    const processedSignal = await processSignal({
      id: randomUUID(),
      timestamp: new Date(),
      symbol: symbol,
      action: action,
      price: entryPrice || 0,
      entryPrice: entryPrice,
      stopLoss: stopLoss,
      takeProfit1: takeProfit1,
      takeProfit2: takeProfit2,
      takeProfit3: takeProfit3,
      source: source,
      strategy: strategy,
      message: payload.message || `${action.toUpperCase()} signal on ${symbol}`,
      confidence: payload.confidence,
      timeframe: payload.timeframe || payload.interval || '1d',
      indicators: payload.indicators || {},
      broker: payload.broker // Added broker field
    });

    console.log('Processed signal:', processedSignal);

    // Add to signals store
    signals.unshift(processedSignal);

    // Keep only the last 100 signals
    if (signals.length > 100) {
      signals = signals.slice(0, 100);
    }

    return res.status(200).send({
      success: true,
      signalId: processedSignal.id,
      message: 'Signal processed successfully'
    });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return res.status(500).send({ error: 'Failed to process signal' });
  }
};


interface SignalAnalysis {
  confidence: number;
  marketConditions: string;
  recommendation: string;
  suggestedBrokers: string[];
  technicalFactors: string[];
}

//Import necessary types
import { SheetsSignal, ProcessedSignal } from '../../shared/schema';

// Function to calculate confidence based on signal direction
function calculateConfidenceByDirection(signals: any[]): number {
  const totalSignals = signals.length;
  if (totalSignals === 0) return 0;

  const positiveSignals = signals.filter(s => s.direction === 'buy').length;
  return (positiveSignals / totalSignals) * 100;
}

// Function to calculate confidence with market data
function calculateConfidenceWithMarketData(signal: any, aiAnalysis: any, marketData: any): number {
  let confidence = 0.5; // Base confidence

  // Adjust based on price alignment
  const priceAlignment = Math.abs(signal.entryPrice - marketData.currentPrice) / marketData.currentPrice;
  if (priceAlignment < 0.001) confidence += 0.2;

  // Adjust based on AI recommendation alignment
  if (signal.direction === aiAnalysis.recommendation) confidence += 0.2;

  // Adjust based on market conditions
  if (aiAnalysis.marketConditions === 'favorable') confidence += 0.1;

  return Math.min(confidence, 1);
}

export async function analyzeSignal(signal: any): Promise<SignalAnalysis> {
  const marketData = await getCurrentPrice(signal.symbol);
  const aiAnalysis = await getAIMarketAnalysis(signal.symbol);

  let assetClass = '';
  if (signal.source === 'HybridAI') assetClass = 'futures';
  else if (signal.source === 'ParadoxAI') assetClass = 'crypto';
  else if (signal.source === 'SolarisAI') assetClass = 'forex';

  const suggestedBrokers = getBrokersByAssetClass(assetClass);

  return {
    confidence: calculateConfidenceWithMarketData(signal, aiAnalysis, marketData),
    marketConditions: aiAnalysis.marketConditions,
    recommendation: aiAnalysis.recommendation,
    suggestedBrokers,
    technicalFactors: aiAnalysis.technicalFactors
  };
}

function getBrokersByAssetClass(assetClass: string): string[] {
  switch (assetClass) {
    case 'futures':
      return ['ninjatrader', 'tradovate', 'topstep'];
    case 'crypto':
      return ['alpaca', 'kraken'];
    case 'forex':
      return ['mt4', 'mt5', 'oanda'];
    default:
      return [];
  }
}


// Removed duplicate calculateConfidence function


export async function processSignal(signal: SheetsSignal): Promise<ProcessedSignal> {
  const analysis = await analyzeSignal(signal);

  return {
    ...signal,
    confidence: analysis.confidence,
    analysis,
    compatibleBrokers: [signal.broker],
    processed: true,
    timestamp: new Date(),
  };
}

export async function getAndProcessSignals(type?: string) {
  try {
    const sources = type ?
      SIGNAL_SOURCES.filter(s => s.name === type) :
      SIGNAL_SOURCES;

    const allSignals = [];
    for (const source of sources) {
      const signals = await sheetsService.getSignals(source);
      const processed = await Promise.all(signals.map(processSignal));
      allSignals.push(...processed);
    }

    return allSignals;
  } catch (error) {
    console.error('Error fetching/processing signals:', error);
    return [];
  }
}

export async function autoExecuteSignal(signal: ProcessedSignal, userId: number) {
  try {
    if (!signal.processed || !signal.broker) {
      throw new Error('Signal not properly processed');
    }

    const brokerConnection = await brokerAggregator.getBrokerConnection(userId, signal.broker);
    if (!brokerConnection) {
      throw new Error(`User not connected to broker ${signal.broker}`);
    }

    const orderParams = {
      symbol: signal.symbol,
      side: signal.action,
      type: 'market',
      quantity: calculatePositionSize(signal, brokerConnection),
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit1
    };

    const result = await brokerConnection.executeOrder(orderParams);
    return result;
  } catch (error) {
    console.error('Error auto-executing signal:', error);
    throw error;
  }
}

// Removed duplicate calculateConfidence function

function calculatePositionSize(signal: ProcessedSignal, brokerConnection: any): number {
  // Add your position sizing logic based on risk management rules
  return 1.0; // Default to 1 unit for now
}

// Removed duplicate analyzeSignal function

export async function getSignals(type?: 'crypto' | 'futures' | 'forex') {
  try {
    const sources = type ?
      SIGNAL_SOURCES.filter(s => s.type === type) :
      SIGNAL_SOURCES;

    const signals = await Promise.all(
      sources.map(source =>
        sheetsService.getSignals(source.id, source.range)
      )
    );

    return signals.flat().map(formatSignal);
  } catch (error) {
    console.error('Error fetching signals:', error);
    return [];
  }
}

function formatSignal(rawSignal: any[]) {
  // Format based on your sheet structure
  return {
    symbol: rawSignal[0],
    type: rawSignal[1],
    entry: rawSignal[2],
    stopLoss: rawSignal[3],
    takeProfit: rawSignal[4],
    timestamp: rawSignal[5],
    confidence: rawSignal[6]
  };
}

// Endpoint to get all signals
// This function is now largely replaced by the new getSignals function above.
//Keeping this for backward compatibility, but it could be removed if no longer needed.
export async function getSignalsOld(req: Request, res: Response) {
  try {
    const { type = 'all' } = req.query;
    const sheetsConfig = {
      hybrid: {
        sheetId: process.env.HYBRID_AI_SHEET_ID,
        range: 'Signals!A:F'
      },
      paradox: {
        sheetId: process.env.PARADOX_SHEET_ID,
        range: 'Signals!A:F'
      },
      solaris: {
        sheetId: process.env.SOLARIS_SHEET_ID,
        range: 'Signals!A:F'
      }
    };

    const signals = [];

    if (type === 'all') {
      for (const config of Object.values(sheetsConfig)) {
        const data = await sheetsService.getSignals(config.sheetId, config.range);
        signals.push(...data);
      }
    } else {
      const config = sheetsConfig[type];
      if (config) {
        const data = await sheetsService.getSignals(config.sheetId, config.range);
        signals.push(...data);
      }
    }

    res.json({ signals });
  } catch (error) {
    console.error('Error fetching signals:', error);
    res.status(500).json({ error: 'Failed to fetch signals' });
  }
}

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

//Removed duplicate calculateConfidence function
//Removed duplicate analyzeSignal function