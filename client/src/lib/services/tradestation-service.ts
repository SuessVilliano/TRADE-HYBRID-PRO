import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class TradeStationService implements BrokerService {
  private token: string | null = null;
  private refreshToken: string | null = null;
  private baseUrl = 'https://api.tradestation.com/v3';
  private subscriptions = new Map<string, number>();
  private accountId: string | null = null;

  constructor(
    private clientId: string,
    private clientSecret: string,
    private redirectUri: string = 'https://app.tradehybrid.co/auth/callback'
  ) {}

  async connect(): Promise<void> {
    try {
      console.log('Connecting to TradeStation API...');
      
      // For a real implementation, this would use the OAuth2 flow
      // Here we'll simulate it by directly setting tokens for demo purposes
      
      // Simplified for demo, in a real app you would:
      // 1. Redirect user to TradeStation auth page
      // 2. Get authorization code from redirect
      // 3. Exchange code for tokens
      
      // Simulate token response
      this.token = 'simulated_access_token';
      this.refreshToken = 'simulated_refresh_token';
      
      // Get user accounts
      const accountsResponse = await this.request('/brokerage/accounts');
      if (accountsResponse.Accounts && accountsResponse.Accounts.length > 0) {
        this.accountId = accountsResponse.Accounts[0].AccountID;
        console.log(`Successfully connected to TradeStation API with account ID: ${this.accountId}`);
      } else {
        throw new Error('No accounts found for TradeStation user');
      }
    } catch (error) {
      console.error('Error connecting to TradeStation:', error);
      throw error;
    }
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    if (!this.token) {
      throw new Error('Not connected to TradeStation API');
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      'Authorization': `Bearer ${this.token}`,
      'Content-Type': 'application/json',
      ...options.headers
    };

    const response = await fetch(url, {
      ...options,
      headers
    });

    // Handle token refresh if needed
    if (response.status === 401 && this.refreshToken) {
      await this.refreshAccessToken();
      return this.request(endpoint, options);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`TradeStation API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  private async refreshAccessToken() {
    try {
      const tokenUrl = 'https://api.tradestation.com/v3/Security/Authorize';
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          client_id: this.clientId,
          client_secret: this.clientSecret,
          refresh_token: this.refreshToken!,
          redirect_uri: this.redirectUri
        }).toString()
      });

      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.statusText}`);
      }

      const data = await response.json();
      this.token = data.access_token;
      this.refreshToken = data.refresh_token;
    } catch (error) {
      console.error('Error refreshing TradeStation token:', error);
      throw error;
    }
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to TradeStation first.');
    }
    
    const data = await this.request(`/brokerage/accounts/${this.accountId}/balances`);
    
    return {
      total: data.BalancesForDisplay.AccountValue,
      cash: data.BalancesForDisplay.CashBalance,
      positions: data.BalancesForDisplay.AccountValue - data.BalancesForDisplay.CashBalance
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to TradeStation first.');
    }
    
    const data = await this.request(`/brokerage/accounts/${this.accountId}/positions`);
    
    return data.Positions.map((position: any) => {
      return {
        symbol: position.Symbol,
        quantity: Math.abs(position.Quantity),
        averagePrice: position.AveragePrice,
        currentPrice: position.LastPrice,
        pnl: position.UnrealizedProfitLoss
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
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to TradeStation first.');
    }
    
    const orderData = {
      AccountID: this.accountId,
      Symbol: order.symbol,
      Quantity: order.quantity,
      OrderType: order.type === 'market' ? 'Market' : 'Limit',
      TradeAction: order.side === 'buy' ? 'Buy' : 'Sell',
      TimeInForce: {
        Duration: 'DAY'
      }
    };
    
    if (order.type === 'limit' && order.limitPrice) {
      orderData['LimitPrice'] = order.limitPrice;
    }
    
    const response = await this.request('/orders', {
      method: 'POST',
      body: JSON.stringify(orderData)
    });
    
    return response.Orders[0].OrderID;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.accountId) {
      throw new Error('Account ID not available. Connect to TradeStation first.');
    }
    
    const data = await this.request(`/brokerage/accounts/${this.accountId}/orders`);
    
    return data.Orders.map((order: any) => {
      return {
        orderId: order.OrderID,
        symbol: order.Symbol,
        side: order.OrderAction.toLowerCase(),
        quantity: order.Quantity,
        price: order.OrderType === 'Market' ? 0 : order.LimitPrice || 0,
        status: this.mapOrderStatus(order.Status),
        timestamp: new Date(order.EnteredDateTime).getTime()
      };
    });
  }

  private mapOrderStatus(tsStatus: string): 'filled' | 'pending' | 'cancelled' {
    const statusMap: Record<string, 'filled' | 'pending' | 'cancelled'> = {
      'FLL': 'filled',
      'PND': 'pending',
      'CAN': 'cancelled',
      'OUT': 'pending',
      'REJ': 'cancelled',
      'EXP': 'cancelled'
    };
    
    return statusMap[tsStatus] || 'pending';
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Check if we're already subscribed
    if (this.subscriptions.has(symbol)) {
      return;
    }
    
    console.log(`Subscribing to TradeStation market data for ${symbol}`);
    
    // For real implementation, we'd use TradeStation's streaming API
    // For now, simulate with an interval to fetch quotes
    const interval = setInterval(async () => {
      try {
        const response = await this.request(`/marketdata/quotes/${symbol}`);
        
        if (response.Quotes && response.Quotes.length > 0) {
          const quote = response.Quotes[0];
          const marketData: MarketData = {
            symbol: symbol,
            price: (quote.Bid + quote.Ask) / 2, // Midpoint price
            timestamp: new Date().getTime(),
            open: quote.Open,
            high: quote.High,
            low: quote.Low,
            close: quote.Last,
            volume: quote.Volume
          };
          
          callback(marketData);
        }
      } catch (error) {
        console.error(`Error fetching TradeStation data for ${symbol}:`, error);
      }
    }, 5000); // Every 5 seconds
    
    this.subscriptions.set(symbol, interval as unknown as number);
  }

  unsubscribeFromMarketData(symbol: string): void {
    const interval = this.subscriptions.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.subscriptions.delete(symbol);
      console.log(`Unsubscribed from TradeStation market data for ${symbol}`);
    }
  }
}