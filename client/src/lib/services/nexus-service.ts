/**
 * Nexus™ Service 
 * (Formerly ABATEV - Advanced Broker Aggregation & Trade Execution View)
 * 
 * Intelligent trade routing and execution optimization platform that
 * aggregates market data, analyzes execution metrics, and optimizes trading
 * across multiple brokers with AI-powered error healing.
 */

// Define the Nexus system status types
interface NexusStatus {
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
  // New fields based on Core Feature Enhancements
  orderBookDepth?: number;
  historicalFillRate?: number[];
  apiReliabilityScore?: number;
  feeSchedule?: any;
  volatilityIndicators?: any;
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

// Define broker execution metrics for Smart Order Routing
interface BrokerExecutionMetrics {
  broker: string;
  price: number;
  spread: number;
  latency: number;
  reliability: number;
  orderBookDepth: number;
  historicalFillRate: number;
  fees: number;
  volatilityScore: number;
  anomalyScore?: number; // For anomaly detection
  score: number; // Overall weighted score
}

// Define user-defined weighting profile
interface ExecutionWeightingProfile {
  name: string;
  priceWeight: number;
  speedWeight: number;
  reliabilityWeight: number;
  depthWeight: number;
  fillRateWeight: number;
  feesWeight: number;
  volatilityWeight: number;
}

/**
 * Get the current status of the Nexus system
 */
export async function getNexusStatus(): Promise<NexusStatus> {
  try {
    const response = await fetch('/api/nexus/status');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching Nexus status:', error);
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
      message: 'Failed to connect to Nexus service'
    };
  }
}

/**
 * Initialize the Nexus system
 */
