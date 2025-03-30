import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';

import { 
  ArrowUpRight, ArrowDownRight, RotateCw, Activity, Trash2, Calculator, 
  CheckSquare, Wallet, AlertTriangle, Shield, ArrowUpDown, RefreshCw, 
  BarChart, Zap, Sliders, ArrowRightLeft
} from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { brokerService } from '@/lib/services/broker-service';
import { brokerAggregatorService } from '@/lib/services/broker-aggregator-service';
import { ABATEVIntegration } from './abatev-integration';
import { TRADING_SYMBOLS, ABATEV_CONFIG } from '@/lib/constants';

interface ABATEVTradePanelProps {
  defaultSymbol?: string;
}

export function ABATEVTradePanel({ defaultSymbol = 'BTC/USD' }: ABATEVTradePanelProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [tradeType, setTradeType] = useState<'buy' | 'sell'>('buy');
  const [entryPrice, setEntryPrice] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [risk, setRisk] = useState<string>('1');
  const [quantity, setQuantity] = useState<string>('');
  const [autoConfirm, setAutoConfirm] = useState(false);

  // Current broker
  const [activeBroker, setActiveBroker] = useState<string | null>(null);
  const [availableBrokers, setAvailableBrokers] = useState<any[]>([]);

  // Signal processing
  const [orderStatus, setOrderStatus] = useState<'idle' | 'pending' | 'filled' | 'rejected'>('idle');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  
  // Market price simulation 
  const [marketPrice, setMarketPrice] = useState<number>(50000);
  
  // ABATEV optimization sliders
  const [priceImportance, setPriceImportance] = useState<number>(70);
  const [speedImportance, setSpeedImportance] = useState<number>(50);
  const [reliabilityImportance, setReliabilityImportance] = useState<number>(60);
  
  // Broker comparison data 
  const [brokerComparisonData, setBrokerComparisonData] = useState<any[]>([]);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [showBrokerDetails, setShowBrokerDetails] = useState<boolean>(false);
  
  // Load connected brokers
  useEffect(() => {
    const brokers = brokerService.getAllBrokers();
    setAvailableBrokers(brokers);
    
    if (brokers.length > 0 && !activeBroker) {
      setActiveBroker(brokers[0].id);
    }
    
    // Generate broker comparison data (real data would come from API)
    if (brokers.length > 0) {
      const comparisonData = brokers.map(broker => {
        let price: number = 0;
        let speed: number = 0;
        let reliability: number = 0;
        
        // Generate realistic comparison metrics based on broker type
        switch(broker.id) {
          case 'binance':
            price = 49950 + (Math.random() * 20); 
            speed = 45 + (Math.random() * 10); // ms
            reliability = 97 + (Math.random() * 2); // percent
            break;
          case 'coinbase':
            price = 50000 + (Math.random() * 25);
            speed = 65 + (Math.random() * 15); // ms
            reliability = 98 + (Math.random() * 1); // percent  
            break;
          case 'oanda':
            price = 49990 + (Math.random() * 30);
            speed = 55 + (Math.random() * 10); // ms
            reliability = 98.5 + (Math.random() * 1); // percent
            break;
          case 'alpaca':
            price = 49970 + (Math.random() * 35);
            speed = 60 + (Math.random() * 20); // ms
            reliability = 96 + (Math.random() * 3); // percent
            break;
          default:
            price = 50000 + (Math.random() * 50 - 25);
            speed = 75 + (Math.random() * 25); // ms
            reliability = 95 + (Math.random() * 4); // percent
        }
        
        // Calculate overall score based on slider weights
        const overallScore = 
          (price / 50000) * (priceImportance / 100) + 
          (100 - Math.min(speed, 100)) / 100 * (speedImportance / 100) + 
          (reliability / 100) * (reliabilityImportance / 100);
          
        return {
          id: broker.id,
          name: broker.name,
          price: price.toFixed(2),
          speed: Math.round(speed), // ms
          reliability: reliability.toFixed(1), // percent
          overallScore: (overallScore * 100 / 3).toFixed(1)
        };
      });
      
      // Sort by overall score descending
      const sortedData = [...comparisonData].sort((a, b) => 
        parseFloat(b.overallScore) - parseFloat(a.overallScore)
      );
      
      setBrokerComparisonData(sortedData);
      
      // Set the best broker as selected
      if (sortedData.length > 0) {
        setSelectedBroker(sortedData[0].id);
      }
    }
    
    // Simulate market price updates
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const change = (Math.random() * 50) - 25;
        return Math.max(1, prev + change);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, [priceImportance, speedImportance, reliabilityImportance]);
  
  // Subscribe to broker connection events
  useEffect(() => {
    const handleBrokerConnect = (broker: any) => {
      setAvailableBrokers(brokerService.getAllBrokers());
      if (!activeBroker) {
        setActiveBroker(broker.id);
      }
      toast.success(`Connected to ${broker.name}`, {
        description: 'You can now place trades with this broker.'
      });
    };
    
    brokerService.subscribe('connect', handleBrokerConnect);
    
    return () => {
      brokerService.unsubscribe('connect', handleBrokerConnect);
    };
  }, [activeBroker]);
  
  // Calculate position size based on risk
  const calculatePositionSize = () => {
    const entryPriceNum = Number(entryPrice) || marketPrice;
    const stopLossNum = Number(stopLoss);
    
    if (!stopLossNum) {
      toast.warning('Please enter a stop loss to calculate position size');
      return;
    }
    
    const riskAmount = 10000 * (parseFloat(risk) / 100); // Assuming $10,000 account
    const riskPerUnit = Math.abs(entryPriceNum - stopLossNum);
    const positionSize = riskAmount / riskPerUnit;
    
    setQuantity(positionSize.toFixed(4));
  };
  
  // Function to handle trade execution
  const executeTrade = () => {
    if (!activeBroker) {
      toast.error('No broker connected', {
        description: 'Please connect a broker before placing trades.'
      });
      return;
    }
    
    if (!entryPrice || !stopLoss || !takeProfit || !quantity) {
      toast.warning('Incomplete trade parameters', {
        description: 'Please fill in all trade parameters before executing.'
      });
      return;
    }
    
    // If auto-confirm is disabled, show confirmation modal
    if (!autoConfirm) {
      setIsConfirmModalOpen(true);
      return;
    }
    
    // Otherwise, directly execute the trade
    placeOrder();
  };
  
  // Function to place the order with the broker
  const placeOrder = () => {
    setOrderStatus('pending');
    setIsConfirmModalOpen(false);
    
    // Simulate order processing
    setTimeout(() => {
      setOrderStatus('filled');
      
      // Display success notification
      toast.success(`Order ${tradeType === 'buy' ? 'bought' : 'sold'} ${quantity} ${symbol}`, {
        description: `Executed at ${entryPrice || marketPrice}`
      });
      
      // Reset form after successful order
      setTimeout(() => {
        setOrderStatus('idle');
      }, 3000);
    }, 2000);
  };
  
  // Handle signal coming from the trading signals panel
  const handleSignalReceived = (signal: TradeSignal) => {
    setSymbol(signal.symbol);
    setTradeType(signal.type);
    setEntryPrice(signal.entry.toString());
    setStopLoss(signal.stopLoss.toString());
    setTakeProfit(signal.takeProfit.toString());
    setRisk(signal.risk.toString());
    calculatePositionSize();
    
    toast.info('Trade signal copied', {
      description: `${signal.symbol} ${signal.type.toUpperCase()} signal applied to the trade panel.`
    });
  };
  
  // Reset the form
  const resetForm = () => {
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit('');
    setQuantity('');
    setOrderStatus('idle');
  };
  
  // Update entry price with market price
  const useMarketPrice = () => {
    setEntryPrice(marketPrice.toFixed(2));
  };
  
  return (
    <Card className="w-full h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>ABATEV Smart Trading</CardTitle>
            <CardDescription>Advanced trade execution panel</CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="px-2 py-1">
              <Activity size={14} className="mr-1" />
              Market Price: ${marketPrice.toFixed(2)}
            </Badge>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="spot">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
            <TabsTrigger value="broker-comparison" className="text-xs">Comparison</TabsTrigger>
          </TabsList>
          
          <TabsContent value="spot" className="space-y-4">
            {/* Symbol and broker selection */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="symbol">Symbol</Label>
                <Input 
                  id="symbol" 
                  value={symbol} 
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="BTC/USD"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="broker">Broker</Label>
                <div className="flex gap-2">
                  <select 
                    id="broker"
                    className="flex h-10 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={activeBroker || ''}
                    onChange={(e) => setActiveBroker(e.target.value)}
                  >
                    <option value="" disabled>Select a broker</option>
                    {availableBrokers.map(broker => (
                      <option key={broker.id} value={broker.id}>
                        {broker.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            {/* Order type */}
            <div className="space-y-1.5">
              <Label>Order Type</Label>
              <RadioGroup 
                defaultValue="buy" 
                value={tradeType}
                onValueChange={(value) => setTradeType(value as 'buy' | 'sell')}
                className="flex gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="buy" id="buy" />
                  <Label htmlFor="buy" className="flex items-center text-green-600 font-semibold cursor-pointer">
                    <ArrowUpRight size={16} className="mr-1" /> Buy
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sell" id="sell" />
                  <Label htmlFor="sell" className="flex items-center text-red-600 font-semibold cursor-pointer">
                    <ArrowDownRight size={16} className="mr-1" /> Sell
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            {/* Price inputs */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="entry">Entry Price</Label>
                <div className="flex gap-2">
                  <Input 
                    id="entry" 
                    value={entryPrice} 
                    onChange={(e) => setEntryPrice(e.target.value)}
                    placeholder={marketPrice.toFixed(2)}
                  />
                  <Button variant="outline" size="icon" onClick={useMarketPrice}>
                    <RotateCw size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="stop-loss">Stop Loss</Label>
                <Input 
                  id="stop-loss" 
                  value={stopLoss} 
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="Stop Loss Price"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="take-profit">Take Profit</Label>
                <Input 
                  id="take-profit" 
                  value={takeProfit} 
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="Take Profit Price"
                />
              </div>
            </div>
            
            {/* Position sizing */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="risk">Risk (%)</Label>
                <Input 
                  id="risk" 
                  value={risk} 
                  onChange={(e) => setRisk(e.target.value)} 
                  placeholder="1"
                />
              </div>
              
              <div className="space-y-1.5">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input 
                    id="quantity" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    placeholder="0.0"
                  />
                  <Button variant="outline" title="Calculate position size" size="icon" onClick={calculatePositionSize}>
                    <Calculator size={16} />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-1.5">
                <Label className="flex items-center justify-between">
                  Auto-confirm
                  <span className="text-sm text-slate-400">Skip confirmation</span>
                </Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Switch
                    id="auto-confirm"
                    checked={autoConfirm}
                    onCheckedChange={setAutoConfirm}
                  />
                  <Label htmlFor="auto-confirm" className="text-sm">
                    {autoConfirm ? 'Enabled' : 'Disabled'}
                  </Label>
                </div>
              </div>
            </div>
            
            <Separator className="my-4" />
            
            {/* Trade execution buttons */}
            <div className="flex justify-between gap-2">
              <Button variant="outline" size="sm" onClick={resetForm}>
                <Trash2 size={16} className="mr-1" /> Reset
              </Button>
              
              <div className="flex gap-2">
                {orderStatus === 'pending' ? (
                  <Button className="w-32" disabled>
                    <RotateCw size={16} className="mr-2 animate-spin" /> Processing
                  </Button>
                ) : orderStatus === 'filled' ? (
                  <Button className="w-32 bg-green-600" disabled>
                    <CheckSquare size={16} className="mr-2" /> Executed
                  </Button>
                ) : (
                  <Button 
                    onClick={executeTrade}
                    className={tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700 w-32' : 'bg-red-600 hover:bg-red-700 w-32'}
                  >
                    <Wallet size={16} className="mr-2" />
                    {tradeType === 'buy' ? 'Buy' : 'Sell'}
                  </Button>
                )}
              </div>
            </div>
            
            {/* Warning if no broker is connected */}
            {!activeBroker && (
              <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-md border border-amber-200 dark:border-amber-800">
                <div className="flex items-center text-amber-800 dark:text-amber-400">
                  <AlertTriangle size={16} className="mr-2" />
                  <p className="text-sm">
                    No broker connected. Connect a broker to execute real trades.
                  </p>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="futures">
            <div className="p-8 text-center text-slate-500">
              Futures trading coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="options">
            <div className="p-8 text-center text-slate-500">
              Options trading coming soon
            </div>
          </TabsContent>
          
          <TabsContent value="broker-comparison">
            <div className="space-y-6">
              <div className="mb-4">
                <h3 className="text-lg font-medium">ABATEV Execution Optimization</h3>
                <p className="text-sm text-muted-foreground">
                  Set your priorities to optimize trade execution across connected brokers
                </p>
              </div>
              
              {/* Optimization sliders */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="price-slider" className="text-sm flex items-center">
                      <ArrowUpDown size={14} className="mr-1.5" /> Price Priority
                    </Label>
                    <span className="text-sm font-medium">{priceImportance}%</span>
                  </div>
                  <input
                    id="price-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={priceImportance}
                    onChange={(e) => setPriceImportance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-500">Prioritize getting the best possible price</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="speed-slider" className="text-sm flex items-center">
                      <Zap size={14} className="mr-1.5" /> Speed Priority
                    </Label>
                    <span className="text-sm font-medium">{speedImportance}%</span>
                  </div>
                  <input
                    id="speed-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={speedImportance}
                    onChange={(e) => setSpeedImportance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-500">Prioritize fastest execution speed</p>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="reliability-slider" className="text-sm flex items-center">
                      <Shield size={14} className="mr-1.5" /> Reliability Priority
                    </Label>
                    <span className="text-sm font-medium">{reliabilityImportance}%</span>
                  </div>
                  <input
                    id="reliability-slider"
                    type="range"
                    min="0"
                    max="100"
                    value={reliabilityImportance}
                    onChange={(e) => setReliabilityImportance(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-xs text-slate-500">Prioritize most reliable brokers</p>
                </div>
              </div>
              
              {/* Broker comparison table */}
              <div className="mt-6">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-medium">Broker Comparison</h3>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs h-7 px-2"
                    onClick={() => {
                      // Refresh broker data with current optimization settings
                      const brokers = brokerService.getAllBrokers();
                      setAvailableBrokers(brokers);
                    }}
                  >
                    <RefreshCw size={12} className="mr-1" /> Refresh
                  </Button>
                </div>
                
                <div className="rounded-md border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-slate-100 dark:bg-slate-800 border-b">
                        <th className="py-2 px-3 text-left font-medium">Rank</th>
                        <th className="py-2 px-3 text-left font-medium">Broker</th>
                        <th className="py-2 px-3 text-center font-medium">Price</th>
                        <th className="py-2 px-3 text-center font-medium">Latency</th>
                        <th className="py-2 px-3 text-center font-medium">Reliability</th>
                        <th className="py-2 px-3 text-center font-medium">Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {brokerComparisonData.map((broker, index) => (
                        <tr 
                          key={broker.id} 
                          className={`border-b ${
                            selectedBroker === broker.id 
                              ? 'bg-blue-50 dark:bg-blue-900/20' 
                              : (index % 2 === 0 ? 'bg-white dark:bg-slate-950' : 'bg-slate-50 dark:bg-slate-900')
                          }`}
                          onClick={() => setSelectedBroker(broker.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <td className="py-2 px-3 font-medium">
                            {index === 0 ? (
                              <Badge className="bg-green-600 hover:bg-green-700">Best</Badge>
                            ) : (
                              `#${index + 1}`
                            )}
                          </td>
                          <td className="py-2 px-3">{broker.name}</td>
                          <td className="py-2 px-3 text-center">${broker.price}</td>
                          <td className="py-2 px-3 text-center">{broker.speed} ms</td>
                          <td className="py-2 px-3 text-center">{broker.reliability}%</td>
                          <td className="py-2 px-3 text-center font-medium">
                            <span className={index === 0 ? 'text-green-600' : ''}>
                              {broker.overallScore}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                
                {selectedBroker && (
                  <div className="mt-4 p-3 rounded-md bg-slate-50 dark:bg-slate-900 border">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="text-sm font-medium flex items-center">
                        <BarChart size={14} className="mr-1.5" /> Execution Advantage Analysis
                      </h4>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 px-2"
                        onClick={() => setShowBrokerDetails(!showBrokerDetails)}
                      >
                        {showBrokerDetails ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    
                    {showBrokerDetails && (
                      <div className="space-y-2 mt-2 text-xs">
                        <p className="flex justify-between">
                          <span>Trading pair:</span>
                          <span className="font-medium">{symbol}</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Price advantage over market average:</span>
                          <span className={Math.random() > 0.5 ? 'text-green-600' : 'text-red-600'}>
                            {(Math.random() * 0.05).toFixed(4)}%
                          </span>
                        </p>
                        <p className="flex justify-between">
                          <span>Execution time:</span>
                          <span className="font-medium">{Math.floor(Math.random() * 50) + 30} ms</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Slippage probability:</span>
                          <span className="font-medium">{(Math.random() * 2).toFixed(2)}%</span>
                        </p>
                        <p className="flex justify-between">
                          <span>Annualized cost savings:</span>
                          <span className="text-green-600 font-medium">$1,250.45</span>
                        </p>
                      </div>
                    )}
                    
                    <div className="flex gap-2 mt-3">
                      <Button 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          setActiveBroker(selectedBroker);
                          toast.success('Broker selected for execution', {
                            description: 'This broker will be used for your next trade.'
                          });
                        }}
                      >
                        <ArrowRightLeft size={12} className="mr-1" /> Use This Broker
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="text-xs"
                        onClick={() => {
                          // Auto-optimize trade settings based on selected broker
                          toast.info('Trade parameters optimized', {
                            description: 'Settings adjusted for optimal execution with selected broker.'
                          });
                        }}
                      >
                        <Sliders size={12} className="mr-1" /> Optimize Settings
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* New tabs for showing the broker comparison view */}
        <div className="flex justify-end mt-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs"
            onClick={() => {
              const tab = document.querySelector('[data-value="broker-comparison"]') as HTMLElement;
              if (tab) tab.click();
            }}
          >
            <BarChart size={14} className="mr-1" /> View Broker Comparison
          </Button>
        </div>
      </CardContent>
      
      {/* This component listens for copied signals */}
      <ABATEVIntegration onSignalReceived={handleSignalReceived} />
    </Card>
  );
}

export default ABATEVTradePanel;