/**
 * Market Data Manager
 * 
 * Central service for managing different market data providers
 * Registers and maintains connections to various data sources
 */

import { 
  MarketDataProvider, 
  MarketDataCapabilities, 
  MarketInfo, 
  CandleData, 
  TickData, 
  OrderBookData,
  TimeInterval,
  HistoricalDataRequest,
  MarketDataSubscription
} from './market-data-interface';

import { createTradingViewDataProvider } from './tradingview-data-provider';
import { createCMEGroupDataProvider } from './cme-data-provider';
import { MCPServer } from '../core/mcp-server';

/**
 * Market Data Manager
 * 
 * Central service for managing market data providers
 */
export class MarketDataManager {
  private static instance: MarketDataManager;
  private providers: Map<string, MarketDataProvider> = new Map();
  private subscriptions: Map<string, { providerId: string, subscriptionId: string }> = new Map();
  private mcp: MCPServer;
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('Market Data Manager initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): MarketDataManager {
    if (!MarketDataManager.instance) {
      MarketDataManager.instance = new MarketDataManager(mcp);
    }
    return MarketDataManager.instance;
  }
  
  /**
   * Initialize the service with default data providers
   */
  public async initialize(): Promise<void> {
    try {
      // Initialize default data providers if env vars are set
      await this.initializeDefaultProviders();
      
      console.log('Market Data Manager initialized with default providers');
    } catch (error) {
      console.error('Error initializing Market Data Manager:', error);
    }
  }
  
  /**
   * Initialize default data providers
   */
  private async initializeDefaultProviders(): Promise<void> {
    try {
      // Check for TradingView credentials
      const tradingViewApiKey = process.env.TRADINGVIEW_API_KEY;
      const tradingViewSession = process.env.TRADINGVIEW_SESSION_TOKEN;
      
      if (tradingViewApiKey || tradingViewSession) {
        await this.registerTradingViewProvider(
          tradingViewApiKey, 
          tradingViewSession
        );
      }
      
      // Check for CME Group credentials
      const cmeApiKey = process.env.CME_API_KEY;
      const cmeClientId = process.env.CME_CLIENT_ID;
      const cmeClientSecret = process.env.CME_CLIENT_SECRET;
      
      if (cmeApiKey) {
        await this.registerCMEGroupProvider(
          cmeApiKey,
          cmeClientId,
          cmeClientSecret
        );
      }
      
      console.log('Default market data providers registered');
    } catch (error) {
      console.error('Error initializing default data providers:', error);
    }
  }
  
  /**
   * Register a TradingView data provider
   */
  public async registerTradingViewProvider(
    apiKey?: string,
    sessionToken?: string,
    username?: string,
    password?: string
  ): Promise<boolean> {
    try {
      // Create provider
      const provider = createTradingViewDataProvider({
        apiKey,
        sessionToken,
        username,
        password
      });
      
      // Test connection
      const connected = await provider.connect();
      if (!connected) {
        console.error('Failed to connect to TradingView data provider');
        return false;
      }
      
      // Register with service
      this.providers.set('tradingview', provider);
      
      console.log('TradingView data provider registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering TradingView data provider:', error);
      return false;
    }
  }
  
  /**
   * Register a CME Group data provider
   */
  public async registerCMEGroupProvider(
    apiKey: string,
    clientId?: string,
    clientSecret?: string
  ): Promise<boolean> {
    try {
      // Create provider
      const provider = createCMEGroupDataProvider({
        apiKey,
        clientId,
        clientSecret
      });
      
      // Test connection
      const connected = await provider.connect();
      if (!connected) {
        console.error('Failed to connect to CME Group data provider');
        return false;
      }
      
      // Register with service
      this.providers.set('cmegroup', provider);
      
      console.log('CME Group data provider registered successfully');
      return true;
    } catch (error) {
      console.error('Error registering CME Group data provider:', error);
      return false;
    }
  }
  
  /**
   * Register a generic data provider
   */
  public registerProvider(providerId: string, provider: MarketDataProvider): boolean {
    try {
      // Register with service
      this.providers.set(providerId, provider);
      
      console.log(`Data provider registered: ${providerId}`);
      return true;
    } catch (error) {
      console.error(`Error registering data provider ${providerId}:`, error);
      return false;
    }
  }
  
  /**
   * Get a data provider by ID
   */
  public getProvider(providerId: string): MarketDataProvider | undefined {
    return this.providers.get(providerId);
  }
  
  /**
   * Get all registered data providers
   */
  public getAllProviders(): Map<string, MarketDataProvider> {
    return this.providers;
  }
  
