import { create } from "zustand";
import { MarketData } from "@/lib/types";
import { apiRequest } from "@/lib/queryClient";
import { IronBeamService } from "@/lib/services/ironbeam-service";
import { MarketData as BrokerMarketData } from "@/lib/services/broker-service";

// Initialize the IronBeam service with API credentials
const ironBeamService = new IronBeamService(
  "51364392", // Demo username
  "136bdde6773045ef86aa4026e6edddb4", // API key
  true // Use demo environment
);

// Define a type for data from the broker API
type BrokerDataPoint = {
  symbol: string;
  price: number;
  timestamp: number;
  volume?: number;
  high?: number;
  low?: number;
  open?: number;
  close?: number;
};

interface MarketDataState {
  marketData: MarketData[];
  symbol: string;
  currentPrice: number;
  loading: boolean;
  connected: boolean;
  
  fetchMarketData: (symbol: string) => Promise<void>;
  subscribeToRealTimeData: (symbol: string) => void;
  unsubscribeFromRealTimeData: (symbol: string) => void;
  addMarketDataPoint: (data: BrokerDataPoint) => void;
}

export const useMarketData = create<MarketDataState>((set, get) => ({
  marketData: [],
  symbol: "BTCUSD",
  currentPrice: 35000,
  loading: false,
  connected: false,
  
  fetchMarketData: async (symbol: string) => {
    set({ loading: true, symbol });
    
    try {
      console.log(`Fetching market data for ${symbol} from IronBeam API...`);
      
      // First, ensure we're connected to the API
      if (!get().connected) {
        try {
          await ironBeamService.connect();
          set({ connected: true });
          console.log("Connected to IronBeam API");
        } catch (error) {
          console.error("Failed to connect to IronBeam API:", error);
          throw error;
        }
      }
      
      // API call to get historical data
      try {
        // Map market symbol to IronBeam expected format
        const ironBeamSymbol = mapSymbolToIronBeam(symbol);
        
        // For now, use apiRequest for historical data and IronBeam for real-time
        const response = await apiRequest("GET", `/api/market/data?symbol=${symbol}`);
        const data = await response.json();
        
        // Get the latest price
        const latestPrice = data.length > 0 ? data[data.length - 1].close : 0;
        
        set({ 
          marketData: data,
          currentPrice: latestPrice,
          loading: false 
        });
        
        // Subscribe to real-time updates
        get().subscribeToRealTimeData(ironBeamSymbol);
        
      } catch (error) {
        console.error(`Failed to fetch market data for ${symbol}:`, error);
        throw error;
      }
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
  
  subscribeToRealTimeData: (symbol: string) => {
    if (!get().connected) {
      console.warn("Cannot subscribe to real-time data: not connected to API");
      return;
    }
    
    console.log(`Subscribing to real-time data for ${symbol}...`);
    ironBeamService.subscribeToMarketData(symbol, (brokerData: BrokerMarketData) => {
      // Convert broker market data to our application's market data format
      const appData: BrokerDataPoint = {
        symbol: brokerData.symbol,
        price: brokerData.price,
        timestamp: brokerData.timestamp,
        volume: brokerData.volume,
        high: brokerData.high,
        low: brokerData.low,
        open: brokerData.open,
        close: brokerData.close
      };
      
      get().addMarketDataPoint(appData);
    });
  },
  
  unsubscribeFromRealTimeData: (symbol: string) => {
    console.log(`Unsubscribing from real-time data for ${symbol}...`);
    ironBeamService.unsubscribeFromMarketData(symbol);
  },
  
  addMarketDataPoint: (data: BrokerDataPoint) => {
    if (data.symbol !== mapSymbolToIronBeam(get().symbol)) return;
    
    console.log(`Received real-time data point for ${data.symbol}:`, data);
    
    // Create a market data point from the real-time data
    const marketDataPoint: MarketData = {
      time: data.timestamp / 1000, // Convert to seconds if needed
      open: data.open || data.price,
      high: data.high || data.price,
      low: data.low || data.price,
      close: data.close || data.price,
      volume: data.volume || 0
    };
    
    // Add the new data point to the market data array
    const updatedMarketData = [...get().marketData, marketDataPoint];
    
    // Update state
    set({
      marketData: updatedMarketData,
      currentPrice: data.price
    });
  }
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

// Helper to map our application symbols to IronBeam API expected format
function mapSymbolToIronBeam(symbol: string): string {
  // IronBeam might use different symbol conventions
  switch (symbol) {
    case "BTCUSD":
      return "BTC/USD";
    case "ETHUSD":
      return "ETH/USD";
    case "EURUSD":
      return "EUR/USD";
    case "AAPL":
      return "AAPL";
    case "MSFT":
      return "MSFT";
    default:
      return symbol;
  }
}
