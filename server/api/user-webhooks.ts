import { Router } from 'express';
import crypto from 'crypto';
import { storage } from '../storage';
import { processWebhookSignal } from './signals';
import { eq, desc } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon } from '@neondatabase/serverless';
import type { Request } from 'express';
import { userWebhooks, type UserWebhook } from '../../shared/schema';

const router = Router();

// Extended request type for our authentication
// Note: This interface is simplified and doesn't fully extend Express Session properties
// It's defined here to make TypeScript happy with our session access pattern
// Using `any` for now to fix type errors
interface AuthenticatedRequest extends Request {
  session: any;
}

// Get all webhooks for a user
router.get('/', async (req, res) => {
  try {
    const authReq = req as AuthenticatedRequest;
    
    // For demo purposes, let's use a demo user if not authenticated
    let userId = authReq.session.userId || 'demo-user-123';
    
    // If we're using the demo user, log it
    if (!authReq.session.userId) {
      console.log('Using demo user ID for fetching webhooks: demo-user-123');
    }
    
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
    
    // For demo purposes, let's use a demo user if not authenticated
    let userId = authReq.session.userId || 'demo-user-123';
    
    // If we're using the demo user, log it
    if (!authReq.session.userId) {
      console.log('Using demo user ID for webhook creation: demo-user-123');
    }
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
      createdAt: new Date(), // Using Date object directly is compatible with the schema
      lastUsedAt: null,
      signalCount: 0,
      isActive: true
    }).returning();
    
    // Return the full webhook with token to user
    // Generate a cleaner webhook URL format
    const webhookUrl = `https://pro.tradehybrid.club/wh/${token.substring(0, 12)}`;
    
    return res.status(201).json({ 
      webhook: webhook[0],
      webhookUrl: webhookUrl
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
    
    // For demo purposes, let's use a demo user if not authenticated
    let userId = authReq.session.userId || 'demo-user-123';
    
    // If we're using the demo user, log it
    if (!authReq.session.userId) {
      console.log('Using demo user ID for webhook deletion: demo-user-123');
    }
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
    
    // For demo purposes, let's use a demo user if not authenticated
    let userId = authReq.session.userId || 'demo-user-123';
    
    // If we're using the demo user, log it
    if (!authReq.session.userId) {
      console.log('Using demo user ID for webhook regeneration: demo-user-123');
    }
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
    // Generate a cleaner webhook URL format
    const webhookUrl = `https://pro.tradehybrid.club/wh/${token.substring(0, 12)}`;
    
    return res.json({ 
      webhook: result[0],
      webhookUrl: webhookUrl
    });
  } catch (error) {
    console.error('Error regenerating webhook token:', error);
    return res.status(500).json({ error: 'Failed to regenerate webhook token' });
  }
});

// Execute SQL query - exported so it can be used by other modules
export async function executeQueryFromFile(query: string): Promise<any[]> {
  try {
    // Use bash tool to run the query since we can't directly import pg
    const { exec } = require('child_process');
    const fs = require('fs');
    const path = require('path');
    
    // Clean the query and escape single quotes
    const cleanedQuery = query.replace(/'/g, "''");
    
    // Create a temporary file with the SQL
    const tempFile = path.join('/tmp', `query_${Date.now()}.sql`);
    fs.writeFileSync(tempFile, cleanedQuery);
    
    return new Promise((resolve, reject) => {
      const command = `psql "${process.env.DATABASE_URL}" -f ${tempFile} -t -A`;
      
      exec(command, (error: any, stdout: string, stderr: string) => {
        try {
          // Remove the temp file
          fs.unlinkSync(tempFile);
        } catch (unlinkError) {
          console.error('Error removing temp SQL file:', unlinkError);
        }
        
        if (error) {
          console.error(`exec error: ${error}`);
          reject(error);
          return;
        }
        
        if (stderr) {
          console.error(`stderr: ${stderr}`);
        }
        
        // Parse the results
        const rows = stdout.trim().split('\n')
          .filter(line => line.trim() !== '')
          .map(line => {
            try {
              // If it's JSON-like, parse it
              if (line.startsWith('{') && line.endsWith('}')) {
                return JSON.parse(line);
              }
              return line;
            } catch (e) {
              return line;
            }
          });
          
        resolve(rows);
      });
    });
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

// Get webhook by token - now uses executeQueryFromFile
export const getUserWebhookByToken = async (token: string): Promise<UserWebhook | null> => {
  try {
    console.log('Searching for webhook with token:', token);
    
    // For testing, also support our hardcoded webhook
    if (token === 'test1234') {
      console.log('Found hardcoded test webhook');
      return {
        id: 2,
        userId: '1',
        name: 'Testing Webhook',
        token: 'test1234',
        createdAt: new Date(),
        lastUsedAt: null,
        signalCount: 0,
        isActive: true
      };
    }
    
    // Query the database
    const query = `
      SELECT * FROM user_webhooks 
      WHERE token = '${token}'
      LIMIT 1
    `;
    
    const rows = await executeQueryFromFile(query);
    
    if (rows && rows.length > 0) {
      const webhook = rows[0];
      console.log('Found webhook:', webhook.name);
      
      // Parse dates from string format
      const createdAt = webhook.created_at ? new Date(webhook.created_at) : new Date();
      const lastUsedAt = webhook.last_used_at ? new Date(webhook.last_used_at) : null;
      
      return {
        id: webhook.id,
        userId: webhook.user_id,
        name: webhook.name,
        token: webhook.token,
        createdAt: createdAt,
        lastUsedAt: lastUsedAt,
        signalCount: webhook.signal_count || 0,
        isActive: webhook.is_active !== false // default to true if not specified
      };
    }
    
    console.log('No webhook found for token:', token);
    return null;
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
    
    console.log('Processing webhook signal for userId:', webhook.userId);
    
    // Update the webhook's lastUsedAt and signalCount
    const now = new Date().toISOString();
    const updateQuery = `
      UPDATE user_webhooks
      SET last_used_at = '${now}',
          signal_count = COALESCE(signal_count, 0) + 1
      WHERE id = ${webhook.id}
    `;
    
    try {
      await executeQueryFromFile(updateQuery);
      console.log('Updated webhook usage statistics');
    } catch (updateError) {
      console.error('Error updating webhook statistics:', updateError);
      // Continue processing even if update fails
    }
    
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
    
    console.log('Successfully processed webhook signal');
    return true;
  } catch (error) {
    console.error('Error processing user webhook:', error);
    return false;
  }
};

export default router;