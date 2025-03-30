
import { drizzle } from 'drizzle-orm/neon-serverless';
import { neon, neonConfig } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL environment variable is required');
}

// Configure neon
neonConfig.fetchConnectionCache = true;

// Create neon SQL instance
const sql = neon(process.env.DATABASE_URL);

// Create drizzle database instance - fix typing issues with 'as any'
export const db = drizzle(sql as any);

// Export sql client for direct queries if needed
export { sql as pool };
