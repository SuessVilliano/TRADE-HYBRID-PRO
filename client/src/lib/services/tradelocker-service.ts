import axios from 'axios';
import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

// Define the TradeLocker API service to integrate with TradeLocker.com
export class TradeLockerService implements BrokerService {
  private apiKey: string;
  private clientId: string;
  private baseUrl: string = 'https://api.tradelocker.com/v1';
  private isConnected: boolean = false;
  private headers: { [key: string]: string } = {};

  constructor(apiKey: string, clientId: string) {
    this.apiKey = apiKey;
    this.clientId = clientId;
    this.headers = {
      'X-API-KEY': this.apiKey,
      'X-CLIENT-ID': this.clientId,
      'Content-Type': 'application/json'
    };
  }

  // Connect to the TradeLocker API
  async connect(): Promise<void> {
    try {
      // Validate API credentials with a simple request
      const response = await axios.get(`${this.baseUrl}/account/status`, {
        headers: this.headers
      });
      
      if (response.status === 200 && response.data.status === 'active') {
        this.isConnected = true;
        console.log('Successfully connected to TradeLocker API');
      } else {
        throw new Error('Failed to authenticate with TradeLocker API');
      }
    } catch (error) {
      console.error('TradeLocker connection error:', error);
      this.isConnected = false;
      throw new Error('Failed to connect to TradeLocker API. Please check your credentials.');
    }
  }

  // Check connection status
  isConnectedToApi(): boolean {
    return this.isConnected;
  }

  // Get order history
  async getOrderHistory(): Promise<OrderHistory[]> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/orders/history`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data.orders.map((order: any) => ({
          orderId: order.id,
          symbol: order.symbol,
          side: order.side,
          quantity: order.quantity,
          price: order.price,
          status: this.mapOrderStatus(order.status),
          timestamp: new Date(order.created_at).getTime(),
          broker: 'tradelocker'
        }));
      } else {
        throw new Error('Failed to fetch order history');
      }
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw error;
    }
  }

  // Get account balance
  async getBalance(): Promise<AccountBalance> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/account/balance`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return {
          total: response.data.total,
          cash: response.data.cash,
          positions: response.data.positions_value
        };
      } else {
        throw new Error('Failed to fetch account balance');
      }
    } catch (error) {
      console.error('Error fetching account balance:', error);
      throw error;
    }
  }

  // Get positions
  async getPositions(): Promise<BrokerPosition[]> {
    this.ensureConnected();
    
    try {
      const response = await axios.get(`${this.baseUrl}/positions`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return response.data.positions.map((position: any) => ({
          symbol: position.symbol,
          quantity: position.quantity,
          averagePrice: position.avg_price,
          currentPrice: position.current_price,
          pnl: position.unrealized_pl
        }));
      } else {
        throw new Error('Failed to fetch positions');
      }
    } catch (error) {
      console.error('Error fetching positions:', error);
      throw error;
    }
  }

  // Place order
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    this.ensureConnected();
    
    try {
      const payload = {
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        order_type: order.type.toUpperCase(),
        ...(order.limitPrice && { limit_price: order.limitPrice })
      };
      
      const response = await axios.post(`${this.baseUrl}/orders`, payload, {
        headers: this.headers
      });
      
      if (response.status === 201) {
        return response.data.order_id;
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  // Subscribe to market data
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    this.ensureConnected();
    
    // In a real implementation, this would use WebSockets or polling
    // For now, we'll simulate with a timer
    const intervalId = setInterval(async () => {
      try {
        const data = await this.fetchMarketData(symbol);
        callback(data);
      } catch (error) {
        console.error(`Error fetching market data for ${symbol}:`, error);
      }
    }, 5000);
    
    // Store the interval ID for cleanup later
    this._marketDataSubscriptions[symbol] = intervalId;
  }

  // Unsubscribe from market data
  unsubscribeFromMarketData(symbol: string): void {
    if (this._marketDataSubscriptions[symbol]) {
      clearInterval(this._marketDataSubscriptions[symbol]);
      delete this._marketDataSubscriptions[symbol];
    }
  }

  // Private methods
  private _marketDataSubscriptions: { [symbol: string]: NodeJS.Timeout } = {};

  private async fetchMarketData(symbol: string): Promise<MarketData> {
    try {
      const response = await axios.get(`${this.baseUrl}/market-data/${symbol}`, {
        headers: this.headers
      });
      
      if (response.status === 200) {
        return {
          symbol: response.data.symbol,
          price: response.data.last_price,
          timestamp: new Date(response.data.timestamp).getTime(),
          volume: response.data.volume,
          high: response.data.high,
          low: response.data.low,
          open: response.data.open,
          close: response.data.close
        };
      } else {
        throw new Error('Failed to fetch market data');
      }
    } catch (error) {
      console.error(`Error fetching market data for ${symbol}:`, error);
      throw error;
    }
  }

  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to TradeLocker API. Please call connect() first.');
    }
  }

  private mapOrderStatus(status: string): 'filled' | 'pending' | 'cancelled' {
    switch (status.toLowerCase()) {
      case 'filled':
      case 'executed':
        return 'filled';
      case 'pending':
      case 'open':
      case 'new':
        return 'pending';
      case 'cancelled':
      case 'canceled':
      case 'rejected':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}

// Factory function to create the TradeLocker service
export function createTradeLockerService(apiKey: string, clientId: string): BrokerService {
  return new TradeLockerService(apiKey, clientId);
}