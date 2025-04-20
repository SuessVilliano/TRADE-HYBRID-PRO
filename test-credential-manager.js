/**
 * Test Credential Manager and Alpaca Connection
 * This script tests the ApiCredentialManager and validates an Alpaca connection
 */

import dotenv from 'dotenv';
import { apiCredentialManager } from './server/lib/services/api-credential-manager.js';

dotenv.config();

async function testCredentialManager() {
  console.log('Testing API Credential Manager...');
  
  try {
    // Initialize credential manager
    await apiCredentialManager.initialize();
    console.log('Credential manager initialized successfully');
    
    // Test getting Alpaca credentials
    const alpacaCredentials = await apiCredentialManager.getCredentials('alpaca');
    
    if (alpacaCredentials && alpacaCredentials.apiKey && alpacaCredentials.secretKey) {
      console.log('Successfully retrieved Alpaca credentials:');
      console.log(`  API Key: ${alpacaCredentials.apiKey.substring(0, 4)}...${alpacaCredentials.apiKey.substring(alpacaCredentials.apiKey.length - 4)}`);
      console.log(`  Secret Key: ${alpacaCredentials.secretKey.substring(0, 4)}...${alpacaCredentials.secretKey.substring(alpacaCredentials.secretKey.length - 4)}`);
      
      // Validate the credentials
      console.log('Validating Alpaca credentials...');
      const isValid = await apiCredentialManager.validateCredentials('alpaca', alpacaCredentials);
      console.log(`Credentials valid: ${isValid}`);
      
      return isValid;
    } else {
      console.error('Failed to retrieve Alpaca credentials');
      return false;
    }
  } catch (error) {
    console.error('Error testing credential manager:', error);
    return false;
  }
}

async function runTests() {
  try {
    // Test environment variables
    console.log('Checking environment variables:');
    if (process.env.ALPACA_API_KEY) {
      console.log(`  ALPACA_API_KEY: ${process.env.ALPACA_API_KEY.substring(0, 4)}...${process.env.ALPACA_API_KEY.substring(process.env.ALPACA_API_KEY.length - 4)}`);
    } else {
      console.log('  ALPACA_API_KEY: Not set');
    }
    
    if (process.env.ALPACA_API_SECRET) {
      console.log(`  ALPACA_API_SECRET: ${process.env.ALPACA_API_SECRET.substring(0, 4)}...${process.env.ALPACA_API_SECRET.substring(process.env.ALPACA_API_SECRET.length - 4)}`);
    } else {
      console.log('  ALPACA_API_SECRET: Not set');
    }
    
    // Test credential manager
    const credentialManagerSuccess = await testCredentialManager();
    
    if (credentialManagerSuccess) {
      console.log('\nAll tests passed successfully!');
    } else {
      console.log('\nSome tests failed!');
    }
  } catch (error) {
    console.error('Error running tests:', error);
  }
}

// Run the tests
runTests();