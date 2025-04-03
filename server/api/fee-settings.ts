import express from 'express';
import { db } from '../db';
import { feeSettings } from '../../shared/schema';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Get active fee settings
router.get('/', async (req, res) => {
  try {
    const settings = await db
      .select()
      .from(feeSettings)
      .where(eq(feeSettings.isActive, true))
      .limit(1);
    
    if (settings.length === 0) {
      return res.status(404).json({ error: 'No active fee settings found' });
    }
    
    res.json(settings[0]);
  } catch (error) {
    console.error('Error fetching fee settings:', error);
    res.status(500).json({ error: 'Failed to fetch fee settings' });
  }
});

// Get fee settings by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const setting = await db
      .select()
      .from(feeSettings)
      .where(eq(feeSettings.id, parseInt(id)))
      .limit(1);
    
    if (setting.length === 0) {
      return res.status(404).json({ error: 'Fee setting not found' });
    }
    
    res.json(setting[0]);
  } catch (error) {
    console.error(`Error fetching fee settings with ID ${id}:`, error);
    res.status(500).json({ error: 'Failed to fetch fee settings' });
  }
});

// Create new fee settings
router.post('/', async (req, res) => {
  try {
    // Deactivate current active fee settings
    await db
      .update(feeSettings)
      .set({ isActive: false })
      .where(eq(feeSettings.isActive, true));
    
    // Create new fee settings
    const [newSettings] = await db
      .insert(feeSettings)
      .values({
        name: req.body.name || 'Default Fee Structure',
        defaultPerformanceFeePercent: req.body.defaultPerformanceFeePercent,
        defaultSetupFee: req.body.defaultSetupFee,
        defaultMonthlyFee: req.body.defaultMonthlyFee,
        defaultBrokerProcessingFeePercent: req.body.defaultBrokerProcessingFeePercent,
        defaultBrokerProcessingFeeFlat: req.body.defaultBrokerProcessingFeeFlat,
        isActive: true,
        effectiveDate: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    res.status(201).json(newSettings);
  } catch (error) {
    console.error('Error creating fee settings:', error);
    res.status(400).json({ error: 'Failed to create fee settings' });
  }
});

// Update fee settings
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const [updatedSettings] = await db
      .update(feeSettings)
      .set({
        ...req.body,
        updatedAt: new Date()
      })
      .where(eq(feeSettings.id, parseInt(id)))
      .returning();
    
    if (!updatedSettings) {
      return res.status(404).json({ error: 'Fee settings not found' });
    }
    
    res.json(updatedSettings);
  } catch (error) {
    console.error(`Error updating fee settings with ID ${id}:`, error);
    res.status(400).json({ error: 'Failed to update fee settings' });
  }
});

export default router;