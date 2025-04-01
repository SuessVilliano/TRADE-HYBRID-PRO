import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

/**
 * Implementation of BrokerService for Alpaca
 */
export class AlpacaService implements BrokerService {
  private apiKey: string;
  private secretKey: string;
  private isPaper: boolean;
  private baseUrl: string;
  private dataUrl: string;
  private authenticated: boolean = false;
  private accountId: string = '';
  
  constructor(apiKey: string = '', secretKey: string = '', isPaper: boolean = true) {
    this.apiKey = apiKey;
    this.secretKey = secretKey;
    this.isPaper = isPaper;
    
    // Set the appropriate URLs based on paper/live trading
    if (isPaper) {
      this.baseUrl = 'https://paper-api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
    } else {
      this.baseUrl = 'https://api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
    }
  }
  
  async connect(): Promise<void> {
    if (!this.apiKey || !this.secretKey) {
      throw new Error('Alpaca API key and secret key are required');
    }
    
    try {
      // Test the connection by getting account information
      const response = await fetch(`${this.baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Alpaca API error: ${errorData.message || response.statusText}`);
      }
      
      const accountData = await response.json();
      this.accountId = accountData.id;
      this.authenticated = true;
      
      console.log(`Connected to Alpaca account: ${accountData.id}`);
    } catch (error) {
      console.error('Failed to connect to Alpaca:', error);
      throw new Error(`Failed to connect to Alpaca: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/account`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get account balance: ${response.statusText}`);
      }
      
      const accountData = await response.json();
      
      return {
        total: parseFloat(accountData.equity),
        cash: parseFloat(accountData.cash),
        positions: parseFloat(accountData.long_market_value) - parseFloat(accountData.short_market_value)
      };
    } catch (error) {
      console.error('Error getting Alpaca account balance:', error);
      throw error;
    }
  }
  
  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/positions`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.statusText}`);
      }
      
      const positionsData = await response.json();
      
      return positionsData.map((position: any) => ({
        symbol: position.symbol,
        quantity: parseFloat(position.qty),
        averagePrice: parseFloat(position.avg_entry_price),
        currentPrice: parseFloat(position.current_price),
        pnl: parseFloat(position.unrealized_pl)
      }));
    } catch (error) {
      console.error('Error getting Alpaca positions:', error);
      throw error;
    }
  }
  
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const orderData: any = {
        symbol: order.symbol,
        qty: order.quantity.toString(),
        side: order.side,
        type: order.type.toUpperCase(),
        time_in_force: 'day'
      };
      
      if (order.type === 'limit' && order.limitPrice) {
        orderData.limit_price = order.limitPrice.toString();
      }
      
      const response = await fetch(`${this.baseUrl}/v2/orders`, {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to place order: ${errorData.message || response.statusText}`);
      }
      
      const responseData = await response.json();
      return responseData.id;
    } catch (error) {
      console.error('Error placing Alpaca order:', error);
      throw error;
    }
  }
  
  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.baseUrl}/v2/orders?status=all&limit=100`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get order history: ${response.statusText}`);
      }
      
      const ordersData = await response.json();
      
      return ordersData.map((order: any) => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side as 'buy' | 'sell',
        quantity: parseFloat(order.qty),
        price: parseFloat(order.filled_avg_price || order.limit_price || '0'),
        status: this.mapOrderStatus(order.status),
        timestamp: new Date(order.created_at).getTime(),
        broker: 'ALPACA'
      }));
    } catch (error) {
      console.error('Error getting Alpaca order history:', error);
      throw error;
    }
  }
  
  private mapOrderStatus(alpacaStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (alpacaStatus) {
      case 'filled':
        return 'filled';
      case 'canceled':
      case 'expired':
      case 'rejected':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
  
  async getQuote(symbol: string): Promise<{ bid: number; ask: number } | null> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const response = await fetch(`${this.dataUrl}/v2/stocks/${symbol}/quotes/latest`, {
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.secretKey
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get quote for ${symbol}: ${response.statusText}`);
      }
      
      const quoteData = await response.json();
      
      if (!quoteData.quote) {
        return null;
      }
      
      return {
        bid: parseFloat(quoteData.quote.bp),
        ask: parseFloat(quoteData.quote.ap)
      };
    } catch (error) {
      console.error(`Error getting quote for ${symbol}:`, error);
      return null;
    }
  }
  
  // WebSocket connection for market data
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Implementation would use Alpaca's WebSocket API
    console.log(`Subscribed to market data for ${symbol}`);
    
    // Simulate data for now
    const interval = setInterval(() => {
      const mockPrice = 100 + Math.random() * 10;
      callback({
        symbol,
        price: mockPrice,
        timestamp: Date.now(),
        volume: Math.floor(Math.random() * 1000)
      });
    }, 5000);
    
    // Store the interval for cleanup later
    (this as any)[`interval_${symbol}`] = interval;
  }
  
  unsubscribeFromMarketData(symbol: string): void {
    const intervalKey = `interval_${symbol}`;
    if ((this as any)[intervalKey]) {
      clearInterval((this as any)[intervalKey]);
      delete (this as any)[intervalKey];
      console.log(`Unsubscribed from market data for ${symbol}`);
    }
  }
}