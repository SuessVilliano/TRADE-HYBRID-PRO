/**
 * Market Data API Routes
 * 
 * This file defines the Express routes for market data operations.
 * It uses the enhanced market data service with multiple providers.
 */

import { Router } from 'express';
import { getEnhancedMarketDataService } from '../services/enhanced-market-data-service';
import { TimeInterval } from '../mcp/data/market-data-interface';

const router = Router();
const marketDataService = getEnhancedMarketDataService();

/**
 * Get market data candles
 * 
 * @route GET /api/market-data/candles
 * @param {string} symbol - The symbol to get data for
 * @param {string} interval - The time interval for candles
 * @param {number} from - The start timestamp
 * @param {number} to - The end timestamp (optional)
 */
router.get('/candles', async (req, res) => {
  try {
    const { symbol, interval, from, to } = req.query;
    
    // Validate required parameters
    if (!symbol || !interval || !from) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameters: symbol, interval, from'
      });
    }
    
    // Get market data candles
    const candles = await marketDataService.getHistoricalCandles(
      symbol as string,
      interval as TimeInterval,
      parseInt(from as string, 10),
      to ? parseInt(to as string, 10) : undefined
    );
    
    return res.json({
      success: true,
      data: candles
    });
  } catch (error) {
    console.error('Error fetching market data candles:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while fetching market data candles'
    });
  }
});

/**
 * Get latest price for a symbol
 * 
 * @route GET /api/market-data/price
 * @param {string} symbol - The symbol to get data for
 */
router.get('/price', async (req, res) => {
  try {
    const { symbol } = req.query;
    
    // Validate required parameters
    if (!symbol) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: symbol'
      });
    }
    
    // Get latest price
    const price = await marketDataService.getLatestPrice(
      symbol as string
    );
    
    return res.json({
      success: true,
      data: price
    });
  } catch (error) {
    console.error('Error fetching latest price:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while fetching the latest price'
    });
  }
});

/**
 * Search for symbols
 * 
 * @route GET /api/market-data/search
 * @param {string} query - The search query
 */
router.get('/search', async (req, res) => {
  try {
    const { query } = req.query;
    
    // Validate required parameters
    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Missing required parameter: query'
      });
    }
    
    // Search for symbols
    const results = await marketDataService.searchSymbols(
      query as string
    );
    
    return res.json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error searching symbols:', error);
    return res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'An error occurred while searching symbols'
    });
  }
});

export default router;