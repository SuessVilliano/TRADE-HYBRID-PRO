import { PlayerCustomization } from "../../components/game/Player";

export interface PlayerState {
  id: string;
  username: string;
  position: [number, number, number];
  rotation: number;
  animation: string;
  customization: PlayerCustomization;
  timestamp: number;
}

export interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
  type: 'global' | 'private' | 'zone';
  target?: string;
}

export interface TradeOffer {
  id: string;
  senderId: string;
  senderUsername: string;
  symbol: string;
  price: number;
  quantity: number;
  side: 'buy' | 'sell';
  timestamp: number;
}

export interface FriendRequest {
  id: string;
  senderId: string;
  senderUsername: string;
  timestamp: number;
}

type WSMessageType = 
  | 'player_update' 
  | 'chat_message' 
  | 'join' 
  | 'leave' 
  | 'initial_state' 
  | 'trade_offer' 
  | 'friend_request' 
  | 'ping'
  | 'voice_status'
  | 'voice_data';

interface WSMessage {
  type: WSMessageType;
  data: any;
}

type EventCallback = (data: any) => void;

export class MultiplayerService {
  private static instance: MultiplayerService;
  private socket: WebSocket | null = null;
  private clientId: string | null = null;
  private connected = false;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private eventListeners: Map<WSMessageType, EventCallback[]> = new Map();
  private players: Map<string, PlayerState> = new Map();
  private chatMessages: ChatMessage[] = [];
  
  public username: string = '';
  public userCustomization: PlayerCustomization | null = null;
  
  private constructor() {
    // Private constructor to enforce singleton pattern
    for (const type of [
      'player_update', 'chat_message', 'join', 'leave', 
      'initial_state', 'trade_offer', 'friend_request', 'ping',
      'voice_status', 'voice_data'
    ] as WSMessageType[]) {
      this.eventListeners.set(type, []);
    }
  }
  
  public static getInstance(): MultiplayerService {
    if (!MultiplayerService.instance) {
      MultiplayerService.instance = new MultiplayerService();
    }
    return MultiplayerService.instance;
  }
  
