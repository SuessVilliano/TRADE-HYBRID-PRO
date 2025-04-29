/**
 * TradingView Data Provider
 * 
 * Connects to TradingView to provide real-time and historical market data
 */

import { 
  MarketDataProvider, 
  MarketDataCapabilities, 
  MarketInfo, 
  CandleData, 
  TickData, 
  OrderBookData,
  HistoricalDataRequest,
  MarketDataSubscription
} from './market-data-interface';

// Define enums to match the old version that was expected
enum TimeInterval {
  ONE_MINUTE = '1m',
  THREE_MINUTES = '3m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  TWO_HOURS = '2h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

import crypto from 'crypto';

// Custom TradingView subscription options
interface TradingViewCredentials {
  username?: string;
  password?: string;
  sessionToken?: string;
  apiKey?: string;
}

/**
 * TradingView Data Provider
 * Implements the MarketDataProvider interface for TradingView
 */
export class TradingViewDataProvider implements MarketDataProvider {
  private credentials: TradingViewCredentials;
  private baseUrl: string;
  private connected: boolean = false;
  private sessionToken: string | null = null;
  private subscriptions: Map<string, any> = new Map();
  private reconnectInterval: NodeJS.Timeout | null = null;
  private refreshTokenInterval: NodeJS.Timeout | null = null;
  private chartSession: string | null = null;

  constructor(credentials: TradingViewCredentials, baseUrl?: string) {
    this.credentials = credentials;
    this.baseUrl = baseUrl || 'https://tradingview.com/api';
    
    // Validate credentials
    if (!credentials.sessionToken && !(credentials.username && credentials.password) && !credentials.apiKey) {
      throw new Error('TradingView data provider requires sessionToken, apiKey, or username and password');
    }
    
    console.log('TradingView data provider initialized');
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'TradingView';
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): MarketDataCapabilities {
    return {
      supportsRealtime: true,
      supportsHistorical: true,
      supportsOrderBook: false, // TradingView doesn't provide order book data directly
      supportsTicks: true,
      supportsCandles: true,
      supportedTimeframes: [
        TimeInterval.ONE_MINUTE,
        TimeInterval.THREE_MINUTES,
        TimeInterval.FIVE_MINUTES,
        TimeInterval.FIFTEEN_MINUTES,
        TimeInterval.THIRTY_MINUTES,
        TimeInterval.ONE_HOUR,
        TimeInterval.TWO_HOURS,
        TimeInterval.FOUR_HOURS,
        TimeInterval.ONE_DAY,
        TimeInterval.ONE_WEEK,
        TimeInterval.ONE_MONTH
      ],
      supportedAssetClasses: [
        'Stocks', 
        'Forex', 
        'Crypto', 
        'Futures', 
        'Indices', 
        'Bonds', 
        'Economic'
      ],
      maxSubscriptions: 40, // TradingView limits number of charts/subscriptions
      rateLimit: 30 // Estimated rate limit per minute
    };
  }

