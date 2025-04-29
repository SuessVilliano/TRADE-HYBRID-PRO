import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Define interfaces for our data
interface MarketQuote {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  timestamp: string;
  provider: string;
}

interface MarketCandle {
  t: string; // timestamp ISO string
  o: number; // open
  h: number; // high
  l: number; // low
  c: number; // close
  v: number; // volume
}

interface MarketHistoryResponse {
  symbol: string;
  interval: string;
  bars: MarketCandle[];
  count: number;
  provider: string;
  status: string;
}

interface MarketProvider {
  id: string;
  name: string;
  description: string;
  type: 'traditional' | 'rapidapi';
  asset_classes: string[];
  requires_api_key: boolean;
  documentation_url: string;
}

interface RapidAPIMarketDashboardProps {
  rapidApiKey?: string;
}

const RapidAPIMarketDashboard: React.FC<RapidAPIMarketDashboardProps> = ({ rapidApiKey }) => {
  // State
  const [symbol, setSymbol] = useState<string>('AAPL');
  const [interval, setInterval] = useState<string>('1h');
  const [quote, setQuote] = useState<MarketQuote | null>(null);
  const [history, setHistory] = useState<MarketCandle[]>([]);
  const [providers, setProviders] = useState<MarketProvider[]>([]);
  const [selectedProvider, setSelectedProvider] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>(rapidApiKey || '');

  // Fetch providers on component mount
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const response = await axios.get('/api/market-data/providers');
        if (response.data && response.data.providers) {
          setProviders(response.data.providers);
          
          // Default to first RapidAPI provider if available
          const rapidApiProviders = response.data.providers.filter(
            (p: MarketProvider) => p.type === 'rapidapi'
          );
          if (rapidApiProviders.length > 0) {
            setSelectedProvider(rapidApiProviders[0].id);
          }
        }
      } catch (err) {
        console.error('Error fetching providers:', err);
        setError('Failed to load market data providers');
      }
    };

    fetchProviders();
  }, []);

  // Fetch quote when symbol or provider changes
  useEffect(() => {
    if (!symbol) return;
    
    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params: any = { symbol };
        
        if (apiKey) {
          params.rapidApiKey = apiKey;
        }
        
        if (selectedProvider) {
          params.provider = selectedProvider;
        }
        
        const response = await axios.get('/api/market-data/quote', { params });
        
        if (response.data && response.data.price) {
          setQuote(response.data);
        } else {
          setError('Unable to fetch quote');
          setQuote(null);
        }
      } catch (err) {
        console.error('Error fetching quote:', err);
        setError('Failed to load market data');
        setQuote(null);
      } finally {
        setLoading(false);
      }
    };

    fetchQuote();
  }, [symbol, selectedProvider, apiKey]);

  // Fetch history when symbol, interval, or provider changes
  useEffect(() => {
    if (!symbol || !interval) return;
    
    const fetchHistory = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const params: any = { 
          symbol, 
          interval,
          limit: 20 
        };
        
        if (apiKey) {
          params.rapidApiKey = apiKey;
        }
        
        if (selectedProvider) {
          params.provider = selectedProvider;
        }
        
        const response = await axios.get<MarketHistoryResponse>('/api/market-data/history', { params });
        
        if (response.data && response.data.bars) {
          setHistory(response.data.bars);
        } else {
          setError('Unable to fetch historical data');
          setHistory([]);
        }
      } catch (err) {
        console.error('Error fetching history:', err);
        setError('Failed to load historical market data');
        setHistory([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [symbol, interval, selectedProvider, apiKey]);

  // Format price with appropriate decimals
  const formatPrice = (price: number): string => {
    if (price >= 1000) {
      return price.toFixed(2);
    } else if (price >= 100) {
      return price.toFixed(3);
    } else if (price >= 1) {
      return price.toFixed(4);
    } else {
      return price.toFixed(6);
    }
  };

  return (
    <div className="p-4 bg-gray-900 text-white rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Market Data Dashboard</h2>
      
      {/* API Key Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium mb-1">RapidAPI Key</label>
        <div className="flex space-x-2">
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="Enter your RapidAPI key"
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
        <p className="text-xs text-gray-400 mt-1">
          Required for accessing RapidAPI data providers
        </p>
      </div>
      
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-1">Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
            placeholder="e.g. AAPL, BTCUSDT"
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Interval</label>
          <select
            value={interval}
            onChange={(e) => setInterval(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="1m">1 Minute</option>
            <option value="5m">5 Minutes</option>
            <option value="15m">15 Minutes</option>
            <option value="30m">30 Minutes</option>
            <option value="1h">1 Hour</option>
            <option value="4h">4 Hours</option>
            <option value="1d">1 Day</option>
            <option value="1w">1 Week</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Provider</label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded text-white"
          >
            <option value="">Auto (Best Available)</option>
            {providers.map((provider) => (
              <option key={provider.id} value={provider.id}>
                {provider.name} ({provider.type})
              </option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-white">
          <p className="font-medium">Error</p>
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      {/* Loading Indicator */}
      {loading && (
        <div className="mb-4 p-3 bg-gray-800 rounded text-white">
          <p className="animate-pulse">Loading market data...</p>
        </div>
      )}
      
      {/* Quote Display */}
      {quote && (
        <div className="mb-6 p-4 bg-gray-800 rounded">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold">{symbol}</h3>
            <span className="text-xs text-gray-400">
              Provider: {quote.provider}
            </span>
          </div>
          
          <div className="mt-2">
            <div className="text-3xl font-bold text-green-500">
              ${formatPrice(quote.price)}
            </div>
            
            {quote.bid && quote.ask && (
              <div className="mt-1 flex space-x-4 text-sm">
                <span>Bid: ${formatPrice(quote.bid)}</span>
                <span>Ask: ${formatPrice(quote.ask)}</span>
              </div>
            )}
            
            <div className="mt-1 text-xs text-gray-400">
              Last updated: {new Date(quote.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      )}
      
      {/* History Display */}
      {history.length > 0 && (
        <div className="overflow-x-auto">
          <h3 className="text-lg font-bold mb-2">Historical Data</h3>
          <table className="min-w-full bg-gray-800 rounded">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Time</th>
                <th className="px-4 py-2 text-right">Open</th>
                <th className="px-4 py-2 text-right">High</th>
                <th className="px-4 py-2 text-right">Low</th>
                <th className="px-4 py-2 text-right">Close</th>
                <th className="px-4 py-2 text-right">Volume</th>
              </tr>
            </thead>
            <tbody>
              {history.map((candle, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-750'}>
                  <td className="px-4 py-2 text-gray-300">
                    {new Date(candle.t).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-right">${formatPrice(candle.o)}</td>
                  <td className="px-4 py-2 text-right">${formatPrice(candle.h)}</td>
                  <td className="px-4 py-2 text-right">${formatPrice(candle.l)}</td>
                  <td className="px-4 py-2 text-right font-semibold">
                    ${formatPrice(candle.c)}
                  </td>
                  <td className="px-4 py-2 text-right text-gray-400">
                    {candle.v.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default RapidAPIMarketDashboard;