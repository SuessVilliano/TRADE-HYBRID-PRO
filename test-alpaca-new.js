// Test Alpaca connection with new API keys
// Run with: node test-alpaca-new.js

import axios from 'axios';

// Trading API credentials
const TRADING_API_KEY = 'PKH1RFA0B72F95TV74EK';
const TRADING_API_SECRET = ''; // Need to get the secret
const TRADING_API_URL = 'https://paper-api.alpaca.markets/v2';

// Broker API credentials
const BROKER_API_KEY = 'CKZRFEB3B6C04EDQAJH0';
const BROKER_API_SECRET = 'h5MJ9cmBPSC9aGBzcRkEExZu0r4mgIq3SHy86kQ1';
const BROKER_API_URL = 'https://broker-api.sandbox.alpaca.markets';

async function testTradingAPI() {
  console.log('\n----- Testing Alpaca Trading API -----');
  console.log(`Endpoint: ${TRADING_API_URL}`);
  console.log(`API Key: ${TRADING_API_KEY}`);
  
  try {
    const response = await axios.get(`${TRADING_API_URL}/account`, {
      headers: {
        'APCA-API-KEY-ID': TRADING_API_KEY,
        'APCA-API-SECRET-KEY': TRADING_API_SECRET,
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

async function testBrokerAPI() {
  console.log('\n----- Testing Alpaca Broker API -----');
  console.log(`Endpoint: ${BROKER_API_URL}`);
  console.log(`API Key: ${BROKER_API_KEY}`);
  
  try {
    // For broker API, we'll test a different endpoint
    const response = await axios.get(`${BROKER_API_URL}/v1/accounts`, {
      headers: {
        'APCA-API-KEY-ID': BROKER_API_KEY,
        'APCA-API-SECRET-KEY': BROKER_API_SECRET,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SUCCESS! Status:', response.status);
    console.log('Response data:', response.data);
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

// Run both tests
async function runTests() {
  await testTradingAPI();
  await testBrokerAPI();
}

runTests();