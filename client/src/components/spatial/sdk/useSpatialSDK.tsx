/**
 * Custom hook for interacting with the Spatial metaverse environment
 * This is a simplified interface that uses postMessage to communicate with the Spatial iframe
 */

import { useState, useCallback, useEffect } from 'react';
import { SPATIAL_CONFIG } from './config';

// Define the type for the Spatial SDK functions
interface SpatialSDK {
  isInitialized: boolean;
  currentArea: string | null;
  initialize: (iframe: HTMLIFrameElement) => boolean;
  teleportToArea: (areaKey: string) => void;
  initializeTradingEnvironment: () => void;
}

export function useSpatialSDK(autoInitialize = false): SpatialSDK {
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentArea, setCurrentArea] = useState<string | null>('reception');
  const [iframeElement, setIframeElement] = useState<HTMLIFrameElement | null>(null);
  
  // Initialize the SDK
  const initialize = useCallback((iframe: HTMLIFrameElement): boolean => {
    if (!iframe) {
      console.error("Cannot initialize Spatial SDK: No iframe provided");
      return false;
    }
    
    setIframeElement(iframe);
    setIsInitialized(true);
    setCurrentArea('reception'); // Default to reception area
    
    console.log("Spatial SDK initialized with iframe");
    return true;
  }, []);
  
  // Teleport to a specific area
  const teleportToArea = useCallback((areaKey: string) => {
    if (!isInitialized || !iframeElement) {
      console.error("Cannot teleport: Spatial SDK not initialized");
      return;
    }
    
    // Check if the area exists in our config
    if (!SPATIAL_CONFIG.areas[areaKey]) {
      console.error(`Unknown area: ${areaKey}`);
      return;
    }
    
    const area = SPATIAL_CONFIG.areas[areaKey];
    
    // Send message to iframe to teleport
    try {
      // In a real implementation, this would use a specific postMessage protocol
      // For now, we're just logging the action and changing our internal state
      console.log(`Teleporting to area: ${area.name}`, {
        position: area.position,
        rotation: area.rotation
      });
      
      // Update the current area in our state
      setCurrentArea(areaKey);
    } catch (error) {
      console.error("Error teleporting to area:", error);
    }
  }, [isInitialized, iframeElement]);
  
  // Initialize the trading environment
  const initializeTradingEnvironment = useCallback(() => {
    if (!isInitialized || !iframeElement) {
      console.error("Cannot initialize trading environment: Spatial SDK not initialized");
      return;
    }
    
    console.log("Initializing trading environment in Spatial");
    
    // This would normally set up virtual screens, data feeds, etc.
    // For now, we're just simulating this with a log message
  }, [isInitialized, iframeElement]);
  
  // Auto-initialize if requested
  useEffect(() => {
    if (autoInitialize) {
      // We would need to find the iframe element
      // This is just a placeholder - in practice, you'd need to locate the element
      const iframeElement = document.querySelector('iframe') as HTMLIFrameElement;
      if (iframeElement) {
        initialize(iframeElement);
      }
    }
  }, [autoInitialize, initialize]);
  
  return {
    isInitialized,
    currentArea,
    initialize,
    teleportToArea,
    initializeTradingEnvironment
  };
}