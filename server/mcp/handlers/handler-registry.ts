/**
 * Handler Registry for MCP Server
 * 
 * Centralizes all message handlers for different types of messages in the MCP system.
 */

import { MCPMessage } from '../core/mcp-server';
import { MCPMessageType, MCPPriority } from '../config/mcp-config';
import { QueueManager } from '../queues/queue-manager';
import * as SignalHandlers from './signal-handlers';

// Import other handler modules as needed

/**
 * Handler Registry class manages all message handlers
 */
export class HandlerRegistry {
  private queueManager: QueueManager;
  private handlers: Map<string, Function> = new Map();
  
  constructor(queueManager: QueueManager) {
    this.queueManager = queueManager;
    this.registerDefaultHandlers();
  }
  
  /**
   * Register default message handlers
   */
  private registerDefaultHandlers(): void {
    // Register signal handlers
    this.registerHandler(MCPMessageType.NEW_SIGNAL, SignalHandlers.handleNewSignal);
    this.registerHandler(MCPMessageType.UPDATE_SIGNAL, SignalHandlers.handleSignalUpdate);
    this.registerHandler(MCPMessageType.SIGNAL_ANALYZED, SignalHandlers.handleSignalAnalysis);
    
    // Register other handlers as needed
    
    console.log('[MCP] Default handlers registered');
  }
  
  /**
   * Register a handler for a specific message type
   */
  public registerHandler(messageType: string, handler: Function): void {
    this.handlers.set(messageType, handler);
    console.log(`[MCP] Registered handler for message type: ${messageType}`);
  }
  
  /**
   * Process a message using the appropriate handler
   */
  public async processMessage(clientId: string, message: any): Promise<void> {
    try {
      // Ensure the message has a type
      if (!message.type) {
        console.warn(`[MCP] Received message without type from client ${clientId}`);
        return;
      }
      
      console.log(`[MCP] Processing message of type: ${message.type} from client ${clientId}`);
      
      // Determine the appropriate queue for this message type
      const queueName = this.getQueueForMessageType(message.type);
      if (!queueName) {
        console.warn(`[MCP] No queue defined for message type: ${message.type}`);
        return;
      }
      
      // Convert to MCP message format
      const mcpMessage: MCPMessage = {
        id: `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        type: message.type as MCPMessageType,
        priority: this.getPriorityForMessageType(message.type),
        payload: message.data || {},
        timestamp: Date.now(),
        source: clientId,
        metadata: {
          clientId,
          originalType: message.type
        }
      };
      
      // Add to appropriate queue
      this.queueManager.addToQueue(queueName, mcpMessage);
      
      console.log(`[MCP] Message queued in ${queueName}`);
    } catch (error) {
      console.error(`[MCP] Error processing message:`, error);
    }
  }
  
  /**
   * Get the appropriate queue for a message type
   */
  private getQueueForMessageType(messageType: string): string {
    // Map message types to queue names
    if (messageType.includes('signal')) {
      return 'trading-signals';
    } else if (messageType.includes('market')) {
      return 'market-data';
    } else if (messageType.includes('user')) {
      return 'user-actions';
    } else if (messageType.includes('notification')) {
      return 'notifications';
    } else if (messageType.includes('analysis')) {
      return 'trade-analysis';
    }
    
    // Default queue
    return 'trading-signals';
  }
  
  /**
   * Get the priority for a message type
   */
  private getPriorityForMessageType(messageType: string): MCPPriority {
    // Set priorities based on message type
    if (messageType.includes('notification')) {
      return MCPPriority.HIGH;
    } else if (messageType.includes('market')) {
      return MCPPriority.HIGHEST;
    } else if (messageType.includes('user')) {
      return MCPPriority.MEDIUM;
    } else if (messageType.includes('analysis')) {
      return MCPPriority.LOW;
    }
    
    // Default priority
    return MCPPriority.MEDIUM;
  }
}