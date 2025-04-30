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
  placeOrder: (tradeSuggestion: TradeSuggestion) => Promise<{success: boolean, message: string, orderId?: string}>;
  refreshData: () => Promise<void>;
  setAutoRefresh: (enabled: boolean) => void;
  autoRefreshEnabled: boolean;
}

export const useMarketData = (): MarketDataHook => {
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState<string>('BINANCE:SOLUSDT');
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [autoRefreshEnabled, setAutoRefresh] = useState<boolean>(false); // Default to disabled to reduce API calls

  // Manually refresh market data (for on-demand updates)
  const refreshData = useCallback(async (): Promise<void> => {
    if (loading) return; // Skip if already loading
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Manual refresh of market data for ${symbol}`);
      
      // Extract the ticker symbol from formats like BINANCE:BTCUSDT or BTCUSD
      const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
      
      // Use the appropriate API endpoint with use_cache param
      const response = await axios.get(`/api/market-data/history`, {
        params: {
          symbol: cleanSymbol,
          interval: '1h',
          limit: 100,
          use_cache: 'prefer' // Use cache if available, but refresh if older than TTL
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
      console.error('Error refreshing market data:', err);
      
      // Provide a more specific error message based on the type of error
      let errorMessage = 'Failed to refresh market data. ';
      
      if (axios.isAxiosError(err)) {
        if (err.response) {
          // The request was made and the server responded with an error status
          if (err.response.status === 429) {
            errorMessage += 'Rate limit exceeded. Please try again in a few minutes.';
          } else if (err.response.status === 401 || err.response.status === 403) {
            errorMessage += 'Authentication failed. Please check your API credentials.';
          } else if (err.response.status === 404) {
            errorMessage += 'The requested data was not found. The symbol may be invalid.';
          } else if (err.response.status >= 500) {
            errorMessage += 'The server encountered an error. Please try again later.';
          } else {
            errorMessage += `Error code: ${err.response.status}. ${err.response.statusText || ''}`;
          }
        } else if (err.request) {
          // The request was made but no response was received
          errorMessage += 'No response received from API. Please check your internet connection.';
        } else {
          // Something happened in setting up the request
          errorMessage += err.message;
        }
      } else {
        // Not an Axios error
        errorMessage += String(err);
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [symbol, loading]);

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
        
        // Provide a more specific error message based on the type of error
        let errorMessage = 'Failed to fetch market data. ';
        
        if (axios.isAxiosError(err)) {
          if (err.response) {
            // The request was made and the server responded with an error status
            console.error('API Error Details:', {
              status: err.response.status,
              statusText: err.response.statusText,
              data: err.response.data
            });
            
            if (err.response.status === 401 || err.response.status === 403) {
              errorMessage += 'Authentication failed. Please check your API credentials.';
            } else if (err.response.status === 404) {
              errorMessage += 'The requested data was not found. The symbol may be invalid.';
            } else if (err.response.status >= 500) {
              errorMessage += 'The server encountered an error. Please try again later.';
            } else {
              errorMessage += `Error code: ${err.response.status}. ${err.response.statusText || ''}`;
            }
          } else if (err.request) {
            // The request was made but no response was received
            console.error('No response received from API');
            errorMessage += 'No response received from API. Please check your internet connection.';
          } else {
            // Something happened in setting up the request
            errorMessage += err.message;
          }
        } else {
          // Not an Axios error
          errorMessage += String(err);
        }
        
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
    
    // Set up a real-time data refresh interval - now 30 seconds instead of 5 seconds
    // Only runs if auto-refresh is enabled
    const interval = setInterval(async () => {
      // Skip updates if we're already loading data or auto-refresh is disabled
      if (loading || !autoRefreshEnabled) return;
      
      try {
        // Fetch just the latest price for real-time updates
        const cleanSymbol = symbol.includes(':') ? symbol.split(':')[1] : symbol;
        const quoteResponse = await axios.get(`/api/market-data/quote`, {
          params: { 
            symbol: cleanSymbol,
            use_cache: 'true' // Prefer cached data to reduce API calls
          }
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
    }, 30000); // Changed from 5000ms (5s) to 30000ms (30s) to reduce API calls
    
    return () => clearInterval(interval);
  }, [symbol, isForexSymbol, loading, marketData, autoRefreshEnabled]); // Added autoRefreshEnabled to dependencies

  // Function to place a trade order
  const placeOrder = async (tradeSuggestion: TradeSuggestion): Promise<{success: boolean, message: string, orderId?: string}> => {
    try {
      // Determine the broker to use based on the symbol
      const isForex = isForexSymbol(tradeSuggestion.symbol);
      const broker = isForex ? 'Oanda' : 'Alpaca';
      const endpoint = isForex ? '/api/brokers/oanda/order' : '/api/brokers/alpaca/order';
      
      // Convert the symbol format if needed
      let orderSymbol = tradeSuggestion.symbol;
      if (isForex && !orderSymbol.includes('_') && orderSymbol.length === 6) {
        // Convert EURUSD to EUR_USD format for Oanda
        orderSymbol = `${orderSymbol.substring(0, 3)}_${orderSymbol.substring(3, 6)}`;
      }
      
      console.log(`Placing ${tradeSuggestion.action} order for ${orderSymbol} via ${broker}...`);
      
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
        console.log(`Order placed successfully with ${broker}:`, response.data);
        return {
          success: true,
          message: `Order successfully placed with ${broker}. ${tradeSuggestion.action.toUpperCase()} ${orderSymbol} at market price.`,
          orderId: response.data.orderId || response.data.id
        };
      } else {
        console.error(`Order placement failed with ${broker}:`, response.data);
        return {
          success: false,
          message: `Failed to place order with ${broker}. ${response.data.error || 'Unknown error'}`
        };
      }
    } catch (error) {
      console.error('Error placing order:', error);
      
      // Provide a more informative error message
      let errorMessage = 'Failed to place order. ';
      
      if (axios.isAxiosError(error)) {
        if (error.response) {
          // The request was made and the server responded with an error status
          if (error.response.status === 401 || error.response.status === 403) {
            errorMessage += 'Authentication failed. Please check your broker API credentials.';
          } else if (error.response.status === 400) {
            errorMessage += `Invalid order parameters: ${error.response.data?.message || 'Please check your order details.'}`;
          } else if (error.response.status >= 500) {
            errorMessage += 'The broker API server encountered an error. Please try again later.';
          } else {
            errorMessage += `Error code: ${error.response.status}. ${error.response.data?.message || ''}`;
          }
        } else if (error.request) {
          // The request was made but no response was received
          errorMessage += 'No response received from the broker API. Please check your internet connection.';
        } else {
          // Something happened in setting up the request
          errorMessage += error.message;
        }
      } else {
        // Not an Axios error
        errorMessage += String(error);
      }
      
      return {
        success: false,
        message: errorMessage
      };
    }
  };

  return {
    marketData,
    loading,
    error,
    symbol,
    setSymbol,
    currentPrice,
    placeOrder,
    refreshData,
    setAutoRefresh,
    autoRefreshEnabled
  };
};