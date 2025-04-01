import { BrokerCredentials } from './broker-connection-service';
import { BrokerService, BrokerAccountInfo, BrokerPosition, BrokerOrderRequest, BrokerOrderResponse } from './broker-service';
import axios from 'axios';

interface TradovateOptions {
  isDemoAccount: boolean;
}

/**
 * Service for interacting with Tradovate API for futures trading
 */
export class TradovateService implements BrokerService {
  private username: string;
  private password: string;
  private baseUrl: string;
  private accessToken: string | null = null;
  private accountId?: string;
  private isDemoAccount: boolean;

  constructor(credentials: BrokerCredentials, options: TradovateOptions = { isDemoAccount: true }) {
    if (!credentials.username || !credentials.password) {
      throw new Error('Username and password are required for Tradovate');
    }

    this.username = credentials.username;
    this.password = credentials.password;
    this.accountId = credentials.accountId;
    this.isDemoAccount = options.isDemoAccount;
    
    // Tradovate uses the same API URL for both demo and live
    this.baseUrl = 'https://live.tradovateapi.com/v1';
  }

  /**
   * Initialize the service by authenticating with Tradovate
   */
  async initialize(): Promise<void> {
    try {
      await this.authenticate();
      console.log('Successfully initialized Tradovate service');
      
      // Get the account ID if not provided
      if (!this.accountId) {
        const accounts = await this.getAccounts();
        if (accounts.length > 0) {
          this.accountId = accounts[0].id.toString();
        } else {
          throw new Error('No trading accounts found');
        }
      }
    } catch (error) {
      console.error('Failed to initialize Tradovate service:', error);
      throw new Error('Invalid Tradovate credentials');
    }
  }

  /**
   * Validate credentials without full initialization
   */
  async validateCredentials(): Promise<boolean> {
    try {
      await this.authenticate();
      return true;
    } catch (error) {
      console.error('Tradovate credential validation failed:', error);
      return false;
    }
  }

