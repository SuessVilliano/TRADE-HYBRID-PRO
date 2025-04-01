import crypto from 'crypto';
import axios from 'axios';
import { BrokerService, BrokerOrderRequest, BrokerOrderResponse, BrokerPosition, BrokerAccountInfo } from './broker-service';

/**
 * Service for interacting with Binance API (supports both global and US versions)
 */
export class BinanceService extends BrokerService {
  private baseUrl: string;
  private useTestnet: boolean;
  private isInitialized: boolean = false;
  private region: 'global' | 'us';
  
  constructor(
    apiKey: string, 
    apiSecret: string, 
    isDemo: boolean = false,
    passphrase: string | null = null,
    additionalConfig: Record<string, any> = {}
  ) {
    super(apiKey, apiSecret, isDemo, passphrase, additionalConfig);
    
    this.region = (additionalConfig.region === 'us') ? 'us' : 'global';
    this.useTestnet = isDemo;
    
    // Set the base URL based on region and testnet settings
    if (this.region === 'us') {
      this.baseUrl = this.useTestnet 
        ? 'https://testnet.binance.us/api'  // Binance US testnet
        : 'https://api.binance.us/api';     // Binance US production
    } else {
      this.baseUrl = this.useTestnet 
        ? 'https://testnet.binance.vision/api'  // Binance global testnet
        : 'https://api.binance.com/api';        // Binance global production
    }
  }

  /**
   * Initialize the broker service
   */
  async initialize(): Promise<void> {
    // Basic validation of credentials
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('API key and secret are required for Binance service');
    }
    
