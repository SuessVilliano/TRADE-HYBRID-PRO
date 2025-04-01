/**
 * Identity Routes - API endpoints for user identity synchronization
 * This router handles syncing between Whop ID, wallet connections, and broker IDs
 */

import express, { Request, Response } from 'express';
import { userIdentityService } from '../lib/services/user-identity-service';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { users } from '../../shared/schema';

const router = express.Router();

// Get user identity info
router.get('/:userId', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const userIdentity = await userIdentityService.getUserIdentity(userId);
    if (!userIdentity) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    return res.json(userIdentity);
  } catch (error) {
    console.error('Error getting user identity:', error);
    return res.status(500).json({ error: 'Failed to get user identity' });
  }
});

// Link Whop ID to a user account
router.post('/:userId/whop', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { whopId } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!whopId) {
      return res.status(400).json({ error: 'Whop ID is required' });
    }
    
    const success = await userIdentityService.linkWhopId(userId, whopId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to link Whop ID' });
    }
    
    return res.json({ success: true });
  } catch (error) {
    console.error('Error linking Whop ID:', error);
    return res.status(500).json({ error: 'Failed to link Whop ID' });
  }
});

// Link wallet address to a user account
router.post('/:userId/wallet', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const { walletAddress, enableWalletAuth } = req.body;
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    const success = await userIdentityService.linkWalletAddress(
      userId, 
      walletAddress, 
      enableWalletAuth !== undefined ? enableWalletAuth : true
    );
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to link wallet address' });
    }
    
    // Check if the user owns a THC token
    const isTokenHolder = await userIdentityService.verifyTHCTokenHolder(walletAddress);
    
    // Update the user's token holder status
    await db.update(users)
      .set({ thcTokenHolder: isTokenHolder })
      .where(eq(users.id, userId));
    
    return res.json({ 
      success: true,
      isTokenHolder
    });
  } catch (error) {
    console.error('Error linking wallet address:', error);
    return res.status(500).json({ error: 'Failed to link wallet address' });
  }
});

// Sync user identity across all systems
router.post('/:userId/sync', async (req: Request, res: Response) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    
    if (isNaN(userId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }
    
    const success = await userIdentityService.syncUserIdentity(userId);
    
    if (!success) {
      return res.status(400).json({ error: 'Failed to sync user identity' });
    }
    
    // Get the updated user identity
    const updatedIdentity = await userIdentityService.getUserIdentity(userId);
    
    return res.json({
      success: true,
      identity: updatedIdentity
    });
  } catch (error) {
    console.error('Error syncing user identity:', error);
    return res.status(500).json({ error: 'Failed to sync user identity' });
  }
});

export default router;