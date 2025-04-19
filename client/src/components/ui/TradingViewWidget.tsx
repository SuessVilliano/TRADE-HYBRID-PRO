import React, { useEffect, useRef, memo, useState } from 'react';
import { Maximize2, Minimize2, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string;
  height?: string;
  interval?: string;
  allow_symbol_change?: boolean;
  container_id?: string;
  allowFullscreen?: boolean;
  onFullscreenChange?: (isFullscreen: boolean) => void;
}

/**
 * Improved TradingView widget with better error handling and loading states
 */
function TradingViewWidget({ 
  symbol = 'BITSTAMP:BTCUSD', 
  theme = 'dark', 
  width = '100%', 
  height = '600px', 
  interval = "D",
  allow_symbol_change = true,
  allowFullscreen = true,
  onFullscreenChange
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`tradingview_widget_${Math.floor(Math.random() * 1000000)}`);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const scriptLoadedRef = useRef(false);
  
  // Add keyboard handler for ESC key to exit fullscreen mode
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
        if (onFullscreenChange) {
          onFullscreenChange(false);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen, onFullscreenChange]);

  // Handle window resize to ensure the chart always fits the container
  useEffect(() => {
    const handleResize = () => {
      if (container.current) {
        // Force the widget to redraw with the new dimensions
        const event = new Event('resize');
        window.dispatchEvent(event);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Load TradingView library if not already loaded
  useEffect(() => {
    // Create a global loading function
    const win = window as any;
    
    if (!win.__tradingViewScriptLoaded) {
      win.__tradingViewScriptLoaded = true;
      
      // Check if TradingView is already available
      if (win.TradingView) {
        scriptLoadedRef.current = true;
        return;
      }
      
      // Create global error and load tracking
      win.__tradingViewOnLoad = () => {
        scriptLoadedRef.current = true;
        console.log('TradingView library loaded successfully');
      };
      
      win.__tradingViewOnError = () => {
        setError('Failed to load TradingView library. Please check your internet connection.');
        setLoading(false);
        console.error('Failed to load TradingView library');
      };
      
      // Add the script to the document
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = win.__tradingViewOnLoad;
      script.onerror = win.__tradingViewOnError;
      document.head.appendChild(script);
    }
  }, []);

  // Initialize the widget when the library is loaded and component is mounted
  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing widgets if the component is re-rendering
    container.current.innerHTML = '';
    setLoading(true);
    setError(null);

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
    
    console.log(`Loading TradingView chart with symbol: ${formattedSymbol}`);

    // Function to initialize the widget
    const initializeWidget = () => {
      const win = window as any;
      
      if (!win.TradingView) {
        // If library isn't loaded yet, try again after delay
        setTimeout(initializeWidget, 500);
        return;
      }
      
      try {
        if (container.current) {
          // Create new widget instance with advanced settings
          new win.TradingView.widget({
            autosize: true,
            symbol: formattedSymbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: theme,
            style: "1", // Candlestick
            locale: "en",
            toolbar_bg: theme === "dark" ? "#171b26" : "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: allow_symbol_change,
            container_id: widgetIdRef.current,
            hide_side_toolbar: false,
            show_popup_button: true,
            popup_width: "1200",
            popup_height: "800",
            studies: [
              "RSI@tv-basicstudies",
              "MASimple@tv-basicstudies",
              "MACD@tv-basicstudies",
              "BB@tv-basicstudies"
            ],
            drawings_access: { type: "all", tools: [ { name: "Regression Trend" } ] },
            saved_data_meta_info: { 
              uid: "tradehybrid", 
              name: "Trade Hybrid Chart Settings",
              description: "Trading view configuration for Trade Hybrid platform"
            },
            fullscreen: isFullscreen,
            withdateranges: true,
            hide_legend: false,
            allow_hiding_series: true,
            details: true,
            hotlist: true,
            calendar: true,
            show_interval_dialog: true,
            enabled_features: [
              "use_localstorage_for_settings",
              "side_toolbar_in_fullscreen_mode",
              "header_fullscreen_button",
              "study_templates",
              "control_bar",
              "header_chart_type",
              "header_indicators",
              "header_settings",
              "header_compare",
              "header_undo_redo",
              "header_screenshot",
              "timeframes_toolbar"
            ],
            overrides: {
              "paneProperties.background": theme === "dark" ? "#171b26" : "#ffffff",
              "paneProperties.vertGridProperties.color": theme === "dark" ? "#2a2e39" : "#e6e9ec",
              "paneProperties.horzGridProperties.color": theme === "dark" ? "#2a2e39" : "#e6e9ec",
              "mainSeriesProperties.candleStyle.upColor": "#26a69a",
              "mainSeriesProperties.candleStyle.downColor": "#ef5350",
              "mainSeriesProperties.candleStyle.borderUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.borderDownColor": "#ef5350",
              "mainSeriesProperties.candleStyle.wickUpColor": "#26a69a",
              "mainSeriesProperties.candleStyle.wickDownColor": "#ef5350",
            },
            loading_screen: { 
              backgroundColor: theme === "dark" ? "#171b26" : "#ffffff",
              foregroundColor: theme === "dark" ? "#2a2e39" : "#e6e9ec" 
            },
            // Add event handlers
            onChartReady: () => {
              console.log('TradingView chart ready');
              setLoading(false);
              setError(null);
            }
          });
          console.log("TradingView widget initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing TradingView widget:", error);
        setError('Failed to initialize the chart. Please try refreshing the page.');
        setLoading(false);
      }
    };

    // Start initialization process
    initializeWidget();

    // Clean up
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, interval, allow_symbol_change, isFullscreen]); // Rebuild widget when parameters change

  // Dynamic height calculation based on device
  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) { // Mobile
        return isFullscreen ? "100vh" : "90vh";
      } else if (window.innerWidth < 1024) { // Tablet
        return isFullscreen ? "100vh" : "90vh";
      }
    }
    return isFullscreen ? "100vh" : height;
  };

  // Toggle fullscreen state
  const toggleFullscreen = () => {
    const newState = !isFullscreen;
    setIsFullscreen(newState);
    
    // Call the callback if provided
    if (onFullscreenChange) {
      onFullscreenChange(newState);
    }
  };

  // Handle chart reload
  const handleReload = () => {
    setError(null);
    setLoading(true);
    
    // Force reload widget
    if (container.current) {
      container.current.innerHTML = '';
      
      // Recreate widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.id = widgetIdRef.current;
      container.current.appendChild(widgetContainer);
      
      const win = window as any;
      
      // Force reload external TradingView script
      if (!win.TradingView) {
        win.__tradingViewScriptLoaded = false;
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        container.current.appendChild(script);
      }
    }
  };

  return (
    <div 
      className={`tradingview-widget-container relative ${isFullscreen ? 'fixed inset-0 z-[9999] bg-background' : ''}`} 
      style={{ 
        height: getResponsiveHeight(), 
        width: isFullscreen ? '100vw' : width,
        maxWidth: '100%'
      }}
    >
      {allowFullscreen && (
        <div className="absolute top-3 right-3 z-10">
          <Button
            variant="ghost"
            size="sm"
            className="h-10 w-10 rounded-full bg-slate-800/80 hover:bg-slate-700"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
          </Button>
        </div>
      )}
      
      {/* Loading and error states */}
      {loading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading TradingView Chart...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-90 z-10">
          <div className="text-center p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={handleReload} variant="outline" size="sm">
              Reload Chart
            </Button>
          </div>
        </div>
      )}
      
      {/* Main container for the widget */}
      <div 
        id={widgetIdRef.current} 
        ref={container} 
        style={{ 
          height: "100%", 
          width: "100%", 
          minHeight: isFullscreen ? "100vh" : "500px",
          maxHeight: "100%"
        }}
        className="tradingview-responsive-container"
      />
    </div>
  );
}

export default memo(TradingViewWidget);