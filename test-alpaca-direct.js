// Test Alpaca connection directly with API keys
// Run with: node test-alpaca-direct.js

import axios from 'axios';

// Use environment variables for API keys
const ALPACA_API_KEY = process.env.ALPACA_API_KEY;
const ALPACA_API_SECRET = process.env.ALPACA_API_SECRET;

console.log('----- Testing Alpaca API Connection (Direct Keys) -----');
console.log(`Using API Key: ${ALPACA_API_KEY}`);

// Function to test connection
async function testAlpacaConnection() {
  try {
    const response = await axios.get('https://paper-api.alpaca.markets/v2/account', {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Connection successful!');
    console.log('Account Info:', response.data);
  } catch (error) {
    console.error('Error testing Alpaca API connection:');
    
    if (error.response) {
      // The request was made and the server responded with a status code outside of 2xx
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
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