/**
 * Update Alpaca API credentials
 * This script updates the Alpaca API credentials in the .env file
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Get API key and secret from environment or command line
const apiKey = process.env.ALPACA_API_KEY || process.argv[2];
const apiSecret = process.env.ALPACA_API_SECRET || process.argv[3];

if (!apiKey || !apiSecret) {
  console.error('Error: ALPACA_API_KEY and ALPACA_API_SECRET are required');
  console.error('Usage: node scripts/update-alpaca-credentials.js <apiKey> <apiSecret>');
  process.exit(1);
}

console.log('Updating Alpaca API credentials...');
console.log(`API Key: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`API Secret: ${apiSecret.substring(0, 4)}...${apiSecret.substring(apiSecret.length - 4)}`);

// Read the .env file
const envPath = path.resolve('.env');
let envContent = '';

try {
  envContent = fs.readFileSync(envPath, 'utf8');
} catch (error) {
  console.error('Error reading .env file:', error.message);
  // Create .env file if it doesn't exist
  envContent = '';
}

// Update ALPACA_API_KEY and ALPACA_API_SECRET in .env content
const alpacaKeyRegex = /^ALPACA_API_KEY=.*$/m;
const alpacaSecretRegex = /^ALPACA_API_SECRET=.*$/m;

if (alpacaKeyRegex.test(envContent)) {
  // Update existing value
  envContent = envContent.replace(alpacaKeyRegex, `ALPACA_API_KEY=${apiKey}`);
} else {
  // Add new value
  envContent += `\nALPACA_API_KEY=${apiKey}`;
}

if (alpacaSecretRegex.test(envContent)) {
  // Update existing value
  envContent = envContent.replace(alpacaSecretRegex, `ALPACA_API_SECRET=${apiSecret}`);
} else {
  // Add new value
  envContent += `\nALPACA_API_SECRET=${apiSecret}`;
}

// Write updated content back to .env file
try {
  fs.writeFileSync(envPath, envContent.trim() + '\n');
  console.log('Successfully updated Alpaca API credentials in .env file');
} catch (error) {
  console.error('Error writing to .env file:', error.message);
  process.exit(1);
}

// Optionally, test the connection
console.log('Testing Alpaca API connection with updated credentials...');
const axios = require('axios');

async function testAlpacaConnection() {
  try {
    const response = await axios.get('https://paper-api.alpaca.markets/v2/account', {
      headers: {
        'APCA-API-KEY-ID': apiKey,
        'APCA-API-SECRET-KEY': apiSecret,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Successfully connected to Alpaca API!');
    console.log('Account details:', response.data);
    return true;
  } catch (error) {
    console.error('Error connecting to Alpaca API:', error.response?.data || error.message);
    if (error.response?.status === 403) {
      console.error('\nAuthentication failed (403 Forbidden). Please check your API credentials.');
      console.error('Make sure you are using valid Alpaca API credentials with correct permissions.');
    }
    return false;
  }
}

testAlpacaConnection().then(success => {
  if (success) {
    console.log('Alpaca API credentials validation completed successfully');
    process.exit(0);
  } else {
    console.error('Alpaca API credentials validation failed');
    process.exit(1);
  }
});