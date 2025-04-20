#!/usr/bin/env node
/**
 * Reset Alpaca Service
 * 
 * This script calls the reset function in the Alpaca service to ensure it
 * picks up the latest credentials from the environment variables.
 */

import { resetAlpacaClient, getAlpacaClient, checkAlpacaConnection } from '../server/services/alpaca-service.js';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Set console colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Get current file directory path (ES module compatible)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Display the current Alpaca API settings
console.log(colors.blue, '=== Alpaca API Settings ===', colors.reset);
console.log(`ALPACA_API_KEY: ${process.env.ALPACA_API_KEY ? `${process.env.ALPACA_API_KEY.substring(0, 4)}...${process.env.ALPACA_API_KEY.substring(process.env.ALPACA_API_KEY.length - 4)}` : 'Not set'}`);
console.log(`ALPACA_API_SECRET: ${process.env.ALPACA_API_SECRET ? `${process.env.ALPACA_API_SECRET.substring(0, 4)}...${process.env.ALPACA_API_SECRET.substring(process.env.ALPACA_API_SECRET.length - 4)}` : 'Not set'}`);
console.log(`ALPACA_API_URL: ${process.env.ALPACA_API_URL || 'Not set (using default)'}`);
console.log('-'.repeat(40));

async function main() {
  try {
    // Reset the Alpaca client to force it to use the new credentials
    console.log(colors.cyan, 'Resetting Alpaca client...', colors.reset);
    resetAlpacaClient();
    console.log(colors.green, '✓ Alpaca client reset successfully', colors.reset);
    
    // Force it to create a new client with the latest credentials
    console.log(colors.cyan, 'Initializing Alpaca client with new credentials...', colors.reset);
    getAlpacaClient(true); // true = force real API usage
    console.log(colors.green, '✓ Alpaca client initialized with new credentials', colors.reset);
    
    // Test the connection
    console.log(colors.cyan, 'Testing Alpaca API connection...', colors.reset);
    const connected = await checkAlpacaConnection();
    
    if (connected) {
      console.log(colors.green, '✓ Connection test successful!', colors.reset);
      console.log('\nThe Alpaca service is now using the updated credentials.');
      console.log('You should restart the server for the changes to take effect in the running application.');
    } else {
      console.log(colors.red, '✗ Connection test failed!', colors.reset);
      console.log('\nPlease check your credentials and try again.');
    }
  } catch (error) {
    console.error(colors.red, '✗ Error:', error.message, colors.reset);
  }
}

main();