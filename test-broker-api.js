// Test script for broker connection API
// Run with: node test-broker-api.js

const axios = require('axios');

const API_BASE = 'http://localhost:5000/api/brokers';

async function testBrokerAPI() {
  try {
    console.log('----- Testing Broker API -----');
    
    // Get broker types
    console.log('\nFetching broker types...');
    const typesResponse = await axios.get(`${API_BASE}/broker-types`);
    console.log(`Got ${typesResponse.data.length} broker types:`, typesResponse.data);
    
    // Since this is just a test, you can uncomment these if you need to test with real broker credentials
    
    // // Create a broker connection
    // console.log('\nCreating broker connection...');
    // const createResponse = await axios.post(`${API_BASE}/connections`, {
    //   brokerTypeId: 1, // Use ID from broker types response
    //   name: 'My Test Binance',
    //   isDemo: true,
    //   apiKey: 'your-api-key',
    //   apiSecret: 'your-api-secret'
    // });
    // console.log('Connection created:', createResponse.data);
    // const connectionId = createResponse.data.id;
    
    // // Get broker connections
    // console.log('\nFetching broker connections...');
    // const connectionsResponse = await axios.get(`${API_BASE}/connections`);
    // console.log(`Got ${connectionsResponse.data.length} connections:`, connectionsResponse.data);
    
    // // Test broker connection
    // console.log('\nTesting broker connection...');
    // const testResponse = await axios.post(`${API_BASE}/connections/${connectionId}/test`);
    // console.log('Connection test result:', testResponse.data);
    
    // // Delete broker connection
    // console.log('\nDeleting broker connection...');
    // const deleteResponse = await axios.delete(`${API_BASE}/connections/${connectionId}`);
    // console.log('Connection deleted, status:', deleteResponse.status);
    
    console.log('\n----- Test completed successfully -----');
  } catch (error) {
    console.error('Error testing broker API:', error.response?.data || error.message);
  }
}

testBrokerAPI();