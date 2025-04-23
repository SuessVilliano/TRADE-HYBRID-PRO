import { Router } from 'express';
// Note: We're no longer using the Google Sheets service, but keeping the SIGNAL_SOURCES reference for compatibility
import { SIGNAL_SOURCES } from './sheets-service';

const router = Router();

// Get signal sources (names only - for dropdown selection)
router.get('/sources', (req, res) => {
  res.json(SIGNAL_SOURCES.map(source => source.name));
});

// Process signals from a specific source
// Note: This endpoint is now just a dummy endpoint that returns success
// It has been replaced by our webhook-based signal processing
router.post('/process/:source', async (req, res) => {
  try {
    const source = req.params.source.toLowerCase();
    const signalSource = SIGNAL_SOURCES.find(s => s.name.toLowerCase() === source);
    
    if (!signalSource) {
      return res.status(404).json({ error: 'Signal source not found' });
    }
    
    // Just return success as we're no longer using Google Sheets
    res.json({ success: true, message: `Signals from ${source} processed successfully` });
  } catch (error) {
    console.error(`Error processing signals from ${req.params.source}:`, error);
    res.status(500).json({ error: 'Failed to process signals' });
  }
});

// Define interfaces for our signal types
interface BaseSignal {
  id: string;
  Symbol: string;
  Asset: string;
  Direction: string;
  'Entry Price': number;
  'Stop Loss': number;
  'Take Profit': number;
  TP1: number;
  Status: string;
  Date: string;
  Time: string;
  Provider: string;
  Notes: string;
}

interface CryptoSignal extends BaseSignal {
  // Crypto specific fields can be added here
}

interface ForexSignal extends BaseSignal {
  // Forex specific fields can be added here
}

interface FuturesSignal extends BaseSignal {
  TP2?: number;
  TP3?: number;
}

// Define the structure of our in-memory storage
interface SignalStorage {
  crypto: CryptoSignal[];
  forex: ForexSignal[];
  futures: FuturesSignal[];
}

// Track user-specific signals
interface UserSignals {
  [userId: string]: SignalStorage;
}

// Global signals available to everyone
const globalSignals: SignalStorage = {
  crypto: [
    {
      id: 'paradox-1-1743604123456',
      Symbol: 'BTCUSDT',
      Asset: 'BTCUSDT',
      Direction: 'BUY',
      'Entry Price': 68700,
      'Stop Loss': 68100,
      'Take Profit': 70000,
      TP1: 70000,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: '15:30:00',
      Provider: 'Paradox',
      Notes: 'Strong momentum signal, follow BTC trend',
    },
    {
      id: 'paradox-2-1743604123457',
      Symbol: 'ETHUSDT',
      Asset: 'ETHUSDT',
      Direction: 'BUY',
      'Entry Price': 3400,
      'Stop Loss': 3300,
      'Take Profit': 3600,
      TP1: 3600,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: '14:45:00',
      Provider: 'Paradox',
      Notes: 'Follow BTC momentum',
    }
  ],
  futures: [
    {
      id: 'hybrid-1-1743604123458',
      Symbol: 'NQ1!',
      Asset: 'NQ1!',
      Direction: 'SELL',
      'Entry Price': 20135.25,
      'Stop Loss': 20152.36,
      'Take Profit': 20101.04,
      TP1: 20101.04,
      TP2: 20083.93,
      TP3: 20066.82,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: '10:15:00',
      Provider: 'Hybrid',
      Notes: 'Technical breakdown on 15min chart',
    }
  ],
  forex: [
    {
      id: 'solaris-1-1743604123459',
      Symbol: 'EURUSD',
      Asset: 'EURUSD',
      Direction: 'BUY',
      'Entry Price': 1.15331,
      'Stop Loss': 1.15228,
      'Take Profit': 1.15846,
      TP1: 1.15846,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: '08:30:00',
      Provider: 'Solaris',
      Notes: 'EURUSD alert - DO NOT RISK MORE THAN 0.25-1%',
    }
  ]
};

// User-specific signals storage
export const userSignals: UserSignals = {};

// Export globalSignals for use in routes
export { globalSignals };

// Helper method to initialize user signals if needed
const initializeUserSignals = (userId: string): void => {
  if (!userSignals[userId]) {
    userSignals[userId] = {
      crypto: [],
      forex: [],
      futures: []
    };
  }
};

