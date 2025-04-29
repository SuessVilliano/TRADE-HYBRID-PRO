/**
 * QueueManager
 * 
 * Manages message queues for the MCP architecture
 */
export class QueueManager {
  private queues: Map<string, Queue> = new Map();
  
  constructor() {
    // Initialize standard queues
    this.createQueue('signals', 100); // Higher priority for trading signals
    this.createQueue('notifications', 50); // Medium priority for notifications
    this.createQueue('tasks', 10); // Lower priority for background tasks
    
    console.log('Queue Manager initialized with queues:', 
      Array.from(this.queues.keys()).join(', '));
  }
  
  /**
   * Create a new queue with the specified priority
   */
  public createQueue(name: string, priority: number): Queue {
    const queue = new Queue(name, priority);
    this.queues.set(name, queue);
    return queue;
  }
  
  /**
   * Get a queue by name
   */
  public getQueue(name: string): Queue {
    if (!this.queues.has(name)) {
      this.createQueue(name, 10); // Default priority
    }
    return this.queues.get(name)!;
  }
  
  /**
   * Get statistics about all queues
   */
  public getStats(): any {
    const stats: any = {};
    this.queues.forEach((queue, name) => {
      stats[name] = {
        size: queue.size(),
        priority: queue.getPriority(),
        processedCount: queue.getProcessedCount(),
        errorCount: queue.getErrorCount()
      };
    });
    return stats;
  }
}

/**
 * Queue
 * 
 * A simple queue implementation for the MCP architecture
 */
export class Queue {
  private name: string;
  private priority: number;
  private items: any[] = [];
  private processedCount: number = 0;
  private errorCount: number = 0;
  
  constructor(name: string, priority: number) {
    this.name = name;
    this.priority = priority;
  }
  
  /**
   * Add an item to the queue
   */
  public enqueue(item: any): void {
    this.items.push(item);
    console.log(`Queued item in ${this.name}. Queue size: ${this.items.length}`);
  }
  
  /**
   * Remove and return the next item from the queue
   */
  public dequeue(): any | null {
    if (this.items.length === 0) return null;
    const item = this.items.shift();
    this.processedCount++;
    return item;
  }
  
  /**
   * Peek at the next item without removing it
   */
  public peek(): any | null {
    if (this.items.length === 0) return null;
    return this.items[0];
  }
  
  /**
   * Get the size of the queue
   */
  public size(): number {
    return this.items.length;
  }
  
  /**
   * Get the priority of the queue
   */
  public getPriority(): number {
    return this.priority;
  }
  
  /**
   * Get the name of the queue
   */
  public getName(): string {
    return this.name;
  }
  
  /**
   * Get the number of items processed by this queue
   */
  public getProcessedCount(): number {
    return this.processedCount;
  }
  
  /**
   * Record an error with processing an item
   */
  public recordError(): void {
    this.errorCount++;
  }
  
  /**
   * Get the number of errors encountered
   */
  public getErrorCount(): number {
    return this.errorCount;
  }
  
  /**
   * Clear all items from the queue
   */
  public clear(): void {
    this.items = [];
  }
}