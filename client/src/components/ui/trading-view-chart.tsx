import React, { useState, useEffect, useRef, memo } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

// Skip type definitions - use any to avoid TypeScript errors
// We know it works in practice but TS is having trouble with the types
// Disable eslint for this line to avoid linting errors
// eslint-disable-next-line
const useTrading = (): void => {
  // An empty function just to silence TS errors with Window
};

// Use 'as any' to handle TradingView references
// Without proper type definitions from TradingView

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
      // Safely handle empty or undefined symbols
      if (!symbol) {
        console.warn('Empty or undefined symbol provided to TradingView chart');
        setError('Invalid symbol. Please select a valid trading pair.');
        setLoading(false);
        return;
      }
      
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
      
      // Check if TradingView script is already loaded
      const loadChart = () => {
        if ((window as any).TradingView && container.current) {
          // First, clear the container
          container.current.innerHTML = '';
          
          // Generate a truly unique ID for this chart instance using timestamp and random number
          const timestamp = new Date().getTime();
          const random = Math.floor(Math.random() * 1000000);
          const chartId = `tv-chart-${timestamp}-${random}`;
          
          // Set the ID on the container
          container.current.id = chartId;
          
          console.log(`Initializing TradingView widget with ID: ${chartId} for symbol: ${formattedSymbol}`);
          
          try {
            // Use a lightweight version to avoid loading issues in Replit environment
            // Create new widget with more resilient settings - use as any to avoid TS errors
            const widget = new ((window as any).TradingView).widget({
              width: '100%',
              height: '100%',
              autosize: true,
              symbol: formattedSymbol,
              interval: convertTimeframeToInterval(selectedTimeframe),
              container_id: chartId,
              locale: 'en',
              timezone: 'exchange',
              theme: 'dark',
              style: '1', // Candlestick
              toolbar_bg: '#1E293B', // Matches slate-800
              withdateranges: true,
              hide_side_toolbar: false,
              allow_symbol_change: true,
              save_image: true,
              show_popup_button: true,
              popup_width: '1000',
              popup_height: '650',
              // Reduced studies to improve performance
              studies: [
                "RSI@tv-basicstudies"
              ],
              enabled_features: [
                "use_localstorage_for_settings"
              ],
              disabled_features: [
                "header_symbol_search",
                "left_toolbar",
                "header_indicators",
                "header_compare",
                "header_undo_redo",
                "header_settings",
                "header_chart_type",
                "create_volume_indicator_by_default",
                "display_market_status",
                "control_bar"
              ],
              loading_screen: { 
                backgroundColor: "#1E293B", 
                foregroundColor: "#4B5563" 
              },
              overrides: {
                "mainSeriesProperties.candleStyle.wickUpColor": '#26A69A',
                "mainSeriesProperties.candleStyle.wickDownColor": '#EF5350',
                "mainSeriesProperties.candleStyle.upColor": '#26A69A',
                "mainSeriesProperties.candleStyle.downColor": '#EF5350',
                "paneProperties.background": '#1E293B', // Matches slate-800
                "paneProperties.vertGridProperties.color": '#334155', // Matches slate-700
                "paneProperties.horzGridProperties.color": '#334155', // Matches slate-700
                "scalesProperties.textColor": '#94A3B8', // Matches slate-400
              },
              debug: false,
              onChartReady: () => {
                console.log('TradingView chart is ready');
                setLoading(false);
              }
            });
            
            scriptLoaded.current = true;
            console.log('TradingView chart widget initialized');
          } catch (widgetError) {
            console.error('Error creating TradingView widget:', widgetError);
            setError('Error initializing chart. Please try again.');
            setLoading(false);
          }
        } else {
          // If TradingView is not available yet, try again after a short delay
          setTimeout(loadChart, 500);
        }
      };
      
      if ((window as any).TradingView) {
        // TradingView is already available, use it directly
        loadChart();
      } else {
        // Check for existing script that might be loading
        const existingScript = document.querySelector('script[src*="tradingview.com/tv.js"]');
        
        if (!existingScript) {
          // No existing script - load a new one
          const script = document.createElement('script');
          script.id = 'tradingview-widget-script';
          script.src = 'https://s3.tradingview.com/tv.js';
          script.async = true;
          
          // When script loaded successfully
          script.onload = () => {
            console.log('TradingView script loaded successfully');
            // Delay chart initialization slightly to ensure TradingView is fully initialized
            setTimeout(loadChart, 300);
          };
          
          // Handle script loading error
          script.onerror = () => {
            setError('Failed to load TradingView chart. Please check your internet connection.');
            setLoading(false);
            console.error('Failed to load TradingView script');
          };
          
          document.head.appendChild(script);
        } else {
          // Script exists but TV object not ready yet - set up polling
          const checkTradingViewLoaded = () => {
            if ((window as any).TradingView) {
              // Once available, initialize chart
              loadChart();
            } else {
              // Not loaded yet - check again soon
              setTimeout(checkTradingViewLoaded, 300);
            }
          };
          
          checkTradingViewLoaded();
        }
      }
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
    const cleanup = loadTradingViewChart();
    
    // Add window resize listener to help with chart rendering
    const handleResize = () => {
      if (container.current && (window as any).TradingView) {
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      if (typeof cleanup === 'function') {
        cleanup();
      }
    };
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
        <div className="flex gap-1 flex-wrap">
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