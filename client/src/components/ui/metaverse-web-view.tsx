import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { Input } from './input';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { AdvancedAIAnalysis } from './advanced-ai-analysis';
import { useWebApp } from '@/lib/stores/useWebApp';
import { useIsMobile } from '@/hooks/use-is-mobile';
import { 
  Globe, 
  X, 
  Maximize2, 
  Minimize2, 
  ExternalLink, 
  Loader2,
  RefreshCw,
  BrainCircuit,
  ArrowLeft,
  ArrowRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetaverseWebView() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState<string>('ai-analysis');
  const [url, setUrl] = useState<string>('https://app.tradehybrid.co');
  const [inputUrl, setInputUrl] = useState<string>('https://app.tradehybrid.co');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [isResizing, setIsResizing] = useState<boolean>(false);
  const [resizeStartPos, setResizeStartPos] = useState({ x: 0, y: 0 });
  const [size, setSize] = useState({ width: isMobile ? '95%' : '80%', height: isMobile ? '80%' : '70%' });
  const cardRef = useRef<HTMLDivElement>(null);
  const { isOpen, openWebApp, closeWebApp } = useWebApp();
  const browserHistory = useRef<string[]>([]);
  const currentHistoryIndex = useRef<number>(-1);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Add current URL to history when it changes
  useEffect(() => {
    if (url && (browserHistory.current.length === 0 || browserHistory.current[currentHistoryIndex.current] !== url)) {
      // If we navigated back/forward and then to a new URL, truncate the forward history
      if (currentHistoryIndex.current < browserHistory.current.length - 1) {
        browserHistory.current = browserHistory.current.slice(0, currentHistoryIndex.current + 1);
      }
      
      browserHistory.current.push(url);
      currentHistoryIndex.current = browserHistory.current.length - 1;
    }
  }, [url]);
  
  // Handle fullscreen changes
  useEffect(() => {
    if (isFullscreen) {
      setSize({ width: '100%', height: '100%' });
    } else if (!isResizing) {
      setSize({ width: isMobile ? '95%' : '80%', height: isMobile ? '80%' : '70%' });
    }
  }, [isFullscreen, isMobile, isResizing]);
  
  // Handle browser back button
  const handleBack = () => {
    if (currentHistoryIndex.current > 0) {
      currentHistoryIndex.current--;
      setUrl(browserHistory.current[currentHistoryIndex.current]);
    }
  };
  
  // Handle browser forward button
  const handleForward = () => {
    if (currentHistoryIndex.current < browserHistory.current.length - 1) {
      currentHistoryIndex.current++;
      setUrl(browserHistory.current[currentHistoryIndex.current]);
    }
  };
  
  // Handle URL input submission
  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add protocol if missing
    let processedUrl = inputUrl.trim();
    if (!/^https?:\/\//i.test(processedUrl)) {
      processedUrl = 'https://' + processedUrl;
      setInputUrl(processedUrl);
    }
    
    setUrl(processedUrl);
    setIsLoading(true);
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent, corner: string) => {
    e.preventDefault();
    setIsResizing(true);
    setResizeStartPos({ x: e.clientX, y: e.clientY });
    
    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (!cardRef.current) return;
      
      const deltaX = moveEvent.clientX - resizeStartPos.x;
      const deltaY = moveEvent.clientY - resizeStartPos.y;
      
      const cardRect = cardRef.current.getBoundingClientRect();
      
      let newWidth, newHeight;
      
      // Calculate new size based on which corner is being dragged
      if (corner === 'br') {
        newWidth = cardRect.width + deltaX;
        newHeight = cardRect.height + deltaY;
      } else if (corner === 'bl') {
        newWidth = cardRect.width - deltaX;
        newHeight = cardRect.height + deltaY;
      } else if (corner === 'tr') {
        newWidth = cardRect.width + deltaX;
        newHeight = cardRect.height - deltaY;
      } else {
        newWidth = cardRect.width - deltaX;
        newHeight = cardRect.height - deltaY;
      }
      
      // Set minimum dimensions
      newWidth = Math.max(300, newWidth);
      newHeight = Math.max(200, newHeight);
      
      // Update size
      setSize({
        width: `${newWidth}px`,
        height: `${newHeight}px`
      });
      
      setResizeStartPos({ x: moveEvent.clientX, y: moveEvent.clientY });
    };
    
    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };
  
  // Toggle fullscreen
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };
  
  // Reload frame
  const reloadFrame = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = url;
    }
  };
  
  // Open in new tab
  const openInNewTab = () => {
    window.open(url, '_blank');
  };
  
  return (
    <div 
      className={cn(
        "fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm",
        isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
      )}
      style={{ transition: "opacity 0.2s ease-in-out" }}
    >
      <Card 
        ref={cardRef}
        className={cn(
          "relative overflow-hidden border-2 shadow-xl transition-all duration-300",
          isFullscreen ? "rounded-none" : "rounded-lg"
        )}
        style={{ 
          width: size.width, 
          height: size.height, 
          maxWidth: isFullscreen ? '100%' : '95%',
          maxHeight: isFullscreen ? '100%' : '95%',
        }}
      >
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b">
          <div className="flex items-center gap-2">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-auto">
              <TabsList>
                <TabsTrigger value="ai-analysis" className="flex items-center gap-1">
                  <BrainCircuit className="h-4 w-4" />
                  <span>AI Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="web-browser" className="flex items-center gap-1">
                  <Globe className="h-4 w-4" />
                  <span>Web Browser</span>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          
          <div className="flex items-center gap-1">
            {isFullscreen ? (
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                <Minimize2 className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="ghost" size="icon" onClick={toggleFullscreen}>
                <Maximize2 className="h-4 w-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => closeWebApp()}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        
        <div className="flex-1 relative">
          <TabsContent value="ai-analysis" className="h-full">
            <AdvancedAIAnalysis />
          </TabsContent>
          
          <TabsContent value="web-browser" className="h-full">
            <div className="p-2 border-b flex items-center gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleBack} 
                disabled={currentHistoryIndex.current <= 0}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleForward} 
                disabled={currentHistoryIndex.current >= browserHistory.current.length - 1}
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={reloadFrame}
                disabled={isLoading}
              >
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              </Button>
              
              <form onSubmit={handleUrlSubmit} className="flex-1 flex">
                <Input
                  type="text"
                  placeholder="Enter URL"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  className="flex-1 h-8 text-sm"
                />
                <Button type="submit" size="sm" variant="ghost" className="px-2">
                  Go
                </Button>
              </form>
              
              <Button variant="ghost" size="icon" onClick={openInNewTab}>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
            
            <CardContent className="p-0 h-[calc(100%-45px)]">
              {isLoading && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm flex items-center justify-center z-10">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              )}
              <iframe 
                ref={iframeRef}
                src={url} 
                className="w-full h-full border-0" 
                title="Web Browser"
                onLoad={() => setIsLoading(false)}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
              />
            </CardContent>
          </TabsContent>
        </div>
        
        {/* Resize handles - only shown when not fullscreen */}
        {!isFullscreen && (
          <>
            <div
              className="absolute bottom-0 right-0 w-6 h-6 cursor-nwse-resize"
              onMouseDown={(e) => handleResizeStart(e, 'br')}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-muted-foreground opacity-50">
                <path d="M22 22L16 16M16 22L22 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <div
              className="absolute bottom-0 left-0 w-6 h-6 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'bl')}
            />
            <div
              className="absolute top-0 right-0 w-6 h-6 cursor-nesw-resize"
              onMouseDown={(e) => handleResizeStart(e, 'tr')}
            />
          </>
        )}
      </Card>
    </div>
  );
}