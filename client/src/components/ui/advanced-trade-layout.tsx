import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  Maximize2, 
  Minimize2, 
  PanelLeft, 
  PanelRight, 
  X,
  BarChart,
  ExternalLink,
  MoveLeft,
  BellRing,
  SignalHigh,
  Clock,
  Newspaper
} from 'lucide-react';
import DexChart from './dex-chart';
import { SmartTradePanel } from './smart-trade-panel';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { ScrollArea } from './scroll-area';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Badge } from './badge';
import { Separator } from './separator';

// Import TradingViewWidget
const TradingViewWidgetLazy = React.lazy(() => import('./TradingViewWidget'));
const TradingSignalsLazy = React.lazy(() => import('../trade/trade-signals-panel'));

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

// Panel types
type SidebarTool = 'none' | 'signals' | 'news' | 'smart-trade';

// Smart panel position
type PanelPosition = 'docked' | 'undocked' | 'hidden';

// Mock news data
const mockNewsItems = [
  {
    id: '1',
    title: 'Federal Reserve Announces Interest Rate Decision',
    summary: 'The Federal Reserve has decided to maintain current interest rates at the target range of 5.25% to 5.50%, citing a need for more economic data.',
    source: 'Financial Times',
    published: new Date().toISOString(),
    tags: ['Fed', 'Interest Rates'],
    impact: 'high',
  },
  {
    id: '2',
    title: 'NASDAQ Reaches All-Time High as Tech Stocks Rally',
    summary: 'Technology stocks led a broad market rally as the NASDAQ Composite reached a new record high, driven by strong earnings from major tech companies.',
    source: 'Bloomberg',
    published: new Date(Date.now() - 1800000).toISOString(),
    tags: ['NASDAQ', 'Technology'],
    impact: 'medium',
  },
  {
    id: '3',
    title: 'Bitcoin Surges Past $70,000 Amid Institutional Adoption',
    summary: 'Bitcoin has climbed above $70,000 for the first time as institutional investors continue to embrace the leading cryptocurrency.',
    source: 'CoinDesk',
    published: new Date(Date.now() - 3600000).toISOString(),
    tags: ['Bitcoin', 'Cryptocurrency'],
    impact: 'high',
  },
  {
    id: '4',
    title: 'Crude Oil Prices Fall on Increased OPEC+ Production',
    summary: 'Oil prices declined following reports that OPEC+ members plan to increase production in the coming months, potentially easing supply constraints.',
    source: 'Reuters',
    published: new Date(Date.now() - 7200000).toISOString(),
    tags: ['Oil', 'OPEC+'],
    impact: 'medium',
  },
  {
    id: '5',
    title: 'US Dollar Strengthens Against Major Currencies',
    summary: 'The US dollar gained strength against a basket of major currencies following stronger-than-expected economic data and hawkish comments from Federal Reserve officials.',
    source: 'CNBC',
    published: new Date(Date.now() - 10800000).toISOString(),
    tags: ['USD', 'Forex'],
    impact: 'medium',
  },
];

interface AdvancedTradeLayoutProps {
  defaultSymbol?: string;
  className?: string;
}

