import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import { check_secrets } from '../utils';

// Interface for Kraken API responses
interface KrakenBalanceResponse {
  result: {
    [key: string]: string; // Currency code -> balance as string
  };
  error: string[];
}

interface KrakenPositionResponse {
  result: Array<{
    ordertxid: string;
    pair: string;
    time: number;
    type: string;
    ordertype: string;
    price: string;
    cost: string;
    fee: string;
    vol: string;
    margin: string;
    misc: string;
  }>;
}

interface KrakenOrderResponse {
  result: {
    open: {
      [key: string]: {
        refid: string | null;
        userref: number;
        status: string;
        opentm: number;
        starttm: number;
        expiretm: number;
        descr: {
          pair: string;
          type: string;
          ordertype: string;
          price: string;
          price2: string;
          leverage: string;
          order: string;
          close: string;
        };
        vol: string;
        vol_exec: string;
        cost: string;
        fee: string;
        price: string;
        stopprice: string;
        limitprice: string;
        misc: string;
        oflags: string;
      };
    };
    closed: {
      [key: string]: {
        refid: string | null;
        userref: number;
        status: string;
        opentm: number;
        starttm: number;
        expiretm: number;
        descr: {
          pair: string;
          type: string;
          ordertype: string;
          price: string;
          price2: string;
          leverage: string;
          order: string;
          close: string;
        };
        vol: string;
        vol_exec: string;
        cost: string;
        fee: string;
        price: string;
        stopprice: string;
        limitprice: string;
        misc: string;
        oflags: string;
        closetm: number;
        reason: string | null;
      };
    };
  };
  error: string[];
}

interface KrakenTickerResponse {
  result: {
    [pair: string]: {
      a: string[]; // ask price, whole lot volume, lot volume
      b: string[]; // bid price, whole lot volume, lot volume
      c: string[]; // close price, lot volume
      v: string[]; // 24h volume, 30-day volume
      p: string[]; // 24h volume weighted avg, 30-day volume weighted avg
      t: number[]; // 24h trades, 30-day trades
      l: string[]; // 24h low, 30-day low
      h: string[]; // 24h high, 30-day high
      o: string;   // 24h open
    };
  };
  error: string[];
}

export class KrakenService implements BrokerService {
  private apiKey: string;
  private privateKey: string;
  private baseUrl: string = 'https://api.kraken.com';
  private webSocketUrl: string = 'wss://ws.kraken.com';
  private webSocketConnections: Map<string, WebSocket> = new Map();
  private authenticated: boolean = false;
  
  constructor(apiKey: string = '', privateKey: string = '') {
    this.apiKey = apiKey;
    this.privateKey = privateKey;
  }
  
  async connect(): Promise<void> {
    // Check if API keys are available
    if (!this.apiKey || !this.privateKey) {
      try {
        const hasKeys = await check_secrets(['KRAKEN_API_KEY', 'KRAKEN_PRIVATE_KEY']);
        if (!hasKeys) {
          throw new Error('Kraken API credentials not found in environment variables');
        }
        this.apiKey = process.env.KRAKEN_API_KEY || '';
        this.privateKey = process.env.KRAKEN_PRIVATE_KEY || '';
      } catch (error) {
        console.error('Failed to retrieve Kraken API credentials:', error);
        throw error;
      }
    }

    try {
      // Test connection by making a non-sensitive API call
      const response = await this.publicRequest('/0/public/Time');
      if (response.error && response.error.length > 0) {
        throw new Error(`Kraken API error: ${response.error.join(', ')}`);
      }
      
      // Also verify private API access
      const balanceResponse = await this.privateRequest('/0/private/Balance');
      if (balanceResponse.error && balanceResponse.error.length > 0) {
        throw new Error(`Kraken API error (private): ${balanceResponse.error.join(', ')}`);
      }
      
      console.log('Successfully connected to Kraken API');
      this.authenticated = true;
    } catch (error) {
      console.error('Failed to connect to Kraken API:', error);
      throw error;
    }
  }
  
  private async publicRequest(endpoint: string, params: Record<string, string> = {}): Promise<any> {
    const url = new URL(`${this.baseUrl}${endpoint}`);
    
    // Add query parameters
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
    
    const response = await fetch(url.toString());
    
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Kraken API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }
  
