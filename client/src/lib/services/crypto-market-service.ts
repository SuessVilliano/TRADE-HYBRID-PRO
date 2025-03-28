import { rapidApiService } from './rapid-api-service';

export interface CryptoMarketOverview {
  totalMarketCap: number;
  totalVolume24h: number;
  btcDominance: number;
  totalCoins: number;
  totalMarkets: number;
  totalExchanges: number;
}

export interface CryptoCoin {
  uuid: string;
  symbol: string;
  name: string;
  price: number;
  marketCap: number;
  volume24h: number;
  change24h: number;
  rank: number;
  iconUrl: string;
  sparkline: number[];
}

export interface CryptoMarketPair {
  baseSymbol: string;
  quoteSymbol: string;
  price: number;
  volume24h: number;
  priceChangePercent: number;
  exchange: string;
}

export class CryptoMarketService {
  private initialized = false;
  
  constructor() {}

  async initialize(): Promise<boolean> {
    if (!this.initialized) {
      try {
        await rapidApiService.initialize();
        this.initialized = true;
        return true;
      } catch (error) {
        console.error('Failed to initialize CryptoMarketService:', error);
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
   * Get crypto market overview stats
   */
  async getMarketOverview(): Promise<CryptoMarketOverview | null> {
    await this.ensureInitialized();
    
    try {
      // First try with Coinranking
      const coinrankingData = await rapidApiService.getCryptoStats();
      
      if (coinrankingData && coinrankingData.data && coinrankingData.data.stats) {
        const stats = coinrankingData.data.stats;
        return {
          totalMarketCap: parseFloat(stats.totalMarketCap),
          totalVolume24h: parseFloat(stats.total24hVolume),
          btcDominance: parseFloat(stats.btcDominance || '0'),
          totalCoins: stats.totalCoins,
          totalMarkets: stats.totalMarkets,
          totalExchanges: stats.totalExchanges
        };
      }
      
      // Fallback to Binance market data for some stats
      const binanceData = await this.getBinanceMarketData();
      if (binanceData && binanceData.length > 0) {
        // Calculate total volume from Binance data
        const totalVolume = binanceData.reduce((sum, pair) => sum + (pair.volume24h || 0), 0);
        
        return {
          totalMarketCap: 0, // Not available from this source
          totalVolume24h: totalVolume,
          btcDominance: 0, // Not available from this source
          totalCoins: binanceData.length,
          totalMarkets: binanceData.length,
          totalExchanges: 1 // Just Binance
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching crypto market overview:', error);
      return null;
    }
  }

  /**
   * Get top cryptocurrencies with detailed information
   */
  async getTopCoins(limit: number = 50): Promise<CryptoCoin[]> {
    await this.ensureInitialized();
    
    try {
      const data = await rapidApiService.getCryptoData(limit);
      
      if (!data || !data.data || !data.data.coins) {
        return [];
      }
      
      return data.data.coins.map((coin: any) => ({
        uuid: coin.uuid,
        symbol: coin.symbol,
        name: coin.name,
        price: parseFloat(coin.price),
        marketCap: parseFloat(coin.marketCap),
        volume24h: parseFloat(coin.volume24h || coin['24hVolume'] || '0'),
        change24h: parseFloat(coin.change),
        rank: coin.rank,
        iconUrl: coin.iconUrl,
        sparkline: coin.sparkline ? coin.sparkline.map((value: string) => parseFloat(value)) : []
      }));
    } catch (error) {
      console.error('Error fetching top coins:', error);
      return [];
    }
  }

  /**
   * Get specific coin data by symbol
   */
  async getCoinBySymbol(symbol: string): Promise<CryptoCoin | null> {
    await this.ensureInitialized();
    
    try {
      // Get all coins and filter by symbol
      const allCoins = await this.getTopCoins(100);
      const coin = allCoins.find(c => c.symbol === symbol);
      
      if (!coin) {
        return null;
      }
      
      return coin;
    } catch (error) {
      console.error(`Error fetching coin data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get Binance market data
   */
  async getBinanceMarketData(): Promise<CryptoMarketPair[]> {
    await this.ensureInitialized();
    
    try {
      const data = await rapidApiService.getBinanceMarketData();
      
      if (!Array.isArray(data)) {
        return [];
      }
      
      return data.map((pair: any) => {
        // Extract base and quote symbols from symbol string (e.g., "BTCUSDT")
        let baseSymbol = pair.symbol;
        let quoteSymbol = "";
        
        const commonQuotes = ["USDT", "BTC", "ETH", "BNB", "BUSD"];
        for (const quote of commonQuotes) {
          if (pair.symbol.endsWith(quote)) {
            baseSymbol = pair.symbol.substring(0, pair.symbol.length - quote.length);
            quoteSymbol = quote;
            break;
          }
        }
        
        return {
          baseSymbol,
          quoteSymbol,
          price: parseFloat(pair.lastPrice),
          volume24h: parseFloat(pair.volume),
          priceChangePercent: parseFloat(pair.priceChangePercent),
          exchange: "Binance"
        };
      }).filter((pair: CryptoMarketPair) => pair.quoteSymbol && !isNaN(pair.price));
    } catch (error) {
      console.error('Error fetching Binance market data:', error);
      return [];
    }
  }

  /**
   * Get popular trading pairs (specific base/quote combinations)
   */
  async getPopularTradingPairs(): Promise<CryptoMarketPair[]> {
    await this.ensureInitialized();
    
    try {
      const allPairs = await this.getBinanceMarketData();
      
      // Filter for popular trading pairs with USDT as quote
      const popularPairs = allPairs.filter(pair => 
        pair.quoteSymbol === "USDT" && 
        ["BTC", "ETH", "BNB", "SOL", "ADA", "XRP", "DOT", "AVAX", "MATIC"].includes(pair.baseSymbol)
      );
      
      // Sort by volume
      return popularPairs.sort((a, b) => b.volume24h - a.volume24h).slice(0, 10);
    } catch (error) {
      console.error('Error fetching popular trading pairs:', error);
      return [];
    }
  }
}

// Export singleton instance
export const cryptoMarketService = new CryptoMarketService();