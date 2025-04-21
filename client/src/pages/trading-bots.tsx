import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { TradingDashboardLayout } from '../components/ui/trading-dashboard-layout';
import { Bot, BrainCircuit, ActivitySquare, Settings, Play, Clock, ChevronRight, Plus, X, Check } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';

export default function TradingBotsPage() {
  const [showNewBotDialog, setShowNewBotDialog] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newBotData, setNewBotData] = useState({
    name: '',
    strategy: 'momentum',
    assets: ['BTC'],
    maxDrawdown: '10',
    stopLoss: '5',
    takeProfit: '15',
    initialCapital: '1000'
  });

  const handleCreateBot = () => {
    setCreating(true);
    
    // Simulate API call to create a new bot
    setTimeout(() => {
      setCreating(false);
      setShowNewBotDialog(false);
      
      // Reset form
      setNewBotData({
        name: '',
        strategy: 'momentum',
        assets: ['BTC'],
        maxDrawdown: '10',
        stopLoss: '5',
        takeProfit: '15',
        initialCapital: '1000'
      });
      
      // Show success notification
      toast.success('Trading bot created successfully', {
        description: `${newBotData.name} has been created and is ready to configure.`,
        action: {
          label: 'View',
          onClick: () => console.log('View bot settings')
        }
      });
    }, 1500);
  };
  
  const activeTraders = [
    {
      id: '1',
      name: 'BTC Momentum Trader',
      strategy: 'Momentum',
      assets: ['BTC'],
      uptime: '27 days',
      status: 'active',
      profit: '+12.4%',
      isPositive: true,
      lastTrade: '2 hours ago'
    },
    {
      id: '2',
      name: 'ETH/SOL Smart Allocator',
      strategy: 'Smart Beta',
      assets: ['ETH', 'SOL'],
      uptime: '14 days',
      status: 'active',
      profit: '+7.8%',
      isPositive: true,
      lastTrade: '5 hours ago'
    }
  ];
  
  const inactiveTraders = [
    {
      id: '3',
      name: 'Altcoin Grid Trader',
      strategy: 'Grid Trading',
      assets: ['DOT', 'AVAX', 'MATIC'],
      uptime: '0 days',
      status: 'inactive',
      profit: '0%',
      isPositive: false,
      lastTrade: 'Never'
    },
    {
      id: '4',
      name: 'Bear Market Hedge Bot',
      strategy: 'Counter-Trend',
      assets: ['BTC', 'ETH'],
      uptime: '0 days',
      status: 'inactive',
      profit: '0%',
      isPositive: false,
      lastTrade: 'Never'
    }
  ];
  
  const premiumStrategies = [
    {
      id: 'p1',
      name: 'Neural Alpha Pro',
      description: 'Advanced neural network strategy that outperforms the market in all conditions',
      returns: '+32.5% YTD',
      complexity: 'High',
      risk: 'Medium',
      premium: true
    },
    {
      id: 'p2',
      name: 'Volatility Harvester',
      description: 'Capitalizes on market volatility with dynamic position sizing',
      returns: '+24.8% YTD',
      complexity: 'Medium',
      risk: 'Medium-High',
      premium: true
    },
    {
      id: 'p3',
      name: 'Multi-Factor Smart Beta',
      description: 'Combines multiple alpha factors for optimal asset allocation',
      returns: '+18.7% YTD',
      complexity: 'Medium',
      risk: 'Low-Medium',
      premium: true
    }
  ];
  
  return (
    <TradingDashboardLayout>
      <Helmet>
        <title>AI Trading Bots | Trade Hybrid</title>
      </Helmet>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">AI Trading Bots</h1>
            <p className="text-slate-400">
              Create, deploy and monitor autonomous trading bots powered by AI
            </p>
          </div>
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setShowNewBotDialog(true)}
          >
            <Bot className="mr-2 h-4 w-4" />
            Create New Bot
          </Button>
        </div>
        
        <Tabs defaultValue="active" className="w-full mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="active">Active Bots</TabsTrigger>
            <TabsTrigger value="inactive">Inactive Bots</TabsTrigger>
            <TabsTrigger value="strategies">Premium Strategies</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeTraders.map((bot) => (
                <Card key={bot.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">{bot.name}</CardTitle>
                      <Badge variant={bot.status === 'active' ? 'success' : 'secondary'} className="bg-green-900/30 text-green-400 hover:bg-green-900/50">
                        Active
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-slate-400">
                      <BrainCircuit className="h-4 w-4 mr-1 text-purple-400" />
                      {bot.strategy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <p className="text-slate-400">Assets</p>
                        <div className="flex gap-1 mt-1">
                          {bot.assets.map((asset, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-700/50">
                              {asset}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400">Profit</p>
                        <p className={`font-semibold ${bot.isPositive ? 'text-green-400' : 'text-red-400'}`}>
                          {bot.profit}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Uptime</p>
                        <p>{bot.uptime}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Last Trade</p>
                        <p>{bot.lastTrade}</p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Settings className="h-4 w-4 mr-1" />
                      Settings
                    </Button>
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <ActivitySquare className="h-4 w-4 mr-1" />
                      Stats
                    </Button>
                  </CardFooter>
                </Card>
              ))}
              
              <Card className="bg-blue-900/20 border-blue-700/30 border-dashed h-[218px] flex flex-col items-center justify-center text-center">
                <CardContent>
                  <Bot className="h-12 w-12 text-blue-400 mb-3" />
                  <h3 className="text-lg font-medium mb-2">Create AI Trading Bot</h3>
                  <p className="text-sm text-slate-400 mb-4">
                    Deploy AI-powered trading strategies automatically
                  </p>
                  <Button 
                    size="sm" 
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => setShowNewBotDialog(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    New Bot
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="inactive">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inactiveTraders.map((bot) => (
                <Card key={bot.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">{bot.name}</CardTitle>
                      <Badge variant="secondary" className="bg-slate-700 text-slate-300">
                        Inactive
                      </Badge>
                    </div>
                    <CardDescription className="flex items-center text-slate-400">
                      <BrainCircuit className="h-4 w-4 mr-1 text-slate-400" />
                      {bot.strategy}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <p className="text-slate-400">Assets</p>
                        <div className="flex gap-1 mt-1">
                          {bot.assets.map((asset, i) => (
                            <Badge key={i} variant="outline" className="bg-slate-700/50">
                              {asset}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-slate-400">Status</p>
                        <p className="font-semibold text-slate-300">
                          Ready to deploy
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1 flex justify-between">
                    <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
                      <Settings className="h-4 w-4 mr-1" />
                      Configure
                    </Button>
                    <Button variant="default" size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Play className="h-4 w-4 mr-1" />
                      Start Bot
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="strategies">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumStrategies.map((strategy) => (
                <Card key={strategy.id} className="bg-slate-800 border-slate-700">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl font-bold">{strategy.name}</CardTitle>
                      <Badge className="bg-amber-900/30 text-amber-400 hover:bg-amber-900/50">
                        Premium
                      </Badge>
                    </div>
                    <CardDescription className="text-slate-400">
                      {strategy.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pb-2">
                    <div className="grid grid-cols-2 gap-y-2 text-sm">
                      <div>
                        <p className="text-slate-400">Returns</p>
                        <p className="font-semibold text-green-400">{strategy.returns}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Complexity</p>
                        <p className="font-semibold text-blue-400">{strategy.complexity}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Risk Level</p>
                        <p className="font-semibold text-purple-400">{strategy.risk}</p>
                      </div>
                      <div>
                        <p className="text-slate-400">Backtested</p>
                        <div className="flex items-center">
                          <Clock className="h-3.5 w-3.5 mr-1 text-slate-400" />
                          <p>3 years</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="pt-1">
                    <Button className="w-full bg-amber-600 hover:bg-amber-700">
                      Unlock Strategy
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-8 max-w-3xl">
          <h2 className="text-2xl font-bold mb-4">About AI Trading Bots</h2>
          <div className="space-y-4 text-slate-300">
            <p>
              Trade Hybrid's AI Trading Bots allow you to automate your trading strategies with powerful artificial intelligence.
              Our bots can trade 24/7 based on technical analysis, sentiment analysis, and pattern recognition.
            </p>
            <p>
              Each bot can be customized to your risk tolerance and trading preferences. Set your parameters and let the AI do the work while you keep control with safety features like stop-loss limits and maximum drawdown protection.
            </p>
            <div className="mt-6 bg-blue-900/30 border border-blue-800 p-4 rounded-md">
              <h3 className="font-bold text-blue-300 mb-2">New: AI Strategy Builder</h3>
              <p className="text-sm mb-3">
                Use our new AI Strategy Builder to create custom trading strategies without writing code. Just describe your trading strategy in natural language, and our AI will convert it into a fully functional trading bot.
              </p>
              <Button size="sm" variant="outline" className="bg-blue-900/40 border-blue-500/50 text-blue-400 hover:bg-blue-800/50">
                <BrainCircuit className="mr-2 h-4 w-4" />
                Open AI Strategy Builder
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Create New Bot Dialog */}
      <Dialog open={showNewBotDialog} onOpenChange={setShowNewBotDialog}>
        <DialogContent className="sm:max-w-md bg-slate-900 border-slate-800">
          <DialogHeader>
            <DialogTitle>Create Trading Bot</DialogTitle>
            <DialogDescription className="text-slate-400">
              Configure your new AI-powered trading bot. You can adjust all settings later.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-3">
            <div className="space-y-2">
              <Label htmlFor="botName">Bot Name</Label>
              <Input
                id="botName"
                placeholder="e.g., BTC Momentum Trader"
                className="bg-slate-800 border-slate-700"
                value={newBotData.name}
                onChange={(e) => setNewBotData({...newBotData, name: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="strategy">Strategy</Label>
                <Select 
                  value={newBotData.strategy}
                  onValueChange={(value) => setNewBotData({...newBotData, strategy: value})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select strategy" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="momentum">Momentum</SelectItem>
                    <SelectItem value="mean-reversion">Mean Reversion</SelectItem>
                    <SelectItem value="grid-trading">Grid Trading</SelectItem>
                    <SelectItem value="smart-beta">Smart Beta</SelectItem>
                    <SelectItem value="trend-following">Trend Following</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="assets">Primary Asset</Label>
                <Select 
                  defaultValue="BTC"
                  onValueChange={(value) => setNewBotData({...newBotData, assets: [value]})}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-700">
                    <SelectValue placeholder="Select asset" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                    <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                    <SelectItem value="SOL">Solana (SOL)</SelectItem>
                    <SelectItem value="AVAX">Avalanche (AVAX)</SelectItem>
                    <SelectItem value="DOT">Polkadot (DOT)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="initialCapital">Initial Capital ($)</Label>
                <Input
                  id="initialCapital"
                  type="number"
                  className="bg-slate-800 border-slate-700"
                  value={newBotData.initialCapital}
                  onChange={(e) => setNewBotData({...newBotData, initialCapital: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="maxDrawdown">Max Drawdown (%)</Label>
                <Input
                  id="maxDrawdown"
                  type="number"
                  className="bg-slate-800 border-slate-700"
                  value={newBotData.maxDrawdown}
                  onChange={(e) => setNewBotData({...newBotData, maxDrawdown: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stopLoss">Stop Loss (%)</Label>
                <Input
                  id="stopLoss"
                  type="number"
                  className="bg-slate-800 border-slate-700"
                  value={newBotData.stopLoss}
                  onChange={(e) => setNewBotData({...newBotData, stopLoss: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="takeProfit">Take Profit (%)</Label>
                <Input
                  id="takeProfit"
                  type="number"
                  className="bg-slate-800 border-slate-700"
                  value={newBotData.takeProfit}
                  onChange={(e) => setNewBotData({...newBotData, takeProfit: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter className="sm:justify-between">
            <Button
              variant="ghost"
              type="button"
              onClick={() => setShowNewBotDialog(false)}
              className="text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="mr-2 h-4 w-4" />
              Cancel
            </Button>
            <Button 
              type="button" 
              disabled={!newBotData.name || creating}
              className="bg-blue-600 hover:bg-blue-700"
              onClick={handleCreateBot}
            >
              {creating ? (
                <>
                  <Bot className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Create Bot
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TradingDashboardLayout>
  );
}