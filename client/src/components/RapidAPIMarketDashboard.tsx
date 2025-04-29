import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from 'recharts';

// Define the form data structure
interface FormData {
  symbol: string;
  interval: string;
  dataPoints: number;
  provider?: string;
  apiKey?: string;
}

// Chart data type
interface ChartBar {
  t: string;
  o: number;
  h: number;
  l: number;
  c: number;
  v: number;
}

// Quote data type
interface Quote {
  symbol: string;
  price: number;
  bid?: number;
  ask?: number;
  timestamp: string;
  provider: string;
}

/**
 * RapidAPIMarketDashboard Component
 * 
 * Displays market data fetched from RapidAPI providers
 */
const RapidAPIMarketDashboard: React.FC = () => {
  // Form handling
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      symbol: 'AAPL',
      interval: '1d',
      dataPoints: 30,
      provider: '',
      apiKey: ''
    }
  });
  
  // State
  const [loading, setLoading] = useState<boolean>(false);
  const [chartData, setChartData] = useState<ChartBar[]>([]);
  const [quoteData, setQuoteData] = useState<Quote | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [providers, setProviders] = useState<any[]>([]);
  const [selectedTab, setSelectedTab] = useState<'chart' | 'quote'>('chart');
  const [rapidApiKey, setRapidApiKey] = useState<string>('');
  
  // Fetch providers on component mount
  useEffect(() => {
    fetchProviders();
    
    // Check if we have a saved API key
    const savedKey = localStorage.getItem('rapidapi_key');
    if (savedKey) {
      setRapidApiKey(savedKey);
    }
  }, []);
  
  // Fetch available market data providers
  const fetchProviders = async () => {
    try {
      const response = await axios.get('/api/market-data/providers');
      if (response.data && response.data.providers) {
        setProviders(response.data.providers);
      }
    } catch (err) {
      console.error('Error fetching providers:', err);
      setError('Failed to fetch providers. Please try again later.');
    }
  };
  
  // Handle form submission
  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError(null);
    
    // Save API key to localStorage if provided
    if (data.apiKey) {
      localStorage.setItem('rapidapi_key', data.apiKey);
      setRapidApiKey(data.apiKey);
    }
    
    try {
      if (selectedTab === 'chart') {
        await fetchChartData(data);
      } else {
        await fetchQuoteData(data);
      }
    } catch (err: any) {
      console.error('Error fetching market data:', err);
      setError(err.response?.data?.error || err.message || 'Failed to fetch market data');
    } finally {
      setLoading(false);
    }
  };
  
  // Fetch chart (historical) data
  const fetchChartData = async (data: FormData) => {
    const { symbol, interval, dataPoints, provider, apiKey } = data;
    
    const params: any = {
      symbol,
      interval,
      limit: dataPoints
    };
    
    if (provider) params.provider = provider;
    if (apiKey || rapidApiKey) params.rapidApiKey = apiKey || rapidApiKey;
    
    const response = await axios.get('/api/market-data/history', { params });
    
    if (response.data && response.data.bars) {
      setChartData(response.data.bars);
    } else {
      setError('No data available for the selected symbol and timeframe');
    }
  };
  
  // Fetch quote (current price) data
  const fetchQuoteData = async (data: FormData) => {
    const { symbol, provider, apiKey } = data;
    
    const params: any = { symbol };
    
    if (provider) params.provider = provider;
    if (apiKey || rapidApiKey) params.rapidApiKey = apiKey || rapidApiKey;
    
    const response = await axios.get('/api/market-data/quote', { params });
    
    if (response.data && response.data.price) {
      setQuoteData(response.data);
    } else {
      setError('No quote available for the selected symbol');
    }
  };
  
  // Render quote card
  const renderQuoteCard = () => {
    if (!quoteData) return null;
    
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">{quoteData.symbol}</h3>
          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
            {quoteData.provider}
          </span>
        </div>
        
        <div className="text-3xl font-bold mb-4">
          ${quoteData.price.toFixed(2)}
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm">
          {quoteData.bid && (
            <div>
              <span className="text-gray-500">Bid:</span> ${quoteData.bid.toFixed(2)}
            </div>
          )}
          
          {quoteData.ask && (
            <div>
              <span className="text-gray-500">Ask:</span> ${quoteData.ask.toFixed(2)}
            </div>
          )}
          
          <div className="col-span-2">
            <span className="text-gray-500">Updated:</span> {new Date(quoteData.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>
    );
  };
  
  // Format chart tooltip
  const formatTooltip = (value: number, name: string) => {
    switch (name) {
      case 'o': return ['Open', value.toFixed(2)];
      case 'h': return ['High', value.toFixed(2)];
      case 'l': return ['Low', value.toFixed(2)];
      case 'c': return ['Close', value.toFixed(2)];
      case 'v': return ['Volume', value.toLocaleString()];
      default: return [name, value];
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="md:w-1/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4">Market Data</h2>
          
          <div className="flex mb-4 border-b">
            <button
              className={`pb-2 px-4 ${selectedTab === 'chart' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('chart')}
            >
              Chart
            </button>
            <button
              className={`pb-2 px-4 ${selectedTab === 'quote' ? 'border-b-2 border-blue-500 font-medium' : 'text-gray-500'}`}
              onClick={() => setSelectedTab('quote')}
            >
              Quote
            </button>
          </div>
          
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Symbol</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="AAPL, BTCUSDT, EUR/USD"
                {...register('symbol', { required: 'Symbol is required' })}
              />
              {errors.symbol && (
                <p className="text-red-500 text-xs mt-1">{errors.symbol.message}</p>
              )}
            </div>
            
            {selectedTab === 'chart' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Interval</label>
                  <select
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('interval')}
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
                
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-1">Data Points</label>
                  <input
                    type="number"
                    className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    min="10"
                    max="500"
                    step="10"
                    {...register('dataPoints', { 
                      required: 'Data points required',
                      min: { value: 10, message: 'Minimum 10 data points' },
                      max: { value: 500, message: 'Maximum 500 data points' }
                    })}
                  />
                  {errors.dataPoints && (
                    <p className="text-red-500 text-xs mt-1">{errors.dataPoints.message}</p>
                  )}
                </div>
              </>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Data Provider (Optional)</label>
              <select
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('provider')}
              >
                <option value="">Auto-select</option>
                {providers.map(provider => (
                  <option key={provider.id} value={provider.id}>
                    {provider.name} - {provider.description.substring(0, 40)}...
                  </option>
                ))}
              </select>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">RapidAPI Key</label>
              <input
                type="text"
                className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your RapidAPI key"
                {...register('apiKey')}
              />
              <p className="text-xs text-gray-500 mt-1">
                {rapidApiKey ? 'Using saved API key. Enter new key to update.' : 'Required for RapidAPI providers'}
              </p>
            </div>
            
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Get Market Data'}
            </button>
          </form>
        </div>
        
        <div className="md:w-2/3 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md">
          {error && (
            <div className="p-4 mb-4 bg-red-50 border border-red-200 text-red-700 rounded">
              {error}
            </div>
          )}
          
          {selectedTab === 'chart' ? (
            chartData.length > 0 ? (
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="t" 
                      tickFormatter={(timestamp) => {
                        const date = new Date(timestamp);
                        return date.toLocaleDateString();
                      }}
                    />
                    <YAxis domain={['auto', 'auto']} />
                    <Tooltip 
                      formatter={formatTooltip}
                      labelFormatter={(label) => new Date(label).toLocaleString()}
                    />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="c" 
                      stroke="#8884d8" 
                      name="Close" 
                      dot={false}
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                {loading ? 'Loading chart data...' : 'No chart data available'}
              </div>
            )
          ) : (
            quoteData ? (
              <div className="flex justify-center items-center h-96">
                {renderQuoteCard()}
              </div>
            ) : (
              <div className="flex items-center justify-center h-96 text-gray-500">
                {loading ? 'Loading quote data...' : 'No quote data available'}
              </div>
            )
          )}
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-bold mb-4">Available Data Providers</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {providers.map(provider => (
            <div key={provider.id} className="border rounded p-3">
              <div className="flex justify-between items-start">
                <h3 className="font-semibold">{provider.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${provider.type === 'rapidapi' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                  {provider.type}
                </span>
              </div>
              <p className="text-sm text-gray-600 my-2">{provider.description}</p>
              <div className="text-xs">
                <span className="font-medium">Assets:</span> {provider.asset_classes.join(', ')}
              </div>
              {provider.requires_api_key && (
                <div className="text-xs text-amber-600 mt-1">
                  Requires API key
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RapidAPIMarketDashboard;