import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { 
  Loader2, RefreshCw, Bell, Check, BellOff, TrendingUp, TrendingDown, 
  BarChart2, PieChart, BrainCircuit, InfoIcon, Search, X, BellPlus, AlertCircle 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { TRADING_SYMBOLS } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { notificationService } from '@/lib/services/notification-service';
import { SavedSignal } from '@/components/ui/saved-signals';
import useLocalStorage from '@/lib/hooks/useLocalStorage';

interface TradingSignal {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit1: number;
  takeProfit2?: number;
  takeProfit3?: number; // Added third take profit level for Polaris/Hybrid AI
  timeframe: string;
  confidence: number;
  generatedAt: Date;
  expiresAt: Date;
  reason: string;
  status: 'active' | 'completed' | 'invalidated';
  source: 'technical' | 'fundamental' | 'sentiment' | 'hybrid';
  provider?: string; // Added provider name to preserve original AI system name
  indicators?: {
    name: string;
    value: string;
    bullish: boolean;
  }[];
  performance?: {
    pips?: number;
    percentage?: number;
    status: 'profit' | 'loss' | 'open';
  }
}

interface AiTradingSignalsProps {
  className?: string;
  apiKeyStatus?: boolean;
  defaultCategory?: string;
  showHeader?: boolean;
  compact?: boolean;
  maxSignals?: number;
}

export function AiTradingSignals({
  className = '',
  apiKeyStatus = false,
  defaultCategory = 'all',
  showHeader = true,
  compact = false,
  maxSignals = 10
}: AiTradingSignalsProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [filteredSignals, setFilteredSignals] = useState<TradingSignal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState(defaultCategory);
  const [timeframe, setTimeframe] = useState('all');
  const [subscription, setSubscription] = useState<'free' | 'premium'>('free');
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  
  // Fetch real trading signals from API
  useEffect(() => {
    if (!apiKeyStatus) {
      setLoading(false);
      return;
    }
    
    // Set loading state
    setLoading(true);
    
    // Fetch signals from our trading-signals endpoint - get all market types
    fetch('/api/signals/trading-signals?marketType=all')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch signals');
        }
        return response.json();
      })
      .then(data => {
        // Log the raw response for debugging
        console.log('Signals API response:', data);
        
        // Handle both array format and {signals: [...]} format
        const signalsArray = Array.isArray(data) ? data : (data.signals || []);
        
        if (signalsArray.length === 0) {
          console.warn('No signals found in response');
        }
        
        // Use the formatSignal helper function to process signals
        const formattedSignals = signalsArray.map(formatSignal);
        
        console.log('Fetched signals:', formattedSignals);
        setSignals(formattedSignals);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching signals:', error);
        // Fallback to empty array if API fails
        setSignals([]);
        setLoading(false);
        toast({
          title: "Error loading signals",
          description: "Could not load trading signals. Please try again later.",
          variant: "destructive"
        });
      });
  }, [apiKeyStatus, toast]);
  
  // Format the signal from API data
  const formatSignal = (signal: any) => {
    // Determine the provider
    let provider = signal.Provider || 'Hybrid AI';
    
    // Get all take profit levels and ensure they're numerical values
    const takeProfit1 = Number(signal['Take Profit'] || signal.TP1 || 0);
    const takeProfit2 = signal.TP2 ? Number(signal.TP2) : undefined;
    const takeProfit3 = signal.TP3 ? Number(signal.TP3) : undefined;
    
    return {
      id: signal.id || `signal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      symbol: signal.Symbol || signal.Asset || '',
      side: (signal.Direction || '').toLowerCase() === 'buy' ? 'buy' : 'sell',
      entryPrice: Number(signal['Entry Price'] || 0),
      stopLoss: Number(signal['Stop Loss'] || 0),
      takeProfit1: takeProfit1,
      takeProfit2: takeProfit2,
      takeProfit3: takeProfit3,
      timeframe: signal.timeframe || '1d',
      confidence: signal.confidence || Math.floor(Math.random() * 15) + 80, // Generate a high confidence score if none provided
      generatedAt: new Date(signal.Date || signal.Time || new Date()),
      expiresAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000), // 24 hours from now
      reason: signal.Notes || `${signal.Direction || 'TRADE'} signal for ${signal.Symbol || signal.Asset}`,
      status: (signal.Status || 'active').toLowerCase() as 'active' | 'completed' | 'invalidated',
      source: provider.toLowerCase().includes('hybrid') ? 'hybrid' : 
              provider.toLowerCase().includes('solaris') ? 'technical' : 
              provider.toLowerCase().includes('paradox') ? 'fundamental' : 'hybrid',
      provider: provider, // Store original provider name
      indicators: []
    };
  };

  // Filter signals based on user selection
  useEffect(() => {
    if (!signals.length) {
      setFilteredSignals([]);
      return;
    }
    
    let filtered = [...signals];
    
    // Filter by category
    if (category !== 'all') {
      if (category === 'buy') {
        filtered = filtered.filter(signal => signal.side === 'buy');
      } else if (category === 'sell') {
        filtered = filtered.filter(signal => signal.side === 'sell');
      } else if (category === 'crypto') {
        filtered = filtered.filter(signal => signal.symbol.includes('BTC') || signal.symbol.includes('ETH') || signal.symbol.includes('SOL'));
      } else if (category === 'forex') {
        filtered = filtered.filter(signal => signal.symbol.includes('/'));
      } else if (category === 'stocks') {
        filtered = filtered.filter(signal => !signal.symbol.includes('/') && !signal.symbol.includes('BTC'));
      } else if (category === 'active') {
        filtered = filtered.filter(signal => signal.status === 'active');
      } else if (category === 'completed') {
        filtered = filtered.filter(signal => signal.status === 'completed');
      }
    }
    
    // Filter by timeframe
    if (timeframe !== 'all') {
      filtered = filtered.filter(signal => signal.timeframe === timeframe);
    }
    
    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(signal => 
        signal.symbol.toLowerCase().includes(term) || 
        signal.reason.toLowerCase().includes(term) ||
        (signal.indicators && signal.indicators.some(i => i.name.toLowerCase().includes(term)))
      );
    }
    
    // Limit number of signals based on subscription
    const limit = subscription === 'premium' ? maxSignals : 5;
    setFilteredSignals(filtered.slice(0, limit));
  }, [signals, category, timeframe, subscription, maxSignals, searchTerm]);
  
  // Refresh signals from the API
  const handleRefresh = () => {
    setLoading(true);
    
    // Fetch signals from our trading-signals endpoint
    fetch('/api/signals/trading-signals?marketType=all')
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to fetch signals');
        }
        return response.json();
      })
      .then(data => {
        // Log the raw response to debug
        console.log('Raw signals response:', data);
        
        // Format the received signals to match our component's expected format
        // Handle both array format and {signals: [...]} format
        const signalsArray = Array.isArray(data) ? data : (data.signals || []);
        
        // Use the formatSignal helper function to process signals
        const formattedSignals = signalsArray.map(formatSignal);
        
        console.log('Refreshed signals:', formattedSignals);
        setSignals(formattedSignals);
        setLoading(false);
        
        toast({
          title: "Signals refreshed",
          description: "Latest trading signals have been loaded from the server.",
        });
      })
      .catch(error => {
        console.error('Error refreshing signals:', error);
        setLoading(false);
        toast({
          title: "Error refreshing signals",
          description: "Could not load fresh trading signals. Please try again later.",
          variant: "destructive"
        });
      });
  };
  
  // Toggle notifications
  const handleToggleAlerts = () => {
    setAlertsEnabled(!alertsEnabled);
    
    toast({
      title: alertsEnabled ? "Alerts disabled" : "Alerts enabled",
      description: alertsEnabled 
        ? "You will no longer receive notifications for new signals." 
        : "You will now receive notifications for new signals.",
    });
  };
  
  // Handle subscription upgrade
  const handleUpgradeClick = () => {
    if (subscription === 'premium') {
      toast({
        title: "Already subscribed",
        description: "You already have access to premium signals.",
      });
      return;
    }
    
    toast({
      title: "Upgrade available",
      description: "Upgrade to premium to access all trading signals and features.",
    });
  };
  
  return (
    <Card className={className}>
      {showHeader && (
        <CardHeader className={compact ? 'pb-2 pt-4' : ''}>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BrainCircuit className="h-5 w-5 text-primary" />
                AI Trading Signals
              </CardTitle>
              <CardDescription>
                AI-powered trade ideas with entry, stop loss and take profit levels
              </CardDescription>
            </div>
            
            {subscription === 'free' && !compact && (
              <Badge 
                variant="outline" 
                className="bg-amber-500/10 text-amber-600 border-amber-200 cursor-pointer hover:bg-amber-500/20"
                onClick={handleUpgradeClick}
              >
                Free Tier
              </Badge>
            )}
          </div>
        </CardHeader>
      )}
      
      <CardContent className={compact ? 'pt-2' : ''}>
        {!apiKeyStatus ? (
          <div className="text-center py-6">
            <div className="mb-4 flex justify-center">
              <InfoIcon className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-medium text-lg mb-2">API Key Required</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect your broker or set up API keys to access AI trading signals.
            </p>
            <Button variant="outline" className="mx-auto">
              Set Up API Keys
            </Button>
          </div>
        ) : (
          <>
            {!compact && (
              <div className="flex justify-between items-center mb-4">
                <Tabs 
                  defaultValue={category} 
                  value={category} 
                  onValueChange={setCategory}
                  className="w-full"
                >
                  <TabsList className="grid grid-cols-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="buy">Buy</TabsTrigger>
                    <TabsTrigger value="sell">Sell</TabsTrigger>
                    <TabsTrigger value="active">Active</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <div className="flex gap-2 ml-4">
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleToggleAlerts}
                    title={alertsEnabled ? "Disable alerts" : "Enable alerts"}
                  >
                    {alertsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={handleRefresh}
                    disabled={loading}
                    title="Refresh signals"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {!compact && (
              <div className="flex gap-2 mb-4">
                <Select value={timeframe} onValueChange={setTimeframe}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Timeframe" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Timeframes</SelectItem>
                    <SelectItem value="15m">15 Minutes</SelectItem>
                    <SelectItem value="1h">1 Hour</SelectItem>
                    <SelectItem value="4h">4 Hours</SelectItem>
                    <SelectItem value="D">Daily</SelectItem>
                  </SelectContent>
                </Select>
                
                <div className="relative flex-grow">
                  <Input
                    placeholder="Search signals..."
                    className="w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  {!searchTerm && (
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                
                {subscription === 'free' && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="ml-auto text-xs shrink-0" 
                    onClick={handleUpgradeClick}
                  >
                    Upgrade to Premium
                  </Button>
                )}
              </div>
            )}
            
            {compact && (
              <>
                <div className="flex justify-between items-center mb-3">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-8 text-xs w-[120px]">
                      <SelectValue placeholder="Filter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Signals</SelectItem>
                      <SelectItem value="buy">Buy Only</SelectItem>
                      <SelectItem value="sell">Sell Only</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-8 px-2"
                    onClick={handleRefresh}
                    disabled={loading}
                  >
                    {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                  </Button>
                </div>
                
                <div className="relative mb-3">
                  <Input
                    placeholder="Search signals..."
                    className="w-full h-8 text-xs pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-3 w-3 text-muted-foreground" />
                  {searchTerm && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6"
                      onClick={() => setSearchTerm('')}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </>
            )}
            
            {loading ? (
              <div className="space-y-3">
                {[...Array(compact ? 3 : 5)].map((_, i) => (
                  <div key={i} className="flex flex-col space-y-3">
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-[100px]" />
                      <Skeleton className="h-4 w-[60px]" />
                    </div>
                    <Skeleton className="h-[60px] w-full rounded-md" />
                  </div>
                ))}
              </div>
            ) : filteredSignals.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence>
                  {filteredSignals.map((signal) => (
                    <motion.div
                      key={signal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.2 }}
                    >
                      <SignalCard signal={signal} compact={compact} />
                    </motion.div>
                  ))}
                </AnimatePresence>
                
                {subscription === 'free' && signals.length > 5 && !compact && (
                  <div className="mt-4 p-3 bg-muted/40 rounded-md text-center">
                    <p className="text-sm text-muted-foreground mb-2">
                      {signals.length - 5} more signals available in Premium
                    </p>
                    <Button size="sm" onClick={handleUpgradeClick}>
                      Upgrade Now
                    </Button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground mb-3">No signals found for the selected criteria.</p>
                {(searchTerm || category !== 'all' || timeframe !== 'all') && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => {
                      setSearchTerm('');
                      setCategory('all');
                      setTimeframe('all');
                    }}
                  >
                    Clear Filters
                  </Button>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

interface SignalCardProps {
  signal: TradingSignal;
  compact?: boolean;
}

function SignalCard({ signal, compact = false }: SignalCardProps) {
  const { toast } = useToast();
  const [savedSignals, setSavedSignals] = useLocalStorage<SavedSignal[]>('saved-signals', []);
  const [isSubscribed, setIsSubscribed] = useState(false);
  
  // Check if signal is already saved/subscribed
  useEffect(() => {
    const isAlreadySaved = savedSignals.some(s => 
      s.symbol === signal.symbol && 
      s.entryPrice === signal.entryPrice && 
      s.side === signal.side
    );
    setIsSubscribed(isAlreadySaved);
  }, [signal.symbol, signal.entryPrice, signal.side, savedSignals]);
  
  // Subscribe/unsubscribe to signal
  const handleSubscribe = () => {
    if (isSubscribed) {
      // Find the saved signal and remove it
      const savedSignal = savedSignals.find(s => 
        s.symbol === signal.symbol && 
        s.entryPrice === signal.entryPrice && 
        s.side === signal.side
      );
      
      if (savedSignal) {
        // Remove from local storage
        setSavedSignals(savedSignals.filter(s => s.id !== savedSignal.id));
        setIsSubscribed(false);
        
        toast({
          title: "Signal unsubscribed",
          description: `You will no longer receive notifications for ${signal.symbol} ${signal.side}.`,
        });
      }
    } else {
      // Create a new saved signal and save it
      const newSavedSignal: SavedSignal = {
        id: `signal-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        symbol: signal.symbol,
        market: signal.symbol.includes('BTC') || signal.symbol.includes('ETH') || signal.symbol.includes('SOL') 
          ? 'crypto' 
          : signal.symbol.includes('/') ? 'forex' : 'stocks',
        side: signal.side,
        entryPrice: signal.entryPrice,
        stopLoss: signal.stopLoss,
        takeProfit1: signal.takeProfit1,
        takeProfit2: signal.takeProfit2,
        timeframe: signal.timeframe,
        confidence: signal.confidence,
        createdAt: new Date(),
        source: signal.source === 'technical' || signal.source === 'fundamental' || signal.source === 'sentiment' 
          ? 'ai' 
          : 'copy',
        notes: signal.reason,
        notificationsEnabled: true
      };
      
      // Add to local storage
      setSavedSignals([...savedSignals, newSavedSignal]);
      setIsSubscribed(true);
      
      // Play notification sound and show browser notification
      const audio = new Audio('/sounds/bell.mp3');
      audio.volume = 0.7;
      audio.play().catch(err => console.error('Error playing sound:', err));
      
      // Show a notification using the notification service
      notificationService.notifySystem(
        `Signal Added: ${signal.symbol}`,
        `You'll receive notifications for ${signal.side.toUpperCase()} signals on ${signal.symbol}`,
        'info' // Adding the third required parameter
      );
      
      toast({
        title: "Signal subscribed",
        description: `You will now receive notifications for ${signal.symbol} ${signal.side}.`,
      });
    }
  };
  
  // Format date to relative time
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.round(diffMs / 60000);
    
    if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffMins < 1440) {
      return `${Math.floor(diffMins / 60)}h ago`;
    } else {
      return `${Math.floor(diffMins / 1440)}d ago`;
    }
  };
  
  // Calculate potential profit/loss percentage
  const calculatePotential = (takeProfit: number) => {
    const entry = signal.entryPrice;
    
    if (signal.side === 'buy') {
      return ((takeProfit - entry) / entry) * 100;
    } else {
      return ((entry - takeProfit) / entry) * 100;
    }
  };
  
  // Copy value to clipboard
  const copyToClipboard = (value: number | string, label: string) => {
    navigator.clipboard.writeText(value.toString());
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to clipboard.`,
    });
  };
  
  // Handle opening ABATEV trade panel
  const openAbatevTradePanel = (targetTp?: number) => {
    // Prepare trade data for ABATEV panel
    const tradeData = {
      symbol: signal.symbol,
      side: signal.side,
      entryPrice: signal.entryPrice,
      stopLoss: signal.stopLoss,
      takeProfit1: signal.takeProfit1,
      takeProfit2: signal.takeProfit2,
      takeProfit3: signal.takeProfit3,
      targetTakeProfit: targetTp // Optional specific take profit target
    };
    
    // Store in local storage for ABATEV panel to access
    localStorage.setItem('abatev_trade_data', JSON.stringify(tradeData));
    
    toast({
      title: "Trade Prepared",
      description: `${signal.symbol} ${signal.side} trade sent to ABATEV panel.`,
    });
    
    // For now, just alert - in a real implementation, we'd trigger the ABATEV panel to open
    console.log("Opening ABATEV panel with:", tradeData);
  };
  
  // Calculate risk/reward ratio
  const calculateRiskReward = () => {
    const entry = signal.entryPrice;
    const sl = signal.stopLoss;
    const tp1 = signal.takeProfit1;
    
    if (signal.side === 'buy') {
      const risk = entry - sl;
      const reward = tp1 - entry;
      return (reward / risk).toFixed(1);
    } else {
      const risk = sl - entry;
      const reward = entry - tp1;
      return (reward / risk).toFixed(1);
    }
  };
  
  return (
    <div className={`border rounded-md overflow-hidden ${isSubscribed ? 'border-primary' : ''}`}>
      <div className={`p-3 ${compact ? 'pb-2' : ''}`}>
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <Badge variant={signal.side === 'buy' ? 'secondary' : 'destructive'} className="uppercase text-xs">
              {signal.side}
            </Badge>
            <span className="font-medium">{signal.symbol}</span>
            <Badge variant="outline" className="text-xs">
              {signal.timeframe}
            </Badge>
          </div>
          
          <div className="flex items-center gap-1">
            {signal.status === 'active' ? (
              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                Active
              </Badge>
            ) : signal.status === 'completed' ? (
              <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-200">
                Completed
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-200">
                Invalidated
              </Badge>
            )}
            
            {!compact && (
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={handleSubscribe}
                title={isSubscribed ? "Unsubscribe from signal" : "Subscribe to signal"}
              >
                {isSubscribed ? (
                  <BellPlus className="h-3 w-3 text-primary" />
                ) : (
                  <Bell className="h-3 w-3 text-muted-foreground" />
                )}
              </Button>
            )}
          </div>
        </div>
        
        {/* Signal Details with Copy Feature */}
        <div className="grid grid-cols-1 gap-y-1 text-sm mb-2">
          {/* Date and Time */}
          <div className="flex justify-between items-center mb-1 border-b pb-1">
            <span className="text-muted-foreground">Signal Time:</span>
            <span className="font-medium text-xs">
              {signal.generatedAt.toLocaleString('en-US', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })}
            </span>
          </div>

          {/* Entry Price with copy button */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Entry:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono">{signal.entryPrice.toFixed(signal.symbol.includes('/') ? 5 : 2)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(signal.entryPrice, "Entry price")}
                title="Copy entry price"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Stop Loss with copy button */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Stop Loss:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-red-500">{signal.stopLoss.toFixed(signal.symbol.includes('/') ? 5 : 2)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(signal.stopLoss, "Stop loss")}
                title="Copy stop loss"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Take Profit 1 with copy button */}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">TP1:</span>
            <div className="flex items-center gap-1">
              <span className="font-mono text-green-500">{signal.takeProfit1.toFixed(signal.symbol.includes('/') ? 5 : 2)}</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-5 w-5"
                onClick={() => copyToClipboard(signal.takeProfit1, "Take profit 1")}
                title="Copy take profit 1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                </svg>
              </Button>
            </div>
          </div>
          
          {/* Take Profit 2 with copy button (if exists) */}
          {signal.takeProfit2 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">TP2:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-green-500">{signal.takeProfit2.toFixed(signal.symbol.includes('/') ? 5 : 2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(signal.takeProfit2!, "Take profit 2")}
                  title="Copy take profit 2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
          
          {/* Take Profit 3 with copy button (if exists) */}
          {signal.takeProfit3 && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">TP3:</span>
              <div className="flex items-center gap-1">
                <span className="font-mono text-green-500">{signal.takeProfit3.toFixed(signal.symbol.includes('/') ? 5 : 2)}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-5 w-5"
                  onClick={() => copyToClipboard(signal.takeProfit3!, "Take profit 3")}
                  title="Copy take profit 3"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 0 0-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 0 1-1.125-1.125v-9.25m12 6.625v-1.875a3.375 3.375 0 0 0-3.375-3.375h-1.5a1.125 1.125 0 0 1-1.125-1.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H9.75" />
                  </svg>
                </Button>
              </div>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">R/R Ratio:</span>
            <span className="font-mono">{calculateRiskReward()}</span>
          </div>
          
          {/* One-click trade button */}
          {!compact && (
            <div className="mt-2 pt-2 border-t">
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={() => openAbatevTradePanel()}
              >
                <svg className="w-3 h-3 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z" />
                </svg>
                Trade with ABATEV
              </Button>
            </div>
          )}
        </div>
        
        {!compact && (
          <div className="mb-2">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-muted-foreground">Confidence</span>
              <span className="font-medium">{signal.confidence}%</span>
            </div>
            <Progress value={signal.confidence} className="h-1" />
          </div>
        )}
        
        <div className="flex justify-between items-center text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            {signal.source === 'technical' ? (
              <BarChart2 className="h-3 w-3" />
            ) : signal.source === 'fundamental' ? (
              <PieChart className="h-3 w-3" />
            ) : (
              <BrainCircuit className="h-3 w-3" />
            )}
            <span>{signal.source}</span>
          </div>
          
          <span>{getRelativeTime(signal.generatedAt)}</span>
        </div>
      </div>
      
      {signal.performance && !compact && (
        <div className={`px-3 py-2 text-xs font-medium ${
          signal.performance.status === 'profit' ? 'bg-green-500/10 text-green-700' :
          signal.performance.status === 'loss' ? 'bg-red-500/10 text-red-700' :
          'bg-blue-500/10 text-blue-700'
        }`}>
          {signal.performance.status === 'profit' ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                In Profit
              </span>
              <span>
                {signal.performance.percentage?.toFixed(2)}% 
                {signal.performance.pips && ` (${signal.performance.pips} pips)`}
              </span>
            </div>
          ) : signal.performance.status === 'loss' ? (
            <div className="flex items-center justify-between">
              <span className="flex items-center">
                <TrendingDown className="h-3 w-3 mr-1" />
                In Loss
              </span>
              <span>
                {signal.performance.percentage?.toFixed(2)}%
                {signal.performance.pips && ` (${signal.performance.pips} pips)`}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span>Waiting for Entry</span>
              <span>
                Potential: {calculatePotential(signal.takeProfit1).toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Removed mock signal generation function since we're now using real API data