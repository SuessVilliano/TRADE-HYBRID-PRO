import { BrokerCredentials } from './broker-connection-service';
import { BrokerService, BrokerAccountInfo, BrokerPosition, BrokerOrderRequest, BrokerOrderResponse } from './broker-service';
import axios from 'axios';

interface AlpacaOptions {
  isPaper: boolean;
}

/**
 * Service for interacting with Alpaca trading API
 */
export class AlpacaService implements BrokerService {
  private apiKey: string;
  private secretKey: string;
  private baseUrl: string;
  private dataUrl: string;
  private accountId?: string;

  constructor(credentials: BrokerCredentials, options: AlpacaOptions = { isPaper: true }) {
    // Use credentials provided or fall back to environment variables
    this.apiKey = credentials.apiKey || process.env.ALPACA_API_KEY || '';
    this.secretKey = credentials.secretKey || process.env.ALPACA_API_SECRET || '';
    this.accountId = credentials.accountId;
    
    if (!this.apiKey || !this.secretKey) {
      throw new Error('API key and secret key are required for Alpaca');
    }
    
    console.log(`Using Alpaca API Key: ${this.apiKey.substring(0, 4)}...`);
    
    // Use trading API instead of broker API
    if (options.isPaper) {
      this.baseUrl = process.env.ALPACA_BROKER_API_URL || 'https://paper-api.alpaca.markets/v2';
    } else {
      this.baseUrl = 'https://api.alpaca.markets/v2';
    }
    
    // Data API URL for market data
    this.dataUrl = 'https://data-api.alpaca.markets/v2';
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    // Verify credentials by making a test API call
    try {
      await this.getAccountInfo();
      console.log('Successfully initialized Alpaca service');
    } catch (error) {
      console.error('Failed to initialize Alpaca service:', error);
      throw new Error('Invalid Alpaca credentials');
    }
  }

  /**
   * Validate credentials without full initialization
   */
  async validateCredentials(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/account`, {
        headers: this.getHeaders(),
      });
      
      return response.status === 200;
    } catch (error) {
      console.error('Alpaca credential validation failed:', error);
      return false;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<BrokerAccountInfo> {
    try {
      const response = await axios.get(`${this.baseUrl}/account`, {
        headers: this.getHeaders(),
      });
      
      const data = response.data;
      
      return {
        accountId: data.id,
        balance: parseFloat(data.cash),
        equity: parseFloat(data.equity),
        margin: parseFloat(data.buying_power) - parseFloat(data.cash),
        unrealizedPnl: parseFloat(data.equity) - parseFloat(data.last_equity),
        buyingPower: parseFloat(data.buying_power),
        currency: 'USD',
        extra: {
          daytradeCount: data.daytrade_count,
          daytradeLimit: data.daytrade_count_limit,
          tradeSuspendedByUser: data.trade_suspended_by_user,
          tradingBlocked: data.trading_blocked,
          transfersBlocked: data.transfers_blocked,
          accountBlocked: data.account_blocked,
          status: data.status,
          createdAt: data.created_at,
        }
      };
    } catch (error) {
      console.error('Error getting Alpaca account info:', error);
      throw error;
    }
  }

  /**
   * Get positions
   */
  async getPositions(): Promise<BrokerPosition[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/positions`, {
        headers: this.getHeaders(),
      });
      
