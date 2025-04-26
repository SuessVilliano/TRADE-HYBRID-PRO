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
import NexusStatusPanel from '@/components/trade/NexusStatusPanel';

// Type for trade data
interface TradeData {
  symbol: string;
  side: 'buy' | 'sell';
  entryPrice: number;
  stopLoss: number;
  takeProfit?: number;     // For backward compatibility
  takeProfit1?: number;    // Primary take profit level
  takeProfit2?: number;    // Secondary take profit level
  takeProfit3?: number;    // Tertiary take profit level
  targetTakeProfit?: number; // Selected take profit target
  confidence?: number;
  provider?: string;
}

export default function NexusPanelPage() {
  const [activeTab, setActiveTab] = useState('trade');
  const [isLoaded, setIsLoaded] = useState(false);
  const [tradeData, setTradeData] = useState<TradeData | null>(null);
  
  // Load trade data from localStorage if available
  useEffect(() => {
    try {
      const storedData = localStorage.getItem('abatev_trade_data');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        
        // Ensure takeProfit field is set properly
        if (!parsedData.takeProfit && parsedData.takeProfit1) {
          parsedData.takeProfit = parsedData.takeProfit1;
        }
        
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
  
  // Verify trade data according to Nexus methodology
  const verifyTradeNexusCriteria = () => {
    if (!tradeData) return { pass: false, message: 'No trade data available' };
    
    // Advanced verification logic - checks various risk management criteria
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
      message: 'Trade meets Nexus™ risk management criteria' 
    };
  };
  
  // Calculate risk/reward ratio
  const calculateRiskReward = () => {
    if (!tradeData) return 0;
    
    const { entryPrice, stopLoss, side } = tradeData;
    // Use takeProfit1 as fallback if takeProfit is not available
    const takeProfitValue = tradeData.takeProfit || tradeData.takeProfit1 || 0;
    
    if (side === 'buy') {
      const risk = entryPrice - stopLoss;
      const reward = takeProfitValue - entryPrice;
      return risk !== 0 ? reward / risk : 0;
    } else {
      const risk = stopLoss - entryPrice;
      const reward = entryPrice - takeProfitValue;
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
  
  // Execute trade with Nexus
  const executeTrade = () => {
    if (!tradeData) return;
    
    // Verify Nexus criteria first
    const verification = verifyTradeNexusCriteria();
    
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
          description: `${tradeData.symbol} ${tradeData.side.toUpperCase()} order placed via Nexus™ smart routing`,
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
              <h1 className="text-2xl font-bold">Nexus™ Smart Trade Panel</h1>
              <p className="text-slate-400">Intelligent Broker Aggregation & Smart Order Routing</p>
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
                        Select a trading signal from the Trading Signals panel and click "Trade with Nexus™" to load trade data.
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
                              value={(tradeData.takeProfit || tradeData.takeProfit1 || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} 
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
                      
                      {/* Nexus Verification */}
                      <div>
                        <h3 className="font-medium mb-3">Nexus™ Verification</h3>
                        <div className="bg-slate-850 border border-slate-700 rounded-md p-4">
                          <div className="flex items-center mb-3">
                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                              verifyTradeNexusCriteria().pass
                                ? 'bg-green-950/40 text-green-400'
                                : 'bg-red-950/40 text-red-400'
                            }`}>
                              {verifyTradeNexusCriteria().pass ? (
                                <Check className="h-5 w-5" />
                              ) : (
                                <X className="h-5 w-5" />
                              )}
                            </div>
                            <div className="ml-3">
                              <h4 className="font-medium">Verification Result</h4>
                              <p className={`text-sm ${
                                verifyTradeNexusCriteria().pass
                                  ? 'text-green-400'
                                  : 'text-red-400'
                              }`}>
                                {verifyTradeNexusCriteria().message}
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
                                <span className="text-sm font-medium">Risk Management</span>
                              </div>
                              <p className="text-xs text-slate-400">Maximum 2.5% stop loss</p>
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
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            <div>
              <Tabs defaultValue="status" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="status">Status</TabsTrigger>
                  <TabsTrigger value="routes">Routes</TabsTrigger>
                  <TabsTrigger value="config">Config</TabsTrigger>
                </TabsList>
                
                <TabsContent value="status" className="mt-4">
                  <NexusStatusPanel />
                </TabsContent>
                
                <TabsContent value="routes" className="mt-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle>Route Analysis</CardTitle>
                      <CardDescription>Smart order routing options</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {!tradeData ? (
                        <div className="text-center py-4 border border-dashed border-slate-700 rounded-md">
                          <p className="text-slate-400 text-sm">No trade data available for routing</p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div>
                            <Label>Execution Strategy</Label>
                            <Select defaultValue="optimal">
                              <SelectTrigger className="mt-1 bg-slate-900">
                                <SelectValue placeholder="Select strategy" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="best_price">Best Price (Nexus™ auto-route)</SelectItem>
                                <SelectItem value="minimal_impact">Minimal Market Impact</SelectItem>
                                <SelectItem value="fastest_fill">Fastest Fill</SelectItem>
                                <SelectItem value="smart_split">Smart Split (Multi-venue)</SelectItem>
                              </SelectContent>
                            </Select>
                            <p className="text-xs text-slate-400 mt-1">Determines how orders are routed and executed</p>
                          </div>
                          
                          <div className="pt-2">
                            <div className="flex items-center justify-between mb-2">
                              <Label>Available Routes</Label>
                              <Badge variant="outline" className="text-xs">Connected</Badge>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-md">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">Alpaca Securities</span>
                                </div>
                                <Badge variant="default" className="bg-green-600 hover:bg-green-700">Best Price</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-md">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">Interactive Brokers</span>
                                </div>
                                <Badge variant="outline">Ready</Badge>
                              </div>
                              
                              <div className="flex items-center justify-between py-2 px-3 bg-slate-900 rounded-md opacity-60">
                                <div className="flex items-center">
                                  <span className="text-sm font-medium">TradeStation</span>
                                </div>
                                <Badge variant="outline" className="bg-slate-800">Disconnected</Badge>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="config" className="mt-4">
                  <Card className="bg-slate-800 border-slate-700">
                    <CardHeader>
                      <CardTitle className="text-base">Nexus™ Info</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <p className="text-slate-400">
                        Nexus™ is our proprietary intelligent broker aggregation and smart order routing system that provides:
                      </p>
                      <ul className="list-disc pl-5 text-slate-400 space-y-1.5">
                        <li>Best execution across multiple venues</li>
                        <li>Price improvement through smart routing</li>
                        <li>Advanced risk management checks</li>
                        <li>Automatic verification of trade parameters</li>
                        <li>Optimized execution strategies</li>
                      </ul>
                      
                      <div className="pt-4">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="auto-verification">Auto Trade Verification</Label>
                            <Switch id="auto-verification" defaultChecked />
                          </div>
                          <p className="text-xs text-slate-500">Automatically verify all trades against risk management criteria</p>
                        </div>
                        
                        <div className="space-y-3 pt-4">
                          <div className="flex items-center justify-between">
                            <Label htmlFor="smart-routing">Smart Order Routing</Label>
                            <Switch id="smart-routing" defaultChecked />
                          </div>
                          <p className="text-xs text-slate-500">Route orders to the venue with the best execution quality</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </TradingDashboardLayout>
  );
}