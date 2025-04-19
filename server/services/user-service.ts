import { db } from '../db';
import { users, brokerCredentials } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

// Encryption helpers for securing API keys
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-encryption-key-change-in-production';
const IV_LENGTH = 16; // For AES, this is always 16

function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(
    'aes-256-cbc', 
    Buffer.from(ENCRYPTION_KEY), 
    iv
  );
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts[0], 'hex');
  const encryptedText = Buffer.from(textParts[1], 'hex');
  const decipher = crypto.createDecipheriv(
    'aes-256-cbc',
    Buffer.from(ENCRYPTION_KEY),
    iv
  );
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Save broker credentials
export async function saveBrokerCredentials(
  userId: string,
  broker: string,
  credentials: any
): Promise<boolean> {
  try {
    // Encrypt sensitive data
    const encryptedCredentials = { ...credentials };
    
    // Encrypt API key/secret for Alpaca
    if (broker === 'alpaca') {
      if (encryptedCredentials.apiKey) {
        encryptedCredentials.apiKey = encrypt(encryptedCredentials.apiKey);
      }
      if (encryptedCredentials.apiSecret) {
        encryptedCredentials.apiSecret = encrypt(encryptedCredentials.apiSecret);
      }
    }
    
    // Encrypt API token for Oanda
    if (broker === 'oanda') {
      if (encryptedCredentials.apiToken) {
        encryptedCredentials.apiToken = encrypt(encryptedCredentials.apiToken);
      }
    }
    
    // Check if record already exists
    const existingCredentials = await db.select()
      .from(brokerCredentials)
      .where(
        eq(brokerCredentials.userId, userId) && 
        eq(brokerCredentials.broker, broker)
      );
    
    if (existingCredentials.length > 0) {
      // Update existing credentials
      await db.update(brokerCredentials)
        .set({
          credentials: encryptedCredentials,
          updatedAt: new Date()
        })
        .where(
          eq(brokerCredentials.userId, userId) && 
          eq(brokerCredentials.broker, broker)
        );
    } else {
      // Insert new credentials
      await db.insert(brokerCredentials)
        .values({
          userId,
          broker,
          credentials: encryptedCredentials,
          createdAt: new Date(),
          updatedAt: new Date()
        });
    }
    
    return true;
  } catch (error) {
    console.error('Error saving broker credentials:', error);
    return false;
  }
}

// Get broker credentials (decrypted)
export async function getUserBrokerCredentials(
  userId: string,
  broker: string
): Promise<any> {
  try {
    const credentialsRecord = await db.select()
      .from(brokerCredentials)
      .where(
        eq(brokerCredentials.userId, userId) && 
        eq(brokerCredentials.broker, broker)
      );
    
    if (credentialsRecord.length === 0) {
      return null;
    }
    
    const encryptedCredentials = credentialsRecord[0].credentials;
    
    // Decrypt sensitive data
    const decryptedCredentials = { ...encryptedCredentials };
    
    // Decrypt API key/secret for Alpaca
    if (broker === 'alpaca') {
      if (decryptedCredentials.apiKey) {
        decryptedCredentials.apiKey = decrypt(decryptedCredentials.apiKey);
      }
      if (decryptedCredentials.apiSecret) {
        decryptedCredentials.apiSecret = decrypt(decryptedCredentials.apiSecret);
      }
    }
    
    // Decrypt API token for Oanda
    if (broker === 'oanda') {
      if (decryptedCredentials.apiToken) {
        decryptedCredentials.apiToken = decrypt(decryptedCredentials.apiToken);
      }
    }
    
    return decryptedCredentials;
  } catch (error) {
    console.error('Error getting broker credentials:', error);
    return null;
  }
}

// Get all broker credentials for a user
export async function getAllUserBrokerCredentials(userId: string): Promise<any> {
  try {
    const credentialsRecords = await db.select()
      .from(brokerCredentials)
      .where(eq(brokerCredentials.userId, userId));
    
    if (!credentialsRecords.length) {
      return {};
    }
    
    // Build map of broker credentials
    const result: { [key: string]: any } = {};
    
    for (const record of credentialsRecords) {
      const broker = record.broker;
      const encryptedCredentials = record.credentials;
      
      // Decrypt sensitive data
      const decryptedCredentials = { ...encryptedCredentials };
      
      // Decrypt based on broker type
      if (broker === 'alpaca') {
        if (decryptedCredentials.apiKey) {
          decryptedCredentials.apiKey = decrypt(decryptedCredentials.apiKey);
        }
        if (decryptedCredentials.apiSecret) {
          decryptedCredentials.apiSecret = decrypt(decryptedCredentials.apiSecret);
        }
      } else if (broker === 'oanda') {
        if (decryptedCredentials.apiToken) {
          decryptedCredentials.apiToken = decrypt(decryptedCredentials.apiToken);
        }
      }
      
      // Mask sensitive data for frontend
      const maskedCredentials = { ...decryptedCredentials };
      
      if (broker === 'alpaca') {
        if (maskedCredentials.apiKey) {
          maskedCredentials.apiKey = maskString(maskedCredentials.apiKey);
        }
        if (maskedCredentials.apiSecret) {
          maskedCredentials.apiSecret = maskString(maskedCredentials.apiSecret);
        }
      } else if (broker === 'oanda') {
        if (maskedCredentials.apiToken) {
          maskedCredentials.apiToken = maskString(maskedCredentials.apiToken);
        }
      }
      
      // Add connection status if available
      result[broker] = {
        ...maskedCredentials,
        lastChecked: record.lastChecked,
        isConnected: record.isConnected
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error getting all broker credentials:', error);
    return {};
  }
}

// Update connection status
export async function updateBrokerConnectionStatus(
  userId: string,
  broker: string,
  isConnected: boolean,
  message?: string,
  accountInfo?: any
): Promise<boolean> {
  try {
    const credentialsRecord = await db.select()
      .from(brokerCredentials)
      .where(
        eq(brokerCredentials.userId, userId) && 
        eq(brokerCredentials.broker, broker)
      );
    
    if (credentialsRecord.length === 0) {
      return false;
    }
    
    await db.update(brokerCredentials)
      .set({
        isConnected,
        lastChecked: new Date(),
        statusMessage: message,
        accountInfo: accountInfo || null,
        updatedAt: new Date()
      })
      .where(
        eq(brokerCredentials.userId, userId) && 
        eq(brokerCredentials.broker, broker)
      );
    
    return true;
  } catch (error) {
    console.error('Error updating broker connection status:', error);
    return false;
  }
}

// Helper to mask sensitive strings
function maskString(str: string): string {
  if (!str || str.length < 8) {
    return '********';
  }
  
  // Show first 4 and last 4 characters
  return str.slice(0, 4) + ''.padStart(str.length - 8, '*') + str.slice(-4);
}

// Delete broker credentials
export async function deleteBrokerCredentials(
  userId: string,
  broker: string
): Promise<boolean> {
  try {
    await db.delete(brokerCredentials)
      .where(
        eq(brokerCredentials.userId, userId) && 
        eq(brokerCredentials.broker, broker)
      );
    
    return true;
  } catch (error) {
    console.error('Error deleting broker credentials:', error);
    return false;
  }
}