import { Request, Response } from "express";
import OpenAI from "openai";
import { generateMarketData } from "./market";

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface MarketAnalysisRequest {
  symbol: string;
  timeframe: string;
  depth: 'basic' | 'advanced' | 'expert';
  includeTechnicals?: boolean;
  includeFundamentals?: boolean;
  includeSentiment?: boolean;
}

export interface MarketAnalysisResponse {
  symbol: string;
  timeframe: string;
  timestamp: number;
  hybridScore: {
    value: number;         // 0-100 score representing overall trade quality
    sentiment: number;     // 0-100 representing market sentiment
    momentum: number;      // 0-100 representing price momentum
    volatility: number;    // 0-100 representing current volatility level
    timing: number;        // 0-100 representing entry timing quality
    riskReward: number;    // 0-100 representing risk-reward ratio quality
    strength: 'very weak' | 'weak' | 'neutral' | 'strong' | 'very strong'; // Verbal representation of score
    direction: 'bullish' | 'bearish' | 'neutral'; // Market direction
    confidence: number;    // 0-100 representing AI confidence in the score
    components: string[];  // Factors that influenced the score
  };
  analysis: {
    summary: string;
    technicalAnalysis?: {
      shortTerm: string;
      mediumTerm: string;
      longTerm: string;
      keyIndicators: {
        name: string;
        value: string;
        interpretation: string;
      }[];
    };
    fundamentalAnalysis?: {
      outlook: string;
      keyFactors: {
        factor: string;
        impact: string;
      }[];
    };
    sentimentAnalysis?: {
      overall: string;
      socialMedia: string;
      newsFlow: string;
    };
    tradingSuggestions: {
      direction: 'buy' | 'sell' | 'hold';
      confidence: number;
      reasoning: string;
      riskLevel: 'low' | 'medium' | 'high';
      targetPrice?: number;
      stopLoss?: number;
    };
    riskAssessment: {
      overallRisk: 'low' | 'medium' | 'high';
      keyRisks: string[];
    };
  };
}

interface TradingSuggestion {
  direction: 'buy' | 'sell' | 'hold';
  entryPrice: string | number;
  stopLoss: number | null;
  takeProfit: (number | null)[];
  positionSize: string;
  riskRewardRatio: number;
  reasoning: string;
  invalidation: string;
  timeframe: string;
}

interface TradingSuggestionsResponse {
  symbol: string;
  timestamp: number;
  suggestions: TradingSuggestion[];
}

/**
 * Generate an AI market analysis for the given symbol and timeframe
 */
export const getAIMarketAnalysis = async (req: Request, res: Response) => {
  try {
    const { symbol, timeframe, depth, includeTechnicals, includeFundamentals, includeSentiment } = req.query;
    
    if (!symbol || !timeframe) {
      return res.status(400).json({ error: 'Symbol and timeframe are required' });
    }
    
    // Generate market data for the given symbol and timeframe
    const marketData = generateMarketData(symbol as string, timeframe as string, 60);

    // Check if OpenAI API key is valid
    if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY.startsWith('sk-') === false) {
      console.warn('OpenAI API key is missing or invalid, using fallback data');
      
      // Create fallback demo analysis
      const demoAnalysis = createDemoAnalysis(symbol as string, timeframe as string);
      
      // Calculate the Hybrid Score with fallback data
      const hybridScore = calculateHybridScore(symbol as string, marketData, demoAnalysis);
      
      const response: MarketAnalysisResponse = {
        symbol: symbol as string,
        timeframe: timeframe as string,
        timestamp: Date.now(),
        hybridScore,
        analysis: demoAnalysis,
      };
      
      return res.json(response);
    }

    try {
      // Generate prompt for OpenAI
      const prompt = generateAnalysisPrompt({
        symbol: symbol as string,
        timeframe: timeframe as string,
        depth: (depth as 'basic' | 'advanced' | 'expert') || 'advanced',
        includeTechnicals: includeTechnicals === 'true',
        includeFundamentals: includeFundamentals === 'true',
        includeSentiment: includeSentiment === 'true',
      }, marketData);

      // Call OpenAI API
      const aiResponse = await generateAIAnalysis(prompt);
      
      // Format and return the response
      const formattedResponse = formatAnalysisResponse(aiResponse, symbol as string);
      
      // Calculate the Hybrid Score
      const hybridScore = calculateHybridScore(symbol as string, marketData, formattedResponse);
      
      const response: MarketAnalysisResponse = {
        symbol: symbol as string,
        timeframe: timeframe as string,
        timestamp: Date.now(),
        hybridScore,
        analysis: formattedResponse,
      };
      
      res.json(response);
    } catch (openaiError) {
      console.error('Error with OpenAI API:', openaiError);
      
      // Create fallback demo analysis
      const demoAnalysis = createDemoAnalysis(symbol as string, timeframe as string);
      
      // Calculate the Hybrid Score with fallback data
      const hybridScore = calculateHybridScore(symbol as string, marketData, demoAnalysis);
      
      const response: MarketAnalysisResponse = {
        symbol: symbol as string,
        timeframe: timeframe as string,
        timestamp: Date.now(),
        hybridScore,
        analysis: demoAnalysis,
      };
      
      return res.json(response);
    }
  } catch (error) {
    console.error('Error generating AI market analysis:', error);
    res.status(500).json({ error: 'Failed to generate AI market analysis' });
  }
};

