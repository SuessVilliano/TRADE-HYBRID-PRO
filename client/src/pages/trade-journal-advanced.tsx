import React, { useState, useEffect } from 'react';
import { Card } from '../components/ui/card';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { ScrollArea } from '../components/ui/scroll-area';
import { Calendar, Clock, Download, BarChart4, FileText, PieChart, LineChart, Tags, Brain, Award } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Separator } from '../components/ui/separator';

// Sample data for demonstration
const sampleTrades = [
  {
    id: 1,
    symbol: 'BTC/USD',
    type: 'Long',
    entryPrice: 68750,
    exitPrice: 69500,
    quantity: 0.5,
    pnl: 375,
    pnlPercent: 1.09,
    date: '2025-03-27',
    time: '10:45 AM',
    status: 'Closed',
    notes: 'Breakout strategy worked well. Held the position despite some initial volatility.',
    tags: ['Breakout', 'Crypto', 'Successful'],
    entryTime: '2025-03-27T10:45:00',
    exitTime: '2025-03-27T14:30:00',
    strategy: 'Breakout',
    timeframe: '1H',
    risk: 2.5,
    riskReward: 3.2,
    emotions: 'Confident',
    marketConditions: 'Volatile',
    performance: 'Good',
    learnings: 'Patience paid off, need to stick to trading plan more often.'
  },
  {
    id: 2,
    symbol: 'ETH/USD',
    type: 'Short',
    entryPrice: 3950,
    exitPrice: 3850,
    quantity: 2,
    pnl: 200,
    pnlPercent: 2.53,
    date: '2025-03-26',
    time: '2:30 PM',
    status: 'Closed',
    notes: 'Market showed weakness at resistance. Good risk management by taking profit early.',
    tags: ['Resistance', 'Crypto', 'Successful'],
    entryTime: '2025-03-26T14:30:00',
    exitTime: '2025-03-26T16:45:00',
    strategy: 'Resistance',
    timeframe: '4H',
    risk: 1.8,
    riskReward: 2.5,
    emotions: 'Calm',
    marketConditions: 'Ranging',
    performance: 'Excellent',
    learnings: 'Taking profit early was the right choice, don\'t get greedy.'
  },
  {
    id: 3,
    symbol: 'AAPL',
    type: 'Long',
    entryPrice: 195.25,
    exitPrice: 193.75,
    quantity: 10,
    pnl: -15,
    pnlPercent: -0.77,
    date: '2025-03-25',
    time: '11:20 AM',
    status: 'Closed',
    notes: 'Entered too early, should have waited for confirmation. Cut losses quickly.',
    tags: ['Stocks', 'Loss', 'Learning'],
    entryTime: '2025-03-25T11:20:00',
    exitTime: '2025-03-25T12:30:00',
    strategy: 'Trend Following',
    timeframe: '15M',
    risk: 1.2,
    riskReward: 1.5,
    emotions: 'Impatient',
    marketConditions: 'Choppy',
    performance: 'Poor',
    learnings: 'Need to be more patient and wait for clear confirmation signals.'
  },
  {
    id: 4,
    symbol: 'EUR/USD',
    type: 'Long',
    entryPrice: 1.0825,
    exitPrice: null,
    quantity: 0.5,
    pnl: null,
    pnlPercent: null,
    date: '2025-03-28',
    time: '9:15 AM',
    status: 'Open',
    notes: 'Strong bullish divergence on the 4H chart. Waiting for price to reach 1.0900 target.',
    tags: ['Forex', 'Divergence', 'Active'],
    entryTime: '2025-03-28T09:15:00',
    exitTime: null,
    strategy: 'Divergence',
    timeframe: '4H',
    risk: 1.5,
    riskReward: 2.0,
    emotions: 'Focused',
    marketConditions: 'Trending',
    performance: null,
    learnings: null
  },
];

