import { useState, useEffect } from "react";
import { useSignals, TradingSignal } from "../../lib/stores/useSignals";
import { useBrokerAggregator } from "../../lib/stores/useBrokerAggregator";
import { ContextualTooltip, TooltipTrigger } from "./contextual-tooltip";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Bell, BellOff, RefreshCw, ChevronDown, ChevronUp, ExternalLink, CheckCircle2, BarChart2 } from "lucide-react";
import { formatDate, formatTime, truncate, cn } from "../../lib/utils";
import { toast } from "sonner";

interface SignalsListProps {
  className?: string;
  maxSignals?: number;
}

export function SignalsList({ className, maxSignals = 10 }: SignalsListProps) {
  const { signals, loading, fetchSignals } = useSignals();
  const { 
    initializeAggregator, 
    executeTrade, 
    selectBroker, 
    toggleABATEV, 
    useABATEV, 
    selectedBroker,
    isLoading: isAggregatorLoading,
    isConnected
  } = useBrokerAggregator();
  
  const [expanded, setExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
  const [showingBrokerComparison, setShowingBrokerComparison] = useState(false);
  
  useEffect(() => {
    // Initial fetch for signals
    fetchSignals();
    
    // Initialize the broker aggregator
    initializeAggregator().catch(error => {
      console.error('Failed to initialize broker aggregator:', error);
      toast.error('Failed to connect to brokers');
    });
    
    // Poll for new signals every 30 seconds
    const interval = setInterval(() => {
      fetchSignals();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSignals, initializeAggregator]);
  
  // Display a limited number of signals unless expanded
  const displayedSignals = expanded ? signals : signals.slice(0, maxSignals);
  
  return (
    <div className={cn("w-full", className)}>
      <Card className="bg-background/90 backdrop-blur-sm">
        <CardHeader className="py-3 flex flex-row items-center justify-between">
          <CardTitle className="text-sm flex items-center">
            <span className="flex items-center">
              <span className="relative mr-2">
                <Bell size={16} />
                {signals.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full animate-pulse" />
                )}
              </span>
              Trading Signals
            </span>
            
            <Badge variant="outline" className="ml-2 text-xs">
              {signals.length} available
            </Badge>
          </CardTitle>
          
          <div className="flex gap-1">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
              title={notificationsEnabled ? "Disable notifications" : "Enable notifications"}
            >
              {notificationsEnabled ? <Bell size={14} /> : <BellOff size={14} />}
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={fetchSignals}
              disabled={loading}
              title="Refresh signals"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-6 w-6"
              onClick={() => setExpanded(!expanded)}
              title={expanded ? "Show less" : "Show more"}
            >
              {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="px-3 pb-3">
          {loading && signals.length === 0 ? (
            <div className="flex justify-center py-8">
              <RefreshCw size={24} className="animate-spin text-muted-foreground" />
            </div>
          ) : signals.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <p>No trading signals available</p>
              <p className="text-xs mt-1">Signals from TradingView will appear here</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {displayedSignals.map((signal) => (
                <SignalCard 
                  key={signal.id} 
                  signal={signal} 
                  isSelected={selectedSignal?.id === signal.id}
                  onClick={() => setSelectedSignal(signal.id === selectedSignal?.id ? null : signal)}
                />
              ))}
            </div>
          )}
        </CardContent>
        
        {/* Connect to TradingView footer */}
        <CardFooter className="px-3 py-2 border-t text-xs text-muted-foreground">
          <div className="flex justify-between w-full items-center">
            <span>TradingView Webhook URL:</span>
            <Button 
              variant="link" 
              size="sm" 
              className="h-6 text-xs p-0 ml-1"
              asChild
            >
              <a 
                href="https://apps.taskmagic.com/api/v1/webhooks/Ec3lDNCfkpQtHNbWk16mA" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <span className="truncate max-w-32">Ec3lDNCfkpQtHNbWk16mA</span>
                <ExternalLink size={10} className="ml-1" />
              </a>
            </Button>
          </div>
        </CardFooter>
      </Card>
      
      {/* Signal detail view */}
      {selectedSignal && (
        <Card className="mt-4 bg-background/90 backdrop-blur-sm">
          <CardHeader className="py-3">
            <CardTitle className="text-sm flex items-center justify-between">
              <span>Signal Details</span>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-6 w-6"
                onClick={() => setSelectedSignal(null)}
              >
                <ChevronUp size={14} />
              </Button>
            </CardTitle>
          </CardHeader>
          
          <CardContent className="px-3 pb-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm font-medium">Symbol</span>
                <span className="text-sm">{selectedSignal.symbol}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Action</span>
                <Badge 
                  variant={selectedSignal.action === 'buy' ? 'default' : 
                          selectedSignal.action === 'sell' ? 'destructive' : 'outline'}
                  className={selectedSignal.action === 'buy' ? 'bg-green-500 hover:bg-green-600' : ''}
                >
                  {selectedSignal.action.toUpperCase()}
                </Badge>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Entry Price</span>
                <span className="text-sm">${selectedSignal.entryPrice?.toLocaleString() || selectedSignal.price.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Stop Loss</span>
                <span className="text-sm text-red-500">${selectedSignal.stopLoss?.toLocaleString() || 'Not Set'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Take Profit 1</span>
                <span className="text-sm text-green-500">${selectedSignal.takeProfit1?.toLocaleString() || 'Not Set'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Take Profit 2</span>
                <span className="text-sm text-green-500">${selectedSignal.takeProfit2?.toLocaleString() || 'Not Set'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Take Profit 3</span>
                <span className="text-sm text-green-500">${selectedSignal.takeProfit3?.toLocaleString() || 'Not Set'}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Time</span>
                <span className="text-sm">{formatTime(selectedSignal.timestamp)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Date</span>
                <span className="text-sm">{formatDate(selectedSignal.timestamp)}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Source</span>
                <span className="text-sm">{selectedSignal.source}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Strategy</span>
                <span className="text-sm">{selectedSignal.strategy}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-sm font-medium">Confidence</span>
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-muted rounded-full mr-2 overflow-hidden">
                    <div 
                      className={cn(
                        "h-full rounded-full",
                        selectedSignal.confidence > 70 ? "bg-green-500" :
                        selectedSignal.confidence > 40 ? "bg-yellow-500" : 
                        "bg-red-500"
                      )}
                      style={{ width: `${selectedSignal.confidence}%` }}
                    />
                  </div>
                  <span className="text-sm">{selectedSignal.confidence}%</span>
                </div>
              </div>
              
              <div className="pt-2">
                <span className="text-sm font-medium">Message</span>
                <p className="text-sm mt-1 p-2 bg-muted/50 rounded border">
                  {selectedSignal.message}
                </p>
              </div>
              
              {/* Indicators if available */}
              {selectedSignal.indicators && Object.keys(selectedSignal.indicators).length > 0 && (
                <div className="pt-2">
                  <span className="text-sm font-medium">Indicators</span>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    {Object.entries(selectedSignal.indicators).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-1 bg-muted/30 rounded">
                        <span className="text-xs">{key}</span>
                        <span className="text-xs font-mono">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          
          <CardFooter className="px-3 py-2 border-t space-y-2">
            <div className="flex justify-between items-center w-full">
              <div className="flex items-center gap-1">
                <Button 
                  variant={useABATEV ? "default" : "outline"}
                  size="sm"
                  className="text-xs h-7 px-2"
                  onClick={toggleABATEV}
                  title="Toggle ABATEV (AI-driven Broker Aggregator and Trade Execution Validator)"
                >
                  <CheckCircle2 
                    size={14} 
                    className={cn("mr-1", useABATEV ? "opacity-100" : "opacity-50")} 
                  />
                  ABATEV
                </Button>
                <Button 
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  onClick={() => setShowingBrokerComparison(!showingBrokerComparison)}
                >
                  <BarChart2 size={14} />
                </Button>
              </div>
              
              <Button 
                className="flex-1 max-w-[120px]" 
                size="sm"
                variant="default"
                onClick={() => {
                  if (!isConnected) {
                    toast.error("Not connected to brokers");
                    return;
                  }
                  
                  // Create a trade from the signal
                  const tradeDetails = {
                    symbol: selectedSignal.symbol,
                    quantity: 1, // Default quantity
                    action: selectedSignal.action === 'neutral' ? 'buy' : selectedSignal.action,
                    orderType: 'market' as const, // Type assertion to fix type error
                    stopLoss: selectedSignal.stopLoss,
                    takeProfit1: selectedSignal.takeProfit1,
                    takeProfit2: selectedSignal.takeProfit2,
                    takeProfit3: selectedSignal.takeProfit3
                  };
                  
                  toast.promise(executeTrade(tradeDetails), {
                    loading: 'Executing trade...',
                    success: (result) => {
                      if (result.success) {
                        return `Trade executed through ${result.broker}`;
                      }
                      throw new Error(result.error);
                    },
                    error: 'Failed to execute trade'
                  });
                }}
                disabled={isAggregatorLoading || !isConnected}
              >
                {selectedSignal.action === 'buy' ? 'Buy Now' : 
                 selectedSignal.action === 'sell' ? 'Sell Now' : 
                 'Execute'}
              </Button>
            </div>
            
            {!useABATEV && (
              <div className="flex flex-wrap gap-2 w-full">
                {['ironbeam', 'alpaca', 'oanda'].map(broker => (
                  <Button 
                    key={broker}
                    className="flex-1" 
                    size="sm" 
                    variant={selectedBroker === broker ? "default" : "outline"}
                    onClick={() => selectBroker(broker)}
                  >
                    {broker.charAt(0).toUpperCase() + broker.slice(1)}
                  </Button>
                ))}
              </div>
            )}
            
            {showingBrokerComparison && (
              <div className="w-full mt-2 pt-2 border-t">
                <div className="text-xs font-medium mb-1">ABATEV Broker Comparison</div>
                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    <div className="w-1/4">Broker</div>
                    <div className="w-1/4 text-right">Price</div>
                    <div className="w-1/4 text-right">Spread</div>
                    <div className="w-1/4 text-right">Latency</div>
                  </div>
                  
                  {['ironbeam', 'alpaca'].map((broker, index) => (
                    <div 
                      key={broker}
                      className={cn(
                        "flex items-center justify-between px-2 py-1 rounded", 
                        index === 0 ? "bg-green-500/10 border border-green-500/30" : ""
                      )}
                    >
                      <div className="w-1/4 font-medium">{broker.charAt(0).toUpperCase() + broker.slice(1)}</div>
                      <div className="w-1/4 text-right">${(Math.random() * 1000 + 30000).toFixed(2)}</div>
                      <div className="w-1/4 text-right">{(Math.random() * 0.5).toFixed(2)}%</div>
                      <div className="w-1/4 text-right">{Math.floor(Math.random() * 100)}ms</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardFooter>
        </Card>
      )}
    </div>
  );
}

// Individual signal card component
function SignalCard({ 
  signal, 
  isSelected, 
  onClick 
}: { 
  signal: TradingSignal; 
  isSelected: boolean;
  onClick: () => void;
}) {
  return (
    <div 
      className={cn(
        "p-2 border rounded-md cursor-pointer transition-all",
        isSelected ? "border-primary bg-muted/50" : "hover:bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="flex items-center">
          <Badge 
            variant={signal.action === 'buy' ? 'default' : 
                    signal.action === 'sell' ? 'destructive' : 'outline'}
            className={cn("mr-2 uppercase text-xs", 
              signal.action === 'buy' ? 'bg-green-500 hover:bg-green-600' : '')}
          >
            {signal.action}
          </Badge>
          <span className="font-medium">{signal.symbol}</span>
        </div>
        <span className="text-xs text-muted-foreground">{formatTime(signal.timestamp)}</span>
      </div>
      
      <p className="text-xs text-muted-foreground mb-1">
        {truncate(signal.message, 100)}
      </p>
      
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">{signal.strategy}</span>
        <span 
          className={cn(
            "font-medium",
            signal.confidence > 70 ? "text-green-500" :
            signal.confidence > 40 ? "text-yellow-500" : 
            "text-red-500"
          )}
        >
          {signal.confidence}% confidence
        </span>
      </div>
    </div>
  );
}