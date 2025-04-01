import { toast } from 'sonner';
import { SUPPORTED_BROKERS as BROKER_CONFIG, TRADING_CONFIG, ABATEV_CONFIG } from '@/lib/constants';
import { BrokerService } from './broker-service';
import { createTradeLockerService } from './tradelocker-service';
import { createTradingViewService, TradingViewService } from './tradingview-service';
import { createNinjaTraderService } from './ninjatrader-service';
import { createTradovateService } from './tradovate-service';
import { createTastyworksService } from './tastyworks-service';
import { createTradeStationService } from './tradestation-service';
import { KrakenService } from './kraken-service';

// Re-export the SUPPORTED_BROKERS constant for use by other modules
export const SUPPORTED_BROKERS = BROKER_CONFIG;

// Storage key for API credentials
const API_KEYS_STORAGE_KEY = 'trade-hybrid-api-keys';

// API endpoint base
const API_BASE = '/api';

// Interface for basic API credentials
interface ApiCredentials {
  [key: string]: string;
}

// Broker Asset Support Definition
export interface BrokerAssetSupport {
  futures: boolean;
  crypto: boolean;
  forex: boolean;
  dex: boolean;
}

// Unified trading interfaces
export interface MarketData {
  symbol: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface OrderDetails {
  symbol: string;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
}

export interface TradeUpdate {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  timestamp: number;
  status: 'pending' | 'filled' | 'partial_fill' | 'canceled' | 'rejected';
  fee?: number;
}

export interface AccountBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export interface TradePosition {
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  size: number;
  markPrice: number;
  unrealizedPnl: number;
  liquidationPrice?: number;
  leverage?: number;
}

// Basic service for interacting with various broker APIs
class BrokerAggregatorService {
  private apiCredentials: { [brokerId: string]: ApiCredentials } = {};
  private activeConnections: Set<string> = new Set();
  private isTestnet: boolean = true;
  private brokerAssetSupport: Map<string, BrokerAssetSupport> = new Map([
    ['ninjatrader', { futures: true, crypto: false, forex: false, dex: false }],
    ['tradovate', { futures: true, crypto: false, forex: false, dex: false }],
    ['topstep', { futures: true, crypto: false, forex: false, dex: false }],
    ['alpaca', { futures: false, crypto: true, forex: false, dex: false }],
    ['kraken', { futures: false, crypto: true, forex: false, dex: false }],
    ['mt4', { futures: false, crypto: false, forex: true, dex: false }],
    ['mt5', { futures: false, crypto: false, forex: true, dex: false }],
    ['oanda', { futures: false, crypto: false, forex: true, dex: false }]
  ]);

  constructor() {
    this.loadCredentials();
  }

  // Load credentials from storage
  private loadCredentials(): void {
    try {
      const savedKeys = localStorage.getItem(API_KEYS_STORAGE_KEY);
      if (savedKeys) {
        this.apiCredentials = JSON.parse(savedKeys);
      }
    } catch (error) {
      console.error('Failed to load API credentials:', error);
    }
  }

  // Check if we have credentials for a specific broker
  public hasCredentials(brokerId: string): boolean {
    return !!this.apiCredentials[brokerId];
  }

  // Get available brokers that have credentials
  public getAvailableBrokers(): string[] {
    return Object.keys(this.apiCredentials);
  }

  // Private broker service instances
  private brokerServices: Map<string, BrokerService | TradingViewService> = new Map();

