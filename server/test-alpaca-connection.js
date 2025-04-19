// Test Alpaca connection with environment variables
// Run with: node server/test-alpaca-connection.js

import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

// Directly use environment variables
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

// Log partial API key for verification (only first few chars for security)
console.log(`Using Alpaca API Key: ${ALPACA_API_KEY ? ALPACA_API_KEY.substring(0, 4) + '...' : 'Not found'}`);

async function testAlpacaConnection() {
  try {
    console.log('----- Testing Alpaca API Connection -----');
    
    const response = await axios.get('https://paper-api.alpaca.markets/v2/account', {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Connection successful!');
    console.log('Account Info:', response.data);
    
    // Test getting positions
    const positionsResponse = await axios.get('https://paper-api.alpaca.markets/v2/positions', {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`\nFound ${positionsResponse.data.length} positions:`);
    console.log(JSON.stringify(positionsResponse.data, null, 2));
    
    console.log('\n----- Test completed successfully -----');
  } catch (error) {
    console.error('Error testing Alpaca API connection:');
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
      console.error('Response headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error message:', error.message);
    }
  }
}

testAlpacaConnection();