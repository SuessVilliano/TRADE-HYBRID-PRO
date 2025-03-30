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

import { ArrowUpRight, ArrowDownRight, RotateCw, Activity, Trash2, Calculator, CheckSquare, Wallet, AlertTriangle } from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { brokerService } from '@/lib/services/broker-service';
import { ABATEVIntegration } from './abatev-integration';

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
  
  // Load connected brokers
  useEffect(() => {
    const brokers = brokerService.getAllBrokers();
    setAvailableBrokers(brokers);
    
    if (brokers.length > 0 && !activeBroker) {
      setActiveBroker(brokers[0].id);
    }
    
    // Simulate market price updates
    const interval = setInterval(() => {
      setMarketPrice(prev => {
        const change = (Math.random() * 50) - 25;
        return Math.max(1, prev + change);
      });
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);
  
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
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="spot">Spot</TabsTrigger>
            <TabsTrigger value="futures">Futures</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
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
        </Tabs>
      </CardContent>
      
      {/* This component listens for copied signals */}
      <ABATEVIntegration onSignalReceived={handleSignalReceived} />
    </Card>
  );
}

export default ABATEVTradePanel;