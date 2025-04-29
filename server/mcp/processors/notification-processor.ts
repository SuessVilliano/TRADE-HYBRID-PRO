import { Queue } from '../queues/queue-manager';

/**
 * NotificationProcessor
 * 
 * Processes and broadcasts notifications to clients
 */
export class NotificationProcessor {
  private queue: Queue;
  
  constructor(queue: Queue) {
    this.queue = queue;
    
    // Start processing loop
    this.startProcessingLoop();
    
    console.log('Notification Processor initialized');
  }
  
  /**
   * Process a notification message
   */
  public async processMessage(message: any): Promise<void> {
    // Add to queue for processing
    this.queue.enqueue(message);
  }
  
  /**
   * Get processor ID
   */
  public getId(): string {
    return 'notification';
  }
  
  /**
   * Start the background processing loop
   */
  private startProcessingLoop(): void {
    setInterval(() => {
      this.processNextNotification()
        .catch(err => console.error('Error processing notification:', err));
    }, 100); // Process every 100ms
  }
  
  /**
   * Process the next notification in the queue
   */
  private async processNextNotification(): Promise<void> {
    const message = this.queue.dequeue();
    if (!message) return; // No messages to process
    
    try {
      // Process the notification
      await this.handleNotification(message);
    } catch (error) {
      console.error('Error handling notification:', error);
      this.queue.recordError();
    }
  }
  
  /**
   * Handle a notification
   */
  private async handleNotification(notification: any): Promise<void> {
    console.log(`Processing notification: ${notification.title}`);
    
    try {
      // Store notification in database if needed
      // For system-critical notifications, we might want to persist them
      if (notification.level === 'critical' || notification.persist === true) {
        await this.saveNotificationToDB(notification);
      }
      
      // Broadcast notification to connected clients via WebSocket
      this.broadcastNotification(notification);
    } catch (error) {
      console.error('Error processing notification:', error);
    }
  }
  
  /**
   * Save a notification to the database
   */
  private async saveNotificationToDB(notification: any): Promise<void> {
    // In a production implementation, this would save to the database
    // For this prototype, we'll just log
    console.log(`Would save notification to DB: ${notification.title}`);
  }
  
  /**
   * Broadcast a notification to connected clients
   */
  private broadcastNotification(notification: any): void {
    // Import dynamically to avoid circular dependency
    const { MCPServer } = require('../core/mcp-server');
    const mcpServer = MCPServer.getInstance();
    
    // Create broadcast message
    const broadcastMessage = {
      type: 'notification',
      data: {
        title: notification.title,
        message: notification.message,
        level: notification.level || 'info',
        type: notification.type || 'system',
        timestamp: new Date().toISOString(),
        metadata: notification.metadata || {}
      }
    };
    
    // Broadcast to all clients
    mcpServer.broadcastToAllClients(broadcastMessage);
    console.log(`Notification "${notification.title}" broadcasted to all clients`);
  }
}