
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';

// Configure neon
neonConfig.fetchConnectionCache = true;

// Handle cases where DATABASE_URL might not be available during build
let sql: any;
let db: any;

try {
  if (!process.env.DATABASE_URL) {
    console.warn('DATABASE_URL environment variable is not set. Database functionality will be limited until deployment.');
    // Provide a dummy connection string for build process
    sql = neon('postgresql://dummy:dummy@dummy.neon.tech/dummy');
  } else {
    // Create neon SQL instance with actual connection string
    sql = neon(process.env.DATABASE_URL);
  }

  // Create drizzle database instance
  db = drizzle(sql as any);
} catch (error) {
  console.error('Failed to initialize database connection:', error);
  // Create dummy instances to prevent app from crashing during build
  sql = {
    query: async () => ({ rows: [] }),
  };
  db = {
    query: async () => [],
    select: () => ({ from: () => ({ where: () => [] }) }),
    insert: () => ({ values: () => ({ returning: () => [] }) }),
    // Add other dummy methods as needed
  };
}

// Export the database client
export { db };

// Export sql client for direct queries if needed
export { sql as pool };