export default function TradeJournalAdvanced() {
  const [trades, setTrades] = useState(sampleTrades);
  const [selectedTab, setSelectedTab] = useState('all-trades');
  const [newEntry, setNewEntry] = useState({
    symbol: '',
    type: 'Long',
    entryPrice: '',
    quantity: '',
    notes: '',
    tags: '',
    strategy: '',
    timeframe: '1H',
    risk: '',
    riskReward: '',
    emotions: '',
    marketConditions: '',
  });

  // UI states
  const [tradeToView, setTradeToView] = useState<null | number>(null);
  const [filter, setFilter] = useState('all');
  const [analyticsView, setAnalyticsView] = useState('performance');
  const [showAdvancedModal, setShowAdvancedModal] = useState(false);
  const [editingTrade, setEditingTrade] = useState<null | number>(null);

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'open') return trade.status === 'Open';
    if (filter === 'closed') return trade.status === 'Closed';
    if (filter === 'profitable') return trade.pnl !== null && trade.pnl > 0;
    if (filter === 'losses') return trade.pnl !== null && trade.pnl < 0;
    return true;
  });

  // Analytics computations
  const totalTrades = trades.length;
  const closedTrades = trades.filter(t => t.status === 'Closed').length;
  const profitableTrades = trades.filter(t => t.pnl !== null && t.pnl > 0).length;
  const lossTrades = trades.filter(t => t.pnl !== null && t.pnl < 0).length;
  const winRate = closedTrades > 0 ? (profitableTrades / closedTrades * 100).toFixed(1) : '0';
  const totalProfit = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
  
  // Avg profit/loss
  const avgProfit = profitableTrades > 0 
    ? trades.filter(t => t.pnl !== null && t.pnl > 0).reduce((sum, trade) => sum + trade.pnl!, 0) / profitableTrades 
    : 0;
  
  const avgLoss = lossTrades > 0 
    ? trades.filter(t => t.pnl !== null && t.pnl < 0).reduce((sum, trade) => sum + trade.pnl!, 0) / lossTrades 
    : 0;

  // Strategy performance
  const strategies = [...new Set(trades.filter(t => t.status === 'Closed' && t.strategy).map(t => t.strategy))];
  const strategyPerformance = strategies.map(strategy => {
    const strategyTrades = trades.filter(t => t.strategy === strategy && t.status === 'Closed');
    const totalPnl = strategyTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winCount = strategyTrades.filter(t => t.pnl !== null && t.pnl > 0).length;
    const strategyWinRate = strategyTrades.length > 0 ? (winCount / strategyTrades.length * 100).toFixed(1) : '0';
    
    return {
      name: strategy,
      trades: strategyTrades.length,
      pnl: totalPnl,
      winRate: strategyWinRate
    };
  }).sort((a, b) => b.pnl - a.pnl);

  // Emotion analysis
  const emotions = [...new Set(trades.filter(t => t.status === 'Closed' && t.emotions).map(t => t.emotions))];
  const emotionPerformance = emotions.map(emotion => {
    const emotionTrades = trades.filter(t => t.emotions === emotion && t.status === 'Closed');
    const totalPnl = emotionTrades.reduce((sum, trade) => sum + (trade.pnl || 0), 0);
    const winCount = emotionTrades.filter(t => t.pnl !== null && t.pnl > 0).length;
    const emotionWinRate = emotionTrades.length > 0 ? (winCount / emotionTrades.length * 100).toFixed(1) : '0';
    
    return {
      name: emotion,
      trades: emotionTrades.length,
      pnl: totalPnl,
      winRate: emotionWinRate
    };
  }).sort((a, b) => b.pnl - a.pnl);

  const handleNewTradeChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setNewEntry(prev => ({ ...prev, [name]: value }));
  };

  const handleAddTrade = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple validation
    if (!newEntry.symbol || !newEntry.entryPrice || !newEntry.quantity) {
      alert('Please fill out the required fields');
      return;
    }
    
    const newTrade = {
      id: trades.length + 1,
      symbol: newEntry.symbol,
      type: newEntry.type,
      entryPrice: parseFloat(newEntry.entryPrice),
      exitPrice: null,
      quantity: parseFloat(newEntry.quantity),
      pnl: null,
      pnlPercent: null,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Open',
      notes: newEntry.notes,
      tags: newEntry.tags.split(',').map(tag => tag.trim()),
      entryTime: new Date().toISOString(),
      exitTime: null,
      strategy: newEntry.strategy,
      timeframe: newEntry.timeframe,
      risk: newEntry.risk ? parseFloat(newEntry.risk) : null,
      riskReward: newEntry.riskReward ? parseFloat(newEntry.riskReward) : null,
      emotions: newEntry.emotions,
      marketConditions: newEntry.marketConditions,
      performance: null,
      learnings: null
    };
    
    setTrades([newTrade, ...trades]);
    setNewEntry({
      symbol: '',
      type: 'Long',
      entryPrice: '',
      quantity: '',
      notes: '',
      tags: '',
      strategy: '',
      timeframe: '1H',
      risk: '',
      riskReward: '',
      emotions: '',
      marketConditions: '',
    });
    setSelectedTab('all-trades');
  };

  const exportToCsv = () => {
    const headers = [
      'ID', 'Symbol', 'Type', 'Entry Price', 'Exit Price', 'Quantity', 
      'P&L', 'P&L %', 'Date', 'Time', 'Status', 'Notes', 'Tags', 
      'Strategy', 'Timeframe', 'Risk %', 'Risk:Reward', 'Emotions', 
      'Market Conditions', 'Performance', 'Learnings'
    ];
    
    const csvRows = [
      headers.join(','),
      ...trades.map(trade => [
        trade.id,
        trade.symbol,
        trade.type,
        trade.entryPrice,
        trade.exitPrice || '',
        trade.quantity,
        trade.pnl || '',
        trade.pnlPercent || '',
        trade.date,
        trade.time,
        trade.status,
        `"${trade.notes.replace(/"/g, '""')}"`,
        `"${trade.tags.join(', ')}"`,
        trade.strategy || '',
        trade.timeframe || '',
        trade.risk || '',
        trade.riskReward || '',
        trade.emotions || '',
        trade.marketConditions || '',
        trade.performance || '',
        trade.learnings ? `"${trade.learnings.replace(/"/g, '""')}"` : ''
      ].join(','))
    ];
    
    const csvString = csvRows.join('\\n');
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `trade_journal_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.click();
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Advanced Trade Journal</h1>
        <div className="flex gap-3 mt-3 md:mt-0">
          <Button onClick={exportToCsv} variant="outline" size="sm" className="flex items-center gap-2">
            <Download size={16} />
            Export to CSV
          </Button>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all-trades">Trade History</TabsTrigger>
          <TabsTrigger value="add-trade">Add New Trade</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all-trades" className="space-y-6 mt-4">
          {tradeToView === null ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <PopupContainer padding>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {profitableTrades}
                  </div>
                  <div className="text-sm text-slate-300">Profitable Trades</div>
                </PopupContainer>
                
                <PopupContainer padding>
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {lossTrades}
                  </div>
                  <div className="text-sm text-slate-300">Loss Trades</div>
                </PopupContainer>
                
                <PopupContainer padding>
                  <div className="text-4xl font-bold text-blue-400 mb-2">
                    {trades.filter(t => t.status === 'Open').length}
                  </div>
                  <div className="text-sm text-slate-300">Open Positions</div>
                </PopupContainer>
                
                <PopupContainer padding>
                  <div className="text-4xl font-bold mb-2">
                    ${totalProfit.toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">Total P&L</div>
                </PopupContainer>
              </div>

              <Card className="p-4">
                <div className="flex flex-wrap gap-2 mb-4">
                  <Button 
                    size="sm" 
                    variant={filter === 'all' ? 'default' : 'outline'} 
                    onClick={() => setFilter('all')}
                  >
                    All
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'open' ? 'default' : 'outline'} 
                    onClick={() => setFilter('open')}
                  >
                    Open
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'closed' ? 'default' : 'outline'} 
                    onClick={() => setFilter('closed')}
                  >
                    Closed
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'profitable' ? 'default' : 'outline'} 
                    onClick={() => setFilter('profitable')}
                  >
                    Profitable
                  </Button>
                  <Button 
                    size="sm" 
                    variant={filter === 'losses' ? 'default' : 'outline'} 
                    onClick={() => setFilter('losses')}
                  >
                    Losses
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-600">
                        <th className="py-2 px-3 text-left">Symbol</th>
                        <th className="py-2 px-3 text-left">Type</th>
                        <th className="py-2 px-3 text-right">Entry</th>
                        <th className="py-2 px-3 text-right">Exit</th>
                        <th className="py-2 px-3 text-right">P&L</th>
                        <th className="py-2 px-3 text-left">Strategy</th>
                        <th className="py-2 px-3 text-right">Date</th>
                        <th className="py-2 px-3 text-center">Status</th>
                        <th className="py-2 px-3"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTrades.length > 0 ? (
                        filteredTrades.map(trade => (
                          <tr key={trade.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                            <td className="py-3 px-3">{trade.symbol}</td>
                            <td className="py-3 px-3">
                              <span className={`px-2 py-1 rounded text-xs ${trade.type === 'Long' ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                                {trade.type}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</td>
                            <td className="py-3 px-3 text-right">
                              {trade.exitPrice ? trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 }) : '-'}
                            </td>
                            <td className={`py-3 px-3 text-right ${trade.pnl === null ? '' : trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                              {trade.pnl !== null ? `$${trade.pnl.toLocaleString()} (${trade.pnlPercent}%)` : '-'}
                            </td>
                            <td className="py-3 px-3">{trade.strategy || '-'}</td>
                            <td className="py-3 px-3 text-right">{trade.date}</td>
                            <td className="py-3 px-3 text-center">
                              <span className={`px-2 py-1 rounded-full text-xs ${trade.status === 'Open' ? 'bg-blue-900/30 text-blue-400' : 'bg-slate-700/30 text-slate-300'}`}>
                                {trade.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <Button 
                                size="sm" 
                                variant="outline" 
                                onClick={() => setTradeToView(trade.id)}
                              >
                                View
                              </Button>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={9} className="py-6 text-center text-slate-400">
                            No trades found matching your filter criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </>
          ) : (
            <Card className="p-6">
              {trades.filter(t => t.id === tradeToView).map(trade => (
                <div key={trade.id}>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">{trade.symbol} {trade.type}</h2>
                    <div className="flex gap-3">
                      <Button variant="outline" onClick={() => setTradeToView(null)}>
                        Back to Trades
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Trade Details</h3>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Status</span>
                          <span className={trade.status === 'Open' ? 'text-blue-400' : 'text-slate-300'}>
                            {trade.status}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Direction</span>
                          <span className={trade.type === 'Long' ? 'text-green-400' : 'text-red-400'}>
                            {trade.type}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Date/Time</span>
                          <span>{trade.date} {trade.time}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Entry Price</span>
                          <span>{trade.entryPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                        </div>
                        {trade.exitPrice && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Exit Price</span>
                            <span>{trade.exitPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span className="text-slate-400">Quantity</span>
                          <span>{trade.quantity}</span>
                        </div>
                        {trade.pnl !== null && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">P&L</span>
                            <span className={trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}>
                              ${trade.pnl.toLocaleString()} ({trade.pnlPercent}%)
                            </span>
                          </div>
                        )}
                        {trade.strategy && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Strategy</span>
                            <span>{trade.strategy}</span>
                          </div>
                        )}
                        {trade.timeframe && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Timeframe</span>
                            <span>{trade.timeframe}</span>
                          </div>
                        )}
                        {trade.risk && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Risk %</span>
                            <span>{trade.risk}%</span>
                          </div>
                        )}
                        {trade.riskReward && (
                          <div className="flex justify-between">
                            <span className="text-slate-400">Risk:Reward Ratio</span>
                            <span>1:{trade.riskReward}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Psychology & Notes</h3>
                      {trade.emotions && (
                        <div className="mb-3">
                          <h4 className="text-md text-slate-400 mb-1">Emotional State</h4>
                          <p className="text-slate-300">{trade.emotions}</p>
                        </div>
                      )}
                      {trade.marketConditions && (
                        <div className="mb-3">
                          <h4 className="text-md text-slate-400 mb-1">Market Conditions</h4>
                          <p className="text-slate-300">{trade.marketConditions}</p>
                        </div>
                      )}
                      <div className="mb-3">
                        <h4 className="text-md text-slate-400 mb-1">Trade Notes</h4>
                        <p className="text-slate-300 mb-4">{trade.notes || 'No notes recorded for this trade.'}</p>
                      </div>
                      {trade.learnings && (
                        <div className="mb-3">
                          <h4 className="text-md text-slate-400 mb-1">Learnings</h4>
                          <p className="text-slate-300">{trade.learnings}</p>
                        </div>
                      )}
                      
                      <h4 className="text-md font-semibold mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {trade.tags.map((tag, i) => (
                          <span key={i} className="px-2 py-1 bg-slate-700 rounded-full text-xs">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {trade.status === 'Open' && (
                    <div className="mt-6 flex gap-3">
                      <Button>Close Position</Button>
                      <Button variant="outline">Edit Trade</Button>
                    </div>
                  )}
                </div>
              ))}
            </Card>
          )}
        </TabsContent>

        <TabsContent value="add-trade" className="mt-4">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-6">Record New Trade</h2>
            
            <form onSubmit={handleAddTrade} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Symbol *</label>
                  <Input
                    name="symbol"
                    value={newEntry.symbol}
                    onChange={handleNewTradeChange}
                    placeholder="e.g. BTC/USD, AAPL, EUR/USD"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Direction *</label>
                  <Select 
                    name="type" 
                    value={newEntry.type} 
                    onValueChange={(value) => setNewEntry({...newEntry, type: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Long">Long</SelectItem>
                      <SelectItem value="Short">Short</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Strategy</label>
                  <Input
                    name="strategy"
                    value={newEntry.strategy}
                    onChange={handleNewTradeChange}
                    placeholder="e.g. Breakout, Trend Following"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Entry Price *</label>
                  <Input
                    name="entryPrice"
                    type="number"
                    step="any"
                    value={newEntry.entryPrice}
                    onChange={handleNewTradeChange}
                    placeholder="Entry price"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Quantity/Size *</label>
                  <Input
                    name="quantity"
                    type="number"
                    step="any"
                    value={newEntry.quantity}
                    onChange={handleNewTradeChange}
                    placeholder="Trade size"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Timeframe</label>
                  <Select 
                    name="timeframe" 
                    value={newEntry.timeframe} 
                    onValueChange={(value) => setNewEntry({...newEntry, timeframe: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeframe" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1m">1 Minute</SelectItem>
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="30m">30 Minutes</SelectItem>
                      <SelectItem value="1H">1 Hour</SelectItem>
                      <SelectItem value="4H">4 Hours</SelectItem>
                      <SelectItem value="1D">Daily</SelectItem>
                      <SelectItem value="1W">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Risk %</label>
                  <Input
                    name="risk"
                    type="number"
                    step="0.1"
                    value={newEntry.risk}
                    onChange={handleNewTradeChange}
                    placeholder="e.g. 1.5"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Risk:Reward Ratio</label>
                  <Input
                    name="riskReward"
                    type="number"
                    step="0.1"
                    value={newEntry.riskReward}
                    onChange={handleNewTradeChange}
                    placeholder="e.g. 2.0"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Emotional State</label>
                  <Select 
                    name="emotions" 
                    value={newEntry.emotions}
                    onValueChange={(value) => setNewEntry({...newEntry, emotions: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="How did you feel?" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Calm">Calm</SelectItem>
                      <SelectItem value="Confident">Confident</SelectItem>
                      <SelectItem value="Focused">Focused</SelectItem>
                      <SelectItem value="Anxious">Anxious</SelectItem>
                      <SelectItem value="Impatient">Impatient</SelectItem>
                      <SelectItem value="Fearful">Fearful</SelectItem>
                      <SelectItem value="Greedy">Greedy</SelectItem>
                      <SelectItem value="Indecisive">Indecisive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Market Conditions</label>
                  <Select 
                    name="marketConditions" 
                    value={newEntry.marketConditions}
                    onValueChange={(value) => setNewEntry({...newEntry, marketConditions: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select market condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Trending">Trending</SelectItem>
                      <SelectItem value="Ranging">Ranging</SelectItem>
                      <SelectItem value="Volatile">Volatile</SelectItem>
                      <SelectItem value="Choppy">Choppy</SelectItem>
                      <SelectItem value="Low Volatility">Low Volatility</SelectItem>
                      <SelectItem value="High Volatility">High Volatility</SelectItem>
                      <SelectItem value="News Driven">News Driven</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tags (comma-separated)</label>
                  <Input
                    name="tags"
                    value={newEntry.tags}
                    onChange={handleNewTradeChange}
                    placeholder="e.g. Breakout, Crypto, Successful"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Trade Notes</label>
                <Textarea
                  name="notes"
                  value={newEntry.notes}
                  onChange={handleNewTradeChange}
                  placeholder="Enter your trade plan, observations, and reflections..."
                  rows={4}
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <Button type="submit">Add Trade</Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <PopupContainer padding>
              <h3 className="text-xl font-semibold mb-3">Performance Summary</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Trades</span>
                    <span className="font-medium">{totalTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Win Rate</span>
                    <span className="font-medium">{winRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Profitable/Loss</span>
                    <span className="font-medium">{profitableTrades}/{lossTrades}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total P&L</span>
                    <span className={`font-medium ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      ${totalProfit.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Profit</span>
                    <span className="font-medium text-green-400">${avgProfit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Avg Loss</span>
                    <span className="font-medium text-red-400">${avgLoss.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </PopupContainer>

            <PopupContainer padding>
              <h3 className="text-xl font-semibold mb-3">Strategy Performance</h3>
              <div className="space-y-2">
                {strategyPerformance.length > 0 ? (
                  strategyPerformance.map((strategy, index) => (
                    <div key={index} className="p-2 border border-slate-700 rounded">
                      <div className="font-medium">{strategy.name}</div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Win Rate</span>
                        <span className="text-xs">{strategy.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Trades</span>
                        <span className="text-xs">{strategy.trades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">P&L</span>
                        <span className={`text-xs ${strategy.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${strategy.pnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm">No strategy data available</div>
                )}
              </div>
            </PopupContainer>

            <PopupContainer padding>
              <h3 className="text-xl font-semibold mb-3">Psychology Insights</h3>
              <div className="space-y-2">
                {emotionPerformance.length > 0 ? (
                  emotionPerformance.map((emotion, index) => (
                    <div key={index} className="p-2 border border-slate-700 rounded">
                      <div className="font-medium">{emotion.name}</div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Win Rate</span>
                        <span className="text-xs">{emotion.winRate}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">Trades</span>
                        <span className="text-xs">{emotion.trades}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-xs text-slate-400">P&L</span>
                        <span className={`text-xs ${emotion.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          ${emotion.pnl.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-slate-400 text-sm">No emotion data available</div>
                )}
              </div>
            </PopupContainer>
          </div>

          <Card className="p-6">
            <h3 className="text-xl font-semibold mb-4">Trade Journal Insights</h3>
            <div className="space-y-4">
              <div>
                <h4 className="text-lg flex items-center gap-2 mb-2">
                  <Award size={20} className="text-yellow-500" />
                  Best Performing Strategy
                </h4>
                {strategyPerformance.length > 0 ? (
                  <p className="text-slate-300">
                    Your <span className="text-blue-400 font-medium">{strategyPerformance[0].name}</span> strategy 
                    has the highest profitability with ${strategyPerformance[0].pnl.toLocaleString()} in profits 
                    and a {strategyPerformance[0].winRate}% win rate across {strategyPerformance[0].trades} trades.
                  </p>
                ) : (
                  <p className="text-slate-400">Add more trades with strategy information to see insights.</p>
                )}
              </div>

              <div>
                <h4 className="text-lg flex items-center gap-2 mb-2">
                  <Brain size={20} className="text-purple-500" />
                  Psychological Pattern
                </h4>
                {emotionPerformance.length > 0 ? (
                  <p className="text-slate-300">
                    Trading while feeling <span className="text-blue-400 font-medium">{emotionPerformance[0].name}</span> leads 
                    to your best results with a {emotionPerformance[0].winRate}% win rate. 
                    {emotionPerformance.length > 1 && emotionPerformance[emotionPerformance.length-1].pnl < 0 && 
                      ` Trading while feeling ${emotionPerformance[emotionPerformance.length-1].name} leads to your worst results.`
                    }
                  </p>
                ) : (
                  <p className="text-slate-400">Add more trades with emotional state information to see insights.</p>
                )}
              </div>

              {/* Trade consistency analysis */}
              <div>
                <h4 className="text-lg flex items-center gap-2 mb-2">
                  <FileText size={20} className="text-blue-500" />
                  Trade Consistency
                </h4>
                {trades.length > 3 ? (
                  <p className="text-slate-300">
                    {avgProfit > Math.abs(avgLoss) ? (
                      <>Your average win (${avgProfit.toFixed(2)}) is {(avgProfit / Math.abs(avgLoss)).toFixed(1)}x your average loss (${Math.abs(avgLoss).toFixed(2)}), which is a positive risk-reward profile.</>
                    ) : (
                      <>Your average loss (${Math.abs(avgLoss).toFixed(2)}) is larger than your average win (${avgProfit.toFixed(2)}). Consider adjusting your risk management to improve this ratio.</>
                    )}
                  </p>
                ) : (
                  <p className="text-slate-400">Add more closed trades to see consistency analysis.</p>
                )}
              </div>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}