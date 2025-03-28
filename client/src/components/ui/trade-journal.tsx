import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Badge } from "@/components/ui/badge";
import { Check, UploadCloud, Calendar, PieChart, DollarSign, TrendingUp, TrendingDown, Clock, FileText, BarChart2, Download, RotateCw, Filter, Briefcase, ChevronsUpDown, Plus, PlusCircle, Search as SearchIcon } from 'lucide-react';

export interface Trade {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  entryPrice: number;
  exitPrice?: number;
  entryDate: string;
  exitDate?: string;
  profit?: number;
  profitPercentage?: number;
  status: 'open' | 'closed';
  stopLoss?: number;
  takeProfit?: number;
  notes?: string;
  tags?: string[];
  source?: string;
  fees?: number;
  strategy?: string;
}

export interface TradeStats {
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  totalLoss: number;
  netPnL: number;
  avgWin: number;
  avgLoss: number;
  largestWin: number;
  largestLoss: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  breakEvenTrades?: number;
}

interface TradeJournalProps {
  className?: string;
}

export function TradeJournal({ className }: TradeJournalProps) {
  const [activeTab, setActiveTab] = useState<string>('performance');
  const [trades, setTrades] = useState<Trade[]>([]);
  const [stats, setStats] = useState<TradeStats | null>(null);
  const [fileUploadStatus, setFileUploadStatus] = useState<string>('idle');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [timeframe, setTimeframe] = useState<string>('all');
  const [strategyFilter, setStrategyFilter] = useState<string>('all');
  const [symbolFilter, setSymbolFilter] = useState<string>('all');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');

  // Fetch trades and stats
  useEffect(() => {
    // Simulate fetching data from the API
    setTimeout(() => {
      const mockTrades: Trade[] = [
        {
          id: '1',
          symbol: 'BTCUSD',
          side: 'buy',
          quantity: 0.5,
          entryPrice: 37500,
          exitPrice: 39200,
          entryDate: '2025-03-25T09:30:00Z',
          exitDate: '2025-03-26T14:45:00Z',
          profit: 850,
          profitPercentage: 4.53,
          status: 'closed',
          stopLoss: 36000,
          takeProfit: 41000,
          notes: 'Entered on bullish divergence, exited on resistance test',
          tags: ['swing', 'technical', 'crypto'],
          source: 'manual',
          fees: 12.5,
          strategy: 'Trend Following'
        },
        {
          id: '2',
          symbol: 'EURUSD',
          side: 'sell',
          quantity: 10000,
          entryPrice: 1.0825,
          exitPrice: 1.0755,
          entryDate: '2025-03-24T15:20:00Z',
          exitDate: '2025-03-25T11:15:00Z',
          profit: 700,
          profitPercentage: 0.65,
          status: 'closed',
          stopLoss: 1.0875,
          takeProfit: 1.0725,
          notes: 'Short after ECB comments on rate outlook',
          tags: ['day-trade', 'news', 'forex'],
          source: 'signal',
          fees: 8.2,
          strategy: 'News Trading'
        },
        {
          id: '3',
          symbol: 'AAPL',
          side: 'buy',
          quantity: 25,
          entryPrice: 185.5,
          exitPrice: 178.75,
          entryDate: '2025-03-20T10:05:00Z',
          exitDate: '2025-03-24T09:30:00Z',
          profit: -168.75,
          profitPercentage: -3.64,
          status: 'closed',
          stopLoss: 178.5,
          takeProfit: 195,
          notes: 'Earnings play - stock missed expectations',
          tags: ['swing', 'earnings', 'stocks'],
          source: 'manual',
          fees: 4.99,
          strategy: 'Earnings Play'
        },
        {
          id: '4',
          symbol: 'XAUUSD',
          side: 'buy',
          quantity: 1,
          entryPrice: 2200,
          entryDate: '2025-03-27T08:15:00Z',
          status: 'open',
          stopLoss: 2180,
          takeProfit: 2250,
          notes: 'Gold breakout above resistance with increasing volume',
          tags: ['swing', 'technical', 'commodities'],
          source: 'manual',
          strategy: 'Breakout'
        }
      ];

      const mockStats: TradeStats = {
        winRate: 66.7,
        profitFactor: 3.2,
        totalProfit: 1550,
        totalLoss: 168.75,
        netPnL: 1381.25,
        avgWin: 775,
        avgLoss: 168.75,
        largestWin: 850,
        largestLoss: 168.75,
        totalTrades: 4,
        winningTrades: 2,
        losingTrades: 1,
        breakEvenTrades: 0
      };

      const mockAiAnalysis = `
        Based on your trading history, I've identified several patterns and areas for improvement:

        1. ✅ Strong performance in cryptocurrency trades (84% win rate)
        2. ✅ Good risk management with consistent stop loss usage
        3. ⚠️ Overtrading during high volatility periods
        4. ⚠️ Emotional exits leading to early profit-taking
        
        Recommendations:
        1. Consider scaling into positions rather than full-size entries
        2. Your win rate on Mondays is only 45% - consider waiting for clearer setups
        3. Your best performing strategy is Trend Following with a 78% win rate
        4. Consider increasing position sizes on your highest probability setups (breakouts with volume)
      `;

      setTrades(mockTrades);
      setStats(mockStats);
      setAiAnalysis(mockAiAnalysis);
      setIsLoading(false);
    }, 1500);
  }, []);

  // Filter trades based on search term, timeframe, and strategy
  const filteredTrades = trades.filter(trade => {
    const matchesSearch = 
      trade.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trade.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesTimeframe = timeframe === 'all' ? true : 
      timeframe === 'thisWeek' ? new Date(trade.entryDate) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) :
      timeframe === 'thisMonth' ? new Date(trade.entryDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) :
      timeframe === 'thisYear' ? new Date(trade.entryDate) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) : true;
    
    const matchesStrategy = strategyFilter === 'all' ? true : trade.strategy === strategyFilter;
    
    const matchesSymbol = symbolFilter === 'all' ? true : trade.symbol === symbolFilter;
    
    return matchesSearch && matchesTimeframe && matchesStrategy && matchesSymbol;
  });

  // Get unique strategies and symbols for filtering
  const strategies = ['all', ...Array.from(new Set(trades.map(trade => trade.strategy).filter(Boolean) as string[]))];
  const symbols = ['all', ...Array.from(new Set(trades.map(trade => trade.symbol)))];

  // Handle file upload (mock implementation)
  const handleFileUpload = () => {
    setFileUploadStatus('uploading');
    setTimeout(() => {
      setFileUploadStatus('success');
      // Would process file here and update trades/stats
      setTimeout(() => setFileUploadStatus('idle'), 2000);
    }, 1500);
  };

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  return (
    <div className={`trade-journal ${className}`}>
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <CardTitle className="text-2xl font-bold">Trade Journal</CardTitle>
              <CardDescription>Track, analyze, and improve your trading performance</CardDescription>
            </div>
            <div className="flex gap-2 mt-4 md:mt-0">
              <Button variant="outline" size="sm" className="gap-1" onClick={handleFileUpload} disabled={fileUploadStatus === 'uploading'}>
                {fileUploadStatus === 'uploading' ? (
                  <RotateCw className="h-4 w-4 animate-spin" />
                ) : fileUploadStatus === 'success' ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <UploadCloud className="h-4 w-4" />
                )}
                Import
              </Button>
              <Button variant="outline" size="sm" className="gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button variant="default" size="sm" className="gap-1">
                <PlusCircle className="h-4 w-4" />
                New Trade
              </Button>
            </div>
          </div>
          
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
            <TabsList className="grid grid-cols-4">
              <TabsTrigger value="performance" className="text-xs md:text-sm">
                <PieChart className="h-4 w-4 mr-1 hidden md:inline" />
                Performance
              </TabsTrigger>
              <TabsTrigger value="trades" className="text-xs md:text-sm">
                <Briefcase className="h-4 w-4 mr-1 hidden md:inline" />
                Trades
              </TabsTrigger>
              <TabsTrigger value="journal" className="text-xs md:text-sm">
                <FileText className="h-4 w-4 mr-1 hidden md:inline" />
                Journal
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs md:text-sm">
                <TrendingUp className="h-4 w-4 mr-1 hidden md:inline" />
                AI Analysis
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading your trading data...</p>
            </div>
          ) : (
            <>
              {/* Performance Tab */}
              <TabsContent value="performance" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <StatCard 
                    title="Win Rate" 
                    value={`${stats?.winRate.toFixed(1)}%`} 
                    icon={<PieChart className="h-5 w-5 text-blue-500" />}
                    trend={stats?.winRate && stats.winRate > 50 ? 'up' : 'down'}
                    trendValue="+2.3% vs Last Month"
                  />
                  <StatCard 
                    title="Net P&L" 
                    value={formatCurrency(stats?.netPnL || 0)} 
                    icon={<DollarSign className="h-5 w-5 text-green-500" />}
                    trend={stats?.netPnL && stats.netPnL > 0 ? 'up' : 'down'}
                    trendValue="+$350 vs Last Month"
                  />
                  <StatCard 
                    title="Profit Factor" 
                    value={stats?.profitFactor.toFixed(2) || '0'} 
                    icon={<BarChart2 className="h-5 w-5 text-indigo-500" />}
                    trend={stats?.profitFactor && stats.profitFactor > 2 ? 'up' : 'down'}
                    trendValue="+0.4 vs Last Month"
                  />
                  <StatCard 
                    title="Trades" 
                    value={stats?.totalTrades.toString() || '0'} 
                    icon={<Clock className="h-5 w-5 text-amber-500" />}
                    secondaryValue={`${stats?.winningTrades} Win / ${stats?.losingTrades} Loss`}
                  />
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-6">
                  <Card className="col-span-1 lg:col-span-2">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Performance Over Time</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 w-full bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Performance chart will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Trade Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>By Market</span>
                            <span className="text-muted-foreground">% of Trades</span>
                          </div>
                          <DistributionBar 
                            segments={[
                              { label: 'Crypto', value: 40, color: 'bg-blue-500' },
                              { label: 'Forex', value: 35, color: 'bg-green-500' },
                              { label: 'Stocks', value: 15, color: 'bg-amber-500' },
                              { label: 'Commodities', value: 10, color: 'bg-purple-500' }
                            ]} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>By Strategy</span>
                            <span className="text-muted-foreground">% of Profit</span>
                          </div>
                          <DistributionBar 
                            segments={[
                              { label: 'Trend Following', value: 50, color: 'bg-indigo-500' },
                              { label: 'Breakout', value: 25, color: 'bg-pink-500' },
                              { label: 'News Trading', value: 15, color: 'bg-cyan-500' },
                              { label: 'Other', value: 10, color: 'bg-gray-500' }
                            ]} 
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>By Direction</span>
                            <span className="text-muted-foreground">% of Trades</span>
                          </div>
                          <DistributionBar 
                            segments={[
                              { label: 'Long', value: 65, color: 'bg-green-500' },
                              { label: 'Short', value: 35, color: 'bg-red-500' }
                            ]} 
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Time Analysis</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 w-full bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                        <p className="text-muted-foreground">Day/Time heatmap will be displayed here</p>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">Risk Management</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <MetricRow
                          label="Risk-Reward Ratio"
                          value="1:2.5"
                          trend="up"
                          trendValue="+0.3"
                        />
                        <Separator />
                        <MetricRow
                          label="Avg Win Size"
                          value={formatCurrency(stats?.avgWin || 0)}
                          secondaryLabel="vs Avg Loss"
                          secondaryValue={formatCurrency(Math.abs(stats?.avgLoss || 0))}
                        />
                        <Separator />
                        <MetricRow
                          label="Max Drawdown"
                          value="$425.50"
                          trend="down"
                          trendValue="4.2% of capital"
                        />
                        <Separator />
                        <MetricRow
                          label="Avg Hold Time (Win)"
                          value="1.2 days"
                          secondaryLabel="Avg Hold Time (Loss)"
                          secondaryValue="0.8 days"
                        />
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            
              {/* Trades Tab */}
              <TabsContent value="trades">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                  <div className="flex flex-1 items-center gap-2">
                    <div className="relative flex-1 max-w-md">
                      <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input 
                        placeholder="Search trades..." 
                        className="pl-10"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-muted-foreground" />
                      <Select value={timeframe} onValueChange={setTimeframe}>
                        <SelectTrigger className="w-32">
                          <SelectValue placeholder="Timeframe" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Time</SelectItem>
                          <SelectItem value="thisWeek">This Week</SelectItem>
                          <SelectItem value="thisMonth">This Month</SelectItem>
                          <SelectItem value="thisYear">This Year</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Select value={strategyFilter} onValueChange={setStrategyFilter}>
                      <SelectTrigger className="w-32">
                        <SelectValue placeholder="Strategy" />
                      </SelectTrigger>
                      <SelectContent>
                        {strategies.map(strategy => (
                          <SelectItem key={strategy} value={strategy}>
                            {strategy === 'all' ? 'All Strategies' : strategy}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select value={symbolFilter} onValueChange={setSymbolFilter}>
                      <SelectTrigger className="w-28">
                        <SelectValue placeholder="Symbol" />
                      </SelectTrigger>
                      <SelectContent>
                        {symbols.map(symbol => (
                          <SelectItem key={symbol} value={symbol}>
                            {symbol === 'all' ? 'All Symbols' : symbol}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="rounded-md border">
                  <ScrollArea className="h-[calc(100vh-320px)] min-h-[300px]">
                    <Table>
                      <TableHeader className="sticky top-0 bg-background">
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Side</TableHead>
                          <TableHead>Entry Price</TableHead>
                          <TableHead>Exit Price</TableHead>
                          <TableHead>Size</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Date</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="w-[100px]">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTrades.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                              No trades found matching your filters
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredTrades.map(trade => (
                            <TableRow key={trade.id}>
                              <TableCell className="font-medium">
                                {trade.symbol}
                              </TableCell>
                              <TableCell>
                                <div className={`flex items-center gap-1 ${trade.side === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                                  {trade.side === 'buy' ? (
                                    <TrendingUp className="h-4 w-4" />
                                  ) : (
                                    <TrendingDown className="h-4 w-4" />
                                  )}
                                  {trade.side === 'buy' ? 'Long' : 'Short'}
                                </div>
                              </TableCell>
                              <TableCell>
                                {formatCurrency(trade.entryPrice)}
                              </TableCell>
                              <TableCell>
                                {trade.exitPrice ? formatCurrency(trade.exitPrice) : '-'}
                              </TableCell>
                              <TableCell>
                                {trade.quantity}
                              </TableCell>
                              <TableCell>
                                {trade.profit !== undefined ? (
                                  <div className={`flex items-center ${trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                    {formatCurrency(trade.profit)}
                                    <span className="ml-1 text-xs">
                                      ({trade.profitPercentage?.toFixed(2)}%)
                                    </span>
                                  </div>
                                ) : (
                                  '-'
                                )}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col">
                                  <span className="text-xs">
                                    {new Date(trade.entryDate).toLocaleDateString()}
                                  </span>
                                  {trade.exitDate && (
                                    <span className="text-xs text-muted-foreground">
                                      to {new Date(trade.exitDate).toLocaleDateString()}
                                    </span>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={trade.status === 'open' ? 'outline' : 'secondary'}>
                                  {trade.status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                  <Button variant="ghost" size="icon" className="h-7 w-7">
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </ScrollArea>
                </div>
              </TabsContent>
              
              {/* Journal Tab */}
              <TabsContent value="journal">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    {filteredTrades.map(trade => (
                      <Card key={trade.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-10 rounded-full ${trade.profit && trade.profit >= 0 ? 'bg-green-500' : trade.profit ? 'bg-red-500' : 'bg-blue-500'}`}></div>
                              <div>
                                <CardTitle className="text-lg">
                                  {trade.symbol} {trade.side === 'buy' ? 'Long' : 'Short'}
                                </CardTitle>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                  <Calendar className="h-4 w-4" />
                                  {new Date(trade.entryDate).toLocaleDateString()} 
                                  {trade.exitDate && (
                                    <>
                                      <span>→</span>
                                      {new Date(trade.exitDate).toLocaleDateString()}
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className={`text-lg font-semibold ${trade.profit && trade.profit >= 0 ? 'text-green-500' : trade.profit ? 'text-red-500' : ''}`}>
                                {trade.profit !== undefined ? formatCurrency(trade.profit) : 'Open'}
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {trade.profitPercentage !== undefined ? `${trade.profitPercentage.toFixed(2)}%` : ''}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-4">
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Entry:</span>
                              <span className="text-sm font-medium">{formatCurrency(trade.entryPrice)}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Size:</span>
                              <span className="text-sm font-medium">{trade.quantity}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Exit:</span>
                              <span className="text-sm font-medium">{trade.exitPrice ? formatCurrency(trade.exitPrice) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Strategy:</span>
                              <span className="text-sm font-medium">{trade.strategy || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Stop Loss:</span>
                              <span className="text-sm font-medium">{trade.stopLoss ? formatCurrency(trade.stopLoss) : 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-sm text-muted-foreground">Take Profit:</span>
                              <span className="text-sm font-medium">{trade.takeProfit ? formatCurrency(trade.takeProfit) : 'N/A'}</span>
                            </div>
                          </div>
                          
                          <Separator className="my-3" />
                          
                          <div className="mt-3">
                            <h4 className="text-sm font-medium mb-2">Notes:</h4>
                            <p className="text-sm text-muted-foreground">{trade.notes || 'No notes provided for this trade.'}</p>
                          </div>
                          
                          {trade.tags && trade.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-4">
                              {trade.tags.map(tag => (
                                <Badge key={tag} variant="outline" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">My Journal</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <Label className="text-sm">Today's Notes</Label>
                            <textarea 
                              className="w-full h-32 mt-1 p-2 text-sm rounded-md border border-input bg-background"
                              placeholder="Reflect on today's trading activity, market conditions, and your emotional state..."
                            ></textarea>
                          </div>
                          <div>
                            <Label className="text-sm">Market Outlook</Label>
                            <div className="flex items-center gap-2 mt-1">
                              <Select defaultValue="neutral">
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select outlook" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="bullish">Bullish</SelectItem>
                                  <SelectItem value="neutral">Neutral</SelectItem>
                                  <SelectItem value="bearish">Bearish</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button variant="outline" size="sm">
                                Save
                              </Button>
                            </div>
                          </div>
                          <Separator />
                          <div>
                            <h4 className="text-sm font-medium mb-2">Recent Journal Entries</h4>
                            <div className="space-y-3">
                              <JournalEntry 
                                date="March 27, 2025"
                                content="Markets choppy today with mixed signals. Holding off on new positions until clearer direction emerges."
                              />
                              <JournalEntry 
                                date="March 26, 2025"
                                content="Bitcoin showing strength after breaking above resistance. Considering increasing position size."
                              />
                              <JournalEntry 
                                date="March 25, 2025"
                                content="EUR/USD trade worked perfectly. Need to remember this pattern for future setups."
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Trading Rules</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">1</div>
                            <p className="text-sm">Always use a stop loss, no exceptions.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">2</div>
                            <p className="text-sm">Never risk more than 2% of account on a single trade.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">3</div>
                            <p className="text-sm">Wait for confirmation before entering a trade.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">4</div>
                            <p className="text-sm">Don't trade during major news events unless it's part of the strategy.</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <div className="bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center mt-0.5 flex-shrink-0">5</div>
                            <p className="text-sm">Review all trades weekly and monthly to identify patterns.</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              {/* AI Analysis Tab */}
              <TabsContent value="analysis">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          AI Performance Analysis
                        </CardTitle>
                        <CardDescription>
                          Based on your trading history, our AI has identified patterns and suggestions to improve your performance
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="prose prose-sm max-w-none dark:prose-invert">
                          <div className="whitespace-pre-line">
                            {aiAnalysis}
                          </div>
                          
                          <h3 className="text-lg font-semibold mt-6">Entry Analysis</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <Card className="bg-slate-50 dark:bg-slate-900">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Best Entry Days</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span>Wednesday</span>
                                    <div className="flex items-center">
                                      <span className="text-green-500 font-semibold mr-2">82%</span>
                                      <Progress value={82} className="w-24 h-2" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Friday</span>
                                    <div className="flex items-center">
                                      <span className="text-green-500 font-semibold mr-2">75%</span>
                                      <Progress value={75} className="w-24 h-2" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Tuesday</span>
                                    <div className="flex items-center">
                                      <span className="text-green-500 font-semibold mr-2">68%</span>
                                      <Progress value={68} className="w-24 h-2" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                            
                            <Card className="bg-slate-50 dark:bg-slate-900">
                              <CardHeader className="pb-2">
                                <CardTitle className="text-base">Worst Entry Days</CardTitle>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2">
                                  <div className="flex justify-between items-center">
                                    <span>Monday</span>
                                    <div className="flex items-center">
                                      <span className="text-red-500 font-semibold mr-2">45%</span>
                                      <Progress value={45} className="w-24 h-2" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Thursday</span>
                                    <div className="flex items-center">
                                      <span className="text-amber-500 font-semibold mr-2">58%</span>
                                      <Progress value={58} className="w-24 h-2" />
                                    </div>
                                  </div>
                                  <div className="flex justify-between items-center">
                                    <span>Weekend</span>
                                    <div className="flex items-center">
                                      <span className="text-amber-500 font-semibold mr-2">52%</span>
                                      <Progress value={52} className="w-24 h-2" />
                                    </div>
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </div>
                          
                          <h3 className="text-lg font-semibold mt-6">Trading Patterns</h3>
                          <p>
                            The AI has identified the following patterns in your trading behavior:
                          </p>
                          <ul className="space-y-2">
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>You perform best when entering trades during the New York session (56% of winning trades)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>You tend to cut winning trades too early (avg. hold time for winners: 1.2 days vs. optimal 1.8 days)</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                              <span>Breakout strategies have your highest win rate (78%), consider focusing more on this setup</span>
                            </li>
                            <li className="flex items-start gap-2">
                              <XCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                              <span>You tend to overtrade during high volatility periods (25% more trades with 15% lower win rate)</span>
                            </li>
                          </ul>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div className="space-y-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">Strategy Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <StrategyCard 
                            name="Trend Following"
                            winRate={78}
                            profitFactor={3.2}
                            trades={12}
                          />
                          <StrategyCard 
                            name="Breakout"
                            winRate={71}
                            profitFactor={2.5}
                            trades={7}
                          />
                          <StrategyCard 
                            name="News Trading"
                            winRate={60}
                            profitFactor={1.8}
                            trades={5}
                          />
                          <StrategyCard 
                            name="Earnings Play"
                            winRate={50}
                            profitFactor={1.1}
                            trades={4}
                          />
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">AI Suggestions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex items-start gap-3">
                            <div className="bg-blue-100 dark:bg-blue-950 p-2 rounded-full">
                              <BulbIcon className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Trade Sizing Adjustment</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Increase position size by 15% on trend following setups to capitalize on higher win rate.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="bg-green-100 dark:bg-green-950 p-2 rounded-full">
                              <StoreIcon className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Hold Time Optimization</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Use trailing stops instead of fixed take profits to let winners run longer.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="bg-amber-100 dark:bg-amber-950 p-2 rounded-full">
                              <ShieldAlert className="h-4 w-4 text-amber-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Risk Management</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Avoid trading on Mondays - your win rate drops to 45% on this day.
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-start gap-3">
                            <div className="bg-purple-100 dark:bg-purple-950 p-2 rounded-full">
                              <Target className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                              <h4 className="text-sm font-semibold">Focus Market</h4>
                              <p className="text-xs text-muted-foreground mt-1">
                                Your crypto trades have 84% win rate - consider allocating more capital to this market.
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Helper Components
function StatCard({ title, value, icon, trend, trendValue, secondaryValue }: { 
  title: string, 
  value: string, 
  icon: React.ReactNode,
  trend?: 'up' | 'down', 
  trendValue?: string,
  secondaryValue?: string
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-1">{value}</h3>
            {secondaryValue && (
              <p className="text-xs text-muted-foreground mt-1">{secondaryValue}</p>
            )}
            {trendValue && (
              <div className={`flex items-center mt-1 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {trend === 'up' ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                {trendValue}
              </div>
            )}
          </div>
          <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-full">
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DistributionSegment {
  label: string;
  value: number;
  color: string;
}

function DistributionBar({ segments }: { segments: DistributionSegment[] }) {
  return (
    <div className="space-y-1">
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
        {segments.map((segment, index) => (
          <div 
            key={index} 
            className={`${segment.color}`} 
            style={{ width: `${segment.value}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between text-xs">
        {segments.map((segment, index) => (
          <div key={index} className="flex items-center">
            <div className={`w-2 h-2 rounded-full ${segment.color} mr-1`} />
            <span>{segment.label} ({segment.value}%)</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MetricRow({ 
  label, 
  value, 
  secondaryLabel, 
  secondaryValue,
  trend,
  trendValue
}: {
  label: string;
  value: string;
  secondaryLabel?: string;
  secondaryValue?: string;
  trend?: 'up' | 'down';
  trendValue?: string;
}) {
  return (
    <div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-muted-foreground">{label}</span>
        <span className="text-sm font-medium">
          {value}
          {trend && (
            <span className={`ml-1 text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
              {trend === 'up' ? '↑' : '↓'}
            </span>
          )}
        </span>
      </div>
      {(secondaryLabel && secondaryValue) && (
        <div className="flex justify-between items-center mt-1">
          <span className="text-sm text-muted-foreground">{secondaryLabel}</span>
          <span className="text-sm font-medium">{secondaryValue}</span>
        </div>
      )}
      {trendValue && (
        <div className="flex justify-end mt-1">
          <span className={`text-xs ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trendValue}
          </span>
        </div>
      )}
    </div>
  );
}

function JournalEntry({ date, content }: { date: string, content: string }) {
  return (
    <div className="border-l-2 border-blue-500 pl-3 py-1">
      <div className="text-xs font-medium mb-1">{date}</div>
      <p className="text-xs text-muted-foreground">{content}</p>
    </div>
  );
}

function StrategyCard({ name, winRate, profitFactor, trades }: { 
  name: string, 
  winRate: number, 
  profitFactor: number,
  trades: number
}) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
      <div className="flex justify-between items-center">
        <h4 className="text-sm font-medium">{name}</h4>
        <Badge variant={winRate >= 70 ? "default" : winRate >= 60 ? "secondary" : "outline"}>
          {trades} trades
        </Badge>
      </div>
      <div className="grid grid-cols-2 gap-4 mt-2">
        <div>
          <div className="text-xs text-muted-foreground">Win Rate</div>
          <div className="text-sm font-semibold mt-1">{winRate}%</div>
          <Progress value={winRate} className="h-1 mt-1" />
        </div>
        <div>
          <div className="text-xs text-muted-foreground">Profit Factor</div>
          <div className="text-sm font-semibold mt-1">{profitFactor.toFixed(1)}</div>
          <Progress value={Math.min(profitFactor * 20, 100)} className="h-1 mt-1" />
        </div>
      </div>
    </div>
  );
}

// Icons
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

function Eye(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function Pencil(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      <path d="m15 5 4 4" />
    </svg>
  );
}

// Removed duplicate SearchIcon as we're using the imported version from lucide-react

function PlusCircleIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12h8" />
      <path d="M12 8v8" />
    </svg>
  );
}

function CheckCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </svg>
  );
}

function XCircle(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

function BulbIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function StoreIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7" />
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4" />
      <path d="M2 7h20" />
      <path d="M22 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M18 12v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2v-3" />
      <path d="M14 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
      <path d="M10 12v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2v-3" />
      <path d="M6 7v3a2 2 0 0 1-2 2v0a2 2 0 0 1-2-2V7" />
    </svg>
  );
}

function ShieldAlert(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}

function Target(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  );
}