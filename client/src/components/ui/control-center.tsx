import React, { useState, useEffect } from 'react';
import { PanelContainer } from './panel-container';
import { LineChart, BarChart3, Signal, Bot, HelpCircle, BookOpen, Users, Cpu, MessageSquare, Calendar, BarChart, Sparkles, Grid, Activity, Waves, Link2, GripVertical, TrendingUp } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { ConnectBrokerModal } from '@/components/broker/connect-broker-modal';
import { brokerService } from '@/lib/services/broker-service';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { useDashboardLayout, LayoutItem } from '@/lib/stores/useDashboardLayout';
import { FloatingTradePanel } from './floating-trade-panel';

// Lazy load the components
const TradingViewWidgetLazy = React.lazy(() => import('./TradingViewWidget'));
const AIAssistantLazy = React.lazy(() => import('./ai-trade-assistant'));
const TradingSignalsLazy = React.lazy(() => import('@/components/trade/trade-signals-panel'));
const CopyTradingLazy = React.lazy(() => import('./CopyTrading'));
const SmartTradePanelLazy = React.lazy(() => import('@/components/trade/abatev-trade-panel'));
const TradingBotsManagerLazy = React.lazy(() => import('./trading-bots-manager').then(module => ({ default: module.TradingBotsManager })));
const TradingCompanionChatbotLazy = React.lazy(() => import('./trading-companion-chatbot'));
const EconomicCalendarLazy = React.lazy(() => import('./economic-calendar'));
const MarketOverviewLazy = React.lazy(() => import('./market-overview'));
const MarketScannerLazy = React.lazy(() => import('./market-scanner'));
const StockHeatmapLazy = React.lazy(() => import('./stock-heatmap'));
const CryptoHeatmapLazy = React.lazy(() => import('./crypto-heatmap'));
const ZenMeditationModeLazy = React.lazy(() => import('./zen-meditation-mode').then(module => ({ default: module.ZenMeditationMode })));

// Define the panel types
export type PanelType = 
  | 'chart' 
  | 'scanner' 
  | 'signals' 
  | 'smart-trade' 
  | 'copy-trade' 
  | 'assistant' 
  | 'bots' 
  | 'news' 
  | 'education'
  | 'companion'
  | 'economic-calendar'
  | 'market-overview'
  | 'advanced-ai'
  | 'stock-heatmap'
  | 'crypto-heatmap'
  | 'zen';

// Panel definition with its metadata
interface PanelDefinition {
  id: string;
  type: PanelType;
  title: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  defaultSize: { width: string, height: string };
  defaultPosition: { x: number, y: number };
  minWidth?: string;
  minHeight?: string;
}

// Define props
interface ControlCenterProps {
  selectedSymbol: string;
  onChangeSymbol?: (symbol: string) => void;
  className?: string;
  initialPanels?: PanelType[];
}

