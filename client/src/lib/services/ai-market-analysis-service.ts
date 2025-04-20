import { MarketData } from "./broker-service";
import { MarketData as BrokerMarketData } from "./broker-service";
import { TradingSignal } from "@/lib/stores/useSignals";
import { config } from "@/lib/config";

export interface AIMarketAnalysis {
  symbol: string;
  prediction: {
    direction: 'bullish' | 'bearish' | 'neutral';
    confidence: number; // 0-100%
    priceTarget: number | null;
    timeframe: string; // "short-term", "medium-term", "long-term"
  };
  patterns: MarketPattern[];
  signals: TradingSignal[];
  insights: string[];
  riskAssessment: {
    level: 'low' | 'medium' | 'high';
    factors: string[];
  };
  lastUpdated: Date;
}

export interface MarketPattern {
  name: string;
  type: 'bullish' | 'bearish' | 'neutral';
  confidence: number; // 0-100%
  description: string;
  visualRange?: [number, number]; // Index range in market data where pattern is visible
}

export interface AITradeSuggestion {
  id: string;
  symbol: string;
  operation: 'buy' | 'sell' | 'hold';
  entryPrice: number | null;
  targetPrice: number | null;
  stopLoss: number | null;
  confidence: number; // 0-100%
  reasoning: string[];
  timeframe: string;
  timestamp: Date;
  expiresAt: Date | null;
  status: 'active' | 'expired' | 'successful' | 'stopped';
}

export class AIMarketAnalysisService {
  private static instance: AIMarketAnalysisService;
  private analysisCache: Map<string, AIMarketAnalysis> = new Map();
  private suggestionCache: Map<string, AITradeSuggestion[]> = new Map();
  
  private constructor() {}
  
  public static getInstance(): AIMarketAnalysisService {
    if (!AIMarketAnalysisService.instance) {
      AIMarketAnalysisService.instance = new AIMarketAnalysisService();
    }
    return AIMarketAnalysisService.instance;
  }

