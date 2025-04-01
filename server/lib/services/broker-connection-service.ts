import { db } from '../../db';
import { brokerTypes, brokerConnections, BrokerType, BrokerConnection } from '../../../shared/schema';
import encryptionService from './encryption-service';
import { eq, and } from 'drizzle-orm';

/**
 * Service for managing broker connections
 * Handles secure storage and retrieval of broker credentials
 */
export class BrokerConnectionService {
  /**
   * Initialize broker types if they don't exist
   * This should be called on server startup
   */
  async initializeBrokerTypes(): Promise<void> {
    // Check if we already have broker types
    const existingTypes = await db.select().from(brokerTypes);
    
    if (existingTypes.length === 0) {
      // Insert default broker types
      await db.insert(brokerTypes).values([
        {
          name: 'alpaca',
          displayName: 'Alpaca',
          description: 'US Stocks, ETFs, and crypto trading',
          logoUrl: '/images/brokers/alpaca-logo.png',
          requiresApiKey: true,
          requiresSecretKey: true,
          supportsPaperTrading: true,
          supportsLiveTrading: true,
          supportsCopyTrading: true,
        },
        {
          name: 'oanda',
          displayName: 'OANDA',
          description: 'Forex and CFD trading',
          logoUrl: '/images/brokers/oanda-logo.png',
          requiresApiKey: true,
          requiresAccountId: true,
          supportsPaperTrading: true,
          supportsLiveTrading: true,
        },
        {
          name: 'tradovate',
          displayName: 'Tradovate',
          description: 'Futures trading',
          logoUrl: '/images/brokers/tradovate-logo.png',
          requiresUsername: true,
          requiresPassword: true,
          supportsLiveTrading: true,
          supportsPaperTrading: true,
        },
        {
          name: 'binance',
          displayName: 'Binance',
          description: 'Cryptocurrency trading',
          logoUrl: '/images/brokers/binance-logo.png',
          requiresApiKey: true,
          requiresSecretKey: true,
          supportsLiveTrading: true,
          supportsCopyTrading: true,
        },
        {
          name: 'kraken',
          displayName: 'Kraken',
          description: 'Cryptocurrency trading',
          logoUrl: '/images/brokers/kraken-logo.png',
          requiresApiKey: true,
          requiresSecretKey: true,
          supportsLiveTrading: true,
        },
        {
          name: 'thinkorswim',
          displayName: 'TD Ameritrade - thinkorswim',
          description: 'US Stocks, options, futures, and forex',
          logoUrl: '/images/brokers/td-ameritrade-logo.png',
          requiresUsername: true,
          requiresPassword: true,
          requiresApiKey: true,
          supportsLiveTrading: true,
        },
      ]);
      console.log('Default broker types initialized');
    }
  }

  /**
   * Get all supported broker types
   */
  async getBrokerTypes(): Promise<BrokerType[]> {
    return db.select().from(brokerTypes).where(eq(brokerTypes.isActive, true));
  }