export const ControlCenter: React.FC<ControlCenterProps> = ({
  selectedSymbol,
  onChangeSymbol,
  className = '',
  initialPanels = ['chart', 'signals', 'smart-trade', 'scanner', 'economic-calendar', 'market-overview', 'stock-heatmap', 'crypto-heatmap', 'zen'],
}) => {
  // State to track active panels and their layout
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [minimizedPanels, setMinimizedPanels] = useState<string[]>([]);
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'vertical' | 'horizontal'>('grid');
  const { layouts, updateLayout } = useDashboardLayout();
  
  // Trade panel state
  const [isTradePanelOpen, setIsTradePanelOpen] = useState(false);

  // Define all available panels
  const allPanels: Record<PanelType, PanelDefinition> = {
    'chart': {
      id: 'chart',
      type: 'chart',
      title: 'Chart',
      icon: <LineChart size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Chart...</div>}>
          {typeof window !== 'undefined' && (
            <TradingViewWidgetLazy
              symbol={selectedSymbol}
              theme="dark"
              height="100%"
            />
          )}
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '500px' },
      defaultPosition: { x: 0, y: 0 },
      minWidth: '400px',
      minHeight: '300px'
    },
    'scanner': {
      id: 'scanner',
      type: 'scanner',
      title: 'Market Scanner',
      icon: <BarChart3 size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Scanner...</div>}>
          {typeof window !== 'undefined' && (
            <MarketScannerLazy
              theme="dark"
              height="100%"
              defaultScreener="crypto"
              defaultMarket="crypto"
            />
          )}
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '400px' },
      defaultPosition: { x: 0, y: 510 }
    },
    'signals': {
      id: 'signals',
      type: 'signals',
      title: 'Trading Signals',
      icon: <Signal size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Signals...</div>}>
          <TradingSignalsLazy />
        </React.Suspense>
      ),
      defaultSize: { width: '320px', height: '500px' },
      defaultPosition: { x: 760, y: 0 }
    },
    'smart-trade': {
      id: 'smart-trade',
      type: 'smart-trade',
      title: 'ABATEV Smart Trading',
      icon: <Cpu size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Smart Trade Panel...</div>}>
          <SmartTradePanelLazy defaultSymbol={selectedSymbol.replace('BITSTAMP:', '').replace('BINANCE:', '')} />
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '500px' },
      defaultPosition: { x: 0, y: 510 }
    },
    'copy-trade': {
      id: 'copy-trade',
      type: 'copy-trade',
      title: 'Copy Trading',
      icon: <Users size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Copy Trading...</div>}>
          <CopyTradingLazy />
        </React.Suspense>
      ),
      defaultSize: { width: '320px', height: '400px' },
      defaultPosition: { x: 760, y: 510 }
    },
    'assistant': {
      id: 'assistant',
      type: 'assistant',
      title: 'AI Assistant',
      icon: <HelpCircle size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading AI Assistant...</div>}>
          <AIAssistantLazy />
        </React.Suspense>
      ),
      defaultSize: { width: '320px', height: '400px' },
      defaultPosition: { x: 760, y: 920 }
    },
    'bots': {
      id: 'bots',
      type: 'bots',
      title: 'Trading Bots',
      icon: <Bot size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Trading Bots...</div>}>
          <TradingBotsManagerLazy />
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '600px' },
      defaultPosition: { x: 0, y: 920 }
    },
    'news': {
      id: 'news',
      type: 'news',
      title: 'Market News',
      icon: <BookOpen size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Market News...</div>}>
          {typeof window !== 'undefined' && (
            <iframe
              src="https://s.tradingview.com/timeline/"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="TradingView News"
            />
          )}
        </React.Suspense>
      ),
      defaultSize: { width: '320px', height: '300px' },
      defaultPosition: { x: 760, y: 920 }
    },
    'education': {
      id: 'education',
      type: 'education',
      title: 'Trading Education',
      icon: <BookOpen size={16} />,
      component: (
        <div className="h-full overflow-y-auto text-sm">
          <h3 className="text-xl font-bold mb-3">Trading Education</h3>
          <p className="mb-3">
            Educational resources coming from Trade Hybrid official website at <a href="https://www.tradehybrid.club/education" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.tradehybrid.club/education</a>
          </p>
          <div className="space-y-3">
            <h4 className="text-lg font-bold">Popular Topics:</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="https://www.tradehybrid.club/education/technical-analysis" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Technical Analysis Fundamentals</a></li>
              <li><a href="https://www.tradehybrid.club/education/crypto-trading" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Cryptocurrency Trading</a></li>
              <li><a href="https://www.tradehybrid.club/education/risk-management" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Risk Management Strategies</a></li>
              <li><a href="https://www.tradehybrid.club/education/trading-psychology" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Trading Psychology</a></li>
            </ul>
          </div>
        </div>
      ),
      defaultSize: { width: '320px', height: '300px' },
      defaultPosition: { x: 760, y: 1230 }
    },
    'companion': {
      id: 'companion',
      type: 'companion',
      title: 'Trading Companion',
      icon: <MessageSquare size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Trading Companion...</div>}>
          <TradingCompanionChatbotLazy selectedSymbol={selectedSymbol} />
        </React.Suspense>
      ),
      defaultSize: { width: '320px', height: '500px' },
      defaultPosition: { x: 760, y: 920 }
    },
    'economic-calendar': {
      id: 'economic-calendar',
      type: 'economic-calendar',
      title: 'Economic Calendar',
      icon: <Calendar size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Economic Calendar...</div>}>
          <EconomicCalendarLazy 
            colorTheme="dark"
            isTransparent={false}
            locale="en"
            importanceFilter="-1,0,1"
          />
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '500px' },
      defaultPosition: { x: 0, y: 1020 }
    },
    'market-overview': {
      id: 'market-overview',
      type: 'market-overview',
      title: 'Market Overview',
      icon: <BarChart size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Market Overview...</div>}>
          <MarketOverviewLazy 
            colorTheme="dark"
            dateRange="12M"
            showChart={true}
            isTransparent={false}
          />
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '400px' },
      defaultPosition: { x: 0, y: 1530 }
    },

    'stock-heatmap': {
      id: 'stock-heatmap',
      type: 'stock-heatmap',
      title: 'Stock Heatmap',
      icon: <Grid size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Stock Heatmap...</div>}>
          {typeof window !== 'undefined' && (
            <StockHeatmapLazy
              dataSource="SPX500"
              colorTheme="dark"
              showTopBar={true}
              height="100%"
              width="100%"
            />
          )}
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '500px' },
      defaultPosition: { x: 0, y: 1940 }
    },
    'crypto-heatmap': {
      id: 'crypto-heatmap',
      type: 'crypto-heatmap',
      title: 'Crypto Heatmap',
      icon: <Activity size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Crypto Heatmap...</div>}>
          {typeof window !== 'undefined' && (
            <CryptoHeatmapLazy
              dataSource="Crypto"
              colorTheme="dark"
              showTopBar={true}
              height="100%"
              width="100%"
            />
          )}
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '500px' },
      defaultPosition: { x: 0, y: 2450 }
    },
    'zen': {
      id: 'zen',
      type: 'zen',
      title: 'Zen Meditation',
      icon: <Waves size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading Zen Meditation Mode...</div>}>
          <ZenMeditationModeLazy />
        </React.Suspense>
      ),
      defaultSize: { width: '100%', height: '600px' },
      defaultPosition: { x: 0, y: 2960 }
    }
  };

  // Initialize active panels based on props and load from localStorage
  useEffect(() => {
    const savedPanels = layouts;
    if (savedPanels.length > 0) {
      setActivePanels(savedPanels.map(item => item.type));
    } else {
      setActivePanels(initialPanels.map(type => allPanels[type].id));
    }
  }, [initialPanels, layouts]);

  // Handler to toggle panel visibility
  const togglePanel = (panelId: string) => {
    const panelIndex = activePanels.indexOf(panelId);
    const updatedPanels = [...activePanels];

    if (panelIndex === -1) {
      updatedPanels.push(panelId);
    } else {
      updatedPanels.splice(panelIndex, 1);
    }
    setActivePanels(updatedPanels);
  };

  // Handler to minimize/restore panel
  const toggleMinimize = (panelId: string) => {
    const panelIndex = minimizedPanels.indexOf(panelId);
    const updatedPanels = [...minimizedPanels];

    if (panelIndex === -1) {
      updatedPanels.push(panelId);
    } else {
      updatedPanels.splice(panelIndex, 1);
    }
    setMinimizedPanels(updatedPanels);

    // If this panel was maximized, un-maximize it
    if (maximizedPanel === panelId) {
      setMaximizedPanel(null);
    }
  };

  // Handler to maximize/restore panel
  const toggleMaximize = (panelId: string) => {
    if (maximizedPanel === panelId) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(panelId);

      // If this panel was minimized, un-minimize it
      if (minimizedPanels.includes(panelId)) {
        setMinimizedPanels(minimizedPanels.filter(id => id !== panelId));
      }
    }
  };

  // Handle drag and drop reordering
  const onDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Reorder the panels based on drag and drop
    const reorderedPanels = Array.from(activePanels);
    const [removed] = reorderedPanels.splice(result.source.index, 1);
    reorderedPanels.splice(result.destination.index, 0, removed);

    setActivePanels(reorderedPanels);
  };

  // State for tool carousel scrolling
  const [toolScrollIndex, setToolScrollIndex] = useState(0);
  const [compactMode, setCompactMode] = useState<boolean>(
    typeof window !== 'undefined' && window.innerWidth < 768 // Default to compact on small screens
  );

  // Define brokers for the connect broker modal
  const brokers = [
    // Crypto brokers
    {
      id: 'binance',
      name: 'Binance',
      type: 'crypto' as const,
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      type: 'crypto' as const,
    },
    // Forex brokers
    {
      id: 'oanda',
      name: 'Oanda',
      type: 'forex' as const,
    },
    // Stock brokers
    {
      id: 'alpaca',
      name: 'Alpaca',
      type: 'stocks' as const,
    }
  ];

  // Increase number of tools shown per device size
  const toolsPerView = typeof window !== 'undefined' 
    ? window.innerWidth < 500 
      ? (compactMode ? 6 : 3) // Extra small devices
    : window.innerWidth < 768 
      ? (compactMode ? 8 : 5) // Small devices
    : window.innerWidth < 1024 
      ? (compactMode ? 12 : 8) // Medium devices
    : (compactMode ? 15 : 10) // Large devices and up
    : 8; // Server-side default

  // Add resize listener to adjust compact mode based on screen size
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleResize = () => {
      if (window.innerWidth < 768 && !compactMode) {
        setCompactMode(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [compactMode]);

  const panelsArray = Object.values(allPanels);

  // Scroll tools left
  const scrollToolsLeft = () => {
    setToolScrollIndex(prev => Math.max(0, prev - 1));
  };

  // Scroll tools right
  const scrollToolsRight = () => {
    setToolScrollIndex(prev => Math.min(panelsArray.length - toolsPerView, prev + 1));
  };

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Floating Trade Panel */}
      <FloatingTradePanel 
        isOpen={isTradePanelOpen}
        onClose={() => setIsTradePanelOpen(false)}
        initialPosition={{ x: Math.max(50, window.innerWidth / 2 - 250), y: 100 }}
        initialSize={{ width: 500, height: 600 }}
      />
      
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 px-1.5 py-1">
        <div className="flex space-x-1">
          <Button 
            variant={layout === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('grid')}
            className="text-xs h-7 px-2 py-0.5"
          >
            Grid
          </Button>
          <Button 
            variant={layout === 'vertical' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('vertical')}
            className="text-xs h-7 px-2 py-0.5"
          >
            Vert
          </Button>
          <Button 
            variant={layout === 'horizontal' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('horizontal')}
            className="text-xs h-7 px-2 py-0.5"
          >
            Horiz
          </Button>
        </div>

        <div className="flex items-center flex-1 ml-2">
          {toolScrollIndex > 0 && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={scrollToolsLeft}
              className="h-7 w-7 mr-0.5 p-0"
            >
              <span className="text-sm">←</span>
            </Button>
          )}

          <div className="flex items-center ml-1">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompactMode(!compactMode)}
              className="text-xs h-7 px-2 py-0.5 mr-1"
              title={compactMode ? "Show tool names" : "Hide tool names"}
            >
              {compactMode ? "+" : "-"}
            </Button>
          </div>

          <div className="flex space-x-1 overflow-hidden flex-1">
            {panelsArray.slice(toolScrollIndex, toolScrollIndex + toolsPerView).map(panel => (
              <Button
                key={panel.id}
                variant={activePanels.includes(panel.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePanel(panel.id)}
                className={cn(
                  "text-xs whitespace-nowrap py-0.5 h-7",
                  compactMode ? "px-1 w-8" : "px-1.5"
                )}
                title={panel.title}
              >
                <span className={compactMode ? "" : "mr-1"}>{panel.icon}</span>
                {!compactMode && <span className="text-xs">{panel.title}</span>}
              </Button>
            ))}
          </div>

          {toolScrollIndex < panelsArray.length - toolsPerView && (
            <Button 
              variant="ghost" 
              size="icon"
              onClick={scrollToolsRight}
              className="h-7 w-7 ml-0.5 p-0"
            >
              <span className="text-sm">→</span>
            </Button>
          )}

          {/* Trade Now Button - placed at the end of the toolbar */}
          <div className="ml-auto flex items-center">
            <Button 
              variant="default"
              size="sm"
              className="flex items-center gap-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800"
              onClick={() => setIsTradePanelOpen(true)}
            >
              <TrendingUp className="h-4 w-4" />
              <span>Trade Now</span>
            </Button>
            
            {/* Hidden broker modal for advanced users who still need it */}
            <div className="hidden">
              <ConnectBrokerModal 
                onConnect={async (brokerId, credentials) => {
                  // Connect the broker using broker service
                  await brokerService.connectBroker(
                    brokerId,
                    brokers.find((b: {id: string}) => b.id === brokerId)?.name || "Unknown Broker",
                    brokers.find((b: {id: string, type: string}) => b.id === brokerId)?.type || "crypto",
                    credentials
                  );
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Panels Container with Drag and Drop */}
      <DragDropContext onDragEnd={onDragEnd}>
        <Droppable droppableId="droppable-panels" 
          direction={layout === 'horizontal' ? 'horizontal' : 'vertical'}
          // Need to use a different type when in grid layout to prevent strange behavior
          type={layout === 'grid' ? 'grid' : 'list'}>
          {(provided) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={cn(
                "flex-1 p-2 overflow-auto",
                {
                  "flex flex-col space-y-2": layout === 'vertical',
                  "flex flex-row space-x-2": layout === 'horizontal',
                  "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2": layout === 'grid'
                }
              )}
            >
              {/* Render active panels */}
              {activePanels.map((panelId, index) => {
                const panel = Object.values(allPanels).find(p => p.id === panelId);
                if (!panel) return null;

                // Skip rendering minimized panels in the main container
                if (minimizedPanels.includes(panelId)) return null;

                // Don't make maximized panels draggable
                if (maximizedPanel === panel.id) {
                  return (
                    <div
                      key={panel.id}
                      className="fixed inset-0 z-50 p-4 bg-slate-900/95"
                      style={{ height: 'auto' }}
                    >
                      <PanelContainer
                        title={panel.title}
                        icon={panel.icon}
                        onClose={() => togglePanel(panel.id)}
                        onMinimize={() => toggleMinimize(panel.id)}
                        onMaximize={() => toggleMaximize(panel.id)}
                        isMaximized={true}
                        className="h-full"
                      >
                        {panel.component}
                      </PanelContainer>
                    </div>
                  );
                }

                return (
                  <Draggable key={panel.id} draggableId={panel.id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={cn(
                          "transition-all duration-300",
                          {
                            // Responsive column span based on layout
                            "col-span-1 md:col-span-1": layout === 'grid' && panel.type !== 'chart',
                            "col-span-1 md:col-span-2": layout === 'grid' && panel.type === 'chart',
                          },
                          snapshot.isDragging ? "z-20 opacity-80" : ""
                        )}
                        style={{
                          ...provided.draggableProps.style,
                          height: panel.defaultSize.height
                        }}
                      >
                        <PanelContainer
                          title={panel.title}
                          icon={panel.icon}
                          onClose={() => togglePanel(panel.id)}
                          onMinimize={() => toggleMinimize(panel.id)}
                          onMaximize={() => toggleMaximize(panel.id)}
                          isMaximized={false}
                          isDraggable={true}
                          headerClassName={snapshot.isDragging ? "cursor-grabbing" : "cursor-grab"}
                          className="h-full"
                          dragHandleProps={provided.dragHandleProps}
                        >
                          {panel.component}
                        </PanelContainer>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Minimized Panels Bar */}
      {minimizedPanels.length > 0 && (
        <div className="flex space-x-2 bg-slate-800 border-t border-slate-700 p-2">
          {minimizedPanels.map(panelId => {
            const panel = Object.values(allPanels).find(p => p.id === panelId);
            if (!panel) return null;

            return (
              <Button
                key={panel.id}
                variant="outline"
                size="sm"
                onClick={() => toggleMinimize(panel.id)}
                className="text-xs"
              >
                <span className="mr-1">{panel.icon}</span>
                {panel.title}
              </Button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ControlCenter;