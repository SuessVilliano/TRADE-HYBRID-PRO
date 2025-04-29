/**
 * Queue Manager for MCP Server
 * 
 * Manages message queues for different types of messages in the MCP system.
 * Each queue operates independently and can have different processing strategies.
 */

import { EventEmitter } from 'events';
import { MCPMessage } from '../core/mcp-server';
import { MCPPriority } from '../config/mcp-config';

/**
 * Interface for a message queue
 */
export interface MCPQueue {
  /**
   * Add a message to the queue
   */
  enqueue(message: MCPMessage): void;
  
  /**
   * Get and remove the next message from the queue
   */
  dequeue(): MCPMessage | undefined;
  
  /**
   * Get the current size of the queue
   */
  size(): number;
  
  /**
   * Get the maximum size of the queue
   */
  getMaxSize(): number;
  
  /**
   * Clear all messages from the queue
   */
  clear(): void;
}

/**
 * Priority Queue implementation for MCP messages
 */
class PriorityQueue implements MCPQueue {
  private items: MCPMessage[] = [];
  private readonly maxSize: number;
  
  constructor(maxSize: number = 1000) {
    this.maxSize = maxSize;
  }
  
  enqueue(message: MCPMessage): void {
    // If the queue is full, remove the lowest priority message
    if (this.items.length >= this.maxSize) {
      // Find the lowest priority message (highest number)
      let lowestPriorityIndex = 0;
      let lowestPriority = this.items[0].priority;
      
      for (let i = 1; i < this.items.length; i++) {
        if (this.items[i].priority > lowestPriority) {
          lowestPriority = this.items[i].priority;
          lowestPriorityIndex = i;
        }
      }
      
      // If the new message has higher priority (lower number) than the lowest priority message,
      // remove the lowest priority message
      if (message.priority < lowestPriority) {
        this.items.splice(lowestPriorityIndex, 1);
      } else {
        // New message has lower priority, don't add it
        return;
      }
    }
    
    // Add the message to the queue
    this.items.push(message);
    
    // Sort the queue by priority (lower numbers first) and then by timestamp (older first)
    this.items.sort((a, b) => {
      if (a.priority !== b.priority) {
        return a.priority - b.priority;
      }
      return a.timestamp - b.timestamp;
    });
  }
  
  dequeue(): MCPMessage | undefined {
    return this.items.shift();
  }
  
  size(): number {
    return this.items.length;
  }
  
  getMaxSize(): number {
    return this.maxSize;
  }
  
  clear(): void {
    this.items = [];
  }
}

/**
 * Create a new queue
 */
export function createQueue(name: string, maxSize: number = 1000): MCPQueue {
  return new PriorityQueue(maxSize);
}

/**
 * Queue Manager class
 */
export class QueueManager {
  private queues: Map<string, MCPQueue> = new Map();
  private eventEmitter: EventEmitter;
  
  constructor(eventEmitter: EventEmitter) {
    this.eventEmitter = eventEmitter;
  }
  
  /**
   * Create a new queue
   */
  public createQueue(name: string, maxSize: number = 1000): void {
    if (this.queues.has(name)) {
      throw new Error(`Queue already exists: ${name}`);
    }
    
    const queue = createQueue(name, maxSize);
    this.queues.set(name, queue);
    
    this.eventEmitter.emit('queue_created', { name, maxSize });
  }
  
  /**
   * Get a queue by name
   */
  public getQueue(name: string): MCPQueue | undefined {
    return this.queues.get(name);
  }
  
  /**
   * Add a message to a queue
   */
  public addToQueue(queueName: string, message: MCPMessage): void {
    const queue = this.queues.get(queueName);
    if (!queue) {
      throw new Error(`Queue not found: ${queueName}`);
    }
    
    queue.enqueue(message);
    this.eventEmitter.emit('message_queued', { queueName, message });
  }
  
  /**
   * Get queue statistics
   */
  public getQueueStats(): Record<string, { size: number, maxSize: number }> {
    const stats: Record<string, { size: number, maxSize: number }> = {};
    
    this.queues.forEach((queue, name) => {
      stats[name] = {
        size: queue.size(),
        maxSize: queue.getMaxSize()
      };
    });
    
    return stats;
  }
  
  /**
   * Shutdown all queues
   */
  public shutdown(): void {
    this.queues.forEach((queue) => {
      queue.clear();
    });
    
    this.eventEmitter.emit('queues_shutdown');
  }
}