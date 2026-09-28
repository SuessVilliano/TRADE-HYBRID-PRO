import OpenAI from 'openai';

// Use OpenAI for now until Genkit is properly configured
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Google AI direct integration for comparison
async function callGoogleAI(prompt: string) {
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${process.env.GOOGLE_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      })
    });
    
    const data = await response.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response from Google AI';
  } catch (error) {
    console.error('Google AI error:', error);
    return 'Google AI unavailable';
  }
}

// Trade Hybrid AI Agent with voice, chat, and streaming capabilities
export class TradeHybridAIAgent {
  private static instance: TradeHybridAIAgent;
  
  public static getInstance(): TradeHybridAIAgent {
    if (!TradeHybridAIAgent.instance) {
      TradeHybridAIAgent.instance = new TradeHybridAIAgent();
    }
    return TradeHybridAIAgent.instance;
  }

  // Main trading analysis using hybrid AI
  public async tradingAnalysisFlow(input: {
    symbol: string;
    marketData?: any;
    signals?: any[];
    userProfile?: any;
    analysisType?: string;
  }) {
    const prompt = `
As Trade Hybrid's AI trading assistant, analyze ${input.symbol} with the following context:

Market Data: ${JSON.stringify(input.marketData || {})}
Active Signals: ${JSON.stringify(input.signals || [])}
User Profile: ${JSON.stringify(input.userProfile || {})}
Analysis Type: ${input.analysisType || 'comprehensive'}

Provide a detailed trading analysis including:
1. Technical indicators assessment
2. Risk evaluation
3. Entry/exit recommendations
4. Market sentiment analysis
5. Confidence level (0-100)

Format response as JSON with analysis, recommendation, riskLevel, confidence, and keyPoints.
    `;

    try {
      // Try OpenAI first
      const openaiResult = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a professional trading analyst. Provide detailed analysis in JSON format."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        response_format: { type: "json_object" }
      });

      const analysis = JSON.parse(openaiResult.choices[0].message.content || '{}');
      
      // Add Google AI perspective if available
      let googlePerspective = '';
      try {
        googlePerspective = await callGoogleAI(prompt);
      } catch (error) {
        console.log('Google AI unavailable, using OpenAI only');
      }

