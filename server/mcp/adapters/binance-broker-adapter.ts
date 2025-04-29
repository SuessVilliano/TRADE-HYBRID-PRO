/**
 * Binance US Broker Adapter
 * 
 * Handles connections and trade execution with Binance US
 * Specializes in cryptocurrency trading
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';
import crypto from 'crypto';

/**
 * Binance US Broker Connection
 * Implementation of BrokerConnection for Binance US
 */
export class BinanceBrokerConnection implements BrokerConnection {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;

  constructor(config: { apiKey: string, apiSecret: string, usGlobal?: 'us' | 'global' }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    
    // Use US or Global API
    if (config.usGlobal === 'us') {
      this.baseUrl = 'https://api.binance.us';
    } else {
      this.baseUrl = 'https://api.binance.com';
    }
    
    console.log(`Binance broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return this.baseUrl.includes('binance.us') ? 'Binance US' : 'Binance Global';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to Binance API
   */
  async connect(): Promise<boolean> {
    try {
      // Test API key validity by getting account information
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to connect to Binance: ${response.status} ${errorText}`);
        this.connected = false;
        return false;
      }

      this.accountInfo = await response.json();
      this.connected = true;
      console.log(`Connected to Binance account: ${this.accountInfo.accountType || 'standard'}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Binance:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from Binance
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accountInfo = null;
    console.log('Disconnected from Binance');
  }

  /**
   * Execute a market order on Binance
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Binance API');
      }
    }

    try {
      // Build order parameters
      const timestamp = Date.now();
      const orderParams = new URLSearchParams({
        symbol: params.symbol.replace('/', ''), // Remove / from symbol if present
        side: params.side.toUpperCase(),
        type: 'MARKET',
        quantity: params.quantity.toString(),
        timestamp: timestamp.toString()
      });
      
      const signature = this.generateSignature(orderParams.toString());
      
      // Execute the order
      const response = await fetch(`${this.baseUrl}/api/v3/order?${orderParams.toString()}&signature=${signature}`, {
        method: 'POST',
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Binance order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      console.log(`Binance order executed: ${orderResult.orderId}`);
      
      // Handle stop loss and take profit (separate orders in Binance)
      const promises = [];
      
      if (params.stopLoss) {
        promises.push(this.createStopLossOrder(
          params.symbol.replace('/', ''),
          params.side,
          params.quantity,
          params.stopLoss
        ));
      }
      
      if (params.takeProfit) {
        promises.push(this.createTakeProfitOrder(
          params.symbol.replace('/', ''),
          params.side,
          params.quantity,
          params.takeProfit
        ));
      }
      
      // Wait for stop loss and take profit orders to be placed
      if (promises.length > 0) {
        await Promise.all(promises);
      }
      
      return orderResult;
    } catch (error) {
      console.error('Error executing Binance market order:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Binance API');
      }
    }

    try {
      // Refresh account info
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const response = await fetch(`${this.baseUrl}/api/v3/account?${queryString}&signature=${signature}`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Binance account info: ${response.status} ${errorText}`);
      }

      this.accountInfo = await response.json();
      
      // Calculate total balance in USD (simplified)
      const balances = this.accountInfo.balances || [];
      let totalUsdBalance = 0;
      
      // Find USDT balance as a simple base for USD value
      const usdtBalance = balances.find((b: any) => b.asset === 'USDT');
      if (usdtBalance) {
        totalUsdBalance += parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked);
      }
      
      // In a real implementation, we would fetch ticker prices and convert other assets to USD
      
      return {
        accountId: this.accountInfo.accountType || 'standard',
        totalBalance: totalUsdBalance,
        balances: balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0),
        canTrade: this.accountInfo.canTrade,
        canDeposit: this.accountInfo.canDeposit,
        canWithdraw: this.accountInfo.canWithdraw,
        buyerCommission: this.accountInfo.buyerCommission,
        sellerCommission: this.accountInfo.sellerCommission,
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting Binance account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions (open orders in Binance)
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Binance API');
      }
    }

    try {
      // Get open orders
      const timestamp = Date.now();
      const queryString = `timestamp=${timestamp}`;
      const signature = this.generateSignature(queryString);
      
      const response = await fetch(`${this.baseUrl}/api/v3/openOrders?${queryString}&signature=${signature}`, {
        method: 'GET',
        headers: {
          'X-MBX-APIKEY': this.apiKey
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Binance open orders: ${response.status} ${errorText}`);
      }

      const openOrders = await response.json();
      
      // Map to standard format
      return openOrders.map((order: any) => ({
        symbol: order.symbol,
        side: order.side.toLowerCase(),
        quantity: parseFloat(order.origQty),
        remainingQuantity: parseFloat(order.origQty) - parseFloat(order.executedQty),
        price: parseFloat(order.price),
        orderType: order.type.toLowerCase(),
        orderId: order.orderId,
        orderTime: new Date(order.time).toISOString(),
        metadata: order
      }));
    } catch (error) {
      console.error('Error getting Binance open orders:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Crypto'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('Binance connection test failed:', error);
      return false;
    }
  }

  /**
   * Generate HMAC SHA256 signature for Binance API
   */
  private generateSignature(queryString: string): string {
    return crypto
      .createHmac('sha256', this.apiSecret)
      .update(queryString)
      .digest('hex');
  }

  /**
   * Create a stop loss order
   */
  private async createStopLossOrder(
    symbol: string,
    entrySide: 'buy' | 'sell',
    quantity: number,
    stopPrice: number
  ): Promise<any> {
    // Stop loss is opposite of entry side
    const exitSide = entrySide === 'buy' ? 'SELL' : 'BUY';
    
    const timestamp = Date.now();
    const orderParams = new URLSearchParams({
      symbol: symbol,
      side: exitSide,
      type: 'STOP_LOSS',
      quantity: quantity.toString(),
      stopPrice: stopPrice.toString(),
      timestamp: timestamp.toString(),
      timeInForce: 'GTC'
    });
    
    const signature = this.generateSignature(orderParams.toString());
    
    const response = await fetch(`${this.baseUrl}/api/v3/order?${orderParams.toString()}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create Binance stop loss: ${response.status} ${errorText}`);
      return null;
    }
    
    const result = await response.json();
    console.log(`Binance stop loss created: ${result.orderId}`);
    return result;
  }

  /**
   * Create a take profit order
   */
  private async createTakeProfitOrder(
    symbol: string,
    entrySide: 'buy' | 'sell',
    quantity: number,
    limitPrice: number
  ): Promise<any> {
    // Take profit is opposite of entry side
    const exitSide = entrySide === 'buy' ? 'SELL' : 'BUY';
    
    const timestamp = Date.now();
    const orderParams = new URLSearchParams({
      symbol: symbol,
      side: exitSide,
      type: 'LIMIT',
      quantity: quantity.toString(),
      price: limitPrice.toString(),
      timestamp: timestamp.toString(),
      timeInForce: 'GTC'
    });
    
    const signature = this.generateSignature(orderParams.toString());
    
    const response = await fetch(`${this.baseUrl}/api/v3/order?${orderParams.toString()}&signature=${signature}`, {
      method: 'POST',
      headers: {
        'X-MBX-APIKEY': this.apiKey
      }
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create Binance take profit: ${response.status} ${errorText}`);
      return null;
    }
    
    const result = await response.json();
    console.log(`Binance take profit created: ${result.orderId}`);
    return result;
  }
}

/**
 * Binance Broker Adapter Factory
 */
export class BinanceBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to Binance
   */
  createConnection(config: any): BrokerConnection {
    return new BinanceBrokerConnection(config);
  }

  /**
   * Get the connection type needed for Binance
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.API_KEY_SECRET;
  }

  /**
   * Get Binance capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: true,
      supportsStocks: false,
      supportsForex: false,
      supportsFutures: true,
      supportsOptions: false,
      supportsFractionalShares: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for Binance
   */
  getRequiredFields(): string[] {
    return ['apiKey', 'apiSecret', 'usGlobal'];
  }
}

/**
 * Create and register a Binance broker adapter
 */
export function createBinanceAdapter(
  apiKey: string, 
  apiSecret: string, 
  usGlobal: 'us' | 'global' = 'us'
): BrokerConnection {
  const factory = new BinanceBrokerAdapterFactory();
  return factory.createConnection({ apiKey, apiSecret, usGlobal });
}