import { useState, useEffect } from "react";
import { useScreenShare, ScreenShareData } from "@/lib/stores/useScreenShare";
import { useMarketData } from "@/lib/stores/useMarketData";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Share2, Eye, X, ChevronUp, ChevronDown } from "lucide-react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { MarketChart } from "./market-chart";
import { cn } from "@/lib/utils";

interface ScreenShareProps {
  className?: string;
}

export function ScreenShare({ className }: ScreenShareProps) {
  const {
    activeShares,
    myActiveShare,
    isSharing,
    selectedShareId,
    startSharing,
    stopSharing,
    selectShare,
    loadShares
  } = useScreenShare();
  
  const { marketData, symbol } = useMarketData();
  const [showShareList, setShowShareList] = useState(false);
  
  // Load available shares on component mount
  useEffect(() => {
    loadShares();
    
    // Poll for new shares every 10 seconds
    const interval = setInterval(() => {
      loadShares();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [loadShares]);
  
  // Start/stop sharing functions
  const handleStartSharing = () => {
    if (!isSharing) {
      startSharing({
        userId: "current-user", // This would come from auth context in a real app
        username: "You",
        symbol,
        marketData,
        viewport: { x: 0, y: 0, width: 800, height: 600 }
      });
    }
  };
  
  // Get the currently selected share
  const selectedShare = selectedShareId 
    ? activeShares.find(share => share.id === selectedShareId) 
    : null;
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* My sharing controls */}
      <Card className="bg-background/90 backdrop-blur-sm">
        <CardHeader className="py-2">
          <CardTitle className="text-sm flex items-center justify-between">
            <span>Screen Sharing</span>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setShowShareList(!showShareList)}
            >
              {showShareList ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </CardTitle>
        </CardHeader>
        
        {showShareList && (
          <CardContent className="py-2 space-y-3">
            {/* My sharing status */}
            <div className="flex items-center justify-between">
              <div className="text-sm">
                {isSharing ? (
                  <span className="flex items-center">
                    <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                    Sharing {symbol}
                  </span>
                ) : (
                  <span className="text-muted-foreground">Not sharing</span>
                )}
              </div>
              
              <Button
                size="sm"
                variant={isSharing ? "destructive" : "outline"}
                onClick={isSharing ? stopSharing : handleStartSharing}
                className="h-8"
              >
                {isSharing ? "Stop" : "Share"} <Share2 className="ml-2" size={14} />
              </Button>
            </div>
            
            {/* Available shares list */}
            {activeShares.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium">Available Shares:</div>
                <ul className="space-y-1 max-h-32 overflow-y-auto">
                  {activeShares.map(share => (
                    <li key={share.id} className="text-sm">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={cn(
                          "w-full justify-start text-left h-8",
                          selectedShareId === share.id && "bg-accent"
                        )}
                        onClick={() => selectShare(share.id)}
                      >
                        <span className="truncate">{share.username}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          {share.symbol}
                        </span>
                        <Eye className="ml-auto" size={14} />
                      </Button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        )}
      </Card>
      
      {/* View selected share */}
      {selectedShare && (
        <Card className="relative">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 z-10 h-6 w-6"
            onClick={() => selectShare(null)}
          >
            <X size={14} />
          </Button>
          
          <CardHeader className="py-2">
            <CardTitle className="text-sm">
              {selectedShare.username}'s Chart • {selectedShare.symbol}
            </CardTitle>
          </CardHeader>
          
          <CardContent className="pb-2">
            <div className="h-[300px] w-full">
              <SharedChart shareData={selectedShare} />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Component for rendering a shared chart
function SharedChart({ shareData }: { shareData: ScreenShareData }) {
  const chartContainerRef = useState<HTMLDivElement | null>(null);
  const [chart, setChart] = useState<IChartApi | null>(null);
  
  // Initialize chart
  useEffect(() => {
    if (!chartContainerRef[0]) return;
    
    const handleResize = () => {
      chart?.applyOptions({ width: chartContainerRef[0]?.clientWidth });
    };
    
    const chart = createChart(chartContainerRef[0], {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: 'rgba(255, 255, 255, 0.7)',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      width: chartContainerRef[0].clientWidth,
      height: 300,
    });
    
    const candlestickSeries = chart.addCandlestickSeries({
      upColor: '#22c55e',
      downColor: '#ef4444',
      borderVisible: false,
      wickUpColor: '#22c55e',
      wickDownColor: '#ef4444',
    });
    
    // Map the data into the format expected by lightweight-charts
    const chartData = shareData.marketData.map(item => ({
      time: item.time,
      open: item.open,
      high: item.high,
      low: item.low,
      close: item.close,
    }));
    
    candlestickSeries.setData(chartData);
    chart.timeScale().fitContent();
    
    setChart(chart);
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      chart.remove();
    };
  }, [shareData.marketData]);
  
  return (
    <div 
      ref={el => chartContainerRef[0] = el} 
      className="w-full h-full"
    />
  );
}