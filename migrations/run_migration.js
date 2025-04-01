import pg from 'pg';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const { Client } = pg;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function runMigration() {
  // Get database connection string from environment variable
  const connectionString = process.env.DATABASE_URL;
  
  if (!connectionString) {
    console.error('DATABASE_URL environment variable is not set');
    process.exit(1);
  }
  
  const client = new Client({
    connectionString
  });
  
  try {
    // Connect to the database
    await client.connect();
    console.log('Connected to database');
    
    // Read the migration file
    const migrationPath = path.join(__dirname, '0002_create_broker_tables.sql');
    const migration = fs.readFileSync(migrationPath, 'utf8');
    
    // Run the migration
    console.log('Running migration...');
    await client.query(migration);
    console.log('Migration completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
  } finally {
    // Close the database connection
    await client.end();
  }
}

runMigration();