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
  mutedPlayers: string[]; // IDs of muted players
  
  // Voice chat
  voiceChatEnabled: boolean;
  activeSpeakers: string[]; // IDs of players currently speaking
  
  // Actions
  connect: (username: string, customization: PlayerCustomization) => void;
  disconnect: () => void;
  sendChatMessage: (message: string, type?: 'global' | 'private' | 'zone', target?: string) => void;
  updatePlayerPosition: (position: [number, number, number], rotation: number, animation: string) => void;
  sendTradeOffer: (targetId: string, symbol: string, price: number, quantity: number, side: 'buy' | 'sell') => void;
  sendFriendRequest: (targetId: string) => void;
  acceptFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  mutePlayer: (playerId: string) => void;
  unmutePlayer: (playerId: string) => void;
  isPlayerMuted: (playerId: string) => boolean;
  isPlayerFriend: (playerId: string) => boolean;
  
  // Voice chat methods
  toggleVoiceChat: (enabled: boolean) => void;
  sendVoiceData: (audioChunk: ArrayBuffer, targetIds?: string[]) => void;
  
  // Helper methods
  getAllPlayers: () => PlayerState[];
  getPlayer: (id: string) => PlayerState | undefined;
  getClientId: () => string | null;
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
  
  service.addEventListener('voice_status', (data: { id: string, enabled: boolean }) => {
    // When a player enables/disables voice chat, we want to update our list of active speakers
    if (!data.enabled) {
      set(state => ({
        activeSpeakers: state.activeSpeakers.filter(id => id !== data.id)
      }));
    }
  });
  
  service.addEventListener('voice_data', (data: { id: string, audio: string }) => {
    // When we receive voice data, add the player to active speakers if not already there
    set(state => {
      if (state.activeSpeakers.includes(data.id)) {
        return state; // Already in active speakers
      }
      return {
        activeSpeakers: [...state.activeSpeakers, data.id]
      };
    });
    
    // After a short delay, remove the player from active speakers if no more voice data received
    setTimeout(() => {
      set(state => ({
        activeSpeakers: state.activeSpeakers.filter(id => id !== data.id)
      }));
    }, 500); // 500ms of silence to consider someone stopped talking
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
    mutedPlayers: [],
    voiceChatEnabled: false,
    activeSpeakers: [],
    
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
    },
    
    mutePlayer: (playerId) => {
      set(state => {
        // Only add to muted list if not already there
        if (state.mutedPlayers.includes(playerId)) {
          return state;
        }
        return {
          mutedPlayers: [...state.mutedPlayers, playerId]
        };
      });
    },
    
    unmutePlayer: (playerId) => {
      set(state => ({
        mutedPlayers: state.mutedPlayers.filter(id => id !== playerId)
      }));
    },
    
    isPlayerMuted: (playerId) => {
      return get().mutedPlayers.includes(playerId);
    },
    
    isPlayerFriend: (playerId) => {
      return get().friends.some(friend => friend.id === playerId);
    },
    
    // Voice chat methods
    toggleVoiceChat: (enabled) => {
      service.updateVoiceChatStatus(enabled);
      set({ voiceChatEnabled: enabled });
    },
    
    sendVoiceData: (audioChunk, targetIds) => {
      service.sendVoiceData(audioChunk, targetIds);
    },
    
    // Helper methods
    getAllPlayers: () => {
      return get().players;
    },
    
    getPlayer: (id) => {
      return get().players.find(player => player.id === id);
    },
    
    getClientId: () => {
      return get().clientId;
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