/**
 * NinjaTrader Broker Adapter
 * 
 * Handles connections and trade execution with NinjaTrader
 * This adapter uses the NinjaTrader API for automation
 */

import { BrokerConnection, TradeParams, BrokerConnectionType, BrokerCapabilities, BrokerAdapterFactory } from './broker-interface';

/**
 * NinjaTrader Broker Connection
 * Implementation of BrokerConnection for NinjaTrader
 */
export class NinjaTraderBrokerConnection implements BrokerConnection {
  private connectionToken: string;
  private machineID: string;
  private baseUrl: string;
  private connected: boolean = false;
  private accountInfo: any = null;
  private accountId: string | null = null;

  constructor(config: { connectionToken: string, machineID: string, serverUrl?: string }) {
    this.connectionToken = config.connectionToken;
    this.machineID = config.machineID;
    this.baseUrl = config.serverUrl || 'http://localhost:36000/v1';
    
    console.log(`NinjaTrader broker connection initialized with ${this.baseUrl}`);
  }

  /**
   * Get the name of this broker
   */
  getBrokerName(): string {
    return 'NinjaTrader';
  }

  /**
   * Check if currently connected
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Connect to NinjaTrader
   */
  async connect(): Promise<boolean> {
    try {
      // Test connection by requesting account information
      const response = await fetch(`${this.baseUrl}/accounts`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.connectionToken}`,
          'Machine-ID': this.machineID,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to connect to NinjaTrader: ${response.status} ${errorText}`);
        this.connected = false;
        return false;
      }

      const accounts = await response.json();
      if (accounts.length === 0) {
        console.error('No accounts found in NinjaTrader');
        this.connected = false;
        return false;
      }

      // Use the first account
      this.accountId = accounts[0].id;
      this.accountInfo = accounts[0];
      
