import { Server } from 'http';
import WebSocket from 'ws';
import { EventEmitter } from 'events';
import { QueueManager } from '../queues/QueueManager';
import { HandlerRegistry } from '../handlers/HandlerRegistry';
import { ProcessorManager } from '../processors/ProcessorManager';
import { db } from '../../db';
import { storage } from '../../storage';

/**
 * MCP (Message Control Plane) Server
 * 
 * A centralized server that coordinates all message processing, signal handling,
 * and state management for the Trade Hybrid platform.
 */
export class MCPServer {
  private static _instance: MCPServer;
  private wss: WebSocket.Server;
  private eventEmitter: EventEmitter;
  private queueManager: QueueManager;
  private handlerRegistry: HandlerRegistry;
  private processorManager: ProcessorManager;
  private clients: Map<string, WebSocket> = new Map();
  private userIdToClientId: Map<string, string> = new Map();
  private clientIdToUserId: Map<string, string> = new Map();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isInitialized: boolean = false;

  /**
   * Get the singleton instance of the MCP Server
   */
  public static get instance(): MCPServer {
    if (!MCPServer._instance) {
      throw new Error('MCP Server is not initialized. Call MCPServer.initialize() first.');
    }
    return MCPServer._instance;
  }

  /**
   * Initialize the MCP Server
   * @param server HTTP server to attach WebSocket server to
   */
  public static initialize(server: Server): MCPServer {
    if (!MCPServer._instance) {
      MCPServer._instance = new MCPServer(server);
    }
    return MCPServer._instance;
  }

  private constructor(server: Server) {
    this.wss = new WebSocket.Server({ server });
    this.eventEmitter = new EventEmitter();
    this.queueManager = new QueueManager(this.eventEmitter);
    this.handlerRegistry = new HandlerRegistry(this.queueManager);
    this.processorManager = new ProcessorManager(this.eventEmitter, this);
    
    this.setup();
  }

  /**
   * Set up the MCP server
   */
  private setup(): void {
    this.setupWebSocketServer();
    this.setupHeartbeat();
    this.isInitialized = true;
    console.log('[MCP] Server initialized');
  }

