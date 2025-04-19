import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Initialize PostgreSQL client
const connectionString = process.env.DATABASE_URL || 'postgres://postgres:postgres@localhost:5432/tradehybrid';
const queryClient = postgres(connectionString);

// Initialize Drizzle ORM
export const db = drizzle(queryClient);

// Run migrations (this can be done in a separate script as well)
export const runMigrations = async () => {
  try {
    console.log('Running database migrations...');
    await migrate(db, { migrationsFolder: path.join(__dirname, '../../migrations') });
    console.log('Migrations completed successfully');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
};