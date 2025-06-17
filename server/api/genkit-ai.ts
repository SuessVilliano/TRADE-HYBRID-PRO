import { Request, Response } from 'express';
import { TradeHybridAIAgent } from '../genkit-agent.js';
import { runFlow } from '@genkit-ai/flow';

const aiAgent = TradeHybridAIAgent.getInstance();

// Trading analysis endpoint
export async function analyzeTrade(req: Request, res: Response) {
  try {
    const { symbol, marketData, signals, userProfile, analysisType } = req.body;

    const analysis = await aiAgent.tradingAnalysisFlow({
      symbol,
      marketData,
      signals,
      userProfile,
      analysisType: analysisType || 'comprehensive'
    });

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      source: 'genkit-ai'
    });
  } catch (error) {
    console.error('Trading analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze trade',
      message: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

// Voice trading endpoint
export async function processVoiceTrading(req: Request, res: Response) {
  try {
    const { audioInput, userId, context } = req.body;

    const result = await aiAgent.voiceTradingFlow({
      audioInput,
      userId,
      context
    });

    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice command'
    });
  }
}

// Real-time market monitoring
export async function monitorMarkets(req: Request, res: Response) {
  try {
    const { watchlist, alertThresholds, userId } = req.body;

    const insights = await aiAgent.marketMonitorFlow({
      watchlist,
      alertThresholds,
      userId
    });

    res.json({
      success: true,
      insights,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Market monitoring error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to monitor markets'
    });
  }
}

// Streaming chat endpoint
export async function streamingChat(req: Request, res: Response) {
  try {
    const { message, context } = req.body;

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const stream = await aiAgent.streamingChat(message, context);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk, timestamp: new Date().toISOString() })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start streaming chat'
    });
  }
}

// Portfolio optimization endpoint
export async function optimizePortfolio(req: Request, res: Response) {
  try {
    const { currentPortfolio, riskTolerance, investmentGoals, timeHorizon } = req.body;

    const optimization = await aiAgent.portfolioOptimizationFlow({
      currentPortfolio,
      riskTolerance,
      investmentGoals,
      timeHorizon
    });

    res.json({
      success: true,
      optimization,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Portfolio optimization error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to optimize portfolio'
    });
  }
}

// Trading education endpoint
export async function getTradingEducation(req: Request, res: Response) {
  try {
    const { userLevel, topic, learningStyle } = req.body;

    const education = await runFlow(aiAgent.tradingEducationFlow, {
      userLevel,
      topic,
      learningStyle
    });

    res.json({
      success: true,
      education,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Trading education error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to generate education content'
    });
  }
}

// Multi-modal analysis endpoint
export async function multiModalAnalysis(req: Request, res: Response) {
  try {
    const { text, audio, marketData, charts } = req.body;

    const analysis = await aiAgent.multiModalAnalysis({
      text,
      audio,
      marketData,
      charts
    });

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Multi-modal analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform multi-modal analysis'
    });
  }
}

// Hybrid AI analysis (Genkit + OpenAI)
export async function hybridAnalysis(req: Request, res: Response) {
  try {
    const { query, marketData } = req.body;

    const analysis = await aiAgent.hybridAnalysis(query, marketData);

    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString(),
      sources: ['genkit', 'openai']
    });
  } catch (error) {
    console.error('Hybrid analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to perform hybrid analysis'
    });
  }
}

// Screen analysis endpoint for real-time monitoring
export async function analyzeScreen(req: Request, res: Response) {
  try {
    const { image, timestamp } = req.body;

    const analysis = await aiAgent.multiModalAnalysis({
      charts: [image],
      text: "Analyze this trading screen for chart patterns, trade opportunities, risk management, and trade plan compliance",
      marketData: {}
    });

    // Parse AI response to extract structured data
    const structuredAnalysis = {
      sentiment: extractSentiment(analysis),
      confidence: extractConfidence(analysis),
      riskLevel: extractRiskLevel(analysis),
      suggestions: extractSuggestions(analysis),
      tradePlanCompliance: extractTradePlanCompliance(analysis),
      alerts: extractAlerts(analysis)
    };

    res.json({
      success: true,
      data: structuredAnalysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Screen analysis error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to analyze screen'
    });
  }
}

// Voice command processing
export async function processVoiceCommand(req: Request, res: Response) {
  try {
    const audioFile = req.file;
    const context = JSON.parse(req.body.context || '{}');

    if (!audioFile) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    // Convert audio to text using OpenAI Whisper
    const openai = new (await import('openai')).default({ 
      apiKey: process.env.OPENAI_API_KEY 
    });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile as any,
      model: 'whisper-1'
    });

    const voiceText = transcription.text;

    // Process the voice command with AI
    const response = await aiAgent.hybridAnalysis(
      `Voice command: "${voiceText}". Context: ${JSON.stringify(context)}`,
      context.currentAnalysis || {}
    );

    res.json({
      success: true,
      transcription: voiceText,
      response,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Voice command error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to process voice command'
    });
  }
}