export async function initializeTradeNexus(): Promise<InitializeResponse> {
  try {
    const response = await fetch('/api/nexus/initialize', {
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
    console.error('Error initializing Nexus:', error);
    return {
      success: false,
      message: 'Failed to initialize Nexus system',
      connected: false,
      enabled: false,
      activeConnections: []
    };
  }
}

/**
 * Toggle the Nexus system on/off
 */
export async function toggleTradeNexus(enabled: boolean): Promise<ToggleResponse> {
  try {
    const response = await fetch('/api/nexus/toggle', {
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
    console.error('Error toggling Nexus:', error);
    return {
      success: false,
      enabled: false, // Maintain current state by default
      message: 'Failed to toggle Nexus system'
    };
  }
}

/**
 * Execute a trade through the Nexus system with optimal routing and Smart Order Splitting
 */
export async function executeTradeWithOptimalRouting(tradeData: any): Promise<any> {
  try {
    const response = await fetch('/api/nexus/execute-trade', {
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
    console.error('Error executing trade through Nexus:', error);
    return {
      success: false,
      message: 'Failed to execute trade through Nexus system'
    };
  }
}

/**
 * Get the optimal execution metrics for a symbol across all connected brokers
 * with order book depth and VWAP-based routing
 */
export async function getOptimalExecutionMetrics(
  symbol: string, 
  side: 'buy' | 'sell', 
  profile?: ExecutionWeightingProfile
): Promise<BrokerExecutionMetrics[]> {
  try {
    const queryParams = new URLSearchParams({
      symbol: symbol,
      side: side,
      ...(profile && { profile: JSON.stringify(profile) })
    });
    
    const response = await fetch(`/api/nexus/optimal-execution?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error('Error getting optimal execution metrics from Nexus:', error);
    return [];
  }
}

/**
 * Compare execution options with expanded metrics including order book depth,
 * historical fill rates, API reliability, fee schedules, and volatility indicators
 */
export async function compareAdvancedExecutionOptions(
  symbol: string,
  orderSize?: number,
  executionType?: 'market' | 'limit' | 'vwap'
): Promise<any> {
  try {
    const queryParams = new URLSearchParams({
      symbol,
      ...(orderSize && { orderSize: orderSize.toString() }),
      ...(executionType && { executionType })
    });
    
    const response = await fetch(`/api/nexus/compare-advanced-execution?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error comparing advanced execution options in Nexus:', error);
    return {
      success: false,
      message: 'Failed to compare advanced execution options',
      metrics: []
    };
  }
}

/**
 * Reset the Nexus system metrics and reconnect
 */
export async function resetTradeNexus(): Promise<any> {
  try {
    // First toggle off
    await toggleTradeNexus(false);
    
    // Then initialize
    const initResult = await initializeTradeNexus();
    
    if (initResult.success) {
      // Turn it back on if it was successful
      return toggleTradeNexus(true);
    }
    
    return initResult;
  } catch (error) {
    console.error('Error resetting Nexus:', error);
    return {
      success: false,
      message: 'Failed to reset Nexus system'
    };
  }
}

// ----- AI-Powered Error-Healing Module -----

/**
 * Interface for error classification
 */
interface ErrorClassification {
  errorType: 'network' | 'data-format' | 'api-limit' | 'authentication' | 'unknown';
  severity: 'low' | 'medium' | 'high';
  timestamp: string;
  errorMessage: string;
  suggestedAction?: string;
  autoResolvable: boolean;
}

/**
 * Interface for self-healing patch
 */
interface SelfHealingPatch {
  id: string;
  timestamp: string;
  component: string;
  issue: string;
  patchCode: string;
  appliedStatus: 'pending' | 'applied' | 'rejected' | 'failed';
  author: 'ai' | 'human';
}

/**
 * Get error classifications from the log ingestion pipeline
 */
export async function getErrorClassifications(): Promise<ErrorClassification[]> {
  try {
    const response = await fetch('/api/nexus/error-classifications');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.classifications || [];
  } catch (error) {
    console.error('Error fetching error classifications:', error);
    return [];
  }
}

/**
 * Get self-healing patches proposed by AI
 */
export async function getSelfHealingPatches(): Promise<SelfHealingPatch[]> {
  try {
    const response = await fetch('/api/nexus/self-healing-patches');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.patches || [];
  } catch (error) {
    console.error('Error fetching self-healing patches:', error);
    return [];
  }
}

/**
 * Apply or reject a self-healing patch
 */
export async function processSelfHealingPatch(
  patchId: string, 
  action: 'apply' | 'reject'
): Promise<{success: boolean, message: string}> {
  try {
    const response = await fetch('/api/nexus/process-patch', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ patchId, action })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      message: data.message
    };
  } catch (error) {
    console.error('Error processing self-healing patch:', error);
    return {
      success: false,
      message: 'Failed to process self-healing patch'
    };
  }
}

/**
 * Trigger fail-over to secondary broker in case of primary broker failure
 */
export async function triggerBrokerFailover(
  primaryBrokerId: string,
  symbol: string
): Promise<{success: boolean, message: string, newBrokerId?: string}> {
  try {
    const response = await fetch('/api/nexus/broker-failover', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ primaryBrokerId, symbol })
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return {
      success: data.success,
      message: data.message,
      newBrokerId: data.newBrokerId
    };
  } catch (error) {
    console.error('Error triggering broker failover:', error);
    return {
      success: false,
      message: 'Failed to trigger broker failover'
    };
  }
}

// ----- Smart Order Routing & Splitting -----

/**
 * Interface for smart order routing
 */
interface SmartOrderRoutingRequest {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  orderType: 'market' | 'limit' | 'vwap';
  limitPrice?: number;
  timeInForce?: 'day' | 'gtc' | 'ioc' | 'fok';
  routingStrategy: 'bestPrice' | 'minLatency' | 'bestFill' | 'lowestFee' | 'optimal';
  maxSlippage?: number;
  splitOrder?: boolean;
  avoidMarketImpact?: boolean;
}

/**
 * Interface for order split result
 */
interface OrderSplitResult {
  orderId: string;
  brokerAllocations: Array<{
    brokerId: string;
    brokerName: string;
    quantity: number;
    percentage: number;
    estimatedPrice: number;
    estimatedFees: number;
    routingReason: string;
  }>;
  totalQuantity: number;
  estimatedAveragePrice: number;
  estimatedTotalFees: number;
  marketImpactReduction: number;
  executionTimeEstimate: number;
}

/**
 * Execute a smart order split across multiple brokers to minimize market impact
 */
export async function executeSmartOrderSplit(
  request: SmartOrderRoutingRequest
): Promise<OrderSplitResult> {
  try {
    const response = await fetch('/api/nexus/smart-order-split', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(request)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error executing smart order split:', error);
    throw new Error('Failed to execute smart order split');
  }
}

/**
 * Get anomaly detection for prices across brokers
 */
export async function detectPriceAnomalies(
  symbol: string
): Promise<Array<{brokerId: string, anomalyScore: number, recommendedAction: string}>> {
  try {
    const response = await fetch(`/api/nexus/price-anomalies?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.anomalies || [];
  } catch (error) {
    console.error('Error detecting price anomalies:', error);
    return [];
  }
}

// ----- Predictive Analytics Layer -----

/**
 * Interface for latency prediction
 */
interface LatencyPrediction {
  brokerId: string;
  brokerName: string;
  currentLatency: number;
  predictedLatency: number;
  confidenceScore: number;
  factors: Array<{factor: string, impact: number}>;
  bestTimeToExecute: string;
}

/**
 * Interface for slippage prediction
 */
interface SlippagePrediction {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  predictedSlippage: number;
  slippageRange: [number, number];
  confidenceScore: number;
  riskFactors: Array<{factor: string, risk: 'low' | 'medium' | 'high'}>;
  historicalAverage: number;
}

/**
 * Get latency forecasting based on time of day and network conditions
 */
export async function predictLatency(
  brokerId: string
): Promise<LatencyPrediction> {
  try {
    const response = await fetch(`/api/nexus/predict-latency?brokerId=${encodeURIComponent(brokerId)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error predicting latency:', error);
    throw new Error('Failed to predict latency');
  }
}

/**
 * Predict potential slippage for a trade based on historical data
 */
export async function predictSlippage(
  symbol: string,
  side: 'buy' | 'sell',
  quantity: number
): Promise<SlippagePrediction> {
  try {
    const queryParams = new URLSearchParams({
      symbol,
      side,
      quantity: quantity.toString()
    });
    
    const response = await fetch(`/api/nexus/predict-slippage?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error predicting slippage:', error);
    throw new Error('Failed to predict slippage');
  }
}

/**
 * Check for potential market manipulation by analyzing spreads
 */
export async function detectMarketManipulation(
  symbol: string
): Promise<{detected: boolean, confidence: number, anomalies: any[], recommendation: string}> {
  try {
    const response = await fetch(`/api/nexus/detect-manipulation?symbol=${encodeURIComponent(symbol)}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error detecting market manipulation:', error);
    return {
      detected: false,
      confidence: 0,
      anomalies: [],
      recommendation: 'Failed to perform market manipulation check'
    };
  }
}

// ----- User-Defined Weighting & Profiles -----

/**
 * Predefined execution profiles for different trading styles
 */
/**
 * Get supported broker types from Nexus
 */
export async function getSupportedBrokerTypes(): Promise<Array<{id: string, name: string, isSupported: boolean, hasDemo: boolean}>> {
  try {
    const response = await fetch('/api/nexus/broker-types');
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.brokerTypes || [];
  } catch (error) {
    console.error('Error getting supported broker types:', error);
    return [];
  }
}

/**
 * Interface for broker credentials
 */
export interface BrokerCredentials {
  brokerId: string;
  apiKey?: string;
  apiSecret?: string;
  accountId?: string;
  username?: string;
  password?: string;
  token?: string;
  useDemo?: boolean;
  additionalParams?: Record<string, string>;
}

/**
 * Test broker connection with provided credentials
 */
export async function testBrokerConnection(credentials: BrokerCredentials): Promise<{
  success: boolean;
  message: string;
  accountInfo?: any;
}> {
  try {
    const response = await fetch('/api/nexus/test-broker-connection', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error testing connection to ${credentials.brokerId}:`, error);
    return {
      success: false,
      message: `Failed to test connection: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

/**
 * Get account information from a connected broker
 */
export async function getBrokerAccountInfo(brokerId: string, useDemo?: boolean): Promise<{
  success: boolean;
  message: string;
  accountInfo?: any;
}> {
  try {
    const queryParams = new URLSearchParams({
      brokerId,
      ...(useDemo !== undefined && { useDemo: useDemo.toString() })
    });
    
    const response = await fetch(`/api/nexus/broker-account-info?${queryParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(`Error getting account info for ${brokerId}:`, error);
    return {
      success: false,
      message: `Failed to retrieve account information: ${error instanceof Error ? error.message : 'Unknown error'}`
    };
  }
}

export const EXECUTION_PROFILES: Record<string, ExecutionWeightingProfile> = {
  scalper: {
    name: 'Scalper',
    priceWeight: 60,
    speedWeight: 90,
    reliabilityWeight: 70,
    depthWeight: 40,
    fillRateWeight: 80,
    feesWeight: 50,
    volatilityWeight: 30
  },
  swingTrader: {
    name: 'Swing Trader',
    priceWeight: 80,
    speedWeight: 40,
    reliabilityWeight: 70,
    depthWeight: 60,
    fillRateWeight: 60,
    feesWeight: 70,
    volatilityWeight: 50
  },
  dayTrader: {
    name: 'Day Trader',
    priceWeight: 70,
    speedWeight: 70,
    reliabilityWeight: 70,
    depthWeight: 50,
    fillRateWeight: 70,
    feesWeight: 60,
    volatilityWeight: 40
  },
  institutional: {
    name: 'Institutional',
    priceWeight: 50,
    speedWeight: 40,
    reliabilityWeight: 90,
    depthWeight: 80,
    fillRateWeight: 90,
    feesWeight: 30,
    volatilityWeight: 70
  },
  custom: {
    name: 'Custom',
    priceWeight: 50,
    speedWeight: 50,
    reliabilityWeight: 50,
    depthWeight: 50,
    fillRateWeight: 50,
    feesWeight: 50,
    volatilityWeight: 50
  }
};

// Add backward compatibility aliases for the original non-Trade prefixed functions
export const initializeNexus = initializeTradeNexus;
export const toggleNexus = toggleTradeNexus;
export const resetNexus = resetTradeNexus;