import { db } from '../../db';
import { and, eq } from 'drizzle-orm';
import { brokerConnections, brokerTypes, users } from '../../../shared/schema';
import { encryptionService } from './encryption-service';
import crypto from 'crypto';

// Types for broker credentials
export interface BrokerCredentials {
  // Common credential fields
  apiKey?: string;
  secretKey?: string;
  accessToken?: string;
  refreshToken?: string;
  username?: string;
  password?: string;
  passphrase?: string;
  accountId?: string;
  
  // Specific broker types additional fields
  // Alpaca specific
  isPaper?: boolean;
  
  // Oanda specific
  apiToken?: string;
  isPractice?: boolean;
  
  // Interactive Brokers specific
  userId?: string;
  
  // Saxo Bank specific
  appKey?: string;
  accountKey?: string;
  isSimAccount?: boolean;
  
  // cTrader specific
  apiSecret?: string;
  
  // TD Ameritrade specific
  consumerKey?: string;
  
  // Tradier specific
  isSandbox?: boolean;
  
  // IG specific
  isDemoAccount?: boolean;
  
  // MetaApi specific
  connectionType?: string;
  
  // Additional options for various brokers
  endpoint?: string;
  region?: string;
  subAccountName?: string;
  metadata?: Record<string, any>;
}

/**
 * Service for managing broker connections and their secure credentials
 */
export class BrokerConnectionService {
  /**
   * Initialize the broker connection service
   */
  async initialize(): Promise<void> {
    // Add any initialization logic here if needed
    console.log('Broker connection service initialized');
    return Promise.resolve();
  }
  /**
   * Create a new broker connection for a user
   */
  async createBrokerConnection(
    userId: number,
    brokerTypeId: number,
    connectionName: string,
    credentials: BrokerCredentials,
    options: {
      isDemo?: boolean;
    } = {}
  ) {
    try {
      // First, check if broker type exists
      const brokerType = await db.query.brokerTypes.findFirst({
        where: eq(brokerTypes.id, brokerTypeId)
      });
      
      if (!brokerType) {
        throw new Error(`Broker type with ID ${brokerTypeId} not found`);
      }
      
      // Encrypt all sensitive credentials before storing
      let encryptedKey, encryptedSecret, encryptedPassphrase;
      
      if (credentials.apiKey && brokerType.requires_key) {
        encryptedKey = encryptionService.encrypt(credentials.apiKey);
      }
      
      if (credentials.secretKey && brokerType.requires_secret) {
        encryptedSecret = encryptionService.encrypt(credentials.secretKey);
      }
      
      if (credentials.passphrase && brokerType.requires_passphrase) {
        encryptedPassphrase = encryptionService.encrypt(credentials.passphrase);
      }
      
      // Store additional config
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
      
      // Default options
      const { isDemo = false } = options;
      
      // Create the new connection
      const connection = await db.insert(brokerConnections).values({
        userId,
        brokerTypeId,
        name: connectionName,
        encryptedKey,
        encryptedSecret,
        encryptedPassphrase,
        additionalConfig: Object.keys(additionalConfig).length > 0 ? additionalConfig : null,
        isActive: true,
        isDemo,
        lastConnectedAt: new Date(),
      }).returning();
      
      // Update user's has_connected_apis flag
      await db.update(users)
        .set({ hasConnectedApis: true })
        .where(eq(users.id, userId));
      
      return connection[0];
    } catch (error) {
      console.error('Error creating broker connection:', error);
      throw error;
    }
  }
  
