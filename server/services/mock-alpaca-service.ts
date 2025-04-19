/**
 * Mock Alpaca Service
 * 
 * This provides realistic fallback data when the real Alpaca API is unavailable
 * It implements the same interface as the real service for seamless fallback
 */

import { AlpacaClient } from './alpaca-service';

/**
 * Create a mock Alpaca client that returns realistic simulated data
 * This is used when the real API is unavailable
 */
export function createMockAlpacaClient(): AlpacaClient {
  console.log('Creating mock Alpaca client for fallback data');
  
  return {
    /**
     * Get account information
     * @returns Mock account data
     */
    getAccount: async () => {
      return {
        id: 'mock-account-123',
        account_number: 'PA12345678',
        status: 'ACTIVE',
        currency: 'USD',
        buying_power: '100000.00',
        cash: '50000.00',
        portfolio_value: '52500.00',
        pattern_day_trader: false,
        trading_blocked: false,
        transfers_blocked: false,
        account_blocked: false,
        created_at: new Date().toISOString(),
        trade_suspended_by_user: false,
        multiplier: '4',
        shorting_enabled: true,
        equity: '52500.00',
        last_equity: '51000.00',
        long_market_value: '22500.00',
        short_market_value: '0.00',
        initial_margin: '11250.00',
        maintenance_margin: '7500.00',
        last_maintenance_margin: '7250.00',
        daytrading_buying_power: '200000.00',
        regt_buying_power: '100000.00',
        non_marginable_buying_power: '50000.00',
        sma: '50000.00'
      };
    },
    
    /**
     * Get historical bars (candlestick data)
     * @param params Parameters like symbol, timeframe, limit, etc.
     * @returns Mock bar data
     */
    getBars: async (params: any = {}) => {
      const symbol = params.symbol || 'AAPL';
      const limit = params.limit || 20;
      const bars = [];
      
      // Current price range for the symbol
      let basePrice = 0;
      switch (symbol.toUpperCase()) {
        case 'AAPL':
          basePrice = 170.00;
          break;
        case 'MSFT':
          basePrice = 410.00;
          break;
        case 'AMZN':
          basePrice = 180.00;
          break;
        case 'GOOGL':
          basePrice = 150.00;
          break;
        case 'TSLA':
          basePrice = 145.00;
          break;
        case 'BTC/USD':
        case 'BTCUSD':
          basePrice = 62000.00;
          break;
        case 'ETH/USD':
        case 'ETHUSD':
          basePrice = 3000.00;
          break;
        default:
          basePrice = 100.00 + Math.random() * 100;
      }
      
      // Create mock bars
      const now = new Date();
      let currentPrice = basePrice;
      
      for (let i = 0; i < limit; i++) {
        // Create realistic price movement
        const priceChange = (Math.random() - 0.48) * (basePrice * 0.01); // Slightly biased upward
        currentPrice += priceChange;
        
        const open = currentPrice;
        const high = open + (Math.random() * basePrice * 0.005);
        const low = open - (Math.random() * basePrice * 0.005);
        const close = open + (Math.random() - 0.5) * (basePrice * 0.008);
        
        // Calculate timestamp for this bar
        const timestamp = new Date(now);
        timestamp.setMinutes(now.getMinutes() - ((limit - i) * 15)); // 15 minute bars
        
        bars.push({
          t: timestamp.toISOString(),
          o: open.toFixed(2),
          h: high.toFixed(2),
          l: low.toFixed(2),
          c: close.toFixed(2),
          v: Math.floor(Math.random() * 1000000),
          symbol: symbol
        });
      }
      
      return bars;
    },
    
    /**
     * Get current quote for a symbol
     * @param symbol Stock or crypto symbol
     * @returns Mock quote data
     */
    getQuote: async (symbol: string) => {
      // Set realistic base prices for common symbols
      let basePrice = 0;
      switch (symbol.toUpperCase()) {
        case 'AAPL':
          basePrice = 170.00;
          break;
        case 'MSFT':
          basePrice = 410.00;
          break;
        case 'AMZN':
          basePrice = 180.00;
          break;
        case 'GOOGL':
          basePrice = 150.00;
          break;
        case 'TSLA':
          basePrice = 145.00;
          break;
        case 'BTC/USD':
        case 'BTCUSD':
          basePrice = 62000.00;
          break;
        case 'ETH/USD':
        case 'ETHUSD':
          basePrice = 3000.00;
          break;
        default:
          basePrice = 100.00 + Math.random() * 100;
      }
      
      const now = new Date();
      
      // Create realistic bid/ask spread
      const askPrice = basePrice + (basePrice * 0.0005);
      const bidPrice = basePrice - (basePrice * 0.0005);
      
      return {
        symbol: symbol,
        t: now.toISOString(),
        bp: bidPrice.toFixed(2),
        bs: Math.floor(Math.random() * 1000),
        ap: askPrice.toFixed(2),
        as: Math.floor(Math.random() * 1000),
        c: [basePrice < 150 ? 'L' : 'R']
      };
    },
    
    /**
     * Get list of available tradable assets
     * @param params Filter parameters
     * @returns Mock assets data
     */
    getAssets: async (params: any = {}) => {
      // Common stock symbols
      const stockAssets = [
        {
          id: 'mock-asset-aapl',
          class: 'us_equity',
          exchange: 'NASDAQ',
          symbol: 'AAPL',
          name: 'Apple Inc.',
          status: 'active',
          tradable: true,
          marginable: true,
          shortable: true,
          easy_to_borrow: true
        },
        {
          id: 'mock-asset-msft',
          class: 'us_equity',
          exchange: 'NASDAQ',
          symbol: 'MSFT',
          name: 'Microsoft Corporation',
          status: 'active',
          tradable: true,
          marginable: true,
          shortable: true,
          easy_to_borrow: true
        },
        {
          id: 'mock-asset-amzn',
          class: 'us_equity',
          exchange: 'NASDAQ',
          symbol: 'AMZN',
          name: 'Amazon.com, Inc.',
          status: 'active',
          tradable: true,
          marginable: true,
          shortable: true,
          easy_to_borrow: true
        },
        {
          id: 'mock-asset-googl',
          class: 'us_equity',
          exchange: 'NASDAQ',
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          status: 'active',
          tradable: true,
          marginable: true,
          shortable: true,
          easy_to_borrow: true
        },
        {
          id: 'mock-asset-tsla',
          class: 'us_equity',
          exchange: 'NASDAQ',
          symbol: 'TSLA',
          name: 'Tesla, Inc.',
          status: 'active',
          tradable: true,
          marginable: true,
          shortable: true,
          easy_to_borrow: true
        }
      ];
      
      // Common crypto symbols
      const cryptoAssets = [
        {
          id: 'mock-asset-btc',
          class: 'crypto',
          exchange: 'FTXU',
          symbol: 'BTC/USD',
          name: 'Bitcoin',
          status: 'active',
          tradable: true,
          marginable: false,
          shortable: false,
          easy_to_borrow: false
        },
        {
          id: 'mock-asset-eth',
          class: 'crypto',
          exchange: 'FTXU',
          symbol: 'ETH/USD',
          name: 'Ethereum',
          status: 'active',
          tradable: true,
          marginable: false,
          shortable: false,
          easy_to_borrow: false
        },
        {
          id: 'mock-asset-sol',
          class: 'crypto',
          exchange: 'FTXU',
          symbol: 'SOL/USD',
          name: 'Solana',
          status: 'active',
          tradable: true,
          marginable: false,
          shortable: false,
          easy_to_borrow: false
        }
      ];
      
      // Filter assets based on parameters
      let assets = [...stockAssets, ...cryptoAssets];
      
      if (params.status) {
        assets = assets.filter(asset => asset.status === params.status);
      }
      
      if (params.asset_class) {
        assets = assets.filter(asset => asset.class === params.asset_class);
      }
      
      return assets;
    },
    
    /**
     * Create a new order (mock implementation)
     * @param params Order parameters
     * @returns Mock order confirmation
     */
    createOrder: async (params: any) => {
      const now = new Date();
      const orderId = `mock-order-${Date.now()}`;
      
      return {
        id: orderId,
        client_order_id: params.client_order_id || `client-${orderId}`,
        created_at: now.toISOString(),
        updated_at: now.toISOString(),
        submitted_at: now.toISOString(),
        filled_at: null,
        expired_at: null,
        canceled_at: null,
        failed_at: null,
        asset_id: `mock-asset-${params.symbol.toLowerCase()}`,
        symbol: params.symbol,
        asset_class: params.symbol.includes('/') ? 'crypto' : 'us_equity',
        qty: params.qty,
        filled_qty: '0',
        type: params.type,
        side: params.side,
        time_in_force: params.time_in_force || 'day',
        limit_price: params.limit_price || null,
        stop_price: params.stop_price || null,
        filled_avg_price: null,
        status: 'new',
        extended_hours: false,
        legs: null,
        trail_percent: null,
        trail_price: null,
        hwm: null
      };
    },
    
    /**
     * Get list of orders
     * @param params Filter parameters
     * @returns Mock orders data
     */
    getOrders: async (params: any = {}) => {
      const now = new Date();
      const yesterday = new Date(now);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const mockOrders = [
        {
          id: 'mock-order-1',
          client_order_id: 'client-1234',
          created_at: yesterday.toISOString(),
          updated_at: yesterday.toISOString(),
          submitted_at: yesterday.toISOString(),
          filled_at: yesterday.toISOString(),
          expired_at: null,
          canceled_at: null,
          failed_at: null,
          asset_id: 'mock-asset-aapl',
          symbol: 'AAPL',
          asset_class: 'us_equity',
          qty: '10',
          filled_qty: '10',
          type: 'market',
          side: 'buy',
          time_in_force: 'day',
          limit_price: null,
          stop_price: null,
          filled_avg_price: '170.25',
          status: 'filled',
          extended_hours: false,
          legs: null,
          trail_percent: null,
          trail_price: null,
          hwm: null
        },
        {
          id: 'mock-order-2',
          client_order_id: 'client-5678',
          created_at: now.toISOString(),
          updated_at: now.toISOString(),
          submitted_at: now.toISOString(),
          filled_at: null,
          expired_at: null,
          canceled_at: null,
          failed_at: null,
          asset_id: 'mock-asset-msft',
          symbol: 'MSFT',
          asset_class: 'us_equity',
          qty: '5',
          filled_qty: '0',
          type: 'limit',
          side: 'buy',
          time_in_force: 'day',
          limit_price: '400.00',
          stop_price: null,
          filled_avg_price: null,
          status: 'new',
          extended_hours: false,
          legs: null,
          trail_percent: null,
          trail_price: null,
          hwm: null
        }
      ];
      
      // Filter by status if specified
      if (params.status) {
        return mockOrders.filter(order => order.status === params.status);
      }
      
      return mockOrders;
    },
    
    /**
     * Get list of positions
     * @returns Mock positions data
     */
    getPositions: async () => {
      return [
        {
          asset_id: 'mock-asset-aapl',
          symbol: 'AAPL',
          qty: '10',
          avg_entry_price: '170.25',
          market_value: '1724.50',
          cost_basis: '1702.50',
          unrealized_pl: '22.00',
          unrealized_plpc: '0.0129',
          current_price: '172.45',
          lastday_price: '170.35',
          change_today: '0.0123',
          side: 'long'
        },
        {
          asset_id: 'mock-asset-btc',
          symbol: 'BTC/USD',
          qty: '0.05',
          avg_entry_price: '61500.00',
          market_value: '3125.00',
          cost_basis: '3075.00',
          unrealized_pl: '50.00',
          unrealized_plpc: '0.0163',
          current_price: '62500.00',
          lastday_price: '61000.00',
          change_today: '0.0246',
          side: 'long'
        }
      ];
    }
  };
}