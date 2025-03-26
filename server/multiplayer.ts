import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { log } from './vite';

interface PlayerState {
  id: string;
  username: string;
  position: [number, number, number];
  rotation: number;
  animation: string;
  customization: any;
  timestamp: number;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  type: 'global' | 'private' | 'zone';
  target?: string; // For private messages or zone
}

interface WSMessage {
  type: 'player_update' | 'chat_message' | 'join' | 'leave' | 'trade_offer' | 'friend_request' | 'ping';
  data: any;
}

export class MultiplayerServer {
  private wss: WebSocketServer;
  private clients: Map<string, WebSocket> = new Map();
  private playerStates: Map<string, PlayerState> = new Map();
  private chatMessages: ChatMessage[] = [];
  
  constructor(server: Server) {
    this.wss = new WebSocketServer({ 
      server,
      path: '/multiplayer'  // Set a specific path for our multiplayer WebSocket
    });
    this.initialize();
    
    // Keep only the latest 100 chat messages
    setInterval(() => {
      if (this.chatMessages.length > 100) {
        this.chatMessages = this.chatMessages.slice(-100);
      }
    }, 60000); // Check every minute
    
    log('Multiplayer WebSocket server initialized', 'ws');
  }
  
  private initialize() {
    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = this.generateId();
      this.clients.set(clientId, ws);
      
      log(`Client connected: ${clientId}`, 'ws');
      
      // Send the current state to the new client
      this.sendInitialState(ws, clientId);
      
      ws.addEventListener('message', (event) => {
        try {
          const parsedMessage: WSMessage = JSON.parse(event.data.toString());
          this.handleMessage(clientId, parsedMessage);
        } catch (err) {
          log(`Invalid message format: ${err}`, 'ws');
        }
      });
      
      ws.addEventListener('close', () => {
        // Notify other clients that this player has left
        this.broadcast({
          type: 'leave',
          data: { id: clientId }
        }, clientId);
        
        // Clean up
        this.clients.delete(clientId);
        this.playerStates.delete(clientId);
        log(`Client disconnected: ${clientId}`, 'ws');
      });
      
      // Send a ping every 30 seconds to keep the connection alive
      const pingInterval = setInterval(() => {
        if (ws.readyState === ws.OPEN) {
          ws.send(JSON.stringify({ type: 'ping', data: { timestamp: Date.now() } }));
        } else {
          clearInterval(pingInterval);
        }
      }, 30000);
    });
  }
  
  private sendInitialState(ws: WebSocket, clientId: string) {
    // Send all existing players
    const players = Array.from(this.playerStates.values());
    ws.send(JSON.stringify({
      type: 'initial_state',
      data: {
        clientId,
        players,
        chatMessages: this.chatMessages.slice(-20) // Send the last 20 messages
      }
    }));
  }
  
  private handleMessage(clientId: string, message: WSMessage) {
    switch (message.type) {
      case 'player_update':
        this.handlePlayerUpdate(clientId, message.data);
        break;
      case 'chat_message':
        this.handleChatMessage(clientId, message.data);
        break;
      case 'join':
        this.handlePlayerJoin(clientId, message.data);
        break;
      case 'trade_offer':
        this.handleTradeOffer(clientId, message.data);
        break;
      case 'friend_request':
        this.handleFriendRequest(clientId, message.data);
        break;
      default:
        // Ignore unknown message types
        break;
    }
  }
  
  private handlePlayerUpdate(clientId: string, data: any) {
    // Update the player state
    const playerState: PlayerState = {
      id: clientId,
      username: data.username,
      position: data.position,
      rotation: data.rotation,
      animation: data.animation,
      customization: data.customization,
      timestamp: Date.now()
    };
    
    this.playerStates.set(clientId, playerState);
    
    // Broadcast the update to all other clients
    this.broadcast({
      type: 'player_update',
      data: playerState
    }, clientId);
  }
  
  private handleChatMessage(clientId: string, data: any) {
    const sender = this.playerStates.get(clientId)?.username || 'Unknown';
    
    const chatMessage: ChatMessage = {
      id: this.generateId(),
      sender,
      message: data.message,
      timestamp: Date.now(),
      type: data.type || 'global',
      target: data.target
    };
    
    // Store the message
    this.chatMessages.push(chatMessage);
    
    // Broadcast based on the message type
    if (chatMessage.type === 'global') {
      // Send to everyone
      this.broadcast({
        type: 'chat_message',
        data: chatMessage
      });
    } else if (chatMessage.type === 'private' && chatMessage.target) {
      // Send only to the target user and the sender
      this.sendToClient(chatMessage.target, {
        type: 'chat_message',
        data: chatMessage
      });
      
      // Also send back to the sender (so they see their message)
      this.sendToClient(clientId, {
        type: 'chat_message',
        data: chatMessage
      });
    } else if (chatMessage.type === 'zone' && chatMessage.target) {
      // Send to all clients in the zone and the sender
      this.broadcastToZone(chatMessage.target, {
        type: 'chat_message',
        data: chatMessage
      });
    }
  }
  
  private handlePlayerJoin(clientId: string, data: any) {
    // Create the player state
    const playerState: PlayerState = {
      id: clientId,
      username: data.username,
      position: data.position || [0, 1, 0],
      rotation: data.rotation || 0,
      animation: data.animation || 'idle',
      customization: data.customization || {},
      timestamp: Date.now()
    };
    
    this.playerStates.set(clientId, playerState);
    
    // Broadcast to all other clients that a new player has joined
    this.broadcast({
      type: 'join',
      data: playerState
    }, clientId);
    
    // Send a welcome message
    const welcomeMessage: ChatMessage = {
      id: this.generateId(),
      sender: 'System',
      message: `Welcome to Trade Hybrid, ${data.username}!`,
      timestamp: Date.now(),
      type: 'private',
      target: clientId
    };
    
    this.sendToClient(clientId, {
      type: 'chat_message',
      data: welcomeMessage
    });
    
    // Notify everyone that a new player has joined
    const joinMessage: ChatMessage = {
      id: this.generateId(),
      sender: 'System',
      message: `${data.username} has entered Trade Hybrid!`,
      timestamp: Date.now(),
      type: 'global'
    };
    
    this.broadcast({
      type: 'chat_message',
      data: joinMessage
    });
    
    this.chatMessages.push(joinMessage);
  }
  
  private handleTradeOffer(clientId: string, data: any) {
    // Forward the trade offer to the target user
    if (data.targetId) {
      this.sendToClient(data.targetId, {
        type: 'trade_offer',
        data: {
          ...data,
          senderId: clientId,
          senderUsername: this.playerStates.get(clientId)?.username || 'Unknown'
        }
      });
    }
  }
  
  private handleFriendRequest(clientId: string, data: any) {
    // Forward the friend request to the target user
    if (data.targetId) {
      this.sendToClient(data.targetId, {
        type: 'friend_request',
        data: {
          ...data,
          senderId: clientId,
          senderUsername: this.playerStates.get(clientId)?.username || 'Unknown'
        }
      });
    }
  }
  
  private broadcast(message: any, excludeId?: string) {
    const messageStr = JSON.stringify(message);
    
    this.clients.forEach((client, id) => {
      if (id !== excludeId && client.readyState === client.OPEN) {
        client.send(messageStr);
      }
    });
  }
  
  private broadcastToZone(zone: string, message: any) {
    const messageStr = JSON.stringify(message);
    
    // For now, a simple implementation that broadcasts to all clients
    // In a more complex system, we would track which zone each player is in
    this.clients.forEach((client) => {
      if (client.readyState === client.OPEN) {
        client.send(messageStr);
      }
    });
  }
  
  private sendToClient(clientId: string, message: any) {
    const client = this.clients.get(clientId);
    if (client && client.readyState === client.OPEN) {
      client.send(JSON.stringify(message));
    }
  }
  
  private generateId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}