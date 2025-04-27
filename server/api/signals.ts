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

// Global signals available to everyone - include some initial demo data plus webhook data
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

// Import storage to save webhook signals to database
import { storage } from "../storage";
import { signalProviderEnum } from "@shared/schema";

// Function to process webhook signals and add them to storage systems 
// (in-memory for immediate display and database for persistence)
export const processWebhookSignal = async (payload: any, userId?: string): Promise<void> => {
  try {
    // Define default values
    let marketType = 'crypto'; // Default
    let symbol = '';
    let direction = '';
    let entryPrice = 0;
    let stopLoss = 0;
    let takeProfit = 0;
    let timeframe = '1d'; // Default timeframe
    let tp2 = undefined;
    let tp3 = undefined;
    let provider = 'Unknown';
    let notes = '';
    
    console.log('Processing webhook payload:', JSON.stringify(payload).substring(0, 200));
    
    // 1. Extract market type - check multiple properties
    if (payload.market_type) {
      marketType = payload.market_type.toLowerCase();
    } else if (payload.channel_name) {
      if (payload.channel_name.includes('forex')) {
        marketType = 'forex';
      } else if (payload.channel_name.includes('futures')) {
        marketType = 'futures';
      }
    } else if (payload.symbol) {
      // Try to determine market type from symbol format
      if (payload.symbol.includes('USD/') || payload.symbol.includes('EUR/')) {
        marketType = 'forex';
      } else if (payload.symbol.includes('!') || payload.symbol.includes('F1')) {
        marketType = 'futures';
      }
    }
    
    // 2. Extract Provider information
    provider = payload.source || payload.broker || payload.provider ||
               (payload.channel_name && payload.channel_name.includes('forex')) ? 'Solaris' :
               (payload.channel_name && payload.channel_name.includes('futures')) ? 'Hybrid' : 'Paradox';
    
    // 3. Extract payload content and data
    const content = payload.content || '';
    const data = payload.data || {};
    
    // 4. Extract signal data from multiple possible sources
    
    // 4.1 First try to use structured data if available
    if (payload.metadata || payload.data) {
      const meta = payload.metadata || payload.data;
      symbol = meta.symbol || payload.symbol || '';
      direction = meta.action || meta.direction || meta.side || '';
      entryPrice = meta.entry || meta.entryPrice || meta.price || 
                  (meta.levels && meta.levels.entry) || 0;
      stopLoss = meta.sl || meta.stopLoss || 
                (meta.levels && meta.levels.stopLoss) || 0;
      takeProfit = meta.tp || meta.takeProfit || meta.target || 
                  (meta.levels && meta.levels.takeProfit) || 0;
      timeframe = meta.timeframe || timeframe;
      notes = meta.notes || meta.signal || meta.message || '';
      
      // Check for additional take profits
      if (meta.tp2 || meta.takeProfit2) tp2 = meta.tp2 || meta.takeProfit2;
      if (meta.tp3 || meta.takeProfit3) tp3 = meta.tp3 || meta.takeProfit3;
    }
    
    // 4.2 If we still don't have the key data, try to parse from content
    if (!symbol || !direction || !entryPrice) {
      // Parse symbol from content
      const symbolMatch = content.match(/Symbol:?\s*([A-Za-z0-9!_/\-]+)/i) || 
                         content.match(/\b([A-Z0-9]+\/[A-Z0-9]+|[A-Z0-9]{3,}[A-Z0-9]+|[A-Z0-9]{3,}!)\b/);
      
      // Parse direction from content
      const directionMatch = content.match(/direction:?\s*(buy|sell)/i) ||
                            content.match(/\b(buy|sell)\b\s*(signal|alert)/i) ||
                            content.match(/(bullish|bearish)/i) ||
                            content.includes('BUY ALERT') ? 'BUY' : 
                            content.includes('SELL ALERT') ? 'SELL' : null;
      
      // Parse prices from content
      const entryMatch = content.match(/entry:?\s*([0-9.]+)/i) || 
                         content.match(/price:?\s*([0-9.]+)/i);
      const slMatch = content.match(/stop:?\s*([0-9.]+)/i) || 
                      content.match(/sl:?\s*([0-9.]+)/i) ||
                      content.match(/stop\s*loss:?\s*([0-9.]+)/i);
      const tpMatch = content.match(/target:?\s*([0-9.]+)/i) || 
                      content.match(/tp:?\s*([0-9.]+)/i) ||
                      content.match(/take\s*profit:?\s*([0-9.]+)/i);
      
      // Extract values if matches found
      if (symbolMatch) symbol = symbolMatch[1];
      
      if (directionMatch) {
        if (typeof directionMatch === 'string') {
          direction = directionMatch;
        } else if (directionMatch[1]) {
          direction = directionMatch[1].toUpperCase();
          // Convert bullish/bearish to buy/sell
          if (direction.toLowerCase() === 'bullish') direction = 'BUY';
          if (direction.toLowerCase() === 'bearish') direction = 'SELL';
        }
      }
      
      if (entryMatch) entryPrice = parseFloat(entryMatch[1]);
      if (slMatch) stopLoss = parseFloat(slMatch[1]);
      if (tpMatch) takeProfit = parseFloat(tpMatch[1]);
      
      // Extract TP2 and TP3 for futures signals
      const tp2Match = content.match(/tp2:?\s*([0-9.]+)/i);
      const tp3Match = content.match(/tp3:?\s*([0-9.]+)/i);
      
      if (tp2Match) tp2 = parseFloat(tp2Match[1]);
      if (tp3Match) tp3 = parseFloat(tp3Match[1]);
      
      // Try to extract notes
      const notesMatch = content.match(/notes:?\s*(.+?)(?:\r|\n|$)/i) ||
                        content.match(/message:?\s*(.+?)(?:\r|\n|$)/i);
      if (notesMatch) notes = notesMatch[1];
    }
    
    // If we still don't have a direction, default to BUY
    if (!direction) direction = 'BUY';
    
    // If we couldn't parse the content properly, log error and exit
    if (!symbol || !entryPrice) {
      console.error('Failed to extract required signal data from webhook:', 
                  { symbol, direction, entryPrice, stopLoss, takeProfit });
      return;
    }
    
    // Generate a unique ID
    const signalId = `${provider.toLowerCase()}-${symbol.toLowerCase()}-${Date.now()}`;
    
    // Set notes if not found
    if (!notes) {
      notes = `${direction} signal for ${symbol} from ${provider}`;
    }
    
    // Base signal properties
    const baseSignal: BaseSignal = {
      id: signalId,
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
      Provider: userId ? 'Custom' : provider,
      Notes: notes.substring(0, 150),
    };
    
    // 1. First, store in the in-memory storage for immediate access
    // Determine where to store the signal - in user specific storage or global
    let targetStorage: SignalStorage = globalSignals;
    
    if (userId) {
      // Initialize user signals if this is their first signal
      initializeUserSignals(userId);
      targetStorage = userSignals[userId];
    }
    
    // Add market type specific properties to in-memory storage
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
    
    // 2. Now, save to the database for persistence
    try {
      // Determine provider enum value
      let providerValue;
      if (provider.toLowerCase().includes('paradox')) {
        providerValue = 'paradox';
      } else if (provider.toLowerCase().includes('solaris')) {
        providerValue = 'solaris';
      } else if (provider.toLowerCase().includes('hybrid')) {
        providerValue = 'hybrid';
      } else {
        providerValue = 'custom';
      }
      
      // Prepare the signal data for database storage
      const dbSignal = {
        id: signalId,
        providerId: userId || providerValue,
        symbol,
        side: direction.toLowerCase() === 'buy' ? 'buy' : 'sell',
        entryPrice,
        stopLoss,
        takeProfit,
        description: notes,
        timestamp: new Date(),
        status: 'active',
        metadata: {
          market_type: marketType,
          timeframe,
          tp2,
          tp3,
          original_payload: JSON.stringify(payload).substring(0, 1000),
          provider_name: provider,
          user_id: userId
        }
      };
      
      // Save the signal to the database
      const savedSignal = await storage.saveTradeSignal(dbSignal);
      console.log("Saved signal to database:", savedSignal?.id);
    } catch (error) {
      console.error("Error saving signal to database:", error);
    }
    
    // Try to broadcast the signal via WebSocket
    try {
      // Prepare the event that would be sent
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

// Create a dedicated endpoint for demo signals
router.get('/demo-signals', (req, res) => {
  console.log('Fetching demo signals from dedicated endpoint - using all available signals');
  
  // Get all available signals without filtering
  const signals = getAllAvailableSignals();
  
  return res.json({ signals });
});

// Helper function to get all available signals for demo mode (no filtering)
function getAllAvailableSignals() {
  // Get all signals from global store without filtering
  return [
    ...globalSignals.crypto,
    ...globalSignals.futures,
    ...globalSignals.forex
  ];
}

router.get('/trading-signals', async (req, res) => {
  try {
    const marketType = (req.query.marketType as string || 'crypto').toLowerCase();
    const userId = (req.query.userId as string) || undefined;
    
    // Check if we're in demo mode
    const demoMode = req.query.demo === 'true';
    
    // If in demo mode, just return all available signals immediately
    if (demoMode) {
      console.log('Returning all signals for demo mode');
      return res.json({ signals: getAllAvailableSignals() });
    }
    
    // Get user membership level from session if authenticated
    let membershipLevel = 'free';
    let isDemoUser = false;
    
    if (req.session && req.session.userId) {
      membershipLevel = req.session.membershipLevel || 'free';
      isDemoUser = membershipLevel === 'demo';
    }
    
    console.log(`Fetching signals for user with membership level: ${membershipLevel}${isDemoUser ? ' (demo mode)' : ''}`);
    
    // STEP 1: Get in-memory signals
    let signals: any[] = [];
    
    // Get in-memory signals based on market type
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
    
    // STEP 2: Get persistent signals from database
    try {
      // Check if the trade_signals table exists - it's created at app start
      // but might not be available in the first run after a deployment
      let tableExists = false;
      try {
        // Import the database connection from the db.ts file
        const { db } = await import('../db');
        
        // Use the db to check if the table exists
        const result = await db.execute(
          `SELECT EXISTS (
            SELECT FROM pg_tables 
            WHERE schemaname = 'public' 
            AND tablename = 'trade_signals'
          );`
        );
        tableExists = result[0]?.exists === true;
      } catch (checkError) {
        console.error('Error checking if trade_signals table exists:', checkError);
        tableExists = false;
      }
      
      let dbSignals = [];
      
      if (tableExists) {
        // Get signals from the database
        if (marketType !== 'all') {
          try {
            dbSignals = await storage.getTradeSignalsByMarketType(marketType, 100);
          } catch (error) {
            console.warn(`Failed to get signals by market type ${marketType}, trying all signals`);
            dbSignals = await storage.getTradeSignals(100);
          }
        } else {
          dbSignals = await storage.getTradeSignals(100);
        }
        
        // Ensure dbSignals is an array before trying to access length
        dbSignals = dbSignals || [];
        console.log(`Found ${dbSignals.length} signals in database`);
          
        if (dbSignals.length > 0) {
          // Convert database signals to our standard format
          const convertedDbSignals = dbSignals.map(signal => {
            try {
              // Handle cases where metadata might be a string or null
              let metadata = {};
              if (signal.metadata) {
                if (typeof signal.metadata === 'string') {
                  try {
                    metadata = JSON.parse(signal.metadata);
                  } catch (e) {
                    metadata = {};
                  }
                } else {
                  metadata = signal.metadata;
                }
              }

              return {
                id: signal.id,
                Symbol: signal.symbol,
                Asset: signal.symbol,
                Direction: signal.side.toUpperCase(),
                'Entry Price': signal.entryPrice,
                'Stop Loss': signal.stopLoss,
                'Take Profit': signal.takeProfit,
                TP1: signal.takeProfit,
                // Get TP2/TP3 from metadata if available
                ...(metadata.tp2 ? { TP2: metadata.tp2 } : {}),
                ...(metadata.tp3 ? { TP3: metadata.tp3 } : {}),
                Status: signal.status,
                Date: signal.timestamp.toISOString(),
                Time: signal.timestamp.toTimeString().substring(0, 8),
                Provider: (metadata.provider_name) || 
                        (signal.providerId === 'paradox' ? 'Paradox' :
                          signal.providerId === 'solaris' ? 'Solaris' :
                          signal.providerId === 'hybrid' ? 'Hybrid' : 'Custom'),
                Notes: signal.description || `${signal.side.toUpperCase()} signal for ${signal.symbol}`
              };
            } catch (formatError) {
              console.error('Error formatting signal:', formatError, signal);
              return null;
            }
          }).filter(Boolean); // Remove any null entries
          
          // Merge with in-memory signals, avoiding duplicates by ID
          const existingIds = new Set(signals.map(s => s.id));
          for (const dbSignal of convertedDbSignals) {
            if (!existingIds.has(dbSignal.id)) {
              signals.push(dbSignal);
              existingIds.add(dbSignal.id);
            }
          }
        }
      } else {
        console.log('trade_signals table does not exist yet - using only in-memory signals');
      }
    } catch (dbError) {
      console.error("Error getting signals from database:", dbError);
      // Continue with in-memory signals if database retrieval fails
    }
    
    // Filter signals based on membership level if not demo mode
    if (membershipLevel !== 'demo') {
      // Limit number of signals based on membership level
      let signalLimit = 3; // Default for free users
      
      if (['paid', 'beginner', 'intermediate'].includes(membershipLevel)) {
        signalLimit = 5;
      } else if (['advanced', 'expert'].includes(membershipLevel)) {
        signalLimit = 10;
      } else if (membershipLevel === 'pro' || membershipLevel === 'admin') {
        signalLimit = 999; // No limit for pro users
      }
      
      // Limit providers based on membership level
      let allowedProviders = ['Hybrid', 'Paradox']; // Free users get Hybrid and some Paradox signals
      
      if (['paid', 'beginner'].includes(membershipLevel)) {
        allowedProviders = ['Hybrid', 'Paradox']; // Beginner/paid get Hybrid + all Paradox
      } else if (['intermediate', 'advanced', 'expert', 'pro', 'admin'].includes(membershipLevel)) {
        allowedProviders = ['Hybrid', 'Paradox', 'Solaris']; // Higher tiers get all
      }
      
      // Only use real signals, no fallback to demo signals
      if (signals.length === 0) {
        console.log('No signals available - returning empty array');
      }
      
      // Apply filters to the signals we have
      // Filter based on provider and limit
      signals = signals
        .filter(signal => allowedProviders.includes(signal.Provider))
        .slice(0, signalLimit);
      
      console.log(`Filtered to ${signals.length} signals based on membership level ${membershipLevel}`);
    }
    
    // Demo users now see the same real signals as other users
    if (isDemoUser) {
      console.log(`Demo user will see ${signals.length} real signals without additional demo data`);
    }
    
    // Return the signals
    return res.json({ signals });
  } catch (error) {
    console.error('Error fetching trading signals:', error);
    res.status(500).json({ error: 'Failed to fetch trading signals' });
  }
});

export default router;