import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { RefreshCw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

interface TradingViewIframeProps {
  symbol?: string;
  interval?: string;
  theme?: 'light' | 'dark';
  height?: string;
  width?: string;
  className?: string;
  title?: string;
  showToolbar?: boolean;
}

export function TradingViewIframe({
  symbol = 'BTCUSDT',
  interval = '1D',
  theme = 'dark',
  height = '600px',
  width = '100%',
  className = '',
  title = 'TradingView Chart',
  showToolbar = true
}: TradingViewIframeProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [isMaximized, setIsMaximized] = useState(false);
  const [iframeKey, setIframeKey] = useState(0);

  // Construct TradingView chart URL with proper parameters
  const constructChartUrl = () => {
    const baseUrl = 'https://www.tradingview.com/widgetembed/';
    const params = new URLSearchParams({
      frameElementId: `tradingview_${Date.now()}`,
      symbol: `BINANCE:${symbol}`,
      interval: interval,
      hidesidetoolbar: '1',
      hidetoptoolbar: showToolbar ? '0' : '1',
      symboledit: '1',
      saveimage: '1',
      toolbarbg: theme === 'dark' ? 'rgba(66, 66, 66, 1)' : 'rgba(255, 255, 255, 1)',
      studies: '[]',
      theme: theme,
      style: '1',
      timezone: 'Etc/UTC',
      studies_overrides: '{}',
      overrides: '{}',
      enabled_features: '[]',
      disabled_features: '[]',
      locale: 'en',
      utm_source: 'tradehybrid.club',
      utm_medium: 'widget_new',
      utm_campaign: 'chart',
      utm_term: symbol
    });

    return `${baseUrl}?${params.toString()}`;
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey(prev => prev + 1);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleOpenExternal = () => {
    const externalUrl = `https://www.tradingview.com/chart/?symbol=BINANCE:${symbol}`;
    window.open(externalUrl, '_blank', 'noopener,noreferrer');
  };

  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  return (
    <Card className={`bg-slate-800/50 border-slate-600 ${className} ${isMaximized ? 'fixed inset-4 z-50' : ''}`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-sm">{title}</CardTitle>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMaximize}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOpenExternal}
              className="h-8 w-8 p-0 text-slate-400 hover:text-white"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 relative">
        <div className="relative" style={{ height: isMaximized ? 'calc(100vh - 120px)' : height, width }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-10">
              <div className="text-center">
                <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                <p className="text-slate-300 text-sm">Loading chart...</p>
              </div>
            </div>
          )}
          <iframe
            key={iframeKey}
            src={constructChartUrl()}
            className="w-full h-full border-0 rounded-b-lg"
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title={`TradingView Chart - ${symbol}`}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default TradingViewIframe;