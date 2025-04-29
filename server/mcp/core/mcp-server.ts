/**
 * MCP Server - Core Module
 * 
 * The Message Control Plane (MCP) server acts as a central message bus and processing
 * hub for all trading-related activities in the Trade Hybrid platform.
 * 
 * This module provides the core server functionality, managing message queues,
 * processors, and state synchronization.
 */

import { EventEmitter } from 'events';
import { MCPConfig, MCPMessageType, MCPPriority } from '../config/mcp-config';
import { createQueue, MCPQueue } from '../queues/queue-manager';

export interface MCPMessage {
  id: string;
  type: MCPMessageType;
  priority: MCPPriority;
  payload: any;
  timestamp: number;
  source?: string;
  target?: string;
  metadata?: Record<string, any>;
}

export class MCPServer extends EventEmitter {
  private static instance: MCPServer;
  private queues: Map<string, MCPQueue> = new Map();
  private processors: Map<string, Function> = new Map();
  private running: boolean = false;
  private lastMessageId: number = 0;
  
  // Global state storage
  private signalState: Map<string, any> = new Map();
  private userState: Map<string, any> = new Map();
  private marketState: Map<string, any> = new Map();
  
  private constructor() {
    super();
    this.initializeQueues();
  }
  
  /**
   * Get the singleton instance of the MCP server
   */
  public static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }
  
  /**
   * Initialize all message queues
   */
  private initializeQueues(): void {
    // Create a queue for each configured queue type
    for (const [queueType, queueConfig] of Object.entries(MCPConfig.queues)) {
      const queue = createQueue(queueConfig.name, queueConfig.maxSize);
      this.queues.set(queueConfig.name, queue);
      console.log(`Initialized MCP queue: ${queueConfig.name}`);
    }
  }
  
  /**
   * Start the MCP server
   */
  public start(): void {
    if (this.running) {
      console.log('MCP server is already running');
      return;
    }
    
    this.running = true;
    console.log('Starting MCP server...');
    
    // Start queue processors
    for (const [queueName, queueConfig] of Object.entries(MCPConfig.queues)) {
      this.startQueueProcessor(queueName, queueConfig.processingInterval);
    }
    
    // Start state persistence
    this.startStatePersistence();
    
    console.log('MCP server started successfully');
    this.emit('started');
  }
  
  /**
   * Stop the MCP server
   */
  public stop(): void {
    if (!this.running) {
      console.log('MCP server is not running');
      return;
    }
    
    this.running = false;
    console.log('Stopping MCP server...');
    
    // Perform cleanup...
    
    console.log('MCP server stopped successfully');
    this.emit('stopped');
  }
  
  /**
   * Publish a message to a specific queue
   */
  public publish(queueName: string, message: Omit<MCPMessage, 'id' | 'timestamp'>): string {
    const queue = this.queues.get(queueName);
    if (!queue) {
      console.error(`Queue not found: ${queueName}`);
      return '';
    }
    
    const id = this.generateMessageId();
    const fullMessage: MCPMessage = {
      ...message,
      id,
      timestamp: Date.now()
    };
    
    queue.enqueue(fullMessage);
    this.emit('message_published', { queueName, message: fullMessage });
    
    return id;
  }
  
  /**
   * Register a processor function for a specific message type
   */
  public registerProcessor(messageType: MCPMessageType, processor: Function): void {
    this.processors.set(messageType, processor);
    console.log(`Registered processor for message type: ${messageType}`);
  }
  
  /**
   * Start a queue processor
   */
  private startQueueProcessor(queueName: string, interval: number): void {
    const queue = this.queues.get(queueName);
    if (!queue) {
      console.error(`Cannot start processor for unknown queue: ${queueName}`);
      return;
    }
    
    console.log(`Starting processor for queue: ${queueName}`);
    
    const processInterval = setInterval(() => {
      if (!this.running) {
        clearInterval(processInterval);
        return;
      }
      
      const message = queue.dequeue();
      if (message) {
        this.processMessage(message).catch(err => {
          console.error(`Error processing message ${message.id}:`, err);
          // Could implement retry logic here
        });
      }
    }, interval);
  }
  
  /**
   * Process a single message
   */
  private async processMessage(message: MCPMessage): Promise<void> {
    const processor = this.processors.get(message.type);
    if (!processor) {
      console.warn(`No processor registered for message type: ${message.type}`);
      return;
    }
    
    try {
      const result = await processor(message);
      this.emit('message_processed', { message, result });
    } catch (error) {
      console.error(`Error in processor for ${message.type}:`, error);
      this.emit('message_processing_error', { message, error });
      throw error;
    }
  }
  
  /**
   * Start the state persistence timers
   */
  private startStatePersistence(): void {
    // Persist signal state
    setInterval(() => {
      if (!this.running) return;
      this.persistSignalState();
    }, MCPConfig.persistence.signalStateInterval);
    
    // Persist user state
    setInterval(() => {
      if (!this.running) return;
      this.persistUserState();
    }, MCPConfig.persistence.userStateInterval);
    
    // Sync with database
    setInterval(() => {
      if (!this.running) return;
      this.syncWithDatabase();
    }, MCPConfig.persistence.databaseSyncInterval);
  }
  
  /**
   * Persist signal state to database
   */
  private persistSignalState(): void {
    console.log(`Persisting signal state for ${this.signalState.size} signals`);
    // Implementation will connect to storage module
  }
  
  /**
   * Persist user state to database
   */
  private persistUserState(): void {
    console.log(`Persisting user state for ${this.userState.size} users`);
    // Implementation will connect to storage module
  }
  
  /**
   * Sync with database for any external changes
   */
  private syncWithDatabase(): void {
    console.log('Syncing MCP state with database');
    // Implementation will connect to storage module
  }
  
  /**
   * Generate a unique message ID
   */
  private generateMessageId(): string {
    this.lastMessageId++;
    return `msg_${Date.now()}_${this.lastMessageId}`;
  }
  
  /**
   * Update signal state
   */
  public updateSignalState(signalId: string, state: any): void {
    this.signalState.set(signalId, {
      ...this.signalState.get(signalId),
      ...state,
      lastUpdated: Date.now()
    });
  }
  
  /**
   * Get signal state
   */
  public getSignalState(signalId: string): any {
    return this.signalState.get(signalId);
  }
  
  /**
   * Update user state
   */
  public updateUserState(userId: string, state: any): void {
    this.userState.set(userId, {
      ...this.userState.get(userId),
      ...state,
      lastUpdated: Date.now()
    });
  }
  
  /**
   * Get user state
   */
  public getUserState(userId: string): any {
    return this.userState.get(userId);
  }
  
  /**
   * Update market state
   */
  public updateMarketState(symbol: string, state: any): void {
    this.marketState.set(symbol, {
      ...this.marketState.get(symbol),
      ...state,
      lastUpdated: Date.now()
    });
  }
  
  /**
   * Get market state
   */
  public getMarketState(symbol: string): any {
    return this.marketState.get(symbol);
  }
  
  /**
   * Get all signals in a particular state
   */
  public getSignalsByState(state: string): any[] {
    const results: any[] = [];
    this.signalState.forEach((signal) => {
      if (signal.status === state) {
        results.push(signal);
      }
    });
    return results;
  }
  
  /**
   * Get server status information
   */
  public getStatus(): any {
    const queueStats: Record<string, any> = {};
    
    this.queues.forEach((queue, name) => {
      queueStats[name] = {
        size: queue.size(),
        maxSize: queue.getMaxSize()
      };
    });
    
    return {
      running: this.running,
      queues: queueStats,
      signals: this.signalState.size,
      users: this.userState.size,
      markets: this.marketState.size,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    };
  }
}