import { create } from 'zustand';
import { 
  MultiplayerService, 
  PlayerState, 
  ChatMessage, 
  TradeOffer, 
  FriendRequest,
  FriendResponse,
  UserStatus,
  SocialActivity
} from '../services/multiplayer-service';
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
  socialActivities: SocialActivity[];
  userStatuses: Map<string, UserStatus>;
  
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
  rejectFriendRequest: (requestId: string) => void;
  removeFriend: (friendId: string) => void;
  mutePlayer: (playerId: string) => void;
  unmutePlayer: (playerId: string) => void;
  isPlayerMuted: (playerId: string) => boolean;
  isPlayerFriend: (playerId: string) => boolean;
  
  // Voice chat methods
  toggleVoiceChat: (enabled: boolean) => void;
  sendVoiceData: (audioChunk: ArrayBuffer, targetIds?: string[]) => void;
  
  // User status
  updateUserStatus: (status: 'online' | 'away' | 'busy' | 'offline') => void;
  getUserStatus: (userId: string) => UserStatus | undefined;
  
  // Social activity
  shareSocialActivity: (type: 'achievement' | 'trade' | 'level_up' | 'signal_shared', details: string) => void;
  
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
  
  // Audio context for voice playback
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  const audioBuffers: { [key: string]: AudioBufferSourceNode[] } = {};
  
  // Voice data handling with proper audio processing
  service.addEventListener('voice_data', (data: { id: string, audio: string }) => {
    try {
      // When we receive voice data, add the player to active speakers if not already there
      set(state => {
        if (state.activeSpeakers.includes(data.id)) {
          return state; // Already in active speakers
        }
        return {
          activeSpeakers: [...state.activeSpeakers, data.id]
        };
      });
      
      // Get player state for spatial audio calculations
      const state = get();
      const mutedPlayers = state.mutedPlayers;
      
      // Skip playback for muted players
      if (mutedPlayers.includes(data.id)) {
        return;
      }
      
      // Convert base64 back to audio buffer
      const binaryString = atob(data.audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      // Convert Uint8Array to Int16Array (PCM format)
      const pcmData = new Int16Array(bytes.buffer);
      
      // Convert Int16Array to Float32Array for audio playback
      const floatData = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        // Convert from 16-bit int to float (-1 to 1)
        floatData[i] = pcmData[i] / 32768.0;
      }
      
      // Create an audio buffer
      const buffer = audioContext.createBuffer(1, floatData.length, 48000); // Assume 48kHz sample rate
      buffer.getChannelData(0).set(floatData);
      
      // Create audio source
      const source = audioContext.createBufferSource();
      source.buffer = buffer;
      
      // Apply spatial audio if applicable
      let finalNode = source;
      
      // If we have player positions, create spatial audio effect
      const player = state.players.find(p => p.id === data.id);
      const clientPlayer = state.players.find(p => p.id === state.clientId);
      
      if (player && clientPlayer) {
        try {
          // Create a panner node for spatial audio
          const panner = audioContext.createPanner();
          
          // Calculate relative position based on player positions
          const dx = player.position[0] - clientPlayer.position[0];
          const dy = player.position[1] - clientPlayer.position[1];
          const dz = player.position[2] - clientPlayer.position[2];
          
          // Set panner position
          panner.positionX.value = dx;
          panner.positionY.value = dy;
          panner.positionZ.value = dz;
          
          // Connect source to panner
          source.connect(panner);
          
          // Add to active audio sources for this player
          if (!audioBuffers[data.id]) {
            audioBuffers[data.id] = [];
          }
          audioBuffers[data.id].push(source);
          
          // Connect panner to destination
          panner.connect(audioContext.destination);
        } catch (error) {
          console.error('Error setting up spatial audio:', error);
          // Fall back to regular audio
          source.connect(audioContext.destination);
        }
      } else {
        // Regular non-spatial audio
        source.connect(audioContext.destination);
      }
      
      // Start playing the audio
      source.start();
      
      // Clean up old sources to prevent memory leaks
      source.onended = () => {
        if (audioBuffers[data.id]) {
          const index = audioBuffers[data.id].indexOf(source);
          if (index !== -1) {
            audioBuffers[data.id].splice(index, 1);
          }
          
          // If this was the last buffer, consider the player silent
          if (audioBuffers[data.id].length === 0) {
            setTimeout(() => {
              set(state => ({
                activeSpeakers: state.activeSpeakers.filter(id => id !== data.id)
              }));
            }, 200);
          }
        }
      };
    } catch (error) {
      console.error('Error processing voice data:', error);
    }
    
    // Set a timeout to remove from active speakers if no more data received
    const speakingTimeoutId = setTimeout(() => {
      set(state => ({
        activeSpeakers: state.activeSpeakers.filter(id => id !== data.id)
      }));
    }, 500); // 500ms of silence to consider someone stopped talking
    
    // Clear previous timeout to prevent removing too early
    return () => clearTimeout(speakingTimeoutId);
  });
  
  service.addEventListener('friend_response', (data: FriendResponse) => {
    // If we received an acceptance, add to friends list
    if (data.accepted) {
      set(state => ({
        friends: [
          ...state.friends, 
          {
            id: data.senderId,
            username: data.senderUsername,
            online: true
          }
        ]
      }));
    }
  });
  
  service.addEventListener('user_status', (data: UserStatus) => {
    // Update user status in the map
    set(state => {
      const newUserStatuses = new Map(state.userStatuses);
      newUserStatuses.set(data.id, data);
      
      // Also update online status in friends list
      const friends = state.friends.map(friend => {
        if (friend.id === data.id) {
          return {
            ...friend,
            online: data.status === 'online',
            lastSeen: data.status !== 'online' ? new Date(data.timestamp) : undefined
          };
        }
        return friend;
      });
      
      return {
        userStatuses: newUserStatuses,
        friends
      };
    });
  });
  
  service.addEventListener('social_activity', (data: SocialActivity) => {
    // Add to social activities list
    set(state => ({
      socialActivities: [...state.socialActivities, data].slice(-20) // Keep only most recent 20
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
    mutedPlayers: [],
    socialActivities: [],
    userStatuses: new Map<string, UserStatus>(),
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
      
      // Send acceptance message to the server
      if (request.senderId) {
        service.sendFriendResponse(request.senderId, true);
      }
      
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
    },
    
    // Reject a friend request
    rejectFriendRequest: (requestId) => {
      // Find the request
      const request = get().friendRequests.find(req => req.id === requestId);
      if (!request) return;
      
      // Send rejection message and remove request from list
      if (request.senderId) {
        service.sendFriendResponse(request.senderId, false);
      }
      
      set(state => ({
        friendRequests: state.friendRequests.filter(req => req.id !== requestId)
      }));
    },
    
    // Update user status
    updateUserStatus: (status) => {
      service.updateUserStatus(status);
    },
    
    // Get user's status
    getUserStatus: (userId) => {
      return get().userStatuses.get(userId);
    },
    
    // Share social activity
    shareSocialActivity: (type, details) => {
      service.shareSocialActivity(type, details);
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