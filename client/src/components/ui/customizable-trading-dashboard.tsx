import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Button } from './button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from './card';
import { Badge } from './badge';
import { motion, AnimatePresence, Variants } from 'framer-motion';
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
import { cn } from '../../lib/utils';
import { googleSheetsService, TradeSignal } from '../../lib/services/google-sheets-service';
import { Switch } from './switch';
import { Label } from './label';
import {
  Maximize2,
  Minimize2,
  X,
  Plus,
  LayoutGrid,
  LineChart,
  BarChart3,
  BookOpen,
  Layers,
  RotateCcw,
  Newspaper,
  BrainCircuit,
  Wrench,
  PanelLeft,
  Save,
  ArrowRight,
  LineChartIcon,
} from 'lucide-react';
import { SmartTradePanel } from './smart-trade-panel';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';

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

// Defined templates for the dashboard
const DASHBOARD_TEMPLATES = {
  'fixed-chart-right-panel': [
    // Large chart that takes up most of the top row (loads first)
    { 
      id: 'tradingview-chart-1', 
      x: 0, 
      y: 0, 
      width: 8, 
      height: 6, 
      componentType: 'tradingview-chart', 
      title: 'TradingView Chart',
      locked: true,
      priority: 1, // Load first
      mobileFullWidth: true, // Take full width on mobile
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
      id: 'position-manager-1',
      x: 4,
      y: 6,
      width: 4,
      height: 4,
      componentType: 'position-manager',
      title: 'Position Manager',
      priority: 4,
    },
    {
      id: 'market-news-1',
      x: 8,
      y: 6,
      width: 4,
      height: 4,
      componentType: 'market-news',
      title: 'Market News',
      priority: 5,
    },
  ],
  'multi-chart-layout': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 8, height: 5, componentType: 'tradingview-chart', title: 'TradingView Chart' },
    { id: 'dex-chart-1', x: 8, y: 0, width: 4, height: 5, componentType: 'dex-chart', title: 'DEX Chart' },
    { id: 'order-entry-1', x: 0, y: 5, width: 4, height: 5, componentType: 'order-entry', title: 'Smart Trade Panel' },
    { id: 'trading-signals-1', x: 4, y: 5, width: 4, height: 5, componentType: 'trading-signals', title: 'Trading Signals' },
    { id: 'performance-metrics-1', x: 8, y: 5, width: 4, height: 5, componentType: 'performance-metrics', title: 'Performance Metrics' },
  ],
  'ai-focused-layout': [
    { id: 'tradingview-chart-1', x: 0, y: 0, width: 8, height: 6, componentType: 'tradingview-chart', title: 'TradingView Chart' },
    { id: 'ai-insights-1', x: 8, y: 0, width: 4, height: 6, componentType: 'ai-insights', title: 'AI Trading Insights' },
    { id: 'trading-signals-1', x: 0, y: 6, width: 4, height: 4, componentType: 'trading-signals', title: 'Trading Signals' },
    { id: 'order-entry-1', x: 4, y: 6, width: 4, height: 4, componentType: 'order-entry', title: 'Smart Trade Panel' },
    { id: 'market-news-1', x: 8, y: 6, width: 4, height: 4, componentType: 'market-news', title: 'Market News' },
  ],
};

// Trading symbol options for the selector
const tradingSymbols = [
  { value: 'BTCUSDT', label: 'BTC/USDT' },
  { value: 'ETHUSDT', label: 'ETH/USDT' },
  { value: 'BNBUSDT', label: 'BNB/USDT' },
  { value: 'SOLUSDT', label: 'SOL/USDT' },
  { value: 'ADAUSDT', label: 'ADA/USDT' },
  { value: 'XRPUSDT', label: 'XRP/USDT' },
  { value: 'DOGEUSDT', label: 'DOGE/USDT' },
  { value: 'DOTUSDT', label: 'DOT/USDT' },
  { value: 'SHIBUSDT', label: 'SHIB/USDT' },
  { value: 'AVAXUSDT', label: 'AVAX/USDT' },
];

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

interface DraggedPanelState {
  id: string;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
}

interface CustomizableTradingDashboardProps {
  defaultSymbol?: string;
  className?: string;
}

// Animation variants for dashboard components
const panelVariants: Variants = {
  hidden: { 
    opacity: 0,
    y: 20,
    scale: 0.95
  },
  visible: (i: number) => ({ 
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 350,
      damping: 25,
      mass: 0.5,
      delay: i * 0.05 // Staggered delay based on priority
    }
  }),
  hover: {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    scale: 1.005,
    transition: {
      duration: 0.2
    }
  },
  tap: {
    scale: 0.98,
    transition: {
      duration: 0.1
    }
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    transition: {
      duration: 0.2
    }
  }
};

