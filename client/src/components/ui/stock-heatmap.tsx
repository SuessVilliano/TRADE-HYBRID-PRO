import React, { useEffect, useState } from 'react';
import { AlertTriangle, ExternalLink, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface StockHeatmapProps {
  dataSource?: string;
  colorTheme?: 'light' | 'dark';
  height?: string;
  width?: string;
  showTopBar?: boolean;
  market?: 'crypto' | 'stock';
}

/**
 * TradingView stock heatmap widget using iframes for better stability
 * This approach avoids the script initialization errors by using a direct iframe
 */
export function StockHeatmap({
  dataSource = 'SPX500',
  colorTheme = 'dark',
  height = '100%',
  width = '100%',
  showTopBar = true,
  market = 'stock'
}: StockHeatmapProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Determine the correct URL for TradingView heatmap based on market type
  const getTradingViewHeatmapUrl = () => {
    if (market === 'crypto') {
      return 'https://www.tradingview.com/markets/cryptocurrencies/prices-all/';
    } else {
      // Stock market heatmap
      return 'https://www.tradingview.com/heatmap/stock/';
    }
  };
  
  // Handle iframe load events
  const handleIframeLoad = () => {
    setLoading(false);
  };
  
  // Handle iframe error events
  const handleIframeError = () => {
    setError('Unable to load TradingView heatmap. Please check your connection.');
    setLoading(false);
  };
  
  // Open TradingView in a new tab
  const openTradingView = () => {
    window.open(getTradingViewHeatmapUrl(), '_blank');
  };
  
  // Retry loading the iframe
  const handleReload = () => {
    setLoading(true);
    setError(null);
    
    // Force reload by recreating the iframe
    const iframe = document.getElementById('tradingview-heatmap-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = getTradingViewHeatmapUrl();
    }
  };
  
  // Set iframe height based on prop
  const getIframeHeight = () => {
    if (typeof height === 'string') {
      if (height.endsWith('%')) {
        return 'h-full';
      }
      return height;
    }
    return '100%';
  };

  return (
    <div className="tradingview-widget-container relative h-full w-full bg-slate-900 overflow-hidden">
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
            <div className="flex justify-center gap-2">
              <Button onClick={handleReload} size="sm" variant="outline" className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Reload
              </Button>
              <Button onClick={openTradingView} size="sm" variant="outline" className="gap-2">
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {/* Direct TradingView iframe */}
      <iframe
        id="tradingview-heatmap-iframe"
        src={getTradingViewHeatmapUrl()}
        style={{ width: '100%', height: getIframeHeight() }}
        onLoad={handleIframeLoad}
        onError={handleIframeError}
        frameBorder="0"
        allowFullScreen
        className={`w-full ${loading ? 'opacity-0' : 'opacity-100'} transition-opacity`}
      />
    </div>
  );
}

export default StockHeatmap;