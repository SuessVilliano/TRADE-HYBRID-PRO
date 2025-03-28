import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PopupContainer } from '@/components/ui/popup-container';
import { Bell, BellOff, BellPlus, ChevronRight, Clock, Plus, Trash2, TrendingDown, TrendingUp, Target } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ALL_TRADING_SYMBOLS } from '@/lib/constants';
import { notificationService } from '@/lib/services/notification-service';
import useLocalStorage from '@/lib/hooks/useLocalStorage';

// Type definitions
export interface SavedSignal {
  id: string;
  symbol: string;
  market: 'crypto' | 'forex' | 'stocks' | 'futures';
  side: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  timeframe: string;
  confidence?: number;
  createdAt: Date;
  source: 'ai' | 'user' | 'copy';
  notes?: string;
  notificationsEnabled: boolean;
}

// Component for displaying saved signals
export function SavedSignalsPanel() {
  const [savedSignals, setSavedSignals] = useLocalStorage<SavedSignal[]>('saved-signals', []);
  const [sortField, setSortField] = useState<'createdAt' | 'symbol' | 'side'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterMarket, setFilterMarket] = useState<string>('all');
  
  const handleRemoveSignal = (id: string) => {
    setSavedSignals(savedSignals.filter(signal => signal.id !== id));
  };
  
  const handleToggleNotifications = (id: string, enabled: boolean) => {
    setSavedSignals(savedSignals.map(signal => 
      signal.id === id 
        ? { ...signal, notificationsEnabled: enabled } 
        : signal
    ));
  };
  
  const sortedSignals = [...savedSignals].sort((a, b) => {
    if (sortField === 'createdAt') {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return sortOrder === 'asc' ? dateA - dateB : dateB - dateA;
    } else if (sortField === 'symbol') {
      return sortOrder === 'asc' 
        ? a.symbol.localeCompare(b.symbol)
        : b.symbol.localeCompare(a.symbol);
    } else {
      return sortOrder === 'asc'
        ? a.side.localeCompare(b.side)
        : b.side.localeCompare(a.side);
    }
  });
  
  const filteredSignals = filterMarket === 'all' 
    ? sortedSignals 
    : sortedSignals.filter(signal => signal.market === filterMarket);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header controls */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <BellPlus className="h-5 w-5 text-primary" />
          Saved Signals {filteredSignals.length > 0 && (
            <Badge variant="outline" className="bg-primary/20 ml-2">
              {filteredSignals.length}
            </Badge>
          )}
        </h2>
        
        <div className="flex gap-2">
          <Select 
            value={filterMarket} 
            onValueChange={setFilterMarket}
          >
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="All Markets" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="crypto">Crypto</SelectItem>
              <SelectItem value="forex">Forex</SelectItem>
              <SelectItem value="stocks">Stocks</SelectItem>
              <SelectItem value="futures">Futures</SelectItem>
            </SelectContent>
          </Select>
          
          <CreateSignalDialog onSignalCreate={(signal) => setSavedSignals([...savedSignals, signal])} />
        </div>
      </div>
      
      {filteredSignals.length > 0 ? (
        <SignalList 
          signals={filteredSignals} 
          onRemove={handleRemoveSignal} 
          onToggleNotifications={handleToggleNotifications} 
        />
      ) : (
        <EmptySignalState />
      )}
    </div>
  );
}

function EmptySignalState({ message = "You haven't saved any signals yet" }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
      <BellOff className="h-12 w-12 mb-4 opacity-30" />
      <p className="text-lg font-medium mb-2">{message}</p>
      <p className="text-sm text-center max-w-md">
        Save trading signals from the Live Signals tab or create your own custom price alerts
      </p>
    </div>
  );
}

interface SignalListProps {
  signals: SavedSignal[];
  onRemove: (id: string) => void;
  onToggleNotifications: (id: string, enabled: boolean) => void;
}

function SignalList({ signals, onRemove, onToggleNotifications }: SignalListProps) {
  return (
    <div className="space-y-3 overflow-y-auto pb-4">
      {signals.map(signal => (
        <SavedSignalCard 
          key={signal.id} 
          signal={signal} 
          onRemove={() => onRemove(signal.id)} 
          onToggleNotifications={(enabled) => onToggleNotifications(signal.id, enabled)} 
        />
      ))}
    </div>
  );
}

interface SavedSignalCardProps {
  signal: SavedSignal;
  onRemove: () => void;
  onToggleNotifications: (enabled: boolean) => void;
}

