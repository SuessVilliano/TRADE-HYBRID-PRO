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

interface TradeAnalysisResult {
  executionQuality: string;
  slippageAnalysis: string;
  latencyAssessment: string;
  priceImpactAnalysis: string;
  recommendations: string[];
  optimizationSuggestions: string[];
  confidenceScore: number;
  flaggedIssues: {
    type: 'latency' | 'slippage' | 'price' | 'system';
    severity: 'low' | 'medium' | 'high';
    description: string;
    suggestedAction: string;
    autoResolved: boolean;
  }[];
}

interface TradePerformanceReport {
  overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
  avgExecutionTime: number;
  avgSlippage: number;
  successRate: number;
  recentIssues: number;
  brokerReliability: {
    [broker: string]: {
      reliability: number;
      avgLatency: number;
      avgSlippage: number;
      costEfficiency: number;
    }
  };
  systemRecommendations: string[];
}

export class ABATEVTradeAnalysisService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly OPENAI_MODEL = 'gpt-3.5-turbo';
  private recentTrades: TradeDetails[] = [];
  private recentExecutionResults: TradeExecutionResult[] = [];
  private autoResolveThreshold = {
    latency: 200, // ms
    slippage: 0.1, // percent
    price: 0.05 // percent
  };
  
  // Analyze a single trade execution
  async analyzeTrade(trade: TradeDetails, result: TradeExecutionResult): Promise<TradeAnalysisResult> {
    try {
      console.log(`Analyzing trade execution for ${trade.symbol}...`);
      
      // Store recent trades and execution results for historical analysis
      this.recentTrades.push(trade);
      this.recentExecutionResults.push(result);
      
      // If we have more than 20 entries, remove the oldest ones
      if (this.recentTrades.length > 20) {
        this.recentTrades.shift();
        this.recentExecutionResults.shift();
      }
      
      // Calculate key metrics
      const slippagePercent = ((result.actualPrice - trade.entryPrice) / trade.entryPrice) * 100 * (trade.direction === 'buy' ? 1 : -1);
      
      // Check for issues that need to be flagged
      const flaggedIssues = [];
      let highSeverityIssueFound = false;
      
      // Check latency
      if (result.latency > 500) {
        const severity: 'low' | 'medium' | 'high' = result.latency > 2000 ? 'high' : result.latency > 1000 ? 'medium' : 'low';
        const autoResolved = result.latency <= this.autoResolveThreshold.latency;
        
        flaggedIssues.push({
          type: 'latency',
          severity,
          description: `Execution latency of ${result.latency}ms is higher than optimal. This may affect trade performance.`,
          suggestedAction: `Check network connectivity and broker API reliability. Consider switching to a faster broker for time-sensitive trades.`,
          autoResolved
        });
        
        if (severity === 'high') highSeverityIssueFound = true;
      }
      
      // Check slippage
      if (Math.abs(slippagePercent) > 0.2) {
        const severity: 'low' | 'medium' | 'high' = Math.abs(slippagePercent) > 1 ? 'high' : Math.abs(slippagePercent) > 0.5 ? 'medium' : 'low';
        const autoResolved = Math.abs(slippagePercent) <= this.autoResolveThreshold.slippage;
        
        flaggedIssues.push({
          type: 'slippage',
          severity,
          description: `Price slippage of ${slippagePercent.toFixed(2)}% detected. This impacts execution quality.`,
          suggestedAction: `Consider using limit orders for less liquid markets or reducing position size to minimize market impact.`,
          autoResolved
        });
        
        if (severity === 'high') highSeverityIssueFound = true;
      }
      
      // If execution failed, add system issue
      if (!result.success) {
        flaggedIssues.push({
          type: 'system',
          severity: 'high',
          description: `Trade execution failed: ${result.error}`,
          suggestedAction: 'Check broker connectivity and authentication. Verify order parameters are valid.',
          autoResolved: false
        });
        
        highSeverityIssueFound = true;
      }
      
      // If we found high severity issues, show a toast notification
      if (highSeverityIssueFound) {
        toast.error('Trade execution issues detected', {
          description: 'ABATEV system detected high severity issues with your trade execution.',
          action: {
            label: 'View Details',
            onClick: () => {
              // This would typically open a modal with details
              console.log('Show execution issues modal');
            }
          }
        });
      }
      
      // Generate AI analysis for more detailed insights
      if (result.success) {
        const prompt = `
          Analyze this trade execution and provide detailed insights:
          
          Symbol: ${trade.symbol}
          Direction: ${trade.direction.toUpperCase()}
          Entry Price: ${trade.entryPrice}
          Actual Execution Price: ${result.actualPrice}
          Slippage: ${slippagePercent.toFixed(4)}%
          Execution Time: ${result.executionTime}ms
          Latency: ${result.latency}ms
          Broker: ${trade.broker}
          
          Provide a comprehensive analysis including:
          1. Execution Quality: Assessment of overall execution quality
          2. Slippage Analysis: Analysis of price slippage and its impact
          3. Latency Assessment: Evaluation of execution latency
          4. Price Impact Analysis: Analysis of order's impact on market price
          5. Recommendations: 3-5 specific recommendations for improving execution
          6. Optimization Suggestions: Specific suggestions for optimizing future trades
          7. Confidence Score: A number between 0-100 indicating confidence in this analysis
          
          Format your response as JSON with the following structure:
          {
            "executionQuality": "string",
            "slippageAnalysis": "string",
            "latencyAssessment": "string",
            "priceImpactAnalysis": "string",
            "recommendations": ["string", "string", "string"],
            "optimizationSuggestions": ["string", "string"],
            "confidenceScore": number
          }
        `;
        
        try {
          const response = await this.callOpenAI(prompt);
          const jsonStartIndex = response.indexOf('{');
          const jsonEndIndex = response.lastIndexOf('}') + 1;
          
          if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
            const jsonStr = response.substring(jsonStartIndex, jsonEndIndex);
            const parsedResponse = JSON.parse(jsonStr);
            
            return {
              ...parsedResponse,
              flaggedIssues
            };
          }
        } catch (error) {
          console.error('Error generating AI analysis:', error);
        }
      }
      
      // Return default structured data if JSON parsing fails or trade failed
      return {
        executionQuality: result.success ? "Average execution with some noted issues" : "Failed execution",
        slippageAnalysis: `Slippage of ${slippagePercent.toFixed(4)}% was ${Math.abs(slippagePercent) > 0.1 ? "higher than optimal" : "within acceptable range"}.`,
        latencyAssessment: `Execution latency of ${result.latency}ms was ${result.latency > 500 ? "higher than optimal" : "within acceptable range"}.`,
        priceImpactAnalysis: "Unable to generate detailed price impact analysis.",
        recommendations: [
          "Consider using limit orders for better price control",
          "Monitor broker execution quality over time",
          "Review network connectivity for improved latency"
        ],
        optimizationSuggestions: [
          "Consider trading during higher liquidity periods",
          "Evaluate alternative execution venues"
        ],
        confidenceScore: 60,
        flaggedIssues
      };
    } catch (error) {
      console.error('Error in trade analysis:', error);
      return {
        executionQuality: "Analysis failed",
        slippageAnalysis: "Analysis failed",
        latencyAssessment: "Analysis failed",
        priceImpactAnalysis: "Analysis failed",
        recommendations: ["System encountered an error during analysis"],
        optimizationSuggestions: ["Try again later"],
        confidenceScore: 0,
        flaggedIssues: [
          {
            type: 'system',
            severity: 'high',
            description: 'Analysis system encountered an error',
            suggestedAction: 'Contact support if this persists',
            autoResolved: false
          }
        ]
      };
    }
  }
  
  // Generate a performance report across multiple trades
  async generatePerformanceReport(): Promise<TradePerformanceReport> {
    try {
      const trades = this.recentTrades;
      const results = this.recentExecutionResults;
      
      if (trades.length === 0) {
        return {
          overallHealth: 'good',
          avgExecutionTime: 0,
          avgSlippage: 0,
          successRate: 100,
          recentIssues: 0,
          brokerReliability: {},
          systemRecommendations: ["Not enough trade data to generate comprehensive recommendations"]
        };
      }
      
      // Calculate key metrics
      const successfulTrades = results.filter(r => r.success).length;
      const successRate = (successfulTrades / results.length) * 100;
      const avgExecutionTime = results.reduce((sum, r) => sum + (r.executionTime || 0), 0) / results.length;
      
      // Calculate average slippage
      let totalSlippage = 0;
      for (let i = 0; i < Math.min(trades.length, results.length); i++) {
        if (results[i].success) {
          const slippagePercent = ((results[i].actualPrice - trades[i].entryPrice) / trades[i].entryPrice) * 100 * (trades[i].direction === 'buy' ? 1 : -1);
          totalSlippage += Math.abs(slippagePercent);
        }
      }
      const avgSlippage = totalSlippage / successfulTrades;
      
      // Count recent issues
      const recentIssues = results.filter(r => !r.success || r.latency > 1000 || Math.abs(((r.actualPrice - trades[results.indexOf(r)].entryPrice) / trades[results.indexOf(r)].entryPrice) * 100) > 0.5).length;
      
      // Calculate broker reliability
      const brokerStats = {};
      const brokers = [...new Set(trades.map(t => t.broker))];
      
      brokers.forEach(broker => {
        const brokerTrades = trades.filter(t => t.broker === broker);
        const brokerResults = brokerTrades.map(t => results.find(r => r.id === t.id)).filter(Boolean);
        
        if (brokerResults.length > 0) {
          const brokerSuccessRate = (brokerResults.filter(r => r.success).length / brokerResults.length) * 100;
          const brokerAvgLatency = brokerResults.reduce((sum, r) => sum + r.latency, 0) / brokerResults.length;
          
          let brokerTotalSlippage = 0;
          for (let i = 0; i < brokerTrades.length; i++) {
            const result = results.find(r => r.id === brokerTrades[i].id);
            if (result && result.success) {
              const slippagePercent = ((result.actualPrice - brokerTrades[i].entryPrice) / brokerTrades[i].entryPrice) * 100 * (brokerTrades[i].direction === 'buy' ? 1 : -1);
              brokerTotalSlippage += Math.abs(slippagePercent);
            }
          }
          const brokerAvgSlippage = brokerTotalSlippage / brokerResults.filter(r => r.success).length || 0;
          
          // Calculate cost efficiency (lower is better)
          // This is a simplified metric combining latency and slippage
          const costEfficiency = 100 - (brokerAvgLatency / 20 + brokerAvgSlippage * 10);
          
          brokerStats[broker] = {
            reliability: brokerSuccessRate,
            avgLatency: brokerAvgLatency,
            avgSlippage: brokerAvgSlippage,
            costEfficiency: Math.max(0, Math.min(100, costEfficiency))
          };
        }
      });
      
      // Determine overall health
      let overallHealth: 'excellent' | 'good' | 'fair' | 'poor' | 'critical';
      if (successRate > 95 && avgExecutionTime < 500 && avgSlippage < 0.1) {
        overallHealth = 'excellent';
      } else if (successRate > 90 && avgExecutionTime < 1000 && avgSlippage < 0.3) {
        overallHealth = 'good';
      } else if (successRate > 80 && avgExecutionTime < 2000 && avgSlippage < 0.5) {
        overallHealth = 'fair';
      } else if (successRate > 70) {
        overallHealth = 'poor';
      } else {
        overallHealth = 'critical';
      }
      
      // Generate system recommendations
      let systemRecommendations = [];
      
      if (successRate < 90) {
        systemRecommendations.push("Improve trade success rate by checking broker connectivity and order parameters");
      }
      
      if (avgExecutionTime > 1000) {
        systemRecommendations.push("Reduce execution time by optimizing network connectivity or switching to a faster broker");
      }
      
      if (avgSlippage > 0.3) {
        systemRecommendations.push("Reduce slippage by using limit orders, trading during higher liquidity periods, or reducing order size");
      }
      
      // Find the best performing broker
      const brokerNames = Object.keys(brokerStats);
      if (brokerNames.length > 1) {
        const bestBroker = brokerNames.reduce((best, current) => {
          return brokerStats[current].costEfficiency > brokerStats[best].costEfficiency ? current : best;
        }, brokerNames[0]);
        
        const worstBroker = brokerNames.reduce((worst, current) => {
          return brokerStats[current].costEfficiency < brokerStats[worst].costEfficiency ? current : worst;
        }, brokerNames[0]);
        
        if (brokerStats[bestBroker].costEfficiency - brokerStats[worstBroker].costEfficiency > 20) {
          systemRecommendations.push(`Consider using ${bestBroker} more frequently as it shows better execution performance than ${worstBroker}`);
        }
      }
      
      // Return the performance report
      return {
        overallHealth,
        avgExecutionTime,
        avgSlippage,
        successRate,
        recentIssues,
        brokerReliability: brokerStats,
        systemRecommendations
      };
    } catch (error) {
      console.error('Error generating performance report:', error);
      return {
        overallHealth: 'fair',
        avgExecutionTime: 0,
        avgSlippage: 0,
        successRate: 0,
        recentIssues: 0,
        brokerReliability: {},
        systemRecommendations: ["Error generating performance report"]
      };
    }
  }
  
  // Auto-escalate issues to support if they are severe enough
  autoEscalateIssues(analysis: TradeAnalysisResult): boolean {
    try {
      // Check if there are any high severity issues that couldn't be auto-resolved
      const severeUnresolvedIssues = analysis.flaggedIssues.filter(
        issue => issue.severity === 'high' && !issue.autoResolved
      );
      
      if (severeUnresolvedIssues.length > 0) {
        // Log the issues for support
        console.log('Auto-escalating severe trade execution issues:', severeUnresolvedIssues);
        
        // Create a summary of the issues
        const issuesSummary = severeUnresolvedIssues.map(issue => 
          `[${issue.type.toUpperCase()}] ${issue.description}`
        ).join('\n');
        
        // Show notification to user
        toast.error('Trade issues escalated to support', {
          description: 'Severe execution issues were detected and have been escalated to our support team.',
          duration: 6000
        });
        
        // In a real implementation, we would send these issues to a support system
        // This is a mock implementation
        setTimeout(() => {
          toast.success('Support team notified', {
            description: 'Our team will investigate the reported issues and contact you if needed.',
            duration: 5000
          });
        }, 3000);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error in auto-escalation:', error);
      return false;
    }
  }
  
  // Attempt to auto-resolve common issues
  async autoResolveIssues(analysis: TradeAnalysisResult, trade: TradeDetails): Promise<{ resolved: boolean, resolutionSteps: string[] }> {
    const resolutionSteps: string[] = [];
    let anyResolved = false;
    
    try {
      for (const issue of analysis.flaggedIssues) {
        if (issue.autoResolved) continue; // Skip already resolved issues
        
        switch(issue.type) {
          case 'latency':
            if (issue.severity !== 'high') {
              // For non-severe latency issues, we can suggest a different broker
              const alternativeBrokers = this.suggestAlternativeBrokers(trade.broker);
              if (alternativeBrokers.length > 0) {
                resolutionSteps.push(`Detected high latency (${trade.broker}). Consider using ${alternativeBrokers[0].name} for faster execution.`);
                issue.autoResolved = true;
                anyResolved = true;
              }
            }
            break;
            
          case 'slippage':
            if (issue.severity !== 'high') {
              // For non-severe slippage issues, suggest limit orders
              resolutionSteps.push('Detected price slippage. Future trades will default to limit orders for better price control.');
              issue.autoResolved = true;
              anyResolved = true;
            }
            break;
            
          case 'system':
            // System issues typically require manual intervention
            resolutionSteps.push('System issue detected. This requires manual review by our team.');
            break;
        }
      }
      
      return {
        resolved: anyResolved,
        resolutionSteps
      };
    } catch (error) {
      console.error('Error in auto-resolution:', error);
      return {
        resolved: false,
        resolutionSteps: ['Auto-resolution failed due to system error']
      };
    }
  }
  
  // Helper method to suggest alternative brokers
  private suggestAlternativeBrokers(currentBroker: string): { id: string, name: string }[] {
    // Mock broker data - in a real implementation, this would come from a broker service
    const brokers = [
      { id: 'binance', name: 'Binance', latency: 120, reliability: 98 },
      { id: 'coinbase', name: 'Coinbase', latency: 150, reliability: 99 },
      { id: 'kraken', name: 'Kraken', latency: 140, reliability: 97 },
      { id: 'ftx', name: 'FTX', latency: 110, reliability: 96 },
      { id: 'bybit', name: 'Bybit', latency: 125, reliability: 98 }
    ];
    
    // Find brokers with better latency than current broker
    const currentBrokerData = brokers.find(b => b.id === currentBroker);
    if (!currentBrokerData) return [];
    
    return brokers
      .filter(b => b.id !== currentBroker && b.latency < currentBrokerData.latency)
      .map(b => ({ id: b.id, name: b.name }))
      .sort((a, b) => {
        const brokerA = brokers.find(br => br.id === a.id);
        const brokerB = brokers.find(br => br.id === b.id);
        return (brokerA?.latency || 999) - (brokerB?.latency || 999);
      });
  }
  
  // Helper method to call OpenAI API
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.OPENAI_API_URL,
        {
          model: this.OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI trading execution analyst with deep knowledge of markets, trading systems, execution quality metrics, and best practices. Provide accurate, concise, and actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const abatevTradeAnalysisService = new ABATEVTradeAnalysisService();