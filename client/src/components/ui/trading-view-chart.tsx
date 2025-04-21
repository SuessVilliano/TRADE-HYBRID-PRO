import React, { useState, useEffect, useRef, memo } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface TradingViewChartProps {
  symbol: string;
  timeframe?: string;
  className?: string;
}

const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol, timeframe = '1d', className }) => {
  const container = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>(timeframe);
  
  const loadTradingViewChart = () => {
    if (!container.current) return;
    setLoading(true);
    setError(null);
    
    // Clear any existing widgets
    container.current.innerHTML = '';
    
    try {
      // Format symbol correctly
      let formattedSymbol = symbol;
      
      // Handle different exchange prefixes
      if (!symbol.includes(':')) {
        // If no exchange specified, default to BINANCE for crypto pairs
        if (symbol.endsWith('USD') || symbol.endsWith('USDT')) {
          formattedSymbol = `BINANCE:${symbol}`;
        }
      }
      
      // Special case for CME futures
      if ((symbol.includes('MNQ') || symbol.includes('NQ')) && !symbol.includes('CME:')) {
        formattedSymbol = `CME:${symbol.replace('!', '')}`;
      }
      
      console.log(`Loading TradingView chart with symbol: ${formattedSymbol}, timeframe: ${selectedTimeframe}`);
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = () => {
        if (typeof window.TradingView !== 'undefined' && container.current) {
          new window.TradingView.widget({
            autosize: true,
            symbol: formattedSymbol,
            interval: convertTimeframeToInterval(selectedTimeframe),
            container_id: container.current.id,
            library_path: 'https://s3.tradingview.com/charting_library/',
            locale: 'en',
            timezone: 'exchange',
            theme: 'dark',
            style: '1',
            toolbar_bg: '#1E293B', // Matches slate-800
            withdateranges: true,
            hide_side_toolbar: false,
            allow_symbol_change: true,
            save_image: true,
            show_popup_button: true,
            popup_width: '1000',
            popup_height: '650',
            studies: [
              "RSI@tv-basicstudies",
              "MASimple@tv-basicstudies",
              "VWAP@tv-basicstudies"
            ],
            enabled_features: [
              "use_localstorage_for_settings",
              "chart_property_page_trading",
              "chart_property_page_style",
              "property_pages"
            ],
            disabled_features: [
              "header_symbol_search"
            ],
            overrides: {
              "mainSeriesProperties.candleStyle.wickUpColor": '#26A69A',
              "mainSeriesProperties.candleStyle.wickDownColor": '#EF5350',
              "mainSeriesProperties.candleStyle.upColor": '#26A69A',
              "mainSeriesProperties.candleStyle.downColor": '#EF5350',
              "paneProperties.background": '#1E293B', // Matches slate-800
              "paneProperties.vertGridProperties.color": '#334155', // Matches slate-700
              "paneProperties.horzGridProperties.color": '#334155', // Matches slate-700
              "scalesProperties.textColor": '#94A3B8', // Matches slate-400
            }
          });
          scriptLoaded.current = true;
          setLoading(false);
          console.log('TradingView chart loaded successfully');
        }
      };
      
      script.onerror = () => {
        setError('Failed to load TradingView chart. Please check your internet connection.');
        setLoading(false);
        console.error('Failed to load TradingView script');
      };
      
      container.current.appendChild(script);
    } catch (err) {
      setError('An error occurred while loading the chart.');
      setLoading(false);
      console.error('Error initializing TradingView widget:', err);
    }
    
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  };

  // Convert timeframe string to TradingView interval
  const convertTimeframeToInterval = (tf: string) => {
    switch (tf) {
      case '1m': return '1';
      case '3m': return '3';
      case '5m': return '5';
      case '15m': return '15';
      case '30m': return '30';
      case '1h': return '60';
      case '2h': return '120';
      case '4h': return '240';
      case '1d': return 'D';
      case '1w': return 'W';
      case '1M': return 'M';
      default: return 'D';
    }
  };
  
  useEffect(() => {
    return loadTradingViewChart();
  }, [symbol, selectedTimeframe]);
  
  const handleTimeframeChange = (tf: string) => {
    setSelectedTimeframe(tf);
  };
  
  const handleReload = () => {
    scriptLoaded.current = false;
    loadTradingViewChart();
  };

  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-2 border-b border-slate-700 flex justify-between items-center">
        <div className="font-medium text-sm">{symbol}</div>
        <div className="flex gap-1">
          {['5m', '15m', '1h', '4h', '1d', '1w'].map((tf) => (
            <button
              key={tf}
              className={`text-xs px-2 py-1 rounded ${
                tf === selectedTimeframe 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
              onClick={() => handleTimeframeChange(tf)}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>
      
      <div className="flex-grow relative">
        <div 
          id={`tv-chart-${symbol.replace(/[^a-zA-Z0-9]/g, '')}`} 
          ref={container} 
          className="w-full h-full"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading {symbol} chart...</p>
            </div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-90 z-10">
            <div className="text-center p-6 max-w-md">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-red-500" />
              <p className="text-sm text-red-400 mb-4">{error}</p>
              <Button onClick={handleReload} size="sm" variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reload Chart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Using TradingView type definition from types/trading-view.d.ts

export default memo(TradingViewChart);