function SavedSignalCard({ signal, onRemove, onToggleNotifications }: SavedSignalCardProps) {
  // Show a preview of the signal with key metrics and controls
  const [expanded, setExpanded] = useState(false);
  
  const formatDate = (date: Date) => {
    if (!date) return '';
    
    const d = new Date(date);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  const getStatusColor = (side: string) => {
    return side === 'buy' ? 'text-green-400' : 'text-red-400';
  };
  
  // Calculate risk/reward ratio
  const riskRewardRatio = ((signal.takeProfit1 - signal.entryPrice) / 
                          (signal.entryPrice - signal.stopLoss)).toFixed(1);
  
  // Test notification
  const handleTestNotification = () => {
    if (signal.side === 'buy') {
      notificationService.notifyPriceAlert(
        signal.symbol,
        signal.entryPrice - 0.01,
        'above',
        signal.entryPrice,
        signal.market,
        3
      );
    } else {
      notificationService.notifyPriceAlert(
        signal.symbol,
        signal.entryPrice + 0.01,
        'below',
        signal.entryPrice,
        signal.market,
        3
      );
    }
  };
  
  return (
    <PopupContainer padding className="relative p-3 hover:bg-slate-800">
      <div className="flex justify-between mb-1">
        <div className="flex items-center gap-2">
          <div className={`font-bold text-lg ${signal.side === 'buy' ? 'text-green-400' : 'text-red-400'}`}>
            {signal.symbol}
          </div>
          <Badge variant={signal.side === 'buy' ? 'default' : 'destructive'} className="uppercase">
            {signal.side}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {signal.market}
          </Badge>
          {signal.source !== 'user' && (
            <Badge variant="outline" className="bg-purple-900/20 text-purple-300 border-purple-800">
              {signal.source === 'ai' ? 'AI Signal' : 'Copied'}
            </Badge>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <Switch 
            id={`notification-${signal.id}`}
            checked={signal.notificationsEnabled}
            onCheckedChange={onToggleNotifications}
            className="data-[state=checked]:bg-primary"
          />
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onRemove}>
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-7 w-7" 
            onClick={() => setExpanded(!expanded)}
          >
            <ChevronRight className={`h-4 w-4 transition-transform ${expanded ? 'rotate-90' : ''}`} />
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
        <div className="flex items-center gap-1">
          <Target className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-300">Entry:</span>
          <span className="ml-auto">{signal.entryPrice}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingDown className="h-3.5 w-3.5 text-red-400" />
          <span className="text-slate-300">SL:</span>
          <span className="ml-auto">{signal.stopLoss}</span>
        </div>
        <div className="flex items-center gap-1">
          <TrendingUp className="h-3.5 w-3.5 text-green-400" />
          <span className="text-slate-300">TP:</span>
          <span className="ml-auto">{signal.takeProfit1}</span>
        </div>
      </div>
      
      <div className="flex justify-between items-center text-xs text-slate-400">
        <div className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>{formatDate(signal.createdAt)}</span>
        </div>
        <div>
          {signal.timeframe} • R/R {riskRewardRatio}
        </div>
      </div>
      
      {expanded && (
        <div className="mt-3 pt-3 border-t border-slate-700 space-y-2">
          {signal.notes && (
            <div className="text-sm">
              <span className="text-slate-400 text-xs block mb-1">Notes:</span>
              <p className="text-slate-300">{signal.notes}</p>
            </div>
          )}
          
          {signal.takeProfit2 && (
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-3.5 w-3.5 text-green-400" />
              <span className="text-slate-300">TP2:</span>
              <span>{signal.takeProfit2}</span>
            </div>
          )}
          
          {signal.confidence && (
            <div className="flex items-center gap-2 text-sm">
              <span className="text-slate-300">Confidence:</span>
              <div className="w-24 h-2 bg-slate-700 rounded-full">
                <div 
                  className={`h-full rounded-full ${
                    signal.confidence > 70 ? 'bg-green-500' : signal.confidence > 50 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${signal.confidence}%` }}
                />
              </div>
              <span>{signal.confidence}%</span>
            </div>
          )}
          
          <div className="flex justify-end mt-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleTestNotification}
              disabled={!signal.notificationsEnabled}
            >
              Test Notification
            </Button>
          </div>
        </div>
      )}
    </PopupContainer>
  );
}

// Dialog for creating a new custom signal
export function CreateSignalDialog({ onSignalCreate }: { onSignalCreate: (signal: SavedSignal) => void }) {
  const [open, setOpen] = useState(false);
  
  // Form state
  const [symbol, setSymbol] = useState('');
  const [customSymbol, setCustomSymbol] = useState('');
  const [market, setMarket] = useState<'crypto' | 'forex' | 'stocks' | 'futures'>('crypto');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState('');
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit1, setTakeProfit1] = useState('');
  const [takeProfit2, setTakeProfit2] = useState('');
  const [timeframe, setTimeframe] = useState('4h');
  const [notes, setNotes] = useState('');
  const [confidence, setConfidence] = useState('');
  
  // Detect if values are valid
  const isValid = () => {
    const effectiveSymbol = symbol === 'custom' ? customSymbol : symbol;
    return (
      effectiveSymbol && 
      parseFloat(entryPrice) > 0 && 
      parseFloat(stopLoss) > 0 && 
      parseFloat(takeProfit1) > 0 &&
      timeframe && 
      (
        (side === 'buy' && 
          parseFloat(stopLoss) < parseFloat(entryPrice) && 
          parseFloat(entryPrice) < parseFloat(takeProfit1)) ||
        (side === 'sell' && 
          parseFloat(stopLoss) > parseFloat(entryPrice) && 
          parseFloat(entryPrice) > parseFloat(takeProfit1))
      )
    );
  };
  
  // Handle form submission
  const handleSubmit = () => {
    if (!isValid()) return;
    
    const effectiveSymbol = symbol === 'custom' ? customSymbol : symbol;
    
    const newSignal: SavedSignal = {
      id: `user-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      symbol: effectiveSymbol,
      market,
      side,
      entryPrice: parseFloat(entryPrice),
      stopLoss: parseFloat(stopLoss),
      takeProfit1: parseFloat(takeProfit1),
      takeProfit2: takeProfit2 ? parseFloat(takeProfit2) : undefined,
      timeframe,
      confidence: confidence ? parseInt(confidence) : undefined,
      createdAt: new Date(),
      source: 'user',
      notes: notes || undefined,
      notificationsEnabled: true
    };
    
    onSignalCreate(newSignal);
    setOpen(false);
    
    // Reset form
    setSymbol('');
    setCustomSymbol('');
    setMarket('crypto');
    setSide('buy');
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit1('');
    setTakeProfit2('');
    setTimeframe('4h');
    setNotes('');
    setConfidence('');
  };
  
  // Filter symbols based on selected market
  const filteredSymbols = market ? 
    (ALL_TRADING_SYMBOLS.filter(s => s.startsWith(market[0].toUpperCase()))) : 
    ALL_TRADING_SYMBOLS;
  
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-1" />
          Add Signal
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-slate-800 border-slate-700 text-slate-200">
        <DialogHeader>
          <DialogTitle className="text-xl">Create Custom Signal</DialogTitle>
          <DialogDescription>
            Create a signal or price alert for a specific trading instrument
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="market">Market</Label>
              <Select value={market} onValueChange={(value: any) => setMarket(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Market" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="crypto">Cryptocurrency</SelectItem>
                  <SelectItem value="forex">Forex</SelectItem>
                  <SelectItem value="stocks">Stocks</SelectItem>
                  <SelectItem value="futures">Futures</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="symbol">Symbol</Label>
              <Select value={symbol} onValueChange={setSymbol}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Symbol" />
                </SelectTrigger>
                <SelectContent>
                  {filteredSymbols.map(sym => (
                    <SelectItem key={sym} value={sym}>{sym}</SelectItem>
                  ))}
                  <SelectItem value="custom">Custom Symbol</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {symbol === 'custom' && (
            <div className="space-y-2">
              <Label htmlFor="custom-symbol">Custom Symbol</Label>
              <Input 
                id="custom-symbol" 
                placeholder="Enter symbol (e.g., BTCUSD)" 
                value={customSymbol}
                onChange={(e) => setCustomSymbol(e.target.value)}
              />
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="side">Side</Label>
              <Select value={side} onValueChange={(value: any) => setSide(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Side" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="buy">Buy (Long)</SelectItem>
                  <SelectItem value="sell">Sell (Short)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="timeframe">Timeframe</Label>
              <Select value={timeframe} onValueChange={setTimeframe}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Timeframe" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1m">1 Minute</SelectItem>
                  <SelectItem value="5m">5 Minutes</SelectItem>
                  <SelectItem value="15m">15 Minutes</SelectItem>
                  <SelectItem value="30m">30 Minutes</SelectItem>
                  <SelectItem value="1h">1 Hour</SelectItem>
                  <SelectItem value="4h">4 Hours</SelectItem>
                  <SelectItem value="1D">Daily</SelectItem>
                  <SelectItem value="1W">Weekly</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry-price">Entry Price</Label>
              <Input 
                id="entry-price" 
                type="number" 
                step="0.000001" 
                placeholder="0.0" 
                value={entryPrice}
                onChange={(e) => setEntryPrice(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="stop-loss">Stop Loss</Label>
              <Input 
                id="stop-loss" 
                type="number" 
                step="0.000001" 
                placeholder="0.0" 
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="take-profit">Take Profit</Label>
              <Input 
                id="take-profit" 
                type="number" 
                step="0.000001" 
                placeholder="0.0" 
                value={takeProfit1}
                onChange={(e) => setTakeProfit1(e.target.value)}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="take-profit2">Take Profit 2 (Optional)</Label>
              <Input 
                id="take-profit2" 
                type="number" 
                step="0.000001" 
                placeholder="0.0" 
                value={takeProfit2}
                onChange={(e) => setTakeProfit2(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence % (Optional)</Label>
              <Input 
                id="confidence" 
                type="number" 
                min="1" 
                max="100" 
                placeholder="75" 
                value={confidence}
                onChange={(e) => setConfidence(e.target.value)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Input 
              id="notes" 
              placeholder="Add your notes about this signal" 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!isValid()}>Create Signal</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}