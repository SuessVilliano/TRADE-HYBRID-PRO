import { create } from 'zustand';

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
    
    fetchMarketData: async (symbol: string) => {
      set({ isLoading: true, currentSymbol: symbol });
      
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
        
        set({
          currentPrice: close,
          priceHistory,
          highPrice,
          lowPrice,
          open,
          close,
          volume: Math.floor(Math.random() * 30000 + 5000),
          change24h,
          changePercent24h
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
            // Generate a random price movement
            const priceChange = state.currentPrice * (Math.random() * 0.004 - 0.002);
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
            
            // Update state
            set({
              currentPrice: newPrice,
              priceHistory: newPriceHistory,
              highPrice,
              lowPrice,
              close: newPrice,
              change24h: newPrice - state.open,
              changePercent24h: ((newPrice - state.open) / state.open) * 100
            });
          }
        }, 3000);
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