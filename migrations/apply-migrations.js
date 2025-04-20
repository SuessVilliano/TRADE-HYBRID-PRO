/**
 * Migration script to apply all database migrations
 * This script reads SQL migration files and applies them to the database.
 */

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
require('dotenv').config();

// Connect to database
const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function applyMigrations() {
  try {
    console.log('Connecting to database...');
    await client.connect();
    console.log('Connected successfully');

    // Get all SQL files from the migrations directory
    const migrationsDir = __dirname;
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(file => file.endsWith('.sql'))
      .sort(); // Sort to ensure proper order

    console.log(`Found ${migrationFiles.length} migration files to apply`);
    
    // Begin transaction
    await client.query('BEGIN');

    try {
      // Create migrations table if it doesn't exist
      await client.query(`
        CREATE TABLE IF NOT EXISTS applied_migrations (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL UNIQUE,
          applied_at TIMESTAMP NOT NULL DEFAULT NOW()
        );
      `);

      // Get list of already applied migrations
      const result = await client.query('SELECT name FROM applied_migrations');
      const appliedMigrations = result.rows.map(row => row.name);
      
      console.log(`${appliedMigrations.length} migrations already applied`);

      // Apply each migration that hasn't been applied yet
      for (const file of migrationFiles) {
        if (appliedMigrations.includes(file)) {
          console.log(`Migration ${file} already applied, skipping`);
          continue;
        }

        console.log(`Applying migration: ${file}`);
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, 'utf8');
        
        // Execute the migration
        await client.query(sql);
        
        // Record that this migration has been applied
        await client.query(
          'INSERT INTO applied_migrations (name) VALUES ($1)',
          [file]
        );
        
        console.log(`Migration ${file} applied successfully`);
      }

      // Commit transaction
      await client.query('COMMIT');
      console.log('All migrations applied successfully');
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK');
      console.error('Error applying migrations, rolling back:', error);
      throw error;
    }
  } catch (error) {
    console.error('Migration error:', error);
  } finally {
    // Close database connection
    await client.end();
    console.log('Database connection closed');
  }
}

// Run migrations
applyMigrations().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});