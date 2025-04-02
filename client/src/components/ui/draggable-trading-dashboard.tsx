import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { 
  Maximize2, 
  Minimize2, 
  X, 
  PanelLeft, 
  PanelRight, 
  Save, 
  Plus, 
  Settings, 
  Layers, 
  LayoutGrid 
} from 'lucide-react';
import { toast } from 'sonner';
import TradingViewWidget from './TradingViewWidget';
import { TradeSignals } from './trade-signals';
import { SignalNotifications } from './signal-notifications';
import { PersonalizedTradingInsights } from './personalized-trading-insights';
import { CryptoHeatmap } from './crypto-heatmap';
import { StockHeatmap } from './stock-heatmap';
import { EconomicCalendar } from './economic-calendar';
import { MarketOverview } from './market-overview';
import { TradeJournal } from './trade-journal';
import { DexChart } from './dex-chart';
import { SmartTradePanel } from './smart-trade-panel';
import useLocalStorage from '../../lib/hooks/useLocalStorage';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { motion } from 'framer-motion';

// Widget types that can be added to the dashboard
export type WidgetType = 
  | 'tradingview-chart' 
  | 'dex-chart' 
  | 'order-book' 
  | 'market-depth' 
  | 'trading-signals' 
  | 'order-entry' 
  | 'position-manager'
  | 'market-news'
  | 'performance-metrics'
  | 'ai-insights'
  | 'crypto-heatmap'
  | 'stock-heatmap'
  | 'economic-calendar'
  | 'market-overview'
  | 'trade-journal';

// Dashboard widget
interface DashboardWidget {
  id: string;
  widgetType: WidgetType;
  title: string;
  size: 'small' | 'medium' | 'large';
  position: number;
  isMaximized?: boolean;
}

// Dashboard layout presets
const DASHBOARD_PRESETS = {
  'default': [
    { id: 'widget-1', widgetType: 'tradingview-chart', title: 'TradingView Chart', size: 'large', position: 0 },
    { id: 'widget-2', widgetType: 'order-entry', title: 'Smart Trade Panel', size: 'medium', position: 1 },
    { id: 'widget-3', widgetType: 'trading-signals', title: 'Trading Signals', size: 'medium', position: 2 },
    { id: 'widget-4', widgetType: 'market-overview', title: 'Market Overview', size: 'medium', position: 3 },
    { id: 'widget-5', widgetType: 'economic-calendar', title: 'Economic Calendar', size: 'medium', position: 4 },
  ],
  'analysis': [
    { id: 'widget-1', widgetType: 'tradingview-chart', title: 'TradingView Chart', size: 'large', position: 0 },
    { id: 'widget-2', widgetType: 'crypto-heatmap', title: 'Crypto Heatmap', size: 'medium', position: 1 },
    { id: 'widget-3', widgetType: 'stock-heatmap', title: 'Stock Heatmap', size: 'medium', position: 2 },
    { id: 'widget-4', widgetType: 'market-overview', title: 'Market Overview', size: 'medium', position: 3 },
    { id: 'widget-5', widgetType: 'ai-insights', title: 'AI Insights', size: 'medium', position: 4 },
  ],
  'crypto-focused': [
    { id: 'widget-1', widgetType: 'tradingview-chart', title: 'TradingView Chart', size: 'large', position: 0 },
    { id: 'widget-2', widgetType: 'dex-chart', title: 'DEX Chart', size: 'medium', position: 1 },
    { id: 'widget-3', widgetType: 'order-entry', title: 'Smart Trade Panel', size: 'medium', position: 2 },
    { id: 'widget-4', widgetType: 'crypto-heatmap', title: 'Crypto Heatmap', size: 'medium', position: 3 },
    { id: 'widget-5', widgetType: 'market-news', title: 'Market News', size: 'medium', position: 4 },
  ],
  'journal-focused': [
    { id: 'widget-1', widgetType: 'tradingview-chart', title: 'TradingView Chart', size: 'medium', position: 0 },
    { id: 'widget-2', widgetType: 'order-entry', title: 'Smart Trade Panel', size: 'medium', position: 1 },
    { id: 'widget-3', widgetType: 'trade-journal', title: 'Trade Journal', size: 'large', position: 2 },
    { id: 'widget-4', widgetType: 'performance-metrics', title: 'Performance Metrics', size: 'medium', position: 3 },
    { id: 'widget-5', widgetType: 'trading-signals', title: 'Trading Signals', size: 'medium', position: 4 },
  ]
};

