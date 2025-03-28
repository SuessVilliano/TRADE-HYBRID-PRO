import { Request, Response } from "express";
import * as crypto from "crypto";
import { TRADING_SYMBOLS } from "../lib/constants";

// Simulates all available market symbols
const availableSymbols = TRADING_SYMBOLS.map(symbol => symbol.id);

// Get price range for a specific symbol
function getPriceRange(symbol: string) {
  // Find the symbol in our list
  const symbolData = TRADING_SYMBOLS.find(s => s.id === symbol);
  if (symbolData) {
    return { 
      min: symbolData.minPrice, 
      max: symbolData.maxPrice, 
      precision: symbolData.quoteCurrency === 'USDT' ? 2 : 2 
    };
  }
  return { min: 10, max: 1000, precision: 2 }; // Default fallback
}

// Generate deterministic but seemingly random price data for a given symbol
export function generateMarketData(symbol: string, timeframe: string, bars: number) {
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
  // Find the symbol in our list to get its volatility
  const symbolData = TRADING_SYMBOLS.find(s => s.id === symbol);
  if (symbolData) {
    return symbolData.volatility;
  }
  return 0.05; // Default volatility
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
    // Group symbols by type (using the base currency as a simple way to group)
    const cryptoSymbols = TRADING_SYMBOLS.filter(s => ['BTC', 'ETH', 'SOL', 'BNB', 'ADA', 'DOGE'].includes(s.baseCurrency));
    const forexSymbols = TRADING_SYMBOLS.filter(s => ['USD', 'EUR', 'GBP', 'JPY', 'AUD'].includes(s.baseCurrency));
    
    res.json({
      crypto: cryptoSymbols.map(s => s.id),
      forex: forexSymbols.map(s => s.id),
      all: TRADING_SYMBOLS.map(s => s.id)
    });
  } catch (error) {
    console.error("Error getting symbols:", error);
    res.status(500).json({ error: "Failed to get symbols" });
  }
};
