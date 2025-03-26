import React, { useState, useEffect, useRef } from 'react';
import { Button } from './button';
import { Camera, X, Share } from 'lucide-react';
import { toast } from 'sonner';

interface AugmentedRealityProps {
  isOpen: boolean;
  onClose: () => void;
  modelPath?: string;
}

export function AugmentedReality({ isOpen, onClose, modelPath = '/models/trading_floor.glb' }: AugmentedRealityProps) {
  const [isARSupported, setIsARSupported] = useState(false);
  const [arStatus, setARStatus] = useState<'inactive' | 'starting' | 'active' | 'placed' | 'failed'>('inactive');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [modelPosition, setModelPosition] = useState({ x: 0, y: 0, scale: 1 });
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Touch gesture handling state
  const [touchState, setTouchState] = useState({
    lastDistance: 0,
    touchStart: { x: 0, y: 0 },
    isDragging: false
  });

  // Check if WebXR is supported
  useEffect(() => {
    const checkARSupport = async () => {
      // Check if the browser supports WebXR with AR capabilities
      if ('xr' in navigator) {
        try {
          const isSupported = await (navigator as any).xr?.isSessionSupported('immersive-ar');
          setIsARSupported(isSupported);
        } catch (error) {
          console.error('Failed to check AR support:', error);
          setIsARSupported(false);
        }
      } else {
        // Fallback to check for basic camera access for image-based AR
        setIsARSupported(true);
      }
    };

    checkARSupport();
  }, []);
  
  // Handle pinch to zoom gesture
  const handleTouchMove = (e: React.TouchEvent) => {
    if (arStatus !== 'placed') return;
    
    // Handle pinch to zoom with two fingers
    if (e.touches.length === 2) {
      e.preventDefault();
      
      // Calculate the distance between the two touches
      const touch1 = e.touches[0];
      const touch2 = e.touches[1];
      const dx = touch1.clientX - touch2.clientX;
      const dy = touch1.clientY - touch2.clientY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // If we have a previous distance to compare to
      if (touchState.lastDistance > 0) {
        // Calculate the scale change
        const scaleFactor = distance / touchState.lastDistance;
        // Apply the scale change (limit min/max scale)
        setModelPosition(prev => ({
          ...prev,
          scale: Math.max(0.5, Math.min(2.0, prev.scale * scaleFactor))
        }));
      }
      
      // Update the last distance
      setTouchState(prev => ({ ...prev, lastDistance: distance }));
    } 
    // Handle panning with one finger
    else if (e.touches.length === 1 && touchState.isDragging) {
      const touch = e.touches[0];
      const deltaX = touch.clientX - touchState.touchStart.x;
      const deltaY = touch.clientY - touchState.touchStart.y;
      
      // Move the model based on drag distance
      setModelPosition(prev => ({
        ...prev,
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
      
      // Update touch start position for next move
      setTouchState(prev => ({
        ...prev,
        touchStart: {
          x: touch.clientX,
          y: touch.clientY
        }
      }));
    }
  };
  
  // Handle touch start for dragging
  const handleTouchStart = (e: React.TouchEvent) => {
    if (arStatus === 'placed' && e.touches.length === 1) {
      const touch = e.touches[0];
      setTouchState(prev => ({
        ...prev,
        touchStart: {
          x: touch.clientX,
          y: touch.clientY
        },
        isDragging: true
      }));
    }
  };
  
  // Reset touch state on touch end
  const handleTouchEnd = () => {
    setTouchState({
      lastDistance: 0,
      touchStart: { x: 0, y: 0 },
      isDragging: false
    });
  };

  // Initialize AR view when component becomes visible
  useEffect(() => {
    if (isOpen && arStatus === 'inactive') {
      initializeAR();
    }

    // Cleanup when component is closed
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [isOpen]);

  // Initialize the AR experience
  const initializeAR = async () => {
    setARStatus('starting');

    try {
      // Check camera permissions
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 } 
        } 
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setHasPermission(true);
        videoRef.current.onloadedmetadata = () => {
          setIsCameraReady(true);
          setARStatus('active');
        };
      }
    } catch (error) {
      console.error('Failed to initialize AR:', error);
      setARStatus('failed');
      toast("Camera access denied", {
        description: "Please allow camera access to use AR features.",
      });
    }
  };

  // Attempt to use WebXR AR session if available
  const startNativeAR = async () => {
    try {
      if ((navigator as any).xr) {
        const session = await (navigator as any).xr.requestSession('immersive-ar', {
          requiredFeatures: ['hit-test'],
          optionalFeatures: ['dom-overlay'],
          domOverlay: { root: document.getElementById('ar-overlay') }
        });

        toast("AR Mode Active", {
          description: "Tap on a surface to place the trading world",
        });

        // The browser will handle the rest of the AR experience
        session.addEventListener('end', () => {
          setARStatus('inactive');
        });
      }
    } catch (error) {
      console.error('Failed to start native AR:', error);
      toast("AR Setup Failed", {
        description: "Your device may not fully support AR features.",
      });
    }
  };

  // Take a screenshot of the current AR view
  const takeScreenshot = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      if (context) {
        // Set canvas dimensions to match video
        canvasRef.current.width = videoRef.current.videoWidth;
        canvasRef.current.height = videoRef.current.videoHeight;
        
        // Draw the video frame to the canvas
        context.drawImage(videoRef.current, 0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // Add a watermark for Trading Hybrid
        context.font = '30px Arial';
        context.fillStyle = 'white';
        context.shadowColor = 'black';
        context.shadowBlur = 4;
        context.fillText('Trade Hybrid AR', 20, 40);
        
        try {
          // Create a data URL and trigger download
          const dataUrl = canvasRef.current.toDataURL('image/png');
          const link = document.createElement('a');
          link.download = `tradehybrid-ar-${Date.now()}.png`;
          link.href = dataUrl;
          link.click();
          
          toast("Screenshot Saved", {
            description: "Your AR screenshot has been saved",
          });
        } catch (e) {
          console.error('Screenshot failed:', e);
          toast("Screenshot Failed", {
            description: "Unable to save screenshot",
          });
        }
      }
    }
  };

  // Share the AR experience
  const shareAR = async () => {
    if (navigator.share && canvasRef.current) {
      try {
        // Convert canvas to blob for sharing
        const blob = await new Promise<Blob>((resolve) => {
          canvasRef.current?.toBlob((blob) => {
            if (blob) resolve(blob);
          }, 'image/png');
        });
        
        // Create a file for sharing
        const file = new File([blob], 'tradehybrid-ar.png', { type: 'image/png' });
        
        await navigator.share({
          title: 'Check out Trade Hybrid in AR',
          text: 'This is how Trade Hybrid looks in my world!',
          files: [file]
        });
      } catch (error) {
        console.error('Sharing failed:', error);
        toast("Sharing Failed", {
          description: "Unable to share this AR view",
        });
      }
    } else {
      // Fallback if sharing API is not available
      takeScreenshot();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Camera feed or placeholder */}
      <div className="relative flex-1 overflow-hidden">
        {hasPermission ? (
          <video 
            ref={videoRef} 
            autoPlay 
            playsInline 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-900">
            <div className="text-center text-white p-4">
              <Camera size={48} className="mx-auto mb-2" />
              <p>Camera access required for AR</p>
              <Button 
                className="mt-4" 
                onClick={initializeAR}
                disabled={arStatus === 'starting'}
              >
                {arStatus === 'starting' ? 'Initializing...' : 'Grant Camera Access'}
              </Button>
            </div>
          </div>
        )}

        {/* AR model overlay - This would be replaced with actual WebXR in a production app */}
        {isCameraReady && (
          <div 
            ref={containerRef}
            className="absolute inset-0"
            onClick={(e) => {
              if (arStatus === 'active') {
                // Get click position for model placement
                const rect = e.currentTarget.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                setModelPosition({ x, y, scale: 1 });
                setARStatus('placed');
                
                toast("Model Placed", {
                  description: "Trading floor model placed in your environment",
                });
              }
            }}
            onTouchStart={(e) => {
              if (arStatus === 'active' && e.touches.length === 1) {
                // Handle touch for model placement
                const touch = e.touches[0];
                const rect = e.currentTarget.getBoundingClientRect();
                const x = touch.clientX - rect.left;
                const y = touch.clientY - rect.top;
                
                setModelPosition({ x, y, scale: 1 });
                setARStatus('placed');
                
                toast("Model Placed", {
                  description: "Trading floor model placed in your environment",
                });
              } else if (arStatus === 'placed') {
                // Handle other gestures like pinch/zoom and pan
                handleTouchStart(e);
              }
            }}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {arStatus === 'active' ? (
              <div className="absolute left-1/2 bottom-1/4 transform -translate-x-1/2 pointer-events-none">
                <div className="relative">
                  <div className="absolute inset-0 animate-ping bg-blue-500/20 rounded-full" />
                  <div className="absolute inset-0 bg-blue-600/30 rounded-full animate-pulse" />
                  <img
                    src="/models/trading_floor_preview.png"
                    alt="Trading Floor AR Preview"
                    className="w-64 h-64 object-contain opacity-90 relative z-10 animate-pulse"
                  />
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-white text-xs bg-black/50 px-2 py-1 rounded z-20">
                    Tap to place
                  </div>
                </div>
              </div>
            ) : arStatus === 'placed' ? (
              <div 
                className="absolute pointer-events-none"
                style={{
                  left: `${modelPosition.x}px`,
                  top: `${modelPosition.y}px`,
                  transform: `translate(-50%, -50%) scale(${modelPosition.scale})`,
                  transition: 'all 0.3s ease-out'
                }}
              >
                <img
                  src="/models/trading_floor_preview.png"
                  alt="Trading Floor AR Preview"
                  className="w-64 h-64 object-contain"
                />
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-full bg-green-500 text-white text-xs px-2 py-1 rounded-full mt-2">
                  Successfully placed
                </div>
              </div>
            ) : null}
          </div>
        )}

        {/* Controls overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex justify-between">
          <Button 
            variant="ghost" 
            size="icon" 
            className="bg-black/50 text-white rounded-full h-12 w-12"
            onClick={onClose}
          >
            <X />
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white rounded-full h-12 w-12"
              onClick={takeScreenshot}
            >
              <Camera />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="bg-black/50 text-white rounded-full h-12 w-12"
              onClick={shareAR}
            >
              <Share />
            </Button>
          </div>
        </div>

        {/* Info text */}
        <div className="absolute bottom-0 left-0 right-0 p-4 text-center text-white bg-black/50">
          <p>{isARSupported ? 'Move your camera around to place the trading world' : 'Full AR features not supported on this device'}</p>
        </div>
      </div>

      {/* Hidden canvas for screenshots */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* Overlay container for WebXR DOM Overlay */}
      <div id="ar-overlay" />
    </div>
  );
}