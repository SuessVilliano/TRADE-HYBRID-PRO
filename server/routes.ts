import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { getMarketData, getCurrentPrice, getSymbols } from "./api/market";
import { getNews, getTopicNews } from "./api/news";
import { getLeaderboard, getTrader } from "./api/leaderboard";
import { getBots, getBot, createBot, updateBot, deleteBot, runBot, stopBot } from "./api/bots";

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

  return httpServer;
}
