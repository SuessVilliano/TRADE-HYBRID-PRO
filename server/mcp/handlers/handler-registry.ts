/**
 * Handler Registry
 * 
 * Manages message handlers for different types of messages in the MCP system
 */

interface MessageHandler {
  handleMessage(message: any): Promise<void>;
  getId(): string;
}

export class HandlerRegistry {
  private handlers: Map<string, MessageHandler> = new Map();
  
  constructor() {
    console.log('Handler Registry initialized');
  }
  
  /**
   * Register a handler
   */
  public registerHandler(handler: MessageHandler): void {
    const id = handler.getId();
    this.handlers.set(id, handler);
    console.log(`Handler registered: ${id}`);
  }
  
  /**
   * Get a handler by ID
   */
  public getHandler(id: string): MessageHandler | undefined {
    return this.handlers.get(id);
  }
  
  /**
   * Get all registered handlers
   */
  public getAllHandlers(): MessageHandler[] {
    return Array.from(this.handlers.values());
  }
  
  /**
   * Get the number of registered handlers
   */
  public getHandlerCount(): number {
    return this.handlers.size;
  }
}