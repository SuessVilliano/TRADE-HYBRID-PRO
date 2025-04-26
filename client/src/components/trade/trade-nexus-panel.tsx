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

interface TradeNexusPanelProps {
  defaultSymbol?: string;
}

export function TradeNexusPanel({ defaultSymbol = 'BTC/USD' }: TradeNexusPanelProps) {
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
        provider: 'TradeNexus™ AI',
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
        provider: 'TradeNexus™ AI',
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
        localStorage.setItem('abatev_trade_data', JSON.stringify({
          symbol,
          side: tradeType,
          entryPrice: parseFloat(entryPrice),
          stopLoss: parseFloat(stopLoss),
          takeProfit: takeProfit ? parseFloat(takeProfit) : undefined,
          confidence: aiConfidence,
          provider: 'TradeNexus™ Platform',
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
      broker: 'Aggregated (TradeNexus™)',
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
      return <ArrowRightLeft className="h-4 w-4 text-slate-500" />;
    }
  };
  
  // Get connection status indicator
  const getConnectionStatusIndicator = (): JSX.Element => {
    switch (connectionStatus) {
      case 'connected':
        return <Badge variant="success" className="gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Connected</Badge>;
      case 'connecting':
        return <Badge variant="outline" className="gap-1 text-xs"><Clock className="h-3 w-3 animate-spin" /> Connecting</Badge>;
      case 'disconnected':
        return <Badge variant="destructive" className="gap-1 text-xs"><CircleSlash className="h-3 w-3" /> Disconnected</Badge>;
    }
  };
  
  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-blue-800 to-indigo-900 pb-6">
        <div className="flex justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <span>TradeNexus™ Trade Panel</span>
            </CardTitle>
            <CardDescription className="text-blue-100 mt-1">
              Smart Order Routing with Broker Aggregation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {getConnectionStatusIndicator()}
            <div>
              <Badge variant="outline" className="bg-blue-700/50 border-blue-600 text-blue-100">
                <Cpu className="h-3 w-3 mr-1" /> Latency: {latency.toFixed(0)}ms
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            <TabsTrigger value="signals">TradeNexus™ Signals</TabsTrigger>
            <TabsTrigger value="settings">Execution Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="manual" className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="symbol">Symbol</Label>
                    <div className="relative mt-1">
                      <select 
                        id="symbol"
                        className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                      >
                        {TRADING_SYMBOLS.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none">
                        <ArrowUpDown className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <Label>Trade Type</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        type="button"
                        variant={tradeType === 'buy' ? 'default' : 'outline'}
                        className={`gap-2 ${tradeType === 'buy' ? 'bg-green-700 hover:bg-green-600 text-white' : ''}`}
                        onClick={() => setTradeType('buy')}
                      >
                        <ArrowUpRight className="h-4 w-4" />
                        Buy / Long
                      </Button>
                      
                      <Button
                        type="button"
                        variant={tradeType === 'sell' ? 'default' : 'outline'}
                        className={`gap-2 ${tradeType === 'sell' ? 'bg-red-700 hover:bg-red-600 text-white' : ''}`}
                        onClick={() => setTradeType('sell')}
                      >
                        <ArrowDownRight className="h-4 w-4" />
                        Sell / Short
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="entry-price">Entry Price</Label>
                    <div className="relative mt-1">
                      <Input
                        id="entry-price"
                        type="number"
                        step="any"
                        placeholder={formatPrice(marketPrice)}
                        value={entryPrice}
                        onChange={(e) => setEntryPrice(e.target.value)}
                        className="pr-20"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 text-xs font-mono"
                        onClick={() => setEntryPrice(formatPrice(marketPrice))}
                      >
                        <RotateCw className="h-3 w-3 mr-1" />
                        Market
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="stop-loss">
                      <span className="flex items-center gap-1">
                        <AlertTriangle className="h-3.5 w-3.5 text-red-500" />
                        Stop Loss
                      </span>
                    </Label>
                    <Input
                      id="stop-loss"
                      type="number"
                      step="any"
                      placeholder={tradeType === 'buy' 
                        ? `${formatPrice(marketPrice * 0.98)}` 
                        : `${formatPrice(marketPrice * 1.02)}`}
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="take-profit">
                      <span className="flex items-center gap-1">
                        <CheckSquare className="h-3.5 w-3.5 text-green-500" />
                        Take Profit
                      </span>
                    </Label>
                    <Input
                      id="take-profit"
                      type="number"
                      step="any"
                      placeholder={tradeType === 'buy' 
                        ? `${formatPrice(marketPrice * 1.05)}` 
                        : `${formatPrice(marketPrice * 0.95)}`}
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="risk-percent">Risk (% of Account)</Label>
                    <div className="relative mt-1">
                      <Input
                        id="risk-percent"
                        type="number" 
                        min="0.1"
                        max="5"
                        step="0.1"
                        placeholder="1"
                        value={risk}
                        onChange={(e) => setRisk(e.target.value)}
                      />
                      <span className="absolute right-3 top-2.5 text-slate-400">%</span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="position-size">Position Size</Label>
                    <div className="mt-1 flex items-center gap-2">
                      <div className="relative flex-1">
                        <Input
                          id="position-size"
                          type="number"
                          placeholder="Auto"
                          value={quantity}
                          onChange={(e) => setQuantity(e.target.value)}
                          disabled={!!calculatedQuantity}
                        />
                        {calculatedQuantity && (
                          <span className="absolute right-3 top-2.5 text-blue-400 font-mono text-xs">
                            {calculatedQuantity.toFixed(5)}
                          </span>
                        )}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setCalculatedQuantity(null)}
                        disabled={!calculatedQuantity}
                        className="h-10 w-10"
                      >
                        <RotateCw className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="broker">Execution Route</Label>
                    <div className="relative mt-1">
                      <select
                        id="broker" 
                        className="w-full h-10 rounded-md border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        value={activeBroker || ''}
                        onChange={(e) => setActiveBroker(e.target.value)}
                      >
                        <option value="tradenexus">TradeNexus™ Smart Routing</option>
                        {availableBrokers.map((broker) => (
                          <option key={broker.id} value={broker.id}>
                            {broker.name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 top-2.5 pointer-events-none">
                        <Database className="h-4 w-4 text-slate-400" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-850 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Calculator className="h-4 w-4 mr-1 text-slate-400" />
                      Risk Calculator
                    </h3>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Risk Amount:</span>
                        <span className="font-mono">
                          {calculatedRiskAmount 
                            ? `$${calculatedRiskAmount.toFixed(2)}` 
                            : '-'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">R:R Ratio:</span>
                        <span className={`font-mono ${
                          riskRewardRatio 
                            ? riskRewardRatio >= 1.5 
                              ? 'text-green-500' 
                              : 'text-amber-500'
                            : ''
                        }`}>
                          {riskRewardRatio 
                            ? `${riskRewardRatio.toFixed(2)}:1` 
                            : '-'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-slate-400">Est. Trade Value:</span>
                        <span className="font-mono">
                          {calculatedQuantity && entryPrice 
                            ? `$${(calculatedQuantity * parseFloat(entryPrice)).toFixed(2)}` 
                            : '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-slate-850 rounded-lg p-4 border border-slate-700/50">
                    <h3 className="text-sm font-medium flex items-center mb-2">
                      <Brain className="h-4 w-4 mr-1 text-blue-400" />
                      AI Assessment
                    </h3>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">Risk Score:</span>
                          <span className={getScoreLevelColor(getAIScoreLevel(aiRiskScore))}>
                            {aiRiskScore}%
                          </span>
                        </div>
                        <Progress value={aiRiskScore} className="h-1.5" />
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-400">AI Confidence:</span>
                          <span className={getScoreLevelColor(getAIScoreLevel(aiConfidence))}>
                            {aiConfidence}%
                          </span>
                        </div>
                        <Progress value={aiConfidence} className="h-1.5" />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="auto-confirm" 
                      checked={autoConfirm}
                      onCheckedChange={setAutoConfirm}
                    />
                    <Label htmlFor="auto-confirm">Skip Confirmation</Label>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                    
                    <Button
                      type="submit"
                      disabled={orderStatus === 'pending'}
                      className={`gap-2 ${
                        tradeType === 'buy' 
                          ? 'bg-green-700 hover:bg-green-600' 
                          : 'bg-red-700 hover:bg-red-600'
                      }`}
                    >
                      {orderStatus === 'pending' ? (
                        <RotateCw className="h-4 w-4 animate-spin" />
                      ) : tradeType === 'buy' ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4" />
                      )}
                      {orderStatus === 'pending' ? 'Processing...' : `Execute ${tradeType.toUpperCase()}`}
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="signals" className="space-y-6">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-base font-medium flex items-center">
                <Zap className="h-4 w-4 mr-2 text-blue-400" />
                TradeNexus™ Signals
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Refresh signals (mock)
                  toast.success("Signals Updated", { 
                    description: "Latest trading signals have been loaded." 
                  });
                }}
              >
                <RefreshCw className="h-3.5 w-3.5 mr-1" />
                Refresh
              </Button>
            </div>
            
            <div className="space-y-3">
              {signals.length === 0 ? (
                <div className="bg-slate-800 rounded-lg p-6 text-center border border-slate-700">
                  <AlertCircle className="h-8 w-8 mx-auto text-slate-500 mb-2" />
                  <h4 className="font-medium mb-1">No Signals Available</h4>
                  <p className="text-sm text-slate-400">
                    There are currently no active trading signals.
                  </p>
                </div>
              ) : (
                signals.map((signal) => (
                  <div 
                    key={signal.id}
                    className={`p-4 rounded-lg border ${
                      selectedSignal?.id === signal.id 
                        ? 'bg-blue-900/30 border-blue-700' 
                        : 'bg-slate-800 border-slate-700 hover:border-slate-600 cursor-pointer'
                    }`}
                    onClick={() => applySignal(signal)}
                  >
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center">
                        <Badge 
                          variant={signal.direction === 'buy' ? 'success' : 'destructive'}
                          className="mr-2 uppercase"
                        >
                          {signal.direction}
                        </Badge>
                        <span className="font-medium">{signal.symbol}</span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {signal.provider}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-2 mb-2 text-sm">
                      <div>
                        <div className="text-slate-400 text-xs">Entry</div>
                        <div className="font-mono">{signal.entryPrice}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Stop Loss</div>
                        <div className="font-mono">{signal.stopLoss}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 text-xs">Take Profit</div>
                        <div className="font-mono">{signal.takeProfit}</div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-2">
                      <div className="text-xs text-slate-400">
                        {new Date(signal.timestamp).toLocaleTimeString()}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <div className="flex items-center">
                          <Activity className="h-3.5 w-3.5 text-blue-400 mr-1" />
                          <span className="text-xs font-medium">{signal.confidence}%</span>
                        </div>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="h-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            applySignal(signal);
                          }}
                        >
                          Apply
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-6">
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-medium flex items-center mb-4">
                  <Sliders className="h-4 w-4 mr-2 text-blue-400" />
                  Execution Settings
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <Label>Execution Presets</Label>
                    <div className="grid grid-cols-4 gap-2 mt-2">
                      <Button
                        type="button"
                        variant={selectedPreset === 'default' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyPreset('default')}
                        className={selectedPreset === 'default' ? 'bg-blue-700 hover:bg-blue-600' : ''}
                      >
                        Default
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPreset === 'conservative' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyPreset('conservative')}
                        className={selectedPreset === 'conservative' ? 'bg-green-700 hover:bg-green-600' : ''}
                      >
                        Conservative
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPreset === 'aggressive' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyPreset('aggressive')}
                        className={selectedPreset === 'aggressive' ? 'bg-amber-700 hover:bg-amber-600' : ''}
                      >
                        Aggressive
                      </Button>
                      <Button
                        type="button"
                        variant={selectedPreset === 'scalping' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => applyPreset('scalping')}
                        className={selectedPreset === 'scalping' ? 'bg-purple-700 hover:bg-purple-600' : ''}
                      >
                        Scalping
                      </Button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="validate-entry">Validate Entry Price</Label>
                        <Switch
                          id="validate-entry"
                          checked={orderConfig.validateEntry}
                          onCheckedChange={() => toggleOrderConfig('validateEntry')}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="reduce-only">Reduce Only</Label>
                        <Switch
                          id="reduce-only"
                          checked={orderConfig.reduceOnly}
                          onCheckedChange={() => toggleOrderConfig('reduceOnly')}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="post-only">Post Only</Label>
                        <Switch
                          id="post-only"
                          checked={orderConfig.postOnly}
                          onCheckedChange={() => toggleOrderConfig('postOnly')}
                        />
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <Label htmlFor="multiple-orders">Allow Multiple Orders</Label>
                        <Switch
                          id="multiple-orders"
                          checked={orderConfig.allowMultipleOrders}
                          onCheckedChange={() => toggleOrderConfig('allowMultipleOrders')}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Time In Force</Label>
                        <RadioGroup
                          value={orderConfig.timeInForce}
                          onValueChange={(value) => setOrderConfig({...orderConfig, timeInForce: value})}
                          className="mt-2 flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="GTC" id="gtc" />
                            <Label htmlFor="gtc" className="text-sm">Good Till Cancelled (GTC)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="IOC" id="ioc" />
                            <Label htmlFor="ioc" className="text-sm">Immediate or Cancel (IOC)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="FOK" id="fok" />
                            <Label htmlFor="fok" className="text-sm">Fill or Kill (FOK)</Label>
                          </div>
                        </RadioGroup>
                      </div>
                      
                      <div>
                        <Label>Execution Priority</Label>
                        <RadioGroup
                          value={orderConfig.priority}
                          onValueChange={(value) => setOrderConfig({...orderConfig, priority: value})}
                          className="mt-2 flex flex-col space-y-1"
                        >
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="price" id="price" />
                            <Label htmlFor="price" className="text-sm">Best Price</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="speed" id="speed" />
                            <Label htmlFor="speed" className="text-sm">Execution Speed</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <RadioGroupItem value="reliability" id="reliability" />
                            <Label htmlFor="reliability" className="text-sm">Highest Reliability</Label>
                          </div>
                        </RadioGroup>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <h3 className="text-sm font-medium flex items-center mb-4">
                  <Zap className="h-4 w-4 mr-2 text-amber-400" />
                  Execution Speed
                </h3>
                
                <div className="grid grid-cols-4 gap-2">
                  <Button
                    type="button"
                    variant={executionSpeed === 'normal' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeExecutionSpeed('normal')}
                    className={executionSpeed === 'normal' ? 'bg-blue-700 hover:bg-blue-600' : ''}
                  >
                    Normal
                  </Button>
                  <Button
                    type="button"
                    variant={executionSpeed === 'fast' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeExecutionSpeed('fast')}
                    className={executionSpeed === 'fast' ? 'bg-amber-700 hover:bg-amber-600' : ''}
                  >
                    Fast
                  </Button>
                  <Button
                    type="button"
                    variant={executionSpeed === 'ultra' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeExecutionSpeed('ultra')}
                    className={executionSpeed === 'ultra' ? 'bg-green-700 hover:bg-green-600' : ''}
                  >
                    Ultra
                  </Button>
                  <Button
                    type="button"
                    variant={executionSpeed === 'custom' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => changeExecutionSpeed('custom')}
                    className={executionSpeed === 'custom' ? 'bg-purple-700 hover:bg-purple-600' : ''}
                  >
                    Custom
                  </Button>
                </div>
                
                <div className="mt-4 p-4 rounded-lg bg-slate-850 border border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="text-sm font-medium">TradeNexus™ Routing Analysis</h4>
                    <Badge variant="outline" className="text-xs font-mono">Auto</Badge>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Optimal Route:</span>
                      <span>{getOptimalRoute().broker}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Execution Rating:</span>
                      <span className="text-green-400">{getOptimalRoute().rating}/10</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Est. Latency:</span>
                      <span>{getOptimalRoute().latency}ms</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-400">Est. Slippage:</span>
                      <span>{getOptimalRoute().slippage.toFixed(4)}%</span>
                    </div>
                  </div>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      toast.success("Route Analysis Updated", {
                        description: "Optimal execution route recalculated based on current market conditions."
                      });
                    }}
                  >
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Run Route Analysis
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        {/* Market information strip */}
        <div className="bg-slate-800 rounded-md p-3 flex justify-between items-center mt-6 border border-slate-700">
          <div className="flex items-center">
            <BarChart className="h-4 w-4 mr-2 text-blue-400" />
            <span className="font-medium text-sm">Market Price</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <span className="text-sm font-mono mr-2">{formatPrice(marketPrice)}</span>
              <div className="flex items-center">
                {getPriceChangeIndicator()}
                <span className={`text-xs font-mono ${
                  priceChange > 0 
                    ? 'text-green-500' 
                    : priceChange < 0 
                      ? 'text-red-500' 
                      : 'text-slate-500'
                }`}>
                  {priceChange > 0 ? '+' : ''}{priceChange.toFixed(3)}%
                </span>
              </div>
            </div>
            
            <div>
              <Badge 
                variant="outline" 
                className="text-xs"
              >
                {symbol}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}