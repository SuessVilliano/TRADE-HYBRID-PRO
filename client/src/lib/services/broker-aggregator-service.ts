import { BrokerService, MarketData, AccountBalance, BrokerPosition, OrderHistory } from './broker-service';
import { IronBeamService } from './ironbeam-service';
import { AlpacaService } from './alpaca-service';
import { OandaService } from './oanda-service';
import { TradeStationService } from './tradestation-service';
import { IBKRService } from './ibkr-service';
import { BitfinexService } from './bitfinex-service';
import { ETradeService } from './etrade-service';

// Define the broker comparison result
export interface BrokerComparison {
  brokerId: string;
  brokerName: string;
  price: number;
  spread: number;
  latency: number;
  score: number;
  availableVolume: number;
  fees: number;
}

export interface TradeDetails {
  symbol: string;
  quantity: number;
  action: 'buy' | 'sell';
  orderType: 'market' | 'limit';
  limitPrice?: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  takeProfit3?: number;
}

// ABATEV System - AI-Driven Broker Aggregator and Trade Execution Validator
export class BrokerAggregatorService {
  private brokers: Map<string, BrokerService> = new Map();
  private connected: boolean = false;
  private latestMarketData: Map<string, Map<string, MarketData>> = new Map(); // symbol -> (brokerId -> data)
  private latencyData: Map<string, number> = new Map(); // brokerId -> latency in ms

