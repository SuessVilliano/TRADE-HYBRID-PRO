
import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class IronBeamService implements BrokerService {
  private token: string | null = null;
  private baseUrl = 'https://demo.ironbeamapi.com/v1';
  private subscriptions = new Map<string, number>();

  constructor(
    private username: string,
    private password: string,
    private isDemo: boolean = true
  ) {
    if (!isDemo) {
      this.baseUrl = 'https://ironbeamapi.com/v1';
    }
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to IronBeam API...');
      
      // Using the demo credentials from the provided API information
      const apiUsername = this.isDemo ? '51364392' : '51364396';
      const apiPassword = this.isDemo ? '854911' : '271264';
      const apiKey = '136bdde6773045ef86aa4026e6edddb4';
      
      const response = await fetch(`${this.baseUrl}/auth`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: apiUsername, 
          password: apiKey 
        })
      });

      if (!response.ok) {
        console.error('Failed to connect to IronBeam API:', await response.text());
        throw new Error(`Failed to connect to IronBeam: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.token;
      console.log('Successfully connected to IronBeam API');
      return data;
    } catch (error) {
      console.error('Error connecting to IronBeam:', error);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('Not connected to IronBeam');
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...options.headers,
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`IronBeam request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    const data = await this.request(`/account/${this.username}/balance`);
    return {
      total: Number(data.totalEquity),
      cash: Number(data.availableCash),
      positions: Number(data.openPositionsValue)
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    const data = await this.request(`/account/${this.username}/positions`);
    return data.positions.map((pos: any) => ({
      symbol: pos.symbol,
      quantity: Number(pos.quantity),
      averagePrice: Number(pos.averagePrice),
      currentPrice: Number(pos.currentPrice),
      pnl: Number(pos.unrealizedPnL)
    }));
  }

  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify({
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        type: order.type,
        limitPrice: order.limitPrice
      })
    });
    return response.orderId;
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    if (!this.token) {
      console.error('Cannot subscribe to market data - not authenticated');
      return;
    }

    try {
      console.log(`Subscribing to market data for ${symbol}...`);
      
      // Implement WebSocket connection for real-time data
      const ws = new WebSocket(`wss://${this.isDemo ? 'demo.' : ''}ironbeamapi.com/v1/ws`);
      
      ws.onopen = () => {
        console.log(`WebSocket connection established for ${symbol}`);
        
        // Authentication message
        const authMessage = {
          type: 'authenticate',
          token: this.token
        };
        
        ws.send(JSON.stringify(authMessage));
        
        // Subscribe to the symbol after authentication
        const subscribeMessage = {
          type: 'subscribe',
          symbol: symbol,
          feed: 'market_data'
        };
        
        ws.send(JSON.stringify(subscribeMessage));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Log the first few messages to debug
          console.log(`Received market data for ${symbol}:`, data);
          
          if (data.type === 'market_data') {
            callback({
              symbol: data.symbol,
              price: Number(data.price),
              timestamp: Date.parse(data.timestamp),
              volume: data.volume ? Number(data.volume) : undefined,
              high: data.high ? Number(data.high) : undefined,
              low: data.low ? Number(data.low) : undefined,
              open: data.open ? Number(data.open) : undefined,
              close: data.close ? Number(data.close) : undefined
            });
          }
        } catch (err) {
          console.error('Error processing WebSocket message:', err);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket connection closed for ${symbol}`);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          if (this.subscriptions.has(symbol)) {
            this.subscribeToMarketData(symbol, callback);
          }
        }, 5000);
      };

      // Store the WebSocket connection reference
      this.subscriptions.set(symbol, Date.now());
      
    } catch (error) {
      console.error(`Error subscribing to market data for ${symbol}:`, error);
    }
  }

  unsubscribeFromMarketData(symbol: string): void {
    this.subscriptions.delete(symbol);
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    const data = await this.request(`/account/${this.username}/orders?status=all`);
    return data.orders.map((order: any) => ({
      orderId: order.orderId,
      symbol: order.symbol,
      side: order.side,
      quantity: Number(order.quantity),
      price: Number(order.price),
      status: order.status,
      timestamp: Date.parse(order.timestamp)
    }));
  }
}
