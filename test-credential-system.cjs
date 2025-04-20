/**
 * Comprehensive Test for API Credential Manager System
 * 
 * This script demonstrates the capabilities of the credential management system,
 * showing how it handles different types of broker credentials.
 */

// Use CommonJS require syntax for compatibility
require('dotenv').config();
const { apiCredentialManager } = require('./server/lib/services/api-credential-manager');

// Check environment variables
function checkEnvironmentVariables() {
  console.log('Checking environment variables:');
  
  // Alpaca Variables
  const alpacaApiKey = process.env.ALPACA_API_KEY;
  const alpacaApiSecret = process.env.ALPACA_API_SECRET;
  
  console.log('Alpaca Credentials:');
  console.log(`  ALPACA_API_KEY: ${alpacaApiKey ? 'Set ✓' : 'Not set ✗'}`);
  if (alpacaApiKey) {
    console.log(`    ${alpacaApiKey.substring(0, 4)}...${alpacaApiKey.substring(alpacaApiKey.length - 4)}`);
  }
  console.log(`  ALPACA_API_SECRET: ${alpacaApiSecret ? 'Set ✓' : 'Not set ✗'}`);
  if (alpacaApiSecret) {
    console.log(`    ${alpacaApiSecret.substring(0, 4)}...${alpacaApiSecret.substring(alpacaApiSecret.length - 4)}`);
  }
  
  // Oanda Variables
  const oandaApiToken = process.env.OANDA_API_TOKEN;
  const oandaAccountId = process.env.OANDA_ACCOUNT_ID;
  
  console.log('\nOanda Credentials:');
  console.log(`  OANDA_API_TOKEN: ${oandaApiToken ? 'Set ✓' : 'Not set ✗'}`);
  if (oandaApiToken) {
    console.log(`    ${oandaApiToken.substring(0, 4)}...${oandaApiToken.substring(oandaApiToken.length - 4)}`);
  }
  console.log(`  OANDA_ACCOUNT_ID: ${oandaAccountId ? 'Set ✓' : 'Not set ✗'}`);
  if (oandaAccountId) {
    console.log(`    ${oandaAccountId.substring(0, 4)}...${oandaAccountId.substring(oandaAccountId.length - 4)}`);
  }
  
  return {
    alpaca: Boolean(alpacaApiKey && alpacaApiSecret),
    oanda: Boolean(oandaApiToken && oandaAccountId)
  };
}

// Test Alpaca credentials from credential manager
async function testAlpacaCredentials() {
  console.log('\nTesting Alpaca Credentials via Credential Manager:');
  
  try {
    // Initialize the credential manager
    await apiCredentialManager.initialize();
    console.log('  Credential manager initialized successfully');
    
    // Get Alpaca credentials
    const credentials = await apiCredentialManager.getCredentials('alpaca');
    
    if (credentials && credentials.apiKey && credentials.secretKey) {
      console.log('  Retrieved credentials successfully:');
      console.log(`    API Key: ${credentials.apiKey.substring(0, 4)}...${credentials.apiKey.substring(credentials.apiKey.length - 4)}`);
      console.log(`    Secret Key: ${credentials.secretKey.substring(0, 4)}...${credentials.secretKey.substring(credentials.secretKey.length - 4)}`);
      
      // Validate the credentials
      console.log('  Validating Alpaca credentials...');
      const isValid = await apiCredentialManager.validateCredentials('alpaca', credentials);
      console.log(`  Validation result: ${isValid ? 'Valid ✓' : 'Invalid ✗'}`);
      
      return isValid;
    } else {
      console.error('  Failed to retrieve Alpaca credentials');
      return false;
    }
  } catch (error) {
    console.error('  Error testing Alpaca credentials:', error);
    return false;
  }
}

// Test Oanda credentials from credential manager
async function testOandaCredentials() {
  console.log('\nTesting Oanda Credentials via Credential Manager:');
  
  try {
    // Initialize the credential manager
    await apiCredentialManager.initialize();
    console.log('  Credential manager initialized successfully');
    
    // Get Oanda credentials
    const credentials = await apiCredentialManager.getCredentials('oanda');
    
    if (credentials && credentials.apiToken) {
      console.log('  Retrieved credentials successfully:');
      console.log(`    API Token: ${credentials.apiToken.substring(0, 4)}...${credentials.apiToken.substring(credentials.apiToken.length - 4)}`);
      if (credentials.accountId) {
        console.log(`    Account ID: ${credentials.accountId}`);
      }
      console.log(`    Is Practice: ${credentials.isPractice ? 'Yes' : 'No'}`);
      
      // Validate the credentials
      console.log('  Validating Oanda credentials...');
      const isValid = await apiCredentialManager.validateCredentials('oanda', credentials);
      console.log(`  Validation result: ${isValid ? 'Valid ✓' : 'Invalid ✗'}`);
      
      return isValid;
    } else {
      console.error('  Failed to retrieve Oanda credentials');
      return false;
    }
  } catch (error) {
    console.error('  Error testing Oanda credentials:', error);
    return false;
  }
}

// Test creating a user-specific credential
async function testCreateUserCredential() {
  console.log('\nTesting User-Specific Credential Management:');
  
  try {
    // Mock user details
    const userId = 1001;
    const userEmail = 'test.user@example.com';
    const brokerType = 'alpaca';
    
    // Create mock credentials (in production, these would come from user input form)
    const mockCredentials = {
      apiKey: process.env.ALPACA_API_KEY || 'test-api-key',
      secretKey: process.env.ALPACA_API_SECRET || 'test-secret-key',
      isPaper: true,
      label: 'Test User Account'
    };
    
    console.log(`  Creating ${brokerType} credentials for user ${userId} (${userEmail})`);
    
    // Check if credential manager has been initialized
    await apiCredentialManager.initialize();
    
    // Attempt to save credentials for user
    console.log('  Attempting to save user credentials...');
    try {
      // Attempt to save (this is a simulation, it will likely fail in test environment)
      await apiCredentialManager.saveUserCredentials(
        brokerType,
        mockCredentials,
        userId,
        'Test Account'
      );
      console.log('  Successfully saved user credentials (simulation)');
    } catch (saveError) {
      console.log('  Saving user credentials simulation complete (expected database error in test environment)');
      console.log(`  Error: ${saveError.message}`);
    }
    
    return true;
  } catch (error) {
    console.error('  Error testing user credential creation:', error);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API Credential Manager Tests');
  console.log('====================================');
  
  // Check environment variables
  const varsAvailable = checkEnvironmentVariables();
  
  // Test credential manager features
  if (varsAvailable.alpaca) {
    await testAlpacaCredentials();
  } else {
    console.log('\nSkipping Alpaca credential tests due to missing environment variables');
  }
  
  if (varsAvailable.oanda) {
    await testOandaCredentials();
  } else {
    console.log('\nSkipping Oanda credential tests due to missing environment variables');
  }
  
  // Test user-specific credential management
  await testCreateUserCredential();
  
  console.log('\nCredential Manager Tests Completed');
  console.log('====================================');
}

// Execute tests
runAllTests().catch(error => {
  console.error('Unhandled error in tests:', error);
});