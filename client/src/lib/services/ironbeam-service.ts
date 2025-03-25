
import { BrokerService, MarketData, AccountBalance, BrokerPosition } from './broker-service';

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
    const response = await fetch(`${this.baseUrl}/auth`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: this.username, password: this.password })
    });

    if (!response.ok) {
      throw new Error('Failed to connect to IronBeam');
    }

    const data = await response.json();
    this.token = data.token;
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
    // Implement WebSocket connection for real-time data
    const ws = new WebSocket(`wss://${this.isDemo ? 'demo.' : ''}ironbeamapi.com/v1/ws`);
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback({
        symbol: data.symbol,
        price: Number(data.price),
        timestamp: Date.parse(data.timestamp),
        volume: data.volume,
        high: data.high,
        low: data.low,
        open: data.open,
        close: data.close
      });
    };

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
