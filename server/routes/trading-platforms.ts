import { Router, Request, Response } from 'express';
import { tradingPlatformService } from '../services/trading-platform-service';

const router = Router();

// Get all available trading platforms
router.get('/platforms', async (req: Request, res: Response) => {
  try {
    const platforms = await tradingPlatformService.getPlatforms();
    res.json({ platforms });
  } catch (error) {
    console.error('Error fetching platforms:', error);
    res.status(500).json({ error: 'Failed to fetch platforms' });
  }
});

// Connect to a trading platform
router.post('/connect', async (req: Request, res: Response) => {
  try {
    const { platformId, credentials } = req.body;
    const userId = 1; // Replace with actual user ID from session

    if (!platformId || !credentials) {
      return res.status(400).json({ error: 'Platform ID and credentials are required' });
    }

    const success = await tradingPlatformService.connectPlatform(userId, platformId, credentials);
    
    if (success) {
      res.json({ success: true, message: 'Platform connected successfully' });
    } else {
      res.status(400).json({ error: 'Failed to connect to platform' });
    }
  } catch (error) {
    console.error('Platform connection error:', error);
    res.status(500).json({ error: 'Connection failed' });
  }
});

// Get user's platform connections
router.get('/connections', async (req: Request, res: Response) => {
  try {
    const userId = 1; // Replace with actual user ID from session
    const connections = await tradingPlatformService.getUserConnections(userId);
    res.json({ connections });
  } catch (error) {
    console.error('Error fetching connections:', error);
    res.status(500).json({ error: 'Failed to fetch connections' });
  }
});

// Disconnect from a platform
router.post('/disconnect', async (req: Request, res: Response) => {
  try {
    const { connectionId } = req.body;
    const userId = 1; // Replace with actual user ID from session

    if (!connectionId) {
      return res.status(400).json({ error: 'Connection ID is required' });
    }

    const success = await tradingPlatformService.disconnectPlatform(userId, connectionId);
    
    if (success) {
      res.json({ success: true, message: 'Platform disconnected successfully' });
    } else {
      res.status(400).json({ error: 'Failed to disconnect platform' });
    }
  } catch (error) {
    console.error('Platform disconnect error:', error);
    res.status(500).json({ error: 'Disconnect failed' });
  }
});

// Sync platform data
router.post('/sync/:connectionId', async (req: Request, res: Response) => {
  try {
    const connectionId = parseInt(req.params.connectionId);
    await tradingPlatformService.syncAccountData(connectionId);
    res.json({ success: true, message: 'Data synced successfully' });
  } catch (error) {
    console.error('Sync error:', error);
    res.status(500).json({ error: 'Sync failed' });
  }
});

export default router;