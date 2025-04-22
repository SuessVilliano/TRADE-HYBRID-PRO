import React, { useState, useEffect } from 'react';
import { TradingDashboardLayout } from '@/components/ui/trading-dashboard-layout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import {
  ArrowDownRight,
  ArrowUpRight,
  ChevronRight,
  CircleCheck,
  FileCheck,
  FileWarning,
  HelpCircle,
  Info,
  BarChart,
  Loader2,
  Check,
  X
} from 'lucide-react';
import { ABATEVTradePanel } from '@/components/trade/abatev-trade-panel';
import ABATEVStatusPanel from '@/components/trade/ABATEVStatusPanel';

// Type for trade data
interface TradeData {
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  confidence?: number;
  provider?: string;
}

export default function ABATEVPanelPage() {
  const [activeTab, setActiveTab] = useState('trade');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  
  // Load trade data from localStorage if available
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('abatev_trade_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        setTradeData(parsedData);
        
        // Show info toast
        toast.info('Trade data loaded', {
          description: `${parsedData.symbol} ${parsedData.side.toUpperCase()} signal loaded from trading panel`,
          duration: 3000
        });
      }
      
      setIsLoaded(true);
    } catch (error) {
      console.error('Error loading trade data:', error);
      setIsLoaded(true);
    }
  }, []);
  
  // Verify trade data according to ABATEV methodology
  const verifyABATEVCriteria = () => {
    if (!tradeData) return { pass: false, message: 'No trade data available' };
    
    // Mock verification logic - in a real implementation, this would check various criteria
    const riskReward = calculateRiskReward();
    
    // Check if risk/reward ratio is acceptable
    if (riskReward < 1.5) {
      return { 
        pass: false, 
        message: `Risk/reward ratio (${riskReward}) is below the minimum threshold of 1.5` 
      };
    }
    
    // Check if stop loss is too far from entry (simulating risk management check)
    const stopLossPercentage = calculateStopLossPercentage();
    if (stopLossPercentage > 2.5) {
      return { 
        pass: false, 
        message: `Stop loss (${stopLossPercentage.toFixed(2)}%) exceeds maximum risk threshold of 2.5%` 
      };
    }
    
    // All checks passed
    return { 
      pass: true, 
      message: 'Trade meets ABATEV criteria' 
    };
  };
  
  // Calculate risk/reward ratio
  const calculateRiskReward = () => {
    if (!tradeData) return 0;
    
    const { entryPrice, stopLoss, takeProfit, side } = tradeData;
    
    if (side === 'buy') {
      const risk = entryPrice - stopLoss;
      const reward = takeProfit - entryPrice;
      return risk !== 0 ? reward / risk : 0;
    } else {
      const risk = stopLoss - entryPrice;
      const reward = entryPrice - takeProfit;
      return risk !== 0 ? reward / risk : 0;
    }
  };
  
  // Calculate stop loss percentage
  const calculateStopLossPercentage = () => {
    if (!tradeData) return 0;
    
    const { entryPrice, stopLoss, side } = tradeData;
    
    if (side === 'buy') {
      return ((entryPrice - stopLoss) / entryPrice) * 100;
    } else {
      return ((stopLoss - entryPrice) / entryPrice) * 100;
    }
  };
  
  // Execute trade with ABATEV
  const executeTrade = () => {
    if (!tradeData) return;
    
    // Verify ABATEV criteria first
    const verification = verifyABATEVCriteria();
    
    if (!verification.pass) {
      toast.error('Trade verification failed', {
        description: verification.message,
        duration: 5000
      });
      return;
    }
    
    // Show loading toast
    toast.loading('Executing trade...', {
      duration: 2000,
      onAutoClose: (t) => {
        // After loading toast closes, show success toast
        toast.success('Trade executed successfully', {
          description: `${tradeData.symbol} ${tradeData.side.toUpperCase()} order placed via ABATEV system`,
          duration: 4000
        });
      }
    });
  };
  
  return (
    <TradingDashboardLayout>
      <div className="container mx-auto py-6">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-2xl font-bold">ABATEV Smart Trade Panel</h1>
              <p className="text-slate-400">Advanced Broker Aggregation Trade Execution Vertex</p>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => window.history.back()}>
                <ChevronRight className="h-4 w-4 rotate-180" />
                Back
              </Button>
              
              <Button 
                variant="default" 
                size="sm" 
                className="gap-2 bg-purple-600 hover:bg-purple-700"
                onClick={executeTrade}
                disabled={!tradeData || !isLoaded}
              >
                {tradeData && tradeData.side === 'buy' ? (
                  <ArrowUpRight className="h-4 w-4" />
                ) : (
                  <ArrowDownRight className="h-4 w-4" />
                )}
                Execute Trade
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="bg-slate-800 border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Trade Analysis</span>
                    {tradeData && (
                      <Badge variant={tradeData.side === 'buy' ? 'success' : 'destructive'} className="uppercase">
                        {tradeData.side}
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    {tradeData ? (
                      <span className="text-lg font-semibold">{tradeData.symbol}</span>
                    ) : (
                      'No trade selected'
                    )}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  {!isLoaded ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                    </div>
                  ) : !tradeData ? (
                    <div className="text-center p-8 border border-dashed border-slate-700 rounded-md">
                      <FileWarning className="h-12 w-12 mx-auto text-slate-500 mb-3" />
                      <h3 className="font-medium text-lg mb-2">No Trade Data Available</h3>
                      <p className="text-slate-400 text-sm mb-4">
                        Select a trading signal from the Trading Signals panel and click "Trade with ABATEV" to load trade data.
                      </p>
                      <Button variant="outline" size="sm" onClick={() => window.location.href = '/signals'}>
                        Go to Signals
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Trade parameters */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="symbol">Symbol</Label>
                            <Input 
                              id="symbol" 
                              value={tradeData.symbol} 
                              readOnly 
                              className="mt-1 bg-slate-900"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="entry">Entry Price</Label>
                            <Input 
                              id="entry" 
                              value={tradeData.entryPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
                              readOnly 
                              className="mt-1 bg-slate-900"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="stop">Stop Loss</Label>
                            <Input 
                              id="stop" 
                              value={tradeData.stopLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
                              readOnly 
                              className="mt-1 bg-slate-900"
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div>
                            <Label htmlFor="side">Side</Label>
                            <Input 
                              id="side" 
                              value={tradeData.side.toUpperCase()} 
                              readOnly 
                              className={`mt-1 ${
                                tradeData.side === 'buy' 
                                  ? 'bg-green-950/40 text-green-400 border-green-800/50' 
                                  : 'bg-red-950/40 text-red-400 border-red-800/50'
                              }`}
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="tp">Take Profit</Label>
                            <Input 
                              id="tp" 
                              value={tradeData.takeProfit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
                              readOnly 
                              className="mt-1 bg-slate-900"
                            />
                          </div>
                          
                          <div>
                            <Label htmlFor="rr">Risk/Reward Ratio</Label>
                            <Input 
                              id="rr" 
                              value={calculateRiskReward().toFixed(2)} 
                              readOnly 
                              className={`mt-1 ${
                                calculateRiskReward() >= 1.5 
                                  ? 'bg-green-950/40 text-green-400 border-green-800/50' 
                                  : 'bg-amber-950/40 text-amber-400 border-amber-800/50'
                              }`}
                            />
                          </div>
                        </div>
                      </div>
                      
                      <Separator />
                      
                      {/* ABATEV Verification */}
                      <div>
                        <h3 className="font-medium mb-3">ABATEV Verification</h3>
                        <div className="bg-slate-850 border border-slate-700 rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              verifyABATEVCriteria().pass
                                ? 'bg-green-950/40 text-green-400'
                                : 'bg-red-950/40 text-red-400'
                            }`}>
                              {verifyABATEVCriteria().pass ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <X className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium">Verification Result</h4>
                              <p className={`text-sm ${
                                verifyABATEVCriteria().pass
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}>
                                {verifyABATEVCriteria().message}
                              </p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-slate-900 rounded-md p-3">
                              <div className="flex items-center mb-2">
                                <CircleCheck className={`h-4 w-4 mr-2 ${
                                  calculateRiskReward() >= 1.5
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`} />
                                <span className="text-sm font-medium">Risk/Reward Check</span>
                              </div>
                              <p className="text-xs text-slate-400">Minimum ratio of 1.5 required</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs">Actual: {calculateRiskReward().toFixed(2)}</span>
                                <span className={`text-xs ${
                                  calculateRiskReward() >= 1.5
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}>
                                  {calculateRiskReward() >= 1.5 ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-900 rounded-md p-3">
                              <div className="flex items-center mb-2">
                                <CircleCheck className={`h-4 w-4 mr-2 ${
                                  calculateStopLossPercentage() <= 2.5
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`} />
                                <span className="text-sm font-medium">Risk Management Check</span>
                              </div>
                              <p className="text-xs text-slate-400">Maximum stop loss of 2.5% allowed</p>
                              <div className="mt-2 flex items-center justify-between">
                                <span className="text-xs">Actual: {calculateStopLossPercentage().toFixed(2)}%</span>
                                <span className={`text-xs ${
                                  calculateStopLossPercentage() <= 2.5
                                    ? 'text-green-400'
                                    : 'text-red-400'
                                }`}>
                                  {calculateStopLossPercentage() <= 2.5 ? 'PASS' : 'FAIL'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Trade Execution Controls */}
                      <div>
                        <h3 className="font-medium mb-3">Execution Settings</h3>
                        <div className="bg-slate-850 border border-slate-700 rounded-md p-4 grid gap-4">
                          <div>
                            <Label htmlFor="broker">Execution Broker</Label>
                            <Select defaultValue="best_price">
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Broker" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="best_price">Best Price (ABATEV auto-route)</SelectItem>
                                <SelectItem value="alpaca">Alpaca</SelectItem>
                                <SelectItem value="oanda">OANDA</SelectItem>
                                <SelectItem value="ib">Interactive Brokers</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="order_type">Order Type</Label>
                            <Select defaultValue="market">
                              <SelectTrigger className="mt-1">
                                <SelectValue placeholder="Select Order Type" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="market">Market</SelectItem>
                                <SelectItem value="limit">Limit</SelectItem>
                                <SelectItem value="stop">Stop</SelectItem>
                                <SelectItem value="stop_limit">Stop Limit</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                              <Label htmlFor="auto_sl_tp">Auto SL/TP</Label>
                              <span className="text-xs text-slate-400">Automatically set stop loss and take profit</span>
                            </div>
                            <Switch id="auto_sl_tp" defaultChecked />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="flex justify-between pt-2 border-t border-slate-700">
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1"
                    onClick={() => localStorage.removeItem('abatev_trade_data')}
                    disabled={!tradeData}
                  >
                    <X className="h-4 w-4" />
                    Clear Data
                  </Button>
                  
                  <Button
                    variant="default"
                    size="sm"
                    className="gap-1 bg-purple-600 hover:bg-purple-700"
                    onClick={executeTrade}
                    disabled={!tradeData || !verifyABATEVCriteria().pass}
                  >
                    {tradeData && tradeData.side === 'buy' ? (
                      <ArrowUpRight className="h-4 w-4" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4" />
                    )}
                    Execute Trade
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <ABATEVStatusPanel />
              
              <Card className="bg-slate-800 border-slate-700 mt-6">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">ABATEV Info</CardTitle>
                </CardHeader>
                <CardContent className="text-sm">
                  <p className="text-slate-300 mb-3">
                    <strong>A</strong>dvanced <strong>B</strong>roker <strong>A</strong>ggregation <strong>T</strong>rade <strong>E</strong>xecution <strong>V</strong>ertex is a proprietary system that provides:
                  </p>
                  <ul className="space-y-2 text-slate-400">
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">A</span>
                      <span>Advanced risk analysis and trade verification</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">B</span>
                      <span>Best execution routing across multiple brokers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">A</span>
                      <span>Automated risk management compliance</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">T</span>
                      <span>Trade execution with intelligent order routing</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">E</span>
                      <span>Enhanced execution speed with latency optimization</span>
                    </li>
                    <li className="flex items-start">
                      <span className="bg-purple-900/30 text-purple-400 rounded-full h-5 w-5 flex items-center justify-center mr-2 mt-0.5">V</span>
                      <span>Verification and compliance with trading rules</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TradingDashboardLayout>
  );
}