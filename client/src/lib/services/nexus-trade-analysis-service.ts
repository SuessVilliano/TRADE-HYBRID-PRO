import axios from 'axios';
import { toast } from 'sonner';

interface TradeDetails {
  symbol: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  quantity: number;
  broker: string;
  timestamp: number;
  orderType: string;
  executionTime?: number;
  status: 'pending' | 'filled' | 'rejected' | 'cancelled';
  id: string;
  error?: string;
}

interface TradeExecutionResult {
  success: boolean;
  executionTime: number;
  slippage: number;
  latency: number;
  id: string;
  actualPrice: number;
  timestamp: number;
  error?: string;
}

interface TradeAnalysis {
  id: string;
  slippage: number;
  executionQuality: number;
  latency: number;
  errorRate: number;
  costSavings: number;
  brokerPerformance: Array<{
    broker: string;
    qualityScore: number;
    avgSlippage: number;
    avgLatency: number;
    reliability: number;
  }>;
  recommendations: string[];
  timestamp: number;
}

interface MarketConditionReport {
  volatility: number;
  liquidityScore: number;
  spreadWidening: boolean;
  abnormalActivity: boolean;
  marketImpact: 'low' | 'medium' | 'high';
  tradeRecommendation: string;
  timestamp: number;
}

interface ExecutionAnomaly {
  id: string;
  broker: string;
  anomalyType: 'slippage' | 'latency' | 'price' | 'rejection';
  severity: 'low' | 'medium' | 'high';
  description: string;
  timestamp: number;
  affected: string[];
  recommendedAction: string;
}

export class NexusTradeAnalysisService {
  private tradeHistory: TradeDetails[] = [];
  private tradeAnalytics: Record<string, TradeAnalysis> = {};
  private executionAnomalies: ExecutionAnomaly[] = [];
  private currentMarketConditions: Record<string, MarketConditionReport> = {};
  private apiHealthStatus: Record<string, {
    status: 'healthy' | 'degraded' | 'down';
    latency: number;
    successRate: number;
    lastChecked: number;
  }> = {};
  
  constructor() {
    this.loadStoredData();
    this.setupPeriodicHealthChecks();
  }
  
  /**
   * Load stored analytics data from local storage
   */
  private loadStoredData() {
    try {
      const storedTradeHistory = localStorage.getItem('nexus_trade_history');
      const storedAnalytics = localStorage.getItem('nexus_trade_analytics');
      const storedAnomalies = localStorage.getItem('nexus_execution_anomalies');
      
      if (storedTradeHistory) {
        this.tradeHistory = JSON.parse(storedTradeHistory);
      }
      
      if (storedAnalytics) {
        this.tradeAnalytics = JSON.parse(storedAnalytics);
      }
      
      if (storedAnomalies) {
        this.executionAnomalies = JSON.parse(storedAnomalies);
      }
    } catch (error) {
      console.error('Error loading Nexus trade analysis data:', error);
      
      // If there's an error, show a warning toast
      toast({
        title: 'Trade Analysis Warning',
        description: 'Nexus system detected high severity issues with your trade execution.',
        duration: 5000,
      });
    }
  }
  
  /**
   * Setup periodic health checks for broker APIs
   */
  private setupPeriodicHealthChecks() {
    // Run initial check
    this.checkBrokerApiHealth();
    
    // Setup interval (every 5 minutes)
    setInterval(() => {
      this.checkBrokerApiHealth();
    }, 5 * 60 * 1000);
  }
  
  /**
   * Check broker API health status
   */
  private async checkBrokerApiHealth() {
    try {
      const response = await fetch('/api/nexus/broker-health-status');
      
      if (response.ok) {
        const healthData = await response.json();
        this.apiHealthStatus = healthData;
        
        // Check for serious issues
        const criticalApis = Object.entries(healthData).filter(
          ([_, status]) => status.status === 'down' || status.successRate < 50
        );
        
        if (criticalApis.length > 0) {
          toast({
            title: 'Critical API Issues Detected',
            description: `${criticalApis.length} broker APIs are experiencing issues.`,
            duration: 8000,
          });
        }
      }
    } catch (error) {
      console.error('Error checking broker API health:', error);
    }
  }
  
