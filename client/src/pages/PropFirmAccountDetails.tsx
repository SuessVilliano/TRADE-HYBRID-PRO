import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertCircle, 
  ChevronLeft, 
  Clock, 
  DollarSign, 
  Loader2, 
  TrendingDown, 
  TrendingUp,
  BarChart3,
  Calendar,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils/formatters';
import { LineChart } from '@/components/ui/line-chart';

interface Trade {
  id: number;
  symbol: string;
  direction: string;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  profit?: number;
  active: boolean;
  entryTimestamp: string;
  exitTimestamp?: string;
}

interface Metric {
  date: string;
  balance: number;
  equity: number;
  dailyPnl: number;
  dailyPnlPercent: number;
  drawdown: number;
  drawdownPercent: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
}

interface Payout {
  id: number;
  amount: number;
  status: string;
  tradePeriodStart: string;
  tradePeriodEnd: string;
  paymentMethod: string;
  requestedAt: string;
  processedAt?: string;
}

interface Account {
  id: number;
  userId: number;
  challengeId?: number;
  accountName: string;
  accountType: string;
  accountSize: number;
  currentBalance: number;
  profitTarget?: number;
  maxDailyDrawdown?: number;
  maxTotalDrawdown?: number;
  startDate: string;
  endDate?: string;
  status: string;
  tradingAllowed: boolean;
  profitSplit: number;
  challenge?: any;
}

