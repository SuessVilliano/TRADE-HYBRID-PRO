
import { db } from '../storage';
import type { Request, Response } from 'express';
import { journalEntries, tradePerformance } from '../../shared/schema';

export async function saveJournalEntry(req: Request, res: Response) {
  try {
    const entry = req.body;
    const result = await db.insert(journalEntries).values({
      userId: req.user.id,
      content: entry.content,
      hybridScore: entry.hybridScore,
      sentiment: entry.sentiment,
      aiAnalysis: entry.aiAnalysis
    }).returning();

    res.json(result[0]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save journal entry' });
  }
}

export async function getJournalEntries(req: Request, res: Response) {
  try {
    const entries = await db.select().from(journalEntries)
      .where(eq(journalEntries.userId, req.user.id))
      .orderBy(desc(journalEntries.createdAt));
    
    res.json(entries);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
}
