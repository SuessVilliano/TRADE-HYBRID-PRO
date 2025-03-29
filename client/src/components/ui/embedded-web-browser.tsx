import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RefreshCw, ArrowLeft, ArrowRight, Home, X, ExternalLink } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EmbeddedWebBrowserProps {
  initialUrl?: string;
  title?: string;
  className?: string;
  height?: string | number;
  allowExternalLinks?: boolean;
}

export function EmbeddedWebBrowser({
  initialUrl = "https://app.tradehybrid.club/51411/traderunners/",
  title = "App",
  className = "",
  height = "calc(100vh - 180px)",
  allowExternalLinks = true
}: EmbeddedWebBrowserProps) {
  const [url, setUrl] = useState(initialUrl);
  const [inputValue, setInputValue] = useState(initialUrl);
  const [history, setHistory] = useState<string[]>([initialUrl]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Update the input value when URL changes
  useEffect(() => {
    setInputValue(url);
  }, [url]);

  // Handle URL navigation
  const navigateTo = (newUrl: string) => {
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = `https://${newUrl}`;
    }
    
    // Update loading state
    setIsLoading(true);
    
    // Update URL
    setUrl(newUrl);
    
    // Update history
    if (historyIndex < history.length - 1) {
      // If we're in history, truncate future entries
      setHistory([...history.slice(0, historyIndex + 1), newUrl]);
      setHistoryIndex(historyIndex + 1);
    } else {
      // Just add to history
      setHistory([...history, newUrl]);
      setHistoryIndex(history.length);
    }
  };

  // Handle form submission (URL input)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigateTo(inputValue);
  };

  // Handle back button
  const handleBack = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
      setUrl(history[historyIndex - 1]);
    }
  };

  // Handle forward button
  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
      setUrl(history[historyIndex + 1]);
    }
  };

  // Handle home button
  const handleHome = () => {
    navigateTo(initialUrl);
  };

  // Handle iframe load event
  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  // Open in new tab
  const handleOpenExternal = () => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <Card className={`overflow-hidden web-browser-container ${className}`}>
      <CardHeader className="p-3 pb-2 border-b bg-slate-800">
        <div className="flex items-center gap-2">
          <CardTitle className="text-md flex-grow">{title}</CardTitle>
          
          <div className="flex items-center gap-1">
            {allowExternalLinks && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleOpenExternal}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Open in new tab</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleBack} 
            disabled={historyIndex <= 0}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleForward} 
            disabled={historyIndex >= history.length - 1}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={handleHome}
          >
            <Home className="h-4 w-4" />
          </Button>
          
          <form onSubmit={handleSubmit} className="flex-grow flex items-center">
            <div className="relative flex-grow">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="h-8 pr-8 focus-visible:ring-primary"
                placeholder="Enter URL..."
              />
              {inputValue && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                  onClick={() => setInputValue('')}
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 ml-1" 
              onClick={() => navigateTo(url)}
              type="button"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          </form>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 relative">
        {isLoading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-10">
            <div className="h-full bg-primary animate-pulse" style={{ width: '100%' }}></div>
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={url}
          className="w-full border-0"
          style={{ height }}
          onLoad={handleIframeLoad}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
}