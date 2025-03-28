import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TradingViewToolsProps {
  height?: string | number;
  defaultTab?: 'calendar' | 'screener' | 'heatmap';
}

export function TradingViewTools({ 
  height = 400, 
  defaultTab = 'calendar' 
}: TradingViewToolsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize widgets
  useEffect(() => {
    setIsMounted(true);
    
    // On component mount, initialize widgets only if we're in the browser
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      loadTradingViewWidgets();
    }
    
    return () => {
      // Cleanup code if needed
      const scriptElements = document.querySelectorAll('script[src*="tradingview.com"]');
      scriptElements.forEach(script => script.remove());
    };
  }, []);
  
  // Handle tab changes
  useEffect(() => {
    if (isMounted && activeTab) {
      setIsLoading(true);
      
      // Give time for the DOM to update
      setTimeout(() => {
        loadTradingViewWidgets();
      }, 100);
    }
  }, [activeTab, isMounted]);
  
  // Function to load TradingView widgets based on active tab
  const loadTradingViewWidgets = () => {
    if (typeof window === 'undefined') return;
    
    // Remove existing TradingView widgets
    const existingWidgets = document.querySelectorAll('.tradingview-widget-container');
    existingWidgets.forEach(widget => widget.remove());
    
    // Load new widget based on active tab
    switch (activeTab) {
      case 'calendar':
        loadEconomicCalendar();
        break;
      case 'screener':
        loadScreener();
        break;
      case 'heatmap':
        loadHeatmap();
        break;
      default:
        break;
    }
  };
  
  // Load the Economic Calendar widget
  const loadEconomicCalendar = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-events.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "isTransparent": true,
      "width": "100%",
      "height": "100%",
      "locale": "en",
      "importanceFilter": "-1,0,1",
      "currencyFilter": "USD,EUR,JPY,GBP,CHF,AUD,CAD,NZD,CNY"
    });
    
    const container = createWidgetContainer('tv_calendar_widget');
    container.appendChild(script);
    setIsLoading(false);
  };
  
  // Load the Stock Screener widget
  const loadScreener = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-screener.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "width": "100%",
      "height": "100%",
      "defaultColumn": "overview",
      "defaultScreen": "general",
      "market": "crypto",
      "showToolbar": true,
      "colorTheme": "dark",
      "locale": "en",
      "isTransparent": true
    });
    
    const container = createWidgetContainer('tv_screener_widget');
    container.appendChild(script);
    setIsLoading(false);
  };
  
  // Load the Market Heatmap widget
  const loadHeatmap = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-crypto-coins-heatmap.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "dataSet": "Crypto",
      "blockSize": "market_cap_calc",
      "blockColor": "change",
      "locale": "en",
      "symbolUrl": "",
      "colorTheme": "dark",
      "hasTopBar": false,
      "isDataSetDisplayEnabled": false,
      "isZoomEnabled": true,
      "hasSymbolTooltip": true,
      "width": "100%",
      "height": "100%"
    });
    
    const container = createWidgetContainer('tv_heatmap_widget');
    container.appendChild(script);
    setIsLoading(false);
  };
  
  // Helper function to create/get widget container
  const createWidgetContainer = (id: string) => {
    let container = document.getElementById(id);
    
    if (!container && containerRef.current) {
      // If the container doesn't exist, create it
      const tabContent = document.getElementById(`content-${activeTab}`);
      
      container = document.createElement('div');
      container.id = id;
      container.className = 'tradingview-widget-container';
      container.style.height = '100%';
      container.style.width = '100%';
      
      if (tabContent) {
        tabContent.innerHTML = '';
        tabContent.appendChild(container);
      } else if (containerRef.current) {
        // Fallback if we can't find the specific tab content
        containerRef.current.appendChild(container);
      }
    }
    
    return container!;
  };
  
  const handleRefresh = () => {
    setIsLoading(true);
    loadTradingViewWidgets();
  };
  
  const containerHeight = typeof height === 'number' ? `${height}px` : height;
  
  return (
    <div ref={containerRef} className="w-full">
      <Tabs 
        value={activeTab} 
        onValueChange={(value) => setActiveTab(value as any)}
        className="w-full"
      >
        <div className="flex justify-between items-center mb-2">
          <TabsList className="grid w-[400px] grid-cols-3">
            <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
            <TabsTrigger value="screener">Crypto Screener</TabsTrigger>
            <TabsTrigger value="heatmap">Market Heatmap</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="border border-slate-800 bg-slate-900/80 rounded-md overflow-hidden" style={{ height: containerHeight }}>
          <TabsContent value="calendar" id="content-calendar" className="h-full m-0">
            {isLoading && activeTab === 'calendar' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading economic calendar...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="screener" id="content-screener" className="h-full m-0">
            {isLoading && activeTab === 'screener' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading crypto screener...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="heatmap" id="content-heatmap" className="h-full m-0">
            {isLoading && activeTab === 'heatmap' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading market heatmap...</p>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}