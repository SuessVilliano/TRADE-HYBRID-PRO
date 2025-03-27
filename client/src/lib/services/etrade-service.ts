import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';

export class ETradeService implements BrokerService {
  private baseUrl = 'https://api.etrade.com/v1';
  private sandboxBaseUrl = 'https://apisb.etrade.com/v1';
  private marketDataInterval: NodeJS.Timeout | null = null;
  private callbacks: Map<string, ((data: MarketData) => void)[]> = new Map();
  private accountId: string | null = null;

  constructor(
    private consumerKey: string,
    private consumerSecret: string,
    private accessToken: string,
    private accessTokenSecret: string,
    private isSandbox: boolean = true
  ) {
    // In a real implementation, we would use OAuth 1.0a for E*TRADE API
    if (isSandbox) {
      this.baseUrl = this.sandboxBaseUrl;
    }
  }

  async connect(): Promise<void> {
    try {
      // Verify access by getting accounts list
      const accounts = await this.request('/accounts/list');
      
      // Set the first account as the default
      if (accounts && accounts.AccountListResponse && accounts.AccountListResponse.Accounts && 
          accounts.AccountListResponse.Accounts.Account && accounts.AccountListResponse.Accounts.Account.length > 0) {
        this.accountId = accounts.AccountListResponse.Accounts.Account[0].accountId;
        console.log(`Connected to E*TRADE API with account ID: ${this.accountId}`);
      } else {
        throw new Error('No accounts found');
      }
    } catch (error) {
      console.error('Failed to connect to E*TRADE:', error);
      throw new Error('Failed to connect to E*TRADE API');
    }
  }

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    // In a real implementation, this would include OAuth 1.0a signature
    const headers: Record<string, string> = {
      'Authorization': `OAuth oauth_consumer_key="${this.consumerKey}", oauth_token="${this.accessToken}"`,
      'Content-Type': 'application/json',
    };

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        ...headers,
        ...options.headers
      }
    });

    if (!response.ok) {
      throw new Error(`E*TRADE request failed: ${response.statusText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.accountId) {
      throw new Error('Not connected to E*TRADE');
    }

    try {
      const balanceResponse = await this.request(`/accounts/${this.accountId}/balance`);
      
      if (balanceResponse && balanceResponse.BalanceResponse) {
        const balance = balanceResponse.BalanceResponse;
        return {
          total: balance.Computed.RealTimeValues.totalAccountValue,
          cash: balance.Computed.cashBalance,
          positions: balance.Computed.RealTimeValues.totalAccountValue - balance.Computed.cashBalance
        };
      } else {
        throw new Error('Invalid balance response');
      }
    } catch (error) {
      console.error('Failed to get E*TRADE balance:', error);
      throw new Error('Failed to get E*TRADE balance');
    }
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.accountId) {
      throw new Error('Not connected to E*TRADE');
    }

    try {
      const positionsResponse = await this.request(`/accounts/${this.accountId}/portfolio`);
      
      if (positionsResponse && positionsResponse.PortfolioResponse && 
          positionsResponse.PortfolioResponse.AccountPortfolio && 
          positionsResponse.PortfolioResponse.AccountPortfolio.length > 0) {
        
        const positions = positionsResponse.PortfolioResponse.AccountPortfolio[0].Position || [];
        
        return positions.map((pos: any) => ({
          symbol: pos.symbolDescription,
          quantity: pos.quantity,
          averagePrice: pos.costPerShare,
          currentPrice: pos.Quick.lastTrade,
          pnl: pos.totalGainLoss
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get E*TRADE positions:', error);
      throw new Error('Failed to get E*TRADE positions');
    }
  }

  async placeOrder(order: {
    symbol: string;
    side: 'buy' | 'sell';
    quantity: number;
    type: 'market' | 'limit';
    limitPrice?: number;
  }): Promise<string> {
    if (!this.accountId) {
      throw new Error('Not connected to E*TRADE');
    }

    try {
      const orderRequest = {
        Order: {
          orderType: order.type.toUpperCase(),
          symbol: order.symbol,
          quantity: order.quantity,
          limitPrice: order.limitPrice || 0,
          priceType: order.type === 'market' ? 'MARKET' : 'LIMIT',
          orderTerm: 'GOOD_FOR_DAY',
          marketSession: 'REGULAR',
          orderAction: order.side.toUpperCase(),
        }
      };

      const response = await this.request(`/accounts/${this.accountId}/orders`, {
        method: 'POST',
        body: JSON.stringify(orderRequest)
      });

      if (response && response.OrderResponse && response.OrderResponse.orderId) {
        return response.OrderResponse.orderId;
      } else {
        throw new Error('Invalid order response');
      }
    } catch (error) {
      console.error('Failed to place E*TRADE order:', error);
      throw new Error('Failed to place E*TRADE order');
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Add callback to the map
    if (!this.callbacks.has(symbol)) {
      this.callbacks.set(symbol, []);
    }
    this.callbacks.get(symbol)?.push(callback);

    // Start polling for market data if not already polling
    if (!this.marketDataInterval) {
      this.startMarketDataPolling();
    }
  }

  private startMarketDataPolling(): void {
    // Poll every 1 second
    this.marketDataInterval = setInterval(() => {
      this.pollMarketData();
    }, 1000);
  }

  private async pollMarketData(): Promise<void> {
    const symbols = Array.from(this.callbacks.keys());
    if (symbols.length === 0) return;

    try {
      const symbolsStr = symbols.join(',');
      const quoteResponse = await this.request(`/market/quote/${symbolsStr}`);
      
      if (quoteResponse && quoteResponse.QuoteResponse && quoteResponse.QuoteResponse.QuoteData) {
        const quotes = Array.isArray(quoteResponse.QuoteResponse.QuoteData) 
          ? quoteResponse.QuoteResponse.QuoteData 
          : [quoteResponse.QuoteResponse.QuoteData];
        
        quotes.forEach((quote: any) => {
          const symbol = quote.Product.symbol;
          const callbacks = this.callbacks.get(symbol);
          
          if (callbacks) {
            const marketData: MarketData = {
              symbol,
              price: quote.All.lastTrade,
              timestamp: Date.now(),
              volume: quote.All.totalVolume,
              high: quote.All.high52,
              low: quote.All.low52
            };
            
            callbacks.forEach(callback => callback(marketData));
          }
        });
      }
    } catch (error) {
      console.error('Failed to poll E*TRADE market data:', error);
    }
  }

  unsubscribeFromMarketData(symbol: string): void {
    this.callbacks.delete(symbol);
    
    // If no more subscriptions, stop polling
    if (this.callbacks.size === 0 && this.marketDataInterval) {
      clearInterval(this.marketDataInterval);
      this.marketDataInterval = null;
    }
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.accountId) {
      throw new Error('Not connected to E*TRADE');
    }

    try {
      const orderResponse = await this.request(`/accounts/${this.accountId}/orders`);
      
      if (orderResponse && orderResponse.OrdersResponse && orderResponse.OrdersResponse.Order) {
        const orders = Array.isArray(orderResponse.OrdersResponse.Order) 
          ? orderResponse.OrdersResponse.Order 
          : [orderResponse.OrdersResponse.Order];
        
        return orders.map((order: any) => ({
          orderId: order.orderId,
          symbol: order.Instrument[0].Product.symbol,
          side: order.orderAction.toLowerCase(),
          quantity: order.Instrument[0].quantity,
          price: order.Instrument[0].filledPrice || order.Instrument[0].limit,
          status: this.mapOrderStatus(order.orderStatus),
          timestamp: new Date(order.orderDate).getTime()
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Failed to get E*TRADE order history:', error);
      throw new Error('Failed to get E*TRADE order history');
    }
  }

  private mapOrderStatus(etradeStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (etradeStatus) {
      case 'EXECUTED':
      case 'FILLED':
        return 'filled';
      case 'CANCELLED':
      case 'REJECTED':
      case 'EXPIRED':
        return 'cancelled';
      default:
        return 'pending';
    }
  }
}