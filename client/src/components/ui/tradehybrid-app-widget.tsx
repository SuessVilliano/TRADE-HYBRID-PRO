import React, { useEffect, useState, useRef } from 'react';
import { Button } from './button';
import { RefreshCw, ExternalLink, Maximize2, Minimize2 } from 'lucide-react';

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
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800 bg-opacity-75 z-10">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-sm text-slate-300">Loading TradeHybrid App...</p>
            </div>
          </div>
        )}
        
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
      </div>
    </div>
  );
}

export default TradeHybridAppWidget;