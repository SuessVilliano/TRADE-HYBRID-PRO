import axios from 'axios';
import { TradeSignal } from './google-sheets-service';

interface TradeAnalysisResult {
  marketInsight: string;
  tradingRecommendation: string;
  riskAssessment: string;
  technicalAnalysis: string;
  fundamentalFactors: string;
  confidenceScore: number;
}

interface DebugResult {
  issues: string[];
  recommendations: string[];
  priority: 'low' | 'medium' | 'high';
}

export class AITradingAnalysisService {
  private readonly OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
  private readonly OPENAI_MODEL = 'gpt-3.5-turbo';
  
  // Create a detailed market and trade analysis
  async analyzeSignal(signal: TradeSignal): Promise<TradeAnalysisResult> {
    try {
      console.log(`Analyzing signal for ${signal.asset}...`);
      
      const prompt = `
        Analyze this trading signal and provide detailed insights:
        
        Asset: ${signal.asset}
        Direction: ${signal.direction}
        Entry Price: ${signal.entryPrice}
        Stop Loss: ${signal.stopLoss}
        Take Profit 1: ${signal.takeProfit1}
        ${signal.takeProfit2 ? `Take Profit 2: ${signal.takeProfit2}` : ''}
        ${signal.takeProfit3 ? `Take Profit 3: ${signal.takeProfit3}` : ''}
        Market Type: ${signal.marketType}
        Provider: ${signal.provider}
        Status: ${signal.status}
        
        Provide a comprehensive analysis including:
        1. Market Insight: Current market conditions relevant to this asset
        2. Trading Recommendation: What a trader should do with this signal
        3. Risk Assessment: Evaluation of risk-reward ratio and potential drawdowns
        4. Technical Analysis: Key technical factors supporting or contradicting this signal
        5. Fundamental Factors: Any relevant fundamental factors
        6. Confidence Score: A number between 0-100 indicating confidence in this signal
        
        Format your response as JSON with the following structure:
        {
          "marketInsight": "string",
          "tradingRecommendation": "string",
          "riskAssessment": "string", 
          "technicalAnalysis": "string",
          "fundamentalFactors": "string",
          "confidenceScore": number
        }
      `;
      
      const response = await this.callOpenAI(prompt);
      const jsonStartIndex = response.indexOf('{');
      const jsonEndIndex = response.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonStr = response.substring(jsonStartIndex, jsonEndIndex);
        return JSON.parse(jsonStr);
      }
      
      // Return default structured data if JSON parsing fails
      return {
        marketInsight: "Unable to generate market insight",
        tradingRecommendation: "Unable to generate recommendation",
        riskAssessment: "Unable to assess risk",
        technicalAnalysis: "Technical analysis unavailable",
        fundamentalFactors: "Fundamental factors unavailable",
        confidenceScore: 0
      };
    } catch (error) {
      console.error('Error analyzing signal:', error);
      throw error;
    }
  }
  
  // Debug signal issues
  async debugSignals(signals: TradeSignal[]): Promise<DebugResult> {
    try {
      console.log(`Debugging ${signals.length} trading signals...`);
      
      // Create a summary of the signals
      const signalSummary = signals.map(s => {
        return `
          ID: ${s.id}
          Asset: ${s.asset}
          Direction: ${s.direction}
          Entry: ${s.entryPrice}
          Status: ${s.status}
          Market: ${s.marketType}
          Provider: ${s.provider}
        `;
      }).join('\n');
      
      const prompt = `
        Analyze these trading signals and identify any issues, anomalies, or potential problems:
        
        ${signalSummary}
        
        Please identify:
        1. Any data inconsistencies or errors
        2. Unusual patterns or red flags in the signals
        3. Potential issues with signal quality
        4. Recommendations for improving signal quality
        
        Format your response as JSON with the following structure:
        {
          "issues": ["list of issues identified"],
          "recommendations": ["list of recommendations"],
          "priority": "low/medium/high"
        }
      `;
      
      const response = await this.callOpenAI(prompt);
      const jsonStartIndex = response.indexOf('{');
      const jsonEndIndex = response.lastIndexOf('}') + 1;
      
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        const jsonStr = response.substring(jsonStartIndex, jsonEndIndex);
        return JSON.parse(jsonStr);
      }
      
      // Return default structured data if JSON parsing fails
      return {
        issues: ["Unable to identify issues"],
        recommendations: ["No recommendations available"],
        priority: "low"
      };
    } catch (error) {
      console.error('Error debugging signals:', error);
      throw error;
    }
  }
  
  // Generate a comprehensive market report
  async generateMarketReport(signals: TradeSignal[]): Promise<string> {
    try {
      console.log('Generating comprehensive market report...');
      
      // Calculate basic statistics
      const totalSignals = signals.length;
      const activeCrypto = signals.filter(s => s.status === 'active' && s.marketType === 'crypto').length;
      const activeForex = signals.filter(s => s.status === 'active' && s.marketType === 'forex').length;
      const activeFutures = signals.filter(s => s.status === 'active' && s.marketType === 'futures').length;
      
      const longSignals = signals.filter(s => s.direction === 'long').length;
      const shortSignals = signals.filter(s => s.direction === 'short').length;
      
      const prompt = `
        Generate a comprehensive market report based on the following signal statistics:
        
        Total Signals: ${totalSignals}
        Active Crypto Signals: ${activeCrypto}
        Active Forex Signals: ${activeForex}
        Active Futures Signals: ${activeFutures}
        Long Signals: ${longSignals}
        Short Signals: ${shortSignals}
        
        Please include:
        1. Market Overview: General market conditions across crypto, forex, and futures
        2. Sector Analysis: Which sectors are showing the most opportunity
        3. Risk Assessment: Current market risks and volatility
        4. Trading Recommendations: General strategy recommendations
        5. Market Sentiment: Overall market sentiment (bullish, bearish, neutral)
        
        Format your response as a detailed market report with clear sections.
      `;
      
      return await this.callOpenAI(prompt);
    } catch (error) {
      console.error('Error generating market report:', error);
      throw error;
    }
  }
  
  // Helper method to call OpenAI API
  private async callOpenAI(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        this.OPENAI_API_URL,
        {
          model: this.OPENAI_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are an expert AI trading analyst with deep knowledge of markets, trading strategies, and technical analysis. Provide accurate, concise, and actionable insights.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
          }
        }
      );
      
      return response.data.choices[0].message.content.trim();
    } catch (error) {
      console.error('Error calling OpenAI API:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const aiTradingAnalysisService = new AITradingAnalysisService();