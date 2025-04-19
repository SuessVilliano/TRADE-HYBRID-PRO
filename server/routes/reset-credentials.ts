import express, { Request, Response } from 'express';
import { resetAlpacaClient } from '../services/alpaca-service';
import { resetOandaClient } from '../services/oanda-service';

const router = express.Router();

// POST /api/reset-credentials
// Force a reset of API clients to use new credentials
router.post('/', async (req: Request, res: Response) => {
  try {
    // Reset both API clients
    resetAlpacaClient();
    resetOandaClient();
    
    console.log('API clients reset successfully');
    
    return res.json({
      success: true,
      message: 'API clients reset successfully. New credentials will be used for future requests.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting API clients:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to reset API clients',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/reset-credentials/alpaca
// Reset only the Alpaca client
router.post('/alpaca', async (req: Request, res: Response) => {
  try {
    resetAlpacaClient();
    
    console.log('Alpaca API client reset successfully');
    
    return res.json({
      success: true,
      broker: 'alpaca',
      message: 'Alpaca API client reset successfully. New credentials will be used for future requests.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting Alpaca API client:', error);
    return res.status(500).json({
      success: false,
      broker: 'alpaca',
      error: 'Failed to reset Alpaca API client',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

// POST /api/reset-credentials/oanda
// Reset only the Oanda client
router.post('/oanda', async (req: Request, res: Response) => {
  try {
    resetOandaClient();
    
    console.log('Oanda API client reset successfully');
    
    return res.json({
      success: true,
      broker: 'oanda',
      message: 'Oanda API client reset successfully. New credentials will be used for future requests.',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error resetting Oanda API client:', error);
    return res.status(500).json({
      success: false,
      broker: 'oanda',
      error: 'Failed to reset Oanda API client',
      details: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString()
    });
  }
});

export default router;