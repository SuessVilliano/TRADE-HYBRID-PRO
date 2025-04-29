/**
 * Trade Execution Processor
 * 
 * Handles automatic trade execution across multiple broker platforms
 * based on incoming signals from the MCP system
 */

import { Queue } from '../queues/queue-manager';
import { db } from '../../../server/db';
import { users, copyTradeLogs } from '../../../shared/schema';
import { eq, and } from 'drizzle-orm';
import crypto from 'crypto';

// Import broker interfaces
// Note: These will need to be properly implemented for each broker
interface BrokerConnection {
  isConnected: () => boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  executeMarketOrder: (params: any) => Promise<any>;
  getAccountInfo: () => Promise<any>;
  getBrokerName: () => string;
}

/**
 * TradeExecutionProcessor
 * 
 * Processes trading signals and executes trades on connected broker platforms
 */
export class TradeExecutionProcessor {
  private queue: Queue;
  private brokerConnections: Map<string, BrokerConnection> = new Map();
  private activeTrades: Map<string, any> = new Map();
  private userTradeSettings: Map<string, any> = new Map();
  
  constructor(queue: Queue) {
    this.queue = queue;
    
    // Start processing loop
    this.startProcessingLoop();
    
    console.log('Trade Execution Processor initialized');
  }
  
  /**
   * Process a trade execution message
   */
  public async processMessage(message: any): Promise<void> {
    // Add to queue for processing
    this.queue.enqueue(message);
  }
  
  /**
   * Get processor ID
   */
  public getId(): string {
    return 'trade-execution';
  }
  
  /**
   * Register a broker connection
   */
  public registerBroker(brokerId: string, connection: BrokerConnection): void {
    this.brokerConnections.set(brokerId, connection);
    console.log(`Broker registered: ${brokerId}`);
  }
  
  /**
   * Get all registered brokers
   */
  public getBrokers(): string[] {
    return Array.from(this.brokerConnections.keys());
  }
  
  /**
   * Start the background processing loop
   */
  private startProcessingLoop(): void {
    setInterval(() => {
      this.processNextTrade()
        .catch(err => console.error('Error processing trade execution:', err));
    }, 100); // Process every 100ms
  }
  
  /**
   * Process the next trade in the queue
   */
  private async processNextTrade(): Promise<void> {
    const message = this.queue.dequeue();
    if (!message) return; // No messages to process
    
    try {
      // Process the trade execution
      await this.handleTradeExecution(message);
    } catch (error) {
      console.error('Error handling trade execution:', error);
      this.queue.recordError();
    }
  }
  
  /**
   * Handle a trade execution request
   */
  private async handleTradeExecution(execution: any): Promise<void> {
    console.log(`Processing trade execution for signal ${execution.signalId}`);
    
    try {
      // Get user settings for auto-trading
      const userId = execution.userId;
      const signal = execution.signal;
      
      // Check if we have cached user settings
      let userSettings = this.userTradeSettings.get(userId);
      
      // If not, load from database
      if (!userSettings) {
        userSettings = await this.loadUserTradeSettings(userId);
        this.userTradeSettings.set(userId, userSettings);
      }
      
      // Check if auto-trading is enabled for this user
      if (!userSettings || !userSettings.autoTradeEnabled) {
        console.log(`Auto-trading disabled for user ${userId}`);
        return;
      }
      
      // Check which brokers to use
      const enabledBrokers = userSettings.enabledBrokers || [];
      
      // Execute trades on all enabled brokers
      const executionResults = [];
      
      for (const brokerId of enabledBrokers) {
        const broker = this.brokerConnections.get(brokerId);
        
        if (!broker) {
          console.warn(`Broker ${brokerId} not found`);
          continue;
        }
        
        // Ensure broker is connected
        if (!broker.isConnected()) {
          try {
            const connected = await broker.connect();
            if (!connected) {
              console.error(`Failed to connect to broker ${brokerId}`);
              continue;
            }
          } catch (connectError) {
            console.error(`Error connecting to broker ${brokerId}:`, connectError);
            continue;
          }
        }
        
        // Calculate position size based on user risk settings
        const positionSize = this.calculatePositionSize(
          signal,
          userSettings.riskPercentage || 1,
          userSettings.maxPositionSize || 100,
          brokerId
        );
        
        if (positionSize <= 0) {
          console.warn(`Calculated position size is 0 or negative, skipping trade`);
          continue;
        }
        
        try {
          // Prepare order parameters
          const orderParams = {
            symbol: signal.symbol,
            side: signal.side,
            type: 'market',
            quantity: positionSize,
            stopLoss: signal.stopLoss,
            takeProfit: signal.takeProfit,
            metadata: {
              signalId: signal.id,
              userId: userId,
              provider: signal.providerId
            }
          };
          
          // Execute the trade
          console.log(`Executing ${signal.side} order for ${signal.symbol} on ${brokerId}, size: ${positionSize}`);
          const result = await broker.executeMarketOrder(orderParams);
          
          // Record the result
          executionResults.push({
            brokerId,
            result,
            timestamp: new Date().toISOString()
          });
          
          // Log the trade
          await this.logTradeExecution(userId, signal.id, 'executed', brokerId, result);
          
          console.log(`Order executed on ${brokerId}: ${JSON.stringify(result)}`);
        } catch (error) {
          console.error(`Error executing trade on broker ${brokerId}:`, error);
          
          // Log the failure
          await this.logTradeExecution(userId, signal.id, 'failed', brokerId, { 
            error: error instanceof Error ? error.message : String(error) 
          });
        }
      }
      
      // Update active trades
      this.activeTrades.set(signal.id, {
        signalId: signal.id,
        userId: userId,
        status: 'active',
        executions: executionResults,
        createdAt: new Date().toISOString()
      });
      
      console.log(`Trade execution completed for signal ${signal.id}`);
    } catch (error) {
      console.error('Error in trade execution process:', error);
    }
  }
  
