/**
 * Test environment variables and secrets
 * This script verifies that all required environment variables and secrets are properly set
 */

require('dotenv').config();

console.log('=== Environment Variables and Secrets Check ===');

// Function to check if a variable is set
function checkVariable(name, value) {
  if (value) {
    const maskedValue = value.length > 8 
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : '********';
    console.log(`✓ ${name} is set: ${maskedValue}`);
    return true;
  } else {
    console.log(`✗ ${name} is NOT set`);
    return false;
  }
}

// Check Alpaca API credentials
console.log('\nAlpaca API Credentials:');
const alpacaKeySet = checkVariable('ALPACA_API_KEY', process.env.ALPACA_API_KEY);
const alpacaSecretSet = checkVariable('ALPACA_API_SECRET', process.env.ALPACA_API_SECRET);

// Check OANDA API credentials
console.log('\nOANDA API Credentials:');
const oandaTokenSet = checkVariable('OANDA_API_TOKEN', process.env.OANDA_API_TOKEN);

// Check other critical environment variables
console.log('\nOther Critical Environment Variables:');
const databaseUrlSet = checkVariable('DATABASE_URL', process.env.DATABASE_URL);
const sessionSecretSet = checkVariable('SESSION_SECRET', process.env.SESSION_SECRET);
const whopApiKeySet = checkVariable('WHOP_API_KEY', process.env.WHOP_API_KEY);
const whopClientIdSet = checkVariable('WHOP_CLIENT_ID', process.env.WHOP_CLIENT_ID);
const whopClientSecretSet = checkVariable('WHOP_CLIENT_SECRET', process.env.WHOP_CLIENT_SECRET);

// Summary
console.log('\n=== Summary ===');
const totalVariables = 7;
const setVariables = [
  alpacaKeySet, alpacaSecretSet, oandaTokenSet,
  databaseUrlSet, sessionSecretSet, whopApiKeySet,
  whopClientIdSet, whopClientSecretSet
].filter(Boolean).length;

console.log(`${setVariables}/${totalVariables} environment variables are properly set.`);

if (setVariables < totalVariables) {
  console.log('\n⚠️ Warning: Some required environment variables are missing.');
  console.log('This may cause certain features of the platform to fail.');
  console.log('Please set the missing variables in your .env file or environment.');
} else {
  console.log('\n✅ All required environment variables are set.');
  console.log('The platform should be able to connect to all required services.');
}