export function AdvancedTradeLayout({ 
  defaultSymbol = 'BTCUSDT', 
  className 
}: AdvancedTradeLayoutProps) {
  // Symbol state
  const [symbol, setSymbol] = useState(defaultSymbol);
  
  // Active sidebar tool
  const [activeTool, setActiveTool] = useState<SidebarTool>('none');
  
  // Smart panel position
  const [smartPanelPosition, setSmartPanelPosition] = useState<PanelPosition>('docked');
  
  // Chart maximized state
  const [chartMaximized, setChartMaximized] = useState(false);
  
  // Sidebar panel size
  const [sidebarSize, setSidebarSize] = useState(320); // width in pixels
  
  // Undocked panel position
  const [undockedPosition, setUndockedPosition] = useState({ x: 100, y: 100 });
  
  // Containers refs for resizing
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeHandleRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  
  // Check if mobile
  const isMobile = useMediaQuery('(max-width: 768px)');
  
  // Toggle chart maximized state
  const toggleChartMaximized = () => {
    setChartMaximized(!chartMaximized);
  };
  
  // Toggle sidebar tool
  const toggleTool = (tool: SidebarTool) => {
    setActiveTool(activeTool === tool ? 'none' : tool);
  };
  
  // Toggle smart panel docked/undocked state
  const toggleSmartPanelPosition = () => {
    if (smartPanelPosition === 'undocked') {
      setSmartPanelPosition('docked');
    } else if (smartPanelPosition === 'docked') {
      setSmartPanelPosition('undocked');
      
      // Set initial position in the center of the viewport
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setUndockedPosition({
          x: rect.width / 2 - 200,
          y: rect.height / 2 - 200
        });
      }
    } else {
      setSmartPanelPosition('docked');
    }
  };
  
  // Hide the smart panel
  const hideSmartPanel = () => {
    setSmartPanelPosition('hidden');
  };
  
  // Show the smart panel (if hidden)
  const showSmartPanel = () => {
    setSmartPanelPosition('docked');
  };
  
  // Sidebar resize functionality
  useEffect(() => {
    if (!sidebarRef.current || !resizeHandleRef.current || activeTool === 'none') return;
    
    const resizeHandle = resizeHandleRef.current;
    
    let startX = 0;
    let startSize = 0;
    
    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startSize = sidebarSize;
      
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };
    
    const onMouseMove = (e: MouseEvent) => {
      const delta = startX - e.clientX;
      const newSize = Math.max(280, Math.min(600, startSize + delta));
      setSidebarSize(newSize);
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
  }, [activeTool, sidebarSize]);
  
  // Render trade signals panel
  const renderTradeSignalsPanel = () => {
    return (
      <Card className="h-full overflow-hidden bg-slate-800 border-0 rounded-none">
        <CardHeader className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex flex-row justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            <SignalHigh className="h-4 w-4 mr-2" />
            Trading Signals
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white"
              onClick={() => toggleTool('none')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-36px)] overflow-auto">
          <React.Suspense fallback={<div className="flex items-center justify-center h-full">Loading signals...</div>}>
            <TradingSignalsLazy />
          </React.Suspense>
        </CardContent>
      </Card>
    );
  };
  
  // Render news panel
  const renderNewsPanel = () => {
    return (
      <Card className="h-full overflow-hidden bg-slate-800 border-0 rounded-none">
        <CardHeader className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex flex-row justify-between items-center">
          <CardTitle className="text-sm font-medium flex items-center">
            <Newspaper className="h-4 w-4 mr-2" />
            Market News
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-7 w-7 text-slate-400 hover:text-white"
              onClick={() => toggleTool('none')}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-36px)]">
          <ScrollArea className="h-full">
            <div className="p-4">
              {mockNewsItems.map((item, index) => (
                <div key={item.id} className="mb-4">
                  <div className="flex items-start gap-2">
                    <div>
                      {item.impact === "high" && (
                        <Badge variant="destructive" className="h-2 w-2 p-0 rounded-full" />
                      )}
                      {item.impact === "medium" && (
                        <Badge variant="default" className="bg-amber-500 h-2 w-2 p-0 rounded-full" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-semibold">{item.title}</h4>
                      <p className="text-xs text-muted-foreground">{item.summary}</p>
                      <div className="flex gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {new Date(item.published).toLocaleTimeString()}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {item.source}
                        </Badge>
                        {item.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>
                  {index < mockNewsItems.length - 1 && <Separator className="my-4" />}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    );
  };
  
  // Render smart trade panel
  const renderSmartTradePanel = (forUndocked = false) => {
    return (
      <Card className={`h-full overflow-hidden bg-slate-800 ${!forUndocked ? 'border-0 rounded-none' : 'border border-slate-700 rounded-lg shadow-xl'}`}>
        <CardHeader className="px-3 py-2 bg-slate-800 border-b border-slate-700 flex flex-row justify-between items-center">
          <CardTitle className="text-sm font-medium">Smart Trade Panel</CardTitle>
          <div className="flex items-center gap-1">
            {!forUndocked ? (
              <>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-slate-400 hover:text-white"
                  onClick={toggleSmartPanelPosition}
                  title="Undock panel"
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-7 w-7 text-red-400 hover:text-red-300"
                  onClick={hideSmartPanel}
                  title="Hide panel"
                >
                  <X className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-blue-400 hover:text-blue-300"
                onClick={toggleSmartPanelPosition}
                title="Dock panel"
              >
                <MoveLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0 h-[calc(100%-36px)] overflow-auto">
          <SmartTradePanel symbol={symbol} asCard={false} />
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div className={cn("relative h-full overflow-hidden bg-slate-900", className)} ref={containerRef}>
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
      
      {/* Restore Panel Button (when hidden) */}
      {smartPanelPosition === 'hidden' && !chartMaximized && (
        <div className="absolute top-3 right-3 z-30">
          <Button 
            variant="ghost" 
            size="sm"
            className="h-8 gap-1 text-xs font-normal bg-slate-800/90 border border-slate-700"
            onClick={showSmartPanel}
          >
            <PanelRight className="h-4 w-4" />
            Show Trade Panel
          </Button>
        </div>
      )}
      
      {/* Main Layout */}
      <div className="flex h-full">
        {/* Main Chart Area */}
        <div className="flex-grow h-full relative">
          {!isMobile && !chartMaximized && (
            <div className="absolute left-3 top-20 z-30 bg-slate-800/90 border border-slate-700 rounded-md shadow-lg">
              <div className="flex flex-col gap-1 p-1">
                <Button 
                  variant={activeTool === 'signals' ? "default" : "ghost"} 
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => toggleTool('signals')}
                  title="Trading Signals"
                >
                  <SignalHigh className="h-5 w-5" />
                </Button>
                <Button 
                  variant={activeTool === 'news' ? "default" : "ghost"} 
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => toggleTool('news')}
                  title="Market News"
                >
                  <Newspaper className="h-5 w-5" />
                </Button>
                <Button 
                  variant={activeTool === 'smart-trade' ? "default" : "ghost"} 
                  size="icon"
                  className="h-10 w-10"
                  onClick={() => toggleTool('smart-trade')}
                  title="Smart Trade Panel"
                >
                  <BarChart className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          <div className="h-full relative overflow-hidden">
            <React.Suspense fallback={<div>Loading chart...</div>}>
              <TradingViewWidgetLazy
                symbol={symbol}
                theme="dark"
                width="100%"
                height="100%"
                allow_symbol_change={true}
              />
            </React.Suspense>
          </div>
        </div>
        
        {/* Sidebar Tools */}
        {activeTool !== 'none' && activeTool !== 'smart-trade' && !chartMaximized && (
          <div className="relative h-full border-l border-slate-700" 
               ref={sidebarRef} 
               style={{ width: `${sidebarSize}px` }}
          >
            <div 
              ref={resizeHandleRef}
              className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-blue-500/30 hover:bg-blue-500/60 z-20"
            />
            {activeTool === 'signals' && renderTradeSignalsPanel()}
            {activeTool === 'news' && renderNewsPanel()}
          </div>
        )}
        
        {/* Docked Smart Trade Panel */}
        {smartPanelPosition === 'docked' && activeTool !== 'smart-trade' && !chartMaximized && (
          <div className="h-full border-l border-slate-700 w-[350px]">
            {renderSmartTradePanel()}
          </div>
        )}
        
        {/* Active Smart Trade in Sidebar */}
        {activeTool === 'smart-trade' && !chartMaximized && (
          <div className="relative h-full border-l border-slate-700" 
               ref={sidebarRef} 
               style={{ width: `${sidebarSize}px` }}
          >
            <div 
              ref={resizeHandleRef}
              className="absolute left-0 top-0 w-1 h-full cursor-col-resize bg-blue-500/30 hover:bg-blue-500/60 z-20"
            />
            {renderSmartTradePanel()}
          </div>
        )}
      </div>
      
      {/* Undocked Smart Trade Panel */}
      {smartPanelPosition === 'undocked' && !chartMaximized && (
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
          {renderSmartTradePanel(true)}
        </motion.div>
      )}
    </div>
  );
}