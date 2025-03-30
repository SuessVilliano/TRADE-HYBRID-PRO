import { trades, journalEntries } from '@shared/schema';
import { db } from '../lib/db';
import { Router } from 'express';
import { Request, Response } from 'express';

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

// Functions required by routes.ts
export async function saveJournalEntry(req: Request, res: Response) {
  try {
    const entry = {
      ...req.body,
      userId: req.user?.id || 1, // Default to user 1 if not authenticated
      timestamp: new Date()
    };
    
    const result = await db.insert(journalEntries).values(entry);
    res.json(result);
  } catch (error) {
    console.error('Failed to save journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
}

export async function getJournalEntries(req: Request, res: Response) {
  try {
    const userId = req.user?.id || 1; // Default to user 1 if not authenticated
    const entries = await db.select().from(journalEntries).where({ userId });
    res.json(entries);
  } catch (error) {
    console.error('Failed to fetch journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
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