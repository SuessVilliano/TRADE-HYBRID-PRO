/**
 * Smart Signal Router
 * 
 * Proprietary component that intelligently routes trading signals to the most appropriate
 * broker based on asset type, user preferences, and broker capabilities.
 */

import { MCPServer } from '../core/mcp-server';
import { BrokerConnection } from '../adapters/broker-interface';
import { TradeSignal, SignalExecutionStrategy } from '../types/trade-signal';

export class SmartSignalRouter {
  private static instance: SmartSignalRouter;
  private mcp: MCPServer;
  private brokerCapabilities: Map<string, BrokerCapability> = new Map();
  private userPreferences: Map<string, UserBrokerPreference[]> = new Map();
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    console.log('Smart Signal Router initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): SmartSignalRouter {
    if (!SmartSignalRouter.instance) {
      SmartSignalRouter.instance = new SmartSignalRouter(mcp);
    }
    return SmartSignalRouter.instance;
  }
  
  /**
   * Initialize the router
   */
  public async initialize(): Promise<void> {
    // Load broker capabilities
    await this.loadBrokerCapabilities();
    
    // Load user preferences (from database)
    await this.loadUserPreferences();
    
    console.log('Smart Signal Router initialized with capabilities for', 
      this.brokerCapabilities.size, 'brokers and preferences for',
      this.userPreferences.size, 'users');
  }
  
  /**
   * Route a signal to the appropriate broker(s)
   */
  public async routeSignal(
    signal: TradeSignal, 
    userId: string,
    strategy: SignalExecutionStrategy = 'auto'
  ): Promise<RoutingResult> {
    console.log(`Routing signal ${signal.id} for user ${userId} with strategy ${strategy}`);
    
    // Get broker service
    const brokerService = this.mcp.brokerConnectionService;
    if (!brokerService) {
      throw new Error('Broker connection service not available');
    }
    
    // Get available brokers for this user
    const brokers = await this.getAvailableBrokersForUser(userId);
    if (brokers.length === 0) {
      throw new Error(`No available brokers for user ${userId}`);
    }
    
    // Get user preferences
    const preferences = this.userPreferences.get(userId) || [];
    
    // Determine the best broker based on signal and preferences
    let targetBrokers: string[] = [];
    
    if (strategy === 'all') {
      // Send to all available brokers
      targetBrokers = brokers.map(b => b.id);
    } else if (strategy === 'primary') {
      // Use the primary broker only
      const primaryBroker = preferences.find(p => p.isPrimary)?.brokerId ||
                          brokers[0].id;
      targetBrokers = [primaryBroker];
    } else if (strategy === 'specific' && signal.targetBroker) {
      // Use the specified broker if available
      if (brokers.some(b => b.id === signal.targetBroker)) {
        targetBrokers = [signal.targetBroker];
      } else {
        throw new Error(`Specified broker ${signal.targetBroker} not available for user ${userId}`);
      }
    } else {
      // Auto-select the best broker based on signal characteristics
      targetBrokers = await this.selectBestBrokersForSignal(signal, brokers, preferences);
    }
    
    // Route to the selected brokers
    const results: BrokerRoutingResult[] = [];
    
    for (const brokerId of targetBrokers) {
      try {
        // Get broker
        const broker = brokerService.getBroker(brokerId);
        if (!broker) {
          results.push({
            brokerId,
            success: false,
            error: `Broker ${brokerId} not found`
          });
          continue;
        }
        
        // Submit order
        const orderResult = await broker.submitOrder({
          symbol: signal.symbol,
          quantity: signal.quantity || 1,
          side: signal.type === 'buy' ? 'buy' : 'sell',
          type: 'market',
          takeProfit: signal.takeProfit,
          stopLoss: signal.stopLoss
        });
        
        results.push({
          brokerId,
          success: true,
          orderId: orderResult.orderId,
          status: orderResult.status
        });
      } catch (error) {
        results.push({
          brokerId,
          success: false,
          error: error instanceof Error ? error.message : String(error)
        });
      }
    }
    
    return {
      signal: signal.id,
      userId,
      strategy,
      targetBrokers,
      results
    };
  }
  
  /**
   * Select the best brokers for a specific signal
   */
  private async selectBestBrokersForSignal(
    signal: TradeSignal,
    availableBrokers: BrokerInfo[],
    preferences: UserBrokerPreference[]
  ): Promise<string[]> {
    // Extract the asset class from the symbol
    const assetClass = this.getAssetClassFromSymbol(signal.symbol);
    
    // Score each broker based on capability match + user preference
    const scoredBrokers = availableBrokers.map(broker => {
      const capability = this.brokerCapabilities.get(broker.id);
      const preference = preferences.find(p => p.brokerId === broker.id);
      
      let score = 0;
      
      // Capability score
      if (capability) {
        // Asset class support
        if (capability.supportedAssetClasses.includes(assetClass)) {
          score += 30;
        }
        
        // Execution quality
        score += capability.executionSpeed * 10;
        
        // Commission (lower is better)
        score += (10 - capability.commission) * 2;
        
        // Reliability (higher is better)
        score += capability.reliability * 10;
      }
      
      // Preference score
      if (preference) {
        // Primary preference
        if (preference.isPrimary) {
          score += 50;
        }
        
        // Asset class preference
        if (preference.preferredAssetClasses.includes(assetClass)) {
          score += 20;
        }
        
        // User rating
        score += preference.userRating * 5;
      }
      
      return {
        id: broker.id,
        score
      };
    });
    
    // Sort by score
    scoredBrokers.sort((a, b) => b.score - a.score);
    
    // Return the top broker
    return scoredBrokers.length > 0 ? [scoredBrokers[0].id] : [];
  }
  
