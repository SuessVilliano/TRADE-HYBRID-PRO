import { useEffect, useState } from 'react';
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";
import { 
  ArrowUpRight, Check, ChevronDown, ChevronUp, 
  Copy, MessageCircle, PlusCircle, RefreshCw, Signal, User, X
} from "lucide-react";
import { useFollowedTraders, FollowedTrader } from '@/lib/stores/useFollowedTraders';
import { formatCurrency, formatNumber } from '@/lib/utils/formatters';

export function FollowedTradersList() {
  const { 
    followedTraders, 
    followedSignals,
    isLoadingTraders,
    error,
    fetchFollowedTraders,
    fetchFollowedSignals,
    unfollowTrader,
    toggleSignals,
    toggleTrades,
    toggleEducation
  } = useFollowedTraders();
  
  const [expandedTraders, setExpandedTraders] = useState<string[]>([]);
  
  // Load traders on component mount
  useEffect(() => {
    fetchFollowedTraders();
  }, [fetchFollowedTraders]);
  
  // Load signals from followed traders
  useEffect(() => {
    fetchFollowedSignals();
  }, [fetchFollowedSignals, followedTraders]);
  
  // Toggle trader expanded state
  const toggleExpanded = (traderId: string) => {
    setExpandedTraders(prev => 
      prev.includes(traderId) 
        ? prev.filter(id => id !== traderId)
        : [...prev, traderId]
    );
  };
  
  const isExpanded = (traderId: string) => expandedTraders.includes(traderId);
  
  const refreshData = () => {
    fetchFollowedTraders();
    fetchFollowedSignals();
  };
  
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-3">
        <div className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          <h2 className="text-xl font-bold">Followed Traders</h2>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={refreshData}
          disabled={isLoadingTraders}
          className="gap-1"
        >
          {isLoadingTraders ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">Refresh</span>
        </Button>
      </div>
      
      <Tabs defaultValue="traders">
        <TabsList className="grid grid-cols-2 mb-4">
          <TabsTrigger value="traders">Traders</TabsTrigger>
          <TabsTrigger value="signals">Signals</TabsTrigger>
        </TabsList>
      
        <TabsContent value="traders">
          {isLoadingTraders ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : followedTraders.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <User className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">You haven't followed any traders yet.</p>
                </div>
                <Button className="gap-1">
                  <PlusCircle className="h-4 w-4" />
                  Find Traders to Follow
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {followedTraders.map((trader) => (
                <Card key={trader.id} className="overflow-hidden">
                  <div 
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => toggleExpanded(trader.id)}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 border">
                        <img src={trader.avatar} alt={trader.username} />
                      </Avatar>
                      <div>
                        <h3 className="font-medium">{trader.username}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last active: {trader.lastActive.toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className={`hidden sm:flex px-2 py-1 rounded-full text-xs font-medium ${trader.pnl >= 0 ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"}`}>
                        {formatCurrency(trader.pnl)}
                      </div>
                      <div className="hidden sm:flex items-center gap-2">
                        <span className="text-sm font-medium">{trader.winRate.toFixed(1)}%</span>
                        <span className="text-xs text-muted-foreground">Win Rate</span>
                      </div>
                      {isExpanded(trader.id) ? (
                        <ChevronUp className="h-5 w-5 text-muted-foreground" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-muted-foreground" />
                      )}
                    </div>
                  </div>
                  
                  {isExpanded(trader.id) && (
                    <CardContent className="p-4 pt-0">
                      <Separator className="mb-4" />
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium mb-2">Stats</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-xs text-muted-foreground">Win Rate</p>
                              <p className="font-medium">{trader.winRate.toFixed(1)}%</p>
                            </div>
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-xs text-muted-foreground">P&L</p>
                              <p className={`font-medium ${trader.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                {formatCurrency(trader.pnl)}
                              </p>
                            </div>
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-xs text-muted-foreground">Signals</p>
                              <p className="font-medium">{formatNumber(trader.signalCount)}</p>
                            </div>
                            <div className="bg-secondary/30 p-2 rounded">
                              <p className="text-xs text-muted-foreground">Trades</p>
                              <p className="font-medium">{formatNumber(trader.tradeCount)}</p>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-medium mb-2">Settings</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <label htmlFor={`signal-${trader.id}`} className="text-sm flex items-center gap-2">
                                <Signal className="h-4 w-4 text-green-500" />
                                Receive Signals
                              </label>
                              <Switch 
                                id={`signal-${trader.id}`}
                                checked={trader.signals}
                                onCheckedChange={(checked: boolean) => toggleSignals(trader.id, checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <label htmlFor={`copy-${trader.id}`} className="text-sm flex items-center gap-2">
                                <Copy className="h-4 w-4 text-blue-500" />
                                Copy Trades
                              </label>
                              <Switch 
                                id={`copy-${trader.id}`}
                                checked={trader.trades}
                                onCheckedChange={(checked: boolean) => toggleTrades(trader.id, checked)}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <label htmlFor={`edu-${trader.id}`} className="text-sm flex items-center gap-2">
                                <MessageCircle className="h-4 w-4 text-purple-500" />
                                Educational Content
                              </label>
                              <Switch 
                                id={`edu-${trader.id}`}
                                checked={trader.education}
                                onCheckedChange={(checked: boolean) => toggleEducation(trader.id, checked)}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 flex justify-end">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => unfollowTrader(trader.id)}
                          className="text-xs gap-1"
                        >
                          <X className="h-3.5 w-3.5" />
                          Unfollow
                        </Button>
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="signals">
          {followedSignals.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <div className="mb-3">
                  <Signal className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No signals from your followed traders yet.</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Make sure you've enabled signal notifications in trader settings.
                  </p>
                </div>
                <Button variant="outline" onClick={refreshData} className="gap-1 mt-2">
                  <RefreshCw className="h-4 w-4" />
                  Refresh Signals
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {followedSignals.map((signal) => (
                <Card key={signal.id}>
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <Avatar className="h-8 w-8 border shrink-0">
                          <img src={signal.trader.avatar} alt={signal.trader.username} />
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{signal.trader.username}</h4>
                            <div className={`text-xs px-1.5 py-0.5 rounded-sm font-medium inline-flex items-center gap-1 ${signal.action === 'buy' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'}`}>
                              {signal.action.toUpperCase()}
                            </div>
                          </div>
                          <p className="text-sm">{signal.symbol} @ {signal.price.toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">
                            {signal.timestamp.toLocaleString()} • {signal.confidence}% confidence
                          </p>
                        </div>
                      </div>
                      <div className="shrink-0">
                        <Badge variant={
                          signal.status === 'success' ? 'outline' : 
                          signal.status === 'fail' ? 'destructive' :
                          'secondary'
                        }>
                          {signal.status === 'success' ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : signal.status === 'fail' ? (
                            <X className="h-3 w-3 mr-1" />
                          ) : (
                            <ArrowUpRight className="h-3 w-3 mr-1" />
                          )}
                          {signal.status === 'success' ? 'Profit' : 
                           signal.status === 'fail' ? 'Loss' : 'Pending'}
                        </Badge>
                      </div>
                    </div>
                    
                    {signal.message && (
                      <div className="mt-2 p-2 bg-muted/50 rounded text-sm">
                        {signal.message}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}