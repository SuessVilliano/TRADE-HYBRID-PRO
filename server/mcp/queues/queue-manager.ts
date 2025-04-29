/**
 * Queue Manager for MCP
 * 
 * Manages message queues for different types of messages in the MCP system
 */

/**
 * Queue class for handling message queues
 */
export class Queue {
  private name: string;
  private messages: any[] = [];
  private maxSize: number;
  private errorCount: number = 0;
  private processedCount: number = 0;
  
  constructor(name: string, maxSize: number = 1000) {
    this.name = name;
    this.maxSize = maxSize;
    console.log(`Queue ${name} initialized with max size ${maxSize}`);
  }
  
  /**
   * Add a message to the queue
   */
  public enqueue(message: any): boolean {
    // Check if queue is full
    if (this.messages.length >= this.maxSize) {
      console.warn(`Queue ${this.name} is full, dropping oldest message`);
      this.messages.shift(); // Remove oldest message
    }
    
    // Add the message
    this.messages.push(message);
    return true;
  }
  
  /**
   * Get and remove the next message from the queue
   */
  public dequeue(): any {
    if (this.messages.length === 0) {
      return null;
    }
    
    const message = this.messages.shift();
    this.processedCount++;
    return message;
  }
  
  /**
   * Peek at the next message without removing it
   */
  public peek(): any {
    if (this.messages.length === 0) {
      return null;
    }
    
    return this.messages[0];
  }
  
  /**
   * Get the number of messages in the queue
   */
  public size(): number {
    return this.messages.length;
  }
  
  /**
   * Record an error in processing
   */
  public recordError(): void {
    this.errorCount++;
  }
  
  /**
   * Get queue statistics
   */
  public getStats(): any {
    return {
      name: this.name,
      size: this.messages.length,
      maxSize: this.maxSize,
      errorCount: this.errorCount,
      processedCount: this.processedCount
    };
  }
  
  /**
   * Clear all messages from the queue
   */
  public clear(): void {
    this.messages = [];
  }
}

/**
 * QueueManager class for managing multiple queues
 */
export class QueueManager {
  private queues: Map<string, Queue> = new Map();
  
  constructor(queueNames: string[] = ['signals', 'notifications', 'tasks']) {
    // Initialize default queues
    for (const name of queueNames) {
      this.createQueue(name);
    }
    
    console.log(`Queue Manager initialized with queues: ${queueNames.join(', ')}`);
  }
  
  /**
   * Create a new queue
   */
  public createQueue(name: string, maxSize: number = 1000): Queue {
    const queue = new Queue(name, maxSize);
    this.queues.set(name, queue);
    return queue;
  }
  
  /**
   * Get a queue by name
   */
  public getQueue(name: string): Queue | undefined {
    return this.queues.get(name);
  }
  
  /**
   * Get statistics for all queues
   */
  public getStats(): any[] {
    const stats: any[] = [];
    
    this.queues.forEach(queue => {
      stats.push(queue.getStats());
    });
    
    return stats;
  }
}