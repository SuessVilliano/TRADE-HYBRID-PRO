/**
 * Processor Manager for MCP Server
 * 
 * Manages all message processors that handle different types of messages
 * in the MCP server. Coordinates the processing of messages from various queues.
 */

import { EventEmitter } from 'events';
import { MCPMessage } from '../core/mcp-server';
import { MCPMessageType, MCPConfig } from '../config/mcp-config';

// Processor function type
type ProcessorFunction = (message: MCPMessage) => Promise<any>;

/**
 * Processor Manager class
 */
export class ProcessorManager {
  private processors: Map<MCPMessageType, ProcessorFunction[]> = new Map();
  private eventEmitter: EventEmitter;
  private mcpServer: any; // Reference to the MCP server instance
  private isRunning: boolean = false;
  
  constructor(eventEmitter: EventEmitter, mcpServer: any) {
    this.eventEmitter = eventEmitter;
    this.mcpServer = mcpServer;
    
    // Listen for message events
    this.eventEmitter.on('message_queued', (data: { queueName: string, message: MCPMessage }) => {
      this.processQueuedMessage(data.queueName, data.message);
    });
  }
  
  /**
   * Register a processor for a specific message type
   */
  public registerProcessor(messageType: MCPMessageType, processor: ProcessorFunction): void {
    let processors = this.processors.get(messageType) || [];
    processors.push(processor);
    this.processors.set(messageType, processors);
    
    console.log(`Registered processor for message type: ${messageType}`);
  }
  
  /**
   * Process a message from a queue
   */
  private async processQueuedMessage(queueName: string, message: MCPMessage): Promise<void> {
    if (!this.isRunning) {
      console.log(`Processor manager is not running, ignoring message: ${message.id}`);
      return;
    }
    
    const processors = this.processors.get(message.type);
    if (!processors || processors.length === 0) {
      console.warn(`No processors registered for message type: ${message.type}`);
      return;
    }
    
    console.log(`Processing message ${message.id} of type ${message.type} from queue ${queueName}`);
    
    try {
      // Get processor timeout from configuration
      const processorConfig = MCPConfig.processors[queueName.split('-')[0]];
      const timeout = processorConfig?.timeout || 10000; // Default 10 seconds
      
      // Process with all registered processors
      for (const processor of processors) {
        // Use Promise.race to implement timeout
        try {
          const result = await Promise.race([
            processor(message),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error(`Processing timed out after ${timeout}ms`)), timeout)
            )
          ]);
          
          // Emit successful processing event
          this.eventEmitter.emit('message_processed', {
            queueName,
            messageId: message.id,
            result
          });
          
        } catch (error) {
          console.error(`Error processing message ${message.id} with processor:`, error);
          
          // Emit processing error event
          this.eventEmitter.emit('message_processing_error', {
            queueName,
            messageId: message.id,
            error
          });
        }
      }
    } catch (error) {
      console.error(`Error processing message ${message.id}:`, error);
    }
  }
  
  /**
   * Start the processor manager
   */
  public start(): void {
    this.isRunning = true;
    console.log('Processor manager started');
    this.eventEmitter.emit('processor_manager_started');
  }
  
  /**
   * Stop the processor manager
   */
  public stop(): void {
    this.isRunning = false;
    console.log('Processor manager stopped');
    this.eventEmitter.emit('processor_manager_stopped');
  }
  
  /**
   * Shutdown the processor manager
   */
  public shutdown(): void {
    this.stop();
    this.processors.clear();
    console.log('Processor manager shut down');
  }
}