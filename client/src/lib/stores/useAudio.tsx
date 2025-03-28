import { create } from "zustand";

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  path: string;
  element?: HTMLAudioElement;
}

interface AudioState {
  backgroundMusic: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  successSound: HTMLAudioElement | null;
  isMuted: boolean;
  voiceChatEnabled: boolean;
  microphoneStream: MediaStream | null;
  audioPanners: Map<string, PannerNode>;
  audioContext: AudioContext | null;
  playerSpeakers: Map<string, MediaStreamAudioSourceNode>;
  
  // Music player state
  musicTracks: MusicTrack[];
  currentTrackIndex: number;
  musicIsPlaying: boolean;
  musicVolume: number;
  inMetaverse: boolean;
  
  // Setter functions
  setBackgroundMusic: (music: HTMLAudioElement) => void;
  setHitSound: (sound: HTMLAudioElement) => void;
  setSuccessSound: (sound: HTMLAudioElement) => void;
  
  // Control functions
  toggleMute: () => void;
  playHit: () => void;
  playSuccess: () => void;
  playHitSound: () => void;
  playSuccessSound: () => void;
  
  // Music control functions
  playMusic: () => void;
  pauseMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setMusicVolume: (volume: number) => void;
  setInMetaverse: (inMetaverse: boolean) => void;
  
  // Voice chat functions
  enableVoiceChat: () => Promise<boolean>;
  disableVoiceChat: () => void;
  updateAudioPosition: (playerId: string, position: [number, number, number], listenerPosition: [number, number, number], listenerRotation: number) => void;
  addPlayerAudio: (playerId: string, stream: MediaStream) => void;
  removePlayerAudio: (playerId: string) => void;
  getMicrophoneStream: () => MediaStream | null;
}

