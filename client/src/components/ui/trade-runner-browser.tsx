import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader } from './card';
import { Button } from './button';
import { X, Maximize2, Minimize2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger 
} from './tooltip';
import { PopupContainer } from './popup-container';
import { TradeRunner } from './trade-runner';

interface TradeRunnerBrowserProps {
  onClose?: () => void;
  className?: string;
  initialHeight?: number;
  initialWidth?: number;
  isMinimizable?: boolean;
  isResizable?: boolean;
}

export function TradeRunnerBrowser({
  onClose,
  className = '',
  initialHeight = 600,
  initialWidth = 900,
  isMinimizable = true,
  isResizable = true
}: TradeRunnerBrowserProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [dimensions, setDimensions] = useState({
    width: initialWidth,
    height: initialHeight
  });
  const [resizing, setResizing] = useState(false);
  const [resizeHandleType, setResizeHandleType] = useState<'br' | 'bl' | 'tr' | null>(null);
  const [initialPos, setInitialPos] = useState({ x: 0, y: 0 });
  const [initialDim, setInitialDim] = useState({ width: 0, height: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
    if (isMinimized) setIsMinimized(false);
  };

  // Handle minimize toggle
  const toggleMinimize = () => {
    setIsMinimized(!isMinimized);
    if (isFullscreen && !isMinimized) setIsFullscreen(false);
  };

  // Handle close
  const handleClose = () => {
    if (onClose) onClose();
  };

  // Resize handlers
  const handleResizeStart = (e: React.MouseEvent, handleType: 'br' | 'bl' | 'tr') => {
    e.preventDefault();
    setResizing(true);
    setResizeHandleType(handleType);
    setInitialPos({ x: e.clientX, y: e.clientY });
    setInitialDim({ width: dimensions.width, height: dimensions.height });
    
    // Add event listeners for resize
    document.addEventListener('mousemove', handleResize);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  const handleResize = (e: MouseEvent) => {
    if (!resizing) return;
    
    const deltaX = e.clientX - initialPos.x;
    const deltaY = e.clientY - initialPos.y;
    
    let newWidth = initialDim.width;
    let newHeight = initialDim.height;
    
    switch (resizeHandleType) {
      case 'br': // Bottom right
        newWidth = Math.max(initialDim.width + deltaX, 300);
        newHeight = Math.max(initialDim.height + deltaY, 200);
        break;
      case 'bl': // Bottom left
        newWidth = Math.max(initialDim.width - deltaX, 300);
        newHeight = Math.max(initialDim.height + deltaY, 200);
        break;
      case 'tr': // Top right
        newWidth = Math.max(initialDim.width + deltaX, 300);
        newHeight = Math.max(initialDim.height - deltaY, 200);
        break;
    }
    
    setDimensions({ width: newWidth, height: newHeight });
  };

  const handleResizeEnd = () => {
    setResizing(false);
    setResizeHandleType(null);
    document.removeEventListener('mousemove', handleResize);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Clean up event listeners on unmount
  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleResize);
      document.removeEventListener('mouseup', handleResizeEnd);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={cn(
        "relative z-10",
        isFullscreen ? "fixed inset-0 w-full h-full bg-background/80 backdrop-blur-sm" : "",
        className
      )}
    >
      <Card 
        className={cn(
          "border shadow-lg overflow-hidden flex flex-col",
          isFullscreen 
            ? "fixed inset-0 w-full h-full rounded-none border-0" 
            : isMinimized 
              ? "w-64 h-12 rounded-t-lg rounded-b-none border-b-0"
              : "rounded-lg transition-all duration-200",
          resizing ? "transition-none" : "transition-all"
        )}
        style={
          !isFullscreen && !isMinimized
            ? { width: dimensions.width, height: dimensions.height }
            : {}
        }
      >
        {/* Header with controls */}
        <CardHeader className="p-2 px-3 flex flex-row items-center justify-between bg-slate-950 border-b border-slate-800 cursor-move">
          <div className="font-medium text-sm flex items-center gap-2">
            <span className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              Trade Runner Game
            </span>
          </div>
          
          <div className="flex items-center gap-1">
            {isMinimizable && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={toggleMinimize}
                    >
                      {isMinimized 
                        ? <Maximize2 size={14} /> 
                        : <Minimize2 size={14} />
                      }
                      <span className="sr-only">
                        {isMinimized ? "Expand" : "Minimize"}
                      </span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isMinimized ? "Expand" : "Minimize"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={toggleFullscreen}
                  >
                    {isFullscreen 
                      ? <Minimize2 size={14} /> 
                      : <Maximize2 size={14} />
                    }
                    <span className="sr-only">
                      {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                    </span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7"
                    onClick={handleClose}
                  >
                    <X size={14} />
                    <span className="sr-only">Close</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Close
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        
        {/* Game content - only show if not minimized */}
        {!isMinimized && (
          <CardContent className="p-0 flex-1 relative bg-slate-900">
            <div className="w-full h-full overflow-hidden">
              {/* Use existing TradeRunner component */}
              <TradeRunner className="w-full h-full" />
            </div>
          </CardContent>
        )}
        
        {/* Resize handles - only shown when not fullscreen and not minimized */}
        {!isFullscreen && !isMinimized && isResizable && (
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