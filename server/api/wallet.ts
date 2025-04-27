import express from 'express';
import { walletService } from '../services/wallet-service';

const router = express.Router();

// Get wallet data for the current user
router.get('/data', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const walletData = await walletService.getWalletData(req.session.userId);
    return res.json(walletData);
  } catch (error) {
    console.error('Error getting wallet data:', error);
    return res.status(500).json({ error: 'Failed to get wallet data' });
  }
});

// Refresh wallet data for the current user
router.post('/refresh', async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.session || !req.session.userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const walletData = await walletService.refreshWalletData(req.session.userId);
    return res.json(walletData);
  } catch (error) {
    console.error('Error refreshing wallet data:', error);
    return res.status(500).json({ error: 'Failed to refresh wallet data' });
  }
});

// Get THC token price
router.get('/thc-price', async (req, res) => {
  try {
    const priceData = await walletService.getTHCTokenPrice();
    return res.json(priceData);
  } catch (error) {
    console.error('Error getting THC token price:', error);
    return res.status(500).json({ error: 'Failed to get THC token price' });
  }
});

// Get wallet data for a specific address (for public profiles)
router.get('/address/:address', async (req, res) => {
  try {
    const { address } = req.params;
    
    // Fetch on-chain data
    const onChainData = await walletService.fetchOnChainWalletData(address);
    
    // Return only public data
    return res.json({
      address,
      solBalance: onChainData.solBalance,
      thcTokenHolding: onChainData.thcTokenHolding,
      isStaking: onChainData.isStaking,
      stakedAmount: onChainData.stakedAmount,
      timestamp: onChainData.timestamp
    });
  } catch (error) {
    console.error('Error getting wallet data for address:', error);
    return res.status(500).json({ error: 'Failed to get wallet data for address' });
  }
});

export default router;