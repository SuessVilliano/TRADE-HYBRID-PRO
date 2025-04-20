#!/usr/bin/env node
/**
 * Test Alpaca API connection using environment variables
 * This script tests connection to the Alpaca API using ALPACA_API_KEY and ALPACA_API_SECRET
 * environment variables.
 * 
 * ES Module compatible version
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '.env') });

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

// API credentials - using the new values directly for testing
// In production, these would always come from environment variables
const apiKey = "PKCBXRXBYIZ100B87CO0";
const apiSecret = "4tZAchGqy3EWSdAycUeywGcjgaGsBOz9LNKnkOJL";
const apiUrl = 'https://paper-api.alpaca.markets/v2';

console.log(colors.blue, `=== Alpaca API Connection Test ===`, colors.reset);
console.log(`API Key: ${apiKey ? `${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}` : 'Not found'}`);
console.log(`API Secret: ${apiSecret ? `${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}` : 'Not found'}`);
console.log(`API URL: ${apiUrl}`);
console.log('-'.repeat(40));

/**
 * Test Alpaca API connection
 */
async function testAlpacaConnection() {
  try {
    console.log(colors.cyan, `Testing connection to Alpaca API...`, colors.reset);
    
    const response = await axios.get(`${apiUrl}/account`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });

    console.log(colors.green, `✓ Successfully connected to Alpaca API!`, colors.reset);
    console.log(`Account ID: ${response.data.id}`);
    console.log(`Account Status: ${response.data.status}`);
    console.log(`Account Equity: ${response.data.equity}`);
    console.log(`Buying Power: ${response.data.buying_power}`);
    return true;
  } catch (error) {
    console.log(colors.red, `✗ Failed to connect to Alpaca API!`, colors.reset);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log(`Error:`, error.message);
    }
    
    return false;
  }
}

/**
 * Test getting market data
 */
async function testGetMarketData() {
  try {
    console.log(colors.cyan, `\nTesting market data access...`, colors.reset);
    
    const symbol = 'AAPL';
    const response = await axios.get(`${apiUrl}/stocks/${symbol}/quotes/latest`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });

    console.log(colors.green, `✓ Successfully retrieved ${symbol} quote!`, colors.reset);
    console.log(`Ask Price: ${response.data.quote.ap}`);
    console.log(`Bid Price: ${response.data.quote.bp}`);
    console.log(`Last Price: ${response.data.quote.t}`);
    return true;
  } catch (error) {
    console.log(colors.red, `✗ Failed to get market data!`, colors.reset);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log(`Error:`, error.message);
    }
    
    return false;
  }
}

/**
 * Test getting positions
 */
async function testGetPositions() {
  try {
    console.log(colors.cyan, `\nTesting positions access...`, colors.reset);
    
    const response = await axios.get(`${apiUrl}/positions`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });

    console.log(colors.green, `✓ Successfully retrieved positions!`, colors.reset);
    console.log(`Number of positions: ${response.data.length}`);
    
    if (response.data.length > 0) {
      console.log(`First position: ${response.data[0].symbol} - ${response.data[0].qty} shares`);
    } else {
      console.log(`No positions currently held.`);
    }
    
    return true;
  } catch (error) {
    console.log(colors.red, `✗ Failed to get positions!`, colors.reset);
    
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data:`, error.response.data);
    } else {
      console.log(`Error:`, error.message);
    }
    
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  if (!apiKey || !apiSecret) {
    console.log(colors.red, `✗ API credentials not found! Please set ALPACA_API_KEY and ALPACA_API_SECRET environment variables.`, colors.reset);
    return;
  }

  try {
    const connectionSuccess = await testAlpacaConnection();
    
    if (connectionSuccess) {
      await testGetMarketData();
      await testGetPositions();
      
      console.log(colors.green, `\n✓ All tests completed!`, colors.reset);
    }
  } catch (error) {
    console.log(colors.red, `\n✗ Error running tests:`, error.message, colors.reset);
  }
}

// Run the tests
runTests();