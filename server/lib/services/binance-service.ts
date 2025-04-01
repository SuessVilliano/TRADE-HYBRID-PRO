import axios from 'axios';
import crypto from 'crypto';
import { 
  BrokerService,
  BrokerAccountInfo,
  BrokerPosition,
  BrokerOrderRequest,
  BrokerOrderResponse
} from './broker-service';
import { BrokerCredentials } from './broker-connection-service';

/**
 * Service for interacting with Binance API (supports both global and US versions)
 */
export class BinanceService extends BrokerService {
  private baseUrl: string;
  private useTestnet: boolean;
  private isInitialized: boolean = false;
  private region: 'global' | 'us';
  
  private credentials: {
    apiKey: string;
    secretKey: string;
  };
  
  constructor(
    credentials: BrokerCredentials,
    options: {
      region?: 'global' | 'us';
      useTestnet?: boolean;
    } = {}
  ) {
    super();
    
    if (!credentials.apiKey || !credentials.secretKey) {
      throw new Error('API key and secret key are required for Binance service');
    }
    
    this.credentials = {
      apiKey: credentials.apiKey,
      secretKey: credentials.secretKey
    };
    
    this.region = options.region || 'global';
    this.useTestnet = options.useTestnet || false;
    
    // Set the base URL based on region and testnet settings
    if (this.region === 'global') {
      this.baseUrl = this.useTestnet
        ? 'https://testnet.binance.vision/api'
        : 'https://api.binance.com/api';
    } else {
      // US
      this.baseUrl = this.useTestnet
        ? 'https://api.binance.us/api' // No testnet for US currently
        : 'https://api.binance.us/api';
    }
  }
  
  /**
   * Initialize the broker service
   */
  async initialize(): Promise<void> {
    try {
      // Validate credentials as initialization
      const isValid = await this.validateCredentials();
      
      if (!isValid) {
        throw new Error('Failed to validate Binance API credentials');
      }
      
      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize Binance service:', error);
      throw error;
    }
  }
  
