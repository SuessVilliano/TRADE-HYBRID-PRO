import React, { useState } from 'react';
import { Button } from './button';
import { 
  Brain, 
  DollarSign, 
  Link, 
  ArrowRightLeft, 
  Sparkles,
  BarChart4,
  ChevronDown,
  Lock,
  PiggyBank,
  X
} from 'lucide-react';
import { Input } from './input';
import { 
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from './accordion';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './select';
import { Badge } from './badge';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from './tabs';
import { Switch } from './switch';

interface SmartTradePanelProps {
  symbol?: string;
}

export function SmartTradePanel({ symbol = 'BTCUSDT' }: SmartTradePanelProps) {
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [amount, setAmount] = useState<string>('');
  const [strategy, setStrategy] = useState<string>('market');
  
  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
        <div className="flex items-center">
          <Brain className="h-5 w-5 text-blue-400 mr-2" />
          <h3 className="font-medium">AI Trade Assistant</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900">
          <Sparkles className="h-3 w-3 mr-1" /> AI Powered
        </Badge>
      </div>
      
      <div className="flex-1 overflow-auto">
        <Tabs defaultValue="spot" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="bot">Trading Bot</TabsTrigger>
          </TabsList>
          
          <TabsContent value="spot" className="space-y-4">
            <div className="flex space-x-2">
              <Button 
                variant={tradeType === 'buy' ? 'default' : 'outline'} 
                className={tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700 flex-1' : 'flex-1'}
                onClick={() => setTradeType('buy')}
              >
                Buy
              </Button>
              <Button 
                variant={tradeType === 'sell' ? 'default' : 'outline'} 
                className={tradeType === 'sell' ? 'bg-red-600 hover:bg-red-700 flex-1' : 'flex-1'}
                onClick={() => setTradeType('sell')}
              >
                Sell
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-400">Symbol</span>
                <span className="text-sm font-medium">{symbol}</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Amount ({symbol.replace('USDT', '')})</span>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('0.25')}>25%</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('0.5')}>50%</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('0.75')}>75%</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('1')}>100%</Badge>
                  </div>
                </div>
                <Input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount" 
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="mb-4">
                <p className="text-sm text-slate-400 mb-1">Order Type</p>
                <Select defaultValue="market" onValueChange={setStrategy}>
                  <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-700">
                    <SelectItem value="market">Market Order</SelectItem>
                    <SelectItem value="limit">Limit Order</SelectItem>
                    <SelectItem value="stop-loss">Stop Loss</SelectItem>
                    <SelectItem value="ai-strategy">AI Strategy (Recommended)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {strategy === 'ai-strategy' && (
                <div className="bg-blue-900/20 border border-blue-700/40 rounded-md p-3 mb-4">
                  <div className="flex items-start mb-3">
                    <Sparkles className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-blue-300">AI Enhanced Trading</h4>
                      <p className="text-xs text-blue-200/80 mt-0.5">
                        Our AI will optimize your entry, exit, and position sizing for better risk management
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                    <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                      <p className="text-slate-400 mb-1">Entry Strategy</p>
                      <p className="text-white">Dynamic DCA</p>
                    </div>
                    <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                      <p className="text-slate-400 mb-1">Risk Level</p>
                      <div className="flex items-center">
                        <div className="h-1.5 w-16 bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500" style={{ width: '65%' }}></div>
                        </div>
                        <span className="text-white ml-2">Medium</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <Accordion type="single" collapsible className="w-full mb-4">
                <AccordionItem value="item-1" className="border-slate-700">
                  <AccordionTrigger className="text-sm hover:no-underline py-2">
                    <span className="flex items-center">
                      <BarChart4 className="h-4 w-4 mr-2 text-slate-400" />
                      Market Analysis
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="text-sm space-y-2 text-slate-300">
                    <div className="flex justify-between items-center">
                      <span>Current Price</span>
                      <span className="font-medium">${symbol === 'BTCUSDT' ? '66,789.50' : '3,402.75'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>24h Change</span>
                      <span className="text-green-400">+2.3%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Hybrid Score™</span>
                      <div className="flex items-center">
                        <div className="h-1.5 w-12 bg-slate-700 rounded-full overflow-hidden mr-2">
                          <div className="h-full bg-green-500" style={{ width: '78%' }}></div>
                        </div>
                        <span className="text-green-400">78</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>AI Sentiment</span>
                      <span className="text-blue-400">Moderately Bullish</span>
                    </div>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2" className="border-slate-700">
                  <AccordionTrigger className="text-sm hover:no-underline py-2">
                    <span className="flex items-center">
                      <ArrowRightLeft className="h-4 w-4 mr-2 text-slate-400" />
                      Advanced Options
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <PiggyBank className="h-4 w-4 mr-1.5 text-slate-400" />
                        Auto Compound Profits
                      </span>
                      <div className="flex items-center text-amber-400">
                        <Lock className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Premium</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm flex items-center">
                        <Link className="h-4 w-4 mr-1.5 text-slate-400" />
                        Connect to Trading Bot
                      </span>
                      <div className="flex items-center text-amber-400">
                        <Lock className="h-3.5 w-3.5 mr-1" />
                        <span className="text-xs">Premium</span>
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
              
              <div className="space-y-4">
                <Button 
                  className={`w-full ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol.replace('USDT', '')}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    AI will automatically calculate optimal entry points, position sizing and risk management based on current market conditions
                  </p>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="futures" className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-blue-400 mr-2" />
                <h3 className="font-medium">AI Futures Trading</h3>
              </div>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900">
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>
            
            <div className="flex space-x-2">
              <Button 
                variant={tradeType === 'buy' ? 'default' : 'outline'} 
                className={tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700 flex-1' : 'flex-1'}
                onClick={() => setTradeType('buy')}
              >
                Buy / Long
              </Button>
              <Button 
                variant={tradeType === 'sell' ? 'default' : 'outline'} 
                className={tradeType === 'sell' ? 'bg-red-600 hover:bg-red-700 flex-1' : 'flex-1'}
                onClick={() => setTradeType('sell')}
              >
                Sell / Short
              </Button>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm text-slate-400">Futures Contract</span>
                <span className="text-sm font-medium">{symbol}</span>
              </div>
              
              <div className="mb-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Position Size</span>
                  <div className="flex space-x-1">
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('0.5')}>0.5x</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('1')}>1x</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('5')}>5x</Badge>
                    <Badge variant="outline" className="text-xs cursor-pointer hover:bg-slate-700" onClick={() => setAmount('10')}>10x</Badge>
                  </div>
                </div>
                <Input 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="Enter amount" 
                  className="bg-slate-800 border-slate-700"
                />
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-slate-400">Leverage</span>
                  <span className="text-sm font-medium">{amount || '0'}x</span>
                </div>
                <div className="relative pt-1">
                  <div className="h-1 bg-slate-700 rounded-full">
                    <div 
                      className={`h-1 rounded-full ${
                        Number(amount) > 10 ? 'bg-red-500' : Number(amount) > 5 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}
                      style={{ width: `${Math.min(Number(amount) * 5, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>1x</span>
                  <span>5x</span>
                  <span>10x</span>
                  <span>15x</span>
                  <span>20x</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Entry Type</label>
                  <Select defaultValue="market" onValueChange={setStrategy}>
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="market">Market</SelectItem>
                      <SelectItem value="limit">Limit</SelectItem>
                      <SelectItem value="stop">Stop</SelectItem>
                      <SelectItem value="ai-optimized">AI Optimized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Take Profit</label>
                  <Input 
                    placeholder="Price or %" 
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Stop Loss</label>
                  <Input 
                    placeholder="Price or %" 
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
                
                <div>
                  <label className="text-sm text-slate-400 mb-1 block">Risk Level</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low">Conservative</SelectItem>
                      <SelectItem value="medium">Balanced</SelectItem>
                      <SelectItem value="high">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="bg-blue-900/20 border border-blue-700/40 rounded-md p-3 mb-4">
                <div className="flex items-start mb-2">
                  <Sparkles className="h-4 w-4 text-blue-400 mr-2 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-blue-300">AI Market Analysis</h4>
                    <p className="text-xs text-blue-200/80 mt-0.5">
                      Current market volatility is <strong>moderate</strong> with <strong>bullish</strong> trend detected on BTC
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                    <p className="text-slate-400 mb-1">Recommended Leverage</p>
                    <p className="text-white">5x - 7x</p>
                  </div>
                  <div className="bg-slate-800/70 p-2 rounded border border-slate-700">
                    <p className="text-slate-400 mb-1">Stop Loss Suggestion</p>
                    <div className="flex items-center">
                      <span className="text-white">3.2% from entry</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <Button 
                className={`w-full ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {tradeType === 'buy' ? 'Long' : 'Short'} {symbol.replace('USDT', '')} Futures
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="bot" className="space-y-4">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
              <div className="flex items-center">
                <Brain className="h-5 w-5 text-purple-400 mr-2" />
                <h3 className="font-medium">AI Trading Bot</h3>
              </div>
              <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900">
                <Sparkles className="h-3 w-3 mr-1" /> AI Powered
              </Badge>
            </div>
            
            <div className="bg-slate-850 border border-slate-700 rounded-md p-4 mb-4">
              <div className="flex items-start mb-3">
                <Sparkles className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium">AI Trading Bot Status</h4>
                  <p className="text-sm text-slate-400 mt-1">
                    Configure your automated trading bot with AI-optimized parameters
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Bot Status</p>
                  <div className="flex items-center">
                    <div className="h-2 w-2 bg-green-500 rounded-full mr-2"></div>
                    <span className="text-sm text-green-400">Active</span>
                  </div>
                </div>
                
                <div className="bg-slate-800 p-3 rounded-md">
                  <p className="text-sm font-medium mb-1">Performance</p>
                  <div className="flex items-center">
                    <span className="text-sm text-green-400">+3.2%</span>
                    <span className="text-xs text-slate-400 ml-2">(7d)</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Trading Pairs</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  <Badge className="bg-blue-900/40 text-blue-300 hover:bg-blue-800/30">
                    BTC/USDT
                    <X className="h-3 w-3 ml-1 cursor-pointer" />
                  </Badge>
                  <Badge className="bg-blue-900/40 text-blue-300 hover:bg-blue-800/30">
                    ETH/USDT
                    <X className="h-3 w-3 ml-1 cursor-pointer" />
                  </Badge>
                  <Badge className="bg-blue-900/40 text-blue-300 hover:bg-blue-800/30">
                    SOL/USDT
                    <X className="h-3 w-3 ml-1 cursor-pointer" />
                  </Badge>
                  <Badge variant="outline" className="border-dashed cursor-pointer">
                    + Add Pair
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Strategy Type</label>
                  <Select defaultValue="dca">
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="dca">DCA (Dollar Cost Avg)</SelectItem>
                      <SelectItem value="trend">Trend Following</SelectItem>
                      <SelectItem value="grid">Grid Trading</SelectItem>
                      <SelectItem value="ai">AI Adaptive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Risk Level</label>
                  <Select defaultValue="medium">
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="low">Conservative</SelectItem>
                      <SelectItem value="medium">Balanced</SelectItem>
                      <SelectItem value="high">Aggressive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Time Frame</label>
                  <Select defaultValue="1h">
                    <SelectTrigger className="w-full bg-slate-800 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="5m">5 Minutes</SelectItem>
                      <SelectItem value="15m">15 Minutes</SelectItem>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="4h">4 Hours</SelectItem>
                      <SelectItem value="1d">1 Day</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Max Allocation</label>
                  <Input 
                    placeholder="e.g. $1000" 
                    defaultValue="500"
                    className="bg-slate-800 border-slate-700"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium mb-1.5 block">Advanced Settings</label>
                <div className="space-y-3 bg-slate-800 p-3 rounded-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Auto-compound profits</span>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Dynamic position sizing</span>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">AI sentiment analysis</span>
                    <Switch defaultChecked />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Adaptive stop-loss</span>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 pt-2">
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Sparkles className="h-4 w-4 mr-2" />
                  Start Bot
                </Button>
                
                <Button variant="outline" className="w-full">
                  Save Configuration
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}