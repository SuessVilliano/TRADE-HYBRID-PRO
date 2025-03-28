import { rapidApiService } from './rapid-api-service';
import { cnbcService } from './cnbc-service';
import { fidelityService } from './fidelity-service';

export interface MarketDataResponse {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  close: number;
  timestamp: number;
}

export interface EnhancedMarketData extends MarketDataResponse {
  name?: string;
  industry?: string;
  sector?: string;
  marketCap?: number;
  peRatio?: number;
  dividendYield?: number;
  analystRating?: number;
  targetPrice?: number;
  dataProvider?: string;
}

export interface CryptoMarketData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  marketCap: number;
  volume: number;
  rank: number;
  iconUrl: string;
}

export interface MarketMoversData {
  gainers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
  losers: Array<{
    symbol: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
  }>;
}

export interface NewsArticle {
  title: string;
  url: string;
  description: string;
  source: string;
  publishedAt: string;
  imageUrl: string;
}

export class MarketDataService {
  private initialized = false;
  
  constructor() {}

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      try {
        // Initialize all data service dependencies
        await Promise.all([
          rapidApiService.initialize(),
          cnbcService.initialize(),
          fidelityService.initialize()
        ]);
        
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize MarketDataService:', error);
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
   * Get real-time stock data for a symbol
   */
  async getStockData(symbol: string): Promise<MarketDataResponse | null> {
    await this.ensureInitialized();
    
    try {
      const data = await rapidApiService.getStockData(symbol);
      
      if (!data || !data['Time Series (Daily)']) {
        return null;
      }
      
      // Get the most recent data point
      const timeSeriesData = data['Time Series (Daily)'];
      const latestDate = Object.keys(timeSeriesData)[0];
      const latestData = timeSeriesData[latestDate];
      
      const previousDate = Object.keys(timeSeriesData)[1];
      const previousData = timeSeriesData[previousDate];
      
      const currentPrice = parseFloat(latestData['4. close']);
      const previousPrice = parseFloat(previousData['4. close']);
      const change = currentPrice - previousPrice;
      const changePercent = (change / previousPrice) * 100;
      
      return {
        symbol,
        price: currentPrice,
        change,
        changePercent,
        volume: parseFloat(latestData['5. volume']),
        high: parseFloat(latestData['2. high']),
        low: parseFloat(latestData['3. low']),
        open: parseFloat(latestData['1. open']),
        close: currentPrice,
        timestamp: new Date(latestDate).getTime()
      };
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get cryptocurrency data
   */
  async getCryptoData(limit: number = 10): Promise<CryptoMarketData[]> {
    await this.ensureInitialized();
    
    try {
      const data = await rapidApiService.getCryptoData(limit);
      
      if (!data || !data.data || !data.data.coins) {
        return [];
      }
      
      return data.data?.coins?.map((coin: any) => ({
        symbol: coin.symbol,
        name: coin.name,
        price: parseFloat(coin.price),
        change: parseFloat(coin.change),
        marketCap: parseFloat(coin.marketCap),
        volume: parseFloat(coin.volume24h || '0'),
        rank: coin.rank,
        iconUrl: coin.iconUrl
      })) || [];
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      return [];
    }
  }

  /**
   * Get market movers (top gainers and losers)
   */
  async getMarketMovers(): Promise<MarketMoversData> {
    await this.ensureInitialized();
    
    try {
      const gainersData = await rapidApiService.getMarketMovers('percent_change_gainers');
      const losersData = await rapidApiService.getMarketMovers('percent_change_losers');
      
      const gainers = gainersData.data?.slice(0, 5).map((item: any) => ({
        symbol: item.s,
        name: item.description || item.s,
        price: parseFloat(item.last),
        change: parseFloat(item.change),
        changePercent: parseFloat(item.change_percentage)
      })) || [];
      
      const losers = losersData.data?.slice(0, 5).map((item: any) => ({
        symbol: item.s,
        name: item.description || item.s,
        price: parseFloat(item.last),
        change: parseFloat(item.change),
        changePercent: parseFloat(item.change_percentage)
      })) || [];
      
      return { gainers, losers };
    } catch (error) {
      console.error('Error fetching market movers:', error);
      return { gainers: [], losers: [] };
    }
  }

  /**
   * Get financial news for a specific symbol or general market
   */
  async getNews(query?: string): Promise<NewsArticle[]> {
    await this.ensureInitialized();
    
    try {
      const searchQuery = query || 'stock market financial trading';
      const newsData = await rapidApiService.getNews(searchQuery, 10);
      
      if (!newsData || !newsData.articles) {
        return [];
      }
      
      return newsData.articles.map(article => ({
        title: article.title,
        url: article.link,
        description: article.description,
        source: article.source,
        publishedAt: article.date,
        imageUrl: article.imageUrl || ''
      }));
    } catch (error) {
      console.error('Error fetching news:', error);
      return [];
    }
  }

  /**
   * Get options data for a symbol
   */
  async getOptionsData(symbol: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      const optionsData = await rapidApiService.getOptionsData(symbol);
      return optionsData;
    } catch (error) {
      console.error(`Error fetching options data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get stock statistics and information
   */
  async getStockStats(symbol: string): Promise<any> {
    await this.ensureInitialized();
    
    try {
      // Format symbol for BB Finance API (lowercase with ':us' suffix)
      const formattedSymbol = `${symbol.toLowerCase()}:us`;
      
      const data = await rapidApiService.makeRequest({
        host: 'bb-finance.p.rapidapi.com',
        path: '/stock/get-statistics',
        params: {
          id: formattedSymbol,
          template: 'STOCK'
        }
      });
      
      return data;
    } catch (error) {
      console.error(`Error fetching stock stats for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get enhanced stock data from multiple sources
   * Aggregates data from Alpha Vantage, CNBC, and Fidelity
   */
  async getEnhancedStockData(symbol: string): Promise<EnhancedMarketData | null> {
    await this.ensureInitialized();
    
    try {
      // First get basic stock data from Alpha Vantage
      const basicData = await this.getStockData(symbol);
      
      if (!basicData) {
        return null;
      }
      
      // Create enhanced data object starting with basic data
      const enhancedData: EnhancedMarketData = {
        ...basicData,
        dataProvider: 'Trade Hybrid Aggregated Data'
      };
      
      // Run parallel requests to get additional data
      const [cnbcData, fidelityData, fidelityResearch] = await Promise.allSettled([
        cnbcService.getSymbolInfo(symbol),
        fidelityService.getQuote(symbol),
        fidelityService.getResearch(symbol)
      ]);
      
      // Add CNBC data if available
      if (cnbcData.status === 'fulfilled' && cnbcData.value) {
        enhancedData.name = cnbcData.value.symbolDesc || cnbcData.value.securityName;
        enhancedData.industry = cnbcData.value.industry;
        enhancedData.sector = cnbcData.value.sector;
      }
      
      // Add Fidelity quote data if available
      if (fidelityData.status === 'fulfilled' && fidelityData.value) {
        // If we couldn't get price from Alpha Vantage, use Fidelity data
        if (!enhancedData.price && fidelityData.value.price) {
          enhancedData.price = fidelityData.value.price;
          enhancedData.change = fidelityData.value.change;
          enhancedData.changePercent = fidelityData.value.percentChange;
        }
        
        // Add additional Fidelity data points
        enhancedData.marketCap = fidelityData.value.marketCap;
        enhancedData.peRatio = fidelityData.value.peRatio;
        enhancedData.dividendYield = fidelityData.value.dividendYield;
        
        // Override name if we don't have it yet
        if (!enhancedData.name && fidelityData.value.name) {
          enhancedData.name = fidelityData.value.name;
        }
      }
      
      // Add Fidelity research data if available
      if (fidelityResearch.status === 'fulfilled' && fidelityResearch.value) {
        enhancedData.analystRating = fidelityResearch.value.analystRating;
        enhancedData.targetPrice = fidelityResearch.value.targetPrice;
      }
      
      return enhancedData;
    } catch (error) {
      console.error(`Error fetching enhanced stock data for ${symbol}:`, error);
      
      // Try to return at least basic data if we have it
      const basicData = await this.getStockData(symbol);
      if (basicData) {
        return {
          ...basicData,
          dataProvider: 'Alpha Vantage (Limited Data)'
        };
      }
      
      return null;
    }
  }
  
  /**
   * Cross-reference and search for symbols
   */
  async searchSymbols(query: string): Promise<any[]> {
    await this.ensureInitialized();
    
    try {
      // Get results from multiple sources
      const [cnbcResults, fidelityResults] = await Promise.allSettled([
        cnbcService.searchSymbols(query),
        fidelityService.autoComplete(query)
      ]);
      
      const results: any[] = [];
      
      // Add CNBC results
      if (cnbcResults.status === 'fulfilled' && cnbcResults.value) {
        results.push(...cnbcResults.value.map((item: any) => ({
          symbol: item.symbolName,
          name: item.securityName,
          type: item.securityType,
          exchange: item.exchange,
          source: 'CNBC'
        })));
      }
      
      // Add Fidelity results
      if (fidelityResults.status === 'fulfilled' && fidelityResults.value) {
        results.push(...fidelityResults.value.map((item: any) => ({
          symbol: item.symbol,
          name: item.name,
          type: item.securityType,
          exchange: item.exchange,
          score: item.score,
          source: 'Fidelity'
        })));
      }
      
      // Remove duplicates and sort by symbol
      const uniqueResults = results.filter((item, index, self) => 
        index === self.findIndex((t) => t.symbol === item.symbol)
      );
      
      return uniqueResults.sort((a, b) => a.symbol.localeCompare(b.symbol));
    } catch (error) {
      console.error(`Error searching symbols for "${query}":`, error);
      return [];
    }
  }
}

// Export singleton instance
export const marketDataService = new MarketDataService();