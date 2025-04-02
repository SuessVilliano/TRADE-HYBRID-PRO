import { create } from "zustand";
import { v4 as uuidv4 } from "uuid";

export interface Player {
  id: string;
  username: string;
  avatarUrl?: string;
  isOnline: boolean;
  lastSeen?: Date;
}

export interface ChatMessage {
  id: string;
  sender: string;
  senderId: string;
  senderAvatar?: string;
  message: string;
  timestamp: number;
  type: "global" | "zone" | "private" | "trading";
  target?: string;
  tradeSignal?: TradeSignal;
  isDeleted?: boolean;
}

export interface TradeSignal {
  symbol: string;
  side: "buy" | "sell";
  entryPrice?: number;
  takeProfit?: number;
  stopLoss?: number;
  timeframe?: string;
  description?: string;
  imageUrl?: string;
}

interface MultiplayerState {
  currentUser: Player | null;
  players: Player[];
  chatMessages: ChatMessage[];
  tradingRooms: {
    id: string;
    name: string;
    description?: string;
    members: number;
  }[];
  currentRoomId: string | null;
  isConnected: boolean;
  setCurrentUser: (user: Player) => void;
  sendChatMessage: (
    message: string, 
    type: "global" | "zone" | "private" | "trading", 
    target?: string,
    tradeSignal?: TradeSignal
  ) => void;
  deleteChatMessage: (messageId: string) => void;
  joinRoom: (roomId: string) => void;
  leaveRoom: () => void;
  markUserOnline: (userId: string) => void;
  markUserOffline: (userId: string) => void;
}

// Mock data for development
const mockPlayers: Player[] = [
  { id: "1", username: "TradeExpert", isOnline: true, avatarUrl: "/avatars/trader1.png" },
  { id: "2", username: "CryptoWhale", isOnline: true, avatarUrl: "/avatars/trader2.png" },
  { id: "3", username: "ForexMaster", isOnline: false, lastSeen: new Date(Date.now() - 15 * 60 * 1000) },
  { id: "4", username: "StockGuru", isOnline: true },
  { id: "5", username: "OptionsPro", isOnline: false, lastSeen: new Date(Date.now() - 4 * 60 * 60 * 1000) }
];

const mockMessages: ChatMessage[] = [
  {
    id: "msg1",
    sender: "System",
    senderId: "system",
    message: "Welcome to Trade Hybrid Chat!",
    timestamp: Date.now() - 3600000,
    type: "global"
  },
  {
    id: "msg2",
    sender: "TradeExpert",
    senderId: "1",
    message: "Has anyone looked at the EURUSD chart? Looks like a potential breakout.",
    timestamp: Date.now() - 2400000,
    type: "global"
  },
  {
    id: "msg3",
    sender: "CryptoWhale",
    senderId: "2",
    message: "BTC is forming a nice cup and handle pattern on the 4h chart.",
    timestamp: Date.now() - 1200000,
    type: "global"
  },
  {
    id: "msg4",
    sender: "System",
    senderId: "system",
    message: "New trading session has started. Good luck traders!",
    timestamp: Date.now() - 600000,
    type: "global"
  }
];

const mockTradingRooms = [
  {
    id: "room1",
    name: "Forex Analysis",
    description: "Discussion of forex market trends and signals",
    members: 24
  },
  {
    id: "room2",
    name: "Crypto Traders",
    description: "Cryptocurrency trading signals and market analysis",
    members: 42
  },
  {
    id: "room3",
    name: "Stock Market Group",
    description: "Stock market discussion and trade setups",
    members: 18
  },
  {
    id: "room4",
    name: "Options Strategies",
    description: "Options trading strategies and market outlook",
    members: 15
  }
];

export const useMultiplayer = create<MultiplayerState>((set, get) => ({
  currentUser: null,
  players: mockPlayers,
  chatMessages: mockMessages,
  tradingRooms: mockTradingRooms,
  currentRoomId: null,
  isConnected: true,
  
  setCurrentUser: (user) => set({ currentUser: user }),
  
  sendChatMessage: (message, type, target, tradeSignal) => {
    const { currentUser, chatMessages } = get();
    
    if (!currentUser) return;
    
    const newMessage: ChatMessage = {
      id: uuidv4(),
      sender: currentUser.username,
      senderId: currentUser.id,
      senderAvatar: currentUser.avatarUrl,
      message,
      timestamp: Date.now(),
      type,
      target,
      tradeSignal
    };
    
    set({ chatMessages: [...chatMessages, newMessage] });
    
    // In a real implementation, this would send the message to the server
    console.log("Sending message:", newMessage);
  },
  
  deleteChatMessage: (messageId) => {
    const { chatMessages } = get();
    set({
      chatMessages: chatMessages.map(msg => 
        msg.id === messageId ? { ...msg, isDeleted: true } : msg
      )
    });
  },
  
  joinRoom: (roomId) => {
    set({ currentRoomId: roomId });
    
    // In a real implementation, this would send a join room request to the server
    console.log("Joining room:", roomId);
  },
  
  leaveRoom: () => {
    set({ currentRoomId: null });
    
    // In a real implementation, this would send a leave room request to the server
    console.log("Leaving current room");
  },
  
  markUserOnline: (userId) => {
    const { players } = get();
    set({
      players: players.map(player => 
        player.id === userId ? { ...player, isOnline: true } : player
      )
    });
  },
  
  markUserOffline: (userId) => {
    const { players } = get();
    set({
      players: players.map(player => 
        player.id === userId ? { ...player, isOnline: false, lastSeen: new Date() } : player
      )
    });
  }
}));