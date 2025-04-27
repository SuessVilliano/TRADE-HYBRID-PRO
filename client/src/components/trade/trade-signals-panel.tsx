import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { Separator } from '../ui/separator';
import { Badge } from '../ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
  Zap,
  BarChart3,
  Settings,
  ChevronDown,
  FileText,
  Book,
  ArrowUp10,
  TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

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
        console.log('WebSocket message received:', event.data);
        const data = JSON.parse(event.data);
        console.log('Parsed WebSocket data:', data);
        
        // Check if this is a trading signal message
        if (data.type === 'trading_signal' && data.data) {
          console.log('Trading signal received via WebSocket:', data.data);
          const { signal, provider } = data.data;
          
          if (!signal || !signal.symbol) {
            console.warn('Missing required signal data (symbol):', signal);
            return;
          }
          
          // Determine timeframe based on provider
          let timeframe = signal.timeframe || '1d';
          if (provider) {
            if (provider.toLowerCase().includes('hybrid')) {
              timeframe = '10m';
            } else if (provider.toLowerCase().includes('paradox')) {
              timeframe = '30m';
            } else if (provider.toLowerCase().includes('solaris')) {
              timeframe = '5m';
            }
          }
          
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
            notes: signal.description || `${timeframe} timeframe alert`,
            timeframe: timeframe,
            status: 'active' // Set the status to active for all new signals
          };
          
          console.log('Created new signal from WebSocket:', newSignal);
          
          // Add to signals list
          handleNewSignal(newSignal);
          
          // Add to trading service
          tradeSignalService.addSignal(newSignal);
          
          // Display a more prominent notification
          toast.success(`New ${newSignal.type.toUpperCase()} Signal: ${newSignal.symbol}`, {
            description: `Entry: ${newSignal.entry} | Provider: ${newSignal.source}`,
            duration: 8000,
          });
        }
      } catch (error) {
        console.error('Error processing WebSocket message:', error);
      }
    };
    
    // Connect to WebSocket with reconnection logic
    if (typeof window !== 'undefined') {
      // Keep track of WebSocket instance
      let ws: WebSocket | null = null;
      let reconnectAttempts = 0;
      let reconnectInterval: any = null;
      
      // Function to create and setup the WebSocket
      const setupWebSocket = () => {
        try {
          const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
          const wsUrl = `${protocol}//${window.location.host}/ws`;
          
          console.log(`Attempting to connect to WebSocket at ${wsUrl}`);
          
          // Create new WebSocket
          ws = new WebSocket(wsUrl);
          
          // Add event listeners
          ws.addEventListener('message', handleWebSocketSignal);
          
          // Handle connection events
          ws.addEventListener('open', () => {
            console.log('🟢 WebSocket connected for trading signals');
            toast.success('Trading signal connection established', { 
              description: 'You will receive real-time trading signals',
              duration: 3000
            });
            reconnectAttempts = 0; // Reset reconnect attempts on successful connection
            
            // Manual test signal to verify connection
            console.log('Sending test ping message to WebSocket server');
            try {
              ws?.send(JSON.stringify({ 
                type: 'ping', 
                data: { timestamp: Date.now(), client: 'trade-signals-panel' } 
              }));
            } catch (e) {
              console.error('Error sending test message:', e);
            }
          });
          
          ws.addEventListener('error', (error) => {
            console.log('WebSocket connection error:', error);
          });
          
          ws.addEventListener('close', (event) => {
            console.log(`WebSocket connection closed. Code: ${event.code}, Reason: ${event.reason}`);
            
            // Attempt to reconnect with exponential backoff
            if (reconnectAttempts < 5) {
              const timeout = Math.min(1000 * Math.pow(2, reconnectAttempts), 30000);
              console.log(`Attempting to reconnect in ${timeout/1000} seconds...`);
              
              // Clear any existing reconnect interval
              if (reconnectInterval) {
                clearTimeout(reconnectInterval);
              }
              
              // Set new reconnect timeout
              reconnectInterval = setTimeout(() => {
                reconnectAttempts++;
                setupWebSocket();
              }, timeout);
            } else {
              console.log('Max reconnect attempts reached. Using polling fallback.');
              toast.error('Signal connection lost', {
                description: 'Unable to establish real-time connection. Refreshing signals manually.',
              });
            }
          });
        } catch (error) {
          console.error('Error setting up WebSocket:', error);
        }
      };
      
      // Initial WebSocket setup
      setupWebSocket();
      
      // Return cleanup function
      return () => {
        if (ws) {
          try {
            ws.removeEventListener('message', handleWebSocketSignal);
            ws.close(1000, 'Component unmounting');
          } catch (e) {
            console.log('Error during WebSocket cleanup:', e);
          }
        }
        
        if (reconnectInterval) {
          clearTimeout(reconnectInterval);
        }
      };
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
      toast.loading("Refreshing trading signals...");
      
      // Trigger a refresh from the API in the service
      await tradeSignalService.fetchRealSignals();
      
      // Get updated signals
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

  // Group signals by date for better organization
  const groupedSignals = useMemo(() => {
    const groups: Record<string, TradeSignal[]> = {};
    
    filteredSignals.forEach(signal => {
      const date = new Date(signal.timestamp);
      const dateKey = date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: 'numeric'
      });
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(signal);
    });
    
    // Sort each group by timestamp (newest first)
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    });
    
    return groups;
  }, [filteredSignals]);
  
  // Get available market types from signals
  const marketTypes = useMemo(() => {
    const types = new Set<string>();
    
    signals.forEach(signal => {
      // Extract market type based on symbol patterns
      if (signal.symbol.endsWith('USDT') || signal.symbol.endsWith('USD')) {
        types.add('Crypto');
      } else if (signal.symbol.includes('/')) {
        types.add('Forex');
      } else if (['ES', 'NQ', 'CL', 'GC', 'SI'].some(code => signal.symbol.includes(code))) {
        types.add('Futures');
      } else if (signal.symbol.length <= 5 && !signal.symbol.includes('/')) {
        types.add('Stocks');
      }
    });
    
    return Array.from(types);
  }, [signals]);
  
  // Calculate success rate (for demo purposes)
  const calculateSuccessRate = (source: string): number => {
    // In a real implementation, this would come from actual trade outcomes
    // For now, we'll generate a consistent pseudo-random value based on the source name
    const sourceHash = source.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return 50 + (sourceHash % 35); // Range between 50-85%
  };

  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center">
              <TrendingUp className="mr-2 h-5 w-5 text-blue-500" />
              Trading Signals
            </CardTitle>
            <CardDescription>AI-powered market opportunities</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="flex items-center gap-1 px-2 py-1 h-8"
                    onClick={refreshSignals}
                  >
                    <RefreshCw size={14} />
                    Refresh
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Refresh signals from all sources</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <Badge variant="outline" className="px-2 py-1">
              <Clock size={14} className="mr-1" />
              Real-time
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="h-8 w-8">
                  <Settings size={14} />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Signal Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem>
                    <BarChart3 className="mr-2 h-4 w-4" />
                    <span>Advanced Analytics</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Export Signals</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Book className="mr-2 h-4 w-4" />
                    <span>Signal Documentation</span>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="all">All Signals</TabsTrigger>
            <TabsTrigger value="executed">My Trades</TabsTrigger>
            <TabsTrigger value="webhook">Webhooks</TabsTrigger>
            <TabsTrigger value="nexus">Nexus™</TabsTrigger>
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
                          <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
                            <div>Entry: <span className="font-medium">{signal.entry}</span></div>
                            <div>SL: <span className="font-medium">{signal.stopLoss}</span></div>
                            <div>TP: <span className="font-medium">{signal.takeProfit}</span></div>
                            <div>TF: <span className="font-medium text-orange-500">{signal.timeframe || "1d"}</span></div>
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