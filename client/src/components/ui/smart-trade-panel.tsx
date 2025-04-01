import React, { useState, useRef, useEffect } from 'react';
import { 
  X, Maximize2, Minimize2, Move, BarChart4, TrendingUp, TrendingDown, 
  Crosshair, Percent, DollarSign, Calculator, Settings2, Lock, 
  ShieldCheck, AlertCircle, CreditCard, Sliders, Save, Target, 
  RefreshCw, SlidersHorizontal, ArrowUpDown, ArrowDownUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Input } from './input';
import { Label } from './label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Switch } from './switch';
import { Slider } from './slider';
import { Badge } from './badge';
import { Progress } from './progress';
import { Separator } from './separator';
import { toast } from '../../lib/toastify-bridge';

interface SmartTradePanelProps {
  isOpen: boolean;
  onClose: () => void;
  initialPosition?: { x: number; y: number };
  initialSize?: { width: number; height: number };
}

// Market data mock - to be replaced with real data
const MARKET_DATA = {
  price: 43250.75,
  dailyChange: 1.25,
  spread: 0.5,
  volume: "54.3M",
  atmVol: 67.8,
  supportLevel: 42800,
  resistanceLevel: 43500
};

export function SmartTradePanel({
  isOpen,
  onClose,
  initialPosition = { x: 100, y: 100 },
  initialSize = { width: 500, height: 700 },
}: SmartTradePanelProps) {
  // Panel state
  const [position, setPosition] = useState(initialPosition);
  const [size, setSize] = useState(initialSize);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isMaximized, setIsMaximized] = useState(false);
  const [preMaximizeState, setPreMaximizeState] = useState({
    position: initialPosition,
    size: initialSize,
  });

  // Trading state
  const [activeTab, setActiveTab] = useState('market');
  const [selectedBroker, setSelectedBroker] = useState('alpaca');
  const [orderType, setOrderType] = useState('market');
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSD');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState(MARKET_DATA.price.toString());
  const [stopPrice, setStopPrice] = useState('');
  const [takeProfitPrice, setTakeProfitPrice] = useState('');
  const [riskPercentage, setRiskPercentage] = useState(1);
  const [leverage, setLeverage] = useState('1');
  const [marketPrice, setMarketPrice] = useState(MARKET_DATA.price);
  const [autoCalculateTakeProfit, setAutoCalculateTakeProfit] = useState(true);
  const [autoCalculateStopLoss, setAutoCalculateStopLoss] = useState(true);
  const [riskRewardRatio, setRiskRewardRatio] = useState(2);
  const [accountBalance, setAccountBalance] = useState(10000);
  const [currentProfitLoss, setCurrentProfitLoss] = useState(0);
  const [isTradeActive, setIsTradeActive] = useState(false);
  const [tradeDirection, setTradeDirection] = useState<'buy' | 'sell'>('buy');
  const [activeTrade, setActiveTrade] = useState<any>(null);
  
  const [trailingStopEnabled, setTrailingStopEnabled] = useState(false);
  const [partialTakeProfitEnabled, setPartialTakeProfitEnabled] = useState(false);
  const [breakEvenEnabled, setBreakEvenEnabled] = useState(false);
  const [reduceOnlyEnabled, setReduceOnlyEnabled] = useState(false);
  const [partialTakeProfitLevels, setPartialTakeProfitLevels] = useState([
    { percent: 25, price: 0 },
    { percent: 50, price: 0 },
    { percent: 75, price: 0 }
  ]);

  // History and statistics
  const [tradingHistory, setTradingHistory] = useState<any[]>([]);
  const [todayStats, setTodayStats] = useState({
    trades: 0,
    winRate: 0,
    profit: 0,
    loss: 0,
    netPnL: 0
  });
  
  const [availableBrokers, setAvailableBrokers] = useState([
    { id: 'alpaca', name: 'Alpaca' },
    { id: 'abatev', name: 'ABATEV Protocol' },
    { id: 'td-ameritrade', name: 'TD Ameritrade' },
    { id: 'interactive-brokers', name: 'Interactive Brokers' },
  ]);
  
  // Trading symbols
  const [availableSymbols, setAvailableSymbols] = useState([
    { symbol: 'BTCUSD', name: 'Bitcoin/USD', type: 'crypto' },
    { symbol: 'ETHUSD', name: 'Ethereum/USD', type: 'crypto' },
    { symbol: 'SOLUSD', name: 'Solana/USD', type: 'crypto' },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock' },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock' },
  ]);

  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  // Calculate position size based on risk
  const calculatePositionSize = () => {
    if (!stopPrice || !price) return;
    
    const stopLoss = parseFloat(stopPrice);
    const entryPrice = parseFloat(price);
    const priceDifference = Math.abs(entryPrice - stopLoss);
    
    // Calculate position size based on risk percentage
    const riskAmount = (accountBalance * riskPercentage) / 100;
    const positionSize = riskAmount / priceDifference;
    
    // Round to 3 decimal places
    const roundedSize = Math.floor(positionSize * 1000) / 1000;
    setQuantity(roundedSize.toString());
    
    // Calculate take profit based on risk/reward ratio
    if (autoCalculateTakeProfit) {
      const takeProfitDelta = priceDifference * riskRewardRatio;
      const takeProfit = tradeDirection === 'buy' 
        ? entryPrice + takeProfitDelta 
        : entryPrice - takeProfitDelta;
      setTakeProfitPrice(takeProfit.toFixed(2));
      
      // Calculate partial take profits
      calculatePartialTakeProfits(entryPrice, takeProfit);
    }
  };
  
  // Calculate partial take profit levels
  const calculatePartialTakeProfits = (entry: number, takeProfit: number) => {
    const diff = Math.abs(takeProfit - entry);
    const updatedLevels = partialTakeProfitLevels.map(level => {
      const percentOfMove = level.percent / 100;
      const priceLevel = tradeDirection === 'buy'
        ? entry + (diff * percentOfMove)
        : entry - (diff * percentOfMove);
      return { ...level, price: parseFloat(priceLevel.toFixed(2)) };
    });
    
    setPartialTakeProfitLevels(updatedLevels);
  };

  // Toggle trade direction
  const toggleTradeDirection = () => {
    setTradeDirection(tradeDirection === 'buy' ? 'sell' : 'buy');
    // Recalculate stop loss and take profit if auto-calculate is enabled
    if (autoCalculateStopLoss || autoCalculateTakeProfit) {
      const entryPrice = parseFloat(price);
      let newStopPrice, newTakeProfitPrice;
      
      if (autoCalculateStopLoss) {
        // Example calculation - adjust based on your trading strategy
        const stopDistance = entryPrice * 0.02; // 2% of price
        newStopPrice = tradeDirection === 'sell' // We flipped the direction above
          ? entryPrice + stopDistance 
          : entryPrice - stopDistance;
        setStopPrice(newStopPrice.toFixed(2));
      }
      
      if (autoCalculateTakeProfit && stopPrice) {
        const stopDistance = Math.abs(entryPrice - parseFloat(stopPrice));
        const takeProfitDistance = stopDistance * riskRewardRatio;
        newTakeProfitPrice = tradeDirection === 'sell' // We flipped the direction above 
          ? entryPrice - takeProfitDistance 
          : entryPrice + takeProfitDistance;
        setTakeProfitPrice(newTakeProfitPrice.toFixed(2));
        
        if (newStopPrice && newTakeProfitPrice) {
          calculatePartialTakeProfits(entryPrice, newTakeProfitPrice);
        }
      }
    }
  };

  // Use market price
  const useMarketPrice = () => {
    setPrice(marketPrice.toFixed(2));
    // Trigger stop loss and take profit calculations
    if (autoCalculateStopLoss) {
      const stopDistance = marketPrice * 0.02; // 2% of price
      const newStopPrice = tradeDirection === 'buy'
        ? marketPrice - stopDistance
        : marketPrice + stopDistance;
      setStopPrice(newStopPrice.toFixed(2));
    }
    
    if (price && stopPrice) {
      calculatePositionSize();
    }
  };
  
  // Reset form
  const resetForm = () => {
    setPrice(marketPrice.toFixed(2));
    setStopPrice('');
    setTakeProfitPrice('');
    setQuantity('');
    setRiskPercentage(1);
    setPartialTakeProfitEnabled(false);
    setTrailingStopEnabled(false);
    setBreakEvenEnabled(false);
  };
  
  // Submit order
  const handleSubmitOrder = () => {
    if (!selectedSymbol || !quantity || !price) {
      toast.error('Symbol, quantity, and price are required');
      return;
    }

    const orderData = {
      symbol: selectedSymbol,
      quantity: parseFloat(quantity),
      type: orderType,
      side: tradeDirection,
      price: parseFloat(price),
      stopLoss: stopPrice ? parseFloat(stopPrice) : undefined,
      takeProfit: takeProfitPrice ? parseFloat(takeProfitPrice) : undefined,
      broker: selectedBroker,
      leverage: parseFloat(leverage),
      trailingStop: trailingStopEnabled,
      breakEvenEnabled: breakEvenEnabled,
      partialTakeProfit: partialTakeProfitEnabled ? partialTakeProfitLevels : undefined,
      reduceOnly: reduceOnlyEnabled,
      riskPercentage: riskPercentage,
      timestamp: new Date().toISOString()
    };

    console.log('Submitting order:', orderData);
    toast.success(`Order submitted: ${orderData.side.toUpperCase()} ${orderData.quantity} ${orderData.symbol} @ ${orderData.price}`);
    
    // Simulate trade execution
    simulateTradeExecution(orderData);
  };

  // Simulate trade execution
  const simulateTradeExecution = (orderData: any) => {
    // In a real app, this would be an API call to the broker
    // For demo, we'll simulate success and update local state
    
    setActiveTrade({
      ...orderData,
      id: `trade-${Date.now()}`,
      entryTime: new Date().toISOString(),
      currentPrice: orderData.price,
      profit: 0,
      status: 'active'
    });
    
    setIsTradeActive(true);
    
    // Update trading history
    setTradingHistory(prev => [orderData, ...prev]);
    
    // Update today's stats
    setTodayStats(prev => ({
      ...prev,
      trades: prev.trades + 1
    }));
  };
  
  // Close trade (full)
  const closeTradeFull = () => {
    if (!activeTrade) return;
    
    // Simulate closing the trade at current market price
    const exitPrice = marketPrice;
    const entryPrice = activeTrade.price;
    const priceDiff = tradeDirection === 'buy' 
      ? exitPrice - entryPrice 
      : entryPrice - exitPrice;
    
    const profit = priceDiff * parseFloat(activeTrade.quantity);
    
    // Update trade history
    const closedTrade = {
      ...activeTrade,
      exitPrice,
      exitTime: new Date().toISOString(),
      profit,
      status: 'closed'
    };
    
    setTradingHistory(prev => 
      prev.map(trade => 
        trade.id === activeTrade.id ? closedTrade : trade
      )
    );
    
    // Update today's stats
    setTodayStats(prev => ({
      ...prev,
      netPnL: prev.netPnL + profit,
      profit: profit > 0 ? prev.profit + profit : prev.profit,
      loss: profit < 0 ? prev.loss + Math.abs(profit) : prev.loss,
      winRate: calculateWinRate(profit > 0)
    }));
    
    // Reset active trade
    setActiveTrade(null);
    setIsTradeActive(false);
    resetForm();
    
    toast.success(`Trade closed: ${profit > 0 ? 'Profit' : 'Loss'} of ${profit.toFixed(2)} USD`);
  };

  // Calculate win rate
  const calculateWinRate = (isWin: boolean) => {
    const wins = isWin ? todayStats.winRate * todayStats.trades + 1 : todayStats.winRate * todayStats.trades;
    return wins / (todayStats.trades + 1);
  };
  
  // Close trade (partial)
  const closeTradePartial = (percentage: number) => {
    if (!activeTrade) return;
    
    // Calculate partial quantity
    const partialQty = (parseFloat(activeTrade.quantity) * percentage) / 100;
    const remainingQty = parseFloat(activeTrade.quantity) - partialQty;
    
    // Calculate profit/loss for the partial
    const exitPrice = marketPrice;
    const entryPrice = activeTrade.price;
    const priceDiff = tradeDirection === 'buy' 
      ? exitPrice - entryPrice 
      : entryPrice - exitPrice;
    
    const profit = priceDiff * partialQty;
    
    // Update active trade
    setActiveTrade({
      ...activeTrade,
      quantity: remainingQty.toString(),
      partialExits: [...(activeTrade.partialExits || []), {
        quantity: partialQty,
        price: exitPrice,
        time: new Date().toISOString(),
        profit
      }]
    });
    
    // Update today's stats
    setTodayStats(prev => ({
      ...prev,
      netPnL: prev.netPnL + profit,
      profit: profit > 0 ? prev.profit + profit : prev.profit,
      loss: profit < 0 ? prev.loss + Math.abs(profit) : prev.loss
    }));
    
    toast.success(`Closed ${percentage}% of position: ${profit > 0 ? 'Profit' : 'Loss'} of ${profit.toFixed(2)} USD`);
  };
  
  // Move stop loss to breakeven
  const moveStopToBreakeven = () => {
    if (!activeTrade) return;
    
    // Update the stop price to entry price
    const updatedTrade = {
      ...activeTrade,
      stopLoss: activeTrade.price
    };
    
    setActiveTrade(updatedTrade);
    setStopPrice(activeTrade.price.toString());
    
    toast.success('Stop loss moved to breakeven');
  };

  // Handle panel dragging
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        const newX = e.clientX - dragOffset.x;
        const newY = e.clientY - dragOffset.y;
        setPosition({ x: newX, y: newY });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, isMaximized]);

  // Handle panel resizing
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isResizing && !isMaximized) {
        const newWidth = Math.max(300, e.clientX - position.x);
        const newHeight = Math.max(400, e.clientY - position.y);
        setSize({ width: newWidth, height: newHeight });
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing, position, isMaximized]);

  const handleDragStart = (e: React.MouseEvent) => {
    if (headerRef.current && !isMaximized) {
      setIsDragging(true);
      setDragOffset({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleResizeStart = (e: React.MouseEvent) => {
    if (!isMaximized) {
      setIsResizing(true);
      e.preventDefault();
      e.stopPropagation();
    }
  };

  const toggleMaximize = () => {
    if (isMaximized) {
      // Restore previous state
      setPosition(preMaximizeState.position);
      setSize(preMaximizeState.size);
    } else {
      // Save current state and maximize
      setPreMaximizeState({
        position,
        size,
      });
      
      // Using window dimensions for full screen
      setPosition({ x: 0, y: 0 });
      setSize({ 
        width: window.innerWidth, 
        height: window.innerHeight - 50 // Account for possible navbar
      });
    }
    setIsMaximized(!isMaximized);
  };

  const handleSymbolChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedSymbol(e.target.value.toUpperCase());
  };
  
  // Watch for price/stop loss changes to recalculate
  useEffect(() => {
    if (autoCalculateStopLoss || autoCalculateTakeProfit) {
      if (price && stopPrice) {
        calculatePositionSize();
      }
    }
  }, [price, stopPrice, riskPercentage, tradeDirection, riskRewardRatio]);
  
  // Update market price periodically (simulate real-time data)
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate small price changes
      const change = (Math.random() - 0.5) * 10;
      const newPrice = MARKET_DATA.price + change;
      setMarketPrice(newPrice);
      
      // If there's an active trade, update P/L
      if (activeTrade) {
        const entryPrice = activeTrade.price;
        const currentQty = parseFloat(activeTrade.quantity);
        const priceDiff = activeTrade.side === 'buy' 
          ? newPrice - entryPrice 
          : entryPrice - newPrice;
        
        const currentPL = priceDiff * currentQty;
        setCurrentProfitLoss(currentPL);
      }
    }, 2000);
    
    return () => clearInterval(interval);
  }, [activeTrade]);

  if (!isOpen) return null;

  return (
    <div 
      ref={panelRef}
      className="fixed z-50 shadow-xl rounded-lg overflow-hidden bg-black border border-gray-700"
      style={{
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        transition: isDragging || isResizing ? 'none' : 'all 0.2s ease'
      }}
    >
      <div 
        ref={headerRef}
        className="bg-gray-900 px-4 py-2 cursor-move flex items-center justify-between border-b border-gray-700"
        onMouseDown={handleDragStart}
      >
        <div className="flex items-center gap-2">
          <Move className="h-4 w-4" />
          <h3 className="text-sm font-medium">TradeHybrid Smart Panel</h3>
          <Badge 
            variant={tradeDirection === 'buy' ? 'success' : 'destructive'} 
            className="ml-2"
          >
            {tradeDirection.toUpperCase()}
          </Badge>
        </div>
        <div className="flex items-center gap-1">
          {isMaximized ? (
            <Button variant="ghost" size="icon" onClick={toggleMaximize}>
              <Minimize2 className="h-4 w-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" onClick={toggleMaximize}>
              <Maximize2 className="h-4 w-4" />
            </Button>
          )}
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} className="w-full" onValueChange={setActiveTab}>
        <div className="bg-gray-800 p-2 flex border-b border-gray-700">
          <TabsList className="bg-gray-900 p-0 h-8">
            <TabsTrigger 
              value="market" 
              className="px-3 h-8 text-xs rounded-none data-[state=active]:bg-blue-600"
            >
              Market
            </TabsTrigger>
            <TabsTrigger 
              value="order" 
              className="px-3 h-8 text-xs rounded-none data-[state=active]:bg-blue-600"
            >
              Order
            </TabsTrigger>
            <TabsTrigger 
              value="smart" 
              className="px-3 h-8 text-xs rounded-none data-[state=active]:bg-blue-600"
            >
              Smart Trade
            </TabsTrigger>
            <TabsTrigger 
              value="stats" 
              className="px-3 h-8 text-xs rounded-none data-[state=active]:bg-blue-600"
            >
              Stats
            </TabsTrigger>
          </TabsList>
          
          <div className="ml-auto flex items-center gap-1">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs bg-gray-900 hover:bg-gray-800"
              onClick={toggleTradeDirection}
            >
              <ArrowUpDown className="h-3 w-3 mr-1" />
              Flip
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 px-2 text-xs bg-gray-900 hover:bg-gray-800"
              onClick={resetForm}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Reset
            </Button>
          </div>
        </div>
        
        {/* Market price ticker */}
        <div className="bg-black p-2 border-b border-gray-700 flex items-center">
          <div className="grid grid-cols-4 gap-2 w-full">
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Symbol</span>
              <span className="text-sm font-medium">{selectedSymbol}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Price</span>
              <span className={`text-sm font-medium ${MARKET_DATA.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                ${marketPrice.toFixed(2)}
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">24h Change</span>
              <span className={`text-sm font-medium ${MARKET_DATA.dailyChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {MARKET_DATA.dailyChange >= 0 ? '+' : ''}{MARKET_DATA.dailyChange}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-gray-400">Spread</span>
              <span className="text-sm font-medium">{MARKET_DATA.spread} pips</span>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            className="ml-auto h-8 bg-blue-900/30 hover:bg-blue-900/50 border-blue-700"
            onClick={useMarketPrice}
          >
            Use Market Price
          </Button>
        </div>

        <div className="p-4 overflow-auto bg-black text-white h-full">
          <TabsContent value="market" className="space-y-4 mt-0">
            {/* Active position information */}
            {isTradeActive && activeTrade && (
              <div className="mb-6 p-3 border border-gray-700 rounded-md bg-gray-900">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-semibold">Active Position: {activeTrade.symbol}</h3>
                  <Badge variant={currentProfitLoss >= 0 ? 'success' : 'destructive'}>
                    {currentProfitLoss >= 0 ? '+' : ''}{currentProfitLoss.toFixed(2)} USD
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                  <div>
                    <span className="text-gray-400">Entry:</span>
                    <span className="ml-1">${activeTrade.price}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Size:</span>
                    <span className="ml-1">{activeTrade.quantity}</span>
                  </div>
                  <div>
                    <span className="text-gray-400">Type:</span>
                    <span className="ml-1 capitalize">{activeTrade.side}</span>
                  </div>
                  
                  {activeTrade.stopLoss && (
                    <div>
                      <span className="text-gray-400">Stop:</span>
                      <span className="ml-1">${activeTrade.stopLoss}</span>
                    </div>
                  )}
                  
                  {activeTrade.takeProfit && (
                    <div>
                      <span className="text-gray-400">Take Profit:</span>
                      <span className="ml-1">${activeTrade.takeProfit}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex gap-2 mt-2">
                  <Button 
                    variant="default" 
                    size="sm" 
                    className="bg-red-600 hover:bg-red-700 text-xs"
                    onClick={() => closeTradeFull()}
                  >
                    Close Full
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={() => closeTradePartial(50)}
                  >
                    Close 50%
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="text-xs"
                    onClick={moveStopToBreakeven}
                  >
                    Move to Breakeven
                  </Button>
                </div>
              </div>
            )}
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="broker-select">Broker</Label>
                <Select value={selectedBroker} onValueChange={setSelectedBroker}>
                  <SelectTrigger id="broker-select" className="w-[180px]">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBrokers.map(broker => (
                      <SelectItem key={broker.id} value={broker.id}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select value={selectedSymbol} onValueChange={setSelectedSymbol}>
                    <SelectTrigger id="symbol-select">
                      <SelectValue placeholder="Select symbol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BTCUSD">BTC/USD</SelectItem>
                      <SelectItem value="ETHUSD">ETH/USD</SelectItem>
                      <SelectItem value="SOLUSD">SOL/USD</SelectItem>
                      <SelectItem value="AAPL">AAPL</SelectItem>
                      <SelectItem value="MSFT">MSFT</SelectItem>
                      <SelectItem value="TSLA">TSLA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="risk-percent">Risk %</Label>
                    <span className="text-sm font-medium">{riskPercentage}%</span>
                  </div>
                  <Slider
                    id="risk-percent"
                    min={0.1}
                    max={5}
                    step={0.1}
                    value={[riskPercentage]}
                    onValueChange={(value) => setRiskPercentage(value[0])}
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price">Entry Price</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Entry Price" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quantity">Position Size</Label>
                  <Input 
                    id="quantity" 
                    type="number" 
                    min="0.001" 
                    step="0.001" 
                    placeholder="Auto calculated" 
                    value={quantity} 
                    onChange={(e) => setQuantity(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stop-loss">Stop Loss</Label>
                    <div className="flex items-center">
                      <Switch 
                        id="auto-sl"
                        checked={autoCalculateStopLoss}
                        onCheckedChange={setAutoCalculateStopLoss}
                        className="mr-2 h-4 w-8"
                      />
                      <Label htmlFor="auto-sl" className="text-xs">Auto</Label>
                    </div>
                  </div>
                  <Input 
                    id="stop-loss" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Stop Loss" 
                    value={stopPrice} 
                    onChange={(e) => setStopPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                    disabled={autoCalculateStopLoss}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="take-profit">Take Profit</Label>
                    <div className="flex items-center">
                      <Switch 
                        id="auto-tp"
                        checked={autoCalculateTakeProfit}
                        onCheckedChange={setAutoCalculateTakeProfit}
                        className="mr-2 h-4 w-8"
                      />
                      <Label htmlFor="auto-tp" className="text-xs">Auto</Label>
                    </div>
                  </div>
                  <Input 
                    id="take-profit" 
                    type="number" 
                    min="0" 
                    step="0.01" 
                    placeholder="Take Profit" 
                    value={takeProfitPrice} 
                    onChange={(e) => setTakeProfitPrice(e.target.value)}
                    className="bg-gray-800 border-gray-700"
                    disabled={autoCalculateTakeProfit}
                  />
                </div>
              </div>
              
              {autoCalculateTakeProfit && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="risk-reward">Risk/Reward Ratio</Label>
                    <span className="text-sm font-medium">{riskRewardRatio}:1</span>
                  </div>
                  <Slider
                    id="risk-reward"
                    min={1}
                    max={5}
                    step={0.5}
                    value={[riskRewardRatio]}
                    onValueChange={(value) => setRiskRewardRatio(value[0])}
                    className="mt-2"
                  />
                </div>
              )}

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => { setTradeDirection('buy'); handleSubmitOrder(); }}
                  className="bg-green-600 hover:bg-green-700 py-6"
                >
                  <div>
                    <div className="text-lg font-medium">BUY / LONG</div>
                    <div className="text-xs opacity-80">{selectedSymbol} @ ${price || marketPrice.toFixed(2)}</div>
                  </div>
                </Button>
                <Button 
                  onClick={() => { setTradeDirection('sell'); handleSubmitOrder(); }}
                  className="bg-red-600 hover:bg-red-700 py-6"
                >
                  <div>
                    <div className="text-lg font-medium">SELL / SHORT</div>
                    <div className="text-xs opacity-80">{selectedSymbol} @ ${price || marketPrice.toFixed(2)}</div>
                  </div>
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="smart" className="space-y-4 mt-0">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-gray-700 pb-2">Smart Trade Automation</h3>
              
              <div className="space-y-3 p-3 bg-gray-900/30 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                    <Label htmlFor="trailing-stop" className="cursor-pointer">Trailing Stop Loss</Label>
                  </div>
                  <Switch 
                    id="trailing-stop"
                    checked={trailingStopEnabled}
                    onCheckedChange={setTrailingStopEnabled}
                  />
                </div>
                
                {trailingStopEnabled && (
                  <div className="pl-6 space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="trailing-stop-distance" className="text-xs">Distance (pips)</Label>
                      <Input 
                        id="trailing-stop-distance" 
                        type="number" 
                        min="1" 
                        className="bg-gray-800 border-gray-700 h-8 text-sm"
                        placeholder="50" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="trailing-step" className="text-xs">Step (pips)</Label>
                      <Input 
                        id="trailing-step" 
                        type="number" 
                        min="1" 
                        className="bg-gray-800 border-gray-700 h-8 text-sm"
                        placeholder="10" 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 p-3 bg-gray-900/30 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Target className="h-4 w-4 mr-2 text-yellow-500" />
                    <Label htmlFor="partial-take-profit" className="cursor-pointer">Partial Take Profits</Label>
                  </div>
                  <Switch 
                    id="partial-take-profit"
                    checked={partialTakeProfitEnabled}
                    onCheckedChange={setPartialTakeProfitEnabled}
                  />
                </div>
                
                {partialTakeProfitEnabled && (
                  <div className="pl-6 space-y-3 mt-2">
                    {partialTakeProfitLevels.map((level, index) => (
                      <div key={index} className="grid grid-cols-5 gap-2 items-center">
                        <span className="text-xs col-span-1">{level.percent}%</span>
                        <div className="col-span-3">
                          <Progress value={level.percent} className="h-2" />
                        </div>
                        <span className="text-xs text-right col-span-1">
                          ${level.price}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="space-y-3 p-3 bg-gray-900/30 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2 text-blue-500" />
                    <Label htmlFor="breakeven" className="cursor-pointer">Breakeven Automation</Label>
                  </div>
                  <Switch 
                    id="breakeven"
                    checked={breakEvenEnabled}
                    onCheckedChange={setBreakEvenEnabled}
                  />
                </div>
                
                {breakEvenEnabled && (
                  <div className="pl-6 space-y-2">
                    <div className="space-y-1">
                      <Label htmlFor="breakeven-trigger" className="text-xs">Trigger (pips in profit)</Label>
                      <Input 
                        id="breakeven-trigger" 
                        type="number" 
                        min="1" 
                        className="bg-gray-800 border-gray-700 h-8 text-sm"
                        placeholder="20" 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="breakeven-buffer" className="text-xs">Buffer (pips above entry)</Label>
                      <Input 
                        id="breakeven-buffer" 
                        type="number" 
                        min="0" 
                        className="bg-gray-800 border-gray-700 h-8 text-sm"
                        placeholder="2" 
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-3 p-3 bg-gray-900/30 rounded-md">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-purple-500" />
                    <Label htmlFor="reduce-only" className="cursor-pointer">Reduce Only</Label>
                  </div>
                  <Switch 
                    id="reduce-only"
                    checked={reduceOnlyEnabled}
                    onCheckedChange={setReduceOnlyEnabled}
                  />
                </div>
                
                <div className="text-xs text-gray-400 pl-6">
                  Only allows orders that reduce position size. Prevents accidental increase of position.
                </div>
              </div>
              
              <div className="space-y-3 p-3 bg-gray-900/30 rounded-md">
                <div className="flex items-center">
                  <Settings2 className="h-4 w-4 mr-2 text-gray-400" />
                  <span className="text-sm font-medium">Quick Execute Commands</span>
                </div>
                <div className="grid grid-cols-3 gap-2 mt-2">
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-green-900/20 border-green-700 hover:bg-green-900/40">
                    Open Buy
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-red-900/20 border-red-700 hover:bg-red-900/40">
                    Open Sell
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-yellow-900/20 border-yellow-700 hover:bg-yellow-900/40">
                    Close Half
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-blue-900/20 border-blue-700 hover:bg-blue-900/40">
                    To Breakeven
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-purple-900/20 border-purple-700 hover:bg-purple-900/40">
                    Modify SL
                  </Button>
                  <Button size="sm" variant="outline" className="h-8 text-xs bg-gray-700 border-gray-600 hover:bg-gray-600">
                    Close All
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="order" className="space-y-4 mt-0">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="order-type">Order Type</Label>
                <Select value={orderType} onValueChange={setOrderType}>
                  <SelectTrigger id="order-type">
                    <SelectValue placeholder="Select order type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="market">Market</SelectItem>
                    <SelectItem value="limit">Limit</SelectItem>
                    <SelectItem value="stop">Stop</SelectItem>
                    <SelectItem value="stop-limit">Stop Limit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="leverage">Leverage</Label>
                  <span className="text-sm">{leverage}x</span>
                </div>
                <Input 
                  id="leverage" 
                  type="range" 
                  min="1" 
                  max="10" 
                  step="1" 
                  value={leverage} 
                  onChange={(e) => setLeverage(e.target.value)}
                  className="bg-gray-800 border-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Advanced Order Settings</Label>
                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="post-only" className="text-sm cursor-pointer">Post Only</Label>
                    <Switch id="post-only" className="scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="hidden" className="text-sm cursor-pointer">Hidden Order</Label>
                    <Switch id="hidden" className="scale-75" />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="tif" className="text-sm cursor-pointer">Time In Force</Label>
                    <Select defaultValue="gtc">
                      <SelectTrigger id="tif" className="h-7 w-24 text-xs">
                        <SelectValue placeholder="TIF" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gtc">GTC</SelectItem>
                        <SelectItem value="ioc">IOC</SelectItem>
                        <SelectItem value="fok">FOK</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="reduce-only-order" className="text-sm cursor-pointer">Reduce Only</Label>
                    <Switch id="reduce-only-order" className="scale-75" />
                  </div>
                </div>
              </div>
              
              <div className="border border-gray-700 rounded p-3 mt-4 bg-gray-900">
                <h4 className="text-xs font-semibold mb-2 text-white">Order Summary</h4>
                <div className="grid grid-cols-2 gap-y-1 text-xs">
                  <span className="text-muted-foreground">Type:</span>
                  <span className="capitalize">{orderType}</span>
                  
                  <span className="text-muted-foreground">Side:</span>
                  <span className="capitalize">{tradeDirection}</span>
                  
                  <span className="text-muted-foreground">Symbol:</span>
                  <span>{selectedSymbol || '—'}</span>
                  
                  <span className="text-muted-foreground">Quantity:</span>
                  <span>{quantity || '—'}</span>
                  
                  <span className="text-muted-foreground">Entry Price:</span>
                  <span>{price ? `$${price}` : '—'}</span>
                  
                  <span className="text-muted-foreground">Stop Loss:</span>
                  <span>{stopPrice ? `$${stopPrice}` : '—'}</span>
                  
                  <span className="text-muted-foreground">Take Profit:</span>
                  <span>{takeProfitPrice ? `$${takeProfitPrice}` : '—'}</span>
                  
                  <span className="text-muted-foreground">Risk:</span>
                  <span>{riskPercentage}% of balance</span>
                  
                  <span className="text-muted-foreground">Leverage:</span>
                  <span>{leverage}x</span>
                  
                  <span className="text-muted-foreground">R:R Ratio:</span>
                  <span>{riskRewardRatio}:1</span>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="stats" className="mt-0">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold border-b border-gray-700 pb-2">Trading Performance</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-gray-900 p-3 rounded">
                  <p className="text-xs text-gray-400">Today's P/L</p>
                  <p className={`text-lg font-bold ${todayStats.netPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {todayStats.netPnL >= 0 ? '+' : ''}{todayStats.netPnL.toFixed(2)} USD
                  </p>
                </div>
                <div className="bg-gray-900 p-3 rounded">
                  <p className="text-xs text-gray-400">Win Rate</p>
                  <p className="text-lg font-bold">{(todayStats.winRate * 100).toFixed(1)}%</p>
                  <p className="text-xs text-gray-400">{todayStats.trades} trades today</p>
                </div>
              </div>
              
              <div className="bg-gray-900 p-3 rounded">
                <h4 className="text-xs font-semibold mb-2">Risk Analysis</h4>
                <div className="grid grid-cols-2 gap-y-2 text-xs">
                  <span className="text-gray-400">Account Balance:</span>
                  <span>${accountBalance.toFixed(2)}</span>
                  
                  <span className="text-gray-400">Current Risk:</span>
                  <span>${(accountBalance * riskPercentage / 100).toFixed(2)} ({riskPercentage}%)</span>
                  
                  <span className="text-gray-400">Max Daily Loss:</span>
                  <span>$500.00 (5%)</span>
                  
                  <span className="text-gray-400">Today's Loss:</span>
                  <span className={todayStats.loss > 0 ? 'text-red-500' : ''}>
                    ${todayStats.loss.toFixed(2)}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-semibold mb-2">Recent Trades</h4>
                {tradingHistory.length > 0 ? (
                  <div className="space-y-2">
                    {tradingHistory.slice(0, 3).map((trade, index) => (
                      <div key={index} className="bg-gray-900 p-2 rounded text-xs">
                        <div className="flex justify-between">
                          <span className="font-medium">{trade.symbol} {trade.side.toUpperCase()}</span>
                          <span className={trade.profit >= 0 ? 'text-green-500' : 'text-red-500'}>
                            {trade.profit >= 0 ? '+' : ''}{trade.profit?.toFixed(2) || '0.00'} USD
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-400 mt-1">
                          <span>Size: {trade.quantity}</span>
                          <span>{new Date(trade.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-900 p-3 rounded text-center text-sm text-gray-400">
                    No trades yet today
                  </div>
                )}
              </div>
              
              <div className="mt-4">
                <Button variant="outline" className="w-full text-sm">
                  View Detailed Trading Reports
                </Button>
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Bottom action bar */}
      <div className="absolute bottom-0 left-0 right-0 bg-gray-900 p-2 border-t border-gray-700 flex justify-between">
        <div className="flex gap-1">
          <Button variant="outline" size="sm" className="h-8 bg-gray-800 border-gray-700 text-xs">
            <Save className="h-3 w-3 mr-1" />
            Save Template
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-gray-800 border-gray-700 text-xs">
            <Sliders className="h-3 w-3 mr-1" />
            Settings
          </Button>
        </div>
        <div className="flex items-center text-xs text-gray-400">
          <DollarSign className="h-3 w-3 mr-1" />
          Account: ${accountBalance.toFixed(2)} USD
        </div>
      </div>
      
      {/* Resize handle */}
      <div 
        ref={resizerRef}
        className={`absolute bottom-0 right-0 w-4 h-4 cursor-se-resize ${isMaximized ? 'hidden' : ''}`}
        onMouseDown={handleResizeStart}
      >
        <svg 
          width="10" 
          height="10" 
          viewBox="0 0 10 10" 
          className="absolute bottom-1 right-1"
        >
          <path 
            d="M0 10L10 10L10 0" 
            fill="none" 
            stroke="currentColor" 
            strokeOpacity="0.3" 
            strokeWidth="2"
          />
        </svg>
      </div>
    </div>
  );
}