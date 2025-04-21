import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface CryptoScreenerProps {
  height?: string | number;
  width?: string | number;
  colorTheme?: 'light' | 'dark';
  defaultColumn?: string;
  displayCurrency?: string;
  className?: string;
}

export function TradingViewCryptoScreener({
  height = '100%',
  width = '100%',
  colorTheme = 'dark',
  defaultColumn = 'overview',
  displayCurrency = 'USD',
  className = ''
}: CryptoScreenerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useRef(`tv_crypto_screener_${Math.floor(Math.random() * 1000000)}`);

  useEffect(() => {
    if (!containerRef.current) return;
    
    // Clear any existing widgets
    while (containerRef.current.firstChild) {
      containerRef.current.removeChild(containerRef.current.firstChild);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      
      // Create the copyright element
      const copyrightElement = document.createElement('div');
      copyrightElement.className = 'tradingview-widget-copyright';
      
      const link = document.createElement('a');
      link.href = 'https://www.tradingview.com/';
      link.rel = 'noopener nofollow';
      link.target = '_blank';
      
      const span = document.createElement('span');
      span.className = 'blue-text';
      span.textContent = 'Track all markets on TradingView';
      
      link.appendChild(span);
      copyrightElement.appendChild(link);
      
      // Create script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
      script.type = 'text/javascript';
      script.async = true;
      
      // Widget configuration
      const widgetConfig = {
        "width": width,
        "height": height,
        "defaultColumn": defaultColumn,
        "screener_type": "crypto_mkt",
        "displayCurrency": displayCurrency,
        "colorTheme": colorTheme,
        "locale": "en"
      };
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
      // Success and error handling
      script.onload = () => {
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load crypto screener. Please try again later.');
        setLoading(false);
      };
      
      // Append elements to container
      containerRef.current.appendChild(widgetContainer);
      containerRef.current.appendChild(copyrightElement);
      containerRef.current.appendChild(script);
      
      // Set a timeout to detect if the widget doesn't load properly
      const loadTimeout = setTimeout(() => {
        if (loading) {
          setError('The crypto screener is taking longer than expected to load. Please try refreshing.');
        }
      }, 8000);
      
      return () => {
        clearTimeout(loadTimeout);
        if (containerRef.current) {
          // Clear the container on unmount
          while (containerRef.current.firstChild) {
            containerRef.current.removeChild(containerRef.current.firstChild);
          }
        }
      };
    } catch (err) {
      setError('An error occurred while loading the crypto screener.');
      setLoading(false);
      console.error('Error loading crypto screener:', err);
    }
  }, [height, width, colorTheme, defaultColumn, displayCurrency]);
  
  const handleReload = () => {
    if (containerRef.current) {
      // Clear the container
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
      
      setLoading(true);
      setError(null);
      
      // Recreate widget with a slight delay
      setTimeout(() => {
        const widgetContainer = document.createElement('div');
        widgetContainer.className = 'tradingview-widget-container__widget';
        
        const copyrightElement = document.createElement('div');
        copyrightElement.className = 'tradingview-widget-copyright';
        
        const link = document.createElement('a');
        link.href = 'https://www.tradingview.com/';
        link.rel = 'noopener nofollow';
        link.target = '_blank';
        link.innerHTML = '<span class="blue-text">Track all markets on TradingView</span>';
        copyrightElement.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
        script.type = 'text/javascript';
        script.async = true;
        
        const widgetConfig = {
          "width": width,
          "height": height,
          "defaultColumn": defaultColumn,
          "screener_type": "crypto_mkt",
          "displayCurrency": displayCurrency,
          "colorTheme": colorTheme,
          "locale": "en"
        };
        
        script.innerHTML = JSON.stringify(widgetConfig);
        
        script.onload = () => {
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to reload crypto screener.');
          setLoading(false);
        };
        
        if (containerRef.current) {
          containerRef.current.appendChild(widgetContainer);
          containerRef.current.appendChild(copyrightElement);
          containerRef.current.appendChild(script);
        }
      }, 300);
    }
  };

  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-2 border-b border-slate-700 flex justify-between items-center">
        <div className="font-medium text-sm">Crypto Screener</div>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleReload}>
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reload
        </Button>
      </div>
      
      <div className="flex-grow relative">
        <div 
          id={uniqueId.current}
          ref={containerRef}
          className="tradingview-widget-container w-full h-full"
        ></div>
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading crypto screener...</p>
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
                Reload Screener
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingViewCryptoScreener;