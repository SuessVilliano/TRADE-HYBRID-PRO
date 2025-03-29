import { create } from 'zustand';

// Define types for events and price data
interface MarketEvent {
  id: string;
  timestamp: number;
  message: string;
  impact: number; // Positive or negative impact on price
  type: 'news' | 'earnings' | 'economic' | 'regulatory';
}

interface PricePoint {
  timestamp: number;
  price: number;
}

interface PriceState {
  prices: PricePoint[];
  currentPrice: number;
  marketTrend: 'bullish' | 'bearish' | 'neutral';
  volatility: number;
  gameEvents: MarketEvent[];
  simulationInterval: NodeJS.Timeout | null;
  
  // Actions
  generatePrices: (numPoints: number, startPrice: number) => void;
  updatePrice: (price: number) => void;
  updateMarketTrend: () => void;
  addMarketEvent: (event: Omit<MarketEvent, 'id' | 'timestamp'>) => void;
  simulateMarketCycle: (intervalMs: number, duration?: number) => void;
  stopSimulation: () => void;
  resetPriceStore: () => void;
}

// Market event templates for simulation
const marketEventTemplates = [
  // Bullish events
  { message: "New THC token use case announced", impact: 15, type: 'news' as const },
  { message: "Major exchange listing confirmed", impact: 25, type: 'news' as const },
  { message: "Positive regulatory clarity provided", impact: 20, type: 'regulatory' as const },
  { message: "Trading volume surges 50%", impact: 10, type: 'news' as const },
  { message: "Institutional adoption increases", impact: 15, type: 'news' as const },
  { message: "Technical indicators show bullish pattern", impact: 10, type: 'news' as const },
  
  // Bearish events
  { message: "Security vulnerability discovered", impact: -20, type: 'news' as const },
  { message: "Regulatory concerns in key market", impact: -15, type: 'regulatory' as const },
  { message: "Major holder liquidates position", impact: -25, type: 'news' as const },
  { message: "Community dispute threatens governance", impact: -10, type: 'news' as const },
  { message: "Competing token launches with better features", impact: -15, type: 'news' as const },
  { message: "Technical analysis shows bearish trend", impact: -10, type: 'news' as const },
  
  // Neutral/mixed events
  { message: "Development milestone reached", impact: 5, type: 'news' as const },
  { message: "Community governance proposal vote in progress", impact: 0, type: 'news' as const },
  { message: "Market trading sideways amid uncertainty", impact: -2, type: 'news' as const },
  { message: "Trading competition announced", impact: 3, type: 'news' as const },
];

// Create the price store
export const usePriceStore = create<PriceState>()((set, get) => ({
  prices: [],
  currentPrice: 100,
  marketTrend: 'neutral',
  volatility: 0.5, // Scale of 0 to 1
  gameEvents: [],
  simulationInterval: null,
  
  // Generate historical price data points
  generatePrices: (numPoints: number, startPrice: number) => {
    const prices: PricePoint[] = [];
    let currentPrice = startPrice;
    const now = Date.now();
    
    for (let i = 0; i < numPoints; i++) {
      // Generate a timestamp with even spacing
      const timestamp = now - (numPoints - i) * 1000;
      
      // Add some random walk to the price
      const change = (Math.random() - 0.5) * 5;
      currentPrice = Math.max(1, currentPrice + change);
      
      prices.push({
        timestamp,
        price: currentPrice,
      });
    }
    
    set({ 
      prices,
      currentPrice
    });
    
    // Determine initial market trend
    get().updateMarketTrend();
  },
  
  // Update the current price
  updatePrice: (price: number) => {
    const { prices } = get();
    const timestamp = Date.now();
    
    // Add the new price point
    const updatedPrices = [
      ...prices,
      { timestamp, price }
    ];
    
    // Keep only the last 100 price points to limit memory usage
    const limitedPrices = updatedPrices.slice(-100);
    
    set({ 
      prices: limitedPrices,
      currentPrice: price,
    });
    
    // Update market trend based on recent prices
    get().updateMarketTrend();
  },
  
  // Determine market trend based on recent price movement
  updateMarketTrend: () => {
    const { prices } = get();
    
    if (prices.length < 10) {
      set({ marketTrend: 'neutral' });
      return;
    }
    
    // Look at the last 10 prices to determine trend
    const recentPrices = prices.slice(-10);
    const firstPrice = recentPrices[0].price;
    const lastPrice = recentPrices[recentPrices.length - 1].price;
    
    const priceDiff = lastPrice - firstPrice;
    const percentChange = (priceDiff / firstPrice) * 100;
    
    // Determine trend based on percentage change
    let trend: 'bullish' | 'bearish' | 'neutral';
    if (percentChange > 2) {
      trend = 'bullish';
    } else if (percentChange < -2) {
      trend = 'bearish';
    } else {
      trend = 'neutral';
    }
    
    set({ marketTrend: trend });
  },
  
  // Add a market event
  addMarketEvent: (event) => {
    const { gameEvents } = get();
    const timestamp = Date.now();
    const id = `event-${timestamp}-${Math.floor(Math.random() * 1000)}`;
    
    const newEvent: MarketEvent = {
      ...event,
      id,
      timestamp,
    };
    
    // Update the current price based on the event impact
    const { currentPrice } = get();
    const priceChange = (event.impact / 100) * currentPrice;
    const newPrice = currentPrice + priceChange;
    
    // Add the event and update the price
    set({ 
      gameEvents: [...gameEvents, newEvent],
    });
    
    // Update price with a small delay to show cause-effect
    setTimeout(() => {
      get().updatePrice(Math.max(1, newPrice));
    }, 500);
  },
  
  // Simulate price changes and events over time
  simulateMarketCycle: (intervalMs: number, duration?: number) => {
    // Clear any existing simulation
    get().stopSimulation();
    
    // Set up interval to update prices
    const interval = setInterval(() => {
      const { currentPrice, volatility } = get();
      
      // Random price change, influenced by volatility
      const maxChange = currentPrice * 0.02 * volatility; // Max 2% change
      const change = (Math.random() - 0.5) * maxChange * 2;
      const newPrice = Math.max(1, currentPrice + change);
      
      // Update price
      get().updatePrice(newPrice);
      
      // Randomly trigger market events
      if (Math.random() < 0.05) { // 5% chance per interval
        const templates = marketEventTemplates;
        const template = templates[Math.floor(Math.random() * templates.length)];
        
        get().addMarketEvent({
          message: template.message,
          impact: template.impact,
          type: template.type,
        });
      }
    }, intervalMs);
    
    set({ simulationInterval: interval });
    
    // If duration specified, stop after that time
    if (duration) {
      setTimeout(() => {
        get().stopSimulation();
      }, duration);
    }
  },
  
  // Stop the price simulation
  stopSimulation: () => {
    const { simulationInterval } = get();
    
    if (simulationInterval) {
      clearInterval(simulationInterval);
      set({ simulationInterval: null });
    }
  },
  
  // Reset the entire price store
  resetPriceStore: () => {
    get().stopSimulation();
    
    set({
      prices: [],
      currentPrice: 100,
      marketTrend: 'neutral',
      volatility: 0.5,
      gameEvents: [],
      simulationInterval: null,
    });
  },
}));

// We already have updateMarketTrend implemented in the store, 
// so we don't need to add it again