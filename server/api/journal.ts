
import { trades } from '@shared/schema';
import { db } from '../lib/db';
import { Router } from 'express';

const router = Router();

// Get all trades
router.get('/trades', async (req, res) => {
  try {
    const allTrades = await db.select().from(trades);
    res.json(allTrades);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch trades' });
  }
});

// Add new trade
router.post('/trades', async (req, res) => {
  try {
    const trade = await db.insert(trades).values({
      ...req.body,
      userId: req.user?.id || 1, // Default to user 1 if not authenticated
      createdAt: new Date(),
    });
    res.json(trade);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save trade' });
  }
});

export default router;
