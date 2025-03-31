import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './table';
import { Button } from './button';
import { Badge } from './badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from './dialog';
import { ScrollArea } from './scroll-area';
import { 
  ArrowDown, 
  ArrowUp, 
  Download, 
  FileText, 
  RefreshCw, 
  Copy, 
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  BarChart4,
  Brain,
  LineChart
} from 'lucide-react';
// PDF generation done via simple data URL instead of pdf-lib package due to installation issues
import { googleSheetsService, TradeSignal } from '../../lib/services/google-sheets-service';

interface TradeSignalsProps {
  signals?: TradeSignal[];
  onViewSignal?: (signalId: string) => void;
}

export function TradeSignals({ signals = [], onViewSignal }: TradeSignalsProps) {
  // State management
  const [allSignals, setAllSignals] = useState<TradeSignal[]>(signals);
  const [cryptoSignals, setCryptoSignals] = useState<TradeSignal[]>([]);
  const [forexSignals, setForexSignals] = useState<TradeSignal[]>([]);
  const [futuresSignals, setFuturesSignals] = useState<TradeSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(new Date());
  
  // Signal statistics
  const [stats, setStats] = useState({
    totalSignals: 0,
    activeSignals: 0,
    completedSignals: 0,
    winRate: 0,
    avgProfitPercentage: 0,
    totalProfit: 0
  });

  // Fetch signals from Google Sheets
  const fetchSignals = async () => {
    setIsLoading(true);
    
    try {
      const [crypto, futures, forex] = await Promise.all([
        googleSheetsService.fetchCryptoSignals(),
        googleSheetsService.fetchFuturesSignals(),
        googleSheetsService.fetchForexSignals()
      ]);
      
      setCryptoSignals(crypto);
      setFuturesSignals(futures);
      setForexSignals(forex);
      
      const all = [...crypto, ...futures, ...forex];
      setAllSignals(all);
      setLastUpdated(new Date());
      
      // Calculate statistics
      calculateStats(all);
    } catch (error) {
      console.error('Error fetching signals:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Calculate signal statistics
  const calculateStats = (signals: TradeSignal[]) => {
    const total = signals.length;
    const active = signals.filter(s => s.status === 'active').length;
    const completed = signals.filter(s => s.status === 'completed').length;
    const stopped = signals.filter(s => s.status === 'stopped').length;
    
    const winRate = completed > 0 ? completed / (completed + stopped) : 0;
    
    // Calculate profit metrics
    const profitSignals = signals.filter(s => s.pnl !== undefined && s.pnl > 0);
    const totalProfit = profitSignals.reduce((sum, s) => sum + (s.pnl || 0), 0);
    const avgProfitPercentage = profitSignals.length > 0 
      ? profitSignals.reduce((sum, s) => sum + (s.pnlPercentage || 0), 0) / profitSignals.length
      : 0;
    
    setStats({
      totalSignals: total,
      activeSignals: active,
      completedSignals: completed,
      winRate: winRate,
      avgProfitPercentage: avgProfitPercentage,
      totalProfit: totalProfit
    });
  };
  
  // Copy signal to clipboard
  const copySignalToClipboard = (signal: TradeSignal) => {
    const text = `
${signal.provider} AI ${signal.marketType.toUpperCase()} Signal:
Asset: ${signal.asset}
Direction: ${signal.direction.toUpperCase()}
Entry: ${signal.entryPrice}
Stop Loss: ${signal.stopLoss}
Take Profit: ${signal.takeProfit1}
${signal.takeProfit2 ? `Take Profit 2: ${signal.takeProfit2}\n` : ''}${signal.takeProfit3 ? `Take Profit 3: ${signal.takeProfit3}\n` : ''}
Status: ${signal.status.toUpperCase()}
${signal.notes ? `Notes: ${signal.notes}\n` : ''}
    `.trim();
    
    navigator.clipboard.writeText(text);
  };
  
  // Generate PDF report for a signal
  const generateSignalPDF = async (signal: TradeSignal) => {
    // Create text content for the PDF
    const content = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #005299; font-size: 24px; }
            h2 { color: #333; font-size: 18px; margin-top: 30px; }
            .timestamp { color: #777; font-size: 14px; }
            .details { margin: 20px 0; }
            .detail-item { margin: 8px 0; }
            .analysis { margin: 20px 0; line-height: 1.5; }
            .separator { border-bottom: 1px solid #ddd; margin: 20px 0; }
            .risk-metrics { margin: 20px 0; }
            .notes { margin: 20px 0; font-style: italic; }
            .disclaimer { margin-top: 40px; color: #777; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>${signal.provider} AI ${signal.marketType.toUpperCase()} Signal Report</h1>
          <div class="timestamp">Generated on ${new Date().toLocaleDateString()}</div>
          
          <h2>Signal Details</h2>
          <div class="details">
            <div class="detail-item">Asset: ${signal.asset}</div>
            <div class="detail-item">Direction: ${signal.direction.toUpperCase()}</div>
            <div class="detail-item">Entry Price: ${signal.entryPrice}</div>
            <div class="detail-item">Stop Loss: ${signal.stopLoss}</div>
            <div class="detail-item">Take Profit 1: ${signal.takeProfit1}</div>
            ${signal.takeProfit2 ? `<div class="detail-item">Take Profit 2: ${signal.takeProfit2}</div>` : ''}
            ${signal.takeProfit3 ? `<div class="detail-item">Take Profit 3: ${signal.takeProfit3}</div>` : ''}
            <div class="detail-item">Status: ${signal.status.toUpperCase()}</div>
            ${signal.pnl !== undefined ? `<div class="detail-item">P&L: ${signal.pnl.toFixed(2)}</div>` : ''}
            ${signal.pnlPercentage !== undefined ? `<div class="detail-item">P&L %: ${signal.pnlPercentage.toFixed(2)}%</div>` : ''}
          </div>
          
          <div class="separator"></div>
          
          <h2>AI Analysis</h2>
          <div class="analysis">
            ${signal.aiAnalysis || 'No analysis available'}
          </div>
          
          <h2>Risk Metrics</h2>
          <div class="risk-metrics">
            <div class="detail-item">Risk-Reward Ratio: ${Math.abs((signal.takeProfit1 - signal.entryPrice) / (signal.entryPrice - signal.stopLoss)).toFixed(2)}:1</div>
            <div class="detail-item">Stop Loss Distance: ${Math.abs(((signal.stopLoss / signal.entryPrice) - 1) * 100).toFixed(2)}%</div>
            <div class="detail-item">Take Profit Distance: ${Math.abs(((signal.takeProfit1 / signal.entryPrice) - 1) * 100).toFixed(2)}%</div>
            <div class="detail-item">Provider Accuracy: ${((signal.accuracy || 0) * 100).toFixed(2)}%</div>
          </div>
          
          ${signal.notes ? `
            <h2>Notes</h2>
            <div class="notes">${signal.notes}</div>
          ` : ''}
          
          <div class="disclaimer">
            This signal is generated by AI trading algorithms and does not constitute financial advice. Trade at your own risk.<br>
            Signal timestamp: ${signal.timestamp}
          </div>
        </body>
      </html>
    `;
    
    // Convert HTML to data URL
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window which can be printed to PDF by the user
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.document.title = `${signal.provider}-${signal.asset}-${signal.direction}-signal`;
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      console.error('Unable to open print window. Please check if popup blocker is enabled.');
    }
  };
  
  // Generate signals performance report
  const generatePerformanceReport = async () => {
    // Calculate provider-specific stats
    const providers = ['Paradox', 'Hybrid', 'Solaris'];
    const providerStats = providers.map(provider => {
      const signals = allSignals.filter(s => s.provider === provider);
      const completed = signals.filter(s => s.status === 'completed');
      const stopped = signals.filter(s => s.status === 'stopped');
      const winRate = completed.length > 0 ? completed.length / (completed.length + stopped.length) : 0;
      
      return {
        name: provider,
        count: signals.length,
        winRate: winRate,
        avgProfit: signals.filter(s => s.pnlPercentage !== undefined).reduce((sum, s) => sum + (s.pnlPercentage || 0), 0) / 
          (signals.filter(s => s.pnlPercentage !== undefined).length || 1)
      };
    });
    
    // Calculate market-specific stats
    const markets = ['crypto', 'forex', 'futures'];
    const marketStats = markets.map(market => {
      const signals = allSignals.filter(s => s.marketType === market);
      const completed = signals.filter(s => s.status === 'completed');
      const stopped = signals.filter(s => s.status === 'stopped');
      const winRate = completed.length > 0 ? completed.length / (completed.length + stopped.length) : 0;
      
      return {
        name: market.charAt(0).toUpperCase() + market.slice(1),
        count: signals.length,
        winRate: winRate,
        avgProfit: signals.filter(s => s.pnlPercentage !== undefined).reduce((sum, s) => sum + (s.pnlPercentage || 0), 0) / 
          (signals.filter(s => s.pnlPercentage !== undefined).length || 1)
      };
    });
    
    // Create an HTML report
    const content = `
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 40px; }
            h1 { color: #005299; font-size: 24px; }
            h2 { color: #333; font-size: 18px; margin-top: 30px; }
            .timestamp { color: #777; font-size: 14px; }
            .overview { margin: 20px 0; }
            .stat-item { margin: 8px 0; }
            .separator { border-bottom: 1px solid #ddd; margin: 20px 0; }
            .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .table th { text-align: left; padding: 8px; background-color: #f5f5f5; border-bottom: 2px solid #ddd; }
            .table td { padding: 8px; border-bottom: 1px solid #eee; }
            .disclaimer { margin-top: 40px; color: #777; font-size: 11px; }
          </style>
        </head>
        <body>
          <h1>AI Trading Signals Performance Report</h1>
          <div class="timestamp">Generated on ${new Date().toLocaleDateString()}</div>
          
          <h2>Performance Overview</h2>
          <div class="overview">
            <div class="stat-item">Total Signals: ${stats.totalSignals}</div>
            <div class="stat-item">Active Signals: ${stats.activeSignals}</div>
            <div class="stat-item">Completed Signals: ${stats.completedSignals}</div>
            <div class="stat-item">Win Rate: ${(stats.winRate * 100).toFixed(2)}%</div>
            <div class="stat-item">Average Profit: ${stats.avgProfitPercentage.toFixed(2)}%</div>
            <div class="stat-item">Total Profit: ${stats.totalProfit.toFixed(2)}</div>
          </div>
          
          <div class="separator"></div>
          
          <h2>Provider Performance</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Provider</th>
                <th>Signal Count</th>
                <th>Win Rate</th>
                <th>Avg Profit</th>
              </tr>
            </thead>
            <tbody>
              ${providerStats.map(provider => `
                <tr>
                  <td>${provider.name}</td>
                  <td>${provider.count}</td>
                  <td>${(provider.winRate * 100).toFixed(2)}%</td>
                  <td>${provider.avgProfit.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="separator"></div>
          
          <h2>Market Performance</h2>
          <table class="table">
            <thead>
              <tr>
                <th>Market</th>
                <th>Signal Count</th>
                <th>Win Rate</th>
                <th>Avg Profit</th>
              </tr>
            </thead>
            <tbody>
              ${marketStats.map(market => `
                <tr>
                  <td>${market.name}</td>
                  <td>${market.count}</td>
                  <td>${(market.winRate * 100).toFixed(2)}%</td>
                  <td>${market.avgProfit.toFixed(2)}%</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="disclaimer">
            This report is generated based on AI trading signals data. Past performance does not guarantee future results.<br>
            Report generated: ${new Date().toISOString()}
          </div>
        </body>
      </html>
    `;
    
    // Convert HTML to data URL
    const blob = new Blob([content], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    
    // Open in new window which can be printed to PDF by the user
    const printWindow = window.open(url, '_blank');
    if (printWindow) {
      printWindow.document.title = 'Trade Signals Performance Report';
      setTimeout(() => {
        printWindow.print();
      }, 500);
    } else {
      console.error('Unable to open print window. Please check if popup blocker is enabled.');
    }
  };
  
  // View signal details
  const viewSignalDetails = (signal: TradeSignal) => {
    setSelectedSignal(signal);
    // If the onViewSignal prop is provided, call it with the signal ID
    if (onViewSignal) {
      onViewSignal(signal.id);
    }
  };

  // Get status badge styling
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">
            <Clock className="h-3 w-3 mr-1" />
            Active
          </Badge>
        );
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'stopped':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3 w-3 mr-1" />
            Stopped
          </Badge>
        );
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Cancelled
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            {status}
          </Badge>
        );
    }
  };
  
  // Get direction badge styling
  const getDirectionBadge = (direction: 'long' | 'short') => {
    return direction === 'long' ? (
      <Badge className="bg-green-500/20 text-green-500 hover:bg-green-500/30 border-0">
        <ArrowUp className="h-3 w-3 mr-1" />
        LONG
      </Badge>
    ) : (
      <Badge className="bg-red-500/20 text-red-500 hover:bg-red-500/30 border-0">
        <ArrowDown className="h-3 w-3 mr-1" />
        SHORT
      </Badge>
    );
  };
  
  // Fetch signals on component mount
  useEffect(() => {
    if (signals && signals.length > 0) {
      setAllSignals(signals);
      setCryptoSignals(signals.filter(s => s.marketType === 'crypto'));
      setForexSignals(signals.filter(s => s.marketType === 'forex'));
      setFuturesSignals(signals.filter(s => s.marketType === 'futures'));
      calculateStats(signals);
      console.log('Using provided signals:', signals.length);
    } else {
      // Fall back to fetching signals if none provided
      fetchSignals();
      
      // Refresh signals every 5 minutes
      const interval = setInterval(() => {
        fetchSignals();
      }, 5 * 60 * 1000);
      
      return () => clearInterval(interval);
    }
  }, [signals]);
  
  // Get current signals based on active tab
  const getCurrentSignals = () => {
    switch (activeTab) {
      case 'crypto':
        return cryptoSignals;
      case 'forex':
        return forexSignals;
      case 'futures':
        return futuresSignals;
      default:
        return allSignals;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">AI Trading Signals</h2>
          <p className="text-muted-foreground">
            Trading signals from Paradox, Hybrid, and Solaris AI systems
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchSignals} 
            disabled={isLoading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Refreshing...' : 'Refresh Signals'}
          </Button>
          
          <Button 
            variant="outline" 
            size="sm" 
            onClick={generatePerformanceReport}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export Report
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Total Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSignals}</div>
            <p className="text-xs text-muted-foreground">
              {lastUpdated ? `Last updated: ${lastUpdated.toLocaleTimeString()}` : 'Not yet updated'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(stats.winRate * 100).toFixed(1)}%</div>
            <div className="w-full bg-muted h-2 mt-2 rounded-full overflow-hidden">
              <div 
                className="bg-green-500 h-full rounded-full"
                style={{ width: `${stats.winRate * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Active Signals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSignals}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSignals > 0 ? 'Signals currently in play' : 'No active signals'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="py-4">
            <CardTitle className="text-sm font-medium">Avg. Profit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgProfitPercentage.toFixed(2)}%</div>
            <p className="text-xs text-muted-foreground">
              Per completed signal
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Signals</TabsTrigger>
          <TabsTrigger value="crypto">Crypto (Paradox)</TabsTrigger>
          <TabsTrigger value="futures">Futures (Hybrid)</TabsTrigger>
          <TabsTrigger value="forex">Forex (Solaris)</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader className="py-4">
              <CardTitle>
                {activeTab === 'all' 
                  ? 'All AI Trading Signals' 
                  : activeTab === 'crypto' 
                    ? 'Paradox AI Crypto Signals' 
                    : activeTab === 'futures' 
                      ? 'Hybrid AI Futures Signals' 
                      : 'Solaris AI Forex Signals'
                }
              </CardTitle>
              <CardDescription>
                {getCurrentSignals().length} signals available
              </CardDescription>
            </CardHeader>
            <CardContent>
              {getCurrentSignals().length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Asset</TableHead>
                        <TableHead>Direction</TableHead>
                        <TableHead className="hidden md:table-cell">Entry</TableHead>
                        <TableHead className="hidden md:table-cell">Stop Loss</TableHead>
                        <TableHead className="hidden md:table-cell">Take Profit</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="hidden md:table-cell">P&L</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getCurrentSignals().map((signal) => (
                        <TableRow key={signal.id}>
                          <TableCell>
                            <div className="font-medium">{signal.asset}</div>
                            <div className="text-xs text-muted-foreground hidden md:block">
                              {new Date(signal.timestamp).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getDirectionBadge(signal.direction)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {signal.entryPrice}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {signal.stopLoss}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {signal.takeProfit1}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(signal.status)}
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            {signal.pnl !== undefined ? (
                              <span className={signal.pnl >= 0 ? 'text-green-500' : 'text-red-500'}>
                                {signal.pnl >= 0 ? '+' : ''}{signal.pnl.toFixed(2)}
                                <span className="text-xs ml-1">
                                  ({signal.pnlPercentage !== undefined ? `${signal.pnlPercentage >= 0 ? '+' : ''}${signal.pnlPercentage.toFixed(2)}%` : ''})
                                </span>
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end space-x-2">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => viewSignalDetails(signal)}
                                title="View details"
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8" 
                                onClick={() => copySignalToClipboard(signal)}
                                title="Copy to clipboard"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground" />
                  <h3 className="mt-2 text-lg font-medium">No signals found</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {isLoading 
                      ? 'Loading signals...' 
                      : 'There are currently no signals available for this category.'}
                  </p>
                  {!isLoading && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4"
                      onClick={fetchSignals}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      Refresh Signals
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Signal Detail Dialog */}
      <Dialog open={!!selectedSignal} onOpenChange={(open) => !open && setSelectedSignal(null)}>
        <DialogContent className="max-w-3xl">
          {selectedSignal && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>
                    {selectedSignal.asset} Signal Details
                  </span>
                  {getDirectionBadge(selectedSignal.direction)}
                </DialogTitle>
                <DialogDescription>
                  {selectedSignal.provider} AI {selectedSignal.marketType} signal from {new Date(selectedSignal.timestamp).toLocaleString()}
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-4">
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <BarChart4 className="h-4 w-4 mr-2" />
                    Price Levels
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted rounded-md p-3">
                        <div className="text-xs text-muted-foreground">Entry Price</div>
                        <div className="text-lg font-medium">{selectedSignal.entryPrice}</div>
                      </div>
                      
                      <div className="bg-red-500/10 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">Stop Loss</div>
                        <div className="text-lg font-medium text-red-500">{selectedSignal.stopLoss}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.abs(((selectedSignal.stopLoss / selectedSignal.entryPrice) - 1) * 100).toFixed(2)}% from entry
                        </div>
                      </div>
                    </div>
                    
                    <div className={`grid ${selectedSignal.takeProfit3 ? 'grid-cols-3' : selectedSignal.takeProfit2 ? 'grid-cols-2' : 'grid-cols-1'} gap-2`}>
                      <div className="bg-green-500/10 rounded-md p-3">
                        <div className="text-xs text-muted-foreground">Take Profit 1</div>
                        <div className="text-lg font-medium text-green-500">{selectedSignal.takeProfit1}</div>
                        <div className="text-xs text-muted-foreground">
                          {Math.abs(((selectedSignal.takeProfit1 / selectedSignal.entryPrice) - 1) * 100).toFixed(2)}% from entry
                        </div>
                      </div>
                      
                      {selectedSignal.takeProfit2 && (
                        <div className="bg-green-500/10 rounded-md p-3">
                          <div className="text-xs text-muted-foreground">Take Profit 2</div>
                          <div className="text-lg font-medium text-green-500">{selectedSignal.takeProfit2}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.abs(((selectedSignal.takeProfit2 / selectedSignal.entryPrice) - 1) * 100).toFixed(2)}% from entry
                          </div>
                        </div>
                      )}
                      
                      {selectedSignal.takeProfit3 && (
                        <div className="bg-green-500/10 rounded-md p-3">
                          <div className="text-xs text-muted-foreground">Take Profit 3</div>
                          <div className="text-lg font-medium text-green-500">{selectedSignal.takeProfit3}</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.abs(((selectedSignal.takeProfit3 / selectedSignal.entryPrice) - 1) * 100).toFixed(2)}% from entry
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h4 className="font-medium text-sm mb-3 flex items-center">
                      <LineChart className="h-4 w-4 mr-2" />
                      Performance
                    </h4>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Status</span>
                        <div>
                          {getStatusBadge(selectedSignal.status)}
                        </div>
                      </div>
                      
                      {selectedSignal.pnl !== undefined && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Profit/Loss</span>
                          <span className={selectedSignal.pnl >= 0 ? 'text-green-500 font-medium' : 'text-red-500 font-medium'}>
                            {selectedSignal.pnl >= 0 ? '+' : ''}{selectedSignal.pnl.toFixed(2)}
                            <span className="text-xs ml-1">
                              ({selectedSignal.pnlPercentage !== undefined ? `${selectedSignal.pnlPercentage >= 0 ? '+' : ''}${selectedSignal.pnlPercentage.toFixed(2)}%` : ''})
                            </span>
                          </span>
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Risk-Reward Ratio</span>
                        <span className="font-medium">
                          {Math.abs((selectedSignal.takeProfit1 - selectedSignal.entryPrice) / (selectedSignal.entryPrice - selectedSignal.stopLoss)).toFixed(2)}:1
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm mb-3 flex items-center">
                    <Brain className="h-4 w-4 mr-2" />
                    AI Analysis
                  </h4>
                  
                  <div className="bg-muted/50 rounded-md p-4 text-sm">
                    <ScrollArea className="h-[220px] pr-4">
                      {selectedSignal.aiAnalysis || 'No AI analysis available for this signal.'}
                    </ScrollArea>
                  </div>
                  
                  {selectedSignal.notes && (
                    <div className="mt-6">
                      <h4 className="font-medium text-sm mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2" />
                        Additional Notes
                      </h4>
                      
                      <div className="bg-muted/50 rounded-md p-4 text-sm">
                        {selectedSignal.notes}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => copySignalToClipboard(selectedSignal)}
                  className="gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Copy Signal
                </Button>
                <Button 
                  onClick={() => generateSignalPDF(selectedSignal)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Export PDF
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}