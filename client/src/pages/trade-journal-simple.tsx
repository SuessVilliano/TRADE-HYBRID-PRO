import React, { useState } from 'react';
import { Card } from '../components/ui/card';
import { PopupContainer } from '../components/ui/popup-container';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';

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
  },
];

export default function TradeJournalSimple() {
  const [trades, setTrades] = useState(sampleTrades);
  const [selectedTab, setSelectedTab] = useState('all-trades');
  const [newEntry, setNewEntry] = useState({
    symbol: '',
    type: 'Long',
    entryPrice: '',
    quantity: '',
    notes: '',
    tags: '',
  });

  // UI states
  const [tradeToView, setTradeToView] = useState<null | number>(null);
  const [filter, setFilter] = useState('all');

  const filteredTrades = trades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'open') return trade.status === 'Open';
    if (filter === 'closed') return trade.status === 'Closed';
    if (filter === 'profitable') return trade.pnl !== null && trade.pnl > 0;
    if (filter === 'losses') return trade.pnl !== null && trade.pnl < 0;
    return true;
  });

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
    };
    
    setTrades([newTrade, ...trades]);
    setNewEntry({
      symbol: '',
      type: 'Long',
      entryPrice: '',
      quantity: '',
      notes: '',
      tags: '',
    });
    setSelectedTab('all-trades');
  };

  return (
    <div className="container mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold mb-6">Trade Journal</h1>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="all-trades">Trade History</TabsTrigger>
          <TabsTrigger value="add-trade">Add New Trade</TabsTrigger>
        </TabsList>

        <TabsContent value="all-trades" className="space-y-6 mt-4">
          {tradeToView === null ? (
            <>
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
                          <td colSpan={8} className="py-6 text-center text-slate-400">
                            No trades found matching your filter criteria
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <PopupContainer padding>
                  <div className="text-4xl font-bold text-green-400 mb-2">
                    {trades.filter(t => t.pnl !== null && t.pnl > 0).length}
                  </div>
                  <div className="text-sm text-slate-300">Profitable Trades</div>
                </PopupContainer>
                
                <PopupContainer padding>
                  <div className="text-4xl font-bold text-red-400 mb-2">
                    {trades.filter(t => t.pnl !== null && t.pnl < 0).length}
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
                    ${trades.reduce((total, trade) => total + (trade.pnl || 0), 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-slate-300">Total P&L</div>
                </PopupContainer>
              </div>
            </>
          ) : (
            <Card className="p-6">
              {trades.filter(t => t.id === tradeToView).map(trade => (
                <div key={trade.id}>
                  <div className="flex justify-between mb-6">
                    <h2 className="text-2xl font-bold">{trade.symbol} {trade.type}</h2>
                    <Button variant="outline" onClick={() => setTradeToView(null)}>
                      Back to Trades
                    </Button>
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
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Notes</h3>
                      <p className="text-slate-300 mb-4">{trade.notes || 'No notes recorded for this trade.'}</p>
                      
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  <label className="block text-sm text-slate-400 mb-1">Trade Type *</label>
                  <select
                    name="type"
                    value={newEntry.type}
                    onChange={handleNewTradeChange}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="Long">Long</option>
                    <option value="Short">Short</option>
                  </select>
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
                  <label className="block text-sm text-slate-400 mb-1">Quantity *</label>
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
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Notes</label>
                <Textarea
                  name="notes"
                  value={newEntry.notes}
                  onChange={handleNewTradeChange}
                  placeholder="Add your trade reasoning, strategy used, emotions, etc."
                  rows={4}
                />
              </div>
              
              <div>
                <label className="block text-sm text-slate-400 mb-1">Tags (comma separated)</label>
                <Input
                  name="tags"
                  value={newEntry.tags}
                  onChange={handleNewTradeChange}
                  placeholder="e.g. Breakout, Support/Resistance, Crypto"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button type="submit">Save Trade</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setSelectedTab('all-trades')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}