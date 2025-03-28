import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class BinanceService implements BrokerService {
  private baseUrl = 'https://api.binance.com/api/v3';
  private websocketUrl = 'wss://stream.binance.com:9443/ws';
  private webSocketConnections: Map<string, WebSocket> = new Map();
  
  constructor(
    private apiKey: string,
    private apiSecret: string,
    private isTestnet: boolean = false
  ) {
    if (isTestnet) {
      this.baseUrl = 'https://testnet.binance.vision/api/v3';
      this.websocketUrl = 'wss://testnet.binance.vision/ws';
    }
  }

  async connect(): Promise<void> {
    // Verify credentials by making a simple account request
    await this.request('/account', 'GET', true);
  }

  private async request(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE' = 'GET', 
    signed: boolean = false,
    params: Record<string, any> = {}
  ) {
    let url = `${this.baseUrl}${endpoint}`;
    
    // For signed endpoints, we need to include a timestamp and signature
    if (signed) {
      const timestamp = Date.now();
      params = { ...params, timestamp };
      
      // Create the signature
      const queryString = new URLSearchParams(params as Record<string, string>).toString();
      const signature = this.createSignature(queryString);
      url += `?${queryString}&signature=${signature}`;
    } else if (Object.keys(params).length > 0) {
      url += `?${new URLSearchParams(params as Record<string, string>).toString()}`;
    }

    const response = await fetch(url, {
      method,
      headers: {
        'X-MBX-APIKEY': this.apiKey,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Binance API error: ${errorData.msg || response.statusText}`);
    }

    return response.json();
  }

  private createSignature(queryString: string): string {
    // In a real implementation, we would use a crypto library to create an HMAC SHA256 signature
    // For this example, we'll return a mock signature
    
    console.log(`Would create HMAC signature for: ${queryString} using secret ${this.apiSecret.slice(0, 3)}...`);
    
    // In production, this would be:
    // return crypto.createHmac('sha256', this.apiSecret).update(queryString).digest('hex');
    
    return 'mock-signature-for-development';
  }

  async getBalance(): Promise<AccountBalance> {
    const account = await this.request('/account', 'GET', true);
    
    let total = 0;
    const nonZeroBalances = account.balances.filter((b: any) => parseFloat(b.free) > 0 || parseFloat(b.locked) > 0);
    
    // In a real implementation, we would fetch the current price for each asset and calculate the total
    // For simplicity, we'll assume we just want USD/USDT balances
    const usdtBalance = nonZeroBalances.find((b: any) => b.asset === 'USDT');
    const usdBalance = nonZeroBalances.find((b: any) => b.asset === 'BUSD');
    
    const cash = (usdtBalance ? parseFloat(usdtBalance.free) + parseFloat(usdtBalance.locked) : 0) +
                (usdBalance ? parseFloat(usdBalance.free) + parseFloat(usdBalance.locked) : 0);
    
    // For non-stablecoin assets, we need their USD value
    // In production, we would fetch current prices and calculate
    const positionsValue = account.balances
      .filter((b: any) => b.asset !== 'USDT' && b.asset !== 'BUSD' && (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0))
      .reduce((sum: number, b: any) => sum + parseFloat(b.free) + parseFloat(b.locked), 0) * 1000; // Mock conversion rate
    
    return {
      total: cash + positionsValue,
      cash,
      positions: positionsValue
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    const account = await this.request('/account', 'GET', true);
    const tickers = await this.request('/ticker/price');
    
    // Filter out zero balances and stablecoins
    const positions = account.balances.filter((b: any) => 
      (parseFloat(b.free) > 0 || parseFloat(b.locked) > 0) && 
      b.asset !== 'USDT' && b.asset !== 'BUSD' && b.asset !== 'DAI'
    );
    
    return positions.map((pos: any) => {
      const symbol = `${pos.asset}USDT`;
      const ticker = tickers.find((t: any) => t.symbol === symbol);
      const currentPrice = ticker ? parseFloat(ticker.price) : 0;
      const quantity = parseFloat(pos.free) + parseFloat(pos.locked);
      
      // In a real implementation, we would fetch the average purchase price
      // For this example, we'll use a mock value
      const averagePrice = currentPrice * 0.9; // Mock: assume 10% profit on average
      
      return {
        symbol,
        quantity,
        averagePrice,
        currentPrice,
        pnl: quantity * (currentPrice - averagePrice)
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
    const params: Record<string, any> = {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      type: order.type.toUpperCase(),
      quantity: order.quantity,
    };
    
    if (order.type === 'limit' && order.limitPrice) {
      params.price = order.limitPrice;
      params.timeInForce = 'GTC'; // Good Till Cancelled
    }
    
    const response = await this.request('/order', 'POST', true, params);
    return response.orderId;
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Normalize symbol for Binance (remove USD, add USDT)
    const binanceSymbol = symbol.replace('USD', '').toUpperCase() + 'USDT';
    
    // Create a WebSocket connection
    const ws = new WebSocket(`${this.websocketUrl}/${binanceSymbol.toLowerCase()}@trade`);
    
    ws.onopen = () => {
      console.log(`Binance WebSocket connected for ${binanceSymbol}`);
    };
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      callback({
        symbol,
        price: parseFloat(data.p),
        timestamp: data.T,
        volume: parseFloat(data.q)
      });
    };
    
    ws.onerror = (error) => {
      console.error(`Binance WebSocket error for ${binanceSymbol}:`, error);
    };
    
    ws.onclose = () => {
      console.log(`Binance WebSocket connection closed for ${binanceSymbol}`);
    };
    
    this.webSocketConnections.set(symbol, ws);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      ws.close();
      this.webSocketConnections.delete(symbol);
      console.log(`Unsubscribed from ${symbol} market data`);
    }
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    // Get all orders for all symbols
    // In production, we would need to query multiple symbols
    // For simplicity, we'll just query a few common ones
    const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DOGEUSDT'];
    
    const allOrders: OrderHistory[] = [];
    
    for (const symbol of symbols) {
      try {
        const params = {
          symbol,
          limit: 50 // Get last 50 orders
        };
        
        const orders = await this.request('/allOrders', 'GET', true, params);
        
        const mappedOrders: OrderHistory[] = orders.map((order: any) => ({
          orderId: order.orderId.toString(),
          symbol: symbol.replace('USDT', 'USD'), // Normalize back to our format
          side: order.side.toLowerCase(),
          quantity: parseFloat(order.origQty),
          price: parseFloat(order.price) || parseFloat(order.cummulativeQuoteQty) / parseFloat(order.executedQty),
          status: this.mapOrderStatus(order.status),
          timestamp: order.time,
          broker: 'Binance'
        }));
        
        allOrders.push(...mappedOrders);
      } catch (error) {
        console.error(`Error fetching orders for ${symbol}:`, error);
      }
    }
    
    return allOrders.sort((a, b) => b.timestamp - a.timestamp);
  }

  private mapOrderStatus(binanceStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (binanceStatus) {
      case 'FILLED':
        return 'filled';
      case 'CANCELED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}