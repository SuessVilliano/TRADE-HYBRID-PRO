/**
 * Broker Connection Service
 * 
 * Central service for managing different broker connections
 * Registers and maintains connections to various brokers
 */

import { BrokerConnection } from './broker-interface';
import { createAlpacaAdapter } from './alpaca-broker-adapter';
import { createTradeHybridAdapter } from './tradehybrid-broker-adapter';
import { MCPServer } from '../core/mcp-server';
import { TradeExecutionProcessor } from '../processors/trade-execution-processor';

export class BrokerConnectionService {
  private static instance: BrokerConnectionService;
  private brokers: Map<string, BrokerConnection> = new Map();
  private mcp: MCPServer;
  private tradeProcessor: TradeExecutionProcessor | null = null;

  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('Broker Connection Service initialized');
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): BrokerConnectionService {
    if (!BrokerConnectionService.instance) {
      BrokerConnectionService.instance = new BrokerConnectionService(mcp);
    }
    return BrokerConnectionService.instance;
  }

  /**
   * Initialize the service with default connections
   */
  public async initialize(): Promise<void> {
    // Get trade execution processor from MCP
    this.tradeProcessor = this.mcp.getProcessor('trade-execution') as TradeExecutionProcessor;
    
    if (!this.tradeProcessor) {
      console.error('Trade Execution Processor not found in MCP');
      return;
    }
    
    // Initialize default broker connections if needed
    await this.initializeDefaultConnections();
    
    console.log('Broker Connection Service initialized with default connections');
  }

  /**
   * Initialize default broker connections (if env vars are set)
   */
  private async initializeDefaultConnections(): Promise<void> {
    try {
      // Check for Alpaca API credentials
      const alpacaApiKey = process.env.ALPACA_API_KEY;
      const alpacaApiSecret = process.env.ALPACA_API_SECRET;
      
      if (alpacaApiKey && alpacaApiSecret) {
        // Create Alpaca connection
        await this.registerAlpacaBroker(alpacaApiKey, alpacaApiSecret, true);
      }
      
      // Register TradeHybrid as the default internal broker
      // Note: This doesn't need external credentials as it's our internal system
      this.registerTradeHybridBroker('system');
      
      console.log('Default broker connections registered');
    } catch (error) {
      console.error('Error initializing default broker connections:', error);
    }
  }

  /**
   * Register an Alpaca broker connection
   */
  public async registerAlpacaBroker(
    apiKey: string, 
    apiSecret: string, 
    paper: boolean = true
  ): Promise<boolean> {
    try {
      // Create adapter
      const alpacaAdapter = createAlpacaAdapter(apiKey, apiSecret, paper);
      
      // Test connection
      const connected = await alpacaAdapter.testConnection();
      if (!connected) {
        console.error('Failed to connect to Alpaca broker');
        return false;
      }
      
      // Register with service
      this.brokers.set('alpaca', alpacaAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker('alpaca', alpacaAdapter);
      }
      
      console.log('Alpaca broker registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering Alpaca broker:', error);
      return false;
    }
  }

  /**
   * Register a Trade Hybrid broker connection
   */
  public registerTradeHybridBroker(userId: string): boolean {
    try {
      // Create adapter
      const tradeHybridAdapter = createTradeHybridAdapter(userId);
      
      // Register with service
      this.brokers.set(`tradehybrid_${userId}`, tradeHybridAdapter);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(`tradehybrid_${userId}`, tradeHybridAdapter);
      }
      
      console.log(`Trade Hybrid broker registered for user: ${userId}`);
      return true;
    } catch (error) {
      console.error('Error registering Trade Hybrid broker:', error);
      return false;
    }
  }

  /**
   * Register an external broker connection
   */
  public registerBroker(brokerId: string, broker: BrokerConnection): boolean {
    try {
      // Register with service
      this.brokers.set(brokerId, broker);
      
      // Register with trade processor
      if (this.tradeProcessor) {
        this.tradeProcessor.registerBroker(brokerId, broker);
      }
      
      console.log(`Broker registered: ${brokerId}`);
      return true;
    } catch (error) {
      console.error(`Error registering broker ${brokerId}:`, error);
      return false;
    }
  }

  /**
   * Get a broker connection by ID
   */
  public getBroker(brokerId: string): BrokerConnection | undefined {
    return this.brokers.get(brokerId);
  }

  /**
   * Get all registered broker connections
   */
  public getAllBrokers(): Map<string, BrokerConnection> {
    return this.brokers;
  }

  /**
   * Test a broker connection
   */
  public async testBrokerConnection(brokerId: string): Promise<boolean> {
    const broker = this.brokers.get(brokerId);
    if (!broker) {
      console.error(`Broker not found: ${brokerId}`);
      return false;
    }
    
    try {
      return await broker.testConnection();
    } catch (error) {
      console.error(`Error testing broker connection ${brokerId}:`, error);
      return false;
    }
  }
  
  /**
   * Get account information for a broker
   */
  public async getAccountInfo(brokerId: string): Promise<any> {
    const broker = this.brokers.get(brokerId);
    if (!broker) {
      throw new Error(`Broker not found: ${brokerId}`);
    }
    
    if (!broker.isConnected()) {
      await broker.connect();
    }
    
    return await broker.getAccountInfo();
  }
}

/**
 * Initialize the broker connection service with the MCP server
 */
export function initializeBrokerConnectionService(mcp: MCPServer): BrokerConnectionService {
  const service = BrokerConnectionService.getInstance(mcp);
  service.initialize().catch(err => 
    console.error('Error initializing broker connection service:', err)
  );
  return service;
}