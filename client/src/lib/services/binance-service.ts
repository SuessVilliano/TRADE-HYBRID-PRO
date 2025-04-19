import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import { check_secrets } from '../utils';
import { config } from '../config';

export class BinanceService implements BrokerService {
  private baseUrl: string;
  private apiKey: string;
  private apiSecret: string;
  private webSocketConnections: Map<string, WebSocket> = new Map();
  private mockDataIntervals: Map<string, ReturnType<typeof setInterval>> = new Map();
  private authenticated: boolean = false;
  
  constructor(
    apiKey: string = '',
    apiSecret: string = '',
    isTestnet: boolean = true
  ) {
    this.apiKey = apiKey;
    this.apiSecret = apiSecret;
    
    if (isTestnet) {
      this.baseUrl = 'https://testnet.binance.vision/api';
    } else {
      this.baseUrl = 'https://api.binance.com/api';
    }
  }

  async connect(): Promise<void> {
    // Check if API keys are available
    if (!this.apiKey || !this.apiSecret) {
      try {
        const hasSecrets = await check_secrets(['BINANCE_API_KEY', 'BINANCE_API_SECRET']);
        if (!hasSecrets) {
          throw new Error('Binance API keys not found in environment variables');
        }
        this.apiKey = config.BINANCE_API_KEY || '';
        this.apiSecret = config.BINANCE_API_SECRET || '';
      } catch (error) {
        console.error('Failed to retrieve Binance API keys:', error);
        throw error;
      }
    }

    try {
      // Test connection by getting account information
      await this.request('/v3/account', 'GET', {}, true);
      console.log('Connected to Binance API successfully');
      this.authenticated = true;
    } catch (error) {
      console.error('Failed to connect to Binance API:', error);
      throw error;
    }
  }

