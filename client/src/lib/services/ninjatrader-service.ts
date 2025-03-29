import { 
  BrokerService, 
  MarketData, 
  AccountBalance,
  BrokerPosition, 
  OrderHistory 
} from './broker-service';

export class NinjaTraderService implements BrokerService {
  private apiKey: string;
  private accountId: string;
  private baseUrl: string = 'https://api.ninjatrader.com/v1';
  private isConnected: boolean = false;
  private headers: { [key: string]: string } = {};
  private isTestnet: boolean;

  constructor(apiKey: string, accountId: string, isTestnet: boolean = true) {
    this.apiKey = apiKey;
    this.accountId = accountId;
    this.isTestnet = isTestnet;
    
    // Set the base URL based on environment
    this.baseUrl = isTestnet 
      ? 'https://api.sandbox.ninjatrader.com/v1' 
      : 'https://api.ninjatrader.com/v1';
      
    // Initialize headers with API key
    this.headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.apiKey}`,
      'X-Account-ID': this.accountId
    };
  }
  
  async connect(): Promise<void> {
    try {
      // Validate credentials by making a simple request to get account details
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to connect to NinjaTrader API: ${response.statusText}`);
      }
      
      this.isConnected = true;
      console.log('Successfully connected to NinjaTrader API');
    } catch (error) {
      console.error('Error connecting to NinjaTrader API:', error);
      throw error;
    }
  }
  
  // Check if we're connected to the API
  isConnectedToApi(): boolean {
    return this.isConnected;
  }
  
  // Get order history
  async getOrderHistory(): Promise<OrderHistory[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get order history: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our OrderHistory format
      return data.orders.map((order: any) => ({
        orderId: order.orderId,
        symbol: order.symbol,
        side: order.side.toLowerCase(),
        quantity: order.quantity,
        price: order.price,
        status: this.mapOrderStatus(order.status),
        timestamp: new Date(order.createdAt).getTime(),
        broker: 'ninjatrader'
      }));
    } catch (error) {
      console.error('Error getting order history from NinjaTrader:', error);
      throw error;
    }
  }
  
  // Get account balance
  async getBalance(): Promise<AccountBalance> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/balance`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get account balance: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      return {
        total: data.totalValue,
        cash: data.cashBalance,
        positions: data.positionsValue
      };
    } catch (error) {
      console.error('Error getting balance from NinjaTrader:', error);
      throw error;
    }
  }
  
  // Get positions
  async getPositions(): Promise<BrokerPosition[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/positions`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Transform API response to our BrokerPosition format
      return data.positions.map((position: any) => ({
        symbol: position.symbol,
        quantity: position.quantity,
        averagePrice: position.entryPrice,
        currentPrice: position.marketPrice,
        pnl: position.unrealizedPnl
      }));
    } catch (error) {
      console.error('Error getting positions from NinjaTrader:', error);
      throw error;
    }
  }
  
  // Place an order
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    this.ensureConnected();
    
    try {
      const orderData = {
        symbol: order.symbol,
        side: order.side.toUpperCase(),
        quantity: order.quantity,
        type: order.type.toUpperCase(),
        ...(order.type === 'limit' && { price: order.limitPrice })
      };
      
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.orderId;
    } catch (error) {
      console.error('Error placing order with NinjaTrader:', error);
      throw error;
    }
  }
  
  // Subscribe to market data for a symbol
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    this.ensureConnected();
    
    try {
      // For NinjaTrader, we would typically use a WebSocket connection for real-time data
      // This is a simplified version that polls for data
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`${this.baseUrl}/markets/${symbol}/quote`, {
            method: 'GET',
            headers: this.headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get market data for ${symbol}: ${response.statusText}`);
          }
          
          const data = await response.json();
          
          // Transform API response to our MarketData format
          const marketData: MarketData = {
            symbol,
            price: data.lastPrice,
            timestamp: Date.now(),
            volume: data.volume,
            high: data.highPrice,
            low: data.lowPrice,
            open: data.openPrice,
            close: data.lastPrice
          };
          
          // Invoke the callback with the market data
          callback(marketData);
        } catch (error) {
          console.error(`Error fetching market data for ${symbol}:`, error);
        }
      }, 1000); // Poll every second
      
      // Store the interval ID for cleanup
      this._marketDataSubscriptions[symbol] = interval;
    } catch (error) {
      console.error(`Error subscribing to market data for ${symbol}:`, error);
      throw error;
    }
  }
  
  // Unsubscribe from market data for a symbol
  unsubscribeFromMarketData(symbol: string): void {
    if (this._marketDataSubscriptions[symbol]) {
      clearInterval(this._marketDataSubscriptions[symbol]);
      delete this._marketDataSubscriptions[symbol];
      console.log(`Unsubscribed from market data for ${symbol}`);
    }
  }
  
  // Internal storage for market data subscriptions
  private _marketDataSubscriptions: { [symbol: string]: NodeJS.Timeout } = {};
  
  // Helper to ensure we're connected before making API calls
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to NinjaTrader API. Call connect() first.');
    }
  }
  
  // Helper to map NinjaTrader order status to our status format
  private mapOrderStatus(status: string): 'filled' | 'pending' | 'cancelled' {
    const statusMap: { [key: string]: 'filled' | 'pending' | 'cancelled' } = {
      'FILLED': 'filled',
      'PARTIALLY_FILLED': 'filled',
      'NEW': 'pending',
      'SUBMITTED': 'pending',
      'WORKING': 'pending',
      'REJECTED': 'cancelled',
      'CANCELLED': 'cancelled',
      'EXPIRED': 'cancelled'
    };
    
    return statusMap[status] || 'pending';
  }
}

export function createNinjaTraderService(
  apiKey: string, 
  accountId: string, 
  isTestnet: boolean = true
): BrokerService {
  return new NinjaTraderService(apiKey, accountId, isTestnet);
}