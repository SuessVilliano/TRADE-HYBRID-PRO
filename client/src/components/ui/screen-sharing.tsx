import React, { useState, useRef, useEffect } from 'react';
import { Button } from './button';
import { Camera, Cast, Monitor, Share2, X } from 'lucide-react';

interface ScreenSharingProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ScreenSharing({ isOpen, onClose }: ScreenSharingProps) {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Cleanup function for when component unmounts or sharing stops
  const stopSharing = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsSharing(false);
  };
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopSharing();
    };
  }, []);
  
  // Update video element when stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);
  
  // Start screen sharing
  const startScreenShare = async () => {
    try {
      setError(null);
      
      // Check if the browser supports screen capture
      if (!navigator.mediaDevices || !navigator.mediaDevices.getDisplayMedia) {
        throw new Error('Screen sharing is not supported in your browser');
      }
      
      // Request screen sharing from user
      const mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });
      
      setStream(mediaStream);
      setIsSharing(true);
      
      // Handle when user stops sharing via browser UI
      mediaStream.getVideoTracks()[0].onended = () => {
        stopSharing();
      };
      
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred while trying to share your screen');
      }
      console.error('Screen sharing error:', err);
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-lg shadow-lg overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <Cast className="h-5 w-5 text-blue-500" />
            <span>Screen Sharing</span>
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300 p-3 rounded-md text-sm">
              {error}
            </div>
          )}
          
          {isSharing ? (
            <div className="space-y-4">
              <div className="aspect-video bg-gray-100 dark:bg-gray-900 rounded-md overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline
                  muted
                  className="w-full h-full object-contain"
                />
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-green-600 dark:text-green-400 font-medium">Screen sharing is active</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Your screen is now being shared with the Trade Hybrid community
                  </p>
                </div>
                
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={stopSharing}
                >
                  Stop Sharing
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                Share your screen with other traders in the Trade Hybrid community. 
                You can share your entire screen, a specific application window, or a browser tab.
              </p>
              
              <div className="grid grid-cols-3 gap-3">
                <button 
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={startScreenShare}
                >
                  <Monitor className="h-8 w-8 text-blue-500 mb-2" />
                  <span className="text-sm">Entire Screen</span>
                </button>
                
                <button 
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={startScreenShare}
                >
                  <Share2 className="h-8 w-8 text-purple-500 mb-2" />
                  <span className="text-sm">Application</span>
                </button>
                
                <button 
                  className="flex flex-col items-center justify-center p-4 border border-gray-200 dark:border-gray-700 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={startScreenShare}
                >
                  <Camera className="h-8 w-8 text-green-500 mb-2" />
                  <span className="text-sm">Browser Tab</span>
                </button>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-md">
                <p className="font-medium mb-1">Privacy notice:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Your screen will only be shared with users you explicitly grant access to</li>
                  <li>You can stop sharing at any time</li>
                  <li>No recordings are made or stored unless you enable that option</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-200 dark:border-gray-700 flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}