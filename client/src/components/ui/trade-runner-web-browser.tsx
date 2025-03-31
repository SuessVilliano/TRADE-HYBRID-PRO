import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TradeRunnerWebBrowserProps {
  className?: string;
}

export function TradeRunnerWebBrowser({ className = '' }: TradeRunnerWebBrowserProps) {
  const tradeRunnerUrl = "https://pro.tradehybrid.club/51411/traderunners";
  const [iframeLoaded, setIframeLoaded] = useState(false);

  // Handle iframe loaded state
  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  return (
    <Card className={`overflow-hidden ${className}`}>
      {/* URL Display Bar */}
      <div className="bg-slate-800 border-b border-slate-700 px-3 py-2 flex items-center">
        <div className="flex-1 bg-slate-900 rounded-md px-3 py-1.5 text-sm text-slate-300 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-green-500">
            <circle cx="12" cy="12" r="10" />
            <path d="M8 12h8" />
            <path d="M12 8v8" />
          </svg>
          <span className="truncate">{tradeRunnerUrl}</span>
        </div>
      </div>
      
      <CardContent className="p-0 relative">
        {!iframeLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-900">
            <div className="text-center">
              <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
              <p className="text-slate-300">Loading Trade Runner...</p>
            </div>
          </div>
        )}
        <iframe
          src={tradeRunnerUrl}
          className="w-full border-0"
          style={{ height: 'calc(100vh - 220px)' }} /* Adjusted height to account for URL bar */
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
          onLoad={handleIframeLoad}
        />
      </CardContent>
    </Card>
  );
}