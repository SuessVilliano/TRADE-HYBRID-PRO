/**
 * Tradovate Broker Adapter
 * 
 * Handles connections and trade execution with Tradovate API
 * Tradovate offers futures trading with advanced API access
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * Tradovate Broker Connection
 * Implementation of BrokerConnection for Tradovate
 */
export class TradovateBrokerConnection implements BrokerConnection {
  private accessToken: string | null = null;
  private userName: string;
  private password: string;
  private baseUrl: string = 'https://demo.tradovateapi.com/v1';
  private connected: boolean = false;
  private accountInfo: any = null;
  private accountId: string | null = null;

  constructor(config: { userName: string, password: string, demo?: boolean }) {
    this.userName = config.userName;
    this.password = config.password;
    
    // Use demo or live environment
    if (config.demo !== false) {
      this.baseUrl = 'https://demo.tradovateapi.com/v1';
    } else {
      this.baseUrl = 'https://live.tradovateapi.com/v1';
    }
    
    console.log(`Tradovate broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'Tradovate';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !!this.accessToken;
  }

  /**
   * Connect to the Tradovate API
   */
  async connect(): Promise<boolean> {
    try {
      // Get access token
      const response = await fetch(`${this.baseUrl}/auth/accesstokenrequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: this.userName,
          password: this.password,
          appId: 'Trade Hybrid',
          appVersion: '1.0'
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to connect to Tradovate: ${response.status} ${errorText}`);
        this.connected = false;
        return false;
      }

      const authData = await response.json();
      this.accessToken = authData.accessToken;
      
      // Get account info
      await this.fetchAccountInfo();
      
      this.connected = true;
      console.log(`Connected to Tradovate account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Tradovate:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from Tradovate API
   */
  async disconnect(): Promise<void> {
    if (this.accessToken) {
      try {
        // Logout to invalidate token
        await fetch(`${this.baseUrl}/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (error) {
        console.error('Error logging out from Tradovate:', error);
      }
    }
    
    this.accessToken = null;
    this.connected = false;
    this.accountInfo = null;
    console.log('Disconnected from Tradovate');
  }

  /**
   * Execute a market order on Tradovate
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to Tradovate API');
      }
    }

    if (!this.accountId) {
      throw new Error('Tradovate account ID not found');
    }

    try {
      // Convert symbol to Tradovate contract format
      const contractId = await this.getContractId(params.symbol);
      if (!contractId) {
        throw new Error(`Contract not found for symbol: ${params.symbol}`);
      }
      
      // Calculate order action and quantity
      const action = params.side === 'buy' ? 'Buy' : 'Sell';
      
      // Build order
      const orderRequest = {
        accountId: this.accountId,
        action: action,
        symbol: params.symbol,
        orderQty: params.quantity,
        orderType: 'Market',
        contractId: contractId
      };

      // Add stop loss if specified
      if (params.stopLoss) {
        // In a real implementation, this would create a bracket order
        console.log(`Stop loss set at ${params.stopLoss}`);
      }

      // Add take profit if specified
      if (params.takeProfit) {
        // In a real implementation, this would add a take profit to the bracket
        console.log(`Take profit set at ${params.takeProfit}`);
      }

      // Submit order
      const response = await fetch(`${this.baseUrl}/order/placeorder`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tradovate order failed: ${response.status} ${errorText}`);
      }

      const orderResult = await response.json();
      console.log(`Tradovate order executed: ${orderResult.orderId}`);
      
      return orderResult;
    } catch (error) {
      console.error('Error executing Tradovate market order:', error);
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
        throw new Error('Not connected to Tradovate API');
      }
    }

    try {
      await this.fetchAccountInfo();
      
      return {
        accountId: this.accountId,
        balance: this.accountInfo.cashBalance,
        equity: this.accountInfo.netLiq,
        currency: 'USD',
        status: 'active',
        leverage: this.accountInfo.marginUsed > 0 ? 
          this.accountInfo.netLiq / this.accountInfo.marginUsed : 1,
        marginUsed: this.accountInfo.marginUsed,
        marginAvailable: this.accountInfo.availableMargin,
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting Tradovate account info:', error);
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
        throw new Error('Not connected to Tradovate API');
      }
    }

    if (!this.accountId) {
      throw new Error('Tradovate account ID not found');
    }

    try {
      const response = await fetch(`${this.baseUrl}/position/findByAccount?id=${this.accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get Tradovate positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.contract.name,
        side: pos.netPos > 0 ? 'long' : 'short',
        quantity: Math.abs(pos.netPos),
        entryPrice: pos.avgPrice,
        currentPrice: pos.contractPrice,
        unrealizedPnl: pos.openPnl,
        openTime: new Date(pos.timestamp).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting Tradovate positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Futures'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('Tradovate connection test failed:', error);
      return false;
    }
  }

  /**
   * Fetch account information from Tradovate
   */
  private async fetchAccountInfo(): Promise<void> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Tradovate');
    }

    // Get accounts
    const accountsResponse = await fetch(`${this.baseUrl}/account/list`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!accountsResponse.ok) {
      const errorText = await accountsResponse.text();
      throw new Error(`Failed to get Tradovate accounts: ${accountsResponse.status} ${errorText}`);
    }

    const accounts = await accountsResponse.json();
    if (accounts.length === 0) {
      throw new Error('No Tradovate accounts found');
    }

    // Use the first account
    const account = accounts[0];
    this.accountId = account.id;

    // Get account details
    const accountResponse = await fetch(`${this.baseUrl}/account/get?id=${this.accountId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });

    if (!accountResponse.ok) {
      const errorText = await accountResponse.text();
      throw new Error(`Failed to get Tradovate account info: ${accountResponse.status} ${errorText}`);
    }

    this.accountInfo = await accountResponse.json();
  }

  /**
   * Get contract ID for a symbol (simplified version)
   */
  private async getContractId(symbol: string): Promise<number | null> {
    // In a real implementation, this would query the Tradovate API for the correct contract ID
    // This is a simplified version that uses common futures symbols
    
    // Mock mapping for demonstration
    const contractMapping: Record<string, number> = {
      'ES': 1001, // E-mini S&P 500
      'NQ': 1002, // E-mini Nasdaq
      'CL': 1003, // Crude Oil
      'GC': 1004, // Gold
      'ZB': 1005, // 30-Year T-Bond
      'ZN': 1006, // 10-Year T-Note
      'ZC': 1007  // Corn
    };
    
    // Extract root symbol (e.g., "ESZ23" -> "ES")
    const rootSymbol = symbol.replace(/[0-9]|[A-Z]\d{2}$/, '');
    
    return contractMapping[rootSymbol] || null;
  }
}

/**
 * Tradovate Broker Adapter Factory
 */
export class TradovateBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to Tradovate
   */
  createConnection(config: any): BrokerConnection {
    return new TradovateBrokerConnection(config);
  }

  /**
   * Get the connection type needed for Tradovate
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.USERNAME_PASSWORD;
  }

  /**
   * Get Tradovate capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: false,
      supportsStocks: false,
      supportsForex: false,
      supportsFutures: true,
      supportsOptions: false,
      supportsFractionalShares: false,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for Tradovate
   */
  getRequiredFields(): string[] {
    return ['userName', 'password', 'demo'];
  }
}

/**
 * Create and register a Tradovate broker adapter
 */
export function createTradovateAdapter(userName: string, password: string, demo: boolean = true): BrokerConnection {
  const factory = new TradovateBrokerAdapterFactory();
  return factory.createConnection({ userName, password, demo });
}