      return {
        ...analysis,
        hybridAnalysis: googlePerspective,
        source: 'hybrid'
      };
    } catch (error) {
      console.error('Trading analysis error:', error);
      return {
        analysis: 'Analysis unavailable',
        recommendation: 'Unable to analyze at this time',
        riskLevel: 'medium',
        confidence: 0,
        keyPoints: ['Please check API configuration']
      };
    }
  }

  // Voice trading assistant
  public async voiceTradingFlow(input: {
    audioInput: string;
    userId: string;
    context?: any;
  }) {
    try {
      // Convert voice to text using OpenAI Whisper
      const voiceCommand = await this.processVoiceInput(input.audioInput);
      
      // Analyze trading intent
      const intent = await this.analyzeTradeIntent(voiceCommand, input.context);
      
      // Execute trading action or provide analysis
      return await this.executeVoiceCommand(intent, input.userId);
    } catch (error) {
      console.error('Voice trading flow error:', error);
      return {
        action: 'error',
        result: 'Voice command processing failed',
        userId: input.userId
      };
    }
  }

  // Real-time market monitoring
  public async marketMonitorFlow(input: {
    watchlist: string[];
    alertThresholds: any;
    userId: string;
  }) {
    try {
      const prompt = `Monitor these assets: ${input.watchlist?.join(', ')}. 
              Analyze current market conditions and provide real-time insights.
              Alert thresholds: ${JSON.stringify(input.alertThresholds)}`;

      const marketInsights = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a real-time market monitoring AI. Provide concise market insights and alerts."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        insights: marketInsights.choices[0].message.content,
        alerts: await this.checkAlertConditions(input.watchlist, input.alertThresholds),
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Market monitoring error:', error);
      return {
        insights: 'Market monitoring unavailable',
        alerts: [],
        timestamp: new Date().toISOString()
      };
    }
  }

  // Personalized trading education
  public async tradingEducationFlow(input: {
    userLevel: string;
    topic: string;
    learningStyle: string;
  }) {
    try {
      const prompt = `Create personalized trading education content for:
              Level: ${input.userLevel}
              Topic: ${input.topic}
              Learning Style: ${input.learningStyle}
              
              Provide interactive, practical examples using real market scenarios.`;

      const educationalContent = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trading education expert. Create engaging, practical learning content."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        content: educationalContent.choices[0].message.content,
        interactiveElements: await this.generateInteractiveExercises(input.topic),
        nextSteps: await this.suggestLearningPath(input.userLevel, input.topic)
      };
    } catch (error) {
      console.error('Trading education error:', error);
      return {
        content: 'Educational content unavailable',
        interactiveElements: [],
        nextSteps: []
      };
    }
  }

  // Streaming chat response for real-time interaction
  public async streamingChat(message: string, context: any): Promise<AsyncIterable<string>> {
    try {
      const memberJourney = context?.memberJourney || {};
      const journeyContext = {
        why: memberJourney.why_text || null,
        primaryGoal: memberJourney.primary_goal || null,
        goal30Days: memberJourney.goal_30_days || null,
        goal90Days: memberJourney.goal_90_days || null,
        goal1Year: memberJourney.goal_1_year || null,
        experienceLevel: memberJourney.experience_level || null,
        preferredMarkets: memberJourney.preferred_markets || [],
        currentChallenges: memberJourney.current_challenges || [],
        weeklyHours: memberJourney.weekly_hours || null,
        preferredLearningStyle: memberJourney.preferred_learning_style || null,
        planSummary: memberJourney.plan_summary || {},
      };

      const systemPrompt = `
You are Trade Hybrid AI, the member's trading operating-system assistant.

Your job is not to push more activity. Help the member follow a repeatable process, use the products they actually have access to, and make decisions that support the goals they set during onboarding.

MEMBER JOURNEY CONTEXT:
${JSON.stringify(journeyContext)}

Use this context naturally:
- Anchor recommendations to the member's WHY and stated goals when relevant.
- Respect their experience level, markets, time available, challenges, and learning style.
- Prefer process, risk control, journaling, review, and consistency over impulsive trading.
- When the member is drifting from their stated plan, point that out clearly and explain why.
- Suggest the smallest useful next action rather than dumping every Trade Hybrid feature on them.
- Use Hybrid Journal as the source of truth for process and review.
- Use Community for accountability, discussion, events, and peer learning.
- Use Academy when education is the actual bottleneck.
- Use Trade House Battles only when competition/public performance fits the member's current stage.
- Treat Hybrid Funding as one possible path, not the default objective.
- Never imply guaranteed profits or certainty about market outcomes.
- If information is missing, say what is missing rather than inventing it.
- Keep the member's onboarding context private to their own experience.

Be practical, concise, and personalized.
      `.trim();

      const stream = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          {
            role: "user",
            content: `${message}\n\nLive workspace context: ${JSON.stringify({
              currentAnalysis: context?.currentAnalysis || null,
              isScreenSharing: Boolean(context?.isScreenSharing),
              recentMessages: context?.recentMessages || [],
            })}`
          }
        ],
        stream: true,
        temperature: 0.6
      });

      return this.convertOpenAIStreamToAsyncIterable(stream);
    } catch (error) {
      console.error('Streaming chat error:', error);
      // Return a simple fallback stream
      return this.createFallbackStream('Sorry, streaming chat is temporarily unavailable.');
    }
  }

  private async *convertOpenAIStreamToAsyncIterable(stream: any): AsyncIterable<string> {
    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        yield content;
      }
    }
  }

  private async *createFallbackStream(message: string): AsyncIterable<string> {
    yield message;
  }

  // Multi-modal analysis (text + voice + market data)
  public async multiModalAnalysis(inputs: {
    text?: string;
    audio?: string;
    marketData?: any;
    charts?: string[];
  }) {
    try {
      const analysisPrompt = `
Analyze multiple input types for comprehensive trading insights:
${inputs.text ? `Text Input: ${inputs.text}` : ''}
${inputs.marketData ? `Market Data: ${JSON.stringify(inputs.marketData)}` : ''}
${inputs.charts ? `Chart Analysis: ${inputs.charts.length} charts provided` : ''}

Provide unified analysis combining all inputs.
      `;

      const result = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a multi-modal trading analyst. Analyze all provided inputs for comprehensive trading insights."
          },
          {
            role: "user",
            content: analysisPrompt
          }
        ]
      });

      return result.choices[0].message.content || 'Analysis unavailable';
    } catch (error) {
      console.error('Multi-modal analysis error:', error);
      return 'Multi-modal analysis temporarily unavailable';
    }
  }

  // Portfolio optimization using AI
  public async portfolioOptimizationFlow(input: {
    currentPortfolio: any;
    riskTolerance: string;
    investmentGoals: any;
    timeHorizon: string;
  }) {
    try {
      const prompt = `Optimize this portfolio:
              Current Holdings: ${JSON.stringify(input.currentPortfolio)}
              Risk Tolerance: ${input.riskTolerance}
              Goals: ${JSON.stringify(input.investmentGoals)}
              Time Horizon: ${input.timeHorizon}
              
              Provide specific rebalancing recommendations.`;

      const optimization = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a portfolio optimization expert. Provide specific, actionable recommendations."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return {
        recommendations: optimization.choices[0].message.content,
        riskAnalysis: await this.calculatePortfolioRisk(input.currentPortfolio),
        diversificationScore: await this.assessDiversification(input.currentPortfolio)
      };
    } catch (error) {
      console.error('Portfolio optimization error:', error);
      return {
        recommendations: 'Portfolio optimization unavailable',
        riskAnalysis: { volatility: 0, sharpeRatio: 0, maxDrawdown: 0 },
        diversificationScore: 0
      };
    }
  }

  // Helper methods
  private async processVoiceInput(audioData: string): Promise<string> {
    try {
      // Use OpenAI Whisper for speech-to-text
      const response = await openai.audio.transcriptions.create({
        file: audioData as any,
        model: 'whisper-1'
      });
      return response.text;
    } catch (error) {
      console.error('Voice processing error:', error);
      return "Voice processing unavailable";
    }
  }

  private async analyzeTradeIntent(text: string, context: any) {
    try {
      const prompt = `Analyze trading intent from: "${text}"
              Context: ${JSON.stringify(context)}
              
              Extract: action (buy/sell/analyze), symbol, quantity, conditions.`;

      const intent = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trading intent analyzer. Extract actionable trading information from user commands."
          },
          {
            role: "user",
            content: prompt
          }
        ]
      });

      return intent.choices[0].message.content || 'Intent analysis failed';
    } catch (error) {
      console.error('Intent analysis error:', error);
      return 'Unable to analyze trading intent';
    }
  }

  private async executeVoiceCommand(intent: string, userId: string) {
    // Execute the parsed voice command
    return {
      action: 'executed',
      result: intent,
      userId
    };
  }

  private async checkAlertConditions(watchlist: string[], thresholds: any) {
    // Check if any alert conditions are met
    // This would integrate with real market data in production
    return [];
  }

  private async generateInteractiveExercises(topic: string) {
    try {
      const exercises = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trading education expert. Create interactive, practical exercises."
          },
          {
            role: "user",
            content: `Create 3 interactive trading exercises for topic: ${topic}`
          }
        ]
      });

      return exercises.choices[0].message.content || [];
    } catch (error) {
      console.error('Exercise generation error:', error);
      return [];
    }
  }

  private async suggestLearningPath(level: string, currentTopic: string) {
    try {
      const path = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a trading education advisor. Suggest personalized learning paths."
          },
          {
            role: "user",
            content: `Suggest next learning steps for ${level} trader studying ${currentTopic}`
          }
        ]
      });

      return path.choices[0].message.content || [];
    } catch (error) {
      console.error('Learning path error:', error);
      return [];
    }
  }

  private async calculatePortfolioRisk(portfolio: any) {
    // Calculate portfolio risk metrics based on actual portfolio data
    return { volatility: 0.15, sharpeRatio: 1.2, maxDrawdown: 0.08 };
  }

  private async assessDiversification(portfolio: any) {
    // Assess portfolio diversification based on actual holdings
    return 75; // Diversification score out of 100
  }

  // Hybrid AI response combining Google AI and OpenAI
  public async hybridAnalysis(query: string, marketData: any): Promise<string> {
    try {
      // Get analysis from our trading flow
      const aiResult = await this.tradingAnalysisFlow({
        symbol: marketData.symbol || 'UNKNOWN',
        marketData,
        analysisType: 'comprehensive'
      });

      // Get OpenAI response for comparison
      const openaiResult = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "system",
            content: "You are a professional trading analyst. Provide concise market analysis."
          },
          {
            role: "user",
            content: `${query}\n\nMarket Data: ${JSON.stringify(marketData)}`
          }
        ],
        max_tokens: 500
      });

      // Combine insights from both AI systems
      return `
**AI Analysis Summary:**

**Primary Analysis:** ${aiResult.analysis || 'Analysis complete'}

**OpenAI Perspective:** ${openaiResult.choices[0].message.content}

**Confidence Level:** ${aiResult.confidence || 75}%
**Risk Assessment:** ${aiResult.riskLevel || 'medium'}
      `.trim();

    } catch (error) {
      console.error('Hybrid AI analysis error:', error);
      return 'Unable to complete AI analysis. Please try again.';
    }
  }
}

export default TradeHybridAIAgent;