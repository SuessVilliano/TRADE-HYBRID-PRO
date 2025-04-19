/**
 * Client-side configuration from environment variables
 */
export const config = {
  // Alpaca Trading API credentials
  ALPACA_API_KEY: import.meta.env.VITE_ALPACA_API_KEY || '',
  ALPACA_API_SECRET: import.meta.env.VITE_ALPACA_API_SECRET || '',
  ALPACA_API_URL: import.meta.env.VITE_ALPACA_API_URL || 'https://paper-api.alpaca.markets/v2',
  
  // BrokerServices flags
  USE_MOCK_SERVICE: import.meta.env.VITE_USE_MOCK_SERVICE || 'true',
  
  // Feature flags
  ENABLE_AI_INSIGHTS: import.meta.env.VITE_ENABLE_AI_INSIGHTS !== 'false',
  ENABLE_REAL_TIME_SIGNALS: import.meta.env.VITE_ENABLE_REAL_TIME_SIGNALS !== 'false',
  
  // API endpoints
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || ''
};