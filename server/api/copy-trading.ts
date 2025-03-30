
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
import { Router } from 'express';
import { CopyTradeService } from '../lib/services/copy-trade-service';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const copyTradeService = new CopyTradeService();

router.post('/follow/:leaderId', authMiddleware, async (req, res) => {
  const { leaderId } = req.params;
  const followerId = req.user.id;
  
  const result = await copyTradeService.setupCopyTrading(followerId, leaderId);
  res.json(result);
});

router.get('/leaders', async (req, res) => {
  const leaderboard = await copyTradeService.getLeaderboard();
  res.json(leaderboard);
});

export default router;
