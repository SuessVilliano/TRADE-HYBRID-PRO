import React, { useState, useEffect } from 'react';
import { AlertTriangle, RefreshCcw, Bot, TrendingUp, Brain, Zap } from 'lucide-react';
import { Button } from './button';
import { Card } from './card';

interface TradingViewChartProps {
  symbol: string;
  timeframe?: string;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ 
  symbol, 
  timeframe = '1d', 
  className = '' 
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  const [key, setKey] = useState<number>(0);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [showAIOverlay, setShowAIOverlay] = useState<boolean>(true);

  // Convert symbol to TradingView URL format
  const getChartUrl = (symbol: string, interval: string) => {
    let formattedSymbol = symbol.toUpperCase();
    
    // Handle different exchange prefixes for URL
    if (!formattedSymbol.includes(':')) {
      if (symbol.endsWith('USD') || symbol.endsWith('USDT')) {
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
    
    return `https://www.tradingview.com/widgetembed/?frameElementId=tradingview_chart&symbol=${formattedSymbol}&interval=${tvInterval}&hidesidetoolbar=1&hidetoptoolbar=0&symboledit=1&saveimage=1&toolbarbg=1e293b&studies=[]&hideideas=1&theme=dark&style=1&timezone=Etc%2FUTC&studies_overrides={}&overrides={}&enabled_features=[]&disabled_features=[]&locale=en`;
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
          body: JSON.stringify({ symbol, timeframe: selectedTimeframe })
        });
        const data = await response.json();
        setAiInsights(data);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        // Fallback to demo insights for demonstration
        setAiInsights({
          sentiment: 'bullish',
          confidence: 0.75,
          keyLevels: { support: 67800, resistance: 70200 },
          recommendation: 'BUY',
          analysis: 'Strong upward momentum detected with high volume confirmation'
        });
      }
    };

    if (symbol) {
      fetchAIInsights();
    }
  }, [symbol, selectedTimeframe]);

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
      {/* Timeframe selector */}
      <div className="absolute top-2 left-2 z-10 flex gap-1 bg-slate-900/80 rounded-md p-1">
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
            <p className="text-slate-400 text-sm">Loading {symbol} chart...</p>
          </div>
        </div>
      )}

      {/* TradingView Chart iframe */}
      <iframe
        key={key}
        src={getChartUrl(symbol, selectedTimeframe)}
        className="w-full h-full border-0"
        onLoad={handleLoad}
        onError={handleError}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        title={`TradingView Chart - ${symbol}`}
        style={{ minHeight: '400px' }}
      />
    </div>
  );
};

export default TradingViewChart;