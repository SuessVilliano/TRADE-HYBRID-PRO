import { 
  AccountBalance, 
  BrokerPosition, 
  MarketData, 
  OrderHistory,
  BrokerService,
  OrderSide,
  OrderType,
  OrderTimeInForce,
  AssetInfo
} from './broker-service';

/**
 * Mock broker service implementation for testing and development
 * Provides simulated trading functionality when real broker APIs are unavailable
 */
export class MockBrokerService implements BrokerService {
  private positions: BrokerPosition[] = [];
  private orderHistory: OrderHistory[] = [];
  private balance: AccountBalance = {
    total: 25000,
    cash: 25000,
    positions: 0
  };
  private lastOrderId = 1000;
  private marketDataCallbacks: Map<string, ((data: MarketData) => void)[]> = new Map();
  private marketDataIntervals: Map<string, number> = new Map();

  constructor() {
    console.log('MockBrokerService initialized');
    
    // Initialize with sample positions
    this.positions = [
      {
        symbol: 'AAPL',
        quantity: 10,
        averagePrice: 175.23,
        currentPrice: 176.45,
        pnl: 12.2
      },
      {
        symbol: 'MSFT',
        quantity: 5,
        averagePrice: 332.12,
        currentPrice: 337.28,
        pnl: 25.8
      }
    ];
    
    // Update account balance to reflect positions
    this.recalculateBalance();
    
    // Initialize with sample order history
    this.orderHistory = [
      {
        orderId: '100001',
        symbol: 'AAPL',
        side: 'buy',
        quantity: 10,
        price: 175.23,
        status: 'filled',
        timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
        broker: 'Mock'
      },
      {
        orderId: '100002',
        symbol: 'MSFT',
        side: 'buy',
        quantity: 5,
        price: 332.12,
        status: 'filled',
        timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
        broker: 'Mock'
      }
    ];
  }

  async connect(): Promise<void> {
    console.log('Mock broker service connected');
    return Promise.resolve();
  }

  async getBalance(): Promise<AccountBalance> {
    // Add small random fluctuations to simulate market movements
    const positionsValue = this.positions.reduce(
      (sum, position) => sum + position.currentPrice * position.quantity, 
      0
    );
    
    this.balance = {
      cash: this.balance.cash,
      positions: parseFloat(positionsValue.toFixed(2)),
      total: parseFloat((this.balance.cash + positionsValue).toFixed(2))
    };
    
    return this.balance;
  }

  async getPositions(): Promise<BrokerPosition[]> {
    // Update positions with small random fluctuations
    this.positions = this.positions.map(position => {
      // -0.5% to +0.5% price movement
      const change = position.currentPrice * (Math.random() * 0.01 - 0.005);
      const newPrice = parseFloat((position.currentPrice + change).toFixed(2));
      const pnl = parseFloat(((newPrice - position.averagePrice) * position.quantity).toFixed(2));
      
      return {
        ...position,
        currentPrice: newPrice,
        pnl
      };
    });
    
    return this.positions;
  }

  async getAccountInfo(): Promise<any> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Calculate current portfolio value
    const positionsValue = this.positions.reduce(
      (sum, position) => sum + position.currentPrice * position.quantity, 
      0
    );
    