/**
 * Generate trading suggestions based on market data
 */
export const getTradingSuggestions = async (req: Request, res: Response) => {
  try {
    const { symbol, riskProfile } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol is required' });
    }
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'OpenAI API is not configured' });
    }

    // Generate market data for the given symbol across timeframes
    const marketData = {
      hourly: generateMarketData(symbol as string, '1h', 48),
      daily: generateMarketData(symbol as string, '1d', 30),
      weekly: generateMarketData(symbol as string, '1w', 12),
    };

    // Generate prompt for OpenAI
    const prompt = generateTradingPrompt(
      symbol as string, 
      (riskProfile as string) || 'medium',
      marketData
    );

    // Call OpenAI API
    const aiResponse = await generateAIAnalysis(prompt);
    
    // Format and return the response
    const suggestions = formatTradingSuggestions(aiResponse);
    
    const response: TradingSuggestionsResponse = {
      symbol: symbol as string,
      timestamp: Date.now(),
      suggestions,
    };
    
    res.json(response);
  } catch (error) {
    console.error('Error generating trading suggestions:', error);
    res.status(500).json({ error: 'Failed to generate trading suggestions' });
  }
};

/**
 * Generate prompt for market analysis based on the data
 */
function generateAnalysisPrompt(
  requestData: MarketAnalysisRequest,
  marketData: any
): string {
  const { symbol, timeframe, depth, includeTechnicals, includeFundamentals, includeSentiment } = requestData;
  
  let prompt = `Analyze the market data for ${symbol} on a ${timeframe} timeframe in ${depth} detail.

Current Market Data:
${JSON.stringify(marketData, null, 2)}

Please provide:
1. A concise summary of the current market situation for ${symbol}
`;

  if (includeTechnicals) {
    prompt += `
2. Technical Analysis:
   - Short-term outlook (next few periods)
   - Medium-term outlook (next 5-10 periods)
   - Long-term outlook (beyond 10 periods)
   - Key technical indicators with values and interpretation (at least 5 indicators)
`;
  }

  if (includeFundamentals) {
    prompt += `
3. Fundamental Analysis:
   - Overall fundamental outlook
   - Key fundamental factors affecting the price (list at least 3-5 factors with their impact)
`;
  }

  if (includeSentiment) {
    prompt += `
4. Market Sentiment Analysis:
   - Overall market sentiment
   - Social media sentiment
   - News flow sentiment
`;
  }

  prompt += `
5. Trading suggestion with:
   - Direction (buy, sell, or hold)
   - Confidence level (0.0 to 1.0)
   - Clear reasoning for the suggestion
   - Risk level (low, medium, high)
   - Suggested target price (if applicable)
   - Suggested stop loss level (if applicable)

6. Risk Assessment:
   - Overall risk level (low, medium, high)
   - Key risks to be aware of (list at least 3)

Format your response as a JSON object with clear sections for each of the above components.
`;

  return prompt;
}

/**
 * Generate prompt for trading suggestions
 */
