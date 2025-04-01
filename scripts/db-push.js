import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script to push database schema changes using Drizzle
 */
console.log('🔄 Pushing database schema changes...');

try {
  // Execute drizzle-kit push command
  const drizzleConfigPath = path.resolve(__dirname, '../drizzle.config.ts');
  
  const command = `npx drizzle-kit push`;
  console.log(`Executing: ${command}`);
  
  const result = execSync(command, { stdio: 'inherit' });
  
  console.log('✅ Database schema updated successfully!');
} catch (error) {
  console.error('❌ Error pushing schema changes:', error.message);
  process.exit(1);
}