  /**
   * Record a new trade execution for analysis
   */
  public recordTradeExecution(tradeDetails: TradeDetails, result: TradeExecutionResult) {
    // Create a complete trade record
    const tradeRecord = {
      ...tradeDetails,
      executionTime: result.executionTime,
      status: result.success ? 'filled' : 'rejected',
      error: result.error
    };
    
    // Add to history
    this.tradeHistory.push(tradeRecord);
    
    // Limit history size
    if (this.tradeHistory.length > 500) {
      this.tradeHistory = this.tradeHistory.slice(-500);
    }
    
    // Save to localStorage
    this.saveTradeHistory();
    
    // Analyze the execution
    this.analyzeTradeExecution(tradeRecord, result);
    
    // Check for execution anomalies
    this.detectExecutionAnomalies(tradeRecord, result);
  }
  
  /**
   * Analyze trade execution for quality metrics
   */
  private analyzeTradeExecution(trade: TradeDetails, result: TradeExecutionResult) {
    // Get previous trades for this broker and symbol
    const relevantTrades = this.tradeHistory.filter(
      t => t.broker === trade.broker && t.symbol === trade.symbol
    ).slice(-20);
    
    // Calculate broker performance metrics
    const brokerPerformance = this.calculateBrokerPerformance();
    
    // Generate recommendations
    const recommendations = this.generateTradeRecommendations(trade, result, brokerPerformance);
    
    // Create analysis record
    const analysis: TradeAnalysis = {
      id: trade.id,
      slippage: result.slippage,
      executionQuality: this.calculateExecutionQuality(result),
      latency: result.latency,
      errorRate: this.calculateErrorRate(trade.broker),
      costSavings: this.calculateCostSavings(trade, result),
      brokerPerformance,
      recommendations,
      timestamp: Date.now()
    };
    
    // Store analysis
    this.tradeAnalytics[trade.id] = analysis;
    
    // Save to localStorage
    localStorage.setItem('nexus_trade_analytics', JSON.stringify(this.tradeAnalytics));
    
    return analysis;
  }
  
  /**
   * Calculate average error rate for a broker
   */
  private calculateErrorRate(broker: string): number {
    const recentTrades = this.tradeHistory
      .filter(t => t.broker === broker)
      .slice(-50);
    
    if (recentTrades.length === 0) return 0;
    
    const errorCount = recentTrades.filter(t => t.status === 'rejected').length;
    return (errorCount / recentTrades.length) * 100;
  }
  
  /**
   * Calculate execution quality score (0-100)
   */
  private calculateExecutionQuality(result: TradeExecutionResult): number {
    // Base score
    let score = 100;
    
    // Penalize for slippage
    score -= Math.min(50, Math.abs(result.slippage) * 100);
    
    // Penalize for latency
    score -= Math.min(30, (result.latency / 1000) * 10);
    
    // Penalize for errors
    if (!result.success) {
      score -= 50;
    }
    
    return Math.max(0, Math.min(100, score));
  }
  
  /**
   * Calculate estimated cost savings from optimal execution
   */
  private calculateCostSavings(trade: TradeDetails, result: TradeExecutionResult): number {
    // Simple model: savings = quantity * price difference vs average
    // Get average execution price from similar trades
    const similarTrades = this.tradeHistory.filter(
      t => t.symbol === trade.symbol && 
           t.direction === trade.direction &&
           t.broker !== trade.broker &&
           t.status === 'filled'
    ).slice(-10);
    
    if (similarTrades.length === 0) return 0;
    
    // Calculate average execution price
    const avgPrice = similarTrades.reduce(
      (sum, t) => sum + (t.entryPrice || 0), 
      0
    ) / similarTrades.length;
    
    // Calculate savings
    const priceDiff = trade.direction === 'buy' 
      ? avgPrice - result.actualPrice 
      : result.actualPrice - avgPrice;
    
    return priceDiff * trade.quantity;
  }
  
