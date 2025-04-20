import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMarketData, getCurrentPrice, getSymbols } from "./api/market";
import { getNews, getTopicNews } from "./api/news";
import { getLeaderboard, getTrader } from "./api/leaderboard";
import { getBots, getBot, createBot, updateBot, deleteBot, runBot, stopBot } from "./api/bots";
import notificationsRouter from "./api/notifications";

// We'll create separate functions to directly use our signals-api
const getSignals = (req: any, res: any) => {
  // Extract market type from query params
  const marketType = req.query.marketType || 'crypto';
  const userId = req.query.userId || undefined;
  
  // Forward to our signals API
  req.url = `/api/signals/trading-signals?marketType=${marketType}`;
  if (userId) {
    req.url += `&userId=${userId}`;
  }
  
  // Call the handler directly
  import('./api/signals').then(signalsModule => {
    const router = signalsModule.default;
    // Find the trading-signals route handler
    const routes = router.stack;
    const route = routes.find((r: any) => 
      r.route && r.route.path === '/trading-signals'
    );
    
    if (route && route.route && route.route.stack && route.route.stack.length > 0) {
      // Call the handler directly
      const handler = route.route.stack[0].handle;
      handler(req, res, () => {});
    } else {
      // Fallback to redirect if we can't find the handler
      res.redirect(307, `/api/signals/trading-signals?marketType=${marketType}`);
    }
  }).catch(err => {
    console.error('Error importing signals module:', err);
    res.status(500).json({ error: 'Failed to load signals module' });
  });
};
// Import at the top to avoid circular dependency
import { processWebhookSignal } from './api/signals';
import { processUserWebhook, getUserWebhookByToken, executeQueryFromFile } from './api/user-webhooks';
import { processTradingViewWebhook } from './api/tradingview-webhooks';

const receiveWebhook = (req: any, res: any) => {
  try {
    // Check if there's a payload and forward it to the signal processor
    if (req.body && (req.body.content || req.body.data)) {
      const payload = req.body;
      
      // Process the webhook signal
      processWebhookSignal(payload);
      
      console.log('Received and processed webhook signal');
    }
  } catch (error) {
    console.error('Error processing webhook:', error);
  }
  
  // Always return success to prevent the webhook sender from retrying
  return res.json({success: true, message: 'Webhook received'});
};

// Process user webhook signals
const receiveUserWebhook = async (req: any, res: any) => {
  try {
    const token = req.params.token;
    
    if (!token) {
      return res.status(400).json({ error: 'Missing webhook token' });
    }
    
    // Process the webhook with user token
    const success = await processUserWebhook(token, req.body);
    
    if (!success) {
      return res.status(404).json({ error: 'Invalid webhook token or webhook is inactive' });
    }
    
    console.log('Received and processed user webhook signal');
    return res.json({ success: true, message: 'User webhook received' });
  } catch (error) {
    console.error('Error processing user webhook:', error);
    return res.status(500).json({ error: 'Failed to process webhook' });
  }
};
import { getGameLeaderboard, getGamePlayer, submitGameScore } from "./api/game-leaderboard";
import { getRssFeed, getAvailableSources, getEconomicCalendar } from "./api/rss-feeds";
import { getAIMarketAnalysis, getTradingSuggestions } from "./api/ai-market-analysis";
import { saveJournalEntry, getJournalEntries } from "./api/journal";
import vapiRouter from "./routes/vapi";
import geminiRouter from "./routes/gemini";
import { MultiplayerServer } from "./multiplayer";
import journalRoutes from './api/journal'; // Added import for journal routes
import learningRoutes from './api/learning'; // Added import for learning center routes
import settingsRoutes from './api/settings'; // Added import for settings routes
import signalsAnalyzerRoutes from './api/signals-analyzer'; // Added import for signals analyzer routes
import googleSheetsSignalsRoutes from './api/signals'; // Added import for Google Sheets signals routes
import sheetsSignalsRoutes from './api/sheets'; // Import for trading signals routes
import openAIProxyRoutes from './api/openai-proxy'; // Added import for OpenAI proxy routes
import brokerRoutes from './routes/broker-routes'; // Added import for broker routes
import identityRoutes from './routes/identity-routes'; // Added import for user identity routes
import authRoutes from './routes/auth-routes'; // Added import for authentication routes
import whopRoutes from './routes/whop-routes'; // Added import for Whop authentication routes
// import propFirmRoutes from './routes/prop-firm-routes'; // Using mock implementation instead
import mockPropFirmRoutes from './routes/mock-prop-firm-routes'; // Added import for mock prop firm routes

