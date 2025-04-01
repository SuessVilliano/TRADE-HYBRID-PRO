import { brokerConnectionService, BrokerCredentials } from './services/broker-connection-service';
import { BrokerService, BrokerAccountInfo, BrokerPosition, BrokerOrderRequest, BrokerOrderResponse } from './services/broker-service';
import { BinanceService } from './services/binance-service';
import { AlpacaService } from './services/alpaca-service';
import { TradovateService } from './services/tradovate-service';
import { db } from '../db';
import { eq } from 'drizzle-orm';
import { brokerTypes } from '../../shared/schema';

/**
 * Broker Aggregator Service
 * 
 * Provides a unified interface for interacting with different broker platforms
 * Manages broker connections and credentials securely
 */
class BrokerAggregator {
  // Cache of active broker service instances
  private brokerServiceCache: Map<number, BrokerService> = new Map();
  
  constructor() {}
  
  /**
   * Get a broker service instance for a specific connection
   */
  async getBrokerService(connectionId: number, userId: number): Promise<BrokerService> {
    // Check if we already have an instance in the cache
    if (this.brokerServiceCache.has(connectionId)) {
      return this.brokerServiceCache.get(connectionId)!;
    }
    
    // Get the connection details
    const connection = await brokerConnectionService.getBrokerConnection(connectionId, userId);
    
    if (!connection) {
      throw new Error(`Broker connection with ID ${connectionId} not found`);
    }
    
    // Get the broker type
    const brokerType = await db.query.brokerTypes.findFirst({
      where: eq(brokerTypes.id, connection.brokerTypeId)
    });
    
    if (!brokerType) {
      throw new Error(`Broker type with ID ${connection.brokerTypeId} not found`);
    }
    
    // Get the credentials
    const credentials = await brokerConnectionService.getBrokerCredentials(connectionId, userId);
    
    // Create the appropriate broker service based on the broker type
    let brokerService: BrokerService;
    
    switch (brokerType.name) {
      case 'binance':
        brokerService = new BinanceService(credentials, { region: 'global', useTestnet: !connection.isLiveTrading });
        break;
      case 'binance_us':
        brokerService = new BinanceService(credentials, { region: 'us', useTestnet: !connection.isLiveTrading });
        break;
      case 'alpaca':
        brokerService = new AlpacaService(credentials, { isPaper: !connection.isLiveTrading });
        break;
      case 'tradovate':
        brokerService = new TradovateService(credentials, { isDemoAccount: !connection.isLiveTrading });
        break;
      // Add more broker types here as they are implemented
      /*
      case 'oanda':
        brokerService = new OandaService(credentials, { isPractice: !connection.isLiveTrading });
        break;
      case 'kraken':
        brokerService = new KrakenService(credentials);
        break;
      */
      default:
        throw new Error(`Unsupported broker type: ${brokerType.name}`);
    }
    
    // Initialize the broker service
    await brokerService.initialize();
    
    // Cache the broker service
    this.brokerServiceCache.set(connectionId, brokerService);
    
    return brokerService;
  }
  
  /**
   * Get a broker service by connection token (for copy trading)
   */
  async getBrokerServiceByToken(connectionToken: string): Promise<BrokerService> {
    try {
      // Get credentials and broker ID from the token
      const { brokerId, ...credentials } = await brokerConnectionService.getCredentialsByToken(connectionToken);
      
      // Get the broker type
      const brokerType = await db.query.brokerTypes.findFirst({
        where: eq(brokerTypes.id, brokerId)
      });
      
      if (!brokerType) {
        throw new Error(`Broker type with ID ${brokerId} not found`);
      }
      
      // Create the appropriate broker service based on the broker type
      let brokerService: BrokerService;
      
      switch (brokerType.name) {
        case 'binance':
          brokerService = new BinanceService(credentials, { region: 'global' });
          break;
        case 'binance_us':
          brokerService = new BinanceService(credentials, { region: 'us' });
          break;
        case 'alpaca':
          brokerService = new AlpacaService(credentials, { isPaper: false });
          break;
        case 'tradovate':
          brokerService = new TradovateService(credentials, { isDemoAccount: false });
          break;
        // Add more broker types here as they are implemented
        default:
          throw new Error(`Unsupported broker type: ${brokerType.name}`);
      }
      
      // Initialize the broker service
      await brokerService.initialize();
      
      return brokerService;
    } catch (error) {
      console.error('Error getting broker service by token:', error);
      throw error;
    }
  }
  
