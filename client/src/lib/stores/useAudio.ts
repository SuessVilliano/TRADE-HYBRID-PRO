import { create } from 'zustand';

interface AudioStore {
  isMuted: boolean;
  masterVolume: number;
  musicVolume: number;
  effectsVolume: number;
  toggleMute: () => void;
  setMasterVolume: (volume: number) => void;
  setMusicVolume: (volume: number) => void;
  setEffectsVolume: (volume: number) => void;
  playSound: (soundId: string) => void;
}

export const useAudio = create<AudioStore>((set, get) => ({
  isMuted: false,
  masterVolume: 70,
  musicVolume: 60,
  effectsVolume: 80,
  
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
  }
}));