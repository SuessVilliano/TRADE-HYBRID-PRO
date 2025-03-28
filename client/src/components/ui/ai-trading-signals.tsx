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
  timeframe: string;
  confidence: number;
  generatedAt: Date;
  expiresAt: Date;
  reason: string;
  status: 'active' | 'completed' | 'invalidated';
  source: 'technical' | 'fundamental' | 'sentiment' | 'hybrid';
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
  
  // Generate mock trading signals
  useEffect(() => {
    if (!apiKeyStatus) {
      setLoading(false);
      return;
    }
    
    // Simulate API loading delay
    setLoading(true);
    const timer = setTimeout(() => {
      const mockSignals = generateMockSignals(25);
      setSignals(mockSignals);
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, [apiKeyStatus]);
  
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
  
  // Refresh signals
  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      const mockSignals = generateMockSignals(25);
      setSignals(mockSignals);
      setLoading(false);
      
      toast({
        title: "Signals refreshed",
        description: "Latest AI trading signals have been loaded.",
      });
    }, 1500);
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
        `You'll receive notifications for ${signal.side.toUpperCase()} signals on ${signal.symbol}`
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
  const calculatePotential = () => {
    const entry = signal.entryPrice;
    const tp1 = signal.takeProfit1;
    
    if (signal.side === 'buy') {
      return ((tp1 - entry) / entry) * 100;
    } else {
      return ((entry - tp1) / entry) * 100;
    }
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
            <Badge variant={signal.side === 'buy' ? 'success' : 'destructive'} className="uppercase text-xs">
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
        
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mb-2">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Entry:</span>
            <span className="font-mono">{signal.entryPrice.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Stop Loss:</span>
            <span className="font-mono text-red-500">{signal.stopLoss.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">Take Profit:</span>
            <span className="font-mono text-green-500">{signal.takeProfit1.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-muted-foreground">R/R Ratio:</span>
            <span className="font-mono">{calculateRiskReward()}</span>
          </div>
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
                Potential: {calculatePotential().toFixed(2)}%
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper function to generate random trading signals
function generateMockSignals(count: number): TradingSignal[] {
  const signals: TradingSignal[] = [];
  const timeframes = ['15m', '1h', '4h', 'D'];
  const sources = ['technical', 'fundamental', 'sentiment', 'hybrid'] as const;
  const statuses = ['active', 'completed', 'invalidated'] as const;
  const performanceStatuses = ['profit', 'loss', 'open'] as const;
  
  // Flatten trading symbols
  const allSymbols = Object.values(TRADING_SYMBOLS).flat();
  
  for (let i = 0; i < count; i++) {
    const symbol = allSymbols[Math.floor(Math.random() * allSymbols.length)];
    const side = Math.random() > 0.5 ? 'buy' : 'sell';
    
    // Generate random price
    const basePrice = symbol.includes('BTC') ? 30000 + Math.random() * 10000 : 
                     symbol.includes('ETH') ? 2000 + Math.random() * 500 :
                     symbol.includes('SOL') ? 80 + Math.random() * 20 :
                     symbol.includes('/USD') ? 1 + Math.random() * 0.2 : 
                     100 + Math.random() * 50;
    
    const entryPrice = basePrice;
    
    // Calculate stop loss and take profit based on side
    const volatility = symbol.includes('BTC') ? 0.03 : 
                      symbol.includes('ETH') ? 0.04 :
                      symbol.includes('SOL') ? 0.05 :
                      0.02;
    
    const stopLoss = side === 'buy' 
      ? entryPrice * (1 - volatility * (0.5 + Math.random() * 0.5))
      : entryPrice * (1 + volatility * (0.5 + Math.random() * 0.5));
    
    const takeProfit1 = side === 'buy'
      ? entryPrice * (1 + volatility * (1 + Math.random()))
      : entryPrice * (1 - volatility * (1 + Math.random()));
    
    const takeProfit2 = side === 'buy'
      ? takeProfit1 * 1.1
      : takeProfit1 * 0.9;
    
    // Generate dates
    const now = new Date();
    const hoursAgo = Math.floor(Math.random() * 48);
    const generatedAt = new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
    const expiresAt = new Date(generatedAt.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    // Generate performance data
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    let performance = undefined;
    
    if (status !== 'active') {
      const perfStatus = performanceStatuses[Math.floor(Math.random() * performanceStatuses.length)];
      performance = {
        pips: Math.floor(Math.random() * 100),
        percentage: Math.random() * 10,
        status: perfStatus
      };
    }
    
    // Generate indicators
    const indicators = [
      {
        name: 'RSI',
        value: Math.floor(Math.random() * 100).toString(),
        bullish: Math.random() > 0.5
      },
      {
        name: 'MACD',
        value: Math.random() > 0.5 ? 'Bullish Crossover' : 'Bearish Crossover',
        bullish: Math.random() > 0.5
      },
      {
        name: 'MA',
        value: Math.random() > 0.5 ? 'Above 200 MA' : 'Below 200 MA',
        bullish: Math.random() > 0.5
      }
    ];
    
    signals.push({
      id: `signal-${i}`,
      symbol,
      side,
      entryPrice,
      stopLoss,
      takeProfit1,
      takeProfit2,
      timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
      confidence: 50 + Math.floor(Math.random() * 50),
      generatedAt,
      expiresAt,
      reason: `Signal based on ${sources[Math.floor(Math.random() * sources.length)]} analysis`,
      status,
      source: sources[Math.floor(Math.random() * sources.length)],
      indicators,
      performance
    });
  }
  
  return signals;
}