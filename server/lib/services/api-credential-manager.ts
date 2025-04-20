import { db } from '../../db';
import { eq, and } from 'drizzle-orm';
import { brokerConnections, brokerTypes } from '../../../shared/schema';
import { encryptionService } from './encryption-service';
import crypto from 'crypto';
import path from 'path';
import fs from 'fs/promises';
import { BrokerCredentials } from './broker-connection-service';

// Credential source types
export enum CredentialSource {
  Environment = 'environment',
  Database = 'database',
  File = 'file', // For local development/testing
  Memory = 'memory' // For in-memory cached credentials
}

// Credential metadata
interface CredentialMeta {
  source: CredentialSource;
  timestamp: Date;
  userId?: string | number;
  isValid: boolean;
  lastValidated?: Date;
}

// Credential entry with metadata
interface CredentialEntry {
  credentials: BrokerCredentials;
  meta: CredentialMeta;
}

/**
 * API Credential Manager
 * 
 * Centralized service for securely managing API credentials throughout the application.
 * - Handles encryption/decryption of sensitive data
 * - Retrieves credentials from multiple sources (env, database, files)
 * - Provides caching for performance with refresh capabilities
 * - Supports both system-level and user-specific credentials
 */
export class ApiCredentialManager {
  // In-memory cache of credentials
  private credentialCache: Map<string, CredentialEntry> = new Map();
  
  // Status of the service
  private initialized: boolean = false;
  
  // Default expiration time for cached credentials (15 minutes)
  private cacheExpirationMs: number = 15 * 60 * 1000;
  
  constructor() {}
  
