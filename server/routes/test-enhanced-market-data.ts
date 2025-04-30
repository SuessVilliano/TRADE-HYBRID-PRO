/**
 * Test Enhanced Market Data Routes
 * 
 * This file contains test routes for the enhanced market data service.
 */

import { Router } from 'express';
import { getEnhancedMarketDataService } from '../services/enhanced-market-data-service';
import { TimeInterval } from '../mcp/data/market-data-interface';

const router = Router();
const marketDataService = getEnhancedMarketDataService();

/**
 * Test endpoint for getting historical candles
 * 
 * @route GET /api/test-enhanced-market-data/candles
 * @param {string} symbol - The symbol to get data for
 * @param {string} interval - The time interval for candles
 * @param {number} from - The start timestamp
 */
router.get('/candles', async (req, res) => {
  try {
    const { symbol, interval, from } = req.query;
    
    if (!symbol || !interval || !from) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: symbol, interval, from'
      });
    }
    
    // Default to last 24 hours if no 'from' parameter
    const fromTimestamp = parseInt(from as string, 10) || (Date.now() - 24 * 60 * 60 * 1000);
    
    // Get candles
    const candles = await marketDataService.getHistoricalCandles(
      symbol as string,
      interval as TimeInterval,
      fromTimestamp
    );
    
    return res.json({
      success: true,
      symbol,
      interval,
      count: candles.length,
      data: candles
    });
  } catch (error) {
    console.error('Error testing candles:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while testing candles'
    });
  }
});

/**
 * Test endpoint for getting latest price
 * 
 * @route GET /api/test-enhanced-market-data/price
 * @param {string} symbol - The symbol to get data for
 */
router.get('/price', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: symbol'
      });
    }
    
    // Get latest price
    const price = await marketDataService.getLatestPrice(symbol as string);
    
    return res.json({
      success: true,
      symbol,
      data: price
    });
  } catch (error) {
    console.error('Error testing price:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while testing price'
    });
  }
});

/**
 * Test endpoint for searching symbols
 * 
 * @route GET /api/test-enhanced-market-data/search
 * @param {string} query - The search query
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: query'
      });
    }
    
    // Search symbols
    const results = await marketDataService.searchSymbols(query as string);
    
    return res.json({
      success: true,
      query,
      count: results.length,
      data: results
    });
  } catch (error) {
    console.error('Error testing symbol search:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while testing symbol search'
    });
  }
});

/**
 * Test endpoint for checking system status
 * 
 * @route GET /api/test-enhanced-market-data/status
 */
router.get('/status', (req, res) => {
  try {
    // Check for RAPID_API_KEY
    const hasRapidApiKey = !!process.env.RAPID_API_KEY;
    
    return res.json({
      success: true,
      status: 'Enhanced Market Data Service is operational',
      hasRapidApiKey,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking status:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while checking status'
    });
  }
});

export default router;