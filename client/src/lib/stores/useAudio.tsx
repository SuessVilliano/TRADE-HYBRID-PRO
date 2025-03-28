import { create } from 'zustand';

interface AudioTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  category: 'metaverse' | 'trading' | 'game';
}

interface AudioStore {
  // Sound effects
  successSound: HTMLAudioElement | null;
  hitSound: HTMLAudioElement | null;
  backgroundMusic: HTMLAudioElement | null;
  
  // Music tracks
  musicTracks: AudioTrack[];
  currentTrackIndex: number;
  musicIsPlaying: boolean;
  
  // Volume levels
  sfxVolume: number;
  musicVolume: number;
  masterVolume: number;
  
  // Mute states
  sfxMuted: boolean;
  musicMuted: boolean;
  masterMuted: boolean;
  isMuted: boolean; // Combined mute state for convenience
  
  // Context-specific settings
  inMetaverse: boolean;
  
  // Functions to control audio
  setSuccessSound: (url: string) => void;
  setHitSound: (url: string) => void;
  setBackgroundMusic: (url: string) => void;
  
  playSuccess: () => void;
  playHit: () => void;
  playBackgroundMusic: () => void;
  pauseBackgroundMusic: () => void;
  
  // Enhanced music player functions
  playMusic: () => void;
  pauseMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setTrack: (index: number) => void;
  
  // Volume controls
  setSfxVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setMasterVolume: (volume: number) => void;
  
  // Mute toggles
  toggleSfxMuted: () => void;
  toggleMusicMuted: () => void;
  toggleMasterMuted: () => void;
  toggleMute: () => void;
  
  // Context toggling
  setInMetaverse: (inMetaverse: boolean) => void;
  
  // Track management
  setMusicTracks: (tracks: AudioTrack[]) => void;
  addMusicTrack: (track: AudioTrack) => void;
  
  // Utility functions
  playSuccessSound: () => void; // Alias for playSuccess
  playHitSound: () => void; // Alias for playHit
}

// Sample tracks
const defaultTracks: AudioTrack[] = [
  {
    id: 'metaverse-1',
    title: 'Metaverse Exploration',
    artist: 'Digital Dreams',
    url: '/sounds/background-music-1.mp3',
    category: 'metaverse',
  },
  {
    id: 'metaverse-2',
    title: 'Virtual Reality',
    artist: 'Cyber Wave',
    url: '/sounds/background-music-2.mp3',
    category: 'metaverse',
  },
  {
    id: 'trading-1',
    title: 'Market Analysis',
    artist: 'Trade Wizards',
    url: '/sounds/trading-music-1.mp3',
    category: 'trading',
  },
  {
    id: 'trading-2',
    title: 'Bull Run',
    artist: 'Crypto Beats',
    url: '/sounds/trading-music-2.mp3',
    category: 'trading',
  },
  {
    id: 'game-1',
    title: 'Bull vs Bear Battle',
    artist: 'Market Mayhem',
    url: '/sounds/game-music-1.mp3',
    category: 'game',
  },
];

