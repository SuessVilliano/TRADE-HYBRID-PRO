import { Router, Request, Response } from 'express';
import axios from 'axios';
import { authMiddleware } from '../middleware/auth-middleware';

const router = Router();

// Oanda API URLs
const OANDA_PRACTICE_URL = 'https://api-fxpractice.oanda.com';
const OANDA_LIVE_URL = 'https://api-fxtrade.oanda.com';
const OANDA_STREAM_PRACTICE_URL = 'https://stream-fxpractice.oanda.com';
const OANDA_STREAM_LIVE_URL = 'https://stream-fxtrade.oanda.com';

// Create an Oanda API client
const createOandaClient = (apiToken: string, isPractice: boolean = true) => {
  const baseURL = isPractice ? OANDA_PRACTICE_URL : OANDA_LIVE_URL;
  
  return axios.create({
    baseURL,
    headers: {
      'Authorization': `Bearer ${apiToken}`,
      'Content-Type': 'application/json',
      'Accept-Datetime-Format': 'RFC3339'
    }
  });
};

// Get candle data for a specific instrument
router.get('/candles', async (req: Request, res: Response) => {
  try {
    const { instrument, granularity = 'H1', count = 100 } = req.query;
    
    if (!instrument) {
      return res.status(400).json({ error: 'Instrument parameter is required' });
    }
    
    // Format instrument for Oanda if needed (e.g., 'EURUSD' -> 'EUR_USD')
    const formattedInstrument = (instrument as string).includes('_') 
      ? instrument 
      : `${(instrument as string).substring(0, 3)}_${(instrument as string).substring(3, 6)}`;
    
    // Get API token from environment variables
    const apiToken = process.env.OANDA_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'OANDA API token not configured' });
    }
    
    // Get account ID (this would typically be stored with the user's profile)
    const accountId = process.env.OANDA_ACCOUNT_ID || '';
    if (!accountId) {
      // Try to get the account ID from the API
      const client = createOandaClient(apiToken);
      const accountsResponse = await client.get('/v3/accounts');
      
      if (!accountsResponse.data.accounts || accountsResponse.data.accounts.length === 0) {
        return res.status(500).json({ error: 'No OANDA accounts found' });
      }
      
      // Use the first account
      const firstAccountId = accountsResponse.data.accounts[0].id;
      console.log(`Using Oanda account ID: ${firstAccountId}`);
      
      // Make the actual candles request
      const candlesResponse = await client.get(`/v3/instruments/${formattedInstrument}/candles`, {
        params: {
          granularity,
          count
        }
      });
      
      // Transform the Oanda candle format to our standard format
      const candles = candlesResponse.data.candles.map((candle: any) => ({
        time: candle.time,
        o: candle.mid.o,
        h: candle.mid.h,
        l: candle.mid.l,
        c: candle.mid.c,
        v: candle.volume,
        complete: candle.complete
      }));
      
      return res.json({ 
        instrument: formattedInstrument,
        granularity,
        candles 
      });
    } else {
      // Use provided account ID
      const client = createOandaClient(apiToken);
      const candlesResponse = await client.get(`/v3/instruments/${formattedInstrument}/candles`, {
        params: {
          granularity,
          count
        }
      });
      
      // Transform the Oanda candle format to our standard format
      const candles = candlesResponse.data.candles.map((candle: any) => ({
        time: candle.time,
        o: candle.mid.o,
        h: candle.mid.h,
        l: candle.mid.l,
        c: candle.mid.c,
        v: candle.volume,
        complete: candle.complete
      }));
      
      return res.json({ 
        instrument: formattedInstrument,
        granularity,
        candles 
      });
    }
  } catch (error: any) {
    console.error('Error fetching Oanda candles:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.errorMessage || error.message || 'Failed to fetch candles' 
    });
  }
});

// Get current pricing for a specific instrument
router.get('/pricing', async (req: Request, res: Response) => {
  try {
    const { instrument } = req.query;
    
    if (!instrument) {
      return res.status(400).json({ error: 'Instrument parameter is required' });
    }
    
    // Format instrument for Oanda if needed (e.g., 'EURUSD' -> 'EUR_USD')
    const formattedInstrument = (instrument as string).includes('_') 
      ? instrument 
      : `${(instrument as string).substring(0, 3)}_${(instrument as string).substring(3, 6)}`;
    
    // Get API token from environment variables
    const apiToken = process.env.OANDA_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'OANDA API token not configured' });
    }
    
    // Get account ID
    const accountId = process.env.OANDA_ACCOUNT_ID || '';
    if (!accountId) {
      // Try to get the account ID from the API
      const client = createOandaClient(apiToken);
      const accountsResponse = await client.get('/v3/accounts');
      
      if (!accountsResponse.data.accounts || accountsResponse.data.accounts.length === 0) {
        return res.status(500).json({ error: 'No OANDA accounts found' });
      }
      
      // Use the first account
      const firstAccountId = accountsResponse.data.accounts[0].id;
      console.log(`Using Oanda account ID: ${firstAccountId}`);
      
      // Make the pricing request
      const pricingResponse = await client.get(`/v3/accounts/${firstAccountId}/pricing`, {
        params: {
          instruments: formattedInstrument
        }
      });
      
      if (!pricingResponse.data.prices || pricingResponse.data.prices.length === 0) {
        return res.status(404).json({ error: 'No pricing data found for this instrument' });
      }
      
      return res.json(pricingResponse.data.prices[0]);
    } else {
      // Use provided account ID
      const client = createOandaClient(apiToken);
      const pricingResponse = await client.get(`/v3/accounts/${accountId}/pricing`, {
        params: {
          instruments: formattedInstrument
        }
      });
      
      if (!pricingResponse.data.prices || pricingResponse.data.prices.length === 0) {
        return res.status(404).json({ error: 'No pricing data found for this instrument' });
      }
      
      return res.json(pricingResponse.data.prices[0]);
    }
  } catch (error: any) {
    console.error('Error fetching Oanda pricing:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.errorMessage || error.message || 'Failed to fetch pricing data' 
    });
  }
});

// Get available instruments
router.get('/instruments', async (req: Request, res: Response) => {
  try {
    // Get API token from environment variables
    const apiToken = process.env.OANDA_API_TOKEN;
    if (!apiToken) {
      return res.status(500).json({ error: 'OANDA API token not configured' });
    }
    
    const client = createOandaClient(apiToken);
    
    // Unfortunately, OANDA doesn't provide a simple endpoint to list all instruments
    // So we'll return a curated list of common forex pairs
    const forexPairs = [
      'EUR_USD', 'USD_JPY', 'GBP_USD', 'USD_CHF', 'AUD_USD', 'USD_CAD',
      'NZD_USD', 'EUR_GBP', 'EUR_JPY', 'GBP_JPY', 'AUD_JPY', 'EUR_AUD'
    ];
    
    return res.json({ instruments: forexPairs });
  } catch (error: any) {
    console.error('Error fetching Oanda instruments:', error.response?.data || error.message);
    return res.status(error.response?.status || 500).json({ 
      error: error.response?.data?.errorMessage || error.message || 'Failed to fetch instruments' 
    });
  }
});

export default router;