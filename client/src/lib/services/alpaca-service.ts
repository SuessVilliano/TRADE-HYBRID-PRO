import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import { check_secrets } from '../utils';

interface AlpacaQuote {
  symbol: string;
  bid: number;
  ask: number;
  bidSize: number;
  askSize: number;
  timestamp: number;
}

interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  qty: string;
  side: string;
  market_value: number;
  cost_basis: number;
  unrealized_pl: number;
  unrealized_plpc: number;
  avg_entry_price: string;
  current_price: string;
}

export class AlpacaService implements BrokerService {
  private baseUrl: string;
  private dataUrl: string;
  private websocketUrl: string;
  private webSocketConnections: Map<string, WebSocket> = new Map();
  private authenticated: boolean = false;
  
  constructor(
    private apiKey: string,
    private apiSecret: string,
    private isDemo: boolean = true
  ) {
    if (isDemo) {
      this.baseUrl = 'https://paper-api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
    } else {
      this.baseUrl = 'https://api.alpaca.markets';
      this.dataUrl = 'https://data.alpaca.markets';
    }
    this.websocketUrl = 'wss://stream.data.alpaca.markets/v2';
  }

  async connect(): Promise<void> {
    // Check if API keys are available
    if (!this.apiKey || !this.apiSecret) {
      try {
        const hasSecrets = await check_secrets(['ALPACA_API_KEY', 'ALPACA_API_SECRET']);
        if (!hasSecrets) {
          throw new Error('Alpaca API keys not found in environment variables');
        }
        this.apiKey = process.env.ALPACA_API_KEY || '';
        this.apiSecret = process.env.ALPACA_API_SECRET || '';
      } catch (error) {
        console.error('Failed to retrieve Alpaca API keys:', error);
        throw error;
      }
    }

    try {
      // Make a test call to verify credentials
      const response = await this.request('/v2/account');
      console.log('Connected to Alpaca API successfully');
      this.authenticated = true;
    } catch (error) {
      console.error('Failed to connect to Alpaca API:', error);
      throw error;
    }
  }

  private async request(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', data?: any) {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alpaca API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async requestData(endpoint: string, method: 'GET' | 'POST' | 'DELETE' = 'GET', data?: any) {
    const url = `${this.dataUrl}${endpoint}`;
    const headers = {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json'
    };

    const options: RequestInit = {
      method,
      headers
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Alpaca Data API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }

    const account = await this.request('/v2/account');
    
    return {
      total: parseFloat(account.portfolio_value),
      cash: parseFloat(account.cash),
      positions: parseFloat(account.portfolio_value) - parseFloat(account.cash)
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    const positions = await this.request('/v2/positions');

    return positions.map((position: AlpacaPosition) => {
      const quantity = parseFloat(position.qty);
      const averagePrice = parseFloat(position.avg_entry_price);
      const currentPrice = parseFloat(position.current_price);
      
      return {
        symbol: position.symbol,
        quantity,
        averagePrice,
        currentPrice,
        pnl: position.unrealized_pl
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
    if (!this.authenticated) {
      await this.connect();
    }

    const orderData: any = {
      symbol: order.symbol,
      qty: order.quantity.toString(),
      side: order.side,
      type: order.type,
      time_in_force: 'day'
    };

    if (order.type === 'limit' && order.limitPrice) {
      orderData.limit_price = order.limitPrice.toString();
    }

    const response = await this.request('/v2/orders', 'POST', orderData);
    return response.id;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    const orders = await this.request('/v2/orders?status=all&limit=100');
    
    return orders.map((order: any) => ({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      quantity: parseFloat(order.qty),
      price: parseFloat(order.filled_avg_price || order.limit_price || '0'),
      status: this.mapOrderStatus(order.status),
      timestamp: new Date(order.created_at).getTime(),
      broker: 'Alpaca'
    }));
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

  async getQuote(symbol: string): Promise<AlpacaQuote | null> {
    if (!this.authenticated) {
      await this.connect();
    }

    try {
      const quotes = await this.requestData(`/v2/stocks/${symbol}/quotes/latest`);
      if (!quotes || !quotes.quote) {
        return null;
      }

      return {
        symbol,
        bid: parseFloat(quotes.quote.bp),
        ask: parseFloat(quotes.quote.ap),
        bidSize: parseFloat(quotes.quote.bs),
        askSize: parseFloat(quotes.quote.as),
        timestamp: new Date(quotes.quote.t).getTime()
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Initialize Alpaca WebSocket connection
    const ws = new WebSocket(this.websocketUrl);
    
    ws.onopen = () => {
      console.log(`Alpaca WebSocket connected for ${symbol}`);
      
      // Authentication message
      ws.send(JSON.stringify({
        action: 'auth',
        key: this.apiKey,
        secret: this.apiSecret
      }));
      
      // Subscribe to trades for the symbol
      ws.send(JSON.stringify({
        action: 'subscribe',
        trades: [symbol]
      }));
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Handle different message types
      if (Array.isArray(data)) {
        data.forEach(msg => {
          if (msg.T === 'success' && msg.msg === 'authenticated') {
            console.log('Successfully authenticated with Alpaca WebSocket');
          } else if (msg.T === 'trade' && msg.S === symbol) {
            // Trade update
            callback({
              symbol: msg.S,
              price: parseFloat(msg.p),
              timestamp: new Date(msg.t).getTime(),
              volume: parseFloat(msg.s)
            });
          }
        });
      }
    };
    
    ws.onerror = (error) => {
      console.error(`Alpaca WebSocket error for ${symbol}:`, error);
    };
    
    ws.onclose = () => {
      console.log(`Alpaca WebSocket connection closed for ${symbol}`);
    };
    
    this.webSocketConnections.set(symbol, ws);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      // Send unsubscribe message if socket is open
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          action: 'unsubscribe',
          trades: [symbol]
        }));
      }
      
      // Close the connection
      ws.close();
      this.webSocketConnections.delete(symbol);
      console.log(`Unsubscribed from ${symbol} market data`);
    }
  }
}