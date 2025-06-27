
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../shared/schema';

// Initialize the database connection
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Create postgres client
const sql = postgres(connectionString, {
  max: 10,
  idle_timeout: 20,
  connect_timeout: 60,
});

// Create drizzle database instance with schema
export const db = drizzle(sql, { schema });

// Export sql client for direct queries if needed
export { sql };

// Export sql client for direct queries if needed
export { sql as pool };
