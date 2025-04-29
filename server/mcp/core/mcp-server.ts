import { QueueManager } from '../queues/queue-manager';
import { SignalProcessor } from '../processors/signal-processor';
import { NotificationProcessor } from '../processors/notification-processor';
import { HandlerRegistry } from '../handlers/handler-registry';
import { TradingViewWebhookHandler } from '../handlers/tradingview-webhook-handler';
import { Server as HttpServer } from 'http';
import WebSocket from 'ws';
import { WebSocketServer } from 'ws';

/**
 * MCPServer (Message Control Plane Server)
 * 
 * Core server component for the Trade Hybrid MCP architecture
 * Manages message processors, handlers, and WebSocket connections
 */
export class MCPServer {
  private static instance: MCPServer;

  private queueManager: QueueManager;
  private processors: Map<string, any> = new Map();
  private handlerRegistry: HandlerRegistry;
  private wss: WebSocketServer | null = null;
  private startTime: number = Date.now();
  private clients: Map<string, WebSocket> = new Map();
  private userIdToClientId: Map<string, string> = new Map();
  
  // Service references
  public brokerConnectionService: any;
  public marketDataManager: any;
  public signalService: any;
  public smartSignalRouter: any;
  public marketInsightsService: any;
  public userProfileService: any;

  private constructor() {
    // Initialize queue manager
    this.queueManager = new QueueManager();

    // Initialize processors
    const signalsQueue = this.queueManager.getQueue('signals');
    const notificationsQueue = this.queueManager.getQueue('notifications');
    
    if (!signalsQueue || !notificationsQueue) {
      console.error('Failed to get required queues');
      // Create the queues if they don't exist
      const signalsQueue = this.queueManager.createQueue('signals');
      const notificationsQueue = this.queueManager.createQueue('notifications');
    }
    
    const signalProcessor = new SignalProcessor(signalsQueue || this.queueManager.createQueue('signals'));
    const notificationProcessor = new NotificationProcessor(notificationsQueue || this.queueManager.createQueue('notifications'));
    
    this.processors.set('signal', signalProcessor);
    this.processors.set('notification', notificationProcessor);

    // Initialize handler registry
    this.handlerRegistry = new HandlerRegistry();
    
    // Register handlers
    const tradingViewHandler = new TradingViewWebhookHandler(signalProcessor);
    this.handlerRegistry.registerHandler(tradingViewHandler);

    console.log('MCP Server initialized with processors:', 
      Array.from(this.processors.keys()).join(', '));
  }

  /**
   * Get the singleton instance of MCPServer
   */
  public static getInstance(): MCPServer {
    if (!MCPServer.instance) {
      MCPServer.instance = new MCPServer();
    }
    return MCPServer.instance;
  }

