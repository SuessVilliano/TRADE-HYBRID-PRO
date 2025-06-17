import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  Grid3X3, 
  Lock, 
  Unlock,
  Settings,
  ExternalLink,
  Brain,
  Zap,
  Move
} from 'lucide-react';
import TradingViewChart from './trading-view-chart';
import { SmartTradePanel } from './smart-trade-panel';
import { TradingPlatformPanel } from '../trading/TradingPlatformPanel';
import { AITradeAssistant } from '../ai/AITradeAssistant';
import { AIMarketInsights } from '../ai/AIMarketInsights';
import { AIVoiceTrading } from '../ai/AIVoiceTrading';

interface Widget {
  id: string;
  title: string;
  type: 'chart' | 'trade-panel' | 'platforms' | 'ai-assistant' | 'ai-insights' | 'ai-voice' | 'market-overview' | 'prop-platforms';
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized: boolean;
  isLocked: boolean;
  zIndex: number;
}

interface EnhancedDraggableDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

export function EnhancedDraggableDashboard({
  defaultSymbol = 'BTCUSDT',
  className = ''
}: EnhancedDraggableDashboardProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [gridSize] = useState(20);
  const [maxZIndex, setMaxZIndex] = useState(10);
  
  const [widgets, setWidgets] = useState<Widget[]>([
    {
      id: 'main-chart',
      title: 'TradingView Chart',
      type: 'chart',
      position: { x: 20, y: 20 },
      size: { width: 800, height: 500 },
      isMaximized: false,
      isLocked: false,
      zIndex: 1
    },
    {
      id: 'trade-panel',
      title: 'Smart Trade Panel',
      type: 'trade-panel',
      position: { x: 840, y: 20 },
      size: { width: 350, height: 500 },
      isMaximized: false,
      isLocked: false,
      zIndex: 2
    },
    {
      id: 'prop-platforms',
      title: 'Prop Firm Trading Platforms',
      type: 'prop-platforms',
      position: { x: 20, y: 540 },
      size: { width: 580, height: 320 },
      isMaximized: false,
      isLocked: false,
      zIndex: 3
    },
    {
      id: 'ai-assistant',
      title: 'AI Trade Assistant',
      type: 'ai-assistant',
      position: { x: 620, y: 540 },
      size: { width: 350, height: 320 },
      isMaximized: false,
      isLocked: false,
      zIndex: 4
    },
    {
      id: 'ai-insights',
      title: 'AI Market Insights',
      type: 'ai-insights',
      position: { x: 990, y: 540 },
      size: { width: 300, height: 320 },
      isMaximized: false,
      isLocked: false,
      zIndex: 5
    }
  ]);

  const snapPosition = useCallback((x: number, y: number) => {
    if (!snapToGrid) return { x, y };
    return {
      x: Math.round(x / gridSize) * gridSize,
      y: Math.round(y / gridSize) * gridSize
    };
  }, [snapToGrid, gridSize]);

  const handleDrag = useCallback((widgetId: string, data: any) => {
    const snappedPosition = snapPosition(data.x, data.y);
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, position: snappedPosition }
        : widget
    ));
  }, [snapPosition]);

  const handleWidgetAction = useCallback((widgetId: string, action: 'maximize' | 'minimize' | 'close' | 'lock' | 'unlock') => {
    setWidgets(prev => prev.map(widget => {
      if (widget.id !== widgetId) return widget;
      
      switch (action) {
        case 'maximize':
          return { ...widget, isMaximized: true, zIndex: maxZIndex + 1 };
        case 'minimize':
          return { ...widget, isMaximized: false };
        case 'lock':
          return { ...widget, isLocked: true };
        case 'unlock':
          return { ...widget, isLocked: false };
        case 'close':
          return null;
      }
      return widget;
    }).filter(Boolean) as Widget[]);
    
    if (action === 'maximize') {
      setMaxZIndex(prev => prev + 1);
    }
  }, [maxZIndex]);

  const bringToFront = useCallback((widgetId: string) => {
    setWidgets(prev => prev.map(widget => 
      widget.id === widgetId 
        ? { ...widget, zIndex: maxZIndex + 1 }
        : widget
    ));
    setMaxZIndex(prev => prev + 1);
  }, [maxZIndex]);

  const handleMouseDown = useCallback((e: React.MouseEvent, widgetId: string) => {
    if (widgets.find(w => w.id === widgetId)?.isLocked) return;
    
    const startX = e.clientX;
    const startY = e.clientY;
    const widget = widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const startPos = { ...widget.position };
    
    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newX = startPos.x + deltaX;
      let newY = startPos.y + deltaY;
      
      if (snapToGrid) {
        newX = Math.round(newX / gridSize) * gridSize;
        newY = Math.round(newY / gridSize) * gridSize;
      }
      
      setWidgets(prev => prev.map(w => 
        w.id === widgetId 
          ? { ...w, position: { x: Math.max(0, newX), y: Math.max(0, newY) } }
          : w
      ));
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    bringToFront(widgetId);
  }, [widgets, snapToGrid, gridSize, bringToFront]);

  const renderWidget = (widget: Widget) => {
    const { id, title, type, position, size, isMaximized, isLocked, zIndex } = widget;
    
    const widgetStyle = isMaximized 
      ? { 
          position: 'fixed' as const, 
          top: 0, 
          left: 0, 
          width: '100vw', 
          height: '100vh', 
          zIndex: 9999 
        }
      : {
          position: 'absolute' as const,
          left: position.x,
          top: position.y,
          width: size.width,
          height: size.height,
          zIndex
        };

    const renderContent = () => {
      switch (type) {
        case 'chart':
          return <TradingViewChart symbol={symbol} onSymbolChange={setSymbol} />;
        case 'trade-panel':
          return <SmartTradePanel symbol={symbol} />;
        case 'prop-platforms':
          return <PropFirmPlatforms />;
        case 'platforms':
          return <TradingPlatformPanel />;
        case 'ai-assistant':
          return <AITradeAssistant />;
        case 'ai-insights':
          return <AIMarketInsights symbols={[symbol, 'ETHUSDT', 'SOLUSDT']} />;
        case 'ai-voice':
          return <AIVoiceTrading />;
        default:
          return <div className="p-4 text-slate-400">Widget content for {type}</div>;
      }
    };

    return (
      <div key={id} style={widgetStyle} className="select-none">
        <Card className="h-full bg-slate-800 border-slate-700 shadow-lg">
          <CardHeader 
            className={`widget-handle px-3 py-2 bg-slate-800 border-b border-slate-700 ${isLocked ? 'cursor-not-allowed' : 'cursor-move'}`}
            onMouseDown={(e) => handleMouseDown(e, id)}
          >
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white flex items-center gap-2">
                {type === 'ai-assistant' || type === 'ai-insights' || type === 'ai-voice' ? (
                  <>
                    <Brain className="h-4 w-4 text-purple-400" />
                    <Zap className="h-3 w-3 text-yellow-400 animate-pulse" />
                  </>
                ) : type === 'prop-platforms' || type === 'platforms' ? (
                  <ExternalLink className="h-4 w-4 text-blue-400" />
                ) : (
                  <Move className="h-4 w-4 text-slate-400" />
                )}
                {title}
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleWidgetAction(id, isLocked ? 'unlock' : 'lock')}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                >
                  {isLocked ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleWidgetAction(id, isMaximized ? 'minimize' : 'maximize')}
                  className="h-6 w-6 p-0 hover:bg-slate-700"
                >
                  {isMaximized ? <Minimize2 className="h-3 w-3" /> : <Maximize2 className="h-3 w-3" />}
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleWidgetAction(id, 'close')}
                  className="h-6 w-6 p-0 hover:bg-red-600"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 h-[calc(100%-48px)] overflow-hidden">
            {renderContent()}
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={`relative w-full h-full bg-slate-900 overflow-hidden ${className}`}>
      {/* Dashboard Controls */}
      <div className="absolute top-4 right-4 z-50 flex items-center gap-2">
        <Button
          size="sm"
          variant={snapToGrid ? 'default' : 'outline'}
          onClick={() => setSnapToGrid(!snapToGrid)}
          className="h-8 bg-slate-800 border-slate-600"
        >
          <Grid3X3 className="h-4 w-4 mr-2" />
          Snap to Grid
        </Button>
        <Button
          size="sm"
          variant="outline"
          className="h-8 bg-slate-800 border-slate-600"
        >
          <Settings className="h-4 w-4 mr-2" />
          Layout
        </Button>
      </div>

      {/* Grid Overlay */}
      {snapToGrid && (
        <div 
          className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
            backgroundSize: `${gridSize}px ${gridSize}px`
          }}
        />
      )}

      {/* Render Widgets */}
      {widgets.map(renderWidget)}
    </div>
  );
}