  /**
   * Get all broker connections for a user
   */
  async getBrokerConnections(userId: number) {
    try {
      const connections = await db.query.brokerConnections.findMany({
        where: eq(brokerConnections.userId, userId),
        with: {
          broker_type: true,
        },
      });
      
      // Return without exposing encrypted data
      return connections.map(conn => {
        const additionalConfig = conn.additionalConfig as Record<string, any> || {};
        
        return {
          id: conn.id,
          userId: conn.userId,
          brokerTypeId: conn.brokerTypeId,
          brokerType: conn.broker_type,
          name: conn.name,
          isActive: conn.isActive,
          isDemo: conn.isDemo,
          lastConnectedAt: conn.lastConnectedAt,
          createdAt: conn.createdAt,
          updatedAt: conn.updatedAt,
          // Including boolean flags to indicate which credentials are present
          hasApiKey: !!conn.encryptedKey,
          hasSecretKey: !!conn.encryptedSecret,
          hasPassphrase: !!conn.encryptedPassphrase,
          // Additional config indicators
          hasAccessToken: !!additionalConfig.accessToken,
          hasUsername: !!additionalConfig.username,
          hasPassword: !!additionalConfig.password,
          hasAccountId: !!additionalConfig.accountId,
        };
      });
    } catch (error) {
      console.error('Error getting broker connections:', error);
      throw error;
    }
  }
  
  /**
   * Get a specific broker connection by ID
   */
  async getBrokerConnection(connectionId: number, userId: number) {
    try {
      const connection = await db.query.brokerConnections.findFirst({
        where: and(
          eq(brokerConnections.id, connectionId),
          eq(brokerConnections.userId, userId)
        ),
        with: {
          broker_type: true,
        },
      });
      
      if (!connection) {
        throw new Error(`Broker connection with ID ${connectionId} not found`);
      }
      
      const additionalConfig = connection.additionalConfig as Record<string, any> || {};
      
      return {
        id: connection.id,
        userId: connection.userId,
        brokerTypeId: connection.brokerTypeId,
        brokerType: connection.broker_type,
        name: connection.name,
        isActive: connection.isActive,
        isDemo: connection.isDemo,
        lastConnectedAt: connection.lastConnectedAt,
        createdAt: connection.createdAt,
        updatedAt: connection.updatedAt,
        // Including boolean flags to indicate which credentials are present
        hasApiKey: !!connection.encryptedKey,
        hasSecretKey: !!connection.encryptedSecret,
        hasPassphrase: !!connection.encryptedPassphrase,
        // Additional config indicators
        hasAccessToken: !!additionalConfig.accessToken,
        hasUsername: !!additionalConfig.username,
        hasPassword: !!additionalConfig.password,
        hasAccountId: !!additionalConfig.accountId,
      };
    } catch (error) {
      console.error('Error getting broker connection:', error);
      throw error;
    }
  }
  
  /**
   * Get full credentials for a broker connection (decrypted for use)
   */
  async getBrokerCredentials(connectionId: number, userId: number): Promise<BrokerCredentials> {
    try {
      const connection = await db.query.brokerConnections.findFirst({
        where: and(
          eq(brokerConnections.id, connectionId),
          eq(brokerConnections.userId, userId)
        )
      });
      
      if (!connection) {
        throw new Error(`Broker connection with ID ${connectionId} not found`);
      }
      
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
      console.error('Error getting broker credentials:', error);
      throw error;
    }
  }
  
  /**
   * Get credentials by connection token (for copy trading)
   */
  async getCredentialsByToken(connectionToken: string): Promise<BrokerCredentials & { brokerId: number }> {
    try {
      // TODO: Update this query once copy trading features are fully implemented 
      // and connection_token field is added to the database
      const connection = await db.query.brokerConnections.findFirst({
        where: eq(brokerConnections.isActive, true)
      });
      
      if (!connection) {
        throw new Error(`Active broker connection not found`);
      }
      
      const credentials: BrokerCredentials & { brokerId: number } = {
        brokerId: connection.brokerTypeId
      };
      
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
      console.error('Error getting credentials by token:', error);
      throw error;
    }
  }
  