  /**
   * Load broker capabilities
   */
  private async loadBrokerCapabilities(): Promise<void> {
    const brokerService = this.mcp.brokerConnectionService;
    if (!brokerService) {
      console.error('Broker connection service not available');
      return;
    }
    
    const brokers = brokerService.getAllBrokers();
    for (const [id, broker] of brokers.entries()) {
      // Default capabilities based on broker type
      let capability: BrokerCapability = {
        supportedAssetClasses: [],
        executionSpeed: 5,
        commission: 5,
        reliability: 5
      };
      
      if (id.includes('alpaca')) {
        capability.supportedAssetClasses = ['Stocks', 'Crypto'];
        capability.executionSpeed = 8;
        capability.commission = 3;
        capability.reliability = 8;
      } else if (id.includes('tradehybrid')) {
        capability.supportedAssetClasses = ['Stocks', 'Crypto', 'Forex', 'Futures', 'Options'];
        capability.executionSpeed = 9;
        capability.commission = 2;
        capability.reliability = 9;
      } else if (id.includes('tradovate')) {
        capability.supportedAssetClasses = ['Futures'];
        capability.executionSpeed = 7;
        capability.commission = 4;
        capability.reliability = 7;
      } else if (id.includes('ninja')) {
        capability.supportedAssetClasses = ['Futures', 'Forex'];
        capability.executionSpeed = 8;
        capability.commission = 5;
        capability.reliability = 8;
      } else if (id.includes('ibkr')) {
        capability.supportedAssetClasses = ['Stocks', 'Options', 'Futures', 'Forex', 'Bonds'];
        capability.executionSpeed = 7;
        capability.commission = 4;
        capability.reliability = 9;
      } else if (id.includes('oanda')) {
        capability.supportedAssetClasses = ['Forex'];
        capability.executionSpeed = 8;
        capability.commission = 4;
        capability.reliability = 8;
      } else if (id.includes('binance')) {
        capability.supportedAssetClasses = ['Crypto'];
        capability.executionSpeed = 9;
        capability.commission = 2;
        capability.reliability = 7;
      } else if (id.includes('ctrader')) {
        capability.supportedAssetClasses = ['Forex'];
        capability.executionSpeed = 7;
        capability.commission = 5;
        capability.reliability = 7;
      } else if (id.includes('matchtrader')) {
        capability.supportedAssetClasses = ['Forex', 'Crypto'];
        capability.executionSpeed = 6;
        capability.commission = 6;
        capability.reliability = 6;
      } else if (id.includes('mt4') || id.includes('mt5')) {
        capability.supportedAssetClasses = ['Forex', 'Stocks', 'Crypto', 'Indices'];
        capability.executionSpeed = 6;
        capability.commission = 5;
        capability.reliability = 7;
      }
      
      this.brokerCapabilities.set(id, capability);
    }
  }
  
  /**
   * Load user preferences from database
   */
  private async loadUserPreferences(): Promise<void> {
    // TODO: Load from database
    // For now, just set up a default
    this.userPreferences.set('system', [
      {
        brokerId: 'tradehybrid_system',
        isPrimary: true,
        preferredAssetClasses: ['Crypto', 'Stocks', 'Forex'],
        userRating: 5
      },
      {
        brokerId: 'alpaca',
        isPrimary: false,
        preferredAssetClasses: ['Stocks'],
        userRating: 4
      }
    ]);
  }
  
  /**
   * Get a list of available brokers for a user
   */
  private async getAvailableBrokersForUser(userId: string): Promise<BrokerInfo[]> {
    const brokerService = this.mcp.brokerConnectionService;
    if (!brokerService) {
      return [];
    }
    
    const brokers = brokerService.getAllBrokers();
    const result: BrokerInfo[] = [];
    
    for (const [id, broker] of brokers.entries()) {
      try {
        const isConnected = broker.isConnected() || await broker.connect();
        if (isConnected) {
          result.push({
            id,
            name: broker.getName(),
            isConnected: true
          });
        }
      } catch (error) {
        console.error(`Error checking broker ${id} for user ${userId}:`, error);
      }
    }
    
    return result;
  }
  
  /**
   * Determine asset class from symbol
   */
  private getAssetClassFromSymbol(symbol: string): string {
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
    
    // Options
    if (symbol.includes(' ') && (symbol.includes('C') || symbol.includes('P')) && /\d{6}/.test(symbol)) {
      return 'Options';
    }
    
    // Default to stocks
    return 'Stocks';
  }
}

// Interface for broker capability
interface BrokerCapability {
  supportedAssetClasses: string[];
  executionSpeed: number; // 1-10 scale
  commission: number; // 1-10 scale (1 = lowest commission)
  reliability: number; // 1-10 scale
}

// Interface for user broker preference
interface UserBrokerPreference {
  brokerId: string;
  isPrimary: boolean;
  preferredAssetClasses: string[];
  userRating: number; // 1-5 scale
}

// Interface for broker info
interface BrokerInfo {
  id: string;
  name: string;
  isConnected: boolean;
}

// Interface for routing result
interface RoutingResult {
  signal: string;
  userId: string;
  strategy: SignalExecutionStrategy;
  targetBrokers: string[];
  results: BrokerRoutingResult[];
}

// Interface for broker routing result
interface BrokerRoutingResult {
  brokerId: string;
  success: boolean;
  orderId?: string;
  status?: string;
  error?: string;
}

/**
 * Initialize the smart signal router
 */
export function initializeSmartSignalRouter(mcp: MCPServer): SmartSignalRouter {
  const router = SmartSignalRouter.getInstance(mcp);
  router.initialize().catch(err => 
    console.error('Error initializing smart signal router:', err)
  );
  return router;
}