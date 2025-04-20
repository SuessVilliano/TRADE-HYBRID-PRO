/**
 * Test Alpaca API connection directly using Node.js fetch API
 * This script tests different endpoints and credential combinations
 */

import dotenv from 'dotenv';
dotenv.config();

async function testAlpacaConnection() {
  console.log('Testing Alpaca API Connection Directly');
  
  // Get credentials from environment variables
  const apiKey = process.env.ALPACA_API_KEY;
  const apiSecret = process.env.ALPACA_API_SECRET;
  
  if (!apiKey || !apiSecret) {
    console.error('Alpaca API credentials not found in environment variables');
    return false;
  }
  
  console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
  console.log(`API Secret: ${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`);
  
  // Test different endpoints and environments
  const environments = [
    { 
      name: 'Paper Trading API',
      baseUrl: 'https://paper-api.alpaca.markets'
    },
    { 
      name: 'Live Trading API',
      baseUrl: 'https://api.alpaca.markets'
    },
    { 
      name: 'Data API',
      baseUrl: 'https://data.alpaca.markets'
    },
    { 
      name: 'Broker API',
      baseUrl: 'https://broker-api.alpaca.markets'
    }
  ];
  
  const endpoints = [
    {
      path: '/v2/account',
      description: 'Account Information'
    },
    {
      path: '/v2/positions',
      description: 'Open Positions'
    },
    {
      path: '/v2/orders',
      description: 'Orders'
    },
    {
      path: '/v1/trading/accounts',
      description: 'Broker API Trading Accounts (broker api only)'
    }
  ];
  
  let successCount = 0;
  let totalAttempts = 0;
  
  // Test each combination of environment and endpoint
  for (const env of environments) {
    console.log(`\nTesting ${env.name} (${env.baseUrl}):`);
    
    for (const endpoint of endpoints) {
      // Skip broker-specific endpoints for non-broker environments
      if (endpoint.path.includes('/v1/trading/accounts') && !env.baseUrl.includes('broker-api')) {
        continue;
      }
      
      totalAttempts++;
      const url = `${env.baseUrl}${endpoint.path}`;
      console.log(`\n  Testing endpoint: ${endpoint.description} (${url})`);
      
      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'APCA-API-KEY-ID': apiKey,
            'APCA-API-SECRET-KEY': apiSecret,
            'Content-Type': 'application/json'
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log(`  ✅ Success! Status: ${response.status}`);
          console.log(`  Response data sample:`, JSON.stringify(data).substring(0, 150) + '...');
          successCount++;
        } else {
          const errorText = await response.text();
          console.error(`  ❌ Error: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error(`  ❌ Fetch error:`, error.message);
      }
    }
  }
  
  console.log(`\nTest Results: ${successCount} successful endpoints out of ${totalAttempts} attempts`);
  return successCount > 0;
}

// Run the test
testAlpacaConnection().then(success => {
  console.log(`\nOverall test ${success ? 'passed ✅' : 'failed ❌'}`);
});