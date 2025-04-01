import { Router, Request, Response } from 'express';
import { db } from '../lib/db';
import { users } from '../../shared/schema';
import { eq } from 'drizzle-orm';
import { requireAuth } from '../middleware/auth-middleware';

// Create express router
const router = Router();

/**
 * Get user settings
 */
router.get('/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Find user by ID
    const userResult = await db.select({
      dashboardOrder: users.dashboardOrder,
    }).from(users)
      .where(eq(users.id, userId));
    
    if (!userResult || userResult.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user settings
    res.json({
      dashboardOrder: userResult[0].dashboardOrder || null
    });
  } catch (error) {
    console.error('Error getting user settings:', error);
    res.status(500).json({ error: 'Failed to get user settings' });
  }
});

/**
 * Update user settings
 */
router.post('/:userId', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { dashboardOrder } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Update user settings
    await db.update(users)
      .set({
        dashboardOrder: dashboardOrder || undefined,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error updating user settings:', error);
    res.status(500).json({ error: 'Failed to update user settings' });
  }
});

/**
 * Update dashboard order
 */
router.post('/:userId/dashboard-order', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    const { dashboardOrder } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!dashboardOrder || !Array.isArray(dashboardOrder)) {
      return res.status(400).json({ error: 'Invalid dashboard order' });
    }
    
    // Update user dashboard order
    await db.update(users)
      .set({
        dashboardOrder,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ success: true, dashboardOrder });
  } catch (error) {
    console.error('Error updating dashboard order:', error);
    res.status(500).json({ error: 'Failed to update dashboard order' });
  }
});

/**
 * Reset user settings to defaults
 */
router.post('/:userId/reset', requireAuth, async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    // Reset user settings to null (will use defaults)
    await db.update(users)
      .set({
        dashboardOrder: null,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Error resetting user settings:', error);
    res.status(500).json({ error: 'Failed to reset user settings' });
  }
});

export default router;