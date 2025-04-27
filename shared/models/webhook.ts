import { z } from 'zod';

// Broker types supported by our system
export const BrokerType = {
  ALPACA: 'alpaca',
  OANDA: 'oanda',
  NINJATRADER: 'ninjatrader',
  TRADOVATE: 'tradovate',
  TRADINGVIEW: 'tradingview',
  INTERACTIVE_BROKERS: 'interactive_brokers',
  TRADIER: 'tradier',
  SAXO_BANK: 'saxo_bank',
  CTRADER: 'ctrader',
  MATCH_TRADER: 'match_trader',
  META_API: 'meta_api',
  TD_AMERITRADE: 'td_ameritrade',
  IG: 'ig',
  OTHER: 'other'
} as const;

export type BrokerTypeValue = typeof BrokerType[keyof typeof BrokerType];

// Define webhook validation schemas
export const webhookConfigSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1, 'Name is required'),
  broker: z.string().min(1, 'Broker is required'),
  token: z.string().min(8, 'Token must be at least 8 characters'),
  endpoint: z.string().optional(),
  isActive: z.boolean().default(true),
  settings: z.record(z.any()).optional(),
  // Enhanced settings for broker-specific configurations
  brokerConfig: z.object({
    // Which broker account to use for trade execution
    brokerAccountId: z.string().optional(),
    // Trade parameters
    defaultQuantity: z.number().positive().optional(),
    risk: z.number().min(0).max(100).optional(), // Risk percentage per trade
    stopLossStrategy: z.enum(['fixed', 'percentage', 'atr', 'none']).optional(),
    stopLossValue: z.number().optional(),
    takeProfitStrategy: z.enum(['fixed', 'percentage', 'riskReward', 'none']).optional(),
    takeProfitValue: z.number().optional(),
    trailingStop: z.boolean().optional(),
    trailingStopValue: z.number().optional(),
    // Processing options
    allowReversals: z.boolean().optional(),
    closePositionsOnOpposite: z.boolean().optional(),
    autoAdjustQuantity: z.boolean().optional()
  }).optional(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

export type WebhookConfig = z.infer<typeof webhookConfigSchema>;

// Define webhook payload schemas for different brokers
export const alpacaWebhookSchema = z.object({
  // Support for token in the payload
  token: z.string().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
  webhook_token: z.string().optional(),
  
  action: z.enum(['buy', 'sell']),
  symbol: z.string(),
  qty: z.number().optional(),
  side: z.enum(['buy', 'sell']).optional(),
  type: z.enum(['market', 'limit', 'stop', 'stop_limit']).optional(),
  time_in_force: z.enum(['day', 'gtc', 'opg', 'cls', 'ioc', 'fok']).optional(),
  limit_price: z.number().optional(),
  stop_price: z.number().optional(),
  risk_percent: z.number().optional(),
  take_profit: z.number().optional(),
  stop_loss: z.number().optional(),
  trailing_stop: z.number().optional(),
  extended_hours: z.boolean().optional(),
  client_order_id: z.string().optional(),
});

export type AlpacaWebhookPayload = z.infer<typeof alpacaWebhookSchema>;

export const oandaWebhookSchema = z.object({
  // Support for token in the payload
  token: z.string().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
  webhook_token: z.string().optional(),
  
  instrument: z.string(),
  units: z.number().or(z.string()),
  side: z.enum(['buy', 'sell']).optional(),
  type: z.enum(['MARKET', 'LIMIT', 'STOP', 'MARKET_IF_TOUCHED']).optional(),
  price: z.number().optional(),
  stopLossOnFill: z.object({
    price: z.number().optional(),
    distance: z.number().optional(),
  }).optional(),
  takeProfitOnFill: z.object({
    price: z.number().optional(),
    distance: z.number().optional(),
  }).optional(),
  trailingStopLossOnFill: z.object({
    distance: z.number(),
  }).optional(),
  timeInForce: z.enum(['GTC', 'GTD', 'GFD', 'FOK', 'IOC']).optional(),
  positionFill: z.enum(['DEFAULT', 'OPEN_ONLY', 'REDUCE_FIRST', 'REDUCE_ONLY']).optional(),
  reason: z.string().optional(),
  clientExtensions: z.object({
    id: z.string().optional(),
    tag: z.string().optional(),
    comment: z.string().optional(),
  }).optional(),
});

export type OandaWebhookPayload = z.infer<typeof oandaWebhookSchema>;

export const ninjaTraderWebhookSchema = z.object({
  // Support for token in the payload
  token: z.string().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
  webhook_token: z.string().optional(),
  
  action: z.enum(['BUY', 'SELL', 'FLATTEN']),
  symbol: z.string(),
  quantity: z.number().or(z.string()),
  orderType: z.enum(['MARKET', 'LIMIT', 'STOP', 'STOP_LIMIT']).optional(),
  limitPrice: z.number().optional(),
  stopPrice: z.number().optional(),
  account: z.string().optional(),
  template: z.string().optional(),
  duration: z.enum(['DAY', 'GTC', 'GTD']).optional(),
  stopLoss: z.number().optional(),
  takeProfit: z.number().optional(),
  source: z.string().optional(),
  comment: z.string().optional(),
});

export type NinjaTraderWebhookPayload = z.infer<typeof ninjaTraderWebhookSchema>;

// Generic webhook payload that we'll parse based on broker type
export const genericWebhookSchema = z.object({
  // Support for token in the payload
  token: z.string().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
  webhook_token: z.string().optional(),
  
  broker: z.string().min(1, 'Broker is required').optional(),
  action: z.enum(['BUY', 'SELL', 'CLOSE', 'FLATTEN', 'ALERT']).optional(),
  symbol: z.string().optional(),
  price: z.number().optional(),
  message: z.string().optional(),
  payload: z.record(z.any()).optional(),
});

export type GenericWebhookPayload = z.infer<typeof genericWebhookSchema>;

// TradingView alert format
export const tradingViewAlertSchema = z.object({
  // Support for token in the payload
  token: z.string().optional(),
  api_key: z.string().optional(),
  apiKey: z.string().optional(),
  webhook_token: z.string().optional(),
  
  strategy: z.object({
    position_size: z.number().optional(),
    order_action: z.enum(['buy', 'sell']).optional(),
    order_contracts: z.number().optional(),
    order_price: z.number().optional(),
    order_id: z.string().optional(),
    market_position: z.enum(['flat', 'long', 'short']).optional(),
    market_position_size: z.number().optional(),
    prev_market_position: z.enum(['flat', 'long', 'short']).optional(),
    prev_market_position_size: z.number().optional(),
  }).optional(),
  ticker: z.string().optional(),
  time: z.string().optional(),
  exchange: z.string().optional(),
  price: z.number().optional(),
  volume: z.number().optional(),
  position: z.enum(['flat', 'long', 'short']).optional(),
  action: z.enum(['buy', 'sell']).optional(),
  quantity: z.number().optional(),
  comment: z.string().optional(),
});

export type TradingViewAlertPayload = z.infer<typeof tradingViewAlertSchema>;

// Response to webhook
export const webhookResponseSchema = z.object({
  success: z.boolean(),
  message: z.string().optional(),
  orderId: z.string().optional(),
  errors: z.array(z.string()).optional(),
  details: z.record(z.any()).optional(),
  responseTime: z.number().optional(), // Time taken to process the webhook in ms
});

export type WebhookResponse = z.infer<typeof webhookResponseSchema>;

// Webhook execution record for audit trail
export const webhookExecutionSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  userId: z.string(),
  broker: z.string().min(1, 'Broker is required'),
  brokerAccountId: z.string().optional(), // The specific broker account ID used
  payload: z.record(z.any()),
  result: z.object({
    success: z.boolean(),
    message: z.string().optional(),
    orderId: z.string().optional(),
    errors: z.array(z.string()).optional(),
    details: z.record(z.any()).optional(),
    executionStage: z.enum(['received', 'validated', 'processed', 'sent_to_broker', 'broker_confirmed', 'completed', 'failed']).optional(),
    positionInfo: z.object({
      symbol: z.string().optional(),
      entryPrice: z.number().optional(),
      quantity: z.number().optional(),
      side: z.string().optional(),
      stopLoss: z.number().optional(),
      takeProfit: z.number().optional(),
    }).optional(),
  }),
  timestamp: z.date(),
  responseTime: z.number().optional(), // milliseconds to process
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

export type WebhookExecution = z.infer<typeof webhookExecutionSchema>;

// Performance tracking models
export const webhookPerformanceMetricSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  responseTime: z.number(),
  success: z.boolean(),
  timestamp: z.date(),
  endpoint: z.string(),
  errorMessage: z.string().optional(),
});

export type WebhookPerformanceMetric = z.infer<typeof webhookPerformanceMetricSchema>;

// Error insights model
export const errorInsightSchema = z.object({
  id: z.string(),
  webhookId: z.string(),
  errorPattern: z.string(),
  suggestedFix: z.string(),
  severity: z.enum(['low', 'medium', 'high']),
  timestamp: z.date(),
  frequency: z.number(),
});

export type ErrorInsight = z.infer<typeof errorInsightSchema>;

// Latency heatmap data model
export const latencyHeatmapDataSchema = z.object({
  hour: z.number(),
  count: z.number(),
  totalResponseTime: z.number(),
  errors: z.number(),
  averageResponseTime: z.number(),
  errorRate: z.number(),
  intensity: z.number(),
  responseColor: z.string(),
});

export type LatencyHeatmapData = z.infer<typeof latencyHeatmapDataSchema>;