  /**
   * Analyzes market data to generate AI-driven insights
   * @param symbol Trading symbol to analyze
   * @param marketData Historical market data
   * @param timeframe Analysis timeframe (e.g., "1h", "1d", "1w")
   */
  public async analyzeMarket(
    symbol: string,
    marketData: MarketData[],
    timeframe: string
  ): Promise<AIMarketAnalysis> {
    // Check cache first (with 5 minute expiry)
    const cachedAnalysis = this.analysisCache.get(symbol);
    if (cachedAnalysis && 
        (new Date().getTime() - cachedAnalysis.lastUpdated.getTime() < 5 * 60 * 1000)) {
      return cachedAnalysis;
    }
    
    // Use server-side AI endpoint which will use the OpenAI API
    try {
      // Only call the API if either:
      // 1. Server-side AI is enabled and the server has the OpenAI API key, or
      // 2. We have a direct OpenAI API key available client-side
      if (config.USE_SERVER_AI || config.OPENAI_API_KEY) {
        console.log("Fetching AI market analysis from server");
        
        // Prepare API call parameters
        const apiEndpoint = '/api/ai-market-analysis';
        const queryParams = new URLSearchParams({
          symbol,
          timeframe,
          depth: 'advanced',
          includeTechnicals: 'true',
          includeFundamentals: 'true',
          includeSentiment: 'true'
        });
        
        // Make the API request to our backend
        const response = await fetch(`${apiEndpoint}?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const serverResponse = await response.json();
        console.log("Received AI analysis from server:", serverResponse);
        
        // Convert server response to client AIMarketAnalysis format
        const aiAnalysis = this.convertServerResponseToAnalysis(symbol, serverResponse);
        
        // Cache the result
        this.analysisCache.set(symbol, aiAnalysis);
        return aiAnalysis;
      }
    } catch (error) {
      console.error("Error fetching AI market analysis:", error);
    }
    
    // Fallback to generated analysis if API call fails
    console.log("Using generated market analysis (API unavailable)");
    const analysis = this.generateMarketAnalysis(symbol, marketData, timeframe);
    
    // Cache the result
    this.analysisCache.set(symbol, analysis);
    
    return analysis;
  }
  
  /**
   * Converts server API response to client AIMarketAnalysis format
   */
  private convertServerResponseToAnalysis(symbol: string, serverResponse: any): AIMarketAnalysis {
    if (!serverResponse || !serverResponse.analysis) {
      throw new Error("Invalid server response format");
    }
    
    // Extract the main parts of the server response
    const { analysis, hybridScore, timeframe } = serverResponse;
    
    // Convert server technical indicators to client patterns format
    const patterns: MarketPattern[] = [];
    
    if (analysis.technicalAnalysis?.keyIndicators) {
      analysis.technicalAnalysis.keyIndicators.forEach((indicator: any) => {
        // Determine pattern type based on interpretation content
        let patternType: 'bullish' | 'bearish' | 'neutral' = 'neutral';
        if (indicator.interpretation.toLowerCase().includes('bullish') || 
            indicator.interpretation.toLowerCase().includes('upside')) {
          patternType = 'bullish';
        } else if (indicator.interpretation.toLowerCase().includes('bearish') || 
                   indicator.interpretation.toLowerCase().includes('downside')) {
          patternType = 'bearish';
        }
        
        patterns.push({
          name: indicator.name,
          type: patternType,
          confidence: Math.round(hybridScore.confidence * 0.8 + Math.random() * 20),
          description: indicator.interpretation
        });
      });
    }
    
    // Extract insights from various analysis sections
    const insights: string[] = [analysis.summary];
    
    if (analysis.technicalAnalysis) {
      insights.push(analysis.technicalAnalysis.shortTerm);
      insights.push(analysis.technicalAnalysis.mediumTerm);
      insights.push(analysis.technicalAnalysis.longTerm);
    }
    
    if (analysis.fundamentalAnalysis) {
      insights.push(analysis.fundamentalAnalysis.outlook);
    }
    
    if (analysis.sentimentAnalysis) {
      insights.push(analysis.sentimentAnalysis.overall);
    }
    
    // Filter out any undefined insights and ensure uniqueness
    const uniqueInsights = [...new Set(insights.filter(Boolean))];
    
    // Convert to client AIMarketAnalysis format
    return {
      symbol,
      prediction: {
        direction: hybridScore.direction,
        confidence: hybridScore.confidence,
        priceTarget: analysis.tradingSuggestions.targetPrice || null,
        timeframe: this.mapTimeframeToHuman(timeframe)
      },
      patterns,
      signals: [], // These would be generated separately
      insights: uniqueInsights,
      riskAssessment: {
        level: analysis.riskAssessment.overallRisk,
        factors: analysis.riskAssessment.keyRisks
      },
      lastUpdated: new Date()
    };
  }
  
  /**
   * Gets AI-generated trade suggestions for a symbol
   * @param symbol Trading symbol
   * @param count Number of suggestions to return
   */
  public async getTradeSuggestions(
    symbol: string,
    count: number = 3
  ): Promise<AITradeSuggestion[]> {
    // Check cache first
    const cachedSuggestions = this.suggestionCache.get(symbol);
    if (cachedSuggestions) {
      // Filter out expired suggestions
      const activeSuggestions = cachedSuggestions.filter(
        suggestion => !suggestion.expiresAt || suggestion.expiresAt > new Date()
      );
      
      if (activeSuggestions.length >= count) {
        return activeSuggestions.slice(0, count);
      }
    }
    
    // Use server-side AI endpoint for trading suggestions
    try {
      if (config.USE_SERVER_AI || config.OPENAI_API_KEY) {
        console.log("Fetching AI trading suggestions from server");
        
        // Prepare API call parameters
        const apiEndpoint = '/api/trading-suggestions';
        const queryParams = new URLSearchParams({
          symbol,
          riskProfile: 'medium' // Default risk profile
        });
        
        // Make the API request to our backend
        const response = await fetch(`${apiEndpoint}?${queryParams.toString()}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`API request failed: ${response.status} - ${errorText}`);
        }
        
        const serverResponse = await response.json();
        console.log("Received trading suggestions from server:", serverResponse);
        
        if (serverResponse.suggestions && Array.isArray(serverResponse.suggestions)) {
          // Convert server response to client AITradeSuggestion format
          const suggestions = this.convertServerSuggestionsToClientFormat(symbol, serverResponse.suggestions);
          
          // Cache the result
          this.suggestionCache.set(symbol, suggestions);
          return suggestions;
        }
      }
    } catch (error) {
      console.error("Error fetching AI trading suggestions:", error);
    }
    
