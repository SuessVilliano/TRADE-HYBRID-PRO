import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./card";
import { Button } from "./button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { BarChart2, LineChart, CandlestickChart, TrendingUp, PieChart, Activity, ChevronDown, Maximize2, X } from "lucide-react";
import TradingViewWidget from "./TradingViewWidget";
import { cn } from "@/lib/utils";

interface TradingViewToolsProps {
  className?: string;
  onClose?: () => void;
}

export function TradingViewTools({ className, onClose }: TradingViewToolsProps) {
  const [activeWidget, setActiveWidget] = useState<string>("chart");
  const [symbol, setSymbol] = useState<string>("BTCUSD");
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [chartType, setChartType] = useState<string>("1"); // 1 = bars, 2 = candles, 3 = line

  // Generate a unique container ID for each widget to prevent conflicts
  const widgetIds = {
    chart: "tradingview_chart_widget",
    marketOverview: "tradingview_market_overview_widget",
    techAnalysis: "tradingview_tech_analysis_widget",
    economicCalendar: "tradingview_economic_calendar_widget",
    fundamentalData: "tradingview_fundamental_data_widget"
  };

  const symbolOptions = [
    { value: "BTCUSD", label: "BTC/USD" },
    { value: "ETHUSD", label: "ETH/USD" },
    { value: "NASDAQ:AAPL", label: "Apple" },
    { value: "NASDAQ:MSFT", label: "Microsoft" },
    { value: "NYSE:GME", label: "GameStop" },
    { value: "FX:EURUSD", label: "EUR/USD" }
  ];

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <Card className={cn(
      "bg-background/90 backdrop-blur-sm", 
      isFullscreen ? "fixed inset-4 z-50 flex flex-col" : "",
      className
    )}>
      <CardHeader className="py-3 border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <BarChart2 className="h-4 w-4 mr-2 text-muted-foreground" />
            <span>TradingView Tools</span>
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={handleFullscreenToggle}
            >
              <Maximize2 size={14} />
            </Button>
            {onClose && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={onClose}
              >
                <X size={14} />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className={cn(
        "py-4 space-y-4",
        isFullscreen ? "flex-1 overflow-auto" : ""
      )}>
        {/* Widget Navigation */}
        <Tabs defaultValue="chart" value={activeWidget} onValueChange={setActiveWidget}>
          <TabsList className="w-full grid grid-cols-5">
            <TabsTrigger value="chart" className="text-xs">Chart</TabsTrigger>
            <TabsTrigger value="marketOverview" className="text-xs">Markets</TabsTrigger>
            <TabsTrigger value="techAnalysis" className="text-xs">Analysis</TabsTrigger>
            <TabsTrigger value="economicCalendar" className="text-xs">Calendar</TabsTrigger>
            <TabsTrigger value="fundamentalData" className="text-xs">Fundamentals</TabsTrigger>
          </TabsList>
          
          {/* Chart Widget */}
          <TabsContent value="chart" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <select 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  {symbolOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex border rounded-md overflow-hidden">
                <Button 
                  size="sm" 
                  variant={chartType === "1" ? "default" : "ghost"}
                  className="h-7 px-2 rounded-none"
                  onClick={() => setChartType("1")}
                >
                  <BarChart2 size={14} />
                </Button>
                <Button 
                  size="sm" 
                  variant={chartType === "2" ? "default" : "ghost"}
                  className="h-7 px-2 rounded-none"
                  onClick={() => setChartType("2")}
                >
                  <CandlestickChart size={14} />
                </Button>
                <Button 
                  size="sm" 
                  variant={chartType === "3" ? "default" : "ghost"}
                  className="h-7 px-2 rounded-none"
                  onClick={() => setChartType("3")}
                >
                  <LineChart size={14} />
                </Button>
              </div>
            </div>

            <div className={cn(
              "border rounded-md overflow-hidden",
              isFullscreen ? "h-[calc(100vh-220px)]" : "h-[300px]"
            )}>
              <TradingViewWidget 
                symbol={symbol}
                theme="dark"
                container_id={widgetIds.chart}
                height="100%"
                width="100%"
                interval="D"
                style={chartType}
                allow_symbol_change={true}
              />
            </div>
          </TabsContent>
          
          {/* Market Overview Widget */}
          <TabsContent value="marketOverview" className="space-y-3">
            <div className={cn(
              "border rounded-md overflow-hidden",
              isFullscreen ? "h-[calc(100vh-180px)]" : "h-[300px]"
            )}>
              <div className="tradingview-widget-container" id={widgetIds.marketOverview} style={{ height: "100%", width: "100%" }}>
                <iframe 
                  style={{ width: "100%", height: "100%" }}
                  src={`https://s.tradingview.com/embed-widget/market-overview/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22dateRange%22%3A%2212M%22%2C%22showChart%22%3Atrue%2C%22largeChartUrl%22%3A%22%22%2C%22isTransparent%22%3Afalse%2C%22showSymbolLogo%22%3Atrue%2C%22showFloatingTooltip%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22plotLineColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22plotLineColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%201)%22%2C%22gridLineColor%22%3A%22rgba(240%2C%20243%2C%20250%2C%200.06)%22%2C%22scaleFontColor%22%3A%22rgba(120%2C%20123%2C%20134%2C%201)%22%2C%22belowLineFillColorGrowing%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorFalling%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22belowLineFillColorGrowingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22belowLineFillColorFallingBottom%22%3A%22rgba(41%2C%2098%2C%20255%2C%200)%22%2C%22symbolActiveColor%22%3A%22rgba(41%2C%2098%2C%20255%2C%200.12)%22%2C%22tabs%22%3A%5B%7B%22title%22%3A%22Indices%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FOREXCOM%3ASPXUSD%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ANASDUSD%22%2C%22d%22%3A%22Nasdaq%20100%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3ADJI%22%2C%22d%22%3A%22Dow%2030%22%7D%2C%7B%22s%22%3A%22INDEX%3ANK225%22%2C%22d%22%3A%22Nikkei%20225%22%7D%2C%7B%22s%22%3A%22INDEX%3ADEU40%22%2C%22d%22%3A%22DAX%20Index%22%7D%2C%7B%22s%22%3A%22FOREXCOM%3AUKXGBP%22%2C%22d%22%3A%22UK%20100%22%7D%5D%2C%22originalTitle%22%3A%22Indices%22%7D%2C%7B%22title%22%3A%22Commodities%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CME_MINI%3AES1!%22%2C%22d%22%3A%22S%26P%20500%22%7D%2C%7B%22s%22%3A%22CME%3A6E1!%22%2C%22d%22%3A%22Euro%22%7D%2C%7B%22s%22%3A%22COMEX%3AGC1!%22%2C%22d%22%3A%22Gold%22%7D%2C%7B%22s%22%3A%22NYMEX%3ACL1!%22%2C%22d%22%3A%22Crude%20Oil%22%7D%2C%7B%22s%22%3A%22NYMEX%3ANG1!%22%2C%22d%22%3A%22Natural%20Gas%22%7D%2C%7B%22s%22%3A%22CBOT%3AZC1!%22%2C%22d%22%3A%22Corn%22%7D%5D%2C%22originalTitle%22%3A%22Commodities%22%7D%2C%7B%22title%22%3A%22Bonds%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22CME%3AGE1!%22%2C%22d%22%3A%22Eurodollar%22%7D%2C%7B%22s%22%3A%22CBOT%3AZB1!%22%2C%22d%22%3A%22T-Bond%22%7D%2C%7B%22s%22%3A%22CBOT%3AUB1!%22%2C%22d%22%3A%22Ultra%20T-Bond%22%7D%2C%7B%22s%22%3A%22EUREX%3AFGBL1!%22%2C%22d%22%3A%22Euro%20Bund%22%7D%2C%7B%22s%22%3A%22EUREX%3AFBTP1!%22%2C%22d%22%3A%22Euro%20BTP%22%7D%2C%7B%22s%22%3A%22EUREX%3AFGBM1!%22%2C%22d%22%3A%22Euro%20BOBL%22%7D%5D%2C%22originalTitle%22%3A%22Bonds%22%7D%2C%7B%22title%22%3A%22Forex%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22FX%3AEURUSD%22%2C%22d%22%3A%22EUR%2FUSD%22%7D%2C%7B%22s%22%3A%22FX%3AGBPUSD%22%2C%22d%22%3A%22GBP%2FUSD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDJPY%22%2C%22d%22%3A%22USD%2FJPY%22%7D%2C%7B%22s%22%3A%22FX%3AUSDCHF%22%2C%22d%22%3A%22USD%2FCHF%22%7D%2C%7B%22s%22%3A%22FX%3AAUDUSD%22%2C%22d%22%3A%22AUD%2FUSD%22%7D%2C%7B%22s%22%3A%22FX%3AUSDCAD%22%2C%22d%22%3A%22USD%2FCAD%22%7D%5D%2C%22originalTitle%22%3A%22Forex%22%7D%2C%7B%22title%22%3A%22Crypto%22%2C%22symbols%22%3A%5B%7B%22s%22%3A%22BINANCE%3ABTCUSDT%22%2C%22d%22%3A%22BTC%2FUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3AETHUSDT%22%2C%22d%22%3A%22ETH%2FUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3ASOLUSDT%22%2C%22d%22%3A%22SOL%2FUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3AAVAXUSDT%22%2C%22d%22%3A%22AVAX%2FUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3AMATICUSDT%22%2C%22d%22%3A%22MATIC%2FUSDT%22%7D%2C%7B%22s%22%3A%22BINANCE%3ADOTUSDT%22%2C%22d%22%3A%22DOT%2FUSDT%22%7D%5D%7D%5D%7D`} 
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          </TabsContent>
          
          {/* Technical Analysis Widget */}
          <TabsContent value="techAnalysis" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <select 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  {symbolOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={cn(
              "border rounded-md overflow-hidden",
              isFullscreen ? "h-[calc(100vh-180px)]" : "h-[300px]"
            )}>
              <div className="tradingview-widget-container" id={widgetIds.techAnalysis} style={{ height: "100%", width: "100%" }}>
                <iframe 
                  style={{ width: "100%", height: "100%" }}
                  src={`https://s.tradingview.com/embed-widget/technical-analysis/?locale=en#%7B%22interval%22%3A%221D%22%2C%22width%22%3A%22100%25%22%2C%22isTransparent%22%3Afalse%2C%22height%22%3A%22100%25%22%2C%22symbol%22%3A%22${symbol}%22%2C%22showIntervalTabs%22%3Atrue%2C%22colorTheme%22%3A%22dark%22%2C%22utm_source%22%3A%22tradehybrid.co%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22technical-analysis%22%7D`} 
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          </TabsContent>
          
          {/* Economic Calendar Widget */}
          <TabsContent value="economicCalendar" className="space-y-3">
            <div className={cn(
              "border rounded-md overflow-hidden",
              isFullscreen ? "h-[calc(100vh-180px)]" : "h-[300px]"
            )}>
              <div className="tradingview-widget-container" id={widgetIds.economicCalendar} style={{ height: "100%", width: "100%" }}>
                <iframe 
                  style={{ width: "100%", height: "100%" }}
                  src="https://s.tradingview.com/embed-widget/events/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22importance%22%3A%22any%22%2C%22utm_source%22%3A%22tradehybrid.co%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22events%22%7D" 
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          </TabsContent>
          
          {/* Fundamental Data Widget */}
          <TabsContent value="fundamentalData" className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="flex-1">
                <select 
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  className="w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                >
                  {symbolOptions.filter(o => !o.value.includes("FX:") && !o.value.includes("USD")).map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={cn(
              "border rounded-md overflow-hidden",
              isFullscreen ? "h-[calc(100vh-180px)]" : "h-[300px]"
            )}>
              <div className="tradingview-widget-container" id={widgetIds.fundamentalData} style={{ height: "100%", width: "100%" }}>
                <iframe 
                  style={{ width: "100%", height: "100%" }}
                  src={`https://s.tradingview.com/embed-widget/financials/?locale=en#%7B%22colorTheme%22%3A%22dark%22%2C%22isTransparent%22%3Afalse%2C%22largeChartUrl%22%3A%22%22%2C%22displayMode%22%3A%22regular%22%2C%22width%22%3A%22100%25%22%2C%22height%22%3A%22100%25%22%2C%22symbol%22%3A%22${symbol}%22%2C%22utm_source%22%3A%22tradehybrid.co%22%2C%22utm_medium%22%3A%22widget%22%2C%22utm_campaign%22%3A%22financials%22%7D`} 
                  frameBorder="0"
                ></iframe>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}