  /**
   * Calculate position size based on user risk settings
   */
  private calculatePositionSize(signal: any, riskPercentage: number, maxPositionSize: number, brokerId: string): number {
    try {
      // Get account information to determine available balance
      const broker = this.brokerConnections.get(brokerId);
      if (!broker) return 0;
      
      // This would be a real API call to get account info in production
      // For now, we'll use a simulated account size
      const accountSize = 10000; // $10,000 USD
      
      // Calculate risk amount
      const riskAmount = accountSize * (riskPercentage / 100);
      
      // Calculate position size based on stop loss
      let positionSize = 0;
      
      if (signal.side === 'buy') {
        // For long positions
        const riskPerUnit = signal.entryPrice - signal.stopLoss;
        if (riskPerUnit <= 0) return 0; // Invalid stop loss
        
        positionSize = riskAmount / riskPerUnit;
      } else {
        // For short positions
        const riskPerUnit = signal.stopLoss - signal.entryPrice;
        if (riskPerUnit <= 0) return 0; // Invalid stop loss
        
        positionSize = riskAmount / riskPerUnit;
      }
      
      // Convert to appropriate units based on symbol
      // This would depend on the symbol and broker's requirements
      
      // Apply max position size constraint
      positionSize = Math.min(positionSize, maxPositionSize);
      
      // Round to appropriate precision
      // Different assets have different tick sizes
      if (signal.symbol.includes('BTC')) {
        positionSize = Math.round(positionSize * 1000) / 1000; // 0.001 BTC precision
      } else if (signal.symbol.includes('ETH')) {
        positionSize = Math.round(positionSize * 100) / 100; // 0.01 ETH precision
      } else {
        positionSize = Math.round(positionSize * 10) / 10; // 0.1 unit precision for other assets
      }
      
      return positionSize;
    } catch (error) {
      console.error('Error calculating position size:', error);
      return 0;
    }
  }
  
  /**
   * Load user trade settings from database
   */
  private async loadUserTradeSettings(userId: string): Promise<any> {
    try {
      // In a real implementation, we would load from a proper table
      // For now, use default settings
      
      // Default settings if none found
      return {
        autoTradeEnabled: false,
        riskPercentage: 1,
        maxPositionSize: 100,
        enabledBrokers: ['alpaca'],
        preferredTimeframes: ['5m', '15m', '1h']
      };
    } catch (error) {
      console.error('Error loading user trade settings:', error);
      return null;
    }
  }
  
  /**
   * Log trade execution to database
   */
  private async logTradeExecution(
    userId: string, 
    signalId: string, 
    status: string, 
    brokerId: string, 
    brokerResponse: any
  ): Promise<void> {
    try {
      // Insert into copyTradeLogs table
      await db.insert(copyTradeLogs).values({
        id: crypto.randomUUID(),
        userId: parseInt(userId),
        signalId: signalId,
        timestamp: new Date(),
        autoExecute: true,
        executionStatus: status,
        brokerResponse: brokerResponse
      });
      
      console.log(`Trade execution logged: ${status} for signal ${signalId} on ${brokerId}`);
    } catch (error) {
      console.error('Error logging trade execution:', error);
    }
  }
}

/**
 * Register trade execution processor with the MCP server
 */
export function registerTradeProcessor(mcp: any): void {
  console.log('[MCP] Registering trade execution processor');
  
  // Create a new processor if it doesn't exist
  let processor = mcp.getProcessor('trade-execution');
  
  if (!processor) {
    // Access the queue manager to get the appropriate queue
    const queueManager = mcp.queueManager;
    const queue = queueManager.getQueue('trades') || queueManager.createQueue('trades');
    
    // Create a new processor
    processor = new TradeExecutionProcessor(queue);
    
    // Register the processor with the MCP server
    mcp.processors.set('trade-execution', processor);
    
    console.log('[MCP] Trade execution processor created and registered');
  }
  
  console.log('[MCP] Trade execution processor registration complete');
}