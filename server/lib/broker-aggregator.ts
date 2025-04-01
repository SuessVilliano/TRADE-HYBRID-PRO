import brokerConnectionService from './services/broker-connection-service';
import encryptionService from './services/encryption-service';
import { BrokerType, BrokerConnection } from '../../shared/schema';

// Interfaces for order requests/responses
export interface OrderRequest {
  symbol: string;             // Trading symbol (e.g., "AAPL" for Apple stock)
  quantity: number;           // Number of shares/contracts/units
  side: 'buy' | 'sell';       // Order side
  type: 'market' | 'limit' | 'stop' | 'stop_limit'; // Order type
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';      // Time in force
  limitPrice?: number;        // Price for limit orders
  stopPrice?: number;         // Price for stop orders
  clientOrderId?: string;     // Optional client-generated order ID
  extendedHours?: boolean;    // Whether to allow extended hours trading
  metadata?: Record<string, any>; // Additional broker-specific parameters
}

export interface OrderResponse {
  success: boolean;          // Whether the order was successfully placed
  orderId?: string;          // Broker-assigned order ID
  clientOrderId?: string;    // Client-assigned order ID (echoed back)
  status: 'accepted' | 'rejected' | 'filled' | 'partial_fill' | 'canceled' | 'pending';
  filledQuantity?: number;   // Amount filled (if any)
  remainingQuantity?: number; // Amount remaining to be filled
  avgFillPrice?: number;     // Average fill price (if any)
  commission?: number;       // Commission charged
  reason?: string;           // Reason for rejection or other status
  createdAt: number;         // Timestamp when order was created (milliseconds since epoch)
  updatedAt: number;         // Timestamp when order was last updated
  raw?: any;                 // Raw broker response (for debugging)
}

export interface PositionInfo {
  symbol: string;            // Trading symbol
  quantity: number;          // Current position size (negative for short positions)
  entryPrice: number;        // Average entry price
  currentPrice: number;      // Current market price
  marketValue: number;       // Current market value of position
  unrealizedPnl: number;     // Unrealized profit/loss
  unrealizedPnlPercent: number; // Unrealized P&L as percentage
  todayPnl?: number;         // P&L for today's trading
  costBasis: number;         // Total cost to establish position
  exchange?: string;         // Exchange where the position is held
  assetType: 'stock' | 'option' | 'future' | 'forex' | 'crypto'; // Asset type
  lastUpdated: number;       // Timestamp when position was last updated
}

export interface AccountInfo {
  accountId: string;         // Account ID at the broker
  accountNumber?: string;    // Account number (if different from ID)
  accountType: 'cash' | 'margin' | 'pdt' | 'other'; // Account type
  accountName?: string;      // User-friendly account name
  cash: number;              // Cash available for trading
  cashWithdrawable?: number; // Cash available for withdrawal
  equity: number;            // Total account value
  longMarketValue: number;   // Market value of long positions
  shortMarketValue: number;  // Market value of short positions
  marginUsed?: number;       // Amount of margin used
  marginAvailable?: number;  // Amount of margin available
  buyingPower: number;       // Buying power for securities
  optionBuyingPower?: number; // Buying power for options
  futureBuyingPower?: number; // Buying power for futures
  dayTradeBuyingPower?: number; // Buying power for day trading
  currency: string;          // Account currency (USD, EUR, etc.)
  isLive: boolean;           // Whether this is a live or paper account
  isBlocked?: boolean;       // Whether account is blocked from trading
  isDayTrader?: boolean;     // Whether account is flagged as pattern day trader
  lastUpdated: number;       // Timestamp when account was last updated
}

/**
 * BrokerAggregator provides a unified interface for connecting to and trading with
 * multiple brokers. It handles authentication, order execution, and fetching account
 * and position information from various supported brokers.
 */
export class BrokerAggregator {
  // Map of broker services by broker name
  private brokerServices: Map<string, any> = new Map();
  
  /**
   * Initialize the broker aggregator
   * This should be called on server startup
   */
  async initialize(): Promise<void> {
    // Initialize broker types in the database
    await brokerConnectionService.initializeBrokerTypes();
    console.log('Broker aggregator initialized');
  }
  