  /**
   * Get historical candle data
   */
  public async getHistoricalCandles(
    symbol: string,
    interval: TimeInterval,
    from: Date | number,
    to: Date | number,
    providerId?: string
  ): Promise<CandleData[]> {
    // If provider is specified, use it
    if (providerId && this.providers.has(providerId)) {
      const provider = this.providers.get(providerId)!;
      
      return provider.getHistoricalCandles({
        symbol,
        interval,
        from,
        to
      });
    }
    
    // Otherwise, try each provider in order
    // First, prioritize providers that specialize in the asset class
    
    // Try to identify asset class from symbol
    const assetClass = this.getAssetClassFromSymbol(symbol);
    
    // Get providers sorted by relevance to asset class
    const sortedProviders = Array.from(this.providers.entries())
      .map(([id, provider]) => ({
        id,
        provider,
        capabilities: provider.getCapabilities()
      }))
      .filter(entry => 
        entry.capabilities.supportsHistorical && 
        entry.capabilities.supportedTimeframes.includes(interval)
      )
      .sort((a, b) => {
        // Prioritize providers that support the asset class
        const aSupportsAsset = a.capabilities.supportedAssetClasses.includes(assetClass);
        const bSupportsAsset = b.capabilities.supportedAssetClasses.includes(assetClass);
        
        if (aSupportsAsset && !bSupportsAsset) return -1;
        if (!aSupportsAsset && bSupportsAsset) return 1;
        
        return 0;
      });
    
    // Try each provider
    for (const { id, provider } of sortedProviders) {
      try {
        console.log(`Trying provider ${id} for historical data of ${symbol}`);
        
        const candles = await provider.getHistoricalCandles({
          symbol,
          interval,
          from,
          to
        });
        
        if (candles.length > 0) {
          return candles;
        }
      } catch (error) {
        console.error(`Error getting historical data from ${id}:`, error);
      }
    }
    
    // If we get here, no provider could provide data
    throw new Error(`No provider could provide historical data for ${symbol}`);
  }
  
  /**
   * Subscribe to real-time data
   */
  public subscribeToData(
    subscription: MarketDataSubscription,
    callback: (data: any) => void,
    providerId?: string
  ): string {
    // Generate unique subscription ID
    const managerSubscriptionId = `${subscription.type}_${subscription.symbol}_${Date.now()}`;
    
    // If provider is specified, use it
    if (providerId && this.providers.has(providerId)) {
      const provider = this.providers.get(providerId)!;
      
      let providerSubscriptionId: string;
      
      switch (subscription.type) {
        case 'candles':
          providerSubscriptionId = provider.subscribeToCandles(subscription, callback);
          break;
        case 'ticks':
          providerSubscriptionId = provider.subscribeToTicks(subscription, callback);
          break;
        case 'orderbook':
          providerSubscriptionId = provider.subscribeToOrderBook(subscription, callback);
          break;
        default:
          throw new Error(`Unsupported subscription type: ${subscription.type}`);
      }
      
      // Store subscription mapping
      this.subscriptions.set(managerSubscriptionId, {
        providerId,
        subscriptionId: providerSubscriptionId
      });
      
      return managerSubscriptionId;
    }
    
    // Otherwise, try to find a suitable provider
    
    // Try to identify asset class from symbol
    const assetClass = this.getAssetClassFromSymbol(subscription.symbol);
    
    // Get providers sorted by relevance to asset class
    const sortedProviders = Array.from(this.providers.entries())
      .map(([id, provider]) => ({
        id,
        provider,
        capabilities: provider.getCapabilities()
      }))
      .filter(entry => {
        // Filter providers that support the subscription type
        switch (subscription.type) {
          case 'candles':
            return entry.capabilities.supportsCandles && 
              (subscription.interval ? 
                entry.capabilities.supportedTimeframes.includes(subscription.interval) : 
                true);
          case 'ticks':
            return entry.capabilities.supportsTicks;
          case 'orderbook':
            return entry.capabilities.supportsOrderBook;
        }
      })
      .sort((a, b) => {
        // Prioritize providers that support the asset class
        const aSupportsAsset = a.capabilities.supportedAssetClasses.includes(assetClass);
        const bSupportsAsset = b.capabilities.supportedAssetClasses.includes(assetClass);
        
        if (aSupportsAsset && !bSupportsAsset) return -1;
        if (!aSupportsAsset && bSupportsAsset) return 1;
        
        return 0;
      });
    
    // Try each provider
    for (const { id, provider } of sortedProviders) {
      try {
        console.log(`Trying provider ${id} for ${subscription.type} subscription to ${subscription.symbol}`);
        
        let providerSubscriptionId: string;
        
        switch (subscription.type) {
          case 'candles':
            providerSubscriptionId = provider.subscribeToCandles(subscription, callback);
            break;
          case 'ticks':
            providerSubscriptionId = provider.subscribeToTicks(subscription, callback);
            break;
          case 'orderbook':
            providerSubscriptionId = provider.subscribeToOrderBook(subscription, callback);
            break;
          default:
            throw new Error(`Unsupported subscription type: ${subscription.type}`);
        }
        
        // Store subscription mapping
        this.subscriptions.set(managerSubscriptionId, {
          providerId: id,
          subscriptionId: providerSubscriptionId
        });
        
        return managerSubscriptionId;
      } catch (error) {
        console.error(`Error subscribing to ${subscription.type} data from ${id}:`, error);
      }
    }
    
    // If we get here, no provider could provide data
    throw new Error(`No provider could provide ${subscription.type} data for ${subscription.symbol}`);
  }
  
