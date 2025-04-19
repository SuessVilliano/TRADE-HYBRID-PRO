// Client-side configuration
// This replaces direct use of process.env which is not available in the browser

// Access environment variables in browser context
const getEnvVar = (key: string): string => {
  // First try from import.meta.env which is available in Vite
  if (import.meta.env && import.meta.env[`VITE_${key}`]) {
    return import.meta.env[`VITE_${key}`];
  }
  
  // Then try from window.__ENV__ which could be injected by server
  if (typeof window !== 'undefined' && 
      window.__ENV__ && 
      window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  
  return '';
};

// Default configuration
export const config = {
  // Use API proxies instead of direct API keys in client code
  API_BASE_URL: '/api',
  NODE_ENV: import.meta.env.MODE || 'development',
  
  // API Keys - IMPORTANT: In a production environment, these should be empty
  // and all API calls should go through your backend server for security
  RAPIDAPI_KEY: getEnvVar('RAPIDAPI_KEY'),
  ALPACA_API_KEY: getEnvVar('ALPACA_API_KEY'),
  ALPACA_API_SECRET: getEnvVar('ALPACA_API_SECRET'),
  ALPACA_API_URL: 'https://paper-api.alpaca.markets',
  OANDA_API_TOKEN: getEnvVar('OANDA_API_TOKEN'),
  OANDA_ACCOUNT_ID: getEnvVar('OANDA_ACCOUNT_ID'),
  BINANCE_API_KEY: getEnvVar('BINANCE_API_KEY'),
  BINANCE_API_SECRET: getEnvVar('BINANCE_API_SECRET'),
  OPENAI_API_KEY: getEnvVar('OPENAI_API_KEY'),
  GEMINI_API_KEY: getEnvVar('GEMINI_API_KEY'),
  MORALIS_API_KEY: getEnvVar('MORALIS_API_KEY'),
  KRAKEN_API_KEY: getEnvVar('KRAKEN_API_KEY'),
  KRAKEN_PRIVATE_KEY: getEnvVar('KRAKEN_PRIVATE_KEY'),
  WHOP_API_KEY: getEnvVar('WHOP_API_KEY'),
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