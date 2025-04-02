import { Router, Request, Response } from 'express';
import { authenticateUser } from '../middleware/auth';

// Import broker services
import * as alpacaService from '../services/alpaca-service';
import * as oandaService from '../services/oanda-service';
import * as ninjaTraderService from '../services/ninjatrader-service';

const router = Router();

// ------------- Alpaca Routes -------------

// Test Alpaca connection
router.post('/alpaca/test', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { apiKey, apiSecret } = req.body;
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: 'API key and secret are required' });
    }
    
    const isConnected = await alpacaService.testAlpacaConnection(apiKey, apiSecret);
    
    return res.json({ success: isConnected });
  } catch (error: any) {
    console.error('Error testing Alpaca connection:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Save Alpaca credentials
router.post('/alpaca/credentials', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { apiKey, apiSecret, label, isDefault } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!apiKey || !apiSecret) {
      return res.status(400).json({ error: 'API key and secret are required' });
    }
    
    // First test the connection
    const isConnected = await alpacaService.testAlpacaConnection(apiKey, apiSecret);
    
    if (!isConnected) {
      return res.status(400).json({ error: 'Failed to connect to Alpaca with these credentials' });
    }
    
    // Save the credentials
    const credentials = alpacaService.saveAlpacaCredentials(
      userId,
      apiKey,
      apiSecret,
      label || 'Default',
      isDefault !== false
    );
    
    // Don't return the actual credentials in the response
    return res.json({
      message: 'Alpaca credentials saved successfully',
      label: credentials.label,
      isDefault: credentials.isDefault,
      createdAt: credentials.createdAt
    });
  } catch (error: any) {
    console.error('Error saving Alpaca credentials:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get Alpaca account info
router.get('/alpaca/account', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const accountInfo = await alpacaService.getAccountInfo(userId);
    
    return res.json(accountInfo);
  } catch (error: any) {
    console.error('Error getting Alpaca account info:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get Alpaca positions
router.get('/alpaca/positions', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const positions = await alpacaService.getPositions(userId);
    
    return res.json(positions);
  } catch (error: any) {
    console.error('Error getting Alpaca positions:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Execute Alpaca trade
router.post('/alpaca/trade', authenticateUser, async (req: Request, res: Response) => {
  try {
    const {
      symbol,
      side,
      quantity,
      orderType,
      limitPrice,
      stopPrice,
      timeInForce,
      clientOrderId,
      takeProfitPrice,
      stopLossPrice,
      extendedHours
    } = req.body;
    
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Symbol, side, and quantity are required' });
    }
    
    const order = await alpacaService.executeTrade(
      symbol,
      side,
      quantity,
      orderType,
      limitPrice,
      stopPrice,
      timeInForce,
      clientOrderId,
      takeProfitPrice,
      stopLossPrice,
      extendedHours,
      userId
    );
    
    return res.json(order);
  } catch (error: any) {
    console.error('Error executing Alpaca trade:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// ------------- Oanda Routes -------------

// Test Oanda connection
router.post('/oanda/test', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { apiToken, accountId, isPractice } = req.body;
    
    if (!apiToken || !accountId) {
      return res.status(400).json({ error: 'API token and account ID are required' });
    }
    
    const isConnected = await oandaService.testOandaConnection(
      apiToken,
      accountId,
      isPractice !== false
    );
    
    return res.json({ success: isConnected });
  } catch (error: any) {
    console.error('Error testing Oanda connection:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Save Oanda credentials
router.post('/oanda/credentials', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { apiToken, accountId, isPractice, label, isDefault } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!apiToken || !accountId) {
      return res.status(400).json({ error: 'API token and account ID are required' });
    }
    
    // First test the connection
    const isConnected = await oandaService.testOandaConnection(
      apiToken,
      accountId,
      isPractice !== false
    );
    
    if (!isConnected) {
      return res.status(400).json({ error: 'Failed to connect to Oanda with these credentials' });
    }
    
    // Save the credentials
    const credentials = oandaService.saveOandaCredentials(
      userId,
      apiToken,
      accountId,
      isPractice !== false,
      label || 'Default',
      isDefault !== false
    );
    
    // Don't return the actual credentials in the response
    return res.json({
      message: 'Oanda credentials saved successfully',
      label: credentials.label,
      isDefault: credentials.isDefault,
      isPractice: credentials.isPractice,
      createdAt: credentials.createdAt
    });
  } catch (error: any) {
    console.error('Error saving Oanda credentials:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get Oanda account info
router.get('/oanda/account', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const accountInfo = await oandaService.getAccountInfo(userId);
    
    return res.json(accountInfo);
  } catch (error: any) {
    console.error('Error getting Oanda account info:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get Oanda positions
router.get('/oanda/positions', authenticateUser, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const positions = await oandaService.getPositions(userId);
    
    return res.json(positions);
  } catch (error: any) {
    console.error('Error getting Oanda positions:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Execute Oanda trade
router.post('/oanda/trade', authenticateUser, async (req: Request, res: Response) => {
  try {
    const {
      instrument,
      units,
      orderType,
      price,
      takeProfitPrice,
      stopLossPrice,
      trailingStopDistance,
      timeInForce,
      clientId
    } = req.body;
    
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!instrument || units === undefined) {
      return res.status(400).json({ error: 'Instrument and units are required' });
    }
    
    const order = await oandaService.executeOandaTrade(
      instrument,
      units,
      orderType,
      price,
      takeProfitPrice,
      stopLossPrice,
      trailingStopDistance,
      timeInForce,
      clientId,
      userId
    );
    
    return res.json(order);
  } catch (error: any) {
    console.error('Error executing Oanda trade:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// ------------- NinjaTrader Routes -------------

// Test NinjaTrader connection
router.post('/ninjatrader/test', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { endpoint, apiKey } = req.body;
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    
    const isConnected = await ninjaTraderService.testNinjaTraderConnection(endpoint, apiKey);
    
    return res.json({ success: isConnected });
  } catch (error: any) {
    console.error('Error testing NinjaTrader connection:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Save NinjaTrader configuration
router.post('/ninjatrader/config', authenticateUser, async (req: Request, res: Response) => {
  try {
    const { endpoint, apiKey, account, label, isDefault } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!endpoint) {
      return res.status(400).json({ error: 'Endpoint is required' });
    }
    
    // First test the connection
    const isConnected = await ninjaTraderService.testNinjaTraderConnection(endpoint, apiKey);
    
    if (!isConnected) {
      return res.status(400).json({ error: 'Failed to connect to NinjaTrader with this configuration' });
    }
    
    // Save the configuration
    const config = ninjaTraderService.saveNinjaTraderConfig(
      userId,
      endpoint,
      apiKey,
      account,
      label || 'Default',
      isDefault !== false
    );
    
    // Don't return the full config in the response for security
    return res.json({
      message: 'NinjaTrader configuration saved successfully',
      label: config.label,
      isDefault: config.isDefault,
      createdAt: config.createdAt
    });
  } catch (error: any) {
    console.error('Error saving NinjaTrader configuration:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Execute NinjaTrader command
router.post('/ninjatrader/command', authenticateUser, async (req: Request, res: Response) => {
  try {
    const {
      action,
      symbol,
      quantity,
      orderType,
      limitPrice,
      stopPrice,
      account,
      template
    } = req.body;
    
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!action || !symbol || !quantity) {
      return res.status(400).json({ error: 'Action, symbol, and quantity are required' });
    }
    
    const result = await ninjaTraderService.executeNinjaTraderCommand(
      action,
      symbol,
      quantity,
      orderType,
      limitPrice,
      stopPrice,
      account,
      template,
      userId
    );
    
    return res.json(result);
  } catch (error: any) {
    console.error('Error executing NinjaTrader command:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

export default router;