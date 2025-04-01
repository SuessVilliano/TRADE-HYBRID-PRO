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
        description: 'Binance cryptocurrency exchange',
        logo_url: 'https://public.bnbstatic.com/20190405/eb2349c3-b2f8-4a93-a286-8f86a62ea9d8.png',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
      },
      {
        name: 'binance_us',
        description: 'Binance US cryptocurrency exchange',
        logo_url: 'https://bin.bnbstatic.com/static/images/common/favicon.ico',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
      },
      {
        name: 'alpaca',
        description: 'Alpaca stocks and crypto trading',
        logo_url: 'https://alpaca.markets/favicon.ico',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
      },
      {
        name: 'oanda',
        description: 'OANDA forex trading',
        logo_url: 'https://www.oanda.com/favicon.ico',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
      },
      {
        name: 'kraken',
        description: 'Kraken cryptocurrency exchange',
        logo_url: 'https://www.kraken.com/favicon.ico',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
      },
      {
        name: 'tradovate',
        description: 'Tradovate futures trading',
        logo_url: 'https://tradovate.com/favicon.ico',
        requires_key: true,
        requires_secret: true,
        requires_passphrase: false,
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