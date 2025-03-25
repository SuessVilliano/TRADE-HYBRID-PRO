import { create } from "zustand";
import { MarketData } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";

interface MarketDataState {
  marketData: MarketData[];
  symbol: string;
  currentPrice: number;
  loading: boolean;
  
  fetchMarketData: (symbol: string) => Promise<void>;
}

export const useMarketData = create<MarketDataState>((set, get) => ({
  marketData: [],
  symbol: "BTCUSD",
  currentPrice: 35000,
  loading: false,
  
  fetchMarketData: async (symbol: string) => {
    set({ loading: true, symbol });
    
    try {
      const response = await apiRequest("GET", `/api/market/data?symbol=${symbol}`);
      const data = await response.json();
      
      // Get the latest price
      const latestPrice = data.length > 0 ? data[data.length - 1].close : 0;
      
      set({ 
        marketData: data,
        currentPrice: latestPrice,
        loading: false 
      });
    } catch (error) {
      console.error("Failed to fetch market data:", error);
      
      // Fallback to mock data for development
      const mockData = generateMockData(symbol, 100);
      const latestPrice = mockData[mockData.length - 1].close;
      
      set({ 
        marketData: mockData,
        currentPrice: latestPrice,
        loading: false 
      });
    }
  },
}));

// Helper function to generate mock market data
function generateMockData(symbol: string, count: number): MarketData[] {
  const data: MarketData[] = [];
  let basePrice = getBasePrice(symbol);
  
  // Generate data for the past 'count' time periods
  const now = new Date();
  now.setHours(now.getHours() - count);
  
  for (let i = 0; i < count; i++) {
    // Random price change (-2% to +2%)
    const change = (Math.random() * 4 - 2) / 100;
    const changeAmount = basePrice * change;
    
    // Calculate OHLC
    const open = basePrice;
    const close = basePrice + changeAmount;
    const high = Math.max(open, close) + Math.random() * Math.abs(changeAmount) * 0.5;
    const low = Math.min(open, close) - Math.random() * Math.abs(changeAmount) * 0.5;
    
    // Add some volume
    const volume = Math.floor(Math.random() * 1000) + 100;
    
    // Create timestamp (1 hour intervals)
    const timestamp = new Date(now);
    timestamp.setHours(timestamp.getHours() + i);
    
    data.push({
      time: timestamp.getTime() / 1000, // Convert to seconds
      open,
      high,
      low,
      close,
      volume
    });
    
    // Update base price for next iteration
    basePrice = close;
  }
  
  return data;
}

// Helper to get a reasonable base price for different assets
function getBasePrice(symbol: string): number {
  switch (symbol) {
    case "BTCUSD":
      return 35000 + Math.random() * 5000;
    case "ETHUSD":
      return 2000 + Math.random() * 300;
    case "EURUSD":
      return 1.08 + Math.random() * 0.02;
    case "AAPL":
      return 180 + Math.random() * 20;
    case "MSFT":
      return 330 + Math.random() * 30;
    default:
      return 100 + Math.random() * 20;
  }
}
