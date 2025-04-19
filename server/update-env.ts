import fs from 'fs';
import path from 'path';

/**
 * Update environment variables at runtime
 * This is needed because changing the .env file doesn't automatically update process.env
 */
export function updateEnvironmentVariables(): void {
  try {
    // Read the .env file
    const envPath = path.resolve(process.cwd(), '.env');
    console.log('Reading .env file from:', envPath);
    
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    // Parse the .env file content
    const envVars = envContent.split('\n').reduce((acc, line) => {
      // Skip empty lines and comments
      if (!line || line.startsWith('#')) {
        return acc;
      }
      
      // Parse key=value pairs
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match) {
        const key = match[1].trim();
        const value = match[2].trim();
        
        // Remove quotes if present
        const cleanValue = value.replace(/^['"]|['"]$/g, '');
        
        acc[key] = cleanValue;
      }
      
      return acc;
    }, {} as Record<string, string>);
    
    // Apply the variables to process.env
    for (const [key, value] of Object.entries(envVars)) {
      if (process.env[key] !== value) {
        console.log(`Updating environment variable: ${key}=${value.substring(0, 4)}...`);
        process.env[key] = value;
      }
    }
    
    console.log('Environment variables updated from .env file');
  } catch (error) {
    console.error('Error updating environment variables:', error);
  }
}

// Export a function to update specific variables
export function updateApiCredentials(): void {
  try {
    // Update Alpaca credentials
    process.env.ALPACA_API_KEY = 'CKE6QEC625ODXIY3KR3B';
    process.env.ALPACA_API_SECRET = 'zhj0lFDODB2LFJdFm0juD8tpevfJPuRNH9ZMl0Ao';
    
    // Update client-side variables too
    process.env.VITE_ALPACA_API_KEY = 'CKE6QEC625ODXIY3KR3B';
    process.env.VITE_ALPACA_API_SECRET = 'zhj0lFDODB2LFJdFm0juD8tpevfJPuRNH9ZMl0Ao';
    
    // Disable mock services
    process.env.USE_MOCK_SERVICE = 'false';
    process.env.VITE_USE_MOCK_SERVICE = 'false';
    
    console.log('API credentials updated manually:');
    console.log(`ALPACA_API_KEY: ${process.env.ALPACA_API_KEY.substring(0, 4)}...`);
    console.log(`ALPACA_API_SECRET: ${process.env.ALPACA_API_SECRET.substring(0, 4)}...`);
  } catch (error) {
    console.error('Error updating API credentials:', error);
  }
}