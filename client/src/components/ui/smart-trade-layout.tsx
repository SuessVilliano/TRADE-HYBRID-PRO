import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  Maximize2, 
  Minimize2, 
  PanelLeft, 
  PanelRight, 
  PanelTop, 
  PanelBottom,
  SlidersHorizontal, 
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  ChevronUp,
  X,
  BarChart,
  Layers,
  ExternalLink,
  MoveLeft
} from 'lucide-react';
import TradingViewChart from './trading-view-chart';
import { SmartTradePanel } from './smart-trade-panel';
import { TradingPlatformPanel } from '../trading/TradingPlatformPanel';
import { AITradeAssistant } from '../ai/AITradeAssistant';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
// Define useMediaQuery hook directly here to avoid import issues
function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const media = window.matchMedia(query);
      setMatches(media.matches);
      const listener = () => setMatches(media.matches);
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
    return undefined;
  }, [query]);
  
  return matches;
}

// Panel positions
type PanelPosition = 'left' | 'right' | 'top' | 'bottom' | 'hidden';

interface SmartTradeLayoutProps {
  defaultSymbol?: string;
  className?: string;
}

export function SmartTradeLayout({ 
  defaultSymbol = 'BTCUSDT', 
  className 
}: SmartTradeLayoutProps) {
  // Symbol state
  const [symbol, setSymbol] = useState(defaultSymbol);
  
  // Panel position
  const [panelPosition, setPanelPosition] = useState<PanelPosition>('right');
  
  // Panel size
  const [panelSize, setPanelSize] = useState(320); // width in pixels
  
  // Chart maximized state
  const [chartMaximized, setChartMaximized] = useState(false);
  
  // Panel undocked state
  const [isPanelUndocked, setIsPanelUndocked] = useState(false);
  
  // Undocked panel position
  const [undockedPosition, setUndockedPosition] = useState({ x: 100, y: 100 });
  
  // Panel content selection
  const [panelContent, setPanelContent] = useState<'trade' | 'platforms' | 'ai'>('trade');
  
  // Containers refs for resizing
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  
  // Check if mobile
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Set initial panel position based on screen size
  useEffect(() => {
    if (isMobile) {
      setPanelPosition('bottom');
      setPanelSize(300);
    } else {
      setPanelPosition('right');
      setPanelSize(320);
    }
  }, [isMobile]);
  
  // Resize functionality
  useEffect(() => {
    const resizeHandle = resizeHandleRef.current;
    if (!resizeHandle) return;
    
    let startX = 0;
    let startY = 0;
    let startSize = 0;
    
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      startSize = panelSize;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      if (panelPosition === 'left') {
        const delta = e.clientX - startX;
        const newSize = Math.max(250, Math.min(800, startSize + delta));
        setPanelSize(newSize);
      } else if (panelPosition === 'right') {
        const delta = startX - e.clientX;
        const newSize = Math.max(250, Math.min(800, startSize + delta));
        setPanelSize(newSize);
      } else if (panelPosition === 'top') {
        const delta = e.clientY - startY;
        const newSize = Math.max(200, Math.min(500, startSize + delta));
        setPanelSize(newSize);
      } else if (panelPosition === 'bottom') {
        const delta = startY - e.clientY;
        const newSize = Math.max(200, Math.min(500, startSize + delta));
        setPanelSize(newSize);
      }
    };
    
    const onMouseUp = () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
    
    resizeHandle.addEventListener('mousedown', onMouseDown);
    
    return () => {
      resizeHandle.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };
  }, [panelPosition, panelSize]);
  
  // Toggle chart maximized state
  const toggleChartMaximized = () => {
    setChartMaximized(!chartMaximized);
  };
  
  // Function to change panel position
  const changePanelPosition = (position: PanelPosition) => {
    setPanelPosition(position);
    setIsPanelUndocked(false); // When changing position, dock the panel
    
    // Reset panel size to default when position changes
    if (position === 'left' || position === 'right') {
      setPanelSize(320);
    } else if (position === 'top' || position === 'bottom') {
      setPanelSize(isMobile ? 300 : 250);
    }
  };
  
  // Function to toggle panel undocked state
  const togglePanelUndock = () => {
    // If docking a previously undocked panel
    if (isPanelUndocked) {
      setIsPanelUndocked(false);
      // Default to right panel position when docking
      changePanelPosition('right');
      return;
    }
    
    // Undock the panel
    setIsPanelUndocked(true);
    // Hide it from the layout
    setPanelPosition('hidden');
    
    // Set initial position in the center of the viewport
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setUndockedPosition({
        x: rect.width / 2 - 200,
        y: rect.height / 2 - 200
      });
    }
  };
  
  // Helpers to get CSS classes and styles based on panel position
  const getLayoutClasses = () => {
    // Base layout is grid
    const baseClass = 'grid h-full w-full';
    
    if (chartMaximized) {
      return baseClass;
    }
    
    if (panelPosition === 'hidden') {
      return baseClass;
    }
    
    if (panelPosition === 'left') {
      return `${baseClass} grid-cols-[${panelSize}px,auto]`;
    }
    
    if (panelPosition === 'right') {
      return `${baseClass} grid-cols-[auto,${panelSize}px]`;
    }
    
    if (panelPosition === 'top') {
      return `${baseClass} grid-rows-[${panelSize}px,auto]`;
    }
    
    if (panelPosition === 'bottom') {
      return `${baseClass} grid-rows-[auto,${panelSize}px]`;
    }
    
    return baseClass;
  };
  
  // Get dynamic style for resize handle
  const getResizeHandleStyles = () => {
    if (panelPosition === 'left') {
      return 'right-0 top-0 w-1 h-full cursor-col-resize';
    }
    if (panelPosition === 'right') {
      return 'left-0 top-0 w-1 h-full cursor-col-resize';
    }
    if (panelPosition === 'top') {
      return 'bottom-0 left-0 w-full h-1 cursor-row-resize';
    }
    if (panelPosition === 'bottom') {
      return 'top-0 left-0 w-full h-1 cursor-row-resize';
    }
    return '';
  };
  
  // Get mobile styles for buy/sell buttons
  const getMobileTradeControls = () => {
    if (!isMobile) return null;
    
    return (
      <div className="absolute top-1 left-0 right-0 px-2 z-30">
        <div className="flex items-center justify-between bg-slate-900/80 backdrop-blur-sm py-1.5 px-2 mb-1 rounded">
          <div className="flex items-center">
            <div className="text-white text-sm font-medium">{symbol}</div>
            <div className="ml-2 text-green-400 text-xs">
              19,627.25 <span className="text-green-400">+37.00 (+0.19%)</span>
            </div>
          </div>
          
          <div className="flex items-center">
            <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
              USD
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Button 
            size="sm" 
            variant="destructive" 
            className="h-8 w-[120px] font-bold"
          >
            <span className="mr-2">19,630.00</span>
            SELL
          </Button>
          
          <div className="flex items-center justify-center text-xs text-white/60">
            9.00
          </div>
          
          <Button 
            size="sm" 
            variant="default"
            className="h-8 w-[120px] font-bold bg-blue-600 hover:bg-blue-700"
          >
            <span className="mr-2">19,639.00</span>
            BUY
          </Button>
        </div>
        
        <div className="absolute right-2 -top-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 bg-slate-800/80 rounded-full"
            onClick={() => changePanelPosition(panelPosition === 'bottom' ? 'hidden' : 'bottom')}
          >
            {panelPosition === 'bottom' ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    );
  };
  
  // Render panel content
  const renderPanelContent = (forUndocked = false) => {
    return (
      <Card className={`h-full overflow-hidden bg-slate-800 ${!forUndocked ? 'border-0 rounded-none' : 'border border-slate-700 rounded-lg shadow-xl'}`}>
        {!isMobile && (
          <CardHeader className="px-3 py-2 bg-slate-800 border-b border-slate-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant={panelContent === 'trade' ? 'default' : 'ghost'}
                  onClick={() => setPanelContent('trade')}
                  className="h-7 text-xs"
                >
                  Trade Panel
                </Button>
                <Button
                  size="sm"
                  variant={panelContent === 'platforms' ? 'default' : 'ghost'}
                  onClick={() => setPanelContent('platforms')}
                  className="h-7 text-xs"
                >
                  Platforms
                </Button>
                <Button
                  size="sm"
                  variant={panelContent === 'ai' ? 'default' : 'ghost'}
                  onClick={() => setPanelContent('ai')}
                  className="h-7 text-xs bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                >
                  AI Assistant
                </Button>
              </div>
              <div className="flex items-center gap-1">
                {!forUndocked && (
                  <>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-white"
                      onClick={togglePanelUndock}
                      title="Undock panel"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-white"
                      onClick={() => changePanelPosition(panelPosition === 'left' ? 'right' : 'left')}
                      title={panelPosition === 'left' ? "Move to right" : "Move to left"}
                    >
                      {panelPosition === 'left' ? <PanelRight className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-slate-400 hover:text-white"
                      onClick={() => changePanelPosition(panelPosition === 'top' ? 'bottom' : 'top')}
                      title={panelPosition === 'top' ? "Move to bottom" : "Move to top"}
                    >
                      {panelPosition === 'top' ? <PanelBottom className="h-4 w-4" /> : <PanelTop className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-7 w-7 text-red-400 hover:text-red-300"
                      onClick={() => changePanelPosition('hidden')}
                      title="Hide panel"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                </>
              )}
              
              {forUndocked && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-blue-400 hover:text-blue-300"
                  onClick={togglePanelUndock}
                  title="Dock panel"
                >
                  <MoveLeft className="h-4 w-4" />
                </Button>
              )}
              </div>
            </div>
          </CardHeader>
        )}
        <CardContent className="p-0 h-full overflow-auto">
          {panelContent === 'trade' ? (
            <SmartTradePanel symbol={symbol} asCard={false} />
          ) : panelContent === 'platforms' ? (
            <TradingPlatformPanel />
          ) : (
            <AITradeAssistant symbol={symbol} />
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className={cn("relative h-full overflow-hidden bg-slate-900", className)} ref={containerRef}>
      {/* Mobile Trade Controls */}
      {getMobileTradeControls()}
      
      {/* Position Control Buttons (Desktop Only) */}
      {!isMobile && !chartMaximized && panelPosition === 'hidden' && !isPanelUndocked && (
        <div className="absolute top-3 right-3 z-30 flex items-center bg-slate-800/90 border border-slate-700 rounded-md shadow-lg">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal"
            onClick={() => changePanelPosition('left')}
          >
            <PanelLeft className="h-4 w-4" />
            Left
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal"
            onClick={() => changePanelPosition('right')}
          >
            <PanelRight className="h-4 w-4" />
            Right
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal"
            onClick={() => changePanelPosition('bottom')}
          >
            <PanelBottom className="h-4 w-4" />
            Bottom
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal"
            onClick={togglePanelUndock}
          >
            <ExternalLink className="h-4 w-4" />
            Float
          </Button>
        </div>
      )}
      
      {/* Floating Panel Button (when hidden and not undocked) */}
      {!isMobile && !chartMaximized && isPanelUndocked && !panelPosition && (
        <div className="absolute top-3 right-3 z-30 flex items-center">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal bg-slate-800/90 border border-slate-700"
            onClick={togglePanelUndock}
          >
            <MoveLeft className="h-4 w-4" />
            Dock Tools
          </Button>
        </div>
      )}
      
      {/* Chart Maximize/Minimize Button */}
      <div className="absolute top-3 left-3 z-30">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-slate-800/90 border border-slate-700 rounded-md"
          onClick={toggleChartMaximized}
        >
          {chartMaximized ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>
      </div>
      
      {/* Main Layout */}
      <div 
        className={getLayoutClasses()}
        style={{
          gridTemplateColumns: panelPosition === 'left' 
            ? `${panelSize}px auto` 
            : panelPosition === 'right' 
              ? `auto ${panelSize}px` 
              : '1fr',
          gridTemplateRows: panelPosition === 'top' 
            ? `${panelSize}px auto` 
            : panelPosition === 'bottom' 
              ? `auto ${panelSize}px` 
              : '1fr'
        }}
      >
        {/* Panel First (Left/Top) */}
        {(panelPosition === 'left' || panelPosition === 'top') && !chartMaximized && (
          <div className="relative h-full" ref={panelRef}>
            {renderPanelContent()}
            <div 
              ref={resizeHandleRef}
              className={`absolute ${getResizeHandleStyles()} bg-blue-500/30 hover:bg-blue-500/60 z-20`}
            />
          </div>
        )}
        
        {/* TradingView Chart */}
        <div className="h-full relative overflow-hidden">
          <TradingViewChart
            symbol={symbol}
            timeframe="1d"
            className="h-full"
          />
        </div>
        
        {/* Panel Last (Right/Bottom) */}
        {(panelPosition === 'right' || panelPosition === 'bottom') && !chartMaximized && (
          <div className="relative h-full" ref={panelRef}>
            <div 
              ref={resizeHandleRef}
              className={`absolute ${getResizeHandleStyles()} bg-blue-500/30 hover:bg-blue-500/60 z-20`}
            />
            {renderPanelContent()}
          </div>
        )}
      </div>
      
      {/* Undocked Floating Panel */}
      {isPanelUndocked && !chartMaximized && (
        <motion.div
          className="fixed z-40"
          style={{
            top: undockedPosition.y,
            left: undockedPosition.x,
            width: 400,
            height: 500,
          }}
          drag
          dragConstraints={containerRef}
          dragElastic={0.1}
          dragMomentum={false}
          onDragEnd={(e, info) => {
            setUndockedPosition({
              x: undockedPosition.x + info.offset.x,
              y: undockedPosition.y + info.offset.y
            });
          }}
        >
          {renderPanelContent(true)}
        </motion.div>
      )}
    </div>
  );
}