import { Request, Response } from "express";
import * as crypto from "crypto";
import { TRADING_SYMBOLS } from "@/lib/constants";

// Simulates all available market symbols
const availableSymbols = [
  ...TRADING_SYMBOLS.crypto,
  ...TRADING_SYMBOLS.forex,
  ...TRADING_SYMBOLS.stocks,
  ...TRADING_SYMBOLS.indices,
  ...TRADING_SYMBOLS.commodities
];

// Basic price range assumptions for different asset classes
const priceRanges: Record<string, { min: number; max: number; precision: number }> = {
  crypto: { min: 100, max: 50000, precision: 2 },
  forex: { min: 0.5, max: 2, precision: 5 },
  stocks: { min: 10, max: 500, precision: 2 },
  indices: { min: 1000, max: 40000, precision: 2 },
  commodities: { min: 10, max: 2000, precision: 2 },
};

// Get price range for a specific symbol
function getPriceRange(symbol: string) {
  // Identify the asset class
  for (const [category, symbols] of Object.entries(TRADING_SYMBOLS)) {
    if ((symbols as string[]).includes(symbol)) {
      return priceRanges[category] || { min: 10, max: 1000, precision: 2 };
    }
  }
  return { min: 10, max: 1000, precision: 2 };
}

// Generate deterministic but seemingly random price data for a given symbol
function generateMarketData(symbol: string, timeframe: string, bars: number) {
  const range = getPriceRange(symbol);
  const seedValue = `${symbol}-${timeframe}`;
  const seed = crypto.createHash('md5').update(seedValue).digest('hex');
  
  let lastPrice = generateSeededRandomPrice(seed, range.min, range.max);
  const currentTime = Math.floor(Date.now() / 1000) * 1000; // Rounded to the nearest second
  
  const data = [];
  
  // Calculate time increment based on timeframe
  let timeIncrement = 60; // Default to 1 minute in seconds
  
  switch (timeframe) {
    case '1h': timeIncrement = 60 * 60; break;
    case '4h': timeIncrement = 4 * 60 * 60; break;
    case '1d': timeIncrement = 24 * 60 * 60; break;
    case '1w': timeIncrement = 7 * 24 * 60 * 60; break;
    case '1m': timeIncrement = 30 * 24 * 60 * 60; break;
    default: timeIncrement = 60; // 1 minute
  }
  
  // Generate bars
  for (let i = 0; i < bars; i++) {
    // Time for this bar (working backwards from current time)
    const time = currentTime - ((bars - i) * timeIncrement);
    
    // Generate a price change (-2% to +2%)
    const volatilityFactor = getVolatilityFactor(symbol);
    const change = ((Math.random() * 4 - 2) / 100) * volatilityFactor;
    
    // Update price with some randomness while keeping the trend
    lastPrice = lastPrice * (1 + change);
    
    // Ensure price stays within range
    lastPrice = Math.max(range.min, Math.min(range.max, lastPrice));
    
    // Fix precision
    lastPrice = parseFloat(lastPrice.toFixed(range.precision));
    
    // Calculate OHLC values with some variation
    const open = lastPrice;
    const close = parseFloat((lastPrice * (1 + ((Math.random() * 2 - 1) / 100))).toFixed(range.precision));
    const high = parseFloat(Math.max(open, close, lastPrice * (1 + (Math.random() / 100))).toFixed(range.precision));
    const low = parseFloat(Math.min(open, close, lastPrice * (1 - (Math.random() / 100))).toFixed(range.precision));
    
    // Generate volume
    const volume = Math.floor(Math.random() * 1000) + 100;
    
    data.push({
      time: time,
      open,
      high,
      low,
      close,
      volume
    });
    
    // Update last price for next iteration
    lastPrice = close;
  }
  
  return data;
}

// Generate a random price based on a seed for deterministic results
function generateSeededRandomPrice(seed: string, min: number, max: number) {
  const hash = crypto.createHash('md5').update(seed).digest('hex');
  const randomValue = parseInt(hash.substring(0, 8), 16) / 0xffffffff;
  return min + randomValue * (max - min);
}

// Different assets have different volatility
function getVolatilityFactor(symbol: string) {
  if (TRADING_SYMBOLS.crypto.includes(symbol)) {
    return 3.0; // Crypto is more volatile
  } else if (TRADING_SYMBOLS.forex.includes(symbol)) {
    return 0.5; // Forex is less volatile
  } else if (TRADING_SYMBOLS.stocks.includes(symbol)) {
    return 1.5;
  } else if (TRADING_SYMBOLS.indices.includes(symbol)) {
    return 1.0;
  } else if (TRADING_SYMBOLS.commodities.includes(symbol)) {
    return 2.0;
  }
  return 1.0;
}

// Get historical market data
export const getMarketData = (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string || 'BTCUSD';
    const timeframe = req.query.timeframe as string || '1d';
    const bars = parseInt(req.query.bars as string || '100');
    
    // Validate symbol
    if (!availableSymbols.includes(symbol)) {
      return res.status(400).json({ error: `Symbol ${symbol} not supported` });
    }
    
    // Validate bars (limit to reasonable range)
    const validBars = Math.min(Math.max(10, bars), 500);
    
    // Generate market data
    const data = generateMarketData(symbol, timeframe, validBars);
    
    res.json(data);
  } catch (error) {
    console.error("Error generating market data:", error);
    res.status(500).json({ error: "Failed to generate market data" });
  }
};

// Get current price for a symbol
export const getCurrentPrice = (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string || 'BTCUSD';
    
    // Validate symbol
    if (!availableSymbols.includes(symbol)) {
      return res.status(400).json({ error: `Symbol ${symbol} not supported` });
    }
    
    // Get single data point
    const data = generateMarketData(symbol, '1m', 1);
    
    res.json({
      symbol,
      price: data[0].close,
      change: ((data[0].close - data[0].open) / data[0].open) * 100,
      time: data[0].time
    });
  } catch (error) {
    console.error("Error getting current price:", error);
    res.status(500).json({ error: "Failed to get current price" });
  }
};

// Get available symbols
export const getSymbols = (_req: Request, res: Response) => {
  try {
    res.json({
      crypto: TRADING_SYMBOLS.crypto,
      forex: TRADING_SYMBOLS.forex,
      stocks: TRADING_SYMBOLS.stocks,
      indices: TRADING_SYMBOLS.indices,
      commodities: TRADING_SYMBOLS.commodities
    });
  } catch (error) {
    console.error("Error getting symbols:", error);
    res.status(500).json({ error: "Failed to get symbols" });
  }
};
