/**
 * Interactive Brokers Adapter
 * 
 * Handles connections and trade execution with Interactive Brokers
 * Uses the IBKR Client Portal API
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * Interactive Brokers Connection
 * Implementation of BrokerConnection for IBKR
 */
export class InteractiveBrokersConnection implements BrokerConnection {
  private sessionId: string | null = null;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;
  private accountId: string | null = null;

  constructor(config: { sessionId?: string, clientPortalUrl?: string, demo?: boolean }) {
    this.sessionId = config.sessionId || null;
    
    // Use the provided URL or default to localhost for Client Portal API
    // In a production setting, this would be properly configured
    this.baseUrl = config.clientPortalUrl || 'https://localhost:5000/v1/portal';
    
    console.log(`Interactive Brokers connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'Interactive Brokers';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected && !!this.sessionId;
  }

  /**
   * Connect to IBKR Client Portal API
   */
  async connect(): Promise<boolean> {
    try {
      // First validate the session or authenticate
      let validateUrl = `${this.baseUrl}/sso/validate`;
      
      // If no session ID, we need a different approach - IBKR typically requires OAuth or direct login
      // For this adapter, we assume a valid session ID has been provided
      
      if (!this.sessionId) {
        console.warn('No sessionId provided for IBKR, authentication may fail');
        this.connected = false;
        return false;
      }
      
      // Validate session
      const validateResponse = await fetch(validateUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `JSESSIONID=${this.sessionId}`
        }
      });
      
      if (!validateResponse.ok) {
        const errorText = await validateResponse.text();
        console.error(`Failed to validate IBKR session: ${validateResponse.status} ${errorText}`);
        this.connected = false;
        return false;
      }
      
      // Get account information
      const accountsResponse = await fetch(`${this.baseUrl}/portfolio/accounts`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `JSESSIONID=${this.sessionId}`
        }
      });
      
      if (!accountsResponse.ok) {
        const errorText = await accountsResponse.text();
        console.error(`Failed to get IBKR accounts: ${accountsResponse.status} ${errorText}`);
        this.connected = false;
        return false;
      }
      
      const accounts = await accountsResponse.json();
      if (!accounts || accounts.length === 0) {
        console.error('No accounts found in IBKR');
        this.connected = false;
        return false;
      }
      
      // Use the first account
      this.accountId = accounts[0].accountId;
      
      // Fetch additional account details
      await this.fetchAccountDetails();
      
      this.connected = true;
      console.log(`Connected to Interactive Brokers account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to Interactive Brokers:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from IBKR
   */
  async disconnect(): Promise<void> {
    if (this.sessionId) {
      try {
        // Log out
        await fetch(`${this.baseUrl}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Cookie': `JSESSIONID=${this.sessionId}`
          }
        });
      } catch (error) {
        console.error('Error logging out from IBKR:', error);
      }
    }
    
    this.sessionId = null;
    this.connected = false;
    this.accountInfo = null;
    this.accountId = null;
    console.log('Disconnected from Interactive Brokers');
  }

  /**
   * Execute a market order on IBKR
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Interactive Brokers');
      }
    }

    try {
      // Build order request
      const orderRequest = {
        acctId: this.accountId,
        conid: await this.getContractId(params.symbol),
        orderType: 'MKT',
        side: params.side.toUpperCase(),
        quantity: params.quantity,
        tif: params.timeInForce?.toUpperCase() || 'DAY',
        outsideRTH: false
      };

      // Submit order to IBKR
      const response = await fetch(`${this.baseUrl}/iserver/account/${this.accountId}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `JSESSIONID=${this.sessionId}`
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`IBKR order failed: ${response.status} ${errorText}`);
      }

      // Get order result
      const orderResult = await response.json();
      
      // Handle stop loss and take profit (would need separate orders in IBKR)
      if (params.stopLoss) {
        await this.createStopLossOrder(params.symbol, params.stopLoss, params.side, params.quantity);
      }
      
      if (params.takeProfit) {
        await this.createTakeProfitOrder(params.symbol, params.takeProfit, params.side, params.quantity);
      }
      
      console.log(`IBKR order executed: ${orderResult.orderId || 'unknown'}`);
      return orderResult;
    } catch (error) {
      console.error('Error executing IBKR market order:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Interactive Brokers');
      }
    }

    try {
      await this.fetchAccountDetails();
      
      return {
        accountId: this.accountId,
        balance: this.accountInfo.totalCashValue,
        equity: this.accountInfo.netLiquidation,
        currency: this.accountInfo.currency,
        status: 'active',
        leverage: this.accountInfo.availableFunds > 0 ?
          this.accountInfo.netLiquidation / (this.accountInfo.netLiquidation - this.accountInfo.availableFunds) : 1,
        marginUsed: this.accountInfo.netLiquidation - this.accountInfo.availableFunds,
        marginAvailable: this.accountInfo.availableFunds,
        metadata: this.accountInfo
      };
    } catch (error) {
      console.error('Error getting IBKR account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions from IBKR
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected() || !this.accountId) {
        throw new Error('Not connected to Interactive Brokers');
      }
    }

    try {
      // Fetch positions
      const response = await fetch(`${this.baseUrl}/portfolio/${this.accountId}/positions`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cookie': `JSESSIONID=${this.sessionId}`
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get IBKR positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.contractDesc,
        side: pos.position > 0 ? 'long' : 'short',
        quantity: Math.abs(pos.position),
        entryPrice: pos.avgPrice,
        currentPrice: pos.mktPrice,
        unrealizedPnl: pos.unrealizedPnL,
        openTime: new Date().toISOString(), // IBKR doesn't provide this directly
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting IBKR positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Stocks', 'Options', 'Futures', 'Forex', 'Bonds', 'ETFs', 'Crypto'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('IBKR connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Fetch account details from IBKR
   */
  private async fetchAccountDetails(): Promise<void> {
    const accountSummaryResponse = await fetch(`${this.baseUrl}/portfolio/${this.accountId}/summary`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `JSESSIONID=${this.sessionId}`
      }
    });
    
    if (!accountSummaryResponse.ok) {
      throw new Error(`Failed to get IBKR account summary: ${accountSummaryResponse.status}`);
    }
    
    this.accountInfo = await accountSummaryResponse.json();
  }
  
  /**
   * Get contract ID for a symbol
   */
  private async getContractId(symbol: string): Promise<number> {
    // Search for the contract
    const searchResponse = await fetch(`${this.baseUrl}/iserver/secdef/search?symbol=${encodeURIComponent(symbol)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `JSESSIONID=${this.sessionId}`
      }
    });
    
    if (!searchResponse.ok) {
      throw new Error(`Failed to search for symbol: ${searchResponse.status}`);
    }
    
    const searchResults = await searchResponse.json();
    if (!searchResults || searchResults.length === 0) {
      throw new Error(`No contracts found for symbol: ${symbol}`);
    }
    
    // Use the first matching contract
    return searchResults[0].conid;
  }
  
  /**
   * Create a stop loss order
   */
  private async createStopLossOrder(
    symbol: string,
    stopPrice: number,
    entrySide: 'buy' | 'sell',
    quantity: number
  ): Promise<any> {
    // Stop loss is opposite of entry side
    const exitSide = entrySide === 'buy' ? 'SELL' : 'BUY';
    
    // Create stop order
    const stopOrderRequest = {
      acctId: this.accountId,
      conid: await this.getContractId(symbol),
      orderType: 'STP',
      price: stopPrice,
      side: exitSide,
      quantity: quantity,
      tif: 'GTC',
      outsideRTH: false
    };
    
    const response = await fetch(`${this.baseUrl}/iserver/account/${this.accountId}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `JSESSIONID=${this.sessionId}`
      },
      body: JSON.stringify(stopOrderRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create IBKR stop loss: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
  
  /**
   * Create a take profit order
   */
  private async createTakeProfitOrder(
    symbol: string,
    limitPrice: number,
    entrySide: 'buy' | 'sell',
    quantity: number
  ): Promise<any> {
    // Take profit is opposite of entry side
    const exitSide = entrySide === 'buy' ? 'SELL' : 'BUY';
    
    // Create limit order
    const limitOrderRequest = {
      acctId: this.accountId,
      conid: await this.getContractId(symbol),
      orderType: 'LMT',
      price: limitPrice,
      side: exitSide,
      quantity: quantity,
      tif: 'GTC',
      outsideRTH: false
    };
    
    const response = await fetch(`${this.baseUrl}/iserver/account/${this.accountId}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `JSESSIONID=${this.sessionId}`
      },
      body: JSON.stringify(limitOrderRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create IBKR take profit: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
}

/**
 * Interactive Brokers Adapter Factory
 */
export class InteractiveBrokersAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to IBKR
   */
  createConnection(config: any): BrokerConnection {
    return new InteractiveBrokersConnection(config);
  }

  /**
   * Get the connection type needed for IBKR
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.TOKEN;
  }

  /**
   * Get IBKR capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: true,
      supportsStocks: true,
      supportsForex: true,
      supportsFutures: true,
      supportsOptions: true,
      supportsFractionalShares: true,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for IBKR
   */
  getRequiredFields(): string[] {
    return ['sessionId', 'clientPortalUrl', 'demo'];
  }
}

/**
 * Create and register an Interactive Brokers adapter
 */
export function createInteractiveBrokersAdapter(
  sessionId: string,
  clientPortalUrl?: string,
  demo?: boolean
): BrokerConnection {
  const factory = new InteractiveBrokersAdapterFactory();
  return factory.createConnection({ sessionId, clientPortalUrl, demo });
}