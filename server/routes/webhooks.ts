import { Router, Request, Response } from 'express';
import { 
  getWebhookConfigByToken, 
  processWebhook, 
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  logWebhookExecution
} from '../services/webhook-service';
import { WebhookConfig } from '../../shared/models/webhook';
import authMiddleware from '../middleware/auth';

const router = Router();

// Create a new webhook configuration
router.post('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, broker, settings } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    if (!name || !broker) {
      return res.status(400).json({ error: 'Name and broker are required' });
    }
    
    const webhookConfig = await createWebhookConfig(userId, name, broker, settings);
    
    return res.status(201).json({
      message: 'Webhook configuration created successfully',
      webhook: webhookConfig
    });
  } catch (error: any) {
    console.error('Error creating webhook config:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get all webhook configurations for the authenticated user
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real app, this would query the database
    // For now, this is just a placeholder that returns an empty array
    const webhooks: WebhookConfig[] = [];
    
    return res.json({ webhooks });
  } catch (error: any) {
    console.error('Error getting webhook configs:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Update a webhook configuration
router.put('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, broker, isActive, settings } = req.body;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const updatedWebhook = await updateWebhookConfig(id, {
      name,
      broker,
      isActive,
      settings
    });
    
    if (!updatedWebhook) {
      return res.status(404).json({ error: 'Webhook configuration not found' });
    }
    
    // Check if this webhook belongs to the authenticated user
    if (updatedWebhook.userId !== userId) {
      return res.status(403).json({ error: 'Forbidden' });
    }
    
    return res.json({
      message: 'Webhook configuration updated successfully',
      webhook: updatedWebhook
    });
  } catch (error: any) {
    console.error('Error updating webhook config:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Delete a webhook configuration
router.delete('/:id', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // In a real app, we would check if the webhook belongs to the user
    // before deleting it
    
    const result = await deleteWebhookConfig(id);
    
    if (!result) {
      return res.status(404).json({ error: 'Webhook configuration not found' });
    }
    
    return res.json({
      message: 'Webhook configuration deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting webhook config:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Shorter webhook endpoints following CrossTrade's approach
// 1. Main shorthand format: /api/w/:token (similar to CrossTrade's cleaner URLs)
router.post('/w/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Look up the webhook configuration by token
    const webhookConfig = await getWebhookConfigByToken(token);
    
    if (!webhookConfig) {
      return res.status(404).json({ error: 'Invalid webhook token' });
    }
    
    // Process the webhook
    const result = await processWebhook(req, webhookConfig);
    
    // Log the webhook execution
    await logWebhookExecution(
      webhookConfig.id,
      webhookConfig.userId,
      webhookConfig.broker,
      req.body,
      result,
      req
    );
    
    // Return the result
    return res.json(result);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred',
      errors: [error.message || 'Unknown error']
    });
  }
});

// 2. TradingView specific format: /api/w/tv/:token (for TradingView specific format)
router.post('/w/tv/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Look up the webhook configuration by token
    const webhookConfig = await getWebhookConfigByToken(token);
    
    if (!webhookConfig) {
      return res.status(404).json({ error: 'Invalid webhook token' });
    }
    
    // Override the broker to TradingView for this endpoint
    const tradingViewConfig = { ...webhookConfig, broker: 'tradingview' };
    
    // Process the webhook
    const result = await processWebhook(req, tradingViewConfig);
    
    // Log the webhook execution
    await logWebhookExecution(
      webhookConfig.id,
      webhookConfig.userId,
      'tradingview',
      req.body,
      result,
      req
    );
    
    // Return the result
    return res.json(result);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred',
      errors: [error.message || 'Unknown error']
    });
  }
});

// 3. Backwards compatibility for existing usage: /api/webhooks/receive/:token
router.post('/receive/:token', async (req: Request, res: Response) => {
  try {
    const { token } = req.params;
    
    // Look up the webhook configuration by token
    const webhookConfig = await getWebhookConfigByToken(token);
    
    if (!webhookConfig) {
      return res.status(404).json({ error: 'Invalid webhook token' });
    }
    
    // Process the webhook
    const result = await processWebhook(req, webhookConfig);
    
    // Log the webhook execution
    await logWebhookExecution(
      webhookConfig.id,
      webhookConfig.userId,
      webhookConfig.broker,
      req.body,
      result,
      req
    );
    
    // Return the result
    return res.json(result);
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred',
      errors: [error.message || 'Unknown error']
    });
  }
});

// 4. Token in JSON payload - most flexible approach for integrations
router.post('/execute', async (req: Request, res: Response) => {
  try {
    // Extract token from the JSON payload
    const payloadToken = req.body.token || req.body.api_key || req.body.apiKey || req.body.webhook_token;
    
    if (!payloadToken) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token is required in the JSON payload',
        error: 'Missing token. Add "token", "api_key", "apiKey", or "webhook_token" to your JSON payload.'
      });
    }
    
    // Look up the webhook configuration by token
    const webhookConfig = await getWebhookConfigByToken(payloadToken);
    
    if (!webhookConfig) {
      return res.status(404).json({ 
        success: false,
        message: 'Invalid webhook token',
        error: 'The provided token was not found or is inactive.'
      });
    }
    
    console.log(`Webhook found for token ${payloadToken} (broker: ${webhookConfig.broker})`);
    
    // Process the webhook
    const result = await processWebhook(req, webhookConfig);
    
    // Log the webhook execution
    await logWebhookExecution(
      webhookConfig.id,
      webhookConfig.userId,
      webhookConfig.broker,
      req.body,
      result,
      req
    );
    
    // Return the result
    return res.json(result);
  } catch (error: any) {
    console.error('Error processing webhook with token in payload:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'An error occurred',
      errors: [error.message || 'Unknown error']
    });
  }
});

export default router;