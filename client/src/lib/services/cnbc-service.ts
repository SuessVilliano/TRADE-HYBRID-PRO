import { rapidApiService } from './rapid-api-service';

export interface CNBCSymbolData {
  symbolID: string;
  symbolName: string;
  symbolDesc: string;
  securityName: string;
  securityType: string;
  exchange: string;
  country: string;
  issueType: string;
  industry: string;
  sector: string;
  priceString: string;
  priceChange: string;
  priceChangePercent: string;
  timestampSince1970: number;
  isoTimeStamp: string;
}

export interface CNBCSymbolMapItem {
  id: string;
  symbolName: string;
  securityName: string;
  securityType: string;
  exchange: string;
}

export class CNBCService {
  private initialized = false;
  
  constructor() {}

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await rapidApiService.initialize();
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize CNBCService:', error);
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
   * Translates a symbol to get detailed information
   * @param symbol The stock or asset symbol (e.g. AAPL, MSFT, etc.)
   */
  async getSymbolInfo(symbol: string): Promise<CNBCSymbolData | null> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'cnbc.p.rapidapi.com',
        path: '/symbols/translate',
        params: {
          symbol
        }
      });
      
      if (!response || !response.symbolData) {
        console.warn(`No data found for symbol ${symbol}`);
        return null;
      }
      
      return response.symbolData;
    } catch (error) {
      console.error(`Error fetching CNBC data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Search for symbols by query string
   * @param query The search query
   */
  async searchSymbols(query: string): Promise<CNBCSymbolMapItem[]> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'cnbc.p.rapidapi.com',
        path: '/symbols/auto-complete',
        params: {
          query
        }
      });
      
      if (!response || !response.symbolsMap) {
        return [];
      }
      
      return response.symbolsMap;
    } catch (error) {
      console.error(`Error searching CNBC symbols for "${query}":`, error);
      return [];
    }
  }

  /**
   * Get news articles related to a symbol
   * @param symbol The stock or asset symbol
   */
  async getSymbolNews(symbol: string): Promise<any[]> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'cnbc.p.rapidapi.com',
        path: '/symbols/news',
        params: {
          symbol
        }
      });
      
      if (!response || !response.newsItems) {
        return [];
      }
      
      return response.newsItems;
    } catch (error) {
      console.error(`Error fetching CNBC news for ${symbol}:`, error);
      return [];
    }
  }

  /**
   * Get real-time quote for a symbol
   * @param symbol The stock or asset symbol
   */
  async getQuote(symbol: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const response = await rapidApiService.makeRequest({
        host: 'cnbc.p.rapidapi.com',
        path: '/symbols/quote',
        params: {
          symbol
        }
      });
      
      if (!response || !response.quote) {
        return null;
      }
      
      return response.quote;
    } catch (error) {
      console.error(`Error fetching CNBC quote for ${symbol}:`, error);
      return null;
    }
  }
}

// Export singleton instance
export const cnbcService = new CNBCService();