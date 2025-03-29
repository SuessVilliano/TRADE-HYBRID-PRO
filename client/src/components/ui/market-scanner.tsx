import React, { useEffect, useRef, memo } from 'react';

interface MarketScannerProps {
  theme?: 'light' | 'dark';
  width?: string;
  height?: string;
  defaultScreener?: 'crypto' | 'forex' | 'america' | 'stock';
  defaultMarket?: string;
}

function MarketScanner({ 
  theme = 'dark', 
  width = '100%', 
  height = '500px',
  defaultScreener = 'crypto',
  defaultMarket = 'crypto'
}: MarketScannerProps) {
  const container = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string>(`marketscanner_widget_${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (!container.current) return;
    
    // Clear any existing widgets
    container.current.innerHTML = '';
    
    console.log(`Loading market scanner with type: ${defaultScreener}, market: ${defaultMarket}`);

    // Create and load the TradingView widget script
    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-screener.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "defaultScreen": defaultScreener,
      "market": defaultMarket,
      "showToolbar": true,
      "colorTheme": theme,
      "locale": "en"
    });
    
    // Append the script to the container
    container.current.appendChild(script);
    
    // Log when loaded
    script.onload = () => {
      console.log("Market Scanner widget loaded successfully");
    };
    
    script.onerror = (error) => {
      console.error("Error loading Market Scanner widget:", error);
    };

    // Clean up
    return () => {
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [theme, defaultScreener, defaultMarket]); // Rebuild widget when parameters change

  return (
    <div className="tradingview-widget-container" style={{ height, width }}>
      <div 
        id={widgetIdRef.current} 
        ref={container} 
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(MarketScanner);