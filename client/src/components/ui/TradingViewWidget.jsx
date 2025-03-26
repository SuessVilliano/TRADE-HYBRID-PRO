import React, { useEffect, useRef, memo } from 'react';

function TradingViewWidget({ 
  symbol = "NASDAQ:AAPL", 
  theme = "dark", 
  width = "100%", 
  height = "500px",
  interval = "D",
  timezone = "Etc/UTC",
  style = "1",
  locale = "en",
  toolbar_bg = "#f1f3f6",
  enable_publishing = false,
  allow_symbol_change = true,
  container_id = "tradingview_widget"
}) {
  const container = useRef();

  useEffect(() => {
    // Remove any existing scripts
    const existingScript = document.getElementById('tradingview-widget-script');
    if (existingScript) {
      existingScript.remove();
    }

    // Create a new script element
    const script = document.createElement("script");
    script.id = 'tradingview-widget-script';
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined') {
        new window.TradingView.widget({
          autosize: true,
          symbol: symbol,
          interval: interval,
          timezone: timezone,
          theme: theme,
          style: style,
          locale: locale,
          toolbar_bg: toolbar_bg,
          enable_publishing: enable_publishing,
          allow_symbol_change: allow_symbol_change,
          container_id: container_id
        });
      }
    };
    
    // Append the script to the document
    document.head.appendChild(script);
    
    // Cleanup function to remove the widget and script when component unmounts
    return () => {
      if (document.getElementById('tradingview-widget-script')) {
        document.getElementById('tradingview-widget-script').remove();
      }
      
      // Try to cleanup widget resources if possible
      if (window.TradingView && container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, interval, timezone, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, container_id]);

  return (
    <div 
      id={container_id} 
      ref={container} 
      style={{ 
        height: height, 
        width: width, 
        backgroundColor: theme === 'dark' ? '#131722' : '#fff' 
      }}
    />
  );
}

export default memo(TradingViewWidget);