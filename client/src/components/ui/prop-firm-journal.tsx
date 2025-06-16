import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Badge } from './badge';
import { 
  Plus, 
  Upload, 
  Download, 
  RefreshCw, 
  Settings, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Calendar,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Clock,
  Filter
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

interface Trade {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  entryTime: Date;
  exitTime?: Date;
  pnl?: number;
  status: 'open' | 'closed' | 'pending';
  platform: string;
  propFirm?: string;
  notes?: string;
  screenshots?: string[];
  tags?: string[];
}

interface PropFirmAccount {
  id: string;
  name: string;
  platform: string;
  status: 'connected' | 'disconnected' | 'pending';
  balance: number;
  equity: number;
  drawdown: number;
  profitTarget: number;
  dailyLoss: number;
  maxDailyLoss: number;
  totalPnL: number;
  winRate: number;
  lastSync: Date;
}

export function PropFirmJournal() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [propFirmAccounts, setPropFirmAccounts] = useState<PropFirmAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('all');
  const [showAddTradeModal, setShowAddTradeModal] = useState(false);
  const [newTrade, setNewTrade] = useState<Partial<Trade>>({});

  useEffect(() => {
    loadPropFirmAccounts();
    loadTrades();
  }, []);

  const loadPropFirmAccounts = async () => {
    try {
      // In production, this would fetch from your prop firm integration API
      const mockAccounts: PropFirmAccount[] = [
        {
          id: 'ftmo-1',
          name: 'FTMO Challenge',
          platform: 'DX Trade',
          status: 'connected',
          balance: 100000,
          equity: 102500,
          drawdown: 2.5,
          profitTarget: 110000,
          dailyLoss: 0,
          maxDailyLoss: 5000,
          totalPnL: 2500,
          winRate: 68.5,
          lastSync: new Date()
        },
        {
          id: 'hybrid-1',
          name: 'HybridFunding Pro',
          platform: 'Match Trader',
          status: 'connected',
          balance: 200000,
          equity: 198500,
          drawdown: 0.75,
          profitTarget: 220000,
          dailyLoss: 1500,
          maxDailyLoss: 10000,
          totalPnL: -1500,
          winRate: 72.3,
          lastSync: new Date()
        }
      ];
      setPropFirmAccounts(mockAccounts);
    } catch (error) {
      console.error('Error loading prop firm accounts:', error);
    }
  };

  const loadTrades = async () => {
    setIsLoading(true);
    try {
      // In production, this would fetch from your trade journal API
      const mockTrades: Trade[] = [
        {
          id: '1',
          symbol: 'EURUSD',
          type: 'buy',
          entryPrice: 1.0850,
          exitPrice: 1.0920,
          quantity: 0.1,
          entryTime: new Date('2025-06-16T09:30:00Z'),
          exitTime: new Date('2025-06-16T15:45:00Z'),
          pnl: 700,
          status: 'closed',
          platform: 'DX Trade',
          propFirm: 'FTMO Challenge',
          notes: 'Strong bullish momentum on 4H chart',
          tags: ['breakout', 'major-pair']
        },
        {
          id: '2',
          symbol: 'GBPJPY',
          type: 'sell',
          entryPrice: 185.50,
          quantity: 0.05,
          entryTime: new Date('2025-06-16T14:20:00Z'),
          pnl: 0,
          status: 'open',
          platform: 'Match Trader',
          propFirm: 'HybridFunding Pro',
          notes: 'Bearish divergence on RSI',
          tags: ['divergence', 'cross-pair']
        }
      ];
      setTrades(mockTrades);
    } catch (error) {
      console.error('Error loading trades:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const syncPropFirmData = async (accountId: string) => {
    setIsLoading(true);
    try {
      // In production, this would sync with the actual prop firm platform
      console.log(`Syncing data for account: ${accountId}`);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API call
      await loadTrades();
      await loadPropFirmAccounts();
    } catch (error) {
      console.error('Error syncing prop firm data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addManualTrade = async () => {
    if (!newTrade.symbol || !newTrade.type || !newTrade.entryPrice) return;

    const trade: Trade = {
      id: Date.now().toString(),
      symbol: newTrade.symbol!,
      type: newTrade.type!,
      entryPrice: newTrade.entryPrice!,
      exitPrice: newTrade.exitPrice,
      quantity: newTrade.quantity || 0.01,
      entryTime: newTrade.entryTime || new Date(),
      exitTime: newTrade.exitTime,
      pnl: newTrade.pnl,
      status: newTrade.exitPrice ? 'closed' : 'open',
      platform: newTrade.platform || 'Manual',
      propFirm: newTrade.propFirm,
      notes: newTrade.notes,
      tags: newTrade.tags || []
    };

    setTrades(prev => [trade, ...prev]);
    setNewTrade({});
    setShowAddTradeModal(false);
  };

  const importTrades = () => {
    // In production, this would open a file dialog and parse CSV/Excel files
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx,.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('Importing trades from file:', file.name);
        // Parse file and add trades to the journal
      }
    };
    input.click();
  };

  const exportTrades = () => {
    const data = JSON.stringify(trades, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trades-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'disconnected': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const calculateStats = () => {
    const closedTrades = trades.filter(t => t.status === 'closed' && t.pnl !== undefined);
    const totalPnL = closedTrades.reduce((sum, t) => sum + (t.pnl || 0), 0);
    const winningTrades = closedTrades.filter(t => (t.pnl || 0) > 0);
    const winRate = closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0;

    return { totalPnL, winRate, totalTrades: trades.length, closedTrades: closedTrades.length };
  };

  const stats = calculateStats();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Trading Journal</h2>
          <p className="text-slate-400">Track and analyze your prop firm trading performance</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            onClick={importTrades}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button 
            onClick={exportTrades}
            variant="outline"
            className="border-slate-600 text-slate-300"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button 
            onClick={() => setShowAddTradeModal(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Trade
          </Button>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="bg-slate-800 border-slate-600">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="accounts">Prop Firm Accounts</TabsTrigger>
          <TabsTrigger value="trades">All Trades</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total P&L</p>
                    <p className={`text-2xl font-bold ${getPnLColor(stats.totalPnL)}`}>
                      ${stats.totalPnL.toFixed(2)}
                    </p>
                  </div>
                  <DollarSign className="h-8 w-8 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Win Rate</p>
                    <p className="text-2xl font-bold text-white">{stats.winRate.toFixed(1)}%</p>
                  </div>
                  <Target className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Total Trades</p>
                    <p className="text-2xl font-bold text-white">{stats.totalTrades}</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-600">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">Closed Trades</p>
                    <p className="text-2xl font-bold text-white">{stats.closedTrades}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Trades */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Recent Trades</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {trades.slice(0, 5).map((trade) => (
                  <div key={trade.id} className="flex items-center justify-between p-4 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Badge className={trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                        {trade.type.toUpperCase()}
                      </Badge>
                      <div>
                        <p className="text-white font-medium">{trade.symbol}</p>
                        <p className="text-sm text-slate-400">{trade.platform}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${getPnLColor(trade.pnl || 0)}`}>
                        {trade.pnl ? `$${trade.pnl.toFixed(2)}` : 'Open'}
                      </p>
                      <p className="text-sm text-slate-400">
                        {trade.entryTime.toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="accounts" className="space-y-6">
          {/* Prop Firm Accounts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {propFirmAccounts.map((account) => (
              <Card key={account.id} className="bg-slate-800/50 border-slate-600">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white">{account.name}</CardTitle>
                    <Badge className={getStatusColor(account.status)}>
                      {account.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-slate-400">Balance</p>
                      <p className="text-lg font-medium text-white">${account.balance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Equity</p>
                      <p className="text-lg font-medium text-white">${account.equity.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Drawdown</p>
                      <p className="text-lg font-medium text-orange-400">{account.drawdown}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-400">Win Rate</p>
                      <p className="text-lg font-medium text-green-400">{account.winRate}%</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-4">
                    <span className="text-sm text-slate-400">
                      Last sync: {account.lastSync.toLocaleDateString()}
                    </span>
                    <Button 
                      onClick={() => syncPropFirmData(account.id)}
                      disabled={isLoading}
                      size="sm"
                      variant="outline"
                      className="border-slate-600"
                    >
                      <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                      Sync
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="trades" className="space-y-6">
          {/* Trade List */}
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-white">All Trades</CardTitle>
                <div className="flex items-center space-x-2">
                  <Filter className="h-4 w-4 text-slate-400" />
                  <select 
                    value={selectedAccount} 
                    onChange={(e) => setSelectedAccount(e.target.value)}
                    className="bg-slate-700 border border-slate-600 text-white px-3 py-1 rounded"
                  >
                    <option value="all">All Accounts</option>
                    {propFirmAccounts.map(account => (
                      <option key={account.id} value={account.id}>{account.name}</option>
                    ))}
                  </select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-600">
                      <th className="text-left py-3 px-4 text-slate-400">Symbol</th>
                      <th className="text-left py-3 px-4 text-slate-400">Type</th>
                      <th className="text-left py-3 px-4 text-slate-400">Entry</th>
                      <th className="text-left py-3 px-4 text-slate-400">Exit</th>
                      <th className="text-left py-3 px-4 text-slate-400">P&L</th>
                      <th className="text-left py-3 px-4 text-slate-400">Status</th>
                      <th className="text-left py-3 px-4 text-slate-400">Platform</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trades.map((trade) => (
                      <tr key={trade.id} className="border-b border-slate-700/50">
                        <td className="py-3 px-4 text-white font-medium">{trade.symbol}</td>
                        <td className="py-3 px-4">
                          <Badge className={trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}>
                            {trade.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-white">{trade.entryPrice}</td>
                        <td className="py-3 px-4 text-white">{trade.exitPrice || '-'}</td>
                        <td className={`py-3 px-4 font-medium ${getPnLColor(trade.pnl || 0)}`}>
                          {trade.pnl ? `$${trade.pnl.toFixed(2)}` : '-'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-xs">
                            {trade.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-slate-400">{trade.platform}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="bg-slate-800/50 border-slate-600">
            <CardHeader>
              <CardTitle className="text-white">Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-400 text-lg">Advanced analytics coming soon</p>
                <p className="text-slate-500 text-sm">Charts, risk metrics, and detailed performance analysis</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Trade Modal */}
      {showAddTradeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="bg-slate-800 border-slate-600 w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-white">Add Manual Trade</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm text-slate-400 block mb-2">Symbol</label>
                <Input
                  value={newTrade.symbol || ''}
                  onChange={(e) => setNewTrade({...newTrade, symbol: e.target.value.toUpperCase()})}
                  placeholder="EURUSD"
                  className="bg-slate-700 border-slate-600 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Type</label>
                  <select 
                    value={newTrade.type || ''}
                    onChange={(e) => setNewTrade({...newTrade, type: e.target.value as 'buy' | 'sell'})}
                    className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
                  >
                    <option value="">Select</option>
                    <option value="buy">Buy</option>
                    <option value="sell">Sell</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Quantity</label>
                  <Input
                    type="number"
                    value={newTrade.quantity || ''}
                    onChange={(e) => setNewTrade({...newTrade, quantity: parseFloat(e.target.value)})}
                    placeholder="0.01"
                    step="0.01"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Entry Price</label>
                  <Input
                    type="number"
                    value={newTrade.entryPrice || ''}
                    onChange={(e) => setNewTrade({...newTrade, entryPrice: parseFloat(e.target.value)})}
                    placeholder="1.0850"
                    step="0.0001"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-2">Exit Price (Optional)</label>
                  <Input
                    type="number"
                    value={newTrade.exitPrice || ''}
                    onChange={(e) => setNewTrade({...newTrade, exitPrice: parseFloat(e.target.value)})}
                    placeholder="1.0920"
                    step="0.0001"
                    className="bg-slate-700 border-slate-600 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Platform</label>
                <select 
                  value={newTrade.platform || ''}
                  onChange={(e) => setNewTrade({...newTrade, platform: e.target.value})}
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded"
                >
                  <option value="">Select Platform</option>
                  <option value="DX Trade">DX Trade</option>
                  <option value="Match Trader">Match Trader</option>
                  <option value="cTrader">cTrader</option>
                  <option value="Rithmic">Rithmic</option>
                  <option value="Manual">Manual</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-slate-400 block mb-2">Notes</label>
                <textarea
                  value={newTrade.notes || ''}
                  onChange={(e) => setNewTrade({...newTrade, notes: e.target.value})}
                  placeholder="Trade reasoning and notes..."
                  className="w-full bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded h-20 resize-none"
                />
              </div>
              <div className="flex space-x-3 pt-4">
                <Button 
                  onClick={() => setShowAddTradeModal(false)}
                  variant="outline"
                  className="flex-1 border-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addManualTrade}
                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                  disabled={!newTrade.symbol || !newTrade.type || !newTrade.entryPrice}
                >
                  Add Trade
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}