import { 
  BrokerService, 
  MarketData, 
  AccountBalance,
  BrokerPosition, 
  OrderHistory 
} from './broker-service';

export class TradovateService implements BrokerService {
  private accessToken: string = '';
  private apiKey: string;
  private password: string;
  private userId: string;
  private baseUrl: string;
  private isConnected: boolean = false;
  private headers: { [key: string]: string } = {};
  private accountId: string = '';
  private isTestnet: boolean;
  
  constructor(apiKey: string, userId: string, password: string, isTestnet: boolean = true) {
    this.apiKey = apiKey;
    this.userId = userId;
    this.password = password;
    this.isTestnet = isTestnet;
    
    // Set the base URL based on environment
    this.baseUrl = isTestnet 
      ? 'https://demo.tradovateapi.com/v1' 
      : 'https://live.tradovateapi.com/v1';
  }
  
  async connect(): Promise<void> {
    try {
      // Authenticate with Tradovate API
      const authResponse = await fetch(`${this.baseUrl}/auth/accessTokenRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.userId,
          password: this.password,
          appId: this.apiKey,
          appVersion: '1.0',
          deviceId: 'trade-hybrid-platform'
        })
      });
      
      if (!authResponse.ok) {
        throw new Error(`Authentication failed: ${authResponse.statusText}`);
      }
      
      const authData = await authResponse.json();
      this.accessToken = authData.accessToken;
      
      // Set up headers with the access token
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.accessToken}`
      };
      
      // Get the user's account ID
      const accountsResponse = await fetch(`${this.baseUrl}/account/list`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!accountsResponse.ok) {
        throw new Error(`Failed to get accounts: ${accountsResponse.statusText}`);
      }
      
      const accounts = await accountsResponse.json();
      
      if (accounts.length === 0) {
        throw new Error('No accounts found for user');
      }
      
      // Use the first active account
      const activeAccount = accounts.find((acc: any) => acc.active) || accounts[0];
      this.accountId = activeAccount.id;
      
      this.isConnected = true;
      console.log('Successfully connected to Tradovate API');
    } catch (error) {
      console.error('Error connecting to Tradovate API:', error);
      throw error;
    }
  }
  
  // Check if we're connected to the API
  isConnectedToApi(): boolean {
    return this.isConnected;
  }
  
  // Get order history
  async getOrderHistory(): Promise<OrderHistory[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/order/list?accountId=${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get order history: ${response.statusText}`);
      }
      
      const orders = await response.json();
      
      // Transform API response to our OrderHistory format
      return orders.map((order: any) => ({
        orderId: order.id.toString(),
        symbol: order.symbol,
        side: order.action.toLowerCase(),
        quantity: order.qty,
        price: order.price || order.stopPrice || 0,
        status: this.mapOrderStatus(order.status),
        timestamp: new Date(order.timestamp).getTime(),
        broker: 'tradovate'
      }));
    } catch (error) {
      console.error('Error getting order history from Tradovate:', error);
      throw error;
    }
  }
  
  // Get account balance
  async getBalance(): Promise<AccountBalance> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/account/item?id=${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get account balance: ${response.statusText}`);
      }
      
      const accountData = await response.json();
      
