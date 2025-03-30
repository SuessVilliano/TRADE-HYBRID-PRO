// Client-side configuration
// This replaces direct use of process.env which is not available in the browser

// Default configuration
export const config = {
  // Use API proxies instead of direct API keys in client code
  API_BASE_URL: '/api',
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API Keys - IMPORTANT: In a production environment, these should be empty
  // and all API calls should go through your backend server for security
  RAPIDAPI_KEY: '',
  ALPACA_API_KEY: '',
  ALPACA_API_SECRET: '',
  OANDA_API_TOKEN: '',
  OANDA_ACCOUNT_ID: '',
  BINANCE_API_KEY: '',
  BINANCE_API_SECRET: '',
  OPENAI_API_KEY: '',
  GEMINI_API_KEY: '',
  MORALIS_API_KEY: '',
  KRAKEN_API_KEY: '',
  KRAKEN_PRIVATE_KEY: '',
  WHOP_API_KEY: 'ydROZr0J1kv7LZyMGepujMx7vNrZIC-chXf7lBWIJXE',
};

// Add any frontend environment variables from Vite
// These will be injected during build time
if (import.meta.env.VITE_NODE_ENV) {
  config.NODE_ENV = import.meta.env.VITE_NODE_ENV;
}

// Helper functions for accessing config
export function isProduction(): boolean {
  return config.NODE_ENV === 'production';
}

export function isDevelopment(): boolean {
  return config.NODE_ENV === 'development';
}