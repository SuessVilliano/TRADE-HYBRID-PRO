import React, { useState, useEffect, useRef } from 'react';
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
import { Progress } from '@/components/ui/progress';

import { 
  ArrowUpRight, ArrowDownRight, RotateCw, Activity, Trash2, Calculator, 
  CheckSquare, Wallet, AlertTriangle, Shield, ArrowUpDown, RefreshCw, 
  BarChart, Zap, Sliders, ArrowRightLeft, Brain, Radiation, 
  CircleSlash, PieChart, Database, MemoryStick, ServerCrash, LineChart, 
  FileWarning, AlertCircle, CheckCircle2, Clock, Cpu
} from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { brokerService } from '@/lib/services/broker-service';
import { brokerAggregatorService } from '@/lib/services/broker-aggregator-service';
import { ABATEVIntegration } from './abatev-integration';
import { TRADING_SYMBOLS, ABATEV_CONFIG } from '@/lib/constants';

interface NexusPanelProps {
  defaultSymbol?: string;
}

export function NexusPanel({ defaultSymbol = 'BTC/USD' }: NexusPanelProps) {
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
  const [priceChange, setPriceChange] = useState<number>(0);
  const [priceHistory, setPriceHistory] = useState<number[]>([]);
  
  // Risk calculation
  const [calculatedQuantity, setCalculatedQuantity] = useState<number | null>(null);
  const [calculatedRiskAmount, setCalculatedRiskAmount] = useState<number | null>(null);
  const [riskRewardRatio, setRiskRewardRatio] = useState<number | null>(null);
  
  // AI risk assessment
  const [aiRiskScore, setAiRiskScore] = useState<number>(65);
  const [aiConfidence, setAiConfidence] = useState<number>(78);
  
  // Real-time signals
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null);
  
  // Connection status
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [executionSpeed, setExecutionSpeed] = useState<'normal' | 'fast' | 'ultra' | 'custom'>('normal');
  const [latency, setLatency] = useState<number>(45);
  
  // Animation values
  const latencyInterval = useRef<any>(null);
  const priceInterval = useRef<any>(null);
  
  // Tabs
  const [activeTab, setActiveTab] = useState('manual');
  
  // Preset configs
  const [selectedPreset, setSelectedPreset] = useState('default');
  
  // Order config
  const [orderConfig, setOrderConfig] = useState({
    reduceOnly: false,
    timeInForce: 'GTC',
    postOnly: false,
    leverage: 1,
    validateEntry: true,
    allowMultipleOrders: false,
    priority: 'price', // price, speed, reliability
  });
  
  // Initialize
  useEffect(() => {
    // Simulate latency changes
    latencyInterval.current = setInterval(() => {
      setLatency(prev => {
        const change = Math.random() > 0.5 
          ? Math.random() * 5 
          : -Math.random() * 5;
        return Math.max(20, Math.min(150, prev + change));
      });
      
      // Occasionally change connection status
      if (Math.random() > 0.95) {
        setConnectionStatus(prev => 
          prev === 'connected' ? 'connecting' : 'connected'
        );
      }
    }, 3000);
    
    // Simulate price changes
    priceInterval.current = setInterval(() => {
      setMarketPrice(prev => {
        const changePercent = (Math.random() - 0.48) * 0.008; // Slight bias upward
        const newPrice = prev * (1 + changePercent);
        
        // Add to price history
        setPriceHistory(history => {
          const newHistory = [...history, newPrice];
          if (newHistory.length > 30) {
            return newHistory.slice(1);
          }
          return newHistory;
        });
        
        setPriceChange(changePercent * 100);
        
        return newPrice;
      });
    }, 2000);
    
    // Load brokers
    const loadBrokers = async () => {
      try {
        const brokers = await brokerService.getAvailableBrokers();
        setAvailableBrokers(brokers);
        if (brokers.length > 0) {
          setActiveBroker(brokers[0].id);
        }
        
        setConnectionStatus('connected');
      } catch (error) {
        console.error("Failed to load brokers:", error);
        setConnectionStatus('disconnected');
      }
    };
    
    loadBrokers();
    
    // Mock broker if none available
    setTimeout(() => {
      if (availableBrokers.length === 0) {
        setAvailableBrokers([
          { id: 'alpaca', name: 'Alpaca', status: 'connected', type: 'stocks' },
          { id: 'binance', name: 'Binance', status: 'connected', type: 'crypto' },
          { id: 'kraken', name: 'Kraken', status: 'connected', type: 'crypto' },
          { id: 'oanda', name: 'Oanda', status: 'connected', type: 'forex' },
        ]);
        setActiveBroker('alpaca');
      }
    }, 1500);
    
    // Mock signals
    const mockSignals: TradeSignal[] = [
      {
        id: '1',
        symbol: 'BTC/USD',
        direction: 'buy',
        entryPrice: 49950,
        stopLoss: 49200,
        takeProfit: 51500,
        timestamp: new Date().getTime() - 1000 * 60 * 5,
        provider: 'Nexus™ AI',
        signal: 'strong_buy',
        confidence: 87,
      },
      {
        id: '2',
        symbol: 'ETH/USD',
        direction: 'sell',
        entryPrice: 2780,
        stopLoss: 2850,
        takeProfit: 2600,
        timestamp: new Date().getTime() - 1000 * 60 * 15,
        provider: 'Nexus™ AI',
        signal: 'sell',
        confidence: 72,
      },
      {
        id: '3',
        symbol: 'AAPL',
        direction: 'buy',
        entryPrice: 178.25,
        stopLoss: 175.80,
        takeProfit: 183.50,
        timestamp: new Date().getTime() - 1000 * 60 * 25,
        provider: 'Market Scanner',
        signal: 'buy',
        confidence: 81,
      },
    ];
    
    setSignals(mockSignals);
    
    return () => {
      // Clean up intervals
      if (latencyInterval.current) clearInterval(latencyInterval.current);
      if (priceInterval.current) clearInterval(priceInterval.current);
    };
  }, []);
  
  // Calculate risk-based position size
  useEffect(() => {
    if (entryPrice && stopLoss && risk) {
      try {
        const entry = parseFloat(entryPrice);
        const stop = parseFloat(stopLoss);
        const riskPercent = parseFloat(risk) / 100;
        
        // Mock account value
        const accountValue = 10000;
        
        const riskAmount = accountValue * riskPercent;
        setCalculatedRiskAmount(riskAmount);
        
        const priceDiff = Math.abs(entry - stop);
        if (priceDiff === 0) return;
        
        const positionSize = riskAmount / priceDiff;
        setCalculatedQuantity(positionSize);
        
        // Calculate R:R ratio if take profit is set
        if (takeProfit) {
          const tp = parseFloat(takeProfit);
          const riskPips = Math.abs(entry - stop);
          const rewardPips = Math.abs(tp - entry);
          setRiskRewardRatio(rewardPips / riskPips);
        }
      } catch (e) {
        console.error("Error calculating position size:", e);
      }
    }
  }, [entryPrice, stopLoss, takeProfit, risk]);
  
  // Update UI when selecting a signal
  useEffect(() => {
    if (selectedSignal) {
      setSymbol(selectedSignal.symbol);
      setTradeType(selectedSignal.direction as 'buy' | 'sell');
      setEntryPrice(selectedSignal.entryPrice.toString());
      setStopLoss(selectedSignal.stopLoss.toString());
      setTakeProfit(selectedSignal.takeProfit.toString());
      
      // Update AI confidence
      setAiConfidence(selectedSignal.confidence || 75);
      
      // Calculate AI risk score
      const riskScore = Math.round(
        100 - (Math.abs(selectedSignal.entryPrice - selectedSignal.stopLoss) / selectedSignal.entryPrice) * 1000
      );
      setAiRiskScore(Math.min(100, Math.max(0, riskScore)));
    }
  }, [selectedSignal]);
  
  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!entryPrice || !stopLoss) {
      toast.error("Error", {
        description: "Entry price and stop loss are required.",
      });
      return;
    }
    
    if (autoConfirm) {
      executeOrder();
    } else {
      setIsConfirmModalOpen(true);
    }
  };
  
  // Execute the order
  const executeOrder = async () => {
    if (!activeBroker) {
      toast.error("No broker selected", {
        description: "Please select a broker to execute the trade.",
      });
      return;
    }
    
    setOrderStatus('pending');
    setIsConfirmModalOpen(false);
    
    try {
      // Mock order execution
      await new Promise(resolve => setTimeout(resolve, 1200));
      
      // Success
      if (Math.random() > 0.1) { // 90% success rate
        setOrderStatus('filled');
        
        // Construct order data for further use or display
        const orderData = {
          symbol,
          side: tradeType,
          entryPrice: parseFloat(entryPrice),
          stopLoss: parseFloat(stopLoss),
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          quantity: calculatedQuantity || parseFloat(quantity),
          broker: activeBroker,
          timestamp: new Date().toISOString(),
          risk: parseFloat(risk),
          riskAmount: calculatedRiskAmount,
          riskRewardRatio,
          orderId: `ORD-${Math.floor(Math.random() * 1000000)}`,
          status: 'filled',
        };
        
        // Save to localStorage for ABATEV panel to use
        localStorage.setItem('nexus_trade_data', JSON.stringify({
          symbol,
          side: tradeType,
          entryPrice: parseFloat(entryPrice),
          stopLoss: parseFloat(stopLoss),
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          confidence: aiConfidence,
          provider: 'Nexus™ Platform',
        }));
        
        toast.success("Order Executed", {
          description: `${tradeType.toUpperCase()} ${calculatedQuantity?.toFixed(4) || quantity} ${symbol} @ ${entryPrice}`,
        });
        
      } else {
        // Rejection
        setOrderStatus('rejected');
        toast.error("Order Rejected", {
          description: "The broker rejected this order. Please check your parameters and try again.",
        });
      }
    } catch (error) {
      console.error("Order execution error:", error);
      setOrderStatus('rejected');
      toast.error("Execution Error", {
        description: "There was an error executing your order. Please try again.",
      });
    }
    
    // Reset after a delay
    setTimeout(() => {
      setOrderStatus('idle');
    }, 5000);
  };
  
  // Reset the form
  const resetForm = () => {
    setEntryPrice('');
    setStopLoss('');
    setTakeProfit('');
    setQuantity('');
    setSelectedSignal(null);
    setOrderStatus('idle');
    setIsConfirmModalOpen(false);
  };
  
  // Apply a signal
  const applySignal = (signal: TradeSignal) => {
    setSelectedSignal(signal);
    setActiveTab('manual'); // Switch to manual tab to display the details
  };
  
  // Get best order routing
  const getOptimalRoute = () => {
    return {
      broker: 'Aggregated (Nexus™)',
      price: marketPrice,
      latency: latency,
      slippage: 0.02,
      fee: 0.0015,
      rating: 9.8,
    };
  };
  
  // Toggle order config setting
  const toggleOrderConfig = (key: string) => {
    setOrderConfig(prev => ({
      ...prev,
      [key]: !prev[key as keyof typeof prev],
    }));
  };
  
  // Change execution speed preset
  const changeExecutionSpeed = (speed: 'normal' | 'fast' | 'ultra' | 'custom') => {
    setExecutionSpeed(speed);
    
    // Update latency display based on speed preset
    switch (speed) {
      case 'fast':
        setLatency(30);
        break;
      case 'ultra':
        setLatency(15);
        break;
      case 'normal':
        setLatency(50);
        break;
      case 'custom':
        // Keep current latency
        break;
    }
  };
  
  // Set config preset
  const applyPreset = (preset: string) => {
    setSelectedPreset(preset);
    
    switch (preset) {
      case 'scalping':
        setOrderConfig({
          reduceOnly: false,
          timeInForce: 'IOC',
          postOnly: true,
          leverage: 1,
          validateEntry: true,
          allowMultipleOrders: true,
          priority: 'speed',
        });
        changeExecutionSpeed('ultra');
        break;
      case 'conservative':
        setOrderConfig({
          reduceOnly: true,
          timeInForce: 'GTC',
          postOnly: true,
          leverage: 1,
          validateEntry: true,
          allowMultipleOrders: false,
          priority: 'price',
        });
        changeExecutionSpeed('normal');
        break;
      case 'aggressive':
        setOrderConfig({
          reduceOnly: false,
          timeInForce: 'GTC',
          postOnly: false,
          leverage: 3,
          validateEntry: false,
          allowMultipleOrders: true,
          priority: 'speed',
        });
        changeExecutionSpeed('fast');
        break;
      case 'default':
      default:
        setOrderConfig({
          reduceOnly: false,
          timeInForce: 'GTC',
          postOnly: false,
          leverage: 1,
          validateEntry: true,
          allowMultipleOrders: false,
          priority: 'price',
        });
        changeExecutionSpeed('normal');
    }
  };
  
  // Format price with appropriate decimal places
  const formatPrice = (price: number): string => {
    if (price > 1000) {
      return price.toFixed(2);
    } else if (price > 100) {
      return price.toFixed(3);
    } else if (price > 10) {
      return price.toFixed(4);
    } else if (price > 1) {
      return price.toFixed(5);
    } else {
      return price.toFixed(8);
    }
  };
  
  // Calculate level indications for AI score display
  const getAIScoreLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score < 40) return 'low';
    if (score < 70) return 'medium';
    return 'high';
  };
  
  // UI Colors for score levels
  const getScoreLevelColor = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'low':
        return 'text-red-500';
      case 'medium':
        return 'text-amber-500';
      case 'high':
        return 'text-green-500';
    }
  };
  
  // Calculate the market price change indicator
  const getPriceChangeIndicator = (): JSX.Element => {
    if (priceChange > 0) {
      return <ArrowUpRight className="h-4 w-4 text-green-500" />;
    } else if (priceChange < 0) {
      return <ArrowDownRight className="h-4 w-4 text-red-500" />;
    } else {
      return <ArrowRightLeft className="h-4 w-4 text-gray-500" />;
    }
  };
  
  // Fetch real signals
  useEffect(() => {
    const fetchSignals = async () => {
      console.log("Fetching real trading signals from API...");
      try {
        // Here would be an API call to your backend
        // const response = await fetch('/api/trading/signals');
        // const data = await response.json();
        // setSignals(data);
        
        // For now we use the mock data set in the first useEffect
      } catch (error) {
        console.error("Error fetching signals:", error);
      }
    };
    
    fetchSignals();
    
    // Poll for new signals every minute
    const intervalId = setInterval(fetchSignals, 60000);
    
    return () => clearInterval(intervalId);
  }, []);
  
  return (
    <Card className="shadow-lg border-t-4 border-t-blue-600 dark:border-t-blue-400">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg sm:text-xl flex items-center">
              <Shield className="mr-2 h-5 w-5 text-blue-500" />
              <span>Nexus™ Trade Panel</span>
            </CardTitle>
            <CardDescription>
              AI-driven trade execution and risk management
            </CardDescription>
          </div>
          
          {/* Connection status */}
          <div className="flex items-center gap-2">
            <div className="flex flex-col items-end">
              <Badge
                variant={connectionStatus === 'connected' ? "success" : 
                       connectionStatus === 'connecting' ? "outline" : "destructive"}
                className="text-xs"
              >
                {connectionStatus === 'connected' ? 'Connected' : 
                 connectionStatus === 'connecting' ? 'Connecting...' : 'Disconnected'}
              </Badge>
              <span className="text-xs text-muted-foreground mt-1">
                Latency: {Math.round(latency)}ms
              </span>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="manual" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="signals">Nexus™ Signals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          {/* Manual Trading Tab */}
          <TabsContent value="manual" className="space-y-4">
            <form onSubmit={handleSubmit}>
              {/* Market Information */}
              <div className="bg-muted/50 p-3 rounded-md mb-4 flex justify-between">
                <div>
                  <div className="text-sm font-medium">Current Market</div>
                  <div className="text-2xl font-bold flex items-center">
                    ${formatPrice(marketPrice)}
                    <span className="ml-2">{getPriceChangeIndicator()}</span>
                    <span className={`text-xs ml-1 ${priceChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {priceChange > 0 ? '+' : ''}{priceChange.toFixed(3)}%
                    </span>
                  </div>
                </div>
                
                <div>
                  <div className="text-sm font-medium">Routing</div>
                  <div className="flex items-center text-muted-foreground">
                    <select 
                      className="p-1 text-sm rounded bg-transparent border-none focus:ring-0"
                      value={activeBroker || ''}
                      onChange={(e) => setActiveBroker(e.target.value)}
                    >
                      <option value="">Select broker</option>
                      {availableBrokers.map(broker => (
                        <option key={broker.id} value={broker.id}>{broker.name}</option>
                      ))}
                      <option value="nexus">Nexus™ Smart Routing</option>
                    </select>
                  </div>
                </div>
              </div>
            
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Symbol */}
                <div className="col-span-1">
                  <Label htmlFor="symbol">Symbol</Label>
                  <select
                    id="symbol"
                    className="w-full p-2 border rounded bg-background"
                    value={symbol}
                    onChange={(e) => setSymbol(e.target.value)}
                  >
                    {TRADING_SYMBOLS.map((sym) => (
                      <option key={sym} value={sym}>{sym}</option>
                    ))}
                  </select>
                </div>
                
                {/* Trade Type */}
                <div className="col-span-1">
                  <Label>Direction</Label>
                  <div className="flex mt-1">
                    <Button
                      type="button"
                      variant={tradeType === 'buy' ? 'default' : 'outline'}
                      onClick={() => setTradeType('buy')}
                      className={`w-1/2 ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}`}
                    >
                      Buy
                    </Button>
                    <Button
                      type="button"
                      variant={tradeType === 'sell' ? 'default' : 'outline'}
                      onClick={() => setTradeType('sell')}
                      className={`w-1/2 ${tradeType === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}`}
                    >
                      Sell
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                {/* Entry Price */}
                <div className="col-span-1">
                  <Label htmlFor="entry-price">Entry Price</Label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-muted-foreground">$</span>
                    <Input
                      id="entry-price"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="pl-6"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(e.target.value)}
                    />
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="absolute right-0 top-0 h-full px-2 text-xs"
                      onClick={() => setEntryPrice(marketPrice.toString())}
                    >
                      Market
                    </Button>
                  </div>
                </div>
                
                {/* Quantity/Size */}
                <div className="col-span-1">
                  <Label htmlFor="quantity">
                    <div className="flex justify-between">
                      <span>Quantity</span>
                      {calculatedQuantity && (
                        <span className="text-xs text-muted-foreground">
                          Calculated: {calculatedQuantity.toFixed(4)}
                        </span>
                      )}
                    </div>
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="any"
                    placeholder={calculatedQuantity ? calculatedQuantity.toFixed(4) : "0.00"}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Stop Loss */}
                <div className="col-span-1">
                  <Label htmlFor="stop-loss">
                    Stop Loss
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-muted-foreground">$</span>
                    <Input
                      id="stop-loss"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="pl-6"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Take Profit */}
                <div className="col-span-1">
                  <Label htmlFor="take-profit">
                    Take Profit
                  </Label>
                  <div className="relative">
                    <span className="absolute left-2 top-2 text-muted-foreground">$</span>
                    <Input
                      id="take-profit"
                      type="number"
                      step="any"
                      placeholder="0.00"
                      className="pl-6"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                    />
                  </div>
                </div>
                
                {/* Risk % */}
                <div className="col-span-1">
                  <Label htmlFor="risk">
                    <div className="flex justify-between">
                      <span>Risk %</span>
                      {calculatedRiskAmount && (
                        <span className="text-xs text-muted-foreground">
                          ${calculatedRiskAmount.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </Label>
                  <div className="relative">
                    <Input
                      id="risk"
                      type="number"
                      step="0.1"
                      placeholder="1.0"
                      value={risk}
                      onChange={(e) => setRisk(e.target.value)}
                    />
                    <span className="absolute right-2 top-2 text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
              
              {/* R:R Ratio Display */}
              {riskRewardRatio && (
                <div className="mb-4 bg-muted/50 p-2 rounded flex justify-between">
                  <div>
                    <span className="text-sm font-medium">Risk/Reward Ratio:</span>
                    <span className={`ml-2 ${riskRewardRatio >= 1.5 ? 'text-green-500' : 'text-amber-500'}`}>
                      1:{riskRewardRatio.toFixed(2)}
                    </span>
                  </div>
                  {aiConfidence && (
                    <div>
                      <span className="text-sm font-medium">AI Confidence:</span>
                      <span className={`ml-2 ${getScoreLevelColor(getAIScoreLevel(aiConfidence))}`}>
                        {aiConfidence}%
                      </span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Auto Confirm Switch */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="auto-confirm"
                    checked={autoConfirm}
                    onCheckedChange={setAutoConfirm}
                  />
                  <Label htmlFor="auto-confirm">Auto Confirm Orders</Label>
                </div>
                
                <Badge variant={executionSpeed === 'ultra' ? 'default' : 'outline'} className="text-xs py-0">
                  <Clock className="h-3 w-3 mr-1" />
                  {executionSpeed === 'normal' ? 'Normal' : 
                   executionSpeed === 'fast' ? 'Fast' : 
                   executionSpeed === 'ultra' ? 'Ultra' : 'Custom'} Execution
                </Badge>
              </div>
              
              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className={`flex-1 ${tradeType === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
                  disabled={orderStatus === 'pending'}
                >
                  {orderStatus === 'pending' ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {tradeType === 'buy' ? 'Buy' : 'Sell'} {symbol}
                    </>
                  )}
                </Button>
                
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={resetForm}
                  disabled={orderStatus === 'pending'}
                >
                  <RotateCw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
            
            {/* Current Route Display */}
            <div className="mt-4 bg-muted/30 p-3 rounded border">
              <h4 className="text-sm font-medium mb-2 flex items-center">
                <Activity className="h-4 w-4 mr-1 text-blue-500" />
                Order Routing Information
              </h4>
              
              <div className="text-sm grid grid-cols-2 gap-x-4 gap-y-1">
                <div className="text-muted-foreground">Selected Route:</div>
                <div className="font-medium">{getOptimalRoute().broker}</div>
                
                <div className="text-muted-foreground">Expected Price:</div>
                <div className="font-medium">${formatPrice(getOptimalRoute().price)}</div>
                
                <div className="text-muted-foreground">Est. Slippage:</div>
                <div className="font-medium">{(getOptimalRoute().slippage * 100).toFixed(2)}%</div>
                
                <div className="text-muted-foreground">Priority:</div>
                <div className="font-medium capitalize">{orderConfig.priority}</div>
              </div>
              
              <div className="mt-2">
                <h4 className="text-sm font-medium">Nexus™ Routing Analysis</h4>
                <div className="flex items-center mt-1">
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ width: `${getOptimalRoute().rating * 10}%` }}
                    />
                  </div>
                  <span className="text-xs ml-2 text-blue-500 font-bold">{getOptimalRoute().rating}/10</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium flex items-center">
                <Zap className="h-4 w-4 mr-1 text-amber-500" />
                Nexus™ Signals
              </h3>
              
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs"
                onClick={() => console.log("Fetch new signals")}
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Refresh
              </Button>
            </div>
            
            {signals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="mx-auto h-8 w-8 mb-2" />
                <p>No signals available at this time.</p>
                <p className="text-sm">Check back later or adjust your signal preferences.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {signals.map((signal) => (
                  <div 
                    key={signal.id}
                    className={`
                      p-3 rounded-md border cursor-pointer
                      ${selectedSignal?.id === signal.id ? 'bg-muted border-blue-500' : 'hover:bg-muted/50'}
                    `}
                    onClick={() => applySignal(signal)}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-medium flex items-center">
                          {signal.direction === 'buy' ? (
                            <ArrowUpRight className="h-4 w-4 mr-1 text-green-500" />
                          ) : (
                            <ArrowDownRight className="h-4 w-4 mr-1 text-red-500" />
                          )}
                          {signal.symbol}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(signal.timestamp).toLocaleString()}
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Badge 
                          variant={
                            signal.signal === 'strong_buy' || signal.signal === 'strong_sell'
                              ? 'default'
                              : 'outline'
                          }
                          className={`
                            text-xs
                            ${signal.direction === 'buy' ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}
                          `}
                        >
                          {signal.signal.replace('_', ' ')}
                        </Badge>
                        <Badge className="ml-2 bg-blue-500/20 text-blue-600 text-xs">
                          {signal.confidence}%
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <span className="text-muted-foreground">Entry:</span>
                        <span className="ml-1 font-medium">${signal.entryPrice.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Stop:</span>
                        <span className="ml-1 font-medium">${signal.stopLoss.toFixed(2)}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Target:</span>
                        <span className="ml-1 font-medium">${signal.takeProfit.toFixed(2)}</span>
                      </div>
                    </div>
                    
                    <div className="mt-2 flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">{signal.provider}</span>
                      
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          applySignal(signal);
                        }}
                      >
                        Use Signal
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="mt-4 bg-muted/30 p-3 rounded border text-sm space-y-3">
              <h4 className="font-medium">Signal Information</h4>
              <p>
                Trade signals are generated using our proprietary multi-layered analysis system. 
                Each signal includes recommended entry, stop loss, and take profit levels.
              </p>
              <p>
                <strong>Signal Quality:</strong> Confidence scores above 80% indicate high conviction setups.
              </p>
            </div>
          </TabsContent>
          
          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-4">
            <div className="grid grid-cols-1 gap-4">
              {/* Execution Speed */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Execution Speed</h3>
                <RadioGroup 
                  value={executionSpeed} 
                  onValueChange={(value) => changeExecutionSpeed(value as any)}
                  className="flex space-x-2"
                >
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="normal" id="normal" />
                    <Label htmlFor="normal" className="text-sm">Normal</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="fast" id="fast" />
                    <Label htmlFor="fast" className="text-sm">Fast</Label>
                  </div>
                  <div className="flex items-center space-x-1">
                    <RadioGroupItem value="ultra" id="ultra" />
                    <Label htmlFor="ultra" className="text-sm">Ultra</Label>
                  </div>
                </RadioGroup>
                <div className="mt-2">
                  <Progress value={
                    executionSpeed === 'normal' ? 33 :
                    executionSpeed === 'fast' ? 66 :
                    executionSpeed === 'ultra' ? 100 : 33
                  } className="h-2" />
                </div>
              </div>
              
              {/* Trade Presets */}
              <div className="mb-4">
                <h3 className="text-sm font-medium mb-2">Trade Presets</h3>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    type="button"
                    variant={selectedPreset === 'default' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset('default')}
                    className="justify-start"
                  >
                    <CheckSquare className="h-4 w-4 mr-2" />
                    Default
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === 'conservative' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset('conservative')}
                    className="justify-start"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Conservative
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === 'aggressive' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset('aggressive')}
                    className="justify-start"
                  >
                    <Zap className="h-4 w-4 mr-2" />
                    Aggressive
                  </Button>
                  <Button
                    type="button"
                    variant={selectedPreset === 'scalping' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => applyPreset('scalping')}
                    className="justify-start"
                  >
                    <ArrowUpDown className="h-4 w-4 mr-2" />
                    Scalping
                  </Button>
                </div>
              </div>
              
              {/* Advanced Settings */}
              <div className="bg-muted/30 p-3 rounded border">
                <h3 className="text-sm font-medium mb-2">Advanced Settings</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="validate-entry" className="text-sm flex items-center">
                      <Activity className="h-3 w-3 mr-1" />
                      Validate Entry Price
                    </Label>
                    <Switch
                      id="validate-entry"
                      checked={orderConfig.validateEntry}
                      onCheckedChange={() => toggleOrderConfig('validateEntry')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-only" className="text-sm flex items-center">
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                      Reduce-Only Orders
                    </Label>
                    <Switch
                      id="reduce-only"
                      checked={orderConfig.reduceOnly}
                      onCheckedChange={() => toggleOrderConfig('reduceOnly')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-only" className="text-sm flex items-center">
                      <Database className="h-3 w-3 mr-1" />
                      Post-Only Orders
                    </Label>
                    <Switch
                      id="post-only"
                      checked={orderConfig.postOnly}
                      onCheckedChange={() => toggleOrderConfig('postOnly')}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="multiple-orders" className="text-sm flex items-center">
                      <Cpu className="h-3 w-3 mr-1" />
                      Allow Multiple Orders
                    </Label>
                    <Switch
                      id="multiple-orders"
                      checked={orderConfig.allowMultipleOrders}
                      onCheckedChange={() => toggleOrderConfig('allowMultipleOrders')}
                    />
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <Label htmlFor="priority" className="text-sm">Execution Priority</Label>
                    <select
                      id="priority"
                      className="w-full p-2 border rounded bg-background mt-1"
                      value={orderConfig.priority}
                      onChange={(e) => {
                        setOrderConfig({
                          ...orderConfig,
                          priority: e.target.value as any,
                        });
                      }}
                    >
                      <option value="price">Best Price</option>
                      <option value="speed">Fastest Execution</option>
                      <option value="reliability">Highest Reliability</option>
                    </select>
                  </div>
                  
                  <div>
                    <Label htmlFor="time-in-force" className="text-sm">Time In Force</Label>
                    <select
                      id="time-in-force"
                      className="w-full p-2 border rounded bg-background mt-1"
                      value={orderConfig.timeInForce}
                      onChange={(e) => {
                        setOrderConfig({
                          ...orderConfig,
                          timeInForce: e.target.value,
                        });
                      }}
                    >
                      <option value="GTC">Good Till Cancelled (GTC)</option>
                      <option value="IOC">Immediate or Cancel (IOC)</option>
                      <option value="FOK">Fill or Kill (FOK)</option>
                      <option value="GTD">Good Till Date (GTD)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

export default NexusPanel;