import { Router, Request, Response } from 'express';
import { 
  getWebhookConfigByToken, 
  processWebhook, 
  createWebhookConfig,
  updateWebhookConfig,
  deleteWebhookConfig,
  logWebhookExecution,
  getWebhooksForUser,
  getWebhookPerformanceMetrics,
  getErrorInsightsForWebhook,
  getWebhookExecutionLogs
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
    
    const webhookConfig = await createWebhookConfig(userId.toString(), name, broker, settings);
    
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
    if (updatedWebhook.userId !== userId.toString()) {
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

// Get all webhooks for a user (replacing the placeholder implementation)
router.get('/', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const webhooks = await getWebhooksForUser(userId.toString());
    
    return res.json({ webhooks });
  } catch (error: any) {
    console.error('Error getting webhook configs:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get webhook execution logs
router.get('/logs', authMiddleware, async (req: Request, res: Response) => {
  try {
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    const { webhookId, limit } = req.query;
    
    // Get logs, filtering by userId and optional webhookId
    const logs = await getWebhookExecutionLogs({
      userId: userId.toString(),
      webhookId: webhookId as string | undefined,
      limit: limit ? parseInt(limit as string, 10) : 100
    });
    
    return res.json({ logs });
  } catch (error: any) {
    console.error('Error getting webhook logs:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get performance metrics for a webhook
router.get('/:id/performance', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get the webhook to verify ownership
    const webhooks = await getWebhooksForUser(userId.toString());
    const webhook = webhooks.find(w => w.id === id);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found or you do not have permission to access it' });
    }
    
    const metrics = await getWebhookPerformanceMetrics(id);
    
    // Process metrics for a heatmap view
    const latencyHeatmap = processMetricsForHeatmap(metrics);
    
    return res.json({
      metrics,
      latencyHeatmap,
      summary: {
        totalRequests: metrics.length,
        successRate: metrics.filter(m => m.success).length / metrics.length * 100,
        averageResponseTime: metrics.reduce((acc, m) => acc + m.responseTime, 0) / metrics.length,
        maxResponseTime: Math.max(...metrics.map(m => m.responseTime)),
        minResponseTime: Math.min(...metrics.map(m => m.responseTime)),
      }
    });
  } catch (error: any) {
    console.error('Error getting webhook performance metrics:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Get AI-powered error insights for a webhook
router.get('/:id/error-insights', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get the webhook to verify ownership
    const webhooks = await getWebhooksForUser(userId.toString());
    const webhook = webhooks.find(w => w.id === id);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found or you do not have permission to access it' });
    }
    
    const insights = await getErrorInsightsForWebhook(id);
    
    // Sort insights by severity and frequency
    const sortedInsights = [...insights].sort((a, b) => {
      // Sort by severity first (high -> medium -> low)
      const severityOrder = { high: 3, medium: 2, low: 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      
      // If severity is the same, sort by frequency
      if (severityDiff === 0) {
        return b.frequency - a.frequency;
      }
      
      return severityDiff;
    });
    
    return res.json({
      insights: sortedInsights,
      hasCriticalIssues: sortedInsights.some(i => i.severity === 'high'),
      mostCommonError: sortedInsights.length > 0 ? sortedInsights[0] : null,
      totalErrors: sortedInsights.reduce((acc, i) => acc + i.frequency, 0),
    });
  } catch (error: any) {
    console.error('Error getting webhook error insights:', error);
    return res.status(500).json({ error: error.message || 'An error occurred' });
  }
});

// Test a webhook with sample data
router.post('/:id/test', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    
    // Get the webhook
    const webhooks = await getWebhooksForUser(userId);
    const webhook = webhooks.find(w => w.id === id);
    
    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found or you do not have permission to access it' });
    }
    
    // Generate sample payload based on broker type
    let samplePayload = {};
    
    switch(webhook.broker) {
      case 'alpaca':
        samplePayload = {
          action: "buy",
          symbol: "AAPL",
          qty: 1,
          type: "market",
          time_in_force: "day"
        };
        break;
      case 'oanda':
        samplePayload = {
          instrument: "EUR_USD",
          units: 1000,
          type: "MARKET"
        };
        break;
      case 'ninjatrader':
        samplePayload = {
          action: "BUY",
          symbol: "ES 09-23",
          quantity: 1,
          orderType: "MARKET"
        };
        break;
      case 'tradingview':
        samplePayload = {
          strategy: {
            order_action: "buy",
            order_contracts: 1,
            order_price: 150.00,
            market_position: "long",
            position_size: 1
          },
          ticker: "AAPL",
          time: new Date().toISOString(),
          price: 150.00,
          comment: "Test webhook"
        };
        break;
      default:
        samplePayload = {
          action: "TEST",
          message: "Testing webhook connectivity",
          timestamp: new Date().toISOString()
        };
    }
    
    // Create a custom request object for testing
    const testReq = {
      ...req,
      body: samplePayload,
      originalUrl: `/api/webhooks/w/${webhook.token}`,
      params: {
        token: webhook.token
      }
    };
    
    // Start timing
    const startTime = Date.now();
    
    // Process the webhook with proper type casting to satisfy TypeScript
    const result = await processWebhook(testReq as Request, webhook);
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Log the webhook execution with the response time
    await logWebhookExecution(
      webhook.id,
      webhook.userId,
      webhook.broker,
      samplePayload,
      result,
      req,
      responseTime
    );
    
    return res.json({
      success: true,
      result,
      testDetails: {
        payload: samplePayload,
        responseTime,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error: any) {
    console.error('Error testing webhook:', error);
    return res.status(500).json({ 
      success: false,
      error: error.message || 'An error occurred during test',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * Process metrics for a latency heatmap visualization
 */
function processMetricsForHeatmap(metrics: any[]) {
  if (metrics.length === 0) {
    return [];
  }
  
  // Group by hour of day
  const hourBuckets = Array(24).fill(0).map(() => ({
    count: 0,
    totalResponseTime: 0,
    errors: 0,
    averageResponseTime: 0,
    errorRate: 0
  }));
  
  metrics.forEach(metric => {
    const hour = new Date(metric.timestamp).getHours();
    hourBuckets[hour].count += 1;
    hourBuckets[hour].totalResponseTime += metric.responseTime;
    
    if (!metric.success) {
      hourBuckets[hour].errors += 1;
    }
  });
  
  // Calculate averages
  hourBuckets.forEach((bucket, hour) => {
    if (bucket.count > 0) {
      bucket.averageResponseTime = bucket.totalResponseTime / bucket.count;
      bucket.errorRate = (bucket.errors / bucket.count) * 100;
    }
  });
  
  return hourBuckets.map((bucket, hour) => ({
    hour,
    ...bucket,
    intensity: bucket.count > 0 ? Math.min(1, bucket.count / 10) : 0, // Normalize for heatmap
    responseColor: getResponseTimeColor(bucket.averageResponseTime)
  }));
}

/**
 * Get color code based on response time
 */
function getResponseTimeColor(responseTime: number): string {
  if (responseTime < 100) {
    return '#10B981'; // Green (fast)
  } else if (responseTime < 300) {
    return '#FBBF24'; // Yellow (medium)
  } else if (responseTime < 1000) {
    return '#F59E0B'; // Orange (slow)
  } else {
    return '#EF4444'; // Red (very slow)
  }
}

export default router;