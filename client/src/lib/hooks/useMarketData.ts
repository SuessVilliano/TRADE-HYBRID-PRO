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
        // Use Alpaca API for real market data
        console.log(`Fetching real market data for ${symbol}`);
        
        // Extract the ticker symbol from formats like BINANCE:BTCUSDT or BTCUSD
        const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
        
        // Use Axios to fetch real data from our API endpoint
        const response = await axios.get(`/api/market-data/history`, {
          params: {
            symbol: cleanSymbol,
            interval: '1h',
            limit: 100
          }
        });
        
        if (response.data && Array.isArray(response.data.bars)) {
          // Transform the API response into our MarketData format
          const realData: MarketData[] = response.data.bars.map((bar: any) => ({
            open: parseFloat(bar.o),
            high: parseFloat(bar.h),
            low: parseFloat(bar.l),
            close: parseFloat(bar.c),
            volume: parseFloat(bar.v),
            timestamp: new Date(bar.t).getTime()
          }));
          
          setMarketData(realData);
          
          // Set current price from the latest candle
          if (realData.length > 0) {
            setCurrentPrice(realData[realData.length - 1].close);
          }
        } else {
          // If the expected data format is not found, try an alternate approach
          const alpacaResponse = await axios.get(`/api/alpaca/bars`, {
            params: {
              symbol: cleanSymbol,
              timeframe: '1H',
              limit: 100
            }
          });
          
          if (alpacaResponse.data && Array.isArray(alpacaResponse.data)) {
            const alpacaData: MarketData[] = alpacaResponse.data.map((bar: any) => ({
              open: parseFloat(bar.o),
              high: parseFloat(bar.h),
              low: parseFloat(bar.l),
              close: parseFloat(bar.c),
              volume: parseFloat(bar.v),
              timestamp: new Date(bar.t).getTime()
            }));
            
            setMarketData(alpacaData);
            
            if (alpacaData.length > 0) {
              setCurrentPrice(alpacaData[alpacaData.length - 1].close);
            }
          } else {
            throw new Error('Invalid data format received from all API endpoints');
          }
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to fetch market data. Please check API connectivity.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a real-time data refresh interval (5 seconds)
    const interval = setInterval(async () => {
      try {
        if (!loading) {
          // Fetch just the latest price for real-time updates
          const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
          const quoteResponse = await axios.get(`/api/market-data/quote`, {
            params: { symbol: cleanSymbol }
          });
          
          if (quoteResponse.data && quoteResponse.data.price) {
            setCurrentPrice(parseFloat(quoteResponse.data.price));
          }
        }
      } catch (err) {
        console.error('Error updating real-time price:', err);
        // Don't set error state for background updates to avoid UI disruption
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [symbol]);

  // Function to place a trade order
  const placeOrder = async (tradeSuggestion: TradeSuggestion): Promise<boolean> => {
    try {
      // Send order to broker API
      const response = await axios.post('/api/broker/order', {
        symbol: tradeSuggestion.symbol,
        side: tradeSuggestion.action,
        quantity: 1, // Default quantity, should be configurable
        type: 'market',
        timeInForce: 'day',
        stopLoss: tradeSuggestion.stopLoss,
        takeProfit: tradeSuggestion.takeProfit[0] // Use first take profit level
      });
      
      if (response.data && response.data.success) {
        console.log('Order placed successfully:', response.data);
        return true;
      } else {
        console.error('Order placement failed:', response.data);
        return false;
      }
    } catch (error) {
      console.error('Error placing order:', error);
      return false;
    }
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