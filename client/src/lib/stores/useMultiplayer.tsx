import { create } from 'zustand';
import { MultiplayerService, PlayerState, ChatMessage, TradeOffer, FriendRequest } from '../services/multiplayer-service';
import type { PlayerCustomization } from '../../components/game/Player';

export interface Friend {
  id: string;
  username: string;
  online: boolean;
  lastSeen?: Date;
}

interface MultiplayerState {
  // Service and connection state
  service: MultiplayerService;
  connected: boolean;
  clientId: string | null;
  
  // Player state
  username: string | null;
  customization: PlayerCustomization | null;
  players: PlayerState[];
  
  // Social features
  chatMessages: ChatMessage[];
  tradeOffers: TradeOffer[];
  friendRequests: FriendRequest[];
  friends: Friend[];
  
  // Actions
  connect: (username: string, customization: PlayerCustomization) => void;
  disconnect: () => void;
  sendChatMessage: (message: string, type?: 'global' | 'private' | 'zone', target?: string) => void;
  updatePlayerPosition: (position: [number, number, number], rotation: number, animation: string) => void;
  sendTradeOffer: (targetId: string, symbol: string, price: number, quantity: number, side: 'buy' | 'sell') => void;
  sendFriendRequest: (targetId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
}

export const useMultiplayer = create<MultiplayerState>((set, get) => {
  const service = MultiplayerService.getInstance();
  
  // Setup event listeners for the service
  service.addEventListener('player_update', (data: PlayerState) => {
    set(state => ({
      players: updatePlayerList(state.players, data)
    }));
  });
  
  service.addEventListener('chat_message', (data: ChatMessage) => {
    set(state => ({
      chatMessages: [...state.chatMessages, data].slice(-100)
    }));
  });
  
  service.addEventListener('join', (data: PlayerState) => {
    set(state => ({
      players: updatePlayerList(state.players, data)
    }));
  });
  
  service.addEventListener('leave', (data: { id: string }) => {
    set(state => ({
      players: state.players.filter(player => player.id !== data.id)
    }));
  });
  
  service.addEventListener('initial_state', (data: { 
    clientId: string, 
    players: PlayerState[], 
    chatMessages: ChatMessage[] 
  }) => {
    set({
      clientId: data.clientId,
      players: data.players,
      chatMessages: data.chatMessages
    });
  });
  
  service.addEventListener('trade_offer', (data: TradeOffer) => {
    set(state => ({
      tradeOffers: [...state.tradeOffers, data]
    }));
  });
  
  service.addEventListener('friend_request', (data: FriendRequest) => {
    set(state => ({
      friendRequests: [...state.friendRequests, data]
    }));
  });
  
  return {
    // Initial state
    service,
    connected: false,
    clientId: null,
    username: null,
    customization: null,
    players: [],
    chatMessages: [],
    tradeOffers: [],
    friendRequests: [],
    friends: [],
    
    // Actions
    connect: (username, customization) => {
      service.connect(username, customization);
      set({ 
        username, 
        customization,
        connected: service.isConnected(),
        clientId: service.getClientId()
      });
    },
    
    disconnect: () => {
      service.disconnect();
      set({ 
        connected: false, 
        clientId: null 
      });
    },
    
    sendChatMessage: (message, type = 'global', target) => {
      service.sendChatMessage(message, type, target);
    },
    
    updatePlayerPosition: (position, rotation, animation) => {
      service.updatePlayerState(position, rotation, animation);
    },
    
    sendTradeOffer: (targetId, symbol, price, quantity, side) => {
      service.sendTradeOffer(targetId, symbol, price, quantity, side);
    },
    
    sendFriendRequest: (targetId) => {
      service.sendFriendRequest(targetId);
    },
    
    acceptFriendRequest: (requestId) => {
      // Find the request
      const request = get().friendRequests.find(req => req.id === requestId);
      if (!request) return;
      
      // Add to friends list
      set(state => ({
        friends: [
          ...state.friends, 
          {
            id: request.senderId,
            username: request.senderUsername,
            online: true
          }
        ],
        // Remove the request
        friendRequests: state.friendRequests.filter(req => req.id !== requestId)
      }));
    },
    
    removeFriend: (friendId) => {
      set(state => ({
        friends: state.friends.filter(friend => friend.id !== friendId)
      }));
    }
  };
});

// Helper function to update a player in the list or add if not present
function updatePlayerList(players: PlayerState[], updatedPlayer: PlayerState): PlayerState[] {
  const index = players.findIndex(p => p.id === updatedPlayer.id);
  
  if (index === -1) {
    // Player not in list, add them
    return [...players, updatedPlayer];
  }
  
  // Player exists, update them
  const newPlayers = [...players];
  newPlayers[index] = updatedPlayer;
  return newPlayers;
}