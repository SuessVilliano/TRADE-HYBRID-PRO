/**
 * Market Insights Service
 * 
 * Analyzes market data to provide valuable trading insights
 * Combines data from various sources to create a comprehensive market view
 */

import { MCPServer } from '../core/mcp-server';
// Import interfaces but define TimeInterval locally since it was removed from the interface file
import { CandleData } from '../data/market-data-interface';

// Define TimeInterval enum to match what was previously expected
enum TimeInterval {
  ONE_MINUTE = '1m',
  FIVE_MINUTES = '5m',
  FIFTEEN_MINUTES = '15m',
  THIRTY_MINUTES = '30m',
  ONE_HOUR = '1h',
  FOUR_HOURS = '4h',
  ONE_DAY = '1d',
  ONE_WEEK = '1w',
  ONE_MONTH = '1M'
}

export class MarketInsightsService {
  private static instance: MarketInsightsService;
  private mcp: MCPServer;
  private cachedInsights: Map<string, MarketInsight> = new Map();
  private insightExpiryTime: number = 15 * 60 * 1000; // 15 minutes
  private lastUpdateTimes: Map<string, number> = new Map();
  private updateIntervals: Map<string, number> = new Map();
  
  private constructor(mcp: MCPServer) {
    this.mcp = mcp;
    
    // Set default update intervals
    this.updateIntervals.set('market-sentiment', 60 * 60 * 1000); // 1 hour
    this.updateIntervals.set('technical-analysis', 15 * 60 * 1000); // 15 minutes
    this.updateIntervals.set('volatility-analysis', 30 * 60 * 1000); // 30 minutes
    this.updateIntervals.set('market-correlations', 4 * 60 * 60 * 1000); // 4 hours
    
    console.log('Market Insights Service initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(mcp: MCPServer): MarketInsightsService {
    if (!MarketInsightsService.instance) {
      MarketInsightsService.instance = new MarketInsightsService(mcp);
    }
    return MarketInsightsService.instance;
  }
  
  /**
   * Initialize the service
   */
  public async initialize(): Promise<void> {
    // Start periodic updates
    this.startPeriodicUpdates();
    
    // Initial loading of insights
    await this.updateAllInsights();
    
    console.log('Market Insights Service fully initialized');
  }
  
  /**
   * Get technical analysis for a symbol
   */
  public async getTechnicalAnalysis(
    symbol: string,
    timeframe: TimeInterval = TimeInterval.ONE_HOUR,
    forceRefresh: boolean = false
  ): Promise<TechnicalAnalysisInsight> {
    const insightKey = `technical-analysis:${symbol}:${timeframe}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && this.cachedInsights.has(insightKey)) {
      const cachedInsight = this.cachedInsights.get(insightKey);
      if (cachedInsight && Date.now() - cachedInsight.timestamp < this.insightExpiryTime) {
        return cachedInsight as TechnicalAnalysisInsight;
      }
    }
    
    try {
      console.log(`Generating technical analysis for ${symbol} (${timeframe})`);
      
      // Get market data manager
      const marketDataManager = this.mcp.marketDataManager;
      if (!marketDataManager) {
        throw new Error('Market data manager not available');
      }
      
      // Get historical candles for analysis
      const now = new Date();
      const from = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const candles = await marketDataManager.getHistoricalCandles(
        symbol,
        timeframe,
        from,
        now
      );
      
      if (candles.length === 0) {
        throw new Error(`No candle data available for ${symbol}`);
      }
      
      // Calculate indicators
      const insight = await this.calculateTechnicalIndicators(symbol, timeframe, candles);
      
      // Cache the insight
      this.cachedInsights.set(insightKey, insight);
      this.lastUpdateTimes.set(insightKey, Date.now());
      
      return insight;
    } catch (error) {
      console.error(`Error generating technical analysis for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cachedInsights.has(insightKey)) {
        return this.cachedInsights.get(insightKey) as TechnicalAnalysisInsight;
      }
      
      // Return a default insight with error information
      return {
        type: 'technical-analysis',
        symbol,
        timeframe,
        timestamp: Date.now(),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        indicators: {},
        overall: {
          signal: 'neutral',
          strength: 0,
          description: 'Analysis failed'
        }
      };
    }
  }
  
  /**
   * Get market sentiment analysis
   */
  public async getMarketSentiment(
    symbol?: string,
    forceRefresh: boolean = false
  ): Promise<MarketSentimentInsight> {
    const insightKey = `market-sentiment:${symbol || 'overall'}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && this.cachedInsights.has(insightKey)) {
      const cachedInsight = this.cachedInsights.get(insightKey);
      if (cachedInsight && Date.now() - cachedInsight.timestamp < this.insightExpiryTime) {
        return cachedInsight as MarketSentimentInsight;
      }
    }
    
    try {
      console.log(`Generating market sentiment for ${symbol || 'overall market'}`);
      
      // For a comprehensive analysis, we would connect to external sentiment APIs
      // For now, we'll generate a simulated sentiment analysis
      
      // Gather sources for sentiment
      const sources: SentimentSource[] = [
        {
          name: 'Social Media',
          sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
          confidence: 0.5 + Math.random() * 0.5,
          volumeLevel: (Math.random() * 10).toFixed(1)
        },
        {
          name: 'News Analysis',
          sentiment: Math.random() > 0.6 ? 'bullish' : 'bearish',
          confidence: 0.6 + Math.random() * 0.4,
          volumeLevel: (Math.random() * 10).toFixed(1)
        },
        {
          name: 'Institutional Positioning',
          sentiment: Math.random() > 0.5 ? 'bullish' : 'bearish',
          confidence: 0.7 + Math.random() * 0.3,
          volumeLevel: (Math.random() * 10).toFixed(1)
        }
      ];
      
      // Calculate overall sentiment
      const bullishSources = sources.filter(s => s.sentiment === 'bullish');
      const overallSentiment = bullishSources.length > sources.length / 2 ? 'bullish' : 'bearish';
      
      // Calculate confidence
      const avgConfidence = sources.reduce((sum, source) => {
        return sum + (source.sentiment === overallSentiment ? source.confidence : 0);
      }, 0) / (bullishSources.length || 1);
      
      const insight: MarketSentimentInsight = {
        type: 'market-sentiment',
        symbol: symbol || 'OVERALL',
        timestamp: Date.now(),
        status: 'success',
        sources,
        overall: {
          sentiment: overallSentiment,
          confidence: avgConfidence,
          analysis: `Market sentiment is ${overallSentiment} with ${(avgConfidence * 100).toFixed(1)}% confidence`,
          actionable: avgConfidence > 0.7
        }
      };
      
      // Cache the insight
      this.cachedInsights.set(insightKey, insight);
      this.lastUpdateTimes.set(insightKey, Date.now());
      
      return insight;
    } catch (error) {
      console.error(`Error generating market sentiment for ${symbol || 'overall market'}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cachedInsights.has(insightKey)) {
        return this.cachedInsights.get(insightKey) as MarketSentimentInsight;
      }
      
      // Return a default sentiment with error information
      return {
        type: 'market-sentiment',
        symbol: symbol || 'OVERALL',
        timestamp: Date.now(),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        sources: [],
        overall: {
          sentiment: 'neutral',
          confidence: 0,
          analysis: 'Sentiment analysis failed',
          actionable: false
        }
      };
    }
  }
  
  /**
   * Get volatility analysis
   */
  public async getVolatilityAnalysis(
    symbol: string,
    timeframe: TimeInterval = TimeInterval.ONE_DAY,
    forceRefresh: boolean = false
  ): Promise<VolatilityInsight> {
    const insightKey = `volatility-analysis:${symbol}:${timeframe}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && this.cachedInsights.has(insightKey)) {
      const cachedInsight = this.cachedInsights.get(insightKey);
      if (cachedInsight && Date.now() - cachedInsight.timestamp < this.insightExpiryTime) {
        return cachedInsight as VolatilityInsight;
      }
    }
    
    try {
      console.log(`Generating volatility analysis for ${symbol} (${timeframe})`);
      
      // Get market data manager
      const marketDataManager = this.mcp.marketDataManager;
      if (!marketDataManager) {
        throw new Error('Market data manager not available');
      }
      
      // Get historical candles for analysis
      const now = new Date();
      const from = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000); // 60 days ago
      const candles = await marketDataManager.getHistoricalCandles(
        symbol,
        timeframe,
        from,
        now
      );
      
      if (candles.length < 10) {
        throw new Error(`Insufficient candle data available for ${symbol}`);
      }
      
      // Calculate historical volatility
      const closePrices = candles.map(c => c.close);
      const returns = [];
      
      for (let i = 1; i < closePrices.length; i++) {
        const dailyReturn = Math.log(closePrices[i] / closePrices[i - 1]);
        returns.push(dailyReturn);
      }
      
      // Calculate standard deviation (volatility)
      const avgReturn = returns.reduce((sum, val) => sum + val, 0) / returns.length;
      const squaredDiffs = returns.map(val => Math.pow(val - avgReturn, 2));
      const variance = squaredDiffs.reduce((sum, val) => sum + val, 0) / squaredDiffs.length;
      const stdDev = Math.sqrt(variance);
      
      // Annualize volatility based on timeframe
      let annualizingFactor = 252; // Default to daily
      
      switch (timeframe) {
        case TimeInterval.ONE_MINUTE:
          annualizingFactor = 252 * 6.5 * 60;
          break;
        case TimeInterval.FIVE_MINUTES:
          annualizingFactor = 252 * 6.5 * 12;
          break;
        case TimeInterval.FIFTEEN_MINUTES:
          annualizingFactor = 252 * 6.5 * 4;
          break;
        case TimeInterval.THIRTY_MINUTES:
          annualizingFactor = 252 * 6.5 * 2;
          break;
        case TimeInterval.ONE_HOUR:
          annualizingFactor = 252 * 6.5;
          break;
        case TimeInterval.FOUR_HOURS:
          annualizingFactor = 252 * 1.625;
          break;
        case TimeInterval.ONE_DAY:
          annualizingFactor = 252;
          break;
        case TimeInterval.ONE_WEEK:
          annualizingFactor = 52;
          break;
        case TimeInterval.ONE_MONTH:
          annualizingFactor = 12;
          break;
      }
      
      const annualizedVolatility = stdDev * Math.sqrt(annualizingFactor);
      
      // Calculate ATR (Average True Range) for recent volatility
      const atrPeriod = 14;
      const trueRanges = [];
      
      for (let i = 1; i < candles.length; i++) {
        const high = candles[i].high;
        const low = candles[i].low;
        const prevClose = candles[i - 1].close;
        
        const tr1 = high - low;
        const tr2 = Math.abs(high - prevClose);
        const tr3 = Math.abs(low - prevClose);
        
        const trueRange = Math.max(tr1, tr2, tr3);
        trueRanges.push(trueRange);
      }
      
      const atr = trueRanges.slice(-atrPeriod).reduce((sum, tr) => sum + tr, 0) / atrPeriod;
      const atrPercent = atr / candles[candles.length - 1].close * 100;
      
      // Determine volatility level
      let volatilityLevel: VolatilityLevel;
      if (annualizedVolatility < 0.15) {
        volatilityLevel = 'very low';
      } else if (annualizedVolatility < 0.25) {
        volatilityLevel = 'low';
      } else if (annualizedVolatility < 0.35) {
        volatilityLevel = 'medium';
      } else if (annualizedVolatility < 0.45) {
        volatilityLevel = 'high';
      } else {
        volatilityLevel = 'very high';
      }
      
      // Check volatility trend (increasing/decreasing)
      const recentVolatility = trueRanges.slice(-atrPeriod).reduce((sum, tr) => sum + tr, 0) / atrPeriod;
      const previousVolatility = trueRanges.slice(-atrPeriod * 2, -atrPeriod).reduce((sum, tr) => sum + tr, 0) / atrPeriod;
      
      const volatilityTrend = recentVolatility > previousVolatility * 1.1 ? 'increasing' :
                           recentVolatility < previousVolatility * 0.9 ? 'decreasing' : 'stable';
      
      const insight: VolatilityInsight = {
        type: 'volatility-analysis',
        symbol,
        timeframe,
        timestamp: Date.now(),
        status: 'success',
        metrics: {
          historicalVolatility: annualizedVolatility,
          impliedVolatility: null, // Would need options data
          atr,
          atrPercent
        },
        analysis: {
          volatilityLevel,
          trend: volatilityTrend,
          description: `Volatility is ${volatilityLevel} and ${volatilityTrend}. ATR is ${atrPercent.toFixed(2)}% of price.`,
          tradingSuggestion: this.getVolatilityTradingSuggestion(volatilityLevel, volatilityTrend)
        }
      };
      
      // Cache the insight
      this.cachedInsights.set(insightKey, insight);
      this.lastUpdateTimes.set(insightKey, Date.now());
      
      return insight;
    } catch (error) {
      console.error(`Error generating volatility analysis for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cachedInsights.has(insightKey)) {
        return this.cachedInsights.get(insightKey) as VolatilityInsight;
      }
      
      // Return a default insight with error information
      return {
        type: 'volatility-analysis',
        symbol,
        timeframe,
        timestamp: Date.now(),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        metrics: {
          historicalVolatility: null,
          impliedVolatility: null,
          atr: null,
          atrPercent: null
        },
        analysis: {
          volatilityLevel: 'unknown',
          trend: 'unknown',
          description: 'Volatility analysis failed',
          tradingSuggestion: 'Avoid trading until volatility data is available'
        }
      };
    }
  }
  
  /**
   * Get market correlations
   */
  public async getMarketCorrelations(
    symbol: string,
    forceRefresh: boolean = false
  ): Promise<CorrelationInsight> {
    const insightKey = `market-correlations:${symbol}`;
    
    // Check cache first if not forcing refresh
    if (!forceRefresh && this.cachedInsights.has(insightKey)) {
      const cachedInsight = this.cachedInsights.get(insightKey);
      if (cachedInsight && Date.now() - cachedInsight.timestamp < this.insightExpiryTime) {
        return cachedInsight as CorrelationInsight;
      }
    }
    
    try {
      console.log(`Generating market correlations for ${symbol}`);
      
      // Get market data manager
      const marketDataManager = this.mcp.marketDataManager;
      if (!marketDataManager) {
        throw new Error('Market data manager not available');
      }
      
      // Define correlation pairs based on asset class
      let correlationPairs: string[] = [];
      
      if (symbol.endsWith('USD') || symbol.includes('USDT')) {
        // Crypto
        correlationPairs = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'DXY'];
      } else if (/^[A-Z]{6}$/.test(symbol)) {
        // Forex
        correlationPairs = ['EURUSD', 'GBPUSD', 'USDJPY', 'DXY'];
      } else if (symbol.includes('/')) {
        // Commodities perhaps
        correlationPairs = ['GC=F', 'SI=F', 'CL=F', 'DXY'];
      } else {
        // Stocks
        correlationPairs = ['SPY', 'QQQ', 'IWM', 'DXY'];
      }
      
      // Filter out the input symbol
      correlationPairs = correlationPairs.filter(pair => pair !== symbol);
      
      // Get historical daily data for calculations
      const now = new Date();
      const from = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000); // 90 days
      const timeframe = TimeInterval.ONE_DAY;
      
      // Get target symbol data
      const targetCandles = await marketDataManager.getHistoricalCandles(
        symbol,
        timeframe,
        from,
        now
      );
      
      if (targetCandles.length < 20) {
        throw new Error(`Insufficient historical data for ${symbol}`);
      }
      
      // Calculate correlations with each pair
      const correlations: Correlation[] = [];
      
      for (const pair of correlationPairs) {
        try {
          const pairCandles = await marketDataManager.getHistoricalCandles(
            pair,
            timeframe,
            from,
            now
          );
          
          if (pairCandles.length < 20) {
            console.warn(`Insufficient data for correlation pair ${pair}`);
            continue;
          }
          
          // Align the candles by timestamp
          const alignedData: { target: number, pair: number }[] = [];
          
          for (const targetCandle of targetCandles) {
            const matchingPairCandle = pairCandles.find(
              pc => pc.timestamp === targetCandle.timestamp
            );
            
            if (matchingPairCandle) {
              alignedData.push({
                target: targetCandle.close,
                pair: matchingPairCandle.close
              });
            }
          }
          
          if (alignedData.length < 20) {
            console.warn(`Insufficient aligned data points for ${pair}`);
            continue;
          }
          
          // Calculate correlation coefficient
          const correlation = this.calculateCorrelation(
            alignedData.map(d => d.target),
            alignedData.map(d => d.pair)
          );
          
          let strength: CorrelationStrength;
          if (Math.abs(correlation) < 0.2) {
            strength = 'very weak';
          } else if (Math.abs(correlation) < 0.4) {
            strength = 'weak';
          } else if (Math.abs(correlation) < 0.6) {
            strength = 'moderate';
          } else if (Math.abs(correlation) < 0.8) {
            strength = 'strong';
          } else {
            strength = 'very strong';
          }
          
          correlations.push({
            symbol: pair,
            coefficient: correlation,
            sampleSize: alignedData.length,
            strength,
            type: correlation > 0 ? 'positive' : 'negative'
          });
        } catch (error) {
          console.error(`Error calculating correlation with ${pair}:`, error);
        }
      }
      
      // Sort by absolute correlation strength (strongest first)
      correlations.sort((a, b) => Math.abs(b.coefficient) - Math.abs(a.coefficient));
      
      const insight: CorrelationInsight = {
        type: 'market-correlations',
        symbol,
        timestamp: Date.now(),
        status: 'success',
        correlations,
        analysis: {
          strongestPositiveCorrelation: correlations
            .filter(c => c.coefficient > 0)
            .slice(0, 1)[0]?.symbol || 'None found',
          strongestNegativeCorrelation: correlations
            .filter(c => c.coefficient < 0)
            .slice(0, 1)[0]?.symbol || 'None found',
          tradingImplications: this.getCorrelationTradingImplications(symbol, correlations)
        }
      };
      
      // Cache the insight
      this.cachedInsights.set(insightKey, insight);
      this.lastUpdateTimes.set(insightKey, Date.now());
      
      return insight;
    } catch (error) {
      console.error(`Error generating market correlations for ${symbol}:`, error);
      
      // Return cached data if available, even if expired
      if (this.cachedInsights.has(insightKey)) {
        return this.cachedInsights.get(insightKey) as CorrelationInsight;
      }
      
      // Return a default insight with error information
      return {
        type: 'market-correlations',
        symbol,
        timestamp: Date.now(),
        status: 'error',
        errorMessage: error instanceof Error ? error.message : String(error),
        correlations: [],
        analysis: {
          strongestPositiveCorrelation: 'Unknown',
          strongestNegativeCorrelation: 'Unknown',
          tradingImplications: 'Correlation analysis failed'
        }
      };
    }
  }
  
  /**
   * Start periodic updates of market insights
   */
  private startPeriodicUpdates(): void {
    // Update market sentiment periodically
    setInterval(() => {
      this.updateMarketSentiment().catch(err => 
        console.error('Error updating market sentiment:', err)
      );
    }, this.updateIntervals.get('market-sentiment') || 60 * 60 * 1000);
    
    // Update technical analysis for major assets
    setInterval(() => {
      this.updateTechnicalAnalysis().catch(err => 
        console.error('Error updating technical analysis:', err)
      );
    }, this.updateIntervals.get('technical-analysis') || 15 * 60 * 1000);
    
    // Update volatility analysis for major assets
    setInterval(() => {
      this.updateVolatilityAnalysis().catch(err => 
        console.error('Error updating volatility analysis:', err)
      );
    }, this.updateIntervals.get('volatility-analysis') || 30 * 60 * 1000);
    
    // Update market correlations less frequently
    setInterval(() => {
      this.updateMarketCorrelations().catch(err => 
        console.error('Error updating market correlations:', err)
      );
    }, this.updateIntervals.get('market-correlations') || 4 * 60 * 60 * 1000);
  }
  
  /**
   * Update all insights
   */
  private async updateAllInsights(): Promise<void> {
    try {
      await Promise.all([
        this.updateMarketSentiment(),
        this.updateTechnicalAnalysis(),
        this.updateVolatilityAnalysis(),
        this.updateMarketCorrelations()
      ]);
    } catch (error) {
      console.error('Error updating all insights:', error);
    }
  }
  
  /**
   * Update market sentiment
   */
  private async updateMarketSentiment(): Promise<void> {
    await this.getMarketSentiment(undefined, true);
    
    // Update sentiment for major assets
    const majorAssets = ['BTCUSDT', 'ETHUSDT', 'SPY', 'EURUSD'];
    
    for (const asset of majorAssets) {
      try {
        await this.getMarketSentiment(asset, true);
      } catch (error) {
        console.error(`Error updating sentiment for ${asset}:`, error);
      }
    }
  }
  
  /**
   * Update technical analysis
   */
  private async updateTechnicalAnalysis(): Promise<void> {
    const majorAssets = ['BTCUSDT', 'ETHUSDT', 'SPY', 'QQQ', 'EURUSD', 'GBPUSD'];
    const timeframes = [TimeInterval.ONE_HOUR, TimeInterval.FOUR_HOURS, TimeInterval.ONE_DAY];
    
    for (const asset of majorAssets) {
      for (const timeframe of timeframes) {
        try {
          await this.getTechnicalAnalysis(asset, timeframe, true);
        } catch (error) {
          console.error(`Error updating technical analysis for ${asset} (${timeframe}):`, error);
        }
      }
    }
  }
  
  /**
   * Update volatility analysis
   */
  private async updateVolatilityAnalysis(): Promise<void> {
    const majorAssets = ['BTCUSDT', 'ETHUSDT', 'SPY', 'EURUSD'];
    const timeframes = [TimeInterval.ONE_DAY];
    
    for (const asset of majorAssets) {
      for (const timeframe of timeframes) {
        try {
          await this.getVolatilityAnalysis(asset, timeframe, true);
        } catch (error) {
          console.error(`Error updating volatility analysis for ${asset} (${timeframe}):`, error);
        }
      }
    }
  }
  
  /**
   * Update market correlations
   */
  private async updateMarketCorrelations(): Promise<void> {
    const majorAssets = ['BTCUSDT', 'ETHUSDT', 'SPY', 'EURUSD'];
    
    for (const asset of majorAssets) {
      try {
        await this.getMarketCorrelations(asset, true);
      } catch (error) {
        console.error(`Error updating correlations for ${asset}:`, error);
      }
    }
  }
  
  /**
   * Calculate correlation coefficient between two arrays
   */
  private calculateCorrelation(array1: number[], array2: number[]): number {
    if (array1.length !== array2.length) {
      throw new Error('Arrays must be of equal length');
    }
    
    const n = array1.length;
    
    // Calculate means
    const mean1 = array1.reduce((sum, val) => sum + val, 0) / n;
    const mean2 = array2.reduce((sum, val) => sum + val, 0) / n;
    
    // Calculate covariance and variances
    let covariance = 0;
    let variance1 = 0;
    let variance2 = 0;
    
    for (let i = 0; i < n; i++) {
      const diff1 = array1[i] - mean1;
      const diff2 = array2[i] - mean2;
      
      covariance += diff1 * diff2;
      variance1 += diff1 * diff1;
      variance2 += diff2 * diff2;
    }
    
    // Return correlation coefficient
    return covariance / (Math.sqrt(variance1) * Math.sqrt(variance2));
  }
  
  /**
   * Calculate technical indicators
   */
  private async calculateTechnicalIndicators(
    symbol: string,
    timeframe: TimeInterval,
    candles: any[]
  ): Promise<TechnicalAnalysisInsight> {
    const closePrices = candles.map(c => c.close);
    const highPrices = candles.map(c => c.high);
    const lowPrices = candles.map(c => c.low);
    
    // Calculate SMA
    const sma20 = this.calculateSMA(closePrices, 20);
    const sma50 = this.calculateSMA(closePrices, 50);
    const sma200 = this.calculateSMA(closePrices, 200);
    
    // Calculate EMA
    const ema12 = this.calculateEMA(closePrices, 12);
    const ema26 = this.calculateEMA(closePrices, 26);
    
    // Calculate MACD
    const macdLine = ema12 - ema26;
    const signalLine = this.calculateEMA([...Array(closePrices.length - 26).fill(0), macdLine], 9);
    const macdHistogram = macdLine - signalLine;
    
    // Calculate RSI
    const rsi = this.calculateRSI(closePrices, 14);
    
    // Calculate Bollinger Bands
    const middleBand = sma20;
    const standardDeviation = this.calculateStandardDeviation(closePrices, 20);
    const upperBand = middleBand + 2 * standardDeviation;
    const lowerBand = middleBand - 2 * standardDeviation;
    
    // Calculate Stochastic Oscillator
    const stochastic = this.calculateStochastic(highPrices, lowPrices, closePrices, 14, 3);
    
    // Determine overall signal
    let signals = [];
    
    // Add signal based on SMA trend
    if (sma20 > sma50 && sma50 > sma200) {
      signals.push({ signal: 'buy', strength: 0.7, source: 'SMA trend' });
    } else if (sma20 < sma50 && sma50 < sma200) {
      signals.push({ signal: 'sell', strength: 0.7, source: 'SMA trend' });
    } else {
      signals.push({ signal: 'neutral', strength: 0.5, source: 'SMA trend' });
    }
    
    // Add signal based on MACD
    if (macdLine > signalLine && macdHistogram > 0) {
      signals.push({ signal: 'buy', strength: 0.65, source: 'MACD' });
    } else if (macdLine < signalLine && macdHistogram < 0) {
      signals.push({ signal: 'sell', strength: 0.65, source: 'MACD' });
    } else {
      signals.push({ signal: 'neutral', strength: 0.5, source: 'MACD' });
    }
    
    // Add signal based on RSI
    if (rsi < 30) {
      signals.push({ signal: 'buy', strength: 0.8, source: 'RSI oversold' });
    } else if (rsi > 70) {
      signals.push({ signal: 'sell', strength: 0.8, source: 'RSI overbought' });
    } else if (rsi > 50 && rsi < 70) {
      signals.push({ signal: 'buy', strength: 0.6, source: 'RSI bullish' });
    } else if (rsi > 30 && rsi < 50) {
      signals.push({ signal: 'sell', strength: 0.6, source: 'RSI bearish' });
    } else {
      signals.push({ signal: 'neutral', strength: 0.5, source: 'RSI' });
    }
    
    // Add signal based on Bollinger Bands
    const lastClose = closePrices[closePrices.length - 1];
    if (lastClose < lowerBand) {
      signals.push({ signal: 'buy', strength: 0.75, source: 'Bollinger Bands oversold' });
    } else if (lastClose > upperBand) {
      signals.push({ signal: 'sell', strength: 0.75, source: 'Bollinger Bands overbought' });
    } else {
      signals.push({ signal: 'neutral', strength: 0.5, source: 'Bollinger Bands' });
    }
    
    // Add signal based on Stochastic
    const lastK = stochastic.k[stochastic.k.length - 1];
    const lastD = stochastic.d[stochastic.d.length - 1];
    
    if (lastK < 20 && lastD < 20) {
      signals.push({ signal: 'buy', strength: 0.7, source: 'Stochastic oversold' });
    } else if (lastK > 80 && lastD > 80) {
      signals.push({ signal: 'sell', strength: 0.7, source: 'Stochastic overbought' });
    } else if (lastK > lastD) {
      signals.push({ signal: 'buy', strength: 0.6, source: 'Stochastic bullish crossover' });
    } else if (lastK < lastD) {
      signals.push({ signal: 'sell', strength: 0.6, source: 'Stochastic bearish crossover' });
    } else {
      signals.push({ signal: 'neutral', strength: 0.5, source: 'Stochastic' });
    }
    
    // Weight the signals and determine overall signal
    const buySignals = signals.filter(s => s.signal === 'buy');
    const sellSignals = signals.filter(s => s.signal === 'sell');
    const buySignalStrength = buySignals.reduce((sum, s) => sum + s.strength, 0) / (buySignals.length || 1);
    const sellSignalStrength = sellSignals.reduce((sum, s) => sum + s.strength, 0) / (sellSignals.length || 1);
    
    let overallSignal = 'neutral';
    let signalStrength = 0.5;
    
    if (buySignals.length > sellSignals.length && buySignalStrength > 0.6) {
      overallSignal = 'buy';
      signalStrength = buySignalStrength;
    } else if (sellSignals.length > buySignals.length && sellSignalStrength > 0.6) {
      overallSignal = 'sell';
      signalStrength = sellSignalStrength;
    }
    
    const signalDescription = `${overallSignal.toUpperCase()} signal with ${(signalStrength * 100).toFixed(0)}% strength. ` +
                          `Based on ${signals.length} technical indicators.`;
    
    return {
      type: 'technical-analysis',
      symbol,
      timeframe,
      timestamp: Date.now(),
      status: 'success',
      indicators: {
        sma: {
          sma20,
          sma50,
          sma200
        },
        macd: {
          macdLine,
          signalLine,
          histogram: macdHistogram
        },
        rsi,
        bollingerBands: {
          upper: upperBand,
          middle: middleBand,
          lower: lowerBand
        },
        stochastic: {
          k: lastK,
          d: lastD
        }
      },
      overall: {
        signal: overallSignal as TradingSignal,
        strength: signalStrength,
        description: signalDescription
      }
    };
  }
  
  /**
   * Calculate Simple Moving Average
   */
  private calculateSMA(data: number[], period: number): number {
    if (data.length < period) {
      return NaN;
    }
    
    const slice = data.slice(-period);
    return slice.reduce((sum, val) => sum + val, 0) / period;
  }
  
  /**
   * Calculate Exponential Moving Average
   */
  private calculateEMA(data: number[], period: number): number {
    if (data.length < period) {
      return NaN;
    }
    
    const k = 2 / (period + 1);
    
    // Start with SMA
    let ema = this.calculateSMA(data.slice(0, period), period);
    
    // Calculate EMA for the rest of the data
    for (let i = period; i < data.length; i++) {
      ema = data[i] * k + ema * (1 - k);
    }
    
    return ema;
  }
  
  /**
   * Calculate RSI (Relative Strength Index)
   */
  private calculateRSI(data: number[], period: number): number {
    if (data.length < period + 1) {
      return NaN;
    }
    
    let gains = 0;
    let losses = 0;
    
    // Calculate initial averages
    for (let i = 1; i <= period; i++) {
      const change = data[i] - data[i - 1];
      if (change >= 0) {
        gains += change;
      } else {
        losses -= change;
      }
    }
    
    let avgGain = gains / period;
    let avgLoss = losses / period;
    
    // Calculate RSI for the rest of the data
    for (let i = period + 1; i < data.length; i++) {
      const change = data[i] - data[i - 1];
      
      if (change >= 0) {
        avgGain = (avgGain * (period - 1) + change) / period;
        avgLoss = (avgLoss * (period - 1)) / period;
      } else {
        avgGain = (avgGain * (period - 1)) / period;
        avgLoss = (avgLoss * (period - 1) - change) / period;
      }
    }
    
    if (avgLoss === 0) {
      return 100;
    }
    
    const rs = avgGain / avgLoss;
    return 100 - (100 / (1 + rs));
  }
  
  /**
   * Calculate Standard Deviation
   */
  private calculateStandardDeviation(data: number[], period: number): number {
    if (data.length < period) {
      return NaN;
    }
    
    const slice = data.slice(-period);
    const mean = slice.reduce((sum, val) => sum + val, 0) / period;
    const variance = slice.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / period;
    
    return Math.sqrt(variance);
  }
  
  /**
   * Calculate Stochastic Oscillator
   */
  private calculateStochastic(high: number[], low: number[], close: number[], period: number, smoothK: number): { k: number[], d: number[] } {
    if (high.length < period || low.length < period || close.length < period) {
      return { k: [], d: [] };
    }
    
    const k: number[] = [];
    
    // Calculate %K
    for (let i = period - 1; i < close.length; i++) {
      const highestHigh = Math.max(...high.slice(i - period + 1, i + 1));
      const lowestLow = Math.min(...low.slice(i - period + 1, i + 1));
      
      if (highestHigh === lowestLow) {
        k.push(50);
      } else {
        k.push(100 * (close[i] - lowestLow) / (highestHigh - lowestLow));
      }
    }
    
    // Smooth %K with SMA if needed
    const smoothedK = smoothK > 1 ? 
      k.map((_, i, arr) => 
        i < smoothK - 1 ? 
          arr[i] : 
          arr.slice(i - smoothK + 1, i + 1).reduce((sum, val) => sum + val, 0) / smoothK
      ) : 
      k;
    
    // Calculate %D (3-period SMA of %K)
    const d: number[] = [];
    
    for (let i = 2; i < smoothedK.length; i++) {
      d.push((smoothedK[i] + smoothedK[i - 1] + smoothedK[i - 2]) / 3);
    }
    
    return { k: smoothedK, d };
  }
  
  /**
   * Get trading suggestion based on volatility
   */
  private getVolatilityTradingSuggestion(level: VolatilityLevel, trend: string): string {
    switch (level) {
      case 'very low':
        return trend === 'increasing' ? 
          'Consider preparing for breakout strategies as volatility increases' : 
          'Range-bound strategies recommended in low volatility environment';
      
      case 'low':
        return trend === 'increasing' ? 
          'Consider transitioning to trend-following strategies as volatility builds' : 
          'Continue with range trading but with tighter stops';
      
      case 'medium':
        return 'Balanced approach recommended: use reasonable position sizing and implement both stop losses and take profit levels';
      
      case 'high':
        return trend === 'increasing' ? 
          'Use smaller position sizes and wider stops to accommodate volatility' : 
          'Be prepared for potential mean reversion as volatility stabilizes';
      
      case 'very high':
        return trend === 'increasing' ? 
          'Consider staying on the sidelines until extreme volatility subsides' : 
          'Look for mean reversion opportunities as volatility normalizes';
      
      default:
        return 'Unable to provide volatility-based trading suggestion';
    }
  }
  
  /**
   * Get trading implications based on correlations
   */
  private getCorrelationTradingImplications(symbol: string, correlations: Correlation[]): string {
    if (correlations.length === 0) {
      return 'No correlation data available for trading implications';
    }
    
    const strongPositive = correlations.filter(c => c.coefficient > 0.7);
    const strongNegative = correlations.filter(c => c.coefficient < -0.7);
    
    let implications = '';
    
    if (strongPositive.length > 0) {
      implications += `Strong positive correlations with ${strongPositive.map(c => c.symbol).join(', ')} suggest similar price movements. `;
      implications += 'Consider these assets as confirmation indicators or for portfolio diversification concerns. ';
    }
    
    if (strongNegative.length > 0) {
      implications += `Strong negative correlations with ${strongNegative.map(c => c.symbol).join(', ')} suggest opposite price movements. `;
      implications += 'These may provide hedging opportunities or serve as leading indicators for reversals. ';
    }
    
    if (implications === '') {
      implications = 'No strong correlations detected. This asset may move independently of common market factors.';
    }
    
    return implications;
  }
}

