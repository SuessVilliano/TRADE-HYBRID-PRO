import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './dropdown-menu';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import useLocalStorage from '../../lib/hooks/useLocalStorage';
import { createPortal } from 'react-dom';
import DexChart from './dex-chart';
import TradingViewWidget from './TradingViewWidget';
import { TradeSignals } from './trade-signals';
import { SignalNotifications } from './signal-notifications';
import { PersonalizedTradingInsights } from './personalized-trading-insights';
import { cn } from '../../lib/utils';
import { googleSheetsService, TradeSignal } from '../../lib/services/google-sheets-service';
import { Switch } from './switch';
import { Label } from './label';
import {
  Maximize2,
  Minimize2,
  X,
  Plus,
  PanelLeft,
  LineChart,
  BookOpen,
  BrainCircuit,
  BarChart3,
  Layers,
  Newspaper,
  LineChartIcon,
  Settings,
  MoreHorizontal,
  Save,
  Download,
  Upload,
  ArrowDown,
} from 'lucide-react';

// Component types that can be added to the dashboard
export type PanelComponentType = 
  | 'tradingview-chart' 
  | 'dex-chart' 
  | 'order-book' 
  | 'market-depth' 
  | 'trading-signals' 
  | 'order-entry' 
  | 'position-manager'
  | 'market-news'
  | 'performance-metrics'
  | 'ai-insights';

interface DashboardItem {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  componentType: PanelComponentType;
  title: string;
  settings?: Record<string, any>;
  locked?: boolean;
  priority?: number; // Lower numbers = higher priority for loading order
  mobileFullWidth?: boolean; // Whether this panel should take up the full width on mobile
  mobilePosition?: 'below-chart' | 'above-chart' | 'default'; // Special positioning for mobile
}

// Dashboard layout templates
const DASHBOARD_TEMPLATES = {
  'fixed-chart-right-panel': [
    // Fixed TradingView chart as the primary panel (locked in place and loads first)
    { 
      id: 'tradingview-chart-1', 
      x: 0, 
      y: 0, 
      width: 8, 
      height: 6, 
      minWidth: 6, 
      minHeight: 5, 
      componentType: 'tradingview-chart', 
      title: 'TradingView Chart',
      locked: true, // This will be used to prevent moving this panel
      priority: 1, // Highest priority to load first
      mobileFullWidth: true // Will span full width on mobile
    },
    // Smart Trade Panel fixed on the right side (loads second)
    { 
      id: 'order-entry-1', 
      x: 8, 
      y: 0, 
      width: 4, 
      height: 6, 
      minWidth: 3, 
      minHeight: 5, 
      componentType: 'order-entry', 
      title: 'Smart Trade Panel',
      locked: true, // This will be used to prevent moving this panel
      priority: 2, // Second highest priority to load
      mobilePosition: 'below-chart' // On mobile, this will be positioned directly below the chart
    },
    // Trading Signals 
    { 
      id: 'trading-signals-1', 
      x: 0, 
      y: 6, 
      width: 12, 
      height: 3, 
      minWidth: 2, 
      minHeight: 2, 
      componentType: 'trading-signals', 
      title: 'Trading Signals',
      priority: 3, // Third highest priority to load
      mobileFullWidth: true // Will span full width on mobile
    },
  ],
  'default': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 8, height: 6, minWidth: 4, minHeight: 4, componentType: 'tradingview-chart', title: 'TradingView Chart', priority: 1 },
    { id: 'order-entry-1', x: 0, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-entry', title: 'Order Entry', priority: 2 },
    { id: 'order-book-1', x: 8, y: 0, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-book', title: 'Order Book' },
    { id: 'market-depth-1', x: 8, y: 3, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'market-depth', title: 'Market Depth' },
    { id: 'position-manager-1', x: 4, y: 6, width: 8, height: 3, minWidth: 2, minHeight: 2, componentType: 'position-manager', title: 'Positions' },
  ],
  'dual-chart': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 6, height: 6, minWidth: 4, minHeight: 4, componentType: 'tradingview-chart', title: 'TradingView Chart', priority: 1 },
    { id: 'dex-chart-1', x: 6, y: 0, width: 6, height: 6, minWidth: 4, minHeight: 4, componentType: 'dex-chart', title: 'DEX Chart', priority: 2 },
    { id: 'order-entry-1', x: 3, y: 6, width: 3, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-entry', title: 'Order Entry', priority: 3 },
    { id: 'order-book-1', x: 0, y: 6, width: 3, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-book', title: 'Order Book' },
    { id: 'position-manager-1', x: 6, y: 6, width: 6, height: 3, minWidth: 2, minHeight: 2, componentType: 'position-manager', title: 'Positions' },
  ],
  'trading-focused': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 7, height: 6, minWidth: 4, minHeight: 4, componentType: 'tradingview-chart', title: 'TradingView Chart', priority: 1 },
    { id: 'order-entry-1', x: 0, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-entry', title: 'Order Entry', priority: 2 },
    { id: 'trading-signals-1', x: 4, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'trading-signals', title: 'Signals', priority: 3 },
    { id: 'dex-chart-1', x: 7, y: 0, width: 5, height: 3, minWidth: 3, minHeight: 3, componentType: 'dex-chart', title: 'DEX Chart' },
    { id: 'order-book-1', x: 7, y: 3, width: 5, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-book', title: 'Order Book' },
    { id: 'position-manager-1', x: 8, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'position-manager', title: 'Positions' },
  ],
  'analysis-focused': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 8, height: 6, minWidth: 4, minHeight: 4, componentType: 'tradingview-chart', title: 'TradingView Chart', priority: 1 },
    { id: 'ai-insights-1', x: 8, y: 3, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'ai-insights', title: 'AI Insights', priority: 2 },
    { id: 'market-news-1', x: 0, y: 6, width: 6, height: 3, minWidth: 2, minHeight: 2, componentType: 'market-news', title: 'Market News', priority: 3 },
    { id: 'market-depth-1', x: 8, y: 0, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'market-depth', title: 'Market Depth' },
    { id: 'performance-metrics-1', x: 6, y: 6, width: 6, height: 3, minWidth: 2, minHeight: 2, componentType: 'performance-metrics', title: 'Performance' },
  ],
  'dex-focused': [
    { id: 'dex-chart-1', x: 0, y: 0, width: 8, height: 6, minWidth: 4, minHeight: 4, componentType: 'dex-chart', title: 'DEX Chart', priority: 1 },
    { id: 'tradingview-chart-1', x: 8, y: 0, width: 4, height: 6, minWidth: 3, minHeight: 3, componentType: 'tradingview-chart', title: 'TradingView Chart', priority: 2 },
    { id: 'order-entry-1', x: 4, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-entry', title: 'Order Entry', priority: 3 },
    { id: 'order-book-1', x: 0, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'order-book', title: 'Order Book' },
    { id: 'position-manager-1', x: 8, y: 6, width: 4, height: 3, minWidth: 2, minHeight: 2, componentType: 'position-manager', title: 'Positions' },
  ],
};