// All available widgets to add
const AVAILABLE_WIDGETS: {type: WidgetType, title: string}[] = [
  { type: 'tradingview-chart', title: 'TradingView Chart' },
  { type: 'dex-chart', title: 'DEX Chart' },
  { type: 'order-entry', title: 'Smart Trade Panel' },
  { type: 'trading-signals', title: 'Trading Signals' },
  { type: 'market-overview', title: 'Market Overview' },
  { type: 'crypto-heatmap', title: 'Crypto Heatmap' },
  { type: 'stock-heatmap', title: 'Stock Heatmap' },
  { type: 'economic-calendar', title: 'Economic Calendar' },
  { type: 'trade-journal', title: 'Trade Journal' },
  { type: 'ai-insights', title: 'AI Insights' },
  { type: 'market-news', title: 'Market News' },
  { type: 'performance-metrics', title: 'Performance Metrics' },
  { type: 'order-book', title: 'Order Book' },
  { type: 'market-depth', title: 'Market Depth' },
  { type: 'position-manager', title: 'Position Manager' },
];

interface DraggableTradingDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

export function DraggableTradingDashboard({ 
  defaultSymbol = 'BTCUSDT', 
  className 
}: DraggableTradingDashboardProps) {
  // Widgets state
  const [widgets, setWidgets] = useLocalStorage<DashboardWidget[]>(
    'trading-dashboard-widgets',
    DASHBOARD_PRESETS['default'] as DashboardWidget[]
  );
  
  // Selected trading symbol
  const [symbol, setSymbol] = useState(defaultSymbol);
  
  // Edit mode
  const [editMode, setEditMode] = useState(false);
  
  // Maximized widget
  const [maximizedWidget, setMaximizedWidget] = useState<string | null>(null);
  
  // Add widget dialog
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  // Layout preset
  const [selectedPreset, setSelectedPreset] = useState('default');

  // Handle drag end
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Update positions
    const updatedItems = items.map((item, index) => ({
      ...item,
      position: index
    }));
    
    setWidgets(updatedItems);
    toast.success('Dashboard layout updated');
  };

  // Add a new widget
  const addWidget = (widgetType: WidgetType) => {
    const newWidget: DashboardWidget = {
      id: `widget-${Date.now()}`,
      widgetType,
      title: AVAILABLE_WIDGETS.find(w => w.type === widgetType)?.title || 'Widget',
      size: 'medium',
      position: widgets.length
    };
    
    setWidgets([...widgets, newWidget]);
    setAddDialogOpen(false);
    toast.success(`${newWidget.title} added to dashboard`);
  };

  // Remove a widget
  const removeWidget = (id: string) => {
    setWidgets(widgets.filter(widget => widget.id !== id));
    toast.success('Widget removed from dashboard');
  };

  // Toggle widget maximized state
  const toggleMaximize = (id: string) => {
    if (maximizedWidget === id) {
      setMaximizedWidget(null);
    } else {
      setMaximizedWidget(id);
    }
  };

  // Change widget size
  const changeWidgetSize = (id: string, size: 'small' | 'medium' | 'large') => {
    setWidgets(widgets.map(widget => 
      widget.id === id ? { ...widget, size } : widget
    ));
  };

  // Load a preset
  const loadPreset = (preset: string) => {
    setWidgets(DASHBOARD_PRESETS[preset as keyof typeof DASHBOARD_PRESETS] as DashboardWidget[]);
    setSelectedPreset(preset);
    toast.success(`${preset} layout loaded`);
  };

  // Render widget content based on type
  const renderWidgetContent = (widget: DashboardWidget) => {
    switch (widget.widgetType) {
      case 'tradingview-chart':
        return <TradingViewWidget symbol={symbol} />;
      case 'dex-chart':
        return <DexChart symbol={symbol} />;
      case 'order-entry':
        return <SmartTradePanel />;
      case 'trading-signals':
        return <TradeSignals />;
      case 'market-overview':
        return <MarketOverview />;
      case 'crypto-heatmap':
        return <CryptoHeatmap />;
      case 'stock-heatmap':
        return <StockHeatmap />;
      case 'economic-calendar':
        return <EconomicCalendar />;
      case 'trade-journal':
        return <TradeJournal />;
      case 'ai-insights':
        return <PersonalizedTradingInsights />;
      case 'market-news':
        return <div>Market News</div>;
      case 'performance-metrics':
        return <div>Performance Metrics</div>;
      case 'order-book':
        return <div>Order Book</div>;
      case 'market-depth':
        return <div>Market Depth</div>;
      case 'position-manager':
        return <div>Position Manager</div>;
      default:
        return <div>Unknown Widget Type</div>;
    }
  };

  // Get grid class based on widget size
  const getWidgetSizeClass = (size: 'small' | 'medium' | 'large') => {
    switch (size) {
      case 'small':
        return 'col-span-1';
      case 'medium':
        return 'col-span-2';
      case 'large':
        return 'col-span-4';
      default:
        return 'col-span-2';
    }
  };

  // Symbols for quick access
  const symbolOptions = [
    { value: 'BTCUSDT', label: 'BTC/USDT' },
    { value: 'ETHUSDT', label: 'ETH/USDT' },
    { value: 'SOLUSDT', label: 'SOL/USDT' },
    { value: 'BNBUSDT', label: 'BNB/USDT' },
    { value: 'DOGEUSDT', label: 'DOGE/USDT' },
    { value: 'XRPUSDT', label: 'XRP/USDT' },
  ];

  return (
    <div className={`${className} p-4`}>
      {/* Dashboard Controls */}
      <div className="mb-6 bg-slate-800 rounded-lg border border-slate-700 p-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Select 
              value={symbol} 
              onValueChange={setSymbol}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Symbol" />
              </SelectTrigger>
              <SelectContent>
                {symbolOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select 
              value={selectedPreset} 
              onValueChange={loadPreset}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select Layout" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default Layout</SelectItem>
                <SelectItem value="analysis">Analysis Layout</SelectItem>
                <SelectItem value="crypto-focused">Crypto Focused</SelectItem>
                <SelectItem value="journal-focused">Journal Focused</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Widget
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-800 border-slate-700 text-white">
                <DialogHeader>
                  <DialogTitle>Add Widget</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {AVAILABLE_WIDGETS.map(widget => (
                    <Button 
                      key={widget.type} 
                      variant="outline" 
                      onClick={() => addWidget(widget.type)}
                      className="text-left justify-start"
                    >
                      {widget.title}
                    </Button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            <Button 
              variant="outline" 
              size="sm" 
              className={`gap-2 ${editMode ? 'bg-blue-900/30 border-blue-600 text-blue-300' : ''}`}
              onClick={() => setEditMode(!editMode)}
            >
              {editMode ? (
                <>
                  <Save className="h-4 w-4" />
                  Save Layout
                </>
              ) : (
                <>
                  <LayoutGrid className="h-4 w-4" />
                  Edit Layout
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
      
      {/* Edit Mode Instruction */}
      {editMode && (
        <div className="mb-6 bg-blue-900/20 border border-blue-700/50 rounded-lg p-4 text-blue-200">
          <h3 className="font-medium mb-2 flex items-center">
            <Layers className="h-5 w-5 mr-2" />
            Edit Mode Enabled
          </h3>
          <p className="text-sm">
            Drag and drop widgets to rearrange them. Use the widget menu to resize or remove widgets.
          </p>
        </div>
      )}
      
      {/* Maximized Widget View */}
      {maximizedWidget && (
        <div className="fixed inset-0 z-50 bg-slate-900/95 p-4 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              {widgets.find(w => w.id === maximizedWidget)?.title}
            </h2>
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMaximizedWidget(null)}
            >
              <Minimize2 className="h-5 w-5" />
            </Button>
          </div>
          <div className="flex-grow overflow-auto bg-slate-800 rounded-lg border border-slate-700 p-4">
            {renderWidgetContent(widgets.find(w => w.id === maximizedWidget)!)}
          </div>
        </div>
      )}
      
      {/* Dashboard Grid */}
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="dashboard" direction="vertical" isDropDisabled={!editMode}>
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="grid grid-cols-4 gap-4"
            >
              {widgets
                .sort((a, b) => a.position - b.position)
                .map((widget, index) => (
                <Draggable
                  key={widget.id}
                  draggableId={widget.id}
                  index={index}
                  isDragDisabled={!editMode}
                >
                  {(provided, snapshot) => (
                    <motion.div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className={`
                        ${getWidgetSizeClass(widget.size)} 
                        ${snapshot.isDragging ? 'z-10' : ''}
                        ${editMode ? 'border-2 border-dashed border-blue-500/50' : ''}
                      `}
                    >
                      <Card className="h-full bg-slate-800 border-slate-700 overflow-hidden shadow-md">
                        <CardHeader 
                          className={`
                            p-3 
                            ${editMode ? 'cursor-move bg-blue-900/30' : 'bg-slate-800'} 
                            flex-row justify-between items-center
                          `}
                          {...(editMode ? provided.dragHandleProps : {})}
                        >
                          <CardTitle className="text-sm font-medium truncate">
                            {widget.title}
                          </CardTitle>
                          
                          <div className="flex items-center gap-1">
                            {editMode && (
                              <Select 
                                value={widget.size} 
                                onValueChange={(val) => changeWidgetSize(widget.id, val as any)}
                              >
                                <SelectTrigger className="h-7 w-[85px] text-xs">
                                  <SelectValue placeholder="Size" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="small">Small</SelectItem>
                                  <SelectItem value="medium">Medium</SelectItem>
                                  <SelectItem value="large">Large</SelectItem>
                                </SelectContent>
                              </Select>
                            )}
                            
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-7 w-7"
                              onClick={() => toggleMaximize(widget.id)}
                            >
                              <Maximize2 className="h-4 w-4" />
                            </Button>
                            
                            {editMode && (
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-7 w-7 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                                onClick={() => removeWidget(widget.id)}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </CardHeader>
                        
                        <CardContent className="p-0 h-[calc(100%-3rem)]">
                          <div className="h-full overflow-hidden">
                            {renderWidgetContent(widget)}
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
}