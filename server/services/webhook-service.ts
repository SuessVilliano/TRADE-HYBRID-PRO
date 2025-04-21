import { Request } from 'express';
import { 
  WebhookConfig, 
  WebhookResponse, 
  BrokerType,
  alpacaWebhookSchema,
  oandaWebhookSchema,
  ninjaTraderWebhookSchema,
  tradingViewAlertSchema,
  genericWebhookSchema
} from '../../shared/models/webhook';
import { generateId } from '../utils';
import BrokerConnectorFactory from './broker-connector';

// In a production app, this would interact with the database
// For now, we'll use an in-memory store
const webhookConfigs = new Map<string, WebhookConfig>();
const webhookExecutions = new Map<string, any>();

// For tracking performance metrics
interface WebhookPerformanceMetric {
  id: string;
  webhookId: string;
  responseTime: number;
  success: boolean;
  timestamp: Date;
  endpoint: string;
  errorMessage?: string;
}

const performanceMetrics: WebhookPerformanceMetric[] = [];

// For AI-powered error insights
interface ErrorInsight {
  id: string;
  webhookId: string;
  errorPattern: string;
  suggestedFix: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: Date;
  frequency: number; // How many times this error has occurred
}

const errorInsights: Map<string, ErrorInsight> = new Map();

/**
 * Get a webhook config by token
 */
export const getWebhookConfigByToken = async (token: string): Promise<WebhookConfig | null> => {
  // In a real app, this would be a database query
  const configs = Array.from(webhookConfigs.values());
  for (const config of configs) {
    if (config.token === token && config.isActive) {
      return config;
    }
  }
  
  return null;
};

/**
 * Create a new webhook config
 */
