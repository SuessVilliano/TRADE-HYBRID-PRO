// OpenAI Service
// This service handles integration with OpenAI API for AI-driven trading capabilities

/**
 * Prompt specifications for different types of AI analysis
 */
export const PROMPT_TEMPLATES = {
  MARKET_ANALYSIS: `
    You are an expert trading and financial market analyst. Analyze the following market data and provide insights:
    
    Symbol: {symbol}
    Current Price: {currentPrice}
    24h Change: {change24h} ({changePercent24h}%)
    24h High: {highPrice}
    24h Low: {lowPrice}
    Volume: {volume}
    
    Additional context:
    {additionalContext}
    
    Provide a detailed analysis including:
    1. Overall market sentiment (bullish, bearish, or neutral)
    2. Key support and resistance levels
    3. Notable technical patterns
    4. Trading recommendation (buy, sell, or hold)
    5. Risk assessment
    
    Be specific, concise, and data-driven in your analysis.
  `,
  
  TRADING_STRATEGY: `
    You are an advanced trading strategy advisor. Create a comprehensive trading strategy based on the following parameters:
    
    Symbol: {symbol}
    Trading Style: {tradingStyle} (day trading, swing trading, position trading, or scalping)
    Risk Tolerance: {riskTolerance} (low, medium, or high)
    Account Size: {accountSize}
    
    Current Market Conditions:
    {marketConditions}
    
    Provide a detailed trading strategy including:
    1. Entry criteria (specific price levels, technical indicators, or patterns)
    2. Exit criteria (take profit and stop loss levels)
    3. Position sizing recommendation
    4. Timeframe for the trade
    5. Risk management rules
    6. At least 3 specific technical indicators to watch
    7. Potential catalysts that could affect the trade
    
    Make the strategy specific, actionable, and tailored to the trader's style and risk profile.
  `,
  
  TRADING_ASSISTANT: `
    You are a helpful trading assistant. Answer the following question about trading or financial markets:
    
    Question: {query}
    
    Market Context:
    {marketContext}
    
    Provide a helpful, accurate response that addresses the specific question. Include relevant facts, data, or technical analysis where applicable. If the question is unclear or requires more information, specify what additional details would be helpful.
  `,
  
  RISK_ASSESSMENT: `
    You are a risk management specialist for trading. Assess the risk level of the following trade:
    
    Symbol: {symbol}
    Entry Price: {entryPrice}
    Stop Loss: {stopLoss}
    Take Profit: {takeProfit}
    Position Size: {positionSize}
    Account Size: {accountSize}
    
    Market Conditions:
    {marketConditions}
    
    Provide a comprehensive risk assessment including:
    1. Risk-to-reward ratio calculation
    2. Percentage of account at risk
    3. Probability assessment of the trade
    4. Maximum drawdown potential
    5. Alternative stop loss or position sizing recommendations if risk is excessive
    6. Overall risk rating (low, medium, high, or extreme)
    
    Be specific with numbers and percentages in your analysis.
  `,
  
  PATTERN_RECOGNITION: `
    You are a technical analysis pattern recognition expert. Analyze the following chart description and identify key patterns:
    
    Symbol: {symbol}
    Timeframe: {timeframe}
    
    Chart Description:
    {chartDescription}
    
    Identify and explain all technical patterns present in this chart. For each pattern, provide:
    1. Pattern name and classification (continuation, reversal, etc.)
    2. Key components of the pattern
    3. Typical pattern targets or projected moves
    4. Success rate or reliability of the pattern
    5. Recommended actions based on the pattern
    
    Be specific about price levels mentioned in the chart description.
  `,
  
  TRADING_SIGNALS: `
    You are an AI trading signal generator. Create precise trading signals based on the following parameters:
    
    Symbol: {symbol}
    Current Price: {currentPrice}
    Timeframe: {timeframe}
    
    Technical Context:
    {technicalContext}
    
    Fundamental Context:
    {fundamentalContext}
    
    Generate 3 potential trading signals with the following details for each:
    1. Signal Type (Buy, Sell, Strong Buy, Strong Sell)
    2. Entry Price Range (specific values)
    3. Stop Loss Level (specific value)
    4. Take Profit Levels (multiple specific values)
    5. Risk/Reward Ratio
    6. Key Indicators Supporting This Signal
    7. Confidence Level (Low, Medium, High)
    8. Timeframe for the Trade
    
    Make all signals specific, actionable, and based on the provided data.
  `
};

export interface OpenAIRequestParams {
  query?: string;
  symbol?: string;
  currentPrice?: number;
  change24h?: number;
  changePercent24h?: number;
  highPrice?: number;
  lowPrice?: number;
  volume?: number;
  additionalContext?: string;
  tradingStyle?: 'day' | 'swing' | 'position' | 'scalping';
  riskTolerance?: 'low' | 'medium' | 'high';
  accountSize?: number;
  marketConditions?: string;
  entryPrice?: number;
  stopLoss?: number;
  takeProfit?: number | number[];
  positionSize?: number;
  timeframe?: string;
  chartDescription?: string;
  technicalContext?: string;
  fundamentalContext?: string;
}

/**
 * Service for handling OpenAI API requests for trading insights and AI-driven analysis
 */
export class OpenAIService {
  private apiKey: string | null = null;
  private baseURL: string = 'https://api.openai.com/v1';
  private model: string = 'gpt-4o';
  private maxTokens: number = 2048;
  private temperature: number = 0.7;
  