    return {
      id: 'mock-account-12345',
      status: 'ACTIVE',
      currency: 'USD',
      buying_power: this.balance.cash * 4, // 4x margin
      cash: this.balance.cash,
      portfolio_value: this.balance.cash + positionsValue,
      pattern_day_trader: false,
      trading_blocked: false,
      transfers_blocked: false,
      account_blocked: false,
      created_at: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(), // 90 days ago
      last_equity: this.balance.cash + positionsValue,
      initial_margin: positionsValue * 0.5,
      maintenance_margin: positionsValue * 0.25,
      equity: this.balance.cash + positionsValue
    };
  }
  
  async getAssetDetails(symbol: string): Promise<AssetInfo> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 700));
    
    // Company names for common stocks
    const companyNames: Record<string, string> = {
      'AAPL': 'Apple Inc.',
      'MSFT': 'Microsoft Corporation',
      'AMZN': 'Amazon.com Inc.',
      'GOOGL': 'Alphabet Inc.',
      'META': 'Meta Platforms Inc.',
      'TSLA': 'Tesla Inc.',
      'NVDA': 'NVIDIA Corporation',
      'JPM': 'JPMorgan Chase & Co.',
      'V': 'Visa Inc.',
      'JNJ': 'Johnson & Johnson',
      'WMT': 'Walmart Inc.',
      'PG': 'Procter & Gamble Co.',
      'MA': 'Mastercard Inc.',
      'UNH': 'UnitedHealth Group Inc.',
      'HD': 'Home Depot Inc.',
      'BAC': 'Bank of America Corp.',
      'DIS': 'Walt Disney Co.',
      'NFLX': 'Netflix Inc.',
      'ADBE': 'Adobe Inc.',
      'CMCSA': 'Comcast Corporation'
    };
    
    // Generate a deterministic but seemingly random price
    const currentPrice = this.getRandomPrice(symbol);
    
    return {
      symbol: symbol.toUpperCase(),
      name: companyNames[symbol.toUpperCase()] || `${symbol.toUpperCase()} Inc.`,
      exchange: 'NASDAQ',
      isTradeble: true,
      isFractionable: ['AAPL', 'MSFT', 'AMZN', 'GOOGL', 'META', 'TSLA'].includes(symbol.toUpperCase()),
      lastPrice: currentPrice,
      lastUpdated: Date.now()
    };
  }

  async placeOrder(order: {
    symbol: string;
    side: OrderSide;
    quantity: number;
    type: OrderType;
    timeInForce: OrderTimeInForce;
    limit_price?: number;
    stop_price?: number;
  }): Promise<any> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const orderId = (++this.lastOrderId).toString();
    const price = order.limit_price || this.getRandomPrice(order.symbol);
    const now = new Date().toISOString();
    
    // Create order object
    const createdOrder = {
      id: orderId,
      client_order_id: `mock-${Date.now()}`,
      created_at: now,
      updated_at: now,
      submitted_at: now,
      filled_at: null,
      expired_at: null,
      canceled_at: null,
      failed_at: null,
      asset_id: `mock-asset-${order.symbol}`,
      symbol: order.symbol,
      quantity: order.quantity,
      filled_quantity: 0,
      type: order.type,
      side: order.side,
      time_in_force: order.timeInForce,
      limit_price: order.limit_price || null,
      stop_price: order.stop_price || null,
      status: 'new'
    };
    
    // Add to order history for our existing getOrderHistory method
    this.orderHistory.unshift({
      orderId,
      symbol: order.symbol,
      side: order.side,
      quantity: order.quantity,
      price,
      status: 'new',
      timestamp: Date.now(),
      broker: 'Mock'
    });
    
    // Simulate order getting filled after a delay
    setTimeout(() => {
      // Update positions
      if (order.side === 'buy') {
        this.buyPosition(order.symbol, order.quantity, price);
      } else {
        this.sellPosition(order.symbol, order.quantity, price);
      }
      
      // Update account balance
      this.recalculateBalance();
      
      // Update order status in history
      const historyOrder = this.orderHistory.find(o => o.orderId === orderId);
      if (historyOrder) {
        historyOrder.status = 'filled';
      }
    }, 2000); // 2 second delay for fill
    
    return createdOrder;
  }

  async getOrderHistory(): Promise<OrderHistory[]> {
    return Promise.resolve(this.orderHistory);
  }

  subscribeToMarketData(symbol: string, callback: (data: MarketData) => void): void {
    // Add callback to subscribers
    if (!this.marketDataCallbacks.has(symbol)) {
      this.marketDataCallbacks.set(symbol, []);
    }
    this.marketDataCallbacks.get(symbol)?.push(callback);
    
    // Start sending market data if not already
    if (!this.marketDataIntervals.has(symbol)) {
      const basePrice = this.getBasePrice(symbol);
      
      // Create interval to send simulated market data
      const intervalId = window.setInterval(() => {
        // Generate random price movement (-0.5% to +0.5%)
        const change = basePrice * (Math.random() * 0.01 - 0.005);
        const price = parseFloat((basePrice + change).toFixed(2));
        const volume = Math.floor(Math.random() * 1000) + 100;
        
        const marketData: MarketData = {
          symbol,
          price,
          timestamp: Date.now(),
          volume
        };
        
        // Notify all subscribers
        this.marketDataCallbacks.get(symbol)?.forEach(cb => cb(marketData));
      }, 1000); // Update every second
      
      this.marketDataIntervals.set(symbol, intervalId);
    }
  }

  unsubscribeFromMarketData(symbol: string): void {
    // Clear interval
    const intervalId = this.marketDataIntervals.get(symbol);
    if (intervalId) {
      window.clearInterval(intervalId);
      this.marketDataIntervals.delete(symbol);
    }
    
    // Remove callbacks
    this.marketDataCallbacks.delete(symbol);
  }

  // Private helper methods
  private recalculateBalance(): void {
    const positionsValue = this.positions.reduce(
      (sum, position) => sum + position.currentPrice * position.quantity, 
      0
    );
    
    this.balance = {
      cash: parseFloat(this.balance.cash.toFixed(2)),
      positions: parseFloat(positionsValue.toFixed(2)),
      total: parseFloat((this.balance.cash + positionsValue).toFixed(2))
    };
  }

  private buyPosition(symbol: string, quantity: number, price: number): void {
    const existingPosition = this.positions.find(p => p.symbol === symbol);
    
    if (existingPosition) {
      // Update existing position
      const totalShares = existingPosition.quantity + quantity;
      const totalCost = (existingPosition.quantity * existingPosition.averagePrice) + (quantity * price);
      const avgPrice = parseFloat((totalCost / totalShares).toFixed(2));
      
      existingPosition.quantity = totalShares;
      existingPosition.averagePrice = avgPrice;
      existingPosition.currentPrice = price;
      existingPosition.pnl = parseFloat(((price - avgPrice) * totalShares).toFixed(2));
    } else {
      // Create new position
      this.positions.push({
        symbol,
        quantity,
        averagePrice: price,
        currentPrice: price,
        pnl: 0
      });
    }
    
    // Deduct from cash balance
    this.balance.cash -= quantity * price;
  }

  private sellPosition(symbol: string, quantity: number, price: number): void {
    const positionIndex = this.positions.findIndex(p => p.symbol === symbol);
    
    if (positionIndex >= 0) {
      const position = this.positions[positionIndex];
      
      if (position.quantity <= quantity) {
        // Close position completely
        this.positions.splice(positionIndex, 1);
        this.balance.cash += position.quantity * price;
      } else {
        // Reduce position
        position.quantity -= quantity;
        position.pnl = parseFloat(((price - position.averagePrice) * position.quantity).toFixed(2));
        this.balance.cash += quantity * price;
      }
    } else {
      console.warn(`Attempted to sell nonexistent position: ${symbol}`);
    }
  }

  private getRandomPrice(symbol: string): number {
    return parseFloat(this.getBasePrice(symbol).toFixed(2));
  }

  private getBasePrice(symbol: string): number {
    // Return a deterministic but seemingly random price based on the symbol
    const symbolSum = symbol.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0);
    const basePrice = (symbolSum % 1000) + 50; // 50-1049 price range
    const randomOffset = Math.random() * 10 - 5; // -5 to +5 random variation
    
    return basePrice + randomOffset;
  }
}