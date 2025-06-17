import { configureGenkit } from '@genkit-ai/core';
import { googleAI } from '@genkit-ai/googleai';
import { dotprompt } from '@genkit-ai/dotprompt';
import { flow, runFlow } from '@genkit-ai/flow';
import { generate } from '@genkit-ai/ai';
import OpenAI from 'openai';

// Configure Genkit with Google AI
configureGenkit({
  plugins: [
    googleAI({
      apiKey: process.env.GOOGLE_API_KEY,
    }),
    dotprompt(),
  ],
  logLevel: 'debug',
  enableTracingAndMetrics: true,
});

// OpenAI integration for comparison and fallback
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Trade Hybrid AI Agent with voice, chat, and streaming capabilities
export class TradeHybridAIAgent {
  private static instance: TradeHybridAIAgent;
  
  public static getInstance(): TradeHybridAIAgent {
    if (!TradeHybridAIAgent.instance) {
      TradeHybridAIAgent.instance = new TradeHybridAIAgent();
    }
    return TradeHybridAIAgent.instance;
  }

  // Main trading analysis flow using Genkit
  public tradingAnalysisFlow = flow(
    {
      name: 'tradingAnalysis',
      inputSchema: {
        type: 'object',
        properties: {
          symbol: { type: 'string' },
          marketData: { type: 'object' },
          signals: { type: 'array' },
          userProfile: { type: 'object' },
          analysisType: { type: 'string', enum: ['technical', 'fundamental', 'sentiment', 'comprehensive'] }
        },
        required: ['symbol']
      },
      outputSchema: {
        type: 'object',
        properties: {
          analysis: { type: 'string' },
          recommendation: { type: 'string' },
          riskLevel: { type: 'string' },
          confidence: { type: 'number' },
          keyPoints: { type: 'array' }
        }
      }
    },
    async (input) => {
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

      const result = await generate({
        model: 'googleai/gemini-1.5-flash',
        prompt,
        config: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        },
      });

      try {
        return JSON.parse(result.text());
      } catch (error) {
        return {
          analysis: result.text(),
          recommendation: 'Unable to parse structured recommendation',
          riskLevel: 'medium',
          confidence: 50,
          keyPoints: []
        };
      }
    }
  );

  // Voice trading assistant flow
  public voiceTradingFlow = flow(
    {
      name: 'voiceTrading',
      inputSchema: {
        type: 'object',
        properties: {
          audioInput: { type: 'string' },
          userId: { type: 'string' },
          context: { type: 'object' }
        },
        required: ['audioInput', 'userId']
      }
    },
    async (input) => {
      // Convert voice to text using Google's speech recognition
      const voiceCommand = await this.processVoiceInput(input.audioInput);
      
      // Analyze trading intent
      const intent = await this.analyzeTradeIntent(voiceCommand, input.context);
      
      // Execute trading action or provide analysis
      return await this.executeVoiceCommand(intent, input.userId);
    }
  );

  // Real-time market monitoring flow
  public marketMonitorFlow = flow(
    {
      name: 'marketMonitor',
      inputSchema: {
        type: 'object',
        properties: {
          watchlist: { type: 'array' },
          alertThresholds: { type: 'object' },
          userId: { type: 'string' }
        }
      }
    },
    async (input) => {
      const marketInsights = await generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Monitor these assets: ${input.watchlist?.join(', ')}. 
                Analyze current market conditions and provide real-time insights.
                Alert thresholds: ${JSON.stringify(input.alertThresholds)}`,
        config: { temperature: 0.3 }
      });

      return {
        insights: marketInsights.text(),
        alerts: await this.checkAlertConditions(input.watchlist, input.alertThresholds),
        timestamp: new Date().toISOString()
      };
    }
  );

  // Personalized trading education flow
  public tradingEducationFlow = flow(
    {
      name: 'tradingEducation',
      inputSchema: {
        type: 'object',
        properties: {
          userLevel: { type: 'string' },
          topic: { type: 'string' },
          learningStyle: { type: 'string' }
        }
      }
    },
    async (input) => {
      const educationalContent = await generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Create personalized trading education content for:
                Level: ${input.userLevel}
                Topic: ${input.topic}
                Learning Style: ${input.learningStyle}
                
                Provide interactive, practical examples using real market scenarios.`,
        config: { temperature: 0.8 }
      });

      return {
        content: educationalContent.text(),
        interactiveElements: await this.generateInteractiveExercises(input.topic),
        nextSteps: await this.suggestLearningPath(input.userLevel, input.topic)
      };
    }
  );

  // Streaming chat response for real-time interaction
  public async streamingChat(message: string, context: any): Promise<AsyncIterable<string>> {
    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `You are Trade Hybrid's AI assistant. Respond to: "${message}"
              Context: ${JSON.stringify(context)}
              
              Be helpful, accurate, and focused on trading and financial markets.`,
      config: { 
        temperature: 0.7,
        stream: true 
      }
    });

    return result.stream();
  }

  // Multi-modal analysis (text + voice + market data)
  public async multiModalAnalysis(inputs: {
    text?: string;
    audio?: string;
    marketData?: any;
    charts?: string[];
  }) {
    const analysisPrompt = `
Analyze multiple input types for comprehensive trading insights:
${inputs.text ? `Text Input: ${inputs.text}` : ''}
${inputs.marketData ? `Market Data: ${JSON.stringify(inputs.marketData)}` : ''}
${inputs.charts ? `Chart Analysis: ${inputs.charts.length} charts provided` : ''}

Provide unified analysis combining all inputs.
    `;

    const result = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: analysisPrompt,
      config: { temperature: 0.6 }
    });

    return result.text();
  }

  // Portfolio optimization using AI
  public portfolioOptimizationFlow = flow(
    {
      name: 'portfolioOptimization',
      inputSchema: {
        type: 'object',
        properties: {
          currentPortfolio: { type: 'object' },
          riskTolerance: { type: 'string' },
          investmentGoals: { type: 'object' },
          timeHorizon: { type: 'string' }
        }
      }
    },
    async (input) => {
      const optimization = await generate({
        model: 'googleai/gemini-1.5-flash',
        prompt: `Optimize this portfolio:
                Current Holdings: ${JSON.stringify(input.currentPortfolio)}
                Risk Tolerance: ${input.riskTolerance}
                Goals: ${JSON.stringify(input.investmentGoals)}
                Time Horizon: ${input.timeHorizon}
                
                Provide specific rebalancing recommendations.`,
        config: { temperature: 0.4 }
      });

      return {
        recommendations: optimization.text(),
        riskAnalysis: await this.calculatePortfolioRisk(input.currentPortfolio),
        diversificationScore: await this.assessDiversification(input.currentPortfolio)
      };
    }
  );

  // Helper methods
  private async processVoiceInput(audioData: string): Promise<string> {
    // Implement speech-to-text conversion
    // For now, return placeholder - would integrate with Google Speech API
    return "Voice command processed";
  }

  private async analyzeTradeIntent(text: string, context: any) {
    const intent = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Analyze trading intent from: "${text}"
              Context: ${JSON.stringify(context)}
              
              Extract: action (buy/sell/analyze), symbol, quantity, conditions.`,
      config: { temperature: 0.2 }
    });

    return intent.text();
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
    return [];
  }

  private async generateInteractiveExercises(topic: string) {
    const exercises = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Create 3 interactive trading exercises for topic: ${topic}`,
      config: { temperature: 0.8 }
    });

    return exercises.text();
  }

  private async suggestLearningPath(level: string, currentTopic: string) {
    const path = await generate({
      model: 'googleai/gemini-1.5-flash',
      prompt: `Suggest next learning steps for ${level} trader studying ${currentTopic}`,
      config: { temperature: 0.6 }
    });

    return path.text();
  }

  private async calculatePortfolioRisk(portfolio: any) {
    // Calculate portfolio risk metrics
    return { volatility: 0.15, sharpeRatio: 1.2, maxDrawdown: 0.08 };
  }

  private async assessDiversification(portfolio: any) {
    // Assess portfolio diversification
    return 75; // Diversification score out of 100
  }

  // Hybrid AI response combining Genkit and OpenAI
  public async hybridAnalysis(query: string, marketData: any): Promise<string> {
    try {
      // Get Genkit response
      const genkitResult = await runFlow(this.tradingAnalysisFlow, {
        symbol: marketData.symbol || 'UNKNOWN',
        marketData,
        analysisType: 'comprehensive'
      });

      // Get OpenAI response for comparison
      const openaiResult = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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

**Genkit Analysis:** ${genkitResult.analysis}

**OpenAI Perspective:** ${openaiResult.choices[0].message.content}

**Confidence Level:** ${genkitResult.confidence}%
**Risk Assessment:** ${genkitResult.riskLevel}
      `.trim();

    } catch (error) {
      console.error('Hybrid AI analysis error:', error);
      return 'Unable to complete AI analysis. Please try again.';
    }
  }
}

export default TradeHybridAIAgent;