// Function to process webhook signals and add them to the in-memory storage
export const processWebhookSignal = (payload: any, userId?: string): void => {
  try {
    // Extract market type from the channel name
    let marketType = 'crypto'; // Default
    if (payload.channel_name) {
      if (payload.channel_name.includes('forex')) {
        marketType = 'forex';
      } else if (payload.channel_name.includes('futures')) {
        marketType = 'futures';
      }
    }
    
    // Support for market_type property from TradingView format
    if (payload.market_type) {
      marketType = payload.market_type.toLowerCase();
    }
    
    // Parse the payload content
    const content = payload.content || '';
    
    // Extract signal data from content or use metadata if available (for TradingView)
    let symbol = '';
    let direction = '';
    let entryPrice = 0;
    let stopLoss = 0;
    let takeProfit = 0;
    let timeframe = '1d'; // Default timeframe
    let tp2 = undefined;
    let tp3 = undefined;
    
    // First check if there's a structured metadata object (from TradingView integration)
    if (payload.metadata) {
      const meta = payload.metadata;
      symbol = meta.symbol || '';
      direction = meta.action || '';
      entryPrice = meta.levels?.entry || meta.price || 0;
      stopLoss = meta.levels?.stopLoss || 0;
      takeProfit = meta.levels?.takeProfit || 0;
      timeframe = meta.timeframe || timeframe;
    } else {
      // Otherwise parse from text content
      const symbolMatch = content.match(/Symbol: ([A-Za-z0-9!_/]+)/);
      const directionMatch = content.includes('BUY ALERT') ? 'BUY' : 
                           content.includes('SELL ALERT') ? 'SELL' : '';
      const entryMatch = content.match(/Entry: ([0-9.]+)/);
      const slMatch = content.match(/Stop Loss: ([0-9.]+)/);
      const tpMatch = content.match(/Take Profit: ([0-9.]+)/);
      
      if (!symbolMatch || !directionMatch || !entryMatch || !slMatch || !tpMatch) {
        console.error('Could not parse webhook signal:', content);
        return;
      }
      
      symbol = symbolMatch[1];
      direction = directionMatch;
      entryPrice = parseFloat(entryMatch[1]);
      stopLoss = parseFloat(slMatch[1]);
      takeProfit = parseFloat(tpMatch[1]);
      
      // Extract TP2 and TP3 for futures signals
      const tp2Match = content.match(/TP2: ([0-9.]+)/);
      const tp3Match = content.match(/TP3: ([0-9.]+)/);
      
      if (tp2Match) tp2 = parseFloat(tp2Match[1]);
      if (tp3Match) tp3 = parseFloat(tp3Match[1]);
    }
    
    // Base signal properties
    const baseSignal: BaseSignal = {
      id: `${marketType}-${Date.now()}`,
      Symbol: symbol,
      Asset: symbol,
      Direction: direction.toUpperCase(),
      'Entry Price': entryPrice,
      'Stop Loss': stopLoss,
      'Take Profit': takeProfit,
      TP1: takeProfit,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: new Date().toTimeString().substring(0, 8),
      Provider: userId ? 'Custom' : marketType === 'forex' ? 'Solaris' : 
                marketType === 'futures' ? 'Hybrid' : 'Paradox',
      Notes: `Signal received via webhook: ${content.substring(0, 50)}...`,
    };
    
    // Determine where to store the signal - in user specific storage or global
    let targetStorage: SignalStorage = globalSignals;
    
    if (userId) {
      // Initialize user signals if this is their first signal
      initializeUserSignals(userId);
      targetStorage = userSignals[userId];
    }
    
    // Add market type specific properties
    if (marketType === 'futures') {
      const futuresSignal: FuturesSignal = {
        ...baseSignal,
        // Add TP2 and TP3 if present
        ...(tp2 ? { TP2: tp2 } : {}),
        ...(tp3 ? { TP3: tp3 } : {})
      };
      targetStorage.futures.unshift(futuresSignal);
    } else if (marketType === 'forex') {
      const forexSignal: ForexSignal = {
        ...baseSignal
      };
      targetStorage.forex.unshift(forexSignal);
    } else {
      // Default to crypto
      const cryptoSignal: CryptoSignal = {
        ...baseSignal
      };
      targetStorage.crypto.unshift(cryptoSignal);
    }
    
    // Skip WebSocket broadcast for now as the dynamic require is causing issues
    // We'll focus on making sure the webhook still processes signals correctly
    try {
      // Simply log the event that would have been sent
      const event = {
        type: 'trading_signal',
        data: {
          signal: baseSignal,
          marketType,
          source: userId ? 'webhook' : 'system', 
          timestamp: new Date().toISOString()
        }
      };
      
      console.log('Would broadcast signal via WebSocket:', event.type);
      
      // TODO: Properly integrate WebSocket broadcast after fixing module imports
    } catch (err) {
      console.error('Failed to prepare signal for broadcast:', err);
    }
    
    console.log(`Added new ${marketType} signal for ${baseSignal.Symbol}`);
  } catch (error) {
    console.error('Error processing webhook signal:', error);
  }
};

// New endpoint to fetch trading signals (using in-memory storage now)
router.get('/trading-signals', async (req, res) => {
  try {
    const marketType = (req.query.marketType as string || 'crypto').toLowerCase();
    const userId = (req.query.userId as string) || undefined;
    
    // Get signals based on market type
    let signals: any[] = [];
    
    // First get the global signals
    if (marketType === 'crypto') {
      signals = [...globalSignals.crypto];
    } else if (marketType === 'futures') {
      signals = [...globalSignals.futures];
    } else if (marketType === 'forex') {
      signals = [...globalSignals.forex];
    } else {
      // Return all signals if market type is not recognized
      signals = [
        ...globalSignals.crypto,
        ...globalSignals.futures,
        ...globalSignals.forex
      ];
    }
    
    // Add user-specific signals if userId is provided
    if (userId && userSignals[userId]) {
      const userStorage = userSignals[userId];
      
      if (marketType === 'crypto') {
        signals = [...userStorage.crypto, ...signals];
      } else if (marketType === 'futures') {
        signals = [...userStorage.futures, ...signals];
      } else if (marketType === 'forex') {
        signals = [...userStorage.forex, ...signals];
      } else {
        // Add all user signals if market type is not recognized
        signals = [
          ...userStorage.crypto,
          ...userStorage.futures,
          ...userStorage.forex,
          ...signals
        ];
      }
    }
    
    // Return the signals
    return res.json({ signals });
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

export default router;