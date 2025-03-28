import { useState, useEffect } from 'react';
import { useAudio } from '@/lib/stores/useAudio';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Play, Pause, SkipBack, SkipForward, Volume, Volume1, Volume2, VolumeX } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MusicPlayerProps {
  className?: string;
  showInTrading?: boolean;
}

export function MusicPlayer({ className, showInTrading = false }: MusicPlayerProps) {
  const { 
    musicTracks, 
    currentTrackIndex,
    musicIsPlaying,
    musicVolume,
    isMuted,
    inMetaverse,
    playMusic,
    pauseMusic,
    nextTrack,
    previousTrack,
    setMusicVolume,
    toggleMute
  } = useAudio();
  
  // Only show in metaverse or when specifically requested
  if (!inMetaverse && !showInTrading) return null;
  
  const currentTrack = musicTracks[currentTrackIndex];
  
  // Get the appropriate volume icon
  const VolumeIcon = isMuted 
    ? VolumeX 
    : musicVolume > 0.6 
      ? Volume2 
      : musicVolume > 0.2 
        ? Volume1 
        : Volume;
  
  return (
    <div className={cn(
      "bg-black/70 backdrop-blur-sm p-3 rounded-lg shadow-lg", 
      showInTrading ? "w-full" : "w-64",
      className
    )}>
      <div className="flex flex-col space-y-2">
        {/* Track info */}
        <div className="text-center">
          <p className="font-medium truncate text-white">{currentTrack.title}</p>
          <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center justify-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={previousTrack}
          >
            <SkipBack className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10 h-9 w-9"
            onClick={musicIsPlaying ? pauseMusic : playMusic}
          >
            {musicIsPlaying ? (
              <Pause className="h-5 w-5" />
            ) : (
              <Play className="h-5 w-5" />
            )}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10"
            onClick={nextTrack}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
        
        {/* Volume control */}
        <div className="flex items-center space-x-2">
          <Button 
            variant="ghost" 
            size="icon"
            className="text-white hover:bg-white/10 h-6 w-6"
            onClick={toggleMute}
          >
            <VolumeIcon className="h-3 w-3" />
          </Button>
          
          <Slider
            value={[isMuted ? 0 : musicVolume * 100]}
            max={100}
            step={1}
            className="flex-1"
            onValueChange={(value) => setMusicVolume(value[0] / 100)}
          />
        </div>
      </div>
    </div>
  );
}