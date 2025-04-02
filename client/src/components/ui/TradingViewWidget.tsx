import React, { useEffect, useRef, memo, useState } from 'react';
import { Maximize2, Minimize2 } from 'lucide-react';
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

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing widgets if the component is re-rendering
    container.current.innerHTML = '';

    // Format symbol correctly if needed
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

    // Create and load the TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // Use type assertion to access TradingView
      const win = window as any;
      if (win.TradingView && container.current) {
        try {
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
            }
          });
          console.log("TradingView widget loaded successfully");
        } catch (error) {
          console.error("Error initializing TradingView widget:", error);
        }
      }
    };
    
    container.current.appendChild(script);

    // Clean up
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme, interval, allow_symbol_change, isFullscreen]); // Rebuild widget when parameters change or fullscreen state changes

  // Dynamic height calculation based on device
  const getResponsiveHeight = () => {
    if (typeof window !== 'undefined') {
      if (window.innerWidth < 640) { // Mobile
        return isFullscreen ? "100vh" : "80vh";
      } else if (window.innerWidth < 1024) { // Tablet
        return isFullscreen ? "100vh" : "85vh";
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
            className="h-8 w-8 rounded-full bg-slate-800/70 hover:bg-slate-700"
            onClick={toggleFullscreen}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
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