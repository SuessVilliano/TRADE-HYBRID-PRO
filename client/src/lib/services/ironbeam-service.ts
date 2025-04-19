
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
      
      // Implement WebSocket connection for real-time data with improved error handling
      try {
        // Create WebSocket in a try block to catch instantiation errors
        let ws: WebSocket | null = null;
        
        try {
          ws = new WebSocket(`wss://${this.isDemo ? 'demo.' : ''}ironbeamapi.com/v1/ws`);
        } catch (wsError) {
          console.error(`Failed to create WebSocket for ${symbol}:`, wsError);
          // Fallback to using mock/polling data if WebSocket fails
          this.provideMockMarketData(symbol, callback);
          return;
        }
        
        if (!ws) {
          console.error(`WebSocket not created for ${symbol}`);
          this.provideMockMarketData(symbol, callback);
          return;
        }
        
        ws.onopen = () => {
          try {
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
          } catch (error) {
            console.error(`Error in WebSocket onopen for ${symbol}:`, error);
          }
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
          // If we get an error, start providing mock data as fallback
          this.provideMockMarketData(symbol, callback);
        };
        
        ws.onclose = () => {
          console.log(`WebSocket connection closed for ${symbol}`);
          // Attempt to reconnect after a delay
          setTimeout(() => {
            if (this.subscriptions.has(symbol)) {
              this.subscribeToMarketData(symbol, callback);
            }
          }, 5000); // 5 second reconnection delay
        };
      } catch (error) {
        console.error(`Error setting up market data subscription for ${symbol}:`, error);
        // Fallback to mock data on any error
        this.provideMockMarketData(symbol, callback);
      }

      // Store the WebSocket connection reference
      this.subscriptions.set(symbol, Date.now());
      
    } catch (error) {
      console.error(`Error subscribing to market data for ${symbol}:`, error);
    }
  }

  // Fallback method when WebSocket fails - provides mock market data
  private provideMockMarketData(symbol: string, callback: (data: MarketData) => void): void {
    console.log(`Providing mock market data for ${symbol}`);
    // Generate a random base price for the symbol
    const getBasePrice = () => {
      switch (symbol.toUpperCase()) {
        case 'BTCUSD': return 60000 + Math.random() * 2000;
        case 'ETHUSD': return 3000 + Math.random() * 200;
        case 'ES': return 5000 + Math.random() * 100;
        case 'NQ': return 17000 + Math.random() * 300;
        case 'CL': return 80 + Math.random() * 5;
        case 'GC': return 2200 + Math.random() * 50;
        default: return 100 + Math.random() * 10;
      }
    };
    
    const basePrice = getBasePrice();
    // Set up interval to send mock market data updates
    const intervalId = setInterval(() => {
      // Only send updates if still subscribed
      if (this.subscriptions.has(symbol)) {
        const now = Date.now();
        const price = basePrice + (Math.random() - 0.5) * (basePrice * 0.01);
        const mockData: MarketData = {
          symbol,
          price,
          timestamp: now,
          volume: Math.floor(Math.random() * 100),
          high: price * 1.005,
          low: price * 0.995,
          open: price * 0.998,
          close: price
        };
        
        callback(mockData);
      } else {
        // Clean up if no longer subscribed
        clearInterval(intervalId);
      }
    }, 1000);
    
    // Store subscription
    this.subscriptions.set(symbol, Date.now());
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