  /**
   * Set up the WebSocket server
   */
  private setupWebSocketServer(): void {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateId();
      this.clients.set(clientId, ws);
      
      console.log(`[MCP] Client connected: ${clientId}`);
      
      ws.on('message', (message: WebSocket.Data) => {
        this.handleMessage(clientId, message);
      });
      
      ws.on('close', () => {
        this.handleClientDisconnect(clientId);
      });
      
      ws.on('error', (error) => {
        console.error(`[MCP] WebSocket error for client ${clientId}:`, error);
        this.handleClientDisconnect(clientId);
      });
      
      // Send a welcome message
      this.sendToClient(clientId, {
        type: 'connection_established',
        data: { clientId }
      });
    });
  }

  /**
   * Set up a heartbeat to keep track of connected clients
   */
  private setupHeartbeat(): void {
    // Clear any existing heartbeat interval
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    // Set up a new heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.wss.clients.forEach((ws) => {
        if (ws.readyState === WebSocket.CLOSING || ws.readyState === WebSocket.CLOSED) {
          // Find and remove this client
          for (const [clientId, client] of this.clients.entries()) {
            if (client === ws) {
              this.handleClientDisconnect(clientId);
              break;
            }
          }
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Handle incoming WebSocket messages
   * @param clientId Client ID
   * @param message WebSocket message
   */
  private handleMessage(clientId: string, message: WebSocket.Data): void {
    try {
      const parsedMessage = JSON.parse(message.toString());
      
      console.log(`[MCP] Message received from client ${clientId}:`, 
        parsedMessage.type || 'unknown type');
      
      // Handle authentication/registration
      if (parsedMessage.type === 'register_user') {
        this.registerUser(clientId, parsedMessage.data.userId);
        return;
      }
      
      // Process the message using the handler registry
      this.handlerRegistry.processMessage(clientId, parsedMessage);
    } catch (error) {
      console.error(`[MCP] Error handling message from client ${clientId}:`, error);
    }
  }

  /**
   * Handle client disconnect
   * @param clientId Client ID
   */
  private handleClientDisconnect(clientId: string): void {
    // Get the user ID associated with this client
    const userId = this.clientIdToUserId.get(clientId);
    
    // Clean up client maps
    this.clients.delete(clientId);
    this.clientIdToUserId.delete(clientId);
    
    if (userId) {
      this.userIdToClientId.delete(userId);
      
      // Notify that a user has disconnected
      this.eventEmitter.emit('user_disconnected', { userId, clientId });
      console.log(`[MCP] User disconnected: ${userId} (Client: ${clientId})`);
    } else {
      console.log(`[MCP] Client disconnected: ${clientId}`);
    }
  }

  /**
   * Register a user with the MCP server
   * @param clientId Client ID
   * @param userId User ID
   */
  public registerUser(clientId: string, userId: string): void {
    // Remove any existing registration for this user
    const existingClientId = this.userIdToClientId.get(userId);
    if (existingClientId && existingClientId !== clientId) {
      this.clientIdToUserId.delete(existingClientId);
      console.log(`[MCP] User ${userId} reconnected from a different client`);
    }
    
    // Register the new mapping
    this.userIdToClientId.set(userId, clientId);
    this.clientIdToUserId.set(clientId, userId);
    
    console.log(`[MCP] User registered: ${userId} (Client: ${clientId})`);
    
    // Notify that a user has connected
    this.eventEmitter.emit('user_connected', { userId, clientId });
    
    // Send confirmation to client
    this.sendToClient(clientId, {
      type: 'user_registered',
      data: { userId }
    });
  }

  /**
   * Unregister a user from the MCP server
   * @param userId User ID
   */
  public unregisterUser(userId: string): void {
    const clientId = this.userIdToClientId.get(userId);
    if (clientId) {
      this.userIdToClientId.delete(userId);
      this.clientIdToUserId.delete(clientId);
      console.log(`[MCP] User unregistered: ${userId}`);
    }
  }

  /**
   * Get the count of connected clients
   * @returns Number of connected clients
   */
  public getClientsCount(): number {
    return this.clients.size;
  }

  /**
   * Get all connected user IDs
   * @returns Array of user IDs
   */
  public getUserIds(): string[] {
    return Array.from(this.userIdToClientId.keys());
  }

  /**
   * Send a message to a specific user
   * @param userId User ID
   * @param message Message to send
   * @returns True if message was sent, false otherwise
   */
  public sendToUser(userId: string, message: any): boolean {
    const clientId = this.userIdToClientId.get(userId);
    if (!clientId) {
      return false;
    }
    
    return this.sendToClient(clientId, message);
  }

  /**
   * Send a message to a specific client
   * @param clientId Client ID
   * @param message Message to send
   * @returns True if message was sent, false otherwise
   */
  public sendToClient(clientId: string, message: any): boolean {
    const client = this.clients.get(clientId);
    if (!client || client.readyState !== WebSocket.OPEN) {
      return false;
    }
    
    try {
      const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
      client.send(messageStr);
      return true;
    } catch (error) {
      console.error(`[MCP] Error sending message to client ${clientId}:`, error);
      return false;
    }
  }

  /**
   * Broadcast a message to all connected clients
   * @param message Message to broadcast
   * @param excludeClientId Client ID to exclude from broadcast
   */
  public broadcast(message: any, excludeClientId?: string): void {
    const messageStr = typeof message === 'string' ? message : JSON.stringify(message);
    
    this.clients.forEach((client, clientId) => {
      if (excludeClientId && clientId === excludeClientId) {
        return;
      }
      
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }

  /**
   * Queue a task in the MCP server
   * @param queueName Queue name
   * @param data Data to queue
   */
  public queueTask(queueName: string, data: any): void {
    this.queueManager.addToQueue(queueName, data);
  }

  /**
   * Generate a unique ID
   * @returns Unique ID
   */
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Clean up resources when shutting down
   */
  public shutdown(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.wss.close();
    this.processorManager.shutdown();
    this.queueManager.shutdown();
    
    console.log('[MCP] Server shut down');
  }
}