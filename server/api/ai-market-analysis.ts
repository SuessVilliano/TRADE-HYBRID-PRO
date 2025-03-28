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
    
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ error: 'OpenAI API is not configured' });
    }

    // Generate market data for the given symbol and timeframe
    const marketData = generateMarketData(symbol as string, timeframe as string, 60);

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
    
    const response: MarketAnalysisResponse = {
      symbol: symbol as string,
      timeframe: timeframe as string,
      timestamp: Date.now(),
      analysis: formattedResponse,
    };
    
    res.json(response);
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