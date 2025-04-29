/**
 * CME Group Data Provider
 * 
 * Connects to CME Group API to provide futures market data
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

// Define TimeInterval enum to match what was previously expected
enum TimeInterval {
  ONE_MINUTE = '1m',
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

// CME Group API credentials
interface CMEGroupCredentials {
  apiKey: string;
  clientId?: string;
  clientSecret?: string;
}

/**
 * CME Group Data Provider
 * Implements the MarketDataProvider interface for CME Group
 */
export class CMEGroupDataProvider implements MarketDataProvider {
  private credentials: CMEGroupCredentials;
  private baseUrl: string;
  private connected: boolean = false;
  private accessToken: string | null = null;
  private tokenExpiry: number = 0;
  private subscriptions: Map<string, any> = new Map();
  private refreshTokenInterval: NodeJS.Timeout | null = null;
  private marketDataCache: Map<string, MarketInfo> = new Map();

  constructor(credentials: CMEGroupCredentials, baseUrl?: string) {
    this.credentials = credentials;
    this.baseUrl = baseUrl || 'https://api.cmegroup.com';
    
    if (!credentials.apiKey) {
      throw new Error('CME Group data provider requires an API key');
    }
    
    console.log('CME Group data provider initialized');
  }

  /**
   * Get provider name
   */
  getName(): string {
    return 'CME Group';
  }

  /**
   * Get provider capabilities
   */
  getCapabilities(): MarketDataCapabilities {
    return {
      supportsRealtime: true,
      supportsHistorical: true,
      supportsOrderBook: true,
      supportsTicks: true,
      supportsCandles: true,
      supportedTimeframes: [
        TimeInterval.ONE_MINUTE,
        TimeInterval.FIVE_MINUTES,
        TimeInterval.FIFTEEN_MINUTES,
        TimeInterval.THIRTY_MINUTES,
        TimeInterval.ONE_HOUR,
        TimeInterval.FOUR_HOURS,
        TimeInterval.ONE_DAY
      ],
      supportedAssetClasses: [
        'Futures', 
        'Options', 
        'Micro Futures', 
        'E-mini Futures'
      ],
      maxSubscriptions: 20,
      maxHistoricalBars: 5000,
      rateLimit: 100 // Estimated rate limit per minute
    };
  }

