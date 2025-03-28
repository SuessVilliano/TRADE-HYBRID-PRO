import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ symbol = 'BITSTAMP:BTCUSD', theme = 'dark', width = '100%', height = '500px' }) {
  const container = useRef();

  useEffect(() => {
    // Clear any existing widgets if the component is re-rendering
    if (container.current) {
      container.current.innerHTML = '';
    }

    // Create and load the TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && container.current) {
        // Create new widget instance
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: "D",
          timezone: "Etc/UTC",
          theme: theme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
          container_id: container.current.id,
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
      }
    };
    container.current.appendChild(script);

    // Clean up
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, theme]); // Rebuild widget when symbol or theme changes

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div 
        id={`tradingview_widget_${Math.floor(Math.random() * 1000000)}`} 
        ref={container} 
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);