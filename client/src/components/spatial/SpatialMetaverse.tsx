import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { X, Maximize2, Minimize2, Volume2, VolumeX } from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';

interface SpatialMetaverseProps {
  spatialUrl?: string;
  fullWidth?: boolean;
  autoEnterVR?: boolean;
}

const DEFAULT_SPATIAL_URL = 'https://www.spatial.io/s/tradehybrids-Hi-Fi-Meetup-67ead44037f57e72f6fcaed5?share=93452074553144377';

export default function SpatialMetaverse({ 
  spatialUrl = DEFAULT_SPATIAL_URL, 
  fullWidth = true,
  autoEnterVR = false
}: SpatialMetaverseProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  
  // Set that we're in the metaverse environment
  useEffect(() => {
    // Get the audio store state directly
    const audioStore = useAudio.getState();
    
    // Tell the audio system we're in the metaverse
    audioStore.setInMetaverse(true);
    
    // In this case, we'll pause our own music since Spatial has its own audio
    audioStore.pauseMusic();
    
    console.log("SpatialMetaverse component mounted, pausing internal audio");
    
    return () => {
      // Reset when component unmounts
      audioStore.setInMetaverse(false);
      console.log("SpatialMetaverse component unmounted");
    };
  }, []);
  
  // Handle loading state
  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log("Spatial iframe loaded successfully");
  };
  
  // Toggle fullscreen mode
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    console.log(`Fullscreen mode ${!isFullscreen ? 'enabled' : 'disabled'}`);
  };
  
  // Toggle audio mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    console.log(`Mute state updated: ${!isMuted}`);
    // Note: This doesn't actually mute Spatial's audio, as that would need
    // to be controlled via Spatial's API if available
  };

  return (
    <div className={cn(
      "relative w-full", 
      fullWidth ? "h-[calc(100vh-80px)]" : "h-[600px]",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
    )}>
      {/* Controls overlay */}
      <div className="absolute top-0 right-0 z-10 p-2 flex space-x-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/40 hover:bg-black/60 text-white"
          onClick={toggleMute}
        >
          {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
        </Button>
        
        <Button 
          variant="ghost" 
          size="icon" 
          className="bg-black/40 hover:bg-black/60 text-white"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Loading indicator */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <p className="text-lg font-medium">Loading Metaverse...</p>
            <p className="text-sm text-muted-foreground">Powered by Spatial</p>
          </div>
        </div>
      )}
      
      {/* Spatial iframe */}
      <Card className="w-full h-full overflow-hidden border-0">
        <iframe 
          src={`${spatialUrl}${autoEnterVR ? '&vr=true' : ''}`}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          allow="microphone; camera; midi; xr-spatial-tracking; accelerometer; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          title="Trade Hybrid Metaverse powered by Spatial"
        />
      </Card>
    </div>
  );
}