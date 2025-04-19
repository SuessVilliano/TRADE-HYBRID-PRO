import { BrokerAccountInfo, BrokerPosition, BrokerOrderRequest, BrokerOrderResponse, BrokerService } from './broker-connection-service';

/**
 * MockTradingService provides fallback trading functionality when API connections fail
 * This service simulates responses from a broker API for development and testing
 */
export class MockTradingService implements BrokerService {
  private accountId: string;
  private positions: BrokerPosition[] = [];
  private orderHistory: any[] = [];
  private lastOrderId: number = 1000;

  constructor(accountId?: string) {
    this.accountId = accountId || 'mock-account-' + Date.now().toString().substr(-6);
    
    // Initialize with some sample positions
    this.positions = [
      {
        symbol: 'AAPL',
        quantity: 10,
        side: 'buy',
        averagePrice: 175.23,
        currentPrice: 176.45,
        unrealizedPnl: 12.2,
        unrealizedPnlPercent: 0.7,
        initialValue: 1752.3,
        currentValue: 1764.5,
        extra: {
          exchange: 'NASDAQ',
          assetClass: 'us_equity',
          assetId: 'b0b6dd9d-8b9b-48a9-ba46-b9d54906e415',
          changeToday: 0.5,
          lastdayPrice: 175.58
        }
      },
      {
        symbol: 'MSFT',
        quantity: 5,
        side: 'buy',
        averagePrice: 332.12,
        currentPrice: 337.28,
        unrealizedPnl: 25.8,
        unrealizedPnlPercent: 1.55,
        initialValue: 1660.6,
        currentValue: 1686.4,
        extra: {
          exchange: 'NASDAQ',
          assetClass: 'us_equity',
          assetId: 'c8fb8f0a-54a5-4f5a-a1e9-44e8de20ad2a',
          changeToday: 1.2,
          lastdayPrice: 333.45
        }
      }
    ];

    // Initialize with some sample order history
    this.orderHistory = [
      {
        orderId: '100001',
        clientOrderId: 'client-100001',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        filledQuantity: 10,
        orderType: 'market',
        limitPrice: undefined,
        stopPrice: undefined,
        status: 'filled',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        filledAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        orderId: '100002',
        clientOrderId: 'client-100002',
        symbol: 'MSFT',
        side: 'buy',
        quantity: 5,
        filledQuantity: 5,
        orderType: 'limit',
        limitPrice: 330.50,
        stopPrice: undefined,
        status: 'filled',
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        filledAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      }
    ];
  }

  /**
   * Initialize the service
   */
  async initialize(): Promise<void> {
    console.log('Mock Trading Service initialized');
    return Promise.resolve();
  }

  /**
   * Validate credentials (always successful for mock service)
   */
  async validateCredentials(): Promise<boolean> {
    return Promise.resolve(true);
  }