  /**
   * Calculate performance metrics for all brokers
   */
  private calculateBrokerPerformance(): Array<{
    broker: string;
    qualityScore: number;
    avgSlippage: number;
    avgLatency: number;
    reliability: number;
  }> {
    const brokers = [...new Set(this.tradeHistory.map(t => t.broker))];
    
    return brokers.map(broker => {
      const brokerTrades = this.tradeHistory.filter(t => t.broker === broker);
      const filledTrades = brokerTrades.filter(t => t.status === 'filled');
      
      if (filledTrades.length === 0) {
        return {
          broker,
          qualityScore: 0,
          avgSlippage: 0,
          avgLatency: 0,
          reliability: 0
        };
      }
      
      // Calculate average slippage
      const totalSlippage = filledTrades.reduce(
        (sum, t) => sum + (t.entryPrice ? Math.abs(t.entryPrice - (t as any).actualPrice) / t.entryPrice : 0), 
        0
      );
      const avgSlippage = totalSlippage / filledTrades.length;
      
      // Calculate average latency
      const totalLatency = filledTrades.reduce(
        (sum, t) => sum + (t.executionTime || 0), 
        0
      );
      const avgLatency = totalLatency / filledTrades.length;
      
      // Calculate reliability
      const reliability = (filledTrades.length / brokerTrades.length) * 100;
      
      // Calculate quality score
      const qualityScore = 100 - (avgSlippage * 100) - (avgLatency / 100) - ((100 - reliability) / 2);
      
      return {
        broker,
        qualityScore: Math.max(0, Math.min(100, qualityScore)),
        avgSlippage,
        avgLatency,
        reliability
      };
    });
  }
  
  /**
   * Generate recommendations based on trade analysis
   */
  private generateTradeRecommendations(
    trade: TradeDetails,
    result: TradeExecutionResult,
    brokerPerformance: Array<{broker: string; qualityScore: number}>
  ): string[] {
    const recommendations: string[] = [];
    
    // Check for high slippage
    if (Math.abs(result.slippage) > 0.005) {
      recommendations.push(
        `Consider using limit orders for ${trade.symbol} to reduce slippage.`
      );
    }
    
    // Check for high latency
    if (result.latency > 2000) {
      recommendations.push(
        `Execution latency for ${trade.broker} is high. Consider alternative routing.`
      );
    }
    
    // Suggest better broker if applicable
    const currentBrokerScore = brokerPerformance.find(b => b.broker === trade.broker)?.qualityScore || 0;
    const bestBroker = brokerPerformance.sort((a, b) => b.qualityScore - a.qualityScore)[0];
    
    if (bestBroker && bestBroker.broker !== trade.broker && bestBroker.qualityScore > currentBrokerScore + 10) {
      recommendations.push(
        `${bestBroker.broker} has shown better execution quality for ${trade.symbol}. Consider switching.`
      );
    }
    
    // Add market condition based recommendations
    const marketCondition = this.currentMarketConditions[trade.symbol];
    if (marketCondition) {
      if (marketCondition.volatility > 0.8) {
        recommendations.push(
          `${trade.symbol} is highly volatile. Consider widening stop loss parameters.`
        );
      }
      
      if (marketCondition.liquidityScore < 0.4) {
        recommendations.push(
          `${trade.symbol} has low liquidity. Consider reducing position size to minimize market impact.`
        );
      }
    }
    
    return recommendations;
  }
  
