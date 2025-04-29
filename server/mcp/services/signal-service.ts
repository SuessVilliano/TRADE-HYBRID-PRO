/**
 * Enhanced Signal Service
 * 
 * A robust service for fetching, processing, and managing trading signals
 * with advanced error handling and retry logic
 */

import { TradeSignal, SignalStatus, SignalFilter } from '../types/trade-signal';
import { MCPServer } from '../core/mcp-server';
import { MCPMessageType } from '../config/mcp-config';

/**
 * Signal Service Class
 */
export class SignalService {
  private static instance: SignalService;
  private mcp: MCPServer;
  private activeSignals: Map<string, TradeSignal> = new Map();
  private signalProviders: Map<string, string[]> = new Map();
  private retryIntervals: number[] = [1000, 5000, 15000, 30000, 60000]; // Retry intervals in ms
  private maxRetries: number = 3;
  private fallbackEnabled: boolean = true;
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    
    // Initialize signal providers by timeframe
    this.signalProviders.set('5m', ['Solaris']);
    this.signalProviders.set('10m', ['Hybrid']);
    this.signalProviders.set('30m', ['Paradox']);
    this.signalProviders.set('1h', ['Quantum']);
    this.signalProviders.set('4h', ['Phoenix']);
    
    console.log('Signal Service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): SignalService {
    if (!SignalService.instance) {
      SignalService.instance = new SignalService(mcp);
    }
    return SignalService.instance;
  }
  