export const useAudio = create<AudioState>((set, get) => ({
  backgroundMusic: null,
  hitSound: null,
  successSound: null,
  isMuted: true, // Start muted by default
  voiceChatEnabled: false,
  microphoneStream: null,
  audioPanners: new Map(),
  audioContext: null,
  playerSpeakers: new Map(),
  
  // Music player state
  musicTracks: [
    {
      id: 'track1',
      title: 'Trade Hybrid Theme',
      artist: 'Metaverse Beats',
      path: '/sounds/background.mp3'
    },
    {
      id: 'track2',
      title: 'Crypto Trading',
      artist: 'Digital Assets',
      path: '/sounds/crypto.mp3'
    },
    {
      id: 'track3',
      title: 'Market Pulse',
      artist: 'Trading Vibes',
      path: '/sounds/market.mp3'
    }
  ],
  currentTrackIndex: 0,
  musicIsPlaying: false,
  musicVolume: 0.7,
  inMetaverse: false,
  
  setBackgroundMusic: (music) => {
    set({ backgroundMusic: music });
    
    // Try to play the background music if not muted
    if (!get().isMuted) {
      music.play().catch(error => {
        console.log("Background music play prevented:", error);
      });
    }
  },
  setHitSound: (sound) => set({ hitSound: sound }),
  setSuccessSound: (sound) => set({ successSound: sound }),
  
  toggleMute: () => {
    const { isMuted, backgroundMusic } = get();
    const newMutedState = !isMuted;
    
    // Update the muted state
    set({ isMuted: newMutedState });
    
    // Handle background music when mute state changes
    if (backgroundMusic) {
      if (newMutedState) {
        backgroundMusic.pause();
      } else {
        backgroundMusic.play().catch(error => {
          console.log("Background music play prevented:", error);
        });
      }
    }
    
    // Log the change
    console.log(`Sound ${newMutedState ? 'muted' : 'unmuted'}`);
  },
  
  playHit: () => {
    const { hitSound, isMuted } = get();
    if (hitSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Hit sound skipped (muted)");
        return;
      }
      
      // Clone the sound to allow overlapping playback
      const soundClone = hitSound.cloneNode() as HTMLAudioElement;
      soundClone.volume = 0.3;
      soundClone.play().catch(error => {
        console.log("Hit sound play prevented:", error);
      });
    }
  },
  
  playSuccess: () => {
    const { successSound, isMuted } = get();
    if (successSound) {
      // If sound is muted, don't play anything
      if (isMuted) {
        console.log("Success sound skipped (muted)");
        return;
      }
      
      successSound.currentTime = 0;
      successSound.play().catch(error => {
        console.log("Success sound play prevented:", error);
      });
    }
  },
  
  // Voice chat functions
  enableVoiceChat: async () => {
    try {
      // Initialize the audio context if not already available
      let audioCtx = get().audioContext;
      if (!audioCtx) {
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Set up listener properties for 3D audio
        const listener = audioCtx.listener;
        if (listener.positionX) {
          listener.positionX.value = 0;
          listener.positionY.value = 1.6; // Approximate human ear height
          listener.positionZ.value = 0;
          listener.forwardX.value = 0;
          listener.forwardY.value = 0;
          listener.forwardZ.value = -1;
          listener.upX.value = 0;
          listener.upY.value = 1;
          listener.upZ.value = 0;
        } else {
          // Fallback for older browsers
          listener.setPosition(0, 1.6, 0);
          listener.setOrientation(0, 0, -1, 0, 1, 0);
        }
        
        set({ audioContext: audioCtx });
      }
      
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      set({ 
        microphoneStream: stream,
        voiceChatEnabled: true 
      });
      
      return true;
    } catch (error) {
      console.error("Error enabling voice chat:", error);
      set({ voiceChatEnabled: false });
      return false;
    }
  },
  
  disableVoiceChat: () => {
    const { microphoneStream, playerSpeakers, audioPanners } = get();
    
    // Stop all microphone tracks
    if (microphoneStream) {
      microphoneStream.getTracks().forEach(track => track.stop());
    }
    
    // Clean up audio nodes
    playerSpeakers.forEach(source => {
      try {
        source.disconnect();
      } catch (e) {
        // Ignore disconnection errors
      }
    });
    
    audioPanners.forEach(panner => {
      try {
        panner.disconnect();
      } catch (e) {
        // Ignore disconnection errors
      }
    });
    
    // Reset state
    set({
      voiceChatEnabled: false,
      microphoneStream: null,
      playerSpeakers: new Map(),
      audioPanners: new Map()
    });
  },
  
  getMicrophoneStream: () => {
    return get().microphoneStream;
  },
  
  addPlayerAudio: (playerId: string, stream: MediaStream) => {
    const { audioContext, playerSpeakers, audioPanners } = get();
    
    if (!audioContext) return;
    
    // Create source and panner nodes if they don't exist
    if (!playerSpeakers.has(playerId)) {
      // Create audio source from the stream
      const source = audioContext.createMediaStreamSource(stream);
      
      // Create panner node for spatial audio
      const panner = audioContext.createPanner();
      panner.panningModel = 'HRTF'; // Head-related transfer function for better 3D effect
      panner.distanceModel = 'exponential';
      panner.refDistance = 1; // Reference distance
      panner.maxDistance = 30; // Max distance to hear
      panner.rolloffFactor = 1.5; // How quickly the sound fades with distance
      panner.coneInnerAngle = 360; // Full directional audio
      panner.coneOuterAngle = 0;
      panner.coneOuterGain = 0;
      
      // Position at origin initially
      if (panner.positionX) {
        panner.positionX.value = 0;
        panner.positionY.value = 0;
        panner.positionZ.value = 0;
      } else {
        // Fallback for older browsers
        panner.setPosition(0, 0, 0);
      }
      
      // Connect source to panner, and panner to destination
      source.connect(panner);
      panner.connect(audioContext.destination);
      
      // Store the nodes
      playerSpeakers.set(playerId, source);
      audioPanners.set(playerId, panner);
      
      // Update the state
      set({ 
        playerSpeakers: new Map(playerSpeakers),
        audioPanners: new Map(audioPanners)
      });
    }
  },
  
  removePlayerAudio: (playerId: string) => {
    const { playerSpeakers, audioPanners } = get();
    
    // Disconnect and remove the player's audio nodes
    if (playerSpeakers.has(playerId)) {
      const source = playerSpeakers.get(playerId);
      if (source) {
        try {
          source.disconnect();
        } catch (e) {
          // Ignore disconnection errors
        }
      }
      playerSpeakers.delete(playerId);
    }
    
    if (audioPanners.has(playerId)) {
      const panner = audioPanners.get(playerId);
      if (panner) {
        try {
          panner.disconnect();
        } catch (e) {
          // Ignore disconnection errors
        }
      }
      audioPanners.delete(playerId);
    }
    
    // Update the state
    set({ 
      playerSpeakers: new Map(playerSpeakers),
      audioPanners: new Map(audioPanners)
    });
  },
  
  updateAudioPosition: (playerId: string, position: [number, number, number], listenerPosition: [number, number, number], listenerRotation: number) => {
    const { audioPanners, audioContext } = get();
    
    if (!audioContext) return;
    
    // Get the panner for this player
    const panner = audioPanners.get(playerId);
    if (!panner) return;
    
    // Calculate the distance between listener and player
    const dx = position[0] - listenerPosition[0];
    const dy = position[1] - listenerPosition[1];
    const dz = position[2] - listenerPosition[2];
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    
    // If too far, make inaudible
    if (distance > 30) {
      if (panner.positionX) {
        panner.positionX.value = 0;
        panner.positionY.value = 0;
        panner.positionZ.value = 0;
      } else {
        panner.setPosition(0, 0, 0);
      }
      return;
    }
    
    // Volume decreases with distance (inverse square law)
    const volumeFactor = Math.min(1, 1 / (distance * distance * 0.05));
    
    // Apply listener's rotation to properly orient the audio
    const cosRotation = Math.cos(listenerRotation);
    const sinRotation = Math.sin(listenerRotation);
    
    // Transform player position relative to listener's orientation
    const rotatedX = dx * cosRotation - dz * sinRotation;
    const rotatedZ = dx * sinRotation + dz * cosRotation;
    
    // Update panner position - account for listener height
    if (panner.positionX) {
      // Modern approach using AudioParam
      panner.positionX.value = rotatedX * volumeFactor;
      panner.positionY.value = (position[1] - listenerPosition[1]) * volumeFactor;
      panner.positionZ.value = rotatedZ * volumeFactor;
    } else {
      // Fallback for older browsers
      panner.setPosition(
        rotatedX * volumeFactor,
        (position[1] - listenerPosition[1]) * volumeFactor,
        rotatedZ * volumeFactor
      );
    }
  },
  
  // Music player functions
  playMusic: () => {
    const { backgroundMusic, isMuted, musicTracks, currentTrackIndex, inMetaverse, musicVolume } = get();
    
    // Only play in metaverse mode if configured
    if (!inMetaverse) {
      console.log("Music not playing: not in metaverse");
      return;
    }
    
    // Don't play if muted
    if (isMuted) {
      console.log("Music not playing: audio muted");
      return;
    }
    
    // If we have an existing audio element, use it
    if (backgroundMusic) {
      backgroundMusic.volume = musicVolume;
      backgroundMusic.play().catch(error => {
        console.log("Music play prevented:", error);
      });
      set({ musicIsPlaying: true });
      return;
    }
    
    // Otherwise initialize the current track
    const currentTrack = musicTracks[currentTrackIndex];
    if (currentTrack) {
      if (!currentTrack.element) {
        const audio = new Audio(currentTrack.path);
        audio.loop = true;
        audio.volume = musicVolume;
        currentTrack.element = audio;
        
        // Update the track in our tracks array
        const updatedTracks = [...musicTracks];
        updatedTracks[currentTrackIndex] = currentTrack;
        set({ musicTracks: updatedTracks });
      }
      
      currentTrack.element.play().catch(error => {
        console.log("Music play prevented:", error);
      });
      
      set({ 
        backgroundMusic: currentTrack.element,
        musicIsPlaying: true 
      });
    }
  },
  
  pauseMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      set({ musicIsPlaying: false });
    }
  },
  
  nextTrack: () => {
    const { musicTracks, currentTrackIndex, backgroundMusic, musicIsPlaying, musicVolume } = get();
    
    // Pause current track if playing
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    
    // Calculate next track index (with wrapping)
    const nextIndex = (currentTrackIndex + 1) % musicTracks.length;
    
    // Get the next track
    const nextTrack = musicTracks[nextIndex];
    if (!nextTrack.element) {
      const audio = new Audio(nextTrack.path);
      audio.loop = true;
      audio.volume = musicVolume;
      nextTrack.element = audio;
      
      // Update the track in our tracks array
      const updatedTracks = [...musicTracks];
      updatedTracks[nextIndex] = nextTrack;
      set({ musicTracks: updatedTracks });
    }
    
    // If we were playing, start the new track
    if (musicIsPlaying && !get().isMuted) {
      nextTrack.element.play().catch(error => {
        console.log("Music play prevented:", error);
      });
    }
    
    set({
      currentTrackIndex: nextIndex,
      backgroundMusic: nextTrack.element
    });
  },
  
  previousTrack: () => {
    const { musicTracks, currentTrackIndex, backgroundMusic, musicIsPlaying, musicVolume } = get();
    
    // Pause current track if playing
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
    
    // Calculate previous track index (with wrapping)
    const prevIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    
    // Get the previous track
    const prevTrack = musicTracks[prevIndex];
    if (!prevTrack.element) {
      const audio = new Audio(prevTrack.path);
      audio.loop = true;
      audio.volume = musicVolume;
      prevTrack.element = audio;
      
      // Update the track in our tracks array
      const updatedTracks = [...musicTracks];
      updatedTracks[prevIndex] = prevTrack;
      set({ musicTracks: updatedTracks });
    }
    
    // If we were playing, start the new track
    if (musicIsPlaying && !get().isMuted) {
      prevTrack.element.play().catch(error => {
        console.log("Music play prevented:", error);
      });
    }
    
    set({
      currentTrackIndex: prevIndex,
      backgroundMusic: prevTrack.element
    });
  },
  
  setMusicVolume: (volume: number) => {
    const { backgroundMusic } = get();
    
    // Clamp volume to valid range
    const clampedVolume = Math.max(0, Math.min(1, volume));
    
    // Update volume of current track if playing
    if (backgroundMusic) {
      backgroundMusic.volume = clampedVolume;
    }
    
    // Store the new volume
    set({ musicVolume: clampedVolume });
  },
  
  setInMetaverse: (inMetaverse: boolean) => {
    const { musicIsPlaying, backgroundMusic } = get();
    
    // Update our state
    set({ inMetaverse });
    
    // Handle music autoplay/pause based on context
    if (inMetaverse) {
      // In metaverse, we want to play if not muted
      if (!get().isMuted && !musicIsPlaying && backgroundMusic) {
        backgroundMusic.play().catch(error => {
          console.log("Music play prevented:", error);
        });
        set({ musicIsPlaying: true });
      }
    } else {
      // Out of metaverse, we want to pause
      if (musicIsPlaying && backgroundMusic) {
        backgroundMusic.pause();
        set({ musicIsPlaying: false });
      }
    }
  },
  
  // Alias functions for compatibility
  playHitSound: () => {
    get().playHit();
  },
  
  playSuccessSound: () => {
    get().playSuccess();
  }
}));
