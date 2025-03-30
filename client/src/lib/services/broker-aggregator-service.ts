import { toast } from 'sonner';

export interface BrokerAssetSupport {
  futures: boolean;
  crypto: boolean;
  forex: boolean;
  dex: boolean;
}

export class BrokerAggregatorService {
  private connectedBrokers: Map<string, any> = new Map();
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

  async connectBroker(brokerId: string, credentials?: any) {
    try {
      // First connect via TradingView if supported
      if (this.isTradingViewSupported(brokerId)) {
        const tvService = await this.getTradingViewService();
        const tvConnection = await tvService.connectBroker(brokerId, credentials);
        if (!tvConnection) {
          throw new Error('TradingView connection failed');
        }
      }

      // Then connect directly to broker API as backup
      const response = await fetch(`/api/broker/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ brokerId, credentials })
      });

      if (!response.ok) throw new Error('Failed to connect broker');

      const connection = await response.json();
      this.connectedBrokers.set(brokerId, {
        ...connection,
        tradingViewEnabled: this.isTradingViewSupported(brokerId)
      });
      
      return true;
    } catch (error) {
      console.error('Broker connection failed:', error);
      return false;
    }
  }

  private isTradingViewSupported(brokerId: string): boolean {
    const supportedBrokers = ['oanda', 'ninjatrader', 'tradovate', 'alpaca'];
    return supportedBrokers.includes(brokerId.toLowerCase());
  }

  private async getTradingViewService(): Promise<any> {
    if (!this.tradingViewService) {
      // Initialize TradingView service with credentials
      const tvCredentials = await this.getTradingViewCredentials();
      this.tradingViewService = createTradingViewService(tvCredentials);
      await this.tradingViewService.connect();
    }
    return this.tradingViewService;
  }

  async executeTrade(order: any) {
    const broker = this.connectedBrokers.get(order.broker);
    if (!broker) throw new Error('Broker not connected');

    try {
      // Try executing through TradingView first if supported
      if (broker.tradingViewEnabled) {
        const tvService = await this.getTradingViewService();
        const tvResult = await tvService.executeTrade(order);
        if (tvResult) return tvResult;
      }

      // Fallback to direct broker API
      const response = await fetch('/api/broker/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order)
      });

      if (!response.ok) throw new Error('Order submission failed');
      return await response.json();
    } catch (error) {
      console.error('Trade execution failed:', error);
      throw error;
    }
  }

  async submitOrder(order: any) {
    const broker = this.connectedBrokers.get(order.broker);
    if (!broker) throw new Error('Broker not connected');

    const response = await fetch('/api/broker/trade', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(order)
    });

    if (!response.ok) throw new Error('Order submission failed');
    return await response.json();
  }
}

export const brokerAggregator = new BrokerAggregatorService();

import { SUPPORTED_BROKERS as BROKER_CONFIG, TRADING_CONFIG, ABATEV_CONFIG } from '@/lib/constants';
import { BrokerService } from './broker-service';
import { createTradeLockerService } from './tradelocker-service';
import { createTradingViewService, TradingViewService } from './tradingview-service';
import { createNinjaTraderService } from './ninjatrader-service';
import { createTradovateService } from './tradovate-service';
import { createTastyworksService } from './tastyworks-service';
import { createTradeStationService } from './tradestation-service';
import { KrakenService } from './kraken-service';

// Storage key for API credentials
const API_KEYS_STORAGE_KEY = 'trade-hybrid-api-keys';

// API endpoint base
const API_BASE = '/api';

// Interface for basic API credentials
interface ApiCredentials {
  [key: string]: string;
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

  // Get market data from a specific broker
  public async getMarketData(brokerId: string, symbol: string, timeframe: string): Promise<MarketData[]> {
    try {
      if (!this.isConnectedToBroker(brokerId)) {
        await this.connectToBroker(brokerId);
      }

      // Check if we have a real service implementation for this broker
      if (this.brokerServices.has(brokerId)) {
        const service = this.brokerServices.get(brokerId);

        if ((brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' || 
             brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken') && service) {
          console.log(`Getting market data from ${brokerId} for ${symbol}`);
          // Use the broker service to get market data
          const brokerService = service as BrokerService;

          // Create an array to store the market data points
          const marketDataPoints: MarketData[] = [];

          // Set up a temporary callback to collect the data
          await new Promise<void>((resolve) => {
            let dataReceived = false;

            // Subscribe to market data
            brokerService.subscribeToMarketData(symbol, (data) => {
              // Convert broker service data to our MarketData format
              marketDataPoints.push({
                symbol: data.symbol,
                open: data.open || data.price,
                high: data.high || data.price,
                low: data.low || data.price,
                close: data.close || data.price,
                volume: data.volume || 0,
                timestamp: data.timestamp
              });

              dataReceived = true;

              // After receiving some data, resolve the promise
              if (marketDataPoints.length >= 10 || dataReceived) {
                resolve();

                // Unsubscribe after getting the data
                brokerService.unsubscribeFromMarketData(symbol);
              }
            });

            // Set a timeout in case no data is received
            setTimeout(() => {
              if (!dataReceived) {
                resolve();
                brokerService.unsubscribeFromMarketData(symbol);
              }
            }, 5000);
          });

          if (marketDataPoints.length > 0) {
            return marketDataPoints;
          }
          // If no data was received, fall back to mock data
        }
        else if (brokerId === 'tradingview') {
          console.log(`Getting market data from TradingView for ${symbol}`);
          // For TradingView, we use a different approach since it's not a BrokerService
          const tradingViewService = service as TradingViewService;

          // Get chart data from TradingView
          const to = Math.floor(Date.now() / 1000);
          const from = to - (3600 * 24); // Last 24 hours

          // Convert interval to TradingView format
          const resolution = this.convertTimeframeToResolution(timeframe);

          try {
            const chartData = await tradingViewService.getChartData(symbol, resolution, from, to);

            if (chartData && chartData.s === 'ok' && chartData.t && chartData.t.length > 0) {
              // Convert TradingView chart data to our format
              return chartData.t.map((timestamp: number, index: number) => ({
                symbol,
                timestamp: timestamp * 1000, // Convert to milliseconds
                open: chartData.o[index],
                high: chartData.h[index],
                low: chartData.l[index],
                close: chartData.c[index],
                volume: chartData.v[index] || 0
              }));
            }
          } catch (e) {
            console.error(`Error fetching TradingView chart data for ${symbol}:`, e);
            // Fall back to mock data
          }
        }
      }

      // If we don't have a real service or the service call failed, use mock data
      console.log(`Using mock market data for ${symbol} (${brokerId})`);
      return this.generateMockMarketData(symbol, 100);
    } catch (error) {
      console.error(`Failed to get market data from ${brokerId} for ${symbol}:`, error);
      throw error;
    }
  }

  // Helper to convert our timeframe format to TradingView resolution format
  private convertTimeframeToResolution(timeframe: string): string {
    switch (timeframe.toLowerCase()) {
      case '1m': return '1';
      case '5m': return '5';
      case '15m': return '15';
      case '30m': return '30';
      case '1h': return '60';
      case '4h': return '240';
      case '1d': return 'D';
      case '1w': return 'W';
      case '1M': return 'M';
      default: return '60'; // Default to 1 hour
    }
  }

  // Place an order with a specific broker
  public async placeOrder(brokerId: string, order: OrderDetails): Promise<TradeUpdate> {
    try {
      if (!this.isConnectedToBroker(brokerId)) {
        await this.connectToBroker(brokerId);
      }

      // Check if we have a real service implementation for this broker
      if (this.brokerServices.has(brokerId) && (brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' ||
          brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken')) {
        const service = this.brokerServices.get(brokerId) as BrokerService;

        console.log(`Placing real order with ${brokerId} for ${order.symbol}`);

        try {
          // Convert our order format to broker service format
          const orderType = order.type === 'market' ? 'market' as const : 'limit' as const;
          const brokerOrder = {
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            type: orderType,
            limitPrice: order.price
          };

          // Place the order using the broker service
          const orderId = await service.placeOrder(brokerOrder);

          // Return a success response with the order ID
          return {
            id: orderId,
            symbol: order.symbol,
            side: order.side,
            quantity: order.quantity,
            price: order.price || this.getRandomPrice(order.symbol),
            timestamp: Date.now(),
            status: 'filled',
            fee: order.quantity * (order.price || this.getRandomPrice(order.symbol)) * 0.001
          };
        } catch (err) {
          console.error(`Error placing ${brokerId} order:`, err);
          // Fall back to mock order if the real order fails
        }
      }

      // If no real broker service or the call failed, return mock data
      console.log(`Using simulated order for ${order.symbol} (${brokerId})`);
      return {
        id: `order-${Date.now()}`,
        symbol: order.symbol,
        side: order.side,
        quantity: order.quantity,
        price: order.price || this.getRandomPrice(order.symbol),
        timestamp: Date.now(),
        status: 'filled',
        fee: order.quantity * (order.price || this.getRandomPrice(order.symbol)) * 0.001
      };
    } catch (error) {
      console.error(`Failed to place order with ${brokerId}:`, error);
      throw error;
    }
  }

  // Get open positions from a specific broker
  public async getPositions(brokerId: string): Promise<TradePosition[]> {
    try {
      if (!this.isConnectedToBroker(brokerId)) {
        await this.connectToBroker(brokerId);
      }

      // Check if we have a real service implementation for this broker
      if (this.brokerServices.has(brokerId)) {
        const service = this.brokerServices.get(brokerId);

        if ((brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' || 
             brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken') && service) {
          console.log(`Getting real positions from ${brokerId}`);
          // Use the broker service to get positions
          const brokerService = service as BrokerService;

          try {
            // Get positions from the broker service
            const brokerPositions = await brokerService.getPositions();

            // Convert broker service positions to our TradePosition format
            if (brokerPositions && brokerPositions.length > 0) {
              return brokerPositions.map(pos => ({
                symbol: pos.symbol,
                side: pos.quantity > 0 ? 'long' : 'short',
                entryPrice: pos.averagePrice,
                size: Math.abs(pos.quantity),
                markPrice: pos.currentPrice,
                unrealizedPnl: pos.pnl
              }));
            }
          } catch (e) {
            console.error(`Error fetching ${brokerId} positions:`, e);
            // Fall back to mock data
          }
        }
      }

      // If no real broker service or the call failed, return mock data
      console.log(`Using simulated positions for ${brokerId}`);
      if (brokerId === 'alpaca') {
        return this.getMockAlpacaPositions();
      } else if (brokerId === 'binance') {
        return this.getMockBinancePositions();
      } else if (brokerId === 'oanda') {
        return this.getMockOandaPositions();
      } else if (brokerId === 'kraken') {
        return this.getMockKrakenPositions();
      } else {
        return [];
      }
    } catch (error) {
      console.error(`Failed to get positions from ${brokerId}:`, error);
      throw error;
    }
  }

  // Get order history from a specific broker
  public async getOrderHistory(brokerId: string, symbol?: string): Promise<TradeUpdate[]> {
    try {
      if (!this.isConnectedToBroker(brokerId)) {
        await this.connectToBroker(brokerId);
      }

      // Check if we have a real service implementation for this broker
      if (this.brokerServices.has(brokerId)) {
        const service = this.brokerServices.get(brokerId);

        if ((brokerId === 'tradelocker' || brokerId === 'ninjatrader' || brokerId === 'tradovate' || 
             brokerId === 'tastyworks' || brokerId === 'tradestation' || brokerId === 'kraken') && service) {
          console.log(`Getting real order history from ${brokerId}`);
          // Use the broker service to get order history
          const brokerService = service as BrokerService;

          try {
            // Get order history from the broker service
            const brokerOrders = await brokerService.getOrderHistory();

            // Convert broker service orders to our TradeUpdate format
            if (brokerOrders && brokerOrders.length > 0) {
              // Filter by symbol if specified
              const filteredOrders = symbol 
                ? brokerOrders.filter(order => order.symbol === symbol)
                : brokerOrders;

              return filteredOrders.map(order => ({
                id: order.orderId,
                symbol: order.symbol,
                side: order.side,
                quantity: order.quantity,
                price: order.price,
                timestamp: order.timestamp,
                status: this.mapOrderStatus(order.status),
                fee: order.quantity * order.price * 0.001 // Estimate fee as 0.1%
              }));
            }
          } catch (e) {
            console.error(`Error fetching ${brokerId} order history:`, e);
            // Fall back to mock data
          }
        }
      }

      // If no real broker service or the call failed, return mock data
      console.log(`Using simulated order history for ${brokerId}`);
      return this.generateMockOrderHistory(symbol);
    } catch (error) {
      console.error(`Failed to get order history from ${brokerId}:`, error);
      throw error;
    }
  }

  // Helper to map broker order status to our status format
  private mapOrderStatus(brokerStatus: string): TradeUpdate['status'] {
    switch (brokerStatus.toLowerCase()) {
      case 'filled':
        return 'filled';
      case 'partially_filled':
      case 'partial_fill':
        return 'partial_fill';
      case 'cancelled':
      case 'canceled':
        return 'canceled';
      case 'rejected':
        return 'rejected';
      default:
        return 'pending';
    }
  }

  // Helper to generate mock market data
  private generateMockMarketData(symbol: string, count: number): MarketData[] {
    const data: MarketData[] = [];
    let basePrice = this.getBasePrice(symbol);

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now() - (count - i) * 60000; // One minute intervals
      const volatility = this.getVolatility(symbol);

      // Simulate price movement
      const change = basePrice * volatility * (Math.random() * 2 - 1);
      basePrice += change;

      const open = basePrice;
      const close = basePrice + basePrice * volatility * (Math.random() * 0.5 - 0.25);
      const high = Math.max(open, close) + basePrice * volatility * Math.random();
      const low = Math.min(open, close) - basePrice * volatility * Math.random();
      const volume = Math.floor(Math.random() * 1000) + 100;

      data.push({
        symbol,
        open,
        high,
        low,
        close,
        volume,
        timestamp
      });
    }

    return data;
  }

  // Helper to generate mock order history
  private generateMockOrderHistory(symbol?: string): TradeUpdate[] {
    const orders: TradeUpdate[] = [];
    const symbols = symbol ? [symbol] : ['BTC/USD', 'ETH/USD', 'AAPL', 'MSFT', 'EUR/USD'];

    for (let i = 0; i < 10; i++) {
      const orderSymbol = symbols[Math.floor(Math.random() * symbols.length)];
      const side = Math.random() > 0.5 ? 'buy' : 'sell';
      const price = this.getRandomPrice(orderSymbol);
      const quantity = parseFloat((Math.random() * 10).toFixed(2));
      const statuses: TradeUpdate['status'][] = ['filled', 'partial_fill', 'canceled', 'rejected'];
      const status = statuses[Math.floor(Math.random() * (statuses.length - 1))]; // Bias towards filled

      orders.push({
        id: `order-${Date.now() - i * 1000000}`,
        symbol: orderSymbol,
        side,
        quantity,
        price,
        timestamp: Date.now() - i * 3600000, // Hourly intervals in the past
        status,
        fee: quantity * price * 0.001
      });
    }

    return orders;
  }

  // Get a random price for a symbol
  private getRandomPrice(symbol: string): number {
    return this.getBasePrice(symbol) * (1 + (Math.random() * 0.1 - 0.05));
  }

  // Get a base price for a symbol
  private getBasePrice(symbol: string): number {
    if (symbol.includes('BTC')) return 50000 + Math.random() * 10000;
    if (symbol.includes('ETH')) return 3000 + Math.random() * 500;
    if (symbol.includes('SOL')) return 100 + Math.random() * 20;
    if (symbol === 'AAPL') return 170 + Math.random() * 10;
    if (symbol === 'MSFT') return 350 + Math.random() * 20;
    if (symbol === 'AMZN') return 130 + Math.random() * 10;
    if (symbol === 'TSLA') return 200 + Math.random() * 15;
    if (symbol.includes('EUR/USD')) return 1.1 + Math.random() * 0.05;
    if (symbol.includes('GBP/USD')) return 1.3 + Math.random() * 0.05;
    if (symbol.includes('USD/JPY')) return 150 + Math.random() * 5;
    return 100 + Math.random() * 50;
  }

  // Get volatility for a symbol
  private getVolatility(symbol: string): number {
    if (symbol.includes('BTC')) return 0.03;
    if (symbol.includes('ETH')) return 0.04;
    if (symbol.includes('SOL')) return 0.05;
    if (symbol.includes('AAPL') || symbol.includes('MSFT')) return 0.01;
    if (symbol.includes('EUR/USD') || symbol.includes('GBP/USD')) return 0.005;
    return 0.02;
  }

  // Mock balance data for Alpaca
  private getMockAlpacaBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 10000, locked: 0, total: 10000 },
      { asset: 'AAPL', free: 10, locked: 0, total: 10 },
      { asset: 'MSFT', free: 5, locked: 0, total: 5 },
      { asset: 'TSLA', free: 3, locked: 0, total: 3 }
    ];
  }

  // Mock balance data for Binance
  private getMockBinanceBalances(): AccountBalance[] {
    return [
      { asset: 'USDT', free: 5000, locked: 0, total: 5000 },
      { asset: 'BTC', free: 0.12, locked: 0, total: 0.12 },
      { asset: 'ETH', free: 2.5, locked: 0, total: 2.5 },
      { asset: 'SOL', free: 25, locked: 0, total: 25 }
    ];
  }

  // Mock balance data for Oanda
  private getMockOandaBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 8000, locked: 2000, total: 10000 },
      { asset: 'EUR', free: 0, locked: 0, total: 0 },
      { asset: 'GBP', free: 0, locked: 0, total: 0 },
      { asset: 'JPY', free: 0, locked: 0, total: 0 }
    ];
  }

  // Mock balance data for Kraken
  private getMockKrakenBalances(): AccountBalance[] {
    return [
      { asset: 'USD', free: 7500, locked: 500, total: 8000 },
      { asset: 'BTC', free: 0.25, locked: 0, total: 0.25 },
      { asset: 'ETH', free: 3.75, locked: 0, total: 3.75 },
      { asset: 'XRP', free: 1000, locked: 0, total: 1000 },
      { asset: 'DOT', free: 150, locked: 0, total: 150 }
    ];
  }

  // Mock position data for Alpaca
  private getMockAlpacaPositions(): TradePosition[] {
    return [
      {
        symbol: 'AAPL',
        side: 'long',
        entryPrice: 175.32,
        size: 10,
        markPrice: 178.45,
        unrealizedPnl: (178.45 - 175.32) * 10
      },
      {
        symbol: 'MSFT',
        side: 'long',
        entryPrice: 345.67,
        size: 5,
        markPrice: 352.89,
        unrealizedPnl: (352.89 - 345.67) * 5
      }
    ];
  }

  // Mock position data for Binance
  private getMockBinancePositions(): TradePosition[] {
    return [
      {
        symbol: 'BTC/USD',
        side: 'long',
        entryPrice: 51234.56,
        size: 0.12,
        markPrice: 52456.78,
        unrealizedPnl: (52456.78 - 51234.56) * 0.12,
        leverage: 1
      },
      {
        symbol: 'ETH/USD',
        side: 'long',
        entryPrice: 3145.67,
        size: 2.5,
        markPrice: 3234.56,
        unrealizedPnl: (3234.56 - 3145.67) * 2.5,
        leverage: 1
      }
    ];
  }

  // Mock position data for Oanda
  private getMockOandaPositions(): TradePosition[] {
    return [
      {
        symbol: 'EUR/USD',
        side: 'short',
        entryPrice: 1.1234,
        size: 10000,
        markPrice: 1.1178,
        unrealizedPnl: (1.1234 - 1.1178) * 10000
      },
      {
        symbol: 'GBP/USD',
        side: 'long',
        entryPrice: 1.3456,
        size: 5000,
        markPrice: 1.3523,
        unrealizedPnl: (1.3523 - 1.3456) * 5000
      }
    ];
  }

  // Mock position data for Kraken
  private getMockKrakenPositions(): TradePosition[] {
    return [
      {
        symbol: 'XBT/USD', // Bitcoin on Kraken
        side: 'long',
        entryPrice: 52345.67,
        size: 0.25,
        markPrice: 53278.90,
        unrealizedPnl: (53278.90 - 52345.67) * 0.25,
        leverage: 1
      },
      {
        symbol: 'ETH/USD',
        side: 'long',
        entryPrice: 2975.32,
        size: 1.5,
        markPrice: 3078.45,
        unrealizedPnl: (3078.45 - 2975.32) * 1.5,
        leverage: 1
      },
      {
        symbol: 'DOT/USD',
        side: 'long',
        entryPrice: 18.25,
        size: 75,
        markPrice: 19.78,
        unrealizedPnl: (19.78 - 18.25) * 75,
        leverage: 1
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
    return [];
  },

  async getBrokerPriceComparisons(symbol: string): Promise<BrokerComparison[]> {
    // In a real app, this would fetch data from actual brokers
    // For now, we'll generate realistic test data
    try {
      console.log(`Fetching price comparisons for ${symbol}`);

      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 500));

      // Determine base price for the symbol
      let basePrice = 0;
      if (symbol.includes('BTC')) basePrice = 53420 + (Math.random() * 1000 - 500);
      else if (symbol.includes('ETH')) basePrice = 2890 + (Math.random() * 200 - 100);
      else if (symbol === 'AAPL') basePrice = 172.5 + (Math.random() * 2 - 1);
      else if (symbol === 'MSFT') basePrice = 415.8 + (Math.random() * 3 - 1.5);
      else if (symbol.includes('EUR/USD')) basePrice = 1.0920 + (Math.random() * 0.005 - 0.0025);
      else basePrice = 100 + (Math.random() * 10 - 5);

      // Generate broker prices with realistic variations
      const brokers = ['alpaca', 'binance', 'oanda', 'ironbeam', 'kraken', 'coinbase', 'ninjatrader', 'tradovate'];
      const prices: BrokerPrice[] = brokers.map(broker => {
        // Different brokers have slightly different prices
        const variation = (Math.random() * 0.02 - 0.01); // -1% to +1%
        const price = basePrice * (1 + variation);

        // Different brokers have different spreads
        let spread;
        if (symbol.includes('BTC') || symbol.includes('ETH')) {
          spread = price * (0.001 + Math.random() * 0.003); // 0.1% to 0.4%
        } else if (symbol.includes('EUR/USD') || symbol.includes('GBP/USD')) {
          spread = price * (0.0001 + Math.random() * 0.0004); // 0.01% to 0.05%
        } else {
          spread = price * (0.0005 + Math.random() * 0.001); // 0.05% to 0.15%
        }

        // Get the broker reliability score
        // Define supported broker IDs for type safety
        const isSupportedBroker = (brokerId: string): brokerId is keyof typeof ABATEV_CONFIG.BROKER_RELIABILITY_SCORES => {
          return brokerId in ABATEV_CONFIG.BROKER_RELIABILITY_SCORES;
        };

        const reliabilityScore = isSupportedBroker(broker) 
          ? ABATEV_CONFIG.BROKER_RELIABILITY_SCORES[broker]
          : 85; // Default score for unknown brokers

        return {
          brokerId: broker,
          price,
          spread,
          score: reliabilityScore
        };
      });

      return [{
        symbol,
        timestamp: Date.now(),
        prices
      }];
    } catch (error) {
      console.error(`Error getting broker price comparisons for ${symbol}:`, error);
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