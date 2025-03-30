
import { Router } from 'express';
import { copyTradeService } from '../lib/services/copy-trade-service';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get available copy traders
router.get('/traders', requireAuth, async (req, res) => {
  try {
    const traders = await copyTradeService.getAvailableCopyTraders();
    res.json(traders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch copy traders' });
  }
});

// Follow a trader
router.post('/follow', requireAuth, async (req, res) => {
  try {
    const { traderId, settings } = req.body;
    await copyTradeService.addFollower(req.user.id, traderId, settings);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to follow trader' });
  }
});

// Admin: Add copy trader
router.post('/admin/traders', requireAuth, async (req, res) => {
  try {
    // Check if user is admin
    if (!req.user.isAdmin) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    
    const { userId, settings } = req.body;
    await copyTradeService.addCopyTrader(userId, settings);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to add copy trader' });
  }
});

export default router;
