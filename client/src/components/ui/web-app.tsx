import { useEffect, useState, useRef } from "react";
import { useWebApp } from "@/lib/stores/useWebApp";
import { Card, CardContent } from "./card";
import { Button } from "./button";
import { 
  X, Maximize2, Minimize2, ExternalLink, Loader2, 
  Move, RotateCw, ChevronsRight, ChevronsLeft, 
  ChevronsUp, ChevronsDown, Globe, BrainCircuit
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ContextualTooltip } from "./contextual-tooltip";
import { MetaverseWebView } from "./metaverse-web-view";

export function WebApp() {
  const { isOpen, url, closeWebApp } = useWebApp();
  const [isAdvancedView, setIsAdvancedView] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [position, setPosition] = useState({ x: 50, y: 50 });
  const [size, setSize] = useState({ width: 80, height: 80 });
  const dragRef = useRef<{ startX: number; startY: number; startPosX: number; startPosY: number }>({ startX: 0, startY: 0, startPosX: 0, startPosY: 0 });
  const resizeRef = useRef<{ startX: number; startY: number; startWidth: number; startHeight: number }>({ startX: 0, startY: 0, startWidth: 0, startHeight: 0 });
  
  // Close web app on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        closeWebApp();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeWebApp]);
  
  // Reset loading state when URL changes
  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
    }
  }, [url, isOpen]);
  
  // Handle drag start
  const handleDragStart = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isFullscreen) return;
    
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: position.x,
      startPosY: position.y
    };
    
    // Add global event listeners
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Prevent text selection during drag
    e.preventDefault();
  };
  
  // Handle drag move
  const handleDragMove = (e: MouseEvent) => {
    if (!isDragging) return;
    
    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    
    // Calculate new position as percentage of viewport
    const newX = Math.max(0, Math.min(100 - size.width/2, dragRef.current.startPosX + (deltaX / window.innerWidth * 100)));
    const newY = Math.max(0, Math.min(100 - size.height/2, dragRef.current.startPosY + (deltaY / window.innerHeight * 100)));
    
    setPosition({ x: newX, y: newY });
  };
  
  // Handle drag end
  const handleDragEnd = () => {
    setIsDragging(false);
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  };
  
  // Handle resize start
  const handleResizeStart = (e: React.MouseEvent<HTMLDivElement>, corner: 'br' | 'bl' | 'tr' | 'tl') => {
    if (isFullscreen) return;
    
    setIsResizing(true);
    resizeRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startWidth: size.width,
      startHeight: size.height
    };
    
    // Store the corner being dragged
    (resizeRef as any).current.corner = corner;
    
    // Add global event listeners
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
    
    // Prevent text selection during resize
    e.preventDefault();
  };
  
  // Handle resize move
  const handleResizeMove = (e: MouseEvent) => {
    if (!isResizing) return;
    
    const corner = (resizeRef as any).current.corner;
    const deltaX = e.clientX - resizeRef.current.startX;
    const deltaY = e.clientY - resizeRef.current.startY;
    
    // Calculate the width/height changes in viewport percentage
    const widthDelta = deltaX / window.innerWidth * 100;
    const heightDelta = deltaY / window.innerHeight * 100;
    
    let newWidth = resizeRef.current.startWidth;
    let newHeight = resizeRef.current.startHeight;
    let newX = position.x;
    let newY = position.y;
    
    // Apply resizing based on the corner
    if (corner === 'br') {
      newWidth = Math.max(20, Math.min(95, resizeRef.current.startWidth + widthDelta));
      newHeight = Math.max(20, Math.min(95, resizeRef.current.startHeight + heightDelta));
    } else if (corner === 'bl') {
      newWidth = Math.max(20, Math.min(95, resizeRef.current.startWidth - widthDelta));
      newHeight = Math.max(20, Math.min(95, resizeRef.current.startHeight + heightDelta));
      newX = position.x + widthDelta;
    } else if (corner === 'tr') {
      newWidth = Math.max(20, Math.min(95, resizeRef.current.startWidth + widthDelta));
      newHeight = Math.max(20, Math.min(95, resizeRef.current.startHeight - heightDelta));
      newY = position.y + heightDelta;
    } else if (corner === 'tl') {
      newWidth = Math.max(20, Math.min(95, resizeRef.current.startWidth - widthDelta));
      newHeight = Math.max(20, Math.min(95, resizeRef.current.startHeight - heightDelta));
      newX = position.x + widthDelta;
      newY = position.y + heightDelta;
    }
    
    setSize({ width: newWidth, height: newHeight });
    setPosition({ x: newX, y: newY });
  };
  
  // Handle resize end
  const handleResizeEnd = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };
  
  // Reset position to center
  const centerApp = () => {
    setPosition({ 
      x: (100 - size.width) / 2, 
      y: (100 - size.height) / 2 
    });
  };
  
  // Reload the iframe
  const handleReload = () => {
    setIsLoading(true);
    const iframe = document.getElementById('tradehybrid-iframe') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = url || 'https://app.tradehybrid.co';
    }
  };

  // Maximize width keeping same height
  const maximizeWidth = () => {
    setSize({ width: 95, height: size.height });
    setPosition({ x: 2.5, y: position.y });
  };

  // Maximize height keeping same width
  const maximizeHeight = () => {
    setSize({ width: size.width, height: 95 });
    setPosition({ x: position.x, y: 2.5 });
  };
  
  if (!isOpen) return null;
  
  // Render the advanced metaverse web view that integrates AI analysis
  if (isAdvancedView) {
    return <MetaverseWebView />;
  }
  
  // Style for positioning when not fullscreen
  const positionedStyle = !isFullscreen ? {
    top: `${position.y}vh`,
    left: `${position.x}vw`,
    width: `${size.width}vw`,
    height: `${size.height}vh`,
    transform: 'translate(-50%, -50%)'
  } : {};
  
  return (
    <div className="fixed inset-0 z-50 pointer-events-none">
      <div 
        className={cn(
          "fixed pointer-events-auto shadow-xl transition-all duration-200 ease-in-out",
          isFullscreen ? "inset-0" : "rounded-lg overflow-hidden"
        )}
        style={positionedStyle}
      >
        <Card className="w-full h-full border-0 shadow-none">
          {/* Toolbar */}
          <div 
            className={cn(
              "flex items-center justify-between bg-card p-2 border-b cursor-move",
              isDragging && "bg-accent/20"
            )}
            onMouseDown={handleDragStart}
          >
            <div className="flex items-center space-x-2">
              <Move size={14} className="text-muted-foreground" />
              <span className="text-sm font-medium truncate max-w-[180px] md:max-w-xs">
                {url || 'https://app.tradehybrid.co'}
              </span>
              
              <ContextualTooltip
                id="reload-webapp"
                title="Reload"
                content="Reload the web application"
                position="bottom"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={handleReload}
                >
                  <RotateCw size={14} />
                  <span className="sr-only">Reload</span>
                </Button>
              </ContextualTooltip>
              
              {/* Toggle Advanced AI View button */}
              <ContextualTooltip
                id="toggle-ai-view"
                title={isAdvancedView ? "Standard View" : "Advanced AI View"}
                content={isAdvancedView ? "Switch to standard web view" : "Switch to advanced AI analysis view"}
                position="bottom"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setIsAdvancedView(!isAdvancedView)}
                >
                  {isAdvancedView ? <Globe size={14} /> : <BrainCircuit size={14} className="text-purple-500" />}
                  <span className="sr-only">
                    {isAdvancedView ? "Standard View" : "Advanced AI View"}
                  </span>
                </Button>
              </ContextualTooltip>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                asChild
              >
                <a href={url || 'https://app.tradehybrid.co'} target="_blank" rel="noopener noreferrer">
                  <ExternalLink size={14} />
                  <span className="sr-only">Open in new tab</span>
                </a>
              </Button>
              
              <ContextualTooltip
                id="rss-feed"
                title="EB4 RSS Feed"
                content="View the EB4 RSS feed"
                position="bottom"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => {
                    const currentUrl = url || 'https://app.tradehybrid.co';
                    if (currentUrl !== 'https://eb4app.com/feed') {
                      const iframe = document.getElementById('tradehybrid-iframe') as HTMLIFrameElement;
                      if (iframe) {
                        iframe.src = 'https://eb4app.com/feed';
                        setIsLoading(true);
                      }
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 11a9 9 0 0 1 9 9" />
                    <path d="M4 4a16 16 0 0 1 16 16" />
                    <circle cx="5" cy="19" r="1" />
                  </svg>
                  <span className="sr-only">RSS Feed</span>
                </Button>
              </ContextualTooltip>
            </div>
            
            <div className="flex items-center space-x-1">
              {!isFullscreen && (
                <>
                  <ContextualTooltip
                    id="center-webapp"
                    title="Center"
                    content="Center the web application"
                    position="bottom"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={centerApp}
                    >
                      <span className="text-xs font-bold">⊕</span>
                      <span className="sr-only">Center</span>
                    </Button>
                  </ContextualTooltip>
                  
                  <ContextualTooltip
                    id="maximize-width"
                    title="Maximize Width"
                    content="Maximize window width"
                    position="bottom"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={maximizeWidth}
                    >
                      <ChevronsRight size={14} />
                      <span className="sr-only">Maximize Width</span>
                    </Button>
                  </ContextualTooltip>
                  
                  <ContextualTooltip
                    id="maximize-height"
                    title="Maximize Height"
                    content="Maximize window height"
                    position="bottom"
                  >
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7"
                      onClick={maximizeHeight}
                    >
                      <ChevronsDown size={14} />
                      <span className="sr-only">Maximize Height</span>
                    </Button>
                  </ContextualTooltip>
                </>
              )}
              
              <ContextualTooltip
                id="fullscreen-webapp"
                title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                content={isFullscreen ? "Exit fullscreen mode" : "Enter fullscreen mode"}
                position="bottom"
              >
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7"
                  onClick={() => setIsFullscreen(!isFullscreen)}
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  <span className="sr-only">
                    {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                  </span>
                </Button>
              </ContextualTooltip>
              
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={closeWebApp}
              >
                <X size={14} />
                <span className="sr-only">Close</span>
              </Button>
            </div>
          </div>
          
          {/* iframe content */}
          <CardContent className="p-0 flex-1 relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-sm text-muted-foreground">Loading TradeHybrid App...</p>
                </div>
              </div>
            )}
            
            <iframe 
              id="tradehybrid-iframe"
              src={url || 'https://app.tradehybrid.co'} 
              className="w-full h-full border-0" 
              title="Trade Hybrid App"
              onLoad={() => setIsLoading(false)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox"
            />
          </CardContent>
          
          {/* Resize handles - only shown when not fullscreen */}
          {!isFullscreen && (
            <>
              <div
                className="absolute bottom-0 right-0 w-5 h-5 cursor-nwse-resize"
                onMouseDown={(e) => handleResizeStart(e, 'br')}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="text-muted-foreground opacity-50">
                  <path d="M22 22L16 16M16 22L22 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <div
                className="absolute bottom-0 left-0 w-5 h-5 cursor-nesw-resize"
                onMouseDown={(e) => handleResizeStart(e, 'bl')}
              />
              <div
                className="absolute top-0 right-0 w-5 h-5 cursor-nesw-resize"
                onMouseDown={(e) => handleResizeStart(e, 'tr')}
              />
              <div
                className="absolute top-0 left-0 w-5 h-5 cursor-nwse-resize"
                onMouseDown={(e) => handleResizeStart(e, 'tl')}
              />
            </>
          )}
        </Card>
      </div>
    </div>
  );
}