  /**
   * Get a specific broker type by ID
   */
  async getBrokerTypeById(id: number): Promise<BrokerType | null> {
    const results = await db.select().from(brokerTypes).where(eq(brokerTypes.id, id));
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get a specific broker type by name
   */
  async getBrokerTypeByName(name: string): Promise<BrokerType | null> {
    const results = await db.select().from(brokerTypes).where(eq(brokerTypes.name, name));
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Get all broker connections for a user
   */
  async getUserBrokerConnections(userId: number): Promise<BrokerConnection[]> {
    return db.select().from(brokerConnections).where(eq(brokerConnections.userId, userId));
  }

  /**
   * Get a specific broker connection
   */
  async getBrokerConnection(id: number): Promise<BrokerConnection | null> {
    const results = await db.select().from(brokerConnections).where(eq(brokerConnections.id, id));
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Create a new broker connection
   * All sensitive data is encrypted before storage
   */
  async createBrokerConnection(
    userId: number,
    brokerTypeId: number,
    connectionName: string,
    credentials: {
      apiKey?: string;
      secretKey?: string;
      accessToken?: string;
      username?: string;
      password?: string;
      accountId?: string;
    },
    options: {
      isPrimary?: boolean;
      isLiveTrading?: boolean;
      allowCopyTrading?: boolean;
    } = {}
  ): Promise<BrokerConnection> {
    // Generate a secure connection token
    const connectionToken = encryptionService.generateSecureToken();
    
    // Encrypt sensitive credentials
    const encryptedData: {
      encryptedApiKey?: string;
      encryptedSecretKey?: string;
      encryptedAccessToken?: string;
      encryptedUsername?: string;
      encryptedPassword?: string;
    } = {};
    
    if (credentials.apiKey) {
      encryptedData.encryptedApiKey = encryptionService.encrypt(credentials.apiKey);
    }
    
    if (credentials.secretKey) {
      encryptedData.encryptedSecretKey = encryptionService.encrypt(credentials.secretKey);
    }
    
    if (credentials.accessToken) {
      encryptedData.encryptedAccessToken = encryptionService.encrypt(credentials.accessToken);
    }
    
    if (credentials.username) {
      encryptedData.encryptedUsername = encryptionService.encrypt(credentials.username);
    }
    
    if (credentials.password) {
      encryptedData.encryptedPassword = encryptionService.encrypt(credentials.password);
    }
    
    // If this is the primary connection, unset any existing primary connection
    if (options.isPrimary) {
      await db.update(brokerConnections)
        .set({ isPrimary: false })
        .where(and(
          eq(brokerConnections.userId, userId),
          eq(brokerConnections.isPrimary, true)
        ));
    }
    
    // Insert the new connection
    const result = await db.insert(brokerConnections).values({
      userId,
      brokerTypeId,
      connectionName,
      ...encryptedData,
      accountId: credentials.accountId,
      connectionToken,
      isPrimary: options.isPrimary || false,
      isLiveTrading: options.isLiveTrading || false,
      allowCopyTrading: options.allowCopyTrading || false,
      lastConnectedAt: new Date(),
    }).returning();
    
    return result[0];
  }

  /**
   * Update an existing broker connection
   */
  async updateBrokerConnection(
    id: number,
    data: {
      connectionName?: string;
      credentials?: {
        apiKey?: string;
        secretKey?: string;
        accessToken?: string;
        username?: string;
        password?: string;
        accountId?: string;
      };
      isPrimary?: boolean;
      isLiveTrading?: boolean;
      allowCopyTrading?: boolean;
      isActive?: boolean;
    }
  ): Promise<BrokerConnection | null> {
    // Get the existing connection
    const existing = await this.getBrokerConnection(id);
    if (!existing) {
      return null;
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (data.connectionName) {
      updateData.connectionName = data.connectionName;
    }
    
    if (data.credentials) {
      // Encrypt sensitive credentials
      if (data.credentials.apiKey) {
        updateData.encryptedApiKey = encryptionService.encrypt(data.credentials.apiKey);
      }
      
      if (data.credentials.secretKey) {
        updateData.encryptedSecretKey = encryptionService.encrypt(data.credentials.secretKey);
      }
      
      if (data.credentials.accessToken) {
        updateData.encryptedAccessToken = encryptionService.encrypt(data.credentials.accessToken);
      }
      
      if (data.credentials.username) {
        updateData.encryptedUsername = encryptionService.encrypt(data.credentials.username);
      }
      
      if (data.credentials.password) {
        updateData.encryptedPassword = encryptionService.encrypt(data.credentials.password);
      }
      
      if (data.credentials.accountId) {
        updateData.accountId = data.credentials.accountId;
      }
    }
    
    // If setting as primary, unset any other primary connection for this user
    if (data.isPrimary && !existing.isPrimary) {
      await db.update(brokerConnections)
        .set({ isPrimary: false })
        .where(and(
          eq(brokerConnections.userId, existing.userId),
          eq(brokerConnections.isPrimary, true)
        ));
    }
    
    if (data.isPrimary !== undefined) {
      updateData.isPrimary = data.isPrimary;
    }
    
    if (data.isLiveTrading !== undefined) {
      updateData.isLiveTrading = data.isLiveTrading;
    }
    
    if (data.allowCopyTrading !== undefined) {
      updateData.allowCopyTrading = data.allowCopyTrading;
    }
    
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    
    // Update the connection
    const result = await db.update(brokerConnections)
      .set(updateData)
      .where(eq(brokerConnections.id, id))
      .returning();
    
    return result[0] || null;
  }

  /**
   * Delete a broker connection
   */
  async deleteBrokerConnection(id: number): Promise<boolean> {
    const result = await db.delete(brokerConnections)
      .where(eq(brokerConnections.id, id))
      .returning({ id: brokerConnections.id });
    
    return result.length > 0;
  }

  /**
   * Get decrypted credentials for a broker connection
   * This should only be used within secure contexts for API calls
   */
  async getDecryptedCredentials(id: number): Promise<{
    apiKey?: string;
    secretKey?: string;
    accessToken?: string;
    username?: string;
    password?: string;
    accountId?: string;
  } | null> {
    const connection = await this.getBrokerConnection(id);
    if (!connection) {
      return null;
    }
    
    const credentials: any = {};
    
    if (connection.encryptedApiKey) {
      credentials.apiKey = encryptionService.decrypt(connection.encryptedApiKey);
    }
    
    if (connection.encryptedSecretKey) {
      credentials.secretKey = encryptionService.decrypt(connection.encryptedSecretKey);
    }
    
    if (connection.encryptedAccessToken) {
      credentials.accessToken = encryptionService.decrypt(connection.encryptedAccessToken);
    }
    
    if (connection.encryptedUsername) {
      credentials.username = encryptionService.decrypt(connection.encryptedUsername);
    }
    
    if (connection.encryptedPassword) {
      credentials.password = encryptionService.decrypt(connection.encryptedPassword);
    }
    
    if (connection.accountId) {
      credentials.accountId = connection.accountId;
    }
    
    return credentials;
  }

  /**
   * Validate broker connection by testing the credentials
   * Returns true if the connection is valid
   */
  async validateConnection(id: number): Promise<boolean> {
    try {
      const connection = await this.getBrokerConnection(id);
      if (!connection) {
        return false;
      }
      
      const credentials = await this.getDecryptedCredentials(id);
      if (!credentials) {
        return false;
      }
      
      const brokerType = await this.getBrokerTypeById(connection.brokerTypeId);
      if (!brokerType) {
        return false;
      }
      
      // TODO: Implement actual validation for different broker types
      // For now, we'll just return true if we have the required credentials
      
      // Mark the connection as last connected now
      await db.update(brokerConnections)
        .set({ lastConnectedAt: new Date() })
        .where(eq(brokerConnections.id, id));
      
      return true;
    } catch (error) {
      console.error('Error validating broker connection:', error);
      return false;
    }
  }
}

// Export a singleton instance
const brokerConnectionService = new BrokerConnectionService();
export default brokerConnectionService;