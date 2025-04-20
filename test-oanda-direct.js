// Direct Oanda API test script to diagnose connection issues
import axios from 'axios';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function testEndpoints() {
  // Get credentials from environment
  const apiToken = process.env.OANDA_API_TOKEN;
  const accountId = process.env.OANDA_ACCOUNT_ID;
  
  console.log('OANDA ENV VARIABLES:');
  console.log('- OANDA_API_TOKEN:', apiToken ? `${apiToken.substring(0, 4)}...${apiToken.substring(apiToken.length - 4)}` : 'Not set');
  console.log('- OANDA_ACCOUNT_ID:', accountId || 'Not set');
  
  if (!apiToken) {
    console.error('ERROR: OANDA_API_TOKEN is not set');
    return;
  }
  
  // Try the v3/accounts endpoint (list all accounts)
  try {
    console.log('\n1. Testing /v3/accounts endpoint...');
    const response = await axios.get('https://api-fxpractice.oanda.com/v3/accounts', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SUCCESS! Accounts endpoint response:');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('FAILED! Error with accounts endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
  
  // If account ID is provided, test specific account endpoints
  if (accountId) {
    try {
      console.log(`\n2. Testing /v3/accounts/${accountId} endpoint...`);
      const response = await axios.get(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('SUCCESS! Account details response:');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error(`FAILED! Error with account ${accountId} endpoint:`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
    
    try {
      console.log(`\n3. Testing /v3/accounts/${accountId}/summary endpoint...`);
      const response = await axios.get(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/summary`, {
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('SUCCESS! Account summary response:');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error(`FAILED! Error with account ${accountId} summary endpoint:`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Response:', JSON.stringify(error.response.data, null, 2));
      } else {
        console.error(error.message);
      }
    }
  } else {
    console.log('\nSkipping account-specific tests since OANDA_ACCOUNT_ID is not set');
  }
  
  // Test instruments endpoint (doesn't require account ID)
  try {
    console.log('\n4. Testing /v3/instruments/EUR_USD/candles endpoint...');
    const response = await axios.get('https://api-fxpractice.oanda.com/v3/instruments/EUR_USD/candles', {
      params: {
        count: 5,
        granularity: 'H1'
      },
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('SUCCESS! Candles endpoint response:');
    console.log(`Retrieved ${response.data.candles.length} candles`);
    console.log('First candle:', response.data.candles[0]);
  } catch (error) {
    console.error('FAILED! Error with instruments endpoint:');
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else {
      console.error(error.message);
    }
  }
}

// Run the tests
console.log('Starting Oanda API direct tests...');
testEndpoints().catch(error => {
  console.error('Unhandled error in tests:', error);
}).finally(() => {
  console.log('\nTests completed');
});