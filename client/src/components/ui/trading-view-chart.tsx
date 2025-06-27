import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Bot, TrendingUp, Brain, Zap, ChevronDown } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface TradingViewChartProps {
  symbol: string;
  timeframe?: string;
  className?: string;
  onSymbolChange?: (symbol: string) => void;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  timeframe = '1d', 
  className = '',
  onSymbolChange
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  const [key, setKey] = useState<number>(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);
  const [selectedSymbol, setSelectedSymbol] = useState<string>(symbol);
  const [showSymbolSelector, setShowSymbolSelector] = useState<boolean>(false);

  // Comprehensive trading symbols for prop firm trading
  const popularSymbols = [
    // Major Cryptocurrencies
    { symbol: 'BTCUSDT', label: 'Bitcoin/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'ETHUSDT', label: 'Ethereum/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'SOLUSDT', label: 'Solana/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'ADAUSDT', label: 'Cardano/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'DOTUSDT', label: 'Polkadot/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'LINKUSDT', label: 'Chainlink/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'AVAXUSDT', label: 'Avalanche/USDT', exchange: 'BINANCE', category: 'Crypto' },
    { symbol: 'MATICUSDT', label: 'Polygon/USDT', exchange: 'BINANCE', category: 'Crypto' },
    
    // Major Forex Pairs
    { symbol: 'EURUSD', label: 'EUR/USD', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'GBPUSD', label: 'GBP/USD', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'USDJPY', label: 'USD/JPY', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'AUDUSD', label: 'AUD/USD', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'USDCAD', label: 'USD/CAD', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'NZDUSD', label: 'NZD/USD', exchange: 'FX_IDC', category: 'Forex' },
    { symbol: 'USDCHF', label: 'USD/CHF', exchange: 'FX_IDC', category: 'Forex' },
    
    // Commodities
    { symbol: 'XAUUSD', label: 'Gold/USD', exchange: 'TVC', category: 'Commodities' },
    { symbol: 'XAGUSD', label: 'Silver/USD', exchange: 'TVC', category: 'Commodities' },
    { symbol: 'USOIL', label: 'Crude Oil', exchange: 'TVC', category: 'Commodities' },
    { symbol: 'NATGAS', label: 'Natural Gas', exchange: 'TVC', category: 'Commodities' },
    
    // Major Indices
    { symbol: 'SPX', label: 'S&P 500', exchange: 'TVC', category: 'Indices' },
    { symbol: 'NAS100', label: 'NASDAQ 100', exchange: 'TVC', category: 'Indices' },
    { symbol: 'DJI', label: 'Dow Jones', exchange: 'TVC', category: 'Indices' },
    { symbol: 'UK100', label: 'FTSE 100', exchange: 'TVC', category: 'Indices' },
    { symbol: 'GER40', label: 'DAX 40', exchange: 'TVC', category: 'Indices' },
    
    // Popular Stocks
    { symbol: 'AAPL', label: 'Apple Inc.', exchange: 'NASDAQ', category: 'Stocks' },
    { symbol: 'TSLA', label: 'Tesla Inc.', exchange: 'NASDAQ', category: 'Stocks' },
    { symbol: 'GOOGL', label: 'Alphabet Inc.', exchange: 'NASDAQ', category: 'Stocks' },
    { symbol: 'MSFT', label: 'Microsoft Corp.', exchange: 'NASDAQ', category: 'Stocks' },
    { symbol: 'AMZN', label: 'Amazon.com Inc.', exchange: 'NASDAQ', category: 'Stocks' },
    { symbol: 'NVDA', label: 'NVIDIA Corp.', exchange: 'NASDAQ', category: 'Stocks' }
  ];

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    setShowSymbolSelector(false);
    setKey(prev => prev + 1);
    refreshChart();
    if (onSymbolChange) {
      onSymbolChange(newSymbol);
    }
  };

  // Convert symbol to TradingView URL format
  const getChartUrl = (symbol: string, interval: string) => {
    let formattedSymbol = selectedSymbol.toUpperCase();
    
    // Handle different exchange prefixes for URL
    if (!formattedSymbol.includes(':')) {
      if (selectedSymbol.endsWith('USD') || selectedSymbol.endsWith('USDT')) {
        formattedSymbol = `BINANCE:${formattedSymbol}`;
      }
    }
    
    // Convert timeframe to TradingView interval
    const intervalMap: { [key: string]: string } = {
      '1m': '1',
      '5m': '5', 
      '15m': '15',
      '30m': '30',
      '1h': '60',
      '4h': '240',
      '1d': 'D',
      '1w': 'W',
      '1M': 'M'
    };
    
    const tvInterval = intervalMap[interval] || 'D';
    
    return `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${formattedSymbol}&interval=${tvInterval}&hidesidetoolbar=0&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=1e293b&studies=[]&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=["symbol_search_hot_key","header_symbol_search","symbol_info","header_chart_type","header_settings","header_indicators","header_compare","header_undo_redo","header_screenshot","header_fullscreen_button"]&disabled_features=["use_localstorage_for_settings","volume_force_overlay"]&locale=en`;
  };

  const handleLoad = () => {
    setLoading(false);
    setError(null);
  };

  const handleError = () => {
    setLoading(false);
    setError('Chart failed to load. Please try refreshing.');
  };

  // Fetch AI market insights
  useEffect(() => {
    const fetchAIInsights = async () => {
      try {
        const response = await fetch('/api/ai/market-analysis', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ symbol: selectedSymbol, timeframe: selectedTimeframe })
        });
        const data = await response.json();
        setAiInsights(data);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        setAiInsights(null);
      }
    };

    if (selectedSymbol) {
      fetchAIInsights();
    }
  }, [selectedSymbol, selectedTimeframe]);

  const refreshChart = () => {
    setLoading(true);
    setError(null);
    setKey(prev => prev + 1);
  };

  const timeframeOptions = [
    { value: '1m', label: '1m' },
    { value: '5m', label: '5m' },
    { value: '15m', label: '15m' },
    { value: '30m', label: '30m' },
    { value: '1h', label: '1h' },
    { value: '4h', label: '4h' },
    { value: '1d', label: '1D' },
    { value: '1w', label: '1W' },
    { value: '1M', label: '1M' }
  ];

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-slate-800 rounded-lg border border-slate-700 ${className}`}>
        <AlertTriangle className="h-12 w-12 text-yellow-500 mb-4" />
        <p className="text-slate-300 mb-4 text-center">{error}</p>
        <Button onClick={refreshChart} variant="outline" size="sm">
          <RefreshCcw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full bg-slate-800 rounded-lg overflow-hidden ${className}`}>
      {/* Symbol and Timeframe selector */}
      <div className="absolute top-2 left-2 z-10 space-y-2">
        {/* Symbol Selector */}
        <div className="relative">
          <button
            onClick={() => setShowSymbolSelector(!showSymbolSelector)}
            className="bg-slate-900/80 text-white px-3 py-1 text-sm rounded-md hover:bg-slate-700 flex items-center gap-2"
          >
            {selectedSymbol}
            <ChevronDown className="h-3 w-3" />
          </button>
          
          {showSymbolSelector && (
            <div className="absolute top-full mt-1 left-0 bg-slate-900 border border-slate-700 rounded-md shadow-lg min-w-64 max-h-80 overflow-y-auto z-50">
              {['Crypto', 'Forex', 'Indices', 'Commodities', 'Stocks'].map((category) => (
                <div key={category}>
                  <div className="px-3 py-2 text-xs font-semibold text-slate-300 bg-slate-800 border-b border-slate-700">
                    {category}
                  </div>
                  {popularSymbols
                    .filter(item => item.category === category)
                    .map((item) => (
                      <button
                        key={item.symbol}
                        onClick={() => handleSymbolChange(item.symbol)}
                        className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 flex justify-between items-center border-b border-slate-800 last:border-b-0"
                      >
                        <span>{item.label}</span>
                        <span className="text-xs text-slate-400">{item.exchange}</span>
                      </button>
                    ))}
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Timeframe Selector */}
        <div className="flex gap-1 bg-slate-900/80 rounded-md p-1">
          {timeframeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                setSelectedTimeframe(option.value);
                refreshChart();
              }}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                selectedTimeframe === option.value
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Refresh button */}
      <div className="absolute top-2 right-2 z-10">
        <Button
          onClick={refreshChart}
          variant="ghost"
          size="sm"
          className="bg-slate-900/80 hover:bg-slate-700"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
      </div>

      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-800 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-2"></div>
            <p className="text-slate-400 text-sm">Loading {selectedSymbol} chart...</p>
          </div>
        </div>
      )}

      {/* Main Chart Frame */}
      <iframe
        key={key}
        src={getChartUrl(selectedSymbol, selectedTimeframe)}
        width="100%"
        height="100%"
        frameBorder="0"
        allowFullScreen
        onLoad={handleLoad}
        onError={handleError}
        style={{ border: 'none' }}
        title={`TradingView Chart - ${selectedSymbol}`}
      />
    </div>
  );
};

export default TradingViewChart;