  /**
   * Initialize the credential manager
   */
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // Load system-level credentials from environment variables
      await this.loadSystemCredentials();
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize API Credential Manager:', error);
      return false;
    }
  }
  
  /**
   * Load system-level credentials from environment variables
   */
  private async loadSystemCredentials(): Promise<void> {
    // Load Alpaca credentials
    if (process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET) {
      const alpacaCredentials: BrokerCredentials = {
        apiKey: process.env.ALPACA_API_KEY,
        secretKey: process.env.ALPACA_API_SECRET
      };
      
      this.setCredentials('alpaca', 'system', alpacaCredentials, CredentialSource.Environment);
      console.log('Loaded system Alpaca credentials');
    }
    
    // Load OANDA credentials
    if (process.env.OANDA_API_TOKEN) {
      const oandaCredentials: BrokerCredentials = {
        apiKey: process.env.OANDA_API_TOKEN,
        accountId: process.env.OANDA_ACCOUNT_ID
      };
      
      this.setCredentials('oanda', 'system', oandaCredentials, CredentialSource.Environment);
      console.log('Loaded system OANDA credentials');
    }
  }
  
  /**
   * Get credentials for a specific broker
   * Priority order: 
   * 1. User-specific from cache
   * 2. User-specific from database
   * 3. System-level from cache
   * 4. System-level from environment
   * 
   * @param broker The broker identifier (e.g., 'alpaca', 'oanda')
   * @param userId Optional user ID for user-specific credentials
   * @returns BrokerCredentials or null if not found
   */
  async getCredentials(broker: string, userId?: string | number): Promise<BrokerCredentials | null> {
    if (!this.initialized) {
      await this.initialize();
    }
    
    try {
      // Normalize the broker name
      const brokerKey = broker.toLowerCase();
      
      // User-specific credentials have their own key format
      const userSpecificKey = userId ? `${brokerKey}:${userId}` : null;
      
      // Check cache for user-specific credentials first
      if (userSpecificKey && this.credentialCache.has(userSpecificKey)) {
        const entry = this.credentialCache.get(userSpecificKey)!;
        
        // Check if the cache has expired
        if (Date.now() - entry.meta.timestamp.getTime() < this.cacheExpirationMs) {
          return entry.credentials;
        } else {
          // Remove expired cache entry
          this.credentialCache.delete(userSpecificKey);
        }
      }
      
      // If user ID provided, try to get user-specific credentials from database
      if (userId) {
        const userCredentials = await this.getUserCredentialsFromDatabase(brokerKey, userId);
        if (userCredentials) {
          // Cache these credentials
          this.setCredentials(brokerKey, userId, userCredentials, CredentialSource.Database);
          return userCredentials;
        }
      }
      
      // No user-specific credentials, try system-level
      const systemKey = `${brokerKey}:system`;
      
      // Check cache for system credentials
      if (this.credentialCache.has(systemKey)) {
        const entry = this.credentialCache.get(systemKey)!;
        return entry.credentials;
      }
      
      // Try to load from environment variables as last resort
      const systemCredentials = this.getSystemCredentialsFromEnv(brokerKey);
      if (systemCredentials) {
        // Cache these credentials
        this.setCredentials(brokerKey, 'system', systemCredentials, CredentialSource.Environment);
        return systemCredentials;
      }
      
      // No credentials found
      return null;
    } catch (error) {
      console.error(`Error getting credentials for ${broker}:`, error);
      return null;
    }
  }
  
  /**
   * Set/update credentials in memory cache
   */
  private setCredentials(
    broker: string, 
    userIdOrSystem: string | number, 
    credentials: BrokerCredentials,
    source: CredentialSource
  ): void {
    const key = `${broker.toLowerCase()}:${userIdOrSystem}`;
    
    this.credentialCache.set(key, {
      credentials,
      meta: {
        source,
        timestamp: new Date(),
        userId: userIdOrSystem !== 'system' ? userIdOrSystem : undefined,
        isValid: true
      }
    });
  }
  
  /**
   * Get user-specific credentials from database
   */
  private async getUserCredentialsFromDatabase(
    broker: string,
    userId: string | number
  ): Promise<BrokerCredentials | null> {
    try {
      // Get broker type ID
      const brokerType = await db.query.brokerTypes.findFirst({
        where: eq(brokerTypes.name, broker)
      });
      
      if (!brokerType) {
        throw new Error(`Broker type '${broker}' not found in database`);
      }
      
      // Get broker connection
      const connection = await db.query.brokerConnections.findFirst({
        where: and(
          eq(brokerConnections.userId, String(userId)),
          eq(brokerConnections.brokerTypeId, brokerType.id),
          eq(brokerConnections.isActive, true)
        )
      });
      
      if (!connection) {
        return null;
      }
      
      // Decrypt the credentials
      const credentials: BrokerCredentials = {};
      
      if (connection.encryptedKey) {
        credentials.apiKey = encryptionService.decrypt(connection.encryptedKey);
      }
      
      if (connection.encryptedSecret) {
        credentials.secretKey = encryptionService.decrypt(connection.encryptedSecret);
      }
      
      if (connection.encryptedPassphrase) {
        credentials.passphrase = encryptionService.decrypt(connection.encryptedPassphrase);
      }
      
      // Extract additional fields from additionalConfig if present
      if (connection.additionalConfig) {
        const additionalConfig = connection.additionalConfig as Record<string, any>;
        
        if (additionalConfig.accessToken) {
          credentials.accessToken = additionalConfig.accessToken;
        }
        
        if (additionalConfig.username) {
          credentials.username = additionalConfig.username;
        }
        
        if (additionalConfig.password) {
          credentials.password = additionalConfig.password;
        }
        
        if (additionalConfig.accountId) {
          credentials.accountId = additionalConfig.accountId;
        }
      }
      
      return credentials;
    } catch (error) {
      console.error(`Error getting ${broker} credentials from database for user ${userId}:`, error);
      return null;
    }
  }
  
  /**
   * Get system credentials from environment variables
   */
  private getSystemCredentialsFromEnv(broker: string): BrokerCredentials | null {
    switch (broker.toLowerCase()) {
      case 'alpaca':
        if (process.env.ALPACA_API_KEY && process.env.ALPACA_API_SECRET) {
          return {
            apiKey: process.env.ALPACA_API_KEY,
            secretKey: process.env.ALPACA_API_SECRET
          };
        }
        break;
        
      case 'oanda':
        if (process.env.OANDA_API_TOKEN) {
          return {
            apiKey: process.env.OANDA_API_TOKEN,
            accountId: process.env.OANDA_ACCOUNT_ID
          };
        }
        break;
        
      // Add other broker types as needed
    }
    
    return null;
  }
  
  /**
   * Save user credentials to database
   * This encrypts sensitive data before storage
   */
  async saveUserCredentials(
    broker: string,
    userId: string | number,
    credentials: BrokerCredentials
  ): Promise<boolean> {
    try {
      // Get broker type ID
      const brokerType = await db.query.brokerTypes.findFirst({
        where: eq(brokerTypes.name, broker)
      });
      
      if (!brokerType) {
        throw new Error(`Broker type '${broker}' not found in database`);
      }
      
      // Check if record already exists
      const existingConnection = await db.query.brokerConnections.findFirst({
        where: and(
          eq(brokerConnections.userId, String(userId)),
          eq(brokerConnections.brokerTypeId, brokerType.id)
        )
      });
      
      // Encrypt sensitive data
      const encryptedKey = credentials.apiKey 
        ? encryptionService.encrypt(credentials.apiKey) 
        : null;
        
      const encryptedSecret = credentials.secretKey 
        ? encryptionService.encrypt(credentials.secretKey) 
        : null;
        
      const encryptedPassphrase = credentials.passphrase 
        ? encryptionService.encrypt(credentials.passphrase) 
        : null;
      
      // Prepare additional config for fields that don't fit the schema
      const additionalConfig: Record<string, any> = {};
      
      if (credentials.accessToken) {
        additionalConfig.accessToken = credentials.accessToken;
      }
      
      if (credentials.username) {
        additionalConfig.username = credentials.username;
      }
      
      if (credentials.password) {
        additionalConfig.password = credentials.password;
      }
      
      if (credentials.accountId) {
        additionalConfig.accountId = credentials.accountId;
      }
      
      if (existingConnection) {
        // Update existing connection
        await db.update(brokerConnections)
          .set({
            encryptedKey,
            encryptedSecret,
            encryptedPassphrase,
            additionalConfig: Object.keys(additionalConfig).length > 0 
              ? additionalConfig 
              : undefined,
            isActive: true,
            updatedAt: new Date()
          })
          .where(eq(brokerConnections.id, existingConnection.id));
      } else {
        // Create new connection
        await db.insert(brokerConnections)
          .values({
            userId: String(userId),
            brokerTypeId: brokerType.id,
            name: `${broker} Connection`,
            encryptedKey,
            encryptedSecret,
            encryptedPassphrase,
            additionalConfig: Object.keys(additionalConfig).length > 0 
              ? additionalConfig 
              : undefined,
            isActive: true,
            isDemo: true,
            createdAt: new Date(),
            updatedAt: new Date()
          });
      }
      
      // Update cache
      this.setCredentials(broker, userId, credentials, CredentialSource.Database);
      
      return true;
    } catch (error) {
      console.error(`Error saving ${broker} credentials for user ${userId}:`, error);
      return false;
    }
  }
  
  /**
   * Validate credentials by testing connection
   * Returns true if valid, false otherwise
   */
  async validateCredentials(
    broker: string,
    credentials: BrokerCredentials
  ): Promise<boolean> {
    try {
      switch (broker.toLowerCase()) {
        case 'alpaca':
          return await this.validateAlpacaCredentials(credentials);
          
        case 'oanda':
          return await this.validateOandaCredentials(credentials);
          
        // Add other broker validations as needed
        
        default:
          console.warn(`No validation method available for ${broker}`);
          return false;
      }
    } catch (error) {
      console.error(`Error validating ${broker} credentials:`, error);
      return false;
    }
  }
  
  /**
   * Validate Alpaca credentials
   */
  private async validateAlpacaCredentials(credentials: BrokerCredentials): Promise<boolean> {
    if (!credentials.apiKey || !credentials.secretKey) {
      return false;
    }
    
    try {
      const response = await fetch('https://paper-api.alpaca.markets/v2/account', {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': credentials.apiKey,
          'APCA-API-SECRET-KEY': credentials.secretKey,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('Alpaca validation error:', error);
      return false;
    }
  }
  
  /**
   * Validate OANDA credentials
   */
  private async validateOandaCredentials(credentials: BrokerCredentials): Promise<boolean> {
    // Support credentials passed either as apiKey or apiToken (for backwards compatibility)
    const apiToken = credentials.apiKey || credentials.apiToken;
    
    if (!apiToken) {
      return false;
    }
    
    try {
      const response = await fetch('https://api-fxpractice.oanda.com/v3/accounts', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${apiToken}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.ok;
    } catch (error) {
      console.error('OANDA validation error:', error);
      return false;
    }
  }
  
  /**
   * Remove credentials from cache
   */
  invalidateCache(broker: string, userId?: string | number): void {
    const brokerKey = broker.toLowerCase();
    
    if (userId) {
      // Remove specific user's credentials
      this.credentialCache.delete(`${brokerKey}:${userId}`);
    } else {
      // Remove all credentials for this broker
      for (const key of this.credentialCache.keys()) {
        if (key.startsWith(`${brokerKey}:`)) {
          this.credentialCache.delete(key);
        }
      }
    }
  }
  
  /**
   * Clear all cached credentials
   */
  clearCache(): void {
    this.credentialCache.clear();
  }
  
  /**
   * Update system-level credentials in environment and restart services
   * This is for admin use to update the system's default credentials
   */
  async updateSystemCredentials(
    broker: string,
    credentials: BrokerCredentials
  ): Promise<boolean> {
    try {
      // Update environment variables in memory
      switch (broker.toLowerCase()) {
        case 'alpaca':
          if (credentials.apiKey) process.env.ALPACA_API_KEY = credentials.apiKey;
          if (credentials.secretKey) process.env.ALPACA_API_SECRET = credentials.secretKey;
          break;
          
        case 'oanda':
          if (credentials.apiKey) process.env.OANDA_API_TOKEN = credentials.apiKey;
          break;
          
        default:
          throw new Error(`Updating system credentials for ${broker} not supported`);
      }
      
      // Update cache
      this.setCredentials(broker, 'system', credentials, CredentialSource.Environment);
      
      // Try to update .env file for persistence across restarts
      try {
        await this.updateEnvFile(broker, credentials);
      } catch (envError) {
        console.warn('Could not update .env file:', envError);
        // Continue anyway since in-memory environment is updated
      }
      
      return true;
    } catch (error) {
      console.error(`Error updating system credentials for ${broker}:`, error);
      return false;
    }
  }
  
  /**
   * Update .env file with new credentials
   * This is for development/testing environments
   */
  private async updateEnvFile(
    broker: string,
    credentials: BrokerCredentials
  ): Promise<void> {
    const envPath = path.join(process.cwd(), '.env');
    
    try {
      // Read current .env file
      let envContent = await fs.readFile(envPath, 'utf8');
      
      // Update the content based on broker
      switch (broker.toLowerCase()) {
        case 'alpaca':
          if (credentials.apiKey) {
            envContent = this.replaceEnvVariable(
              envContent, 
              'ALPACA_API_KEY', 
              credentials.apiKey
            );
          }
          
          if (credentials.secretKey) {
            envContent = this.replaceEnvVariable(
              envContent, 
              'ALPACA_API_SECRET', 
              credentials.secretKey
            );
          }
          break;
          
        case 'oanda':
          if (credentials.apiKey) {
            envContent = this.replaceEnvVariable(
              envContent, 
              'OANDA_API_TOKEN', 
              credentials.apiKey
            );
          }
          break;
      }
      
      // Write updated content back to .env file
      await fs.writeFile(envPath, envContent);
      
    } catch (error) {
      throw new Error(`Failed to update .env file: ${error.message}`);
    }
  }
  
  /**
   * Helper to replace a variable in an .env file
   */
  private replaceEnvVariable(content: string, name: string, value: string): string {
    const regex = new RegExp(`^${name}=.*$`, 'm');
    
    if (regex.test(content)) {
      // Replace existing variable
      return content.replace(regex, `${name}=${value}`);
    } else {
      // Add new variable
      return `${content}\n${name}=${value}`;
    }
  }
}

// Create a singleton instance for use throughout the application
export const apiCredentialManager = new ApiCredentialManager();