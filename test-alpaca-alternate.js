// Test Alpaca connection with alternative endpoints
// Run with: node test-alpaca-alternate.js

import axios from 'axios';

// Direct API keys for testing - from what we've observed in the environment
const ALPACA_API_KEY = 'CK9MIT1E1KNQ0MPTT3EF';
const ALPACA_API_SECRET = 'A5ge9mB9eugJejr3gfHQvZPQukTbXk7g44qefWJ9';

// Test different Alpaca API endpoints
const endpoints = [
  'https://paper-api.alpaca.markets/v2', 
  'https://api.alpaca.markets/v2',
  'https://broker-api.alpaca.markets', 
  'https://broker-api.sandbox.alpaca.markets'
];

async function testEndpoint(baseUrl) {
  console.log(`\n----- Testing endpoint: ${baseUrl} -----`);
  
  try {
    const response = await axios.get(`${baseUrl}/account`, {
      headers: {
        'APCA-API-KEY-ID': ALPACA_API_KEY,
        'APCA-API-SECRET-KEY': ALPACA_API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SUCCESS! Status:', response.status);
    console.log('Account info:', response.data);
    return true;
  } catch (error) {
    console.log(`FAILED: ${error.message}`);
    if (error.response) {
      console.log(`Status: ${error.response.status}`);
      console.log(`Data: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

// Run tests for each endpoint
async function testAllEndpoints() {
  console.log('Testing Alpaca API with different endpoints');
  console.log(`Using API Key: ${ALPACA_API_KEY}`);
  
  for (const endpoint of endpoints) {
    await testEndpoint(endpoint);
  }
}

testAllEndpoints();