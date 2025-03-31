import axios from 'axios';
import { TradeSignal } from './google-sheets-service';
import { TradeAnalysisResult } from './signals-analyzer-service';

// Interface for OpenAI API request
interface OpenAIRequest {
  model: string;
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string | Array<{
      type: 'text' | 'image_url';
      text?: string;
      image_url?: {
        url: string;
      };
    }>;
  }>;
  max_tokens?: number;
  temperature?: number;
}

// Interface for OpenAI API response
interface OpenAIResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class OpenAIService {
  private readonly API_URL = 'https://api.openai.com/v1/chat/completions';
  
  // Models
  private readonly TEXT_MODEL = 'gpt-4-turbo-preview'; // or 'gpt-3.5-turbo' for lower cost
  private readonly VISION_MODEL = 'gpt-4-vision-preview'; // Model that supports image analysis
  
  // Method to analyze trade signals
  async analyzeSignals(signals: TradeSignal[]): Promise<{ [signalId: string]: string }> {
    if (!signals || signals.length === 0) {
      return {};
    }
    
    try {
      // Prepare context for the analysis
      const context = `
You are an expert crypto and forex trader analyzing trade signals. 
Review these ${signals.length} trade signals and provide a brief analysis for each one.
Focus on potential success factors, risk assessment, and market context.
Keep each analysis concise (2-3 sentences per signal).
`;
      
      // Format signals data for the API
      const signalsData = signals.map(signal => {
        return `
Signal ID: ${signal.id}
Asset: ${signal.asset}
Direction: ${signal.direction}
Entry Price: ${signal.entryPrice}
Stop Loss: ${signal.stopLoss}
Take Profit 1: ${signal.takeProfit1}
Take Profit 2: ${signal.takeProfit2 || 'N/A'}
Take Profit 3: ${signal.takeProfit3 || 'N/A'}
Market Type: ${signal.marketType}
Status: ${signal.status}
`;
      }).join('\n---\n');
      
      // Prepare the request
      const request: OpenAIRequest = {
        model: this.TEXT_MODEL,
        messages: [
          {
            role: 'system',
            content: context
          },
          {
            role: 'user',
            content: `Here are the signals to analyze:\n\n${signalsData}\n\nPlease provide your analysis for each signal. Format the response as "Signal ID: Your analysis here."`
          }
        ],
        temperature: 0.3, // Lower temperature for more focused/deterministic responses
        max_tokens: 2000 // Adjust based on the number of signals
      };
      
      // Send the request to OpenAI API
      const response = await this.callOpenAI(request);
      
      // Process the response
      const analysisText = response.choices[0].message.content.trim();
      
      // Parse the analysis into a map of signal ID to analysis text
      const analysisMap: { [signalId: string]: string } = {};
      
      // Split the response by signal ID pattern
      const analysisSegments = analysisText.split(/Signal ID: |Signal ID:|SignalID:|Signal:/);
      
      for (const segment of analysisSegments) {
        if (!segment.trim()) continue;
        
        // Extract signal ID and analysis text
        const match = segment.match(/([^:\n]+):(.*?)(?=Signal ID:|$)/s);
        if (match) {
          const signalId = match[1].trim();
          const analysis = match[2].trim();
          analysisMap[signalId] = analysis;
        } else {
          // Try another parsing approach for different response formats
          const lines = segment.split('\n');
          if (lines.length > 0) {
            const firstLine = lines[0].trim();
            // Check if the first line contains the signal ID
            const signalId = firstLine.split(' ')[0];
            if (signalId && signals.find(s => s.id === signalId)) {
              const analysis = segment.substring(signalId.length).trim();
              analysisMap[signalId] = analysis;
            }
          }
        }
      }
      
      return analysisMap;
    } catch (error) {
      console.error('Error analyzing signals with OpenAI:', error);
      return {};
    }
  }
  
  // Method to analyze a chart image
  async analyzeChart(chartImageUrl: string, assetName: string, timeframe: string): Promise<string> {
    try {
      const request: OpenAIRequest = {
        model: this.VISION_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert technical analyst. Analyze this ${assetName} chart on ${timeframe} timeframe. 
                     Identify key patterns, support/resistance levels, trend direction, and potential entry/exit points. 
                     Be specific about what you see on the chart and provide actionable insights.`
          },
          {
            role: 'user',
            content: [
              {
                type: 'image_url',
                image_url: {
                  url: chartImageUrl
                }
              },
              {
                type: 'text',
                text: `Please analyze this ${assetName} chart on the ${timeframe} timeframe. 
                      What patterns do you see? What's the overall trend? 
                      Where are key support and resistance levels? 
                      What would be your trading recommendation based on this chart?`
              }
            ]
          }
        ],
        max_tokens: 1000
      };
      
      const response = await this.callOpenAI(request);
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error analyzing chart with OpenAI:', error);
      return 'Unable to analyze chart. Please try again later.';
    }
  }
  
  // Method to evaluate trade performance
  async evaluateTradePerformance(results: TradeAnalysisResult[]): Promise<string> {
    if (!results || results.length === 0) {
      return 'No trade results to analyze.';
    }
    
    try {
      // Calculate some basic statistics for context
      const totalTrades = results.length;
      const winningTrades = results.filter(r => r.outcome.includes('TP')).length;
      const losingTrades = results.filter(r => r.outcome === 'SL Hit').length;
      const activeTrades = results.filter(r => r.outcome === 'Active').length;
      const winRate = totalTrades > 0 ? (winningTrades / (winningTrades + losingTrades)) * 100 : 0;
      
      // Aggregate PnL
      const pnlValues = results.filter(r => r.pnl !== undefined).map(r => r.pnl as number);
      const totalPnl = pnlValues.reduce((sum, pnl) => sum + pnl, 0);
      
      // Prepare the request
      const request: OpenAIRequest = {
        model: this.TEXT_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are an expert trading performance analyst. Analyze the trading results and provide insights.`
          },
          {
            role: 'user',
            content: `
Here's a summary of trading performance:
- Total Trades: ${totalTrades}
- Winning Trades: ${winningTrades}
- Losing Trades: ${losingTrades}
- Active Trades: ${activeTrades}
- Win Rate: ${winRate.toFixed(2)}%
- Total PnL: ${totalPnl.toFixed(2)}

Please provide a brief analysis of this trading performance. Include strengths, weaknesses, and recommendations for improvement.
Keep it concise but actionable. Maximum 5 bullet points with key insights.
`
          }
        ],
        temperature: 0.4,
        max_tokens: 800
      };
      
      // Send the request to OpenAI API
      const response = await this.callOpenAI(request);
      
      return response.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error evaluating trade performance with OpenAI:', error);
      return 'Unable to analyze trade performance. Please try again later.';
    }
  }
  
  // Helper method to call OpenAI API
  private async callOpenAI(request: OpenAIRequest): Promise<OpenAIResponse> {
    try {
      // Make API call through backend proxy to protect API key
      const response = await axios.post('/api/openai-proxy', request);
      return response.data;
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

// Export a singleton instance
export const openAIService = new OpenAIService();