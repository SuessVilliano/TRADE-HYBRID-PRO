import React, { useEffect, useRef, useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface StockHeatmapProps {
  dataSource?: string;
  colorTheme?: 'light' | 'dark';
  height?: string;
  width?: string;
  showTopBar?: boolean;
  market?: 'crypto' | 'stock';
}

export function StockHeatmap({
  dataSource = 'SPX500',
  colorTheme = 'dark',
  height = '100%',
  width = '100%',
  showTopBar = true,
  market = 'stock'
}: StockHeatmapProps) {
  // If market is specified, override dataSource accordingly
  useEffect(() => {
    if (market === 'crypto' && dataSource === 'SPX500') {
      dataSource = 'crypto';
    } else if (market === 'stock' && dataSource === 'crypto') {
      dataSource = 'SPX500';
    }
  }, [market, dataSource]);
  const container = useRef<HTMLDivElement>(null);
  const scriptLoaded = useRef(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const uniqueId = useRef(`tv_heatmap_${Math.floor(Math.random() * 1000000)}`);

  // Function to load the heatmap
  const loadHeatmap = () => {
    if (!container.current) return;
    
    // Clear any existing content
    while (container.current.firstChild) {
      container.current.removeChild(container.current.firstChild);
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Create widget container
      const widgetContainer = document.createElement('div');
      widgetContainer.className = 'tradingview-widget-container__widget';
      widgetContainer.id = uniqueId.current;
      
      // Create script element
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-stock-heatmap.js';
      script.type = 'text/javascript';
      script.async = true;
      
      // Set widget configuration
      const widgetConfig = {
        exchanges: [],
        dataSource: dataSource,
        grouping: "sector",
        blockSize: "market_cap_calc",
        blockColor: "change",
        locale: "en",
        symbolUrl: "",
        colorTheme: colorTheme,
        hasTopBar: showTopBar,
        isDataSetEnabled: true,
        isZoomEnabled: true,
        hasSymbolTooltip: true,
        width: width,
        height: height
      };
      
      script.innerHTML = JSON.stringify(widgetConfig);
      
      // Add loading and error handlers
      script.onload = () => {
        console.log('Heatmap script loaded successfully');
        setLoading(false);
      };
      
      script.onerror = () => {
        console.error('Failed to load heatmap script');
        setError('Failed to load market heatmap. Please try again later.');
        setLoading(false);
      };
      
      // Create a timeout to detect if the widget doesn't load properly
      const loadTimeout = setTimeout(() => {
        // Check if widget content has been added
        const widgetContent = document.querySelector(`#${uniqueId.current} iframe`);
        if (!widgetContent) {
          setError('The market heatmap is taking longer than expected to load. Please try refreshing.');
          setLoading(false);
        }
      }, 10000); // 10 second timeout
      
      // Add widget container and script to the DOM
      container.current.appendChild(widgetContainer);
      container.current.appendChild(script);
      
      scriptLoaded.current = true;
      
      return () => {
        clearTimeout(loadTimeout);
        if (container.current) {
          while (container.current.firstChild) {
            container.current.removeChild(container.current.firstChild);
          }
        }
        scriptLoaded.current = false;
      };
    } catch (err) {
      console.error('Error initializing heatmap:', err);
      setError('An error occurred while loading the market heatmap.');
      setLoading(false);
    }
  };

  // Load heatmap on component mount and when props change
  useEffect(() => {
    return loadHeatmap();
  }, [dataSource, colorTheme, height, width, showTopBar]);
  
  // Reload heatmap when requested
  const handleReload = () => {
    scriptLoaded.current = false;
    loadHeatmap();
  };

  return (
    <div className="tradingview-widget-container relative h-full w-full" ref={container}>
      {/* Loading indicator */}
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-75 z-10">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-sm text-muted-foreground">Loading Market Heatmap...</p>
          </div>
        </div>
      )}
      
      {/* Error message */}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center bg-background bg-opacity-90 z-10">
          <div className="text-center p-6 max-w-md">
            <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-destructive" />
            <p className="text-sm text-destructive mb-4">{error}</p>
            <Button onClick={handleReload} size="sm" variant="outline" className="gap-2">
              <RefreshCcw className="h-4 w-4" />
              Reload Heatmap
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default StockHeatmap;