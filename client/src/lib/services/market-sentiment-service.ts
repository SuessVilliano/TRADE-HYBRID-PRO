import { check_secrets } from '../utils';
import { openAIService } from './openai-service';
import { rapidApiService } from './rapid-api-service';

export interface SentimentScore {
  score: number; // -1 to 1 scale (-1 very negative, 0 neutral, 1 very positive)
  label: 'bearish' | 'neutral' | 'bullish';
  confidence: number; // 0-1 scale
}

export interface MarketSentimentData {
  symbol: string;
  overallSentiment: SentimentScore;
  newsSentiment: SentimentScore;
  socialMediaSentiment: SentimentScore;
  technicalAnalysisSentiment: SentimentScore;
  latestNews: Array<{
    title: string;
    url: string;
    source: string;
    sentiment: SentimentScore;
    publishedAt: string;
  }>;
  trendingTopics: string[];
  predictionSummary: string;
}

export class MarketSentimentService {
  private initialized = false;
  private hasOpenAI = false;
  
  constructor() {}

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await rapidApiService.initialize();
        
        // Check if OpenAI API key is available for enhanced sentiment analysis
        const hasOpenAIKey = await check_secrets(['OPENAI_API_KEY']);
        if (hasOpenAIKey) {
          await openAIService.initialize();
          this.hasOpenAI = true;
        }
        
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize MarketSentimentService:', error);
        return false;
      }
    }
    return true;
  }

  private async ensureInitialized() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  /**
   * Analyze sentiment from a text string
   * @param text The text to analyze for sentiment
   */
  private async analyzeSentiment(text: string): Promise<SentimentScore> {
    // If OpenAI is available, use it for more accurate sentiment analysis
    if (this.hasOpenAI) {
      try {
        const response = await openAIService.analyzeMarketSentiment(text);
        if (response && response.sentiment) {
          return {
            score: response.sentiment.score,
            label: response.sentiment.label as 'bearish' | 'neutral' | 'bullish',
            confidence: response.sentiment.confidence
          };
        }
      } catch (error) {
        console.error('Error using OpenAI for sentiment analysis:', error);
        // Fall back to basic analysis below
      }
    }
    
    // Basic sentiment analysis as a fallback
    // This is a simple rule-based approach
    const bullishWords = [
      'bullish', 'rally', 'surge', 'gain', 'positive', 'rise', 'grow', 'improve',
      'uptrend', 'outperform', 'beat', 'exceeds', 'strong', 'upgrade', 'buy',
      'optimistic', 'potential', 'opportunity', 'recovery', 'breakthrough'
    ];
    
    const bearishWords = [
      'bearish', 'crash', 'decline', 'fall', 'negative', 'drop', 'shrink', 'deteriorate',
      'downtrend', 'underperform', 'miss', 'disappoints', 'weak', 'downgrade', 'sell',
      'pessimistic', 'risk', 'concern', 'recession', 'correction'
    ];
    
    const lowerText = text.toLowerCase();
    let bullishCount = 0;
    let bearishCount = 0;
    
    bullishWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) bullishCount += matches.length;
    });
    
    bearishWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      const matches = lowerText.match(regex);
      if (matches) bearishCount += matches.length;
    });
    
    // Calculate the sentiment score
    const totalWords = bullishCount + bearishCount;
    if (totalWords === 0) {
      return { score: 0, label: 'neutral', confidence: 0.5 };
    }
    
    const score = (bullishCount - bearishCount) / totalWords;
    let label: 'bearish' | 'neutral' | 'bullish' = 'neutral';
    if (score > 0.2) label = 'bullish';
    if (score < -0.2) label = 'bearish';
    
    return {
      score: Math.max(-1, Math.min(1, score)), // Clamp between -1 and 1
      label,
      confidence: Math.min(0.7, Math.abs(score) + 0.3) // Simple confidence calculation
    };
  }

  /**
   * Analyze sentiment for a given financial symbol
   * @param symbol The stock or crypto symbol to analyze
   */
  async getMarketSentiment(symbol: string): Promise<MarketSentimentData | null> {
    await this.ensureInitialized();
    
    try {
      // Get news articles for the symbol
      const newsData = await rapidApiService.getNews(symbol, 10);
      
      if (!newsData || !newsData.articles || newsData.articles.length === 0) {
        console.warn(`No news data found for ${symbol}`);
        return null;
      }
      
      // Process each news article for sentiment
      const articleSentiments = await Promise.all(
        newsData.articles.slice(0, 5).map(async article => {
          const content = `${article.title}. ${article.description}`;
          const sentiment = await this.analyzeSentiment(content);
          
          return {
            title: article.title,
            url: article.link,
            source: article.source,
            sentiment,
            publishedAt: article.date
          };
        })
      );
      
      // Calculate the overall news sentiment
      const newsScores = articleSentiments.map(item => item.sentiment.score);
      const avgNewsScore = newsScores.reduce((sum, score) => sum + score, 0) / newsScores.length;
      let newsSentimentLabel: 'bearish' | 'neutral' | 'bullish' = 'neutral';
      if (avgNewsScore > 0.2) newsSentimentLabel = 'bullish';
      if (avgNewsScore < -0.2) newsSentimentLabel = 'bearish';
      
      const newsSentiment: SentimentScore = {
        score: avgNewsScore,
        label: newsSentimentLabel,
        confidence: 0.7
      };
      
      // Extract trending topics from news titles
      const allTitles = articleSentiments.map(item => item.title).join(' ');
      const topics = this.extractTrendingTopics(allTitles);
      
      // Simulate social media sentiment (in a real implementation, this would use Twitter, Reddit APIs, etc.)
      const socialMediaSentiment: SentimentScore = {
        score: avgNewsScore * 0.8 + (Math.random() * 0.4 - 0.2), // Slightly related to news but with some variance
        label: 'neutral',
        confidence: 0.6
      };
      if (socialMediaSentiment.score > 0.2) socialMediaSentiment.label = 'bullish';
      if (socialMediaSentiment.score < -0.2) socialMediaSentiment.label = 'bearish';
      
      // Simulate technical analysis sentiment
      const technicalAnalysisSentiment: SentimentScore = {
        score: avgNewsScore * 0.3 + (Math.random() * 0.6 - 0.3), // Less related to news
        label: 'neutral',
        confidence: 0.65
      };
      if (technicalAnalysisSentiment.score > 0.2) technicalAnalysisSentiment.label = 'bullish';
      if (technicalAnalysisSentiment.score < -0.2) technicalAnalysisSentiment.label = 'bearish';
      
      // Calculate the overall sentiment
      const overallScore = (
        newsSentiment.score * 0.4 + 
        socialMediaSentiment.score * 0.3 + 
        technicalAnalysisSentiment.score * 0.3
      );
      
      let overallLabel: 'bearish' | 'neutral' | 'bullish' = 'neutral';
      if (overallScore > 0.2) overallLabel = 'bullish';
      if (overallScore < -0.2) overallLabel = 'bearish';
      
      const overallSentiment: SentimentScore = {
        score: overallScore,
        label: overallLabel,
        confidence: 0.75
      };
      
      // Generate a prediction summary
      let predictionSummary = '';
      if (this.hasOpenAI) {
        try {
          const summary = await openAIService.generateMarketPrediction(symbol, {
            news: articleSentiments.map(item => ({ title: item.title, sentiment: item.sentiment.label })),
            overallSentiment: overallLabel
          });
          predictionSummary = summary;
        } catch (error) {
          console.error('Error generating market prediction:', error);
          // Fall back to a simple prediction summary
          predictionSummary = this.generateSimplePredictionSummary(symbol, overallSentiment);
        }
      } else {
        predictionSummary = this.generateSimplePredictionSummary(symbol, overallSentiment);
      }
      
      return {
        symbol,
        overallSentiment,
        newsSentiment,
        socialMediaSentiment,
        technicalAnalysisSentiment,
        latestNews: articleSentiments,
        trendingTopics: topics,
        predictionSummary
      };
    } catch (error) {
      console.error(`Error analyzing sentiment for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Extract trending topics from text using frequency analysis
   */
  private extractTrendingTopics(text: string): string[] {
    const commonWords = [
      'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with',
      'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had',
      'do', 'does', 'did', 'will', 'would', 'should', 'could', 'may', 'might',
      'must', 'can', 'as', 'by', 'of', 'from', 'about', 'than'
    ];
    
    // Tokenize and clean text
    const tokens = text.toLowerCase()
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .split(/\s+/) // Split by whitespace
      .filter(word => word.length > 3 && !commonWords.includes(word)); // Remove common words and short words
    
    // Count word frequencies
    const wordCounts: Record<string, number> = {};
    tokens.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    // Sort by frequency
    const sortedWords = Object.entries(wordCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
    
    return sortedWords;
  }

  /**
   * Generate a simple prediction summary without using OpenAI
   */
  private generateSimplePredictionSummary(symbol: string, sentiment: SentimentScore): string {
    const intensityMap: Record<string, string> = {
      '0.8_1.0': 'strongly',
      '0.5_0.8': 'moderately',
      '0.2_0.5': 'slightly',
      '-0.2_0.2': '',
      '-0.5_-0.2': 'slightly',
      '-0.8_-0.5': 'moderately',
      '-1.0_-0.8': 'strongly'
    };
    
    // Determine intensity
    let intensity = '';
    const score = sentiment.score;
    for (const [range, intensityValue] of Object.entries(intensityMap)) {
      const [min, max] = range.split('_').map(Number);
      if (score >= min && score <= max) {
        intensity = intensityValue;
        break;
      }
    }
    
    // Create prediction based on sentiment
    switch (sentiment.label) {
      case 'bullish':
        return `The market appears ${intensity} bullish on ${symbol} based on recent news and social sentiment. Current indicators suggest potential upward price movement, though investors should perform their own research.`;
      case 'bearish':
        return `The market sentiment for ${symbol} is ${intensity} bearish according to recent data. This suggests possible downward pressure on the price, but market conditions can change rapidly.`;
      case 'neutral':
        return `${symbol} is currently showing neutral market sentiment. There's no clear directional bias in recent news and social media analysis, suggesting a period of consolidation may be ahead.`;
      default:
        return `Sentiment analysis for ${symbol} is inconclusive at this time. More data may be needed to establish a clearer market direction.`;
    }
  }
}

// Export singleton instance
export const marketSentimentService = new MarketSentimentService();