interface CustomizableTradingDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

export function CustomizableTradingDashboard({ 
  defaultSymbol = 'BTCUSD',
  className 
}: CustomizableTradingDashboardProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<keyof typeof DASHBOARD_TEMPLATES>('fixed-chart-right-panel');
  const [layout, setLayout] = useLocalStorage<DashboardItem[]>('trading-dashboard-layout', DASHBOARD_TEMPLATES['fixed-chart-right-panel'] as DashboardItem[]);
  const [editMode, setEditMode] = useState(false);
  const [isChangingLayout, setIsChangingLayout] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [draggedPanel, setDraggedPanel] = useState<{ id: string, startX: number, startY: number, offsetX: number, offsetY: number } | null>(null);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [selectedSignalId, setSelectedSignalId] = useState<string | null>(null);
  const autoSaveIntervalRef = useRef<NodeJS.Timeout | null>(null);
  
  // Fetch signals from Google Sheets
  const fetchSignals = useCallback(async () => {
    try {
      const allSignals = await googleSheetsService.fetchAllSignals();
      setSignals(allSignals);
      console.log('Fetched signals:', allSignals.length);
    } catch (error) {
      console.error('Error fetching signals:', error);
    }
  }, []);
  
  // Fetch signals on component mount
  useEffect(() => {
    fetchSignals();
    
    // Refresh signals every 5 minutes
    const interval = setInterval(() => {
      fetchSignals();
    }, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, [fetchSignals]);
  
  // Autosave functionality
  useEffect(() => {
    if (autoSaveEnabled) {
      // Set up autosave interval (every 30 seconds)
      autoSaveIntervalRef.current = setInterval(() => {
        // Only save if there are changes (comparing with localStorage would be complex,
        // so we just save periodically when autosave is enabled)
        setLastSaved(new Date());
        // The actual save happens automatically via the useLocalStorage hook
      }, 30000);
    } else if (autoSaveIntervalRef.current) {
      clearInterval(autoSaveIntervalRef.current);
    }
    
    // Cleanup on unmount
    return () => {
      if (autoSaveIntervalRef.current) {
        clearInterval(autoSaveIntervalRef.current);
      }
    };
  }, [autoSaveEnabled]);

  // Get available component types for adding new panels
  const getAvailableComponentTypes = useCallback(() => {
    const allTypes: PanelComponentType[] = [
      'tradingview-chart', 
      'dex-chart', 
      'order-book', 
      'market-depth', 
      'trading-signals', 
      'order-entry', 
      'position-manager',
      'market-news',
      'performance-metrics',
      'ai-insights'
    ];
    
    // Return all types (allow multiple instances of component types)
    return allTypes;
  }, []);

  // Add a new panel to the layout
  const addPanel = (componentType: PanelComponentType) => {
    const id = `${componentType}-${Date.now()}`;
    let title = componentType.split('-').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
    
    // Default sizes based on component type
    let width = 4;
    let height = 3;
    
    if (componentType.includes('chart')) {
      width = 6;
      height = 6;
    }
    
    const newPanel: DashboardItem = {
      id,
      x: 0,
      y: 0,
      width,
      height,
      minWidth: 2,
      minHeight: 2,
      componentType,
      title,
    };
    
    setLayout([...layout, newPanel]);
    toast.success(`Added ${title} panel`);
  };

  // Remove a panel from the layout
  const removePanel = (id: string) => {
    setLayout(layout.filter(item => item.id !== id));
    toast.success('Panel removed');
  };

  // Apply a template
  const applyTemplate = (templateName: keyof typeof DASHBOARD_TEMPLATES) => {
    setIsChangingLayout(true);
    
    // Small delay to ensure the animation looks smooth
    setTimeout(() => {
      setLayout(DASHBOARD_TEMPLATES[templateName] as DashboardItem[]);
      setSelectedTemplate(templateName);
      setIsChangingLayout(false);
      toast.success(`Applied ${templateName} template`);
    }, 300);
  };

  // Handle maximizing/minimizing panels
  const toggleMaximizePanel = (id: string) => {
    if (maximizedPanel === id) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(id);
    }
  };

  // Handle panel drag start
  const handlePanelDragStart = (e: React.MouseEvent, id: string) => {
    if (!editMode) return;
    
    // Check if panel is locked
    const panelItem = layout.find(item => item.id === id);
    if (panelItem?.locked) {
      // Don't allow dragging of locked panels
      toast.info('This panel is locked in place');
      return;
    }
    
    const panel = document.getElementById(`panel-${id}`);
    if (!panel) return;
    
    const rect = panel.getBoundingClientRect();
    setDraggedPanel({
      id,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: e.clientX - rect.left,
      offsetY: e.clientY - rect.top
    });
  };

  // Handle panel dragging
  const handlePanelDrag = (e: React.MouseEvent) => {
    if (!draggedPanel || !editMode) return;
    
    const panel = document.getElementById(`panel-${draggedPanel.id}`);
    if (!panel) return;
    
    // For horizontal-only movement, we only update the X position
    const newX = e.clientX - draggedPanel.offsetX;
    
    // Get initial Y position
    const initialY = draggedPanel.startY - draggedPanel.offsetY;
    
    panel.style.position = 'absolute';
    panel.style.left = `${newX}px`;
    panel.style.top = `${initialY}px`; // Keep vertical position fixed
    panel.style.zIndex = '50';
  };

  // Handle panel drag end
  const handlePanelDragEnd = () => {
    if (!draggedPanel || !editMode) return;
    
    const panel = document.getElementById(`panel-${draggedPanel.id}`);
    if (!panel) return;
    
    // Get the final position
    const rect = panel.getBoundingClientRect();
    const containerRect = panel.parentElement?.getBoundingClientRect();
    
    if (!containerRect) {
      // Reset styles and exit if container not found
      panel.style.position = '';
      panel.style.left = '';
      panel.style.top = '';
      panel.style.zIndex = '';
      setDraggedPanel(null);
      return;
    }
    
    // Determine drop position - this is the key change
    // We'll update the layout array horizontally instead of vertically
    const updatedLayout = [...layout];
    const draggedItemIndex = updatedLayout.findIndex(item => item.id === draggedPanel.id);
    
    if (draggedItemIndex !== -1) {
      // Only update X position to ensure horizontal movement only
      const newX = Math.max(0, Math.min(Math.round((rect.left - containerRect.left) / 100), 12 - updatedLayout[draggedItemIndex].width));
      updatedLayout[draggedItemIndex] = {
        ...updatedLayout[draggedItemIndex],
        x: newX,
        // Keep y position the same
      };
      
      // Sort items so they don't overlap
      updatedLayout.sort((a, b) => {
        // First by row (y position)
        if (a.y !== b.y) return a.y - b.y;
        // Then by column (x position) for items in the same row
        return a.x - b.x;
      });
      
      setLayout(updatedLayout);
      setLastSaved(new Date());
    }
    
    // Reset styles
    panel.style.position = '';
    panel.style.left = '';
    panel.style.top = '';
    panel.style.zIndex = '';
    
    setDraggedPanel(null);
  };
  
  // Add event listeners for drag operations
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedPanel && editMode) {
        e.preventDefault();
        const panel = document.getElementById(`panel-${draggedPanel.id}`);
        if (!panel) return;
        
        // For horizontal-only movement, we only update the X position
        const newX = e.clientX - draggedPanel.offsetX;
        
        // Get initial Y position
        const initialY = draggedPanel.startY - draggedPanel.offsetY;
        
        panel.style.position = 'absolute';
        panel.style.left = `${newX}px`;
        panel.style.top = `${initialY}px`; // Keep vertical position fixed
        panel.style.zIndex = '50';
      }
    };
    
    const handleMouseUp = () => {
      if (draggedPanel && editMode) {
        handlePanelDragEnd();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedPanel, editMode]);
  
  // Export layout configuration to JSON file
  const exportLayout = () => {
    try {
      const layoutJson = JSON.stringify(layout, null, 2);
      const blob = new Blob([layoutJson], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Create temporary link and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `trading-dashboard-layout-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Layout exported successfully');
    } catch (error) {
      console.error('Error exporting layout:', error);
      toast.error('Failed to export layout');
    }
  };
  
  // Import layout configuration from JSON file
  const importLayout = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedLayout = JSON.parse(e.target?.result as string);
        if (Array.isArray(importedLayout)) {
          setLayout(importedLayout);
          setLastSaved(new Date());
          toast.success('Layout imported successfully');
        } else {
          toast.error('Invalid layout format');
        }
      } catch (error) {
        console.error('Error importing layout:', error);
        toast.error('Failed to import layout');
      }
    };
    reader.readAsText(file);
  };

  // Render the appropriate component based on type
  const renderPanelContent = (item: DashboardItem) => {
    switch (item.componentType) {
      case 'tradingview-chart':
        return <TradingViewWidget symbol={selectedSymbol} height="100%" />;
      case 'dex-chart':
        return <DexChart symbol={selectedSymbol} height={300} />;
      case 'order-book':
        return (
          <div className="p-4 h-full">
            <h3 className="text-lg font-medium mb-2">Order Book</h3>
            <div className="grid grid-cols-3 gap-2 text-sm font-medium mb-2">
              <div>Price</div>
              <div>Amount</div>
              <div>Total</div>
            </div>
            <div className="space-y-1">
              {/* Sell orders (red) */}
              <div className="grid grid-cols-3 gap-2 text-sm text-red-500">
                <div>43,456.50</div>
                <div>0.25</div>
                <div>10,864.13</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-red-500">
                <div>43,455.00</div>
                <div>0.74</div>
                <div>32,156.70</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-red-500">
                <div>43,452.75</div>
                <div>1.20</div>
                <div>52,143.30</div>
              </div>
              
              {/* Spread */}
              <div className="grid grid-cols-3 gap-2 text-sm py-1 border-y border-gray-600 my-1">
                <div className="font-medium">Spread</div>
                <div>5.75</div>
                <div>0.013%</div>
              </div>
              
              {/* Buy orders (green) */}
              <div className="grid grid-cols-3 gap-2 text-sm text-green-500">
                <div>43,447.00</div>
                <div>0.88</div>
                <div>38,233.36</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-green-500">
                <div>43,445.25</div>
                <div>1.55</div>
                <div>67,340.14</div>
              </div>
              <div className="grid grid-cols-3 gap-2 text-sm text-green-500">
                <div>43,442.50</div>
                <div>2.10</div>
                <div>91,229.25</div>
              </div>
            </div>
          </div>
        );
      case 'market-depth':
        return (
          <div className="p-4 h-full">
            <h3 className="text-lg font-medium mb-4">Market Depth</h3>
            <div className="w-full h-[calc(100%-2rem)] flex items-center justify-center">
              <svg
                width="100%"
                height="100%"
                viewBox="0 0 300 200"
                preserveAspectRatio="none"
              >
                {/* X and Y axes */}
                <line x1="0" y1="180" x2="300" y2="180" stroke="#666" strokeWidth="1" />
                <line x1="10" y1="10" x2="10" y2="180" stroke="#666" strokeWidth="1" />
                
                {/* Buy side (green) */}
                <path
                  d="M10,180 L10,120 C50,140 100,150 150,160 L150,180 Z"
                  fill="rgba(0, 128, 0, 0.3)"
                  stroke="green"
                  strokeWidth="1"
                />
                
                {/* Sell side (red) */}
                <path
                  d="M150,180 L150,160 C200,150 250,120 290,80 L290,180 Z"
                  fill="rgba(255, 0, 0, 0.3)"
                  stroke="red"
                  strokeWidth="1"
                />
                
                {/* Price labels */}
                <text x="10" y="195" fontSize="10" fill="#999">43,400</text>
                <text x="80" y="195" fontSize="10" fill="#999">43,430</text>
                <text x="150" y="195" fontSize="10" fill="#999">43,450</text>
                <text x="220" y="195" fontSize="10" fill="#999">43,470</text>
                <text x="290" y="195" fontSize="10" fill="#999">43,500</text>
              </svg>
            </div>
          </div>
        );
      case 'trading-signals':
        return (
          <div className="h-full overflow-auto">
            <TradeSignals 
              signals={signals} 
              onViewSignal={(signalId) => setSelectedSignalId(signalId)}
            />
          </div>
        );
      case 'order-entry':
        return (
          <div className="p-4 h-full overflow-auto mobile-trade-panel">
            <h3 className="text-lg font-medium mb-4 flex items-center">
              <span className="text-primary mr-1">Smart</span> Trade Panel
              <Badge variant="outline" className="ml-2 bg-slate-800 text-xs">Pro</Badge>
            </h3>
            <Tabs defaultValue="market">
              <TabsList className="w-full mb-4 grid grid-cols-3 gap-1">
                <TabsTrigger value="market" className="flex-1 text-sm">Market</TabsTrigger>
                <TabsTrigger value="limit" className="flex-1 text-sm">Limit</TabsTrigger>
                <TabsTrigger value="stop" className="flex-1 text-sm">Stop</TabsTrigger>
              </TabsList>
              
              <div className="space-y-5">
                {/* Chart connection indicator */}
                <div className="bg-blue-900/10 border border-blue-900/30 rounded-md p-2 mb-2 flex items-center justify-between md:hidden">
                  <div className="flex items-center">
                    <LineChart className="h-4 w-4 text-blue-400 mr-2" />
                    <span className="text-xs text-blue-300">Connected to Chart</span>
                  </div>
                  <Badge variant="outline" className="text-[10px] bg-blue-900/30 text-blue-300">
                    Auto-sync
                  </Badge>
                </div>

                {/* Symbol selector - linked to the chart */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs text-slate-400 mb-1">Symbol</label>
                    <div className="inline-flex items-center text-xs text-green-400">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-1 animate-pulse"></div>
                      Active
                    </div>
                  </div>
                  <select 
                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm"
                    value={selectedSymbol}
                    onChange={(e) => {
                      // When changing symbol in trade panel, update the chart
                      setSelectedSymbol(e.target.value);
                      console.log(`Trade panel symbol changed to: ${e.target.value}`);
                    }}
                  >
                    <option value="BTCUSD">BTC/USD</option>
                    <option value="ETHUSD">ETH/USD</option>
                    <option value="SOLUSD">SOL/USD</option>
                    <option value="DOTUSD">DOT/USD</option>
                    <option value="AVAXUSD">AVAX/USD</option>
                    <option value="ADAUSD">ADA/USD</option>
                    <option value="LTCUSD">LTC/USD</option>
                    <option value="BNBUSD">BNB/USD</option>
                  </select>
                </div>
                
                {/* Trading form with mobile optimizations */}
                <div className="space-y-3 bg-slate-900/50 p-3 rounded-md">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Price (USD)</label>
                    <div className="relative">
                      <input type="text" className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm pl-8" placeholder="43,450.00" />
                      <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Amount (BTC)</label>
                    <div className="flex gap-2">
                      <input type="text" className="flex-1 bg-slate-800 border border-slate-700 rounded p-2 text-sm" placeholder="0.25" />
                      <div className="grid grid-cols-4 gap-1 w-1/2">
                        <Button variant="outline" size="sm" className="text-[10px] py-0">25%</Button>
                        <Button variant="outline" size="sm" className="text-[10px] py-0">50%</Button>
                        <Button variant="outline" size="sm" className="text-[10px] py-0">75%</Button>
                        <Button variant="outline" size="sm" className="text-[10px] py-0">100%</Button>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Total (USD)</label>
                    <input type="text" disabled className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-sm" placeholder="10,862.50" />
                  </div>
                </div>
                
                {/* Trade options */}
                <div className="bg-slate-900/50 p-3 rounded-md">
                  <h4 className="font-medium text-sm mb-2">Advanced Options</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Take Profit</label>
                      <input type="text" className="w-32 bg-slate-800 border border-slate-700 rounded p-1 text-xs" placeholder="44,500.00" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Stop Loss</label>
                      <input type="text" className="w-32 bg-slate-800 border border-slate-700 rounded p-1 text-xs" placeholder="42,800.00" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">Risk %</label>
                      <input type="text" className="w-32 bg-slate-800 border border-slate-700 rounded p-1 text-xs" placeholder="1%" />
                    </div>
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-slate-400">R:R Ratio</label>
                      <input type="text" className="w-32 bg-slate-800 border border-slate-700 rounded p-1 text-xs" placeholder="1:2" />
                    </div>
                  </div>
                </div>
                
                {/* Buy/Sell Buttons - Important for mobile */}
                <div className="flex gap-2 sticky bottom-0 pt-4 mt-4 pb-2">
                  <Button 
                    className="flex-1 py-6 text-lg font-bold bg-green-600 hover:bg-green-700 border-green-500"
                  >
                    BUY
                  </Button>
                  <Button 
                    className="flex-1 py-6 text-lg font-bold bg-red-600 hover:bg-red-700 border-red-500"
                    variant="destructive"
                  >
                    SELL
                  </Button>
                </div>
              </div>
            </Tabs>
          </div>
        );
      case 'position-manager':
        return (
          <div className="p-4 h-full">
            <h3 className="text-lg font-medium mb-4">Positions Manager</h3>
            <div className="space-y-3">
              <div className="grid grid-cols-6 gap-2 text-sm font-medium">
                <div>Asset</div>
                <div>Side</div>
                <div>Size</div>
                <div>Entry</div>
                <div>Current</div>
                <div>P/L</div>
              </div>
              
              <div className="grid grid-cols-6 gap-2 text-sm border-b pb-2 border-gray-700">
                <div>BTC/USD</div>
                <div className="text-green-500">Long</div>
                <div>0.5</div>
                <div>42,850</div>
                <div>43,450</div>
                <div className="text-green-500">+$300 (+1.4%)</div>
              </div>
              
              <div className="grid grid-cols-6 gap-2 text-sm border-b pb-2 border-gray-700">
                <div>ETH/USD</div>
                <div className="text-red-500">Short</div>
                <div>2.0</div>
                <div>2,540</div>
                <div>2,480</div>
                <div className="text-green-500">+$120 (+2.4%)</div>
              </div>
              
              <div className="grid grid-cols-6 gap-2 text-sm">
                <div>SOL/USD</div>
                <div className="text-green-500">Long</div>
                <div>10</div>
                <div>97.5</div>
                <div>95.2</div>
                <div className="text-red-500">-$23 (-2.3%)</div>
              </div>
            </div>
          </div>
        );
      case 'market-news':
        return (
          <div className="p-4 h-full overflow-auto">
            <h3 className="text-lg font-medium mb-4">Market News</h3>
            <div className="space-y-4">
              <div className="border-b border-gray-700 pb-3">
                <h4 className="font-medium mb-1">Bitcoin Breaks $43K Resistance Level</h4>
                <p className="text-sm text-gray-400 mb-2">3 hours ago</p>
                <p className="text-sm">Bitcoin has broken through the key resistance level of $43,000, showing strong bullish momentum...</p>
              </div>
              <div className="border-b border-gray-700 pb-3">
                <h4 className="font-medium mb-1">Ethereum Layer 2 Solutions See Record TVL</h4>
                <p className="text-sm text-gray-400 mb-2">5 hours ago</p>
                <p className="text-sm">Ethereum scaling solutions have reached an all-time high in total value locked, indicating...</p>
              </div>
              <div>
                <h4 className="font-medium mb-1">Solana NFT Trading Volume Surges</h4>
                <p className="text-sm text-gray-400 mb-2">8 hours ago</p>
                <p className="text-sm">Solana-based NFT marketplaces have seen a significant increase in trading volume over the past week...</p>
              </div>
            </div>
          </div>
        );
      case 'performance-metrics':
        return (
          <div className="p-4 h-full">
            <h3 className="text-lg font-medium mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-400">Today's P/L</p>
                <p className="text-lg font-bold text-green-500">+$458.25</p>
                <p className="text-xs text-green-400">+2.3%</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-400">Weekly P/L</p>
                <p className="text-lg font-bold text-green-500">+$1,245.80</p>
                <p className="text-xs text-green-400">+6.2%</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-400">Win Rate</p>
                <p className="text-lg font-bold">68%</p>
                <p className="text-xs text-gray-400">Last 50 trades</p>
              </div>
              <div className="bg-gray-800 p-3 rounded">
                <p className="text-sm text-gray-400">Avg. Profit/Loss</p>
                <p className="text-lg font-bold">1.8:1</p>
                <p className="text-xs text-gray-400">Risk-reward ratio</p>
              </div>
            </div>
          </div>
        );
      case 'ai-insights':
        return (
          <div className="p-4 h-full">
            <h3 className="text-lg font-medium mb-4">AI Market Insights</h3>
            <div className="space-y-3">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded">
                <h4 className="font-medium text-blue-400 mb-1">BTC/USD Analysis</h4>
                <p className="text-sm">Sentiment analysis indicates a bullish trend with 76% positive social media mentions. Key support level at $42,800.</p>
              </div>
              <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded">
                <h4 className="font-medium text-purple-400 mb-1">Market Correlation</h4>
                <p className="text-sm">BTC showing reduced correlation with tech stocks (0.42), suggesting potential market decoupling.</p>
              </div>
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded">
                <h4 className="font-medium text-amber-400 mb-1">Risk Assessment</h4>
                <p className="text-sm">Market volatility expected to increase in the next 24-48 hours. Consider reducing position sizes.</p>
              </div>
            </div>
          </div>
        );
      default:
        return <div className="p-4">Unknown component type: {item.componentType}</div>;
    }
  };

  // Component icon mapping
  const getComponentIcon = (type: PanelComponentType) => {
    switch (type) {
      case 'tradingview-chart':
        return <LineChart className="h-4 w-4 mr-2" />;
      case 'dex-chart':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'order-book':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'market-depth':
        return <Layers className="h-4 w-4 mr-2" />;
      case 'trading-signals':
        return <LineChartIcon className="h-4 w-4 mr-2" />;
      case 'order-entry':
        return <PanelLeft className="h-4 w-4 mr-2" />;
      case 'position-manager':
        return <Settings className="h-4 w-4 mr-2" />;
      case 'market-news':
        return <Newspaper className="h-4 w-4 mr-2" />;
      case 'performance-metrics':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'ai-insights':
        return <BrainCircuit className="h-4 w-4 mr-2" />;
      default:
        return <div className="h-4 w-4 mr-2" />;
    }
  };

  return (
    <div 
      className={cn(
        "relative bg-slate-900 rounded-lg border border-slate-700 flex flex-col h-full",
        isChangingLayout && "opacity-50 transition-opacity",
        className
      )}
      onMouseMove={handlePanelDrag}
      onMouseUp={handlePanelDragEnd}
    >
      {/* Dashboard Toolbar */}
      <div className="flex items-center justify-between p-3 border-b border-slate-700">
        <div className="flex items-center">
          <h2 className="text-lg font-bold mr-4">Trading Dashboard</h2>
          
          <Tabs value={selectedTemplate} onValueChange={value => applyTemplate(value as keyof typeof DASHBOARD_TEMPLATES)} className="border-0">
            <TabsList>
              <TabsTrigger value="fixed-chart-right-panel" className="text-xs py-1 px-2 bg-yellow-600/20 hover:bg-yellow-600/30">Trading Station</TabsTrigger>
              <TabsTrigger value="default" className="text-xs py-1 px-2">Default</TabsTrigger>
              <TabsTrigger value="dual-chart" className="text-xs py-1 px-2">Dual Chart</TabsTrigger>
              <TabsTrigger value="trading-focused" className="text-xs py-1 px-2">Trading</TabsTrigger>
              <TabsTrigger value="analysis-focused" className="text-xs py-1 px-2">Analysis</TabsTrigger>
              <TabsTrigger value="dex-focused" className="text-xs py-1 px-2">DEX</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Signal Notifications */}
          <SignalNotifications signals={signals} onShowSignal={setSelectedSignalId} />
          
          {/* Autosave Toggle */}
          <div className="flex items-center gap-2 mr-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="autosave"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <Label htmlFor="autosave" className="text-xs">
                Autosave
                {lastSaved && (
                  <span className="ml-2 text-xs text-gray-400">
                    Last saved: {lastSaved.toLocaleTimeString()}
                  </span>
                )}
              </Label>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => {
                // Manual save - just update the timestamp since
                // the actual saving is handled by useLocalStorage
                setLastSaved(new Date());
                toast.success('Dashboard layout saved');
              }}
              className="ml-2"
            >
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportLayout}
              title="Export layout configuration"
              className="ml-1"
            >
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            <div className="relative ml-1">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => {
                  // Create a hidden file input and trigger it
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = 'application/json';
                  input.onchange = importLayout as any;
                  input.click();
                }}
                title="Import layout configuration"
              >
                <Upload className="h-3 w-3 mr-1" />
                Import
              </Button>
            </div>
          </div>
          
          {/* Edit Mode Toggle */}
          <Button 
            variant={editMode ? "default" : "outline"} 
            size="sm" 
            onClick={() => {
              // If we're exiting edit mode, we should update the last saved timestamp
              if (editMode) {
                setLastSaved(new Date());
                toast.success('Layout changes saved');
              }
              setEditMode(!editMode);
            }}
            className={editMode ? "bg-blue-600 hover:bg-blue-700" : ""}
          >
            {editMode ? (
              <>
                <Save className="h-3 w-3 mr-1" />
                Exit Edit Mode
              </>
            ) : (
              <>
                <Settings className="h-3 w-3 mr-1" />
                Edit Layout
              </>
            )}
          </Button>
          
          {/* Add Panel Button */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Panel
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Add Component</DropdownMenuLabel>
              <DropdownMenuSeparator />
              
              {getAvailableComponentTypes().map(type => (
                <DropdownMenuItem key={type} onClick={() => addPanel(type)}>
                  {getComponentIcon(type)}
                  <span>{type.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {/* Mobile scroll indicator - only visible on small screens */}
      <div className="md:hidden p-2 bg-slate-800/70 backdrop-blur text-center text-xs text-slate-300 fixed bottom-0 left-0 right-0 z-50">
        <div className="flex items-center justify-center gap-1">
          <ArrowDown className="h-3 w-3 animate-bounce" />
          <span>Swipe to navigate panels</span>
          <ArrowDown className="h-3 w-3 animate-bounce" />
        </div>
      </div>
      
      {/* Dashboard Content */}
      <div className="flex-grow p-3 flex flex-col md:grid md:grid-cols-12 gap-3 relative mobile-dashboard-container">
        {maximizedPanel ? (
          // Render maximized panel
          layout.map(item => {
            if (item.id === maximizedPanel) {
              return (
                <div 
                  key={item.id}
                  className="col-span-12 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col"
                  style={{height: 'calc(100vh - 250px)'}}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800">
                    <div className="font-medium">{item.title}</div>
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => toggleMaximizePanel(item.id)}
                      >
                        <Minimize2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex-grow overflow-auto">
                    {renderPanelContent(item)}
                  </div>
                </div>
              );
            }
            return null;
          })
        ) : (
          // Render normal layout with priority sorting to ensure correct loading order
          [...layout]
            // Sort by priority (if present) to ensure widgets load in the desired order - Chart, Smart Trade, Economic Calendar
            .sort((a, b) => {
              // If both have priority, sort by it (lower number = higher priority)
              if (a.priority !== undefined && b.priority !== undefined) return a.priority - b.priority;
              // Items with priority come first
              if (a.priority !== undefined) return -1;
              if (b.priority !== undefined) return 1;
              // Otherwise, maintain original order
              return 0;
            })
            .map(item => {
              // Calculate column and row span based on width and height
              const colSpan = Math.min(item.width, 12);
              const heightClass = `h-[${item.height * 80}px]`;
              
              // Handle mobile layout special positioning
              const getMobileClassName = () => {
                // On small screens, adjust layout based on mobile properties
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  if (item.mobileFullWidth) {
                    return "col-span-12"; // Full width on mobile
                  }
                  
                  if (item.mobilePosition === 'below-chart') {
                    // Find the chart panel
                    const chartPanel = layout.find(p => p.componentType === 'tradingview-chart');
                    if (chartPanel) {
                      // Position this panel to appear right below the chart
                      return "col-span-12 order-2";
                    }
                  }
                }
                
                // Default desktop behavior
                return "col-span-" + colSpan;
              };
              
              // Adjust panel height for mobile with full-size chart
              const getHeightStyle = () => {
                if (typeof window !== 'undefined' && window.innerWidth < 768) {
                  if (item.componentType === 'tradingview-chart') {
                    return { height: 600 }; // Full-size chart height on mobile
                  }
                  if (item.componentType === 'order-entry') {
                    return { height: 550 }; // Taller trade panel height on mobile
                  }
                  if (item.componentType === 'trading-signals') {
                    return { height: 400 }; // Taller signals panel height on mobile
                  }
                  // Other panel types
                  return { height: 400 }; // Default mobile height
                }
                return { height: item.height * 80 }; // Desktop height
              };
              
              return (
                <Card
                  key={item.id}
                  id={`panel-${item.id}`}
                  className={cn(
                    getMobileClassName(),
                    "bg-slate-800 border-slate-700 overflow-hidden flex flex-col",
                    editMode && !item.locked && "cursor-move border-2 border-dashed border-blue-500/50 hover:border-blue-500",
                    item.locked && "border-2 border-solid border-yellow-500/50",
                    editMode && item.locked && "border-yellow-500",
                  )}
                  style={getHeightStyle()}
                  onMouseDown={e => handlePanelDragStart(e, item.id)}
              >
                <CardHeader className="py-2 px-3 flex flex-row items-center justify-between bg-slate-800/90">
                  <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleMaximizePanel(item.id)}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                    
                    {/* Only show remove button for non-locked panels in edit mode */}
                    {editMode && !item.locked && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-red-400 hover:text-red-500 hover:bg-red-500/10"
                        onClick={() => removePanel(item.id)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0 flex-grow overflow-auto">
                  {renderPanelContent(item)}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}