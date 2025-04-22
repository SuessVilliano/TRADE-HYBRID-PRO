import React, { useState, useEffect } from 'react';
import { Button } from './button';
import { Plus, X, MoreHorizontal, Maximize2, Minimize2, Move, LineChart as LineChartIcon, BrainCircuit, Bot, Activity, Sparkles, Cpu } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from './dropdown-menu';
import TradingViewChart from './trading-view-chart';
import MarketOverview from './market-overview';
import StockHeatmap from './stock-heatmap';
import TradingViewStockHeatmapWidget from './tradingview-stock-heatmap-widget';
import TradingViewCryptoHeatmapWidget from './tradingview-crypto-heatmap-widget';
import { TradeSignals } from './trade-signals';
import { PersonalizedTradingInsights } from './personalized-trading-insights';
import { SmartTradePanel } from './smart-trade-panel';
import { TradingOrderForm } from './trading-order-form';
import { OrderBook } from './order-book';
import { MarketSentiment } from './market-sentiment';
import { PortfolioSummary } from './portfolio-summary';
import { MarketDepth } from './market-depth';
import { TradingOrdersTable } from './trading-orders-table';
import { RecentTrades } from './recent-trades';
import { AlertsPanel } from './alerts-panel';

interface WidgetComponentProps {
  symbol: string;
  onClose: () => void;
  onMaximize: () => void;
  isMaximized: boolean;
  isDragging: boolean;
}

interface DraggableWidgetProps {
  id: string;
  title: string;
  type: string;
  symbol: string;
  position: { x: number; y: number };
  size: { width: number; height: number };
  isMaximized?: boolean;
  onClose: (id: string) => void;
  onMaximize: (id: string) => void;
  onResize: (id: string, size: { width: number; height: number }) => void;
  onMove: (id: string, position: { x: number; y: number }) => void;
}

interface DraggableTradingDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

function getWidgetComponent(type: string, props: WidgetComponentProps) {
  switch (type) {
    case 'chart':
      return <TradingViewChart symbol={props.symbol} />;
    case 'order-form':
      return <TradingOrderForm symbol={props.symbol} />;
    case 'orders':
      return <TradingOrdersTable symbol={props.symbol} />;
    case 'portfolio':
      return <PortfolioSummary />;
    case 'market-depth':
      return <MarketDepth symbol={props.symbol} />;
    case 'sentiment':
      return <MarketSentiment symbol={props.symbol} />;
    case 'market-overview':
      return <MarketOverview />;
    case 'stock-heatmap':
      return <TradingViewStockHeatmapWidget 
        colorTheme="dark" 
        dataSource="NASDAQ100" 
        hasTopBar={true}
        isZoomEnabled={true}
        height="100%"
        width="100%"
      />;
    case 'crypto-heatmap':
      return <TradingViewCryptoHeatmapWidget 
        colorTheme="dark" 
        hasTopBar={true}
        isZoomEnabled={true}
        height="100%"
        width="100%"
      />;
    case 'order-book':
      return <OrderBook symbol={props.symbol} />;
    case 'recent-trades':
      return <RecentTrades symbol={props.symbol} />;
    case 'trade-signals':
      return <TradeSignals symbol={props.symbol} />;
    case 'trading-insights':
      return <PersonalizedTradingInsights symbol={props.symbol} />;
    case 'smart-trade':
      return <SmartTradePanel symbol={props.symbol} />;
    case 'alerts':
      return <AlertsPanel symbol={props.symbol} />;
    default:
      return <div className="p-4 text-center text-slate-400">Widget not found</div>;
  }
}

