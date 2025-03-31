import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import * as schema from '../shared/schema';

// Use environment variables for database connection
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/postgres';

// Create Neon client (serverless Postgres client)
const sql = neon(connectionString);

// Create Drizzle instance
export const db = drizzle(sql, { schema });

// Export schema for convenience
export { schema };