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
  // SECURITY: credentials are no longer hardcoded here. Set ALPACA_API_KEY and
  // ALPACA_API_SECRET in the host's environment (Vercel / Replit Secrets).
  // Never copy them into VITE_* variables: Vite inlines those into the browser bundle.
  const hasKey = Boolean(process.env.ALPACA_API_KEY);
  const hasSecret = Boolean(process.env.ALPACA_API_SECRET);
  // Disable mock services (unchanged behaviour)
  process.env.USE_MOCK_SERVICE = 'false';
  process.env.VITE_USE_MOCK_SERVICE = 'false';
  console.log(`Alpaca credentials from environment: key ${hasKey ? 'set' : 'MISSING'}, secret ${hasSecret ? 'set' : 'MISSING'}`);
}