function DraggableWidget({ 
  id, 
  title, 
  type, 
  symbol,
  position, 
  size, 
  isMaximized = false,
  onClose, 
  onMaximize,
  onResize,
  onMove
}: DraggableWidgetProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const rect = e.currentTarget.getBoundingClientRect();
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  useEffect(() => {
    if (!isDragging) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      onMove(id, {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y
      });
    };
    
    const handleMouseUp = () => {
      setIsDragging(false);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, onMove]);
  
  return (
    <div
      className={`absolute bg-slate-800 border border-slate-700 rounded-lg overflow-hidden shadow-lg widget-container ${
        isMaximized ? 'fixed inset-4 z-50' : ''
      }`}
      style={{
        left: isMaximized ? undefined : position.x,
        top: isMaximized ? undefined : position.y,
        width: isMaximized ? undefined : size.width,
        height: isMaximized ? undefined : size.height,
        transition: isDragging ? 'none' : 'all 0.2s ease'
      }}
    >
      <div className="flex items-center justify-between bg-slate-800 border-b border-slate-700 p-2">
        <div
          className="flex items-center cursor-move flex-grow py-1 px-2"
          onMouseDown={handleMouseDown}
        >
          <Move className="h-4 w-4 text-slate-400 mr-2" />
          <span className="text-sm font-medium truncate">{title}</span>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
            onClick={() => onMaximize(id)}
          >
            {isMaximized ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                Edit Widget
              </DropdownMenuItem>
              <DropdownMenuItem className="hover:bg-slate-700 cursor-pointer">
                Change Symbol
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-slate-400 hover:text-white hover:bg-red-900/70"
            onClick={() => onClose(id)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div 
        className="p-2 overflow-auto" 
        style={{ 
          height: isMaximized 
            ? 'calc(100% - 33px)' 
            : `${size.height - 33}px` 
        }}
      >
        {getWidgetComponent(type, { 
          symbol, 
          onClose: () => onClose(id), 
          onMaximize: () => onMaximize(id), 
          isMaximized,
          isDragging
        })}
      </div>
    </div>
  );
}

export function DraggableTradingDashboard({
  defaultSymbol = 'BTCUSDT',
  className
}: DraggableTradingDashboardProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [widgets, setWidgets] = useState<any[]>([
    {
      id: 'chart-1',
      title: 'Price Chart',
      type: 'chart',
      position: { x: 10, y: 10 },
      size: { width: 600, height: 350 },
      isMaximized: false
    },
    {
      id: 'market-overview-1',
      title: 'Market Overview',
      type: 'market-overview',
      position: { x: 620, y: 10 },
      size: { width: 550, height: 350 },
      isMaximized: false
    },
    {
      id: 'stock-heatmap-1',
      title: 'Stocks Heatmap',
      type: 'stock-heatmap',
      position: { x: 10, y: 370 },
      size: { width: 300, height: 300 },
      isMaximized: false
    },
    {
      id: 'crypto-heatmap-1',
      title: 'Crypto Heatmap',
      type: 'crypto-heatmap',
      position: { x: 320, y: 370 },
      size: { width: 290, height: 300 },
      isMaximized: false
    },
    {
      id: 'smart-trade-1',
      title: 'AI Trade Assistant',
      type: 'smart-trade',
      position: { x: 620, y: 370 },
      size: { width: 550, height: 300 },
      isMaximized: false
    }
  ]);
  
  const [availableWidgets, setAvailableWidgets] = useState([
    { id: 'chart', title: 'Price Chart', type: 'chart' },
    { id: 'order-form', title: 'Order Form', type: 'order-form' },
    { id: 'orders', title: 'Open Orders', type: 'orders' },
    { id: 'portfolio', title: 'Portfolio Summary', type: 'portfolio' },
    { id: 'market-depth', title: 'Market Depth', type: 'market-depth' },
    { id: 'sentiment', title: 'Market Sentiment', type: 'sentiment' },
    { id: 'market-overview', title: 'Market Overview', type: 'market-overview' },
    { id: 'stock-heatmap', title: 'Stocks Heatmap', type: 'stock-heatmap' },
    { id: 'crypto-heatmap', title: 'Crypto Heatmap', type: 'crypto-heatmap' },
    { id: 'order-book', title: 'Order Book', type: 'order-book' },
    { id: 'recent-trades', title: 'Recent Trades', type: 'recent-trades' },
    { id: 'alerts', title: 'Price Alerts', type: 'alerts' },
    { id: 'trade-signals', title: 'AI Trading Signals', type: 'trade-signals' },
    { id: 'trading-insights', title: 'Personalized Trading Insights', type: 'trading-insights' },
    { id: 'smart-trade', title: 'AI Trade Assistant', type: 'smart-trade' },
  ]);
  
  const [isEditMode, setIsEditMode] = useState(false);
  
  const handleCloseWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
  };
  
  const handleMaximizeWidget = (id: string) => {
    setWidgets(widgets.map(widget => 
      widget.id === id 
        ? { ...widget, isMaximized: !widget.isMaximized } 
        : { ...widget, isMaximized: false }
    ));
  };
  
  const handleMoveWidget = (id: string, position: { x: number; y: number }) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, position } : widget
    ));
  };
  
  const handleResizeWidget = (id: string, size: { width: number; height: number }) => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    ));
  };
  
  const addWidget = (type: string, title: string) => {
    const newId = `${type}-${Date.now()}`;
    const newWidget = {
      id: newId,
      title,
      type,
      position: { x: 50, y: 50 },
      size: { width: 500, height: 300 },
      isMaximized: false
    };
    
    setWidgets([...widgets, newWidget]);
  };
  
  return (
    <div className={`relative w-full h-full bg-slate-900 ${className}`}>
      {/* Edit mode */}
      <div className="sticky top-4 right-4 z-40 flex justify-end gap-2 mb-4">
        <Button
          variant={isEditMode ? "default" : "outline"}
          size="sm"
          onClick={() => setIsEditMode(!isEditMode)}
          className={isEditMode ? "bg-blue-600 hover:bg-blue-700" : ""}
        >
          {isEditMode ? "Save Layout" : "Edit Layout"}
        </Button>
        
        {isEditMode && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Widget
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-slate-800 border-slate-700 text-white">
              {availableWidgets.map(widget => (
                <DropdownMenuItem
                  key={widget.id}
                  className="hover:bg-slate-700 cursor-pointer"
                  onClick={() => addWidget(widget.type, widget.title)}
                >
                  {widget.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
      
      {/* Widgets */}
      <div className="relative w-full h-full min-h-[1000px]">
        {widgets.map(widget => (
          <DraggableWidget
            key={widget.id}
            id={widget.id}
            title={widget.title}
            type={widget.type}
            symbol={symbol}
            position={widget.position}
            size={widget.size}
            isMaximized={widget.isMaximized}
            onClose={handleCloseWidget}
            onMaximize={handleMaximizeWidget}
            onResize={handleResizeWidget}
            onMove={handleMoveWidget}
          />
        ))}
      </div>
    </div>
  );
}