import { useState, useEffect } from 'react';
import axios from 'axios';

export interface MarketData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: number;
}

export interface TradeSuggestion {
  symbol: string;
  action: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number[];
  timeframe: string;
  rationale: string[];
  riskReward: number;
  confidenceScore: number;
}

interface MarketDataHook {
  marketData: MarketData[];
  loading: boolean;
  error: string | null;
  symbol: string;
  setSymbol: (symbol: string) => void;
  currentPrice: number | null;
  placeOrder: (tradeSuggestion: TradeSuggestion) => Promise<boolean>;
}

export const useMarketData = (): MarketDataHook => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('BINANCE:SOLUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);

  // Fetch market data when symbol changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // In a real implementation, this would call an actual API to get historical data
        // For now, we'll simulate with generated data
        
        // In a real API, this would be called like:
        // const response = await axios.get(`/api/market-data?symbol=${symbol}&interval=1h&limit=100`);
        // const data = response.data;
        
        // Generate simulated market data
        const simulatedData: MarketData[] = [];
        let basePrice = symbol.includes('BTC') ? 60000 : 
                       symbol.includes('ETH') ? 3000 : 
                       symbol.includes('SOL') ? 100 : 
                       symbol.includes('XAU') ? 2000 : 1000;
        
        const now = Date.now();
        
        // Generate 100 candles (1h intervals)
        for (let i = 0; i < 100; i++) {
          const timestamp = now - (99 - i) * 60 * 60 * 1000; // 1h intervals back in time
          const volatility = basePrice * (0.005 + Math.random() * 0.01); // 0.5-1.5% volatility
          
          // Add some trend to the data
          if (i > 0) {
            basePrice = simulatedData[i - 1].close;
          }
          
          const change = (Math.random() - 0.45) * volatility; // Slightly bullish bias
          const open = basePrice;
          const close = basePrice + change;
          const high = Math.max(open, close) + Math.random() * volatility * 0.5;
          const low = Math.min(open, close) - Math.random() * volatility * 0.5;
          const volume = 1000 + Math.random() * 9000; // 1000-10000 volume
          
          simulatedData.push({
            open,
            high,
            low,
            close,
            volume,
            timestamp
          });
        }
        
        setMarketData(simulatedData);
        setCurrentPrice(simulatedData[simulatedData.length - 1].close);
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to fetch market data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a refresh interval
    const interval = setInterval(() => {
      if (marketData.length > 0) {
        // Update current price with some random movement
        const lastPrice = marketData[marketData.length - 1].close;
        const volatility = lastPrice * 0.0025; // 0.25% volatility
        const newPrice = lastPrice + (Math.random() - 0.5) * volatility * 2;
        setCurrentPrice(newPrice);
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  // Function to place a trade order
  const placeOrder = async (tradeSuggestion: TradeSuggestion): Promise<boolean> => {
    // In a real implementation, this would call an API to place an order with your broker
    // For now, we'll just log it and return success
    
    console.log('Placing order:', tradeSuggestion);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return true;
  };

  return {
    marketData,
    loading,
    error,
    symbol,
    setSymbol,
    currentPrice,
    placeOrder
  };
};