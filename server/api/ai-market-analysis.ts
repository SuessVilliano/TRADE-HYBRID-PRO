import { Request, Response } from "express";
import OpenAI from "openai";
import { generateMarketData } from "./market";
import fetch from "node-fetch";

// Initialize OpenAI with the API key
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Constants for API providers
const API_PROVIDERS = {
  OPENAI: 'openai',
  GEMINI: 'gemini'
};

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
    
    // Generate market data for the given symbol across timeframes
    const marketData = {
      hourly: generateMarketData(symbol as string, '1h', 48),
      daily: generateMarketData(symbol as string, '1d', 30),
      weekly: generateMarketData(symbol as string, '1w', 12),
    };

    // Check if we have AI API access
    const hasOpenAI = process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-');
    const hasGemini = !!process.env.GEMINI_API_KEY;
    
    if (!hasOpenAI && !hasGemini) {
      console.warn('No AI API keys available, using demo suggestions');
      
      // Create demo suggestions
      const demoSuggestions = createDemoTradingSuggestions(symbol as string, (riskProfile as string) || 'medium');
      
      const response: TradingSuggestionsResponse = {
        symbol: symbol as string,
        timestamp: Date.now(),
        suggestions: demoSuggestions,
      };
      
      return res.json(response);
    }

    try {
      // Generate prompt for AI
      const prompt = generateTradingPrompt(
        symbol as string, 
        (riskProfile as string) || 'medium',
        marketData
      );

      // Call AI API (will try OpenAI first, then Gemini)
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
      console.error('Error generating AI trading suggestions:', error);
      
      // Create demo suggestions as fallback
      const demoSuggestions = createDemoTradingSuggestions(symbol as string, (riskProfile as string) || 'medium');
      
      const response: TradingSuggestionsResponse = {
        symbol: symbol as string,
        timestamp: Date.now(),
        suggestions: demoSuggestions,
      };
      
      return res.json(response);
    }
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
 * Create a demo analysis for when API keys are not available
 */
