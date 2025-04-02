import * as React from 'react';
import { useState, useEffect } from 'react';
import { Button } from './button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { AlertTriangle, Code, Play, Pause, Trash2, Plus, Edit, RefreshCw, Info, Download, Upload } from 'lucide-react';

interface Bot {
  id: string;
  name: string;
  platform: 'pinescript' | 'tradelocker' | 'ninjatrader' | 'metatrader';
  status: 'active' | 'paused' | 'error';
  description: string;
  createdAt: string;
  lastRunAt?: string;
  code?: string;
  settings?: any;
  profitLoss?: number;
  tradeCount?: number;
  winRate?: number;
}

interface TradingBotsManagerProps {
  className?: string;
}

export const TradingBotsManager: React.FC<TradingBotsManagerProps> = ({ className = '' }) => {
  const [activePlatform, setActivePlatform] = useState<'pinescript' | 'tradelocker' | 'ninjatrader' | 'metatrader'>('pinescript');
  const [bots, setBots] = useState<Bot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [isNewBotDialogOpen, setIsNewBotDialogOpen] = useState(false);
  const [isEditBotDialogOpen, setIsEditBotDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedBot, setSelectedBot] = useState<Bot | null>(null);
  
  // Form states
  const [botName, setBotName] = useState('');
  const [botDescription, setBotDescription] = useState('');
  const [botCode, setBotCode] = useState('');
  const [botPlatform, setBotPlatform] = useState<'pinescript' | 'tradelocker' | 'ninjatrader' | 'metatrader'>('pinescript');
  
  // Load bots from API
  useEffect(() => {
    const fetchBots = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Mock API call - in production, this would be a real API call
        // const response = await fetch('/api/bots');
        // const data = await response.json();
        
        // For demo purposes, we're using mock data
        const mockBots: Bot[] = [
          {
            id: '1',
            name: 'EMA Crossover Strategy',
            platform: 'pinescript',
            status: 'active',
            description: 'A simple EMA crossover strategy that goes long when fast EMA crosses above slow EMA and short when it crosses below.',
            createdAt: '2025-02-15T12:00:00Z',
            lastRunAt: '2025-03-28T09:45:00Z',
            profitLoss: 2345.67,
            tradeCount: 78,
            winRate: 64.5
          },
          {
            id: '2',
            name: 'RSI Reversal',
            platform: 'tradelocker',
            status: 'paused',
            description: 'Identifies overbought and oversold conditions using RSI and enters trades on reversals.',
            createdAt: '2025-01-28T15:30:00Z',
            lastRunAt: '2025-03-25T14:20:00Z',
            profitLoss: 1289.45,
            tradeCount: 42,
            winRate: 59.8
          },
          {
            id: '3',
            name: 'MACD Momentum',
            platform: 'ninjatrader',
            status: 'error',
            description: 'Uses MACD for momentum confirmation and enters trades only with trend.',
            createdAt: '2025-03-10T09:15:00Z',
            lastRunAt: '2025-03-27T11:30:00Z',
            profitLoss: -320.15,
            tradeCount: 23,
            winRate: 42.3
          },
          {
            id: '4',
            name: 'Bollinger Breakout',
            platform: 'metatrader',
            status: 'active',
            description: 'Identifies breakouts from Bollinger Bands and enters in the direction of the breakout.',
            createdAt: '2025-02-05T16:45:00Z',
            lastRunAt: '2025-03-28T10:15:00Z',
            profitLoss: 876.29,
            tradeCount: 35,
            winRate: 57.1
          }
        ];
        
        setBots(mockBots);
      } catch (err: any) {
        console.error('Failed to load bots:', err);
        setError('Failed to load bots. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBots();
  }, []);
  
  // Filter bots by selected platform
  const filteredBots = bots.filter(bot => bot.platform === activePlatform);
  
  // Handle creating a new bot
  const handleCreateBot = async () => {
    if (!botName.trim()) {
      setError('Bot name is required');
      return;
    }
    
    // Create a new bot object
    const newBot: Omit<Bot, 'id'> = {
      name: botName,
      platform: botPlatform,
      status: 'paused', // Start as paused
      description: botDescription,
      createdAt: new Date().toISOString(),
      code: botCode,
      profitLoss: 0,
      tradeCount: 0,
      winRate: 0
    };
    
    // In a real app, you would send this to the API
    // For now, just add it to the state
    const mockId = Math.random().toString(36).substring(2, 9);
    setBots(prev => [...prev, { ...newBot, id: mockId } as Bot]);
    
    // Close the dialog and reset form
    setIsNewBotDialogOpen(false);
    resetForm();
  };
  
  // Handle editing a bot
  const handleEditBot = async () => {
    if (!selectedBot) return;
    
    if (!botName.trim()) {
      setError('Bot name is required');
      return;
    }
    
    // Update the bot
    const updatedBot: Bot = {
      ...selectedBot,
      name: botName,
      description: botDescription,
      code: botCode
    };
    
    // In a real app, you would send this to the API
    // For now, just update the state
    setBots(prev => prev.map(bot => bot.id === selectedBot.id ? updatedBot : bot));
    
    // Close the dialog and reset form
    setIsEditBotDialogOpen(false);
    resetForm();
  };
  
  // Handle deleting a bot
  const handleDeleteBot = async () => {
    if (!selectedBot) return;
    
    // In a real app, you would send this to the API
    // For now, just remove it from the state
    setBots(prev => prev.filter(bot => bot.id !== selectedBot.id));
    
    // Close the dialog
    setIsDeleteConfirmOpen(false);
    setSelectedBot(null);
  };
  
  // Handle starting a bot
  const handleStartBot = async (bot: Bot) => {
    // In a real app, you would send this to the API
    // For now, just update the state
    setBots(prev => 
      prev.map(b => 
        b.id === bot.id 
          ? { ...b, status: 'active', lastRunAt: new Date().toISOString() } 
          : b
      )
    );
  };
  
  // Handle pausing a bot
  const handlePauseBot = async (bot: Bot) => {
    // In a real app, you would send this to the API
    // For now, just update the state
    setBots(prev => 
      prev.map(b => 
        b.id === bot.id 
          ? { ...b, status: 'paused' } 
          : b
      )
    );
  };
  
  // Reset form fields
  const resetForm = () => {
    setBotName('');
    setBotDescription('');
    setBotCode('');
    setBotPlatform('pinescript');
    setSelectedBot(null);
    setError(null);
  };
  
  // Open edit dialog with bot data
  const openEditDialog = (bot: Bot) => {
    setSelectedBot(bot);
    setBotName(bot.name);
    setBotDescription(bot.description);
    setBotCode(bot.code || '');
    setBotPlatform(bot.platform);
    setIsEditBotDialogOpen(true);
  };
  
  // Render platform icon
  const renderPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'pinescript':
        return <span className="text-blue-500">📊</span>;
      case 'tradelocker':
        return <span className="text-green-500">🔒</span>;
      case 'ninjatrader':
        return <span className="text-purple-500">⚔️</span>;
      case 'metatrader':
        return <span className="text-yellow-500">📈</span>;
      default:
        return <span className="text-gray-500">🤖</span>;
    }
  };
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'paused':
        return 'bg-yellow-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Get platform specific instructions
  const getPlatformInstructions = () => {
    switch (activePlatform) {
      case 'pinescript':
        return (
          <div className="bg-slate-800 p-4 rounded-md mb-4 text-sm">
            <h4 className="font-medium mb-2">PineScript Instructions</h4>
            <p className="mb-2">Create TradingView indicators and strategies using PineScript language. Your scripts will be executed directly on our platform.</p>
            <p>Example:</p>
            <pre className="bg-slate-900 p-2 rounded mt-2 overflow-x-auto">
              {`//@version=5
strategy("EMA Cross Strategy", overlay=true)

fast_length = input(9)
slow_length = input(21)

fast_ema = ta.ema(close, fast_length)
slow_ema = ta.ema(close, slow_length)

buy_signal = ta.crossover(fast_ema, slow_ema)
sell_signal = ta.crossunder(fast_ema, slow_ema)

if (buy_signal)
    strategy.entry("Buy", strategy.long)

if (sell_signal)
    strategy.close("Buy")`}
            </pre>
          </div>
        );
      case 'tradelocker':
        return (
          <div className="bg-slate-800 p-4 rounded-md mb-4 text-sm">
            <h4 className="font-medium mb-2">TradeLocker Instructions</h4>
            <p className="mb-2">TradeLocker bots use JavaScript-based rules to create and manage trading strategies with position sizing and risk management.</p>
            <p>Example:</p>
            <pre className="bg-slate-900 p-2 rounded mt-2 overflow-x-auto">
              {`module.exports = {
  name: "RSI Reversal Strategy",
  timeframe: "1h",
  symbols: ["BTC/USD", "ETH/USD"],
  
  init: function() {
    this.rsiPeriod = 14;
    this.oversold = 30;
    this.overbought = 70;
  },
  
  onTick: function(data, context) {
    const rsi = RSI(data.close, this.rsiPeriod);
    
    // Buy when RSI crosses above oversold
    if (rsi[1] < this.oversold && rsi[0] > this.oversold) {
      return this.buy(data.symbol, 0.1); // Buy with 10% of available funds
    }
    
    // Sell when RSI crosses below overbought
    if (rsi[1] > this.overbought && rsi[0] < this.overbought) {
      return this.sell(data.symbol, 100); // Sell 100% of position
    }
  }
};`}
            </pre>
          </div>
        );
      case 'ninjatrader':
        return (
          <div className="bg-slate-800 p-4 rounded-md mb-4 text-sm">
            <h4 className="font-medium mb-2">NinjaTrader Instructions</h4>
            <p className="mb-2">Import and use your NinjaTrader strategies. Upload NinjaScript (C#) code or NinjaTrader strategy files.</p>
            <p>Example:</p>
            <pre className="bg-slate-900 p-2 rounded mt-2 overflow-x-auto">
              {`using System;
using NinjaTrader.Cbi;
using NinjaTrader.Indicator;
using NinjaTrader.Strategy;

public class MACDStrategy : Strategy
{
    private MACD macd;
    
    protected override void Initialize()
    {
        macd = MACD(12, 26, 9);
    }
    
    protected override void OnBarUpdate()
    {
        if (CurrentBar < 20) return;
        
        if (CrossAbove(macd.Diff, macd.Avg, 1))
            EnterLong();
        else if (CrossBelow(macd.Diff, macd.Avg, 1))
            ExitLong();
    }
}`}
            </pre>
          </div>
        );
      case 'metatrader':
        return (
          <div className="bg-slate-800 p-4 rounded-md mb-4 text-sm">
            <h4 className="font-medium mb-2">MetaTrader Instructions</h4>
            <p className="mb-2">Upload and configure MetaTrader Expert Advisors (EAs). Both MQL4 and MQL5 supported.</p>
            <p>Example:</p>
            <pre className="bg-slate-900 p-2 rounded mt-2 overflow-x-auto">
              {`//+------------------------------------------------------------------+
//| BollingerBreakout.mq5                                           |
//+------------------------------------------------------------------+
#property copyright "Trade Hybrid"
#property version   "1.00"

#include <Trade\\Trade.mqh>

input int BBPeriod = 20;      // Bollinger Bands period
input double BBDeviation = 2; // Bollinger Bands deviation
input int SLPoints = 100;     // Stop loss in points
input int TPPoints = 200;     // Take profit in points

CTrade trade;

int OnInit()
{
   return(INIT_SUCCEEDED);
}

void OnTick()
{
   // Calculate Bollinger Bands
   double upperBand[], middleBand[], lowerBand[];
   ArraySetAsSeries(upperBand, true);
   ArraySetAsSeries(middleBand, true);
   ArraySetAsSeries(lowerBand, true);
   
   int bbDefinition = iBands(_Symbol, _Period, BBPeriod, BBDeviation, 0, PRICE_CLOSE);
   CopyBuffer(bbDefinition, 0, 0, 3, middleBand);
   CopyBuffer(bbDefinition, 1, 0, 3, upperBand);
   CopyBuffer(bbDefinition, 2, 0, 3, lowerBand);
   
   // Check for breakouts
   if(PositionsTotal() == 0) {
      if(Close[1] <= lowerBand[1] && Close[0] > lowerBand[0]) {
         double sl = NormalizeDouble(Ask - SLPoints * _Point, _Digits);
         double tp = NormalizeDouble(Ask + TPPoints * _Point, _Digits);
         trade.Buy(0.1, _Symbol, Ask, sl, tp);
      }
      else if(Close[1] >= upperBand[1] && Close[0] < upperBand[0]) {
         double sl = NormalizeDouble(Bid + SLPoints * _Point, _Digits);
         double tp = NormalizeDouble(Bid - TPPoints * _Point, _Digits);
         trade.Sell(0.1, _Symbol, Bid, sl, tp);
      }
   }
}`}
            </pre>
          </div>
        );
      default:
        return null;
    }
  };
  
  return (
    <div className={`bg-slate-900 border border-slate-700 rounded-lg overflow-hidden ${className}`}>
      <div className="border-b border-slate-700 p-4">
        <div className="flex flex-wrap justify-between items-center">
          <h2 className="text-xl font-bold">Trading Bots</h2>
          <Button onClick={() => setIsNewBotDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Bot
          </Button>
        </div>
      </div>
      
      <Tabs value={activePlatform} onValueChange={(value) => setActivePlatform(value as any)}>
        <div className="border-b border-slate-700 px-4 py-2">
          <TabsList className="bg-slate-800">
            <TabsTrigger value="pinescript" className="data-[state=active]:bg-blue-600">PineScript</TabsTrigger>
            <TabsTrigger value="tradelocker" className="data-[state=active]:bg-blue-600">TradeLocker</TabsTrigger>
            <TabsTrigger value="ninjatrader" className="data-[state=active]:bg-blue-600">NinjaTrader</TabsTrigger>
            <TabsTrigger value="metatrader" className="data-[state=active]:bg-blue-600">MetaTrader</TabsTrigger>
          </TabsList>
        </div>
        
        {["pinescript", "tradelocker", "ninjatrader", "metatrader"].map((platform) => (
          <TabsContent key={platform} value={platform} className="p-4">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <div className="text-center">
                  <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
                  <p className="text-slate-300">Loading bots...</p>
                </div>
              </div>
            ) : error ? (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-4 text-center">
                <AlertTriangle className="h-6 w-6 mx-auto mb-2 text-red-400" />
                <p className="text-slate-200">{error}</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={() => window.location.reload()}>
                  Try Again
                </Button>
              </div>
            ) : filteredBots.length === 0 ? (
              <div className="text-center p-8">
                <p className="text-slate-400 mb-4">No bots found for this platform.</p>
                <Button onClick={() => setIsNewBotDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create your first bot
                </Button>
              </div>
            ) : (
              <>
                {getPlatformInstructions()}
                
                <div className="space-y-4">
                  {filteredBots.map(bot => (
                    <div key={bot.id} className="bg-slate-800 rounded-lg overflow-hidden">
                      <div className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center">
                              {renderPlatformIcon(bot.platform)}
                              <h3 className="font-bold text-lg ml-2">{bot.name}</h3>
                              <span className={`ml-3 inline-block w-2 h-2 rounded-full ${getStatusColor(bot.status)}`}></span>
                              <span className="ml-1 text-xs text-slate-400">{bot.status.toUpperCase()}</span>
                            </div>
                            <p className="text-slate-400 text-sm mt-1">{bot.description}</p>
                          </div>
                          <div className="flex">
                            {bot.status === 'active' ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePauseBot(bot)}
                                className="mr-2"
                              >
                                <Pause className="h-4 w-4 mr-1" />
                                Pause
                              </Button>
                            ) : (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handleStartBot(bot)}
                                className="mr-2"
                                disabled={bot.status === 'error'}
                              >
                                <Play className="h-4 w-4 mr-1" />
                                Start
                              </Button>
                            )}
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => openEditDialog(bot)}
                              className="mr-2"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-red-500 hover:text-red-400"
                              onClick={() => {
                                setSelectedBot(bot);
                                setIsDeleteConfirmOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div className="bg-slate-700/50 p-3 rounded">
                            <p className="text-xs text-slate-400">PROFIT/LOSS</p>
                            <p className={`text-lg font-bold ${bot.profitLoss && bot.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              {bot.profitLoss ? `$${bot.profitLoss.toFixed(2)}` : '$0.00'}
                            </p>
                          </div>
                          <div className="bg-slate-700/50 p-3 rounded">
                            <p className="text-xs text-slate-400">TRADES</p>
                            <p className="text-lg font-bold">{bot.tradeCount || 0}</p>
                          </div>
                          <div className="bg-slate-700/50 p-3 rounded">
                            <p className="text-xs text-slate-400">WIN RATE</p>
                            <p className="text-lg font-bold">{bot.winRate ? `${bot.winRate.toFixed(1)}%` : '0%'}</p>
                          </div>
                          <div className="bg-slate-700/50 p-3 rounded">
                            <p className="text-xs text-slate-400">LAST RUN</p>
                            <p className="text-lg font-bold">{bot.lastRunAt ? formatDate(bot.lastRunAt) : 'Never'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </TabsContent>
        ))}
      </Tabs>
      
      {/* New Bot Dialog */}
      <Dialog open={isNewBotDialogOpen} onOpenChange={setIsNewBotDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Create New Bot</DialogTitle>
            <DialogDescription className="text-slate-400">
              Fill in the details to create a new trading bot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="bot-name">
                Bot Name
              </label>
              <input
                id="bot-name"
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="EMA Crossover Strategy"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="bot-platform">
                Platform
              </label>
              <select
                id="bot-platform"
                value={botPlatform}
                onChange={(e) => setBotPlatform(e.target.value as any)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="pinescript">PineScript (TradingView)</option>
                <option value="tradelocker">TradeLocker</option>
                <option value="ninjatrader">NinjaTrader</option>
                <option value="metatrader">MetaTrader</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="bot-description">
                Description
              </label>
              <textarea
                id="bot-description"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
                placeholder="Briefly describe what this bot does..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="bot-code">
                Bot Code
              </label>
              <textarea
                id="bot-code"
                value={botCode}
                onChange={(e) => setBotCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm h-40"
                placeholder="Paste your bot code here..."
              />
            </div>
            
            <div className="flex items-center space-x-2 text-slate-400 text-sm">
              <Info className="h-4 w-4" />
              <span>You can also upload a file from your device.</span>
            </div>
            
            <div className="flex justify-between">
              <Button variant="outline" type="button">
                <Upload className="h-4 w-4 mr-2" />
                Upload Code
              </Button>
              <Button variant="outline" type="button">
                <Download className="h-4 w-4 mr-2" />
                Code Templates
              </Button>
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsNewBotDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleCreateBot}>
              Create Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Bot Dialog */}
      <Dialog open={isEditBotDialogOpen} onOpenChange={setIsEditBotDialogOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Edit Bot</DialogTitle>
            <DialogDescription className="text-slate-400">
              Modify the details of your trading bot.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="edit-bot-name">
                Bot Name
              </label>
              <input
                id="edit-bot-name"
                type="text"
                value={botName}
                onChange={(e) => setBotName(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="edit-bot-description">
                Description
              </label>
              <textarea
                id="edit-bot-description"
                value={botDescription}
                onChange={(e) => setBotDescription(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 h-20"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1" htmlFor="edit-bot-code">
                Bot Code
              </label>
              <textarea
                id="edit-bot-code"
                value={botCode}
                onChange={(e) => setBotCode(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-sm h-40"
              />
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsEditBotDialogOpen(false);
              resetForm();
            }}>
              Cancel
            </Button>
            <Button onClick={handleEditBot}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="bg-slate-900 border-slate-700 text-slate-100">
          <DialogHeader>
            <DialogTitle>Delete Bot</DialogTitle>
            <DialogDescription className="text-slate-400">
              Are you sure you want to delete this bot? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          {selectedBot && (
            <div className="py-4">
              <p className="font-medium">{selectedBot.name}</p>
              <p className="text-sm text-slate-400 mt-1">{selectedBot.description}</p>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBot}>
              Delete Bot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};