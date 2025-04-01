// Import seed functions
import { seedBrokerTypes } from './seed-broker-types';

/**
 * Runs all seed functions
 */
async function runSeeds() {
  console.log('Running seeds...');
  
  try {
    // Seed broker types
    await seedBrokerTypes();
    
    // Add more seed functions here as needed
    
    console.log('Seeding completed successfully');
  } catch (error) {
    console.error('Error running seeds:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
// For ES modules
if (import.meta.url === import.meta.resolve('./run-seeds.ts')) {
  runSeeds()
    .then(() => {
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeds failed:', error);
      process.exit(1);
    });
}

export { runSeeds };