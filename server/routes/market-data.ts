import express, { Request, Response } from 'express';
import axios from 'axios';
import { getAlpacaClient } from '../services/alpaca-service';
import { getOandaClient } from '../services/oanda-service';

const router = express.Router();

// Helper function to determine if a symbol is forex
function isForexSymbol(symbol: string): boolean {
  // Clean the symbol first
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  // Check if it follows common forex patterns (EUR_USD or EURUSD formats)
  return /^[A-Z]{3}_[A-Z]{3}$/.test(cleanSymbol) || 
         (/^[A-Z]{6}$/.test(cleanSymbol) && 
          ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
            currency => cleanSymbol.includes(currency)
          ));
}

// Helper function to get a standardized symbol format for Alpaca
function getAlpacaSymbol(symbol: string): string {
  // Extract the ticker symbol from formats like BINANCE:BTCUSDT or BTCUSD
  const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  return cleanSymbol;
}

// Helper function to get a standardized symbol format for Oanda
function getOandaSymbol(symbol: string): string {
  // Extract the ticker symbol from formats like BINANCE:BTCUSDT or BTCUSD
  let cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
  
  // Convert EURUSD to EUR_USD format for Oanda if needed
  if (!cleanSymbol.includes('_') && cleanSymbol.length === 6) {
    cleanSymbol = `${cleanSymbol.substring(0, 3)}_${cleanSymbol.substring(3, 6)}`;
  }
  
  return cleanSymbol;
}

