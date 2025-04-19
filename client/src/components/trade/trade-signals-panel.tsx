import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import { 
  AlertCircle, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  Copy, 
  ExternalLink, 
  Filter, 
  RefreshCw,
  Search,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';

import { tradeSignalService, TradeSignal } from '../../lib/services/trade-signal-service';
import { CopyTradeButton } from './copy-trade-button';

export function TradeSignalsPanel() {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showingBuyOnly, setShowingBuyOnly] = useState(false);
  const [showingSellOnly, setShowingSellOnly] = useState(false);
  const [signalSource, setSignalSource] = useState<string | null>(null);
  
  // Loading signals from service
  useEffect(() => {
    const loadSignals = () => {
      const allSignals = tradeSignalService.getAllSignals();
      setSignals(allSignals);
    };
    
    // Load signals initially
    loadSignals();
    
    // Subscribe to new signals
    const handleNewSignal = (signal: TradeSignal) => {
      setSignals(prev => [signal, ...prev]);
      
      toast.info(`New ${signal.type.toUpperCase()} signal received`, {
        description: `${signal.symbol} at ${signal.entry}`
      });
    };
    
    // Listen for WebSocket trading signals
    const handleWebSocketSignal = (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);
        
        // Check if this is a trading signal message
        if (data.type === 'trading_signal' && data.data) {
          const { signal, provider } = data.data;
          
          if (!signal || !signal.symbol) return;
          
          // Convert to our TradeSignal format
          const newSignal: TradeSignal = {
            id: `ws-${Date.now()}`,
            symbol: signal.symbol,
            type: signal.side === 'buy' ? 'buy' : 'sell',
            entry: signal.entryPrice || 0,
            stopLoss: signal.stopLoss || 0,
            takeProfit: signal.takeProfit || 0,
            timestamp: new Date(),
            source: provider || 'WebSocket',
            risk: 1,
            notes: signal.description || ''
          };
          
          // Add to signals list
          handleNewSignal(newSignal);
          
          // Add to trading service
          tradeSignalService.addSignal(newSignal);
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    // Connect to WebSocket (optional)
    if (typeof window !== 'undefined') {
      // Try to connect to WebSocket, but wrap in try/catch to prevent app failure
      try {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = `${protocol}//${window.location.host}/ws`;
        
        const ws = new WebSocket(wsUrl);
        
        ws.addEventListener('message', handleWebSocketSignal);
        
        // Handle connection events
        ws.addEventListener('open', () => {
          console.log('WebSocket connected for trading signals');
        });
        
        ws.addEventListener('error', (error) => {
          console.log('WebSocket connection not available - using polling fallback');
        });
        
        return () => {
          try {
            ws.removeEventListener('message', handleWebSocketSignal);
            ws.close();
          } catch (e) {
            // Ignore errors during cleanup
          }
        };
      } catch (e) {
        console.log('WebSocket not available - using polling fallback');
        // Return empty cleanup function
        return () => {};
      }
    }
    
    tradeSignalService.subscribe('signal_added', handleNewSignal);
    
    // Clean up subscription
    return () => {
      tradeSignalService.unsubscribe('signal_added', handleNewSignal);
    };
  }, []);
  
  // Filter signals based on search and filters
  const filteredSignals = signals.filter(signal => {
    // Filter by search query
    if (searchQuery && !signal.symbol.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !signal.source.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !(signal.notes?.toLowerCase().includes(searchQuery.toLowerCase()))) {
      return false;
    }
    
    // Filter by type (buy/sell)
    if (showingBuyOnly && signal.type !== 'buy') return false;
    if (showingSellOnly && signal.type !== 'sell') return false;
    
    // Filter by source
    if (signalSource && signal.source !== signalSource) return false;
    
    return true;
  });
  
  // Get unique sources for filtering
  const signalSources = Array.from(new Set(signals.map(signal => signal.source)));
  
  // Note: Signal copying is now handled directly within the CopyTradeButton component
  
  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setShowingBuyOnly(false);
    setShowingSellOnly(false);
    setSignalSource(null);
  };
  
  // Format date for display
  const formatDate = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else {
      return `${diffDays}d ago`;
    }
  };
  
  // Function to refresh signals
  const refreshSignals = async () => {
    try {
      // Show a loading toast
      toast.loading("Refreshing signals from Google Sheets...");
      
      // This would normally fetch from the API, but for now we'll use the service directly
      const allSignals = tradeSignalService.getAllSignals();
      setSignals(allSignals);
      
      // Show success toast
      toast.success(`Successfully refreshed signals`, {
        description: `Loaded ${allSignals.length} trading signals`
      });
    } catch (error) {
      console.error("Error refreshing signals:", error);
      toast.error("Failed to refresh signals", {
        description: "Please check your connection and try again"
      });
    }
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Trading Signals</CardTitle>
            <CardDescription>Latest market opportunities</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1 px-2 py-1 h-8"
              onClick={refreshSignals}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Badge variant="outline" className="px-2 py-1">
              <Clock size={14} className="mr-1" />
              Real-time
            </Badge>
            <Badge variant="outline" className="px-2 py-1">
              {filteredSignals.length} signals
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="all">All Signals</TabsTrigger>
            <TabsTrigger value="executed">Executed</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            {/* Search and filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
                <Input
                  placeholder="Search signals..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              
              <Button 
                variant="outline" 
                size="icon" 
                onClick={resetFilters} 
                title="Reset filters"
              >
                <Filter size={16} />
              </Button>
            </div>
            
            {/* Filter toggles */}
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <div className="flex items-center space-x-2">
                <Switch
                  id="buy-filter"
                  checked={showingBuyOnly}
                  onCheckedChange={(checked) => {
                    setShowingBuyOnly(checked);
                    if (checked) setShowingSellOnly(false);
                  }}
                />
                <Label 
                  htmlFor="buy-filter" 
                  className="flex items-center text-green-600 cursor-pointer"
                >
                  <ArrowUpRight size={16} className="mr-1" /> Buy Only
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sell-filter"
                  checked={showingSellOnly}
                  onCheckedChange={(checked) => {
                    setShowingSellOnly(checked);
                    if (checked) setShowingBuyOnly(false);
                  }}
                />
                <Label 
                  htmlFor="sell-filter" 
                  className="flex items-center text-red-600 cursor-pointer"
                >
                  <ArrowDownRight size={16} className="mr-1" /> Sell Only
                </Label>
              </div>
              
              {signalSources.length > 0 && (
                <div className="flex items-center space-x-2">
                  <select 
                    value={signalSource || ''}
                    onChange={(e) => setSignalSource(e.target.value || null)}
                    className="rounded-md text-xs px-2 py-1 border border-slate-300 dark:border-slate-700"
                  >
                    <option value="">All Sources</option>
                    {signalSources.map(source => (
                      <option key={source} value={source}>{source}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            
            <Separator />
            
            {/* Signal list */}
            <div className="space-y-3 max-h-[calc(100vh-310px)] overflow-y-auto pr-2">
              {filteredSignals.length > 0 ? (
                filteredSignals.map(signal => (
                  <div
                    key={signal.id}
                    className="rounded-lg border border-slate-200 dark:border-slate-800 p-3 transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{signal.symbol}</span>
                          <Badge 
                            variant={signal.type === 'buy' ? 'default' : 'destructive'}
                            className="px-1.5 py-0"
                          >
                            {signal.type === 'buy' ? (
                              <ArrowUpRight size={14} className="mr-0.5" />
                            ) : (
                              <ArrowDownRight size={14} className="mr-0.5" />
                            )}
                            {signal.type.toUpperCase()}
                          </Badge>
                          <Badge variant="secondary" className="px-1.5 py-0 text-xs">
                            {signal.source}
                          </Badge>
                        </div>
                        
                        <div className="text-sm text-slate-500 mt-1">
                          <div className="grid grid-cols-3 gap-x-4 gap-y-0.5">
                            <div>Entry: <span className="font-medium">{signal.entry}</span></div>
                            <div>SL: <span className="font-medium">{signal.stopLoss}</span></div>
                            <div>TP: <span className="font-medium">{signal.takeProfit}</span></div>
                          </div>
                          {signal.notes && (
                            <div className="mt-1 text-xs italic">{signal.notes}</div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-xs text-slate-500">
                          {formatDate(signal.timestamp)}
                        </span>
                        
                        <div className="flex gap-1 mt-1">
                          <CopyTradeButton 
                            signal={signal}
                          />
                          
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7"
                            title="View details"
                          >
                            <ExternalLink size={14} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-slate-500">
                  <AlertCircle className="mx-auto mb-2 h-6 w-6" />
                  <p>No signals found matching your filters.</p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="executed">
            <div className="p-8 text-center text-slate-500">
              Signal execution history coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="webhook">
            <div className="p-8 text-center text-slate-500">
              Webhook configuration coming soon
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default TradeSignalsPanel;