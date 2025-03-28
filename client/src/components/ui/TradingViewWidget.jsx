import React, { useEffect, useRef, useState, memo } from 'react';

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
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Clean up container before recreating the widget
    if (container.current) {
      container.current.innerHTML = '';
    }
    
    // Set a loading state
    setIsLoaded(false);
    
    // Ensure each widget instance has its own script
    const scriptId = `tradingview-script-${container_id}`;
    
    // Remove any existing script with this ID
    const existingScript = document.getElementById(scriptId);
    if (existingScript) {
      existingScript.remove();
    }

    // Create a new script element
    const script = document.createElement("script");
    script.id = scriptId;
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (typeof window.TradingView !== 'undefined' && container.current) {
        try {
          // Create the widget with optimized mobile settings
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
            container_id: container_id,
            hide_side_toolbar: height < 400, // Hide side toolbar on smaller heights
            hide_top_toolbar: height < 300,  // Hide top toolbar on very small heights
            save_image: false,               // Disable save image on mobile
            withdateranges: height > 350,    // Only show date ranges on taller charts
            studies_overrides: {             // Make studies more visible
              "volume.volume.color.0": "#F44336",
              "volume.volume.color.1": "#4CAF50",
            },
            overrides: {                     // Make chart more readable
              "mainSeriesProperties.candleStyle.upColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.downColor": "#F44336",
              "mainSeriesProperties.candleStyle.wickUpColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.wickDownColor": "#F44336",
              "mainSeriesProperties.candleStyle.borderUpColor": "#4CAF50",
              "mainSeriesProperties.candleStyle.borderDownColor": "#F44336",
            }
          });
          setIsLoaded(true);
        } catch (err) {
          console.error("Error creating TradingView widget:", err);
        }
      }
    };
    
    // Append the script to the document
    document.head.appendChild(script);
    
    // Cleanup function to remove the widget and script when component unmounts
    return () => {
      const scriptToRemove = document.getElementById(scriptId);
      if (scriptToRemove) {
        scriptToRemove.remove();
      }
      
      // Try to cleanup widget resources if possible
      if (container.current) {
        container.current.innerHTML = '';
      }
    };
  }, [symbol, interval, timezone, theme, style, locale, toolbar_bg, enable_publishing, allow_symbol_change, container_id, height]);

  return (
    <div style={{ position: 'relative', height, width }}>
      {!isLoaded && (
        <div 
          style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            bottom: 0, 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center', 
            backgroundColor: theme === 'dark' ? '#131722' : '#f5f5f5',
            zIndex: 1
          }}
        >
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                width: '30px',
                height: '30px',
                margin: '0 auto 8px',
                border: `2px solid ${theme === 'dark' ? '#2962FF' : '#1E88E5'}`,
                borderRadius: '50%',
                borderBottomColor: 'transparent',
                animation: 'tv-loading-spin 1s linear infinite'
              }}
            />
            <style jsx="true">{`
              @keyframes tv-loading-spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
              }
            `}</style>
            <div style={{ color: theme === 'dark' ? '#9598a1' : '#787b86', fontSize: '12px' }}>
              Loading chart...
            </div>
          </div>
        </div>
      )}
      <div 
        id={container_id} 
        ref={container} 
        style={{ 
          height: '100%', 
          width: '100%', 
          backgroundColor: theme === 'dark' ? '#131722' : '#fff',
          visibility: isLoaded ? 'visible' : 'hidden'
        }}
      />
    </div>
  );
}

export default memo(TradingViewWidget);