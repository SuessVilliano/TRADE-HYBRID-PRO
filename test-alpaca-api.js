// Test script for Alpaca API connection
const axios = require('axios');

async function testAlpacaConnection() {
  try {
    console.log('Testing Alpaca API connection...');
    
    // Get API credentials from environment
    const apiKey = process.env.ALPACA_API_KEY;
    const apiSecret = process.env.ALPACA_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error('Error: Missing Alpaca API credentials in environment variables');
      console.log('Please set ALPACA_API_KEY and ALPACA_API_SECRET environment variables');
      return false;
    }
    
    console.log('Using API Key:', apiKey);
    // Don't log the full secret for security reasons
    console.log('Secret Key (first 4 chars):', apiSecret.substring(0, 4) + '...');
    
    // Test the account endpoint
    const response = await axios.get('https://paper-api.alpaca.markets/v2/account', {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    if (response.data && response.data.id) {
      console.log('Successfully connected to Alpaca API!');
      console.log('Account ID:', response.data.id);
      console.log('Account status:', response.data.status);
      console.log('Account equity:', response.data.equity);
      return true;
    } else {
      console.error('Error: Unexpected response format');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to Alpaca API:');
    
    if (error.response) {
      // The request was made, but the server responded with an error
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received. Check your network connection.');
    } else {
      // Something happened in setting up the request
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

async function testGetMarketData() {
  try {
    console.log('\nTesting market data retrieval...');
    
    const apiKey = process.env.ALPACA_API_KEY;
    const apiSecret = process.env.ALPACA_API_SECRET;
    
    if (!apiKey || !apiSecret) {
      console.error('Error: Missing Alpaca API credentials');
      return false;
    }
    
    // Test getting bars for AAPL
    const symbol = 'AAPL';
    const timeframe = '1Day';
    const limit = 5;
    
    const response = await axios.get('https://data.alpaca.markets/v2/stocks/bars', {
      params: {
        symbols: symbol,
        timeframe,
        limit
      },
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret
      }
    });
    
    if (response.data && response.data.bars && response.data.bars[symbol]) {
      console.log(`Successfully retrieved ${response.data.bars[symbol].length} bars for ${symbol}`);
      console.log('Latest bar:', response.data.bars[symbol][0]);
      return true;
    } else {
      console.error('Error: Unexpected response format for market data');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error retrieving market data:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    } else if (error.request) {
      console.error('No response received');
    } else {
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

async function runTests() {
  console.log('Starting Alpaca API tests...');
  
  const connectionResult = await testAlpacaConnection();
  if (connectionResult) {
    await testGetMarketData();
  }
  
  console.log('\nTests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
});