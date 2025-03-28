import { useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';

export function AudioInitializer() {
  // This component will be responsible for initializing audio assets
  // and handling permission requests
  
  useEffect(() => {
    const initializeAudio = async () => {
      try {
        // Create audio elements
        const backgroundMusic = new Audio('/sounds/background.mp3');
        backgroundMusic.loop = true;
        backgroundMusic.volume = 0.3;
        
        const hitSound = new Audio('/sounds/hit.mp3');
        hitSound.volume = 0.4;
        
        const successSound = new Audio('/sounds/success.mp3');
        successSound.volume = 0.5;
        
        // Initialize music tracks (if not already initialized)
        const audioStore = useAudio.getState();
        const tracks = audioStore.musicTracks;
        
        // Pre-load all music tracks
        const updatedTracks = [...tracks];
        tracks.forEach((track, index) => {
          // First track becomes the background music
          if (index === 0) {
            backgroundMusic.src = track.url;
          }
        });
        
        // Store audio elements in global state
        audioStore.setBackgroundMusic(backgroundMusic.src);
        audioStore.setHitSound(hitSound.src);
        audioStore.setSuccessSound(successSound.src);
        
        console.log('Audio assets initialized successfully');
        
        // Check if we need to start playing music (if in metaverse)
        if (audioStore.inMetaverse && !audioStore.isMuted) {
          audioStore.playMusic();
        }
      } catch (error) {
        console.error('Error initializing audio assets:', error);
      }
    };
    
    initializeAudio();
  }, []);
  
  return null; // This is a non-visual component
}

// This component shows a permission dialog for audio
export function AudioPermissionDialog({
  onRequestPermission,
  isOpen,
  onClose
}: {
  onRequestPermission: () => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black/50">
      <div className="bg-background rounded-lg p-6 max-w-md mx-4 shadow-xl">
        <h2 className="text-xl font-bold mb-4">Enable Audio</h2>
        <p className="mb-4 text-muted-foreground">
          Trade Hybrid uses audio to enhance your experience with sound effects and game audio.
          Would you like to enable audio now?
        </p>
        <p className="mb-6 text-sm text-muted-foreground">
          You can change this setting at any time.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded-md hover:bg-background-secondary"
          >
            Not Now
          </button>
          <button
            onClick={() => {
              onRequestPermission();
              onClose();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Enable Audio
          </button>
        </div>
      </div>
    </div>
  );
}