  /**
   * Connect to CME Group API
   */
  async connect(): Promise<boolean> {
    try {
      // Check if we have valid credentials
      if (!this.credentials.apiKey) {
        console.error('CME Group API key is required');
        return false;
      }

      // Check if access token is still valid
      if (this.accessToken && this.tokenExpiry > Date.now()) {
        this.connected = true;
        return true;
      }

      // Get new access token
      await this.getAccessToken();
      
      // Set up token refresh interval
      this.setupTokenRefreshInterval();
      
      this.connected = true;
      console.log('Connected to CME Group API');
      return true;
    } catch (error) {
      console.error('Error connecting to CME Group API:', error);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from CME Group API
   */
  async disconnect(): Promise<void> {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
      this.refreshTokenInterval = null;
    }

    // Clean up all subscriptions
    for (const subscriptionId of this.subscriptions.keys()) {
      await this.unsubscribe(subscriptionId);
    }

    this.connected = false;
    this.accessToken = null;
    this.tokenExpiry = 0;
    console.log('Disconnected from CME Group API');
  }

  /**
   * Check if connected to CME Group API
   */
  isConnected(): boolean {
    return this.connected && !!this.accessToken && this.tokenExpiry > Date.now();
  }

  /**
   * Get information about a symbol
   */
  async getSymbolInfo(symbol: string): Promise<MarketInfo> {
    if (!this.isConnected()) {
      await this.connect();
      if (!this.isConnected()) {
        throw new Error('Not connected to CME Group API');
      }
    }

    // Check cache first
    if (this.marketDataCache.has(symbol)) {
      return this.marketDataCache.get(symbol)!;
    }

    try {
      // Format symbol for CME Group API (e.g., "ES" -> "/es")
      const formattedSymbol = this.formatSymbol(symbol, 'cme');
      
      const response = await fetch(`${this.baseUrl}/v1/instruments${formattedSymbol}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get symbol info: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.instrument) {
        throw new Error(`Symbol not found: ${symbol}`);
      }

      const instrumentData = data.data.instrument;
      
      const marketInfo: MarketInfo = {
        symbol: instrumentData.symbol || symbol,
        baseAsset: instrumentData.productGroup || '',
        quoteAsset: instrumentData.quoteCurrency || 'USD',
        minPrice: instrumentData.minPrice || 0,
        maxPrice: instrumentData.maxPrice || 0,
        tickSize: instrumentData.tickSize || 0.01,
        minQuantity: instrumentData.minTradeVol || 1,
        maxQuantity: instrumentData.maxTradeVol || 1000,
        stepSize: instrumentData.stepSize || 1,
        exchange: 'CME',
        category: instrumentData.productGroup || 'Futures',
        description: instrumentData.productName || '',
        lastUpdated: Date.now()
      };
      
      // Cache the result
      this.marketDataCache.set(symbol, marketInfo);
      
      return marketInfo;
    } catch (error) {
      console.error('Error getting symbol info from CME Group:', error);
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
        throw new Error('Not connected to CME Group API');
      }
    }

    try {
      const response = await fetch(`${this.baseUrl}/v1/instruments/search?q=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to search symbols: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.instruments || !Array.isArray(data.data.instruments)) {
        return [];
      }

      return data.data.instruments.map((item: any) => {
        const marketInfo: MarketInfo = {
          symbol: item.symbol,
          baseAsset: item.productGroup || '',
          quoteAsset: item.quoteCurrency || 'USD',
          exchange: 'CME',
          category: item.productGroup || 'Futures',
          description: item.productName || '',
          lastUpdated: Date.now()
        };
        
        // Cache the result
        this.marketDataCache.set(item.symbol, marketInfo);
        
        return marketInfo;
      });
    } catch (error) {
      console.error('Error searching symbols from CME Group:', error);
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
        throw new Error('Not connected to CME Group API');
      }
    }

    try {
      // Format dates
      const fromDate = new Date(typeof request.from === 'number' ? request.from : request.from);
      const toDate = new Date(typeof request.to === 'number' ? request.to : request.to);
      
      // Format for CME API: YYYY-MM-DD
      const fromFormatted = `${fromDate.getFullYear()}-${(fromDate.getMonth() + 1).toString().padStart(2, '0')}-${fromDate.getDate().toString().padStart(2, '0')}`;
      const toFormatted = `${toDate.getFullYear()}-${(toDate.getMonth() + 1).toString().padStart(2, '0')}-${toDate.getDate().toString().padStart(2, '0')}`;
      
      // Convert timeframe to CME Group format
      const interval = this.convertTimeframeToCME(request.interval);
      
      // Format symbol for CME Group API
      const formattedSymbol = this.formatSymbol(request.symbol, 'cme');
      
      const response = await fetch(`${this.baseUrl}/v2/market-data/historical/${formattedSymbol}?from=${fromFormatted}&to=${toFormatted}&interval=${interval}`, {
        method: 'GET',
        headers: this.getHeaders()
      });

      if (!response.ok) {
        throw new Error(`Failed to get historical data: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.data || !data.data.candles || !Array.isArray(data.data.candles)) {
        return [];
      }

      // Convert CME Group format to CandleData[]
      return data.data.candles.map((item: any) => ({
        timestamp: new Date(item.timestamp).getTime(),
        open: parseFloat(item.open),
        high: parseFloat(item.high),
        low: parseFloat(item.low),
        close: parseFloat(item.close),
        volume: parseInt(item.volume, 10),
        symbol: request.symbol,
        interval: request.interval
      }));
    } catch (error) {
      console.error('Error getting historical data from CME Group:', error);
      throw error;
    }
  }

  /**
   * Subscribe to real-time candle data
   */
  subscribeToCandles(subscription: MarketDataSubscription, callback: (data: CandleData) => void): string {
    if (!this.isConnected()) {
      throw new Error('Not connected to CME Group API');
    }

    if (!subscription.interval) {
      throw new Error('Interval required for candle subscription');
    }

    // Generate unique subscription ID
    const subscriptionId = `candles_${subscription.symbol}_${subscription.interval}_${Date.now()}`;
    
    // Format symbol for CME Group API
    const formattedSymbol = this.formatSymbol(subscription.symbol, 'cme');
    
    // Convert timeframe to CME Group format
    const interval = this.convertTimeframeToCME(subscription.interval);
    
    // Set up subscription in our internal map
    this.subscriptions.set(subscriptionId, {
      type: 'candles',
      symbol: subscription.symbol,
      formattedSymbol,
      interval: subscription.interval,
      cmeInterval: interval,
      callback,
      active: true,
      lastPoll: 0
    });
    
    // Start polling for this subscription
    this.startCandlePolling(subscriptionId);
    
    console.log(`Subscribed to ${subscription.symbol} candles (${subscription.interval})`);
    
    return subscriptionId;
  }

  /**
   * Subscribe to real-time tick data
   */
  subscribeToTicks(subscription: MarketDataSubscription, callback: (data: TickData) => void): string {
    if (!this.isConnected()) {
      throw new Error('Not connected to CME Group API');
    }

    // Generate unique subscription ID
    const subscriptionId = `ticks_${subscription.symbol}_${Date.now()}`;
    
    // Format symbol for CME Group API
    const formattedSymbol = this.formatSymbol(subscription.symbol, 'cme');
    
    // Set up subscription in our internal map
    this.subscriptions.set(subscriptionId, {
      type: 'ticks',
      symbol: subscription.symbol,
      formattedSymbol,
      callback,
      active: true,
      lastPoll: 0
    });
    
    // Start polling for this subscription
    this.startTickPolling(subscriptionId);
    
    console.log(`Subscribed to ${subscription.symbol} ticks`);
    
    return subscriptionId;
  }

  /**
   * Subscribe to real-time order book data
   */
  subscribeToOrderBook(subscription: MarketDataSubscription, callback: (data: OrderBookData) => void): string {
    if (!this.isConnected()) {
      throw new Error('Not connected to CME Group API');
    }

    // Generate unique subscription ID
    const subscriptionId = `orderbook_${subscription.symbol}_${Date.now()}`;
    
    // Format symbol for CME Group API
    const formattedSymbol = this.formatSymbol(subscription.symbol, 'cme');
    
    // Set up subscription in our internal map
    this.subscriptions.set(subscriptionId, {
      type: 'orderbook',
      symbol: subscription.symbol,
      formattedSymbol,
      depth: subscription.depth || 10,
      callback,
      active: true,
      lastPoll: 0
    });
    
    // Start polling for this subscription
    this.startOrderBookPolling(subscriptionId);
    
    console.log(`Subscribed to ${subscription.symbol} order book`);
    
    return subscriptionId;
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
   * Format symbol according to CME Group standards
   */
  formatSymbol(symbol: string, targetFormat?: string): string {
    // If target format is not specified or not 'cme', return as is
    if (!targetFormat || targetFormat.toLowerCase() !== 'cme') {
      return symbol;
    }
    
    // CME Group API format is typically /category/symbol/month
    // Example: /es/ESM3 for E-mini S&P 500 June 2023

    // If symbol already has the correct format
    if (symbol.startsWith('/')) {
      return symbol;
    }
    
    // Basic format: /lowercasesymbol
    return `/${symbol.toLowerCase()}`;
  }

  /**
   * Get access token for CME Group API
   */
  private async getAccessToken(): Promise<void> {
    try {
      // If we have client ID and secret, use OAuth flow
      if (this.credentials.clientId && this.credentials.clientSecret) {
        const response = await fetch(`${this.baseUrl}/auth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.credentials.clientId,
            client_secret: this.credentials.clientSecret
          })
        });