  constructor() {
    // Initialize maps for different symbols
    ["BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "USDJPY", "AAPL", "TSLA", "MSFT", "AMZN", "GOOGL"].forEach(symbol => {
      this.latestMarketData.set(symbol, new Map());
    });
  }

  async addBroker(id: string, broker: BrokerService): Promise<void> {
    this.brokers.set(id, broker);
    this.latencyData.set(id, 0);
    console.log(`Added broker: ${id}`);
  }

  removeBroker(id: string): void {
    this.brokers.delete(id);
    this.latencyData.delete(id);
    console.log(`Removed broker: ${id}`);
  }

  async connect(): Promise<void> {
    console.log("Connecting to all brokers...");
    const connectionPromises = Array.from(this.brokers.entries()).map(async (entry) => {
      const id = entry[0];
      const broker = entry[1];
      try {
        const startTime = Date.now();
        await broker.connect();
        const endTime = Date.now();
        this.latencyData.set(id, endTime - startTime);
        console.log(`Connected to broker ${id} with latency ${endTime - startTime}ms`);
        return true;
      } catch (error) {
        console.error(`Failed to connect to broker ${id}:`, error);
        return false;
      }
    });

    const results = await Promise.all(connectionPromises);
    this.connected = results.some(result => result);
    
    if (!this.connected) {
      throw new Error("Failed to connect to any broker");
    }
    
    console.log("Connected to brokers");
  }

  async subscribeToMarketData(symbol: string): Promise<void> {
    if (!this.connected) {
      throw new Error("Not connected to any broker");
    }

    Array.from(this.brokers.entries()).forEach((entry) => {
      const id = entry[0];
      const broker = entry[1];
      broker.subscribeToMarketData(symbol, (data: MarketData) => {
        // Store the market data for comparison
        const symbolMap = this.latestMarketData.get(symbol);
        if (symbolMap) {
          symbolMap.set(id, data);
        }
        
        // Log the first few price updates
        console.log(`Received ${symbol} price from ${id}: ${data.price}`);
      });
    });
  }

  async unsubscribeFromMarketData(symbol: string): Promise<void> {
    Array.from(this.brokers.entries()).forEach((entry) => {
      const id = entry[0];
      const broker = entry[1];
      broker.unsubscribeFromMarketData(symbol);
    });
  }

  // Get a specific broker by ID
  getBroker(brokerId: string): BrokerService | undefined {
    return this.brokers.get(brokerId);
  }

  // Get all registered broker IDs
  getBrokerIds(): string[] {
    return Array.from(this.brokers.keys());
  }

  // ABATEV's core function - find the best broker for execution based on multiple factors
  findBestBrokerForExecution(symbol: string): BrokerComparison | null {
    const comparisons = this.getAllBrokerComparisons(symbol);
    return comparisons.length > 0 ? comparisons[0] : null;
  }
  
  // Get comparison data for all brokers for a specific symbol
  getAllBrokerComparisons(symbol: string): BrokerComparison[] {
    const symbolMap = this.latestMarketData.get(symbol);
    if (!symbolMap || symbolMap.size === 0) {
      return [];
    }

    const comparisons: BrokerComparison[] = [];

    Array.from(symbolMap.entries()).forEach((entry) => {
      const brokerId = entry[0];
      const data = entry[1];
      
      // Get broker details
      const broker = this.brokers.get(brokerId);
      if (!broker) return;

      // Get latency data
      const latency = this.latencyData.get(brokerId) || 100; // Default to 100ms if unknown

      // Calculate spread (simplified)
      const spread = 0.0002 * data.price; // Simulated spread as 0.02% of price

      // Simulate fees based on broker (adjusted to include new brokers)
      const fees = 
        brokerId === 'ironbeam' ? 0.001 : 
        brokerId === 'alpaca' ? 0.0008 : 
        brokerId === 'bitfinex' ? 0.002 :  // Higher fees for crypto exchange
        brokerId === 'etrade' ? 0.0005 :   // Competitive fees for retail broker
        0.0015; // Default fee for other brokers

      // Calculate combined score (lower is better)
      // This is a simplified version of what would be a more complex ML model in production
      // Weights: price 40%, spread 25%, latency 20%, fees 15%
      const priceWeight = 0.4;
      const spreadWeight = 0.25;
      const latencyWeight = 0.2;
      const feesWeight = 0.15;

      // Normalize values (simplified)
      const normalizedPrice = data.price;
      const normalizedSpread = spread;
      const normalizedLatency = latency / 100; // Convert to a 0-1 scale
      const normalizedFees = fees * 1000; // Convert to a 0-10 scale

      // Calculate score (lower is better)
      const score = (normalizedPrice * priceWeight) + 
                    (normalizedSpread * spreadWeight) + 
                    (normalizedLatency * latencyWeight) + 
                    (normalizedFees * feesWeight);

      comparisons.push({
        brokerId,
        brokerName: brokerId.charAt(0).toUpperCase() + brokerId.slice(1), // Capitalize first letter
        price: data.price,
        spread,
        latency,
        score,
        availableVolume: 100, // Simulated value
        fees: fees * 100 // Convert to percentage
      });
    });

    // Sort by score (lowest is best)
    comparisons.sort((a, b) => a.score - b.score);
    return comparisons;
  }

  // Execute trade using the optimal broker
  async executeTrade(details: TradeDetails): Promise<{ success: boolean; orderId?: string; broker?: string; error?: string }> {
    try {
      // Find the best broker for this symbol
      const bestBroker = this.findBestBrokerForExecution(details.symbol);
      if (!bestBroker) {
        return { 
          success: false, 
          error: `No broker available for ${details.symbol}` 
        };
      }

      console.log(`Selected broker for execution: ${bestBroker.brokerName} with price ${bestBroker.price}`);

      // Get the broker service
      const broker = this.brokers.get(bestBroker.brokerId);
      if (!broker) {
        return { 
          success: false, 
          error: `Selected broker ${bestBroker.brokerName} is no longer available` 
        };
      }

      // Execute the trade
      const orderId = await broker.placeOrder({
        symbol: details.symbol,
        side: details.action,
        quantity: details.quantity,
        type: details.orderType,
        limitPrice: details.limitPrice
      });

      return {
        success: true,
        orderId,
        broker: bestBroker.brokerName
      };
    } catch (error) {
      console.error('Error executing trade:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error executing trade'
      };
    }
  }

  // Factory method to create a pre-configured ABATEV system
  static async createDefault(): Promise<BrokerAggregatorService> {
    const aggregator = new BrokerAggregatorService();
    
    // For demo purposes - show all brokers as connected without needing real API keys
    const demoMode = true;
    
    if (demoMode) {
      console.log('Creating demo broker aggregator with simulated connections');
      
      // Add simulated brokers without real API credentials
      const ironbeam = new IronBeamService('demo_account', 'demo_password', true);
      await aggregator.addBroker('ironbeam', ironbeam);
      
      const alpaca = new AlpacaService('demo_key', 'demo_secret', true);
      await aggregator.addBroker('alpaca', alpaca);
      
      const oanda = new OandaService('demo_token', true);
      await aggregator.addBroker('oanda', oanda);
      
      const ibkr = new IBKRService('demo_username', 'demo_password', true);
      await aggregator.addBroker('ibkr', ibkr);
      
      const bitfinex = new BitfinexService('demo_key', 'demo_secret', true);
      await aggregator.addBroker('bitfinex', bitfinex);
      
      const etrade = new ETradeService(
        'demo_key',
        'demo_secret',
        'demo_token',
        'demo_token_secret',
        true
      );
      await aggregator.addBroker('etrade', etrade);
      
      // Simulate connection success without actually connecting to external APIs
      // This lets the trading functionality work in demo mode
      aggregator.connected = true;
      
      // Simulate market data for common symbols
      const symbols = ["BTCUSD", "ETHUSD", "EURUSD", "GBPUSD", "USDJPY", "AAPL", "TSLA", "MSFT", "AMZN", "GOOGL"];
      
      // Create simulated market data for each broker and symbol
      aggregator.brokers.forEach((broker, brokerId) => {
        // Set random latency between 20-100ms
        aggregator.latencyData.set(brokerId, Math.floor(Math.random() * 80) + 20);
        
        // Set random price variations across brokers
        symbols.forEach(symbol => {
          const basePrice = 
            symbol === "BTCUSD" ? 37250.50 :
            symbol === "ETHUSD" ? 2150.75 :
            symbol === "EURUSD" ? 1.0850 :
            symbol === "GBPUSD" ? 1.2750 :
            symbol === "USDJPY" ? 147.50 :
            symbol === "AAPL" ? 175.20 :
            symbol === "TSLA" ? 245.30 :
            symbol === "MSFT" ? 380.10 :
            symbol === "AMZN" ? 180.50 :
            symbol === "GOOGL" ? 150.75 : 100.00;
          
          // Add small variation to price for each broker (±0.5%)
          const priceVariation = basePrice * (0.995 + Math.random() * 0.01);
          
          const symbolMap = aggregator.latestMarketData.get(symbol);
          if (symbolMap) {
            symbolMap.set(brokerId, {
              symbol,
              price: priceVariation,
              bid: priceVariation * 0.999,
              ask: priceVariation * 1.001,
              volume: Math.floor(Math.random() * 1000) + 100,
              timestamp: Date.now()
            });
          }
        });
      });
      
      console.log('Demo broker aggregator created with simulated market data');
      return aggregator;
    }
    
    // Standard implementation for production with real API keys
    try {
      // Add IronBeam broker
      const ironbeam = new IronBeamService('51364392', '854911', true);
      await aggregator.addBroker('ironbeam', ironbeam);
      
      // Add Alpaca broker
      const alpaca = new AlpacaService('CKZEJOQW6JBDL1X8ISEH', 'CK9MIT1E1KNQ0MPTT3EF', true);
      await aggregator.addBroker('alpaca', alpaca);
      
      // Add OANDA broker
      // Note: Actual API token would be needed in production
      const oanda = new OandaService('70ae8130c7ee5daa27aa6b8ccaacbe7e-03b707a7a88079144d12d5e93c1a626e', true);
      await aggregator.addBroker('oanda', oanda);
      
      // Add TradeStation broker
      // Note: Actual client credentials would be needed in production
      const tradeStation = new TradeStationService('client_id', 'client_secret');
      await aggregator.addBroker('tradestation', tradeStation);
      
      // Add Interactive Brokers (IBKR) broker
      // Note: Actual credentials would be needed in production
      const ibkr = new IBKRService('username', 'password', true);
      await aggregator.addBroker('ibkr', ibkr);
      
      // Add Bitfinex broker (new!)
      // Note: Actual API key and secret would be needed in production
      const bitfinex = new BitfinexService('bitfinex_api_key', 'bitfinex_api_secret', true);
      await aggregator.addBroker('bitfinex', bitfinex);
      
      // Add E*TRADE broker (new!)
      // Note: E*TRADE requires OAuth tokens which would be provided in production
      const etrade = new ETradeService(
        'etrade_consumer_key',
        'etrade_consumer_secret',
        'etrade_access_token',
        'etrade_token_secret',
        true
      );
      await aggregator.addBroker('etrade', etrade);
      
      // Connect to all brokers
      await aggregator.connect();
      
      return aggregator;
    } catch (error) {
      console.error('Failed to create broker aggregator with real credentials, falling back to demo mode:', error);
      // Fall back to demo mode if real connections fail
      return this.createDefault();
    }
  }
}