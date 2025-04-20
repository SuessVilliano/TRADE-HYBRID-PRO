/**
 * ABATEV Service 
 * (Advanced Broker Aggregation & Trade Execution View)
 * 
 * Handles communication with the ABATEV API for optimized trade execution
 * across multiple brokers.
 */

// Define the ABATEV system status types
interface ABATEVStatus {
  connected: boolean;
  enabled: boolean;
  activeConnections: string[];
  ordersProcessed: number;
  averageExecutionTime: number;
  activeStrategies: number;
  executionPreset: string;
  lastInitialized: string | null;
  success: boolean;
  message?: string;
}

// Define the toggle response
interface ToggleResponse {
  success: boolean;
  enabled: boolean;
  message: string;
}

// Define the initialization response
interface InitializeResponse {
  success: boolean;
  message: string;
  connected: boolean;
  enabled: boolean;
  activeConnections: string[];
}

/**
 * Get the current status of the ABATEV system
 */
export async function getABATEVStatus(): Promise<ABATEVStatus> {
  try {
    const response = await fetch('/api/abatev/status');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching ABATEV status:', error);
    return {
      success: false,
      connected: false,
      enabled: false,
      activeConnections: [],
      ordersProcessed: 0,
      averageExecutionTime: 0,
      activeStrategies: 0,
      executionPreset: 'bestPrice',
      lastInitialized: null,
      message: 'Failed to connect to ABATEV service'
    };
  }
}

/**
 * Initialize the ABATEV system
 */
export async function initializeABATEV(): Promise<InitializeResponse> {
  try {
    const response = await fetch('/api/abatev/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error initializing ABATEV:', error);
    return {
      success: false,
      message: 'Failed to initialize ABATEV system',
      connected: false,
      enabled: false,
      activeConnections: []
    };
  }
}

/**
 * Toggle the ABATEV system on/off
 */
export async function toggleABATEV(enabled: boolean): Promise<ToggleResponse> {
  try {
    const response = await fetch('/api/abatev/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error toggling ABATEV:', error);
    return {
      success: false,
      enabled: false, // Maintain current state by default
      message: 'Failed to toggle ABATEV system'
    };
  }
}

/**
 * Execute a trade through the ABATEV system with optimal routing
 */
export async function executeTrade(tradeData: any): Promise<any> {
  try {
    const response = await fetch('/api/abatev/execute-trade', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(tradeData)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error executing trade through ABATEV:', error);
    return {
      success: false,
      message: 'Failed to execute trade through ABATEV system'
    };
  }
}

/**
 * Get the best available price for a symbol across all connected brokers
 */
export async function getBestPrice(symbol: string, side: 'buy' | 'sell'): Promise<any> {
  try {
    const response = await fetch(`/api/abatev/best-price?symbol=${encodeURIComponent(symbol)}&side=${side}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error getting best price from ABATEV:', error);
    return {
      success: false,
      message: 'Failed to retrieve best price from ABATEV system'
    };
  }
}

/**
 * Compare prices and execution speeds across all connected brokers
 */
export async function compareExecutionOptions(symbol: string): Promise<any> {
  try {
    const response = await fetch(`/api/abatev/compare-execution?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error comparing execution options:', error);
    return {
      success: false,
      message: 'Failed to compare execution options'
    };
  }
}

/**
 * Reset the ABATEV system metrics and reconnect
 */
export async function resetABATEV(): Promise<any> {
  try {
    // First toggle off
    await toggleABATEV(false);
    
    // Then initialize
    const initResult = await initializeABATEV();
    
    if (initResult.success) {
      // Turn it back on if it was successful
      return toggleABATEV(true);
    }
    
    return initResult;
  } catch (error) {
    console.error('Error resetting ABATEV:', error);
    return {
      success: false,
      message: 'Failed to reset ABATEV system'
    };
  }
}