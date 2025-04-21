import React, { useState } from 'react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { Button } from './button';

interface TradingViewIframeChartProps {
  symbol?: string;
  chartId?: string;
  className?: string;
}

export function TradingViewIframeChart({ 
  symbol = 'BTCUSDT', 
  chartId = 'GtJVbpFg', 
  className = '' 
}: TradingViewIframeChartProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // The base URL for TradingView chart
  const chartUrl = `https://www.tradingview.com/chart/${chartId}/`;

  const handleIframeLoad = () => {
    setLoading(false);
  };

  const handleIframeError = () => {
    setError('Failed to load TradingView chart. Please check your internet connection.');
  };

  const handleReload = () => {
    setLoading(true);
    setError(null);
    // Force iframe reload by changing the key
    const iframe = document.getElementById('tradingview-chart-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = `${iframe.src}?reload=${Date.now()}`;
    }
  };

  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col overflow-hidden ${className}`}>
      <div className="p-2 border-b border-slate-700 flex justify-between items-center">
        <div className="font-medium text-sm">
          {symbol} Chart (TradingView)
        </div>
        <Button variant="outline" size="sm" className="text-xs" onClick={handleReload}>
          <RefreshCcw className="h-3 w-3 mr-1" />
          Reload
        </Button>
      </div>
      
      <div className="flex-grow relative">
        {/* TradingView iframe */}
        <iframe
          id="tradingview-chart-iframe"
          src={chartUrl}
          className="w-full h-full border-0"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title="TradingView Chart"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        />
        
        {/* Loading indicator */}
        {loading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading chart...</p>
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
                Reload Chart
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TradingViewIframeChart;