  /**
   * Authenticate with Tradovate API
   */
  private async authenticate(): Promise<void> {
    try {
      const response = await axios.post(`${this.baseUrl}/auth/accessTokenRequest`, {
        name: this.username,
        password: this.password,
        appId: 'TradeHybrid Trading Platform',
        appVersion: '1.0',
        cid: 'TradeHybrid',
        sec: 'TradeHybrid',
      });
      
      if (response.data && response.data.accessToken) {
        this.accessToken = response.data.accessToken;
      } else {
        throw new Error('Authentication failed: No access token received');
      }
    } catch (error) {
      console.error('Tradovate authentication error:', error);
      throw new Error('Failed to authenticate with Tradovate');
    }
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<BrokerAccountInfo> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      if (!this.accountId) {
        const accounts = await this.getAccounts();
        if (accounts.length > 0) {
          this.accountId = accounts[0].id.toString();
        } else {
          throw new Error('No trading accounts found');
        }
      }
      
      const accountResponse = await axios.get(`${this.baseUrl}/account/find?id=${this.accountId}`, {
        headers: this.getHeaders(),
      });
      
      const cashBalanceResponse = await axios.get(`${this.baseUrl}/accountState/findByAccount?id=${this.accountId}`, {
        headers: this.getHeaders(),
      });
      
      const account = accountResponse.data;
      const cashBalance = cashBalanceResponse.data;
      
      return {
        accountId: account.id.toString(),
        name: account.name,
        balance: cashBalance.cashBalance,
        equity: cashBalance.netLiq,
        margin: cashBalance.margin,
        unrealizedPnl: cashBalance.openPl,
        buyingPower: cashBalance.cashBalance - cashBalance.margin,
        currency: 'USD',
        extra: {
          risk: account.risk,
          autoLiqProfileId: account.autoLiqProfileId,
          marginAccountType: account.marginAccountType,
          tradingPermission: account.tradingPermission,
          clearingHouseId: account.clearingHouseId,
          riskCategoryId: account.riskCategoryId,
        }
      };
    } catch (error) {
      console.error('Error getting Tradovate account info:', error);
      throw error;
    }
  }

  /**
   * Get accounts list
   */
  private async getAccounts(): Promise<any[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      const response = await axios.get(`${this.baseUrl}/account/list`, {
        headers: this.getHeaders(),
      });
      
      // Filter for only demo or live accounts based on the options
      return response.data.filter((account: any) => {
        const isDemo = account.name.toLowerCase().includes('demo');
        return this.isDemoAccount ? isDemo : !isDemo;
      });
    } catch (error) {
      console.error('Error getting Tradovate accounts:', error);
      throw error;
    }
  }

  /**
   * Get positions
   */
  async getPositions(): Promise<BrokerPosition[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      if (!this.accountId) {
        throw new Error('Account ID is required to get positions');
      }
      
      const response = await axios.get(`${this.baseUrl}/position/findByAccount?id=${this.accountId}`, {
        headers: this.getHeaders(),
      });
      
      return response.data.map((position: any) => {
        // Get the contract details
        const contractId = position.contractId;
        const contractResponse = axios.get(`${this.baseUrl}/contract/find?id=${contractId}`, {
          headers: this.getHeaders(),
        }).then(resp => resp.data);
        
        // Get the current price (MD = market data)
        const mdResponse = axios.get(`${this.baseUrl}/md/getQuote?contractId=${contractId}`, {
          headers: this.getHeaders(),
        }).then(resp => resp.data);
        
        return Promise.all([contractResponse, mdResponse]).then(([contract, marketData]) => {
          const quantity = position.netPos;
          const averagePrice = position.netPrice;
          const currentPrice = marketData.last || marketData.bid || marketData.ask;
          const tickSize = contract.tickSize || 0.01;
          const valuePerTick = contract.valuePerTick || 1;
          
          // Calculate PnL
          const pointDiff = (currentPrice - averagePrice) * (quantity > 0 ? 1 : -1);
          const tickDiff = pointDiff / tickSize;
          const unrealizedPnl = tickDiff * valuePerTick * Math.abs(quantity);
          
          // Calculate initial value and current value
          const initialValue = Math.abs(quantity) * averagePrice * valuePerTick / tickSize;
          const currentValue = Math.abs(quantity) * currentPrice * valuePerTick / tickSize;
          
          return {
            symbol: contract.name,
            quantity,
            side: quantity > 0 ? 'buy' : 'sell',
            averagePrice,
            currentPrice,
            unrealizedPnl,
            unrealizedPnlPercent: (unrealizedPnl / initialValue) * 100,
            initialValue,
            currentValue,
            extra: {
              contractId: position.contractId,
              accountId: position.accountId,
              timestamp: position.timestamp,
              dayTradeOpenPos: position.dayTradeOpenPos,
              dayTradeClosePos: position.dayTradeClosePos,
            }
          };
        });
      });
    } catch (error) {
      console.error('Error getting Tradovate positions:', error);
      throw error;
    }
  }

  /**
   * Place order
   */
  async placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      if (!this.accountId) {
        throw new Error('Account ID is required to place orders');
      }
      
      // Get the contract ID from the symbol
      const contractResponse = await axios.get(`${this.baseUrl}/contract/find?name=${order.symbol}`, {
        headers: this.getHeaders(),
      });
      
      const contractId = contractResponse.data.id;
      
      if (!contractId) {
        throw new Error(`Contract not found for symbol: ${order.symbol}`);
      }
      
      // Map order parameters to Tradovate format
      const orderParams: any = {
        accountId: parseInt(this.accountId),
        contractId,
        action: order.side.toUpperCase(),
        qty: Math.abs(order.quantity),
        orderType: this.mapOrderType(order.orderType || 'market'),
        timeInForce: this.mapTimeInForce(order.timeInForce || 'day'),
      };
      
      // Add limit price if it's a limit order
      if (order.orderType === 'limit' && order.limitPrice) {
        orderParams.limitPrice = order.limitPrice;
      }
      
      // Add stop price if it's a stop order
      if (order.orderType === 'stop' && order.stopPrice) {
        orderParams.stopPrice = order.stopPrice;
      }
      
      // Place the order
      const response = await axios.post(`${this.baseUrl}/order/placeOrder`, orderParams, {
        headers: this.getHeaders(),
      });
      
      const data = response.data;
      
      return {
        orderId: data.orderId.toString(),
        clientOrderId: data.commandId?.toString(),
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        filledQuantity: 0, // New orders have 0 filled
        orderType: order.orderType || 'market',
        limitPrice: order.limitPrice,
        stopPrice: order.stopPrice,
        status: 'working',
        createdAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error placing Tradovate order:', error);
      throw error;
    }
  }

  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      if (!this.accountId) {
        throw new Error('Account ID is required to get order history');
      }
      
      const response = await axios.get(`${this.baseUrl}/order/listWorking?accountId=${this.accountId}`, {
        headers: this.getHeaders(),
      });
      
      return Promise.all(response.data.map(async (order: any) => {
        // Get contract details
        const contractResponse = await axios.get(`${this.baseUrl}/contract/find?id=${order.contractId}`, {
          headers: this.getHeaders(),
        });
        
        const contract = contractResponse.data;
        
        return {
          orderId: order.id.toString(),
          clientOrderId: order.commandId?.toString(),
          symbol: contract.name,
          side: order.action.toLowerCase(),
          quantity: order.qty,
          filledQuantity: order.filledQty || 0,
          orderType: this.reverseMapOrderType(order.orderType),
          limitPrice: order.limitPrice,
          stopPrice: order.stopPrice,
          status: this.mapOrderStatus(order.status),
          createdAt: new Date(order.timestamp).toISOString(),
          updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : undefined,
        };
      }));
    } catch (error) {
      console.error('Error getting Tradovate order history:', error);
      throw error;
    }
  }

  /**
   * Get quote for a symbol
   */
  async getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number }> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      // Get the contract ID for the symbol
      const contractResponse = await axios.get(`${this.baseUrl}/contract/find?name=${symbol}`, {
        headers: this.getHeaders(),
      });
      
      if (!contractResponse.data || !contractResponse.data.id) {
        throw new Error(`Contract not found for symbol: ${symbol}`);
      }
      
      const contractId = contractResponse.data.id;
      
      // Get the quote for the contract
      const quoteResponse = await axios.get(`${this.baseUrl}/md/getQuote?contractId=${contractId}`, {
        headers: this.getHeaders(),
      });
      
      const quote = quoteResponse.data;
      
      return {
        symbol,
        bid: quote.bid,
        ask: quote.ask,
        last: quote.last,
      };
    } catch (error) {
      console.error(`Error getting Tradovate quote for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      if (!this.accountId) {
        throw new Error('Account ID is required to close positions');
      }
      
      // Get the contract ID for the symbol
      const contractResponse = await axios.get(`${this.baseUrl}/contract/find?name=${symbol}`, {
        headers: this.getHeaders(),
      });
      
      if (!contractResponse.data || !contractResponse.data.id) {
        throw new Error(`Contract not found for symbol: ${symbol}`);
      }
      
      const contractId = contractResponse.data.id;
      
      // Get current position to know the side and quantity
      const positionsResponse = await axios.get(`${this.baseUrl}/position/findByContract?contractId=${contractId}&accountId=${this.accountId}`, {
        headers: this.getHeaders(),
      });
      
      if (!positionsResponse.data || !positionsResponse.data.length) {
        throw new Error(`No position found for symbol: ${symbol}`);
      }
      
      const position = positionsResponse.data[0];
      const positionQuantity = position.netPos;
      
      // Determine quantity to close
      const closeQuantity = quantity ? Math.min(Math.abs(quantity), Math.abs(positionQuantity)) : Math.abs(positionQuantity);
      
      // Determine side for the closing order (opposite of position)
      const closeSide = positionQuantity > 0 ? 'sell' : 'buy';
      
      // Place a market order to close the position
      const orderParams = {
        accountId: parseInt(this.accountId),
        contractId,
        action: closeSide.toUpperCase(),
        qty: closeQuantity,
        orderType: 'Market',
        timeInForce: 'Day',
      };
      
      const response = await axios.post(`${this.baseUrl}/order/placeOrder`, orderParams, {
        headers: this.getHeaders(),
      });
      
      return {
        success: true,
        orderId: response.data.orderId,
        message: 'Position close order placed successfully',
      };
    } catch (error) {
      console.error(`Error closing Tradovate position for ${symbol}:`, error);
      throw error;
    }
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      await axios.post(`${this.baseUrl}/order/cancelOrder`, {
        orderId: parseInt(orderId),
      }, {
        headers: this.getHeaders(),
      });
      
      return true;
    } catch (error) {
      console.error(`Error canceling Tradovate order ${orderId}:`, error);
      return false;
    }
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    try {
      if (!this.accessToken) {
        await this.authenticate();
      }
      
      const response = await axios.get(`${this.baseUrl}/order/find?id=${orderId}`, {
        headers: this.getHeaders(),
      });
      
      const order = response.data;
      
      // Get contract details
      const contractResponse = await axios.get(`${this.baseUrl}/contract/find?id=${order.contractId}`, {
        headers: this.getHeaders(),
      });
      
      const contract = contractResponse.data;
      
      return {
        orderId: order.id.toString(),
        clientOrderId: order.commandId?.toString(),
        symbol: contract.name,
        side: order.action.toLowerCase(),
        quantity: order.qty,
        filledQuantity: order.filledQty || 0,
        orderType: this.reverseMapOrderType(order.orderType),
        limitPrice: order.limitPrice,
        stopPrice: order.stopPrice,
        status: this.mapOrderStatus(order.status),
        createdAt: new Date(order.timestamp).toISOString(),
        updatedAt: order.updatedAt ? new Date(order.updatedAt).toISOString() : undefined,
      };
    } catch (error) {
      console.error(`Error getting Tradovate order status for ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Map order type to Tradovate format
   */
  private mapOrderType(orderType: string): string {
    switch (orderType.toLowerCase()) {
      case 'market':
        return 'Market';
      case 'limit':
        return 'Limit';
      case 'stop':
        return 'Stop';
      case 'stop_limit':
      case 'stoplimit':
        return 'StopLimit';
      default:
        return 'Market';
    }
  }

  /**
   * Reverse map order type from Tradovate format
   */
  private reverseMapOrderType(orderType: string): string {
    switch (orderType) {
      case 'Market':
        return 'market';
      case 'Limit':
        return 'limit';
      case 'Stop':
        return 'stop';
      case 'StopLimit':
        return 'stop_limit';
      default:
        return 'market';
    }
  }

  /**
   * Map time in force to Tradovate format
   */
  private mapTimeInForce(timeInForce: string): string {
    switch (timeInForce.toLowerCase()) {
      case 'day':
        return 'Day';
      case 'gtc':
        return 'GTC';
      case 'ioc':
        return 'IOC';
      case 'fok':
        return 'FOK';
      default:
        return 'Day';
    }
  }

  /**
   * Map order status from Tradovate format
   */
  private mapOrderStatus(status: string): string {
    switch (status) {
      case 'Pending':
        return 'pending';
      case 'Working':
        return 'open';
      case 'Completed':
        return 'filled';
      case 'Canceled':
        return 'canceled';
      case 'Rejected':
        return 'rejected';
      case 'Expired':
        return 'expired';
      default:
        return status.toLowerCase();
    }
  }
}