function generateTradingPrompt(symbol: string, riskProfile: string, marketData: any): string {
  return `Generate 3 detailed trading suggestions for ${symbol} tailored to a ${riskProfile} risk profile trader.

Current Market Data:
Hourly Data: ${JSON.stringify(marketData.hourly.slice(0, 10), null, 2)}
Daily Data: ${JSON.stringify(marketData.daily.slice(0, 10), null, 2)}
Weekly Data: ${JSON.stringify(marketData.weekly.slice(0, 5), null, 2)}

For each trading suggestion, provide:
1. Trade direction (buy, sell, or hold)
2. Entry price (specific price or range)
3. Stop loss level (specific price)
4. Take profit targets (up to 3 price levels)
5. Suggested position size (as % of portfolio)
6. Risk-to-reward ratio (e.g., 1:3)
7. Detailed reasoning for the trade (including technical and fundamental factors)
8. Specific conditions that would invalidate the trade
9. Appropriate timeframe for the trade (e.g., intraday, swing, position)

Create diverse suggestions that cover different timeframes and strategies appropriate for the ${riskProfile} risk profile.

Format your response as a JSON array with these well-structured trading suggestions.
`;
}

/**
 * Call OpenAI API to generate analysis
 */
async function generateAIAnalysis(prompt: string): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        { role: "system", content: "You are an expert financial analyst and trader with deep knowledge of technical analysis, fundamental analysis, and market psychology. Provide data-driven, insightful market analysis and trading recommendations." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048,
    });

    return response.choices[0].message.content || '';
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw error;
  }
}

/**
 * Format raw AI response into structured analysis
 */
function formatAnalysisResponse(rawResponse: string, symbol: string): any {
  try {
    // Try to parse as JSON first
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      console.log('Failed to parse OpenAI response as JSON, using fallback formatting');
    }
    
    // Fallback to a default structured response
    return {
      summary: `Analysis for ${symbol} could not be properly formatted. Please try again.`,
      technicalAnalysis: {
        shortTerm: "Data unavailable",
        mediumTerm: "Data unavailable",
        longTerm: "Data unavailable",
        keyIndicators: [
          {
            name: "RSI",
            value: "N/A",
            interpretation: "Data unavailable"
          }
        ]
      },
      tradingSuggestions: {
        direction: "hold",
        confidence: 0,
        reasoning: "Insufficient data for analysis",
        riskLevel: "medium"
      },
      riskAssessment: {
        overallRisk: "medium",
        keyRisks: ["Market volatility", "Insufficient data for analysis", "Technical failure in analysis"]
      }
    };
  } catch (error) {
    console.error('Error formatting analysis response:', error);
    throw error;
  }
}

/**
 * Format trading suggestions from AI response
 */
function formatTradingSuggestions(rawResponse: string): any {
  try {
    // Try to parse as JSON first
    try {
      return JSON.parse(rawResponse);
    } catch (e) {
      console.log('Failed to parse OpenAI response as JSON, using fallback formatting');
    }
    
    // Fallback to a default structured response
    return [
      {
        direction: "hold",
        entryPrice: "Market price",
        stopLoss: null,
        takeProfit: [null],
        positionSize: "0%",
        riskRewardRatio: 0,
        reasoning: "Unable to generate trading suggestions at this time. Please try again later.",
        invalidation: "N/A",
        timeframe: "N/A"
      }
    ];
  } catch (error) {
    console.error('Error formatting trading suggestions:', error);
    throw error;
  }
}

/**
 * Calculate the Hybrid Score based on technical analysis, AI insights, and market data
 */