  /**
   * Fetch signals with retry logic
   */
  public async fetchSignals(
    source?: string, 
    timeframe?: string,
    retryCount: number = 0
  ): Promise<TradeSignal[]> {
    try {
      console.log(`Fetching signals from ${source || 'all sources'} (${timeframe || 'all timeframes'})`);
      
      // Simulate API request to the signals service
      // Replace with actual fetch logic in production
      const response = await fetch('/api/signals/trading-signals');
      
      if (!response.ok) {
        throw new Error(`Signal API responded with ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (!data.signals || !Array.isArray(data.signals)) {
        throw new Error('Invalid signal data structure');
      }
      
      // Filter signals if needed
      let signals = data.signals as TradeSignal[];
      
      if (source) {
        signals = signals.filter(s => s.source.toLowerCase() === source.toLowerCase());
      }
      
      if (timeframe) {
        signals = signals.filter(s => s.timeframe === timeframe);
      }
      
      // Update active signals
      signals.forEach(signal => {
        if (signal.status === 'active') {
          this.activeSignals.set(signal.id, signal);
        } else {
          // Remove if no longer active
          this.activeSignals.delete(signal.id);
        }
      });
      
      return signals;
    } catch (error) {
      console.error('Error fetching signals:', error);
      
      if (retryCount < this.maxRetries) {
        // Exponential backoff retry
        const retryDelay = this.retryIntervals[Math.min(retryCount, this.retryIntervals.length - 1)];
        console.log(`Retrying signal fetch in ${retryDelay}ms (attempt ${retryCount + 1}/${this.maxRetries})`);
        
        return new Promise(resolve => {
          setTimeout(async () => {
            const retryResult = await this.fetchSignals(source, timeframe, retryCount + 1);
            resolve(retryResult);
          }, retryDelay);
        });
      }
      
      // If all retries failed and fallback is enabled, use local cache
      if (this.fallbackEnabled) {
        console.log('Using cached signals as fallback after failed retries');
        return this.getActiveSignals(source, timeframe);
      }
      
      // If all else fails, return empty array
      return [];
    }
  }
  
  /**
   * Get active signals from local cache
   */
  public getActiveSignals(source?: string, timeframe?: string): TradeSignal[] {
    let signals = Array.from(this.activeSignals.values());
    
    if (source) {
      signals = signals.filter(s => s.source.toLowerCase() === source.toLowerCase());
    }
    
    if (timeframe) {
      signals = signals.filter(s => s.timeframe === timeframe);
    }
    
    return signals;
  }
  
  /**
   * Filter signals based on criteria
   */
  public filterSignals(signals: TradeSignal[], filter: SignalFilter): TradeSignal[] {
    return signals.filter(signal => {
      // Filter by status
      if (filter.status) {
        const statusFilter = Array.isArray(filter.status) ? filter.status : [filter.status];
        if (!statusFilter.includes(signal.status)) {
          return false;
        }
      }
      
      // Filter by source
      if (filter.source) {
        const sourceFilter = Array.isArray(filter.source) ? filter.source : [filter.source];
        if (!sourceFilter.some(s => signal.source.toLowerCase().includes(s.toLowerCase()))) {
          return false;
        }
      }
      
      // Filter by timeframe
      if (filter.timeframe) {
        const timeframeFilter = Array.isArray(filter.timeframe) ? filter.timeframe : [filter.timeframe];
        if (!signal.timeframe || !timeframeFilter.includes(signal.timeframe)) {
          return false;
        }
      }
      
      // Filter by symbol
      if (filter.symbol) {
        const symbolFilter = Array.isArray(filter.symbol) ? filter.symbol : [filter.symbol];
        if (!symbolFilter.some(s => signal.symbol.toLowerCase().includes(s.toLowerCase()))) {
          return false;
        }
      }
      
      // Filter by date range
      if (filter.dateRange) {
        const signalDate = new Date(signal.timestamp);
        const fromDate = typeof filter.dateRange.from === 'string' 
          ? new Date(filter.dateRange.from) 
          : filter.dateRange.from;
        const toDate = typeof filter.dateRange.to === 'string' 
          ? new Date(filter.dateRange.to) 
          : filter.dateRange.to;
        
        if (signalDate < fromDate || signalDate > toDate) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Process a new signal
   */
  public async processNewSignal(signal: TradeSignal): Promise<void> {
    try {
      console.log(`Processing new signal: ${signal.id} (${signal.type} ${signal.symbol})`);
      
      // Validate signal
      if (!this.validateSignal(signal)) {
        console.error(`Invalid signal rejected: ${signal.id}`);
        return;
      }
      
      // Add to active signals
      this.activeSignals.set(signal.id, signal);
      
      // Publish to MCP
      this.mcp.publish('signals', {
        type: MCPMessageType.NEW_SIGNAL,
        priority: 1,
        payload: signal
      });
      
      console.log(`Signal ${signal.id} published to MCP`);
    } catch (error) {
      console.error(`Error processing signal ${signal.id}:`, error);
    }
  }
  
  /**
   * Update signal status
   */
  public async updateSignalStatus(
    signalId: string,
    status: SignalStatus,
    metadata?: any
  ): Promise<boolean> {
    const signal = this.activeSignals.get(signalId);
    
    if (!signal) {
      console.error(`Cannot update status for unknown signal: ${signalId}`);
      return false;
    }
    
    // Update signal
    signal.status = status;
    
    // If filled or cancelled, remove from active signals
    if (status === 'filled' || status === 'cancelled' || status === 'expired') {
      this.activeSignals.delete(signalId);
    } else {
      this.activeSignals.set(signalId, signal);
    }
    
    // Publish status update
    this.mcp.publish('signals', {
      type: MCPMessageType.SIGNAL_STATUS_UPDATE,
      priority: 2,
      payload: {
        signalId,
        status,
        metadata,
        timestamp: new Date().toISOString()
      }
    });
    
    console.log(`Signal ${signalId} status updated to ${status}`);
    return true;
  }
  
  /**
   * Get signals by provider
   */
  public getSignalsByProvider(provider: string): TradeSignal[] {
    return Array.from(this.activeSignals.values())
      .filter(signal => signal.source.toLowerCase() === provider.toLowerCase());
  }
  
  /**
   * Validate a signal
   */
  private validateSignal(signal: TradeSignal): boolean {
    // Check required fields
    if (!signal.id || !signal.symbol || !signal.type || !signal.source) {
      return false;
    }
    
    // Validate trade type
    if (signal.type !== 'buy' && signal.type !== 'sell') {
      return false;
    }
    
    // Validate numeric values
    if (
      (signal.entry !== undefined && isNaN(signal.entry)) ||
      (signal.stopLoss !== undefined && isNaN(signal.stopLoss)) ||
      (signal.takeProfit !== undefined && isNaN(signal.takeProfit)) ||
      (signal.risk !== undefined && isNaN(signal.risk))
    ) {
      return false;
    }
    
    // Validate date
    try {
      new Date(signal.timestamp);
    } catch (e) {
      return false;
    }
    
    return true;
  }
}

/**
 * Initialize the signal service
 */
export function initializeSignalService(mcp: MCPServer): SignalService {
  return SignalService.getInstance(mcp);
}