// Streaming chat endpoint
export async function streamingChatEndpoint(req: Request, res: Response) {
  try {
    const { message, context } = req.body;

    // Set up Server-Sent Events
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    });

    const stream = await aiAgent.streamingChat(message, context);

    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ chunk, timestamp: new Date().toISOString() })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Streaming chat error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to start streaming chat'
    });
  }
}

// Helper functions for parsing AI responses
function extractSentiment(analysis: string): 'bullish' | 'bearish' | 'neutral' {
  const lower = analysis.toLowerCase();
  if (lower.includes('bullish') || lower.includes('positive') || lower.includes('upward')) return 'bullish';
  if (lower.includes('bearish') || lower.includes('negative') || lower.includes('downward')) return 'bearish';
  return 'neutral';
}

function extractConfidence(analysis: string): number {
  const confidenceMatch = analysis.match(/confidence[:\s]*(\d+)%?/i);
  if (confidenceMatch) return parseInt(confidenceMatch[1]);
  
  // Estimate confidence based on language certainty
  const certainWords = ['certain', 'confident', 'strong', 'clear'];
  const uncertainWords = ['uncertain', 'unclear', 'weak', 'possibly'];
  
  let score = 50; // baseline
  certainWords.forEach(word => {
    if (analysis.toLowerCase().includes(word)) score += 15;
  });
  uncertainWords.forEach(word => {
    if (analysis.toLowerCase().includes(word)) score -= 15;
  });
  
  return Math.max(0, Math.min(100, score));
}

function extractRiskLevel(analysis: string): 'low' | 'medium' | 'high' {
  const lower = analysis.toLowerCase();
  if (lower.includes('high risk') || lower.includes('risky') || lower.includes('dangerous')) return 'high';
  if (lower.includes('low risk') || lower.includes('safe') || lower.includes('conservative')) return 'low';
  return 'medium';
}

function extractSuggestions(analysis: string): string[] {
  const suggestions: string[] = [];
  
  // Look for bullet points or numbered lists
  const bulletMatches = analysis.match(/[•\-\*]\s*([^\n]+)/g);
  if (bulletMatches) {
    suggestions.push(...bulletMatches.map(match => match.replace(/^[•\-\*]\s*/, '')));
  }
  
  // Look for numbered suggestions
  const numberedMatches = analysis.match(/\d+\.\s*([^\n]+)/g);
  if (numberedMatches) {
    suggestions.push(...numberedMatches.map(match => match.replace(/^\d+\.\s*/, '')));
  }
  
  // Extract recommendation sentences
  const recommendationMatches = analysis.match(/(?:recommend|suggest|consider|should)[^.!?]*[.!?]/gi);
  if (recommendationMatches) {
    suggestions.push(...recommendationMatches);
  }
  
  return suggestions.slice(0, 5); // Limit to 5 suggestions
}

function extractTradePlanCompliance(analysis: string): number {
  const complianceMatch = analysis.match(/(?:compliance|adherence|following)[:\s]*(\d+)%?/i);
  if (complianceMatch) return parseInt(complianceMatch[1]);
  
  // Estimate based on plan-related keywords
  const planWords = ['plan', 'strategy', 'rule', 'discipline'];
  const positiveWords = ['following', 'adhering', 'compliant', 'disciplined'];
  const negativeWords = ['deviating', 'breaking', 'ignoring', 'violating'];
  
  let score = 75; // baseline assumption of good compliance
  
  positiveWords.forEach(word => {
    if (analysis.toLowerCase().includes(word)) score += 10;
  });
  negativeWords.forEach(word => {
    if (analysis.toLowerCase().includes(word)) score -= 20;
  });
  
  return Math.max(0, Math.min(100, score));
}

function extractAlerts(analysis: string): string[] {
  const alerts: string[] = [];
  
  // Look for warning indicators
  const warningWords = ['warning', 'alert', 'caution', 'danger', 'risk', 'stop'];
  const sentences = analysis.split(/[.!?]+/);
  
  sentences.forEach(sentence => {
    warningWords.forEach(word => {
      if (sentence.toLowerCase().includes(word)) {
        alerts.push(sentence.trim());
      }
    });
  });
  
  return [...new Set(alerts)].slice(0, 3); // Remove duplicates and limit to 3
}

// AI agent status and health check
export async function getAgentStatus(req: Request, res: Response) {
  try {
    res.json({
      success: true,
      status: 'active',
      capabilities: [
        'screen-analysis',
        'voice-commands',
        'trading-analysis',
        'market-monitoring',
        'streaming-chat',
        'portfolio-optimization',
        'trading-education',
        'multi-modal-analysis',
        'hybrid-ai'
      ],
      models: {
        genkit: 'googleai/gemini-1.5-flash',
        openai: 'gpt-4o'
      },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Agent status error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get agent status'
    });
  }
}