/**
 * Initialize the market insights service
 */
export function initializeMarketInsightsService(mcp: MCPServer): MarketInsightsService {
  const service = MarketInsightsService.getInstance(mcp);
  service.initialize().catch(err => 
    console.error('Error initializing market insights service:', err)
  );
  return service;
}

// Types for market insights

export type InsightType = 'technical-analysis' | 'market-sentiment' | 'volatility-analysis' | 'market-correlations';

export interface MarketInsight {
  type: InsightType;
  symbol: string;
  timestamp: number;
  status: 'success' | 'error';
  errorMessage?: string;
}

export type TradingSignal = 'buy' | 'sell' | 'neutral';

export interface TechnicalAnalysisInsight extends MarketInsight {
  type: 'technical-analysis';
  timeframe: TimeInterval;
  indicators: {
    sma?: {
      sma20?: number;
      sma50?: number;
      sma200?: number;
    };
    macd?: {
      macdLine?: number;
      signalLine?: number;
      histogram?: number;
    };
    rsi?: number;
    bollingerBands?: {
      upper?: number;
      middle?: number;
      lower?: number;
    };
    stochastic?: {
      k?: number;
      d?: number;
    };
  };
  overall: {
    signal: TradingSignal;
    strength: number; // 0-1
    description: string;
  };
}

