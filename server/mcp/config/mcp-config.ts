/**
 * MCP Configuration
 * 
 * Configuration settings for the Message Control Plane
 */

/**
 * Message types for the MCP system
 */
export enum MCPMessageType {
  NEW_SIGNAL = 'new_signal',
  SIGNAL_UPDATE = 'signal_update',
  NOTIFICATION = 'notification',
  SYSTEM_EVENT = 'system_event',
  USER_ACTION = 'user_action',
  ANALYTICS_EVENT = 'analytics_event'
}

/**
 * MCP System Configuration
 */
export const MCPConfig = {
  queues: {
    signals: {
      name: 'signals',
      maxSize: 5000, // Maximum queue size
      processInterval: 100 // Process interval in ms
    },
    notifications: {
      name: 'notifications',
      maxSize: 1000,
      processInterval: 100
    },
    tasks: {
      name: 'tasks',
      maxSize: 500,
      processInterval: 500
    }
  },
  integrations: {
    tradingView: {
      webhookPath: '/api/webhooks/tradingview/:token',
      allowedProviders: ['Hybrid', 'Solaris', 'Paradox', 'TradingView']
    },
    brokers: {
      alpaca: {
        name: 'alpaca',
        apiConfig: {
          // Config loaded from environment variables
        }
      }
    }
  },
  persistence: {
    saveInterval: 5 * 60 * 1000, // Save state every 5 minutes
    syncInterval: 30 * 60 * 1000 // Sync with database every 30 minutes
  }
};