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

// In-memory storage for signals
const inMemorySignals: SignalStorage = {
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
      'Entry Price': 1.0850,
      'Stop Loss': 1.0830,
      'Take Profit': 1.0890,
      TP1: 1.0890,
      Status: 'active',
      Date: new Date().toISOString(),
      Time: '08:30:00',
      Provider: 'Solaris',
      Notes: 'Bouncing off key support level',
    }
  ]
};

// Function to process webhook signals and add them to the in-memory storage
export const processWebhookSignal = (payload: any): void => {
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
    
    // Parse the payload content
    const content = payload.content || '';
    
    // Extract signal data
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
    
    // Extract TP2 and TP3 for futures signals
    const tp2Match = content.match(/TP2: ([0-9.]+)/);
    const tp3Match = content.match(/TP3: ([0-9.]+)/);
    
    // Base signal properties
    const baseSignal: BaseSignal = {
      id: `${marketType}-${Date.now()}`,
      Symbol: symbolMatch[1],
      Asset: symbolMatch[1],
      Direction: directionMatch,
      'Entry Price': parseFloat(entryMatch[1]),
      'Stop Loss': parseFloat(slMatch[1]),
      'Take Profit': parseFloat(tpMatch[1]),
      TP1: parseFloat(tpMatch[1]),
      Status: 'active',
      Date: new Date().toISOString(),
      Time: new Date().toTimeString().substring(0, 8),
      Provider: marketType === 'forex' ? 'Solaris' : 
                marketType === 'futures' ? 'Hybrid' : 'Paradox',
      Notes: `Signal received via webhook: ${content.substring(0, 50)}...`,
    };
    
    // Add market type specific properties
    if (marketType === 'futures') {
      const futuresSignal: FuturesSignal = {
        ...baseSignal,
        // Add TP2 and TP3 if present
        ...(tp2Match ? { TP2: parseFloat(tp2Match[1]) } : {}),
        ...(tp3Match ? { TP3: parseFloat(tp3Match[1]) } : {})
      };
      inMemorySignals.futures.unshift(futuresSignal);
    } else if (marketType === 'forex') {
      const forexSignal: ForexSignal = {
        ...baseSignal
      };
      inMemorySignals.forex.unshift(forexSignal);
    } else {
      // Default to crypto
      const cryptoSignal: CryptoSignal = {
        ...baseSignal
      };
      inMemorySignals.crypto.unshift(cryptoSignal);
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
    
    // Get signals based on market type
    let signals: any[] = [];
    if (marketType === 'crypto') {
      signals = [...inMemorySignals.crypto];
    } else if (marketType === 'futures') {
      signals = [...inMemorySignals.futures];
    } else if (marketType === 'forex') {
      signals = [...inMemorySignals.forex];
    } else {
      // Return all signals if market type is not recognized
      signals = [
        ...inMemorySignals.crypto,
        ...inMemorySignals.futures,
        ...inMemorySignals.forex
      ];
    }
    
    // Return the signals
    return res.json({ signals });
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

export default router;