  /**
   * Initialize WebSocket server for real-time communication
   */
  public initializeWebSocketServer(httpServer: HttpServer): void {
    if (this.wss) {
      return; // Already initialized
    }

    this.wss = new WebSocketServer({ server: httpServer });
    
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateId();
      this.clients.set(clientId, ws);
      
      console.log(`MCP WebSocket client connected. Total clients: ${this.clients.size}`);
      
      // Send welcome message
      ws.send(JSON.stringify({
        type: 'mcp_connection',
        data: {
          clientId,
          message: 'Connected to MCP Server',
          timestamp: new Date().toISOString()
        }
      }));
      
      // Handle messages from client
      ws.on('message', (message: string) => {
        try {
          const data = JSON.parse(message);
          
          // Client authentication message
          if (data.type === 'auth' && data.userId) {
            this.userIdToClientId.set(data.userId, clientId);
            console.log(`MCP client ${clientId} authenticated as user ${data.userId}`);
          }
        } catch (error) {
          console.error('Error processing WebSocket message:', error);
        }
      });
      
      // Handle client disconnect
      ws.on('close', () => {
        this.clients.delete(clientId);
        
        // Clean up user mapping
        for (const [userId, cId] of this.userIdToClientId.entries()) {
          if (cId === clientId) {
            this.userIdToClientId.delete(userId);
            break;
          }
        }
        
        console.log(`MCP WebSocket client disconnected. Remaining clients: ${this.clients.size}`);
      });
    });
    
    console.log('MCP WebSocket server initialized');
  }

  /**
   * Get processor by ID
   */
  public getProcessor(id: string): any {
    return this.processors.get(id);
  }

  /**
   * Get all registered processors
   */
  public getProcessors(): any[] {
    return Array.from(this.processors.values());
  }

  /**
   * Get queue statistics
   */
  public getQueueStats(): any {
    return this.queueManager.getStats();
  }

  /**
   * Get handler count
   */
  public getHandlerCount(): number {
    return this.handlerRegistry.getHandlerCount();
  }

  /**
   * Get client count
   */
  public getClientCount(): number {
    return this.clients.size;
  }

  /**
   * Get server start time
   */
  public getStartTime(): number {
    return this.startTime;
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  public broadcastToAllClients(message: any): void {
    if (!this.wss) return;
    
    const messageString = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);
    
    let deliveredCount = 0;
    
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageString);
        deliveredCount++;
      }
    });
    
    console.log(`MCP broadcast message delivered to ${deliveredCount}/${this.clients.size} clients`);
  }
  
  /**
   * Start the MCP server
   */
  public start(): void {
    console.log('[MCP] Starting server');
    this.initializePeriodicTasks();
    console.log('[MCP] Server started successfully');
  }
  
  /**
   * Stop the MCP server
   */
  public stop(): void {
    console.log('[MCP] Stopping server');
    
    // Clean up WebSocket connections
    if (this.wss) {
      this.wss.close();
      this.wss = null;
    }
    
    // Clear clients
    this.clients.clear();
    this.userIdToClientId.clear();
    
    console.log('[MCP] Server stopped successfully');
  }
  
  /**
   * Get server status
   */
  public getStatus(): any {
    return {
      uptime: Date.now() - this.startTime,
      clients: this.clients.size,
      queues: this.queueManager.getStats(),
      handlers: this.handlerRegistry.getHandlerCount(),
      processors: Array.from(this.processors.keys())
    };
  }
  
  /**
   * Publish a message to a queue
   */
  public publish(queueName: string, message: any): boolean {
    try {
      const queue = this.queueManager.getQueue(queueName);
      if (!queue) {
        console.error(`[MCP] Queue not found: ${queueName}`);
        return false;
      }
      
      queue.enqueue(message);
      return true;
    } catch (error) {
      console.error(`[MCP] Error publishing message to ${queueName}:`, error);
      return false;
    }
  }

  /**
   * Send message to a specific user
   */
  public sendToUser(userId: string, message: any): boolean {
    const clientId = this.userIdToClientId.get(userId);
    if (!clientId) return false;
    
    const client = this.clients.get(clientId);
    if (!client || client.readyState !== WebSocket.OPEN) return false;
    
    const messageString = typeof message === 'string' 
      ? message 
      : JSON.stringify(message);
    
    client.send(messageString);
    return true;
  }

  /**
   * Generate a unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Sync MCP state with database
   * This ensures all active signals and user states are loaded
   */
  public async syncWithDatabase(): Promise<void> {
    console.log('Syncing MCP state with database');
    
    try {
      // Get signal processor
      const signalProcessor = this.getProcessor('signal') as SignalProcessor;
      if (signalProcessor) {
        await signalProcessor.loadActiveSignalsFromDatabase();
      }
      
      // Additional sync operations can be added here as needed
      
      console.log('MCP state sync completed');
    } catch (error) {
      console.error('Error syncing MCP state with database:', error);
    }
  }

  /**
   * Periodic persistence of state to database
   * This ensures that any in-memory state changes are saved to the database
   */
  public async persistState(): Promise<void> {
    try {
      // Get signal processor
      const signalProcessor = this.getProcessor('signal') as SignalProcessor;
      if (signalProcessor) {
        await signalProcessor.persistSignalsToDB();
      }
      
      // Persist other state as needed
      
    } catch (error) {
      console.error('Error persisting MCP state to database:', error);
    }
  }

  /**
   * Initialize periodic tasks
   */
  public initializePeriodicTasks(): void {
    // Sync with database every 30 minutes
    setInterval(() => {
      this.syncWithDatabase().catch(err => 
        console.error('Error in periodic database sync:', err)
      );
    }, 30 * 60 * 1000);
    
    // Persist state to database every 5 minutes
    setInterval(() => {
      this.persistState().catch(err => 
        console.error('Error in periodic state persistence:', err)
      );
    }, 5 * 60 * 1000);
  }
}