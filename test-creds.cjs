/**
 * Test Environment Credentials
 * This script checks if the environment variables for Alpaca are set correctly
 */

require('dotenv').config();

async function testAlpacaConnection() {
  console.log('Testing Alpaca Connection');
  
  // Check if the API credentials are set in the environment
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('Alpaca API credentials are not set in the environment');
    return false;
  }
  
  console.log(`Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  
  try {
    // Test connection to Alpaca API
    const response = await fetch('https://paper-api.alpaca.markets/v2/account', {
      method: 'GET',
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Successfully connected to Alpaca API');
      console.log('Account ID:', data.id);
      console.log('Account Status:', data.status);
      console.log('Buying Power:', data.buying_power);
      return true;
    } else {
      const errorText = await response.text();
      console.error(`Failed to connect to Alpaca API: ${response.status} - ${errorText}`);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to Alpaca API:', error.message);
    return false;
  }
}

async function runTests() {
  try {
    // Test environment variables
    console.log('Checking environment variables:');
    if (process.env.ALPACA_API_KEY) {
      console.log(`ALPACA_API_KEY is set: ${process.env.ALPACA_API_KEY.substring(0, 4)}...${process.env.ALPACA_API_KEY.substring(process.env.ALPACA_API_KEY.length - 4)}`);
    } else {
      console.log('ALPACA_API_KEY is not set');
    }
    
    if (process.env.ALPACA_API_SECRET) {
      console.log(`ALPACA_API_SECRET is set: ${process.env.ALPACA_API_SECRET.substring(0, 4)}...${process.env.ALPACA_API_SECRET.substring(process.env.ALPACA_API_SECRET.length - 4)}`);
    } else {
      console.log('ALPACA_API_SECRET is not set');
    }
    
    // Test Alpaca connection
    const alpacaSuccess = await testAlpacaConnection();
    
    console.log('\nTest Results:');
    console.log(`Alpaca Connection: ${alpacaSuccess ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    if (alpacaSuccess) {
      console.log('\nAll tests passed successfully!');
    } else {
      console.log('\nSome tests failed. Please check your credentials.');
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();