  public connect(username: string, customization: PlayerCustomization): void {
    if (this.connected) {
      console.log('Already connected to multiplayer server');
      return;
    }
    
    this.username = username;
    this.userCustomization = customization;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/multiplayer`;
    
    console.log(`Connecting to multiplayer server at ${wsUrl}`);
    
    this.socket = new WebSocket(wsUrl);
    
    this.socket.onopen = this.handleOpen.bind(this);
    this.socket.onmessage = this.handleMessage.bind(this);
    this.socket.onclose = this.handleClose.bind(this);
    this.socket.onerror = this.handleError.bind(this);
  }
  
  public disconnect(): void {
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
    
    this.connected = false;
    this.clientId = null;
    
    // Clear any reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  public isConnected(): boolean {
    return this.connected;
  }
  
  public getClientId(): string | null {
    return this.clientId;
  }
  
  public getAllPlayers(): PlayerState[] {
    return Array.from(this.players.values());
  }
  
  public getPlayer(id: string): PlayerState | undefined {
    return this.players.get(id);
  }
  
  public getChatMessages(): ChatMessage[] {
    return [...this.chatMessages];
  }
  
  public addEventListener(type: WSMessageType, callback: EventCallback): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.push(callback);
    this.eventListeners.set(type, listeners);
  }
  
  public removeEventListener(type: WSMessageType, callback: EventCallback): void {
    const listeners = this.eventListeners.get(type) || [];
    const filteredListeners = listeners.filter(cb => cb !== callback);
    this.eventListeners.set(type, filteredListeners);
  }
  
  public updatePlayerState(position: [number, number, number], rotation: number, animation: string): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    const message: WSMessage = {
      type: 'player_update',
      data: {
        username: this.username,
        position,
        rotation,
        animation,
        customization: this.userCustomization,
      }
    };
    
    this.socket.send(JSON.stringify(message));
  }
  
  public sendChatMessage(message: string, type: 'global' | 'private' | 'zone' = 'global', target?: string): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    const chatMessage: WSMessage = {
      type: 'chat_message',
      data: {
        message,
        type,
        target
      }
    };
    
    this.socket.send(JSON.stringify(chatMessage));
  }
  
  public sendTradeOffer(targetId: string, symbol: string, price: number, quantity: number, side: 'buy' | 'sell'): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    const tradeOffer: WSMessage = {
      type: 'trade_offer',
      data: {
        targetId,
        symbol,
        price,
        quantity,
        side,
        timestamp: Date.now()
      }
    };
    
    this.socket.send(JSON.stringify(tradeOffer));
  }
  
  public sendFriendRequest(targetId: string): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    const friendRequest: WSMessage = {
      type: 'friend_request',
      data: {
        targetId,
        timestamp: Date.now()
      }
    };
    
    this.socket.send(JSON.stringify(friendRequest));
  }
  
  /**
   * Broadcast voice chat status to other players
   * @param enabled Whether voice chat is enabled for this player
   */
  public updateVoiceChatStatus(enabled: boolean): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    const voiceStatus: WSMessage = {
      type: 'voice_status',
      data: {
        id: this.clientId,
        enabled,
        timestamp: Date.now()
      }
    };
    
    this.socket.send(JSON.stringify(voiceStatus));
    console.log(`Voice chat status updated: ${enabled ? 'enabled' : 'disabled'}`);
  }
  
  /**
   * Send voice data to nearby players for spatial audio
   * @param audioChunk Binary audio data from microphone
   * @param targetIds Optional list of specific player IDs to send to (for private voice)
   */
  public sendVoiceData(audioChunk: ArrayBuffer, targetIds?: string[]): void {
    if (!this.connected || !this.socket) {
      return;
    }
    
    // Convert ArrayBuffer to Base64 for websocket transmission
    const base64Audio = this.arrayBufferToBase64(audioChunk);
    
    const voiceData: WSMessage = {
      type: 'voice_data',
      data: {
        id: this.clientId,
        audio: base64Audio,
        timestamp: Date.now(),
        targetIds // If undefined, server will send to all nearby players
      }
    };
    
    this.socket.send(JSON.stringify(voiceData));
  }
  
  /**
   * Utility method to convert ArrayBuffer to Base64 string
   */
  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const binary = new Uint8Array(buffer);
    const bytes: string[] = [];
    
    binary.forEach(byte => {
      bytes.push(String.fromCharCode(byte));
    });
    
    return btoa(bytes.join(''));
  }
  
  private handleOpen(): void {
    console.log('Connected to multiplayer server');
    this.connected = true;
    
    // Send join message
    this.socket?.send(JSON.stringify({
      type: 'join',
      data: {
        username: this.username,
        customization: this.userCustomization,
        position: [0, 1, 0], // Default starting position
        rotation: 0,
        animation: 'idle'
      }
    }));
    
    // Clear any reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
  
  private handleMessage(event: MessageEvent): void {
    try {
      const message = JSON.parse(event.data) as WSMessage;
      
      // Handle specific message types
      switch (message.type) {
        case 'initial_state':
          this.handleInitialState(message.data);
          break;
        case 'player_update':
          this.handlePlayerUpdate(message.data);
          break;
        case 'chat_message':
          this.handleChatMessage(message.data);
          break;
        case 'join':
          this.handlePlayerJoin(message.data);
          break;
        case 'leave':
          this.handlePlayerLeave(message.data);
          break;
        case 'trade_offer':
          this.handleTradeOffer(message.data);
          break;
        case 'friend_request':
          this.handleFriendRequest(message.data);
          break;
        case 'voice_status':
          // Notify subscribers about voice status change
          this.notifyEventListeners('voice_status', {
            id: message.data.id || 'unknown',
            enabled: message.data.enabled,
            timestamp: message.data.timestamp
          });
          break;
        case 'voice_data':
          // Forward voice data to event listeners for audio processing
          this.notifyEventListeners('voice_data', {
            id: message.data.id,
            audioData: message.data.audio, // Field comes in as 'audio' but we use 'audioData' in the handler
            timestamp: message.data.timestamp
          });
          break;
        case 'ping':
          // Just a heartbeat, no need to handle
          break;
      }
      
      // Notify listeners
      this.notifyEventListeners(message.type, message.data);
      
    } catch (error) {
      console.error('Error parsing WebSocket message:', error);
    }
  }
  
  private handleClose(event: CloseEvent): void {
    console.log(`WebSocket connection closed: ${event.code} ${event.reason}`);
    this.connected = false;
    this.socket = null;
    
    // Attempt to reconnect after 5 seconds
    if (!this.reconnectTimer) {
      this.reconnectTimer = setTimeout(() => {
        if (this.username && this.userCustomization) {
          this.connect(this.username, this.userCustomization);
        }
      }, 5000);
    }
  }
  
  private handleError(event: Event): void {
    console.error('WebSocket error:', event);
  }
  
  private handleInitialState(data: any): void {
    this.clientId = data.clientId;
    
    // Store existing players
    data.players.forEach((player: PlayerState) => {
      this.players.set(player.id, player);
    });
    
    // Store chat history
    this.chatMessages = data.chatMessages || [];
    
    console.log(`Initialized multiplayer with client ID: ${this.clientId}`);
    console.log(`Connected players: ${this.players.size}`);
  }
  
  private handlePlayerUpdate(data: PlayerState): void {
    this.players.set(data.id, data);
  }
  
  private handleChatMessage(data: ChatMessage): void {
    this.chatMessages.push(data);
    
    // Keep only the latest 100 messages
    if (this.chatMessages.length > 100) {
      this.chatMessages = this.chatMessages.slice(-100);
    }
  }
  
  private handlePlayerJoin(data: PlayerState): void {
    this.players.set(data.id, data);
  }
  
  private handlePlayerLeave(data: { id: string }): void {
    this.players.delete(data.id);
  }
  
  private handleTradeOffer(data: TradeOffer): void {
    // Just forward to event listeners
  }
  
  private handleFriendRequest(data: FriendRequest): void {
    // Just forward to event listeners
  }
  
  private notifyEventListeners(type: WSMessageType, data: any): void {
    const listeners = this.eventListeners.get(type) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in event listener for ${type}:`, error);
      }
    });
  }
}