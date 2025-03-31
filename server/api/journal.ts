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

// Save journal entry
async function saveJournalEntry(req: Request, res: Response) {
  try {
    const entry = {
      ...req.body,
      userId: req.body.userId || 1, // Default to user 1 if not provided
      timestamp: new Date()
    };
    
    const result = await db.insert(journalEntries).values(entry);
    res.json(result);
  } catch (error) {
    console.error('Failed to save journal entry:', error);
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
}

// Get journal entries
async function getJournalEntries(req: Request, res: Response) {
  try {
    const userId = req.query.userId ? Number(req.query.userId) : 1; // Default to user 1 if not provided
    console.log('Fetching journal entries for userId:', userId);
    
    const entries = await db.select().from(journalEntries).where({ userId });
    console.log('Found entries:', entries.length);
    
    res.json(entries);
  } catch (error) {
    console.error('Failed to fetch journal entries:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    res.status(500).json({ error: `Failed to fetch journal entries: ${errorMessage}` });
  }
}

// Register routes on the router
router.get('/entries', getJournalEntries);
router.post('/entries', saveJournalEntry);

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
    const trade = await recordTrade({...req.body, userId: req.body.userId || 1}); // Default to user 1 if not provided
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

export default router;
// For backwards compatibility with routes.ts, we'll keep these exports
export { saveJournalEntry, getJournalEntries };