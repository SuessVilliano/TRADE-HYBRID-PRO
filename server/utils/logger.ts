/**
 * Simple logging utility for server-side operations
 */

// Map of colors for different log types
const colors = {
  info: '\x1b[36m', // Cyan
  error: '\x1b[31m', // Red
  warning: '\x1b[33m', // Yellow
  success: '\x1b[32m', // Green
  debug: '\x1b[35m', // Magenta
  reset: '\x1b[0m', // Reset
};

// Map of category colors
const categoryColors: Record<string, string> = {
  'signal-updater': '\x1b[36m', // Cyan
  'tradingview': '\x1b[35m', // Magenta
  'webhook': '\x1b[33m', // Yellow
  'db': '\x1b[34m', // Blue
  'auth': '\x1b[32m', // Green
  'ws': '\x1b[36m', // Cyan
  'api': '\x1b[35m', // Magenta
  'multiplayer': '\x1b[33m', // Yellow
};

/**
 * Log a message with timestamp, optional category, and formatting
 */
export function log(message: string, category?: string, type: 'info' | 'error' | 'warning' | 'success' | 'debug' = 'info'): void {
  const timestamp = new Date().toLocaleTimeString();
  const categoryColor = category ? (categoryColors[category] || colors.info) : colors.info;
  const typeColor = colors[type];
  
  // Format: [timestamp] [category] message
  const categoryTag = category ? ` [${categoryColor}${category}${colors.reset}]` : '';
  
  console.log(`${colors.info}${timestamp}${colors.reset}${categoryTag} ${typeColor}${message}${colors.reset}`);
}

/**
 * Log an error with stack trace
 */
export function logError(error: Error | string, category?: string): void {
  const errorMessage = error instanceof Error ? error.message : error;
  const stack = error instanceof Error ? error.stack : '';
  
  log(`Error: ${errorMessage}`, category, 'error');
  
  if (stack) {
    console.log(`${colors.error}${stack}${colors.reset}`);
  }
}

/**
 * Log a warning message
 */
export function logWarning(message: string, category?: string): void {
  log(message, category, 'warning');
}

/**
 * Log a success message
 */
export function logSuccess(message: string, category?: string): void {
  log(message, category, 'success');
}

/**
 * Log a debug message (only in non-production)
 */
export function logDebug(message: string, category?: string): void {
  if (process.env.NODE_ENV !== 'production') {
    log(message, category, 'debug');
  }
}