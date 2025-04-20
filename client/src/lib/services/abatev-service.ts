import { toast } from 'sonner';
import { ABATEV_CONFIG } from '@/lib/constants';

// Type definitions
export interface ABATEVConnection {
  id: string;
  status: 'connected' | 'disconnected' | 'error';
  lastConnected: Date | null;
  features: string[];
  supportedBrokers: string[];
}

// Events that ABATEV service can emit
type ABATEVEventType = 'connect' | 'disconnect' | 'status_update' | 'config_update';

// Event listener function type
type ABATEVEventListener = (data: any) => void;

/**
 * ABATEV (Advanced Broker Aggregation & Trade Execution View) Service
 * 
 * This service handles connection to the ABATEV protocol which manages
 * multi-broker trade execution, price comparison, and smart order routing.
 */
class ABATEVService {
  private static instance: ABATEVService;
  private connection: ABATEVConnection | null = null;
  private connectionAttempts: number = 0;
  private isConnecting: boolean = false;
  private eventListeners: Map<ABATEVEventType, ABATEVEventListener[]> = new Map();
  private reconnectTimer: NodeJS.Timeout | null = null;
  
  constructor() {
    // Initialize event listeners map
    this.eventListeners.set('connect', []);
    this.eventListeners.set('disconnect', []);
    this.eventListeners.set('status_update', []);
    this.eventListeners.set('config_update', []);
    
    // Attempt to restore previous connection state
    this.restoreConnectionState();
  }
  
  /**
   * Get the singleton instance of ABATEVService
   */
  public static getInstance(): ABATEVService {
    if (!ABATEVService.instance) {
      ABATEVService.instance = new ABATEVService();
    }
    return ABATEVService.instance;
  }
  
