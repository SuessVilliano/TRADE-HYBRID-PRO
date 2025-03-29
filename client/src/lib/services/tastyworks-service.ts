/**
 * Tastyworks Service - for options trading
 * This service handles interactions with the Tastyworks API
 */

import { MarketData, BrokerService, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

// Interfaces for Tastyworks
interface TastyworksConfig {
  apiKey: string;
  accountId: string;
  baseUrl: string;
  isTestnet: boolean;
}

// Types for Tastyworks-specific responses
interface TastyworksOrderHistory {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  status: string;
}

interface TastyworksAccountBalance {
  cash: number;
  positions: number;
  buyingPower: number;
  maintenanceMargin: number;
}

interface TastyworksBrokerPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

/**
 * Tastyworks Service implementation for options trading
 */
export class TastyworksService implements BrokerService {
  private apiKey: string;
  private accountId: string;
  private baseUrl: string = 'https://api.tastyworks.com/v1';
  private isConnected: boolean = false;
  private isTestnet: boolean = true;
  private headers: { [key: string]: string } = {};

  constructor(apiKey: string, accountId: string, isTestnet: boolean = true) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.isTestnet = isTestnet;

    // Set the base URL based on whether we're using the testnet or not
    if (isTestnet) {
      this.baseUrl = 'https://demo-api.tastyworks.com/v1';
    }

    // Set up default headers for API requests
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'Accept': 'application/json'
    };
  }

  /**
   * Connect to the Tastyworks API
   */
  async connect(): Promise<void> {
    try {
      // Authenticate with the Tastyworks API
      console.log(`Connecting to Tastyworks API, account ${this.accountId}, testnet: ${this.isTestnet ? 'demo' : 'live'}`);
      
      // Make a test request to validate the API key and account ID
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/balances`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to connect to Tastyworks: ${errorData.error || response.statusText}`);
      }

      // Set connected state
      this.isConnected = true;
      console.log('Successfully connected to Tastyworks API');
    } catch (error) {
      console.error('Error connecting to Tastyworks:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Get order history from Tastyworks
   */
  async getOrderHistory(): Promise<OrderHistory[]> {
    this.ensureConnected();

    try {
      // Fetch order history from Tastyworks
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch order history: ${errorData.error || response.statusText}`);
      }

      // Convert Tastyworks order data to our format
      const tastyworksOrders = await response.json();
      return tastyworksOrders.data.map((order: any) => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side as 'buy' | 'sell',
        quantity: order.quantity,
        price: order.price,
        timestamp: new Date(order.created_at).getTime(),
        status: this.mapOrderStatus(order.status),
        broker: 'tastyworks'
      }));
    } catch (error) {
      console.error('Error fetching Tastyworks order history:', error);
      throw error;
    }
  }

  /**
   * Get account balance from Tastyworks
   */
  async getBalance(): Promise<AccountBalance> {
    this.ensureConnected();

    try {
      // Fetch account balance from Tastyworks
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/balances`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch account balance: ${errorData.error || response.statusText}`);
      }

      // Convert Tastyworks balance data to our format
      const tastyworksBalance = await response.json();
      const cash = tastyworksBalance.cash || 0;
      const positions = tastyworksBalance.positions_value || 0;
      
      return {
        cash: cash,
        positions: positions,
        total: cash + positions
      };
    } catch (error) {
      console.error('Error fetching Tastyworks account balance:', error);
      throw error;
    }
  }

  /**
   * Get positions from Tastyworks
   */
  async getPositions(): Promise<BrokerPosition[]> {
    this.ensureConnected();

    try {
      // Fetch positions from Tastyworks
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/positions`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch positions: ${errorData.error || response.statusText}`);
      }

      // Convert Tastyworks position data to our format
      const tastyworksPositions = await response.json();
      return tastyworksPositions.data.map((position: any) => ({
        symbol: position.symbol,
        quantity: position.quantity,
        averagePrice: position.average_price,
        currentPrice: position.current_price,
        pnl: position.unrealized_pnl
      }));
    } catch (error) {
      console.error('Error fetching Tastyworks positions:', error);
      throw error;
    }
  }

  /**
   * Place an order with Tastyworks
   */
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    this.ensureConnected();

    try {
      // Prepare the order payload for Tastyworks
      const orderPayload = {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        order_type: order.type,
        price: order.type === 'limit' ? order.limitPrice : undefined,
        time_in_force: 'day'
      };

      // Place the order with Tastyworks
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to place order: ${errorData.error || response.statusText}`);
      }

      // Get the order ID from the response
      const orderResponse = await response.json();
      return orderResponse.order_id;
    } catch (error) {
      console.error('Error placing Tastyworks order:', error);
      throw error;
    }
  }

  // Subscription mechanism for market data
  private _marketDataSubscriptions: { [symbol: string]: NodeJS.Timeout } = {};

  /**
   * Subscribe to market data for a symbol
   */
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // If already subscribed, clear the existing interval
    if (this._marketDataSubscriptions[symbol]) {
      clearInterval(this._marketDataSubscriptions[symbol]);
    }

    // Set up a subscription for market data
    const intervalId = setInterval(async () => {
      try {
        const data = await this.fetchMarketData(symbol);
        callback(data);
      } catch (error) {
        console.error(`Error fetching market data for ${symbol}:`, error);
      }
    }, 1000);

    // Store the interval ID for cleanup
    this._marketDataSubscriptions[symbol] = intervalId;
  }

  /**
   * Unsubscribe from market data for a symbol
   */
  unsubscribeFromMarketData(symbol: string): void {
    if (this._marketDataSubscriptions[symbol]) {
      clearInterval(this._marketDataSubscriptions[symbol]);
      delete this._marketDataSubscriptions[symbol];
    }
  }

  /**
   * Fetch market data for a symbol
   */
  private async fetchMarketData(symbol: string): Promise<MarketData> {
    this.ensureConnected();

    try {
      // Fetch the latest quote for a symbol
      const response = await fetch(`${this.baseUrl}/market-data/quotes/${symbol}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market data for ${symbol}`);
      }

      const quoteData = await response.json();
      return {
        symbol: symbol,
        price: quoteData.last_price,
        open: quoteData.open_price,
        high: quoteData.high_price,
        low: quoteData.low_price,
        close: quoteData.last_price,
        volume: quoteData.volume,
        timestamp: new Date().getTime()
      };
    } catch (error) {
      console.error(`Error fetching Tastyworks market data for ${symbol}:`, error);
      // Fallback to a simple data structure
      return {
        symbol: symbol,
        price: 0,
        timestamp: new Date().getTime()
      };
    }
  }

  /**
   * Ensure that we're connected to the Tastyworks API
   */
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Tastyworks API. Call connect() first.');
    }
  }

  /**
   * Map Tastyworks order status to our status format
   */
  private mapOrderStatus(status: string): 'filled' | 'pending' | 'cancelled' {
    switch (status.toLowerCase()) {
      case 'filled':
        return 'filled';
      case 'cancelled':
      case 'canceled':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

/**
 * Create a Tastyworks service instance
 */
export function createTastyworksService(apiKey: string, accountId: string, isTestnet: boolean = true): BrokerService {
  return new TastyworksService(apiKey, accountId, isTestnet);
}