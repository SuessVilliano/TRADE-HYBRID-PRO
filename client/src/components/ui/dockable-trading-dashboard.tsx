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
import { DexChart } from './dex-chart';
import TradingViewWidget from './TradingViewWidget';
import { TradeSignals } from './trade-signals';
import { SignalNotifications } from './signal-notifications';
import { PersonalizedTradingInsights } from './personalized-trading-insights';
import { SmartTradePanel } from './smart-trade-panel';
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

interface DockableDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

// Dashboard layout templates
const DASHBOARD_TEMPLATES = {
  'fixed-chart-right-panel': [
    // Fixed TradingView chart as the primary panel (locked in place and loads first)
    // Now full-width with Smart Trade Panel docked as an overlay
    { 
      id: 'tradingview-chart-1', 
      x: 0, 
      y: 0, 
      width: 12, 
      height: 6, 
      minWidth: 8, 
      minHeight: 5, 
      componentType: 'tradingview-chart', 
      title: 'TradingView Chart',
      locked: true, // This will be used to prevent moving this panel
      priority: 1, // Highest priority to load first
      mobileFullWidth: true, // Will span full width on mobile
      settings: {
        isDocked: true, // Indicates that other panels can dock to this one
        allowOverlay: true // Allows other panels to overlay on top of this one
      }
    },
    // Smart Trade Panel docked with chart (loads second)
    { 
      id: 'order-entry-1', 
      x: 8, 
      y: 0, 
      width: 4, 
      height: 6, 
      minWidth: 3,
      maxWidth: 5,
      componentType: 'order-entry', 
      title: 'Smart Trade Panel',
      locked: true,
      priority: 2, // Load second after chart
      mobilePosition: 'below-chart', // Position below chart on mobile
      settings: {
        isDockedTo: 'tradingview-chart-1', // Indicates which panel this is docked to
        isPinned: true, // Indicates that this panel is pinned to its position
        dockedPosition: 'right' // Position relative to the panel it's docked to
      }
    },
    // Other panels for this template
    {
      id: 'trading-signals-1',
      x: 0,
      y: 6,
      width: 4,
      height: 4,
      componentType: 'trading-signals',
      title: 'Trading Signals',
      priority: 3, // Load third after chart and trade panel
    },
    {
      id: 'market-depth-1',
      x: 4,
      y: 6,
      width: 4,
      height: 4,
      componentType: 'market-depth',
      title: 'Market Depth',
      priority: 4,
    },
    {
      id: 'ai-insights-1',
      x: 8,
      y: 6,
      width: 4,
      height: 4,
      componentType: 'ai-insights',
      title: 'AI Trading Insights',
      priority: 5,
    }
  ]
}

