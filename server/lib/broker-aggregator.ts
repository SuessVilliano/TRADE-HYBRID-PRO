import { brokerConnectionService } from './services/broker-connection-service';
import { BrokerService } from './services/broker-service';
import { BinanceService } from './services/binance-service';

/**
 * BrokerAggregator provides a unified interface for connecting to and trading with
 * multiple brokers. It handles authentication, order execution, and fetching account
 * and position information from various supported brokers.
 */
export class BrokerAggregator {
  private initialized = false;
  private brokerServices: Map<number, BrokerService> = new Map();

  /**
   * Initialize the broker aggregator
   * This should be called on server startup
   */
  async initialize(): Promise<void> {
    // You might want to pre-load active connections here or do any other initialization
    this.initialized = true;
    console.log('Broker aggregator initialized');
  }

  /**
   * Get broker service instance for a specific connection
   * This dynamically loads the appropriate broker service and initializes it
   */
  private async getBrokerService(connectionId: number): Promise<BrokerService> {
    // Check if we already have an initialized instance for this connection
    if (this.brokerServices.has(connectionId)) {
      return this.brokerServices.get(connectionId)!;
    }

    // Get connection details and decrypt credentials
    const credentials = await brokerConnectionService.getDecryptedCredentials(connectionId);
    if (!credentials) {
      throw new Error(`No credentials found for connection ID ${connectionId}`);
    }

    // Get broker type information
    const connection = await brokerConnectionService.getBrokerConnection(connectionId);
    if (!connection) {
      throw new Error(`Connection not found: ${connectionId}`);
    }

    const brokerType = await brokerConnectionService.getBrokerType(connection.brokerTypeId);
    if (!brokerType) {
      throw new Error(`Broker type not found: ${connection.brokerTypeId}`);
    }

    // Create the appropriate broker service based on broker type
    let brokerService: BrokerService;

    switch (brokerType.name.toLowerCase()) {
      case 'binance':
        brokerService = new BinanceService(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.isDemo,
          credentials.passphrase || null
        );
        break;
      case 'binance_us':
        brokerService = new BinanceService(
          credentials.apiKey,
          credentials.apiSecret,
          credentials.isDemo,
          credentials.passphrase || null,
          { region: 'us' }
        );
        break;
      // Add cases for other broker types as they're implemented
      // case 'alpaca':
      //   brokerService = new AlpacaService(...);
      //   break;
      // case 'kraken':
      //   brokerService = new KrakenService(...);
      //   break;
      default:
        throw new Error(`Unsupported broker type: ${brokerType.name}`);
    }

    // Initialize the broker service
    await brokerService.initialize();
    
    // Cache the service for future use
    this.brokerServices.set(connectionId, brokerService);
    
    return brokerService;
  }

  /**
   * Get account information for a broker connection
   */
  async getAccountInfo(connectionId: number): Promise<any> {
    const brokerService = await this.getBrokerService(connectionId);
    const accountInfo = await brokerService.getAccountInfo();
    return accountInfo;
  }

  /**
   * Get positions for a broker connection
   */
  async getPositions(connectionId: number): Promise<any[]> {
    const brokerService = await this.getBrokerService(connectionId);
    const positions = await brokerService.getPositions();
    return positions;
  }

  /**
   * Place an order with a broker
   */
  async placeOrder(connectionId: number, order: any): Promise<any> {
    const brokerService = await this.getBrokerService(connectionId);
    const result = await brokerService.placeOrder(order);
    return result;
  }

  /**
   * Get order history for a broker connection
   */
  async getOrderHistory(connectionId: number): Promise<any[]> {
    const brokerService = await this.getBrokerService(connectionId);
    const orders = await brokerService.getOrderHistory();
    return orders;
  }

  /**
   * Get current quote for a symbol through a broker connection
   */
  async getQuote(connectionId: number, symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number; }> {
    const brokerService = await this.getBrokerService(connectionId);
    const quote = await brokerService.getQuote(symbol);
    return quote;
  }

  /**
   * Close a position for a broker connection
   */
  async closePosition(connectionId: number, symbol: string, quantity?: number): Promise<any> {
    const brokerService = await this.getBrokerService(connectionId);
    const result = await brokerService.closePosition(symbol, quantity);
    return result;
  }

  /**
   * Validate a broker connection by testing credentials
   */
  async validateConnection(connectionId: number): Promise<boolean> {
    try {
      // This will throw an error if the broker service can't be initialized
      // or if the credentials are invalid
      const brokerService = await this.getBrokerService(connectionId);
      
      // Test the connection explicitly
      const isValid = await brokerService.validateCredentials();
      
      // If we reached here, the connection is valid
      return isValid;
    } catch (error) {
      console.error(`Error validating connection ${connectionId}:`, error);
      return false;
    }
  }
}