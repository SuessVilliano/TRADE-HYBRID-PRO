import crypto from 'crypto';
import { db } from '../db';
import * as schema from '../../shared/schema';
import { eq, and } from 'drizzle-orm';

/**
 * ApiCredentialManager
 * 
 * Securely manages API credentials for various brokers and services.
 * Uses encryption to store sensitive credentials in the database.
 */
class ApiCredentialManager {
  private encryptionKey: string;

  constructor() {
    // Use environment variable for encryption key or generate a secure one
    this.encryptionKey = process.env.CREDENTIAL_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
  }

  /**
   * Save credentials for a broker
   */
  async saveCredentials(
    brokerId: string,
    credentials: Record<string, any>,
    userId: string
  ): Promise<boolean> {
    try {
      // Delete any existing credentials first to avoid duplicates
      await db.delete(schema.brokerCredentials).where(
        and(
          eq(schema.brokerCredentials.userId, userId),
          eq(schema.brokerCredentials.brokerId, brokerId)
        )
      );

      // Save each credential value separately for better security
      for (const [key, value] of Object.entries(credentials)) {
        if (key === 'useDemo') continue; // Skip non-credential fields

        // Don't encrypt null or undefined values
        if (value === null || value === undefined) continue;

        // Save to database with encryption
        await db.insert(schema.brokerCredentials).values({
          userId,
          brokerId,
          key,
          value: this.encrypt(value.toString()),
          isDemo: credentials.useDemo || false
        });
      }

      return true;
    } catch (error) {
      console.error('Error saving credentials:', error);
      return false;
    }
  }

  /**
   * Get credentials for a broker
   */
  async getCredentials(
    brokerId: string,
    userId: string,
    isDemo: boolean = false
  ): Promise<Record<string, any> | null> {
    try {
      // Retrieve all credentials for this broker and user
      const storedCredentials = await db.query.brokerCredentials.findMany({
        where: and(
          eq(schema.brokerCredentials.userId, userId),
          eq(schema.brokerCredentials.brokerId, brokerId),
          eq(schema.brokerCredentials.isDemo, isDemo)
        )
      });

      if (!storedCredentials.length) {
        return null;
      }

      // Reconstruct the credentials object with decrypted values
      const credentials: Record<string, any> = { useDemo: isDemo };

      storedCredentials.forEach(cred => {
        credentials[cred.key] = this.decrypt(cred.value);
      });

      return credentials;
    } catch (error) {
      console.error('Error retrieving credentials:', error);
      return null;
    }
  }

  /**
   * Delete credentials for a broker
   */
  async deleteCredentials(
    brokerId: string,
    userId: string,
    isDemo?: boolean
  ): Promise<boolean> {
    try {
      const query = and(
        eq(schema.brokerCredentials.userId, userId),
        eq(schema.brokerCredentials.brokerId, brokerId)
      );

      // If isDemo is specified, add it to the query
      const finalQuery = isDemo !== undefined
        ? and(query, eq(schema.brokerCredentials.isDemo, isDemo))
        : query;

      await db.delete(schema.brokerCredentials).where(finalQuery);

      return true;
    } catch (error) {
      console.error('Error deleting credentials:', error);
      return false;
    }
  }

  /**
   * Encrypt a value
   */
  private encrypt(text: string): string {
    try {
      // Create initialization vector
      const iv = crypto.randomBytes(16);
      
      // Create cipher
      const cipher = crypto.createCipheriv(
        'aes-256-cbc',
        Buffer.from(this.encryptionKey.slice(0, 32), 'hex'),
        iv
      );
      
      // Encrypt the text
      let encrypted = cipher.update(text, 'utf8', 'hex');
      encrypted += cipher.final('hex');
      
      // Return IV and encrypted text
      return iv.toString('hex') + ':' + encrypted;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt a value
   */
  private decrypt(encryptedText: string): string {
    try {
      // Split IV and encrypted text
      const parts = encryptedText.split(':');
      const iv = Buffer.from(parts[0], 'hex');
      const encrypted = parts[1];
      
      // Create decipher
      const decipher = crypto.createDecipheriv(
        'aes-256-cbc',
        Buffer.from(this.encryptionKey.slice(0, 32), 'hex'),
        iv
      );
      
      // Decrypt the text
      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      
      return decrypted;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('Failed to decrypt data');
    }
  }
}

export const apiCredentialManager = new ApiCredentialManager();