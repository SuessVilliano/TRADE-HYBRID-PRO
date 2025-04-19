import { useState, useEffect, useCallback } from 'react';
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

  // Function to determine if a symbol is forex
  const isForexSymbol = useCallback((symbolStr: string): boolean => {
    // Clean the symbol first
    const cleanSymbol = symbolStr.includes(':') ? symbolStr.split(':')[1] : symbolStr;
    
    // Check if it follows common forex patterns
    return /^[A-Z]{3}_[A-Z]{3}$/.test(cleanSymbol) || 
           (/^[A-Z]{6}$/.test(cleanSymbol) && 
            ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'NZD'].some(
              currency => cleanSymbol.includes(currency)
            ));
  }, []);

  // Fetch market data when symbol changes
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching real market data for ${symbol}`);
        
        // Extract the ticker symbol from formats like BINANCE:BTCUSDT or BTCUSD
        const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
        
        // Determine if this is a forex pair
        const isForex = isForexSymbol(cleanSymbol);
        console.log(`Symbol ${cleanSymbol} identified as ${isForex ? 'forex' : 'stock/crypto'}`);
        
        // Use the appropriate API endpoint based on the symbol type
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
            volume: parseFloat(bar.v || '0'), // Some forex data might not have volume
            timestamp: new Date(bar.t).getTime()
          }));
          
          setMarketData(realData);
          
          // Set current price from the latest candle
          if (realData.length > 0) {
            setCurrentPrice(realData[realData.length - 1].close);
          }
          
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching market data:', err);
        setError('Failed to fetch market data. Please check API connectivity.');
        
        // Add more diagnostic information to help troubleshoot
        if (axios.isAxiosError(err) && err.response) {
          console.error('API Error Details:', {
            status: err.response.status,
            statusText: err.response.statusText,
            data: err.response.data
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a real-time data refresh interval (5 seconds)
    const interval = setInterval(async () => {
      if (loading) return; // Skip updates if we're already loading data
      
      try {
        // Fetch just the latest price for real-time updates
        const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
        const quoteResponse = await axios.get(`/api/market-data/quote`, {
          params: { symbol: cleanSymbol }
        });
        
        if (quoteResponse.data && quoteResponse.data.price) {
          // Update the current price
          setCurrentPrice(parseFloat(quoteResponse.data.price));
          
          // If we have market data, also update the last candle's close price
          // This keeps the chart up-to-date with the latest price
          if (marketData.length > 0) {
            const updatedMarketData = [...marketData];
            const lastIndex = updatedMarketData.length - 1;
            
            // Only update if the last candle is the current period
            const lastCandle = updatedMarketData[lastIndex];
            const now = Date.now();
            const timeDiff = now - lastCandle.timestamp;
            const isCurrentPeriod = timeDiff < 60 * 60 * 1000; // 1 hour in milliseconds
            
            if (isCurrentPeriod) {
              // Update the last candle
              updatedMarketData[lastIndex] = {
                ...lastCandle,
                close: parseFloat(quoteResponse.data.price),
                high: Math.max(lastCandle.high, parseFloat(quoteResponse.data.price)),
                low: Math.min(lastCandle.low, parseFloat(quoteResponse.data.price))
              };
              setMarketData(updatedMarketData);
            }
          }
        }
      } catch (err) {
        console.error('Error updating real-time price:', err);
        // Don't set error state for background updates to avoid UI disruption
      }
    }, 5000);
    
    return () => clearInterval(interval);
  }, [symbol, isForexSymbol, loading, marketData]);

  // Function to place a trade order
  const placeOrder = async (tradeSuggestion: TradeSuggestion): Promise<boolean> => {
    try {
      // Determine the broker to use based on the symbol
      const isForex = isForexSymbol(tradeSuggestion.symbol);
      const endpoint = isForex ? '/api/brokers/oanda/order' : '/api/brokers/alpaca/order';
      
      // Convert the symbol format if needed
      let orderSymbol = tradeSuggestion.symbol;
      if (isForex && !orderSymbol.includes('_') && orderSymbol.length === 6) {
        // Convert EURUSD to EUR_USD format for Oanda
        orderSymbol = `${orderSymbol.substring(0, 3)}_${orderSymbol.substring(3, 6)}`;
      }
      
      // Send order to the appropriate broker API
      const response = await axios.post(endpoint, {
        symbol: orderSymbol,
        side: tradeSuggestion.action,
        quantity: 1, // Default quantity, should be configurable
        type: 'market',
        timeInForce: 'day',
        stopLoss: tradeSuggestion.stopLoss,
        takeProfit: tradeSuggestion.takeProfit[0] // Use first take profit level
      });
      
      if (response.data && response.data.success) {
        console.log(`Order placed successfully with ${isForex ? 'Oanda' : 'Alpaca'}:`, response.data);
        return true;
      } else {
        console.error(`Order placement failed with ${isForex ? 'Oanda' : 'Alpaca'}:`, response.data);
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