export const useAudio = create<AudioStore>((set, get) => ({
  // Initial audio elements
  successSound: null,
  hitSound: null,
  backgroundMusic: null,
  
  // Music tracks
  musicTracks: defaultTracks,
  currentTrackIndex: 0,
  musicIsPlaying: false,
  
  // Volume defaults
  sfxVolume: 0.7,
  musicVolume: 0.5,
  masterVolume: 0.8,
  
  // Mute defaults
  sfxMuted: false,
  musicMuted: false,
  masterMuted: false,
  isMuted: false,
  
  // Context settings
  inMetaverse: false,
  
  // Set audio functions
  setSuccessSound: (url) => {
    const audio = new Audio(url);
    audio.volume = get().sfxVolume * get().masterVolume;
    set({ successSound: audio });
  },
  
  setHitSound: (url) => {
    const audio = new Audio(url);
    audio.volume = get().sfxVolume * get().masterVolume;
    set({ hitSound: audio });
  },
  
  setBackgroundMusic: (url) => {
    const audio = new Audio(url);
    audio.volume = get().musicVolume * get().masterVolume;
    audio.loop = true;
    set({ backgroundMusic: audio });
  },
  
  // Playback functions
  playSuccess: () => {
    const { successSound, sfxMuted, masterMuted } = get();
    if (successSound && !sfxMuted && !masterMuted) {
      successSound.currentTime = 0;
      successSound.play();
    }
  },
  
  playHit: () => {
    const { hitSound, sfxMuted, masterMuted } = get();
    if (hitSound && !sfxMuted && !masterMuted) {
      hitSound.currentTime = 0;
      hitSound.play();
    }
  },
  
  playBackgroundMusic: () => {
    const { backgroundMusic, musicMuted, masterMuted } = get();
    if (backgroundMusic && !musicMuted && !masterMuted) {
      backgroundMusic.play();
    }
  },
  
  pauseBackgroundMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
    }
  },
  
  // Enhanced music player
  playMusic: () => {
    const { musicTracks, currentTrackIndex, musicMuted, masterMuted } = get();
    
    if (musicTracks.length === 0 || musicMuted || masterMuted) return;
    
    const currentTrack = musicTracks[currentTrackIndex];
    const audio = new Audio(currentTrack.url);
    audio.volume = get().musicVolume * get().masterVolume;
    
    // Handle track ending
    audio.addEventListener('ended', () => {
      get().nextTrack();
    });
    
    // Stop any existing audio
    get().pauseMusic();
    
    // Play new track
    audio.play();
    
    set({ 
      backgroundMusic: audio,
      musicIsPlaying: true 
    });
  },
  
  pauseMusic: () => {
    const { backgroundMusic } = get();
    if (backgroundMusic) {
      backgroundMusic.pause();
      set({ musicIsPlaying: false });
    }
  },
  
  nextTrack: () => {
    const { musicTracks, currentTrackIndex, musicIsPlaying } = get();
    
    if (musicTracks.length === 0) return;
    
    const nextIndex = (currentTrackIndex + 1) % musicTracks.length;
    set({ currentTrackIndex: nextIndex });
    
    if (musicIsPlaying) {
      // Small delay to allow state to update
      setTimeout(() => {
        get().playMusic();
      }, 50);
    }
  },
  
  previousTrack: () => {
    const { musicTracks, currentTrackIndex, musicIsPlaying } = get();
    
    if (musicTracks.length === 0) return;
    
    const prevIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    set({ currentTrackIndex: prevIndex });
    
    if (musicIsPlaying) {
      // Small delay to allow state to update
      setTimeout(() => {
        get().playMusic();
      }, 50);
    }
  },
  
  setTrack: (index) => {
    const { musicTracks, musicIsPlaying } = get();
    
    if (index < 0 || index >= musicTracks.length) return;
    
    set({ currentTrackIndex: index });
    
    if (musicIsPlaying) {
      // Small delay to allow state to update
      setTimeout(() => {
        get().playMusic();
      }, 50);
    }
  },
  
  // Volume control functions
  setSfxVolume: (volume) => {
    const { successSound, hitSound } = get();
    const masterVolume = get().masterVolume;
    
    if (successSound) {
      successSound.volume = volume * masterVolume;
    }
    
    if (hitSound) {
      hitSound.volume = volume * masterVolume;
    }
    
    set({ sfxVolume: volume });
  },
  
  setMusicVolume: (volume) => {
    const { backgroundMusic } = get();
    const masterVolume = get().masterVolume;
    
    if (backgroundMusic) {
      backgroundMusic.volume = volume * masterVolume;
    }
    
    set({ musicVolume: volume });
  },
  
  setMasterVolume: (volume) => {
    const { sfxVolume, musicVolume, successSound, hitSound, backgroundMusic } = get();
    
    if (successSound) {
      successSound.volume = sfxVolume * volume;
    }
    
    if (hitSound) {
      hitSound.volume = sfxVolume * volume;
    }
    
    if (backgroundMusic) {
      backgroundMusic.volume = musicVolume * volume;
    }
    
    set({ masterVolume: volume });
  },
  
  // Mute toggle functions
  toggleSfxMuted: () => {
    set((state) => ({ sfxMuted: !state.sfxMuted }));
  },
  
  toggleMusicMuted: () => {
    const currentState = get().musicMuted;
    set({ musicMuted: !currentState });
    
    if (!currentState) {
      get().pauseBackgroundMusic();
    } else {
      get().playBackgroundMusic();
    }
  },
  
  toggleMasterMuted: () => {
    const currentState = get().masterMuted;
    set({ masterMuted: !currentState });
    
    if (!currentState) {
      get().pauseBackgroundMusic();
    } else {
      get().playBackgroundMusic();
    }
  },
  
  toggleMute: () => {
    const currentState = get().isMuted;
    const newState = !currentState;
    
    set({ 
      isMuted: newState,
      sfxMuted: newState,
      musicMuted: newState,
      masterMuted: newState
    });
    
    if (newState) {
      get().pauseBackgroundMusic();
    } else if (get().inMetaverse) {
      get().playBackgroundMusic();
    }
  },
  
  // Context functions
  setInMetaverse: (inMetaverse) => {
    set({ inMetaverse });
    
    // Adjust playback based on context
    if (inMetaverse) {
      // Filter tracks for metaverse category
      const metaverseTracks = get().musicTracks.filter(track => track.category === 'metaverse');
      
      if (metaverseTracks.length > 0) {
        // Find index in main tracks array
        const trackIndex = get().musicTracks.findIndex(track => track.id === metaverseTracks[0].id);
        if (trackIndex !== -1) {
          set({ currentTrackIndex: trackIndex });
          get().playMusic();
        }
      }
    } else {
      // Handle transition out of metaverse
      get().pauseMusic();
    }
  },
  
  // Track management
  setMusicTracks: (tracks) => {
    set({ musicTracks: tracks });
    // Reset current track to avoid out of bounds
    set({ currentTrackIndex: 0 });
  },
  
  addMusicTrack: (track) => {
    set((state) => ({
      musicTracks: [...state.musicTracks, track]
    }));
  },
  
  // Utility aliases
  playSuccessSound: () => {
    get().playSuccess();
  },
  
  playHitSound: () => {
    get().playHit();
  }
}));