import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../shared/schema';

// Initialize the PostgreSQL client
const connectionString = process.env.DATABASE_URL || '';
export const sql = postgres(connectionString);

// Initialize Drizzle ORM with our schema
export const db = drizzle(sql, { schema });