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

  // Popular trading symbols
  const popularSymbols = [
    { symbol: 'BTCUSDT', label: 'BTC/USDT', exchange: 'BINANCE' },
    { symbol: 'ETHUSDT', label: 'ETH/USDT', exchange: 'BINANCE' },
    { symbol: 'SOLUSDT', label: 'SOL/USDT', exchange: 'BINANCE' },
    { symbol: 'ADAUSDT', label: 'ADA/USDT', exchange: 'BINANCE' },
    { symbol: 'DOTUSDT', label: 'DOT/USDT', exchange: 'BINANCE' },
    { symbol: 'LINKUSDT', label: 'LINK/USDT', exchange: 'BINANCE' },
    { symbol: 'EURUSD', label: 'EUR/USD', exchange: 'FX' },
    { symbol: 'GBPUSD', label: 'GBP/USD', exchange: 'FX' },
    { symbol: 'USDJPY', label: 'USD/JPY', exchange: 'FX' },
    { symbol: 'XAUUSD', label: 'Gold/USD', exchange: 'TVC' },
    { symbol: 'SPY', label: 'S&P 500 ETF', exchange: 'AMEX' },
    { symbol: 'QQQ', label: 'NASDAQ ETF', exchange: 'NASDAQ' }
  ];

  // Handle symbol change
  const handleSymbolChange = (newSymbol: string) => {
    setSelectedSymbol(newSymbol);
    setShowSymbolSelector(false);
    refreshChart();
    if (onSymbolChange) {
      onSymbolChange(newSymbol);
    }
  };

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
          body: JSON.stringify({ symbol, timeframe: selectedTimeframe })
        });
        const data = await response.json();
        setAiInsights(data);
      } catch (error) {
        console.error('Failed to fetch AI insights:', error);
        // No fallback - only show real-time data
        setAiInsights(null);
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
            <div className="absolute top-full mt-1 left-0 bg-slate-900 border border-slate-700 rounded-md shadow-lg min-w-48 max-h-60 overflow-y-auto">
              {popularSymbols.map((item) => (
                <button
                  key={item.symbol}
                  onClick={() => handleSymbolChange(item.symbol)}
                  className="w-full text-left px-3 py-2 text-sm text-white hover:bg-slate-700 flex justify-between items-center"
                >
                  <span>{item.label}</span>
                  <span className="text-xs text-slate-400">{item.exchange}</span>
                </button>
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
            <p className="text-slate-400 text-sm">Loading {symbol} chart...</p>
          </div>
        </div>
      )}

      {/* AI Insights Overlay */}
      {showAIOverlay && aiInsights && (
        <div className="absolute top-16 left-2 z-10 w-80">
          <Card className="bg-slate-900/95 border-slate-700 backdrop-blur-sm">
            <div className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Brain className="h-4 w-4 text-purple-400" />
                  <span className="text-sm font-medium text-white">AI Market Analysis</span>
                  <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAIOverlay(false)}
                  className="h-6 w-6 p-0 text-slate-400 hover:text-white"
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Sentiment:</span>
                  <div className={`flex items-center gap-1 text-xs font-medium ${
                    aiInsights.sentiment === 'bullish' ? 'text-green-400' : 
                    aiInsights.sentiment === 'bearish' ? 'text-red-400' : 'text-yellow-400'
                  }`}>
                    <TrendingUp className="h-3 w-3" />
                    {aiInsights.sentiment?.toUpperCase()}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Confidence:</span>
                  <span className="text-xs font-medium text-blue-400">
                    {(aiInsights.confidence * 100).toFixed(0)}%
                  </span>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300">Recommendation:</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${
                    aiInsights.recommendation === 'BUY' ? 'bg-green-500/20 text-green-400' :
                    aiInsights.recommendation === 'SELL' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {aiInsights.recommendation}
                  </span>
                </div>
                
                {aiInsights.keyLevels && (
                  <div className="text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Support:</span>
                      <span className="text-green-400 font-mono">${aiInsights.keyLevels.support}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Resistance:</span>
                      <span className="text-red-400 font-mono">${aiInsights.keyLevels.resistance}</span>
                    </div>
                  </div>
                )}
                
                {aiInsights.analysis && (
                  <div className="pt-2 border-t border-slate-700">
                    <p className="text-xs text-slate-300">{aiInsights.analysis}</p>
                  </div>
                )}
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI Insights Toggle Button */}
      {!showAIOverlay && (
        <div className="absolute top-16 left-2 z-10">
          <Button
            onClick={() => setShowAIOverlay(true)}
            variant="ghost"
            size="sm"
            className="bg-gradient-to-r from-purple-500/80 to-blue-500/80 hover:from-purple-600/80 hover:to-blue-600/80 backdrop-blur-sm text-white border-0"
          >
            <Bot className="h-4 w-4 mr-1" />
            AI Insights
          </Button>
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