  /**
   * Connect to TradingView
   */
  async connect(): Promise<boolean> {
    try {
      // If we already have a session token, validate it
      if (this.credentials.sessionToken) {
        this.sessionToken = this.credentials.sessionToken;
        const valid = await this.validateSession();
        if (valid) {
          this.setupRefreshTokenInterval();
          this.connected = true;
          console.log('Connected to TradingView using existing session token');
          return true;
        }
      }

      // If we have username/password, try to log in
      if (this.credentials.username && this.credentials.password) {
        const loginResult = await this.login(this.credentials.username, this.credentials.password);
        if (loginResult) {
          this.setupRefreshTokenInterval();
          this.connected = true;
          console.log('Connected to TradingView using username/password');
          return true;
        }
      }

      // If we have API key, verify it
      if (this.credentials.apiKey) {
        const verifyResult = await this.verifyApiKey(this.credentials.apiKey);
        if (verifyResult) {
          this.connected = true;
          console.log('Connected to TradingView using API key');
          return true;
        }
      }

      console.error('Failed to connect to TradingView');
      return false;
    } catch (error) {
      console.error('Error connecting to TradingView:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from TradingView
   */
  async disconnect(): Promise<void> {
    if (this.reconnectInterval) {
      clearInterval(this.reconnectInterval);
      this.reconnectInterval = null;
    }

    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }

    // Clean up all subscriptions
    for (const subscriptionId of this.subscriptions.keys()) {
      await this.unsubscribe(subscriptionId);
    }

    this.connected = false;
    this.sessionToken = null;
    this.chartSession = null;
    console.log('Disconnected from TradingView');
  }

  /**
   * Check if connected to TradingView
   */
  isConnected(): boolean {
    return this.connected;
  }

  /**
   * Get information about a symbol
   */
  async getSymbolInfo(symbol: string): Promise<MarketInfo> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to TradingView');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/symbol_info?symbol=${encodeURIComponent(symbol)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get symbol info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.symbol) {
        throw new Error(`Symbol not found: ${symbol}`);
      }

      return {
        symbol: data.symbol.ticker,
        baseAsset: data.symbol.base_currency,
        quoteAsset: data.symbol.currency,
        minPrice: data.symbol.min_price,
        maxPrice: data.symbol.max_price,
        tickSize: data.symbol.price_precision,
        minQuantity: data.symbol.min_lot_size,
        maxQuantity: data.symbol.max_lot_size,
        stepSize: data.symbol.lot_size_step,
        exchange: data.symbol.exchange,
        category: data.symbol.type,
        description: data.symbol.description,
        lastUpdated: Date.now()
      };
    } catch (error) {
      console.error('Error getting symbol info from TradingView:', error);
      throw error;
    }
  }

  /**
   * Search for symbols
   */
  async searchSymbols(query: string): Promise<MarketInfo[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to TradingView');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/symbols/search?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to search symbols: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.symbols || !Array.isArray(data.symbols)) {
        return [];
      }