// GET /api/market-data/history
// Fetch historical market data for a symbol from Alpaca (or Oanda for forex)
router.get('/history', async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    const interval = req.query.interval as string || '1h';
    const limit = parseInt(req.query.limit as string) || 100;
    
    console.log(`Fetching historical data for ${symbol} with interval ${interval}`);
    
    // Determine if the symbol is forex
    const isForex = isForexSymbol(symbol);
    
    let bars = [];
    let provider = '';
    let errors = [];
    
    if (isForex) {
      // Use Oanda for forex
      try {
        console.log('Using Oanda API for forex data');
        const oandaSymbol = getOandaSymbol(symbol);
        
        // Convert interval to Oanda granularity format
        let granularity = 'H1'; // Default 1 hour
        
        switch (interval.toLowerCase()) {
          case '1m': granularity = 'M1'; break;
          case '5m': granularity = 'M5'; break;
          case '15m': granularity = 'M15'; break;
          case '30m': granularity = 'M30'; break;
          case '1h': granularity = 'H1'; break;
          case '4h': granularity = 'H4'; break;
          case '1d': granularity = 'D'; break;
          case '1w': granularity = 'W'; break;
        }
        
        const oandaClient = getOandaClient();
        const response = await oandaClient.getCandles(oandaSymbol, {
          granularity,
          count: limit
        });
        
        if (response && response.candles) {
          bars = response.candles.map((candle: any) => ({
            t: new Date(candle.time).toISOString(),
            o: parseFloat(candle.mid.o),
            h: parseFloat(candle.mid.h),
            l: parseFloat(candle.mid.l),
            c: parseFloat(candle.mid.c),
            v: 0 // Oanda doesn't provide volume for forex
          }));
          provider = 'oanda';
        }
      } catch (error) {
        console.error('Error fetching from Oanda:', error);
        
        // Store error details for response
        errors.push({
          provider: 'oanda',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
        
        // Fall through to try Alpaca as a backup
      }
    }
    
    // If not forex or if Oanda failed, try Alpaca
    if (bars.length === 0) {
      try {
        console.log('Using Alpaca API for market data');
        const alpacaSymbol = getAlpacaSymbol(symbol);
        
        // Convert interval to Alpaca timeframe format
        let timeframe = '1Hour'; // Default 1 hour
        
        switch (interval.toLowerCase()) {
          case '1m': timeframe = '1Min'; break;
          case '5m': timeframe = '5Min'; break;
          case '15m': timeframe = '15Min'; break;
          case '30m': timeframe = '30Min'; break;
          case '1h': timeframe = '1Hour'; break;
          case '1d': timeframe = '1Day'; break;
          case '1w': timeframe = '1Week'; break;
        }
        
        const alpacaClient = getAlpacaClient();
        const barset = await alpacaClient.getBars({
          symbol: alpacaSymbol,
          timeframe,
          limit
        });
        
        if (barset) {
          bars = barset.map((bar: any) => ({
            t: new Date(bar.t).toISOString(),
            o: bar.o,
            h: bar.h,
            l: bar.l,
            c: bar.c,
            v: bar.v
          }));
          provider = 'alpaca';
        }
      } catch (error) {
        console.error('Error fetching from Alpaca:', error);
        
        // Store error details for response
        errors.push({
          provider: 'alpaca',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    }
    
    // Check if we have any bars, if not return an error
    if (bars.length === 0) {
      return res.status(503).json({
        error: 'Could not fetch market data from any provider',
        symbol,
        interval,
        errors,
        status: 'error'
      });
    }
    
    // Return the bars data with metadata
    return res.json({
      symbol,
      interval,
      bars,
      count: bars.length,
      provider,
      status: 'success'
    });
    
  } catch (error) {
    console.error('Error in market data history endpoint:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch market data',
      details: error instanceof Error ? error.message : String(error),
      status: 'error'
    });
  }
});

// GET /api/market-data/quote
// Get the current price for a symbol
router.get('/quote', async (req: Request, res: Response) => {
  try {
    const symbol = req.query.symbol as string;
    if (!symbol) {
      return res.status(400).json({ 
        error: 'Symbol is required',
        status: 'error'
      });
    }
    
    console.log(`Fetching current price for ${symbol}`);
    
    // Determine if the symbol is forex
    const isForex = isForexSymbol(symbol);
    
    let quote = null;
    let provider = '';
    let errors = [];
    
    if (isForex) {
      // Use Oanda for forex
      try {
        console.log('Using Oanda API for forex quote');
        const oandaSymbol = getOandaSymbol(symbol);
        
        const oandaClient = getOandaClient();
        const response = await oandaClient.getPricing(oandaSymbol);
        
        if (response && response.prices && response.prices.length > 0) {
          const price = response.prices[0];
          quote = {
            symbol: oandaSymbol,
            price: (parseFloat(price.ask) + parseFloat(price.bid)) / 2,
            bid: parseFloat(price.bid),
            ask: parseFloat(price.ask),
            timestamp: new Date(price.time).toISOString()
          };
          provider = 'oanda';
        }
      } catch (error) {
        console.error('Error fetching quote from Oanda:', error);
        
        // Store error details for response
        errors.push({
          provider: 'oanda',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
        
        // Fall through to try Alpaca as a backup
      }
    }
    
    // If not forex or if Oanda failed, try Alpaca
    if (!quote) {
      try {
        console.log('Using Alpaca API for quote');
        const alpacaSymbol = getAlpacaSymbol(symbol);
        
        const alpacaClient = getAlpacaClient();
        const response = await alpacaClient.getQuote(alpacaSymbol);
        
        if (response) {
          // Handle different response formats (real API vs mock)
          let price = null;
          let bidPrice = null;
          let askPrice = null;
          
          // Check for Alpaca API format
          if (response.askprice !== undefined && response.bidprice !== undefined) {
            price = (response.askprice + response.bidprice) / 2;
            bidPrice = response.bidprice;
            askPrice = response.askprice;
          }
          // Check for mock data format
          else if (response.ap !== undefined && response.bp !== undefined) {
            price = (parseFloat(response.ap) + parseFloat(response.bp)) / 2;
            bidPrice = parseFloat(response.bp);
            askPrice = parseFloat(response.ap);
          }
          
          quote = {
            symbol: alpacaSymbol,
            price: price,
            bid: bidPrice,
            ask: askPrice,
            timestamp: response.timestamp || response.t ? 
              new Date(response.timestamp || response.t).toISOString() : 
              new Date().toISOString()
          };
          provider = 'alpaca';
        }
      } catch (error) {
        console.error('Error fetching quote from Alpaca:', error);
        
        // Store error details for response
        errors.push({
          provider: 'alpaca',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    }
    
    if (quote) {
      return res.json({
        ...quote,
        provider,
        status: 'success'
      });
    } else {
      return res.status(503).json({ 
        error: 'Unable to fetch quote from any provider',
        symbol,
        errors,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
    
  } catch (error) {
    console.error('Error in market data quote endpoint:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch quote',
      details: error instanceof Error ? error.message : String(error),
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

// GET /api/market-data/symbols
// Get available symbols from Alpaca and/or Oanda
router.get('/symbols', async (req: Request, res: Response) => {
  try {
    // Get the requested market type (stocks, crypto, forex)
    const market = (req.query.market as string || 'all').toLowerCase();
    
    let symbols: any[] = [];
    const providers: Record<string, boolean> = {};
    let errors: any[] = [];
    
    // Get forex symbols from Oanda if requested
    if (market === 'all' || market === 'forex') {
      try {
        console.log('Fetching forex symbols from Oanda');
        const oandaClient = getOandaClient();
        const response = await oandaClient.getInstruments();
        
        if (response && response.instruments) {
          const forexSymbols = response.instruments.map((instrument: any) => ({
            symbol: instrument.name,
            name: `${instrument.name.replace('_', '/')}`, // EUR_USD becomes EUR/USD
            type: 'forex',
            provider: 'oanda'
          }));
          
          symbols = [...symbols, ...forexSymbols];
          providers.oanda = true;
        }
      } catch (error) {
        console.error('Error fetching forex symbols from Oanda:', error);
        
        // Store error details for response
        errors.push({
          provider: 'oanda',
          market: 'forex',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    }
    
    // Get stocks and crypto symbols from Alpaca if requested
    if (market === 'all' || market === 'stocks' || market === 'crypto') {
      try {
        console.log('Fetching symbols from Alpaca');
        const alpacaClient = getAlpacaClient();
        
        // Get assets from Alpaca
        const assets = await alpacaClient.getAssets({ 
          status: 'active',
          asset_class: market === 'crypto' ? 'crypto' : undefined
        });
        
        if (assets) {
          const alpacaSymbols = assets.map((asset: any) => ({
            symbol: asset.symbol,
            name: asset.name,
            type: asset.class.toLowerCase(),
            provider: 'alpaca'
          }));
          
          symbols = [...symbols, ...alpacaSymbols];
          providers.alpaca = true;
        }
      } catch (error) {
        console.error('Error fetching symbols from Alpaca:', error);
        
        // Store error details for response
        errors.push({
          provider: 'alpaca',
          market: market === 'crypto' ? 'crypto' : 'stocks',
          message: error instanceof Error ? error.message : String(error),
          timestamp: new Date().toISOString(),
          status: 'error'
        });
      }
    }
    
    // Check if we have any symbols or if all providers failed
    if (symbols.length === 0 && errors.length > 0) {
      return res.status(503).json({
        error: 'Could not fetch symbols from any provider',
        market,
        errors,
        count: 0,
        status: 'error',
        timestamp: new Date().toISOString()
      });
    }
    
    // Return the symbols data with metadata
    return res.json({
      market,
      count: symbols.length,
      providers: Object.keys(providers),
      symbols,
      errors: errors.length > 0 ? errors : undefined,
      status: 'success',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error in market data symbols endpoint:', error);
    return res.status(500).json({ 
      error: 'Failed to fetch symbols',
      details: error instanceof Error ? error.message : String(error),
      status: 'error',
      timestamp: new Date().toISOString()
    });
  }
});

export default router;