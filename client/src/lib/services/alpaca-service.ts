import axios from 'axios';
import {
  AccountBalance,
  BrokerPosition,
  BrokerService,
  MarketData,
  OrderHistory,
  OrderSide,
  OrderType,
  OrderTimeInForce
} from './broker-service';

/**
 * Alpaca API service implementation
 * Connects to the Alpaca Trading API
 */
export class AlpacaService implements BrokerService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private isConnected: boolean = false;
  private marketDataCallbacks: Map<string, ((data: MarketData) => void)[]> = new Map();
  private webSocketConnection: WebSocket | null = null;

  constructor(apiKey: string, apiSecret: string, usePaperTrading: boolean = true) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    // Base URL depends on whether we're using paper trading
    this.baseUrl = usePaperTrading 
      ? 'https://paper-api.alpaca.markets/v2' 
      : 'https://api.alpaca.markets/v2';
    
    console.log('AlpacaService initialized with', 
      usePaperTrading ? 'paper trading' : 'live trading');
  }

  async connect(): Promise<void> {
    try {
      // Test connection by getting account info
      await this.getAccount();
      
      this.isConnected = true;
      console.log('Successfully connected to Alpaca Trading API');
      
      // Setup WebSocket for real-time data
      this.setupWebSocket();
      
      return Promise.resolve();
    } catch (error) {
      console.error('Failed to connect to Alpaca API:', error);
      this.isConnected = false;
      throw new Error('Could not connect to Alpaca API');
    }
  }

  async getAccountInfo(): Promise<any> {
    try {
      return await this.getAccount();
    } catch (error) {
      console.error('Error getting account info:', error);
      throw error;
    }
  }
  
  async getBalance(): Promise<AccountBalance> {
    try {
      const account = await this.getAccount();
      
      return {
        total: parseFloat(account.portfolio_value),
        cash: parseFloat(account.cash),
        positions: parseFloat(account.equity) - parseFloat(account.cash)
      };
    } catch (error) {
      console.error('Error getting account balance:', error);
      throw error;
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    try {
      const positionsResponse = await axios.get(`${this.baseUrl}/positions`, {
        headers: this.getHeaders()
      });
      
      return positionsResponse.data.map((pos: any) => ({
        symbol: pos.symbol,
        quantity: parseFloat(pos.qty),
        averagePrice: parseFloat(pos.avg_entry_price),
        currentPrice: parseFloat(pos.current_price),
        pnl: parseFloat(pos.unrealized_pl)
      }));
    } catch (error) {
      console.error('Error getting positions:', error);
      throw error;
    }
  }

  async placeOrder(order: {
    symbol: string;
    side: OrderSide;
    quantity: number;
    type: OrderType;
    timeInForce: OrderTimeInForce;
    limit_price?: number;
    stop_price?: number;
  }): Promise<string> {
    try {
      const orderRequest: any = {
        symbol: order.symbol,
        qty: order.quantity,
        side: order.side,
        type: order.type,
        time_in_force: order.timeInForce
      };
      
      // Add limit price if provided
      if (order.limit_price) {
        orderRequest.limit_price = order.limit_price;
      }
      
      // Add stop price if provided
      if (order.stop_price) {
        orderRequest.stop_price = order.stop_price;
      }
      
      const response = await axios.post(`${this.baseUrl}/orders`, orderRequest, {
        headers: this.getHeaders()
      });
      
      return response.data.id;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    try {
      const ordersResponse = await axios.get(
        `${this.baseUrl}/orders?status=all&limit=100`,
        { headers: this.getHeaders() }
      );
      
      return ordersResponse.data.map((order: any) => ({
        orderId: order.id,
        symbol: order.symbol,
        side: order.side,
        quantity: parseFloat(order.qty),
        price: parseFloat(order.filled_avg_price || order.limit_price || 0),
        status: this.mapOrderStatus(order.status),
        timestamp: new Date(order.submitted_at).getTime(),
        broker: 'Alpaca'
      }));
    } catch (error) {
      console.error('Error getting order history:', error);
      throw error;
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Add callback to subscribers
    if (!this.marketDataCallbacks.has(symbol)) {
      this.marketDataCallbacks.set(symbol, []);
      
      // Subscribe to the symbol on WebSocket if connected
      if (this.webSocketConnection && 
          this.webSocketConnection.readyState === WebSocket.OPEN) {
        this.webSocketConnection.send(JSON.stringify({
          action: 'subscribe',
          trades: [symbol]
        }));
      }
    }
    
    this.marketDataCallbacks.get(symbol)?.push(callback);
  }

  unsubscribeFromMarketData(symbol: string): void {
    // If we have subscribers for this symbol
    if (this.marketDataCallbacks.has(symbol)) {
      // Unsubscribe from the symbol on WebSocket if connected
      if (this.webSocketConnection && 
          this.webSocketConnection.readyState === WebSocket.OPEN) {
        this.webSocketConnection.send(JSON.stringify({
          action: 'unsubscribe',
          trades: [symbol]
        }));
      }
      
      // Remove callbacks
      this.marketDataCallbacks.delete(symbol);
    }
  }

  // Private helper methods
  private getHeaders() {
    return {
      'APCA-API-KEY-ID': this.apiKey,
      'APCA-API-SECRET-KEY': this.apiSecret,
      'Content-Type': 'application/json'
    };
  }

  private async getAccount(): Promise<any> {
    const response = await axios.get(`${this.baseUrl}/account`, {
      headers: this.getHeaders()
    });
    return response.data;
  }

  private setupWebSocket(): void {
    // Close existing connection if any
    if (this.webSocketConnection) {
      this.webSocketConnection.close();
    }
    
    const wsURL = this.baseUrl.includes('paper') 
      ? 'wss://stream.data.alpaca.markets/v2/iex' 
      : 'wss://stream.data.alpaca.markets/v2/iex';
    
    try {
      this.webSocketConnection = new WebSocket(wsURL);
      
      this.webSocketConnection.onopen = () => {
        console.log('Alpaca WebSocket connected');
        
        // Authentication
        if (this.webSocketConnection) {
          this.webSocketConnection.send(JSON.stringify({
            action: 'auth',
            key: this.apiKey,
            secret: this.apiSecret
          }));
          
          // Subscribe to existing symbols
          const symbols = Array.from(this.marketDataCallbacks.keys());
          if (symbols.length > 0) {
            this.webSocketConnection.send(JSON.stringify({
              action: 'subscribe',
              trades: symbols
            }));
          }
        }
      };
      
      this.webSocketConnection.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Handle trade data
          if (data && data.T === 'trade') {
            const marketData: MarketData = {
              symbol: data.S,
              price: parseFloat(data.p),
              timestamp: new Date(data.t).getTime(),
              volume: parseFloat(data.v)
            };
            
            // Notify subscribers
            this.marketDataCallbacks.get(data.S)?.forEach(callback => {
              callback(marketData);
            });
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      };
      
      this.webSocketConnection.onerror = (error) => {
        console.error('Alpaca WebSocket error:', error);
      };
      
      this.webSocketConnection.onclose = () => {
        console.log('Alpaca WebSocket disconnected');
        
        // Try to reconnect after a delay
        setTimeout(() => {
          if (this.isConnected) {
            this.setupWebSocket();
          }
        }, 5000);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
    }
  }

  private mapOrderStatus(status: string): 'pending' | 'filled' | 'cancelled' {
    switch (status) {
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
}