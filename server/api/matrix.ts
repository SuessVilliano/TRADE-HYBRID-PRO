/**
 * API Routes for Matrix Contract Operations
 * 
 * This file provides the REST API endpoints for matrix contract operations,
 * allowing the frontend to interact with the matrix contract service.
 */

import express, { Request, Response } from 'express';
import { Connection } from '@solana/web3.js';
import { getMatrixContractService } from '../mcp/services/matrix-contract-service';

// Create a router for the matrix API
const router = express.Router();

// Create a Solana connection
const connection = new Connection(process.env.SOLANA_RPC_URL || 'https://solana-mainnet.g.alchemy.com/v2/7kqeP7-xry4i7_BfEk3UrG9Laj4iS5nu');

// Get the matrix contract service
const matrixService = getMatrixContractService(connection);

/**
 * Get a user's matrix data
 * GET /api/matrix/user/:walletAddress
 */
router.get('/user/:walletAddress', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.params;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Get the user's matrix data
    const matrix = await matrixService.getUserMatrix(walletAddress);
    
    res.json(matrix);
  } catch (error) {
    console.error('Error getting matrix data:', error);
    res.status(500).json({ error: 'Failed to get matrix data' });
  }
});

/**
 * Purchase a new slot in the matrix
 * POST /api/matrix/purchase-slot
 */
router.post('/purchase-slot', async (req: Request, res: Response) => {
  try {
    const { walletAddress, slotNumber, currency } = req.body;
    
    if (!walletAddress || !slotNumber || !currency) {
      return res.status(400).json({ error: 'Wallet address, slot number, and currency are required' });
    }
    
    // Purchase the slot
    const result = await matrixService.purchaseSlot(walletAddress, slotNumber, currency);
    
    if (result.success) {
      res.json({ success: true, signature: result.signature });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error purchasing slot:', error);
    res.status(500).json({ error: 'Failed to purchase slot' });
  }
});

/**
 * Recycle a slot in the matrix
 * POST /api/matrix/recycle-slot
 */
router.post('/recycle-slot', async (req: Request, res: Response) => {
  try {
    const { walletAddress, slotNumber } = req.body;
    
    if (!walletAddress || !slotNumber) {
      return res.status(400).json({ error: 'Wallet address and slot number are required' });
    }
    
    // Recycle the slot
    const result = await matrixService.recycleSlot(walletAddress, slotNumber);
    
    if (result.success) {
      res.json({ success: true, signature: result.signature });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error recycling slot:', error);
    res.status(500).json({ error: 'Failed to recycle slot' });
  }
});

/**
 * Claim commissions from the matrix
 * POST /api/matrix/claim-commissions
 */
router.post('/claim-commissions', async (req: Request, res: Response) => {
  try {
    const { walletAddress } = req.body;
    
    if (!walletAddress) {
      return res.status(400).json({ error: 'Wallet address is required' });
    }
    
    // Claim commissions
    const result = await matrixService.claimCommissions(walletAddress);
    
    if (result.success) {
      res.json({ 
        success: true, 
        signature: result.signature,
        amount: result.amount
      });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error claiming commissions:', error);
    res.status(500).json({ error: 'Failed to claim commissions' });
  }
});

/**
 * Set a wallet's referrer
 * POST /api/matrix/set-referrer
 */
router.post('/set-referrer', async (req: Request, res: Response) => {
  try {
    const { walletAddress, referrerAddress } = req.body;
    
    if (!walletAddress || !referrerAddress) {
      return res.status(400).json({ error: 'Wallet address and referrer address are required' });
    }
    
    // Set the referrer
    const result = await matrixService.setReferrer(walletAddress, referrerAddress);
    
    if (result.success) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: result.error });
    }
  } catch (error) {
    console.error('Error setting referrer:', error);
    res.status(500).json({ error: 'Failed to set referrer' });
  }
});

export default router;