      return response.data.map((position: any) => ({
        symbol: position.symbol,
        quantity: parseFloat(position.qty),
        side: parseFloat(position.qty) > 0 ? 'buy' : 'sell',
        averagePrice: parseFloat(position.avg_entry_price),
        currentPrice: parseFloat(position.current_price),
        unrealizedPnl: parseFloat(position.unrealized_pl),
        unrealizedPnlPercent: parseFloat(position.unrealized_plpc) * 100,
        initialValue: parseFloat(position.cost_basis),
        currentValue: parseFloat(position.market_value),
        extra: {
          exchange: position.exchange,
          assetClass: position.asset_class,
          assetId: position.asset_id,
          changeToday: parseFloat(position.change_today),
          lastdayPrice: parseFloat(position.lastday_price),
        }
      }));
    } catch (error) {
      console.error('Error getting Alpaca positions:', error);
      throw error;
    }
  }

  /**
   * Place order
   */
  async placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse> {
    try {
      const orderParams: any = {
        symbol: order.symbol,
        qty: Math.abs(order.quantity).toString(),
        side: order.side,
        type: order.orderType || 'market',
        time_in_force: order.timeInForce || 'day',
      };

      // Add limit price if it's a limit order
      if (order.orderType === 'limit' && order.limitPrice) {
        orderParams.limit_price = order.limitPrice.toString();
      }

      // Add stop price if it's a stop order
      if (order.orderType === 'stop' && order.stopPrice) {
        orderParams.stop_price = order.stopPrice.toString();
      }

      // Add client order ID if provided
      if (order.clientOrderId) {
        orderParams.client_order_id = order.clientOrderId;
      }

      const response = await axios.post(`${this.baseUrl}/orders`, orderParams, {
        headers: this.getHeaders(),
      });

      const data = response.data;
      
      return {
        orderId: data.id,
        clientOrderId: data.client_order_id,
        symbol: data.symbol,
        side: data.side,
        quantity: parseFloat(data.qty),
        filledQuantity: parseFloat(data.filled_qty),
        orderType: data.type,
        limitPrice: data.limit_price ? parseFloat(data.limit_price) : undefined,
        stopPrice: data.stop_price ? parseFloat(data.stop_price) : undefined,
        status: data.status,
        createdAt: new Date(data.created_at).toISOString(),
      };
    } catch (error) {
      console.error('Error placing Alpaca order:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders?status=all&limit=100`, {
        headers: this.getHeaders(),
      });
      
      return response.data.map((order: any) => ({
        orderId: order.id,
        clientOrderId: order.client_order_id,
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.qty),
        filledQuantity: parseFloat(order.filled_qty),
        orderType: order.type,
        limitPrice: order.limit_price ? parseFloat(order.limit_price) : undefined,
        stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
        filledAt: order.filled_at,
        expiredAt: order.expired_at,
        canceledAt: order.canceled_at,
        failedAt: order.failed_at,
      }));
    } catch (error) {
      console.error('Error getting Alpaca order history:', error);
      throw error;
    }
  }

  /**
   * Get quote for a symbol
   */
  async getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number }> {
    try {
      const response = await axios.get(
        `${this.dataUrl}/stocks/${symbol}/quotes/latest`, 
        { headers: this.getHeaders() }
      );
      
      const quote = response.data.quote;
      
      return {
        symbol,
        bid: parseFloat(quote.bp),
        ask: parseFloat(quote.ap),
        last: parseFloat(quote.c || quote.bp),
      };
    } catch (error) {
      console.error(`Error getting Alpaca quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    try {
      const url = quantity 
        ? `${this.baseUrl}/positions/${symbol}?qty=${quantity}`
        : `${this.baseUrl}/positions/${symbol}`;
        
      const response = await axios.delete(url, {
        headers: this.getHeaders(),
      });
      
      return response.data;
    } catch (error) {
      console.error(`Error closing Alpaca position for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      await axios.delete(`${this.baseUrl}/orders/${orderId}`, {
        headers: this.getHeaders(),
      });
      
      return true;
    } catch (error) {
      console.error(`Error canceling Alpaca order ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      const response = await axios.get(`${this.baseUrl}/orders/${orderId}`, {
        headers: this.getHeaders(),
      });
      
      const order = response.data;
      
      return {
        orderId: order.id,
        clientOrderId: order.client_order_id,
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.qty),
        filledQuantity: parseFloat(order.filled_qty),
        orderType: order.type,
        limitPrice: order.limit_price ? parseFloat(order.limit_price) : undefined,
        stopPrice: order.stop_price ? parseFloat(order.stop_price) : undefined,
        status: order.status,
        createdAt: order.created_at,
        updatedAt: order.updated_at,
      };
    } catch (error) {
      console.error(`Error getting Alpaca order status for ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.secretKey,
      'Content-Type': 'application/json'
    };
  }
}