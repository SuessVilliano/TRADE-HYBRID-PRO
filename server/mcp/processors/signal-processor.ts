import { Queue } from '../queues/queue-manager';
import { db, sql } from '../../../server/db';
import { tradeSignals } from '../../../shared/schema';
import { eq } from 'drizzle-orm';

/**
 * SignalProcessor
 * 
 * Processes trading signals from various sources
 */
export class SignalProcessor {
  private queue: Queue;
  private activeSignals: Map<string, any> = new Map();
  
  constructor(queue: Queue) {
    this.queue = queue;
    
    // Start processing loop
    this.startProcessingLoop();
    
    console.log('Signal Processor initialized');
  }
  
  /**
   * Process a trading signal message
   */
  public async processMessage(message: any): Promise<void> {
    // Add to queue for processing
    this.queue.enqueue(message);
  }
  
  /**
   * Start the background processing loop
   */
  private startProcessingLoop(): void {
    setInterval(() => {
      this.processNextSignal()
        .catch(err => console.error('Error processing signal:', err));
    }, 100); // Process every 100ms
  }
  
  /**
   * Process the next signal in the queue
   */
  private async processNextSignal(): Promise<void> {
    const message = this.queue.dequeue();
    if (!message) return; // No messages to process
    
    try {
      // Process the signal
      await this.handleSignal(message);
    } catch (error) {
      console.error('Error handling signal:', error);
      this.queue.recordError();
    }
  }
  
  /**
   * Handle a trading signal
   */
  private async handleSignal(signal: any): Promise<void> {
    console.log(`Processing signal ${signal.id} for ${signal.symbol}`);
    
    // Store in active signals
    this.activeSignals.set(signal.id, signal);
    
    try {
      // Save to database
      await this.saveSignalToDB(signal);
      
      // Broadcast signal to connected clients via WebSocket
      this.broadcastSignal(signal);
    } catch (error) {
      console.error('Error saving or broadcasting signal:', error);
    }
  }
  
  /**
   * Save a signal to the database
   */
  private async saveSignalToDB(signal: any): Promise<void> {
    try {
      // Insert into tradeSignals table
      await db.insert(tradeSignals).values({
        id: signal.id,
        providerId: signal.providerId,
        symbol: signal.symbol,
        side: signal.side,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        description: signal.description,
        timestamp: signal.timestamp,
        status: signal.status,
        metadata: signal.metadata
      });
      
      console.log(`Signal ${signal.id} saved to database`);
    } catch (error) {
      console.error('Error saving signal to database:', error);
      throw error;
    }
  }
  
  /**
   * Broadcast a signal to connected clients
   */
  private broadcastSignal(signal: any): void {
    // Import dynamically to avoid circular dependency
    const { MCPServer } = require('../core/mcp-server');
    const mcpServer = MCPServer.getInstance();
    
    // Create broadcast message
    const broadcastMessage = {
      type: 'trading_signal',
      data: {
        id: signal.id,
        providerId: signal.providerId,
        symbol: signal.symbol,
        side: signal.side,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit: signal.takeProfit,
        description: signal.description,
        timestamp: signal.timestamp,
        status: signal.status,
        marketType: signal.metadata?.market_type || 'unknown',
        timeframe: signal.metadata?.timeframe || 'unknown',
        providerName: signal.metadata?.provider_name || signal.providerId
      }
    };
    
    // Broadcast to all clients
    mcpServer.broadcastToAllClients(broadcastMessage);
    console.log(`Signal ${signal.id} broadcasted to all clients`);
  }
  
  /**
   * Update a signal's status
   */
  public async updateSignalStatus(
    signalId: string, 
    status: string, 
    pnl: number = 0
  ): Promise<boolean> {
    // Check if signal exists
    if (!this.activeSignals.has(signalId)) {
      console.log(`Signal ${signalId} not found in active signals`);
      
      // Try to load from database
      try {
        const signalFromDB = await db.select().from(tradeSignals).where(eq(tradeSignals.id, signalId)).limit(1);
        
        if (signalFromDB && signalFromDB.length > 0) {
          this.activeSignals.set(signalId, signalFromDB[0]);
        } else {
          console.log(`Signal ${signalId} not found in database`);
          return false;
        }
      } catch (error) {
        console.error('Error loading signal from database:', error);
        return false;
      }
    }
    
    // Get signal
    const signal = this.activeSignals.get(signalId);
    
    // Update signal status
    signal.status = status;
    
    // If signal is closed, calculate PnL
    if (status === 'closed' || status === 'tp_hit' || status === 'sl_hit') {
      signal.closedAt = new Date();
      signal.pnl = pnl;
      
      // For tp_hit and sl_hit, set appropriate close price
      if (status === 'tp_hit') {
        signal.closePrice = signal.takeProfit;
      } else if (status === 'sl_hit') {
        signal.closePrice = signal.stopLoss;
      }
    }
    
    // Update in database
    try {
      await db.update(tradeSignals)
        .set({
          status,
          pnl: pnl || null,
          closedAt: (status === 'closed' || status === 'tp_hit' || status === 'sl_hit') ? new Date() : null,
          closePrice: status === 'tp_hit' ? signal.takeProfit : (status === 'sl_hit' ? signal.stopLoss : null)
        })
        .where(eq(tradeSignals.id, signalId));
      
      console.log(`Signal ${signalId} status updated to ${status}`);
      
      // Broadcast status update
      this.broadcastStatusUpdate(signal);
      
      return true;
    } catch (error) {
      console.error('Error updating signal status in database:', error);
      return false;
    }
  }
  
  /**
   * Broadcast a status update to connected clients
   */
  private broadcastStatusUpdate(signal: any): void {
    // Import dynamically to avoid circular dependency
    const { MCPServer } = require('../core/mcp-server');
    const mcpServer = MCPServer.getInstance();
    
    // Create broadcast message
    const broadcastMessage = {
      type: 'signal_status_update',
      data: {
        id: signal.id,
        status: signal.status,
        pnl: signal.pnl,
        closedAt: signal.closedAt,
        closePrice: signal.closePrice
      }
    };
    
    // Broadcast to all clients
    mcpServer.broadcastToAllClients(broadcastMessage);
    console.log(`Signal ${signal.id} status update broadcasted to all clients`);
  }
  
  /**
   * Get all active signals
   */
  public getActiveSignals(): Map<string, any> {
    return this.activeSignals;
  }
  
  /**
   * Get a signal by ID
   */
  public getSignalById(id: string): any {
    return this.activeSignals.get(id);
  }
  
  /**
   * Load active signals from database
   */
  public async loadActiveSignalsFromDatabase(): Promise<void> {
    try {
      // Load active signals from database
      const activeSignalsFromDB = await db.select()
        .from(tradeSignals)
        .where(eq(tradeSignals.status, 'active'));
      
      // Add to active signals map
      for (const signal of activeSignalsFromDB) {
        this.activeSignals.set(signal.id, signal);
      }
      
      console.log(`Loaded ${activeSignalsFromDB.length} active signals from database`);
    } catch (error) {
      console.error('Error loading active signals from database:', error);
    }
  }
  
  /**
   * Persist all signal states to database
   */
  public async persistSignalsToDB(): Promise<void> {
    console.log(`Persisting signal state for ${this.activeSignals.size} signals`);
    
    // In a real implementation, we might selectively update only
    // signals that have changed since last persistence
    // For this implementation, we rely on the individual operations
    // to handle database persistence
  }
}