import { useEffect, useRef, useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface TradingViewWidgetPanelProps {
  height?: string | number;
  defaultTab?: 'calendar' | 'screener' | 'heatmap' | 'ticker' | 'technicals' | 'markets';
}

export function TradingViewWidgetPanel({ 
  height = 400, 
  defaultTab = 'calendar' 
}: TradingViewWidgetPanelProps) {
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
      case 'ticker':
        loadTickerWidget();
        break;
      case 'technicals':
        loadTechnicalAnalysis();
        break;
      case 'markets':
        loadMarketData();
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

  // Load the Ticker Widget
  const loadTickerWidget = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-tickers.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "symbols": [
        {
          "proName": "FOREXCOM:SPXUSD",
          "title": "S&P 500"
        },
        {
          "proName": "FOREXCOM:NSXUSD",
          "title": "Nasdaq 100"
        },
        {
          "proName": "FX_IDC:EURUSD",
          "title": "EUR/USD"
        },
        {
          "proName": "BITSTAMP:BTCUSD",
          "title": "Bitcoin"
        },
        {
          "proName": "BITSTAMP:ETHUSD",
          "title": "Ethereum"
        },
        {
          "description": "DXY",
          "proName": "INDEX:DXY"
        },
        {
          "description": "Gold",
          "proName": "OANDA:XAUUSD"
        },
        {
          "description": "Crude Oil",
          "proName": "NYMEX:CL1!"
        }
      ],
      "colorTheme": "dark",
      "isTransparent": true,
      "showSymbolLogo": true,
      "locale": "en",
      "width": "100%",
      "height": "100%"
    });
    
    const container = createWidgetContainer('tv_ticker_widget');
    container.appendChild(script);
    setIsLoading(false);
  };

  // Load Technical Analysis widget
  const loadTechnicalAnalysis = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-technical-analysis.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "interval": "1D",
      "width": "100%",
      "isTransparent": true,
      "height": "100%",
      "symbol": "BITSTAMP:BTCUSD",
      "showIntervalTabs": true,
      "locale": "en",
      "colorTheme": "dark"
    });
    
    const container = createWidgetContainer('tv_technical_widget');
    container.appendChild(script);
    setIsLoading(false);
  };

  // Load Market Data widget
  const loadMarketData = () => {
    const script = document.createElement('script');
    script.src = 'https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js';
    script.async = true;
    script.innerHTML = JSON.stringify({
      "colorTheme": "dark",
      "dateRange": "12M",
      "showChart": true,
      "locale": "en",
      "width": "100%",
      "height": "100%",
      "largeChartUrl": "",
      "isTransparent": true,
      "showSymbolLogo": true,
      "showFloatingTooltip": false,
      "plotLineColorGrowing": "rgba(41, 98, 255, 1)",
      "plotLineColorFalling": "rgba(41, 98, 255, 1)",
      "gridLineColor": "rgba(42, 46, 57, 0)",
      "scaleFontColor": "rgba(120, 123, 134, 1)",
      "belowLineFillColorGrowing": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorFalling": "rgba(41, 98, 255, 0.12)",
      "belowLineFillColorGrowingBottom": "rgba(41, 98, 255, 0)",
      "belowLineFillColorFallingBottom": "rgba(41, 98, 255, 0)",
      "symbolActiveColor": "rgba(41, 98, 255, 0.12)",
      "tabs": [
        {
          "title": "Indices",
          "symbols": [
            {
              "s": "FOREXCOM:SPXUSD",
              "d": "S&P 500"
            },
            {
              "s": "FOREXCOM:NSXUSD",
              "d": "US 100"
            },
            {
              "s": "FOREXCOM:DJI",
              "d": "Dow 30"
            },
            {
              "s": "INDEX:NKY",
              "d": "Nikkei 225"
            },
            {
              "s": "INDEX:DEU40",
              "d": "DAX Index"
            },
            {
              "s": "FOREXCOM:UKXGBP",
              "d": "UK 100"
            }
          ],
          "originalTitle": "Indices"
        },
        {
          "title": "Futures",
          "symbols": [
            {
              "s": "CME_MINI:ES1!",
              "d": "S&P 500"
            },
            {
              "s": "CME:6E1!",
              "d": "Euro"
            },
            {
              "s": "COMEX:GC1!",
              "d": "Gold"
            },
            {
              "s": "NYMEX:CL1!",
              "d": "Crude Oil"
            },
            {
              "s": "NYMEX:NG1!",
              "d": "Natural Gas"
            },
            {
              "s": "CBOT:ZC1!",
              "d": "Corn"
            }
          ],
          "originalTitle": "Futures"
        },
        {
          "title": "Crypto",
          "symbols": [
            {
              "s": "BITSTAMP:BTCUSD",
              "d": "Bitcoin"
            },
            {
              "s": "BITSTAMP:ETHUSD",
              "d": "Ethereum"
            },
            {
              "s": "BINANCE:BNBUSDT",
              "d": "Binance Coin"
            },
            {
              "s": "BINANCE:SOLUSDT",
              "d": "Solana"
            },
            {
              "s": "BINANCE:DOGEUSDT",
              "d": "Dogecoin"
            },
            {
              "s": "BINANCE:XRPUSDT",
              "d": "Ripple"
            }
          ],
          "originalTitle": "Crypto"
        }
      ]
    });
    
    const container = createWidgetContainer('tv_market_widget');
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
          <TabsList className="grid grid-cols-6 w-full">
            <TabsTrigger value="calendar">Economic Calendar</TabsTrigger>
            <TabsTrigger value="screener">Screener</TabsTrigger>
            <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
            <TabsTrigger value="ticker">Ticker</TabsTrigger>
            <TabsTrigger value="technicals">Technicals</TabsTrigger>
            <TabsTrigger value="markets">Markets</TabsTrigger>
          </TabsList>
          
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleRefresh}
            className="h-8 w-8 ml-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </div>
        
        <div className="border border-border rounded-md overflow-hidden bg-background/50" style={{ height: containerHeight }}>
          <TabsContent value="calendar" id="content-calendar" className="h-full m-0">
            {isLoading && activeTab === 'calendar' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading economic calendar...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="screener" id="content-screener" className="h-full m-0">
            {isLoading && activeTab === 'screener' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading screener...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="heatmap" id="content-heatmap" className="h-full m-0">
            {isLoading && activeTab === 'heatmap' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading market heatmap...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="ticker" id="content-ticker" className="h-full m-0">
            {isLoading && activeTab === 'ticker' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading ticker widget...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="technicals" id="content-technicals" className="h-full m-0">
            {isLoading && activeTab === 'technicals' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading technical analysis...</p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="markets" id="content-markets" className="h-full m-0">
            {isLoading && activeTab === 'markets' && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-muted-foreground">Loading market data...</p>
                </div>
              </div>
            )}
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}

export default TradingViewWidgetPanel;