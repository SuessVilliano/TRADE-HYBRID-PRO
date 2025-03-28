import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Info, RefreshCw, Calendar, TrendingUp, TrendingDown, BarChart2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ALL_TRADING_SYMBOLS } from '@/lib/constants';

interface TradingData {
  symbol: string;
  date: string;
  performance: number;
  volume: number;
  trades: number;
  category: 'crypto' | 'forex' | 'stocks' | 'futures';
}

interface HeatmapProps {
  apiKeyStatus?: boolean;
  className?: string;
}

export function TradingPerformanceHeatmap({ apiKeyStatus = false, className = '' }: HeatmapProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('week');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('performance');
  const [tradingData, setTradingData] = useState<TradingData[]>([]);
  const [highlightedSymbol, setHighlightedSymbol] = useState<string | null>(null);
  const [insightIndex, setInsightIndex] = useState(0);
  const [insights, setInsights] = useState<string[]>([]);
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Load trading data
  useEffect(() => {
    if (!apiKeyStatus) {
      setLoading(false);
      return;
    }
    
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      const data = generateMockTradingData(selectedTimeframe);
      setTradingData(data);
      
      // Generate insights based on data
      const generatedInsights = generateInsightsFromData(data);
      setInsights(generatedInsights);
      setInsightIndex(0);
      
      setLoading(false);
    }, 1500);
  }, [apiKeyStatus, selectedTimeframe]);
  
  // Filter data based on category selection
  const filteredData = tradingData.filter(item => {
    if (selectedCategory === 'all') return true;
    return item.category === selectedCategory;
  });
  
  // Auto rotate insights
  useEffect(() => {
    if (insights.length === 0) return;
    
    const interval = setInterval(() => {
      setInsightIndex(prev => (prev + 1) % insights.length);
    }, 8000);
    
    return () => clearInterval(interval);
  }, [insights]);
  
  // Calculate color for performance
  const getColorForValue = (value: number, metric: string): string => {
    // Different color scales based on metric
    if (metric === 'performance') {
      if (value >= 5) return 'bg-green-600';
      if (value >= 2) return 'bg-green-500';
      if (value >= 0) return 'bg-green-400';
      if (value >= -2) return 'bg-red-400';
      if (value >= -5) return 'bg-red-500';
      return 'bg-red-600';
    } else if (metric === 'volume') {
      // Volume is always positive, so we use a gradient from light to dark
      if (value >= 80) return 'bg-blue-600';
      if (value >= 60) return 'bg-blue-500';
      if (value >= 40) return 'bg-blue-400';
      if (value >= 20) return 'bg-blue-300';
      return 'bg-blue-200';
    } else { // trades
      if (value >= 80) return 'bg-purple-600';
      if (value >= 60) return 'bg-purple-500';
      if (value >= 40) return 'bg-purple-400';
      if (value >= 20) return 'bg-purple-300';
      return 'bg-purple-200';
    }
  };
  
  // Get value for a given metric
  const getValueForMetric = (item: TradingData, metric: string): number => {
    if (metric === 'performance') return item.performance;
    if (metric === 'volume') return item.volume;
    return item.trades;
  };
  
  // Format value for display
  const formatValue = (value: number, metric: string): string => {
    if (metric === 'performance') return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    if (metric === 'volume') return `${(value / 100).toFixed(1)}M`;
    return value.toString();
  };
  
  // Handle refresh
  const handleRefresh = () => {
    setLoading(true);
    
    setTimeout(() => {
      const data = generateMockTradingData(selectedTimeframe);
      setTradingData(data);
      
      const generatedInsights = generateInsightsFromData(data);
      setInsights(generatedInsights);
      setInsightIndex(0);
      
      setLoading(false);
      
      toast({
        title: "Heatmap refreshed",
        description: "Latest trading performance data has been loaded.",
      });
    }, 1500);
  };
  
  // Group data by date
  const dateGroups = filteredData.reduce<{ [key: string]: TradingData[] }>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});
  
  // Sort dates
  const sortedDates = Object.keys(dateGroups).sort();
  
  // Get unique symbols across all dates
  const allSymbols = Array.from(new Set(filteredData.map(item => item.symbol)));
  // Sort symbols alphabetically
  allSymbols.sort();
  
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="h-5 w-5 text-primary" />
              Trading Performance Heatmap
            </CardTitle>
            <CardDescription>
              Visualize trading performance across markets and timeframes
            </CardDescription>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              title="Refresh data"
              onClick={handleRefresh}
              disabled={loading || !apiKeyStatus}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        {!apiKeyStatus ? (
          <div className="text-center py-6">
            <div className="mb-4 flex justify-center">
              <Info className="h-12 w-12 text-muted-foreground opacity-50" />
            </div>
            <h3 className="font-medium text-lg mb-2">API Key Required</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Connect your broker or set up API keys to access trading performance data.
            </p>
            <Button variant="outline" className="mx-auto">
              Set Up API Keys
            </Button>
          </div>
        ) : (
          <>
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-wrap gap-3">
                <div className="flex-grow min-w-[120px]">
                  <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
                    <SelectTrigger className="w-full">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <SelectValue placeholder="Timeframe" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="day">Daily</SelectItem>
                      <SelectItem value="week">Weekly</SelectItem>
                      <SelectItem value="month">Monthly</SelectItem>
                      <SelectItem value="quarter">Quarterly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-grow min-w-[120px]">
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Asset Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Assets</SelectItem>
                      <SelectItem value="crypto">Crypto</SelectItem>
                      <SelectItem value="forex">Forex</SelectItem>
                      <SelectItem value="stocks">Stocks</SelectItem>
                      <SelectItem value="futures">Futures</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex-grow min-w-[120px]">
                  <Select value={selectedMetric} onValueChange={setSelectedMetric}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Metric" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="performance">Performance (%)</SelectItem>
                      <SelectItem value="volume">Volume</SelectItem>
                      <SelectItem value="trades">Trades</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              {insights.length > 0 && (
                <div className="relative rounded-lg bg-muted/40 p-3 min-h-[60px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={insightIndex}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.5 }}
                      className="flex items-start gap-2"
                    >
                      {selectedMetric === 'performance' ? (
                        insights[insightIndex].includes('-') ? 
                          <TrendingDown className="h-5 w-5 text-red-500 shrink-0 mt-0.5" /> : 
                          <TrendingUp className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                      ) : (
                        <Info className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
                      )}
                      <p className="text-sm text-muted-foreground">{insights[insightIndex]}</p>
                    </motion.div>
                  </AnimatePresence>
                  
                  <div className="absolute bottom-2 right-2 flex gap-1">
                    {insights.map((_, idx) => (
                      <div 
                        key={idx} 
                        className={`h-1.5 w-1.5 rounded-full ${idx === insightIndex ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-[250px] w-full" />
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="overflow-auto"
                style={{ maxHeight: '400px' }}
              >
                <div className="min-w-[600px]">
                  <div className="grid gap-1" style={{ gridTemplateColumns: `minmax(100px, auto) repeat(${sortedDates.length}, 1fr)` }}>
                    {/* Header row with dates */}
                    <div className="bg-muted/20 p-2 font-medium rounded-tl-md sticky left-0 z-10">Symbol</div>
                    {sortedDates.map((date) => (
                      <div 
                        key={date} 
                        className="bg-muted/20 p-2 text-center text-sm font-medium"
                      >
                        {formatDate(date, selectedTimeframe)}
                      </div>
                    ))}
                    
                    {/* Rows for each symbol */}
                    {allSymbols.map((symbol) => (
                      <React.Fragment key={symbol}>
                        <div 
                          className={`p-2 font-medium sticky left-0 bg-background z-10 ${highlightedSymbol === symbol ? 'text-primary' : ''}`}
                          onMouseEnter={() => setHighlightedSymbol(symbol)}
                          onMouseLeave={() => setHighlightedSymbol(null)}
                        >
                          {symbol}
                        </div>
                        
                        {sortedDates.map((date) => {
                          const item = dateGroups[date]?.find(d => d.symbol === symbol);
                          const value = item ? getValueForMetric(item, selectedMetric) : null;
                          
                          return (
                            <TooltipProvider key={`${symbol}-${date}`}>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div 
                                    className={`aspect-square m-1 rounded-sm transition-all ${
                                      value !== null 
                                        ? getColorForValue(value, selectedMetric) 
                                        : 'bg-muted/20'
                                    } ${highlightedSymbol === symbol ? 'ring-1 ring-primary' : ''}`}
                                    onMouseEnter={() => setHighlightedSymbol(symbol)}
                                    onMouseLeave={() => setHighlightedSymbol(null)}
                                  />
                                </TooltipTrigger>
                                {value !== null && (
                                  <TooltipContent>
                                    <div className="text-xs">
                                      <div className="font-bold">{symbol}</div>
                                      <div>{formatDate(date, selectedTimeframe)}</div>
                                      <div className="mt-1">
                                        {selectedMetric === 'performance' && (
                                          <span className={value >= 0 ? 'text-green-500' : 'text-red-500'}>
                                            {formatValue(value, selectedMetric)}
                                          </span>
                                        )}
                                        {selectedMetric !== 'performance' && (
                                          <span>{formatValue(value, selectedMetric)}</span>
                                        )}
                                      </div>
                                    </div>
                                  </TooltipContent>
                                )}
                              </Tooltip>
                            </TooltipProvider>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between items-center mt-4">
              <div className="flex gap-1.5">
                {selectedMetric === 'performance' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-red-600 rounded-sm"></div>
                      <span className="text-xs">-5%+</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-red-400 rounded-sm"></div>
                      <span className="text-xs">0% to -5%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-green-400 rounded-sm"></div>
                      <span className="text-xs">0% to +5%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-green-600 rounded-sm"></div>
                      <span className="text-xs">+5%+</span>
                    </div>
                  </>
                ) : selectedMetric === 'volume' ? (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-blue-200 rounded-sm"></div>
                      <span className="text-xs">Low</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-blue-300 rounded-sm"></div>
                      <div className="h-3 w-3 bg-blue-400 rounded-sm"></div>
                      <div className="h-3 w-3 bg-blue-500 rounded-sm"></div>
                      <div className="h-3 w-3 bg-blue-600 rounded-sm"></div>
                      <span className="text-xs">High</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-purple-200 rounded-sm"></div>
                      <span className="text-xs">Few</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="h-3 w-3 bg-purple-300 rounded-sm"></div>
                      <div className="h-3 w-3 bg-purple-400 rounded-sm"></div>
                      <div className="h-3 w-3 bg-purple-500 rounded-sm"></div>
                      <div className="h-3 w-3 bg-purple-600 rounded-sm"></div>
                      <span className="text-xs">Many</span>
                    </div>
                  </>
                )}
              </div>
              
              <div className="text-xs text-muted-foreground">
                {filteredData.length > 0 
                  ? `Showing ${allSymbols.length} symbols across ${sortedDates.length} ${selectedTimeframe}s` 
                  : 'No data available'}
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

// Helper function to format date 
function formatDate(dateStr: string, timeframe: string): string {
  const date = new Date(dateStr);
  
  if (timeframe === 'day') {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } else if (timeframe === 'week') {
    return `W${getWeekNumber(date)}`;
  } else if (timeframe === 'month') {
    return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
  } else { // quarter
    const quarter = Math.floor(date.getMonth() / 3) + 1;
    return `Q${quarter} ${date.getFullYear()}`;
  }
}

// Helper function to get week number
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Generate random trading data based on timeframe
function generateMockTradingData(timeframe: string): TradingData[] {
  const data: TradingData[] = [];
  const now = new Date();
  const symbols = Object.values(ALL_TRADING_SYMBOLS).flat().slice(0, 30); // Take first 30 symbols
  
  let dates: string[] = [];
  
  // Generate dates based on timeframe
  if (timeframe === 'day') {
    // Last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      dates.push(date.toISOString().split('T')[0]);
    }
  } else if (timeframe === 'week') {
    // Last 8 weeks
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - (i * 7));
      dates.push(date.toISOString().split('T')[0]);
    }
  } else if (timeframe === 'month') {
    // Last 12 months
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - i);
      date.setDate(1);
      dates.push(date.toISOString().split('T')[0]);
    }
  } else { // quarter
    // Last 8 quarters
    for (let i = 7; i >= 0; i--) {
      const date = new Date(now);
      date.setMonth(date.getMonth() - (i * 3));
      // Set to start of quarter
      const quarterMonth = Math.floor(date.getMonth() / 3) * 3;
      date.setMonth(quarterMonth);
      date.setDate(1);
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  // Generate data for each symbol and date
  for (const symbol of symbols) {
    let prevPerformance = 0;
    
    // Determine asset category
    let category: 'crypto' | 'forex' | 'stocks' | 'futures';
    if (symbol.includes('/')) {
      category = 'forex';
    } else if (symbol.includes('BTC') || symbol.includes('ETH') || symbol.includes('SOL')) {
      category = 'crypto';
    } else if (symbol.includes('NQ') || symbol.includes('ES') || symbol.includes('MNQ')) {
      category = 'futures';
    } else {
      category = 'stocks';
    }
    
    for (const date of dates) {
      // Sometimes skip a date for realism
      if (Math.random() > 0.9) continue;
      
      // Generate correlated performance with some momentum
      const performanceChange = (Math.random() * 10 - 5) + (prevPerformance * 0.3);
      const performance = parseFloat((performanceChange).toFixed(2));
      prevPerformance = performance;
      
      // Volume and trades are somewhat correlated with absolute performance
      const absPerf = Math.abs(performance);
      const volumeBase = Math.random() * 70 + 10;
      const volume = Math.round(volumeBase + (absPerf * 2));
      
      const tradesBase = Math.random() * 70 + 10;
      const trades = Math.round(tradesBase + (absPerf * 3));
      
      data.push({
        symbol,
        date,
        performance,
        volume,
        trades,
        category
      });
    }
  }
  
  return data;
}

// Generate insights from data
function generateInsightsFromData(data: TradingData[]): string[] {
  if (data.length === 0) return [];
  
  const insights: string[] = [];
  
  // Group by symbol
  const symbolGroups = data.reduce<{ [key: string]: TradingData[] }>((acc, item) => {
    if (!acc[item.symbol]) {
      acc[item.symbol] = [];
    }
    acc[item.symbol].push(item);
    return acc;
  }, {});
  
  // Group by date
  const dateGroups = data.reduce<{ [key: string]: TradingData[] }>((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = [];
    }
    acc[item.date].push(item);
    return acc;
  }, {});
  
  // Group by category
  const categoryGroups = data.reduce<{ [key: string]: TradingData[] }>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {});
  
  // Best performing symbol
  const symbolPerformances = Object.entries(symbolGroups).map(([symbol, items]) => {
    const totalPerf = items.reduce((sum, item) => sum + item.performance, 0);
    return { symbol, performance: totalPerf };
  });
  
  const bestSymbol = symbolPerformances.sort((a, b) => b.performance - a.performance)[0];
  if (bestSymbol) {
    insights.push(`${bestSymbol.symbol} is the best performing asset with a cumulative gain of ${bestSymbol.performance.toFixed(2)}%.`);
  }
  
  // Worst performing symbol
  const worstSymbol = symbolPerformances.sort((a, b) => a.performance - b.performance)[0];
  if (worstSymbol) {
    insights.push(`${worstSymbol.symbol} shows the largest decline with a cumulative loss of ${Math.abs(worstSymbol.performance).toFixed(2)}%.`);
  }
  
  // Best performing day
  const datePerformances = Object.entries(dateGroups).map(([date, items]) => {
    const avgPerf = items.reduce((sum, item) => sum + item.performance, 0) / items.length;
    return { date, performance: avgPerf };
  });
  
  const bestDate = datePerformances.sort((a, b) => b.performance - a.performance)[0];
  if (bestDate) {
    insights.push(`The strongest market day was ${formatDate(bestDate.date, 'day')} with an average return of ${bestDate.performance.toFixed(2)}%.`);
  }
  
  // Highest volume day
  const dateVolumes = Object.entries(dateGroups).map(([date, items]) => {
    const totalVolume = items.reduce((sum, item) => sum + item.volume, 0);
    return { date, volume: totalVolume };
  });
  
  const highestVolumeDate = dateVolumes.sort((a, b) => b.volume - a.volume)[0];
  if (highestVolumeDate) {
    insights.push(`Highest trading volume was recorded on ${formatDate(highestVolumeDate.date, 'day')}, indicating strong market participation.`);
  }
  
  // Category insights
  const categoryPerformances = Object.entries(categoryGroups).map(([category, items]) => {
    const avgPerf = items.reduce((sum, item) => sum + item.performance, 0) / items.length;
    return { category, performance: avgPerf };
  });
  
  const bestCategory = categoryPerformances.sort((a, b) => b.performance - a.performance)[0];
  if (bestCategory) {
    insights.push(`${bestCategory.category.charAt(0).toUpperCase() + bestCategory.category.slice(1)} assets are outperforming with an average return of ${bestCategory.performance.toFixed(2)}%.`);
  }
  
  // Trend insights
  const recentDates = datePerformances.slice(-3);
  const recentTrend = recentDates.every(d => d.performance > 0) 
    ? "upward" 
    : recentDates.every(d => d.performance < 0) 
      ? "downward" 
      : "mixed";
  
  if (recentTrend === "upward") {
    insights.push("Markets show a bullish trend in recent periods, with positive returns across most assets.");
  } else if (recentTrend === "downward") {
    insights.push("Markets display a bearish trend lately, with negative returns in most recent periods.");
  } else {
    insights.push("Recent market activity shows mixed signals with varied performance across assets.");
  }
  
  // Volatility insight
  const volatilities = Object.entries(symbolGroups).map(([symbol, items]) => {
    if (items.length < 2) return { symbol, volatility: 0 };
    
    const performances = items.map(i => i.performance);
    const mean = performances.reduce((sum, p) => sum + p, 0) / performances.length;
    const variance = performances.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / performances.length;
    return { symbol, volatility: Math.sqrt(variance) };
  });
  
  const mostVolatile = volatilities.sort((a, b) => b.volatility - a.volatility)[0];
  if (mostVolatile && mostVolatile.volatility > 0) {
    insights.push(`${mostVolatile.symbol} shows the highest volatility, suggesting potential for significant price swings.`);
  }
  
  return insights;
}