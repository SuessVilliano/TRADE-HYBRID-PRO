import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import { check_secrets } from '../utils';
import { config } from '../config';

// Interface for OANDA API responses
interface OandaAccountResponse {
  account: {
    id: string;
    balance: string;
    currency: string;
    unrealizedPL: string;
    marginUsed: string;
    marginAvailable: string;
    openTradeCount: number;
    openPositionCount: number;
    pendingOrderCount: number;
  };
}

interface OandaPositionResponse {
  positions: Array<{
    instrument: string;
    long: {
      units: string;
      averagePrice: string;
      unrealizedPL: string;
    };
    short: {
      units: string;
      averagePrice: string;
      unrealizedPL: string;
    };
  }>;
}

interface OandaOrderResponse {
  orders: Array<{
    id: string;
    createTime: string;
    state: string;
    instrument: string;
    units: string;
    price: string;
    type: string;
  }>;
}

interface OandaPriceResponse {
  prices: Array<{
    instrument: string;
    time: string;
    bids: Array<{ price: string }>;
    asks: Array<{ price: string }>;
  }>;
}

export class OandaService implements BrokerService {
  private baseUrl: string;
  private streamUrl: string;
  private apiToken: string;
  private accountId: string;
  private webSocketConnections: Map<string, WebSocket> = new Map();
  private authenticated: boolean = false;
  
  constructor(
    apiToken: string = '',
    accountId: string = '',
    isDemo: boolean = true
  ) {
    this.apiToken = apiToken;
    this.accountId = accountId;
    
    if (isDemo) {
      this.baseUrl = 'https://api-fxpractice.oanda.com';
      this.streamUrl = 'https://stream-fxpractice.oanda.com';
    } else {
      this.baseUrl = 'https://api-fxtrade.oanda.com';
      this.streamUrl = 'https://stream-fxtrade.oanda.com';
    }
  }

  async connect(): Promise<void> {
    // Check if API token is available
    if (!this.apiToken) {
      try {
        const hasToken = await check_secrets(['OANDA_API_TOKEN']);
        if (!hasToken) {
          throw new Error('OANDA API token not found in environment variables');
        }
        this.apiToken = config.OANDA_API_TOKEN || '';
      } catch (error) {
        console.error('Failed to retrieve OANDA API token:', error);
        throw error;
      }
    }

    // Check if account ID is available
    if (!this.accountId) {
      try {
        const hasAccountId = await check_secrets(['OANDA_ACCOUNT_ID']);
        if (!hasAccountId) {
          // Try to get the account ID from the API
          const accounts = await this.request('/v3/accounts');
          if (accounts && accounts.accounts && accounts.accounts.length > 0) {
            this.accountId = accounts.accounts[0].id;
            console.log(`Retrieved OANDA account ID: ${this.accountId}`);
          } else {
            throw new Error('No OANDA account ID found');
          }
        } else {
          this.accountId = config.OANDA_ACCOUNT_ID || '';
        }
      } catch (error) {
        console.error('Failed to retrieve OANDA account ID:', error);
        throw error;
      }
    }

    try {
      // Test connection by getting account details
      await this.request(`/v3/accounts/${this.accountId}`);
      console.log(`Connected to OANDA API successfully for account ${this.accountId}`);
      this.authenticated = true;
    } catch (error) {
      console.error('Failed to connect to OANDA API:', error);
      throw error;
    }
  }

  private async request(endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', data?: any): Promise<any> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: HeadersInit = {
      'Authorization': `Bearer ${this.apiToken}`,
      'Content-Type': 'application/json',
      'Accept-Datetime-Format': 'RFC3339'
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
      throw new Error(`OANDA API error: ${response.status} - ${errorText}`);
    }