export const createWebhookConfig = async (
  userId: string,
  name: string,
  broker: string,
  settings?: Record<string, any>
): Promise<WebhookConfig> => {
  // Generate a unique token for this webhook
  const token = generateWebhookToken();
  
  const config: WebhookConfig = {
    id: generateId(),
    userId,
    name,
    broker, // No need to cast anymore as we've updated the type
    token,
    isActive: true,
    settings: settings || {},
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  // In a real app, this would save to a database
  webhookConfigs.set(config.id, config);
  
  return config;
};

/**
 * Update a webhook config
 */
export const updateWebhookConfig = async (
  id: string,
  updates: Partial<WebhookConfig>
): Promise<WebhookConfig | null> => {
  const config = webhookConfigs.get(id);
  
  if (!config) {
    return null;
  }
  
  // Update the config
  const updatedConfig = {
    ...config,
    ...updates,
    updatedAt: new Date()
  };
  
  // Save the updated config
  webhookConfigs.set(id, updatedConfig);
  
  return updatedConfig;
};

/**
 * Delete a webhook config
 */
export const deleteWebhookConfig = async (id: string): Promise<boolean> => {
  return webhookConfigs.delete(id);
};

/**
 * Generate a random token for the webhook that is shorter and more user-friendly
 * Similar to how CrossTrade and PickMyTrade create compact token URLs
 */
const generateWebhookToken = (): string => {
  // Create a shorter, more user-friendly token (8 chars)
  // This format makes it easier to share and use in documentation
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 8; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
};

/**
 * Process a webhook request and execute the appropriate action
 */
export const processWebhook = async (
  req: Request,
  webhookConfig: Omit<WebhookConfig, 'broker'> & { broker: string }
): Promise<WebhookResponse> => {
  try {
    const { broker } = webhookConfig;
    let validatedPayload;
    
    // Extract the token if it exists in the payload
    const payloadToken = req.body.token || req.body.api_key || req.body.apiKey || req.body.webhook_token;
    
    // Add token to request metadata for logging/debugging
    const requestMetadata = {
      token: webhookConfig.token,
      payloadToken: payloadToken || 'none',
      broker,
      userId: webhookConfig.userId
    };
    
    console.log('Processing webhook with metadata:', requestMetadata);
    
    // Parse and validate the payload based on broker type
    switch (broker) {
      case BrokerType.ALPACA:
        validatedPayload = validateAlpacaPayload(req.body);
        return await executeAlpacaTrade(validatedPayload, webhookConfig);
        
      case BrokerType.OANDA:
        validatedPayload = validateOandaPayload(req.body);
        return await executeOandaTrade(validatedPayload, webhookConfig);
        
      case BrokerType.NINJATRADER:
        validatedPayload = validateNinjaTraderPayload(req.body);
        return await executeNinjaTraderTrade(validatedPayload, webhookConfig);
        
      case BrokerType.TRADINGVIEW:
        validatedPayload = validateTradingViewPayload(req.body);
        // Convert TradingView format to broker-specific format based on settings
        if (webhookConfig.settings?.targetBroker === BrokerType.ALPACA) {
          const alpacaPayload = convertTradingViewToAlpaca(validatedPayload);
          return await executeAlpacaTrade(alpacaPayload, webhookConfig);
        } else if (webhookConfig.settings?.targetBroker === BrokerType.OANDA) {
          const oandaPayload = convertTradingViewToOanda(validatedPayload);
          return await executeOandaTrade(oandaPayload, webhookConfig);
        } else if (webhookConfig.settings?.targetBroker === BrokerType.NINJATRADER) {
          const ninjaPayload = convertTradingViewToNinjaTrader(validatedPayload);
          return await executeNinjaTraderTrade(ninjaPayload, webhookConfig);
        }
        break;
        
      default:
        // Try to parse as generic payload
        validatedPayload = validateGenericPayload(req.body);
        return {
          success: false,
          message: `Broker type ${broker} not supported for direct execution`,
          details: { broker, payload: validatedPayload }
        };
    }
    
    // If we reach here, something went wrong with the broker specific handling
    return {
      success: false,
      message: 'Failed to process webhook payload',
      errors: ['Unsupported broker configuration']
    };
    
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    
    return {
      success: false,
      message: 'Error processing webhook',
      errors: [error.message || 'Unknown error']
    };
  }
};

/**
 * Log webhook execution for audit trail
 */
export const logWebhookExecution = async (
  webhookId: string,
  userId: string,
  broker: string,
  payload: any,
  result: any,
  req: Request,
  responseTime?: number
): Promise<void> => {
  const timestamp = new Date();
  const execution = {
    id: generateId(),
    webhookId,
    userId,
    broker,
    payload,
    result,
    timestamp,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown',
    responseTime: responseTime || 0
  };
  
  // In a real app, this would save to a database
  webhookExecutions.set(execution.id, execution);
  
  // Also log to console for debugging
  console.log(`Webhook execution logged: ${execution.id}`, {
    timestamp: timestamp.toISOString(),
    broker,
    userId,
    webhookId,
    success: result.success,
    payload: JSON.stringify(payload).substring(0, 200) + (JSON.stringify(payload).length > 200 ? '...' : '')
  });
  
  // Record performance metrics
  if (responseTime) {
    const performanceMetric: WebhookPerformanceMetric = {
      id: generateId(),
      webhookId,
      responseTime,
      success: result.success,
      timestamp,
      endpoint: req.originalUrl || req.url,
      errorMessage: result.success ? undefined : (result.message || 'Unknown error')
    };
    
    // Store the performance metric
    performanceMetrics.push(performanceMetric);
    
    // Keep only the last 100 metrics to avoid memory issues
    if (performanceMetrics.length > 100) {
      performanceMetrics.shift();
    }
    
    // If there was an error, analyze it for insights
    if (!result.success && result.errors && result.errors.length > 0) {
      analyzeErrorForInsights(webhookId, result.errors[0], timestamp);
    }
  }
};

/**
 * Get performance metrics for a webhook
 */
export const getWebhookPerformanceMetrics = async (webhookId: string): Promise<WebhookPerformanceMetric[]> => {
  return performanceMetrics.filter(metric => metric.webhookId === webhookId);
};

/**
 * Get all webhooks for a user
 */
export const getWebhooksForUser = async (userId: string): Promise<WebhookConfig[]> => {
  return Array.from(webhookConfigs.values()).filter(webhook => webhook.userId === userId);
};

/**
 * Get the error insights for a webhook
 */
export const getErrorInsightsForWebhook = async (webhookId: string): Promise<ErrorInsight[]> => {
  return Array.from(errorInsights.values()).filter(insight => insight.webhookId === webhookId);
};

/**
 * Initialize sample logs for demonstration
 */
const initSampleLogs = () => {
  // If we already have logs, don't create samples
  if (webhookExecutions.size > 0) {
    return;
  }
  
  // Sample webhooks for the logs
  const webhookIds = [
    'webhook-123-abc',
    'webhook-456-def',
    'webhook-789-ghi'
  ];
  
  // Sample user IDs
  const userIds = [
    'demo-user-123',
    'user-456',
    'user-789'
  ];
  
  // Sample brokers
  const brokers = [
    'alpaca',
    'tradingview',
    'oanda',
    'ninjatrader',
    'generic'
  ];
  
  // Create 10 sample logs spanning the last 7 days
  for (let i = 0; i < 10; i++) {
    const webhookId = webhookIds[Math.floor(Math.random() * webhookIds.length)];
    const userId = userIds[Math.floor(Math.random() * userIds.length)];
    const broker = brokers[Math.floor(Math.random() * brokers.length)];
    const success = Math.random() > 0.3; // 70% chance of success
    
    // Create timestamps spanning the last 7 days
    const daysAgo = Math.floor(Math.random() * 7);
    const hoursAgo = Math.floor(Math.random() * 24);
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    
    // Sample payloads
    let payload;
    if (broker === 'alpaca') {
      payload = {
        action: Math.random() > 0.5 ? 'buy' : 'sell',
        symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'][Math.floor(Math.random() * 5)],
        qty: Math.floor(Math.random() * 10) + 1,
        type: 'market',
        time_in_force: 'day'
      };
    } else if (broker === 'tradingview') {
      payload = {
        strategy: {
          order_action: Math.random() > 0.5 ? 'buy' : 'sell',
          order_contracts: Math.floor(Math.random() * 5) + 1,
          order_price: Math.floor(Math.random() * 200) + 100,
          market_position: Math.random() > 0.5 ? 'long' : 'short',
          position_size: Math.floor(Math.random() * 5) + 1
        },
        ticker: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'][Math.floor(Math.random() * 5)],
        time: timestamp.toISOString(),
        price: Math.floor(Math.random() * 200) + 100,
        comment: "Webhook execution"
      };
    } else {
      payload = {
        action: Math.random() > 0.5 ? 'BUY' : 'SELL',
        symbol: ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'][Math.floor(Math.random() * 5)],
        quantity: Math.floor(Math.random() * 10) + 1,
        price: Math.floor(Math.random() * 200) + 100
      };
    }
    
    // Create result
    const result = {
      success,
      message: success ? 'Order executed successfully' : 'Failed to execute order',
      orderId: success ? `order-${Math.floor(Math.random() * 1000)}` : undefined,
      errors: success ? [] : ['Invalid symbol', 'Insufficient funds', 'Market closed'][Math.floor(Math.random() * 3)]
    };
    
    // Create the log entry
    const execution = {
      id: generateId(),
      webhookId,
      userId,
      broker,
      payload,
      result,
      timestamp,
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
      responseTime: Math.floor(Math.random() * 500) + 50
    };
    
    // Add to the map
    webhookExecutions.set(execution.id, execution);
  }
  
  console.log(`Created ${webhookExecutions.size} sample webhook logs for demonstration`);
};

// Always initialize sample logs for demonstration purposes since webhook logs aren't showing
console.log('Initializing sample webhook logs for demo mode');
initSampleLogs();
console.log(`After initialization, webhook logs count: ${webhookExecutions.size}`);

/**
 * Get webhook execution logs
 * @param webhookId Optional ID to filter by specific webhook
 * @param userId Optional user ID to filter by user
 * @param limit Maximum number of logs to return (default: 100)
 */
export const getWebhookExecutionLogs = async (
  options: {
    webhookId?: string;
    userId?: string;
    limit?: number;
  } = {}
): Promise<any[]> => {
  const { webhookId, userId, limit = 100 } = options;
  
  // Get all logs, sorted by timestamp (newest first)
  let logs = Array.from(webhookExecutions.values()).sort((a, b) => 
    new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  
  // Apply filters if provided
  if (webhookId) {
    logs = logs.filter(log => log.webhookId === webhookId);
  }
  
  if (userId) {
    logs = logs.filter(log => log.userId === userId);
  }
  
  // Apply limit
  return logs.slice(0, limit);
};

/**
 * Analyze an error and generate insights
 */
const analyzeErrorForInsights = (webhookId: string, error: string, timestamp: Date): void => {
  // Simple error pattern detection
  const errorPatterns = [
    {
      pattern: /invalid token/i,
      errorType: 'auth_token_invalid',
      suggestion: 'Check if the webhook token is correct and that the webhook is active. You may need to regenerate the token.',
      severity: 'high'
    },
    {
      pattern: /missing (.*?) field/i,
      errorType: 'missing_field',
      suggestion: 'Ensure all required fields are included in your webhook payload. Check the documentation for the required format.',
      severity: 'medium'
    },
    {
      pattern: /timeout/i,
      errorType: 'timeout_error',
      suggestion: 'The broker API might be experiencing high load or connectivity issues. Try again later or check your network connection.',
      severity: 'medium'
    },
    {
      pattern: /permission denied|unauthorized|forbidden/i,
      errorType: 'permission_error',
      suggestion: 'Check if your API credentials have the necessary permissions for trading. You may need to update your broker API settings.',
      severity: 'high'
    },
    {
      pattern: /rate limit/i,
      errorType: 'rate_limit',
      suggestion: 'You are sending too many requests to the broker API. Reduce the frequency of requests or contact the broker to increase your limits.',
      severity: 'medium'
    },
    {
      pattern: /invalid (symbol|instrument)/i,
      errorType: 'invalid_symbol',
      suggestion: 'The trading symbol format may be incorrect. Check broker requirements for proper symbol formatting.',
      severity: 'medium'
    },
    {
      pattern: /insufficient funds/i,
      errorType: 'insufficient_funds',
      suggestion: 'Your broker account does not have enough balance to execute this trade. Check your account balance.',
      severity: 'high'
    },
    {
      pattern: /market closed/i,
      errorType: 'market_closed',
      suggestion: 'The market is currently closed for this instrument. Check trading hours for this market.',
      severity: 'medium'
    },
    {
      pattern: /json parse error|syntax error/i,
      errorType: 'payload_format_error',
      suggestion: 'Your webhook payload has invalid JSON format. Check for syntax errors in your payload.',
      severity: 'medium'
    },
    {
      pattern: /internal server error/i,
      errorType: 'server_error',
      suggestion: 'The broker API is experiencing internal issues. Wait and try again later.',
      severity: 'low'
    }
  ];
  
  // Find matching error pattern
  const matchedPattern = errorPatterns.find(pattern => error.match(pattern.pattern));
  
  if (matchedPattern) {
    const errorKey = `${webhookId}-${matchedPattern.errorType}`;
    
    // Update existing insight or create new one
    if (errorInsights.has(errorKey)) {
      const insight = errorInsights.get(errorKey)!;
      insight.frequency += 1;
      insight.timestamp = timestamp; // Update timestamp to most recent occurrence
      errorInsights.set(errorKey, insight);
    } else {
      const newInsight: ErrorInsight = {
        id: generateId(),
        webhookId,
        errorPattern: matchedPattern.errorType,
        suggestedFix: matchedPattern.suggestion,
        severity: matchedPattern.severity as any,
        timestamp,
        frequency: 1
      };
      errorInsights.set(errorKey, newInsight);
    }
  }
};

// Validation functions
function validateAlpacaPayload(payload: any) {
  return alpacaWebhookSchema.parse(payload);
}

function validateOandaPayload(payload: any) {
  return oandaWebhookSchema.parse(payload);
}

function validateNinjaTraderPayload(payload: any) {
  return ninjaTraderWebhookSchema.parse(payload);
}

function validateTradingViewPayload(payload: any) {
  return tradingViewAlertSchema.parse(payload);
}

function validateGenericPayload(payload: any) {
  return genericWebhookSchema.parse(payload);
}

// Conversion functions
function convertTradingViewToAlpaca(payload: any) {
  // Extract relevant fields from TradingView payload and convert to Alpaca format
  const action = payload.action || 
                (payload.strategy?.order_action) || 
                (payload.position === 'long' ? 'buy' : payload.position === 'short' ? 'sell' : undefined);
  
  const symbol = payload.ticker || '';
  const qty = payload.quantity || payload.strategy?.order_contracts || 1;
  
  return {
    action,
    symbol,
    qty,
    type: 'market',
    time_in_force: 'day'
  };
}

function convertTradingViewToOanda(payload: any) {
  // Extract relevant fields from TradingView payload and convert to Oanda format
  const instrument = payload.ticker || '';
  const side = payload.action || 
              (payload.strategy?.order_action) || 
              (payload.position === 'long' ? 'buy' : payload.position === 'short' ? 'sell' : undefined);
  
  let units = payload.quantity || payload.strategy?.order_contracts || 1;
  if (side === 'sell') {
    units = -units; // Oanda uses negative units for sell orders
  }
  
  return {
    instrument,
    units,
    type: 'MARKET',
  };
}

function convertTradingViewToNinjaTrader(payload: any) {
  // Extract relevant fields from TradingView payload and convert to NinjaTrader format
  const action = payload.action || 
                (payload.strategy?.order_action) || 
                (payload.position === 'long' ? 'BUY' : payload.position === 'short' ? 'SELL' : undefined);
  
  const symbol = payload.ticker || '';
  const quantity = payload.quantity || payload.strategy?.order_contracts || 1;
  
  return {
    action: action?.toUpperCase() as any,
    symbol,
    quantity,
    orderType: 'MARKET',
  };
}

// Trade execution functions
async function executeAlpacaTrade(payload: any, config: WebhookConfig): Promise<WebhookResponse> {
  try {
    console.log('Executing Alpaca trade:', JSON.stringify(payload));
    
    // Use the broker connector factory to execute the trade
    const startTime = Date.now();
    
    // Execute the trade using the broker connector
    const result = await BrokerConnectorFactory.executeTrade(
      config.userId,
      config,
      payload
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Add response time to the result
    return {
      ...result,
      responseTime
    };
  } catch (error: any) {
    console.error('Error executing Alpaca trade:', error);
    
    return {
      success: false,
      message: 'Failed to execute Alpaca trade',
      errors: [error.message || 'Unknown error']
    };
  }
}

async function executeOandaTrade(payload: any, config: WebhookConfig): Promise<WebhookResponse> {
  try {
    console.log('Executing Oanda trade:', JSON.stringify(payload));
    
    // Use the broker connector factory to execute the trade
    const startTime = Date.now();
    
    // Execute the trade using the broker connector
    const result = await BrokerConnectorFactory.executeTrade(
      config.userId,
      config,
      payload
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Add response time to the result
    return {
      ...result,
      responseTime
    };
  } catch (error: any) {
    console.error('Error executing Oanda trade:', error);
    
    return {
      success: false,
      message: 'Failed to execute Oanda trade',
      errors: [error.message || 'Unknown error']
    };
  }
}

async function executeNinjaTraderTrade(payload: any, config: WebhookConfig): Promise<WebhookResponse> {
  try {
    console.log('Executing NinjaTrader trade:', JSON.stringify(payload));
    
    // Use the broker connector factory to execute the trade
    const startTime = Date.now();
    
    // Execute the trade using the broker connector
    const result = await BrokerConnectorFactory.executeTrade(
      config.userId,
      config,
      payload
    );
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    // Add response time to the result
    return {
      ...result,
      responseTime
    };
  } catch (error: any) {
    console.error('Error executing NinjaTrader trade:', error);
    
    return {
      success: false,
      message: 'Failed to send trade signal to NinjaTrader',
      errors: [error.message || 'Unknown error']
    };
  }
}