const PropFirmAccountDetails: React.FC = () => {
  const { accountId } = useParams<{ accountId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<Account | null>(null);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [evalResult, setEvalResult] = useState<any>(null);
  const [evaluating, setEvaluating] = useState(false);
  
  // Calculate summary metrics
  const totalTrades = trades.length;
  const activeTrades = trades.filter(t => t.active).length;
  const closedTrades = trades.filter(t => !t.active).length;
  const winningTrades = trades.filter(t => t.profit !== undefined && t.profit > 0).length;
  const losingTrades = trades.filter(t => t.profit !== undefined && t.profit < 0).length;
  
  const winRate = closedTrades > 0 ? (winningTrades / closedTrades) * 100 : 0;
  
  const totalProfit = trades
    .filter(t => t.profit !== undefined)
    .reduce((sum, trade) => sum + (trade.profit || 0), 0);
  
  const profitFactor = metrics.length > 0 
    ? metrics[metrics.length - 1].winRate || 0
    : 0;
  
  // Prepare chart data
  const balanceData = metrics.map(m => ({
    x: new Date(m.date).toLocaleDateString(),
    y: m.balance
  }));
  
  const pnlData = metrics.map(m => ({
    x: new Date(m.date).toLocaleDateString(),
    y: m.dailyPnl
  }));
  
  const drawdownData = metrics.map(m => ({
    x: new Date(m.date).toLocaleDateString(),
    y: m.drawdownPercent
  }));

  useEffect(() => {
    // Fetch account details, trades, metrics, and payouts
    const fetchAccountData = async () => {
      try {
        // Fetch account details
        const accountResponse = await fetch(`/api/prop-firm/accounts/${accountId}`);
        if (!accountResponse.ok) {
          throw new Error('Failed to fetch account details');
        }
        const accountData = await accountResponse.json();
        setAccount(accountData);
        
        // Fetch trades
        const tradesResponse = await fetch(`/api/prop-firm/accounts/${accountId}/trades`);
        if (!tradesResponse.ok) {
          throw new Error('Failed to fetch trades');
        }
        const tradesData = await tradesResponse.json();
        setTrades(tradesData);
        
        // Fetch metrics (last 30 days)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 30);
        
        const metricsResponse = await fetch(
          `/api/prop-firm/accounts/${accountId}/metrics?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
        );
        if (!metricsResponse.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
        
        // Fetch payouts
        const payoutsResponse = await fetch(`/api/prop-firm/accounts/${accountId}/payouts`);
        if (!payoutsResponse.ok) {
          throw new Error('Failed to fetch payouts');
        }
        const payoutsData = await payoutsResponse.json();
        setPayouts(payoutsData);
      } catch (error) {
        console.error('Error fetching account data:', error);
        toast({
          title: 'Error',
          description: 'Failed to load account data. Please try again later.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchAccountData();
  }, [accountId, toast]);
  
  const evaluateChallenge = async () => {
    setEvaluating(true);
    try {
      const response = await fetch(`/api/prop-firm/accounts/${accountId}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to evaluate challenge');
      }
      
      const result = await response.json();
      setEvalResult(result);
      
      // If challenge was passed, refresh account data
      if (result.passed) {
        // Fetch updated account details
        const accountResponse = await fetch(`/api/prop-firm/accounts/${accountId}`);
        if (accountResponse.ok) {
          const accountData = await accountResponse.json();
          setAccount(accountData);
        }
        
        toast({
          title: 'Success!',
          description: result.message,
          variant: 'default',
        });
      } else {
        toast({
          title: 'Challenge Evaluation',
          description: result.message,
          variant: 'default',
        });
      }
    } catch (error) {
      console.error('Error evaluating challenge:', error);
      toast({
        title: 'Error',
        description: 'Failed to evaluate challenge. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setEvaluating(false);
    }
  };
  
  const requestPayout = () => {
    navigate(`/prop-firm/accounts/${accountId}/payout`);
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Active</Badge>;
      case 'funded':
        return <Badge className="bg-green-500 hover:bg-green-600">Funded</Badge>;
      case 'completed':
        return <Badge className="bg-green-500 hover:bg-green-600">Completed</Badge>;
      case 'failed':
        return <Badge className="bg-red-500 hover:bg-red-600">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const getTradeDirectionBadge = (direction: string) => {
    return direction.toLowerCase() === 'buy' ? (
      <Badge className="bg-green-500 hover:bg-green-600">Buy</Badge>
    ) : (
      <Badge className="bg-red-500 hover:bg-red-600">Sell</Badge>
    );
  };
  
  const getPayoutStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">Pending</Badge>;
      case 'processed':
        return <Badge className="bg-blue-500 hover:bg-blue-600">Processed</Badge>;
      case 'paid':
        return <Badge className="bg-green-500 hover:bg-green-600">Paid</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  // Get account progress percentage
  const getAccountProgress = () => {
    if (!account) return 0;
    if (account.accountType === 'funded') return 100;
    
    const currentProfit = account.currentBalance - account.accountSize;
    const profitPercent = (currentProfit / account.accountSize) * 100;
    const progressPercent = account.profitTarget ? (profitPercent / account.profitTarget) * 100 : 0;
    
    // Cap between 0 and 100
    return Math.min(Math.max(progressPercent, 0), 100);
  };
  
  if (loading) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading account details...</span>
        </div>
      </div>
    );
  }
  
  if (!account) {
    return (
      <div className="container px-4 mx-auto py-12">
        <div className="text-center p-8 bg-muted rounded-lg">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Account Not Found</h3>
          <p className="text-muted-foreground mb-4">
            The account you're looking for doesn't exist or you don't have permission to view it.
          </p>
          <Button onClick={() => navigate('/prop-firm')}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container px-4 mx-auto py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/prop-firm')}
            className="mr-2"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Back
          </Button>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{account.accountName}</h1>
            <div className="flex items-center mt-1">
              <p className="text-muted-foreground mr-2">
                {account.accountType === 'challenge_phase1' && 'Challenge - Phase 1'}
                {account.accountType === 'challenge_phase2' && 'Challenge - Phase 2'}
                {account.accountType === 'funded' && 'Funded Account'}
              </p>
              {getStatusBadge(account.status)}
            </div>
          </div>
          
          <div className="flex space-x-2">
            {account.status === 'active' && account.accountType !== 'funded' && (
              <Button 
                onClick={evaluateChallenge}
                disabled={evaluating}
              >
                {evaluating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Evaluate Challenge
              </Button>
            )}
            
            {account.status === 'funded' && (
              <Button onClick={requestPayout}>
                Request Payout
              </Button>
            )}
          </div>
        </div>
        
        {/* Account Summary Card */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Account Summary</CardTitle>
            <CardDescription>
              Account performance and key metrics
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">Account Size</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{formatCurrency(account.accountSize)}</p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">Current Balance</h3>
                </div>
                <p className={`text-2xl font-bold mt-2 ${account.currentBalance >= account.accountSize ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(account.currentBalance)}
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">Total Profit/Loss</h3>
                </div>
                <p className={`text-2xl font-bold mt-2 ${account.currentBalance >= account.accountSize ? 'text-green-500' : 'text-red-500'}`}>
                  {formatCurrency(account.currentBalance - account.accountSize)}
                  <span className="text-xs ml-1">
                    ({formatPercent((account.currentBalance - account.accountSize) / account.accountSize)})
                  </span>
                </p>
              </div>
              
              <div className="bg-primary/10 p-4 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <h3 className="text-sm font-medium">Start Date</h3>
                </div>
                <p className="text-2xl font-bold mt-2">{formatDate(account.startDate)}</p>
              </div>
            </div>
            
            {/* Challenge Progress (if not funded) */}
            {account.accountType !== 'funded' && account.profitTarget && (
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm">
                  <span>Progress to Target:</span>
                  <span>{Math.round(getAccountProgress())}%</span>
                </div>
                <Progress value={getAccountProgress()} className="h-2" />
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div>
                    <span className="text-sm text-muted-foreground">Profit Target:</span>
                    <span className="ml-2 font-medium">{formatPercent(account.profitTarget)}</span>
                  </div>
                  <div>
                    <span className="text-sm text-muted-foreground">Max Drawdown:</span>
                    <span className="ml-2 font-medium">{formatPercent(account.maxTotalDrawdown || 0)}</span>
                  </div>
                </div>
              </div>
            )}
            
            {/* Evaluation Result (if available) */}
            {evalResult && (
              <div className={`p-4 rounded-lg mb-6 ${evalResult.passed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                <div className="flex items-start">
                  {evalResult.passed ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 mr-2" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2" />
                  )}
                  <div>
                    <h3 className="font-semibold">{evalResult.passed ? 'Challenge Passed!' : 'Challenge Evaluation'}</h3>
                    <p className="text-sm">{evalResult.message}</p>
                    {evalResult.newPhase && (
                      <p className="text-sm mt-1">
                        Account updated to: <span className="font-semibold">{evalResult.newPhase}</span>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* Trading Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Trading Activity</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total Trades</p>
                    <p className="text-lg font-semibold">{totalTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Active Trades</p>
                    <p className="text-lg font-semibold">{activeTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Win Rate</p>
                    <p className="text-lg font-semibold">{formatPercent(winRate)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Profit Factor</p>
                    <p className="text-lg font-semibold">{profitFactor.toFixed(2)}</p>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h3 className="text-sm font-medium mb-2">Profit/Loss</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <p className="text-xs text-muted-foreground">Total P&L</p>
                    <p className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(totalProfit)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">P&L %</p>
                    <p className={`text-lg font-semibold ${totalProfit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(totalProfit / account.accountSize)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Winning Trades</p>
                    <p className="text-lg font-semibold text-green-500">{winningTrades}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Losing Trades</p>
                    <p className="text-lg font-semibold text-red-500">{losingTrades}</p>
                  </div>
                </div>
              </div>
              
              {account.accountType === 'funded' && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-sm font-medium mb-2">Payout Information</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">Profit Split</p>
                      <p className="text-lg font-semibold">{account.profitSplit}%</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Eligible Amount</p>
                      <p className="text-lg font-semibold">
                        {formatCurrency(Math.max(0, (account.currentBalance - account.accountSize) * (account.profitSplit / 100)))}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Recent Payouts</p>
                      <p className="text-lg font-semibold">{payouts.length}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Last Payout</p>
                      <p className="text-lg font-semibold">
                        {payouts.length > 0 ? formatDate(payouts[0].requestedAt) : '-'}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
        
        {/* Tabs for different data views */}
        <Tabs defaultValue="trades" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="trades">Trades</TabsTrigger>
            <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
            {account.accountType === 'funded' && (
              <TabsTrigger value="payouts">Payouts</TabsTrigger>
            )}
          </TabsList>
          
          {/* Trades Tab */}
          <TabsContent value="trades">
            <Card>
              <CardHeader>
                <CardTitle>Trade History</CardTitle>
                <CardDescription>
                  Records of all your trading activity for this account
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {trades.length > 0 ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Symbol</TableHead>
                          <TableHead>Direction</TableHead>
                          <TableHead>Entry</TableHead>
                          <TableHead>Exit</TableHead>
                          <TableHead>Quantity</TableHead>
                          <TableHead>P&L</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Date</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {trades.map((trade) => (
                          <TableRow key={trade.id}>
                            <TableCell className="font-medium">{trade.symbol}</TableCell>
                            <TableCell>{getTradeDirectionBadge(trade.direction)}</TableCell>
                            <TableCell>{trade.entryPrice}</TableCell>
                            <TableCell>{trade.exitPrice || '-'}</TableCell>
                            <TableCell>{trade.quantity}</TableCell>
                            <TableCell>
                              {trade.profit !== undefined ? (
                                <span className={trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                                  {formatCurrency(trade.profit)}
                                </span>
                              ) : '-'}
                            </TableCell>
                            <TableCell>
                              {trade.active ? (
                                <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-300">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-300">
                                  Closed
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>{formatDate(trade.entryTimestamp)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Trades Found</h3>
                    <p className="text-muted-foreground">
                      You haven't made any trades with this account yet.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Metrics Tab */}
          <TabsContent value="metrics">
            <Card>
              <CardHeader>
                <CardTitle>Performance Metrics</CardTitle>
                <CardDescription>
                  Detailed metrics and charts showing account performance over time
                </CardDescription>
              </CardHeader>
              
              <CardContent>
                {metrics.length > 0 ? (
                  <div className="space-y-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Account Balance</h3>
                      <div className="h-64">
                        <LineChart
                          data={[
                            {
                              name: 'Balance',
                              data: balanceData
                            }
                          ]}
                          categories={balanceData.map(d => d.x)}
                          colors={['#10b981']}
                          yAxisWidth={70}
                          showLegend={false}
                          showGridLines={true}
                          showGradient={true}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Daily P&L</h3>
                        <div className="h-64">
                          <LineChart
                            data={[
                              {
                                name: 'P&L',
                                data: pnlData
                              }
                            ]}
                            categories={pnlData.map(d => d.x)}
                            colors={['#3b82f6']}
                            yAxisWidth={70}
                            showLegend={false}
                            showGridLines={true}
                            showGradient={true}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-semibold mb-4">Drawdown %</h3>
                        <div className="h-64">
                          <LineChart
                            data={[
                              {
                                name: 'Drawdown',
                                data: drawdownData
                              }
                            ]}
                            categories={drawdownData.map(d => d.x)}
                            colors={['#ef4444']}
                            yAxisWidth={70}
                            showLegend={false}
                            showGridLines={true}
                            showGradient={true}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Daily Metrics</h3>
                      <div className="overflow-x-auto">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Date</TableHead>
                              <TableHead>Balance</TableHead>
                              <TableHead>Daily P&L</TableHead>
                              <TableHead>Drawdown %</TableHead>
                              <TableHead>Trades</TableHead>
                              <TableHead>Win Rate</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {metrics.map((metric) => (
                              <TableRow key={metric.date}>
                                <TableCell>{formatDate(metric.date)}</TableCell>
                                <TableCell>{formatCurrency(metric.balance)}</TableCell>
                                <TableCell>
                                  <span className={metric.dailyPnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                    {formatCurrency(metric.dailyPnl)}
                                    <span className="text-xs ml-1">
                                      ({formatPercent(metric.dailyPnlPercent)})
                                    </span>
                                  </span>
                                </TableCell>
                                <TableCell className="text-red-500">{formatPercent(metric.drawdownPercent)}</TableCell>
                                <TableCell>{metric.totalTrades}</TableCell>
                                <TableCell>{formatPercent(metric.winRate)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Metrics Available</h3>
                    <p className="text-muted-foreground">
                      Performance metrics will appear here once you start trading.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          {/* Payouts Tab (for funded accounts) */}
          {account.accountType === 'funded' && (
            <TabsContent value="payouts">
              <Card>
                <CardHeader>
                  <CardTitle>Payout History</CardTitle>
                  <CardDescription>
                    Records of your profit withdrawal requests and payments
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {payouts.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Request Date</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Payment Method</TableHead>
                            <TableHead>Period Start</TableHead>
                            <TableHead>Period End</TableHead>
                            <TableHead>Processed Date</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {payouts.map((payout) => (
                            <TableRow key={payout.id}>
                              <TableCell>{formatDate(payout.requestedAt)}</TableCell>
                              <TableCell className="font-medium">{formatCurrency(payout.amount)}</TableCell>
                              <TableCell>{getPayoutStatusBadge(payout.status)}</TableCell>
                              <TableCell>{payout.paymentMethod}</TableCell>
                              <TableCell>{formatDate(payout.tradePeriodStart)}</TableCell>
                              <TableCell>{formatDate(payout.tradePeriodEnd)}</TableCell>
                              <TableCell>{payout.processedAt ? formatDate(payout.processedAt) : '-'}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">No Payouts Found</h3>
                      <p className="text-muted-foreground mb-4">
                        You haven't requested any payouts from this account yet.
                      </p>
                      <Button onClick={requestPayout}>
                        Request Payout
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
};

export default PropFirmAccountDetails;