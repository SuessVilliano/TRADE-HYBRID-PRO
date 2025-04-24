import { useEffect, useRef, useState } from "react";
import { Button } from "./button";
import { RefreshCw } from "lucide-react";

interface TradingViewTickerTapeProps {
  className?: string;
  showControls?: boolean;
}

export function TradingViewTickerTape({ 
  className = "", 
  showControls = false 
}: TradingViewTickerTapeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const uniqueId = useRef(`ticker-tape-${Math.random().toString(36).substring(2, 9)}`);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      loadWidget();
    }
    
    return () => {
      // Clean up
      const scriptElements = document.querySelectorAll(`script[src*="tradingview.com"][data-widget-id="${uniqueId.current}"]`);
      scriptElements.forEach(script => script.remove());
    };
  }, []);
  
  const loadWidget = () => {
    if (!containerRef.current) return;
    
    // Clear the container
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    setIsLoading(true);
    
    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.className = 'tradingview-widget-container';
    widgetContainer.style.width = '100%';
    widgetContainer.style.height = '100%';
    
    // Create widget
    const widget = document.createElement('div');
    widget.className = 'tradingview-widget-container__widget';
    widget.style.width = '100%';
    widget.style.height = '100%';
    widgetContainer.appendChild(widget);
    
    // Create copyright
    const copyright = document.createElement('div');
    copyright.className = 'tradingview-widget-copyright';
    copyright.innerHTML = '<a href="https://www.tradingview.com/" rel="noopener nofollow" target="_blank"><span class="blue-text">Track all markets</span></a> on TradingView';
    copyright.style.fontSize = '11px';
    copyright.style.padding = '0.5em 0';
    copyright.style.textAlign = 'center';
    copyright.style.display = 'block';
    widgetContainer.appendChild(copyright);
    
    // Add container to DOM
    containerRef.current.appendChild(widgetContainer);
    
    // Create and add script
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js';
    script.async = true;
    script.setAttribute('data-widget-id', uniqueId.current);
    
    // Set configuration
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "Nasdaq 100"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR/USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "BTC/USD"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "ETH/USD"
        }
      ],
      "showSymbolLogo": true,
      "colorTheme": "dark",
      "isTransparent": true,
      "displayMode": "adaptive",
      "locale": "en"
    });
    
    widgetContainer.appendChild(script);
    
    // Set loading state to false after a reasonable timeout
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };
  
  const handleRefresh = () => {
    loadWidget();
  };
  
  return (
    <div className={`relative border border-border rounded-lg overflow-hidden ${className}`}>
      {showControls && (
        <div className="absolute top-1 right-1 z-10">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 bg-background/50 backdrop-blur-sm"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
      
      <div 
        ref={containerRef} 
        className="w-full min-h-[46px]"
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/50 backdrop-blur-sm">
            <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingViewTickerTape;