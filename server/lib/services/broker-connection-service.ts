import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';
import { db } from '../../db';
import { brokerTypes, brokerConnections } from '../../../shared/schema';
import { encryptionService } from './encryption-service';
import { BrokerAggregator } from '../broker-aggregator';

/**
 * Service for managing broker connections
 */
class BrokerConnectionService {
  private brokerAggregator: BrokerAggregator | null = null;
  
  /**
   * Initialize the broker connection service
   */
  async initialize(): Promise<void> {
    // Create broker aggregator and initialize it
    this.brokerAggregator = new BrokerAggregator();
    await this.brokerAggregator.initialize();
    
    console.log('Broker connection service initialized');
  }
  
  /**
   * Get broker aggregator instance
   */
  getBrokerAggregator(): BrokerAggregator {
    if (!this.brokerAggregator) {
      throw new Error('Broker aggregator not initialized');
    }
    return this.brokerAggregator;
  }
  
  /**
   * Get all broker types
   */
  async getBrokerTypes() {
    return await db.select().from(brokerTypes);
  }
  
  /**
   * Get a specific broker type by ID
   */
  async getBrokerType(id: number) {
    const results = await db.select().from(brokerTypes).where(eq(brokerTypes.id, id));
    return results[0] || null;
  }
  
  /**
   * Get all broker connections for a user
   */
  async getUserBrokerConnections(userId: number) {
    const connections = await db.select({
      id: brokerConnections.id,
      userId: brokerConnections.userId,
      brokerTypeId: brokerConnections.brokerTypeId,
      name: brokerConnections.connectionName,
      isLiveTrading: brokerConnections.isLiveTrading,
      isActive: brokerConnections.isActive,
      allowCopyTrading: brokerConnections.allowCopyTrading,
      lastConnectedAt: brokerConnections.lastConnectedAt,
      createdAt: brokerConnections.createdAt,
      updatedAt: brokerConnections.updatedAt,
      // Don't include sensitive fields like API keys
    }).from(brokerConnections)
      .where(eq(brokerConnections.userId, userId));
    
    // Join with broker types to include broker name and details
    const brokerTypeIds = connections.map(c => c.brokerTypeId);
    
    if (brokerTypeIds.length === 0) {
      return [];
    }
    
    const types = await db.select().from(brokerTypes);
    const typesMap = new Map(types.map(t => [t.id, t]));
    
    // Add broker details to each connection
    return connections.map(conn => ({
      ...conn,
      broker: typesMap.get(conn.brokerTypeId) || null
    }));
  }
  
  /**
   * Get a specific broker connection by ID
   */
  async getBrokerConnection(id: number) {
    const results = await db.select().from(brokerConnections).where(eq(brokerConnections.id, id));
    return results[0] || null;
  }
  
  /**
   * Create a new broker connection
   */
  async createBrokerConnection(
    userId: number,
    brokerTypeId: number,
    name: string,
    isDemo: boolean,
    apiKey: string,
    apiSecret: string,
    passphrase: string | null = null,
    additionalConfig: Record<string, any> = {}
  ) {
    // Generate a unique connection token
    const connectionToken = crypto.randomBytes(16).toString('hex');
    
    // Encrypt sensitive data
    const encryptedApiKey = await encryptionService.encrypt(apiKey);
    const encryptedSecretKey = await encryptionService.encrypt(apiSecret);
    const encryptedPassphrase = passphrase ? await encryptionService.encrypt(passphrase) : null;
    
    // Create the connection
    const result = await db.insert(brokerConnections).values({
      userId: userId,
      brokerTypeId: brokerTypeId,
      connectionName: name,
      encryptedApiKey: encryptedApiKey,
      encryptedSecretKey: encryptedSecretKey,
      encryptedPassphrase: encryptedPassphrase,
      connectionToken: connectionToken,
      isPrimary: false,
      isLiveTrading: !isDemo,
      isActive: true,
      allowCopyTrading: false,
      createdAt: new Date(),
      updatedAt: new Date()
    }).returning({
      id: brokerConnections.id,
      userId: brokerConnections.userId,
      brokerTypeId: brokerConnections.brokerTypeId,
      name: brokerConnections.connectionName,
      isLiveTrading: brokerConnections.isLiveTrading,
      isActive: brokerConnections.isActive,
      createdAt: brokerConnections.createdAt,
      updatedAt: brokerConnections.updatedAt,
    });
    
    return result[0];
  }
  
