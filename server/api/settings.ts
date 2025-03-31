import express from 'express';
import { db } from '../lib/db';
import { userApiKeys, users } from '../../shared/schema';
import { and, eq } from 'drizzle-orm';
import axios from 'axios';

const router = express.Router();

// Get user API keys
router.get('/api-keys', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  try {
    const userKeys = await db.select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, req.user.id));
      
    return res.json({
      success: true,
      keys: userKeys.map(key => ({
        id: key.id,
        type: key.type,
        name: key.name,
        // Only send masked API key data
        value: key.value ? `${key.value.substring(0, 4)}...${key.value.substring(key.value.length - 4)}` : null,
        isActive: key.isActive
      }))
    });
  } catch (error) {
    console.error('Error fetching API keys:', error);
    return res.status(500).json({ error: 'Failed to fetch API keys' });
  }
});

// Save API keys
router.post('/api-keys', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { googleApiKey } = req.body;
  
  if (!googleApiKey) {
    return res.status(400).json({ error: 'Google API key is required' });
  }
  
  try {
    // Validate Google API key by making a test request
    const testUrl = `https://sheets.googleapis.com/v4/spreadsheets/1jWQKlzry3PJ1ECJO_SbNczpRjfpvi4sMEaYu_pN6Jg8?key=${googleApiKey}`;
    
    try {
      const response = await axios.get(testUrl);
      
      if (response.status !== 200) {
        return res.status(400).json({ error: 'Invalid Google API key' });
      }
    } catch (error) {
      console.error('Error validating Google API key:', error);
      return res.status(400).json({ error: 'Failed to validate Google API key. Please check the key and try again.' });
    }
    
    // Check if the user already has a Google API key
    const existingKey = await db.select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.userId, req.user.id),
          eq(userApiKeys.type, 'google')
        )
      );
    
    // Update or insert the key
    if (existingKey.length > 0) {
      await db.update(userApiKeys)
        .set({ 
          value: googleApiKey,
          updatedAt: new Date()
        })
        .where(eq(userApiKeys.id, existingKey[0].id));
    } else {
      await db.insert(userApiKeys).values({
        userId: req.user.id,
        type: 'google',
        name: 'Google Sheets API',
        value: googleApiKey,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }
    
    // Update user's settings to mark API as connected
    await db.update(users)
      .set({ hasConnectedApis: true })
      .where(eq(users.id, req.user.id));
    
    return res.json({
      success: true,
      message: 'Google API key saved successfully'
    });
  } catch (error) {
    console.error('Error saving API key:', error);
    return res.status(500).json({ error: 'Failed to save API key' });
  }
});

// Delete API key
router.delete('/api-keys/:id', async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  
  const { id } = req.params;
  
  try {
    // Verify the key belongs to the user
    const key = await db.select()
      .from(userApiKeys)
      .where(
        and(
          eq(userApiKeys.id, parseInt(id)),
          eq(userApiKeys.userId, req.user.id)
        )
      );
    
    if (key.length === 0) {
      return res.status(404).json({ error: 'API key not found' });
    }
    
    // Delete the key
    await db.delete(userApiKeys)
      .where(eq(userApiKeys.id, parseInt(id)));
    
    // Check if user has any remaining API keys
    const remainingKeys = await db.select()
      .from(userApiKeys)
      .where(eq(userApiKeys.userId, req.user.id));
    
    if (remainingKeys.length === 0) {
      // Update user's settings to mark APIs as disconnected
      await db.update(users)
        .set({ hasConnectedApis: false })
        .where(eq(users.id, req.user.id));
    }
    
    return res.json({
      success: true,
      message: 'API key deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting API key:', error);
    return res.status(500).json({ error: 'Failed to delete API key' });
  }
});

export default router;