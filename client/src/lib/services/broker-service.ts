// Broker types supported by the platform
export type BrokerType = 'crypto' | 'forex' | 'stocks' | 'futures';

// Broker interface
export interface Broker {
  id: string;
  name: string;
  type: BrokerType;
  connected: boolean;
  credentials?: Record<string, string>;
  apiUrl?: string;
  lastConnected?: Date;
}

// Event types for broker service
type BrokerServiceEvent = 'connect' | 'disconnect' | 'order_submit' | 'order_update';

class BrokerService {
  private brokers: Map<string, Broker> = new Map();
  private callbacks: Map<string, Function[]> = new Map();
  
  constructor() {
    this.loadFromStorage();
  }
  
  // Get all connected brokers
  getAllBrokers(): Broker[] {
    return Array.from(this.brokers.values());
  }
  
  // Get a broker by ID
  getBrokerById(id: string): Broker | undefined {
    return this.brokers.get(id);
  }
  
  // Connect to a broker
  async connectBroker(
    id: string, 
    name: string, 
    type: BrokerType, 
    credentials: Record<string, string>
  ): Promise<boolean> {
    try {
      // Create new broker or update existing one
      const broker: Broker = {
        id,
        name,
        type,
        connected: true,
        credentials,
        lastConnected: new Date()
      };
      
      // Here we would normally validate the credentials with the broker's API
      // For demo purposes, we're just assuming the connection was successful
      
      // Save broker
      this.brokers.set(id, broker);
      this.saveToStorage();
      
      // Trigger connect callback
      this.triggerCallbacks('connect', broker);
      
      return true;
    } catch (error) {
      console.error('Failed to connect to broker:', error);
      return false;
    }
  }
  
  // Disconnect from a broker
  disconnectBroker(id: string): boolean {
    try {
      const broker = this.brokers.get(id);
      if (!broker) return false;
      
      // Update broker status
      broker.connected = false;
      this.brokers.set(id, broker);
      this.saveToStorage();
      
      // Trigger disconnect callback
      this.triggerCallbacks('disconnect', broker);
      
      return true;
    } catch (error) {
      console.error('Failed to disconnect from broker:', error);
      return false;
    }
  }
  
  // Submit an order to a broker
  async submitOrder(
    brokerId: string, 
    orderData: any
  ): Promise<{ success: boolean; orderId?: string; error?: string }> {
    try {
      const broker = this.brokers.get(brokerId);
      if (!broker || !broker.connected) {
        return { 
          success: false, 
          error: `Broker ${brokerId} not connected` 
        };
      }
      
      // Here we would normally submit the order to the broker's API
      // For demo purposes, we're just simulating a successful submission
      const orderId = `ORD-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
      
      // Trigger order submit callback
      this.triggerCallbacks('order_submit', { 
        brokerId, 
        orderId, 
        orderData 
      });
      
      return { 
        success: true, 
        orderId 
      };
    } catch (error) {
      console.error('Failed to submit order:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Get account balance from a broker
  async getAccountBalance(brokerId: string): Promise<{ 
    success: boolean; 
    balance?: number; 
    currency?: string; 
    error?: string 
  }> {
    try {
      const broker = this.brokers.get(brokerId);
      if (!broker || !broker.connected) {
        return { 
          success: false, 
          error: `Broker ${brokerId} not connected` 
        };
      }
      
      // Here we would normally fetch the balance from the broker's API
      // For demo purposes, we're just returning a mock balance
      
      return { 
        success: true, 
        balance: 10000, 
        currency: broker.type === 'crypto' ? 'USDT' : 'USD' 
      };
    } catch (error) {
      console.error('Failed to get account balance:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
  
  // Event subscription
  subscribe(event: BrokerServiceEvent, callback: Function): void {
    if (!this.callbacks.has(event)) {
      this.callbacks.set(event, []);
    }
    this.callbacks.get(event)?.push(callback);
  }
  
  // Event unsubscription
  unsubscribe(event: BrokerServiceEvent, callback: Function): void {
    if (!this.callbacks.has(event)) return;
    
    const callbacks = this.callbacks.get(event);
    if (!callbacks) return;
    
    const index = callbacks.indexOf(callback);
    if (index !== -1) {
      callbacks.splice(index, 1);
      this.callbacks.set(event, callbacks);
    }
  }
  
  // Trigger callbacks for an event
  private triggerCallbacks(event: string, data: any): void {
    const callbacks = this.callbacks.get(event);
    if (!callbacks) return;
    
    for (const callback of callbacks) {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in broker service ${event} callback:`, error);
      }
    }
  }
  
  // Save brokers to local storage
  private saveToStorage(): void {
    const brokersData = JSON.stringify(Array.from(this.brokers.entries()));
    localStorage.setItem('brokers', brokersData);
  }
  
  // Load brokers from local storage
  private loadFromStorage(): void {
    try {
      const brokersData = localStorage.getItem('brokers');
      if (!brokersData) return;
      
      const brokerEntries = JSON.parse(brokersData);
      this.brokers = new Map(brokerEntries);
    } catch (error) {
      console.error('Failed to load brokers from storage:', error);
    }
  }
}

// Export a singleton instance
export const brokerService = new BrokerService();