/**
 * Test Alpaca API connection using environment variables
 * This script tests connection to the Alpaca API using ALPACA_API_KEY and ALPACA_API_SECRET
 * environment variables.
 */

const axios = require('axios');
require('dotenv').config();

// Check if API key and secret are available in environment variables
const apiKey = process.env.ALPACA_API_KEY;
const apiSecret = process.env.ALPACA_API_SECRET;

// Base URLs for Alpaca API (paper trading)
const baseUrl = 'https://paper-api.alpaca.markets/v2';
const dataBaseUrl = 'https://data.alpaca.markets/v2';

/**
 * Test Alpaca API connection
 */
async function testAlpacaConnection() {
  try {
    console.log('Testing Alpaca API connection with environment variables...');
    
    if (!apiKey || !apiSecret) {
      console.error('Error: ALPACA_API_KEY and/or ALPACA_API_SECRET environment variables are not set');
      return false;
    }
    
    console.log(`Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Test account endpoint
    const response = await axios.get(`${baseUrl}/account`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    console.log('Successfully connected to Alpaca API!');
    console.log('Account details:', response.data);
    return true;
  } catch (error) {
    console.error('Error connecting to Alpaca API:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting market data
 */
async function testGetMarketData() {
  try {
    console.log('\nTesting Alpaca market data API...');
    
    // Test stocks bars endpoint for AAPL
    const response = await axios.get(`${dataBaseUrl}/stocks/AAPL/bars`, {
      params: {
        timeframe: '1Day',
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
        end: new Date().toISOString(),
        limit: 10
      },
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    console.log('Successfully retrieved market data!');
    console.log('AAPL bars data:', response.data);
    return true;
  } catch (error) {
    console.error('Error getting market data:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Test getting positions
 */
async function testGetPositions() {
  try {
    console.log('\nTesting Alpaca positions API...');
    
    const response = await axios.get(`${baseUrl}/positions`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    console.log('Successfully retrieved positions!');
    console.log('Positions:', response.data);
    return true;
  } catch (error) {
    console.error('Error getting positions:', error.response?.data || error.message);
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  try {
    // Test connection
    const connectionSuccess = await testAlpacaConnection();
    if (!connectionSuccess) {
      console.error('Failed to connect to Alpaca API');
      return;
    }
    
    // Test market data (if connection was successful)
    await testGetMarketData();
    
    // Test positions (if connection was successful)
    await testGetPositions();
    
    console.log('\nAll tests completed!');
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run all tests
runTests();