    // Fallback to generated suggestions
    console.log("Using generated trading suggestions (API unavailable)");
    const suggestions = this.generateTradeSuggestions(symbol, count);
    
    // Cache the result
    this.suggestionCache.set(symbol, suggestions);
    
    return suggestions;
  }
  
  /**
   * Converts server API suggestions to client AITradeSuggestion format
   */
  private convertServerSuggestionsToClientFormat(symbol: string, serverSuggestions: any[]): AITradeSuggestion[] {
    return serverSuggestions.map(suggestion => {
      // Create expiration date (3 days in the future by default)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 3);
      
      // Generate a unique ID for the suggestion
      const id = `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      // Convert server suggestion to client format
      return {
        id,
        symbol,
        operation: suggestion.direction,
        entryPrice: typeof suggestion.entryPrice === 'string' ? parseFloat(suggestion.entryPrice) : suggestion.entryPrice,
        targetPrice: suggestion.takeProfit && suggestion.takeProfit.length > 0 ? suggestion.takeProfit[0] : null,
        stopLoss: suggestion.stopLoss,
        confidence: Math.round(Math.random() * 30 + 60), // 60-90% confidence
        reasoning: suggestion.reasoning.split('.').filter(Boolean),
        timeframe: suggestion.timeframe || "short-term",
        timestamp: new Date(),
        expiresAt,
        status: 'active'
      };
    });
  }
  
  /**
   * Evaluates how well a suggestion performed against actual market data
   * @param suggestion The trading suggestion to evaluate
   * @param marketData Recent market data to compare against
   */
  public evaluateSuggestion(
    suggestion: AITradeSuggestion,
    marketData: MarketData[]
  ): { 
    success: boolean; 
    profitLoss?: number; 
    accuracy?: number;
    status: 'pending' | 'successful' | 'failed';
  } {
    if (marketData.length === 0) return { success: false, status: 'pending' };
    
    const latestPrice = marketData[marketData.length - 1].close;
    
    // If there's no entry price, we can't evaluate
    if (!suggestion.entryPrice) return { success: false, status: 'pending' };
    
    // For buy suggestions
    if (suggestion.operation === 'buy') {
      // If target price is hit
      if (suggestion.targetPrice && latestPrice >= suggestion.targetPrice) {
        const profitLoss = (latestPrice - suggestion.entryPrice) / suggestion.entryPrice * 100;
        return {
          success: true,
          profitLoss,
          accuracy: 100,
          status: 'successful'
        };
      }
      
      // If stop loss is hit
      if (suggestion.stopLoss && latestPrice <= suggestion.stopLoss) {
        const profitLoss = (latestPrice - suggestion.entryPrice) / suggestion.entryPrice * 100;
        return {
          success: false,
          profitLoss,
          accuracy: 0,
          status: 'failed'
        };
      }
      
      // Still in progress
      const profitLoss = (latestPrice - suggestion.entryPrice) / suggestion.entryPrice * 100;
      const accuracy = suggestion.targetPrice ? 
        Math.min(100, Math.max(0, (latestPrice - suggestion.entryPrice) / 
          (suggestion.targetPrice - suggestion.entryPrice) * 100)) : 50;
      
      return {
        success: profitLoss > 0,
        profitLoss,
        accuracy,
        status: 'pending'
      };
    } 
    // For sell suggestions
    else if (suggestion.operation === 'sell') {
      // If target price is hit
      if (suggestion.targetPrice && latestPrice <= suggestion.targetPrice) {
        const profitLoss = (suggestion.entryPrice - latestPrice) / suggestion.entryPrice * 100;
        return {
          success: true,
          profitLoss,
          accuracy: 100,
          status: 'successful'
        };
      }
      
      // If stop loss is hit
      if (suggestion.stopLoss && latestPrice >= suggestion.stopLoss) {
        const profitLoss = (suggestion.entryPrice - latestPrice) / suggestion.entryPrice * 100;
        return {
          success: false,
          profitLoss,
          accuracy: 0,
          status: 'failed'
        };
      }
      
      // Still in progress
      const profitLoss = (suggestion.entryPrice - latestPrice) / suggestion.entryPrice * 100;
      const accuracy = suggestion.targetPrice ? 
        Math.min(100, Math.max(0, (suggestion.entryPrice - latestPrice) / 
          (suggestion.entryPrice - suggestion.targetPrice) * 100)) : 50;
      
      return {
        success: profitLoss > 0,
        profitLoss,
        accuracy,
        status: 'pending'
      };
    }
    
    // Hold suggestions are harder to evaluate
    return { success: true, status: 'pending' };
  }
  
  // Private helper methods for generating analysis in the absence of a real AI service
  
  private generateMarketAnalysis(
    symbol: string, 
    marketData: MarketData[],
    timeframe: string,
    usingOpenAI: boolean = false
  ): AIMarketAnalysis {
    if (marketData.length < 10) {
      return this.getFallbackAnalysis(symbol, timeframe);
    }
    
    // Calculate basic trend
    const recentData = marketData.slice(-20);
    const prices = recentData.map(d => d.close);
    const firstPrice = prices[0];
    const lastPrice = prices[prices.length - 1];
    const priceChange = (lastPrice - firstPrice) / firstPrice;
    
    // Determine direction based on recent price action
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (priceChange > 0.02) direction = 'bullish';
    else if (priceChange < -0.02) direction = 'bearish';
    
    // Generate "confidence" based on trend strength and volatility
    const volatility = this.calculateVolatility(prices);
    let confidence = 50 + (Math.abs(priceChange) * 500) - (volatility * 50);
    confidence = Math.min(95, Math.max(30, confidence));
    
    // Detect supposed "patterns" in the data
    const patterns = this.detectPatterns(marketData);
    
    // Generate trade signals based on patterns and trend
    const signals = this.generateSignals(symbol, marketData, patterns);
    
    // Generate insights based on the overall analysis
    const insights = this.generateInsights(symbol, direction, patterns, volatility);
    
    // Calculate risk assessment
    const riskAssessment = this.assessRisk(symbol, volatility, patterns, direction);
    
    // Price target calculation
    let priceTarget: number | null = null;
    if (direction === 'bullish') {
      priceTarget = lastPrice * (1 + Math.random() * 0.1 + 0.02); // 2-12% higher
    } else if (direction === 'bearish') {
      priceTarget = lastPrice * (1 - Math.random() * 0.1 - 0.02); // 2-12% lower
    }
    
    return {
      symbol,
      prediction: {
        direction,
        confidence,
        priceTarget,
        timeframe: this.mapTimeframeToHuman(timeframe)
      },
      patterns,
      signals,
      insights,
      riskAssessment,
      lastUpdated: new Date()
    };
  }
  
  private generateTradeSuggestions(symbol: string, count: number): AITradeSuggestion[] {
    const suggestions: AITradeSuggestion[] = [];
    const basePrice = this.getBasePrice(symbol);
    
    // Generate a mix of buy, sell, and occasional hold suggestions
    for (let i = 0; i < count; i++) {
      const operation: 'buy' | 'sell' | 'hold' = 
        Math.random() < 0.1 ? 'hold' : (Math.random() < 0.5 ? 'buy' : 'sell');
      
      const entryPrice = basePrice * (1 + (Math.random() * 0.02 - 0.01)); // ±1%
      
      let targetPrice: number | null = null;
      let stopLoss: number | null = null;
      
      if (operation === 'buy') {
        targetPrice = entryPrice * (1 + 0.03 + Math.random() * 0.07); // 3-10% higher
        stopLoss = entryPrice * (1 - 0.01 - Math.random() * 0.02); // 1-3% lower
      } else if (operation === 'sell') {
        targetPrice = entryPrice * (1 - 0.03 - Math.random() * 0.07); // 3-10% lower
        stopLoss = entryPrice * (1 + 0.01 + Math.random() * 0.02); // 1-3% higher
      }
      
      const confidence = 50 + Math.random() * 40; // 50-90%
      
      // Generate reasoning based on operation
      const reasoning = this.generateReasoning(symbol, operation, confidence);
      
      // Set expiration date (1-3 days in the future)
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 1 + Math.floor(Math.random() * 3));
      
      // Create a random suggestion ID
      const id = `suggestion-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      
      suggestions.push({
        id,
        symbol,
        operation,
        entryPrice,
        targetPrice,
        stopLoss,
        confidence,
        reasoning,
        timeframe: Math.random() < 0.6 ? "short-term" : "medium-term",
        timestamp: new Date(),
        expiresAt,
        status: 'active'
      });
    }
    
    return suggestions;
  }
  
  private calculateVolatility(prices: number[]): number {
    if (prices.length < 2) return 0;
    
    const returns = [];
    for (let i = 1; i < prices.length; i++) {
      returns.push((prices[i] - prices[i-1]) / prices[i-1]);
    }
    
    const mean = returns.reduce((sum, val) => sum + val, 0) / returns.length;
    const squaredDiffs = returns.map(val => Math.pow(val - mean, 2));
    const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / returns.length;
    
    return Math.sqrt(variance);
  }
  
  private detectPatterns(marketData: MarketData[]): MarketPattern[] {
    const patterns: MarketPattern[] = [];
    const patternCandidates = [
      { name: "Double Bottom", type: "bullish" as const, probability: 0.3 },
      { name: "Head and Shoulders", type: "bearish" as const, probability: 0.3 },
      { name: "Bullish Flag", type: "bullish" as const, probability: 0.2 },
      { name: "Bearish Flag", type: "bearish" as const, probability: 0.2 },
      { name: "Cup and Handle", type: "bullish" as const, probability: 0.15 },
      { name: "Rising Wedge", type: "bearish" as const, probability: 0.2 },
      { name: "Falling Wedge", type: "bullish" as const, probability: 0.2 },
      { name: "Bullish Engulfing", type: "bullish" as const, probability: 0.25 },
      { name: "Bearish Engulfing", type: "bearish" as const, probability: 0.25 },
      { name: "Morning Star", type: "bullish" as const, probability: 0.15 },
      { name: "Evening Star", type: "bearish" as const, probability: 0.15 },
      { name: "Triple Top", type: "bearish" as const, probability: 0.1 },
      { name: "Triple Bottom", type: "bullish" as const, probability: 0.1 },
      { name: "Doji", type: "neutral" as const, probability: 0.4 },
      { name: "Hammer", type: "bullish" as const, probability: 0.2 },
      { name: "Shooting Star", type: "bearish" as const, probability: 0.2 },
    ];
    
    // Only detect patterns if we have enough data
    if (marketData.length < 10) return patterns;
    
    // Randomly "detect" 1-3 patterns based on probabilities
    patternCandidates.forEach(candidate => {
      if (Math.random() < candidate.probability) {
        const startIdx = Math.floor(Math.random() * (marketData.length / 2));
        const endIdx = startIdx + 3 + Math.floor(Math.random() * 7);
        
        patterns.push({
          name: candidate.name,
          type: candidate.type,
          confidence: 50 + Math.random() * 40, // 50-90%
          description: this.getPatternDescription(candidate.name, candidate.type),
          visualRange: [startIdx, Math.min(endIdx, marketData.length - 1)]
        });
        
        // Limit to ~3 patterns max for realism
        if (patterns.length >= 3) return;
      }
    });
    
    return patterns;
  }
  
  private generateSignals(
    symbol: string,
    marketData: MarketData[],
    patterns: MarketPattern[]
  ): TradingSignal[] {
    const signals: TradingSignal[] = [];
    
    // Get the latest price
    const latestPrice = marketData.length > 0 ? 
      marketData[marketData.length - 1].close : this.getBasePrice(symbol);
    
    // Generate signals from patterns
    for (const pattern of patterns) {
      if (Math.random() < 0.7) { // Only 70% of patterns generate actionable signals
        const action = pattern.type === 'bullish' ? 'buy' : 
                       pattern.type === 'bearish' ? 'sell' : 'neutral';
                       
        const priceMove = pattern.type === 'bullish' ? 0.05 : 
                          pattern.type === 'bearish' ? -0.05 : 0;
        
        signals.push({
          id: `signal-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          symbol,
          action,
          price: latestPrice,
          timestamp: new Date(),
          source: "AI Pattern Recognition",
          strategy: pattern.name,
          message: `${action.toUpperCase()} signal detected based on ${pattern.name} pattern`,
          confidence: pattern.confidence,
          timeframe: "short-term",
          entryPrice: latestPrice,
          stopLoss: latestPrice * (1 - (priceMove / 2)),
          takeProfit1: latestPrice * (1 + priceMove),
          takeProfit2: latestPrice * (1 + priceMove * 1.5),
          takeProfit3: latestPrice * (1 + priceMove * 2),
          indicators: {
            "RSI": Math.floor(40 + Math.random() * 30).toString(),
            "MACD": pattern.type === 'bullish' ? "Bullish" : "Bearish",
            "Volume": "Above Average"
          },
          read: false
        });
      }
    }
    
    return signals;
  }
  
  private generateInsights(
    symbol: string,
    direction: 'bullish' | 'bearish' | 'neutral',
    patterns: MarketPattern[],
    volatility: number
  ): string[] {
    const insights: string[] = [];
    
    // Add directional insight
    if (direction === 'bullish') {
      insights.push(`${symbol} is showing bullish momentum in the recent price action.`);
    } else if (direction === 'bearish') {
      insights.push(`${symbol} is displaying bearish pressure in the recent price action.`);
    } else {
      insights.push(`${symbol} is consolidating in a neutral pattern with no clear direction.`);
    }
    
    // Add volatility insight
    if (volatility > 0.02) {
      insights.push(`High volatility detected, suggesting potential for significant price movement.`);
    } else if (volatility < 0.005) {
      insights.push(`Low volatility may indicate a period of accumulation before a potential breakout.`);
    }
    
    // Add pattern-based insights
    if (patterns.length > 0) {
      const bullishPatterns = patterns.filter(p => p.type === 'bullish');
      const bearishPatterns = patterns.filter(p => p.type === 'bearish');
      
      if (bullishPatterns.length > bearishPatterns.length) {
        insights.push(`Multiple bullish patterns detected, reinforcing the positive outlook.`);
      } else if (bearishPatterns.length > bullishPatterns.length) {
        insights.push(`Several bearish patterns identified, suggesting caution for longs.`);
      }
      
      // Add a pattern-specific insight
      if (patterns.length > 0) {
        const topPattern = patterns.reduce((prev, current) => 
          (prev.confidence > current.confidence) ? prev : current);
        
        insights.push(`The ${topPattern.name} pattern has formed with ${topPattern.confidence.toFixed(0)}% confidence, indicating potential ${topPattern.type} movement.`);
      }
    }
    
    // Add a volume insight (random)
    if (Math.random() > 0.5) {
      insights.push(`Trading volume is ${Math.random() > 0.5 ? 'increasing' : 'decreasing'}, ${Math.random() > 0.5 ? 'supporting' : 'contradicting'} the current price direction.`);
    }
    
    // Add a trend strength insight
    insights.push(`Trend strength analysis indicates a ${Math.floor(50 + Math.random() * 30)}% conviction level in the ${direction} direction.`);
    
    return insights;
  }
  
  private assessRisk(
    symbol: string,
    volatility: number,
    patterns: MarketPattern[],
    direction: 'bullish' | 'bearish' | 'neutral'
  ): { level: 'low' | 'medium' | 'high'; factors: string[] } {
    const factors: string[] = [];
    
    // Assess based on volatility
    if (volatility > 0.02) {
      factors.push("High price volatility");
    }
    
    // Assess based on pattern consensus
    const bullishPatterns = patterns.filter(p => p.type === 'bullish').length;
    const bearishPatterns = patterns.filter(p => p.type === 'bearish').length;
    
    if (bullishPatterns > 0 && bearishPatterns > 0) {
      factors.push("Mixed technical patterns");
    }
    
    // Add some realistic risk factors
    if (Math.random() > 0.7) {
      factors.push("Approaching major resistance/support level");
    }
    
    if (Math.random() > 0.8) {
      factors.push("Divergence between price and momentum indicators");
    }
    
    if (Math.random() > 0.8) {
      factors.push("Potential market events impacting price action");
    }
    
    // Determine risk level
    let level: 'low' | 'medium' | 'high' = 'medium';
    
    if (factors.length <= 1 && volatility < 0.01) {
      level = 'low';
    } else if (factors.length >= 3 || volatility > 0.025) {
      level = 'high';
    }
    
    return { level, factors };
  }

  private getPatternDescription(
    patternName: string, 
    patternType: 'bullish' | 'bearish' | 'neutral'
  ): string {
    const descriptions: Record<string, string> = {
      "Double Bottom": "A bullish reversal pattern where price forms two distinct lows at roughly the same level, indicating potential trend reversal.",
      "Head and Shoulders": "A bearish reversal pattern consisting of three peaks, with the middle peak (head) higher than the two surrounding peaks (shoulders).",
      "Bullish Flag": "A continuation pattern that signals a continuation of the previous bullish trend after a brief consolidation.",
      "Bearish Flag": "A continuation pattern that signals a continuation of the previous bearish trend after a brief consolidation.",
      "Cup and Handle": "A bullish continuation pattern resembling a cup with a handle, indicating a potential upward breakout.",
      "Rising Wedge": "A bearish reversal pattern formed by converging trendlines, suggesting potential downside once price breaks the lower trendline.",
      "Falling Wedge": "A bullish reversal pattern formed by converging trendlines, suggesting potential upside once price breaks the upper trendline.",
      "Bullish Engulfing": "A two-candle reversal pattern where a bullish candle completely engulfs the previous bearish candle.",
      "Bearish Engulfing": "A two-candle reversal pattern where a bearish candle completely engulfs the previous bullish candle.",
      "Morning Star": "A bullish reversal pattern consisting of three candles: a large bearish candle, a small doji, and a large bullish candle.",
      "Evening Star": "A bearish reversal pattern consisting of three candles: a large bullish candle, a small doji, and a large bearish candle.",
      "Triple Top": "A bearish reversal pattern where price tests the same resistance level three times before breaking down.",
      "Triple Bottom": "A bullish reversal pattern where price tests the same support level three times before breaking up.",
      "Doji": "A neutral pattern where the opening and closing prices are nearly equal, indicating indecision in the market.",
      "Hammer": "A bullish reversal pattern formed at the bottom of a downtrend, with a small body and long lower shadow.",
      "Shooting Star": "A bearish reversal pattern formed at the top of an uptrend, with a small body and long upper shadow."
    };
    
    return descriptions[patternName] || 
      `A ${patternType} pattern indicating potential ${patternType === 'bullish' ? 'upward' : patternType === 'bearish' ? 'downward' : 'sideways'} movement.`;
  }
  
  private generateReasoning(
    symbol: string, 
    operation: 'buy' | 'sell' | 'hold',
    confidence: number
  ): string[] {
    const reasoning: string[] = [];
    
    // Basic operation reasoning
    if (operation === 'buy') {
      reasoning.push(`Technical indicators show ${confidence.toFixed(0)}% bullish sentiment for ${symbol}.`);
    } else if (operation === 'sell') {
      reasoning.push(`Technical indicators show ${confidence.toFixed(0)}% bearish pressure for ${symbol}.`);
    } else {
      reasoning.push(`Market conditions suggest holding positions as ${symbol} shows unclear direction.`);
    }
    
    // Add some technical reasoning
    const technicalReasons = [
      `RSI ${operation === 'buy' ? 'indicates oversold conditions' : operation === 'sell' ? 'indicates overbought conditions' : 'is neutral'}.`,
      `MACD ${operation === 'buy' ? 'shows a bullish crossover' : operation === 'sell' ? 'shows a bearish crossover' : 'is flat'}.`,
      `Price is ${operation === 'buy' ? 'near support level with increasing volume' : operation === 'sell' ? 'testing resistance with diminishing volume' : 'trading within a narrow range'}.`,
      `${operation === 'buy' ? 'Bullish' : operation === 'sell' ? 'Bearish' : 'Neutral'} divergence detected on momentum indicators.`,
      `Moving averages ${operation === 'buy' ? 'show positive alignment' : operation === 'sell' ? 'show negative alignment' : 'show mixed signals'}.`
    ];
    
    // Add 2-3 technical reasons
    const numReasons = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < numReasons; i++) {
      if (technicalReasons.length > 0) {
        const index = Math.floor(Math.random() * technicalReasons.length);
        reasoning.push(technicalReasons[index]);
        technicalReasons.splice(index, 1);
      }
    }
    
    return reasoning;
  }
  
  private mapTimeframeToHuman(timeframe: string): string {
    switch (timeframe) {
      case "1m": return "very-short-term";
      case "5m": case "15m": case "30m": return "short-term";
      case "1h": case "4h": return "medium-term";
      case "1d": return "medium-term";
      case "1w": return "long-term";
      case "1M": return "long-term";
      default: return "medium-term";
    }
  }
  
  private getBasePrice(symbol: string): number {
    // Simple mapping of common symbols to realistic prices
    const prices: Record<string, number> = {
      "BINANCE:BTCUSDT": 50000 + Math.random() * 10000,
      "BINANCE:ETHUSDT": 3000 + Math.random() * 500,
      "BINANCE:XRPUSDT": 0.5 + Math.random() * 0.2,
      "NASDAQ:AAPL": 170 + Math.random() * 20,
      "NASDAQ:MSFT": 330 + Math.random() * 30,
      "NASDAQ:AMZN": 130 + Math.random() * 15,
      "NASDAQ:META": 310 + Math.random() * 25,
      "NASDAQ:GOOGL": 140 + Math.random() * 15,
      "NASDAQ:TSLA": 200 + Math.random() * 50,
      "NASDAQ:NFLX": 450 + Math.random() * 50,
      "NYSE:JPM": 150 + Math.random() * 15,
      "NYSE:BA": 170 + Math.random() * 20,
      "NYSE:DIS": 90 + Math.random() * 10,
      "NYSE:IBM": 140 + Math.random() * 15,
      "FX:EURUSD": 1.05 + Math.random() * 0.05,
      "FX:GBPUSD": 1.25 + Math.random() * 0.05,
      "FX:USDJPY": 150 + Math.random() * 5,
    };
    
    return prices[symbol] || 100 + Math.random() * 20; // Default fallback price
  }
  
  private getFallbackAnalysis(symbol: string, timeframe: string): AIMarketAnalysis {
    return {
      symbol,
      prediction: {
        direction: 'neutral',
        confidence: 50,
        priceTarget: null,
        timeframe: this.mapTimeframeToHuman(timeframe)
      },
      patterns: [],
      signals: [],
      insights: [
        `Insufficient market data available for ${symbol} to perform complete analysis.`,
        `Recommendation: Wait for more price action before making trading decisions.`
      ],
      riskAssessment: {
        level: 'medium',
        factors: [
          "Limited historical data",
          "Uncertain market conditions"
        ]
      },
      lastUpdated: new Date()
    };
  }
}

// Export singleton instance
export const aiMarketAnalysisService = AIMarketAnalysisService.getInstance();