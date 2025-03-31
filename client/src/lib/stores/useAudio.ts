import { create } from 'zustand';

interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string;
  category?: string;
  mood?: string;
}

interface AudioStore {
  // Core audio settings
  isMuted: boolean;
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  
  // Music player state
  musicTracks: MusicTrack[];
  currentTrackIndex: number;
  musicIsPlaying: boolean;
  musicMuted: boolean;
  inMetaverse: boolean;  // Whether we're in the metaverse environment
  
  // Core audio methods
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  playSound: (soundId: string) => void;
  
  // Music player methods
  playMusic: () => void;
  pauseMusic: () => void;
  nextTrack: () => void;
  previousTrack: () => void;
  setMusicTrack: (index: number) => void;
  toggleMusicMuted: () => void;
  addMusicTrack: (track: MusicTrack) => void;
  
  // Metaverse-specific methods
  setInMetaverse: (inMetaverse: boolean) => void;
}

export const useAudio = create<AudioStore>((set, get) => ({
  // Core audio settings
  isMuted: false,
  masterVolume: 70,
  musicVolume: 60,
  effectsVolume: 80,
  
  // Music player state
  musicTracks: [
    {
      id: 'default-background',
      title: 'Trading Ambience',
      artist: 'TradeHybrid',
      url: '/sounds/background.mp3',
      category: 'trading',
      mood: 'focus'
    }
  ],
  currentTrackIndex: 0,
  musicIsPlaying: false,
  musicMuted: false,
  inMetaverse: false,
  
  // Core audio methods
  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),
  
  setMasterVolume: (volume: number) => set({ masterVolume: volume }),
  
  setMusicVolume: (volume: number) => set({ musicVolume: volume }),
  
  setEffectsVolume: (volume: number) => set({ effectsVolume: volume }),
  
  playSound: (soundId: string) => {
    const { isMuted, masterVolume, effectsVolume } = get();
    
    if (isMuted || masterVolume === 0 || effectsVolume === 0) {
      return;
    }
    
    // Volume calculation - both master and effect
    const calculatedVolume = (masterVolume / 100) * (effectsVolume / 100);
    
    // In a complete implementation, we would trigger actual sound playback here
    console.log(`Playing sound: ${soundId} at volume ${calculatedVolume}`);
    
    // Example of how sound playback might be implemented with Howler.js or similar
    // if (sounds[soundId]) {
    //   sounds[soundId].volume(calculatedVolume);
    //   sounds[soundId].play();
    // }
  },
  
  // Music player methods
  playMusic: () => {
    const state = get();
    
    if (state.isMuted || state.musicMuted || state.musicVolume === 0) {
      console.log('Music playback attempted but audio is muted or volume is 0');
      return;
    }
    
    // In a complete implementation, we would play the current track
    console.log(`Playing music track: ${state.musicTracks[state.currentTrackIndex]?.title}`);
    set({ musicIsPlaying: true });
  },
  
  pauseMusic: () => {
    console.log('Pausing music playback');
    set({ musicIsPlaying: false });
  },
  
  nextTrack: () => {
    const { musicTracks, currentTrackIndex, musicIsPlaying } = get();
    const nextIndex = (currentTrackIndex + 1) % musicTracks.length;
    
    set({ currentTrackIndex: nextIndex });
    
    if (musicIsPlaying) {
      // If already playing, restart with the new track
      get().pauseMusic();
      get().playMusic();
    }
  },
  
  previousTrack: () => {
    const { musicTracks, currentTrackIndex, musicIsPlaying } = get();
    const prevIndex = (currentTrackIndex - 1 + musicTracks.length) % musicTracks.length;
    
    set({ currentTrackIndex: prevIndex });
    
    if (musicIsPlaying) {
      // If already playing, restart with the new track
      get().pauseMusic();
      get().playMusic();
    }
  },
  
  setMusicTrack: (index: number) => {
    const { musicTracks, musicIsPlaying } = get();
    
    if (index >= 0 && index < musicTracks.length) {
      set({ currentTrackIndex: index });
      
      if (musicIsPlaying) {
        // If already playing, restart with the new track
        get().pauseMusic();
        get().playMusic();
      }
    }
  },
  
  toggleMusicMuted: () => {
    const { musicMuted, musicIsPlaying } = get();
    set({ musicMuted: !musicMuted });
    
    if (musicIsPlaying && !musicMuted) {
      // If toggling from unmuted to muted while playing
      get().pauseMusic();
    } else if (!musicIsPlaying && musicMuted) {
      // If toggling from muted to unmuted while paused
      get().playMusic();
    }
  },
  
  addMusicTrack: (track: MusicTrack) => {
    set((state) => ({
      musicTracks: [...state.musicTracks, track]
    }));
  },
  
  // Metaverse-specific methods
  setInMetaverse: (inMetaverse: boolean) => {
    set({ inMetaverse });
    console.log(`Metaverse environment ${inMetaverse ? 'entered' : 'exited'}`);
  }
}));