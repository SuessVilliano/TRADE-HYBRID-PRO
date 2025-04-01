import { db } from './db';
import { brokerTypes } from '../shared/schema';

/**
 * Seeds the broker_types table with initial broker data
 */
async function seedBrokerTypes() {
  try {
    // Check if we have any broker types already
    const existingTypes = await db.select().from(brokerTypes);
    
    if (existingTypes.length > 0) {
      console.log(`${existingTypes.length} broker types already exist, skipping seed`);
      return;
    }
    
    // Define the broker types to seed
    const typesToSeed = [
      {
        name: 'binance',
        displayName: 'Binance',
        description: 'Binance cryptocurrency exchange',
        logoUrl: 'https://public.bnbstatic.com/20190405/eb2349c3-b2f8-4a93-a286-8f86a62ea9d8.png',
        requiresApiKey: true,
        requiresSecretKey: true,
        requiresPassphrase: false,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: true,
      },
      {
        name: 'binance_us',
        displayName: 'Binance US',
        description: 'Binance US cryptocurrency exchange',
        logoUrl: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
        requiresApiKey: true,
        requiresSecretKey: true,
        requiresPassphrase: false,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: true,
      },
      {
        name: 'alpaca',
        displayName: 'Alpaca',
        description: 'Alpaca stocks and crypto trading',
        logoUrl: 'https://alpaca.markets/favicon.ico',
        requiresApiKey: true,
        requiresSecretKey: true,
        requiresPassphrase: false,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: false,
      },
      {
        name: 'oanda',
        displayName: 'OANDA',
        description: 'OANDA forex trading',
        logoUrl: 'https://www.oanda.com/favicon.ico',
        requiresApiKey: true,
        requiresSecretKey: false,
        requiresAccessToken: true,
        requiresAccountId: true,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: false,
      },
      {
        name: 'kraken',
        displayName: 'Kraken',
        description: 'Kraken cryptocurrency exchange',
        logoUrl: 'https://www.kraken.com/favicon.ico',
        requiresApiKey: true,
        requiresSecretKey: true,
        requiresPassphrase: false,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: false,
      },
      {
        name: 'tradovate',
        displayName: 'Tradovate',
        description: 'Tradovate futures trading',
        logoUrl: 'https://tradovate.com/favicon.ico',
        requiresUsername: true,
        requiresPassword: true,
        isActive: true,
        supportsLiveTrading: true,
        supportsPaperTrading: true,
        supportsCopyTrading: false,
      },
    ];
    
    // Insert the broker types
    const inserted = await db.insert(brokerTypes).values(typesToSeed).returning();
    
    console.log(`Seeded ${inserted.length} broker types`);
  } catch (error) {
    console.error('Error seeding broker types:', error);
    throw error;
  }
}

// Run if this file is executed directly
// For ES modules
if (import.meta.url === import.meta.resolve('./seed-broker-types.ts')) {
  seedBrokerTypes()
    .then(() => {
      console.log('Seeding complete');
      process.exit(0);
    })
    .catch(error => {
      console.error('Seeding failed:', error);
      process.exit(1);
    });
}

export { seedBrokerTypes };