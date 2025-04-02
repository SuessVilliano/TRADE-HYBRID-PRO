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
  height = '500px', 
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

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing widgets if the component is re-rendering
    container.current.innerHTML = '';

    // Format CME symbols correctly if needed
    let formattedSymbol = symbol;
    // If it's a futures symbol from CME but doesn't have the CME prefix, add it
    if ((symbol.includes('MNQ') || symbol.includes('NQ')) && !symbol.includes('CME:')) {
      formattedSymbol = `CME:${symbol.replace('!', '')}`;
    }
    
    console.log(`Loading chart with symbol: ${formattedSymbol}`);

    // Create and load the TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      // Use type assertion to access TradingView
      const win = window as any;
      if (win.TradingView && container.current) {
        try {
          // Create new widget instance
          new win.TradingView.widget({
            autosize: true,
            symbol: formattedSymbol,
            interval: interval,
            timezone: "Etc/UTC",
            theme: theme,
            style: "1",
            locale: "en",
            toolbar_bg: "#f1f3f6",
            enable_publishing: false,
            allow_symbol_change: allow_symbol_change,
            container_id: widgetIdRef.current,
            hide_side_toolbar: false,
            studies: [
              "RSI@tv-basicstudies",
              "MASimple@tv-basicstudies",
              "MACD@tv-basicstudies"
            ],
            disabled_features: ["header_compare"],
            enabled_features: ["use_localstorage_for_settings"],
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

  // Use a much larger default height on mobile for better experience
  const getMobileHeight = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return "80vh"; // Full viewport height on mobile for better UX
    }
    return height;
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
      className={`tradingview-widget-container relative ${isFullscreen ? 'fixed inset-0 z-50 bg-slate-900 p-4' : ''}`} 
      style={{ 
        height: isFullscreen ? '100vh' : getMobileHeight(), 
        width: isFullscreen ? '100vw' : width 
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
          minHeight: isFullscreen 
            ? "calc(100vh - 32px)" 
            : (typeof window !== 'undefined' && window.innerWidth < 768 ? "70vh" : "300px")
        }}
        className="tradingview-responsive-container"
      />
    </div>
  );
}

export default memo(TradingViewWidget);