  // Connect to a broker
  public async connectToBroker(brokerId: string): Promise<boolean> {
    try {
      if (!this.hasCredentials(brokerId)) {
        throw new Error(`No credentials found for broker: ${brokerId}`);
      }

      const credentials = this.apiCredentials[brokerId];

      // Create appropriate broker service based on the broker ID
      let success = false;

      switch (brokerId) {
        case 'tradelocker':
          if (credentials.apiKey && credentials.clientId) {
            const tradeLockerService = createTradeLockerService(
              credentials.apiKey,
              credentials.clientId
            );
            await tradeLockerService.connect();
            this.brokerServices.set(brokerId, tradeLockerService);
            success = true;
          }
          break;

        case 'tradingview':
          if (credentials.apiKey && credentials.userId) {
            const tradingViewService = createTradingViewService(
              credentials.apiKey, 
              credentials.userId
            );
            success = await tradingViewService.connect();
            this.brokerServices.set(brokerId, tradingViewService);
          }
          break;

        case 'ninjatrader':
          if (credentials.apiKey && credentials.accountId) {
            // Convert isTestnet to boolean with a default of true
            const isTestnetValue = typeof credentials.isTestnet === 'string' ? 
              credentials.isTestnet !== 'false' : 
              credentials.isTestnet !== false;
            console.log(`Connecting to NinjaTrader with ${isTestnetValue ? 'demo' : 'live'} mode`);
            const ninjaTraderService = createNinjaTraderService(
              credentials.apiKey,
              credentials.accountId,
              isTestnetValue
            );
            await ninjaTraderService.connect();
            this.brokerServices.set(brokerId, ninjaTraderService);
            success = true;
          }
          break;

        case 'tradovate':
          if (credentials.apiKey && credentials.userId && credentials.password) {
            // Convert isTestnet to boolean with a default of true
            const isTestnetValue = typeof credentials.isTestnet === 'string' ? 
              credentials.isTestnet !== 'false' : 
              credentials.isTestnet !== false;
            console.log(`Connecting to Tradovate with ${isTestnetValue ? 'demo' : 'live'} mode`);
            const tradovateService = createTradovateService(
              credentials.apiKey,
              credentials.userId,
              credentials.password,
              isTestnetValue
            );
            await tradovateService.connect();
            this.brokerServices.set(brokerId, tradovateService);
            success = true;
          }
          break;

        case 'kraken':
          if (credentials.apiKey && credentials.privateKey) {
            console.log('Connecting to Kraken API');
            const krakenService = new KrakenService(
              credentials.apiKey,
              credentials.privateKey
            );
            await krakenService.connect();
            this.brokerServices.set(brokerId, krakenService);
            success = true;
          }
          break;

        case 'tastyworks':
          if (credentials.apiKey && credentials.accountId) {
            // Convert isTestnet to boolean with a default of true
            const isTestnetValue = typeof credentials.isTestnet === 'string' ? 
              credentials.isTestnet !== 'false' : 
              credentials.isTestnet !== false;
            console.log(`Connecting to Tastyworks with ${isTestnetValue ? 'demo' : 'live'} mode`);
            const tastyworksService = createTastyworksService(
              credentials.apiKey,
              credentials.accountId,
              isTestnetValue
            );
            await tastyworksService.connect();
            this.brokerServices.set(brokerId, tastyworksService);
            success = true;
          }
          break;

        case 'tradestation':
          if (credentials.apiKey && credentials.accessToken && credentials.accountId) {
            // Convert isTestnet to boolean with a default of true
            const isTestnetValue = typeof credentials.isTestnet === 'string' ? 
              credentials.isTestnet !== 'false' : 
              credentials.isTestnet !== false;
            console.log(`Connecting to TradeStation with ${isTestnetValue ? 'simulation' : 'live'} mode`);
            const tradestationService = createTradeStationService(
              credentials.apiKey,
              credentials.accessToken,
              credentials.accountId,
              isTestnetValue
            );
            await tradestationService.connect();
            this.brokerServices.set(brokerId, tradestationService);
            success = true;
          }
          break;

        // Handle other broker types here as they are implemented
        // For now, succeed for any other brokers to maintain existing functionality
        default:
          console.log(`Using simulated connection for ${brokerId}`);
          success = true;
          break;
      }

      if (success) {
        this.activeConnections.add(brokerId);
        return true;
      } else {
        throw new Error(`Failed to connect to ${brokerId} service`);
      }
    } catch (error) {
      console.error(`Failed to connect to ${brokerId}:`, error);
      return false;
    }
  }

