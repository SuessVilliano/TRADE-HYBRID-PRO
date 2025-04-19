import { useState, useEffect } from 'react';
import { ScrollArea } from './scroll-area';
import { Button } from './button';
import { X, Medal, Trophy, Share2, UserPlus, ArrowUp, ArrowDown, Info } from 'lucide-react';
import { useLeaderboard } from '@/lib/stores/useLeaderboard';
import { Trader } from '@/lib/types';
import { useMultiplayer, Friend } from '@/lib/stores/useMultiplayer';
import { formatCurrency, formatPercent as formatPercentage } from '@/lib/utils/formatters';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Avatar, AvatarFallback, AvatarImage } from './avatar';
import { Input } from './input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';

/**
 * Leaderboard Popup Component
 * - Displays trading leaderboards
 * - Shows trader profiles and performance statistics
 * - Allows filtering and searching for traders
 * - Supports adding traders as friends
 */
export function LeaderboardPopup({
  isOpen,
  onClose
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { traders, fetchLeaderboard } = useLeaderboard();
  const { friends, sendFriendRequest, isPlayerFriend } = useMultiplayer();
  const [selectedTrader, setSelectedTrader] = useState<Trader | null>(null);
  const [timeframe, setTimeframe] = useState('all'); // 'day', 'week', 'month', 'all'
  const [sortBy, setSortBy] = useState('pnl'); // 'pnl', 'winRate', 'tradeCount'
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'global' | 'friends'>('global');
  
  // Fetch leaderboard when component opens
  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [fetchLeaderboard, isOpen]);

  // Filter and sort traders
  const filteredTraders = () => {
    let result = [...traders];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(trader => 
        trader.username.toLowerCase().includes(query)
      );
    }
    
    // Apply view mode filter (global vs friends)
    if (viewMode === 'friends') {
      const friendIds = friends.map(friend => friend.id);
      result = result.filter(trader => friendIds.includes(trader.id));
    }
    
    // Sort by selected criteria
    result.sort((a, b) => {
      if (sortBy === 'pnl') {
        return b.pnl - a.pnl;
      } else if (sortBy === 'winRate') {
        return b.winRate - a.winRate;
      } else if (sortBy === 'tradeCount') {
        return b.tradeCount - a.tradeCount;
      }
      return 0;
    });
    
    return result;
  };

  // Send friend request to a trader
  const handleAddFriend = (traderId: string, event?: React.MouseEvent) => {
    if (event) {
      event.stopPropagation();
    }
    
    sendFriendRequest(traderId);
    alert('Friend request sent!');
  };

  // Get rank display for top 3 traders
  const getRankDisplay = (index: number) => {
    if (index === 0) return <Trophy className="h-5 w-5 text-yellow-500" />;
    if (index === 1) return <Medal className="h-5 w-5 text-gray-400" />;
    if (index === 2) return <Medal className="h-5 w-5 text-amber-600" />;
    return <span className="w-5 h-5 inline-flex items-center justify-center">{index + 1}</span>;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-background rounded-lg shadow-lg w-full max-w-4xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold">Trader Leaderboard</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="flex flex-col md:flex-row flex-1 overflow-hidden">
          {/* Left panel: Leaderboard rankings */}
          <div className="w-full md:w-1/2 border-r p-4 flex flex-col h-full">
            <div className="mb-4 space-y-2">
              <div className="flex gap-2 justify-between">
                <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'global' | 'friends')}>
                  <TabsList>
                    <TabsTrigger value="global">Global</TabsTrigger>
                    <TabsTrigger value="friends">Friends</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button size="icon" variant="ghost">
                        <Info className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">
                        Rankings are based on trader performance across all markets.
                        Add traders as friends to compare your performance.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              
              <div className="flex justify-between gap-2">
                <Input
                  placeholder="Search traders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-[200px]"
                />
                
                <div className="flex gap-2">
                  <Select value={timeframe} onValueChange={setTimeframe}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">24h</SelectItem>
                      <SelectItem value="week">Week</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="all">All Time</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[100px]">
                      <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pnl">P&L</SelectItem>
                      <SelectItem value="winRate">Win Rate</SelectItem>
                      <SelectItem value="tradeCount">Activity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {filteredTraders().length > 0 ? (
                  filteredTraders().map((trader, index) => (
                    <div 
                      key={trader.id} 
                      className={cn(
                        "border rounded-md p-3 text-sm cursor-pointer",
                        index < 3 && "border-l-4",
                        index === 0 && "border-l-yellow-500",
                        index === 1 && "border-l-gray-400",
                        index === 2 && "border-l-amber-600",
                        selectedTrader?.id === trader.id && "border-primary bg-primary/5"
                      )}
                      onClick={() => setSelectedTrader(trader)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getRankDisplay(index)}
                          </div>
                          <Avatar className="h-8 w-8 mr-2">
                            <AvatarImage src={trader.avatar} alt={trader.username} />
                            <AvatarFallback>
                              {trader.username.substring(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{trader.username}</span>
                        </div>
                        
                        <div className="flex items-center space-x-1">
                          {!isPlayerFriend(trader.id) && (
                            <Button 
                              size="icon" 
                              variant="ghost" 
                              className="h-7 w-7"
                              onClick={(e) => handleAddFriend(trader.id, e)}
                            >
                              <UserPlus className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <p className="text-muted-foreground">P&L</p>
                          <p className={cn(
                            "font-medium",
                            trader.pnl > 0 ? "text-green-500" : "text-red-500"
                          )}>
                            {formatCurrency(trader.pnl)}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Win Rate</p>
                          <p className="font-medium">{trader.winRate}%</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Trades</p>
                          <p className="font-medium">{trader.tradeCount}</p>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p>No traders found</p>
                    <p className="text-xs mt-1">Adjust your filters or check back later</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
          
          {/* Right panel: Trader details */}
          <div className="w-full md:w-1/2 p-4 flex flex-col h-full">
            {selectedTrader ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <Avatar className="h-10 w-10 mr-3">
                      <AvatarImage src={selectedTrader.avatar} alt={selectedTrader.username} />
                      <AvatarFallback>
                        {selectedTrader.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium">{selectedTrader.username}</h3>
                      <p className="text-xs text-muted-foreground">Trader since 2023</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {!isPlayerFriend(selectedTrader.id) && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleAddFriend(selectedTrader.id)}
                      >
                        <UserPlus className="h-4 w-4 mr-1" />
                        Add Friend
                      </Button>
                    )}
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-1" />
                      Share
                    </Button>
                  </div>
                </div>
                
                <Tabs defaultValue="overview">
                  <TabsList className="mb-4">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="performance">Performance</TabsTrigger>
                    <TabsTrigger value="history">Trade History</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="overview" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total P&L</p>
                        <p className={cn(
                          "text-lg font-semibold",
                          selectedTrader.pnl > 0 ? "text-green-500" : "text-red-500"
                        )}>
                          {formatCurrency(selectedTrader.pnl)}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-xs text-muted-foreground">Win Rate</p>
                        <p className="text-lg font-semibold">{selectedTrader.winRate}%</p>
                      </div>
                      
                      <div className="border rounded-md p-3 text-center">
                        <p className="text-xs text-muted-foreground">Total Trades</p>
                        <p className="text-lg font-semibold">{selectedTrader.tradeCount}</p>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-2">Trading Style</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Favorite Markets</p>
                          <p className="text-sm">BTCUSD, ETHUSD, APPL</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Avg. Trade Duration</p>
                          <p className="text-sm">3.2 days</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Risk Profile</p>
                          <p className="text-sm">Moderate</p>
                        </div>
                        <div className="flex items-center justify-between">
                          <p className="text-sm">Preferred Timeframe</p>
                          <p className="text-sm">4h, Daily</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-2">Monthly Performance</h4>
                      <div className="space-y-2">
                        {[
                          { month: 'March', pnl: 12.4 },
                          { month: 'February', pnl: -3.7 },
                          { month: 'January', pnl: 8.2 },
                        ].map((item) => (
                          <div key={item.month} className="flex items-center justify-between">
                            <p className="text-sm">{item.month}</p>
                            <div className="flex items-center">
                              {item.pnl > 0 ? (
                                <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                              ) : (
                                <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                              )}
                              <p className={cn(
                                "text-sm",
                                item.pnl > 0 ? "text-green-500" : "text-red-500"
                              )}>
                                {formatPercentage(item.pnl)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="performance">
                    <div className="border rounded-md p-3">
                      <h4 className="font-medium mb-2">Performance Metrics</h4>
                      <div className="space-y-3">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm">Profit Factor</p>
                            <p className="text-sm font-medium">2.3</p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '68%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm">Sharpe Ratio</p>
                            <p className="text-sm font-medium">1.8</p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500 rounded-full" style={{ width: '54%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm">Max Drawdown</p>
                            <p className="text-sm font-medium">-18.2%</p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500 rounded-full" style={{ width: '32%' }}></div>
                          </div>
                        </div>
                        
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm">Win/Loss Ratio</p>
                            <p className="text-sm font-medium">1.4</p>
                          </div>
                          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 rounded-full" style={{ width: '48%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="border rounded-md p-3 mt-4">
                      <h4 className="font-medium mb-2">Performance By Symbol</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-sm">BTCUSD</p>
                          </div>
                          <p className="text-sm text-green-500">+15.3%</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
                            <p className="text-sm">ETHUSD</p>
                          </div>
                          <p className="text-sm text-red-500">-4.2%</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-sm">AAPL</p>
                          </div>
                          <p className="text-sm text-green-500">+8.7%</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                            <p className="text-sm">S&P 500</p>
                          </div>
                          <p className="text-sm text-green-500">+3.1%</p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="history">
                    <ScrollArea className="h-[calc(100vh-360px)]">
                      <div className="space-y-2">
                        {[...Array(10)].map((_, i) => (
                          <div key={i} className="border rounded-md p-3 text-sm">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">BTCUSD</span>
                              <span className={cn(
                                "text-xs px-2 py-0.5 rounded-full",
                                i % 3 === 0 ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                              )}>
                                {i % 3 === 0 ? 'SELL' : 'BUY'}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {new Date(Date.now() - i * 86400000).toLocaleDateString()}
                            </div>
                            <div className="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                              <div>Entry: ${(40000 + (i * 120)).toLocaleString()}</div>
                              <div>Exit: ${(40000 + (i * 240)).toLocaleString()}</div>
                              <div>Size: {0.2 + (i * 0.05).toFixed(2)} BTC</div>
                              <div className={i % 3 === 0 ? "text-red-500" : "text-green-500"}>
                                P&L: {i % 3 === 0 ? '-' : '+'}${(120 + i * 20).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </TabsContent>
                </Tabs>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground p-4">
                <div className="mb-4">
                  <Trophy className="h-12 w-12 mb-2 opacity-20" />
                  <h3 className="text-lg font-medium">No Trader Selected</h3>
                </div>
                <p className="max-w-md">
                  Select a trader from the leaderboard to view their detailed performance statistics, 
                  trading style, and history.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}