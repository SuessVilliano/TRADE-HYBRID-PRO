import React, { useState, useEffect } from 'react';
import { useTrader, TradeStats } from '@/lib/stores/useTrader';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from './card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { LineChart, Brain, TrendingUp, BarChart3, AlertTriangle, Lightbulb, Clock, ChevronRight, Settings, RefreshCw, Eye, Download, Maximize2, Minimize2, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from './popover';
import { Button } from './button';
import { Switch } from './switch';
import { Label } from './label';
import { toast } from 'sonner';

// Define the settings interface for the widget
export interface PersonalizedInsightsSettings {
  showPerformanceMetrics: boolean;
  showRiskInsights: boolean;
  showPatternAnalysis: boolean;
  showOpportunities: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  maxInsights: number;
  categories: Array<'performance' | 'risk' | 'pattern' | 'opportunity'>;
}

interface PersonalizedTradingInsightsProps {
  className?: string;
  compact?: boolean;
  symbol?: string;
  refreshInterval?: number;
  onMaximize?: () => void;
  onClose?: () => void;
  onSettingsChange?: (settings: PersonalizedInsightsSettings) => void;
  isWidget?: boolean;
}

export function PersonalizedTradingInsights({
  className,
  compact = false,
  symbol,
  refreshInterval = 60000,
  onMaximize,
  onClose,
  onSettingsChange,
  isWidget = false
}: PersonalizedTradingInsightsProps) {
  const { 
    positions, 
    trades, 
    tradeStats, 
    orderHistory,
    updateAccountInfo
  } = useTrader();
  
  const [selectedTab, setSelectedTab] = useState<string>('insights');
  const [insights, setInsights] = useState<{
    text: string;
    category: 'performance' | 'risk' | 'pattern' | 'opportunity';
    priority: 'high' | 'medium' | 'low';
  }[]>([]);
  
  // Settings for the widget
  const [settings, setSettings] = useState<PersonalizedInsightsSettings>({
    showPerformanceMetrics: true,
    showRiskInsights: true,
    showPatternAnalysis: true,
    showOpportunities: true,
    autoRefresh: true,
    refreshInterval: refreshInterval,
    maxInsights: 5,
    categories: ['performance', 'risk', 'pattern', 'opportunity']
  });
  
  // Apply settings changes
  const handleSettingsChange = (newSettings: Partial<PersonalizedInsightsSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);
    if (onSettingsChange) {
      onSettingsChange(updatedSettings);
    }
  };

  // Fetch and analyze data when component mounts
  useEffect(() => {
    generateInsights();
    
    // Set up refresh interval based on settings
    let dataRefreshIntervalId: NodeJS.Timeout | null = null;
    let insightsRefreshIntervalId: NodeJS.Timeout | null = null;
    
    if (settings.autoRefresh) {
      // Update account info periodically
      dataRefreshIntervalId = setInterval(() => {
        updateAccountInfo();
      }, 30000);
      
      // Regenerate insights periodically based on configured refresh interval
      insightsRefreshIntervalId = setInterval(() => {
        generateInsights();
      }, settings.refreshInterval);
    }
    
    return () => {
      if (dataRefreshIntervalId) clearInterval(dataRefreshIntervalId);
      if (insightsRefreshIntervalId) clearInterval(insightsRefreshIntervalId);
    };
  }, [settings.autoRefresh, settings.refreshInterval]);
  
  // Re-generate insights when trade data changes
  useEffect(() => {
    generateInsights();
  }, [positions, trades, tradeStats, settings.categories]);
  
  // Generate personalized trading insights based on user's trading data
  const generateInsights = () => {
    const newInsights = [];
    
    // Only generate insights if we have data
    if (trades.length === 0 && positions.length === 0) {
      newInsights.push({
        text: "Start trading to receive personalized insights based on your trading activity.",
        category: 'opportunity' as const,
        priority: 'medium' as const
      });
      setInsights(newInsights);
      return;
    }
    
    // Performance insights
    if (settings.showPerformanceMetrics && settings.categories.includes('performance')) {
      if (tradeStats.winRate < 50) {
        newInsights.push({
          text: `Your win rate is ${tradeStats.winRate}%. Consider reviewing your entry criteria or using smaller position sizes.`,
          category: 'performance' as const,
          priority: 'high' as const
        });
      } else if (tradeStats.winRate > 65) {
        newInsights.push({
          text: `Strong win rate of ${tradeStats.winRate}%. Consider increasing position size on setups that match your successful patterns.`,
          category: 'performance' as const,
          priority: 'medium' as const
        });
      }
    }
    
    // Risk management insights
    if (settings.showRiskInsights && settings.categories.includes('risk')) {
      if (tradeStats.avgLoss && Math.abs(tradeStats.avgLoss) > Math.abs(tradeStats.avgWin) * 0.8) {
        newInsights.push({
          text: `Your average loss (${formatCurrency(tradeStats.avgLoss)}) is too close to your average win (${formatCurrency(tradeStats.avgWin)}). Consider tightening stop losses.`,
          category: 'risk' as const,
          priority: 'high' as const
        });
      }
      
      // Detect overtrading
      const recentTrades = trades.filter(t => Date.now() - t.timestamp < 24 * 60 * 60 * 1000);
      if (recentTrades.length > 5) {
        newInsights.push({
          text: `You've made ${recentTrades.length} trades in the last 24 hours. Consider quality over quantity to avoid overtrading.`,
          category: 'risk' as const,
          priority: 'medium' as const
        });
      }
      
      // Asset diversification check
      const symbols = [...new Set(positions.map(p => p.symbol))];
      if (positions.length > 2 && symbols.length === 1) {
        newInsights.push({
          text: `All your positions are in ${symbols[0]}. Consider diversifying across different assets to reduce risk.`,
          category: 'risk' as const,
          priority: 'medium' as const
        });
      }
      
      // Position size consistency
      const positionSizes = trades.map(t => t.quantity * t.entryPrice);
      if (positionSizes.length > 0) {
        const avgPositionSize = positionSizes.reduce((sum, size) => sum + size, 0) / positionSizes.length;
        const positionSizeVariance = positionSizes.reduce((sum, size) => sum + Math.pow(size - avgPositionSize, 2), 0) / positionSizes.length;
        const positionSizeStdDev = Math.sqrt(positionSizeVariance);
        
        if (positionSizeStdDev > avgPositionSize * 0.5) {
          newInsights.push({
            text: "Your position sizes vary significantly. Consider standardizing position sizing for more consistent results.",
            category: 'risk' as const,
            priority: 'medium' as const
          });
        }
      }
    }
    
    // Trading pattern insights
    if (settings.showPatternAnalysis && settings.categories.includes('pattern')) {
      const profitableTrades = trades.filter(t => t.profit > 0);
      if (profitableTrades.length >= 3) {
        // Look for patterns in profitable trades
        const mostProfitableSymbol = getMostFrequent(profitableTrades.map(t => t.symbol));
        if (mostProfitableSymbol) {
          newInsights.push({
            text: `You're performing particularly well with ${mostProfitableSymbol}. Consider specializing more in this asset.`,
            category: 'pattern' as const,
            priority: 'medium' as const
          });
        }
      }
    }
    
    // Opportunity insights
    if (settings.showOpportunities && settings.categories.includes('opportunity')) {
      const activeSymbols = [...new Set([...positions.map(p => p.symbol), ...trades.slice(0, 5).map(t => t.symbol)])];
      if (activeSymbols.includes('BTCUSD') && !positions.find(p => p.symbol === 'ETHUSD')) {
        newInsights.push({
          text: "Based on your BTC trading activity, you might consider adding ETH positions which often shows correlated movements.",
          category: 'opportunity' as const,
          priority: 'low' as const
        });
      }
    }
    
    // Sort insights by priority
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    newInsights.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);
    
    // Limit to configured maximum number of insights
    setInsights(newInsights.slice(0, settings.maxInsights));
  };
  
  // Calculate recent performance
  const getRecentPerformance = () => {
    const recentTrades = trades.slice(0, 10); // Last 10 trades
    if (recentTrades.length === 0) return { profit: 0, winRate: 0 };
    
    const profit = recentTrades.reduce((sum, trade) => sum + trade.profit, 0);
    const wins = recentTrades.filter(trade => trade.profit > 0).length;
    const winRate = (wins / recentTrades.length) * 100;
    
    return { profit, winRate };
  };
  
  const recentPerformance = getRecentPerformance();
  
  // Helper function to get most frequent item in an array
  const getMostFrequent = (arr: string[]) => {
    const counts = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .map(entry => entry[0])[0];
  };
  
  // Helper function to format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };
  
  // Get icon for insight category
  const getInsightIcon = (category: string) => {
    switch (category) {
      case 'performance':
        return <BarChart3 className="h-5 w-5 text-blue-500" />;
      case 'risk':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'pattern':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'opportunity':
        return <Lightbulb className="h-5 w-5 text-green-500" />;
      default:
        return <ChevronRight className="h-5 w-5" />;
    }
  };
  
  // Get background color based on insight priority and category
  const getInsightBackground = (category: string, priority: string) => {
    switch (category) {
      case 'performance':
        return priority === 'high' ? 'bg-blue-500/20' : 'bg-blue-500/10';
      case 'risk':
        return priority === 'high' ? 'bg-amber-500/20' : 'bg-amber-500/10';
      case 'pattern':
        return priority === 'high' ? 'bg-purple-500/20' : 'bg-purple-500/10';
      case 'opportunity':
        return priority === 'high' ? 'bg-green-500/20' : 'bg-green-500/10';
      default:
        return 'bg-slate-500/10';
    }
  };
  
  // Get border color based on insight category
  const getInsightBorder = (category: string) => {
    switch (category) {
      case 'performance':
        return 'border-blue-500/30';
      case 'risk':
        return 'border-amber-500/30';
      case 'pattern':
        return 'border-purple-500/30';
      case 'opportunity':
        return 'border-green-500/30';
      default:
        return 'border-slate-500/30';
    }
  };
  
  // Manual refresh handler
  const handleRefresh = () => {
    updateAccountInfo();
    generateInsights();
    toast.success("Insights refreshed");
  };
  
  // Settings popover content
  const SettingsPanel = (
    <div className="w-80 space-y-4">
      <h3 className="text-sm font-medium">Widget Settings</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <Label htmlFor="autoRefresh" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" /> Auto Refresh
          </Label>
          <Switch 
            id="autoRefresh" 
            checked={settings.autoRefresh}
            onCheckedChange={(value) => handleSettingsChange({ autoRefresh: value })} 
          />
        </div>
        
        {settings.autoRefresh && (
          <div className="space-y-2">
            <Label className="text-xs">Refresh Interval</Label>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                className={cn(settings.refreshInterval === 30000 && "border-primary")}
                onClick={() => handleSettingsChange({ refreshInterval: 30000 })}
              >30s</Button>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(settings.refreshInterval === 60000 && "border-primary")}
                onClick={() => handleSettingsChange({ refreshInterval: 60000 })}
              >1m</Button>
              <Button 
                variant="outline" 
                size="sm"
                className={cn(settings.refreshInterval === 300000 && "border-primary")}
                onClick={() => handleSettingsChange({ refreshInterval: 300000 })}
              >5m</Button>
            </div>
          </div>
        )}
        
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs">Insight Categories</Label>
          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center space-x-2">
              <Switch 
                id="showPerformance" 
                checked={settings.showPerformanceMetrics}
                onCheckedChange={(value) => {
                  const newCategories = [...settings.categories];
                  if (value && !newCategories.includes('performance')) {
                    newCategories.push('performance');
                  } else if (!value) {
                    const index = newCategories.indexOf('performance');
                    if (index > -1) newCategories.splice(index, 1);
                  }
                  
                  handleSettingsChange({ 
                    showPerformanceMetrics: value,
                    categories: newCategories
                  });
                }} 
              />
              <Label htmlFor="showPerformance" className="text-xs">Performance</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="showRisk" 
                checked={settings.showRiskInsights}
                onCheckedChange={(value) => {
                  const newCategories = [...settings.categories];
                  if (value && !newCategories.includes('risk')) {
                    newCategories.push('risk');
                  } else if (!value) {
                    const index = newCategories.indexOf('risk');
                    if (index > -1) newCategories.splice(index, 1);
                  }
                  
                  handleSettingsChange({ 
                    showRiskInsights: value,
                    categories: newCategories
                  });
                }} 
              />
              <Label htmlFor="showRisk" className="text-xs">Risk</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="showPattern" 
                checked={settings.showPatternAnalysis}
                onCheckedChange={(value) => {
                  const newCategories = [...settings.categories];
                  if (value && !newCategories.includes('pattern')) {
                    newCategories.push('pattern');
                  } else if (!value) {
                    const index = newCategories.indexOf('pattern');
                    if (index > -1) newCategories.splice(index, 1);
                  }
                  
                  handleSettingsChange({ 
                    showPatternAnalysis: value,
                    categories: newCategories
                  });
                }} 
              />
              <Label htmlFor="showPattern" className="text-xs">Patterns</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch 
                id="showOpportunities" 
                checked={settings.showOpportunities}
                onCheckedChange={(value) => {
                  const newCategories = [...settings.categories];
                  if (value && !newCategories.includes('opportunity')) {
                    newCategories.push('opportunity');
                  } else if (!value) {
                    const index = newCategories.indexOf('opportunity');
                    if (index > -1) newCategories.splice(index, 1);
                  }
                  
                  handleSettingsChange({ 
                    showOpportunities: value,
                    categories: newCategories
                  });
                }} 
              />
              <Label htmlFor="showOpportunities" className="text-xs">Opportunities</Label>
            </div>
          </div>
        </div>
        
        <div className="space-y-2 pt-2 border-t">
          <Label className="text-xs">Max Insights to Show</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              className={cn(settings.maxInsights === 3 && "border-primary")}
              onClick={() => handleSettingsChange({ maxInsights: 3 })}
            >3</Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(settings.maxInsights === 5 && "border-primary")}
              onClick={() => handleSettingsChange({ maxInsights: 5 })}
            >5</Button>
            <Button 
              variant="outline" 
              size="sm"
              className={cn(settings.maxInsights === 10 && "border-primary")}
              onClick={() => handleSettingsChange({ maxInsights: 10 })}
            >10</Button>
          </div>
        </div>
      </div>
    </div>
  );
  
  return (
    <Card className={cn("w-full h-full overflow-hidden", className)}>
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-semibold flex items-center">
          <Brain className="h-5 w-5 mr-2 text-primary" />
          Personalized Trading Insights
        </CardTitle>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleRefresh}
            title="Refresh insights"
          >
            <RefreshCw className="h-4 w-4" />
          </Button>
          
          <Popover>
            <PopoverTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon"
                title="Settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="p-4 w-80">
              {SettingsPanel}
            </PopoverContent>
          </Popover>
          
          {isWidget && (
            <>
              {onMaximize && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onMaximize}
                  title="Maximize"
                >
                  <Maximize2 className="h-4 w-4" />
                </Button>
              )}
              
              {onClose && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onClose}
                  title="Close"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <Tabs 
          value={selectedTab} 
          onValueChange={setSelectedTab}
          className="w-full"
        >
          <TabsList className="w-full grid grid-cols-2 mb-2 px-4">
            <TabsTrigger value="insights" className="text-xs">
              <Lightbulb className="h-4 w-4 mr-1" /> Insights
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart3 className="h-4 w-4 mr-1" /> Performance
            </TabsTrigger>
          </TabsList>
          
          <TabsContent 
            value="insights" 
            className="m-0 px-4 pb-3 h-[calc(100%-40px)] overflow-y-auto"
          >
            {insights.length > 0 ? (
              <div className="space-y-3">
                {insights.map((insight, idx) => (
                  <div 
                    key={idx}
                    className={cn(
                      "p-3 rounded border flex",
                      getInsightBackground(insight.category, insight.priority),
                      getInsightBorder(insight.category)
                    )}
                  >
                    <div className="mr-3 mt-0.5">
                      {getInsightIcon(insight.category)}
                    </div>
                    <div>
                      <p className="text-sm">{insight.text}</p>
                      <div className="flex items-center mt-1 text-xs opacity-70">
                        <span className="capitalize">
                          {insight.category === 'performance' ? 'Performance' : 
                           insight.category === 'risk' ? 'Risk Management' : 
                           insight.category === 'pattern' ? 'Trading Pattern' : 'Opportunity'}
                        </span>
                        <span className="mx-1">•</span>
                        <span className="capitalize">{insight.priority} priority</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <Brain className="h-12 w-12 text-slate-400 mb-2" />
                <p className="text-slate-400">
                  Generating personalized insights based on your trading activity...
                </p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent 
            value="stats" 
            className="m-0 px-4 pb-3 space-y-4 h-[calc(100%-40px)] overflow-y-auto"
          >
            <div className="grid grid-cols-2 gap-3 mt-2">
              <div className="bg-slate-800 rounded p-3">
                <div className="text-sm text-slate-400">Win Rate</div>
                <div className="text-xl font-semibold">{tradeStats.winRate}%</div>
              </div>
              <div className="bg-slate-800 rounded p-3">
                <div className="text-sm text-slate-400">Profit Factor</div>
                <div className="text-xl font-semibold">{tradeStats.profitFactor.toFixed(2)}</div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Clock className="h-4 w-4 mr-1" /> Recent Performance
              </h4>
              <div className="bg-slate-800 rounded p-3">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm text-slate-400">Last 10 Trades</div>
                    <div className={cn(
                      "text-xl font-semibold",
                      recentPerformance.profit > 0 ? "text-green-500" : 
                      recentPerformance.profit < 0 ? "text-red-500" : ""
                    )}>
                      {formatCurrency(recentPerformance.profit)}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-slate-400">Win Rate</div>
                    <div className="text-xl font-semibold">{recentPerformance.winRate.toFixed(1)}%</div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="text-sm font-medium mb-2">Trading Statistics</h4>
              <div className="space-y-2">
                <div className="bg-slate-800 rounded p-2 flex justify-between">
                  <span className="text-sm text-slate-400">Average Win</span>
                  <span className="text-sm text-green-500">{formatCurrency(tradeStats.avgWin)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2 flex justify-between">
                  <span className="text-sm text-slate-400">Average Loss</span>
                  <span className="text-sm text-red-500">{formatCurrency(tradeStats.avgLoss)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2 flex justify-between">
                  <span className="text-sm text-slate-400">Largest Win</span>
                  <span className="text-sm text-green-500">{formatCurrency(tradeStats.largestWin)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2 flex justify-between">
                  <span className="text-sm text-slate-400">Largest Loss</span>
                  <span className="text-sm text-red-500">{formatCurrency(tradeStats.largestLoss)}</span>
                </div>
                <div className="bg-slate-800 rounded p-2 flex justify-between">
                  <span className="text-sm text-slate-400">Total Trades</span>
                  <span className="text-sm">{tradeStats.totalTrades}</span>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}