  /**
   * Update a broker connection
   */
  async updateBrokerConnection(
    connectionId: number,
    userId: number,
    updates: {
      connectionName?: string;
      credentials?: Partial<BrokerCredentials>;
      isActive?: boolean;
      isDemo?: boolean;
    }
  ) {
    try {
      // First get the current connection
      const existingConnection = await db.query.brokerConnections.findFirst({
        where: and(
          eq(brokerConnections.id, connectionId),
          eq(brokerConnections.userId, userId)
        ),
        with: {
          broker_type: true,
        },
      });
      
      if (!existingConnection) {
        throw new Error(`Broker connection with ID ${connectionId} not found`);
      }
      
      // Prepare update data
      const updateData: Record<string, any> = {};
      
      if (updates.connectionName) {
        updateData.name = updates.connectionName;
      }
      
      if (updates.isActive !== undefined) {
        updateData.isActive = updates.isActive;
      }
      
      if (updates.isDemo !== undefined) {
        updateData.isDemo = updates.isDemo;
      }
      
      // Handle credential updates if provided
      if (updates.credentials) {
        const { apiKey, secretKey, passphrase, accessToken, username, password, accountId } = updates.credentials;
        
        if (apiKey && (existingConnection.broker_type as any).requires_key) {
          updateData.encryptedKey = encryptionService.encrypt(apiKey);
        }
        
        if (secretKey && (existingConnection.broker_type as any).requires_secret) {
          updateData.encryptedSecret = encryptionService.encrypt(secretKey);
        }
        
        if (passphrase && (existingConnection.broker_type as any).requires_passphrase) {
          updateData.encryptedPassphrase = encryptionService.encrypt(passphrase);
        }
        
        // Get existing additional config or create new one
        let additionalConfig = existingConnection.additionalConfig ? 
          { ...existingConnection.additionalConfig as Record<string, any> } : {};
        
        // Update additional config fields
        if (accessToken) {
          additionalConfig.accessToken = accessToken;
        }
        
        if (username) {
          additionalConfig.username = username;
        }
        
        if (password) {
          additionalConfig.password = password;
        }
        
        if (accountId) {
          additionalConfig.accountId = accountId;
        }
        
        if (Object.keys(additionalConfig).length > 0) {
          updateData.additionalConfig = additionalConfig;
        }
      }
      
      // Update the timestamp
      updateData.updatedAt = new Date();
      
      // Update the connection
      const updated = await db.update(brokerConnections)
        .set(updateData)
        .where(and(
          eq(brokerConnections.id, connectionId),
          eq(brokerConnections.userId, userId)
        ))
        .returning();
      
      return updated[0];
    } catch (error) {
      console.error('Error updating broker connection:', error);
      throw error;
    }
  }
  
  /**
   * Delete a broker connection
   */
  async deleteBrokerConnection(connectionId: number, userId: number) {
    try {
      const deleted = await db.delete(brokerConnections)
        .where(and(
          eq(brokerConnections.id, connectionId),
          eq(brokerConnections.userId, userId)
        ))
        .returning();
      
      if (deleted.length === 0) {
        throw new Error(`Broker connection with ID ${connectionId} not found`);
      }
      
      // Check if user has any connections left
      const remainingConnections = await db.query.brokerConnections.findMany({
        where: eq(brokerConnections.userId, userId),
      });
      
      // If no connections left, update user's has_connected_apis flag
      if (remainingConnections.length === 0) {
        await db.update(users)
          .set({ hasConnectedApis: false })
          .where(eq(users.id, userId));
      }
      
      return deleted[0];
    } catch (error) {
      console.error('Error deleting broker connection:', error);
      throw error;
    }
  }
  
  /**
   * Test connection to broker with provided credentials
   */
  async testBrokerConnection(brokerTypeId: number, credentials: BrokerCredentials) {
    try {
      // Implementation will depend on broker-specific service
      // This would be implemented in the broker aggregator layer
      return { success: true, message: 'Connection test not implemented yet' };
    } catch (error) {
      console.error('Error testing broker connection:', error);
      throw error;
    }
  }
  
  /**
   * Generate a unique ID for broker connections
   */
  private generateConnectionToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}

// Create singleton instance
export const brokerConnectionService = new BrokerConnectionService();