function createDemoAnalysis(symbol: string, timeframe: string): any {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  
  // Generate random but plausible analysis
  const isBullish = Math.random() > 0.4;  // 60% chance of bullish analysis for better UX
  const direction = isBullish ? 'buy' : 'sell';
  const confidence = Math.floor(Math.random() * 30 + 60) / 100;  // 0.6 - 0.9
  const sentiment = isBullish ? 'generally positive' : 'somewhat cautious';
  const momentum = isBullish ? 'showing upward momentum' : 'indicating possible downward pressure';
  
  // Generate key indicators with randomized but realistic values
  const generateIndicator = (name: string, bullishValue: string, bearishValue: string, neutralInterpretation: string) => {
    const value = isBullish ? bullishValue : bearishValue;
    return {
      name,
      value,
      interpretation: neutralInterpretation + (isBullish ? ' This suggests potential upside.' : ' This indicates possible downside risk.')
    };
  };
  
  return {
    summary: `${symbol} on the ${timeframe} timeframe as of ${dateStr} is ${isBullish ? 'showing signs of strength with potential upside' : 'displaying some weakness with possible downside risk'}. Trading volumes have been ${Math.random() > 0.5 ? 'increasing' : 'stable'}, and market sentiment appears ${sentiment}.`,
    
    technicalAnalysis: {
      shortTerm: isBullish ? `The short-term trend for ${symbol} is bullish with recent price action breaking above key resistance levels.` : `The short-term outlook for ${symbol} appears bearish with price action testing support levels.`,
      mediumTerm: isBullish ? `Medium-term indicators suggest continued strength, with higher lows forming a potential ascending channel.` : `Medium-term analysis indicates a potential continuation of the downtrend, with lower highs establishing resistance.`,
      longTerm: `Long-term outlook remains neutral to ${isBullish ? 'bullish' : 'bearish'} depending on broader market conditions and fundamental developments.`,
      keyIndicators: [
        generateIndicator('RSI', '65.3', '38.7', 'Relative Strength Index shows moderate momentum.'),
        generateIndicator('MACD', '0.234 (Positive)', '-0.187 (Negative)', 'Moving Average Convergence Divergence shows recent momentum shift.'),
        generateIndicator('MA Cross', '50-day above 200-day', '50-day below 200-day', 'Moving average positioning indicates current trend direction.'),
        generateIndicator('Bollinger Bands', 'Price near upper band', 'Price approaching lower band', 'Current volatility and price position relative to recent range.'),
        generateIndicator('Volume', 'Above average', 'Below average', 'Trading volume compared to 20-day average.')
      ]
    },
    
    fundamentalAnalysis: {
      outlook: `The fundamental outlook for ${symbol} appears ${isBullish ? 'solid' : 'challenging'} based on recent developments.`,
      keyFactors: [
        {
          factor: "Market Sentiment",
          impact: `${isBullish ? 'Positive' : 'Negative'} - Overall market sentiment is ${sentiment}.`
        },
        {
          factor: "Technical Positioning",
          impact: `${isBullish ? 'Positive' : 'Negative'} - Price action is ${momentum}.`
        },
        {
          factor: "Trading Volume",
          impact: "Neutral - Volume patterns show typical activity without significant anomalies."
        }
      ]
    },
    
    sentimentAnalysis: {
      overall: `Overall sentiment for ${symbol} appears ${sentiment}.`,
      socialMedia: `Social media sentiment leans ${isBullish ? 'positive' : 'negative'} with ${isBullish ? 'increasing' : 'decreasing'} mentions.`,
      newsFlow: `Recent news coverage has been ${isBullish ? 'mostly positive' : 'mixed to negative'}.`
    },
    
    tradingSuggestions: {
      direction,
      confidence,
      reasoning: `Based on a combination of ${isBullish ? 'bullish technical indicators, positive sentiment, and favorable market conditions' : 'bearish technical signals, cautious sentiment, and challenging market conditions'}.`,
      riskLevel: isBullish ? 'medium' : 'high',
      targetPrice: isBullish ? 100 * (1 + Math.random() * 0.15) : 100 * (1 - Math.random() * 0.15),
      stopLoss: isBullish ? 100 * (1 - Math.random() * 0.07) : 100 * (1 + Math.random() * 0.07)
    },
    
    riskAssessment: {
      overallRisk: isBullish ? 'medium' : 'high',
      keyRisks: [
        `Unexpected shift in market sentiment for ${symbol}`,
        `Technical breakdown of key ${isBullish ? 'support' : 'resistance'} levels`,
        "Broader market volatility affecting all assets",
        "Note: This is a demo analysis as no API key is available"
      ]
    }
  };
}

/**
 * Call AI API to generate analysis, with fallback options
 */
async function generateAIAnalysis(prompt: string): Promise<string> {
  // First try OpenAI
  if (process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY.startsWith('sk-')) {
    try {
      console.log('Attempting to use OpenAI API...');
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
      // If OpenAI fails, try Gemini
      if (process.env.GEMINI_API_KEY) {
        return await useGeminiAPI(prompt);
      }
      throw new Error('Both OpenAI and Gemini APIs failed. Please check your API keys.');
    }
  } 
  // Try Gemini if OpenAI isn't available
  else if (process.env.GEMINI_API_KEY) {
    console.log('OpenAI API key not valid, attempting to use Gemini API...');
    return await useGeminiAPI(prompt);
  } else {
    // Neither API is available
    throw new Error('No valid AI API keys available. Please add OpenAI_API_KEY or GEMINI_API_KEY to your environment.');
  }
}

/**
 * Call Gemini API for analysis
 */
