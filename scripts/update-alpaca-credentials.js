#!/usr/bin/env node
/**
 * Update Alpaca API Credentials
 * 
 * This script updates the Alpaca API credentials in the .env file.
 * It can be run directly with: node scripts/update-alpaca-credentials.js
 * 
 * It will prompt for new API keys and then update the .env file.
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Define the path to the .env file
const envFilePath = path.resolve(process.cwd(), '.env');

/**
 * Prompt the user for input with a question
 * @param {string} question The question to ask
 * @returns {Promise<string>} The user's response
 */
function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Update or add an environment variable in the .env file
 * @param {string} key The environment variable name
 * @param {string} value The environment variable value
 */
function updateEnvVariable(envContent, key, value) {
  // Check if the key already exists in the file
  const regex = new RegExp(`^${key}=.*`, 'm');
  if (regex.test(envContent)) {
    // Replace existing value
    return envContent.replace(regex, `${key}=${value}`);
  } else {
    // Add new key-value pair
    return `${envContent}\n${key}=${value}`;
  }
}

/**
 * Main function to update Alpaca API credentials
 */
async function updateAlpacaCredentials() {
  try {
    console.log('🔑 Alpaca API Credentials Updater 🔑');
    console.log('==================================');
    console.log('\nThis script will update your Alpaca API credentials in the .env file.');
    console.log('You can obtain these credentials from your Alpaca dashboard at https://app.alpaca.markets/paper/dashboard/overview');
    console.log('\nIMPORTANT: For testing purposes, use your PAPER TRADING API keys, not live trading keys!');
    
    // Prompt for the API key and secret
    const apiKey = await prompt('\nEnter your Alpaca API Key: ');
    const apiSecret = await prompt('Enter your Alpaca API Secret: ');
    
    // Validate inputs
    if (!apiKey || !apiSecret) {
      console.error('\n❌ Error: API Key and Secret are required.');
      process.exit(1);
    }
    
    // Read the current .env file
    let envContent = '';
    try {
      envContent = fs.readFileSync(envFilePath, 'utf8');
    } catch (err) {
      // File doesn't exist, create an empty one
      console.log('\n⚠️ .env file not found, creating a new one.');
      envContent = '';
    }
    
    // Update the environment variables
    envContent = updateEnvVariable(envContent, 'ALPACA_API_KEY', apiKey);
    envContent = updateEnvVariable(envContent, 'ALPACA_API_SECRET', apiSecret);
    
    // Write the updated content back to the .env file
    fs.writeFileSync(envFilePath, envContent);
    
    console.log('\n✅ Alpaca API credentials updated successfully!');
    console.log('\nTo test your connection, run: node test-alpaca-env.js');
    
  } catch (error) {
    console.error('\n❌ Error updating credentials:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

// Run the main function
updateAlpacaCredentials();