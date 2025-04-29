/**
 * Solana Token API Routes for the Trade Hybrid platform
 * 
 * This module provides API endpoints for Solana token data including THC token.
 */

import express, { Request, Response } from 'express';
import { THCTokenService } from '../mcp/services/thc-token-service';
import { SolanaBlockchainService } from '../mcp/services/solana-blockchain-service';

const router = express.Router();

// Initialize services
let thcTokenService: THCTokenService | null = null;
let solanaBlockchainService: SolanaBlockchainService | null = null;

// Initialize services asynchronously
const initializeServices = async () => {
  if (!thcTokenService) {
    thcTokenService = THCTokenService.getInstance();
    await thcTokenService.initialize();
  }
  
  if (!solanaBlockchainService) {
    solanaBlockchainService = SolanaBlockchainService.getInstance();
    await solanaBlockchainService.initialize();
  }
};

// Initialize services when this module is imported
initializeServices().catch(err => {
  console.error('Failed to initialize Solana token API services:', err);
});

/**
 * Middleware to ensure services are initialized
 */
const ensureServicesInitialized = async (req: Request, res: Response, next: Function) => {
  try {
    await initializeServices();
    next();
  } catch (error) {
    console.error('Error initializing services:', error);
    res.status(500).json({
      status: 'error',
      message: 'Solana token services are initializing. Please try again later.'
    });
  }
};

// Apply middleware to all routes
router.use(ensureServicesInitialized);

/**
 * GET /api/solana/token/thc
 * Returns THC token information
 */
router.get('/token/thc', async (req: Request, res: Response) => {
  try {
    if (!thcTokenService) {
      return res.status(503).json({
        status: 'error',
        message: 'THC token service not available'
      });
    }
    
    const tokenInfo = await thcTokenService.getTokenInfo();
    const tokenStats = await thcTokenService.getTokenStats();
    
    res.json({
      status: 'success',
      token: {
        ...tokenInfo,
        stats: tokenStats
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting THC token information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get THC token information'
    });
  }
});

/**
 * GET /api/solana/token/thc/stats
 * Returns THC token statistics
 */
router.get('/token/thc/stats', async (req: Request, res: Response) => {
  try {
    if (!thcTokenService) {
      return res.status(503).json({
        status: 'error',
        message: 'THC token service not available'
      });
    }
    
    const tokenStats = await thcTokenService.getTokenStats();
    
    res.json({
      status: 'success',
      stats: tokenStats,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting THC token statistics:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get THC token statistics'
    });
  }
});

/**
 * GET /api/solana/token/thc/staking
 * Returns THC token staking information
 */
router.get('/token/thc/staking', async (req: Request, res: Response) => {
  try {
    if (!thcTokenService) {
      return res.status(503).json({
        status: 'error',
        message: 'THC token service not available'
      });
    }
    
    const stakingInfo = await thcTokenService.getStakingInfo();
    
    res.json({
      status: 'success',
      staking: stakingInfo,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting THC staking information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get THC staking information'
    });
  }
});

/**
 * GET /api/solana/token/thc/holders
 * Returns top THC token holders
 */
router.get('/token/thc/holders', async (req: Request, res: Response) => {
  try {
    if (!thcTokenService) {
      return res.status(503).json({
        status: 'error',
        message: 'THC token service not available'
      });
    }
    
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    const holders = await thcTokenService.getTopHolders(limit);
    
    res.json({
      status: 'success',
      holders,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting THC token holders:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get THC token holders'
    });
  }
});

/**
 * GET /api/solana/validator
 * Returns Trade Hybrid validator information
 */
router.get('/validator', async (req: Request, res: Response) => {
  try {
    if (!thcTokenService) {
      return res.status(503).json({
        status: 'error',
        message: 'THC token service not available'
      });
    }
    
    const validatorInfo = await thcTokenService.getValidatorInfo();
    
    res.json({
      status: 'success',
      validator: validatorInfo,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting validator information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get validator information'
    });
  }
});

/**
 * GET /api/solana/wallet/:address
 * Returns wallet information for a Solana address
 */
router.get('/wallet/:address', async (req: Request, res: Response) => {
  try {
    if (!solanaBlockchainService) {
      return res.status(503).json({
        status: 'error',
        message: 'Solana blockchain service not available'
      });
    }
    
    const { address } = req.params;
    
    // Validate the address
    try {
      const { PublicKey } = await import('@solana/web3.js');
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Solana address'
      });
    }
    
    const walletInfo = await solanaBlockchainService.getWalletInfo(address);
    
    res.json({
      status: 'success',
      wallet: walletInfo,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting wallet information:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get wallet information'
    });
  }
});

/**
 * GET /api/solana/wallet/:address/transactions
 * Returns recent transactions for a Solana address
 */
router.get('/wallet/:address/transactions', async (req: Request, res: Response) => {
  try {
    if (!solanaBlockchainService) {
      return res.status(503).json({
        status: 'error',
        message: 'Solana blockchain service not available'
      });
    }
    
    const { address } = req.params;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
    
    // Validate the address
    try {
      const { PublicKey } = await import('@solana/web3.js');
      new PublicKey(address);
    } catch (error) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid Solana address'
      });
    }
    
    const transactions = await solanaBlockchainService.getRecentTransactions(address, limit);
    
    res.json({
      status: 'success',
      transactions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting wallet transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get wallet transactions'
    });
  }
});

/**
 * GET /api/solana/network/status
 * Returns current Solana network status
 */
router.get('/network/status', async (req: Request, res: Response) => {
  try {
    if (!solanaBlockchainService) {
      return res.status(503).json({
        status: 'error',
        message: 'Solana blockchain service not available'
      });
    }
    
    const networkStatus = await solanaBlockchainService.getNetworkStatus();
    
    res.json({
      status: 'success',
      network: networkStatus,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting network status:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get network status'
    });
  }
});

export default router;