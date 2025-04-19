// Test script for broker connection API
// Run with: node test-broker-api.js

import axios from 'axios';

// Get environment variables from .env in browser context
const getEnvVar = (key) => {
  // First try from window.__ENV__ which is injected by the server
  if (typeof window !== 'undefined' && window.__ENV__ && window.__ENV__[key]) {
    return window.__ENV__[key];
  }
  
  // Then try from process.env which is available in Node.js
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  
  // Finally check for other browser environment variable patterns
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  
  return null;
};

const ALPACA_API_KEY = getEnvVar('ALPACA_API_KEY');
const ALPACA_API_SECRET = getEnvVar('ALPACA_API_SECRET');

const API_BASE = '/api/brokers';

async function testBrokerAPI() {
  try {
    console.log('----- Testing Broker API -----');
    
    // Get broker types
    console.log('\nFetching broker types...');
    const typesResponse = await axios.get(`${API_BASE}/broker-types`);
    console.log(`Got ${typesResponse.data.length} broker types:`, typesResponse.data);
    
    // Using real Alpaca credentials from environment variables
    console.log('\nTesting Alpaca API connection...');
    const alpacaTest = await axios.post(`${API_BASE}/test-connection`, {
      brokerTypeId: 'alpaca',
      credentials: {
        apiKey: process.env.ALPACA_API_KEY,
        secretKey: process.env.ALPACA_API_SECRET
      },
      isLiveTrading: false
    });
    console.log('Alpaca connection test result:', alpacaTest.data);
    
    // Get broker connections
    console.log('\nFetching broker connections...');
    const connectionsResponse = await axios.get(`${API_BASE}/connections`);
    console.log(`Got ${connectionsResponse.data.length} connections:`, connectionsResponse.data);
    
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