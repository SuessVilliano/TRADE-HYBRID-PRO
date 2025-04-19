import { Request, Response } from 'express';
import axios from 'axios';
import { db } from '../storage';
import { trades, users, portfolios } from '../schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

// OpenAI API configuration
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

/**
 * Makes a request to the OpenAI API for trading insights
 */
async function getAIInsights(prompt: string) {
  try {
    if (!OPENAI_API_KEY) {
      throw new Error('OpenAI API key is not configured');
    }

    const response = await axios.post(
      OPENAI_API_URL,
      {
        model: 'gpt-4',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert trading analyst with deep knowledge of technical analysis, fundamental analysis, and market psychology. Provide detailed, personalized insights based on trading data. Your analysis should be factual, specific, and actionable.'
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.2,
        max_tokens: 1000
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    throw new Error('Failed to generate AI insights');
  }
}

/**
 * Gets a user's historical trade data
 */
async function getUserTradeHistory(userId: string) {
  try {
    const userTrades = await db.select()
      .from(trades)
      .where(eq(trades.userId, userId))
      .orderBy(desc(trades.createdAt))
      .limit(100);
    
    return userTrades;
  } catch (error) {
    console.error('Error fetching user trade history:', error);
    throw new Error('Failed to fetch trade history');
  }
}

/**
 * Gets a user's portfolio data
 */
async function getUserPortfolio(userId: string) {
  try {
    const userPortfolio = await db.select()
      .from(portfolios)
      .where(eq(portfolios.userId, userId))
      .limit(1);
    
    return userPortfolio[0];
  } catch (error) {
    console.error('Error fetching user portfolio:', error);
    throw new Error('Failed to fetch portfolio data');
  }
}

// API endpoint handlers

/**
 * Generates trade pattern analysis from user's historical trades
 */
export async function tradePatterns(req: Request, res: Response) {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's trade history
    const tradeHistory = await getUserTradeHistory(userId);
    
    if (!tradeHistory || tradeHistory.length === 0) {
      return res.status(404).json({ error: 'No trade history found for this user' });
    }
    
    // Generate prompt for AI analysis
    const prompt = `Analyze the following trade history and identify recurring patterns, behaviors, and tendencies. Focus on identifying what makes successful trades and what causes unsuccessful ones.
    
    Trade History:
    ${JSON.stringify(tradeHistory)}
    
    Please provide your analysis in the following JSON format:
    {
      "patterns": [
        {
          "id": "unique-id",
          "name": "Pattern Name",
          "description": "Detailed description of the pattern",
          "frequency": 75, // percentage occurrence in the data
          "successRate": 65, // percentage of successful outcomes
          "averageProfit": 150.25, // average profit when successful
          "averageLoss": 75.50, // average loss when unsuccessful
          "riskRewardRatio": 2.0, // risk-reward ratio
          "timeOfDay": "Morning", // optional
          "dayOfWeek": "Monday", // optional
          "preferredAssets": ["AAPL", "MSFT"], // assets where this pattern occurred
          "recommendedActions": ["Action 1", "Action 2"] // suggested actions to improve/leverage this pattern
        }
      ]
    }`;
    
    // Get AI-generated insights
    const aiResponse = await getAIInsights(prompt);
    
    // Parse the response and return
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('Error in trade patterns API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generates a summary of the user's trading performance
 */
export async function tradeSummary(req: Request, res: Response) {
  try {
    const { userId, timeframe } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Calculate date range based on timeframe
    let startDate = new Date(0); // Default to epoch start
    const endDate = new Date();
    
    if (timeframe) {
      const now = new Date();
      switch (timeframe) {
        case 'day':
          startDate = new Date(now.setDate(now.getDate() - 1));
          break;
        case 'week':
          startDate = new Date(now.setDate(now.getDate() - 7));
          break;
        case 'month':
          startDate = new Date(now.setMonth(now.getMonth() - 1));
          break;
        case 'year':
          startDate = new Date(now.setFullYear(now.getFullYear() - 1));
          break;
      }
    }
    
    // Get user's trade history within the timeframe
    const tradeHistory = await db.select()
      .from(trades)
      .where(
        and(
          eq(trades.userId, userId as string),
          gte(trades.createdAt, startDate),
          lte(trades.createdAt, endDate)
        )
      );
    
    if (!tradeHistory || tradeHistory.length === 0) {
      return res.status(404).json({ error: 'No trade history found for this user in the specified timeframe' });
    }
    
    // Calculate trade summary statistics
    const totalTrades = tradeHistory.length;
    const winningTrades = tradeHistory.filter(trade => trade.profit > 0).length;
    const losingTrades = tradeHistory.filter(trade => trade.profit <= 0).length;
    const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
    
    const profits = tradeHistory.filter(trade => trade.profit > 0).map(trade => trade.profit);
    const losses = tradeHistory.filter(trade => trade.profit <= 0).map(trade => Math.abs(trade.profit));
    
    const averageProfit = profits.length > 0 ? profits.reduce((sum, profit) => sum + profit, 0) / profits.length : 0;
    const averageLoss = losses.length > 0 ? losses.reduce((sum, loss) => sum + loss, 0) / losses.length : 0;
    const profitFactor = averageLoss > 0 ? averageProfit / averageLoss : 0;
    
    const largestWin = profits.length > 0 ? Math.max(...profits) : 0;
    const largestLoss = losses.length > 0 ? Math.max(...losses) : 0;
    
    // Calculate average holding time
    const holdingTimes = tradeHistory.map(trade => {
      const openTime = new Date(trade.openDate).getTime();
      const closeTime = new Date(trade.closeDate).getTime();
      return (closeTime - openTime) / (1000 * 60 * 60); // in hours
    });
    
    const averageHoldingTime = holdingTimes.length > 0 
      ? holdingTimes.reduce((sum, time) => sum + time, 0) / holdingTimes.length 
      : 0;
    
    // Find most and least profitable assets
    const assetPerformance = tradeHistory.reduce((acc, trade) => {
      const symbol = trade.symbol;
      if (!acc[symbol]) {
        acc[symbol] = {
          totalProfit: 0,
          count: 0
        };
      }
      
      acc[symbol].totalProfit += trade.profit;
      acc[symbol].count += 1;
      
      return acc;
    }, {} as Record<string, { totalProfit: number, count: number }>);
    
    const assets = Object.keys(assetPerformance);
    const mostProfitableAsset = assets.length > 0 
      ? assets.reduce((most, asset) => 
          assetPerformance[asset].totalProfit > assetPerformance[most].totalProfit ? asset : most, 
          assets[0]
        )
      : 'N/A';
      
    const leastProfitableAsset = assets.length > 0 
      ? assets.reduce((least, asset) => 
          assetPerformance[asset].totalProfit < assetPerformance[least].totalProfit ? asset : least, 
          assets[0]
        )
      : 'N/A';
    
    // Construct and return the summary
    const summary = {
      totalTrades,
      winningTrades,
      losingTrades,
      winRate,
      averageProfit,
      averageLoss,
      profitFactor,
      largestWin,
      largestLoss,
      averageHoldingTime,
      mostProfitableAsset,
      leastProfitableAsset
    };
    
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Error in trade summary API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generates personalized trade recommendations based on user patterns
 */
export async function tradeRecommendations(req: Request, res: Response) {
  try {
    const { userId, riskLevel, assetTypes, maxRecommendations } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's trade history and portfolio
    const tradeHistory = await getUserTradeHistory(userId as string);
    const portfolio = await getUserPortfolio(userId as string);
    
    if (!tradeHistory || tradeHistory.length === 0) {
      return res.status(404).json({ error: 'No trade history found for this user' });
    }
    
    // Generate prompt for AI recommendations
    const prompt = `Based on the following user trade history and portfolio, generate personalized trade recommendations. The user prefers ${riskLevel || 'medium'} risk and is interested in ${assetTypes || 'all asset types'}.
    
    Trade History:
    ${JSON.stringify(tradeHistory)}
    
    Portfolio:
    ${JSON.stringify(portfolio)}
    
    Please provide your recommendations in the following JSON format:
    {
      "recommendations": [
        {
          "symbol": "AAPL",
          "direction": "buy", // or "sell"
          "confidence": 75, // percentage
          "entryPrice": 150.25,
          "stopLoss": 145.50,
          "takeProfit": 160.00,
          "timeframe": "daily",
          "rationale": "Detailed rationale for this recommendation",
          "supportingFactors": ["Factor 1", "Factor 2"],
          "riskLevel": "medium", // "low", "medium", or "high"
          "optimalTimeOfDay": "Morning" // optional
        }
      ]
    }
    
    Limit the recommendations to ${maxRecommendations || 3} opportunities.`;
    
    // Get AI-generated recommendations
    const aiResponse = await getAIInsights(prompt);
    
    // Parse the response and return
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('Error in trade recommendations API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generates market insights relevant to the user's portfolio
 */
export async function marketInsights(req: Request, res: Response) {
  try {
    const { userId, symbols } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's portfolio
    const portfolio = await getUserPortfolio(userId as string);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio found for this user' });
    }
    
    // Parse symbols if provided
    const targetSymbols = symbols 
      ? (symbols as string).split(',') 
      : portfolio.holdings.map((holding: any) => holding.symbol);
    
    if (!targetSymbols || targetSymbols.length === 0) {
      return res.status(400).json({ error: 'No symbols to analyze' });
    }
    
    // Generate prompt for AI insights
    const prompt = `Generate market insights for the following symbols: ${targetSymbols.join(', ')}
    
    Please provide your insights in the following JSON format:
    {
      "insights": [
        {
          "id": "unique-id",
          "category": "technical", // "technical", "fundamental", "sentiment", or "correlation"
          "title": "Insight title",
          "description": "Detailed description of the insight",
          "impact": "positive", // "positive", "negative", or "neutral"
          "confidence": 75, // percentage
          "symbols": ["AAPL"], // symbols this insight applies to
          "timeframe": "daily",
          "source": "Source of the insight", // optional
          "date": "2025-04-19T00:00:00.000Z",
          "relatedInsights": ["another-id"] // optional
        }
      ]
    }`;
    
    // Get AI-generated insights
    const aiResponse = await getAIInsights(prompt);
    
    // Parse the response and return
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('Error in market insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Generates personalized insights for improving trading performance
 */
export async function personalizedInsights(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's trade history
    const tradeHistory = await getUserTradeHistory(userId as string);
    
    if (!tradeHistory || tradeHistory.length === 0) {
      return res.status(404).json({ error: 'No trade history found for this user' });
    }
    
    // Generate prompt for AI insights
    const prompt = `Analyze the following trade history and identify strengths, weaknesses, opportunities, and threats (SWOT) for this trader. Provide specific, actionable insights to improve their trading performance.
    
    Trade History:
    ${JSON.stringify(tradeHistory)}
    
    Please provide your insights in the following JSON format:
    {
      "insights": [
        {
          "id": "unique-id",
          "type": "strength", // "strength", "weakness", "opportunity", or "threat"
          "title": "Insight title",
          "description": "Detailed description of the insight",
          "actionItems": ["Action 1", "Action 2"],
          "relevantPatterns": ["pattern-id"], // optional
          "priority": "high", // "low", "medium", or "high"
          "category": "execution", // "execution", "psychology", "strategy", or "risk-management"
          "dateIdentified": "2025-04-19T00:00:00.000Z"
        }
      ]
    }`;
    
    // Get AI-generated insights
    const aiResponse = await getAIInsights(prompt);
    
    // Parse the response and return
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('Error in personalized insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * Performs a risk assessment of the user's current portfolio
 */
export async function riskAssessment(req: Request, res: Response) {
  try {
    const { userId } = req.query;
    
    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }
    
    // Get user's portfolio
    const portfolio = await getUserPortfolio(userId as string);
    
    if (!portfolio) {
      return res.status(404).json({ error: 'No portfolio found for this user' });
    }
    
    // Generate prompt for AI risk assessment
    const prompt = `Perform a risk assessment on the following portfolio:
    
    Portfolio:
    ${JSON.stringify(portfolio)}
    
    Please provide your assessment in the following JSON format:
    {
      "overallRiskScore": 65, // 0-100 scale
      "positionSizing": {
        "score": 70,
        "recommendation": "Detailed recommendation"
      },
      "concentrationRisk": {
        "score": 60,
        "tooConcentratedAssets": ["AAPL", "MSFT"],
        "recommendation": "Detailed recommendation"
      },
      "marketExposure": {
        "score": 75,
        "currentExposure": 85, // percentage
        "recommendation": "Detailed recommendation"
      },
      "volatilityExposure": {
        "score": 55,
        "highVolatilityAssets": ["TSLA", "GME"],
        "recommendation": "Detailed recommendation"
      },
      "correlationRisk": {
        "score": 80,
        "highlyCorrelatedPairs": [["AAPL", "MSFT", 0.85], ["JPM", "GS", 0.92]],
        "recommendation": "Detailed recommendation"
      }
    }`;
    
    // Get AI-generated risk assessment
    const aiResponse = await getAIInsights(prompt);
    
    // Parse the response and return
    try {
      const parsedResponse = JSON.parse(aiResponse);
      return res.status(200).json(parsedResponse);
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      return res.status(500).json({ 
        error: 'Failed to parse AI response',
        rawResponse: aiResponse
      });
    }
  } catch (error) {
    console.error('Error in risk assessment API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

// Main handler for AI insights API
export default async function aiInsightsHandler(req: Request, res: Response) {
  const endpoint = req.path.replace('/api/ai-insights/', '');
  
  try {
    switch (endpoint) {
      case 'trade-patterns':
        return await tradePatterns(req, res);
      case 'trade-summary':
        return await tradeSummary(req, res);
      case 'recommendations':
        return await tradeRecommendations(req, res);
      case 'market-insights':
        return await marketInsights(req, res);
      case 'personalized-insights':
        return await personalizedInsights(req, res);
      case 'risk-assessment':
        return await riskAssessment(req, res);
      default:
        return res.status(404).json({ error: 'Endpoint not found' });
    }
  } catch (error) {
    console.error('Error in AI insights API:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}