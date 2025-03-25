import { Request, Response } from "express";
import * as crypto from "crypto";
import { BOT_STRATEGY_TYPES } from "@/lib/constants";

// In-memory storage for bots (real implementation would use a database)
const botsStore: Map<string, any> = new Map();

// Get all bots
export const getBots = (req: Request, res: Response) => {
  try {
    const userId = req.query.userId as string || 'default'; // In real app, should be from auth
    
    // Get bots for this user
    const userBots = Array.from(botsStore.values())
      .filter(bot => bot.userId === userId);
    
    // If no bots found, generate some initial ones for demo
    if (userBots.length === 0) {
      const initialBots = generateInitialBots(userId);
      initialBots.forEach(bot => {
        botsStore.set(bot.id, bot);
      });
      
      return res.json(initialBots);
    }
    
    res.json(userBots);
  } catch (error) {
    console.error("Error getting bots:", error);
    res.status(500).json({ error: "Failed to get bots" });
  }
};

// Get a specific bot
export const getBot = (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    
    if (!botsStore.has(botId)) {
      return res.status(404).json({ error: "Bot not found" });
    }
    
    res.json(botsStore.get(botId));
  } catch (error) {
    console.error("Error getting bot:", error);
    res.status(500).json({ error: "Failed to get bot" });
  }
};

// Create a new bot
export const createBot = (req: Request, res: Response) => {
  try {
    const { name, type, symbol, code } = req.body;
    const userId = 'default'; // In real app, should be from auth
    
    // Validate required fields
    if (!name || !type || !symbol || !code) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create a new bot
    const botId = crypto.randomBytes(4).toString('hex');
    const bot = {
      id: botId,
      name,
      type,
      symbol,
      code,
      active: false,
      userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      performance: {
        winRate: 0,
        pnl: 0,
        trades: 0
      }
    };
    
    // Save to store
    botsStore.set(botId, bot);
    
    res.status(201).json(bot);
  } catch (error) {
    console.error("Error creating bot:", error);
    res.status(500).json({ error: "Failed to create bot" });
  }
};

// Update a bot
export const updateBot = (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    const updates = req.body;
    
    if (!botsStore.has(botId)) {
      return res.status(404).json({ error: "Bot not found" });
    }
    
    // Get existing bot
    const bot = botsStore.get(botId);
    
    // Update fields (only allow certain fields to be updated)
    const allowedUpdates = ['name', 'code', 'type', 'symbol'];
    Object.keys(updates).forEach(key => {
      if (allowedUpdates.includes(key)) {
        bot[key] = updates[key];
      }
    });
    
    // Update timestamp
    bot.updated = new Date().toISOString();
    
    // Save changes
    botsStore.set(botId, bot);
    
    res.json(bot);
  } catch (error) {
    console.error("Error updating bot:", error);
    res.status(500).json({ error: "Failed to update bot" });
  }
};

// Delete a bot
export const deleteBot = (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    
    if (!botsStore.has(botId)) {
      return res.status(404).json({ error: "Bot not found" });
    }
    
    // Delete from store
    botsStore.delete(botId);
    
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting bot:", error);
    res.status(500).json({ error: "Failed to delete bot" });
  }
};

// Start a bot
export const runBot = (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    
    if (!botsStore.has(botId)) {
      return res.status(404).json({ error: "Bot not found" });
    }
    
    // Get bot and set to active
    const bot = botsStore.get(botId);
    bot.active = true;
    bot.updated = new Date().toISOString();
    
    // Save changes
    botsStore.set(botId, bot);
    
    res.json(bot);
  } catch (error) {
    console.error("Error running bot:", error);
    res.status(500).json({ error: "Failed to run bot" });
  }
};

// Stop a bot
export const stopBot = (req: Request, res: Response) => {
  try {
    const botId = req.params.id;
    
    if (!botsStore.has(botId)) {
      return res.status(404).json({ error: "Bot not found" });
    }
    
    // Get bot and set to inactive
    const bot = botsStore.get(botId);
    bot.active = false;
    bot.updated = new Date().toISOString();
    
    // Save changes
    botsStore.set(botId, bot);
    
    res.json(bot);
  } catch (error) {
    console.error("Error stopping bot:", error);
    res.status(500).json({ error: "Failed to stop bot" });
  }
};

// Helper to generate some initial bots for demo
function generateInitialBots(userId: string) {
  return [
    {
      id: crypto.randomBytes(4).toString('hex'),
      name: "BTC Trend Follower",
      type: "trend",
      symbol: "BTCUSD",
      code: `function onNewBar(bar) {
  if (bar.close > bar.sma(50)) {
    return "BUY";
  } else if (bar.close < bar.sma(50)) {
    return "SELL";
  }
  return "HOLD";
}`,
      active: false,
      userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      performance: {
        winRate: 62,
        pnl: 450,
        trades: 28
      }
    },
    {
      id: crypto.randomBytes(4).toString('hex'),
      name: "ETH Breakout Scanner",
      type: "breakout",
      symbol: "ETHUSD",
      code: `function onNewBar(bar) {
  const upperBand = bar.highest(20);
  const lowerBand = bar.lowest(20);
  
  if (bar.close > upperBand) {
    return "BUY";
  } else if (bar.close < lowerBand) {
    return "SELL";
  }
  return "HOLD";
}`,
      active: false,
      userId,
      created: new Date().toISOString(),
      updated: new Date().toISOString(),
      performance: {
        winRate: 54,
        pnl: 320,
        trades: 15
      }
    }
  ];
}
