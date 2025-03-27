import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class BitfinexService implements BrokerService {
  private baseUrl = 'https://api.bitfinex.com/v2';
  private authUrl = 'https://api.bitfinex.com/v1';
  private webSocketUrl = 'wss://api-pub.bitfinex.com/ws/2';
  private ws: WebSocket | null = null;
  private subscriptions: Map<string, number> = new Map();

  constructor(
    private apiKey: string,
    private apiSecret: string,
    private isSandbox: boolean = false
  ) {
    // Bitfinex doesn't have an official sandbox, but you can use testnet for some features
    if (isSandbox) {
      console.warn('Bitfinex does not provide an official sandbox environment. Using main API with limited functionality.');
    }
  }

  async connect(): Promise<void> {
    try {
      // Verify credentials by fetching wallet balances
      await this.request('/balances', {}, true);
      console.log('Connected to Bitfinex API');
    } catch (error) {
      console.error('Failed to connect to Bitfinex:', error);
      throw new Error('Failed to connect to Bitfinex API');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}, requireAuth: boolean = false): Promise<any> {
    const url = requireAuth ? `${this.authUrl}${endpoint}` : `${this.baseUrl}${endpoint}`;
    
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add authentication if required
    if (requireAuth) {
      const nonce = Date.now().toString();
      const payload = `${nonce}${endpoint}`;
      
      // In a real implementation, we would sign the payload with the API secret
      // This would require crypto functions which might be implementation-specific
      headers = {
        ...headers,
        'X-BFX-APIKEY': this.apiKey,
        'X-BFX-PAYLOAD': btoa(payload),
        'X-BFX-SIGNATURE': 'dummy-signature' // In real implementation, this would be a real signature
      };
    }

    const response = await fetch(url, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`Bitfinex request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    try {
      const wallets = await this.request('/balances', {}, true);
      
      let total = 0;
      let cash = 0;
      
      // Process wallets to calculate total and cash balances
      wallets.forEach((wallet: any) => {
        const amount = parseFloat(wallet.amount);
        total += amount;
        
        if (wallet.type === 'exchange') {
          cash += amount;
        }
      });
      
      return {
        total,
        cash,
        positions: total - cash // Positions is total minus cash
      };
    } catch (error) {
      console.error('Failed to get Bitfinex balance:', error);
      throw new Error('Failed to get Bitfinex balance');
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    try {
      const positions = await this.request('/positions', {}, true);
      
      return positions.map((pos: any) => ({
        symbol: this.formatSymbol(pos.symbol),
        quantity: parseFloat(pos.amount),
        averagePrice: parseFloat(pos.base),
        currentPrice: parseFloat(pos.price),
        pnl: parseFloat(pos.pl)
      }));
    } catch (error) {
      console.error('Failed to get Bitfinex positions:', error);
      throw new Error('Failed to get Bitfinex positions');
    }
  }

  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    try {
      const body = {
        symbol: this.getExchangeSymbol(order.symbol),
        amount: order.side === 'buy' ? order.quantity.toString() : (-order.quantity).toString(),
        price: order.limitPrice?.toString() || '0',
        exchange: 'bitfinex',
        type: order.type === 'market' ? 'market' : 'limit',
      };

      const response = await this.request('/order/new', {
        method: 'POST',
        body: JSON.stringify(body)
      }, true);

      return response.order_id.toString();
    } catch (error) {
      console.error('Failed to place Bitfinex order:', error);
      throw new Error('Failed to place Bitfinex order');
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Create a new WebSocket if one doesn't exist
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      this.ws = new WebSocket(this.webSocketUrl);
      
      this.ws.onopen = () => {
        console.log('Bitfinex WebSocket connected');
        // Subscribe to ticker for the symbol
        this.subscribeToTicker(symbol);
      };

      this.ws.onclose = () => {
        console.log('Bitfinex WebSocket disconnected');
      };

      this.ws.onerror = (error) => {
        console.error('Bitfinex WebSocket error:', error);
      };
    } else {
      // If WebSocket already exists and is open, subscribe to the symbol
      this.subscribeToTicker(symbol);
    }

    // Handle incoming messages
    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      
      // Check if it's a ticker update
      if (Array.isArray(data) && data[1] && Array.isArray(data[1])) {
        const channelId = data[0];
        const channelData = data[1];
        
        // Get the symbol from the subscriptions map
        const channelSymbol = this.getSymbolFromChannelId(channelId);
        
        if (channelSymbol === symbol) {
          // Format for ticker data [PRICE, BID, ASK, ...]
          callback({
            symbol: this.formatSymbol(channelSymbol),
            price: channelData[6], // Last price
            timestamp: Date.now(),
            volume: channelData[7],
            high: channelData[8],
            low: channelData[9]
          });
        }
      }
    };
  }

  private subscribeToTicker(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return;
    }

    const exchangeSymbol = this.getExchangeSymbol(symbol);
    const msg = JSON.stringify({
      event: 'subscribe',
      channel: 'ticker',
      symbol: exchangeSymbol
    });

    this.ws.send(msg);
  }

  private getSymbolFromChannelId(channelId: number): string {
    // Convert entries to an array first to avoid MapIterator compatibility issues
    const entries = Array.from(this.subscriptions.entries());
    for (const [symbol, id] of entries) {
      if (id === channelId) {
        return symbol;
      }
    }
    return '';
  }

  unsubscribeFromMarketData(symbol: string): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const channelId = this.subscriptions.get(symbol);
    if (channelId) {
      const msg = JSON.stringify({
        event: 'unsubscribe',
        chanId: channelId
      });

      this.ws.send(msg);
      this.subscriptions.delete(symbol);
    }
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    try {
      const orders = await this.request('/orders/hist', {}, true);

      return orders.map((order: any) => ({
        orderId: order.id.toString(),
        symbol: this.formatSymbol(order.symbol),
        side: parseFloat(order.amount) > 0 ? 'buy' : 'sell',
        quantity: Math.abs(parseFloat(order.amount)),
        price: parseFloat(order.price),
        status: this.mapOrderStatus(order.status),
        timestamp: order.timestamp * 1000 // Convert to milliseconds
      }));
    } catch (error) {
      console.error('Failed to get Bitfinex order history:', error);
      throw new Error('Failed to get Bitfinex order history');
    }
  }

  private mapOrderStatus(bitfinexStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (bitfinexStatus) {
      case 'EXECUTED':
        return 'filled';
      case 'CANCELED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }

  // Helper methods for symbol formatting
  private formatSymbol(symbol: string): string {
    // Convert from Bitfinex format (tBTCUSD) to standard format (BTCUSD)
    return symbol.startsWith('t') ? symbol.substring(1) : symbol;
  }

  private getExchangeSymbol(symbol: string): string {
    // Convert to Bitfinex format if not already
    return symbol.startsWith('t') ? symbol : `t${symbol}`;
  }
}