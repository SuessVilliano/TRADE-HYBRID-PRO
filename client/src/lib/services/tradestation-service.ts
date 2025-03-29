/**
 * TradeStation Service
 * This service handles interactions with the TradeStation API for multi-asset trading
 */

import { MarketData, BrokerService, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

// Interfaces for TradeStation
interface TradeStationConfig {
  apiKey: string;
  accessToken: string;
  accountId: string;
  baseUrl: string;
  isTestnet: boolean;
}

// Types for TradeStation-specific responses
interface TradeStationOrderHistory {
  orderId: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  status: string;
}

interface TradeStationAccountBalance {
  cash: number;
  positions: number;
  buyingPower: number;
  maintenanceMargin: number;
}

interface TradeStationBrokerPosition {
  symbol: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  pnl: number;
}

/**
 * TradeStation Service implementation for multi-asset trading
 */
export class TradeStationService implements BrokerService {
  private apiKey: string;
  private accessToken: string;
  private accountId: string;
  private baseUrl: string = 'https://api.tradestation.com/v3';
  private isConnected: boolean = false;
  private headers: { [key: string]: string } = {};
  private tokenExpiry: number = 0;
  private isTestnet: boolean = true;

  constructor(apiKey: string, accessToken: string, accountId: string, isTestnet: boolean = true) {
    this.apiKey = apiKey;
    this.accessToken = accessToken;
    this.accountId = accountId;
    this.isTestnet = isTestnet;

    // Set the base URL based on whether we're using the simulation mode or not
    if (isTestnet) {
      this.baseUrl = 'https://sim-api.tradestation.com/v3';
    }

    this.updateHeaders();
  }

  private updateHeaders(): void {
    // Set up default headers for API requests
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.accessToken}`,
      'Accept': 'application/json',
      'X-TS-Client-ID': this.apiKey,
    };
  }

  /**
   * Connect to the TradeStation API
   */
  async connect(): Promise<void> {
    try {
      // Authenticate with the TradeStation API
      console.log(`Connecting to TradeStation API, account ${this.accountId}, simulation: ${this.isTestnet ? 'yes' : 'no'}`);
      
      // Validate token and account
      const tokenValidation = await this.validateToken();
      if (!tokenValidation.valid) {
        throw new Error('Invalid or expired TradeStation access token');
      }
      
      // Set token expiry
      this.tokenExpiry = tokenValidation.expiresAt;
      
      // Validate account
      const accountValid = await this.validateAccount();
      if (!accountValid) {
        throw new Error(`Invalid TradeStation account ID: ${this.accountId}`);
      }

      // Set connected state
      this.isConnected = true;
      console.log('Successfully connected to TradeStation API');
    } catch (error) {
      console.error('Error connecting to TradeStation:', error);
      this.isConnected = false;
      throw error;
    }
  }

  /**
   * Validate the access token
   */
  private async validateToken(): Promise<{ valid: boolean; expiresAt: number }> {
    try {
      // Check if the token is valid
      const response = await fetch(`${this.baseUrl}/users/me`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        return { valid: false, expiresAt: 0 };
      }

      // Token is valid
      // In a real implementation, you would extract the expiration time from the token or response
      // For now, set it to expire in 1 hour
      const expiresAt = Date.now() + 3600000;
      return { valid: true, expiresAt };
    } catch (error) {
      console.error('Error validating TradeStation token:', error);
      return { valid: false, expiresAt: 0 };
    }
  }

  /**
   * Validate the account ID
   */
  private async validateAccount(): Promise<boolean> {
    try {
      // Check if the account exists and is accessible
      const response = await fetch(`${this.baseUrl}/brokerage/accounts/${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating TradeStation account:', error);
      return false;
    }
  }

  /**
   * Ensure the token is valid, refresh if needed
   */
  private async ensureValidToken(): Promise<void> {
    // Check if token is expired
    if (Date.now() >= this.tokenExpiry) {
      // In a real implementation, you would refresh the token here
      throw new Error('TradeStation token expired and refresh not implemented');
    }
  }

  /**
   * Get order history from TradeStation
   */
  async getOrderHistory(): Promise<OrderHistory[]> {
    this.ensureConnected();
    await this.ensureValidToken();

    try {
      // Fetch order history from TradeStation
      const response = await fetch(`${this.baseUrl}/brokerage/accounts/${this.accountId}/orders`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch order history: ${errorData.message || response.statusText}`);
      }

      // Convert TradeStation order data to our format
      const tradestationOrders = await response.json();
      return tradestationOrders.Orders.map((order: any) => ({
        orderId: order.OrderID,
        symbol: order.Symbol,
        side: order.BuyOrSell.toLowerCase() as 'buy' | 'sell',
        quantity: order.Quantity,
        price: order.LimitPrice || order.StopPrice || order.ExecutedPrice || 0,
        timestamp: new Date(order.DateTime).getTime(),
        status: this.mapOrderStatus(order.Status),
        broker: 'tradestation'
      }));
    } catch (error) {
      console.error('Error fetching TradeStation order history:', error);
      throw error;
    }
  }

  /**
   * Get account balance from TradeStation
   */
  async getBalance(): Promise<AccountBalance> {
    this.ensureConnected();
    await this.ensureValidToken();

    try {
      // Fetch account balance from TradeStation
      const response = await fetch(`${this.baseUrl}/brokerage/accounts/${this.accountId}/balances`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch account balance: ${errorData.message || response.statusText}`);
      }

      // Convert TradeStation balance data to our format
      const tradestationBalance = await response.json();
      const cash = tradestationBalance.CashBalance || 0;
      const positions = (tradestationBalance.EquityValue || 0) - cash;
      
      return {
        cash: cash,
        positions: positions,
        total: cash + positions
      };
    } catch (error) {
      console.error('Error fetching TradeStation account balance:', error);
      throw error;
    }
  }

  /**
   * Get positions from TradeStation
   */
  async getPositions(): Promise<BrokerPosition[]> {
    this.ensureConnected();
    await this.ensureValidToken();

    try {
      // Fetch positions from TradeStation
      const response = await fetch(`${this.baseUrl}/brokerage/accounts/${this.accountId}/positions`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch positions: ${errorData.message || response.statusText}`);
      }

      // Convert TradeStation position data to our format
      const tradestationPositions = await response.json();
      return tradestationPositions.Positions.map((position: any) => ({
        symbol: position.Symbol,
        quantity: position.Quantity,
        averagePrice: position.AveragePrice,
        currentPrice: position.LastPrice,
        pnl: position.UnrealizedPL
      }));
    } catch (error) {
      console.error('Error fetching TradeStation positions:', error);
      throw error;
    }
  }

  /**
   * Place an order with TradeStation
   */
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    this.ensureConnected();
    await this.ensureValidToken();

    try {
      // Prepare the order payload for TradeStation
      const orderPayload = {
        AccountID: this.accountId,
        Symbol: order.symbol,
        Quantity: order.quantity,
        OrderType: order.type === 'market' ? 'Market' : 'Limit',
        TradeAction: order.side === 'buy' ? 'Buy' : 'Sell',
        LimitPrice: order.type === 'limit' ? order.limitPrice : undefined,
        Duration: 'Day'
      };

      // Place the order with TradeStation
      const response = await fetch(`${this.baseUrl}/brokerage/accounts/${this.accountId}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderPayload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to place order: ${errorData.message || response.statusText}`);
      }

      // Get the order ID from the response
      const orderResponse = await response.json();
      return orderResponse.OrderID;
    } catch (error) {
      console.error('Error placing TradeStation order:', error);
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
    await this.ensureValidToken();

    try {
      // Fetch the latest quote for a symbol
      const response = await fetch(`${this.baseUrl}/marketdata/quotes/${symbol}`, {
        method: 'GET',
        headers: this.headers
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch market data for ${symbol}`);
      }

      const quoteData = await response.json();
      const quote = quoteData.Quotes[0];

      return {
        symbol: symbol,
        price: quote.Last,
        open: quote.Open,
        high: quote.High,
        low: quote.Low,
        close: quote.Last,
        volume: quote.Volume,
        timestamp: new Date().getTime()
      };
    } catch (error) {
      console.error(`Error fetching TradeStation market data for ${symbol}:`, error);
      // Fallback to a simple data structure
      return {
        symbol: symbol,
        price: 0,
        timestamp: new Date().getTime()
      };
    }
  }

  /**
   * Ensure that we're connected to the TradeStation API
   */
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to TradeStation API. Call connect() first.');
    }
  }

  /**
   * Map TradeStation order status to our status format
   */
  private mapOrderStatus(status: string): 'filled' | 'pending' | 'cancelled' {
    switch (status.toLowerCase()) {
      case 'filled':
      case 'executed':
        return 'filled';
      case 'cancelled':
      case 'canceled':
      case 'rejected':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

/**
 * Create a TradeStation service instance
 */
export function createTradeStationService(
  apiKey: string,
  accessToken: string,
  accountId: string,
  isTestnet: boolean = true
): BrokerService {
  return new TradeStationService(apiKey, accessToken, accountId, isTestnet);
}