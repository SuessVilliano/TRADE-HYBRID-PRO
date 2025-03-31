// Spatial SDK Integration Service
import { SPATIAL_CONFIG } from './config';

// Define types for SDK interactions
export interface SpatialPosition {
  x: number;
  y: number;
  z: number;
}

export interface SpatialObject {
  id: string;
  type: string;
  position: SpatialPosition;
  rotation?: SpatialPosition;
  scale?: SpatialPosition;
  properties?: Record<string, any>;
}

export interface SpatialInteractionEvent {
  objectId: string;
  interactionType: 'click' | 'hover' | 'proximity';
  userData?: any;
}

export class SpatialSDK {
  private static instance: SpatialSDK;
  private isInitialized: boolean = false;
  private spatialFrame: HTMLIFrameElement | null = null;
  private eventListeners: Map<string, ((event: any) => void)[]> = new Map();

  // Private constructor for singleton pattern
  private constructor() {}

  // Get the singleton instance
  public static getInstance(): SpatialSDK {
    if (!SpatialSDK.instance) {
      SpatialSDK.instance = new SpatialSDK();
    }
    return SpatialSDK.instance;
  }

  // Initialize the SDK with the iframe reference
  public initialize(iframe: HTMLIFrameElement): boolean {
    if (this.isInitialized) {
      console.warn('SpatialSDK already initialized');
      return false;
    }

    this.spatialFrame = iframe;
    this.setupMessageListeners();
    this.isInitialized = true;
    
    console.log('SpatialSDK initialized successfully');
    return true;
  }

  // Clean up resources
  public dispose(): void {
    this.removeMessageListeners();
    this.spatialFrame = null;
    this.isInitialized = false;
    this.eventListeners.clear();
    
    console.log('SpatialSDK disposed');
  }

  // Setup message listeners for iframe communication
  private setupMessageListeners(): void {
    window.addEventListener('message', this.handleMessage);
    console.log('SpatialSDK message listeners set up');
  }

  // Remove message listeners
  private removeMessageListeners(): void {
    window.removeEventListener('message', this.handleMessage);
    console.log('SpatialSDK message listeners removed');
  }

  // Handle incoming messages from the Spatial iframe
  private handleMessage = (event: MessageEvent): void => {
    // Verify the message origin matches our Spatial iframe
    const spatialOrigin = new URL(SPATIAL_CONFIG.defaultSpaceUrl).origin;
    if (event.origin !== spatialOrigin) {
      return;
    }

    // Process the message data
    const { type, data } = event.data;
    
    if (!type) return;
    
    console.log(`SpatialSDK received message: ${type}`, data);
    
    // Dispatch the event to any registered listeners
    this.dispatchEvent(type, data);
  };

  // Register an event listener
  public addEventListener(eventType: string, callback: (event: any) => void): void {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    
    this.eventListeners.get(eventType)?.push(callback);
    console.log(`SpatialSDK added event listener for: ${eventType}`);
  }

