import React, { useEffect, useState, useRef } from 'react';
import { Button } from './button';
import { RefreshCw, ExternalLink, Maximize2, Minimize2, AlertTriangle } from 'lucide-react';

interface TradeHybridAppWidgetProps {
  isMaximized?: boolean;
  onMaximize?: () => void;
  height?: string;
  width?: string;
  className?: string;
}

export function TradeHybridAppWidget({
  isMaximized = false,
  onMaximize = () => {},
  height = '100%',
  width = '100%',
  className = ''
}: TradeHybridAppWidgetProps) {
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const handleRefresh = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      const currentSrc = iframeRef.current.src;
      iframeRef.current.src = '';
      setTimeout(() => {
        if (iframeRef.current) {
          iframeRef.current.src = currentSrc;
        }
      }, 100);
    }
  };
  
  const handleOpenExternal = () => {
    window.open('https://app.tradehybrid.co', '_blank', 'noopener,noreferrer');
  };
  
  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  
  // Define a fallback content component to handle iframe loading errors
  const FallbackContent = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 bg-slate-800 text-center">
      <div className="mb-6 p-4 rounded-full bg-red-500/20">
        <AlertTriangle className="h-8 w-8 text-red-400" />
      </div>
      <h3 className="text-lg font-medium text-white mb-2">Unable to load TradeHybrid App</h3>
      <p className="text-slate-400 mb-4 max-w-md">
        The embedded app couldn't be loaded. This could be due to network issues or content security policies.
      </p>
      <div className="flex gap-3">
        <Button
          onClick={handleRefresh}
          className="gap-2"
          variant="outline"
        >
          <RefreshCw className="h-4 w-4" /> Reload
        </Button>
        <Button 
          onClick={handleOpenExternal}
          className="gap-2"
        >
          <ExternalLink className="h-4 w-4" /> Open in New Tab
        </Button>
      </div>
    </div>
  );

  // Add a state to track iframe errors
  const [hasError, setHasError] = useState(false);

  // Handle iframe error
  const handleIframeError = () => {
    console.error("TradeHybrid App iframe failed to load");
    setHasError(true);
    setIsLoading(false);
  };

  // Adding effect to detect iframe loading issues with a timeout
  useEffect(() => {
    if (isLoading) {
      // Set a timeout to detect long-loading iframes
      const timeoutId = setTimeout(() => {
        if (isLoading) {
          console.warn("TradeHybrid App iframe loading timeout");
          setHasError(true);
          setIsLoading(false);
        }
      }, 15000); // 15 seconds timeout

      return () => clearTimeout(timeoutId);
    }
  }, [isLoading]);

  return (
    <div 
      className={`relative flex flex-col h-full w-full overflow-hidden bg-slate-850 rounded-md ${className}`}
      style={{ height, width }}
    >
      <div className="flex items-center justify-between p-2 border-b border-slate-700 bg-slate-800">
        <div className="font-medium text-sm">TradeHybrid Web App</div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleRefresh}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={onMaximize}
          >
            {isMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={handleOpenExternal}
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="flex-grow relative">
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading TradeHybrid App...</p>
            </div>
          </div>
        )}
        
        {hasError ? (
          <FallbackContent />
        ) : (
          <iframe
            ref={iframeRef}
            src="https://app.tradehybrid.co"
            className="w-full h-full border-0"
            onLoad={handleIframeLoad}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
            sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
            title="TradeHybrid Web App"
          />
        )}
      </div>
    </div>
  );
}

export default TradeHybridAppWidget;