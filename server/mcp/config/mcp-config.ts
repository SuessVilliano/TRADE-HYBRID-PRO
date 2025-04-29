/**
 * MCP Server Configuration
 * 
 * This file contains configuration settings for the Message Control Plane (MCP) server.
 * The MCP server acts as a central hub for processing all trading signals, market data,
 * and user actions in the Trade Hybrid platform.
 */

export const MCPConfig = {
  // Core settings
  server: {
    enabled: true,
    port: 5050, // Internal port for MCP service
    maxConcurrentTasks: 100,
    logLevel: 'info',
  },
  
  // Queue settings
  queues: {
    signals: {
      name: 'trading-signals', 
      maxSize: 1000,
      processingInterval: 500, // ms
    },
    marketData: {
      name: 'market-data',
      maxSize: 5000, 
      processingInterval: 100, // ms
    },
    userActions: {
      name: 'user-actions',
      maxSize: 1000,
      processingInterval: 500, // ms
    },
    notifications: {
      name: 'notifications',
      maxSize: 2000,
      processingInterval: 200, // ms
    },
    tradeAnalysis: {
      name: 'trade-analysis',
      maxSize: 1000,
      processingInterval: 1000, // ms
    }
  },
  
  // Processor settings
  processors: {
    signals: {
      maxConcurrent: 10,
      timeout: 10000, // ms
    },
    marketData: {
      maxConcurrent: 20,
      timeout: 5000, // ms
    },
    userActions: {
      maxConcurrent: 15,
      timeout: 8000, // ms
    },
    notifications: {
      maxConcurrent: 10,
      timeout: 5000, // ms
    },
    tradeAnalysis: {
      maxConcurrent: 5,
      timeout: 30000, // ms
    }
  },
  
  // Integration settings
  integrations: {
    tradingView: {
      webhookPath: '/api/webhooks/tradingview',
      validSources: ['paradox', 'solaris', 'hybrid'],
    },
    ai: {
      enabled: true,
      analysisTimeout: 15000, // ms
    },
    brokers: {
      alpaca: {
        enabled: true,
        apiCheckInterval: 60000, // ms
      },
      webull: {
        enabled: true,
      },
      robinhood: {
        enabled: false, // Not implemented yet
      }
    }
  },
  
  // State persistence
  persistence: {
    signalStateInterval: 30000, // ms
    userStateInterval: 60000, // ms
    databaseSyncInterval: 120000, // ms
  }
};

// Message types processed by the MCP server
export enum MCPMessageType {
  // Signal-related messages
  NEW_SIGNAL = 'new_signal',
  UPDATE_SIGNAL = 'update_signal',
  SIGNAL_ANALYZED = 'signal_analyzed',
  
  // Market data messages
  PRICE_UPDATE = 'price_update',
  MARKET_STATS = 'market_stats',
  
  // User action messages
  USER_TRADE_ENTRY = 'user_trade_entry',
  USER_TRADE_EXIT = 'user_trade_exit',
  USER_SIGNAL_FEEDBACK = 'user_signal_feedback',
  
  // Notification messages
  SIGNAL_NOTIFICATION = 'signal_notification',
  TRADE_NOTIFICATION = 'trade_notification',
  SYSTEM_NOTIFICATION = 'system_notification',
  
  // Analysis messages
  TRADE_ANALYSIS_REQUEST = 'trade_analysis_request',
  TRADE_ANALYSIS_RESULT = 'trade_analysis_result',
  MARKET_ANALYSIS = 'market_analysis',
}

// Default priorities for message processing
export enum MCPPriority {
  HIGHEST = 0,
  HIGH = 1,
  MEDIUM = 2,
  LOW = 3,
  LOWEST = 4,
}