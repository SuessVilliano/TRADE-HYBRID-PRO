import { create } from 'zustand';
import { MarketData } from '@/lib/types';

interface MarketDataState {
  currentSymbol: string;
  currentPrice: number;
  priceHistory: { timestamp: number; price: number }[];
  highPrice: number;
  lowPrice: number;
  open: number;
  close: number;
  volume: number;
  change24h: number;
  changePercent24h: number;
  isLoading: boolean;
  isSubscribed: boolean;
  subscriptions: string[];
  marketData: MarketData[]; // Full market data array
  symbol: string; // Symbol for API compatibility
  
  // Actions
  fetchMarketData: (symbol: string) => Promise<void>;
  subscribeToRealTimeData: (symbol: string) => void;
  unsubscribeFromRealTimeData: (symbol: string) => void;
  getPriceDataPoints: (timeframe: string) => number[];
}

export const useMarketData = create<MarketDataState>((set, get) => {
  // Simulated WebSocket for price updates
  let priceUpdateInterval: NodeJS.Timeout | null = null;
  
  return {
    currentSymbol: 'BTCUSD',
    currentPrice: 72500,
    priceHistory: Array.from({ length: 24 }, (_, i) => ({
      timestamp: Date.now() - (23 - i) * 3600000,
      price: 72000 + Math.random() * 2000 - 1000
    })),
    highPrice: 73200,
    lowPrice: 71800,
    open: 72100,
    close: 72500,
    volume: 15320,
    change24h: 500,
    changePercent24h: 0.69,
    isLoading: false,
    isSubscribed: false,
    subscriptions: [],
    marketData: [], // Initialize empty marketData array
    symbol: 'BTCUSD', // Initialize symbol for API compatibility
    
    fetchMarketData: async (symbol: string) => {
      set({ isLoading: true, currentSymbol: symbol, symbol });
      
      try {
        // In a real implementation, this would call to a market data API
        await new Promise(resolve => setTimeout(resolve, 800));
        
        let basePrice: number;
        switch (symbol) {
          case 'BTCUSD':
            basePrice = 72500;
            break;
          case 'ETHUSD':
            basePrice = 3570;
            break;
          case 'EURUSD':
            basePrice = 1.0825;
            break;
          case 'XAUUSD':
            basePrice = 2184.25;
            break;
          case 'THCUSD':
            basePrice = 0.875; // THC Coin price
            break;
          default:
            basePrice = 100;
        }
        
        // Generate some realistic price history
        const now = Date.now();
        const priceHistory = Array.from({ length: 24 }, (_, i) => {
          const randomFactor = 1 + (Math.random() * 0.1 - 0.05);
          return {
            timestamp: now - (23 - i) * 3600000,
            price: basePrice * randomFactor
          };
        });
        
        const highPrice = Math.max(...priceHistory.map(p => p.price));
        const lowPrice = Math.min(...priceHistory.map(p => p.price));
        const open = priceHistory[0].price;
        const close = priceHistory[priceHistory.length - 1].price;
        const change24h = close - open;
        const changePercent24h = (change24h / open) * 100;
        
        // Create marketData for AI analysis
        const marketData = priceHistory.map((item, index) => ({
          time: Math.floor(item.timestamp / 1000), // Convert milliseconds to seconds
          open: item.price * (1 - Math.random() * 0.005),
          high: item.price * (1 + Math.random() * 0.008),
          low: item.price * (1 - Math.random() * 0.008),
          close: item.price,
          volume: Math.floor(Math.random() * 1000 + 100)
        }));
        
        set({
          currentPrice: close,
          priceHistory,
          highPrice,
          lowPrice,
          open,
          close,
          volume: Math.floor(Math.random() * 30000 + 5000),
          change24h,
          changePercent24h,
          marketData // Set the marketData for AI analysis
        });
      } catch (error) {
        console.error(`Error fetching market data for ${symbol}:`, error);
      } finally {
        set({ isLoading: false });
      }
    },
    
    subscribeToRealTimeData: (symbol: string) => {
      const { subscriptions } = get();
      
      // If already subscribed to this symbol, do nothing
      if (subscriptions.includes(symbol)) {
        return;
      }
      
      // Add to subscriptions
      set(state => ({ 
        subscriptions: [...state.subscriptions, symbol],
        isSubscribed: true
      }));
      
      // Start the interval if it's not already running
      if (!priceUpdateInterval) {
        priceUpdateInterval = setInterval(() => {
          const state = get();
          
          if (state.subscriptions.length === 0) {
            if (priceUpdateInterval) {
              clearInterval(priceUpdateInterval);
              priceUpdateInterval = null;
            }
            return;
          }
          
          // Update the current symbol if it's in the subscriptions
          if (state.subscriptions.includes(state.currentSymbol)) {
            // Generate a more realistic price movement based on the asset
            let volatilityFactor = 0.002; // Default
            
            // Adjust volatility factor based on symbol
            switch (state.currentSymbol) {
              case 'BTCUSD':
                volatilityFactor = 0.003;
                break;
              case 'ETHUSD':
                volatilityFactor = 0.004;
                break;
              case 'EURUSD':
                volatilityFactor = 0.0005;
                break;
              case 'XAUUSD':
                volatilityFactor = 0.001;
                break;
              case 'THCUSD':
                volatilityFactor = 0.005; // More volatile as new token
                break;
            }
            
            // Generate a more realistic price movement with a slight upward bias for demo purposes
            const priceChange = state.currentPrice * (Math.random() * volatilityFactor * 2 - volatilityFactor + 0.0001);
            const newPrice = state.currentPrice + priceChange;
            
            // Add to price history
            const now = Date.now();
            const newPriceHistory = [
              ...state.priceHistory,
              { timestamp: now, price: newPrice }
            ].slice(-100); // Keep last 100 data points
            
            // Update high and low if needed
            const highPrice = Math.max(state.highPrice, newPrice);
            const lowPrice = Math.min(state.lowPrice, newPrice);
            
            // Create new market data point for AI analysis
            // More realistic OHLC data
            const spread = newPrice * volatilityFactor * 0.5;
            const newMarketDataPoint = {
              time: Math.floor(now / 1000), // Convert milliseconds to seconds
              open: newPrice * (1 - Math.random() * volatilityFactor * 0.3),
              high: newPrice + (Math.random() * spread),
              low: newPrice - (Math.random() * spread),
              close: newPrice,
              volume: Math.floor(Math.random() * 100 + 10) * 
                (state.currentSymbol === 'BTCUSD' ? 10 : 1) // Higher volume for BTC
            };
            
            // Update market data array (keep last 100 points)
            const newMarketData = [...state.marketData, newMarketDataPoint].slice(-100);
            
            // Update state
            set({
              currentPrice: newPrice,
              priceHistory: newPriceHistory,
              highPrice,
              lowPrice,
              close: newPrice,
              change24h: newPrice - state.open,
              changePercent24h: ((newPrice - state.open) / state.open) * 100,
              marketData: newMarketData
            });
          }
        }, 2000); // Update more frequently
      }
    },
    
    unsubscribeFromRealTimeData: (symbol: string) => {
      set(state => {
        const newSubscriptions = state.subscriptions.filter(s => s !== symbol);
        
        // If no more subscriptions, stop the interval
        if (newSubscriptions.length === 0 && priceUpdateInterval) {
          clearInterval(priceUpdateInterval);
          priceUpdateInterval = null;
        }
        
        return {
          subscriptions: newSubscriptions,
          isSubscribed: newSubscriptions.length > 0
        };
      });
    },
    
    getPriceDataPoints: (timeframe: string) => {
      const { priceHistory } = get();
      
      // Return last N data points based on timeframe
      let dataPoints = 24; // Default 24 hours
      
      switch (timeframe) {
        case '1h':
          dataPoints = 6;
          break;
        case '4h':
          dataPoints = 12;
          break;
        case '1d':
          dataPoints = 24;
          break;
        case '1w':
          dataPoints = 24;
          break;
        case '1m':
          dataPoints = 24;
          break;
      }
      
      return priceHistory.slice(-dataPoints).map(item => item.price);
    }
  };
});