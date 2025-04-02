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

// In a production app, this would interact with the database
// For now, we'll use an in-memory store
const webhookConfigs = new Map<string, WebhookConfig>();
const webhookExecutions = new Map<string, any>();

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
    broker: broker as any, // Cast to satisfy TypeScript
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
  webhookConfig: WebhookConfig
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
  req: Request
): Promise<void> => {
  const execution = {
    id: generateId(),
    webhookId,
    userId,
    broker,
    payload,
    result,
    timestamp: new Date(),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || 'unknown'
  };
  
  // In a real app, this would save to a database
  webhookExecutions.set(execution.id, execution);
  
  // Also log to console for debugging
  console.log(`Webhook execution logged: ${execution.id}`);
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
    
    // In a real implementation, this would call the Alpaca API
    // For now, we'll simulate a successful trade
    
    const orderId = `alpaca-${Date.now()}`;
    
    return {
      success: true,
      message: 'Trade executed successfully via Alpaca',
      orderId,
      details: {
        symbol: payload.symbol,
        side: payload.action || payload.side,
        quantity: payload.qty,
        orderType: payload.type || 'market'
      }
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
    
    // In a real implementation, this would call the Oanda API
    // For now, we'll simulate a successful trade
    
    const orderId = `oanda-${Date.now()}`;
    
    return {
      success: true,
      message: 'Trade executed successfully via Oanda',
      orderId,
      details: {
        instrument: payload.instrument,
        units: payload.units,
        type: payload.type || 'MARKET'
      }
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
    
    // In a real implementation, this would interact with NinjaTrader
    // For NinjaTrader, we might need to use a special approach since it may not have a direct API
    // This could involve a desktop companion app or browser extension that's listening for commands
    
    const orderId = `ninjatrader-${Date.now()}`;
    
    return {
      success: true,
      message: 'Trade signal sent to NinjaTrader',
      orderId,
      details: {
        symbol: payload.symbol,
        action: payload.action,
        quantity: payload.quantity,
        orderType: payload.orderType || 'MARKET'
      }
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