/**
 * Alpaca Broker Adapter
 * 
 * Handles connections and trade execution with Alpaca API
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * Alpaca Broker Connection
 * Implementation of BrokerConnection for Alpaca
 */
export class AlpacaBrokerConnection implements BrokerConnection {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;

  constructor(config: { apiKey: string, apiSecret: string, paper?: boolean }) {
    this.apiKey = config.apiKey;
    this.apiSecret = config.apiSecret;
    
    // Use paper trading by default
    this.baseUrl = config.paper !== false 
      ? 'https://paper-api.alpaca.markets' 
      : 'https://api.alpaca.markets';
      
    console.log(`Alpaca broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'Alpaca';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to the Alpaca API
   */
  async connect(): Promise<boolean> {
    try {
      // Test API connection
      const response = await fetch(`${this.baseUrl}/v2/account`, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      // Handle connection errors
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to connect to Alpaca: ${response.status} ${errorText}`);
        this.connected = false;
        return false;
      }

      // Parse account data
      this.accountInfo = await response.json();
      this.connected = true;
      console.log(`Connected to Alpaca account: ${this.accountInfo.id}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Alpaca:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from Alpaca API
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accountInfo = null;
    console.log('Disconnected from Alpaca');
  }

  /**
   * Execute a market order on Alpaca
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected) {
        throw new Error('Not connected to Alpaca API');
      }
    }

    try {
      // Build order request
      const orderRequest = {
        symbol: params.symbol,
        qty: params.quantity.toString(),
        side: params.side,
        type: params.type,
        time_in_force: params.timeInForce || 'day',
        order_class: 'simple'
      };

      // Add stop loss/take profit if present
      if (params.stopLoss) {
        orderRequest.order_class = 'bracket';
        orderRequest.stop_loss = {
          stop_price: params.stopLoss.toString()
        };
      }

      if (params.takeProfit) {
        if (orderRequest.order_class !== 'bracket') {
          orderRequest.order_class = 'take_profit';
        } else {
          orderRequest.order_class = 'bracket';
        }
        orderRequest.take_profit = {
          limit_price: params.takeProfit.toString()
        };
      }

      // Submit order to Alpaca
      const response = await fetch(`${this.baseUrl}/v2/orders`, {
        method: 'POST',
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Alpaca order failed: ${response.status} ${errorText}`);
      }

      // Return order details
      const orderResult = await response.json();
      console.log(`Alpaca order executed: ${orderResult.id}`);
      return orderResult;
    } catch (error) {
      console.error('Error executing Alpaca market order:', error);
      throw error;
    }
  }

  /**
   * Get Alpaca account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected) {
        throw new Error('Not connected to Alpaca API');
      }
    }

    try {
      // Fetch fresh account data
      const response = await fetch(`${this.baseUrl}/v2/account`, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Alpaca account info: ${response.status} ${errorText}`);
      }

      this.accountInfo = await response.json();
      return {
        accountId: this.accountInfo.id,
        balance: parseFloat(this.accountInfo.cash),
        equity: parseFloat(this.accountInfo.equity),
        currency: this.accountInfo.currency,
        status: this.accountInfo.status,
        leverage: parseFloat(this.accountInfo.multiplier),
        marginAvailable: parseFloat(this.accountInfo.buying_power),
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting Alpaca account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions from Alpaca
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected) {
        throw new Error('Not connected to Alpaca API');
      }
    }

    try {
      // Fetch positions
      const response = await fetch(`${this.baseUrl}/v2/positions`, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': this.apiKey,
          'APCA-API-SECRET-KEY': this.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Alpaca positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.symbol,
        side: parseInt(pos.qty) > 0 ? 'long' : 'short',
        quantity: Math.abs(parseFloat(pos.qty)),
        entryPrice: parseFloat(pos.avg_entry_price),
        currentPrice: parseFloat(pos.current_price),
        unrealizedPnl: parseFloat(pos.unrealized_pl),
        openTime: new Date(pos.created_at).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting Alpaca positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    // Alpaca supports US stocks and crypto
    return ['US Stocks', 'Crypto'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('Alpaca connection test failed:', error);
      return false;
    }
  }
}

/**
 * Alpaca Broker Adapter Factory
 */
export class AlpacaBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to Alpaca
   */
  createConnection(config: any): BrokerConnection {
    return new AlpacaBrokerConnection(config);
  }

  /**
   * Get the connection type needed for Alpaca
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.API_KEY;
  }

  /**
   * Get Alpaca capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: true,
      supportsStocks: true,
      supportsForex: false,
      supportsFutures: false,
      supportsOptions: false,
      supportsFractionalShares: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for Alpaca
   */
  getRequiredFields(): string[] {
    return ['apiKey', 'apiSecret', 'paper'];
  }
}

/**
 * Create and register an Alpaca broker adapter
 */
export function createAlpacaAdapter(apiKey: string, apiSecret: string, paper: boolean = true): BrokerConnection {
  const factory = new AlpacaBrokerAdapterFactory();
  return factory.createConnection({ apiKey, apiSecret, paper });
}