  private async privateRequest(endpoint: string, data: Record<string, string> = {}): Promise<any> {
    const path = endpoint;
    const nonce = Date.now().toString();
    
    // Prepare request data
    const requestData = {
      nonce,
      ...data
    };
    
    // Create form data
    const formData = new URLSearchParams();
    Object.entries(requestData).forEach(([key, value]) => {
      formData.append(key, value);
    });
    
    // In a production app, this would call the backend to generate the signature
    // For now, we'll use a demo mode with mocked responses
    console.log(`[Kraken Service] Calling ${path} with demo mode`);
    
    // Return mock data based on the endpoint
    if (endpoint === '/0/private/Balance') {
      return {
        result: {
          ZUSD: "1000.0000",
          XXBT: "0.5000",
          XETH: "5.0000",
          USDT: "2000.0000",
        },
        error: []
      };
    }
    
    if (endpoint === '/0/private/TradesHistory') {
      return {
        result: {
          trades: {
            "TXID1": {
              pair: "XXBTZUSD",
              time: Date.now() / 1000 - 86400,
              type: "buy",
              ordertype: "market",
              price: "50000.0",
              vol: "0.1"
            },
            "TXID2": {
              pair: "XETHZUSD",
              time: Date.now() / 1000 - 43200,
              type: "buy",
              ordertype: "market",
              price: "2000.0",
              vol: "2.5"
            }
          }
        },
        error: []
      };
    }
    
    if (endpoint === '/0/private/ClosedOrders') {
      return {
        result: {
          closed: {
            "ORDER1": {
              refid: null,
              userref: 0,
              status: "closed",
              opentm: Date.now() / 1000 - 172800,
              starttm: 0,
              expiretm: 0,
              descr: {
                pair: "XXBTZUSD",
                type: "buy",
                ordertype: "market",
                price: "48000.0",
                price2: "0",
                leverage: "none",
                order: "buy 0.2 XXBTZUSD @ market",
                close: ""
              },
              vol: "0.2",
              vol_exec: "0.2",
              cost: "9600.0",
              fee: "15.4",
              price: "48000.0",
              stopprice: "0.0",
              limitprice: "0.0",
              misc: "",
              oflags: "fciq",
              closetm: Date.now() / 1000 - 172800
            },
            "ORDER2": {
              refid: null,
              userref: 0,
              status: "closed",
              opentm: Date.now() / 1000 - 86400,
              starttm: 0,
              expiretm: 0,
              descr: {
                pair: "XETHZUSD",
                type: "sell",
                ordertype: "limit",
                price: "2100.0",
                price2: "0",
                leverage: "none",
                order: "sell 1.0 XETHZUSD @ limit 2100.0",
                close: ""
              },
              vol: "1.0",
              vol_exec: "1.0",
              cost: "2100.0",
              fee: "3.4",
              price: "2100.0",
              stopprice: "0.0",
              limitprice: "0.0",
              misc: "",
              oflags: "fciq",
              closetm: Date.now() / 1000 - 86400
            }
          }
        },
        error: []
      };
    }
    
    if (endpoint === '/0/private/AddOrder') {
      return {
        result: {
          txid: ["DEMO-ORDER-ID-" + Math.floor(Math.random() * 1000000)]
        },
        error: []
      };
    }
    
    // Default empty response
    return {
      result: {},
      error: []
    };
  }
  
  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const balanceResponse: KrakenBalanceResponse = await this.privateRequest('/0/private/Balance');
      
      if (balanceResponse.error && balanceResponse.error.length > 0) {
        throw new Error(`Kraken API error: ${balanceResponse.error.join(', ')}`);
      }
      
      // Calculate total balance in USD terms (simplified version)
      // For a real implementation, would need to get prices for all assets
      let total = 0;
      let cash = 0;
      let positions = 0;
      
      // Process each balance entry
      Object.entries(balanceResponse.result || {}).forEach(([currency, balance]) => {
        const amount = parseFloat(balance);
        
        // Stablecoins and fiat currencies
        if (['USDT', 'USDC', 'USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD'].includes(currency)) {
          cash += amount;
        } else {
          // This is a rough approximation - in a real implementation,
          // we would fetch actual exchange rates for all currencies
          positions += amount; 
        }
      });
      