  /**
   * Get account information
   */
  async getAccountInfo(): Promise<BrokerAccountInfo> {
    return {
      accountId: this.accountId,
      balance: 25000.00,
      equity: 28450.90,
      margin: 0,
      unrealizedPnl: 38.00,
      buyingPower: 25000.00,
      currency: 'USD',
      extra: {
        daytradeCount: 0,
        daytradeLimit: 3,
        tradeSuspendedByUser: false,
        tradingBlocked: false,
        transfersBlocked: false,
        accountBlocked: false,
        status: 'ACTIVE',
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  }

  /**
   * Get positions
   */
  async getPositions(): Promise<BrokerPosition[]> {
    // Update current prices with small random movements to simulate market changes
    this.positions = this.positions.map(position => {
      const priceChange = position.currentPrice * (Math.random() * 0.01 - 0.005); // -0.5% to +0.5%
      const newPrice = position.currentPrice + priceChange;
      const newValue = newPrice * position.quantity;
      const newPnl = newValue - position.initialValue;
      const newPnlPercent = (newPnl / position.initialValue) * 100;
      
      return {
        ...position,
        currentPrice: parseFloat(newPrice.toFixed(2)),
        currentValue: parseFloat(newValue.toFixed(2)),
        unrealizedPnl: parseFloat(newPnl.toFixed(2)),
        unrealizedPnlPercent: parseFloat(newPnlPercent.toFixed(2))
      };
    });
    
    return this.positions;
  }

  /**
   * Place order
   */
  async placeOrder(order: BrokerOrderRequest): Promise<BrokerOrderResponse> {
    const orderId = (++this.lastOrderId).toString();
    const clientOrderId = order.clientOrderId || `client-${orderId}`;
    const now = new Date().toISOString();
    
    // Simulate a filled order
    const newOrder = {
      orderId,
      clientOrderId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      filledQuantity: order.quantity, // Assume immediate fill for simplicity
      orderType: order.orderType || 'market',
      limitPrice: order.limitPrice,
      stopPrice: order.stopPrice,
      status: 'filled',
      createdAt: now,
      updatedAt: now,
      filledAt: now
    };
    
    // Add to order history
    this.orderHistory.unshift(newOrder);
    
    // Update positions
    const existingPosition = this.positions.find(p => p.symbol === order.symbol);
    const price = order.limitPrice || this.getRandomPrice(order.symbol);
    
    if (existingPosition) {
      // Update existing position
      const newQuantity = order.side === 'buy'
        ? existingPosition.quantity + order.quantity
        : existingPosition.quantity - order.quantity;
      
      if (newQuantity <= 0) {
        // Position closed, remove it
        this.positions = this.positions.filter(p => p.symbol !== order.symbol);
      } else {
        // Update position
        const totalCost = (existingPosition.quantity * existingPosition.averagePrice) + (order.side === 'buy' ? (order.quantity * price) : 0);
        const newAvgPrice = totalCost / newQuantity;
        
        existingPosition.quantity = newQuantity;
        existingPosition.averagePrice = parseFloat(newAvgPrice.toFixed(2));
        existingPosition.currentPrice = price;
        existingPosition.initialValue = parseFloat((newQuantity * newAvgPrice).toFixed(2));
        existingPosition.currentValue = parseFloat((newQuantity * price).toFixed(2));
        existingPosition.unrealizedPnl = parseFloat((existingPosition.currentValue - existingPosition.initialValue).toFixed(2));
        existingPosition.unrealizedPnlPercent = parseFloat(((existingPosition.unrealizedPnl / existingPosition.initialValue) * 100).toFixed(2));
      }
    } else if (order.side === 'buy') {
      // New position
      const initialValue = order.quantity * price;
      this.positions.push({
        symbol: order.symbol,
        quantity: order.quantity,
        side: 'buy',
        averagePrice: price,
        currentPrice: price,
        unrealizedPnl: 0,
        unrealizedPnlPercent: 0,
        initialValue: parseFloat(initialValue.toFixed(2)),
        currentValue: parseFloat(initialValue.toFixed(2)),
        extra: {
          exchange: 'NASDAQ',
          assetClass: 'us_equity',
          assetId: this.generateRandomId(),
          changeToday: 0,
          lastdayPrice: price
        }
      });
    }
    
    return {
      orderId,
      clientOrderId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      filledQuantity: order.quantity,
      orderType: order.orderType || 'market',
      limitPrice: order.limitPrice,
      stopPrice: order.stopPrice,
      status: 'filled',
      createdAt: now
    };
  }

  /**
   * Get order history
   */
  async getOrderHistory(): Promise<any[]> {
    return this.orderHistory;
  }

  /**
   * Get quote for a symbol
   */
  async getQuote(symbol: string): Promise<{ symbol: string; bid: number; ask: number; last?: number }> {
    const basePrice = this.getBasePrice(symbol);
    const bid = parseFloat((basePrice * (1 - Math.random() * 0.001)).toFixed(2));
    const ask = parseFloat((basePrice * (1 + Math.random() * 0.001)).toFixed(2));
    
    return {
      symbol,
      bid,
      ask,
      last: parseFloat(((bid + ask) / 2).toFixed(2))
    };
  }

  /**
   * Close a position
   */
  async closePosition(symbol: string, quantity?: number): Promise<any> {
    const position = this.positions.find(p => p.symbol === symbol);
    
    if (!position) {
      throw new Error(`Position for ${symbol} not found`);
    }
    
    const qtyToClose = quantity || position.quantity;
    
    if (qtyToClose >= position.quantity) {
      // Close entire position
      this.positions = this.positions.filter(p => p.symbol !== symbol);
    } else {
      // Reduce position
      position.quantity -= qtyToClose;
      position.initialValue = parseFloat((position.quantity * position.averagePrice).toFixed(2));
      position.currentValue = parseFloat((position.quantity * position.currentPrice).toFixed(2));
      position.unrealizedPnl = parseFloat((position.currentValue - position.initialValue).toFixed(2));
      position.unrealizedPnlPercent = parseFloat(((position.unrealizedPnl / position.initialValue) * 100).toFixed(2));
    }
    
    // Add to order history
    const orderId = (++this.lastOrderId).toString();
    const now = new Date().toISOString();
    
    const newOrder = {
      orderId,
      clientOrderId: `client-${orderId}`,
      symbol,
      side: 'sell',
      quantity: qtyToClose,
      filledQuantity: qtyToClose,
      orderType: 'market',
      status: 'filled',
      createdAt: now,
      updatedAt: now,
      filledAt: now
    };
    
    this.orderHistory.unshift(newOrder);
    
    return newOrder;
  }

  /**
   * Cancel an order
   */
  async cancelOrder(orderId: string): Promise<boolean> {
    const orderIndex = this.orderHistory.findIndex(o => o.orderId === orderId);
    
    if (orderIndex === -1) {
      return false;
    }
    
    const order = this.orderHistory[orderIndex];
    
    if (order.status === 'filled') {
      return false; // Can't cancel filled orders
    }
    
    order.status = 'canceled';
    order.updatedAt = new Date().toISOString();
    
    return true;
  }

  /**
   * Get order status
   */
  async getOrderStatus(orderId: string): Promise<any> {
    const order = this.orderHistory.find(o => o.orderId === orderId);
    
    if (!order) {
      throw new Error(`Order ${orderId} not found`);
    }
    
    return order;
  }

  // Helper methods
  private getRandomPrice(symbol: string): number {
    return parseFloat(this.getBasePrice(symbol).toFixed(2));
  }

  private getBasePrice(symbol: string): number {
    // Return a deterministic but seemingly random price based on the symbol
    const symbolSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const basePrice = (symbolSum % 1000) + 50;
    return basePrice + (Math.random() * 10 - 5);
  }

  private generateRandomId(): string {
    return Array.from({ length: 4 }, () => Math.floor(Math.random() * 0x10000).toString(16).padStart(4, '0')).join('-');
  }
}