const buttonVariants: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.05,
    transition: { duration: 0.2 }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.1 }
  }
};

const contentVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: { 
    opacity: 1,
    transition: { 
      delay: 0.1,
      duration: 0.3
    }
  }
};

export function CustomizableTradingDashboard({ 
  defaultSymbol, 
  className 
}: CustomizableTradingDashboardProps) {
  // Selected dashboard template
  const [activeTemplate, setActiveTemplate] = useState('fixed-chart-right-panel');
  
  // State for all dashboard panels
  const [layout, setLayout] = useLocalStorage<DashboardItem[]>('trading-dashboard-layout', 
    // We need to cast the initial value to the correct type
    DASHBOARD_TEMPLATES['fixed-chart-right-panel'].map(item => ({
      id: item.id,
      x: item.x,
      y: item.y,
      width: item.width,
      height: item.height,
      componentType: item.componentType as PanelComponentType,
      title: item.title,
      locked: item.locked,
      priority: item.priority,
      mobileFullWidth: item.mobileFullWidth,
      minWidth: item.minWidth,
      minHeight: item.minHeight,
      maxWidth: item.maxWidth,
      maxHeight: item.maxHeight,
      mobilePosition: item.mobilePosition as 'below-chart' | 'above-chart' | 'default' | undefined,
      settings: item.settings
    }))
  );
  
  // State for the currently maximized panel (if any)
  const [maximizedPanel, setMaximizedPanel] = useState<string | null>(null);
  
  // Selected trading symbol
  const [selectedSymbol, setSelectedSymbol] = useState(defaultSymbol || tradingSymbols[0].value);
  
  // Track which panels are currently active/displayed
  const [activePanels, setActivePanels] = useState<string[]>([]);
  
  // Track the panel being dragged in edit mode
  const [draggedPanel, setDraggedPanel] = useState<DraggedPanelState | null>(null);
  
  // Edit mode toggle for rearranging the dashboard
  const [editMode, setEditMode] = useState(false);
  
  // Track panel drag start positions
  const dragStartRef = useRef<{ x: number, y: number }>({ x: 0, y: 0 });
  
  // Show/hide "Add Panel" menu
  const [showAddPanel, setShowAddPanel] = useState(false);
  
  // Effect to track which panels are currently active
  useEffect(() => {
    // Extract the component types of all active panels
    const currentPanels = layout.map(item => item.componentType);
    setActivePanels(Array.from(new Set(currentPanels))); // Use Set to get unique values, convert to array
  }, [layout]);
  
  // Load a template by name
  const loadTemplate = (templateName: string) => {
    if (DASHBOARD_TEMPLATES[templateName as keyof typeof DASHBOARD_TEMPLATES]) {
      // Cast the template to ensure it's properly typed as DashboardItem[]
      const template = DASHBOARD_TEMPLATES[templateName as keyof typeof DASHBOARD_TEMPLATES];
      const typedTemplate: DashboardItem[] = template.map(item => {
        // Create properly typed object with all required properties
        const typedItem: DashboardItem = {
          id: item.id,
          x: item.x,
          y: item.y,
          width: item.width,
          height: item.height,
          componentType: item.componentType as PanelComponentType,
          title: item.title,
          locked: item.locked,
          priority: item.priority,
          mobileFullWidth: item.mobileFullWidth,
          minWidth: item.minWidth,
          minHeight: item.minHeight,
          maxWidth: item.maxWidth,
          maxHeight: item.maxHeight,
          mobilePosition: item.mobilePosition as 'below-chart' | 'above-chart' | 'default' | undefined,
          settings: item.settings
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
  
  // Reset the layout to the default for the current template
  const resetLayout = () => {
    loadTemplate(activeTemplate);
    toast.success('Dashboard reset to default layout');
  };
  
  // Remove a panel from the dashboard
  const removePanel = (id: string) => {
    setLayout((prevLayout: DashboardItem[]) => prevLayout.filter((item: DashboardItem) => item.id !== id));
  };
  
  // Get a list of component types that aren't already displayed
  const getAvailableComponentTypes = (): PanelComponentType[] => {
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
    
    // Return all types that aren't already in the active panels, or allow duplicates for some panel types
    return allTypes.filter(type => {
      // Allow multiple charts
      if (type === 'tradingview-chart' || type === 'dex-chart') return true;
      
      // For other component types, only show if not already present
      return !activePanels.includes(type);
    });
  };
  
  // Add a new panel to the dashboard
  const addPanel = (componentType: PanelComponentType) => {
    // Find available space in the layout
    // For simplicity, we'll add it to a new row at the bottom
    const maxY = Math.max(...layout.map(item => item.y + item.height), 0);
    
    // Create unique ID
    const existingCount = layout.filter(item => item.componentType === componentType).length;
    const nextId = `${componentType}-${existingCount + 1}`;
    
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
      y: maxY, // Add it below existing content
      width,
      height,
      componentType,
      title: componentType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    };
    
    setLayout([...layout, newPanel]);
  };
  
  // Handle panel drag start (when in edit mode)
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
  
  // Helper method to get the icon for a component type
  const getComponentIcon = (type: PanelComponentType) => {
    switch (type) {
      case 'tradingview-chart':
        return <LineChart className="h-4 w-4 mr-2" />;
      case 'dex-chart':
        return <LineChartIcon className="h-4 w-4 mr-2" />;
      case 'order-entry':
        return <Layers className="h-4 w-4 mr-2" />;
      case 'order-book':
        return <BookOpen className="h-4 w-4 mr-2" />;
      case 'market-depth':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'trading-signals':
        return <LineChart className="h-4 w-4 mr-2" />;
      case 'position-manager':
        return <Layers className="h-4 w-4 mr-2" />;
      case 'market-news':
        return <Newspaper className="h-4 w-4 mr-2" />;
      case 'performance-metrics':
        return <BarChart3 className="h-4 w-4 mr-2" />;
      case 'ai-insights':
        return <BrainCircuit className="h-4 w-4 mr-2" />;
      default:
        return <PanelLeft className="h-4 w-4 mr-2" />;
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

  // Helper function to generate the sorted and docked layout
  function sortedLayout() {
    // Sort by priority to ensure correct loading order
    const sortedItems = [...layout].sort((a, b) => {
      // If both have priority, sort by it (lower number = higher priority)
      if (a.priority !== undefined && b.priority !== undefined) return a.priority - b.priority;
      // Items with priority come first
      if (a.priority !== undefined) return -1;
      if (b.priority !== undefined) return 1;
      // Otherwise, maintain original order
      return 0;
    });
    
    // Track which panels have been rendered
    const renderedPanels = new Set<string>();
    
    return sortedItems.map(item => {
      // Skip if this panel has already been rendered as part of a docked group
      if (renderedPanels.has(item.id)) return null;
      
      // Check if this is a dockable panel
      const isDockablePanel = item.settings?.isDocked === true;
      
      // Find any panels that are docked to this one
      const dockedPanels = isDockablePanel 
        ? sortedItems.filter(p => p.settings?.isDockedTo === item.id)
        : [];
      
      // Mark all panels in this group as rendered
      renderedPanels.add(item.id);
      dockedPanels.forEach(p => renderedPanels.add(p.id));
      
      // Calculate column span based on width
      const colSpan = Math.min(item.width, 12);
      
      // Handle mobile layout special positioning
      const getMobileClassName = (panel: DashboardItem) => {
        // On small screens, adjust layout based on mobile properties
        if (typeof window !== 'undefined' && window.innerWidth < 768) {
          if (panel.mobileFullWidth) {
            return "col-span-12"; // Full width on mobile
          }
          
          if (panel.mobilePosition === 'below-chart') {
            // Find the chart panel
            const chartPanel = layout.find(p => p.componentType === 'tradingview-chart');
            if (chartPanel) {
              // Position this panel to appear right below the chart
              return "col-span-12 order-2";
            }
          }
        }
        
        // Default desktop behavior
        return `col-span-${Math.min(panel.width, 12)}`;
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
              
      // Check if this is a panel with docked panels
      if (isDockablePanel && dockedPanels.length > 0) {
        // Calculate column and row span based on width and height
        const colSpan = Math.min(item.width, 12);
                
        // Process dockedPanels to find right-docked panel for primary configuration
        const rightDockedPanel = dockedPanels.find(p => p.settings?.dockedPosition === 'right');
                
        // Get the width of the right-docked panel if any
        const rightPanelWidth = rightDockedPanel ? rightDockedPanel.width : 0;
                
        // Adjust the main panel's effective width
        const mainPanelEffectiveWidth = colSpan - rightPanelWidth;
                
        return (
          <motion.div 
            key={`docked-group-${item.id}`}
            className={`col-span-${colSpan} relative h-full flex flex-col`}
            style={{ height: item.height * 80 }}
            initial="hidden"
            animate="visible"
            variants={{
              hidden: { opacity: 0 },
              visible: { 
                opacity: 1,
                transition: { 
                  staggerChildren: 0.05,
                  delay: 0.1,
                  duration: 0.4
                }
              }
            }}
          >
            <div className="flex flex-row h-full relative">
              {/* Main panel (chart) */}
              <motion.div 
                id={`panel-${item.id}`}
                className={cn(
                  "flex-grow flex-shrink h-full relative",
                  "bg-slate-800 border border-slate-700 rounded-l-lg overflow-hidden",
                  editMode && !item.locked && "cursor-move border-2 border-dashed border-blue-500/50 hover:border-blue-500",
                  item.locked && "border-l-2 border-t-2 border-b-2 border-solid border-yellow-500/50"
                )}
                style={{ minWidth: '70%' }}
                onMouseDown={e => handlePanelDragStart(e, item.id)}
                variants={panelVariants}
                custom={item.priority || 1}
                whileHover={!editMode ? "hover" : undefined}
                whileTap={!editMode ? "tap" : undefined}
                exit="exit"
                layout
              >
                <div className="absolute top-0 left-0 right-0 z-10 bg-slate-800/90 flex items-center justify-between px-3 py-2 border-b border-slate-700">
                  <div className="font-medium">{item.title}</div>
                  <div className="flex items-center gap-1">
                    <motion.button
                      variants={buttonVariants}
                      initial="initial"
                      whileHover="hover"
                      whileTap="tap"
                      onClick={() => toggleMaximizePanel(item.id)}
                      className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      <Maximize2 className="h-3 w-3" />
                    </motion.button>
                  </div>
                </div>
                <motion.div 
                  className="pt-10 h-full w-full"
                  variants={contentVariants}
                >
                  {renderPanelContent(item)}
                </motion.div>
              </motion.div>
                      
              {/* Right-docked panel (trade panel) */}
              {rightDockedPanel && (
                <motion.div 
                  id={`panel-${rightDockedPanel.id}`}
                  className={cn(
                    "h-full max-h-full border-t border-r border-b border-slate-700 bg-slate-800 rounded-r-lg overflow-hidden",
                    "flex flex-col",
                    rightDockedPanel.locked && "border-r-2 border-t-2 border-b-2 border-solid border-yellow-500/50"
                  )}
                  style={{ 
                    width: `${(rightDockedPanel.width / colSpan) * 100}%`,
                    minWidth: `${rightDockedPanel.minWidth ? rightDockedPanel.minWidth * 50 : 200}px`,
                    maxWidth: rightDockedPanel.maxWidth ? `${rightDockedPanel.maxWidth * 80}px` : undefined
                  }}
                  variants={panelVariants}
                  custom={rightDockedPanel.priority || 5}
                  whileHover={!editMode ? "hover" : undefined}
                  whileTap={!editMode ? "tap" : undefined}
                  onMouseDown={e => handlePanelDragStart(e, rightDockedPanel.id)}
                >
                  <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800">
                    <div className="font-medium text-sm">{rightDockedPanel.title}</div>
                    <div className="flex items-center">
                      <motion.button
                        variants={buttonVariants}
                        initial="initial"
                        whileHover="hover"
                        whileTap="tap"
                        onClick={() => toggleMaximizePanel(rightDockedPanel.id)}
                        className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                      >
                        <Maximize2 className="h-3 w-3" />
                      </motion.button>
                    </div>
                  </div>
                  <motion.div 
                    className="flex-grow overflow-auto"
                    variants={contentVariants}
                  >
                    {renderPanelContent(rightDockedPanel)}
                  </motion.div>
                </motion.div>
              )}
            </div>
          </motion.div>
        );
      }
              
      // Regular standalone panel rendering
      const itemColSpan = Math.min(item.width, 12);
      
      // Calculate animation custom variant props
      const customProps = item.priority || 10;  // Default to 10 if no priority set
              
      return (
        <motion.div
          key={item.id}
          id={`panel-${item.id}`}
          className={cn(
            `col-span-${itemColSpan}`,
            "bg-slate-800 border-slate-700 rounded-lg overflow-hidden flex flex-col",
            editMode && !item.locked && "cursor-move border-2 border-dashed border-blue-500/50 hover:border-blue-500",
            item.locked && "border-2 border-solid border-yellow-500/50",
            editMode && item.locked && "border-yellow-500",
          )}
          style={getHeightStyle()}
          onMouseDown={e => handlePanelDragStart(e, item.id)}
          variants={panelVariants}
          initial="hidden"
          animate="visible"
          whileHover={!editMode ? "hover" : undefined}
          whileTap={!editMode ? "tap" : undefined}
          exit="exit"
          custom={customProps}
          layout
        >
          <div className="py-2 px-3 flex flex-row items-center justify-between bg-slate-800/90 border-b border-slate-700">
            <h3 className="text-sm font-medium">{item.title}</h3>
            <div className="flex items-center gap-1">
              <motion.button
                variants={buttonVariants}
                initial="initial"
                whileHover="hover"
                whileTap="tap"
                onClick={() => toggleMaximizePanel(item.id)}
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
              >
                <Maximize2 className="h-3 w-3" />
              </motion.button>
                    
              {/* Only show remove button for non-locked panels in edit mode */}
              {editMode && !item.locked && (
                <motion.button
                  variants={buttonVariants}
                  initial="initial"
                  whileHover="hover"
                  whileTap="tap"
                  onClick={() => removePanel(item.id)}
                  className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-red-500/20 text-red-400 hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </motion.button>
              )}
            </div>
          </div>
          <motion.div 
            className="p-0 flex-grow overflow-auto"
            variants={contentVariants}
            initial="hidden"
            animate="visible"
          >
            {renderPanelContent(item)}
          </motion.div>
        </motion.div>
      );
    });
  }

  return (
    <div className={cn("w-full", className)}>
      <div className="mb-4 flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 items-center justify-between">
        {/* Template Selector */}
        <div className="flex items-center gap-2">
          <Label htmlFor="template-selector">Dashboard Template</Label>
          <Select value={activeTemplate} onValueChange={setActiveTemplate}>
            <SelectTrigger id="template-selector" className="w-[200px]">
              <SelectValue placeholder="Choose a template" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(DASHBOARD_TEMPLATES).map(templateName => (
                <SelectItem key={templateName} value={templateName}>
                  {templateName.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="secondary" size="sm" onClick={() => loadTemplate(activeTemplate)}>
            Load
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Edit Mode Toggle */}
          <div className="flex items-center gap-2">
            <Label htmlFor="edit-toggle">Edit Mode</Label>
            <Switch
              id="edit-toggle"
              checked={editMode}
              onCheckedChange={setEditMode}
            />
          </div>
          
          <Button variant="outline" size="sm" onClick={resetLayout}>
            <RotateCcw className="h-4 w-4 mr-1" />
            Reset Layout
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
      
      {/* Symbol Selector */}
      <div className="mb-4 flex items-center gap-2">
        <Label htmlFor="symbol-select">Trading Symbol</Label>
        <Select defaultValue={defaultSymbol || tradingSymbols[0].value} onValueChange={setSelectedSymbol}>
          <SelectTrigger id="symbol-select" className="w-[180px]">
            <SelectValue placeholder="Choose a symbol" />
          </SelectTrigger>
          <SelectContent>
            {tradingSymbols.map(symbol => (
              <SelectItem key={symbol.value} value={symbol.value}>
                {symbol.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      {/* Dashboard grid layout */}
      <div className={cn(
        "grid grid-cols-12 auto-rows-auto gap-4 relative", 
        editMode && "border-2 border-dashed border-blue-500/20 p-4 rounded-lg"
      )}>
        {maximizedPanel ? (
          // Show only the maximized panel
          <AnimatePresence>
            {layout.map(item => {
              if (item.id === maximizedPanel) {
                return (
                  <motion.div 
                    key={item.id}
                    className="col-span-12 bg-slate-800 rounded-lg border border-slate-700 overflow-hidden flex flex-col"
                    style={{ height: 'calc(100vh - 250px)' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ 
                      opacity: 1, 
                      scale: 1,
                      transition: {
                        type: "spring",
                        stiffness: 300,
                        damping: 25
                      }
                    }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    layoutId={`panel-${item.id}`}
                  >
                    <div className="flex items-center justify-between px-3 py-2 border-b border-slate-700 bg-slate-800">
                      <div className="font-medium">{item.title}</div>
                      <div className="flex items-center">
                        <motion.button
                          variants={buttonVariants}
                          initial="initial"
                          whileHover="hover"
                          whileTap="tap"
                          onClick={() => toggleMaximizePanel(item.id)}
                          className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                        >
                          <Minimize2 className="h-4 w-4" />
                        </motion.button>
                      </div>
                    </div>
                    <motion.div 
                      className="flex-grow overflow-auto"
                      initial={{ opacity: 0 }}
                      animate={{ 
                        opacity: 1,
                        transition: { delay: 0.1, duration: 0.3 }
                      }}
                    >
                      {renderPanelContent(item)}
                    </motion.div>
                  </motion.div>
                );
              }
              return null;
            })}
          </AnimatePresence>
        ) : (
          // Group panels by docking relationships
          sortedLayout()
        )}
      </div>
    </div>
  );
}