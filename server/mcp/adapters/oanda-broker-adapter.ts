/**
 * Oanda Broker Adapter
 * 
 * Handles connections and trade execution with Oanda
 * Specializes in forex trading
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * Oanda Broker Connection
 * Implementation of BrokerConnection for Oanda
 */
export class OandaBrokerConnection implements BrokerConnection {
  private apiToken: string;
  private accountId: string | null = null;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;

  constructor(config: { apiToken: string, accountId?: string, demo?: boolean }) {
    this.apiToken = config.apiToken;
    this.accountId = config.accountId || null;
    
    // Use demo/practice or live environment
    if (config.demo !== false) {
      this.baseUrl = 'https://api-fxpractice.oanda.com/v3';
    } else {
      this.baseUrl = 'https://api-fxtrade.oanda.com/v3';
    }
    
    console.log(`Oanda broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'Oanda';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !!this.accountId;
  }

  /**
   * Connect to Oanda API
   */
  async connect(): Promise<boolean> {
    try {
      // If account ID not provided, fetch the first account
      if (!this.accountId) {
        const response = await fetch(`${this.baseUrl}/accounts`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${this.apiToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Failed to connect to Oanda: ${response.status} ${errorText}`);
          this.connected = false;
          return false;
        }

        const accountsData = await response.json();
        if (!accountsData.accounts || accountsData.accounts.length === 0) {
          console.error('No Oanda accounts found');
          this.connected = false;
          return false;
        }

        this.accountId = accountsData.accounts[0].id;
      }

      // Get account details to confirm connection
      await this.fetchAccountInfo();
      
      this.connected = true;
      console.log(`Connected to Oanda account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Oanda:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from Oanda
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accountInfo = null;
    console.log('Disconnected from Oanda');
  }

  /**
   * Execute a market order on Oanda
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Oanda API');
      }
    }

    try {
      // Convert symbol to Oanda instrument format
      const instrument = this.formatOandaInstrument(params.symbol);
      
      // Calculate units (positive for buy, negative for sell)
      const units = params.side === 'buy' ? 
        params.quantity : 
        -Math.abs(params.quantity);
      
      // Build order request
      const orderRequest: any = {
        order: {
          type: 'MARKET',
          instrument,
          units: units.toString(),
          timeInForce: 'FOK',
          positionFill: 'DEFAULT'
        }
      };

      // Add stop loss if specified
      if (params.stopLoss) {
        orderRequest.order.stopLossOnFill = {
          price: params.stopLoss.toString(),
          timeInForce: 'GTC'
        };
      }

      // Add take profit if specified
      if (params.takeProfit) {
        orderRequest.order.takeProfitOnFill = {
          price: params.takeProfit.toString(),
          timeInForce: 'GTC'
        };
      }

      // Execute the order
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Oanda order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      console.log(`Oanda order executed: ${orderResult.orderFillTransaction?.id || 'unknown'}`);
      
      return orderResult;
    } catch (error) {
      console.error('Error executing Oanda market order:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Oanda API');
      }
    }

    try {
      await this.fetchAccountInfo();
      
      const summary = this.accountInfo.account;
      
      return {
        accountId: summary.id,
        balance: parseFloat(summary.balance),
        equity: parseFloat(summary.NAV), // Net Asset Value
        currency: summary.currency,
        status: 'active',
        marginRate: parseFloat(summary.marginRate),
        marginUsed: parseFloat(summary.marginUsed),
        marginAvailable: parseFloat(summary.marginAvailable),
        openTradeCount: summary.openTradeCount,
        openPositionCount: summary.openPositionCount,
        pendingOrderCount: summary.pendingOrderCount,
        pl: parseFloat(summary.pl), // Profit/Loss
        unrealizedPL: parseFloat(summary.unrealizedPL),
        metadata: summary
      };
    } catch (error) {
      console.error('Error getting Oanda account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Oanda API');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/openPositions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Oanda positions: ${response.status} ${errorText}`);
      }

      const positionsData = await response.json();
      const positions = positionsData.positions || [];
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.instrument,
        side: parseFloat(pos.long.units) > 0 ? 'long' : 'short',
        quantity: Math.abs(parseFloat(pos.long.units || pos.short.units)),
        entryPrice: parseFloat(pos.long.averagePrice || pos.short.averagePrice),
        currentPrice: 0, // Oanda doesn't provide this directly in position data
        unrealizedPnl: parseFloat(pos.pl),
        openTime: new Date(pos.lastTransactionID).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting Oanda positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Forex', 'Commodities', 'Indices', 'Bonds', 'Metals'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('Oanda connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch account details from Oanda
   */
  private async fetchAccountInfo(): Promise<void> {
    if (!this.accountId) {
      throw new Error('Oanda account ID not found');
    }

    const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.apiToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to get Oanda account info: ${response.status} ${errorText}`);
    }

    this.accountInfo = await response.json();
  }

  /**
   * Format symbol for Oanda's API (e.g., "EUR/USD" to "EUR_USD")
   */
  private formatOandaInstrument(symbol: string): string {
    // Replace / with _ for Oanda format
    return symbol.replace('/', '_');
  }
}

/**
 * Oanda Broker Adapter Factory
 */
export class OandaBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to Oanda
   */
  createConnection(config: any): BrokerConnection {
    return new OandaBrokerConnection(config);
  }

  /**
   * Get the connection type needed for Oanda
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.TOKEN;
  }

  /**
   * Get Oanda capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: false,
      supportsStocks: false,
      supportsForex: true,
      supportsFutures: false,
      supportsOptions: false,
      supportsFractionalShares: false,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for Oanda
   */
  getRequiredFields(): string[] {
    return ['apiToken', 'accountId', 'demo'];
  }
}

/**
 * Create and register an Oanda broker adapter
 */
export function createOandaAdapter(
  apiToken: string, 
  accountId?: string, 
  demo: boolean = true
): BrokerConnection {
  const factory = new OandaBrokerAdapterFactory();
  return factory.createConnection({ apiToken, accountId, demo });
}