  // Disconnect from a broker
  public disconnectFromBroker(brokerId: string): void {
    try {
      // Clean up any active service resources
      if (this.brokerServices.has(brokerId)) {
        // Get the service to clean up
        const service = this.brokerServices.get(brokerId);

        // If it's a TradingView service with active subscriptions, handle that
        if (brokerId === 'tradingview') {
          // No specific cleanup needed for TradingView service yet
          console.log(`Disconnected from TradingView service`);
        } 
        // If it's a BrokerService with active market data subscriptions
        else if ((brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' || 
                  brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken') && service) {
          const brokerService = service as BrokerService;
          console.log(`Disconnected from ${brokerId} service`);
        }

        // Remove from the broker services map
        this.brokerServices.delete(brokerId);
      }

      // Remove from active connections
      this.activeConnections.delete(brokerId);

      console.log(`Successfully disconnected from ${brokerId}`);
    } catch (error) {
      console.error(`Error disconnecting from ${brokerId}:`, error);
    }
  }

  // Check if connected to a broker
  public isConnectedToBroker(brokerId: string): boolean {
    return this.activeConnections.has(brokerId);
  }

  // Set testnet mode
  public setTestnetMode(isTestnet: boolean): void {
    this.isTestnet = isTestnet;
  }

  // Set API credentials for a broker
  public async setApiCredentials(brokerId: string, credentials: Record<string, any>): Promise<void> {
    try {
      // Update the stored credentials
      this.apiCredentials[brokerId] = credentials;

      // Save to local storage for persistence
      localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(this.apiCredentials));

      // Handle testnet mode if specified in credentials
      if ('isTestnet' in credentials) {
        this.setTestnetMode(!!credentials.isTestnet);
      }

      console.log(`Updated API credentials for ${brokerId}`);

      // If we're already connected to this broker, disconnect and reconnect with new credentials
      if (this.isConnectedToBroker(brokerId)) {
        console.log(`Reconnecting to ${brokerId} with updated credentials`);
        this.disconnectFromBroker(brokerId);
        await this.connectToBroker(brokerId);
      }
    } catch (error) {
      console.error(`Error setting API credentials for ${brokerId}:`, error);
      throw error;
    }
  }