// Import routes
import membershipRoutes from './routes/membership-routes'; // Added import for membership routes
import userWebhooksRoutes from './api/user-webhooks'; // Added import for user webhooks routes
import webhookRoutes from './routes/webhooks-fixed'; // Added import for webhook routes (using fixed version)
import brokerApiRoutes from './routes/broker'; // Added import for broker API routes

// Import Investor dashboard routes
import investorsRoutes from './api/investors'; // Import for investor routes
import investmentsRoutes from './api/investments'; // Import for investments routes
import investmentPerformanceRoutes from './api/investment-performance'; // Import for investment performance routes
import feeSettingsRoutes from './api/fee-settings'; // Import for fee settings routes
import companyRevenueRoutes from './api/company-revenue'; // Import for company revenue routes
import signalSubscriptionsRoutes from './api/signal-subscriptions'; // Import for signal subscriptions routes
import oandaMarketRoutes from './routes/oanda-market'; // Import for Oanda market data routes
import marketDataRoutes from './routes/market-data'; // Import for unified market data routes
import marketDataStatusRoutes from './routes/market-data-status'; // Import for market data status route
import brokerStatusRoutes from './routes/broker-status'; // Import for broker status routes
import resetCredentialsRoutes from './routes/reset-credentials'; // Import for credential reset routes
import alpacaTestRoutes from './routes/alpaca-test'; // Import for Alpaca API test routes
import fixAlpacaRoutes from './routes/fix-alpaca'; // Import for Alpaca fixed credentials route
import testAlpacaAuthRoutes from './routes/test-alpaca-auth'; // Import for direct Alpaca auth test
import testCredentialsRoutes from './routes/test-credentials'; // Import for API credential testing routes
import abatevRoutes from './api/abatev'; // Import for ABATEV integration routes

