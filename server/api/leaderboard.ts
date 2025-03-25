import { Request, Response } from "express";
import * as crypto from "crypto";

// Generate a deterministic but random list of traders for the leaderboard
function generateLeaderboard(seed: string, count: number) {
  const traders = [];
  
  // First names list for username generation
  const firstNames = [
    "Alpha", "Beta", "Crypto", "Delta", "Echo", "Forex", "Gold", "Hedge", "Invest",
    "Jade", "Kilo", "Lunar", "Market", "Nasdaq", "Omega", "Profit", "Quant", "Risk",
    "Stock", "Trade", "Ultra", "Value", "Wealth", "Yield", "Zero"
  ];
  
  // Last names/suffixes list for username generation
  const lastNames = [
    "Trader", "Master", "Guru", "Pro", "Expert", "Ninja", "Whale", "Hunter", "King",
    "Queen", "Baron", "Shark", "Eagle", "Tiger", "Wizard", "Samurai", "Titan", "Legend",
    "Sage", "Phoenix", "Wolf", "Hawk", "Bear", "Bull"
  ];
  
  for (let i = 0; i < count; i++) {
    // Create a deterministic seed for this trader
    const traderSeed = crypto.createHash('md5').update(`${seed}-${i}`).digest('hex');
    
    // Generate a username
    const firstNameIndex = parseInt(traderSeed.substring(0, 2), 16) % firstNames.length;
    const lastNameIndex = parseInt(traderSeed.substring(2, 4), 16) % lastNames.length;
    const username = `${firstNames[firstNameIndex]}${lastNames[lastNameIndex]}`;
    
    // Generate profit and loss numbers
    const profitBase = parseInt(traderSeed.substring(4, 10), 16);
    const winRateBase = parseInt(traderSeed.substring(10, 12), 16);
    const tradeCountBase = parseInt(traderSeed.substring(12, 16), 16);
    
    // Make PnL decrease as we go down the list, but with some variance
    const pnlVariance = (Math.random() * 2000) - 1000;
    const pnl = Math.max(-5000, 20000 - (i * 1000) + pnlVariance);
    
    // Win rate and trade count with some randomness
    const winRate = Math.min(95, Math.max(35, (winRateBase % 60) + 35));
    const tradeCount = 50 + (tradeCountBase % 200);
    
    traders.push({
      id: traderSeed.substring(0, 8),
      username,
      avatar: "", // No avatar data for now
      pnl: parseFloat(pnl.toFixed(2)),
      winRate: parseFloat(winRate.toFixed(1)),
      tradeCount
    });
  }
  
  // Sort by PnL (descending)
  traders.sort((a, b) => b.pnl - a.pnl);
  
  return traders;
}

// Get leaderboard data
export const getLeaderboard = (req: Request, res: Response) => {
  try {
    const count = parseInt(req.query.count as string || '20');
    const validCount = Math.min(Math.max(5, count), 100); // Limit between 5 and 100
    
    // Create a seed based on the current day to keep leaderboard stable for a day
    const today = new Date().toISOString().split('T')[0];
    const seed = crypto.createHash('md5').update(today).digest('hex');
    
    // Generate leaderboard data
    const traders = generateLeaderboard(seed, validCount);
    
    res.json(traders);
  } catch (error) {
    console.error("Error generating leaderboard:", error);
    res.status(500).json({ error: "Failed to generate leaderboard" });
  }
};

// Get specific trader data
export const getTrader = (req: Request, res: Response) => {
  try {
    const traderId = req.params.id;
    
    // Create a seed based on the current day
    const today = new Date().toISOString().split('T')[0];
    const seed = crypto.createHash('md5').update(today).digest('hex');
    
    // Generate all traders (so we can find the specific one)
    const allTraders = generateLeaderboard(seed, 100);
    
    // Find the requested trader
    const trader = allTraders.find(t => t.id === traderId);
    
    if (!trader) {
      return res.status(404).json({ error: "Trader not found" });
    }
    
    // Add additional trader details
    const traderSeed = crypto.createHash('md5').update(`${seed}-detail-${traderId}`).digest('hex');
    
    // Generate some additional stats
    const profitFactor = parseFloat((1 + Math.random() * 3).toFixed(2));
    const totalProfit = parseFloat((trader.pnl > 0 ? trader.pnl * (trader.winRate / 100) : 0).toFixed(2));
    const totalLoss = parseFloat((trader.pnl > 0 ? totalProfit / profitFactor : Math.abs(trader.pnl)).toFixed(2));
    
    const detailedTrader = {
      ...trader,
      profitFactor,
      totalProfit,
      totalLoss,
      avgWin: parseFloat((totalProfit / (trader.tradeCount * (trader.winRate / 100))).toFixed(2)),
      avgLoss: parseFloat((totalLoss / (trader.tradeCount * (1 - (trader.winRate / 100)))).toFixed(2)),
      largestWin: parseFloat((totalProfit * 0.2).toFixed(2)),
      largestLoss: parseFloat((totalLoss * 0.25).toFixed(2)),
      joinDate: new Date(Date.now() - (parseInt(traderSeed.substring(0, 8), 16) % 90) * 24 * 60 * 60 * 1000).toISOString()
    };
    
    res.json(detailedTrader);
  } catch (error) {
    console.error("Error getting trader:", error);
    res.status(500).json({ error: "Failed to get trader" });
  }
};
