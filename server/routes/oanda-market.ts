import express, { Request, Response } from 'express';
import { getOandaClient } from '../services/oanda-service';

const router = express.Router();

// Helper function to standardize Oanda forex symbols
function standardizeOandaSymbol(symbol: string): string {
  // Extract the ticker symbol from formats like EURUSD or EUR_USD
  let cleanSymbol = symbol;
  
  // Convert EURUSD to EUR_USD format if needed
  if (!cleanSymbol.includes('_') && cleanSymbol.length === 6) {
    cleanSymbol = `${cleanSymbol.substring(0, 3)}_${cleanSymbol.substring(3, 6)}`;
  }
  
  return cleanSymbol;
}

// GET /api/oanda/candles
// Get candlestick data for a forex pair
router.get('/candles', async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    // Convert timeframe to Oanda format granularity
    const timeframe = req.query.timeframe as string || 'H1';
    const count = parseInt(req.query.count as string) || 100;
    
    console.log(`Fetching Oanda candles for ${symbol} with timeframe ${timeframe}`);
    
    const oandaSymbol = standardizeOandaSymbol(symbol);
    const oandaClient = getOandaClient();
    
    // Map common timeframes to Oanda granularity
    let granularity = timeframe;
    
    // If using common formats like 1h, 4h, convert to Oanda format
    if (timeframe === '1m') granularity = 'M1';
    else if (timeframe === '5m') granularity = 'M5';
    else if (timeframe === '15m') granularity = 'M15';
    else if (timeframe === '30m') granularity = 'M30';
    else if (timeframe === '1h') granularity = 'H1';
    else if (timeframe === '4h') granularity = 'H4';
    else if (timeframe === '1d') granularity = 'D';
    else if (timeframe === '1w') granularity = 'W';
    
    const response = await oandaClient.getCandles(oandaSymbol, {
      granularity,
      count
    });
    
    if (response && response.candles) {
      // Transform the data to a standardized format
      const candles = response.candles.map((candle: any) => ({
        time: candle.time,
        open: parseFloat(candle.mid.o),
        high: parseFloat(candle.mid.h),
        low: parseFloat(candle.mid.l),
        close: parseFloat(candle.mid.c),
        volume: 0, // Oanda doesn't provide volume for forex
        complete: candle.complete
      }));
      
      return res.json({
        symbol: oandaSymbol,
        timeframe: granularity,
        count: candles.length,
        candles
      });
    } else {
      return res.status(404).json({ 
        error: 'No candle data found',
        symbol: oandaSymbol,
        timeframe: granularity
      });
    }
  } catch (error) {
    console.error('Error fetching Oanda candles:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch candle data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/oanda/pricing
// Get current pricing for a forex pair
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    console.log(`Fetching Oanda pricing for ${symbol}`);
    
    const oandaSymbol = standardizeOandaSymbol(symbol);
    const oandaClient = getOandaClient();
    
    const response = await oandaClient.getPricing(oandaSymbol);
    
    if (response && response.prices && response.prices.length > 0) {
      // Get the first price object
      const price = response.prices[0];
      
      // Calculate the mid price from bid and ask
      const midPrice = (parseFloat(price.ask) + parseFloat(price.bid)) / 2;
      
      return res.json({
        symbol: oandaSymbol,
        time: price.time,
        bid: parseFloat(price.bid),
        ask: parseFloat(price.ask),
        price: midPrice, // Average of bid and ask
        spread: parseFloat(price.ask) - parseFloat(price.bid),
        provider: 'oanda'
      });
    } else {
      return res.status(404).json({ 
        error: 'No pricing data found',
        symbol: oandaSymbol
      });
    }
  } catch (error) {
    console.error('Error fetching Oanda pricing:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch pricing data',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

// GET /api/oanda/instruments
// Get available instruments (forex pairs) from Oanda
router.get('/instruments', async (req: Request, res: Response) => {
  try {
    console.log('Fetching Oanda instruments');
    
    const oandaClient = getOandaClient();
    const response = await oandaClient.getInstruments();
    
    if (response && response.instruments) {
      // Transform to a more usable format
      const instruments = response.instruments.map((instrument: any) => ({
        name: instrument.name,
        displayName: instrument.name.replace('_', '/'), // EUR_USD -> EUR/USD
        type: 'forex',
        pipLocation: instrument.pipLocation,
        marginRate: instrument.marginRate,
        minimumTradeSize: instrument.minimumTradeSize
      }));
      
      return res.json({
        count: instruments.length,
        instruments
      });
    } else {
      return res.status(404).json({ 
        error: 'No instruments found'
      });
    }
  } catch (error) {
    console.error('Error fetching Oanda instruments:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch instruments',
      details: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;