    // We could perform additional setup here if needed
    this.isInitialized = true;
  }
  
  /**
   * Create a signature for Binance API requests
   */
  private createSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
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
    // Add timestamp
    const timestamp = Date.now();
    params.timestamp = timestamp;
    
    // Convert params to query string
    const queryString = Object.entries(params)
      .map(([key, value]) => `${key}=${value}`)
      .join('&');
    
    // Create signature
    const signature = this.createSignature(queryString);
    
    // Prepare URL with query string and signature
    const url = `${this.baseUrl}${endpoint}?${queryString}&signature=${signature}`;
    
    // Make the request
    try {
      const response = await axios({
        method,
        url,
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });
      
      return response.data;
    } catch (error: any) {
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error(`Binance API error: ${error.response.status}`, error.response.data);
        throw new Error(`Binance API error: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Binance API error: No response received', error.request);
        throw new Error('Binance API error: No response received');
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Binance API error:', error.message);
        throw new Error(`Binance API error: ${error.message}`);
      }
    }
  }
  
  /**
   * Validate the API credentials by making a test request
   */
  async validateCredentials(): Promise<boolean> {
    try {
      // Try to get account information as a test
      await this.makeSignedRequest('/v3/account');
      return true;
    } catch (error) {
      console.error('Binance credential validation failed:', error);
      return false;
    }
  }
  
  /**
   * Get account information including balances
   */
  async getAccountInfo(): Promise<BrokerAccountInfo> {
    const response = await this.makeSignedRequest('/v3/account');
    
    // Extract balances that have a non-zero amount
    const balances = response.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
    
    // Calculate total equity value in USD (simplified - in a real implementation,
    // you would need to get current prices for each asset and convert to USD)
    let equity = 0;
    let longMarketValue = 0;
    let shortMarketValue = 0;
    
    for (const balance of balances) {
      // For simplicity, we'll just add up the free and locked amounts
      // In a real implementation, you'd convert to USD based on current prices
      const value = parseFloat(balance.free) + parseFloat(balance.locked);
      
      // For crypto holdings, we consider them as long positions
      if (balance.asset !== 'USDT' && balance.asset !== 'USD' && balance.asset !== 'BUSD') {
        longMarketValue += value;
      }
    }
    
    // Look for USDT or USD balance
    const usdtBalance = balances.find((b: any) => b.asset === 'USDT' || b.asset === 'USD' || b.asset === 'BUSD');
    const cash = usdtBalance ? parseFloat(usdtBalance.free) : 0;
    
    // Total equity is cash + long positions - short positions
    equity = cash + longMarketValue - shortMarketValue;
    
    return {
      accountId: response.accountType || 'binance',
      accountType: 'margin', // Binance supports margin trading
      accountName: this.region === 'us' ? 'Binance US' : 'Binance',
      cash,
      equity,
      longMarketValue,
      shortMarketValue,
      buyingPower: cash, // Simplified - in reality would depend on margin level
      currency: 'USD',
      isLive: !this.useTestnet,
      lastUpdated: Date.now()
    };
  }
  
  /**
   * Get current positions (holdings)
   */
  async getPositions(): Promise<BrokerPosition[]> {
    // Get account info which includes balances
    const accountInfo = await this.makeSignedRequest('/v3/account');
    
    // Filter non-zero balances
    const balances = accountInfo.balances
      .filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0)
      // Exclude stablecoins which we treat as cash
      .filter((b: any) => !['USDT', 'BUSD', 'USD', 'DAI', 'USDC'].includes(b.asset));
    
    // For each balance, we need price info to calculate market value
    const positions: BrokerPosition[] = [];
    
    for (const balance of balances) {
      const symbol = `${balance.asset}USDT`;
      const quantity = parseFloat(balance.free) + parseFloat(balance.locked);
      
      // Skip if quantity is too small
      if (quantity < 0.00001) continue;
      
      try {
        // Get current price
        const priceInfo = await axios.get(`${this.baseUrl}/v3/ticker/price?symbol=${symbol}`);
        const currentPrice = parseFloat(priceInfo.data.price);
        
        // We don't have entry price from Binance API directly, so we'll use
        // the current price for cost basis as an approximation
        const entryPrice = currentPrice;
        const marketValue = quantity * currentPrice;
        
        positions.push({
          symbol: balance.asset,
          quantity,
          entryPrice,
          currentPrice,
          marketValue,
          unrealizedPnl: 0, // Without entry price history, we can't calculate this accurately
          unrealizedPnlPercent: 0,
          costBasis: marketValue,
          assetType: 'crypto',
          lastUpdated: Date.now()
        });
      } catch (error) {
        console.error(`Error getting price for ${symbol}:`, error);
        // Skip this position if we can't get price info
      }
    }
    
    return positions;
  }
  
  /**
   * Place an order with Binance
   */
  async placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse> {
    // Map order type to Binance order type
    const orderType = this.mapOrderType(order.type);
    
    // Build params for the order
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      type: orderType,
      quantity: order.quantity
    };
    
    // Add price for limit orders
    if (order.type === 'limit' && order.limitPrice) {
      params.price = order.limitPrice;
    }
    
    // Add stop price for stop orders
    if ((order.type === 'stop' || order.type === 'stop_limit') && order.stopPrice) {
      params.stopPrice = order.stopPrice;
    }
    
    // Add time in force for limit orders
    if (order.type === 'limit' && order.timeInForce) {
      params.timeInForce = this.mapTimeInForce(order.timeInForce);
    } else if (order.type === 'limit') {
      // Default to GTC for limit orders
      params.timeInForce = 'GTC';
    }
    
    // Add client order ID if provided
    if (order.clientOrderId) {
      params.newClientOrderId = order.clientOrderId;
    }
    
    try {
      // Place the order
      const response = await this.makeSignedRequest('/v3/order', 'POST', params);
      
      // Map the response to our standard format
      return {
        success: true,
        orderId: response.orderId?.toString(),
        clientOrderId: response.clientOrderId,
        status: this.mapOrderStatus(response.status),
        filledQuantity: parseFloat(response.executedQty) || 0,
        remainingQuantity: order.quantity - (parseFloat(response.executedQty) || 0),
        avgFillPrice: parseFloat(response.price) || undefined,
        createdAt: response.transactTime || Date.now(),
        updatedAt: Date.now(),
        raw: response
      };
    } catch (error: any) {
      console.error('Error placing order:', error);
      
      return {
        success: false,
        status: 'rejected',
        reason: error.message,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        raw: error
      };
    }
  }
  
  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    // Get open orders
    const openOrders = await this.makeSignedRequest('/v3/openOrders');
    
    // Get completed orders (last 7 days by default)
    const allOrders = await this.makeSignedRequest('/v3/allOrders');
    
    // Combine and process the orders
    const combinedOrders = [...openOrders, ...allOrders]
      // Remove duplicates based on orderId
      .filter((order, index, self) => 
        index === self.findIndex(o => o.orderId === order.orderId)
      )
      // Sort by time, newest first
      .sort((a, b) => b.time - a.time);
    
    return combinedOrders;
  }
  
  /**
   * Get a quote for a symbol
   */
  async getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number; }> {
    // Ensure symbol is in the correct format for Binance (e.g., BTCUSDT)
    const formattedSymbol = symbol.includes('USDT') ? symbol : `${symbol}USDT`;
    
    try {
      // Get order book data
      const orderBook = await axios.get(`${this.baseUrl}/v3/ticker/bookTicker?symbol=${formattedSymbol}`);
      
      // Get latest price
      const priceInfo = await axios.get(`${this.baseUrl}/v3/ticker/price?symbol=${formattedSymbol}`);
      
      return {
        symbol,
        bid: parseFloat(orderBook.data.bidPrice),
        ask: parseFloat(orderBook.data.askPrice),
        last: parseFloat(priceInfo.data.price)
      };
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      throw new Error(`Failed to get quote for ${symbol}`);
    }
  }
  
  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    // Get current positions to find the one we want to close
    const positions = await this.getPositions();
    const position = positions.find(p => p.symbol === symbol);
    
    if (!position) {
      throw new Error(`No position found for symbol ${symbol}`);
    }
    
    // Determine quantity to close (all if not specified)
    const closeQuantity = quantity || position.quantity;
    
    // Create an order to close the position
    // The side is opposite of the position (sell to close a long position)
    const order: BrokerOrderRequest = {
      symbol: `${symbol}USDT`,  // Binance uses pairs like BTCUSDT
      quantity: closeQuantity,
      side: 'sell',  // For crypto, we're always closing by selling
      type: 'market'
    };
    
    return this.placeOrder(order);
  }
  
  /**
   * Cancel an open order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      // We need the symbol for the order, so first get all open orders
      const openOrders = await this.makeSignedRequest('/v3/openOrders');
      
      // Find the order with the matching ID
      const order = openOrders.find((o: any) => o.orderId.toString() === orderId);
      
      if (!order) {
        throw new Error(`Order ${orderId} not found or already closed`);
      }
      
      // Cancel the order
      await this.makeSignedRequest('/v3/order', 'DELETE', {
        symbol: order.symbol,
        orderId
      });
      
      return true;
    } catch (error) {
      console.error(`Error canceling order ${orderId}:`, error);
      return false;
    }
  }
  
  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    // Need to know the symbol for the order
    const openOrders = await this.makeSignedRequest('/v3/openOrders');
    
    // Try to find the order in open orders
    let order = openOrders.find((o: any) => o.orderId.toString() === orderId);
    
    if (!order) {
      // If not found in open orders, try to find in all orders (requires symbol)
      const allOrders = await this.makeSignedRequest('/v3/allOrders');
      order = allOrders.find((o: any) => o.orderId.toString() === orderId);
    }
    
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    // Get detailed order info
    return this.makeSignedRequest('/v3/order', 'GET', {
      symbol: order.symbol,
      orderId
    });
  }
  
  /**
   * Map Binance order status to standard status
   */
  private mapOrderStatus(binanceStatus: string): 'accepted' | 'rejected' | 'filled' | 'partial_fill' | 'canceled' | 'pending' {
    switch (binanceStatus) {
      case 'NEW':
        return 'accepted';
      case 'FILLED':
        return 'filled';
      case 'PARTIALLY_FILLED':
        return 'partial_fill';
      case 'CANCELED':
      case 'EXPIRED':
      case 'REJECTED':
        return 'canceled';
      case 'PENDING_CANCEL':
        return 'pending';
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
        return 'DAY';  // Not directly supported, using GTC
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