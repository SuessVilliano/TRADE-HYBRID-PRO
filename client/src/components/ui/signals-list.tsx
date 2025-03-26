import { useState, useEffect } from "react";
import { useSignals, TradingSignal } from "@/lib/stores/useSignals";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "./card";
import { Badge } from "./badge";
import { Button } from "./button";
import { Bell, BellOff, RefreshCw, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";
import { formatDate, formatTime, truncate } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface SignalsListProps {
  className?: string;
  maxSignals?: number;
}

export function SignalsList({ className, maxSignals = 10 }: SignalsListProps) {
  const { signals, loading, fetchSignals } = useSignals();
  const [expanded, setExpanded] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
  
  useEffect(() => {
    // Initial fetch
    fetchSignals();
    
    // Poll for new signals every 30 seconds
    const interval = setInterval(() => {
      fetchSignals();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [fetchSignals]);
  
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
              <span className="text-xs text-muted-foreground">Trade with best execution</span>
              <Button 
                className="w-1/2" 
                size="sm"
                variant="default"
              >
                <span className="mr-1">ABATEV</span> 
                {selectedSignal.action === 'buy' ? 'Buy' : 
                 selectedSignal.action === 'sell' ? 'Sell' : 
                 'Execute'}
              </Button>
            </div>
            <div className="flex flex-wrap gap-2 w-full">
              <Button className="flex-1" size="sm" variant="outline">
                IronBeam
              </Button>
              <Button className="flex-1" size="sm" variant="outline">
                Alpaca
              </Button>
              <Button className="flex-1" size="sm" variant="outline">
                Oanda
              </Button>
            </div>
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
            variant={signal.action === 'buy' ? 'success' : 
                    signal.action === 'sell' ? 'destructive' : 'outline'}
            className="mr-2 uppercase text-xs"
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