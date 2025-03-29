import React, { useState, useEffect } from 'react';
import { PanelContainer } from './panel-container';
import { LineChart, BarChart3, Signal, Bot, HelpCircle, BookOpen, Users, Cpu, MessageSquare, Calendar, BarChart, Sparkles } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

// Lazy load the components
const TradingViewWidgetLazy = React.lazy(() => import('./TradingViewWidget'));
const AIAssistantLazy = React.lazy(() => import('./ai-trade-assistant'));
const TradingSignalsLazy = React.lazy(() => import('./TradingSignals'));
const CopyTradingLazy = React.lazy(() => import('./CopyTrading'));
const SmartTradePanelLazy = React.lazy(() => import('./smart-trade-panel').then(module => ({ default: module.SmartTradePanel })));
const TradingBotsManagerLazy = React.lazy(() => import('./trading-bots-manager').then(module => ({ default: module.TradingBotsManager })));
const TradingCompanionChatbotLazy = React.lazy(() => import('./trading-companion-chatbot'));
const EconomicCalendarLazy = React.lazy(() => import('./economic-calendar'));
const MarketOverviewLazy = React.lazy(() => import('./market-overview'));

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
  | 'advanced-ai';

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
  initialPanels = ['chart', 'signals', 'smart-trade', 'companion', 'advanced-ai', 'economic-calendar', 'market-overview'],
}) => {
  // State to track active panels and their layout
  const [activePanels, setActivePanels] = useState<string[]>([]);
  const [minimizedPanels, setMinimizedPanels] = useState<string[]>([]);
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [layout, setLayout] = useState<'grid' | 'vertical' | 'horizontal'>('grid');
  
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
            <iframe
              src="https://s.tradingview.com/screener/"
              style={{ width: '100%', height: '100%', border: 'none' }}
              title="TradingView Scanner"
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
      defaultSize: { width: '100%', height: '400px' },
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
      defaultSize: { width: '100%', height: '400px' },
      defaultPosition: { x: 0, y: 1530 }
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
      defaultPosition: { x: 0, y: 1940 }
    },
    'advanced-ai': {
      id: 'advanced-ai',
      type: 'advanced-ai',
      title: 'AI Trading Assistant',
      icon: <Sparkles size={16} />,
      component: (
        <React.Suspense fallback={<div className="h-full flex items-center justify-center">Loading AI Trading Assistant...</div>}>
          <AIAssistantLazy selectedSymbol={selectedSymbol} />
        </React.Suspense>
      ),
      defaultSize: { width: '400px', height: '600px' },
      defaultPosition: { x: 760, y: 510 }
    }
  };

  // Initialize active panels based on props
  useEffect(() => {
    setActivePanels(initialPanels.map(type => allPanels[type].id));
  }, [initialPanels]);

  // Handler to toggle panel visibility
  const togglePanel = (panelId: string) => {
    if (activePanels.includes(panelId)) {
      setActivePanels(activePanels.filter(id => id !== panelId));
    } else {
      setActivePanels([...activePanels, panelId]);
    }
  };

  // Handler to minimize/restore panel
  const toggleMinimize = (panelId: string) => {
    if (minimizedPanels.includes(panelId)) {
      setMinimizedPanels(minimizedPanels.filter(id => id !== panelId));
    } else {
      setMinimizedPanels([...minimizedPanels, panelId]);
      
      // If this panel was maximized, un-maximize it
      if (maximizedPanel === panelId) {
        setMaximizedPanel(null);
      }
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

  // State for tool carousel scrolling
  const [toolScrollIndex, setToolScrollIndex] = useState(0);
  const toolsPerView = typeof window !== 'undefined' && window.innerWidth < 768 ? 3 : 5;
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
      {/* Toolbar */}
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 p-2">
        <div className="flex space-x-2">
          <Button 
            variant={layout === 'grid' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('grid')}
            className="text-xs"
          >
            Grid
          </Button>
          <Button 
            variant={layout === 'vertical' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('vertical')}
            className="text-xs"
          >
            Vertical
          </Button>
          <Button 
            variant={layout === 'horizontal' ? 'default' : 'outline'} 
            size="sm" 
            onClick={() => setLayout('horizontal')}
            className="text-xs"
          >
            Horizontal
          </Button>
        </div>
        
        <div className="flex items-center">
          {toolScrollIndex > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollToolsLeft}
              className="mr-1 p-1.5 h-8"
            >
              <span className="text-lg">←</span>
            </Button>
          )}
          
          <div className="flex space-x-2 overflow-hidden">
            {panelsArray.slice(toolScrollIndex, toolScrollIndex + toolsPerView).map(panel => (
              <Button
                key={panel.id}
                variant={activePanels.includes(panel.id) ? 'default' : 'outline'}
                size="sm"
                onClick={() => togglePanel(panel.id)}
                className="text-xs whitespace-nowrap"
                title={panel.title}
              >
                <span className="mr-1">{panel.icon}</span>
                {panel.title}
              </Button>
            ))}
          </div>
          
          {toolScrollIndex < panelsArray.length - toolsPerView && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={scrollToolsRight}
              className="ml-1 p-1.5 h-8"
            >
              <span className="text-lg">→</span>
            </Button>
          )}
        </div>
      </div>
      
      {/* Panels Container */}
      <div 
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
        {activePanels.map(panelId => {
          const panel = Object.values(allPanels).find(p => p.id === panelId);
          if (!panel) return null;
          
          // Skip rendering minimized panels in the main container
          if (minimizedPanels.includes(panelId)) return null;
          
          return (
            <div
              key={panel.id}
              className={cn(
                "transition-all duration-300",
                {
                  // Full screen if maximized
                  "fixed inset-0 z-50 p-4 bg-slate-900/95": maximizedPanel === panel.id,
                  // Responsive column span based on layout
                  "col-span-1 md:col-span-1": layout === 'grid' && panel.type !== 'chart',
                  "col-span-1 md:col-span-2": layout === 'grid' && panel.type === 'chart',
                }
              )}
              style={{
                height: maximizedPanel === panel.id ? 'auto' : panel.defaultSize.height
              }}
            >
              <PanelContainer
                title={panel.title}
                icon={panel.icon}
                onClose={() => togglePanel(panel.id)}
                onMinimize={() => toggleMinimize(panel.id)}
                onMaximize={() => toggleMaximize(panel.id)}
                isMaximized={maximizedPanel === panel.id}
                className="h-full"
              >
                {panel.component}
              </PanelContainer>
            </div>
          );
        })}
      </div>
      
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