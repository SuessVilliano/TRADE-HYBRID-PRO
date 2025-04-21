import React, { useRef, useEffect, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface EconomicCalendarProps {
  height?: string | number;
  width?: string | number;
  colorTheme?: 'light' | 'dark';
  isTransparent?: boolean;
  locale?: string;
  importanceFilter?: string;
  className?: string;
}

export function TradingViewEconomicCalendar({
  height = '100%',
  width = '100%',
  colorTheme = 'dark',
  isTransparent = false,
  locale = 'en',
  importanceFilter = '-1,0,1',
  className = ''
}: EconomicCalendarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useRef(`tv_economic_calendar_${Math.floor(Math.random() * 1000000)}`);

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
      link.href = 'https://www.tradingview.com/markets/currencies/economic-calendar/';
      link.rel = 'noopener';
      link.target = '_blank';
      
      const span = document.createElement('span');
      span.className = 'blue-text';
      span.textContent = 'Economic Calendar';
      
      link.appendChild(span);
      link.appendChild(document.createTextNode(' by TradingView'));
      copyrightElement.appendChild(link);
      
      // Create script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
      script.type = 'text/javascript';
      script.async = true;
      
      // Widget configuration
      const widgetConfig = {
        "width": width,
        "height": height,
        "colorTheme": colorTheme,
        "isTransparent": isTransparent,
        "locale": locale,
        "importanceFilter": importanceFilter
      };
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
      // Success and error handling
      script.onload = () => {
        setLoading(false);
      };
      
      script.onerror = () => {
        setError('Failed to load economic calendar. Please try again later.');
        setLoading(false);
      };
      
      // Append elements to container
      containerRef.current.appendChild(widgetContainer);
      containerRef.current.appendChild(copyrightElement);
      containerRef.current.appendChild(script);
      
      // Set a timeout to detect if the widget doesn't load properly
      const loadTimeout = setTimeout(() => {
        if (loading) {
          setError('The calendar is taking longer than expected to load. Please try refreshing.');
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
      setError('An error occurred while loading the economic calendar.');
      setLoading(false);
      console.error('Error loading economic calendar:', err);
    }
  }, [height, width, colorTheme, isTransparent, locale, importanceFilter]);
  
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
        link.href = 'https://www.tradingview.com/markets/currencies/economic-calendar/';
        link.rel = 'noopener';
        link.target = '_blank';
        link.innerHTML = '<span class="blue-text">Economic Calendar</span> by TradingView';
        copyrightElement.appendChild(link);
        
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
        script.type = 'text/javascript';
        script.async = true;
        
        const widgetConfig = {
          "width": width,
          "height": height,
          "colorTheme": colorTheme,
          "isTransparent": isTransparent,
          "locale": locale,
          "importanceFilter": importanceFilter
        };
        
        script.innerHTML = JSON.stringify(widgetConfig);
        
        script.onload = () => {
          setLoading(false);
        };
        
        script.onerror = () => {
          setError('Failed to reload economic calendar.');
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
        <div className="font-medium text-sm">Economic Calendar</div>
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
              <p className="text-sm text-slate-300">Loading economic calendar...</p>
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
                Reload Calendar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingViewEconomicCalendar;