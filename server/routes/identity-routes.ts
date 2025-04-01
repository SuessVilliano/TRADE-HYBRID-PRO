import { Router } from 'express';
import { linkWalletToUser } from '../lib/auth-service';

// Create express router
const router = Router();

/**
 * Link a wallet address to a user account
 */
router.post('/link-wallet', async (req, res) => {
  try {
    const { userId, walletAddress } = req.body;
    
    if (!userId || !walletAddress) {
      return res.status(400).json({ error: 'User ID and wallet address required' });
    }
    
    const result = await linkWalletToUser(userId, walletAddress);
    
    if (!result.success) {
      return res.status(400).json({ error: result.message });
    }
    
    res.json({
      success: true,
      isTokenHolder: result.isTokenHolder
    });
  } catch (error) {
    console.error('Wallet linking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * Check if a user is a THC token holder
 */
router.get('/token-status/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    
    // In a real implementation, this would query the database
    // and potentially validate against the blockchain
    
    // Mock implementation for demonstration
    // In production, use proper database access
    const isTokenHolder = Math.random() > 0.3; // 70% chance of being a token holder
    
    res.json({
      success: true,
      isTokenHolder,
      tokenCount: isTokenHolder ? Math.floor(Math.random() * 10) + 1 : 0
    });
  } catch (error) {
    console.error('Token status check error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;