  /**
   * Subscribe to ABATEV events
   */
  public subscribe(eventType: ABATEVEventType, listener: ABATEVEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);
  }
  
  /**
   * Unsubscribe from ABATEV events
   */
  public unsubscribe(eventType: ABATEVEventType, listener: ABATEVEventListener): void {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(listener);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(eventType, listeners);
    }
  }
  
  /**
   * Emit an event to all listeners
   */
  private emit(eventType: ABATEVEventType, data: any): void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(listener => listener(data));
  }
  
  /**
   * Check if ABATEV is enabled in the configuration
   */
  public isEnabled(): boolean {
    return ABATEV_CONFIG.enabled;
  }
  
  /**
   * Get the current connection status
   */
  public getConnectionStatus(): 'connected' | 'disconnected' | 'error' | 'connecting' {
    if (this.isConnecting) {
      return 'connecting';
    }
    return this.connection?.status || 'disconnected';
  }
  
  /**
   * Get the current connection
   */
  public getConnection(): ABATEVConnection | null {
    return this.connection;
  }
  
  /**
   * Connect to ABATEV protocol
   */
  public async connect(): Promise<boolean> {
    // If already connected, return true
    if (this.connection?.status === 'connected') {
      return true;
    }
    
    // If ABATEV is not enabled, return false
    if (!this.isEnabled()) {
      console.log('ABATEV is not enabled in the configuration');
      return false;
    }
    
    // If already connecting, wait until it's done
    if (this.isConnecting) {
      console.log('Already attempting to connect to ABATEV');
      return false;
    }
    
    this.isConnecting = true;
    this.connectionAttempts++;
    
    try {
      console.log('Connecting to ABATEV protocol...');
      
      // Attempt to connect to the ABATEV API endpoint
      const response = await fetch('/api/abatev/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientVersion: '1.0.0',
          features: ABATEV_CONFIG.features,
          supportedBrokers: ABATEV_CONFIG.supportedBrokers,
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to connect to ABATEV: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Create the connection object
      this.connection = {
        id: data.connectionId || `abatev-${Date.now()}`,
        status: 'connected',
        lastConnected: new Date(),
        features: Object.keys(ABATEV_CONFIG.features).filter(key => {
          // Safely check features by using type assertion
          const features = ABATEV_CONFIG.features as Record<string, boolean>;
          return features[key];
        }),
        supportedBrokers: ABATEV_CONFIG.supportedBrokers,
      };
      
      // Save connection state for persistence
      this.saveConnectionState();
      
      // Emit connect event
      this.emit('connect', this.connection);
      
      // Show success notification
      toast.success('Connected to ABATEV Protocol', {
        description: 'Advanced trade execution is now available.'
      });
      
      console.log('Successfully connected to ABATEV protocol');
      this.isConnecting = false;
      this.connectionAttempts = 0;
      return true;
      
    } catch (error) {
      console.error('Failed to connect to ABATEV:', error);
      
      // Update connection status to error
      this.connection = {
        id: `abatev-${Date.now()}`,
        status: 'error',
        lastConnected: null,
        features: [],
        supportedBrokers: [],
      };
      
      // Try to reconnect after a delay, but only if this is not our 3rd attempt
      if (this.connectionAttempts < 3) {
        console.log(`Will retry ABATEV connection in 5 seconds (attempt ${this.connectionAttempts})`);
        
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer);
        }
        
        // Set up reconnect timer
        this.reconnectTimer = setTimeout(() => {
          this.connect();
        }, 5000);
      } else {
        // If we've tried 3 times, give up and reset
        console.log('Failed to connect to ABATEV after multiple attempts');
        
        // Show error notification
        toast.error('ABATEV Connection Failed', {
          description: 'Unable to connect to the advanced trading protocol.'
        });
        
        this.connection = {
          id: `abatev-${Date.now()}`,
          status: 'disconnected',
          lastConnected: null,
          features: [],
          supportedBrokers: [],
        };
        
        // Reset connection attempts after a minute
        setTimeout(() => {
          this.connectionAttempts = 0;
        }, 60000);
      }
      
      this.isConnecting = false;
      return false;
    }
  }
  
  /**
   * Disconnect from ABATEV protocol
   */
  public async disconnect(): Promise<boolean> {
    // If not connected, return true (already disconnected)
    if (!this.connection || this.connection.status !== 'connected') {
      return true;
    }
    
    try {
      console.log('Disconnecting from ABATEV protocol...');
      
      // Attempt to disconnect from the ABATEV API endpoint
      const response = await fetch('/api/abatev/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          connectionId: this.connection.id,
        }),
      });
      
      // Even if the API call fails, we still want to update the local state
      
      // Update connection status
      this.connection = {
        ...this.connection,
        status: 'disconnected',
      };
      
      // Save connection state for persistence
      this.saveConnectionState();
      
      // Emit disconnect event
      this.emit('disconnect', this.connection);
      
      console.log('Successfully disconnected from ABATEV protocol');
      return true;
      
    } catch (error) {
      console.error('Error while disconnecting from ABATEV:', error);
      
      // Still update the local state
      this.connection = {
        ...this.connection,
        status: 'disconnected',
      };
      
      // Save connection state for persistence
      this.saveConnectionState();
      
      // Emit disconnect event
      this.emit('disconnect', this.connection);
      
      return true;
    }
  }
  
  /**
   * Save connection state to local storage
   */
  private saveConnectionState(): void {
    try {
      if (this.connection) {
        localStorage.setItem('abatev-connection', JSON.stringify(this.connection));
      }
    } catch (error) {
      console.error('Failed to save ABATEV connection state:', error);
    }
  }
  
  /**
   * Restore connection state from local storage
   */
  private restoreConnectionState(): void {
    try {
      const savedState = localStorage.getItem('abatev-connection');
      if (savedState) {
        const connection = JSON.parse(savedState) as ABATEVConnection;
        
        // If the saved state indicates connected, but it's from a different session
        // we should treat it as disconnected
        if (connection.status === 'connected') {
          connection.status = 'disconnected';
        }
        
        this.connection = connection;
      }
    } catch (error) {
      console.error('Failed to restore ABATEV connection state:', error);
      this.connection = null;
    }
  }
  
  /**
   * Check the ABATEV status (updates asynchronously but returns current status)
   */
  public async checkStatus(): Promise<'connected' | 'disconnected' | 'error'> {
    const currentStatus = this.getConnectionStatus();
    
    // If we're not connected, try to connect
    if (currentStatus !== 'connected' && currentStatus !== 'connecting') {
      this.connect();
    }
    
    return this.connection?.status || 'disconnected';
  }
}

// Export singleton instance
export const abatevService = ABATEVService.getInstance();