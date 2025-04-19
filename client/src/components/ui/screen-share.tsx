import { useState, useEffect, useRef, useMemo } from "react";
import { useScreenShare, ScreenShareData } from "@/lib/stores/useScreenShare";
import { useMarketData } from "@/lib/stores/useMarketData";
import { useTrader } from "@/lib/stores/useTrader";
import { useMultiplayer } from "@/lib/stores/useMultiplayer";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { Button } from "./button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Share2, Eye, X, ChevronUp, ChevronDown, Copy, Users, CheckCircle2, ExternalLink, Coins, AlertTriangle, RefreshCw } from "lucide-react";
import { createChart, ColorType, IChartApi } from "lightweight-charts";
import { MarketChart } from "./market-chart";
import TradingViewWidget from "./TradingViewWidget";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/formatters";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { Badge } from "./badge";
import { toast } from "sonner";
import { Dialog, DialogTitle, DialogContent, DialogHeader, DialogFooter, DialogDescription } from "./dialog";

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
  const isMobile = useIsMobile();
  const [showShareList, setShowShareList] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState<'share' | 'view'>('share');
  const [isComponentMounted, setIsComponentMounted] = useState(false);
  const chartRef = useRef<HTMLDivElement>(null);
  
  // Only load heavy components after mount to improve initial render
  useEffect(() => {
    // Small delay for better perceived performance
    const timer = setTimeout(() => {
      setIsComponentMounted(true);
    }, 300);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Create unique container IDs for TradingView widgets
  // This prevents flickering by ensuring each widget has a unique ID
  const myChartId = useMemo(() => `my_chart_${Math.random().toString(36).substring(2, 9)}`, []);
  
  // Load available shares on component mount
  useEffect(() => {
    loadShares();
    
    // Poll for new shares every 10 seconds
    const interval = setInterval(() => {
      loadShares();
    }, 10000);
    
    return () => clearInterval(interval);
  }, [loadShares]);
  
  // Function to simulate a screen capture with improved error handling
  const captureScreen = () => {
    try {
      // Validate that the chart element exists before proceeding
      if (!chartRef.current) {
        console.error("Chart reference doesn't exist");
        toast("Error", {
          description: "Cannot share chart. Please try again later."
        });
        return;
      }

      setIsCapturing(true);
      
      // Use a safer method to get dimensions with fallbacks
      const chartWidth = chartRef.current?.clientWidth || 800;
      const chartHeight = chartRef.current?.clientHeight || 600;
      
      // Make sure we have market data to share
      const safeMarketData = marketData.length > 0 ? [...marketData] : [];
      
      // Use a try-catch inside the timeout to handle any async errors
      setTimeout(() => {
        try {
          startSharing({
            userId: clientId || 'current-user',
            username: 'You',
            symbol: selectedSymbol,
            marketData: safeMarketData,
            viewport: {
              x: 0,
              y: 0,
              width: chartWidth,
              height: chartHeight
            }
          });
          
          // Notify others in chat
          sendChatMessage(`I've shared my ${selectedSymbol} chart. Check it out!`, 'global');
          
          toast("Chart Shared", {
            description: "Your trading chart has been shared with other traders"
          });
        } catch (err) {
          console.error("Error sharing chart:", err);
          toast("Error", {
            description: "Failed to share the chart. Please try again."
          });
        } finally {
          setIsCapturing(false);
        }
      }, 1000);
    } catch (err) {
      console.error("Error preparing chart share:", err);
      setIsCapturing(false);
      toast("Error", {
        description: "Could not prepare chart for sharing."
      });
    }
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
  
  // Render different layouts for mobile and desktop
  if (isMobile) {
    // Mobile layout - simpler to avoid flashing
    return (
      <div className={cn("space-y-4", className)}>
        <Card className="bg-background/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <div className="flex items-center">
                <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
                <span>Trading View</span>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setActiveTab(activeTab === 'share' ? 'view' : 'share')}
              >
                {activeTab === 'share' ? <Users size={14} /> : <Share2 size={14} />}
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="py-2 space-y-3">
            {activeTab === 'share' ? (
              // My Trading Chart (Mobile)
              <div className="space-y-3">
                <div ref={chartRef} className="w-full h-[250px] border rounded-md overflow-hidden relative">
                  {!isComponentMounted ? (
                    <div className="w-full h-full flex items-center justify-center bg-muted/30">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <TradingViewWidget 
                      symbol={selectedSymbol}
                      theme="dark"
                      container_id={myChartId}
                      height="100%"
                      interval="60"
                      style="1"
                      allow_symbol_change={false}
                    />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <div className="flex space-x-1 flex-1">
                    <Button variant="outline" size="sm" onClick={() => setSelectedSymbol("NASDAQ:AAPL")} className="text-[10px] h-7 px-2">AAPL</Button>
                    <Button variant="outline" size="sm" onClick={() => setSelectedSymbol("BINANCE:BTCUSDT")} className="text-[10px] h-7 px-2">BTC</Button>
                  </div>
                  <Button
                    size="sm"
                    variant={isSharing ? "destructive" : "outline"}
                    onClick={handleStartSharing}
                    disabled={isCapturing}
                    className="h-7 text-xs"
                  >
                    {isSharing ? "Stop" : "Share"}
                  </Button>
                </div>
              </div>
            ) : (
              // View Shared Charts (Mobile)
              <div className="space-y-3">
                {activeShares.length === 0 ? (
                  <div className="py-4 text-center">
                    <Users className="h-8 w-8 mx-auto text-muted-foreground mb-1" />
                    <p className="text-muted-foreground text-xs">No shared charts</p>
                  </div>
                ) : (
                  <>
                    {selectedShare ? (
                      // Selected shared chart
                      <div>
                        <div className="flex justify-between items-center mb-2">
                          <h4 className="text-xs">
                            {selectedShare.username}'s Chart • {selectedShare.symbol}
                          </h4>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => selectShare(null)}
                          >
                            <X size={12} />
                          </Button>
                        </div>
                        <SharedChart shareData={selectedShare} />
                      </div>
                    ) : (
                      // List of available shares
                      <div className="grid grid-cols-1 gap-2 max-h-[250px] overflow-y-auto">
                        {activeShares.map(share => (
                          <div 
                            key={share.id}
                            onClick={() => selectShare(share.id)}
                            className="relative cursor-pointer rounded-lg border p-2"
                          >
                            <div className="flex items-center">
                              <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center">
                                <Users className="h-3 w-3" />
                              </div>
                              <div className="ml-2">
                                <p className="text-xs font-medium">{share.username}</p>
                                <p className="text-[10px] text-muted-foreground">{share.symbol}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Desktop layout - more complete UI
  return (
    <div className={cn("space-y-4", className)}>
      <Card className="bg-background/90 backdrop-blur-sm">
        <CardHeader className="py-3">
          <CardTitle className="text-sm flex items-center justify-between">
            <div className="flex items-center">
              <Share2 className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Trading View & Screen Sharing</span>
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'share' | 'view')}>
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
          </CardTitle>
        </CardHeader>
        
        <CardContent className="py-2 space-y-3">
          {activeTab === 'share' ? (
            <div className="space-y-4">
              {/* My Trading Chart */}
              <div ref={chartRef} className="w-full h-[300px] border rounded-md overflow-hidden relative">
                {!isComponentMounted ? (
                  <div className="w-full h-full flex items-center justify-center bg-muted/30">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
                      <p className="text-sm text-muted-foreground">Loading chart...</p>
                    </div>
                  </div>
                ) : (
                  <TradingViewWidget 
                    symbol={selectedSymbol}
                    theme="dark"
                    container_id={myChartId}
                    height="100%"
                    interval="D"
                    style="1"
                    allow_symbol_change={false}
                  />
                )}
                
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
  const isMobile = useIsMobile();
  const [quantity, setQuantity] = useState("1");
  const [copyTrades, setCopyTrades] = useState<CopyTrade[]>([]);
  const [copyingTrade, setCopyingTrade] = useState(false);
  const [isChartLoaded, setIsChartLoaded] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [pendingTradeSide, setPendingTradeSide] = useState<'buy' | 'sell' | null>(null);
  
  // Generate a unique ID for the chart container to prevent conflicts
  const chartId = useMemo(() => `shared_chart_${shareData.id}_${Math.random().toString(36).substring(2, 7)}`, [shareData.id]);
  
  // Set chart loaded after a short delay (for performance)
  // Safely load the chart after component mounts
  useEffect(() => {
    // Safety check to make sure we're in browser environment
    if (typeof window !== 'undefined') {
      const timer = setTimeout(() => {
        setIsChartLoaded(true);
      }, 1000); // Slightly longer delay to ensure DOM is ready
      
      return () => clearTimeout(timer);
    }
  }, []);
  
  // Show confirmation dialog for copy trade
  const showCopyTradeConfirmation = (operation: 'buy' | 'sell') => {
    // Don't copy your own trades
    if (shareData.userId === clientId) {
      toast("Can't copy own trade", {
        description: "You can't copy your own trades"
      });
      return;
    }
    
    // Set pending trade side and show confirmation dialog
    setPendingTradeSide(operation);
    setShowConfirmDialog(true);
  };
  
  // Execute the actual trade after confirmation
  const executeCopyTrade = async () => {
    if (!pendingTradeSide) return;
    
    setCopyingTrade(true);
    setShowConfirmDialog(false);
    
    const operation = pendingTradeSide;
    
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
      setPendingTradeSide(null);
    }
  };
  
  // Render a simpler version for mobile
  if (isMobile) {
    return (
      <div className="space-y-3">
        {/* Chart using TradingView - Mobile */}
        <div className="h-[220px] w-full rounded-md overflow-hidden border">
          {!isChartLoaded ? (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <TradingViewWidget 
              symbol={shareData.symbol}
              theme="dark" 
              height="100%"
              container_id={chartId}
              interval="60"
              style="1"
              enable_publishing={false}
              allow_symbol_change={false}
            />
          )}
        </div>
        
        {/* Simplified copy trading controls */}
        {shareData.userId !== clientId && (
          <div className="flex items-center space-x-2">
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 bg-green-600 hover:bg-green-700 h-8"
              onClick={() => showCopyTradeConfirmation('buy')}
              disabled={copyingTrade}
            >
              Copy Buy
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700 h-8"
              onClick={() => showCopyTradeConfirmation('sell')}
              disabled={copyingTrade}
            >
              Copy Sell
            </Button>
          </div>
        )}
      </div>
      
      {/* Confirmation Dialog - Mobile */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Trade Copy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {pendingTradeSide === 'buy' ? 'BUY' : 'SELL'} {quantity} {shareData.symbol} at {formatCurrency(currentPrice)}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Side:</span>
                <span className={pendingTradeSide === 'buy' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                  {pendingTradeSide?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbol:</span>
                <span>{shareData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span>{formatCurrency(currentPrice * Number(quantity))}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              className="h-8 text-xs"
            >
              Cancel
            </Button>
            <Button
              variant={pendingTradeSide === 'buy' ? 'default' : 'destructive'}
              onClick={executeCopyTrade}
              disabled={copyingTrade}
              className="h-8 text-xs"
            >
              {copyingTrade ? (
                <><RefreshCw className="h-3 w-3 mr-1 animate-spin" /> Processing...</>
              ) : (
                <>Confirm</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }
  
  // Desktop version
  return (
    <div className="space-y-4">
      {/* Chart using TradingView */}
      <div className="h-[300px] w-full rounded-md overflow-hidden border">
        {!isChartLoaded ? (
          <div className="w-full h-full flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading chart...</p>
            </div>
          </div>
        ) : (
          <TradingViewWidget 
            symbol={shareData.symbol}
            theme="dark" 
            height="100%"
            container_id={chartId}
            interval="D"
            style="1"
            enable_publishing={false}
            allow_symbol_change={false}
          />
        )}
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
              onClick={() => showCopyTradeConfirmation('buy')}
              disabled={copyingTrade}
            >
              <Coins className="h-3.5 w-3.5 mr-1" />
              Copy Buy
            </Button>
            <Button 
              variant="default" 
              size="sm"
              className="flex-1 bg-red-600 hover:bg-red-700"
              onClick={() => showCopyTradeConfirmation('sell')}
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
      
      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Trade Copy
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to {pendingTradeSide === 'buy' ? 'BUY' : 'SELL'} {quantity} {shareData.symbol} at {formatCurrency(currentPrice)}?
            </DialogDescription>
          </DialogHeader>
          <div className="py-3">
            <div className="text-sm mb-2">
              <span className="font-medium">Trade Details:</span>
            </div>
            <div className="bg-muted/30 p-3 rounded-md text-sm space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Side:</span>
                <span className={pendingTradeSide === 'buy' ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                  {pendingTradeSide?.toUpperCase()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Symbol:</span>
                <span>{shareData.symbol}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantity:</span>
                <span>{quantity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Price:</span>
                <span>{formatCurrency(currentPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total:</span>
                <span>{formatCurrency(currentPrice * Number(quantity))}</span>
              </div>
              <div className="flex justify-between pt-1 border-t">
                <span className="text-muted-foreground">Copied from:</span>
                <span>{shareData.username}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
            >
              Cancel
            </Button>
            <Button
              variant={pendingTradeSide === 'buy' ? 'default' : 'destructive'}
              onClick={executeCopyTrade}
              disabled={copyingTrade}
            >
              {copyingTrade ? (
                <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Processing...</>
              ) : (
                <>Confirm Trade</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}