  /**
   * Unsubscribe from real-time data
   */
  public unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    
    if (!subscription) {
      console.warn(`Subscription not found: ${subscriptionId}`);
      return;
    }
    
    const { providerId, subscriptionId: providerSubscriptionId } = subscription;
    const provider = this.providers.get(providerId);
    
    if (provider) {
      try {
        provider.unsubscribe(providerSubscriptionId);
      } catch (error) {
        console.error(`Error unsubscribing from ${providerId}:`, error);
      }
    }
    
    this.subscriptions.delete(subscriptionId);
    console.log(`Unsubscribed from ${subscriptionId}`);
  }
  
  /**
   * Get symbol information
   */
  public async getSymbolInfo(symbol: string, providerId?: string): Promise<MarketInfo> {
    // If provider is specified, use it
    if (providerId && this.providers.has(providerId)) {
      const provider = this.providers.get(providerId)!;
      return provider.getSymbolInfo(symbol);
    }
    
    // Otherwise, try each provider
    for (const [id, provider] of this.providers.entries()) {
      try {
        const info = await provider.getSymbolInfo(symbol);
        return info;
      } catch (error) {
        console.error(`Error getting symbol info from ${id}:`, error);
      }
    }
    
    // If we get here, no provider could provide info
    throw new Error(`No provider could provide info for ${symbol}`);
  }
  
  /**
   * Search for symbols
   */
  public async searchSymbols(query: string, providerId?: string): Promise<MarketInfo[]> {
    // If provider is specified, use it
    if (providerId && this.providers.has(providerId)) {
      const provider = this.providers.get(providerId)!;
      return provider.searchSymbols(query);
    }
    
    // Otherwise, combine results from all providers
    const results: MarketInfo[] = [];
    
    const promises = Array.from(this.providers.entries()).map(async ([id, provider]) => {
      try {
        const symbols = await provider.searchSymbols(query);
        results.push(...symbols);
      } catch (error) {
        console.error(`Error searching symbols from ${id}:`, error);
      }
    });
    
    await Promise.all(promises);
    
    // Deduplicate by symbol
    const uniqueResults = new Map<string, MarketInfo>();
    for (const info of results) {
      uniqueResults.set(info.symbol, info);
    }
    
    return Array.from(uniqueResults.values());
  }
  
  /**
   * Try to determine asset class from symbol
   */
  private getAssetClassFromSymbol(symbol: string): string {
    // Apply some heuristics to determine the asset class
    
    // Crypto
    if (
      symbol.endsWith('USDT') || 
      symbol.endsWith('BTC') || 
      symbol.endsWith('ETH') || 
      symbol.includes('/') && (
        symbol.includes('BTC') || 
        symbol.includes('ETH') || 
        symbol.includes('USDT')
      )
    ) {
      return 'Crypto';
    }
    
    // Forex
    if (/^[A-Z]{6}$/.test(symbol) || symbol.includes('/') && /^[A-Z]{3}\/[A-Z]{3}$/.test(symbol)) {
      return 'Forex';
    }
    
    // Futures - CME Futures often have specific formats
    if (/^[A-Z]{1,3}[FGHJKMNQUVXZ]\d{1,2}$/.test(symbol)) {
      return 'Futures';
    }
    
    // Default to stocks
    return 'Stocks';
  }
}

/**
 * Initialize the market data manager
 */
export function initializeMarketDataManager(mcp: MCPServer): MarketDataManager {
  const manager = MarketDataManager.getInstance(mcp);
  manager.initialize().catch(err => 
    console.error('Error initializing market data manager:', err)
  );
  return manager;
}