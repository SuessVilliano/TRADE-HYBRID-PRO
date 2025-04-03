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
  PiggyBank
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
          
          <TabsContent value="futures" className="h-full flex flex-col justify-center items-center p-6 text-center">
            <DollarSign className="h-10 w-10 text-blue-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">AI Futures Trading</h3>
            <p className="text-slate-400 text-sm mb-4">
              Access AI-powered futures trading with advanced risk management and leverage optimization
            </p>
            <Button variant="outline" className="bg-blue-900/20 border-blue-500/30 text-blue-400 hover:bg-blue-800/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </TabsContent>
          
          <TabsContent value="bot" className="h-full flex flex-col justify-center items-center p-6 text-center">
            <Brain className="h-10 w-10 text-purple-400 mb-4" />
            <h3 className="font-medium text-lg mb-2">AI Trading Bot</h3>
            <p className="text-slate-400 text-sm mb-4">
              Set up and manage automated trading bots powered by our advanced AI algorithms
            </p>
            <Button variant="outline" className="bg-purple-900/20 border-purple-500/30 text-purple-400 hover:bg-purple-800/30">
              <Sparkles className="h-4 w-4 mr-2" />
              Upgrade to Premium
            </Button>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}