    return response.json();
  }

  async getBalance(): Promise<AccountBalance> {
    if (!this.authenticated) {
      await this.connect();
    }

    const accountDetails: OandaAccountResponse = await this.request(`/v3/accounts/${this.accountId}`);
    
    return {
      total: parseFloat(accountDetails.account.balance) + parseFloat(accountDetails.account.unrealizedPL),
      cash: parseFloat(accountDetails.account.marginAvailable),
      positions: parseFloat(accountDetails.account.marginUsed)
    };
  }

  async getPositions(): Promise<BrokerPosition[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    const positionsData: OandaPositionResponse = await this.request(`/v3/accounts/${this.accountId}/positions`);
    const positions: BrokerPosition[] = [];

    for (const position of positionsData.positions) {
      // Convert OANDA's symbol format (e.g., EUR_USD) to standard format (EURUSD)
      const symbol = position.instrument.replace('_', '');
      
      // Handle long positions
      if (parseFloat(position.long.units) !== 0) {
        positions.push({
          symbol,
          quantity: parseFloat(position.long.units),
          averagePrice: parseFloat(position.long.averagePrice),
          currentPrice: 0, // We'll update this from a separate price call
          pnl: parseFloat(position.long.unrealizedPL)
        });
      }
      
      // Handle short positions (negative quantity)
      if (parseFloat(position.short.units) !== 0) {
        positions.push({
          symbol,
          quantity: parseFloat(position.short.units), // This will be negative
          averagePrice: parseFloat(position.short.averagePrice),
          currentPrice: 0, // We'll update this from a separate price call
          pnl: parseFloat(position.short.unrealizedPL)
        });
      }
    }

    // Update current prices for all positions
    for (let i = 0; i < positions.length; i++) {
      try {
        const formattedSymbol = positions[i].symbol.slice(0, 3) + '_' + positions[i].symbol.slice(3, 6);
        const priceData = await this.request(`/v3/accounts/${this.accountId}/pricing?instruments=${formattedSymbol}`);
        if (priceData.prices && priceData.prices.length > 0) {
          // Average of bid and ask for mid price
          positions[i].currentPrice = (parseFloat(priceData.prices[0].bids[0].price) + 
            parseFloat(priceData.prices[0].asks[0].price)) / 2;
        }
      } catch (error) {
        console.error(`Failed to get current price for ${positions[i].symbol}:`, error);
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

    // Format symbol for OANDA (e.g., EURUSD -> EUR_USD)
    const formattedSymbol = order.symbol.slice(0, 3) + '_' + order.symbol.slice(3, 6);

    // Construct order data
    const orderData: any = {
      order: {
        units: order.side === 'buy' ? order.quantity.toString() : (-order.quantity).toString(),
        instrument: formattedSymbol,
        timeInForce: 'FOK',
        type: order.type === 'market' ? 'MARKET' : 'LIMIT',
        positionFill: 'DEFAULT'
      }
    };

    // Add price for limit orders
    if (order.type === 'limit' && order.limitPrice) {
      orderData.order.price = order.limitPrice.toString();
    }

    const response = await this.request(`/v3/accounts/${this.accountId}/orders`, 'POST', orderData);
    return response.orderCreateTransaction.id;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    if (!this.authenticated) {
      await this.connect();
    }

    const orderData: OandaOrderResponse = await this.request(`/v3/accounts/${this.accountId}/orders`);
    
    return orderData.orders.map(order => {
      // Convert OANDA's symbol format (e.g., EUR_USD) to standard format (EURUSD)
      const symbol = order.instrument.replace('_', '');
      
      return {
        orderId: order.id,
        symbol,
        side: parseFloat(order.units) > 0 ? 'buy' : 'sell',
        quantity: Math.abs(parseFloat(order.units)),
        price: parseFloat(order.price),
        status: this.mapOrderStatus(order.state),
        timestamp: new Date(order.createTime).getTime(),
        broker: 'OANDA'
      };
    });
  }

  private mapOrderStatus(oandaStatus: string): 'filled' | 'pending' | 'cancelled' {
    switch (oandaStatus) {
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

  async getQuote(symbol: string): Promise<{ bid: number; ask: number } | null> {
    if (!this.authenticated) {
      await this.connect();
    }

    try {
      // Format symbol for OANDA (e.g., EURUSD -> EUR_USD)
      const formattedSymbol = symbol.slice(0, 3) + '_' + symbol.slice(3, 6);
      
      const priceData: OandaPriceResponse = await this.request(`/v3/accounts/${this.accountId}/pricing?instruments=${formattedSymbol}`);
      
      if (priceData.prices && priceData.prices.length > 0) {
        return {
          bid: parseFloat(priceData.prices[0].bids[0].price),
          ask: parseFloat(priceData.prices[0].asks[0].price)
        };
      }
      
      return null;
    } catch (error) {
      console.error(`Error fetching quote for ${symbol}:`, error);
      return null;
    }
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Close existing connection if any
    this.unsubscribeFromMarketData(symbol);
    
    // Format symbol for OANDA (e.g., EURUSD -> EUR_USD)
    const formattedSymbol = symbol.slice(0, 3) + '_' + symbol.slice(3, 6);
    
    // Initialize streaming connection
    const url = `${this.streamUrl}/v3/accounts/${this.accountId}/pricing/stream?instruments=${formattedSymbol}`;
    
    fetch(url, {
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Accept-Datetime-Format': 'RFC3339'
      }
    })
    .then(response => {
      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      let buffer = '';

      // Process the stream
      const processStream = () => {
        reader.read().then(({ done, value }) => {
          if (done) {
            console.log(`OANDA stream for ${symbol} completed`);
            return;
          }

          // Decode the chunk and add to buffer
          buffer += new TextDecoder().decode(value);
          
          // Process complete lines in the buffer
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // Keep the last incomplete line in the buffer

          // Process each complete line
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            try {
              const data = JSON.parse(line);
              
              // Process price data
              if (data.type === 'PRICE') {
                const price = (parseFloat(data.bids[0].price) + parseFloat(data.asks[0].price)) / 2;
                
                callback({
                  symbol: data.instrument.replace('_', ''),
                  price,
                  timestamp: new Date(data.time).getTime(),
                  volume: 0 // OANDA doesn't provide volume data in the stream
                });
              }
            } catch (error) {
              console.error('Error processing OANDA stream data:', error);
            }
          }
          
          // Continue reading
          processStream();
        }).catch(error => {
          console.error(`Error reading OANDA stream for ${symbol}:`, error);
        });
      };

      processStream();
    })
    .catch(error => {
      console.error(`Failed to connect to OANDA stream for ${symbol}:`, error);
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