      this.connected = true;
      console.log(`Connected to NinjaTrader account: ${this.accountId}`);
      return true;
    } catch (error) {
      console.error('Error connecting to NinjaTrader:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from NinjaTrader
   */
  async disconnect(): Promise<void> {
    this.connected = false;
    this.accountInfo = null;
    this.accountId = null;
    console.log('Disconnected from NinjaTrader');
  }

  /**
   * Execute a market order on NinjaTrader
   */
  async executeMarketOrder(params: TradeParams): Promise<any> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected || !this.accountId) {
        throw new Error('Not connected to NinjaTrader');
      }
    }

    try {
      // Build order request
      const orderRequest = {
        accountId: this.accountId,
        instrument: params.symbol,
        orderType: 'Market',
        orderAction: params.side === 'buy' ? 'Buy' : 'Sell',
        quantity: params.quantity,
        timeInForce: params.timeInForce || 'Day'
      };

      // Submit order to NinjaTrader
      const response = await fetch(`${this.baseUrl}/orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.connectionToken}`,
          'Machine-ID': this.machineID,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderRequest)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`NinjaTrader order failed: ${response.status} ${errorText}`);
      }

      // Get order result
      const orderResult = await response.json();
      
      // If stopLoss is specified, create a stop loss order
      if (params.stopLoss) {
        await this.createStopLoss(orderResult.id, params.symbol, params.stopLoss, params.side, params.quantity);
      }
      
      // If takeProfit is specified, create a take profit order
      if (params.takeProfit) {
        await this.createTakeProfit(orderResult.id, params.symbol, params.takeProfit, params.side, params.quantity);
      }
      
      console.log(`NinjaTrader order executed: ${orderResult.id}`);
      return orderResult;
    } catch (error) {
      console.error('Error executing NinjaTrader market order:', error);
      throw error;
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<any> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected || !this.accountId) {
        throw new Error('Not connected to NinjaTrader');
      }
    }

    try {
      // Get account information
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.connectionToken}`,
          'Machine-ID': this.machineID,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get NinjaTrader account info: ${response.status} ${errorText}`);
      }

      const accountData = await response.json();
      
      return {
        accountId: accountData.id,
        balance: accountData.cashBalance,
        equity: accountData.netLiquidation,
        currency: accountData.currency,
        status: 'active',
        leverage: accountData.marginAvailable > 0 ? 
          accountData.netLiquidation / accountData.marginUsed : 1,
        marginUsed: accountData.marginUsed,
        marginAvailable: accountData.marginAvailable,
        metadata: accountData
      };
    } catch (error) {
      console.error('Error getting NinjaTrader account info:', error);
      throw error;
    }
  }

  /**
   * Get open positions from NinjaTrader
   */
  async getOpenPositions(): Promise<any[]> {
    if (!this.connected) {
      await this.connect();
      if (!this.connected || !this.accountId) {
        throw new Error('Not connected to NinjaTrader');
      }
    }

    try {
      // Fetch positions
      const response = await fetch(`${this.baseUrl}/accounts/${this.accountId}/positions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.connectionToken}`,
          'Machine-ID': this.machineID,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to get NinjaTrader positions: ${response.status} ${errorText}`);
      }

      const positions = await response.json();
      
      // Map to standard format
      return positions.map((pos: any) => ({
        symbol: pos.instrument,
        side: pos.position > 0 ? 'long' : 'short',
        quantity: Math.abs(pos.position),
        entryPrice: pos.averagePrice,
        currentPrice: pos.marketPrice,
        unrealizedPnl: pos.unrealizedPnL,
        openTime: new Date(pos.timestamp).toISOString(),
        metadata: pos
      }));
    } catch (error) {
      console.error('Error getting NinjaTrader positions:', error);
      throw error;
    }
  }

  /**
   * Get supported markets
   */
  async getSupportedMarkets(): Promise<string[]> {
    return ['Futures', 'Forex', 'Stocks', 'Options'];
  }

  /**
   * Test connection to broker
   */
  async testConnection(): Promise<boolean> {
    try {
      const connected = await this.connect();
      return connected;
    } catch (error) {
      console.error('NinjaTrader connection test failed:', error);
      return false;
    }
  }
  
  /**
   * Create a stop loss order
   */
  private async createStopLoss(
    parentOrderId: string, 
    symbol: string, 
    stopPrice: number, 
    side: 'buy' | 'sell', 
    quantity: number
  ): Promise<any> {
    // Stop loss is opposite of entry side
    const stopSide = side === 'buy' ? 'Sell' : 'Buy';
    
    const stopLossRequest = {
      accountId: this.accountId,
      instrument: symbol,
      orderType: 'Stop',
      orderAction: stopSide,
      quantity: quantity,
      stopPrice: stopPrice,
      timeInForce: 'GTC',
      parentOrderId: parentOrderId
    };
    
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.connectionToken}`,
        'Machine-ID': this.machineID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(stopLossRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create stop loss: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
  
  /**
   * Create a take profit order
   */
  private async createTakeProfit(
    parentOrderId: string, 
    symbol: string, 
    limitPrice: number, 
    side: 'buy' | 'sell', 
    quantity: number
  ): Promise<any> {
    // Take profit is opposite of entry side
    const takeProfitSide = side === 'buy' ? 'Sell' : 'Buy';
    
    const takeProfitRequest = {
      accountId: this.accountId,
      instrument: symbol,
      orderType: 'Limit',
      orderAction: takeProfitSide,
      quantity: quantity,
      limitPrice: limitPrice,
      timeInForce: 'GTC',
      parentOrderId: parentOrderId
    };
    
    const response = await fetch(`${this.baseUrl}/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.connectionToken}`,
        'Machine-ID': this.machineID,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(takeProfitRequest)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Failed to create take profit: ${response.status} ${errorText}`);
      return null;
    }
    
    return await response.json();
  }
}

/**
 * NinjaTrader Broker Adapter Factory
 */
export class NinjaTraderBrokerAdapterFactory implements BrokerAdapterFactory {
  /**
   * Create a connection to NinjaTrader
   */
  createConnection(config: any): BrokerConnection {
    return new NinjaTraderBrokerConnection(config);
  }

  /**
   * Get the connection type needed for NinjaTrader
   */
  getConnectionType(): BrokerConnectionType {
    return BrokerConnectionType.TOKEN;
  }

  /**
   * Get NinjaTrader capabilities
   */
  getCapabilities(): BrokerCapabilities {
    return {
      supportsCrypto: false,
      supportsStocks: true,
      supportsForex: true,
      supportsFutures: true,
      supportsOptions: true,
      supportsFractionalShares: false,
      supportsStopLoss: true,
      supportsTakeProfit: true,
      supportsMarketData: true,
      supportsAccountHistory: true
    };
  }

  /**
   * Get required connection fields for NinjaTrader
   */
  getRequiredFields(): string[] {
    return ['connectionToken', 'machineID', 'serverUrl'];
  }
}

/**
 * Create and register a NinjaTrader broker adapter
 */
export function createNinjaTraderAdapter(
  connectionToken: string, 
  machineID: string,
  serverUrl?: string
): BrokerConnection {
  const factory = new NinjaTraderBrokerAdapterFactory();
  return factory.createConnection({ connectionToken, machineID, serverUrl });
}