      return data.symbols.map((item: any) => ({
        symbol: item.ticker,
        baseAsset: item.base_currency,
        quoteAsset: item.currency,
        exchange: item.exchange,
        category: item.type,
        description: item.description,
        lastUpdated: Date.now()
      }));
    } catch (error) {
      console.error('Error searching symbols from TradingView:', error);
      throw error;
    }
  }

  /**
   * Get historical candle data
   */
  async getHistoricalCandles(request: HistoricalDataRequest): Promise<CandleData[]> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to TradingView');
      }
    }

    try {
      // Convert timeframe to TradingView format
      const interval = this.convertTimeframeToTradingView(request.interval);
      
      // Convert timestamps
      const from = typeof request.from === 'number' ? request.from : request.from.getTime();
      const to = typeof request.to === 'number' ? request.to : request.to.getTime();
      
      const response = await fetch(`${this.baseUrl}/history`, {
        method: 'POST',
        headers: this.getHeaders(),
        body: JSON.stringify({
          symbol: request.symbol,
          resolution: interval,
          from: Math.floor(from / 1000), // TradingView uses seconds
          to: Math.floor(to / 1000),
          countback: request.limit || 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to get historical data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.s !== 'ok' || !data.t || !data.o || !data.h || !data.l || !data.c || !data.v) {
        throw new Error(`Invalid historical data response: ${JSON.stringify(data)}`);
      }

      // Convert TradingView format to CandleData[]
      const candles: CandleData[] = [];
      
      for (let i = 0; i < data.t.length; i++) {
        candles.push({
          timestamp: data.t[i] * 1000, // Convert seconds to milliseconds
          open: data.o[i],
          high: data.h[i],
          low: data.l[i],
          close: data.c[i],
          volume: data.v[i],
          symbol: request.symbol,
          interval: request.interval
        });
      }

      return candles;
    } catch (error) {
      console.error('Error getting historical data from TradingView:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time candle data
   */
  subscribeToCandles(subscription: MarketDataSubscription, callback: (data: CandleData) => void): string {
    if (!this.isConnected()) {
      throw new Error('Not connected to TradingView');
    }

    if (!subscription.interval) {
      throw new Error('Interval required for candle subscription');
    }

    // Generate unique subscription ID
    const subscriptionId = `candles_${subscription.symbol}_${subscription.interval}_${Date.now()}`;
    
    // Initialize chart session if not already done
    this.ensureChartSession().then(() => {
      // Create candle subscription using TradingView WebSocket API
      const tvInterval = this.convertTimeframeToTradingView(subscription.interval!);
      
      // Set up subscription data
      this.subscriptions.set(subscriptionId, {
        type: 'candles',
        symbol: subscription.symbol,
        interval: subscription.interval,
        tvInterval: tvInterval,
        callback: callback,
        active: true
      });
      
      console.log(`Subscribed to ${subscription.symbol} candles (${subscription.interval})`);
    }).catch(error => {
      console.error('Error setting up candle subscription:', error);
      throw error;
    });

    return subscriptionId;
  }

  /**
   * Subscribe to real-time tick data
   */
  subscribeToTicks(subscription: MarketDataSubscription, callback: (data: TickData) => void): string {
    if (!this.isConnected()) {
      throw new Error('Not connected to TradingView');
    }

    // Generate unique subscription ID
    const subscriptionId = `ticks_${subscription.symbol}_${Date.now()}`;
    
    // Initialize chart session if not already done
    this.ensureChartSession().then(() => {
      // Set up subscription data
      this.subscriptions.set(subscriptionId, {
        type: 'ticks',
        symbol: subscription.symbol,
        callback: callback,
        active: true
      });
      
      console.log(`Subscribed to ${subscription.symbol} ticks`);
    }).catch(error => {
      console.error('Error setting up tick subscription:', error);
      throw error;
    });

    return subscriptionId;
  }

  /**
   * Subscribe to real-time order book data
   * Note: TradingView doesn't provide direct order book data
   */
  subscribeToOrderBook(subscription: MarketDataSubscription, callback: (data: OrderBookData) => void): string {
    throw new Error('Order book subscriptions not supported by TradingView');
  }

  /**
   * Unsubscribe from real-time data
   */
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      console.warn(`Subscription not found: ${subscriptionId}`);
      return;
    }

    subscription.active = false;
    this.subscriptions.delete(subscriptionId);
    console.log(`Unsubscribed from ${subscriptionId}`);
  }

  /**
   * Format symbol according to TradingView standards
   */
  formatSymbol(symbol: string, targetFormat?: string): string {
    // Default format is EXCHANGE:SYMBOL
    if (!targetFormat) {
      // If symbol already contains ':', return as is
      if (symbol.includes(':')) {
        return symbol;
      }
      
      // Try to extract exchange and symbol
      if (symbol.includes('/')) {
        const parts = symbol.split('/');
        return `CRYPTO:${parts[0]}${parts[1]}`;
      }
      
      // For forex
      if (/^[A-Z]{6}$/.test(symbol)) {
        return `FX:${symbol.substring(0, 3)}${symbol.substring(3, 6)}`;
      }
      
      // For crypto
      if (symbol.endsWith('USDT') || symbol.endsWith('BTC') || symbol.endsWith('ETH')) {
        return `CRYPTO:${symbol}`;
      }
      
      // Default to US stocks
      return `NASDAQ:${symbol}`;
    }
    
    // Handle specific target formats
    switch (targetFormat.toLowerCase()) {
      case 'crypto':
        if (symbol.includes('/')) {
          const parts = symbol.split('/');
          return `CRYPTO:${parts[0]}${parts[1]}`;
        }
        return `CRYPTO:${symbol}`;
        
      case 'forex':
        if (symbol.includes('/')) {
          const parts = symbol.split('/');
          return `FX:${parts[0]}${parts[1]}`;
        }
        return `FX:${symbol}`;
        
      case 'stocks':
        return `NASDAQ:${symbol}`;
        
      default:
        return symbol;
    }
  }

  /**
   * Login to TradingView
   */
  private async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username,
          password,
          remember: true
        })
      });

      if (!response.ok) {
        console.error(`Login failed: ${response.status} ${response.statusText}`);
        return false;
      }

      const data = await response.json();
      
      if (!data.user || !data.sessionToken) {
        console.error('Invalid login response');
        return false;
      }

      this.sessionToken = data.sessionToken;
      return true;
    } catch (error) {
      console.error('Error logging in to TradingView:', error);
      return false;
    }
  }

  /**
   * Verify API key
   */
  private async verifyApiKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/verify_api_key`, {
        method: 'GET',
        headers: {
          'X-API-Key': apiKey
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error verifying TradingView API key:', error);
      return false;
    }
  }

  /**
   * Validate existing session
   */
  private async validateSession(): Promise<boolean> {
    if (!this.sessionToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/user/profile`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      return response.ok;
    } catch (error) {
      console.error('Error validating TradingView session:', error);
      return false;
    }
  }

  /**
   * Refresh session token periodically
   */
  private setupRefreshTokenInterval(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    this.refreshTokenInterval = setInterval(async () => {
      try {
        await this.refreshSession();
      } catch (error) {
        console.error('Error refreshing TradingView session:', error);
      }
    }, 60 * 60 * 1000); // Refresh every hour
  }

  /**
   * Refresh session token
   */
  private async refreshSession(): Promise<boolean> {
    if (!this.sessionToken) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      
      if (data.sessionToken) {
        this.sessionToken = data.sessionToken;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error refreshing TradingView session:', error);
      return false;
    }
  }

  /**
   * Ensure chart session exists for subscriptions
   */
  private async ensureChartSession(): Promise<void> {
    if (this.chartSession) {
      return;
    }

    try {
      const response = await fetch(`${this.baseUrl}/chart/create_session`, {
        method: 'POST',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to create chart session: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.session_id) {
        throw new Error('Invalid chart session response');
      }

      this.chartSession = data.session_id;
      console.log('Created TradingView chart session');
    } catch (error) {
      console.error('Error creating TradingView chart session:', error);
      throw error;
    }
  }

  /**
   * Convert our timeframe format to TradingView format
   */
  private convertTimeframeToTradingView(interval: TimeInterval): string {
    switch (interval) {
      case TimeInterval.ONE_MINUTE:
        return '1';
      case TimeInterval.THREE_MINUTES:
        return '3';
      case TimeInterval.FIVE_MINUTES:
        return '5';
      case TimeInterval.FIFTEEN_MINUTES:
        return '15';
      case TimeInterval.THIRTY_MINUTES:
        return '30';
      case TimeInterval.ONE_HOUR:
        return '60';
      case TimeInterval.TWO_HOURS:
        return '120';
      case TimeInterval.FOUR_HOURS:
        return '240';
      case TimeInterval.ONE_DAY:
        return 'D';
      case TimeInterval.ONE_WEEK:
        return 'W';
      case TimeInterval.ONE_MONTH:
        return 'M';
      default:
        return '5';
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.sessionToken) {
      headers['Authorization'] = `Bearer ${this.sessionToken}`;
    }

    if (this.credentials.apiKey) {
      headers['X-API-Key'] = this.credentials.apiKey;
    }

    return headers;
  }
}

/**
 * Create a TradingView data provider
 */
export function createTradingViewDataProvider(
  credentials: TradingViewCredentials,
  baseUrl?: string
): MarketDataProvider {
  return new TradingViewDataProvider(credentials, baseUrl);
}