  /**
   * Detect execution anomalies that require attention
   */
  private detectExecutionAnomalies(trade: TradeDetails, result: TradeExecutionResult) {
    // Check for severe slippage
    if (Math.abs(result.slippage) > 0.01) {
      this.addExecutionAnomaly({
        id: `slippage-${trade.id}`,
        broker: trade.broker,
        anomalyType: 'slippage',
        severity: Math.abs(result.slippage) > 0.02 ? 'high' : 'medium',
        description: `Unusually high slippage (${(result.slippage * 100).toFixed(2)}%) detected for ${trade.symbol} execution.`,
        timestamp: Date.now(),
        affected: [trade.symbol],
        recommendedAction: 'Review order routing and market conditions.'
      });
    }
    
    // Check for severe latency
    if (result.latency > 5000) {
      this.addExecutionAnomaly({
        id: `latency-${trade.id}`,
        broker: trade.broker,
        anomalyType: 'latency',
        severity: result.latency > 10000 ? 'high' : 'medium',
        description: `Extreme latency (${(result.latency / 1000).toFixed(1)}s) detected when executing ${trade.symbol}.`,
        timestamp: Date.now(),
        affected: [trade.broker],
        recommendedAction: 'Check network connectivity and broker API status.'
      });
    }
    
    // Check for rejection
    if (!result.success) {
      this.addExecutionAnomaly({
        id: `rejection-${trade.id}`,
        broker: trade.broker,
        anomalyType: 'rejection',
        severity: 'high',
        description: `Order rejection for ${trade.symbol}: ${result.error || 'Unknown error'}.`,
        timestamp: Date.now(),
        affected: [trade.broker, trade.symbol],
        recommendedAction: 'Verify order parameters and broker account status.'
      });
    }
  }
  
  /**
   * Add execution anomaly to the list
   */
  private addExecutionAnomaly(anomaly: ExecutionAnomaly) {
    // Add to list
    this.executionAnomalies.push(anomaly);
    
    // Limit list size
    if (this.executionAnomalies.length > 100) {
      this.executionAnomalies = this.executionAnomalies.slice(-100);
    }
    
    // Save to localStorage
    localStorage.setItem('nexus_execution_anomalies', JSON.stringify(this.executionAnomalies));
    
    // Show alert for high severity issues
    if (anomaly.severity === 'high') {
      toast({
        title: 'Execution Anomaly Detected',
        description: anomaly.description,
        duration: 8000,
      });
    }
  }
  
  /**
   * Get latest market condition for a symbol or fetch if needed
   */
  public async getMarketConditions(symbol: string): Promise<MarketConditionReport | null> {
    // Check if we have recent data (less than 15 minutes old)
    const existingData = this.currentMarketConditions[symbol];
    const now = Date.now();
    
    if (existingData && now - existingData.timestamp < 15 * 60 * 1000) {
      return existingData;
    }
    
    // Otherwise fetch new data
    try {
      const response = await fetch(`/api/nexus/market-conditions?symbol=${encodeURIComponent(symbol)}`);
      
      if (response.ok) {
        const data = await response.json();
        this.currentMarketConditions[symbol] = data;
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching market conditions:', error);
      return null;
    }
  }
  
  /**
   * Get trade history for analysis
   */
  public getTradeHistory(): TradeDetails[] {
    return [...this.tradeHistory];
  }
  
  /**
   * Get trade analysis by ID
   */
  public getTradeAnalysis(tradeId: string): TradeAnalysis | null {
    return this.tradeAnalytics[tradeId] || null;
  }
  
  /**
   * Get all execution anomalies
   */
  public getExecutionAnomalies(): ExecutionAnomaly[] {
    return [...this.executionAnomalies];
  }
  
  /**
   * Get broker API health status
   */
  public getBrokerApiHealth() {
    return {...this.apiHealthStatus};
  }
  
  /**
   * Save trade history to localStorage
   */
  private saveTradeHistory() {
    localStorage.setItem('nexus_trade_history', JSON.stringify(this.tradeHistory));
  }
  
  /**
   * Clear all analysis data (for troubleshooting)
   */
  public clearAllData() {
    this.tradeHistory = [];
    this.tradeAnalytics = {};
    this.executionAnomalies = [];
    this.currentMarketConditions = {};
    
    localStorage.removeItem('nexus_trade_history');
    localStorage.removeItem('nexus_trade_analytics');
    localStorage.removeItem('nexus_execution_anomalies');
    
    console.log('All Nexus trade analysis data has been cleared');
  }
}

// Export singleton instance
export const nexusTradeAnalysisService = new NexusTradeAnalysisService();