  // Get account balances from a specific broker
  public async getAccountBalances(brokerId: string): Promise<AccountBalance[]> {
    try {
      if (!this.isConnectedToBroker(brokerId)) {
        await this.connectToBroker(brokerId);
      }

      // Check if we have a real service implementation for this broker
      if (this.brokerServices.has(brokerId)) {
        const service = this.brokerServices.get(brokerId);

        // For any broker service (TradeLocker, NinjaTrader, Tradovate, Tastyworks, TradeStation, Kraken)
        if ((brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' || 
             brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken') && service) {
          console.log(`Getting real account balances from ${brokerId}`);
          // Use the broker service to get balances
          const brokerService = service as BrokerService;

          try {
            // Get balance from the broker service
            const brokerBalance = await brokerService.getBalance();

            // Convert broker service balance to our AccountBalance format
            if (brokerBalance) {
              const balances: AccountBalance[] = [];

              // Add USD/cash balance
              balances.push({
                asset: 'USD',
                free: brokerBalance.cash,
                locked: 0,
                total: brokerBalance.cash
              });

              // If we have positions value, add it as a summarized entry
              if (brokerBalance.positions > 0) {
                balances.push({
                  asset: 'POSITIONS',
                  free: 0,
                  locked: brokerBalance.positions,
                  total: brokerBalance.positions
                });
              }

              if (balances.length > 0) {
                return balances;
              }
            }
          } catch (e) {
            console.error(`Error fetching ${brokerId} balances:`, e);
            // Fall back to mock data
          }
        }
      }

      // If no real broker service or the call failed, return mock data
      console.log(`Using simulated account balances for ${brokerId}`);
      if (brokerId === 'alpaca') {
        return this.getMockAlpacaBalances();
      } else if (brokerId === 'binance') {
        return this.getMockBinanceBalances();
      } else if (brokerId === 'oanda') {
        return this.getMockOandaBalances();
      } else if (brokerId === 'kraken') {
        return this.getMockKrakenBalances();
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Failed to get balances from ${brokerId}:`, error);
      throw error;
    }
  }
  
  // Helper functions for mock data
  private getMockAlpacaBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 10000, locked: 0, total: 10000 },
      { asset: 'BTC', free: 0.5, locked: 0.1, total: 0.6 },
      { asset: 'ETH', free: 5, locked: 1, total: 6 }
    ];
  }

  private getMockBinanceBalances(): AccountBalance[] {
    return [
      { asset: 'USDT', free: 15000, locked: 5000, total: 20000 },
      { asset: 'BTC', free: 0.75, locked: 0.25, total: 1 },
      { asset: 'ETH', free: 10, locked: 5, total: 15 },
      { asset: 'BNB', free: 50, locked: 10, total: 60 }
    ];
  }

  private getMockOandaBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 25000, locked: 5000, total: 30000 },
      { asset: 'EUR', free: 10000, locked: 2000, total: 12000 }
    ];
  }

  private getMockKrakenBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 35000, locked: 15000, total: 50000 },
      { asset: 'BTC', free: 1.5, locked: 0.5, total: 2 },
      { asset: 'ETH', free: 20, locked: 5, total: 25 },
      { asset: 'XRP', free: 10000, locked: 5000, total: 15000 }
    ];
  }

  // Get mock positions for different brokers
  private getMockAlpacaPositions(): TradePosition[] {
    return [
      {
        symbol: 'BTCUSD',
        side: 'long',
        entryPrice: 60000,
        size: 0.5,
        markPrice: 65000,
        unrealizedPnl: 2500
      },
      {
        symbol: 'ETHUSD',
        side: 'long',
        entryPrice: 2500,
        size: 4,
        markPrice: 3000,
        unrealizedPnl: 2000
      }
    ];
  }

  private getMockBinancePositions(): TradePosition[] {
    return [
      {
        symbol: 'BTCUSDT',
        side: 'long',
        entryPrice: 60000,
        size: 0.8,
        markPrice: 65000,
        unrealizedPnl: 4000,
        leverage: 5
      },
      {
        symbol: 'ETHUSDT',
        side: 'short',
        entryPrice: 3500,
        size: 5,
        markPrice: 3000,
        unrealizedPnl: 2500,
        leverage: 10,
        liquidationPrice: 4200
      }
    ];
  }

  private getMockOandaPositions(): TradePosition[] {
    return [
      {
        symbol: 'EUR_USD',
        side: 'long',
        entryPrice: 1.10,
        size: 10000,
        markPrice: 1.12,
        unrealizedPnl: 200
      },
      {
        symbol: 'GBP_USD',
        side: 'short',
        entryPrice: 1.30,
        size: 5000,
        markPrice: 1.28,
        unrealizedPnl: 100
      }
    ];
  }

  private getMockKrakenPositions(): TradePosition[] {
    return [
      {
        symbol: 'XBTUSD',
        side: 'long',
        entryPrice: 60000,
        size: 1.5,
        markPrice: 65000,
        unrealizedPnl: 7500,
        leverage: 3
      },
      {
        symbol: 'ETHUSD',
        side: 'long',
        entryPrice: 2500,
        size: 10,
        markPrice: 3000,
        unrealizedPnl: 5000,
        leverage: 2
      },
      {
        symbol: 'XRPUSD',
        side: 'short',
        entryPrice: 1.2,
        size: 10000,
        markPrice: 1.0,
        unrealizedPnl: 2000,
        leverage: 5
      }
    ];
  }
}

// Create and export singleton instance
export const brokerAggregator = new BrokerAggregatorService();

export type BrokerCredentials = {
  apiKey: string;
  apiSecret: string;
};

// Types for broker comparison
export interface BrokerPrice {
  brokerId: string;
  price: number;
  spread: number;
  latency?: number;
  score?: number;
}

export interface BrokerComparison {
  symbol: string;
  timestamp: number;
  prices: BrokerPrice[];
}

export const brokerAggregatorService = {
  async comparePrices(symbol: string) {
    // Implement price comparison logic
    try {
      const response = await fetch(`/api/broker/compare-prices?symbol=${symbol}`);
      if (response.ok) {
        return await response.json();
      }
      throw new Error('Failed to compare prices');
    } catch (error) {
      console.error('Price comparison error:', error);
      throw new Error('Failed to compare broker prices');
    }
  },

  async getBrokerPriceComparisons(symbol: string): Promise<BrokerComparison[]> {
    // Implementation for getting historical price comparisons
    try {
      const response = await fetch(`/api/broker/price-history?symbol=${symbol}`);
      if (response.ok) {
        return await response.json();
      }
      
      // If no real data, return mock data
      console.log('Using mock price comparison data');
      return [{
        symbol,
        timestamp: Date.now(),
        prices: [
          { brokerId: 'alpaca', price: 65000, spread: 25, latency: 150, score: 0.85 },
          { brokerId: 'binance', price: 65010, spread: 15, latency: 120, score: 0.92 },
          { brokerId: 'kraken', price: 64990, spread: 20, latency: 130, score: 0.88 }
        ]
      }];
    } catch (error) {
      console.error('Error fetching broker comparison data:', error);
      throw new Error('Failed to fetch broker comparison data');
    }
  },

  // Store broker credentials and attempt connection
  async storeBrokerCredentials(brokerId: string, credentials: any): Promise<boolean> {
    try {
      console.log(`Storing credentials for broker ${brokerId}`);

      // Store the API credentials
      await brokerAggregator.setApiCredentials(brokerId, credentials);

      // Try to connect with the stored credentials
      return await brokerAggregator.connectToBroker(brokerId);
    } catch (error) {
      console.error(`Error storing credentials for broker ${brokerId}:`, error);
      return false;
    }
  }
};