  /**
   * List all supported broker types
   */
  async getSupportedBrokerTypes() {
    return db.query.brokerTypes.findMany({
      where: eq(brokerTypes.isActive, true),
    });
  }
  
  /**
   * Test a connection to a broker
   */
  async testConnection(
    brokerTypeId: number,
    credentials: BrokerCredentials,
    isLiveTrading: boolean = false
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Get the broker type
      const brokerType = await db.query.brokerTypes.findFirst({
        where: eq(brokerTypes.id, brokerTypeId)
      });
      
      if (!brokerType) {
        throw new Error(`Broker type with ID ${brokerTypeId} not found`);
      }
      
      // Create a temporary broker service
      let brokerService: BrokerService;
      
      switch (brokerType.name) {
        case 'binance':
          brokerService = new BinanceService(credentials, { region: 'global', useTestnet: !isLiveTrading });
          break;
        case 'binance_us':
          brokerService = new BinanceService(credentials, { region: 'us', useTestnet: !isLiveTrading });
          break;
        case 'alpaca':
          brokerService = new AlpacaService(credentials, { isPaper: !isLiveTrading });
          break;
        case 'tradovate':
          brokerService = new TradovateService(credentials, { isDemoAccount: !isLiveTrading });
          break;
        // Add more broker types here as needed
        default:
          throw new Error(`Unsupported broker type: ${brokerType.name}`);
      }
      
      // Attempt to validate the credentials
      const isValid = await brokerService.validateCredentials();
      
      if (isValid) {
        return { success: true, message: `Successfully connected to ${brokerType.displayName}` };
      } else {
        return { success: false, message: `Failed to validate credentials for ${brokerType.displayName}` };
      }
    } catch (error: any) {
      console.error('Error testing broker connection:', error);
      return { 
        success: false, 
        message: `Connection test failed: ${error.message || 'Unknown error'}` 
      };
    }
  }
  
  /**
   * Get account information for a connection
   */
  async getAccountInfo(connectionId: number, userId: number): Promise<BrokerAccountInfo> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.getAccountInfo();
  }
  
  /**
   * Get positions for a connection
   */
  async getPositions(connectionId: number, userId: number): Promise<BrokerPosition[]> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.getPositions();
  }
  
  /**
   * Place an order
   */
  async placeOrder(
    connectionId: number,
    userId: number,
    order: BrokerOrderRequest
  ): Promise<BrokerOrderResponse> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.placeOrder(order);
  }
  
  /**
   * Get order history
   */
  async getOrderHistory(connectionId: number, userId: number): Promise<any[]> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.getOrderHistory();
  }
  
  /**
   * Get a quote for a symbol
   */
  async getQuote(
    connectionId: number,
    userId: number,
    symbol: string
  ): Promise<{ symbol: string; bid: number; ask: number; last?: number }> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.getQuote(symbol);
  }
  
  /**
   * Close a position
   */
  async closePosition(
    connectionId: number,
    userId: number,
    symbol: string,
    quantity?: number
  ): Promise<any> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.closePosition(symbol, quantity);
  }
  
  /**
   * Cancel an order
   */
  async cancelOrder(
    connectionId: number,
    userId: number,
    orderId: string
  ): Promise<boolean> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.cancelOrder(orderId);
  }
  
  /**
   * Get order status
   */
  async getOrderStatus(
    connectionId: number,
    userId: number,
    orderId: string
  ): Promise<any> {
    const broker = await this.getBrokerService(connectionId, userId);
    return broker.getOrderStatus(orderId);
  }
  
  /**
   * Remove a broker service from the cache
   */
  invalidateBrokerService(connectionId: number): void {
    this.brokerServiceCache.delete(connectionId);
  }
}

// Create singleton instance
export const brokerAggregator = new BrokerAggregator();