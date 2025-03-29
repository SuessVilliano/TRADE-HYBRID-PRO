import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Input } from './input';
import { cn } from '@/lib/utils';
import { RotateCw, ChevronLeft, ChevronRight, Home, X, Maximize2, Minimize2 } from 'lucide-react';
import { ScrollArea } from './scroll-area';

interface WebBrowserProps {
  className?: string;
  initialUrl?: string;
  title?: string;
  fullHeight?: boolean;
  onClose?: () => void;
}

export function WebBrowser({
  className,
  initialUrl = 'https://app.gettraderunner.com',
  title = 'Trade Runner Browser',
  fullHeight = false,
  onClose
}: WebBrowserProps) {
  const [url, setUrl] = useState<string>(initialUrl);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([initialUrl]);
  const [currentHistoryIndex, setCurrentHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const navigate = (newUrl: string) => {
    if (!newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
      newUrl = `https://${newUrl}`;
    }
    
    setIsLoading(true);
    setUrl(newUrl);
    
    // Update history
    const newHistory = navigationHistory.slice(0, currentHistoryIndex + 1);
    newHistory.push(newUrl);
    setNavigationHistory(newHistory);
    setCurrentHistoryIndex(newHistory.length - 1);
  };
  
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      navigate(url);
    }
  };
  
  const goBack = () => {
    if (currentHistoryIndex > 0) {
      setCurrentHistoryIndex(currentHistoryIndex - 1);
      setUrl(navigationHistory[currentHistoryIndex - 1]);
      setIsLoading(true);
    }
  };
  
  const goForward = () => {
    if (currentHistoryIndex < navigationHistory.length - 1) {
      setCurrentHistoryIndex(currentHistoryIndex + 1);
      setUrl(navigationHistory[currentHistoryIndex + 1]);
      setIsLoading(true);
    }
  };
  
  const goHome = () => {
    navigate(initialUrl);
  };
  
  const reload = () => {
    setIsLoading(true);
    if (iframeRef.current) {
      iframeRef.current.src = url;
    }
  };
  
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  useEffect(() => {
    const handleIframeLoad = () => {
      setIsLoading(false);
    };
    
    const iframe = iframeRef.current;
    if (iframe) {
      iframe.addEventListener('load', handleIframeLoad);
    }
    
    return () => {
      if (iframe) {
        iframe.removeEventListener('load', handleIframeLoad);
      }
    };
  }, []);
  
  return (
    <Card className={cn(
      "w-full overflow-hidden border border-gray-200 shadow-md",
      isFullscreen ? "fixed inset-0 z-50 m-0 h-screen w-screen rounded-none" : "",
      fullHeight ? "h-full" : "h-[600px]",
      className
    )}>
      <CardHeader className="bg-slate-800 p-3 border-b flex-row items-center justify-between space-y-0">
        <div className="flex items-center flex-1 overflow-hidden">
          <CardTitle className="mr-4 text-md whitespace-nowrap">{title}</CardTitle>
          <div className="flex items-center space-x-1 mr-2">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goBack}
              disabled={currentHistoryIndex === 0}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goForward}
              disabled={currentHistoryIndex >= navigationHistory.length - 1}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={reload}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <RotateCw className={cn("h-4 w-4", isLoading ? "animate-spin" : "")} />
            </Button>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={goHome}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <Home className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex-1 min-w-0">
            <div className="relative flex items-center">
              <Input
                value={url}
                onChange={handleUrlChange}
                onKeyPress={handleKeyPress}
                className="h-8 bg-slate-700 border-slate-600 text-sm text-white"
                placeholder="Enter URL..."
              />
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-1 ml-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleFullscreen}
            className="h-8 w-8 text-white/70 hover:text-white"
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
          {onClose && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={onClose}
              className="h-8 w-8 text-white/70 hover:text-white"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0 flex-1 overflow-hidden bg-white">
        <ScrollArea className="h-full w-full">
          <div className="relative w-full h-full">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100/80 z-10">
                <div className="flex flex-col items-center">
                  <RotateCw className="h-8 w-8 animate-spin text-indigo-600" />
                  <span className="mt-2 text-sm text-gray-600">Loading...</span>
                </div>
              </div>
            )}
            <iframe 
              ref={iframeRef}
              src={navigationHistory[currentHistoryIndex]}
              className="w-full h-full border-0"
              style={{ minHeight: fullHeight ? 'calc(100vh - 124px)' : '540px' }}
              sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              title="Web Browser Content"
            />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}