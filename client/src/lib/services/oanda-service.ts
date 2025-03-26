import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class OandaService implements BrokerService {
  private token: string | null = null;
  private baseUrl = 'https://api-fxpractice.oanda.com';
  private streamingUrl = 'https://stream-fxpractice.oanda.com';
  private subscriptions = new Map<string, number>();
  private accountId: string | null = null;

  constructor(
    private apiToken: string,
    private isDemo: boolean = true
  ) {
    if (!isDemo) {
      this.baseUrl = 'https://api-fxtrade.oanda.com';
      this.streamingUrl = 'https://stream-fxtrade.oanda.com';
    }
  }

  async connect(): Promise<void> {
    try {
      console.log('Connecting to OANDA API...');
      
      // Authenticate and get account information
      const response = await fetch(`${this.baseUrl}/v3/accounts`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error('Failed to connect to OANDA API:', await response.text());
        throw new Error(`Failed to connect to OANDA: ${response.statusText}`);
      }

      const data = await response.json();
      // Store the first account ID for future requests
      if (data.accounts && data.accounts.length > 0) {
        this.accountId = data.accounts[0].id;
        console.log(`Successfully connected to OANDA API with account ID: ${this.accountId}`);
      } else {
        throw new Error('No accounts found for this OANDA API token');
      }
      
      this.token = this.apiToken; // Store the token for future requests
    } catch (error) {
      console.error('Error connecting to OANDA:', error);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('Not connected to OANDA API');
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
      throw new Error(`OANDA API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to OANDA first.');
    }
    
    const data = await this.request(`/v3/accounts/${this.accountId}/summary`);
    
    return {
      total: parseFloat(data.account.balance),
      cash: parseFloat(data.account.balance) - parseFloat(data.account.marginUsed),
      positions: parseFloat(data.account.marginUsed)
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to OANDA first.');
    }
    
    const data = await this.request(`/v3/accounts/${this.accountId}/positions`);
    
    return data.positions.map((position: any) => {
      // Get the details from long or short position based on which one has units
      const details = Math.abs(parseFloat(position.long.units)) > 0 ? position.long : position.short;
      const side = Math.abs(parseFloat(position.long.units)) > 0 ? 'buy' : 'sell';
      
      return {
        symbol: position.instrument,
        quantity: Math.abs(parseFloat(details.units)),
        averagePrice: parseFloat(details.averagePrice),
        currentPrice: parseFloat(details.averagePrice), // We don't have current price in this response
        pnl: parseFloat(details.unrealizedPL)
      };
    });
  }

  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to OANDA first.');
    }
    
    const units = order.side === 'buy' ? order.quantity : -order.quantity;
    
    const orderBody: any = {
      order: {
        units: units.toString(),
        instrument: order.symbol,
        timeInForce: 'FOK',
        type: order.type === 'market' ? 'MARKET' : 'LIMIT',
        positionFill: 'DEFAULT'
      }
    };
    
    if (order.type === 'limit' && order.limitPrice) {
      orderBody.order.price = order.limitPrice.toString();
    }
    
    const data = await this.request(`/v3/accounts/${this.accountId}/orders`, {
      method: 'POST',
      body: JSON.stringify(orderBody)
    });
    
    return data.orderCreateTransaction.id;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to OANDA first.');
    }
    
    const data = await this.request(`/v3/accounts/${this.accountId}/orders`);
    
    return data.orders.map((order: any) => {
      return {
        orderId: order.id,
        symbol: order.instrument,
        side: parseInt(order.units) > 0 ? 'buy' : 'sell',
        quantity: Math.abs(parseInt(order.units)),
        price: parseFloat(order.price || '0'),
        status: this.mapOrderStatus(order.state),
        timestamp: new Date(order.createTime).getTime()
      };
    });
  }

  private mapOrderStatus(oandaStatus: string): 'filled' | 'pending' | 'cancelled' {
    const statusMap: Record<string, 'filled' | 'pending' | 'cancelled'> = {
      'FILLED': 'filled',
      'PENDING': 'pending',
      'CANCELLED': 'cancelled',
      'TRIGGERED': 'pending',
      'OPEN': 'pending'
    };
    
    return statusMap[oandaStatus] || 'pending';
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Check if we're already subscribed
    if (this.subscriptions.has(symbol)) {
      return;
    }
    
    console.log(`Subscribing to OANDA market data for ${symbol}`);
    
    // For real implementation, we'd use OANDA's streaming API
    // For now, simulate with an interval to fetch prices
    const interval = setInterval(async () => {
      try {
        if (!this.accountId) {
          console.error('Account ID not available. Connect to OANDA first.');
          return;
        }
        
        const response = await fetch(`${this.baseUrl}/v3/instruments/${symbol}/candles?count=1&granularity=S5`, {
          headers: { 
            'Authorization': `Bearer ${this.token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error(`Failed to get OANDA price for ${symbol}:`, await response.text());
          return;
        }
        
        const data = await response.json();
        if (data.candles && data.candles.length > 0) {
          const candle = data.candles[0];
          const marketData: MarketData = {
            symbol: symbol,
            price: parseFloat(candle.mid.c),
            timestamp: new Date(candle.time).getTime(),
            open: parseFloat(candle.mid.o),
            high: parseFloat(candle.mid.h),
            low: parseFloat(candle.mid.l),
            close: parseFloat(candle.mid.c),
            volume: candle.volume
          };
          
          callback(marketData);
        }
      } catch (error) {
        console.error(`Error fetching OANDA data for ${symbol}:`, error);
      }
    }, 5000); // Every 5 seconds
    
    this.subscriptions.set(symbol, interval as unknown as number);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const interval = this.subscriptions.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(symbol);
      console.log(`Unsubscribed from OANDA market data for ${symbol}`);
    }
  }
}