export type SentimentType = 'bullish' | 'bearish' | 'neutral';

export interface SentimentSource {
  name: string;
  sentiment: SentimentType;
  confidence: number; // 0-1
  volumeLevel: string;
}

export interface MarketSentimentInsight extends MarketInsight {
  type: 'market-sentiment';
  sources: SentimentSource[];
  overall: {
    sentiment: SentimentType;
    confidence: number; // 0-1
    analysis: string;
    actionable: boolean;
  };
}

export type VolatilityLevel = 'very low' | 'low' | 'medium' | 'high' | 'very high' | 'unknown';

export interface VolatilityInsight extends MarketInsight {
  type: 'volatility-analysis';
  timeframe: TimeInterval;
  metrics: {
    historicalVolatility: number | null;
    impliedVolatility: number | null;
    atr: number | null;
    atrPercent: number | null;
  };
  analysis: {
    volatilityLevel: VolatilityLevel;
    trend: string;
    description: string;
    tradingSuggestion: string;
  };
}

export type CorrelationStrength = 'very weak' | 'weak' | 'moderate' | 'strong' | 'very strong';

export interface Correlation {
  symbol: string;
  coefficient: number; // -1 to 1
  sampleSize: number;
  strength: CorrelationStrength;
  type: 'positive' | 'negative';
}

export interface CorrelationInsight extends MarketInsight {
  type: 'market-correlations';
  correlations: Correlation[];
  analysis: {
    strongestPositiveCorrelation: string;
    strongestNegativeCorrelation: string;
    tradingImplications: string;
  };
}