  // Remove an event listener
  public removeEventListener(eventType: string, callback: (event: any) => void): void {
    if (!this.eventListeners.has(eventType)) return;
    
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      console.log(`SpatialSDK removed event listener for: ${eventType}`);
    }
  }

  // Dispatch an event to registered listeners
  private dispatchEvent(eventType: string, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    
    for (const listener of listeners) {
      try {
        listener(data);
      } catch (err) {
        console.error(`Error in SpatialSDK event listener for ${eventType}:`, err);
      }
    }
  }

  // Send a message to the Spatial iframe
  public sendMessage(type: string, data: any): void {
    if (!this.isInitialized || !this.spatialFrame) {
      console.error('SpatialSDK not initialized or iframe not available');
      return;
    }

    try {
      // Get the contentWindow of the iframe
      const targetWindow = this.spatialFrame.contentWindow;
      if (!targetWindow) {
        console.error('Could not access Spatial iframe contentWindow');
        return;
      }

      // Get the origin from the defaultSpaceUrl
      const targetOrigin = new URL(SPATIAL_CONFIG.defaultSpaceUrl).origin;

      // Send the message to the iframe
      targetWindow.postMessage({ type, data }, targetOrigin);
      console.log(`SpatialSDK sent message: ${type}`, data);
    } catch (err) {
      console.error('Error sending message to Spatial:', err);
    }
  }

  // Jump to a specific area in the metaverse
  public teleportToArea(areaName: string): void {
    const area = SPATIAL_CONFIG.areas[areaName as keyof typeof SPATIAL_CONFIG.areas];
    
    if (!area) {
      console.error(`Area not found: ${areaName}`);
      return;
    }
    
    this.sendMessage('teleport', {
      position: area.position,
      areaName: area.name
    });
    
    console.log(`Teleporting to area: ${areaName}`, area.position);
  }

  // Create an interactive object in the space
  public createObject(object: SpatialObject): void {
    this.sendMessage('createObject', object);
    console.log(`Creating object: ${object.id}`, object);
  }

  // Remove an object from the space
  public removeObject(objectId: string): void {
    this.sendMessage('removeObject', { objectId });
    console.log(`Removing object: ${objectId}`);
  }

  // Trigger an interaction with an element in the space
  public triggerInteraction(elementId: string, userData?: any): void {
    const element = SPATIAL_CONFIG.interactiveElements[elementId as keyof typeof SPATIAL_CONFIG.interactiveElements];
    
    if (!element) {
      console.error(`Interactive element not found: ${elementId}`);
      return;
    }
    
    this.sendMessage('interaction', {
      elementId,
      interactionType: 'click',
      userData
    });
    
    console.log(`Triggered interaction with: ${elementId}`, element);
  }

  // Register for object interaction events
  public registerInteractiveObject(objectId: string, interactionCallback: (event: SpatialInteractionEvent) => void): void {
    this.addEventListener(`interaction:${objectId}`, interactionCallback);
    this.sendMessage('registerInteractive', { objectId });
    console.log(`Registered interactive object: ${objectId}`);
  }

  // Load 3D models into the space
  public loadModel(modelId: string, modelUrl: string, position: SpatialPosition): void {
    this.sendMessage('loadModel', {
      modelId,
      modelUrl,
      position
    });
    console.log(`Loading model: ${modelId} from ${modelUrl}`);
  }

  // Display UI elements within the space
  public showUIElement(elementId: string, htmlContent: string, position?: SpatialPosition): void {
    this.sendMessage('showUI', {
      elementId,
      htmlContent,
      position
    });
    console.log(`Showing UI element: ${elementId}`);
  }

  // Get the user's current position in the space
  public getCurrentPosition(): Promise<SpatialPosition> {
    return new Promise((resolve) => {
      const messageType = 'getCurrentPosition';
      const responseHandler = (position: SpatialPosition) => {
        this.removeEventListener(`${messageType}:response`, responseHandler);
        resolve(position);
      };
      
      this.addEventListener(`${messageType}:response`, responseHandler);
      this.sendMessage(messageType, {});
    });
  }

  // Initialize the trading environment in the metaverse
  public initializeTradingEnvironment(): void {
    console.log('Initializing trading environment in metaverse');
    
    // Create trading desks
    for (let i = 0; i < 5; i++) {
      this.createObject({
        id: `tradingDesk_${i}`,
        type: 'tradingDesk',
        position: { x: 10 + (i * 3), y: 0, z: 5 },
        properties: {
          trader: `Trader${i}`,
          active: i < 3, // First 3 desks are active
          screens: [
            { type: 'chart', symbol: 'BTCUSD' },
            { type: 'news' },
            { type: 'social' }
          ]
        }
      });
    }
    
    // Create market display
    this.createObject({
      id: 'mainMarketDisplay',
      type: 'marketDisplay',
      position: { x: 0, y: 3, z: -10 },
      scale: { x: 5, y: 3, z: 0.2 },
      properties: {
        symbols: ['BTCUSD', 'ETHUSD', 'SOLUSD'],
        refreshRate: 5000, // ms
        display: 'candlestick'
      }
    });
    
    // Create AI assistants
    this.createObject({
      id: 'tradingAssistant',
      type: 'aiAssistant',
      position: { x: 15, y: 0, z: 15 },
      properties: {
        name: 'TradeBot',
        responses: [
          'Welcome to the Trading Floor!',
          'Would you like to see the latest market analysis?',
          'I can help you place trades and monitor your portfolio.'
        ]
      }
    });
    
    console.log('Trading environment initialized');
  }
}