      total = cash + positions;
      
      return {
        total,
        cash,
        positions
      };
    } catch (error) {
      console.error('Error fetching Kraken balance:', error);
      throw error;
    }
  }
  
  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      // Kraken doesn't have a direct "positions" endpoint like some brokers
      // We'll use the open orders and positions from closed orders
      const positions: BrokerPosition[] = [];
      
      // Get recent trades to calculate positions
      const tradesResponse = await this.privateRequest('/0/private/TradesHistory');
      
      if (tradesResponse.error && tradesResponse.error.length > 0) {
        throw new Error(`Kraken API error: ${tradesResponse.error.join(', ')}`);
      }
      
      // Calculate positions based on trades
      const trades = tradesResponse.result?.trades || {};
      const symbolPositions = new Map<string, BrokerPosition>();
      
      // Process each trade to build positions
      Object.values(trades).forEach((trade: any) => {
        const symbol = trade.pair;
        const quantity = parseFloat(trade.vol);
        const price = parseFloat(trade.price);
        const type = trade.type; // buy or sell
        
        // Skip if not crypto pair
        if (!symbol.includes('XBT') && !symbol.includes('ETH')) {
          return;
        }
        
        // Update or create position for this symbol
        if (!symbolPositions.has(symbol)) {
          symbolPositions.set(symbol, {
            symbol,
            quantity: 0,
            averagePrice: 0,
            currentPrice: 0,
            pnl: 0
          });
        }
        
        const position = symbolPositions.get(symbol)!;
        
        // Update position based on trade type
        if (type === 'buy') {
          // Calculate new average price and quantity
          const oldValue = position.quantity * position.averagePrice;
          const newValue = quantity * price;
          const newQuantity = position.quantity + quantity;
          
          position.quantity = newQuantity;
          position.averagePrice = newQuantity > 0 ? (oldValue + newValue) / newQuantity : 0;
        } else {
          // Reduce position for sells
          position.quantity -= quantity;
        }
      });
      
      // Get current market prices for each position
      // Convert Map entries to array to avoid downlevelIteration issues
      const positionEntries = Array.from(symbolPositions.entries());
      for (let i = 0; i < positionEntries.length; i++) {
        const [symbol, position] = positionEntries[i];
        if (Math.abs(position.quantity) > 0.00001) { // Only include non-zero positions
          try {
            // Get current price
            const tickerResponse = await this.publicRequest('/0/public/Ticker', { pair: symbol });
            const symbolInfo = tickerResponse.result?.[symbol];
            
            if (symbolInfo) {
              position.currentPrice = parseFloat(symbolInfo.c[0]); // Current price
              position.pnl = position.quantity * (position.currentPrice - position.averagePrice);
              positions.push(position);
            }
          } catch (error) {
            console.error(`Error getting price for ${symbol}:`, error);
            // Still include the position even without current price
            positions.push(position);
          }
        }
      }
      
      return positions;
    } catch (error) {
      console.error('Error fetching Kraken positions:', error);
      throw error;
    }
  }
  
  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    try {
      const closedOrdersResponse: KrakenOrderResponse = await this.privateRequest('/0/private/ClosedOrders');
      
      if (closedOrdersResponse.error && closedOrdersResponse.error.length > 0) {
        throw new Error(`Kraken API error: ${closedOrdersResponse.error.join(', ')}`);
      }
      
      const orders: OrderHistory[] = [];
      const closedOrders = closedOrdersResponse.result?.closed || {};
      
      // Process each closed order
      Object.entries(closedOrders).forEach(([orderId, order]) => {
        // Parse the pair to get a standard symbol format
        const symbol = order.descr.pair;
        
        // Make sure side is either 'buy' or 'sell' 
        const side = order.descr.type === 'buy' ? 'buy' : 'sell';
        
        orders.push({
          orderId,
          symbol,
          side,
          quantity: parseFloat(order.vol),
          price: parseFloat(order.price),
          status: this.mapOrderStatus(order.status),
          timestamp: order.closetm * 1000, // Convert to milliseconds
          broker: 'Kraken'
        });
      });
      
      return orders;
    } catch (error) {
      console.error('Error fetching Kraken order history:', error);
      throw error;
    }
  }
  
  private mapOrderStatus(krakenStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (krakenStatus) {
      case 'closed':
        return 'filled';
      case 'canceled':
      case 'expired':
        return 'cancelled';
      default:
        return 'pending';
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
      // Convert type to Kraken format
      const ordertype = order.type === 'market' ? 'market' : 'limit';
      
      // Prepare order data
      const orderData: Record<string, string> = {
        pair: order.symbol,
        type: order.side,
        ordertype,
        volume: order.quantity.toString()
      };
      
      // Add price for limit orders
      if (order.type === 'limit' && order.limitPrice) {
        orderData.price = order.limitPrice.toString();
      }
      
      // Place the order
      const response = await this.privateRequest('/0/private/AddOrder', orderData);
      
      if (response.error && response.error.length > 0) {
        throw new Error(`Kraken API error: ${response.error.join(', ')}`);
      }
      
      // Return the order ID
      return response.result.txid[0];
    } catch (error) {
      console.error('Error placing Kraken order:', error);
      throw error;
    }
  }
  
  async getQuote(symbol: string): Promise<{ bid: number; ask: number } | null> {
    try {
      const tickerResponse: KrakenTickerResponse = await this.publicRequest('/0/public/Ticker', { pair: symbol });
      
      if (tickerResponse.error && tickerResponse.error.length > 0) {
        throw new Error(`Kraken API error: ${tickerResponse.error.join(', ')}`);
      }
      
      const symbolInfo = tickerResponse.result?.[symbol];
      
      if (symbolInfo) {
        return {
          bid: parseFloat(symbolInfo.b[0]), // Best bid
          ask: parseFloat(symbolInfo.a[0])  // Best ask
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching Kraken quote for ${symbol}:`, error);
      return null;
    }
  }
  
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Connect to WebSocket API
    try {
      const ws = new WebSocket(this.webSocketUrl);
      
      ws.onopen = () => {
        console.log(`WebSocket connection established for ${symbol}`);
        
        // Subscribe to ticker for the symbol
        ws.send(JSON.stringify({
          name: 'subscribe',
          reqid: Math.floor(Math.random() * 1000000),
          pair: [symbol],
          subscription: {
            name: 'ticker'
          }
        }));
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Check if this is ticker data (not a subscription confirmation)
          if (Array.isArray(data) && data.length >= 2 && typeof data[1] === 'object') {
            const tickerData = data[1];
            const channelName = data[2]; // Channel name contains the pair
            
            if (channelName === symbol) {
              // Format: [channelID, {data}, channelName, pair]
              callback({
                symbol: channelName,
                price: parseFloat(tickerData.c[0]), // Last trade price
                timestamp: Date.now(),
                volume: parseFloat(tickerData.v[0]), // 24h volume
                high: parseFloat(tickerData.h[0]), // 24h high
                low: parseFloat(tickerData.l[0]), // 24h low
                open: parseFloat(tickerData.o) // 24h open
              });
            }
          }
        } catch (error) {
          console.error('Error processing Kraken WebSocket data:', error);
        }
      };
      
      ws.onerror = (error) => {
        console.error(`WebSocket error for ${symbol}:`, error);
      };
      
      ws.onclose = () => {
        console.log(`WebSocket connection closed for ${symbol}`);
        this.webSocketConnections.delete(symbol);
      };
      
      // Store the connection
      this.webSocketConnections.set(symbol, ws);
    } catch (error) {
      console.error(`Failed to establish WebSocket connection for ${symbol}:`, error);
    }
  }
  
  unsubscribeFromMarketData(symbol: string): void {
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      // Send unsubscribe message before closing
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({
          name: 'unsubscribe',
          pair: [symbol],
          subscription: {
            name: 'ticker'
          }
        }));
      }
      
      ws.close();
      this.webSocketConnections.delete(symbol);
      console.log(`Unsubscribed from ${symbol} market data on Kraken`);
    }
  }
}