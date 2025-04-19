import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();

// API endpoint to get historical market data
router.get('/history', async (req: Request, res: Response) => {
  try {
    const { symbol, interval = '1h', limit = 100 } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }
    
    // Determine if this is a Forex symbol (common forex currencies)
    const isForex = /^[A-Z]{3}_[A-Z]{3}$/.test(symbol as string) || 
                   /^[A-Z]{6}$/.test(symbol as string) && 
                   ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
                     currency => (symbol as string).includes(currency)
                   );
    
    if (isForex) {
      // This is a forex symbol, use Oanda
      try {
        // Format symbol for Oanda if needed (e.g., 'EURUSD' -> 'EUR_USD')
        const formattedSymbol = (symbol as string).includes('_') 
          ? symbol 
          : `${(symbol as string).substring(0, 3)}_${(symbol as string).substring(3, 6)}`;
        
        // Convert interval to Oanda granularity format
        let granularity;
        switch (interval) {
          case '1m': granularity = 'M1'; break;
          case '5m': granularity = 'M5'; break;
          case '15m': granularity = 'M15'; break;
          case '30m': granularity = 'M30'; break;
          case '1h': granularity = 'H1'; break;
          case '4h': granularity = 'H4'; break;
          case '1d': granularity = 'D'; break;
          case '1w': granularity = 'W'; break;
          default: granularity = 'H1';
        }
        
        // Make the request to our internal Oanda endpoint
        const oandaResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/oanda/candles`, {
          params: {
            instrument: formattedSymbol,
            granularity,
            count: limit
          }
        });
        
        // Transform to standard format
        const bars = oandaResponse.data.candles.map((candle: any) => ({
          t: new Date(candle.time).toISOString(),
          o: parseFloat(candle.o),
          h: parseFloat(candle.h),
          l: parseFloat(candle.l),
          c: parseFloat(candle.c),
          v: parseFloat(candle.v)
        }));
        
        return res.json({ symbol: formattedSymbol, interval, bars });
      } catch (error: any) {
        console.error('Error fetching Oanda historical data:', error.response?.data || error.message);
        return res.status(500).json({ 
          error: 'Failed to fetch forex historical data', 
          details: error.response?.data || error.message 
        });
      }
    } else {
      // This is a stock or crypto symbol, use Alpaca
      try {
        // Check if Alpaca API keys are available
        const alpacaApiKey = process.env.ALPACA_API_KEY;
        const alpacaApiSecret = process.env.ALPACA_API_SECRET;
        
        if (!alpacaApiKey || !alpacaApiSecret) {
          return res.status(500).json({ error: 'Alpaca API credentials not configured' });
        }
        
        // Convert interval to Alpaca timeframe format
        let timeframe;
        switch (interval) {
          case '1m': timeframe = '1Min'; break;
          case '5m': timeframe = '5Min'; break;
          case '15m': timeframe = '15Min'; break;
          case '30m': timeframe = '30Min'; break;
          case '1h': timeframe = '1Hour'; break;
          case '1d': timeframe = '1Day'; break;
          default: timeframe = '1Hour';
        }
        
        // The Alpaca API requires the stock ticker without exchange prefix
        const ticker = (symbol as string).includes(':') 
          ? (symbol as string).split(':')[1] 
          : symbol;
        
        // Make request to Alpaca API
        const alpacaResponse = await axios.get('https://data.alpaca.markets/v2/stocks/' + ticker + '/bars', {
          params: {
            timeframe,
            limit
          },
          headers: {
            'APCA-API-KEY-ID': alpacaApiKey,
            'APCA-API-SECRET-KEY': alpacaApiSecret
          }
        });
        
        return res.json({ 
          symbol: ticker, 
          interval, 
          bars: alpacaResponse.data.bars 
        });
      } catch (error: any) {
        console.error('Error fetching Alpaca historical data:', error.response?.data || error.message);
        return res.status(500).json({ 
          error: 'Failed to fetch stock historical data',
          details: error.response?.data || error.message 
        });
      }
    }
  } catch (error: any) {
    console.error('Error in market data history endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// API endpoint to get real-time market data quotes
router.get('/quote', async (req: Request, res: Response) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }
    
    // Determine if this is a Forex symbol
    const isForex = /^[A-Z]{3}_[A-Z]{3}$/.test(symbol as string) || 
                   /^[A-Z]{6}$/.test(symbol as string) && 
                   ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
                     currency => (symbol as string).includes(currency)
                   );
    
    if (isForex) {
      // Use Oanda for forex quotes
      try {
        // Format symbol for Oanda if needed
        const formattedSymbol = (symbol as string).includes('_') 
          ? symbol 
          : `${(symbol as string).substring(0, 3)}_${(symbol as string).substring(3, 6)}`;
        
        // Make the request to our internal Oanda endpoint
        const oandaResponse = await axios.get(`${req.protocol}://${req.get('host')}/api/oanda/pricing`, {
          params: {
            instrument: formattedSymbol
          }
        });
        
        // Extract bid and ask prices
        const bidPrice = parseFloat(oandaResponse.data.bids[0].price);
        const askPrice = parseFloat(oandaResponse.data.asks[0].price);
        
        // Calculate mid price
        const price = (bidPrice + askPrice) / 2;
        
        return res.json({
          symbol: formattedSymbol,
          price,
          bid: bidPrice,
          ask: askPrice,
          time: oandaResponse.data.time
        });
      } catch (error: any) {
        console.error('Error fetching Oanda quote:', error.response?.data || error.message);
        return res.status(500).json({ 
          error: 'Failed to fetch forex quote', 
          details: error.response?.data || error.message 
        });
      }
    } else {
      // Use Alpaca for stock/crypto quotes
      try {
        // Check if Alpaca API keys are available
        const alpacaApiKey = process.env.ALPACA_API_KEY;
        const alpacaApiSecret = process.env.ALPACA_API_SECRET;
        
        if (!alpacaApiKey || !alpacaApiSecret) {
          return res.status(500).json({ error: 'Alpaca API credentials not configured' });
        }
        
        // The Alpaca API requires the stock ticker without exchange prefix
        const ticker = (symbol as string).includes(':') 
          ? (symbol as string).split(':')[1] 
          : symbol;
        
        // Make request to Alpaca API
        const alpacaResponse = await axios.get('https://data.alpaca.markets/v2/stocks/' + ticker + '/quotes/latest', {
          headers: {
            'APCA-API-KEY-ID': alpacaApiKey,
            'APCA-API-SECRET-KEY': alpacaApiSecret
          }
        });
        
        // Extract bid and ask prices
        const bidPrice = parseFloat(alpacaResponse.data.quote.bp);
        const askPrice = parseFloat(alpacaResponse.data.quote.ap);
        
        // Calculate mid price
        const price = (bidPrice + askPrice) / 2;
        
        return res.json({
          symbol: ticker,
          price,
          bid: bidPrice,
          ask: askPrice,
          time: alpacaResponse.data.quote.t
        });
      } catch (error: any) {
        console.error('Error fetching Alpaca quote:', error.response?.data || error.message);
        return res.status(500).json({ 
          error: 'Failed to fetch stock quote',
          details: error.response?.data || error.message 
        });
      }
    }
  } catch (error: any) {
    console.error('Error in market data quote endpoint:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available symbols
router.get('/symbols', async (req: Request, res: Response) => {
  try {
    // Get common forex symbols from Oanda
    const forexSymbols = [
      { id: 'EUR_USD', name: 'Euro / US Dollar', type: 'forex' },
      { id: 'USD_JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
      { id: 'GBP_USD', name: 'British Pound / US Dollar', type: 'forex' },
      { id: 'USD_CHF', name: 'US Dollar / Swiss Franc', type: 'forex' },
      { id: 'AUD_USD', name: 'Australian Dollar / US Dollar', type: 'forex' },
      { id: 'USD_CAD', name: 'US Dollar / Canadian Dollar', type: 'forex' },
      { id: 'NZD_USD', name: 'New Zealand Dollar / US Dollar', type: 'forex' }
    ];
    
    // Get common stock symbols from Alpaca
    const stockSymbols = [
      { id: 'AAPL', name: 'Apple Inc.', type: 'stock' },
      { id: 'MSFT', name: 'Microsoft Corporation', type: 'stock' },
      { id: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' },
      { id: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' },
      { id: 'META', name: 'Meta Platforms Inc.', type: 'stock' },
      { id: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
      { id: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' }
    ];
    
    // Get common crypto symbols
    const cryptoSymbols = [
      { id: 'BTCUSD', name: 'Bitcoin / US Dollar', type: 'crypto' },
      { id: 'ETHUSD', name: 'Ethereum / US Dollar', type: 'crypto' },
      { id: 'SOLUSD', name: 'Solana / US Dollar', type: 'crypto' },
      { id: 'LTCUSD', name: 'Litecoin / US Dollar', type: 'crypto' },
      { id: 'ADAUSD', name: 'Cardano / US Dollar', type: 'crypto' },
      { id: 'DOGEUSD', name: 'Dogecoin / US Dollar', type: 'crypto' },
      { id: 'DOTUSD', name: 'Polkadot / US Dollar', type: 'crypto' }
    ];
    
    // Combine all symbols
    const allSymbols = [...forexSymbols, ...stockSymbols, ...cryptoSymbols];
    
    return res.json({
      forex: forexSymbols,
      stocks: stockSymbols,
      crypto: cryptoSymbols,
      all: allSymbols
    });
  } catch (error: any) {
    console.error('Error fetching available symbols:', error);
    return res.status(500).json({ error: 'Failed to fetch available symbols' });
  }
});

export default router;