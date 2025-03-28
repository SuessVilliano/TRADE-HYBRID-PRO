import { check_secrets } from '../utils';
import { apiKeyManager } from './api-key-manager';

interface OpenAISentimentResponse {
  sentiment: {
    score: number; // -1 to 1
    label: 'bearish' | 'neutral' | 'bullish';
    confidence: number; // 0-1
  };
  analysis: string;
}

export class OpenAIService {
  private apiKey: string = '';
  private initialized = false;
  
  constructor() {}
  
  async initialize(): Promise<boolean> {
    if (this.initialized) {
      return true;
    }
    
    try {
      // First try to get the API key from the API key manager
      await apiKeyManager.initialize();
      const apiKeyConfig = await apiKeyManager.getApiKey('openai');
      
      if (apiKeyConfig && apiKeyConfig.isValid) {
        this.apiKey = apiKeyConfig.key;
        console.log('Using OpenAI key from API Key Manager');
      } else {
        // Fall back to checking environment variables directly
        const hasKey = await check_secrets(['OPENAI_API_KEY']);
        if (!hasKey) {
          console.warn('OpenAI API key not found');
          return false;
        }
        
        // Get from environment
        this.apiKey = `Bearer ${process.env.OPENAI_API_KEY || ''}`;
        
        // Update the API key manager with this key
        await apiKeyManager.setApiKey('openai', {
          key: this.apiKey,
          isValid: true,
          tier: 'basic'
        });
      }
      
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('Failed to initialize OpenAI service:', error);
      return false;
    }
  }
  
  private async ensureInitialized(): Promise<boolean> {
    if (!this.initialized) {
      return await this.initialize();
    }
    return true;
  }

  /**
   * Analyze market sentiment using OpenAI
   * @param text The text to analyze
   */
  async analyzeMarketSentiment(text: string): Promise<OpenAISentimentResponse | null> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      console.warn('OpenAI service not initialized');
      return null;
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a financial sentiment analysis expert. Analyze the following text and determine if the sentiment is bullish (positive), 
              bearish (negative), or neutral about a financial asset or market. Respond with a JSON object only containing:
              {
                "sentiment": {
                  "score": <number between -1 and 1, where -1 is very bearish, 0 is neutral, and 1 is very bullish>,
                  "label": <"bearish", "neutral", or "bullish">,
                  "confidence": <number between 0 and 1 indicating confidence level>
                },
                "analysis": <brief 1-2 sentence explanation>
              }`
            },
            {
              role: 'user',
              content: text
            }
          ],
          temperature: 0.3,
          max_tokens: 200
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract JSON from completion
      const content = data.choices[0].message.content;
      try {
        // Parse the JSON response
        return JSON.parse(content);
      } catch (e) {
        console.error('Failed to parse OpenAI sentiment response:', e);
        // Try extracting JSON using regex as fallback
        // Match JSON object with a more robust regex that can handle multiline content
        const jsonRegex = /({[\s\S]*?})/;
        const jsonMatch = content.match(jsonRegex);
        if (jsonMatch) {
          return JSON.parse(jsonMatch[0]);
        }
        throw e;
      }
    } catch (error) {
      console.error('Error analyzing sentiment with OpenAI:', error);
      return null;
    }
  }
  
  /**
   * Generate a market prediction for a symbol
   */
  async generateMarketPrediction(
    symbol: string, 
    data: {
      news: Array<{ title: string, sentiment: string }>,
      overallSentiment: 'bearish' | 'neutral' | 'bullish'
    }
  ): Promise<string> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      return `Based on recent news and analysis, ${symbol} is showing ${data.overallSentiment} signals. This suggests potential ${data.overallSentiment === 'bullish' ? 'upward' : data.overallSentiment === 'bearish' ? 'downward' : 'sideways'} movement, though market conditions can change rapidly.`;
    }
    
    try {
      // Format news data for the prompt
      const newsHeadlines = data.news
        .map(item => `- "${item.title}" (${item.sentiment})`)
        .join('\n');
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a financial analyst providing a brief market prediction. 
              Based on recent news headlines and sentiment analysis, provide a concise prediction 
              for the symbol. Keep your response to 2-3 sentences, be specific but cautious, and 
              include appropriate market terminology. Never use words like "I think" or "I believe" - 
              present as factual analysis.`
            },
            {
              role: 'user',
              content: `Symbol: ${symbol}
              Overall sentiment: ${data.overallSentiment}
              
              Recent news headlines and their sentiment:
              ${newsHeadlines}
              
              Provide a concise market prediction based on this data.`
            }
          ],
          temperature: 0.4,
          max_tokens: 150
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      return responseData.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error generating market prediction with OpenAI:', error);
      return `Market analysis for ${symbol} indicates ${data.overallSentiment} signals based on recent news and technical indicators. Investors should perform their own research before making trading decisions.`;
    }
  }
  
  /**
   * Generate trading tips based on market data
   */
  async generateTradingTips(
    symbol: string,
    marketData: any
  ): Promise<string[]> {
    const initialized = await this.ensureInitialized();
    if (!initialized) {
      return [
        `Consider setting stop losses when trading ${symbol} to manage risk.`,
        `Always monitor volume changes for ${symbol} as they often precede price movements.`,
        `Use technical indicators alongside news sentiment for more accurate ${symbol} analysis.`
      ];
    }
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.apiKey
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            {
              role: 'system',
              content: `You are a professional trading advisor providing specific, actionable tips for trading a particular financial asset.
              Provide 3-5 concise, practical trading tips based on the current market data, news, and technical analysis.
              Each tip should be specific to the asset and current market conditions.
              Tips should include entry/exit strategies, risk management advice, technical signals to watch, or fundamental factors to consider.
              Format each tip as a separate item in a JSON array of strings.`
            },
            {
              role: 'user',
              content: `Symbol: ${symbol}
              Current market data: ${JSON.stringify(marketData, null, 2)}
              
              Provide 3-5 specific, actionable trading tips for this asset in the current market conditions.
              Return ONLY a JSON array of strings, with each string being a separate tip.`
            }
          ],
          temperature: 0.4,
          max_tokens: 300
        })
      });
      
      if (!response.ok) {
        throw new Error(`OpenAI API returned ${response.status}: ${response.statusText}`);
      }
      
      const responseData = await response.json();
      const content = responseData.choices[0].message.content.trim();
      
      try {
        // Try to parse the content as JSON
        const tips = JSON.parse(content);
        return Array.isArray(tips) ? tips : [content];
      } catch (error) {
        // If it's not valid JSON, try to extract using regex
        const matches = content.match(/\[([^\]]+)\]/);
        if (matches && matches[1]) {
          const items = matches[1].split('","').map((item: string) => 
            item.replace(/^"/, '').replace(/"$/, '').replace(/\\"/g, '"')
          );
          return items;
        }
        
        // Fall back to returning the entire content as a single tip
        return [content];
      }
    } catch (error) {
      console.error('Error generating trading tips with OpenAI:', error);
      return [
        `Watch for volume increases in ${symbol} as potential entry signals.`,
        `Consider technical indicators like RSI and MACD when trading ${symbol}.`,
        `Use appropriate position sizing based on your risk tolerance when trading ${symbol}.`
      ];
    }
  }
}

// Export singleton instance
export const openAIService = new OpenAIService();