import { rapidApiService } from './rapid-api-service';

export interface FidelityAutoCompleteResult {
  symbol: string;
  name: string;
  securityType: string;
  exchange: string;
  score: number;
}

export interface FidelityQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  percentChange: number;
  volume: number;
  marketCap: number;
  peRatio: number;
  beta: number;
  dividendYield: number;
  previousClose: number;
  open: number;
  high: number;
  low: number;
  bid: number;
  ask: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface FidelityResearchData {
  symbol: string;
  analystRating: number;  // 1-5 scale
  analystCount: number;
  targetPrice: number;
  buyCount: number;
  holdCount: number;
  sellCount: number;
  priceToEarnings: number;
  earningsGrowth: number;
  returnOnEquity: number;
}

export class FidelityService {
  private initialized = false;
  
  constructor() {}

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await rapidApiService.initialize();
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize FidelityService:', error);
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
   * Search for symbols by query string
   * @param query The search query
   */
  async autoComplete(query: string): Promise<FidelityAutoCompleteResult[]> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'fidelity-investments.p.rapidapi.com',
        path: '/auto-complete',
        params: {
          query
        }
      });
      
      if (!response || !response.results) {
        return [];
      }
      
      return response.results.map((item: any) => ({
        symbol: item.symbol,
        name: item.name,
        securityType: item.securityType,
        exchange: item.exchange,
        score: item.score
      }));
    } catch (error) {
      console.error(`Error with Fidelity auto-complete for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get a quote for a symbol
   * @param symbol The stock or asset symbol
   */
  async getQuote(symbol: string): Promise<FidelityQuote | null> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'fidelity-investments.p.rapidapi.com',
        path: '/quote',
        params: {
          symbol
        }
      });
      
      if (!response || !response.quote) {
        return null;
      }
      
      const quote = response.quote;
      return {
        symbol: quote.symbol,
        name: quote.name,
        price: parseFloat(quote.price),
        change: parseFloat(quote.change),
        percentChange: parseFloat(quote.percentChange),
        volume: parseInt(quote.volume, 10),
        marketCap: parseFloat(quote.marketCap),
        peRatio: parseFloat(quote.peRatio),
        beta: parseFloat(quote.beta),
        dividendYield: parseFloat(quote.dividendYield),
        previousClose: parseFloat(quote.previousClose),
        open: parseFloat(quote.open),
        high: parseFloat(quote.high),
        low: parseFloat(quote.low),
        bid: parseFloat(quote.bid),
        ask: parseFloat(quote.ask),
        fiftyTwoWeekHigh: parseFloat(quote.fiftyTwoWeekHigh),
        fiftyTwoWeekLow: parseFloat(quote.fiftyTwoWeekLow)
      };
    } catch (error) {
      console.error(`Error fetching Fidelity quote for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get analyst ratings and research data for a symbol
   * @param symbol The stock or asset symbol
   */
  async getResearch(symbol: string): Promise<FidelityResearchData | null> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'fidelity-investments.p.rapidapi.com',
        path: '/research',
        params: {
          symbol
        }
      });
      
      if (!response || !response.research) {
        return null;
      }
      
      const research = response.research;
      return {
        symbol,
        analystRating: parseFloat(research.analystRating),
        analystCount: parseInt(research.analystCount, 10),
        targetPrice: parseFloat(research.targetPrice),
        buyCount: parseInt(research.buyCount, 10),
        holdCount: parseInt(research.holdCount, 10),
        sellCount: parseInt(research.sellCount, 10),
        priceToEarnings: parseFloat(research.priceToEarnings),
        earningsGrowth: parseFloat(research.earningsGrowth),
        returnOnEquity: parseFloat(research.returnOnEquity)
      };
    } catch (error) {
      console.error(`Error fetching Fidelity research for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get historical data for a symbol
   * @param symbol The stock or asset symbol
   * @param period The time period (1d, 5d, 1m, 3m, 6m, 1y, 5y)
   */
  async getHistoricalData(symbol: string, period: string = '1m'): Promise<any[]> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'fidelity-investments.p.rapidapi.com',
        path: '/historical',
        params: {
          symbol,
          period
        }
      });
      
      if (!response || !response.historical || !response.historical.data) {
        return [];
      }
      
      return response.historical.data;
    } catch (error) {
      console.error(`Error fetching Fidelity historical data for ${symbol}:`, error);
      return [];
    }
  }
}

// Export singleton instance
export const fidelityService = new FidelityService();