import React, { useEffect, useState, useRef } from 'react';
import { Button } from '../ui/button';
import { 
  X, Maximize2, Minimize2, Volume2, VolumeX, 
  Building, Users, ChartBar, Store, Radio, School
} from 'lucide-react';
import { useAudio } from '../../lib/stores/useAudio';
import { Card } from '../ui/card';
import { cn } from '../../lib/utils';
import { useSpatialSDK } from './sdk/useSpatialSDK';
import { SPATIAL_CONFIG } from './sdk/config';
import { TradeHybridMetaverse } from './sdk/MetaverseObjects';

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
  const [showAreaControls, setShowAreaControls] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Initialize Spatial SDK
  const { 
    initialize, 
    isInitialized, 
    currentArea, 
    teleportToArea,
    initializeTradingEnvironment
  } = useSpatialSDK(false); // Don't auto-initialize

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
  
  // Handle loading state and initialize SDK
  const handleIframeLoad = () => {
    setIsLoading(false);
    console.log("Spatial iframe loaded successfully");
    
    // Initialize SDK after iframe is loaded
    if (iframeRef.current && !isInitialized) {
      const success = initialize(iframeRef.current);
      if (success) {
        console.log("Spatial SDK initialized");
        // Initialize the trading environment after a delay to ensure everything is loaded
        setTimeout(() => {
          initializeTradingEnvironment();
        }, 5000);
      }
    }
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

  // Get icon for area
  const getAreaIcon = (areaKey: string) => {
    switch (areaKey) {
      case 'reception':
        return <Building className="h-4 w-4" />;
      case 'tradingFloor':
        return <ChartBar className="h-4 w-4" />;
      case 'hybridHoldings':
        return <Users className="h-4 w-4" />;
      case 'streamingStudio':
        return <Radio className="h-4 w-4" />;
      case 'merchStore':
        return <Store className="h-4 w-4" />;
      case 'eventSpace':
        return <School className="h-4 w-4" />;
      default:
        return <Building className="h-4 w-4" />;
    }
  };

  // Track UI visibility for mobile
  const [controlsVisible, setControlsVisible] = useState(true);
  const [lastTouchY, setLastTouchY] = useState(0);

  // Handle touch gestures for mobile
  useEffect(() => {
    const handleTouchStart = (e: TouchEvent) => {
      setLastTouchY(e.touches[0].clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      const touchY = e.touches[0].clientY;
      const diff = touchY - lastTouchY;
      
      // Swipe down from top shows controls, swipe up hides them
      if (diff > 50 && !controlsVisible) {
        setControlsVisible(true);
      } else if (diff < -50 && controlsVisible) {
        setControlsVisible(false);
      }
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    
    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
    };
  }, [controlsVisible, lastTouchY]);

  // Toggle UI elements visibility
  const toggleControlsVisibility = () => {
    setControlsVisible(!controlsVisible);
  };

  return (
    <div className={cn(
      "relative w-full", 
      fullWidth ? "h-[calc(100vh-80px)]" : "h-[600px]",
      isFullscreen ? "fixed inset-0 z-50 bg-background" : ""
    )}>
      {/* Controls visibility toggle (for mobile) */}
      <button 
        onClick={toggleControlsVisibility}
        className={`absolute top-2 right-2 z-20 bg-blue-600 rounded-full p-2 shadow-lg md:hidden ${
          controlsVisible ? 'opacity-0 pointer-events-none' : 'opacity-100 pointer-events-auto'
        }`}
        aria-label="Show Controls"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="17 11 12 6 7 11"></polyline>
          <polyline points="17 18 12 13 7 18"></polyline>
        </svg>
      </button>
      
      {/* Controls overlay - conditionally visible on mobile */}
      <div className={`absolute top-0 right-0 z-10 p-2 flex space-x-2 transition-opacity duration-300 ${
        controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
      }`}>
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
      
      {/* Area navigation controls - conditionally visible on mobile */}
      <div className={`absolute left-4 top-4 z-10 transition-opacity duration-300 ${
        controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
      }`}>
        <Button
          variant="ghost"
          className="bg-black/40 hover:bg-black/60 text-white mb-2"
          onClick={() => setShowAreaControls(!showAreaControls)}
        >
          {showAreaControls ? "Hide Areas" : "Explore Areas"}
        </Button>
        
        {showAreaControls && (
          <div className="p-2 bg-black/60 rounded-md space-y-2 w-48">
            <div className="text-white text-xs font-medium mb-1">Teleport to Area</div>
            {Object.entries(SPATIAL_CONFIG.areas).map(([key, area]) => (
              <Button 
                key={key}
                variant="ghost" 
                size="sm"
                className={cn(
                  "w-full justify-start text-white",
                  currentArea === key ? "bg-white/20" : "bg-transparent"
                )}
                onClick={() => teleportToArea(key)}
              >
                <span className="mr-2">{getAreaIcon(key)}</span>
                <span className="text-xs">{area.name}</span>
              </Button>
            ))}
          </div>
        )}
      </div>
      
      {/* Current area info - conditionally visible on mobile */}
      {currentArea && !isLoading && (
        <div className={`absolute left-4 bottom-4 z-10 p-3 bg-black/60 rounded-md max-w-xs transition-opacity duration-300 ${
          controlsVisible ? 'opacity-100' : 'opacity-0 pointer-events-none md:opacity-100 md:pointer-events-auto'
        }`}>
          <h3 className="text-white text-sm font-medium">
            {SPATIAL_CONFIG.areas[currentArea as keyof typeof SPATIAL_CONFIG.areas]?.name}
          </h3>
          <p className="text-white/70 text-xs mt-1">
            {SPATIAL_CONFIG.areas[currentArea as keyof typeof SPATIAL_CONFIG.areas]?.description}
          </p>
        </div>
      )}
      
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
          ref={iframeRef}
          src={`${spatialUrl}${autoEnterVR ? '&vr=true' : ''}`}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          allow="microphone; camera; midi; xr-spatial-tracking; accelerometer; gyroscope; picture-in-picture; fullscreen"
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
          loading="lazy"
          title="Trade Hybrid Metaverse powered by Spatial"
        />
      </Card>
      
      {/* Metaverse Objects - These components don't render visually but manage the objects in the metaverse */}
      {isInitialized && <TradeHybridMetaverse />}
    </div>
  );
}