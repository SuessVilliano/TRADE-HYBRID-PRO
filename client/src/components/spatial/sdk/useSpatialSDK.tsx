import { useEffect, useRef, useState } from 'react';
import { SpatialSDK, SpatialPosition, SpatialInteractionEvent } from './SpatialSDK';
import { SPATIAL_CONFIG } from './config';

// Hook to use the Spatial SDK in React components
export function useSpatialSDK(autoInitialize: boolean = true) {
  const sdkRef = useRef<SpatialSDK | null>(null);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentArea, setCurrentArea] = useState<string | null>(null);
  const [userPosition, setUserPosition] = useState<SpatialPosition | null>(null);
  
  // Initialize the SDK
  const initialize = (iframe: HTMLIFrameElement) => {
    if (!sdkRef.current) {
      sdkRef.current = SpatialSDK.getInstance();
    }
    
    iframeRef.current = iframe;
    
    if (iframeRef.current) {
      const success = sdkRef.current.initialize(iframeRef.current);
      setIsInitialized(success);
      return success;
    }
    
    return false;
  };

  // Get iframe reference
  const getIframeRef = () => iframeRef;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sdkRef.current && isInitialized) {
        sdkRef.current.dispose();
        setIsInitialized(false);
      }
    };
  }, [isInitialized]);

  // Set up position tracking
  useEffect(() => {
    if (!isInitialized || !sdkRef.current) return;

    const positionInterval = setInterval(async () => {
      try {
        const position = await sdkRef.current?.getCurrentPosition();
        if (position) {
          setUserPosition(position);
          
          // Determine which area the user is in based on position
          for (const [areaKey, area] of Object.entries(SPATIAL_CONFIG.areas)) {
            const areaPos = area.position;
            const distance = Math.sqrt(
              Math.pow(position.x - areaPos.x, 2) + 
              Math.pow(position.z - areaPos.z, 2)
            );
            
            // If within 15 units of the area center, consider the user to be in that area
            if (distance < 15) {
              if (currentArea !== areaKey) {
                console.log(`Entered area: ${area.name}`);
                setCurrentArea(areaKey);
              }
              break;
            }
          }
        }
      } catch (err) {
        console.error('Error getting position:', err);
      }
    }, 5000); // Update every 5 seconds

    return () => clearInterval(positionInterval);
  }, [isInitialized, currentArea]);

  // Teleport to a specific area
  const teleportToArea = (areaName: string) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.teleportToArea(areaName);
    setCurrentArea(areaName);
  };

  // Register an interactive object
  const registerInteractiveObject = (
    objectId: string,
    callback: (event: SpatialInteractionEvent) => void
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.registerInteractiveObject(objectId, callback);
  };

  // Initialize the trading environment
  const initializeTradingEnvironment = () => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.initializeTradingEnvironment();
  };

  // Trigger interaction with an element
  const triggerInteraction = (elementId: string, userData?: any) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.triggerInteraction(elementId, userData);
  };

  // Create a new object in the space
  const createObject = (
    id: string, 
    type: string, 
    position: SpatialPosition, 
    properties?: Record<string, any>
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.createObject({
      id,
      type,
      position,
      properties
    });
  };

  // Show UI element in the space
  const showUIElement = (
    elementId: string, 
    htmlContent: string, 
    position?: SpatialPosition
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.showUIElement(elementId, htmlContent, position);
  };

  // Create a market data display
  const createMarketDisplay = (
    id: string,
    position: SpatialPosition,
    symbols: string[],
    displayType: 'candlestick' | 'line' | 'heatmap' = 'candlestick'
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.createObject({
      id,
      type: 'marketDisplay',
      position,
      properties: {
        symbols,
        display: displayType,
        refreshRate: 5000
      }
    });
  };

  // Create a trading desk
  const createTradingDesk = (
    id: string,
    position: SpatialPosition,
    traderName: string,
    screens: Array<{ type: string, symbol?: string }>
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.createObject({
      id,
      type: 'tradingDesk',
      position,
      properties: {
        trader: traderName,
        active: true,
        screens
      }
    });
  };

  // Create an AI assistant
  const createAIAssistant = (
    id: string,
    position: SpatialPosition,
    name: string,
    responses: string[]
  ) => {
    if (!isInitialized || !sdkRef.current) {
      console.error('SDK not initialized');
      return;
    }
    
    sdkRef.current.createObject({
      id,
      type: 'aiAssistant',
      position,
      properties: {
        name,
        responses
      }
    });
  };

  return {
    initialize,
    isInitialized,
    getIframeRef,
    currentArea,
    userPosition,
    teleportToArea,
    registerInteractiveObject,
    initializeTradingEnvironment,
    triggerInteraction,
    createObject,
    showUIElement,
    createMarketDisplay,
    createTradingDesk,
    createAIAssistant
  };
}