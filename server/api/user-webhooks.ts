import { Router } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';
import { processWebhookSignal } from './signals';
import { eq, desc } from 'drizzle-orm';
import type { Request } from 'express';
import type { UserWebhook } from '../../shared/schema';

const router = Router();

// Extended request type for our authentication
interface AuthenticatedRequest extends Request {
  session: {
    userId?: string;
  }
}

// Get all webhooks for a user
router.get('/', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Check if user is authenticated
    if (!authReq.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = authReq.session.userId;
    
    // Get webhooks from database
    const webhooks = await storage.query.userWebhooks.findMany({
      where: eq(storage.schema.userWebhooks.userId, userId),
      orderBy: [desc(storage.schema.userWebhooks.createdAt)]
    });
    
    // Return masked tokens (only show last 8 chars) for security
    const maskedWebhooks = webhooks.map((webhook: UserWebhook) => ({
      ...webhook,
      token: `********${webhook.token.substring(webhook.token.length - 8)}`
    }));
    
    return res.json({ webhooks: maskedWebhooks });
  } catch (error) {
    console.error('Error fetching webhooks:', error);
    return res.status(500).json({ error: 'Failed to fetch webhooks' });
  }
});

// Create a new webhook
router.post('/', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Check if user is authenticated
    if (!authReq.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = authReq.session.userId;
    const { name } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Webhook name is required' });
    }

    // Generate a random token (64 characters long)
    const token = crypto.randomBytes(32).toString('hex');
    
    // Create webhook in database
    const webhook = await storage.insert(storage.schema.userWebhooks).values({
      userId,
      name,
      token,
      createdAt: new Date().toISOString(),
      lastUsedAt: null,
      signalCount: 0,
      isActive: true
    }).returning();
    
    // Return the full webhook with token to user
    return res.status(201).json({ 
      webhook: webhook[0],
      webhookUrl: `${process.env.API_BASE_URL || req.protocol + '://' + req.get('host')}/api/webhooks/user/${token}`
    });
  } catch (error) {
    console.error('Error creating webhook:', error);
    return res.status(500).json({ error: 'Failed to create webhook' });
  }
});

// Delete a webhook
router.delete('/:webhookId', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Check if user is authenticated
    if (!authReq.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = authReq.session.userId;
    const { webhookId } = req.params;
    
    // Delete webhook from database if it belongs to user
    const result = await storage.delete(storage.schema.userWebhooks)
      .where(
        eq(storage.schema.userWebhooks.userId, userId) &&
        eq(storage.schema.userWebhooks.id, parseInt(webhookId))
      );
    
    if (!result || result.rowCount === 0) {
      return res.status(404).json({ error: 'Webhook not found or does not belong to you' });
    }
    
    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error deleting webhook:', error);
    return res.status(500).json({ error: 'Failed to delete webhook' });
  }
});

// Regenerate a webhook token
router.post('/:webhookId/regenerate', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // Check if user is authenticated
    if (!authReq.session.userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const userId = authReq.session.userId;
    const { webhookId } = req.params;
    
    // Generate a new token
    const token = crypto.randomBytes(32).toString('hex');
    
    // Update webhook in database if it belongs to user
    const result = await storage.update(storage.schema.userWebhooks)
      .set({ token })
      .where(
        eq(storage.schema.userWebhooks.userId, userId) &&
        eq(storage.schema.userWebhooks.id, parseInt(webhookId))
      )
      .returning();
    
    if (!result || result.length === 0) {
      return res.status(404).json({ error: 'Webhook not found or does not belong to you' });
    }
    
    // Return the full webhook with new token to user
    return res.json({ 
      webhook: result[0],
      webhookUrl: `${process.env.API_BASE_URL || req.protocol + '://' + req.get('host')}/api/webhooks/user/${token}`
    });
  } catch (error) {
    console.error('Error regenerating webhook token:', error);
    return res.status(500).json({ error: 'Failed to regenerate webhook token' });
  }
});

// Get a webhook by token
export const getUserWebhookByToken = async (token: string): Promise<UserWebhook | null> => {
  try {
    // Find webhook by token
    const webhook = await storage.query.userWebhooks.findFirst({
      where: eq(storage.schema.userWebhooks.token, token)
    });
    
    return webhook;
  } catch (error) {
    console.error('Error fetching webhook by token:', error);
    return null;
  }
};

// Process a webhook signal from a user webhook
export const processUserWebhook = async (token: string, payload: any): Promise<boolean> => {
  try {
    // Find webhook by token
    const webhook = await getUserWebhookByToken(token);
    
    if (!webhook || !webhook.isActive) {
      console.error('Invalid webhook token or webhook is inactive');
      return false;
    }
    
    // Update webhook usage stats
    await storage.update(storage.schema.userWebhooks)
      .set({ 
        lastUsedAt: new Date().toISOString(),
        signalCount: webhook.signalCount + 1
      })
      .where(eq(storage.schema.userWebhooks.id, webhook.id));
    
    // Add source information to payload
    const enrichedPayload = {
      ...payload,
      source: 'user_webhook',
      user_id: webhook.userId,
      webhook_id: webhook.id,
      webhook_name: webhook.name
    };
    
    // Process the webhook signal using the userId to properly store user-specific signals
    processWebhookSignal(enrichedPayload, webhook.userId);
    
    return true;
  } catch (error) {
    console.error('Error processing user webhook:', error);
    return false;
  }
};

export default router;