export function DockableTradingDashboard({ 
  defaultSymbol = 'BTCUSDT',
  className
}: DockableDashboardProps) {
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol);
  const [layout, setLayout] = useState<DashboardItem[]>([]);
  const [draggedPanel, setDraggedPanel] = useState<{ id: string, startX: number, startY: number, offsetX: number, offsetY: number } | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [availablePanels, setAvailablePanels] = useState<PanelComponentType[]>([
    'tradingview-chart',
    'order-entry',
    'trading-signals',
    'market-depth',
    'ai-insights',
    'dex-chart',
    'market-news',
    'performance-metrics'
  ]);
  const [activePanels, setActivePanels] = useState<PanelComponentType[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('fixed-chart-right-panel');
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  const [showAddPanel, setShowAddPanel] = useState(false);
  
  // Initialize with default template
  useEffect(() => {
    loadTemplate(selectedTemplate);
  }, [selectedTemplate]);
  
  // Recalculate active panels whenever the layout changes
  useEffect(() => {
    const currentPanels = layout.map(item => item.componentType);
    setActivePanels(Array.from(new Set(currentPanels))); // Use Set to get unique values, convert to array
  }, [layout]);
  
  // Load the specified template
  const loadTemplate = (templateName: string) => {
    if (DASHBOARD_TEMPLATES[templateName as keyof typeof DASHBOARD_TEMPLATES]) {
      // Cast the template to ensure it's properly typed as DashboardItem[]
      const template = DASHBOARD_TEMPLATES[templateName as keyof typeof DASHBOARD_TEMPLATES];
      const typedTemplate: DashboardItem[] = template.map(item => {
        // Create a properly typed object with all the required properties
        const typedItem: DashboardItem = {
          ...item,
          componentType: item.componentType as PanelComponentType,
          // Ensure mobilePosition is properly typed
          mobilePosition: (item.mobilePosition as 'below-chart' | 'above-chart' | 'default' | undefined)
        };
        return typedItem;
      });
      setLayout(typedTemplate);
    } else {
      toast.error('Template not found');
    }
  };
  
  // Toggle a panel between normal and maximized state
  const toggleMaximizePanel = (id: string) => {
    if (maximizedPanel === id) {
      setMaximizedPanel(null);
    } else {
      setMaximizedPanel(id);
    }
  };
  
  // Remove a panel from the dashboard
  const removePanel = (id: string) => {
    setLayout(prevLayout => prevLayout.filter(item => item.id !== id));
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
    
    if (!containerRect) return;
    
    // Determine the grid position based on the drop location
    // For a 12-column grid, each column is 1/12 of the container width
    const cellWidth = containerRect.width / 12;
    const newX = Math.floor((rect.left - containerRect.left) / cellWidth);
    
    // Keep the original Y position
    const panelIndex = layout.findIndex(item => item.id === draggedPanel.id);
    if (panelIndex === -1) return;
    
    // Only update the X position, keeping the original Y
    const newLayout = [...layout];
    newLayout[panelIndex] = {
      ...newLayout[panelIndex],
      x: Math.max(0, Math.min(newX, 12 - newLayout[panelIndex].width)), // Ensure it stays within bounds
    };
    
    // Reset the panel's style
    panel.style.position = '';
    panel.style.left = '';
    panel.style.top = '';
    panel.style.zIndex = '';
    
    setLayout(newLayout);
    setDraggedPanel(null);
  };

  // Handle adding a new panel to the dashboard
  const addPanel = (componentType: PanelComponentType) => {
    // Find available space in the layout
    // For simplicity, we'll add it to a new row at the bottom
    const lastItem = layout.reduce((prev, current) => 
      (current.y + current.height > prev.y + prev.height) ? current : prev, layout[0] || { y: 0, height: 0 });
    
    const nextY = lastItem ? lastItem.y + lastItem.height : 0;
    
    // Create unique ID
    const nextId = `${componentType}-${Date.now()}`;
    
    // Determine default width and height based on component type
    let width = 4; // Default width (4 out of 12 columns)
    let height = 4; // Default height
    
    if (componentType === 'tradingview-chart') {
      width = 8;
      height = 6;
    } else if (componentType === 'order-entry') {
      width = 4;
      height = 6;
    }
    
    const newPanel: DashboardItem = {
      id: nextId,
      x: 0, // Start at the leftmost position
      y: nextY,
      width,
      height,
      componentType,
      title: getPanelTitle(componentType)
    };
    
    setLayout([...layout, newPanel]);
    setShowAddPanel(false);
  };
  
  // Get panel title based on component type
  const getPanelTitle = (type: PanelComponentType): string => {
    switch (type) {
      case 'tradingview-chart': return 'TradingView Chart';
      case 'dex-chart': return 'DEX Chart';
      case 'order-entry': return 'Smart Trade Panel';
      case 'order-book': return 'Order Book';
      case 'market-depth': return 'Market Depth';
      case 'trading-signals': return 'Trading Signals';
      case 'position-manager': return 'Position Manager';
      case 'market-news': return 'Market News';
      case 'performance-metrics': return 'Performance Metrics';
      case 'ai-insights': return 'AI Trading Insights';
      default: return 'Panel';
    }
  };
  
  // Mouse event handlers for dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (draggedPanel) {
        e.preventDefault();
        const mouseEvent = e as unknown as React.MouseEvent;
        handlePanelDrag(mouseEvent);
      }
    };
    
    const handleMouseUp = () => {
      if (draggedPanel) {
        handlePanelDragEnd();
      }
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedPanel]);

  // Helper method to get the icon for a component type
  const getComponentIcon = (type: PanelComponentType) => {
    switch (type) {
      case 'tradingview-chart':
        return <LineChart className="h-4 w-4" />;
      case 'dex-chart':
        return <LineChartIcon className="h-4 w-4" />;
      case 'order-entry':
        return <Layers className="h-4 w-4" />;
      case 'order-book':
        return <BookOpen className="h-4 w-4" />;
      case 'market-depth':
        return <BarChart3 className="h-4 w-4" />;
      case 'trading-signals':
        return <LineChart className="h-4 w-4" />;
      case 'position-manager':
        return <Layers className="h-4 w-4" />;
      case 'market-news':
        return <Newspaper className="h-4 w-4" />;
      case 'performance-metrics':
        return <BarChart3 className="h-4 w-4" />;
      case 'ai-insights':
        return <BrainCircuit className="h-4 w-4" />;
      default:
        return <PanelLeft className="h-4 w-4" />;
    }
  };
  
  // Render the content for a specific panel
  const renderPanelContent = (item: DashboardItem) => {
    switch (item.componentType) {
      case 'tradingview-chart':
        return <TradingViewWidget symbol={selectedSymbol} />;
      
      case 'dex-chart':
        return <DexChart symbol={selectedSymbol} />;
        
      case 'order-entry':
        return <SmartTradePanel symbol={selectedSymbol} asCard={false} />;
        
      case 'market-depth':
        return (
          <div className="flex flex-col h-full">
            <div className="text-center py-4">Market Depth Placeholder</div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-slate-400 text-sm text-center">
                Market depth visualization will go here
              </div>
            </div>
          </div>
        );
        
      case 'trading-signals':
        return <TradeSignals asCard={false} />;
        
      case 'position-manager':
        return (
          <div className="flex flex-col h-full">
            <div className="text-center py-4">Position Manager Placeholder</div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-slate-400 text-sm text-center">
                Position management interface will go here
              </div>
            </div>
          </div>
        );
        
      case 'market-news':
        return (
          <div className="flex flex-col h-full">
            <div className="text-center py-4">Market News Placeholder</div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-slate-400 text-sm text-center">
                Latest market news will appear here
              </div>
            </div>
          </div>
        );
        
      case 'performance-metrics':
        return (
          <div className="flex flex-col h-full">
            <div className="text-center py-4">Performance Metrics Placeholder</div>
            <div className="flex-grow flex items-center justify-center">
              <div className="text-slate-400 text-sm text-center">
                Trading performance metrics will be displayed here
              </div>
            </div>
          </div>
        );
        
      case 'ai-insights':
        return <PersonalizedTradingInsights />;
        
      default:
        return <div>Unknown component type</div>;
    }
  };

  // Helper function to render layout with docking support
  const renderDashboardLayout = () => {
    if (maximizedPanel) {
      // Render maximized panel
      return layout.map(item => {
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
      });
    }
    
    // Sort panels by priority
    const sortedLayout = [...layout].sort((a, b) => {
      if (a.priority !== undefined && b.priority !== undefined) return a.priority - b.priority;
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      return 0;
    });
    
    // Track panels that have been rendered
    const renderedPanels = new Set<string>();
    
    return sortedLayout.map(item => {
      // Skip if this panel has already been rendered as part of a docked group
      if (renderedPanels.has(item.id)) return null;
      
      // Check if this panel can have docked panels
      const isDockablePanel = item.settings?.isDocked === true;
      
      // Find any panels that are docked to this one
      const dockedPanels = isDockablePanel 
        ? sortedLayout.filter(p => p.settings?.isDockedTo === item.id)
        : [];
      
      // Mark all panels in this group as rendered
      renderedPanels.add(item.id);
      dockedPanels.forEach(p => renderedPanels.add(p.id));
      
      // Calculate column span based on width
      const colSpan = Math.min(item.width, 12);
      
      // Determine mobile-specific styling
      const getMobileClassName = (panel: DashboardItem) => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          if (panel.mobileFullWidth) return "col-span-12";
          if (panel.mobilePosition === 'below-chart') {
            const chartPanel = layout.find(p => p.componentType === 'tradingview-chart');
            if (chartPanel) return "col-span-12 order-2";
          }
        }
        return `col-span-${Math.min(panel.width, 12)}`;
      };
      
      // Get height styling
      const getHeightStyle = (panel: DashboardItem) => {
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          if (panel.componentType === 'tradingview-chart') return { height: 600 };
          if (panel.componentType === 'order-entry') return { height: 550 };
          if (panel.componentType === 'trading-signals') return { height: 400 };
          return { height: 400 };
        }
        return { height: panel.height * 80 };
      };
      
      // If this panel has docked panels (e.g., chart with docked trade panel)
      if (isDockablePanel && dockedPanels.length > 0) {
        // Find the right-docked panel if it exists
        const rightDockedPanel = dockedPanels.find(p => p.settings?.dockedPosition === 'right');
        
        return (
          <div 
            key={`docked-group-${item.id}`}
            className={`col-span-${colSpan} relative h-full flex flex-col`}
            style={getHeightStyle(item)}
          >
            <div className="flex flex-row h-full relative">
              {/* Main panel (chart) */}
              <div 
                className={cn(
                  "flex-grow flex-shrink h-full relative",
                  "bg-slate-800 border border-slate-700 rounded-l-lg overflow-hidden",
                  item.locked && "border-l-2 border-t-2 border-b-2 border-solid border-yellow-500/50"
                )}
                style={{ minWidth: '70%' }}
              >
                <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 flex items-center justify-between px-3 py-2 border-b border-slate-700">
                  <div className="font-medium text-sm">{item.title}</div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => toggleMaximizePanel(item.id)}
                  >
                    <Maximize2 className="h-3 w-3" />
                  </Button>
                </div>
                
                <div className="pt-10 h-full w-full">
                  {renderPanelContent(item)}
                </div>
              </div>
              
              {/* Right-docked panel (trade panel) */}
              {rightDockedPanel && (
                <div 
                  id={`panel-${rightDockedPanel.id}`}
                  className={cn(
                    "h-full max-h-full border-t border-r border-b border-slate-700 bg-slate-800 rounded-r-lg overflow-hidden",
                    "transition-all duration-200 ease-in-out flex flex-col",
                    rightDockedPanel.locked && "border-r-2 border-t-2 border-b-2 border-solid border-yellow-500/50"
                  )}
                  style={{ 
                    width: `${(rightDockedPanel.width / colSpan) * 100}%`, 
                    minWidth: `${rightDockedPanel.minWidth ? rightDockedPanel.minWidth * 50 : 200}px`,
                    maxWidth: `${rightDockedPanel.maxWidth ? rightDockedPanel.maxWidth * 80 : 400}px`
                  }}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800/90">
                    <div className="font-medium text-sm">{rightDockedPanel.title}</div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => toggleMaximizePanel(rightDockedPanel.id)}
                    >
                      <Maximize2 className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="p-0 flex-grow overflow-auto">
                    {renderPanelContent(rightDockedPanel)}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      }
      
      // For regular non-docked panels, render as standard cards
      return (
        <Card
          key={item.id}
          id={`panel-${item.id}`}
          className={cn(
            getMobileClassName(item),
            "bg-slate-800 border-slate-700 overflow-hidden flex flex-col",
            editMode && !item.locked && "cursor-move border-2 border-dashed border-blue-500/50 hover:border-blue-500",
            item.locked && "border-2 border-solid border-yellow-500/50",
            editMode && item.locked && "border-yellow-500"
          )}
          style={getHeightStyle(item)}
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
    });
  };

  return (
    <div 
      className={cn("flex flex-col bg-slate-900 text-white h-full overflow-hidden", className)}
      onMouseMove={editMode ? handlePanelDrag : undefined}
      onMouseUp={editMode ? handlePanelDragEnd : undefined}
    >
      {/* Dashboard Header */}
      <div className="p-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="font-semibold text-lg">Trade Hybrid Dashboard</div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuLabel>Dashboard Settings</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setEditMode(!editMode)}>
                {editMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowTemplateSelector(true)}>
                Load Template
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <span>Dark Mode</span>
                  <Switch checked={true} />
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Template selector */}
          {showTemplateSelector && (
            <div className="absolute top-16 left-0 z-50 bg-slate-900 border border-slate-700 p-4 rounded-md shadow-xl">
              <div className="flex justify-between mb-2">
                <h3 className="font-medium">Select Template</h3>
                <Button variant="ghost" size="sm" onClick={() => setShowTemplateSelector(false)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {Object.keys(DASHBOARD_TEMPLATES).map(template => (
                  <Button 
                    key={template} 
                    variant="outline"
                    className="justify-start"
                    onClick={() => {
                      loadTemplate(template);
                      setShowTemplateSelector(false);
                    }}
                  >
                    {template.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {editMode && (
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8"
              onClick={() => setShowAddPanel(!showAddPanel)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Panel
            </Button>
          )}
          
          {editMode && (
            <Badge variant="outline" className="bg-blue-500 text-white border-blue-600">
              Edit Mode
            </Badge>
          )}
        </div>
      </div>
      
      {/* Add Panel dropdown */}
      {showAddPanel && (
        <div className="absolute top-16 right-4 z-50 bg-slate-900 border border-slate-700 p-4 rounded-md shadow-xl">
          <div className="flex justify-between mb-2">
            <h3 className="font-medium">Add Panel</h3>
            <Button variant="ghost" size="sm" onClick={() => setShowAddPanel(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-2">
            {availablePanels
              .filter(panel => !activePanels.includes(panel) || panel === 'trading-signals')  // Allow multiple signal panels
              .map(panel => (
                <Button 
                  key={panel} 
                  variant="outline"
                  className="justify-start"
                  onClick={() => addPanel(panel)}
                >
                  <span className="mr-2">{getComponentIcon(panel)}</span>
                  {getPanelTitle(panel)}
                </Button>
              ))}
          </div>
        </div>
      )}
      
      {/* Edit mode indicator */}
      {editMode && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs px-3 py-1 rounded-full flex items-center gap-1 border border-slate-700 shadow-lg z-50">
          <span>Edit Mode Active - Click and drag panels to reposition</span>
          <ArrowDown className="h-3 w-3 animate-bounce" />
        </div>
      )}
      
      {/* Dashboard Content */}
      <div className="flex-grow p-3 flex flex-col md:grid md:grid-cols-12 gap-3 relative mobile-dashboard-container">
        {renderDashboardLayout()}
      </div>
    </div>
  );
}