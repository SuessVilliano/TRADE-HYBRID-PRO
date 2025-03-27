import { useState, useEffect } from 'react';
import { useBrokerAggregator } from '@/lib/stores/useBrokerAggregator';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from './card';
import { Button } from './button';
import { Badge } from './badge';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Progress } from './progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Input } from './input';
import { Slider } from './slider';
import { Switch } from './switch';
import { 
  LineChart, 
  BarChart4, 
  Users, 
  Trophy, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Info, 
  AlertCircle, 
  Activity 
} from 'lucide-react';
import { formatCurrency, formatPercentage } from '@/lib/utils';
import { TooltipProvider, Tooltip, TooltipTrigger, TooltipContent } from './tooltip';

interface TopTrader {
  id: string;
  name: string;
  profitability: number;
  drawdown: number;
  winRate: number;
  markets: string[];
  followers: number;
  avgTradeTime: string;
  avatar?: string;
}

export function CopyTradePanel() {
  const { isAuthenticated, currentBroker } = useBrokerAggregator();
  const [topTraders, setTopTraders] = useState<TopTrader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<TopTrader | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [copyTradeSettings, setCopyTradeSettings] = useState({
    allocationPercentage: 10,
    maxConcurrentTrades: 5,
    autoClose: true,
    copyStopLoss: true,
    copyTakeProfit: true,
    riskMultiplier: 1
  });
  
  const isTradeLockerConnected = isAuthenticated && currentBroker === 'tradelocker';
  
  useEffect(() => {
    if (isTradeLockerConnected) {
      fetchTopTraders();
    }
  }, [isTradeLockerConnected, activeTab]);
  
  const fetchTopTraders = async () => {
    setIsLoading(true);
    
    try {
      // In a real implementation, this would fetch traders from the broker aggregator service
      // For now, we'll simulate the response with placeholder data
      const mock: TopTrader[] = [
        {
          id: 'trader1',
          name: 'AlphaTrader',
          profitability: 28.5,
          drawdown: 12.3,
          winRate: 68,
          markets: ['crypto', 'forex'],
          followers: 1243,
          avgTradeTime: '3.5 days',
          avatar: 'https://avatars.githubusercontent.com/u/1'
        },
        {
          id: 'trader2',
          name: 'CryptoMaster',
          profitability: 42.7,
          drawdown: 24.8,
          winRate: 62,
          markets: ['crypto'],
          followers: 3521,
          avgTradeTime: '1.2 days',
          avatar: 'https://avatars.githubusercontent.com/u/2'
        },
        {
          id: 'trader3',
          name: 'ForexPro',
          profitability: 18.2,
          drawdown: 8.1,
          winRate: 72,
          markets: ['forex'],
          followers: 852,
          avgTradeTime: '5.3 days',
          avatar: 'https://avatars.githubusercontent.com/u/3'
        },
        {
          id: 'trader4',
          name: 'StockGuru',
          profitability: 15.9,
          drawdown: 7.5,
          winRate: 75,
          markets: ['stocks'],
          followers: 1105,
          avgTradeTime: '12.7 days',
          avatar: 'https://avatars.githubusercontent.com/u/4'
        }
      ];
      
      // Filter based on selected market
      let filteredTraders = mock;
      if (activeTab !== 'all') {
        filteredTraders = mock.filter(trader => 
          trader.markets.includes(activeTab)
        );
      }
      
      setTopTraders(filteredTraders);
    } catch (error) {
      console.error('Failed to fetch top traders:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopyTrader = async (trader: TopTrader) => {
    if (!isTradeLockerConnected) {
      console.error('TradeLocker is not connected');
      return;
    }
    
    setSelectedTrader(trader);
  };
  
  const startCopyTrading = async () => {
    if (!selectedTrader || !isTradeLockerConnected) return;
    
    setIsLoading(true);
    
    try {
      // In a real implementation, this would start copy trading using the broker service
      console.log(`Starting copy trading for ${selectedTrader.name} with settings:`, copyTradeSettings);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset selection after successful setup
      setSelectedTrader(null);
      
      // Show some success message (in a real app)
      alert(`Successfully started copy trading with ${selectedTrader.name}!`);
    } catch (error) {
      console.error('Failed to start copy trading:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateCopyTradeSettings = (key: keyof typeof copyTradeSettings, value: any) => {
    setCopyTradeSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  if (!isTradeLockerConnected) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Users className="h-5 w-5" />
            <span>Copy Trading</span>
          </CardTitle>
          <CardDescription>
            Connect to TradeLocker to access copy trading features
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center p-6 text-center">
          <AlertCircle className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">TradeLocker Not Connected</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Connect to TradeLocker in the broker settings to enable copy trading features.
            TradeLocker provides access to top traders across multiple markets.
          </p>
          <Button variant="outline">Open Broker Settings</Button>
        </CardContent>
      </Card>
    );
  }
  
  if (selectedTrader) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <Users className="h-5 w-5" />
                <span>Copy Trader Settings</span>
              </CardTitle>
              <CardDescription>
                Configure how you want to copy {selectedTrader.name}
              </CardDescription>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setSelectedTrader(null)}
            >
              Back to traders
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6 p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
            <Avatar className="h-16 w-16">
              <AvatarImage src={selectedTrader.avatar} alt={selectedTrader.name} />
              <AvatarFallback>{selectedTrader.name.substring(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-lg font-semibold">{selectedTrader.name}</h3>
              <div className="flex flex-wrap gap-2 mt-1">
                {selectedTrader.markets.map(market => (
                  <Badge key={market} variant="secondary" className="capitalize">
                    {market}
                  </Badge>
                ))}
                <Badge variant="outline" className="gap-1">
                  <Users className="h-3 w-3" />
                  <span>{selectedTrader.followers.toLocaleString()}</span>
                </Badge>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div>
                  <div className="text-xs text-muted-foreground">Profit</div>
                  <div className="font-semibold text-green-500">
                    {formatPercentage(selectedTrader.profitability)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Win Rate</div>
                  <div className="font-semibold">{selectedTrader.winRate}%</div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">Max DD</div>
                  <div className="font-semibold text-red-500">
                    {formatPercentage(-selectedTrader.drawdown)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-5">
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Capital Allocation
                </label>
                <span className="text-sm">{copyTradeSettings.allocationPercentage}%</span>
              </div>
              <Slider 
                value={[copyTradeSettings.allocationPercentage]} 
                min={1} 
                max={100}
                step={1}
                onValueChange={(value) => updateCopyTradeSettings('allocationPercentage', value[0])}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Percentage of your account to allocate for copy trading
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Max Concurrent Trades
                </label>
                <span className="text-sm">{copyTradeSettings.maxConcurrentTrades}</span>
              </div>
              <Slider 
                value={[copyTradeSettings.maxConcurrentTrades]} 
                min={1} 
                max={20}
                step={1}
                onValueChange={(value) => updateCopyTradeSettings('maxConcurrentTrades', value[0])}
              />
            </div>
            
            <div>
              <div className="flex justify-between mb-2">
                <label className="text-sm font-medium">
                  Risk Multiplier
                </label>
                <span className="text-sm">{copyTradeSettings.riskMultiplier}x</span>
              </div>
              <Slider 
                value={[copyTradeSettings.riskMultiplier]} 
                min={0.1} 
                max={3}
                step={0.1}
                onValueChange={(value) => updateCopyTradeSettings('riskMultiplier', value[0])}
              />
              <div className="text-xs text-muted-foreground mt-1">
                Multiply or reduce the position sizes relative to the trader's risk
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Auto Close</label>
                <Switch 
                  checked={copyTradeSettings.autoClose}
                  onCheckedChange={(checked) => updateCopyTradeSettings('autoClose', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Copy Stop Loss</label>
                <Switch 
                  checked={copyTradeSettings.copyStopLoss}
                  onCheckedChange={(checked) => updateCopyTradeSettings('copyStopLoss', checked)}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Copy Take Profit</label>
                <Switch 
                  checked={copyTradeSettings.copyTakeProfit}
                  onCheckedChange={(checked) => updateCopyTradeSettings('copyTakeProfit', checked)}
                />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between border-t pt-4">
          <Button 
            variant="outline" 
            onClick={() => setSelectedTrader(null)}
          >
            Cancel
          </Button>
          <Button onClick={startCopyTrading} disabled={isLoading}>
            {isLoading ? 'Setting up...' : 'Start Copy Trading'}
          </Button>
        </CardFooter>
      </Card>
    );
  }
  
  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <Users className="h-5 w-5" />
          <span>Copy Trading</span>
        </CardTitle>
        <CardDescription>
          Follow and copy trades from top-performing traders
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="grid grid-cols-5">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="crypto">Crypto</TabsTrigger>
            <TabsTrigger value="forex">Forex</TabsTrigger>
            <TabsTrigger value="stocks">Stocks</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
            </div>
          ) : (
            topTraders.map(trader => (
              <div 
                key={trader.id} 
                className="border rounded-md p-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={trader.avatar} alt={trader.name} />
                    <AvatarFallback>{trader.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <h3 className="font-semibold">{trader.name}</h3>
                      <div className="flex items-center">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="text-sm font-medium text-green-500 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" />
                                {formatPercentage(trader.profitability)}
                              </div>
                            </TooltipTrigger>
                            <TooltipContent side="top">
                              <p>3-month profitability</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {trader.markets.map(market => (
                        <Badge key={market} variant="secondary" className="capitalize text-xs">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mt-3 text-sm">
                  <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Trophy className="h-3 w-3" />
                      <span>Win Rate</span>
                    </div>
                    <div className="font-medium">{trader.winRate}%</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <ArrowDownRight className="h-3 w-3" />
                      <span>Drawdown</span>
                    </div>
                    <div className="font-medium text-red-500">
                      {formatPercentage(-trader.drawdown)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>Followers</span>
                    </div>
                    <div className="font-medium">{trader.followers.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>Avg. Trade</span>
                    </div>
                    <div className="font-medium">{trader.avgTradeTime}</div>
                  </div>
                </div>
                
                <div className="mt-4 flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => handleCopyTrader(trader)}
                  >
                    Copy Trader
                  </Button>
                </div>
              </div>
            ))
          )}
          
          {!isLoading && topTraders.length === 0 && (
            <div className="py-8 text-center">
              <Activity className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-semibold">No traders found</h3>
              <p className="text-sm text-muted-foreground">
                No traders match your current filters.
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}