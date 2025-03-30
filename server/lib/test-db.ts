
import { db } from './db';
import { users } from '../shared/schema';

async function testConnection() {
  try {
    const result = await db.select().from(users).limit(1);
    console.log('Database connection successful!');
    console.log('First user:', result[0]);
  } catch (error) {
    console.error('Database connection failed:', error);
  }
}

testConnection();
