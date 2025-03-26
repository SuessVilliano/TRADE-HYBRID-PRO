import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class IBKRService implements BrokerService {
  private token: string | null = null;
  private baseUrl = 'https://api.ibkr.com/v1/portal';
  private subscriptions = new Map<string, number>();
  private accountId: string | null = null;

  constructor(
    private username: string,
    private password: string,
    private isDemo: boolean = true
  ) {
    if (isDemo) {
      this.baseUrl = 'https://gdcdyn.interactivebrokers.com/Universal/servlet';
    }
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to IBKR API...');
      
      // Simulate token fetch - in a real scenario this would use the IBKR OAuth flow
      this.token = 'simulated_ibkr_token';
      this.accountId = 'U1234567'; // Simulated account ID
      
      console.log(`Successfully connected to IBKR API with account ID: ${this.accountId}`);
    } catch (error) {
      console.error('Error connecting to IBKR:', error);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('Not connected to IBKR API');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`IBKR API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to IBKR first.');
    }
    
    // In a real implementation, this would make an API call to IBKR
    // For demo purposes, we'll return simulated data
    
    return {
      total: 100000,
      cash: 75000,
      positions: 25000
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to IBKR first.');
    }
    
    // In a real implementation, this would make an API call to IBKR
    // For demo purposes, we'll return simulated data
    
    return [
      {
        symbol: 'AAPL',
        quantity: 100,
        averagePrice: 150.25,
        currentPrice: 155.50,
        pnl: 525.00
      },
      {
        symbol: 'MSFT',
        quantity: 50,
        averagePrice: 250.75,
        currentPrice: 260.20,
        pnl: 472.50
      }
    ];
  }

  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to IBKR first.');
    }
    
    // In a real implementation, this would make an API call to IBKR
    // For demo purposes, we'll simulate a successful order
    
    const orderId = `IBKR-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    console.log(`Placed ${order.side} order for ${order.quantity} ${order.symbol} at ${order.type === 'limit' ? order.limitPrice : 'market price'}`);
    
    return orderId;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to IBKR first.');
    }
    
    // In a real implementation, this would make an API call to IBKR
    // For demo purposes, we'll return simulated data
    
    return [
      {
        orderId: 'IBKR-12345',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 100,
        price: 150.25,
        status: 'filled',
        timestamp: Date.now() - 3600000 // 1 hour ago
      },
      {
        orderId: 'IBKR-12346',
        symbol: 'MSFT',
        side: 'buy',
        quantity: 50,
        price: 250.75,
        status: 'filled',
        timestamp: Date.now() - 7200000 // 2 hours ago
      }
    ];
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Check if we're already subscribed
    if (this.subscriptions.has(symbol)) {
      return;
    }
    
    console.log(`Subscribing to IBKR market data for ${symbol}`);
    
    // For real implementation, we'd use IBKR's streaming API
    // For now, simulate with an interval to fetch prices
    const interval = setInterval(() => {
      try {
        // Generate a simulated price that fluctuates slightly
        const basePrice = this.getBasePrice(symbol);
        const variance = basePrice * 0.005 * (Math.random() * 2 - 1);
        const currentPrice = basePrice + variance;
        
        const marketData: MarketData = {
          symbol: symbol,
          price: currentPrice,
          timestamp: Date.now(),
          open: basePrice - basePrice * 0.002,
          high: basePrice + basePrice * 0.004,
          low: basePrice - basePrice * 0.004,
          close: currentPrice,
          volume: Math.floor(Math.random() * 10000 + 1000)
        };
        
        callback(marketData);
      } catch (error) {
        console.error(`Error generating IBKR data for ${symbol}:`, error);
      }
    }, 5000); // Every 5 seconds
    
    this.subscriptions.set(symbol, interval as unknown as number);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const interval = this.subscriptions.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(symbol);
      console.log(`Unsubscribed from IBKR market data for ${symbol}`);
    }
  }

  // Helper method to get a base price for a symbol
  private getBasePrice(symbol: string): number {
    const prices: Record<string, number> = {
      'AAPL': 155.50,
      'MSFT': 260.20,
      'GOOGL': 135.70,
      'AMZN': 130.25,
      'TSLA': 180.45,
      'BTCUSD': 37500.00,
      'ETHUSD': 2200.00,
      'EURUSD': 1.08,
      'GBPUSD': 1.27,
      'USDJPY': 147.50
    };
    
    return prices[symbol] || 100.00; // Default price if symbol not found
  }
}