function calculateHybridScore(symbol: string, marketData: any, analysisData: any): any {
  try {
    // Default values if analysis data is incomplete
    if (!analysisData) {
      return {
        value: 50,
        sentiment: 50,
        momentum: 50,
        volatility: 50,
        timing: 50,
        riskReward: 50,
        strength: 'neutral',
        direction: 'neutral',
        confidence: 0.5,
        components: ['Insufficient data for comprehensive analysis']
      };
    }

    const components: string[] = [];
    
    // Extract trading direction from analysis
    let direction: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    if (analysisData.tradingSuggestions && analysisData.tradingSuggestions.direction) {
      direction = analysisData.tradingSuggestions.direction === 'buy' ? 'bullish' : 
                 (analysisData.tradingSuggestions.direction === 'sell' ? 'bearish' : 'neutral');
    }
    
    // Calculate sentiment score based on analysis data
    let sentimentScore = 50; // Default neutral
    if (analysisData.sentimentAnalysis) {
      const sentimentMapping: {[key: string]: number} = {
        'very bearish': 10,
        'bearish': 30,
        'neutral': 50, 
        'bullish': 70,
        'very bullish': 90
      };
      
      // If sentiment info is available, analyze text to extract sentiment
      const sentimentText = analysisData.sentimentAnalysis.overall || '';
      
      if (sentimentText.includes('very bullish') || sentimentText.includes('strongly positive')) {
        sentimentScore = 90;
        components.push('Very positive market sentiment');
      } else if (sentimentText.includes('bullish') || sentimentText.includes('positive')) {
        sentimentScore = 70;
        components.push('Positive market sentiment');
      } else if (sentimentText.includes('very bearish') || sentimentText.includes('strongly negative')) {
        sentimentScore = 10;
        components.push('Very negative market sentiment');
      } else if (sentimentText.includes('bearish') || sentimentText.includes('negative')) {
        sentimentScore = 30;
        components.push('Negative market sentiment');
      } else {
        sentimentScore = 50;
        components.push('Neutral market sentiment');
      }
    }
    
    // Calculate momentum score by analyzing price action from market data
    let momentumScore = 50;
    if (marketData && marketData.length > 5) {
      const recentPrices = marketData.slice(0, 10).map((bar: any) => bar.close);
      
      // Compare latest price with average of previous 10 candles
      const latestPrice = recentPrices[0];
      const avgPrice = recentPrices.reduce((a: number, b: number) => a + b, 0) / recentPrices.length;
      
      // Simple momentum calculation
      if (latestPrice > avgPrice * 1.05) {
        momentumScore = 80; // Strong upward momentum
        components.push('Strong upward price momentum');
      } else if (latestPrice > avgPrice) {
        momentumScore = 65; // Moderate upward momentum
        components.push('Moderate upward price momentum');
      } else if (latestPrice < avgPrice * 0.95) {
        momentumScore = 20; // Strong downward momentum
        components.push('Strong downward price momentum');
      } else if (latestPrice < avgPrice) {
        momentumScore = 35; // Moderate downward momentum
        components.push('Moderate downward price momentum');
      } else {
        momentumScore = 50; // Neutral momentum
        components.push('Neutral price momentum');
      }
    }
    
    // Calculate volatility score
    let volatilityScore = 50;
    if (marketData && marketData.length > 10) {
      const volatilityBars = marketData.slice(0, 20);
      
      // Calculate average percentage range of recent candles
      const avgRange = volatilityBars.reduce((sum: number, bar: any) => {
        const range = Math.abs(bar.high - bar.low) / bar.low;
        return sum + range;
      }, 0) / volatilityBars.length;
      
      // Scale volatility from 0-100
      if (avgRange > 0.03) {
        volatilityScore = 90; // Very high volatility
        components.push('Extremely high market volatility');
      } else if (avgRange > 0.02) {
        volatilityScore = 75; // High volatility
        components.push('High market volatility');
      } else if (avgRange > 0.01) {
        volatilityScore = 50; // Medium volatility
        components.push('Moderate market volatility');
      } else if (avgRange > 0.005) {
        volatilityScore = 25; // Low volatility
        components.push('Low market volatility');
      } else {
        volatilityScore = 10; // Very low volatility
        components.push('Very low market volatility');
      }
    }
    
    // Calculate entry timing quality
    let timingScore = 50;
    if (analysisData.technicalAnalysis && analysisData.technicalAnalysis.keyIndicators) {
      const indicators = analysisData.technicalAnalysis.keyIndicators;
      
      // Look for specific indicators that might suggest good entry timing
      const hasBullishIndicator = indicators.some((indicator: any) => 
        indicator.interpretation && 
        (indicator.interpretation.includes('bullish') || 
         indicator.interpretation.includes('oversold') ||
         indicator.interpretation.includes('buy'))
      );
      
      const hasBearishIndicator = indicators.some((indicator: any) => 
        indicator.interpretation && 
        (indicator.interpretation.includes('bearish') || 
         indicator.interpretation.includes('overbought') ||
         indicator.interpretation.includes('sell'))
      );
      
      if (direction === 'bullish' && hasBullishIndicator) {
        timingScore = 80;
        components.push('Favorable bullish entry timing based on technical indicators');
      } else if (direction === 'bearish' && hasBearishIndicator) {
        timingScore = 80;
        components.push('Favorable bearish entry timing based on technical indicators');
      } else if ((direction === 'bullish' && hasBearishIndicator) || 
                 (direction === 'bearish' && hasBullishIndicator)) {
        timingScore = 20;
        components.push('Poor entry timing - conflicting technical indicators');
      } else {
        timingScore = 50;
        components.push('Neutral entry timing');
      }
    }
    
    // Calculate risk/reward quality
    let riskRewardScore = 50;
    if (analysisData.tradingSuggestions && 
        typeof analysisData.tradingSuggestions.targetPrice === 'number' && 
        typeof analysisData.tradingSuggestions.stopLoss === 'number') {
      
      const targetPrice = analysisData.tradingSuggestions.targetPrice;
      const stopLoss = analysisData.tradingSuggestions.stopLoss;
      const currentPrice = marketData && marketData.length ? marketData[0].close : 0;
      
      if (currentPrice && direction === 'bullish') {
        const reward = Math.abs(targetPrice - currentPrice);
        const risk = Math.abs(currentPrice - stopLoss);
        const ratio = risk > 0 ? reward / risk : 0;
        
        if (ratio >= 3) {
          riskRewardScore = 90;
          components.push(`Excellent risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else if (ratio >= 2) {
          riskRewardScore = 75;
          components.push(`Good risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else if (ratio >= 1) {
          riskRewardScore = 50;
          components.push(`Acceptable risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else {
          riskRewardScore = 25;
          components.push(`Poor risk/reward ratio of ${ratio.toFixed(1)}:1`);
        }
      } else if (currentPrice && direction === 'bearish') {
        const reward = Math.abs(currentPrice - targetPrice);
        const risk = Math.abs(stopLoss - currentPrice);
        const ratio = risk > 0 ? reward / risk : 0;
        
        if (ratio >= 3) {
          riskRewardScore = 90;
          components.push(`Excellent risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else if (ratio >= 2) {
          riskRewardScore = 75;
          components.push(`Good risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else if (ratio >= 1) {
          riskRewardScore = 50;
          components.push(`Acceptable risk/reward ratio of ${ratio.toFixed(1)}:1`);
        } else {
          riskRewardScore = 25;
          components.push(`Poor risk/reward ratio of ${ratio.toFixed(1)}:1`);
        }
      }
    } else {
      riskRewardScore = 50;
      components.push('Unable to determine risk/reward ratio');
    }
    
    // Get confidence score from AI analysis
    let confidenceScore = 0.5;
    if (analysisData.tradingSuggestions && typeof analysisData.tradingSuggestions.confidence === 'number') {
      confidenceScore = analysisData.tradingSuggestions.confidence;
    }
    
    // Calculate the overall hybrid score with weighted components
    // Weights based on relative importance of each factor
    const weights = {
      sentiment: 0.15,
      momentum: 0.25,
      volatility: 0.15, 
      timing: 0.25,
      riskReward: 0.20
    };
    
    const overallScore = (
      sentimentScore * weights.sentiment +
      momentumScore * weights.momentum +
      volatilityScore * weights.volatility +
      timingScore * weights.timing +
      riskRewardScore * weights.riskReward
    );
    
    // Determine the verbal strength based on the overall score
    let strength: 'very weak' | 'weak' | 'neutral' | 'strong' | 'very strong';
    if (overallScore >= 80) {
      strength = 'very strong';
    } else if (overallScore >= 65) {
      strength = 'strong';
    } else if (overallScore >= 35) {
      strength = 'neutral';
    } else if (overallScore >= 20) {
      strength = 'weak';
    } else {
      strength = 'very weak';
    }
    
    return {
      value: Math.round(overallScore),
      sentiment: Math.round(sentimentScore),
      momentum: Math.round(momentumScore),
      volatility: Math.round(volatilityScore),
      timing: Math.round(timingScore),
      riskReward: Math.round(riskRewardScore),
      strength,
      direction,
      confidence: confidenceScore,
      components
    };
  } catch (error) {
    console.error('Error calculating Hybrid Score:', error);
    // Return default neutral values if calculation fails
    return {
      value: 50,
      sentiment: 50,
      momentum: 50,
      volatility: 50,
      timing: 50,
      riskReward: 50,
      strength: 'neutral',
      direction: 'neutral',
      confidence: 0.5,
      components: ['Error in score calculation']
    };
  }
}