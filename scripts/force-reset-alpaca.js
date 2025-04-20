/**
 * Force reset Alpaca credentials and service
 * 
 * This script calls necessary functions to ensure the service uses the new credentials.
 */
import { resetAlpacaClient, checkAlpacaConnection } from '../server/services/alpaca-service.js';
import { updateApiCredentials } from '../server/update-env.js';

async function main() {
  try {
    console.log('Running forced Alpaca service reset...');
    
    // Update environment variables first
    console.log('Updating API credentials in environment...');
    updateApiCredentials();
    
    // Reset the Alpaca client to use new credentials
    console.log('Resetting Alpaca client...');
    resetAlpacaClient();
    
    // Test the connection
    console.log('Testing Alpaca API connection...');
    const isConnected = await checkAlpacaConnection();
    
    if (isConnected) {
      console.log('✅ Connection successful! Alpaca API is now properly configured.');
    } else {
      console.log('❌ Connection failed. There may still be issues with the API credentials.');
    }
    
  } catch (error) {
    console.error('Error during Alpaca service reset:', error);
  }
}

// Run the script
main()
  .then(() => console.log('Alpaca service reset completed'))
  .catch(error => console.error('Unhandled error:', error));