  /**
   * Update a broker connection
   */
  async updateBrokerConnection(
    id: number,
    userId: number,
    updates: {
      name?: string;
      isLiveTrading?: boolean;
      isActive?: boolean;
      apiKey?: string;
      apiSecret?: string;
      passphrase?: string | null;
      allowCopyTrading?: boolean;
      isPrimary?: boolean;
    }
  ) {
    // First verify the connection exists and belongs to the user
    const connection = await this.getBrokerConnection(id);
    
    if (!connection || connection.userId !== userId) {
      return null;
    }
    
    // Prepare updates
    const updateValues: any = {};
    
    if (updates.name !== undefined) {
      updateValues.connectionName = updates.name;
    }
    
    if (updates.isLiveTrading !== undefined) {
      updateValues.isLiveTrading = updates.isLiveTrading;
    }
    
    if (updates.isActive !== undefined) {
      updateValues.isActive = updates.isActive;
    }
    
    if (updates.apiKey !== undefined) {
      updateValues.encryptedApiKey = await encryptionService.encrypt(updates.apiKey);
    }
    
    if (updates.apiSecret !== undefined) {
      updateValues.encryptedSecretKey = await encryptionService.encrypt(updates.apiSecret);
    }
    
    if (updates.passphrase !== undefined) {
      updateValues.encryptedPassphrase = updates.passphrase 
        ? await encryptionService.encrypt(updates.passphrase) 
        : null;
    }
    
    if (updates.allowCopyTrading !== undefined) {
      updateValues.allowCopyTrading = updates.allowCopyTrading;
    }
    
    if (updates.isPrimary !== undefined) {
      updateValues.isPrimary = updates.isPrimary;
    }
    
    updateValues.updatedAt = new Date();
    
    // Perform update
    const result = await db.update(brokerConnections)
      .set(updateValues)
      .where(and(
        eq(brokerConnections.id, id),
        eq(brokerConnections.userId, userId)
      ))
      .returning({
        id: brokerConnections.id,
        userId: brokerConnections.userId,
        brokerTypeId: brokerConnections.brokerTypeId,
        name: brokerConnections.connectionName,
        isLiveTrading: brokerConnections.isLiveTrading,
        isActive: brokerConnections.isActive,
        createdAt: brokerConnections.createdAt,
        updatedAt: brokerConnections.updatedAt,
      });
    
    return result[0] || null;
  }
  
  /**
   * Delete a broker connection
   */
  async deleteBrokerConnection(id: number) {
    await db.delete(brokerConnections).where(eq(brokerConnections.id, id));
  }
  
  /**
   * Get decrypted credentials for a broker connection
   */
  async getDecryptedCredentials(id: number) {
    const connection = await db.select().from(brokerConnections).where(eq(brokerConnections.id, id));
    
    if (!connection || connection.length === 0) {
      return null;
    }
    
    const conn = connection[0];
    
    const apiKey = await encryptionService.decrypt(conn.encryptedApiKey);
    const apiSecret = await encryptionService.decrypt(conn.encryptedSecretKey);
    
    let passphrase = null;
    if (conn.encryptedPassphrase) {
      passphrase = await encryptionService.decrypt(conn.encryptedPassphrase);
    }
    
    return {
      apiKey,
      apiSecret,
      passphrase,
      isDemo: !conn.isLiveTrading
    };
  }
  
  /**
   * Validate a broker connection
   */
  async validateConnection(connectionId: number): Promise<boolean> {
    try {
      const aggregator = this.getBrokerAggregator();
      return await aggregator.validateConnection(connectionId);
    } catch (error) {
      console.error('Error validating connection:', error);
      return false;
    }
  }
}

// Create and export singleton instance
export const brokerConnectionService = new BrokerConnectionService();