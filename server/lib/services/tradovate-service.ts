import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

/**
 * Implementation of BrokerService for Tradovate
 */
export class TradovateService implements BrokerService {
  private username: string;
  private password: string;
  private isDemo: boolean;
  private baseUrl: string;
  private wsUrl: string;
  private accessToken: string = '';
  private authenticated: boolean = false;
  private webSocketConnections: Map<string, WebSocket> = new Map();
  
  constructor(username: string = '', password: string = '', isDemo: boolean = true) {
    this.username = username;
    this.password = password;
    this.isDemo = isDemo;
    
    if (isDemo) {
      this.baseUrl = 'https://demo.tradovateapi.com/v1';
      this.wsUrl = 'wss://demo.tradovateapi.com/v1/websocket';
    } else {
      this.baseUrl = 'https://live.tradovateapi.com/v1';
      this.wsUrl = 'wss://live.tradovateapi.com/v1/websocket';
    }
  }
  
  async connect(): Promise<void> {
    if (!this.username || !this.password) {
      throw new Error('Tradovate username and password are required');
    }
    
    try {
      // Obtain access token
      const response = await fetch(`${this.baseUrl}/auth/accessTokenRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.username,
          password: this.password,
          appId: 'TradeHybrid',
          appVersion: '1.0'
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Tradovate auth error: ${errorData.errorText || response.statusText}`);
      }
      
      const tokenData = await response.json();
      this.accessToken = tokenData.accessToken;
      this.authenticated = true;
      
      console.log('Connected to Tradovate API successfully');
    } catch (error) {
      console.error('Failed to connect to Tradovate:', error);
      throw new Error(`Failed to connect to Tradovate: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
  
  private async request(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    if (!this.authenticated) {
      await this.connect();
    }
    
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.accessToken}`,
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
      throw new Error(`Tradovate API error: ${response.status} - ${errorText}`);
    }
    
    return response.json();
  }
  
  async getBalance(): Promise<AccountBalance> {
    // Get account list
    const accounts = await this.request('/account/list');
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No Tradovate accounts found');
    }
    
    const account = accounts[0]; // Use first account
    
    // Get account cash balance and positions
    const cashBalance = await this.request(`/cashBalance/find?id=${account.id}`);
    
    return {
      total: cashBalance.cashBalance + (account.totalPnL || 0),
      cash: cashBalance.cashBalance,
      positions: account.totalPnL || 0
    };
  }
  
  async getPositions(): Promise<BrokerPosition[]> {
    // Get account list
    const accounts = await this.request('/account/list');
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No Tradovate accounts found');
    }
    
    const account = accounts[0]; // Use first account
    
    // Get positions for account
    const positions = await this.request(`/position/list?accountId=${account.id}`);
    
    return positions.map((position: any) => {
      // Get contract details
      const symbol = position.contractId; // Would need to map to actual symbol
      
      return {
        symbol,
        quantity: position.netPos,
        averagePrice: position.avgPrice,
        currentPrice: position.openPrice || position.avgPrice,
        pnl: position.pnlDay || 0
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
    // Get account list
    const accounts = await this.request('/account/list');
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No Tradovate accounts found');
    }
    
    const account = accounts[0]; // Use first account
    
    // Find contract by symbol
    const contract = await this.request(`/contract/find?name=${order.symbol}`);
    
    if (!contract) {
      throw new Error(`Contract not found for symbol: ${order.symbol}`);
    }
    
    // Prepare order data
    const orderData: any = {
      accountId: account.id,
      action: order.side.toUpperCase(),
      contractId: contract.id,
      orderQty: order.quantity,
      orderType: order.type.toUpperCase()
    };
    
    if (order.type === 'limit' && order.limitPrice) {
      orderData.limitPrice = order.limitPrice;
    }
    
    // Place the order
    const response = await this.request('/order/placeOrder', 'POST', orderData);
    
    return response.orderId;
  }
  
  async getOrderHistory(): Promise<OrderHistory[]> {
    // Get account list
    const accounts = await this.request('/account/list');
    
    if (!accounts || accounts.length === 0) {
      throw new Error('No Tradovate accounts found');
    }
    
    const account = accounts[0]; // Use first account
    
    // Get orders for account
    const orders = await this.request(`/order/list?accountId=${account.id}`);
    
    return orders.map((order: any) => {
      // Get contract details
      const symbol = order.contractId; // Would need to map to actual symbol
      
      return {
        orderId: order.id.toString(),
        symbol,
        side: order.action === 'BUY' ? 'buy' : 'sell',
        quantity: order.orderQty,
        price: order.limitPrice || 0,
        status: this.mapOrderStatus(order.orderStatus),
        timestamp: new Date(order.timestamp).getTime(),
        broker: 'TRADOVATE'
      };
    });
  }
  
  private mapOrderStatus(tradovateStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (tradovateStatus) {
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
      // Find contract by symbol
      const contract = await this.request(`/contract/find?name=${symbol}`);
      
      if (!contract) {
        throw new Error(`Contract not found for symbol: ${symbol}`);
      }
      
      // Get quotes
      const quote = await this.request(`/md/getQuote?contractId=${contract.id}`);
      
      if (!quote) {
        return null;
      }
      
      return {
        bid: quote.bid,
        ask: quote.ask
      };
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }
  
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Find contract by symbol
    this.request(`/contract/find?name=${symbol}`)
      .then(contract => {
        if (!contract) {
          throw new Error(`Contract not found for symbol: ${symbol}`);
        }
        
        // Create WebSocket connection
        const ws = new WebSocket(this.wsUrl);
        
        ws.onopen = () => {
          // Authenticate
          ws.send(JSON.stringify({
            e: 'auth',
            d: {
              accessToken: this.accessToken
            }
          }));
          
          // Subscribe to quotes
          ws.send(JSON.stringify({
            e: 'md/subscribeQuote',
            d: {
              contractId: contract.id
            }
          }));
          
          console.log(`Subscribed to ${symbol} market data`);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            if (data.e === 'md/updateQuote' && data.d && data.d.contractId === contract.id) {
              const quote = data.d;
              
              // Calculate mid price
              const price = (quote.bid + quote.ask) / 2;
              
              callback({
                symbol,
                price,
                timestamp: new Date().getTime(),
                volume: quote.volume || 0
              });
            }
          } catch (error) {
            console.error(`Error processing WebSocket message for ${symbol}:`, error);
          }
        };
        
        ws.onerror = (error) => {
          console.error(`WebSocket error for ${symbol}:`, error);
        };
        
        ws.onclose = () => {
          console.log(`WebSocket connection closed for ${symbol}`);
        };
        
        // Store the WebSocket connection
        this.webSocketConnections.set(symbol, ws);
      })
      .catch(error => {
        console.error(`Failed to subscribe to market data for ${symbol}:`, error);
      });
  }
  
  unsubscribeFromMarketData(symbol: string): void {
    const ws = this.webSocketConnections.get(symbol);
    if (ws) {
      ws.close();
      this.webSocketConnections.delete(symbol);
      console.log(`Unsubscribed from ${symbol} market data`);
    }
  }
}