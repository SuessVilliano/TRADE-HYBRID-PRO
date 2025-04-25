/**
 * Configuration API routes
 * Securely provides environment variables to the client
 */
import express from 'express';

const router = express.Router();

/**
 * GET /api/config/rpc-url
 * Returns the Solana RPC URL for client-side Solana wallet connections
 */
router.get('/rpc-url', (req, res) => {
  try {
    // Get RPC URL from environment variables
    const rpcUrl = process.env.SOLANA_RPC_URL;
    
    if (!rpcUrl) {
      console.warn('SOLANA_RPC_URL environment variable not found');
      return res.status(404).json({ 
        error: 'Solana RPC URL not configured',
        rpcUrl: null
      });
    }
    
    console.log('Providing Solana RPC URL to client');
    
    // Return the RPC URL to the client
    return res.json({ rpcUrl });
  } catch (error) {
    console.error('Error getting Solana RPC URL:', error);
    return res.status(500).json({ 
      error: 'Failed to get Solana RPC URL',
      rpcUrl: null
    });
  }
});

export default router;