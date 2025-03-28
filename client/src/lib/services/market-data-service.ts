import { rapidApiService } from './rapid-api-service';

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
        await rapidApiService.initialize();
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
}

// Export singleton instance
export const marketDataService = new MarketDataService();