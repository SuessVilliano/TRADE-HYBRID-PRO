// Test script for Oanda API connection
import axios from 'axios';

async function testOandaConnection() {
  try {
    console.log('Testing Oanda API connection...');
    
    // Get API token from environment
    const apiToken = process.env.OANDA_API_TOKEN;
    
    if (!apiToken) {
      console.error('Error: Missing Oanda API token in environment variables');
      console.log('Please set OANDA_API_TOKEN environment variable');
      return false;
    }
    
    console.log('Using API Token (first 4 chars):', apiToken.substring(0, 4) + '...');
    
    // Test the accounts endpoint
    const response = await axios.get('https://api-fxpractice.oanda.com/v3/accounts', {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.accounts && response.data.accounts.length > 0) {
      console.log('Successfully connected to Oanda API!');
      console.log('Found', response.data.accounts.length, 'accounts');
      console.log('Account IDs:', response.data.accounts.map(acc => acc.id).join(', '));
      
      // Save the first account ID for later tests
      const accountId = response.data.accounts[0].id;
      console.log('Using account ID:', accountId);
      
      return accountId;
    } else {
      console.error('Error: Unexpected response format or no accounts found');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error connecting to Oanda API:');
    
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('Headers:', error.response.headers);
    } else if (error.request) {
      console.error('No response received. Check your network connection.');
    } else {
      console.error('Error message:', error.message);
    }
    
    return false;
  }
}

async function testGetAccountSummary(accountId) {
  try {
    console.log('\nTesting account summary retrieval...');
    
    const apiToken = process.env.OANDA_API_TOKEN;
    
    if (!apiToken) {
      console.error('Error: Missing Oanda API token');
      return false;
    }
    
    const response = await axios.get(`https://api-fxpractice.oanda.com/v3/accounts/${accountId}/summary`, {
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.account) {
      console.log('Successfully retrieved account summary');
      console.log('Account currency:', response.data.account.currency);
      console.log('Balance:', response.data.account.balance);
      console.log('Margin available:', response.data.account.marginAvailable);
      return true;
    } else {
      console.error('Error: Unexpected response format for account summary');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error retrieving account summary:');
    
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

async function testGetCandles() {
  try {
    console.log('\nTesting candles retrieval...');
    
    const apiToken = process.env.OANDA_API_TOKEN;
    
    if (!apiToken) {
      console.error('Error: Missing Oanda API token');
      return false;
    }
    
    // Test getting candles for EUR_USD
    const instrument = 'EUR_USD';
    const granularity = 'H1'; // 1-hour candles
    const count = 5;
    
    const response = await axios.get(`https://api-fxpractice.oanda.com/v3/instruments/${instrument}/candles`, {
      params: {
        granularity,
        count,
        price: 'M' // Midpoint price
      },
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (response.data && response.data.candles && response.data.candles.length > 0) {
      console.log(`Successfully retrieved ${response.data.candles.length} candles for ${instrument}`);
      console.log('Latest candle:', {
        time: response.data.candles[0].time,
        open: response.data.candles[0].mid.o,
        high: response.data.candles[0].mid.h,
        low: response.data.candles[0].mid.l,
        close: response.data.candles[0].mid.c,
        complete: response.data.candles[0].complete
      });
      return true;
    } else {
      console.error('Error: Unexpected response format for candles');
      console.log('Response:', response.data);
      return false;
    }
  } catch (error) {
    console.error('Error retrieving candles:');
    
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
  console.log('Starting Oanda API tests...');
  
  const accountId = await testOandaConnection();
  if (accountId) {
    await testGetAccountSummary(accountId);
    await testGetCandles();
  }
  
  console.log('\nTests completed');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error in tests:', error);
});