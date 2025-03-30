import { trades } from '@shared/schema';
import { db } from '../lib/db';
import { Router } from 'express';

const router = Router();

// Function to record trades, including TradingView integration details
async function recordTrade(trade: any) {
    try {
      // Add TradingView execution details if present
      const tradeData = {
        ...trade,
        timestamp: new Date(),
        executedViaTradingView: trade.tradingViewEnabled || false,
        tradingViewOrderId: trade.tvOrderId || null
      };

      const result = await db.insert(trades).values(tradeData);
      return result;
    } catch (error) {
      console.error('Failed to record trade:', error);
      throw error;
    }
  }


// Get all trades
router.get('/trades', async (req, res) => {
  try {
    const allTrades = await db.select().from(trades);
    res.json(allTrades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Add new trade (using the recordTrade function)
router.post('/trades', async (req, res) => {
  try {
    const trade = await recordTrade({...req.body, userId: req.user?.id || 1}); // Default to user 1 if not authenticated
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

export default router;