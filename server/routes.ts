import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMarketData, getCurrentPrice, getSymbols } from "./api/market";
import { getNews, getTopicNews } from "./api/news";
import { getLeaderboard, getTrader } from "./api/leaderboard";
import { getBots, getBot, createBot, updateBot, deleteBot, runBot, stopBot } from "./api/bots";

// We'll create separate functions since we have a new signals implementation
const getSignals = (req: any, res: any) => {
  // This is just a wrapper to redirect to the new endpoint
  res.redirect(307, `/api/sheets/trading-signals?marketType=crypto`);
};
// Import at the top to avoid circular dependency
import { processWebhookSignal } from './api/signals';
import { processUserWebhook, getUserWebhookByToken } from './api/user-webhooks';
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
  
  // TradingView webhook route
  app.post("/api/webhooks/tradingview/:token", processTradingViewWebhook); // TradingView alerts integration

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
  
  // Trading Signals API routes
  app.use("/api/sheets", sheetsSignalsRoutes);
  
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

  // News route using default source (bloomberg)
  app.get("/api/rss-feeds/news", (req, res) => {
    // Create a modified request with the sourceId parameter
    const modifiedReq = Object.create(req);

    // Define proper type for the params
    interface RequestParams {
      sourceId: string;
      [key: string]: string;
    }

    // Create params object with correct type
    modifiedReq.params = { 
      ...(req.params || {}), 
      sourceId: 'bloomberg' 
    } as RequestParams;

    return getRssFeed(modifiedReq, res);
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