  /**
   * Get broker service instance for a specific connection
   * This dynamically loads the appropriate broker service and initializes it
   */
  private async getBrokerService(connectionId: number): Promise<any> {
    // Check if we already have this broker service initialized
    if (this.brokerServices.has(connectionId.toString())) {
      return this.brokerServices.get(connectionId.toString());
    }
    
    // Get the broker connection
    const connection = await brokerConnectionService.getBrokerConnection(connectionId);
    if (!connection) {
      throw new Error(`Broker connection with ID ${connectionId} not found`);
    }
    
    // Get the broker type
    const brokerType = await brokerConnectionService.getBrokerTypeById(connection.brokerTypeId);
    if (!brokerType) {
      throw new Error(`Broker type with ID ${connection.brokerTypeId} not found`);
    }
    
    // Get decrypted credentials
    const credentials = await brokerConnectionService.getDecryptedCredentials(connectionId);
    if (!credentials) {
      throw new Error(`Could not retrieve credentials for broker connection ${connectionId}`);
    }
    
    // Initialize the appropriate broker service based on broker type
    let brokerService;
    
    try {
      switch (brokerType.name) {
        case 'alpaca':
          // Lazy-load the Alpaca service
          const { AlpacaService } = await import('./services/alpaca-service');
          brokerService = new AlpacaService(
            credentials.apiKey,
            credentials.secretKey,
            !connection.isLiveTrading // use paper trading if not live
          );
          break;
          
        case 'oanda':
          // Lazy-load the OANDA service
          const { OandaService } = await import('./services/oanda-service');
          brokerService = new OandaService(
            credentials.apiKey,
            credentials.accountId,
            !connection.isLiveTrading // use demo account if not live
          );
          break;
          
        case 'tradovate':
          // Lazy-load the Tradovate service
          const { TradovateService } = await import('./services/tradovate-service');
          brokerService = new TradovateService(
            credentials.username,
            credentials.password,
            !connection.isLiveTrading // use demo account if not live
          );
          break;
          
        case 'binance':
          // Lazy-load the Binance service
          const { BinanceService } = await import('./services/binance-service');
          brokerService = new BinanceService(
            credentials.apiKey,
            credentials.secretKey
          );
          break;
          
        case 'kraken':
          // Lazy-load the Kraken service
          const { KrakenService } = await import('./services/kraken-service');
          brokerService = new KrakenService(
            credentials.apiKey,
            credentials.secretKey
          );
          break;
          
        default:
          throw new Error(`Unsupported broker type: ${brokerType.name}`);
      }
      
      // Connect to the broker API
      await brokerService.connect();
      
      // Update the last connected timestamp
      await brokerConnectionService.updateBrokerConnection(connectionId, {
        // Don't update credentials, just the timestamp
      });
      
      // Cache the broker service
      this.brokerServices.set(connectionId.toString(), brokerService);
      
      return brokerService;
    } catch (error) {
      console.error(`Failed to initialize broker service for ${brokerType.name}:`, error);
      throw new Error(`Failed to connect to ${brokerType.displayName}: ${error.message}`);
    }
  }
  