      // Get cash balance
      const cashBalanceResponse = await fetch(`${this.baseUrl}/cashBalance/list?accountId=${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!cashBalanceResponse.ok) {
        throw new Error(`Failed to get cash balance: ${cashBalanceResponse.statusText}`);
      }
      
      const cashBalances = await cashBalanceResponse.json();
      const totalCash = cashBalances.reduce((sum: number, item: any) => sum + item.amount, 0);
      
      return {
        total: accountData.netLiq || totalCash,
        cash: totalCash,
        positions: (accountData.netLiq || totalCash) - totalCash
      };
    } catch (error) {
      console.error('Error getting balance from Tradovate:', error);
      throw error;
    }
  }
  
  // Get positions
  async getPositions(): Promise<BrokerPosition[]> {
    this.ensureConnected();
    
    try {
      const response = await fetch(`${this.baseUrl}/position/list?accountId=${this.accountId}`, {
        method: 'GET',
        headers: this.headers
      });
      
      if (!response.ok) {
        throw new Error(`Failed to get positions: ${response.statusText}`);
      }
      
      const positions = await response.json();
      
      // Transform API response to our BrokerPosition format
      return positions.map((position: any) => ({
        symbol: position.contractId,
        quantity: position.netPos,
        averagePrice: position.avgPrice,
        currentPrice: position.lastPrice,
        pnl: position.openPnl
      }));
    } catch (error) {
      console.error('Error getting positions from Tradovate:', error);
      throw error;
    }
  }
  
  // Place an order
  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    this.ensureConnected();
    
    try {
      // Prepare order data
      const orderData: any = {
        accountId: this.accountId,
        symbol: order.symbol,
        action: order.side.toUpperCase(),
        orderQty: order.quantity,
        orderType: order.type.toUpperCase(),
        isAutomated: false
      };
      
      // Add price for limit orders
      if (order.type === 'limit' && order.limitPrice) {
        orderData.price = order.limitPrice;
      }
      
      const response = await fetch(`${this.baseUrl}/order/placeOrder`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(orderData)
      });
      
      if (!response.ok) {
        throw new Error(`Failed to place order: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.orderId.toString();
    } catch (error) {
      console.error('Error placing order with Tradovate:', error);
      throw error;
    }
  }
  
  // Subscribe to market data for a symbol
  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    this.ensureConnected();
    
    try {
      // For Tradovate, we would use their WebSocket API for real-time data
      // This is a simplified polling implementation
      const interval = setInterval(async () => {
        try {
          // Get MD Snapshot
          const response = await fetch(`${this.baseUrl}/md/getQuote?symbol=${symbol}`, {
            method: 'GET',
            headers: this.headers
          });
          
          if (!response.ok) {
            throw new Error(`Failed to get market data for ${symbol}: ${response.statusText}`);
          }
          
          const quoteData = await response.json();
          
          // Transform API response to our MarketData format
          const marketData: MarketData = {
            symbol,
            price: quoteData.last || quoteData.bid || quoteData.ask,
            timestamp: Date.now(),
            volume: quoteData.volume || 0,
            high: quoteData.high || quoteData.last,
            low: quoteData.low || quoteData.last,
            open: quoteData.open || quoteData.last,
            close: quoteData.last
          };
          
          // Invoke the callback with the market data
          callback(marketData);
        } catch (error) {
          console.error(`Error fetching market data for ${symbol}:`, error);
        }
      }, 1000); // Poll every second
      
      // Store the interval ID for cleanup
      this._marketDataSubscriptions[symbol] = interval;
    } catch (error) {
      console.error(`Error subscribing to market data for ${symbol}:`, error);
      throw error;
    }
  }
  
  // Unsubscribe from market data for a symbol
  unsubscribeFromMarketData(symbol: string): void {
    if (this._marketDataSubscriptions[symbol]) {
      clearInterval(this._marketDataSubscriptions[symbol]);
      delete this._marketDataSubscriptions[symbol];
      console.log(`Unsubscribed from market data for ${symbol}`);
    }
  }
  
  // Internal storage for market data subscriptions
  private _marketDataSubscriptions: { [symbol: string]: NodeJS.Timeout } = {};
  
  // Helper to ensure we're connected before making API calls
  private ensureConnected(): void {
    if (!this.isConnected) {
      throw new Error('Not connected to Tradovate API. Call connect() first.');
    }
  }
  
  // Helper to map Tradovate order status to our status format
  private mapOrderStatus(status: string): 'filled' | 'pending' | 'cancelled' {
    const statusMap: { [key: string]: 'filled' | 'pending' | 'cancelled' } = {
      'COMPLETED': 'filled',
      'FILLED': 'filled',
      'PARTIAL': 'pending',
      'ACCEPTED': 'pending',
      'WORKING': 'pending',
      'OPEN': 'pending',
      'REJECTED': 'cancelled',
      'CANCELED': 'cancelled',
      'CANCELLED': 'cancelled',
      'EXPIRED': 'cancelled'
    };
    
    return statusMap[status] || 'pending';
  }
}

export function createTradovateService(
  apiKey: string, 
  userId: string, 
  password: string, 
  isTestnet: boolean = true
): BrokerService {
  return new TradovateService(apiKey, userId, password, isTestnet);
}