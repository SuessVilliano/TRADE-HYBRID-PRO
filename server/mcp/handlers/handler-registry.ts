/**
 * HandlerRegistry
 * 
 * Manages message handlers for the MCP architecture
 */
export class HandlerRegistry {
  private handlers: Map<string, any> = new Map();
  
  constructor() {
    console.log('Handler Registry initialized');
  }
  
  /**
   * Register a handler
   */
  public registerHandler(id: string, handler: any): void {
    this.handlers.set(id, handler);
    console.log(`Handler registered: ${id}`);
  }
  
  /**
   * Get a handler by ID
   */
  public getHandler(id: string): any {
    return this.handlers.get(id);
  }
  
  /**
   * Get all registered handlers
   */
  public getHandlers(): any[] {
    return Array.from(this.handlers.values());
  }
  
  /**
   * Get count of registered handlers
   */
  public getHandlerCount(): number {
    return this.handlers.size;
  }
}