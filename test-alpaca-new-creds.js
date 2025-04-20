/**
 * Test Alpaca API connection using hard-coded new credentials
 */
import axios from 'axios';

async function testAlpacaConnection() {
  try {
    console.log('Testing Alpaca API connection with new credentials...');
    
    // Use the new credentials directly
    const apiKey = 'PKCBXRXBYIZ100B87CO0';
    const apiSecret = '4tZAchGqy3EWSdAycUeywGcjgaGsBOz9LNKnkOJL';
    const baseUrl = 'https://paper-api.alpaca.markets/v2';
    
    console.log(`Using API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
    
    // Make direct API call
    console.log('Fetching account information...');
    const accountResponse = await axios.get(`${baseUrl}/account`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });
    
    if (accountResponse.status === 200) {
      console.log('✅ Alpaca account access successful!');
      console.log('Account data:', JSON.stringify(accountResponse.data, null, 2));
    } else {
      throw new Error(`Unexpected status code: ${accountResponse.status}`);
    }
    
    // Get positions
    console.log('\nFetching positions...');
    const positionsResponse = await axios.get(`${baseUrl}/positions`, {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });
    
    if (positionsResponse.status === 200) {
      console.log('✅ Positions fetch successful!');
      console.log(`Found ${positionsResponse.data.length} positions.`);
      if (positionsResponse.data.length > 0) {
        console.log('First position:', JSON.stringify(positionsResponse.data[0], null, 2));
      }
    } else {
      throw new Error(`Unexpected status code: ${positionsResponse.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('❌ Error testing Alpaca connection:');
    
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      console.error(`Status: ${error.response.status}`);
      console.error('Response:', error.response.data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received from server');
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Error:', error.message);
    }
    
    return false;
  }
}

// Run the test
testAlpacaConnection()
  .then(success => {
    if (success) {
      console.log('\n✅ Alpaca API test completed successfully!');
    } else {
      console.log('\n❌ Alpaca API test failed.');
    }
  })
  .catch(err => {
    console.error('Unexpected error running test:', err);
  });