  /**
   * Get account information for a broker connection
   */
  async getAccountInfo(connectionId: number): Promise<AccountInfo> {
    try {
      const brokerService = await this.getBrokerService(connectionId);
      const connection = await brokerConnectionService.getBrokerConnection(connectionId);
      
      if (!brokerService || !connection) {
        throw new Error('Broker service or connection not found');
      }
      
      const brokerType = await brokerConnectionService.getBrokerTypeById(connection.brokerTypeId);
      
      // Get account balance from the broker service
      const balance = await brokerService.getBalance();
      
      // Transform the broker-specific balance into our standardized format
      return {
        accountId: connection.id.toString(),
        accountNumber: connection.accountId || connection.id.toString(),
        accountType: 'margin', // Default to margin, would need to be retrieved from specific broker
        accountName: connection.connectionName,
        cash: balance.cash,
        equity: balance.total,
        longMarketValue: Math.max(0, balance.positions),
        shortMarketValue: Math.max(0, -balance.positions),
        buyingPower: balance.cash * 2, // Simplified - would come from broker
        currency: 'USD', // Default - would come from broker
        isLive: connection.isLiveTrading,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error(`Failed to get account info for connection ${connectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get positions for a broker connection
   */
  async getPositions(connectionId: number): Promise<PositionInfo[]> {
    try {
      const brokerService = await this.getBrokerService(connectionId);
      
      // Get positions from the broker service
      const positions = await brokerService.getPositions();
      
      // Transform the broker-specific positions into our standardized format
      return positions.map(position => {
        const isShort = position.quantity < 0;
        
        return {
          symbol: position.symbol,
          quantity: position.quantity,
          entryPrice: position.averagePrice,
          currentPrice: position.currentPrice,
          marketValue: position.quantity * position.currentPrice,
          unrealizedPnl: position.pnl,
          unrealizedPnlPercent: position.pnl / (position.averagePrice * Math.abs(position.quantity)) * 100,
          costBasis: position.averagePrice * Math.abs(position.quantity),
          assetType: this.determineAssetType(position.symbol),
          lastUpdated: Date.now()
        };
      });
    } catch (error) {
      console.error(`Failed to get positions for connection ${connectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Place an order with a broker
   */
  async placeOrder(connectionId: number, order: OrderRequest): Promise<OrderResponse> {
    try {
      const brokerService = await this.getBrokerService(connectionId);
      
      // Format the order for the specific broker
      const formattedOrder = {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        type: order.type === 'market' ? 'market' : 'limit',
        limitPrice: order.limitPrice
      };
      
      // Place the order with the broker service
      const orderId = await brokerService.placeOrder(formattedOrder);
      
      // Return a standardized response
      return {
        success: true,
        orderId,
        clientOrderId: order.clientOrderId,
        status: 'accepted',
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    } catch (error) {
      console.error(`Failed to place order for connection ${connectionId}:`, error);
      
      // Return a standardized error response
      return {
        success: false,
        clientOrderId: order.clientOrderId,
        status: 'rejected',
        reason: error.message,
        createdAt: Date.now(),
        updatedAt: Date.now()
      };
    }
  }
  
  /**
   * Get order history for a broker connection
   */
  async getOrderHistory(connectionId: number): Promise<any[]> {
    try {
      const brokerService = await this.getBrokerService(connectionId);
      
      // Get order history from the broker service
      const orders = await brokerService.getOrderHistory();
      
      // Return the orders directly - they're already in a standard format from the broker service
      return orders;
    } catch (error) {
      console.error(`Failed to get order history for connection ${connectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Get current quote for a symbol through a broker connection
   */
  async getQuote(connectionId: number, symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number; }> {
    try {
      const brokerService = await this.getBrokerService(connectionId);
      
      // Get quote from the broker service
      const quote = await brokerService.getQuote(symbol);
      
      if (!quote) {
        throw new Error(`Failed to get quote for ${symbol}`);
      }
      
      // Return a standardized quote
      return {
        symbol,
        bid: quote.bid,
        ask: quote.ask,
        last: (quote.bid + quote.ask) / 2 // Approximate last price as mid-price
      };
    } catch (error) {
      console.error(`Failed to get quote for ${symbol} using connection ${connectionId}:`, error);
      throw error;
    }
  }
  
  /**
   * Helper method to determine asset type from symbol
   */
  private determineAssetType(symbol: string): 'stock' | 'option' | 'future' | 'forex' | 'crypto' {
    // This is a simplified approach - would need more sophisticated logic
    if (symbol.includes('/')) {
      return 'forex';
    } else if (symbol.includes('-')) {
      return 'future';
    } else if (symbol.length <= 5 && /^[A-Z]+$/.test(symbol)) {
      return 'stock';
    } else if (symbol.length > 6 && (symbol.startsWith('BTC') || symbol.startsWith('ETH'))) {
      return 'crypto';
    } else if (symbol.includes('_')) {
      return 'option';
    }
    
    return 'stock'; // Default
  }
  
  /**
   * Validate a broker connection by testing credentials
   */
  async validateConnection(connectionId: number): Promise<boolean> {
    try {
      // Try to get and initialize the broker service, which will validate credentials
      await this.getBrokerService(connectionId);
      return true;
    } catch (error) {
      console.error(`Connection validation failed for ID ${connectionId}:`, error);
      return false;
    }
  }
}

// Export a singleton instance
const brokerAggregator = new BrokerAggregator();
export default brokerAggregator;