
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';
import * as schema from '../../shared/schema';

// Configure neon
neonConfig.fetchConnectionCache = true;

// Initialize the database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create neon SQL instance
const sql = neon(connectionString);

// Create drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Export sql client for direct queries if needed
export { sql };

// Export sql client for direct queries if needed
export { sql as pool };