  /**
   * Create a signature for Binance API requests
   */
  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.credentials.secretKey)
      .update(queryString)
      .digest('hex');
  }
  
  /**
   * Make a signed request to the Binance API
   */
  private async makeSignedRequest(
    endpoint: string,
    method: 'GET' | 'POST' | 'DELETE' = 'GET',
    params: Record<string, any> = {}
  ): Promise<any> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }
      
      // Add timestamp to params
      params.timestamp = Date.now();
      
      // Convert params to query string
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&');
      
      // Create signature
      const signature = this.createSignature(queryString);
      
      // Add signature to query string
      const requestUrl = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;
      
      // Make the request
      const response = await axios({
        method,
        url: requestUrl,
        headers: {
          'X-MBX-APIKEY': this.credentials.apiKey
        }
      });
      
      return response.data;
    } catch (error: any) {
      console.error('Binance API request failed:', error.response?.data || error.message);
      throw error;
    }
  }
  
  /**
   * Validate the API credentials by making a test request
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Make a simple API request that requires authentication
      await axios.get(`${this.baseUrl}/v3/account`, {
        headers: { 'X-MBX-APIKEY': this.credentials.apiKey },
        params: {
          timestamp: Date.now(),
          signature: this.createSignature(`timestamp=${Date.now()}`)
        }
      });
      
      return true;
    } catch (error: any) {
      console.error('Binance credentials validation failed:', error.response?.data || error.message);
      return false;
    }
  }
  
  /**
   * Get account information including balances
   */
  async getAccountInfo(): Promise<BrokerAccountInfo> {
    try {
      const account = await this.makeSignedRequest('/v3/account');
      
      // Find USDT balance (or first non-zero balance)
      const usdtBalance = account.balances.find((b: any) => b.asset === 'USDT') || 
                          account.balances.find((b: any) => parseFloat(b.free) > 0);
      
      return {
        accountId: account.accountId?.toString() || 'unknown',
        accountType: 'spot',
        balance: parseFloat(usdtBalance?.free || '0'),
        equity: parseFloat(usdtBalance?.free || '0') + parseFloat(usdtBalance?.locked || '0'),
        marginAvailable: parseFloat(usdtBalance?.free || '0'),
        marginUsed: parseFloat(usdtBalance?.locked || '0'),
        currency: usdtBalance?.asset || 'USDT',
        positions: [] // Will be populated separately by getPositions
      };
    } catch (error) {
      console.error('Error getting Binance account info:', error);
      throw error;
    }
  }
  
  /**
   * Get current positions (holdings)
   */
  async getPositions(): Promise<BrokerPosition[]> {
    try {
      // First get all balances
      const account = await this.makeSignedRequest('/v3/account');
      
      // Filter for non-zero balances
      const nonZeroBalances = account.balances.filter((b: any) => 
        parseFloat(b.free) > 0 || parseFloat(b.locked) > 0
      );
      
      const positions: BrokerPosition[] = [];
      
      // For each balance, get current price and calculate position details
      for (const balance of nonZeroBalances) {
        // Skip stablecoins and fiat
        if (['USDT', 'BUSD', 'USDC', 'DAI', 'USD', 'EUR', 'GBP'].includes(balance.asset)) {
          continue;
        }
        
        const quantity = parseFloat(balance.free) + parseFloat(balance.locked);
        
        if (quantity <= 0) continue;
        
        // Get current price
        const symbol = `${balance.asset}USDT`;
        let marketPrice = 0;
        
        try {
          const ticker = await axios.get(`${this.baseUrl}/v3/ticker/price`, {
            params: { symbol }
          });
          marketPrice = parseFloat(ticker.data.price);
        } catch (e) {
          // Skip if we can't get price for this symbol
          continue;
        }
        
        const marketValue = quantity * marketPrice;
        
        // We don't have entry price from Binance, so unrealized PnL is estimated
        positions.push({
          symbol: balance.asset,
          quantity,
          entryPrice: 0, // Not available from Binance
          marketPrice,
          marketValue,
          unrealizedPnL: 0, // Can't calculate without entry price
          side: 'long',
        });
      }
      
      return positions;
    } catch (error) {
      console.error('Error getting Binance positions:', error);
      throw error;
    }
  }
  
  /**
   * Place an order with Binance
   */
  async placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse> {
    try {
      const params: Record<string, any> = {
        symbol: order.symbol,
        side: order.side.toUpperCase(),
        type: this.mapOrderType(order.type),
        quantity: order.quantity
      };
      
      // Add price for limit orders
      if (order.type === 'limit' && order.price) {
        params.price = order.price;
        params.timeInForce = this.mapTimeInForce(order.timeInForce);
      }
      
      // Add stop price for stop orders
      if ((order.type === 'stop' || order.type === 'stop_limit') && order.stopPrice) {
        params.stopPrice = order.stopPrice;
      }
      
      // Add client order ID if provided
      if (order.clientOrderId) {
        params.newClientOrderId = order.clientOrderId;
      }
      
      const response = await this.makeSignedRequest('/v3/order', 'POST', params);
      
      return {
        orderId: response.orderId.toString(),
        status: this.mapOrderStatus(response.status),
        filledQuantity: parseFloat(response.executedQty),
        averagePrice: parseFloat(response.price),
        message: '',
        orderRequest: order
      };
    } catch (error: any) {
      console.error('Error placing Binance order:', error.response?.data || error.message);
      
      return {
        orderId: '',
        status: 'rejected',
        message: error.response?.data?.msg || error.message,
        orderRequest: order
      };
    }
  }
  
  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    try {
      const orders = await this.makeSignedRequest('/v3/allOrders');
      
      return orders.map((order: any) => ({
        orderId: order.orderId.toString(),
        symbol: order.symbol,
        side: order.side.toLowerCase(),
        type: this.reverseMapOrderType(order.type),
        price: parseFloat(order.price),
        quantity: parseFloat(order.origQty),
        filledQuantity: parseFloat(order.executedQty),
        status: this.mapOrderStatus(order.status),
        createdAt: new Date(order.time),
        updatedAt: new Date(order.updateTime)
      }));
    } catch (error) {
      console.error('Error getting Binance order history:', error);
      throw error;
    }
  }
  
  /**
   * Get a quote for a symbol
   */
  async getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number; }> {
    try {
      // Get order book
      const orderBook = await axios.get(`${this.baseUrl}/v3/ticker/bookTicker`, {
        params: { symbol }
      });
      
      return {
        symbol,
        bid: parseFloat(orderBook.data.bidPrice),
        ask: parseFloat(orderBook.data.askPrice),
        last: parseFloat(orderBook.data.bidPrice) // Last price not directly available
      };
    } catch (error) {
      console.error('Error getting Binance quote:', error);
      throw error;
    }
  }
  
  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    try {
      // Get the current position
      const positions = await this.getPositions();
      const position = positions.find(p => p.symbol === symbol);
      
      if (!position) {
        throw new Error(`No open position found for ${symbol}`);
      }
      
      // Determine quantity to close
      const closeQuantity = quantity || position.quantity;
      
      // Create sell order to close the position
      const order: BrokerOrderRequest = {
        symbol: symbol + 'USDT', // Assuming USDT pair
        quantity: closeQuantity,
        side: 'sell',
        type: 'market'
      };
      
      return this.placeOrder(order);
    } catch (error) {
      console.error('Error closing Binance position:', error);
      throw error;
    }
  }
  
  /**
   * Cancel an open order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await this.makeSignedRequest('/v3/order', 'DELETE', { orderId });
      return true;
    } catch (error) {
      console.error('Error canceling Binance order:', error);
      return false;
    }
  }
  
  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const order = await this.makeSignedRequest('/v3/order', 'GET', { orderId });
      
      return {
        orderId: order.orderId.toString(),
        symbol: order.symbol,
        side: order.side.toLowerCase(),
        type: this.reverseMapOrderType(order.type),
        price: parseFloat(order.price),
        quantity: parseFloat(order.origQty),
        filledQuantity: parseFloat(order.executedQty),
        status: this.mapOrderStatus(order.status),
        createdAt: new Date(order.time),
        updatedAt: new Date(order.updateTime)
      };
    } catch (error) {
      console.error('Error getting Binance order status:', error);
      throw error;
    }
  }
  
  /**
   * Map Binance order status to standard status
   */
  private mapOrderStatus(binanceStatus: string): 'accepted' | 'rejected' | 'filled' | 'partial_fill' | 'canceled' | 'pending' {
    switch (binanceStatus) {
      case 'NEW':
        return 'accepted';
      case 'PARTIALLY_FILLED':
        return 'partial_fill';
      case 'FILLED':
        return 'filled';
      case 'CANCELED':
      case 'EXPIRED':
      case 'REJECTED':
        return 'canceled';
      default:
        return 'pending';
    }
  }
  
  /**
   * Map standard order type to Binance order type
   */
  private mapOrderType(type: 'market' | 'limit' | 'stop' | 'stop_limit'): string {
    switch (type) {
      case 'market':
        return 'MARKET';
      case 'limit':
        return 'LIMIT';
      case 'stop':
        return 'STOP_LOSS'; 
      case 'stop_limit':
        return 'STOP_LOSS_LIMIT';
      default:
        return 'MARKET';
    }
  }
  
  /**
   * Map Binance order type to standard order type
   */
  private reverseMapOrderType(binanceType: string): 'market' | 'limit' | 'stop' | 'stop_limit' {
    switch (binanceType) {
      case 'MARKET':
        return 'market';
      case 'LIMIT':
        return 'limit';
      case 'STOP_LOSS':
        return 'stop';
      case 'STOP_LOSS_LIMIT':
        return 'stop_limit';
      default:
        return 'market';
    }
  }
  
  /**
   * Map standard time in force to Binance time in force
   */
  private mapTimeInForce(timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok'): string {
    switch (timeInForce) {
      case 'day':
        return 'GTC'; // Binance doesn't have DAY, use GTC
      case 'gtc':
        return 'GTC';
      case 'ioc':
        return 'IOC';
      case 'fok':
        return 'FOK';
      default:
        return 'GTC';
    }
  }
}