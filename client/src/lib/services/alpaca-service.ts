
import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class AlpacaService implements BrokerService {
  private baseUrl = 'https://broker-api.sandbox.alpaca.markets/v1';
  private dataUrl = 'https://data.sandbox.alpaca.markets/v2';
  private webSocketUrl = 'wss://stream.data.sandbox.alpaca.markets/v2/iex';

  constructor(
    private apiKey: string,
    private apiSecret: string,
    private isSandbox: boolean = true
  ) {
    if (!isSandbox) {
      this.baseUrl = 'https://broker-api.alpaca.markets/v1';
      this.dataUrl = 'https://data.alpaca.markets/v2';
      this.webSocketUrl = 'wss://stream.data.alpaca.markets/v2/iex';
    }
  }

  async connect(): Promise<void> {
    // Verify credentials
    await this.request('/account');
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'APCA-API-KEY-ID': this.apiKey,
        'APCA-API-SECRET-KEY': this.apiSecret,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Alpaca request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    const account = await this.request('/account');
    return {
      total: Number(account.portfolio_value),
      cash: Number(account.cash),
      positions: Number(account.portfolio_value) - Number(account.cash)
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    const positions = await this.request('/positions');
    return positions.map((pos: any) => ({
      symbol: pos.symbol,
      quantity: Number(pos.qty),
      averagePrice: Number(pos.avg_entry_price),
      currentPrice: Number(pos.current_price),
      pnl: Number(pos.unrealized_pl)
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
        qty: order.quantity,
        side: order.side,
        type: order.type,
        time_in_force: 'day',
        limit_price: order.limitPrice
      })
    });
    return response.id;
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    const ws = new WebSocket(this.webSocketUrl);
    
    ws.onopen = () => {
      ws.send(JSON.stringify({
        action: 'subscribe',
        trades: [symbol],
        quotes: [symbol],
        bars: [symbol]
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.T === 't') { // Trade data
        callback({
          symbol: data.S,
          price: Number(data.p),
          timestamp: data.t,
          volume: data.v
        });
      }
    };
  }

  unsubscribeFromMarketData(symbol: string): void {
    // Implementation depends on WebSocket connection management
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    const orders = await this.request('/orders?status=all');
    return orders.map((order: any) => ({
      orderId: order.id,
      symbol: order.symbol,
      side: order.side,
      quantity: Number(order.qty),
      price: Number(order.filled_avg_price || order.limit_price || 0),
      status: this.mapOrderStatus(order.status),
      timestamp: new Date(order.created_at).getTime()
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
}