export async function registerRoutes(app: Express): Promise<Server> {
  // Market data routes
  app.get("/api/market/data", getMarketData);
  app.get("/api/market/price", getCurrentPrice);
  app.get("/api/market/symbols", getSymbols);

  // News routes
  app.get("/api/news", getNews);
  app.get("/api/news/topic/:topic", getTopicNews);

  // Leaderboard routes
  app.get("/api/leaderboard", getLeaderboard);
  app.get("/api/leaderboard/trader/:id", getTrader);

  // Bot routes
  app.get("/api/bots", getBots);
  app.get("/api/bots/:id", getBot);
  app.post("/api/bots", createBot);
  app.put("/api/bots/:id", updateBot);
  app.delete("/api/bots/:id", deleteBot);
  app.post("/api/bots/:id/run", runBot);
  app.post("/api/bots/:id/stop", stopBot);

  // Signals routes
  app.get("/api/signals", getSignals);
  app.post("/api/webhooks/tradingview", receiveWebhook);
  app.post("/api/webhooks/signals", receiveWebhook);

  // New signal webhook endpoints from user
  // Paradox AI signals
  app.post("/workflow/sendwebhookdata/IjU3NjUwNTY4MDYzNjA0MzQ1MjZhNTUzMTUxMzci_pc", receiveWebhook); // SOLUSDT - Paradox AI - crypto
  app.post("/api/v1/webhooks/tUOebm12d8na01WofspmU", receiveWebhook); // BTCUSDT and ETHUSDT - Paradox AI - crypto

  // Other signal sources
  app.post("/api/v1/webhooks/Ec3lDNCfkpQtHNbWk16mA", receiveWebhook); // MNQ! - Hybrid AI - futures

  // Solaris AI forex signals
  app.post("/api/v1/webhooks/OXdqSQ0du1D7gFEEDBUsS", receiveWebhook); // EURUSD & AUDUSD - Solaris AI - forex
  
  // User webhook route for custom integrations
  app.post("/api/webhooks/user/:token", receiveUserWebhook); // Custom user webhooks
  
  // Shortened webhook URL route - /wh/ prefix for cleaner, shorter URLs
  app.post("/wh/:token", async (req, res) => {
    if (!req.params.token) {
      return res.status(400).json({ error: 'Missing webhook token' });
    }
    
    console.log('Received webhook request on shortened URL:', req.params.token);
    
    // The shortened URL uses only the first 12 characters of the token
    // We need to look up the full token in our database
    const partialToken = req.params.token;
    
    try {
      // Query the database for webhooks that start with this token prefix
      const query = `
        SELECT * FROM user_webhooks 
        WHERE token LIKE '${partialToken}%' 
        LIMIT 1
      `;
      
      // Use executeQueryFromFile instead of storage.execute
      const rows = await executeQueryFromFile(query);
      
      if (rows && rows.length > 0) {
        // We found a matching webhook, use its full token
        const webhook = rows[0];
        const fullToken = webhook.token;
        
        // Now process the webhook with the full token
        const success = await processUserWebhook(fullToken, req.body);
        
        if (!success) {
          return res.status(404).json({ error: 'Invalid webhook or webhook is inactive' });
        }
        
        console.log('Successfully processed shortened webhook URL');
        return res.json({ success: true, message: 'Webhook received' });
      } else {
        console.error('No webhook found with token starting with:', partialToken);
        return res.status(404).json({ error: 'Webhook not found' });
      }
    } catch (error) {
      console.error('Error processing shortened webhook URL:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });
  
  // TradingView webhook routes (both traditional and shortened URL formats)
  app.post("/api/webhooks/tradingview/:token", processTradingViewWebhook); // Traditional TradingView alerts integration
  
  // Shortened TradingView webhook URL handler
  app.post("/api/wh/tv/:token", async (req, res) => {
    if (!req.params.token) {
      return res.status(400).json({ error: 'Missing webhook token' });
    }
    
    console.log('Received shortened TradingView webhook:', req.params.token);
    
    // The shortened URL uses only the first 12 characters of the token
    // We need to look up the full token in our database
    const partialToken = req.params.token;
    
    try {
      // Query the database for webhooks that start with this token prefix
      const query = `
        SELECT * FROM user_webhooks 
        WHERE token LIKE '${partialToken}%' 
        LIMIT 1
      `;
      
      // Use executeQueryFromFile to find the webhook
      const rows = await executeQueryFromFile(query);
      
      if (rows && rows.length > 0) {
        // We found a matching webhook, use its full token
        const webhook = rows[0];
        const fullToken = webhook.token;
        
        // Create a modified request with the full token
        const modifiedReq = Object.create(req);
        modifiedReq.params = { ...req.params, token: fullToken };
        
        // Now process the TradingView webhook with the full token
        return processTradingViewWebhook(modifiedReq, res);
      } else {
        console.error('No webhook found with token starting with:', partialToken);
        return res.status(404).json({ error: 'Webhook not found' });
      }
    } catch (error) {
      console.error('Error processing shortened TradingView webhook URL:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Test webhooks for Cash Cow formats
  app.post("/api/test/webhook/cashcow", (req, res) => {
    // Create a sample Cash Cow signal based on the requested type
    const signalType = req.query.type || 'forex';

    // Define a proper interface for the payload
    interface CashCowPayload {
      content: string;
      channel_name: string;
    }

    let payload: CashCowPayload = { 
      content: '',
      channel_name: ''
    };

    switch (signalType) {
      case 'forex':
        payload.content = `Cash Cow SELL ALERT Symbol: USDJPY Entry: 150.532 Stop Loss: 150.61 - 7.8 pips Take Profit: 150.142 - 39 pips DO NOT RISK MORE THAN 0.25-1%`;
        payload.channel_name = 'forex-signals';
        break;
      case 'futures':
        payload.content = `Cash Cow BUY ALERT Symbol: MGC1! Entry: 2738 Stop Loss: 2731.7 - 63 pips Take Profit: 2769.5 - 315 pips DO NOT RISK MORE THAN 0.25-1%`;
        payload.channel_name = 'futures-signals';
        break;
      case 'hybrid':
        payload.content = `Cash Cow SELL ALERT Symbol: NQ1! Entry: 20135.25 Stop Loss: 20152.36 (+17.11 points) TP1: 20101.04 (-34.21 points) R:R = 2 TP2: 20083.93 (-51.32 points) R:R = 3 TP3: 20066.82 (-68.43 points) R:R = 4 DO NOT RISK MORE THAN 0.25-1%`;
        payload.channel_name = 'hybridai-signals';
        break;
      default:
        payload.content = `Cash Cow BUY ALERT Symbol: BTCUSDT Entry: 67500 Stop Loss: 66950 - 550 pips Take Profit: 68600 - 1100 pips DO NOT RISK MORE THAN 0.25-1%`;
        payload.channel_name = 'crypto-signals';
    }

    // Pass the payload to the webhook processor
    req.body = payload;
    return receiveWebhook(req, res);
  });

  // Game leaderboard routes
  app.get("/api/games/:gameId/leaderboard", getGameLeaderboard);
  app.get("/api/games/:gameId/players/:playerId", getGamePlayer);
  app.post("/api/games/:gameId/scores", submitGameScore);

  // RSS Feeds and Economic Calendar routes
  app.get("/api/rss-feeds/feed/:sourceId", getRssFeed);
  app.get("/api/rss-feeds/source/:sourceId", getRssFeed);
  app.get("/api/rss-feeds/sources", getAvailableSources);
  app.get("/api/rss-feeds/economic-calendar", getEconomicCalendar);

  // AI Market Analysis routes
  app.get("/api/ai/market-analysis", getAIMarketAnalysis);
  app.get("/api/ai/trading-suggestions", getTradingSuggestions);

  // Journal routes
  app.use("/api/journal", journalRoutes); // Use the router for all journal routes

  // Vapi Voice Assistant routes
  app.use("/api/vapi", vapiRouter);

  // Gemini Vision AI routes
  app.use("/api/gemini", geminiRouter);
  
  // Learning Center routes
  app.use("/api/learning", learningRoutes);
  
  // Settings routes
  app.use("/api/settings", settingsRoutes);
  
  // Signals Analyzer routes
  app.use("/api/signals-analyzer", signalsAnalyzerRoutes);
  
  // Google Sheets Signals routes
  app.use("/api/sheets", googleSheetsSignalsRoutes);
  
  // Trading Signals API routes - mount explicitly to handle direct requests
  app.use("/api/signals", googleSheetsSignalsRoutes);
  
  // OpenAI API proxy routes
  app.use("/api/openai-proxy", openAIProxyRoutes);
  
  // Broker routes
  app.use("/api/brokers", brokerRoutes);
  
  // User identity routes
  app.use("/api/identity", identityRoutes);
  
  // Auth routes
  app.use("/api/auth", authRoutes);
  
  // Whop authentication routes
  app.use("/api/whop", whopRoutes);
  
  // Prop Firm routes (using mock implementation)
  app.use("/api/prop-firm", mockPropFirmRoutes);
  
  // Membership routes
  app.use("/api/membership", membershipRoutes);
  
  // User webhooks routes
  app.use("/api/user-webhooks", userWebhooksRoutes);
  
  // New broker API routes
  app.use("/api/broker", brokerApiRoutes);
  
  // New webhooks routes for automated trading
  app.use("/api/webhooks", webhookRoutes);
  
  // Investor Dashboard routes
  app.use("/api/investors", investorsRoutes);
  app.use("/api/investments", investmentsRoutes);
  app.use("/api/investment-performance", investmentPerformanceRoutes);
  app.use("/api/fee-settings", feeSettingsRoutes);
  app.use("/api/company-revenue", companyRevenueRoutes);
  
  // Signal Subscriptions routes
  app.use("/api/signal-subscriptions", signalSubscriptionsRoutes);
  
  // Push Notifications routes
  app.use("/api/notifications", notificationsRouter);
  
  // Oanda Market Data routes
  app.use("/api/oanda", oandaMarketRoutes);
  
  // Unified Market Data routes
  app.use("/api/market-data", marketDataRoutes);
  
  // Market Data Status routes
  app.use("/api/market-data-status", marketDataStatusRoutes);
  
  // Broker status routes
  app.use("/api/broker-status", brokerStatusRoutes);
  
  // API Credentials reset routes
  app.use("/api/reset-credentials", resetCredentialsRoutes);
  
  // Alpaca API test route
  app.use("/api/alpaca-test", alpacaTestRoutes);
  
  // Fixed Alpaca API route with hardcoded credentials
  app.use("/api/fix-alpaca", fixAlpacaRoutes);
  
  // Direct Alpaca API test route with explicitly provided credentials
  app.use("/api/test-alpaca-auth", testAlpacaAuthRoutes);
  
  // API Credential Manager test routes
  app.use("/api/test-credentials", testCredentialsRoutes);
  
  // ABATEV integration routes
  app.use("/api/abatev", abatevRoutes);

  // News route using multiple sources
  app.get("/api/rss-feeds/news", async (req, res) => {
    try {
      interface RequestParams {
        sourceId: string;
        [key: string]: string;
      }
      
      // Determine which sources to fetch from - only use sources with working feeds
      const sourcesToFetch = ['cnbc', 'investing'];
      let allItems: any[] = [];
      const limit = parseInt(req.query.limit as string) || 10;
      const itemsPerSource = Math.max(3, Math.ceil(limit / sourcesToFetch.length));
      
      console.log(`Fetching news from multiple sources: ${sourcesToFetch.join(', ')}`);
      
      // Fetch from each source
      for (const sourceId of sourcesToFetch) {
        const modifiedReq = Object.create(req);
        modifiedReq.params = { 
          ...(req.params || {}), 
          sourceId: sourceId 
        } as RequestParams;
        
        // Create a promise with a timeout for this source
        const sourcePromise = new Promise<any[]>(async (resolve) => {
          try {
            // Create a response object that we can manipulate
            const responseObj: any = {
              json: (data: any) => {
                if (data && data.items && Array.isArray(data.items)) {
                  resolve(data.items);
                } else {
                  resolve([]);
                }
              },
              status: () => ({ json: () => resolve([]) })
            };
            
            // Call the RSS feed handler for this source
            await getRssFeed(modifiedReq, responseObj);
          } catch (error) {
            console.error(`Error fetching from ${sourceId}:`, error);
            resolve([]);
          }
        });
        
        // Add a timeout for each source
        const timeoutPromise = new Promise<any[]>((resolve) => {
          setTimeout(() => {
            console.log(`Timeout for source ${sourceId}`);
            resolve([]);
          }, 5000); // 5 second timeout
        });
        
        // Race the source fetch against the timeout
        const sourceItems = await Promise.race([sourcePromise, timeoutPromise]);
        allItems = [...allItems, ...sourceItems.slice(0, itemsPerSource)];
      }
      
      // Sort by date (most recent first)
      allItems.sort((a, b) => {
        const dateA = a.pubDate ? new Date(a.pubDate) : new Date(0);
        const dateB = b.pubDate ? new Date(b.pubDate) : new Date(0);
        return dateB.getTime() - dateA.getTime();
      });
      
      // Limit final results
      const finalItems = allItems.slice(0, limit);
      
      console.log(`Returning ${finalItems.length} news items from multiple sources`);
      return res.json({ items: finalItems });
      
    } catch (error) {
      console.error('Error handling multi-source news request:', error);
      return res.status(500).json({ error: 'Failed to fetch news from multiple sources' });
    }
  });

  // Trader routes - Mock trading functionality
  app.get("/api/trader/trades", (_req, res) => {
    // Mock trade data
    const trades = [
      {
        id: "1",
        symbol: "BTCUSD",
        side: "buy",
        quantity: 0.1,
        entryPrice: 35000,
        exitPrice: 36500,
        profit: 150,
        timestamp: new Date().toISOString(),
      },
      {
        id: "2",
        symbol: "ETHUSD",
        side: "sell",
        quantity: 0.5,
        entryPrice: 2000,
        exitPrice: 1800,
        profit: 100,
        timestamp: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: "3",
        symbol: "EURUSD",
        side: "buy",
        quantity: 1000,
        entryPrice: 1.08,
        exitPrice: 1.075,
        profit: -50,
        timestamp: new Date(Date.now() - 7200000).toISOString(),
      },
    ];

    const stats = {
      winRate: 66.7,
      profitFactor: 5,
      totalProfit: 250,
      totalLoss: 50,
      netPnL: 200,
      avgWin: 125,
      avgLoss: 50,
      largestWin: 150,
      largestLoss: 50
    };

    res.json({
      trades,
      stats,
      balance: 10200
    });
  });

  app.post("/api/trader/trade", (req, res) => {
    const tradeRequest = req.body;

    // Create a mock trade result
    const side = tradeRequest.side;
    const symbol = tradeRequest.symbol;
    const quantity = tradeRequest.quantity;
    const leverage = tradeRequest.leverage || 1;

    // Simulate a random price movement (-2% to +2%)
    const priceChange = Math.random() * 0.04 - 0.02;

    const mockEntryPrice = side === "buy" ? 100 : 100;
    const mockExitPrice = mockEntryPrice * (1 + (side === "buy" ? priceChange : -priceChange));

    // Calculate profit/loss
    const priceDifference = side === "buy" 
      ? mockExitPrice - mockEntryPrice 
      : mockEntryPrice - mockExitPrice;
    const profit = priceDifference * quantity * leverage;

    const trade = {
      id: Date.now().toString(),
      symbol,
      side,
      quantity,
      entryPrice: mockEntryPrice,
      exitPrice: mockExitPrice,
      profit,
      timestamp: new Date().toISOString(),
    };

    // Calculate new balance
    const newBalance = 10200 + profit;

    res.json({
      trade,
      newBalance
    });
  });

  const httpServer = createServer(app);

  // Initialize the multiplayer server with our HTTP server
  new MultiplayerServer(httpServer);

  return httpServer;
}