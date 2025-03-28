import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class TastyWorksService implements BrokerService {
  private baseUrl = 'https://api.tastyworks.com';
  private authToken: string | null = null;
  private refreshToken: string | null = null;
  private accountNumber: string | null = null;
  private sessionExpiry: number = 0;
  private subscriptions = new Map<string, number>();

  constructor(
    private username: string,
    private password: string,
    private isDemo: boolean = false
  ) {
    if (isDemo) {
      this.baseUrl = 'https://api.cert.tastyworks.com';
    }
  }

  async connect(): Promise<void> {
    try {
      // In a real implementation, this would authenticate with TastyWorks API
      // TastyWorks uses a session-based authentication system
      console.log('Authenticating with TastyWorks...');
      
      // Simulate an authentication response
      this.authToken = 'simulated-tastyworks-token';
      this.refreshToken = 'simulated-refresh-token';
      this.accountNumber = 'TW1234567';
      this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      // After authentication, we'd fetch account information
      // For demo, we'll just log that we're connected
      console.log(`Connected to TastyWorks with account number ${this.accountNumber}`);
    } catch (error) {
      console.error('Failed to connect to TastyWorks:', error);
      throw error;
    }
  }

  private async request(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', body?: any) {
    if (!this.authToken) {
      throw new Error('Not authenticated with TastyWorks');
    }

    // Check if token needs refresh
    if (Date.now() > this.sessionExpiry && this.refreshToken) {
      await this.refreshSession();
    }

    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      method,
      headers: {
        'Authorization': `Bearer ${this.authToken}`,
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TastyWorks API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async refreshSession() {
    try {
      // In a real implementation, this would make a refresh token request to TastyWorks
      console.log('Refreshing TastyWorks session...');
      
      // Simulate a successful refresh
      this.authToken = 'new-simulated-tastyworks-token';
      this.sessionExpiry = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
      
      console.log('TastyWorks session refreshed successfully');
    } catch (error) {
      console.error('Failed to refresh TastyWorks session:', error);
      throw error;
    }
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.accountNumber) {
      throw new Error('Account number not available. Connect to TastyWorks first.');
    }
    
    // In a real implementation, this would fetch the balance from TastyWorks API
    // For demo purposes, we return simulated data
    return {
      total: 35000,
      cash: 20000,
      positions: 15000
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.accountNumber) {
      throw new Error('Account number not available. Connect to TastyWorks first.');
    }
    
    // In a real implementation, this would fetch positions from TastyWorks API
    // For demo purposes, we return simulated data for a mix of stocks and options
    return [
      {
        symbol: 'SPY',
        quantity: 100,
        averagePrice: 430.25,
        currentPrice: 435.50,
        pnl: 525.00
      },
      {
        symbol: 'AAPL',
        quantity: 200,
        averagePrice: 175.50,
        currentPrice: 177.25,
        pnl: 350.00
      },
      {
        symbol: 'SPY 440C 04/19/24', // Option contract notation
        quantity: 5,
        averagePrice: 3.75,
        currentPrice: 4.25,
        pnl: 250.00
      },
      {
        symbol: 'AAPL 180P 04/19/24', // Option contract notation
        quantity: 3,
        averagePrice: 4.50,
        currentPrice: 3.90,
        pnl: -180.00
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
    if (!this.accountNumber) {
      throw new Error('Account number not available. Connect to TastyWorks first.');
    }
    
    // In a real implementation, this would submit an order to TastyWorks API
    console.log(`Placing ${order.side} order for ${order.quantity} ${order.symbol} at ${order.type === 'limit' ? order.limitPrice : 'market'} price`);
    
    // Generate a mock order ID
    const orderId = `TW-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    // In production, we would submit this to TastyWorks and get a real order ID
    return orderId;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.accountNumber) {
      throw new Error('Account number not available. Connect to TastyWorks first.');
    }
    
    // In a real implementation, this would fetch order history from TastyWorks API
    // For demo purposes, we return simulated data
    return [
      {
        orderId: 'TW-12345',
        symbol: 'SPY',
        side: 'buy',
        quantity: 100,
        price: 430.25,
        status: 'filled',
        timestamp: Date.now() - 86400000, // 1 day ago
        broker: 'TastyWorks'
      },
      {
        orderId: 'TW-12346',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 200,
        price: 175.50,
        status: 'filled',
        timestamp: Date.now() - 172800000, // 2 days ago
        broker: 'TastyWorks'
      },
      {
        orderId: 'TW-12347',
        symbol: 'SPY 440C 04/19/24',
        side: 'buy',
        quantity: 5,
        price: 3.75,
        status: 'filled',
        timestamp: Date.now() - 259200000, // 3 days ago
        broker: 'TastyWorks'
      },
      {
        orderId: 'TW-12348',
        symbol: 'AAPL 180P 04/19/24',
        side: 'buy',
        quantity: 3,
        price: 4.50,
        status: 'filled',
        timestamp: Date.now() - 345600000, // 4 days ago
        broker: 'TastyWorks'
      },
      {
        orderId: 'TW-12349',
        symbol: 'AMD',
        side: 'buy',
        quantity: 150,
        price: 110.25,
        status: 'cancelled',
        timestamp: Date.now() - 432000000, // 5 days ago
        broker: 'TastyWorks'
      }
    ];
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    if (this.subscriptions.has(symbol)) {
      return; // Already subscribed
    }
    
    console.log(`Subscribing to TastyWorks market data for ${symbol}`);
    
    // In a real implementation, this would use TastyWorks streaming API
    // For demo purposes, we'll simulate with a timer
    const interval = setInterval(() => {
      // Generate simulated market data
      const basePrice = this.getBasePrice(symbol);
      const variance = basePrice * 0.0015 * (Math.random() * 2 - 1); // +/- 0.15%
      const currentPrice = basePrice + variance;
      
      // For options, calculate Greeks (delta, gamma, theta, vega)
      const isOption = symbol.includes('C') || symbol.includes('P');
      
      const marketData: MarketData = {
        symbol,
        price: currentPrice,
        timestamp: Date.now(),
        volume: Math.floor(1000 + Math.random() * 10000),
        high: basePrice + basePrice * 0.003,
        low: basePrice - basePrice * 0.003,
        open: basePrice - basePrice * 0.001,
        close: currentPrice
      };
      
      callback(marketData);
    }, 1000); // Update every second for more realistic streaming
    
    this.subscriptions.set(symbol, interval as unknown as number);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const interval = this.subscriptions.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(symbol);
      console.log(`Unsubscribed from TastyWorks market data for ${symbol}`);
    }
  }

  // Helper to get baseline prices for common symbols
  private getBasePrice(symbol: string): number {
    // Handle option contracts
    if (symbol.includes('C') || symbol.includes('P')) {
      // Parse the underlying symbol from the option symbol
      const parts = symbol.split(' ');
      const underlyingSymbol = parts[0];
      const isCall = symbol.includes('C');
      
      // Get base price of the underlying
      const underlyingPrice = this.getStockPrice(underlyingSymbol);
      
      // Extract strike price from the symbol (e.g., '440C' -> 440)
      let strikePrice = 0;
      const strikePart = parts[1];
      if (strikePart) {
        strikePrice = parseFloat(strikePart.replace('C', '').replace('P', ''));
      }
      
      // Calculate option price based on a simple model
      // For calls: higher price when underlying > strike
      // For puts: higher price when underlying < strike
      if (isCall) {
        return Math.max(0.10, (underlyingPrice - strikePrice) * 0.1 + 1);
      } else {
        return Math.max(0.10, (strikePrice - underlyingPrice) * 0.1 + 1);
      }
    }
    
    // Handle regular stocks
    return this.getStockPrice(symbol);
  }
  
  private getStockPrice(symbol: string): number {
    const stockPrices: Record<string, number> = {
      'SPY': 435.50,
      'QQQ': 380.25,
      'AAPL': 177.25,
      'MSFT': 330.50,
      'AMZN': 170.75,
      'GOOGL': 140.50,
      'TSLA': 195.25,
      'NVDA': 465.50,
      'AMD': 112.75,
      'META': 475.25
    };
    
    return stockPrices[symbol] || 100.00; // Default price if symbol not found
  }
}