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
import { authenticateUser } from '../middleware/auth';

const router = Router();

// Create a new webhook configuration
router.post('/', authenticateUser, async (req: Request, res: Response) => {
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
router.get('/', authenticateUser, async (req: Request, res: Response) => {
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
router.put('/:id', authenticateUser, async (req: Request, res: Response) => {
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
router.delete('/:id', authenticateUser, async (req: Request, res: Response) => {
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

// Receive webhooks at the public endpoint: /api/webhooks/receive/:token
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

export default router;