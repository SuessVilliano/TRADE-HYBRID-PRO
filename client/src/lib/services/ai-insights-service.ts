import axios from 'axios';

export interface TradePattern {
  id: string;
  name: string;
  description: string;
  frequency: number;
  successRate: number;
  averageProfit: number;
  averageLoss: number;
  riskRewardRatio: number;
  timeOfDay?: string;
  dayOfWeek?: string;
  preferredAssets: string[];
  recommendedActions: string[];
}

export interface TradeSummary {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  averageProfit: number;
  averageLoss: number;
  profitFactor: number;
  largestWin: number;
  largestLoss: number;
  averageHoldingTime: number;
  mostProfitableAsset: string;
  leastProfitableAsset: string;
}

export interface TradeRecommendation {
  symbol: string;
  direction: 'buy' | 'sell';
  confidence: number;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  timeframe: string;
  rationale: string;
  supportingFactors: string[];
  riskLevel: 'low' | 'medium' | 'high';
  optimalTimeOfDay?: string;
}

export interface MarketInsight {
  id: string;
  category: 'technical' | 'fundamental' | 'sentiment' | 'correlation';
  title: string;
  description: string;
  impact: 'positive' | 'negative' | 'neutral';
  confidence: number;
  symbols: string[];
  timeframe: string;
  source?: string;
  date: Date;
  relatedInsights?: string[];
}

export interface PersonalizedInsight {
  id: string;
  type: 'strength' | 'weakness' | 'opportunity' | 'threat';
  title: string;
  description: string;
  actionItems: string[];
  relevantPatterns?: string[];
  priority: 'low' | 'medium' | 'high';
  category: 'execution' | 'psychology' | 'strategy' | 'risk-management';
  dateIdentified: Date;
}

export interface RiskAssessment {
  overallRiskScore: number;
  positionSizing: {
    score: number;
    recommendation: string;
  };
  concentrationRisk: {
    score: number;
    tooConcentratedAssets: string[];
    recommendation: string;
  };
  marketExposure: {
    score: number;
    currentExposure: number;
    recommendation: string;
  };
  volatilityExposure: {
    score: number;
    highVolatilityAssets: string[];
    recommendation: string;
  };
  correlationRisk: {
    score: number;
    highlyCorrelatedPairs: Array<[string, string, number]>;
    recommendation: string;
  };
}

class AIInsightsService {
  private baseUrl = '/api/ai-insights';
  
  // Generate trade pattern analysis from user's historical trades
  async generateTradePatterns(userId: string): Promise<TradePattern[]> {
    try {
      const response = await axios.post(`${this.baseUrl}/trade-patterns`, { userId });
      return response.data.patterns;
    } catch (error) {
      console.error('Error generating trade patterns:', error);
      throw error;
    }
  }
  
  // Get a summary of the user's trading performance
  async getTradeSummary(userId: string, timeframe: 'day' | 'week' | 'month' | 'year' | 'all' = 'all'): Promise<TradeSummary> {
    try {
      const response = await axios.get(`${this.baseUrl}/trade-summary`, {
        params: { userId, timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching trade summary:', error);
      throw error;
    }
  }
  
  // Get personalized trade recommendations based on user patterns
  async getTradeRecommendations(userId: string, preferences?: {
    riskLevel?: 'low' | 'medium' | 'high';
    assetTypes?: string[];
    maxRecommendations?: number;
  }): Promise<TradeRecommendation[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/recommendations`, {
        params: {
          userId,
          ...preferences
        }
      });
      return response.data.recommendations;
    } catch (error) {
      console.error('Error fetching trade recommendations:', error);
      throw error;
    }
  }
  
  // Get AI-generated market insights relevant to the user's portfolio
  async getMarketInsights(userId: string, symbols?: string[]): Promise<MarketInsight[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/market-insights`, {
        params: {
          userId,
          symbols: symbols?.join(',')
        }
      });
      return response.data.insights;
    } catch (error) {
      console.error('Error fetching market insights:', error);
      throw error;
    }
  }
  
  // Get personalized insights for improving trading performance
  async getPersonalizedInsights(userId: string): Promise<PersonalizedInsight[]> {
    try {
      const response = await axios.get(`${this.baseUrl}/personalized-insights`, {
        params: { userId }
      });
      return response.data.insights;
    } catch (error) {
      console.error('Error fetching personalized insights:', error);
      throw error;
    }
  }
  
  // Get a risk assessment of the user's current portfolio
  async getRiskAssessment(userId: string): Promise<RiskAssessment> {
    try {
      const response = await axios.get(`${this.baseUrl}/risk-assessment`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching risk assessment:', error);
      throw error;
    }
  }
  
  // Get suggestions for optimizing trade exit strategies
  async getExitStrategyOptimization(userId: string, tradeId?: string): Promise<{
    currentStrategy: string;
    optimizedStrategy: string;
    potentialImprovement: number;
    rationale: string;
    implementation: string[];
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/exit-strategy-optimization`, {
        params: { userId, tradeId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching exit strategy optimization:', error);
      throw error;
    }
  }
  
  // Generate a forecast for a specific asset
  async generateAssetForecast(symbol: string, timeframe: '1d' | '1w' | '1m' | '3m'): Promise<{
    symbol: string;
    timeframe: string;
    forecast: {
      price: number;
      rangeHigh: number;
      rangeLow: number;
      confidence: number;
      supportLevels: number[];
      resistanceLevels: number[];
    };
    technicalFactors: Array<{
      factor: string;
      impact: 'bullish' | 'bearish' | 'neutral';
      weight: number;
    }>;
    fundamentalFactors: Array<{
      factor: string;
      impact: 'bullish' | 'bearish' | 'neutral';
      weight: number;
    }>;
    sentimentFactors: Array<{
      factor: string;
      impact: 'bullish' | 'bearish' | 'neutral';
      weight: number;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/asset-forecast`, {
        params: { symbol, timeframe }
      });
      return response.data;
    } catch (error) {
      console.error('Error generating asset forecast:', error);
      throw error;
    }
  }
  
  // Get suggestions for portfolio diversification
  async getPortfolioDiversificationSuggestions(userId: string): Promise<{
    currentDiversification: number;
    recommendedChanges: Array<{
      action: 'add' | 'reduce' | 'remove';
      symbol: string;
      rationale: string;
      targetAllocation?: number;
    }>;
    expectedImprovement: number;
    optimalSectorAllocation: Record<string, number>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/portfolio-diversification`, {
        params: { userId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching portfolio diversification suggestions:', error);
      throw error;
    }
  }
  
  // Get ML-based analysis of a specific chart pattern
  async analyzeChartPattern(symbol: string, timeframe: string, patternType?: string): Promise<{
    patternDetected: boolean;
    patternType: string;
    confidence: number;
    expectedOutcome: 'bullish' | 'bearish' | 'neutral';
    historicalAccuracy: number;
    keyLevels: {
      entry: number;
      stopLoss: number;
      targets: number[];
    };
    visualCues: string[];
    similarHistoricalPatterns: Array<{
      date: string;
      outcome: 'success' | 'failure';
      priceChange: number;
    }>;
  }> {
    try {
      const response = await axios.get(`${this.baseUrl}/chart-pattern-analysis`, {
        params: { symbol, timeframe, patternType }
      });
      return response.data;
    } catch (error) {
      console.error('Error analyzing chart pattern:', error);
      throw error;
    }
  }
}

export const aiInsightsService = new AIInsightsService();
export default aiInsightsService;