        if (!response.ok) {
          throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        this.accessToken = data.access_token;
        this.tokenExpiry = Date.now() + (data.expires_in * 1000);
      } else {
        // Use API key-based authentication
        this.accessToken = this.credentials.apiKey;
        this.tokenExpiry = Date.now() + (3600 * 1000); // Assume 1 hour validity
      }
    } catch (error) {
      console.error('Error getting CME Group access token:', error);
      throw error;
    }
  }

  /**
   * Set up token refresh interval
   */
  private setupTokenRefreshInterval(): void {
    if (this.refreshTokenInterval) {
      clearInterval(this.refreshTokenInterval);
    }

    this.refreshTokenInterval = setInterval(async () => {
      try {
        // If token is about to expire (within 5 minutes), refresh it
        if (this.tokenExpiry - Date.now() < 5 * 60 * 1000) {
          await this.getAccessToken();
        }
      } catch (error) {
        console.error('Error refreshing CME Group token:', error);
      }
    }, 60 * 1000); // Check every minute
  }

  /**
   * Convert our timeframe format to CME Group format
   */
  private convertTimeframeToCME(interval: TimeInterval): string {
    switch (interval) {
      case TimeInterval.ONE_MINUTE:
        return '1m';
      case TimeInterval.FIVE_MINUTES:
        return '5m';
      case TimeInterval.FIFTEEN_MINUTES:
        return '15m';
      case TimeInterval.THIRTY_MINUTES:
        return '30m';
      case TimeInterval.ONE_HOUR:
        return '1h';
      case TimeInterval.FOUR_HOURS:
        return '4h';
      case TimeInterval.ONE_DAY:
        return '1d';
      default:
        return '5m';
    }
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.accessToken) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    headers['X-API-Key'] = this.credentials.apiKey;

    return headers;
  }

  /**
   * Start polling for candle data
   */
  private startCandlePolling(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription || !subscription.active) {
      return;
    }

    const pollInterval = this.getPollInterval(subscription.interval);
    
    const poll = async () => {
      if (!subscription.active) {
        return;
      }

      try {
        // Get latest candle
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        
        // Format dates for CME API: YYYY-MM-DD
        const fromFormatted = `${fiveMinutesAgo.getFullYear()}-${(fiveMinutesAgo.getMonth() + 1).toString().padStart(2, '0')}-${fiveMinutesAgo.getDate().toString().padStart(2, '0')}`;
        const toFormatted = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}`;
        
        const response = await fetch(`${this.baseUrl}/v2/market-data/historical/${subscription.formattedSymbol}?from=${fromFormatted}&to=${toFormatted}&interval=${subscription.cmeInterval}`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to poll candle data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.candles && data.data.candles.length > 0) {
          // Get the latest candle
          const latestCandle = data.data.candles[data.data.candles.length - 1];
          
          // Convert to our format
          const candleData: CandleData = {
            timestamp: new Date(latestCandle.timestamp).getTime(),
            open: parseFloat(latestCandle.open),
            high: parseFloat(latestCandle.high),
            low: parseFloat(latestCandle.low),
            close: parseFloat(latestCandle.close),
            volume: parseInt(latestCandle.volume, 10),
            symbol: subscription.symbol,
            interval: subscription.interval
          };
          
          // Call the callback
          subscription.callback(candleData);
        }
      } catch (error) {
        console.error(`Error polling candle data for ${subscription.symbol}:`, error);
      }

      // Schedule next poll
      setTimeout(poll, pollInterval);
    };

    // Start polling
    poll();
  }

  /**
   * Start polling for tick data
   */
  private startTickPolling(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription || !subscription.active) {
      return;
    }

    const pollInterval = 1000; // Poll every second
    
    const poll = async () => {
      if (!subscription.active) {
        return;
      }

      try {
        // Get latest tick
        const response = await fetch(`${this.baseUrl}/v2/market-data/quotes/${subscription.formattedSymbol}`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to poll tick data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.quote) {
          // Convert to our format
          const tickData: TickData = {
            timestamp: new Date(data.data.quote.timestamp).getTime(),
            price: parseFloat(data.data.quote.price),
            volume: parseInt(data.data.quote.volume, 10),
            symbol: subscription.symbol,
            bid: parseFloat(data.data.quote.bid),
            ask: parseFloat(data.data.quote.ask),
            trades: parseInt(data.data.quote.trades, 10)
          };
          
          // Call the callback
          subscription.callback(tickData);
        }
      } catch (error) {
        console.error(`Error polling tick data for ${subscription.symbol}:`, error);
      }

      // Schedule next poll
      setTimeout(poll, pollInterval);
    };

    // Start polling
    poll();
  }

  /**
   * Start polling for order book data
   */
  private startOrderBookPolling(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription || !subscription.active) {
      return;
    }

    const pollInterval = 2000; // Poll every 2 seconds
    
    const poll = async () => {
      if (!subscription.active) {
        return;
      }

      try {
        // Get order book
        const response = await fetch(`${this.baseUrl}/v2/market-data/order-book/${subscription.formattedSymbol}?depth=${subscription.depth}`, {
          method: 'GET',
          headers: this.getHeaders()
        });

        if (!response.ok) {
          throw new Error(`Failed to poll order book data: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        if (data.data && data.data.orderBook) {
          // Convert to our format
          const orderBookData: OrderBookData = {
            symbol: subscription.symbol,
            timestamp: new Date(data.data.orderBook.timestamp).getTime(),
            bids: (data.data.orderBook.bids || []).map((item: any) => ({
              price: parseFloat(item.price),
              quantity: parseFloat(item.quantity)
            })),
            asks: (data.data.orderBook.asks || []).map((item: any) => ({
              price: parseFloat(item.price),
              quantity: parseFloat(item.quantity)
            }))
          };
          
          // Call the callback
          subscription.callback(orderBookData);
        }
      } catch (error) {
        console.error(`Error polling order book data for ${subscription.symbol}:`, error);
      }

      // Schedule next poll
      setTimeout(poll, pollInterval);
    };

    // Start polling
    poll();
  }

  /**
   * Get poll interval based on candle interval
   */
  private getPollInterval(interval: TimeInterval): number {
    switch (interval) {
      case TimeInterval.ONE_MINUTE:
        return 10 * 1000; // 10 seconds
      case TimeInterval.FIVE_MINUTES:
        return 30 * 1000; // 30 seconds
      case TimeInterval.FIFTEEN_MINUTES:
        return 60 * 1000; // 1 minute
      case TimeInterval.THIRTY_MINUTES:
        return 2 * 60 * 1000; // 2 minutes
      case TimeInterval.ONE_HOUR:
        return 5 * 60 * 1000; // 5 minutes
      case TimeInterval.FOUR_HOURS:
        return 15 * 60 * 1000; // 15 minutes
      case TimeInterval.ONE_DAY:
        return 30 * 60 * 1000; // 30 minutes
      default:
        return 30 * 1000; // 30 seconds
    }
  }
}

/**
 * Create a CME Group data provider
 */
export function createCMEGroupDataProvider(
  credentials: CMEGroupCredentials,
  baseUrl?: string
): MarketDataProvider {
  return new CMEGroupDataProvider(credentials, baseUrl);
}