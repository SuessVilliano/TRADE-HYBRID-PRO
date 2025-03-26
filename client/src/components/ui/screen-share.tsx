import { useState, useEffect, useRef } from "react";
import { useScreenShare, ScreenShareData } from "@/lib/stores/useScreenShare";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useTrader } from "@/lib/stores/useTrader";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Share2, Eye, X, ChevronUp, ChevronDown, Copy, Users, CheckCircle2, ExternalLink, Coins } from "lucide-react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { MarketChart } from "./market-chart";
import TradingViewWidget from "./TradingViewWidget";
import { cn, formatCurrency } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Badge } from "./badge";
import { toast } from "sonner";

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
  
  const { marketData, symbol, currentPrice } = useMarketData();
  const { placeTrade } = useTrader();
  const { clientId, sendChatMessage } = useMultiplayer();
  const [showShareList, setShowShareList] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'view'>('share');
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Load available shares on component mount
  useEffect(() => {
    loadShares();
    
    // Poll for new shares every 10 seconds
    const interval = setInterval(() => {
      loadShares();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [loadShares]);
  
  // Function to simulate a screen capture
  const captureScreen = () => {
    setIsCapturing(true);
    
    // Simulate screen capture delay
    setTimeout(() => {
      startSharing({
        userId: clientId || 'current-user',
        username: 'You',
        symbol: selectedSymbol,
        marketData: [...marketData],
        viewport: {
          x: 0,
          y: 0,
          width: chartRef.current?.clientWidth || 800,
          height: chartRef.current?.clientHeight || 600
        }
      });
      
      setIsCapturing(false);
      
      // Notify others in chat
      sendChatMessage(`I've shared my ${selectedSymbol} chart. Check it out!`, 'global');
      
      toast("Chart Shared", {
        description: "Your trading chart has been shared with other traders"
      });
    }, 1000);
  };
  
  // Start/stop sharing functions
  const handleStartSharing = () => {
    if (isSharing) {
      stopSharing();
      toast("Sharing Stopped", {
        description: "Your chart is no longer being shared"
      });
    } else {
      captureScreen();
    }
  };
  
  // Get the currently selected share
  const selectedShare = selectedShareId 
    ? activeShares.find(share => share.id === selectedShareId) 
    : null;
  
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-background/90 backdrop-blur-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Trading View & Screen Sharing</span>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'share' | 'view')} className="hidden md:block">
              <TabsList className="h-8">
                <TabsTrigger value="share" className="text-xs px-3 py-1">My Chart</TabsTrigger>
                <TabsTrigger value="view" className="text-xs px-3 py-1">
                  Shared Charts
                  {activeShares.length > 0 && (
                    <Badge variant="secondary" className="ml-1.5 h-4 min-w-4 text-[10px]">{activeShares.length}</Badge>
                  )}
                </TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setActiveTab(activeTab === 'share' ? 'view' : 'share')}
              >
                {activeTab === 'share' ? <Users size={14} /> : <Share2 size={14} />}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="py-2 space-y-3">
          {activeTab === 'share' ? (
            <div className="space-y-4">
              {/* My Trading Chart */}
              <div ref={chartRef} className="w-full h-[300px] border rounded-md overflow-hidden relative">
                <TradingViewWidget 
                  symbol={selectedSymbol}
                  theme="dark"
                  container_id="my_tradingview_chart"
                />
                
                {isCapturing && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto mb-2"></div>
                      <p className="text-sm">Capturing chart...</p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2">
                <div className="flex space-x-2 flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSymbol("NASDAQ:AAPL")}
                    className={cn(
                      "text-xs h-8",
                      selectedSymbol === "NASDAQ:AAPL" && "border-primary"
                    )}
                  >
                    AAPL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSymbol("BINANCE:BTCUSDT")}
                    className={cn(
                      "text-xs h-8",
                      selectedSymbol === "BINANCE:BTCUSDT" && "border-primary"
                    )}
                  >
                    BTC
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedSymbol("FX:EURUSD")}
                    className={cn(
                      "text-xs h-8",
                      selectedSymbol === "FX:EURUSD" && "border-primary"
                    )}
                  >
                    EUR/USD
                  </Button>
                </div>
                
                <Button
                  size="sm"
                  variant={isSharing ? "destructive" : "outline"}
                  onClick={handleStartSharing}
                  disabled={isCapturing}
                  className="h-8"
                >
                  {isSharing ? (
                    <>
                      <span className="inline-block w-2 h-2 rounded-full bg-red-500 mr-2 animate-pulse"></span>
                      Stop Sharing
                    </>
                  ) : (
                    <>Share <Share2 className="ml-2" size={14} /></>
                  )}
                </Button>
              </div>
              
              {isSharing && (
                <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded-md">
                  <span className="font-medium">Currently Sharing:</span> Your {selectedSymbol} chart is being shared with other traders in the metaverse
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {/* Available shares list */}
              {activeShares.length === 0 ? (
                <div className="py-8 text-center">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                  <p className="text-muted-foreground text-sm">No traders are sharing their charts right now</p>
                  <p className="text-xs text-muted-foreground mt-2">When other traders share their charts, they'll appear here</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-sm font-medium">Available Shared Charts:</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {activeShares.map(share => (
                      <div 
                        key={share.id}
                        onClick={() => selectShare(share.id)}
                        className={cn(
                          "relative cursor-pointer rounded-lg border p-2 transition-all duration-200",
                          selectedShareId === share.id
                            ? "border-primary bg-primary/10 shadow-md"
                            : "border-border hover:border-primary hover:shadow-sm"
                        )}
                      >
                        <div className="flex items-center">
                          <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center",
                            share.userId === clientId
                              ? "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
                              : "bg-primary/10"
                          )}>
                            <Users className="h-4 w-4" />
                          </div>
                          <div className="ml-2">
                            <p className="text-sm font-medium">{share.username} {share.userId === clientId && "(You)"}</p>
                            <div className="flex items-center">
                              <span className="text-xs text-muted-foreground">{share.symbol}</span>
                              <span className="text-xs bg-muted/50 px-1.5 py-0.5 rounded ml-2">{new Date(share.timestamp).toLocaleTimeString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          {/* View selected share */}
          {selectedShare && (
            <Card className="mt-4 border">
              <CardHeader className="py-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm flex items-center">
                  <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                  {selectedShare.username}'s Chart • {selectedShare.symbol}
                </CardTitle>
                <div className="flex space-x-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => window.open(`https://www.tradingview.com/chart/?symbol=${selectedShare.symbol}`, '_blank')}
                  >
                    <ExternalLink className="h-3 w-3 mr-1" />
                    Open
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => selectShare(null)}
                  >
                    <X size={14} />
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="pb-2">
                <div className="w-full">
                  <SharedChart shareData={selectedShare} />
                </div>
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Define interface for copy trades
interface CopyTrade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  price: number;
  copied: {
    from: string;
    userId: string;
    at: Date;
  };
}

// Component for rendering a shared chart
function SharedChart({ shareData }: { shareData: ScreenShareData }) {
  const { placeTrade } = useTrader();
  const { clientId, sendChatMessage } = useMultiplayer();
  const { currentPrice } = useMarketData();
  const [quantity, setQuantity] = useState("1");
  const [copyTrades, setCopyTrades] = useState<CopyTrade[]>([]);
  const [copyingTrade, setCopyingTrade] = useState(false);
  
  // Handle copy trade functionality
  const handleCopyTrade = async (operation: 'buy' | 'sell') => {
    // Don't copy your own trades
    if (shareData.userId === clientId) {
      toast("Can't copy own trade", {
        description: "You can't copy your own trades"
      });
      return;
    }
    
    setCopyingTrade(true);
    
    try {
      // Create a copy trade record
      const tradeId = `copy-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newTrade: CopyTrade = {
        id: tradeId,
        symbol: shareData.symbol,
        side: operation,
        quantity: Number(quantity),
        price: currentPrice,
        copied: {
          from: shareData.username,
          userId: shareData.userId,
          at: new Date()
        }
      };
      
      // Execute the trade
      await placeTrade({
        symbol: shareData.symbol,
        side: operation,
        quantity: Number(quantity),
        type: 'market'
      });
      
      // Add to copy trades list
      setCopyTrades(prev => [newTrade, ...prev]);
      
      // Notify the trader being copied through chat
      sendChatMessage(`I just copied your ${operation.toUpperCase()} trade for ${quantity} ${shareData.symbol}!`, 'private', shareData.userId);
      
      toast(operation === 'buy' ? "Buy Order Copied" : "Sell Order Copied", {
        description: `Successfully copied ${shareData.username}'s ${shareData.symbol} trade`
      });
    } catch (error) {
      console.error("Failed to copy trade:", error);
      toast("Trade Copy Failed", {
        description: "There was an error copying this trade",
      });
    } finally {
      setCopyingTrade(false);
    }
  };
  
  return (
    <div className="space-y-4">
      {/* Chart using TradingView */}
      <div className="h-[300px] w-full rounded-md overflow-hidden border">
        <TradingViewWidget 
          symbol={shareData.symbol}
          theme="dark" 
          height="100%"
          container_id={`tv_shared_${shareData.id}`}
          enable_publishing={false}
          allow_symbol_change={false}
        />
      </div>
      
      {/* Copy Trading Controls */}
      {shareData.userId !== clientId && (
        <div className="mt-4 border-t pt-4">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium flex items-center">
              <Copy size={14} className="mr-1" />
              Copy Trading
            </h4>
            <span className="text-xs text-muted-foreground">
              Current price: {formatCurrency(currentPrice)}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-1/4">
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                min="0.01"
                step="0.01"
                className="w-full rounded-md border border-input bg-background px-2 py-1.5 text-sm"
                placeholder="Qty"
              />
            </div>
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700"
              onClick={() => handleCopyTrade('buy')}
              disabled={copyingTrade}
            >
              <Coins className="h-3.5 w-3.5 mr-1" />
              Copy Buy
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => handleCopyTrade('sell')}
              disabled={copyingTrade}
            >
              <Coins className="h-3.5 w-3.5 mr-1" />
              Copy Sell
            </Button>
          </div>
        </div>
      )}
      
      {/* Recent Copied Trades */}
      {copyTrades.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h5 className="text-xs font-medium mb-2">Recent Copy Trades</h5>
          <div className="space-y-2 max-h-[100px] overflow-y-auto">
            {copyTrades.map((trade) => (
              <div key={trade.id} className="text-xs border rounded-md p-2 flex justify-between">
                <div>
                  <span className={`font-medium ${trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {trade.side.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground"> {trade.quantity} {trade.symbol} </span>
                  <span className="text-muted-foreground">@ {formatCurrency(trade.price)}</span>
                </div>
                <div className="text-muted-foreground">
                  From {trade.copied.from} • {trade.copied.at.toLocaleTimeString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Trading Data Summary */}
      <div className="grid grid-cols-3 gap-2 text-center mt-2">
        <div className="rounded bg-muted/20 p-1">
          <span className="text-xs text-muted-foreground block">Open</span>
          <span className="text-sm font-medium">{formatCurrency(shareData.marketData[0]?.open || 0)}</span>
        </div>
        <div className="rounded bg-muted/20 p-1">
          <span className="text-xs text-muted-foreground block">High</span>
          <span className="text-sm font-medium">{formatCurrency(Math.max(...shareData.marketData.map(d => d.high)))}</span>
        </div>
        <div className="rounded bg-muted/20 p-1">
          <span className="text-xs text-muted-foreground block">Low</span>
          <span className="text-sm font-medium">{formatCurrency(Math.min(...shareData.marketData.map(d => d.low)))}</span>
        </div>
      </div>
    </div>
  );
}