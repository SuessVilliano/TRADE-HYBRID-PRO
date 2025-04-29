import express from 'express';
import { db } from '../db';
import { eq } from 'drizzle-orm';

// Create placeholder schema if needed
const schema = {
  journalEntries: null
};

const router = express.Router();

// Type for journal entries
interface JournalEntry {
  id?: string;
  title: string;
  content: string;
  mood?: string;
  tags?: string[];
  tradeIds?: string[];
  symbol?: string;
  timestamp?: string;
  keyLessonLearned?: string;
  attachments?: string[];
  isPrivate?: boolean;
  mentality?: string;
  currentMood?: number;
  marketState?: string;
}

// Get all journal entries
router.get('/entries', async (req, res) => {
  try {
    // Get user ID from session or use demo ID
    const userId = req.user?.id || 'demo-user';
    
    // Query journal entries from database if it exists
    try {
      // Using the schema.journalEntries if it exists
      if (schema.journalEntries) {
        const entries = await db.query.journalEntries.findMany({
          where: eq(schema.journalEntries.userId, userId),
          orderBy: [{ timestamp: 'desc' }]
        });
        return res.json(entries);
      }
    } catch (schemaError) {
      console.warn('Schema-based journal query failed:', schemaError);
      // Fall back to raw SQL if needed
    }
    
    // Fallback to raw SQL
    const entries = await db.execute(
      `SELECT * FROM journal_entries WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 100`,
      [userId]
    );
    return res.json(entries.rows || []);
    
  } catch (error) {
    console.error('Error fetching journal entries:', error);
    res.status(500).json({ error: 'Failed to fetch journal entries' });
  }
});

// Create a new journal entry
router.post('/entries', async (req, res) => {
  try {
    // Get user ID from session or use demo ID
    const userId = req.user?.id || 'demo-user';
    const entryData: JournalEntry = req.body;
    
    // Basic validation
    if (!entryData.content) {
      return res.status(400).json({ error: 'Journal entry content is required' });
    }
    
    // Add entry to database
    try {
      // Using the schema.journalEntries if it exists
      if (schema.journalEntries) {
        const result = await db.insert(schema.journalEntries).values({
          userId,
          title: entryData.title || 'Journal Entry',
          content: entryData.content,
          mood: entryData.mood || 'neutral',
          tags: entryData.tags || [],
          tradeIds: entryData.tradeIds || [],
          symbol: entryData.symbol || 'General',
          keyLessonLearned: entryData.keyLessonLearned || '',
          attachments: entryData.attachments || [],
          isPrivate: entryData.isPrivate || false,
          timestamp: new Date(entryData.timestamp || Date.now())
        }).returning();
        
        return res.status(201).json(result[0]);
      }
    } catch (schemaError) {
      console.warn('Schema-based journal insert failed:', schemaError);
      // Fall back to raw SQL
    }
    
    // Fallback to raw SQL
    const timestamp = new Date(entryData.timestamp || Date.now()).toISOString();
    const result = await db.execute(
      `INSERT INTO journal_entries 
       (user_id, title, content, timestamp, tags, symbol) 
       VALUES ($1, $2, $3, $4, $5, $6) 
       RETURNING *`,
      [
        userId,
        entryData.title || 'Journal Entry',
        entryData.content,
        timestamp,
        JSON.stringify(entryData.tags || []),
        entryData.symbol || 'General'
      ]
    );
    
    return res.status(201).json(result.rows[0]);
    
  } catch (error) {
    console.error('Error creating journal entry:', error);
    res.status(500).json({ error: 'Failed to create journal entry' });
  }
});

// Update a journal entry
router.patch('/entries/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.id || 'demo-user';
    const updates: Partial<JournalEntry> = req.body;
    
    // Verify the user is updating their own entry
    // Skip this check for demo mode
    try {
      // Using the schema if it exists
      if (schema.journalEntries) {
        const entry = await db.query.journalEntries.findFirst({
          where: eq(schema.journalEntries.id, entryId)
        });
        
        if (entry && entry.userId !== userId && userId !== 'demo-user') {
          return res.status(403).json({ error: 'Not authorized to update this entry' });
        }
        
        // Update the entry
        await db.update(schema.journalEntries)
          .set({
            title: updates.title || entry?.title,
            content: updates.content || entry?.content,
            mood: updates.mood || entry?.mood,
            tags: updates.tags || entry?.tags,
            keyLessonLearned: updates.keyLessonLearned || entry?.keyLessonLearned,
            timestamp: updates.timestamp ? new Date(updates.timestamp) : entry?.timestamp
          })
          .where(eq(schema.journalEntries.id, entryId));
        
        // Get updated entry
        const updatedEntry = await db.query.journalEntries.findFirst({
          where: eq(schema.journalEntries.id, entryId)
        });
        
        return res.json(updatedEntry);
      }
    } catch (schemaError) {
      console.warn('Schema-based journal update failed:', schemaError);
      // Fall back to raw SQL
    }
    
    // Fallback to raw SQL
    // First verify ownership
    const entryCheck = await db.execute(
      `SELECT * FROM journal_entries WHERE id = $1`,
      [entryId]
    );
    
    if (entryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const entry = entryCheck.rows[0];
    if (entry.user_id !== userId && userId !== 'demo-user') {
      return res.status(403).json({ error: 'Not authorized to update this entry' });
    }
    
    // Update the entry
    const result = await db.execute(
      `UPDATE journal_entries 
       SET title = $1, content = $2, tags = $3
       WHERE id = $4
       RETURNING *`,
      [
        updates.title || entry.title,
        updates.content || entry.content,
        JSON.stringify(updates.tags || JSON.parse(entry.tags || '[]')),
        entryId
      ]
    );
    
    return res.json(result.rows[0]);
    
  } catch (error) {
    console.error('Error updating journal entry:', error);
    res.status(500).json({ error: 'Failed to update journal entry' });
  }
});

// Delete a journal entry
router.delete('/entries/:entryId', async (req, res) => {
  try {
    const { entryId } = req.params;
    const userId = req.user?.id || 'demo-user';
    
    // Verify the user is deleting their own entry
    // Skip this check for demo mode
    try {
      // Using the schema if it exists
      if (schema.journalEntries) {
        const entry = await db.query.journalEntries.findFirst({
          where: eq(schema.journalEntries.id, entryId)
        });
        
        if (entry && entry.userId !== userId && userId !== 'demo-user') {
          return res.status(403).json({ error: 'Not authorized to delete this entry' });
        }
        
        // Delete the entry
        await db.delete(schema.journalEntries)
          .where(eq(schema.journalEntries.id, entryId));
        
        return res.json({ success: true });
      }
    } catch (schemaError) {
      console.warn('Schema-based journal delete failed:', schemaError);
      // Fall back to raw SQL
    }
    
    // Fallback to raw SQL
    // First verify ownership
    const entryCheck = await db.execute(
      `SELECT * FROM journal_entries WHERE id = $1`,
      [entryId]
    );
    
    if (entryCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Journal entry not found' });
    }
    
    const entry = entryCheck.rows[0];
    if (entry.user_id !== userId && userId !== 'demo-user') {
      return res.status(403).json({ error: 'Not authorized to delete this entry' });
    }
    
    // Delete the entry
    await db.execute(
      `DELETE FROM journal_entries WHERE id = $1`,
      [entryId]
    );
    
    return res.json({ success: true });
    
  } catch (error) {
    console.error('Error deleting journal entry:', error);
    res.status(500).json({ error: 'Failed to delete journal entry' });
  }
});

export default router;