// Prop Firm Platforms Component
function PropFirmPlatforms() {
  const platforms = [
    {
      name: 'cTrader',
      url: 'https://ctrader.com/ctrader-web/login',
      description: 'Professional ECN trading platform',
      status: 'Featured'
    },
    {
      name: 'DX Trade',
      url: 'https://webtrader.dxtrade.com/login',
      description: 'Multi-asset trading platform',
      status: 'Active'
    },
    {
      name: 'Match Trader',
      url: 'https://webtrader.matchtrader.com/login',
      description: 'Social trading platform',
      status: 'Active'
    },
    {
      name: 'Rithmic',
      url: 'https://rithmic.com/webtrader/login',
      description: 'Professional futures trading',
      status: 'Standard'
    }
  ];

  return (
    <div className="p-4 h-full">
      <div className="grid grid-cols-2 gap-3 h-full">
        {platforms.map((platform) => (
          <Card key={platform.name} className="bg-slate-700 border-slate-600 hover:bg-slate-600 transition-colors">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-white text-sm">{platform.name}</h3>
                <span className={`text-xs px-2 py-1 rounded ${
                  platform.status === 'Featured' ? 'bg-blue-500 text-white' :
                  platform.status === 'Active' ? 'bg-green-500 text-white' :
                  'bg-gray-500 text-white'
                }`}>
                  {platform.status}
                </span>
              </div>
              <p className="text-slate-300 text-xs mb-3">{platform.description}</p>
              <Button
                size="sm"
                className="w-full h-8 bg-blue-600 hover:bg-blue-700"
                onClick={() => window.open(platform.url, '_blank')}
              >
                <ExternalLink className="h-3 w-3 mr-2" />
                Launch Platform
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}