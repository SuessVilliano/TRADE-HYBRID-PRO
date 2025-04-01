import React, { useEffect, useRef, memo } from 'react';

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: 'light' | 'dark';
  width?: string;
  height?: string;
  interval?: string;
  allow_symbol_change?: boolean;
  container_id?: string;
}

function TradingViewWidget({ 
  symbol = 'BITSTAMP:BTCUSD', 
  theme = 'dark', 
  width = '100%', 
  height = '500px', 
  interval = "D",
  allow_symbol_change = true 
}: TradingViewWidgetProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`tradingview_widget_${Math.floor(Math.random() * 1000000)}`);

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
              "paneProperties.background": theme === "dark" ? "#0f172a" : "#ffffff",
              "paneProperties.vertGridProperties.color": theme === "dark" ? "#334155" : "#e6e9ec",
              "paneProperties.horzGridProperties.color": theme === "dark" ? "#334155" : "#e6e9ec",
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
  }, [symbol, theme, interval, allow_symbol_change]); // Rebuild widget when parameters change

  // Use a much larger default height on mobile for better experience
  const getMobileHeight = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 768) {
      return "80vh"; // Full viewport height on mobile for better UX
    }
    return height;
  };

  return (
    <div className="tradingview-widget-container" style={{ height: getMobileHeight(), width }}>
      <div 
        id={widgetIdRef.current} 
        ref={container} 
        style={{ 
          height: "100%", 
          width: "100%", 
          minHeight: typeof window !== 'undefined' && window.innerWidth < 768 ? "70vh" : "300px"
        }}
        className="tradingview-responsive-container"
      />
    </div>
  );
}

export default memo(TradingViewWidget);