async function useGeminiAPI(prompt: string): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error('Gemini API key is not configured');
  }
  
  try {
    const apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    const response = await fetch(`${apiUrl}?key=${process.env.GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: "You are an expert financial analyst and trader with deep knowledge of technical analysis, fundamental analysis, and market psychology. Provide data-driven, insightful market analysis and trading recommendations.\n\n" + prompt
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      console.error('Gemini API error:', data);
      throw new Error(`Gemini API error: ${data.error?.message || 'Unknown error'}`);
    }
    
    // Extract the generated text from the response
    let generatedText = '';
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      data.candidates[0].content.parts.forEach((part: any) => {
        if (part.text) {
          generatedText += part.text;
        }
      });
    }
    
    if (!generatedText) {
      throw new Error('Gemini API returned empty response');
    }
    
    return generatedText;
  } catch (error) {
    console.error('Error calling Gemini API:', error);
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
 * Create demo trading suggestions when APIs are not available
 */
function createDemoTradingSuggestions(symbol: string, riskProfile: string): any {
  const now = new Date();
  const dateStr = now.toLocaleDateString();
  
  // Generate random price point around 100 for simplicity
  const currentPrice = 100 + (Math.random() * 20 - 10);
  
  // Create suggestions based on risk profile
  const suggestions = [];
  
  // Long-term bullish suggestion (more conservative)
  if (riskProfile === 'low' || Math.random() > 0.3) {
    suggestions.push({
      direction: "buy",
      entryPrice: currentPrice.toFixed(2),
      stopLoss: (currentPrice * 0.95).toFixed(2),
      takeProfit: [
        (currentPrice * 1.05).toFixed(2),
        (currentPrice * 1.10).toFixed(2),
        (currentPrice * 1.15).toFixed(2)
      ],
      positionSize: riskProfile === 'low' ? "5%" : (riskProfile === 'medium' ? "10%" : "15%"),
      riskRewardRatio: 3.0,
      reasoning: `Long-term bullish outlook for ${symbol} based on overall market trend analysis and technical indicators showing potential continuation. The current price level appears to offer a favorable risk-reward setup for a position trade.`,
      invalidation: `If price falls below the stop loss level or if overall market conditions shift to a bearish trend.`,
      timeframe: "position"
    });
  }
  
  // Short-term bearish suggestion (more aggressive)
  if (riskProfile === 'high' || Math.random() > 0.4) {
    suggestions.push({
      direction: "sell",
      entryPrice: currentPrice.toFixed(2),
      stopLoss: (currentPrice * 1.03).toFixed(2),
      takeProfit: [
        (currentPrice * 0.97).toFixed(2),
        (currentPrice * 0.95).toFixed(2),
        (currentPrice * 0.92).toFixed(2)
      ],
      positionSize: riskProfile === 'low' ? "3%" : (riskProfile === 'medium' ? "8%" : "12%"),
      riskRewardRatio: 2.5,
      reasoning: `Short-term indicators for ${symbol} suggest potential pullback within the next few trading sessions. RSI showing overbought conditions and potential resistance at current levels.`,
      invalidation: `If price breaks above the stop loss level or if new positive developments occur.`,
      timeframe: "swing"
    });
  }
  
  // Neutral/Hold suggestion
  if (suggestions.length < 3 || Math.random() > 0.5) {
    suggestions.push({
      direction: "hold",
      entryPrice: "N/A",
      stopLoss: null,
      takeProfit: [null],
      positionSize: "0%",
      riskRewardRatio: 0,
      reasoning: `Current price action for ${symbol} is showing mixed signals with no clear directional bias. It's advisable to wait for more clarity before entering a new position.`,
      invalidation: "N/A",
      timeframe: "intraday to swing"
    });
  }
  
  // Add note that this is demo data
  suggestions.forEach(suggestion => {
    suggestion.reasoning = suggestion.reasoning + " (Demo suggestion - no API key available)";
  });
  
  // Ensure we have at least one suggestion
  if (suggestions.length === 0) {
    suggestions.push({
      direction: "hold",
      entryPrice: "Current market price",
      stopLoss: null,
      takeProfit: [null],
      positionSize: "0%",
      riskRewardRatio: 0,
      reasoning: `Insufficient data available for ${symbol} at this time to make an informed trading decision. (Demo data - no API key available)`,
      invalidation: "N/A",
      timeframe: "N/A"
    });
  }
  
  return suggestions;
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
      console.log('Failed to parse AI response as JSON, using fallback formatting');
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