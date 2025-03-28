import { formatNumber } from '@/lib/utils';

interface TradingSignal {
  symbol: string;
  signal: 'buy' | 'sell' | 'neutral';
  strength: number;
  entry: number;
  target: number;
  stopLoss: number;
}

interface GeneratedTradeOpportunity {
  asset: string;
  entryPrice: number;
  targetPrice: number;
  stopLossPrice: number;
  direction: 'long' | 'short';
  timeframe: string;
  confidence: number;
  reasoning: string;
}

class AITradingService {
  private apiKey: string | null = null;
  private baseUrl: string;
  private useGemini: boolean = false;

  constructor() {
    this.baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    // Load API key from localStorage if available
    this.apiKey = localStorage.getItem('openai_api_key') || localStorage.getItem('gemini_api_key');
    this.useGemini = !!localStorage.getItem('gemini_api_key');
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
  }

  public hasApiKey(): boolean {
    return !!this.apiKey;
  }

  public async generateTradingSignals(assets: string[]): Promise<TradingSignal[]> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    if (this.useGemini) {
      return this.generateTradingSignalsWithGemini(assets);
    } else {
      return this.generateTradingSignalsWithOpenAI(assets);
    }
  }

  private async generateTradingSignalsWithOpenAI(assets: string[]): Promise<TradingSignal[]> {
    try {
      // In a production environment, you would send this request to your backend
      // to protect your API key and handle rate limiting
      // For demo purposes, we'll generate mock data
      console.log('Generating trading signals with OpenAI for assets:', assets);
      
      // Simulated delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate signals for each asset
      return assets.map(symbol => {
        // Generate pseudo-random values based on the symbol string
        const hash = this.simpleHash(symbol);
        const signalTypes: Array<'buy' | 'sell' | 'neutral'> = ['buy', 'sell', 'neutral'];
        const signalIndex = hash % 3;
        const signal = signalTypes[signalIndex];
        
        // Generate base price around realistic values for each symbol
        let basePrice = 0;
        switch (symbol) {
          case 'BTC':
            basePrice = 45000 + (hash % 5000);
            break;
          case 'ETH':
            basePrice = 2500 + (hash % 500);
            break;
          case 'SOL':
            basePrice = 100 + (hash % 50);
            break;
          case 'ADA':
            basePrice = 0.5 + (hash % 20) / 100;
            break;
          case 'XRP':
            basePrice = 0.5 + (hash % 50) / 100;
            break;
          default:
            basePrice = 50 + (hash % 100);
        }
        
        const strength = 30 + (hash % 70);
        const entry = parseFloat(basePrice.toFixed(2));
        
        // Calculate target and stop loss based on signal direction
        let target, stopLoss;
        if (signal === 'buy') {
          target = parseFloat((basePrice * (1 + (5 + (hash % 10)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 - (2 + (hash % 5)) / 100)).toFixed(2));
        } else if (signal === 'sell') {
          target = parseFloat((basePrice * (1 - (5 + (hash % 10)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 + (2 + (hash % 5)) / 100)).toFixed(2));
        } else {
          target = parseFloat((basePrice * (1 + (1 + (hash % 5)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 - (1 + (hash % 5)) / 100)).toFixed(2));
        }
        
        return {
          symbol,
          signal,
          strength,
          entry,
          target,
          stopLoss
        };
      });
    } catch (error) {
      console.error('Error generating trading signals with OpenAI:', error);
      throw error;
    }
  }

  private async generateTradingSignalsWithGemini(assets: string[]): Promise<TradingSignal[]> {
    try {
      // Similar to OpenAI but using Gemini API
      console.log('Generating trading signals with Gemini for assets:', assets);
      
      // Simulated delay to mimic API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate signals for each asset (similar logic as OpenAI)
      return assets.map(symbol => {
        const hash = this.simpleHash(symbol + 'gemini'); // Add a different salt
        const signalTypes: Array<'buy' | 'sell' | 'neutral'> = ['buy', 'sell', 'neutral'];
        const signalIndex = hash % 3;
        const signal = signalTypes[signalIndex];
        
        let basePrice = 0;
        switch (symbol) {
          case 'BTC':
            basePrice = 45000 + (hash % 5000);
            break;
          case 'ETH':
            basePrice = 2500 + (hash % 500);
            break;
          case 'SOL':
            basePrice = 100 + (hash % 50);
            break;
          case 'ADA':
            basePrice = 0.5 + (hash % 20) / 100;
            break;
          case 'XRP':
            basePrice = 0.5 + (hash % 50) / 100;
            break;
          default:
            basePrice = 50 + (hash % 100);
        }
        
        const strength = 30 + (hash % 70);
        const entry = parseFloat(basePrice.toFixed(2));
        
        let target, stopLoss;
        if (signal === 'buy') {
          target = parseFloat((basePrice * (1 + (5 + (hash % 10)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 - (2 + (hash % 5)) / 100)).toFixed(2));
        } else if (signal === 'sell') {
          target = parseFloat((basePrice * (1 - (5 + (hash % 10)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 + (2 + (hash % 5)) / 100)).toFixed(2));
        } else {
          target = parseFloat((basePrice * (1 + (1 + (hash % 5)) / 100)).toFixed(2));
          stopLoss = parseFloat((basePrice * (1 - (1 + (hash % 5)) / 100)).toFixed(2));
        }
        
        return {
          symbol,
          signal,
          strength,
          entry,
          target,
          stopLoss
        };
      });
    } catch (error) {
      console.error('Error generating trading signals with Gemini:', error);
      throw error;
    }
  }

  public async generateTradeOpportunities(
    market: string, 
    count: number = 3
  ): Promise<GeneratedTradeOpportunity[]> {
    if (!this.apiKey) {
      throw new Error('API key is required');
    }

    try {
      console.log(`Generating ${count} trade opportunities for ${market} market`);
      
      // Simulated delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock data generation
      const assets = market === 'crypto' 
        ? ['BTC', 'ETH', 'SOL', 'ADA', 'XRP', 'DOT', 'AVAX', 'DOGE', 'LINK']
        : ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'META', 'TSLA', 'NVDA', 'JPM', 'V'];
      
      const timeframes = ['1h', '4h', '1d', '1w'];
      
      const opportunities: GeneratedTradeOpportunity[] = [];
      
      for (let i = 0; i < count; i++) {
        const assetIndex = Math.floor(Math.random() * assets.length);
        const asset = assets[assetIndex];
        const hash = this.simpleHash(asset + i.toString());
        
        // Base price calculation similar to signals
        let basePrice = 0;
        if (market === 'crypto') {
          switch (asset) {
            case 'BTC': basePrice = 45000 + (hash % 5000); break;
            case 'ETH': basePrice = 2500 + (hash % 500); break;
            case 'SOL': basePrice = 100 + (hash % 50); break;
            case 'ADA': basePrice = 0.5 + (hash % 20) / 100; break;
            case 'XRP': basePrice = 0.5 + (hash % 50) / 100; break;
            case 'DOT': basePrice = 5 + (hash % 5); break;
            case 'AVAX': basePrice = 30 + (hash % 10); break;
            case 'DOGE': basePrice = 0.1 + (hash % 5) / 100; break;
            case 'LINK': basePrice = 10 + (hash % 5); break;
            default: basePrice = 50 + (hash % 100);
          }
        } else {
          switch (asset) {
            case 'AAPL': basePrice = 170 + (hash % 30); break;
            case 'MSFT': basePrice = 350 + (hash % 50); break;
            case 'GOOGL': basePrice = 140 + (hash % 20); break;
            case 'AMZN': basePrice = 180 + (hash % 30); break;
            case 'META': basePrice = 470 + (hash % 50); break;
            case 'TSLA': basePrice = 180 + (hash % 40); break;
            case 'NVDA': basePrice = 800 + (hash % 100); break;
            case 'JPM': basePrice = 185 + (hash % 25); break;
            case 'V': basePrice = 270 + (hash % 30); break;
            default: basePrice = 100 + (hash % 100);
          }
        }
        
        const direction = hash % 2 === 0 ? 'long' : 'short';
        const confidence = 60 + (hash % 40);
        const timeframe = timeframes[hash % timeframes.length];
        
        const entryPrice = parseFloat(basePrice.toFixed(2));
        let targetPrice, stopLossPrice;
        
        if (direction === 'long') {
          targetPrice = parseFloat((basePrice * (1 + (5 + (hash % 15)) / 100)).toFixed(2));
          stopLossPrice = parseFloat((basePrice * (1 - (2 + (hash % 5)) / 100)).toFixed(2));
        } else {
          targetPrice = parseFloat((basePrice * (1 - (5 + (hash % 15)) / 100)).toFixed(2));
          stopLossPrice = parseFloat((basePrice * (1 + (2 + (hash % 5)) / 100)).toFixed(2));
        }
        
        const reasoningOptions = [
          `${direction === 'long' ? 'Bullish' : 'Bearish'} divergence on RSI indicator`,
          `${direction === 'long' ? 'Bullish' : 'Bearish'} trend continuation pattern`,
          `${direction === 'long' ? 'Support' : 'Resistance'} level with high historical significance`,
          `${direction === 'long' ? 'Golden' : 'Death'} cross on moving averages`,
          `${direction === 'long' ? 'Positive' : 'Negative'} sentiment shift after recent news`,
          `${direction === 'long' ? 'Bullish' : 'Bearish'} engulfing pattern on ${timeframe} chart`,
          `Strong ${direction === 'long' ? 'buying' : 'selling'} volume indicating momentum`
        ];
        
        const reasoning = reasoningOptions[hash % reasoningOptions.length];
        
        opportunities.push({
          asset,
          entryPrice,
          targetPrice,
          stopLossPrice,
          direction,
          timeframe,
          confidence,
          reasoning
        });
      }
      
      return opportunities;
    } catch (error) {
      console.error('Error generating trade opportunities:', error);
      throw error;
    }
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }
}

export const aiTradingService = new AITradingService();