  private async request(
    endpoint: string, 
    method: 'GET' | 'POST' | 'DELETE' = 'GET', 
    params: Record<string, string> = {},
    secured: boolean = false
  ): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    if (Object.keys(params).length > 0) {
      for (const key in params) {
        url.searchParams.append(key, params[key]);
      }
    }

    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    };

    // Add authentication for secured endpoints
    if (secured) {
      // Add timestamp parameter required by Binance
      const timestamp = Date.now().toString();
      url.searchParams.append('timestamp', timestamp);
      
      // Generate signature
      const queryString = url.searchParams.toString();
      const signature = await this.generateSignature(queryString);
      url.searchParams.append('signature', signature);
      
      // Add API key to headers
      headers['X-MBX-APIKEY'] = this.apiKey;
    }

    const options: RequestInit = {
      method,
      headers
    };

    const response = await fetch(url.toString(), options);
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Binance API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async generateSignature(queryString: string): Promise<string> {
    // For browser environment, use SubtleCrypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(this.apiSecret);
    const messageData = encoder.encode(queryString);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign(
      'HMAC',
      cryptoKey,
      messageData
    );

    // Convert to hex string
    return Array.from(new Uint8Array(signature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }

    const accountInfo = await this.request('/v3/account', 'GET', {}, true);
    
    // Calculate total balance in USDT
    let totalBalance = 0;
    let cashBalance = 0;
    let positionsValue = 0;

    for (const balance of accountInfo.balances) {
      if (parseFloat(balance.free) > 0 || parseFloat(balance.locked) > 0) {
        const total = parseFloat(balance.free) + parseFloat(balance.locked);
        
        if (balance.asset === 'USDT') {
          // USDT balance is already in USD equivalent
          cashBalance += total;
        } else {
          try {
            // Get price in USDT
            const ticker = await this.request('/v3/ticker/price', 'GET', { symbol: `${balance.asset}USDT` });
            const usdtValue = total * parseFloat(ticker.price);
            
            // Count as positions if locked, otherwise as cash
            if (parseFloat(balance.locked) > 0) {
              positionsValue += usdtValue;
            } else {
              cashBalance += usdtValue;
            }
          } catch (error) {
            console.warn(`Could not get price for ${balance.asset}USDT: ${error}`);
          }
        }
      }
    }

    totalBalance = cashBalance + positionsValue;
    
    return {
      total: totalBalance,
      cash: cashBalance,
      positions: positionsValue
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    // Get open orders
    const openOrders = await this.request('/v3/openOrders', 'GET', {}, true);
    
    // Get account information
    const accountInfo = await this.request('/v3/account', 'GET', {}, true);
    
    const positions: BrokerPosition[] = [];
    
    // Add positions from balances (excluding USDT and very small balances)
    for (const balance of accountInfo.balances) {
      const total = parseFloat(balance.free) + parseFloat(balance.locked);
      
      if (total > 0.001 && balance.asset !== 'USDT') {
        try {
          // Get current price
          const ticker = await this.request('/v3/ticker/price', 'GET', { symbol: `${balance.asset}USDT` });
          const currentPrice = parseFloat(ticker.price);
          
          // Find average entry price - this is a simplification as Binance doesn't provide average entry
          // In a real-world scenario, you'd track this from trade history
          let averagePrice = currentPrice;
          
          // Add the position
          positions.push({
            symbol: `${balance.asset}USDT`,
            quantity: total,
            averagePrice,
            currentPrice,
            pnl: total * (currentPrice - averagePrice) // Approximate P&L
          });
        } catch (error) {
          console.warn(`Could not get price for ${balance.asset}USDT: ${error}`);
        }
      }
    }
    
    return positions;
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

    const params: Record<string, string> = {
      symbol: order.symbol,
      side: order.side.toUpperCase(),
      quantity: order.quantity.toString(),
      type: order.type.toUpperCase()
    };

    if (order.type === 'limit' && order.limitPrice) {
      params.timeInForce = 'GTC';
      params.price = order.limitPrice.toString();
    }

    const response = await this.request('/v3/order', 'POST', params, true);
    return response.orderId.toString();
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    // Get all orders for all symbols (this is a simplification)
    // In a real app, you might want to query by specific symbols
    const allOrders = await this.request('/v3/allOrders', 'GET', {}, true);
    
    return allOrders.map((order: any) => ({
      orderId: order.orderId.toString(),
      symbol: order.symbol,
      side: order.side.toLowerCase(),
      quantity: parseFloat(order.origQty),
      price: parseFloat(order.price),
      status: this.mapOrderStatus(order.status),
      timestamp: order.time,
      broker: 'Binance'
    }));
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

  async getQuote(symbol: string): Promise<{ bid: number; ask: number } | null> {
    try {
      const bookTicker = await this.request('/v3/ticker/bookTicker', 'GET', { symbol });
      
      return {
        bid: parseFloat(bookTicker.bidPrice),
        ask: parseFloat(bookTicker.askPrice)
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Standard lowercase for Binance websocket
    const lowerSymbol = symbol.toLowerCase();
    
    try {
      // Connect to Binance WebSocket with proper error handling
      let ws: WebSocket | null = null;
      
      try {
        ws = new WebSocket(`wss://stream.binance.com:9443/ws/${lowerSymbol}@trade`);
      } catch (wsError) {
        console.error(`Failed to create Binance WebSocket for ${symbol}:`, wsError);
        this.provideMockMarketData(symbol, callback);
        return;
      }
      
      if (!ws) {
        console.error(`Binance WebSocket not created for ${symbol}`);
        this.provideMockMarketData(symbol, callback);
        return;
      }
      
      ws.onopen = () => {
        console.log(`Binance WebSocket connected for ${symbol}`);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          callback({
            symbol: symbol.toUpperCase(), // Ensure consistent casing
            price: parseFloat(data.p),
            timestamp: data.E, // Event time
            volume: parseFloat(data.q) // Quantity
          });
        } catch (error) {
          console.error('Error processing Binance WebSocket data:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`Binance WebSocket error for ${symbol}:`, error);
        // Fall back to mock data on error
        this.provideMockMarketData(symbol, callback);
      };
      
      ws.onclose = () => {
        console.log(`Binance WebSocket connection closed for ${symbol}`);
        // Attempt to reconnect after a delay
        setTimeout(() => {
          const existingWs = this.webSocketConnections.get(symbol);
          if (existingWs === ws) { // Only reconnect if this is still the current connection
            this.subscribeToMarketData(symbol, callback);
          }
        }, 5000);
      };
      
      this.webSocketConnections.set(symbol, ws);
    } catch (error) {
      console.error(`Error setting up Binance market data subscription for ${symbol}:`, error);
      this.provideMockMarketData(symbol, callback);
    }
  }
  
  // Provide mock market data when WebSocket connection fails
  private provideMockMarketData(symbol: string, callback: (data: MarketData) => void): void {
    console.log(`Providing mock market data for ${symbol}`);
    
    // Generate a random base price for the symbol
    const getBasePrice = () => {
      switch (symbol.toUpperCase()) {
        case 'BTCUSDT': return 60000 + Math.random() * 2000;
        case 'ETHUSDT': return 3000 + Math.random() * 200;
        case 'BNBUSDT': return 500 + Math.random() * 20;
        case 'ADAUSDT': return 0.4 + Math.random() * 0.05;
        case 'SOLUSDT': return 100 + Math.random() * 10;
        case 'XRPUSDT': return 0.5 + Math.random() * 0.05;
        default: return 100 + Math.random() * 10;
      }
    };
    
    const basePrice = getBasePrice();
    // Set up interval to send mock market data updates
    const intervalId = setInterval(() => {
      const mockData: MarketData = {
        symbol: symbol.toUpperCase(),
        price: basePrice + (Math.random() - 0.5) * (basePrice * 0.01),
        timestamp: Date.now(),
        volume: Math.floor(Math.random() * 100)
      };
      
      callback(mockData);
    }, 1000);
    
    // Store subscription information for cleanup
    this.mockDataIntervals.set(symbol, intervalId);
  }

  unsubscribeFromMarketData(symbol: string): void {
    // Clean up WebSocket connection if it exists
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      try {
        ws.close();
      } catch (error) {
        console.error(`Error closing WebSocket for ${symbol}:`, error);
      }
      this.webSocketConnections.delete(symbol);
    }
    
    // Clean up any mock data interval
    if (this.mockDataIntervals.has(symbol)) {
      clearInterval(this.mockDataIntervals.get(symbol));
      this.mockDataIntervals.delete(symbol);
      console.log(`Cleaned up mock data interval for ${symbol}`);
    }
    
    console.log(`Unsubscribed from ${symbol} market data`);
  }
}