  /**
   * Initialize the OpenAI service with an API key
   */
  public initialize(apiKey: string): void {
    this.apiKey = apiKey;
  }
  
  /**
   * Set the model to use for OpenAI requests
   */
  public setModel(model: string): void {
    this.model = model;
  }
  
  /**
   * Set the max tokens to use for OpenAI requests
   */
  public setMaxTokens(maxTokens: number): void {
    this.maxTokens = maxTokens;
  }
  
  /**
   * Set the temperature to use for OpenAI requests
   */
  public setTemperature(temperature: number): void {
    this.temperature = temperature;
  }
  
  /**
   * Generate a market analysis using OpenAI
   */
  public async generateMarketAnalysis(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.MARKET_ANALYSIS, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating market analysis:', error);
      return this.getFallbackResponse('market_analysis');
    }
  }
  
  /**
   * Generate a trading strategy using OpenAI
   */
  public async generateTradingStrategy(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.TRADING_STRATEGY, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating trading strategy:', error);
      return this.getFallbackResponse('trading_strategy');
    }
  }
  
  /**
   * Get an answer from the AI trading assistant
   */
  public async getTradingAssistantResponse(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.TRADING_ASSISTANT, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error getting trading assistant response:', error);
      return this.getFallbackResponse('trading_assistant');
    }
  }
  
  /**
   * Generate a risk assessment using OpenAI
   */
  public async generateRiskAssessment(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.RISK_ASSESSMENT, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating risk assessment:', error);
      return this.getFallbackResponse('risk_assessment');
    }
  }
  
  /**
   * Generate pattern recognition analysis using OpenAI
   */
  public async generatePatternRecognition(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.PATTERN_RECOGNITION, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating pattern recognition:', error);
      return this.getFallbackResponse('pattern_recognition');
    }
  }
  
  /**
   * Generate trading signals using OpenAI
   */
  public async generateTradingSignals(params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(PROMPT_TEMPLATES.TRADING_SIGNALS, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating trading signals:', error);
      return this.getFallbackResponse('trading_signals');
    }
  }
  
  /**
   * Generate a custom response using OpenAI
   */
  public async generateCustomResponse(customPrompt: string, params: OpenAIRequestParams): Promise<string> {
    try {
      const prompt = this.formatPrompt(customPrompt, params);
      return await this.generateResponse(prompt);
    } catch (error) {
      console.error('Error generating custom response:', error);
      return this.getFallbackResponse('custom');
    }
  }
  
  /**
   * Format a prompt template with the provided parameters
   */
  private formatPrompt(template: string, params: OpenAIRequestParams): string {
    let formattedPrompt = template;
    
    // Replace all placeholders with their values
    Object.entries(params).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      
      if (formattedPrompt.includes(placeholder)) {
        // Handle arrays (like take profit levels)
        if (Array.isArray(value)) {
          formattedPrompt = formattedPrompt.replace(placeholder, value.join(', '));
        } else if (value !== undefined) {
          formattedPrompt = formattedPrompt.replace(placeholder, String(value));
        }
      }
    });
    
    // Clean up any remaining placeholders
    formattedPrompt = formattedPrompt.replace(/{[a-zA-Z0-9_]+}/g, 'N/A');
    
    return formattedPrompt;
  }
  
  /**
   * Generate a response from the OpenAI API
   */
  private async generateResponse(prompt: string): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OpenAI API key not set. Please call initialize() with a valid API key.');
    }
    
    try {
      const response = await this.callOpenAI(prompt);
      return response;
    } catch (error) {
      console.error('Error generating OpenAI response:', error);
      throw error;
    }
  }
  
  /**
   * Make the actual API call to OpenAI
   */
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      // Set up request with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30-second timeout
      
      const response = await fetch(`${this.baseURL}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            {
              role: 'system',
              content: 'You are an expert trading and financial market AI assistant, providing accurate and insightful analysis based on market data. Your responses should be specific, actionable, and based on sound trading principles and technical analysis.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: this.maxTokens,
          temperature: this.temperature
        }),
        signal: controller.signal
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`OpenAI API error: ${response.status} - ${JSON.stringify(errorData)}`);
      }
      
      const data = await response.json();
      return data.choices[0].message.content.trim();
    } catch (error: unknown) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('OpenAI API request timed out after 30 seconds');
      }
      throw error;
    }
  }
  
  /**
   * Get a fallback response when the OpenAI API call fails
   */
  private getFallbackResponse(type: string): string {
    switch (type) {
      case 'market_analysis':
        return 'Unable to generate market analysis at this time. Please try again later or check your market data inputs.';
      case 'trading_strategy':
        return 'Unable to generate trading strategy at this time. Please try again later or refine your strategy parameters.';
      case 'trading_assistant':
        return 'I apologize, but I\'m unable to answer your question at the moment. Please try again later or rephrase your question.';
      case 'risk_assessment':
        return 'Unable to assess trade risk at this time. Please verify your trade parameters and try again later.';
      case 'pattern_recognition':
        return 'Unable to analyze chart patterns at this time. Please provide more detailed chart information and try again later.';
      case 'trading_signals':
        return 'Unable to generate trading signals at this time. Please check your market data and try again later.';
      case 'custom':
      default:
        return 'Unable to generate a response at this time. Please try again later.';
    }
  }
  
  /**
   * Check if the OpenAI service is initialized with an API key
   */
  public isInitialized(): boolean {
    return !!this.apiKey;
  }
}

// Create a singleton instance
export const openAIService = new OpenAIService();