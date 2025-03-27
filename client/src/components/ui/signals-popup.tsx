import React, { useState, useEffect } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, BellRing, Check, ArrowUp, ArrowDown, ArrowRight, BarChart2, Share2 } from 'lucide-react';
import { useSignals, TradingSignal } from '@/lib/stores/useSignals';
import { useMultiplayer } from '@/lib/stores/useMultiplayer';
import { formatDate, formatCurrency, cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Badge } from './badge';
import { Switch } from './switch';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { TRADING_SYMBOLS, TIMEFRAMES } from '@/lib/constants';

/**
 * Trading Signals Popup Component
 * - Displays a list of received trading signals
 * - Allows filtering and sorting signals
 * - Provides detailed view of signal information
 * - Supports sharing signals with other traders
 */
export function SignalsPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { signals, fetchSignals, markSignalRead } = useSignals();
  const { shareSocialActivity } = useMultiplayer();
  const [selectedSignal, setSelectedSignal] = useState<TradingSignal | null>(null);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'buy', 'sell'
  const [sortBy, setSortBy] = useState('date'); // 'date', 'confidence', 'symbol'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc', 'desc'
  const [symbolFilter, setSymbolFilter] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  
  // Fetch signals when component opens
  useEffect(() => {
    if (isOpen) {
      fetchSignals();
    }
  }, [fetchSignals, isOpen]);

  // Filter and sort signals
  const filteredSignals = React.useMemo(() => {
    let result = [...signals];
    
    // Apply filters
    if (filter === 'unread') {
      result = result.filter(signal => !signal.read);
    } else if (filter === 'buy') {
      result = result.filter(signal => signal.action === 'buy');
    } else if (filter === 'sell') {
      result = result.filter(signal => signal.action === 'sell');
    }
    
    // Apply symbol filter
    if (symbolFilter) {
      result = result.filter(signal => signal.symbol === symbolFilter);
    }
    
    // Sort
    result.sort((a, b) => {
      if (sortBy === 'date') {
        return sortOrder === 'desc' 
          ? new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
          : new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime();
      } else if (sortBy === 'confidence') {
        return sortOrder === 'desc'
          ? b.confidence - a.confidence
          : a.confidence - b.confidence;
      } else if (sortBy === 'symbol') {
        return sortOrder === 'desc'
          ? b.symbol.localeCompare(a.symbol)
          : a.symbol.localeCompare(b.symbol);
      }
      return 0;
    });
    
    return result;
  }, [signals, filter, sortBy, sortOrder, symbolFilter]);

  // Handle marking a signal as read
  const handleMarkRead = (signalId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    markSignalRead(signalId);
  };

  // Handle sharing a signal
  const handleShareSignal = (signal: TradingSignal, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    // Create a shareable message
    const signalDetails = `Signal: ${signal.action.toUpperCase()} ${signal.symbol} @ ${formatCurrency(signal.price)}`;
    
    // Share with the community
    shareSocialActivity('signal_shared', signalDetails);
    
    // Show confirmation (could use a toast in a real app)
    alert('Signal shared with the community!');
  };

  // Handle selecting a signal to view details
  const handleSelectSignal = (signal: TradingSignal) => {
    setSelectedSignal(signal);
    if (!signal.read) {
      handleMarkRead(signal.id);
    }
  };

  // Render the action icon based on signal action
  const renderActionIcon = (action: 'buy' | 'sell' | 'neutral') => {
    switch (action) {
      case 'buy':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'sell':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      case 'neutral':
        return <ArrowRight className="h-4 w-4 text-amber-500" />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Trading Signals</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left panel: Signal list with filters */}
          <div className="w-full md:w-1/2 border-r p-4 flex flex-col h-full">
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-medium">Signal Feed</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs">Notifications</span>
                  <Switch 
                    checked={notificationsEnabled}
                    onCheckedChange={setNotificationsEnabled}
                  />
                </div>
              </div>
              
              <div className="flex gap-2 mb-2">
                <Button 
                  size="sm" 
                  variant={filter === 'all' ? 'default' : 'outline'}
                  onClick={() => setFilter('all')}
                >
                  All
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'unread' ? 'default' : 'outline'}
                  onClick={() => setFilter('unread')}
                >
                  Unread
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'buy' ? 'default' : 'outline'}
                  onClick={() => setFilter('buy')}
                >
                  Buy
                </Button>
                <Button 
                  size="sm" 
                  variant={filter === 'sell' ? 'default' : 'outline'}
                  onClick={() => setFilter('sell')}
                >
                  Sell
                </Button>
              </div>
              
              <div className="flex gap-2">
                <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Symbol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Symbols</SelectItem>
                    {Object.keys(TRADING_SYMBOLS).map(symbol => (
                      <SelectItem key={symbol} value={symbol}>{symbol}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Date</SelectItem>
                    <SelectItem value="confidence">Confidence</SelectItem>
                    <SelectItem value="symbol">Symbol</SelectItem>
                  </SelectContent>
                </Select>
                
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                  {sortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredSignals.length > 0 ? (
                  filteredSignals.map((signal) => (
                    <div 
                      key={signal.id} 
                      className={cn(
                        "border rounded-md p-3 text-sm cursor-pointer transition-colors",
                        !signal.read && "border-l-4 border-l-blue-500",
                        selectedSignal?.id === signal.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => handleSelectSignal(signal)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {renderActionIcon(signal.action)}
                          <span className="font-medium ml-2">{signal.symbol}</span>
                          {!signal.read && (
                            <Badge variant="default" className="ml-2 px-1.5 py-0 text-[10px]">NEW</Badge>
                          )}
                        </div>
                        <div className="flex items-center space-x-1">
                          {!signal.read && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-6 w-6"
                              onClick={(e) => handleMarkRead(signal.id, e)}
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            className="h-6 w-6"
                            onClick={(e) => handleShareSignal(signal, e)}
                          >
                            <Share2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="mt-1 text-xs text-muted-foreground">
                        {formatDate(signal.timestamp.toString())} • {signal.timeframe}
                      </div>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div>
                          <span className="text-xs text-muted-foreground">Price: </span>
                          <span className="font-medium">{formatCurrency(signal.price)}</span>
                        </div>
                        <div>
                          <span className="text-xs text-muted-foreground">Confidence: </span>
                          <span className={cn(
                            "font-medium",
                            signal.confidence >= 70 ? "text-green-500" : 
                            signal.confidence >= 50 ? "text-amber-500" : "text-red-500"
                          )}>
                            {signal.confidence}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <BellRing className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No signals found</p>
                    <p className="text-xs mt-1">Adjust your filters or check back later</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right panel: Signal details */}
          <div className="w-full md:w-1/2 p-4 flex flex-col h-full">
            {selectedSignal ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <h3 className="font-medium">{selectedSignal.symbol}</h3>
                    <Badge 
                      className={cn(
                        "ml-2",
                        selectedSignal.action === 'buy' ? "bg-green-100 text-green-800" :
                        selectedSignal.action === 'sell' ? "bg-red-100 text-red-800" : 
                        "bg-amber-100 text-amber-800"
                      )}
                    >
                      {selectedSignal.action.toUpperCase()}
                    </Badge>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => handleShareSignal(selectedSignal)}
                  >
                    <Share2 className="h-4 w-4 mr-1" />
                    Share
                  </Button>
                </div>
                
                <Tabs defaultValue="details">
                  <TabsList className="mb-4">
                    <TabsTrigger value="details">Details</TabsTrigger>
                    <TabsTrigger value="chart">Chart</TabsTrigger>
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Entry Price</p>
                        <p className="font-medium">{formatCurrency(selectedSignal.entryPrice || selectedSignal.price)}</p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Stop Loss</p>
                        <p className="font-medium">
                          {selectedSignal.stopLoss ? formatCurrency(selectedSignal.stopLoss) : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Take Profit 1</p>
                        <p className="font-medium">
                          {selectedSignal.takeProfit1 ? formatCurrency(selectedSignal.takeProfit1) : 'N/A'}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-3">
                        <p className="text-xs text-muted-foreground">Take Profit 2</p>
                        <p className="font-medium">
                          {selectedSignal.takeProfit2 ? formatCurrency(selectedSignal.takeProfit2) : 'N/A'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">Signal Information</p>
                        <Badge variant="outline" className="text-xs">
                          {selectedSignal.strategy || 'Trade Hybrid Strategy'}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <div>
                          <p className="text-xs text-muted-foreground">Source</p>
                          <p>{selectedSignal.source || 'Trade Hybrid'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Timeframe</p>
                          <p>{selectedSignal.timeframe}</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Confidence</p>
                          <p className={cn(
                            selectedSignal.confidence >= 70 ? "text-green-500" : 
                            selectedSignal.confidence >= 50 ? "text-amber-500" : "text-red-500"
                          )}>
                            {selectedSignal.confidence}%
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Date</p>
                          <p>{formatDate(selectedSignal.timestamp.toString())}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <p className="text-sm font-medium mb-2">Message</p>
                      <p className="text-sm whitespace-pre-line">{selectedSignal.message}</p>
                    </div>
                    
                    {selectedSignal.indicators && Object.keys(selectedSignal.indicators).length > 0 && (
                      <div className="border rounded-md p-3">
                        <p className="text-sm font-medium mb-2">Technical Indicators</p>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {Object.entries(selectedSignal.indicators).map(([key, value]) => (
                            <div key={key}>
                              <p className="text-xs text-muted-foreground">{key}</p>
                              <p>{value.toString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="chart">
                    <div className="border rounded-md p-3 flex items-center justify-center h-60">
                      <div className="text-center">
                        <BarChart2 className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <p className="text-muted-foreground text-sm">
                          Chart visualization will appear here
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Integrates with TradingView in production
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="analysis">
                    <div className="border rounded-md p-3 space-y-3">
                      <p className="text-sm font-medium">Risk Analysis</p>
                      <div className="space-y-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Risk/Reward Ratio</p>
                          <p className="text-sm">
                            {selectedSignal.takeProfit1 && selectedSignal.stopLoss && selectedSignal.price ? (
                              `${((Math.abs(selectedSignal.takeProfit1 - selectedSignal.price) / 
                                Math.abs(selectedSignal.stopLoss - selectedSignal.price)).toFixed(2))}:1`
                            ) : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Potential Loss</p>
                          <p className="text-sm text-red-500">
                            {selectedSignal.stopLoss && selectedSignal.price ? (
                              `${((Math.abs(selectedSignal.stopLoss - selectedSignal.price) / 
                                selectedSignal.price) * 100).toFixed(2)}%`
                            ) : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <p className="text-xs text-muted-foreground">Potential Gain</p>
                          <p className="text-sm text-green-500">
                            {selectedSignal.takeProfit1 && selectedSignal.price ? (
                              `${((Math.abs(selectedSignal.takeProfit1 - selectedSignal.price) / 
                                selectedSignal.price) * 100).toFixed(2)}%`
                            ) : 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 mt-4">
                      <p className="text-sm font-medium mb-2">Historical Performance</p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <p>Signal Accuracy</p>
                          <p>68%</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <p>Average Return</p>
                          <p className="text-green-500">+2.4%</p>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <p>Success Rate (30 days)</p>
                          <p>7/10</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
                
                <div className="mt-auto pt-4 flex justify-between">
                  <Button variant="outline" onClick={() => setSelectedSignal(null)}>
                    Back to List
                  </Button>
                  <Button>Place Trade</Button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <div className="mb-4">
                  <BellRing className="h-12 w-12 mb-2 opacity-20" />
                  <h3 className="text-lg font-medium">No Signal Selected</h3>
                </div>
                <p className="max-w-md">
                  Select a signal from the list to view detailed information including entry points, 
                  stop loss levels, and target prices.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}