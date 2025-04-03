import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import { RadioGroup, RadioGroupItem } from './radio-group';
import { Slider } from './slider';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select';
import { cn } from '../../lib/utils';
import { ArrowDown, ArrowUp, Percent, DollarSign, AlertTriangle, ChevronDown, ChevronUp, Share2 } from 'lucide-react';

interface SmartTradePanelProps {
  symbol?: string;
  price?: number;
  onChange?: (values: any) => void;
  className?: string;
  asCard?: boolean; // Whether to render as a card with header
}

export function SmartTradePanel({
  symbol = 'BTCUSDT',
  price = 69420.50,
  onChange,
  className,
  asCard = true
}: SmartTradePanelProps) {
  const [tradeType, setTradeType] = useState<'market' | 'limit' | 'stop' | 'oco'>('market');
  const [side, setSide] = useState<'buy' | 'sell'>('buy');
  const [quantity, setQuantity] = useState<string>('0.01');
  const [limitPrice, setLimitPrice] = useState<string>(price.toFixed(2));
  const [stopPrice, setStopPrice] = useState<string>((price * 0.98).toFixed(2));
  const [takeProfitPrice, setTakeProfitPrice] = useState<string>((price * 1.02).toFixed(2));
  const [useLeverage, setUseLeverage] = useState<boolean>(false);
  const [leverage, setLeverage] = useState<number>(5);
  const [orderType, setOrderType] = useState<'percentage' | 'fixed'>('percentage');
  const [positionSize, setPositionSize] = useState<number[]>([25]); // Percentage of available balance
  
  // Format price with appropriate precision
  const formatPrice = (price: number): string => {
    if (price >= 10000) return price.toFixed(2);
    if (price >= 1000) return price.toFixed(3);
    if (price >= 100) return price.toFixed(4);
    if (price >= 10) return price.toFixed(5);
    return price.toFixed(6);
  };
  
  // Calculate total order value
  const calculateOrderValue = (): string => {
    const qty = parseFloat(quantity) || 0;
    let orderPrice = price;
    
    if (tradeType === 'limit') orderPrice = parseFloat(limitPrice) || price;
    if (tradeType === 'stop' && side === 'sell') orderPrice = parseFloat(stopPrice) || price;
    
    return (qty * orderPrice).toFixed(2);
  };
  
  // Generate quick quantity buttons
  const quickQtyButtons = [0.001, 0.01, 0.1, 1].map((qty) => (
    <Button
      key={qty}
      size="sm"
      variant={quantity === qty.toString() ? "default" : "outline"}
      className="h-7 px-2 text-xs"
      onClick={() => setQuantity(qty.toString())}
    >
      {qty}
    </Button>
  ));
  
  // Slider for position size
  const handlePositionSizeChange = (value: number[]) => {
    setPositionSize(value);
  };
  
  const content = (
    <div className="flex flex-col h-full space-y-4 text-sm">
      {/* Order type tabs */}
      <Tabs defaultValue={tradeType} onValueChange={(value) => setTradeType(value as any)}>
        <TabsList className="grid grid-cols-4 h-8">
          <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
          <TabsTrigger value="limit" className="text-xs">Limit</TabsTrigger>
          <TabsTrigger value="stop" className="text-xs">Stop</TabsTrigger>
          <TabsTrigger value="oco" className="text-xs">OCO</TabsTrigger>
        </TabsList>
        
        {/* Market Order */}
        <TabsContent value="market" className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Market Price</div>
            <div className="text-sm font-mono">{formatPrice(price)}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-5',
                side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'text-green-500'
              )}
              onClick={() => setSide('buy')}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Buy / Long
            </Button>
            
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-5',
                side === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'text-red-500'
              )}
              onClick={() => setSide('sell')}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Sell / Short
            </Button>
          </div>
        </TabsContent>
        
        {/* Limit Order */}
        <TabsContent value="limit" className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Market Price</div>
            <div className="text-sm font-mono">{formatPrice(price)}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="limit-price">Limit Price</Label>
            <Input
              id="limit-price"
              type="number"
              value={limitPrice}
              onChange={e => setLimitPrice(e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'text-green-500'
              )}
              onClick={() => setSide('buy')}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Buy / Long
            </Button>
            
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'text-red-500'
              )}
              onClick={() => setSide('sell')}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Sell / Short
            </Button>
          </div>
        </TabsContent>
        
        {/* Stop Order */}
        <TabsContent value="stop" className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Market Price</div>
            <div className="text-sm font-mono">{formatPrice(price)}</div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="stop-price">Stop Price</Label>
            <Input
              id="stop-price"
              type="number"
              value={stopPrice}
              onChange={e => setStopPrice(e.target.value)}
              className="font-mono"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'text-green-500'
              )}
              onClick={() => setSide('buy')}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Buy Stop
            </Button>
            
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'text-red-500'
              )}
              onClick={() => setSide('sell')}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Sell Stop
            </Button>
          </div>
        </TabsContent>
        
        {/* OCO Order */}
        <TabsContent value="oco" className="space-y-3 pt-2">
          <div className="flex justify-between items-center">
            <div className="text-sm font-medium">Market Price</div>
            <div className="text-sm font-mono">{formatPrice(price)}</div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="stop-loss-price">Stop Loss</Label>
              <Input
                id="stop-loss-price"
                type="number"
                value={stopPrice}
                onChange={e => setStopPrice(e.target.value)}
                className="font-mono"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="take-profit-price">Take Profit</Label>
              <Input
                id="take-profit-price"
                type="number"
                value={takeProfitPrice}
                onChange={e => setTakeProfitPrice(e.target.value)}
                className="font-mono"
              />
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'text-green-500'
              )}
              onClick={() => setSide('buy')}
            >
              <ArrowUp className="mr-2 h-4 w-4" />
              Buy OCO
            </Button>
            
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'} 
              className={cn(
                'w-full py-4',
                side === 'sell' ? 'bg-red-600 hover:bg-red-700' : 'text-red-500'
              )}
              onClick={() => setSide('sell')}
            >
              <ArrowDown className="mr-2 h-4 w-4" />
              Sell OCO
            </Button>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Quantity inputs */}
      <div className="space-y-2">
        <div className="flex justify-between">
          <Label htmlFor="quantity">Quantity ({symbol.slice(0, 3)})</Label>
          <div className="flex gap-1">
            {quickQtyButtons}
          </div>
        </div>
        
        <Input
          id="quantity"
          type="number"
          value={quantity}
          onChange={e => setQuantity(e.target.value)}
          className="font-mono"
        />
        
        <div className="flex justify-between text-sm text-slate-400">
          <span>≈ ${calculateOrderValue()} USD</span>
        </div>
      </div>
      
      {/* Position size slider */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label>Position Size</Label>
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className={cn("h-10 px-3 text-sm", orderType === 'percentage' && "bg-slate-700")}
              onClick={() => setOrderType('percentage')}
            >
              <Percent className="h-4 w-4 mr-1" />
              %
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className={cn("h-10 px-3 text-sm", orderType === 'fixed' && "bg-slate-700")}
              onClick={() => setOrderType('fixed')}
            >
              <DollarSign className="h-4 w-4 mr-1" />
              USD
            </Button>
          </div>
        </div>
        
        <div className="pt-4 pb-8 px-2">
          <Slider defaultValue={positionSize} max={100} step={5} onValueChange={handlePositionSizeChange} />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[25, 50, 75, 100].map(value => (
            <Button
              key={value}
              size="sm"
              variant="outline"
              className={cn("w-full h-10 px-2 text-base", positionSize[0] === value && "bg-slate-700")}
              onClick={() => setPositionSize([value])}
            >
              {value}%
            </Button>
          ))}
        </div>
      </div>
      
      {/* Leverage control */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Label htmlFor="use-leverage">Leverage</Label>
          <Switch 
            id="use-leverage" 
            checked={useLeverage} 
            onCheckedChange={setUseLeverage} 
          />
        </div>
        
        {useLeverage && (
          <>
            <div className="pt-4 pb-8 px-2">
              <Slider 
                defaultValue={[leverage]} 
                min={1} 
                max={20} 
                step={1} 
                onValueChange={(value) => setLeverage(value[0])} 
              />
            </div>
            
            <div className="flex justify-between text-sm">
              <div className="font-medium text-amber-500 flex items-center">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Using {leverage}x Leverage
              </div>
              <Button size="sm" variant="ghost" className="h-9 px-3 py-1 text-sm">
                Info
              </Button>
            </div>
          </>
        )}
      </div>
      
      {/* Submit button */}
      <Button
        className={cn(
          "mt-auto w-full py-6 text-lg font-semibold",
          side === 'buy' ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
        )}
      >
        {side === 'buy' ? 'Buy ' : 'Sell '} 
        {symbol.slice(0, 3)} 
        {tradeType !== 'market' ? ` (${tradeType.toUpperCase()})` : ''}
      </Button>
    </div>
  );
  
  if (asCard) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="py-3 px-4 flex flex-row items-center justify-between bg-slate-800/90 border-b border-slate-700">
          <CardTitle className="text-sm font-medium">Smart Trade Panel • {symbol}</CardTitle>
          <div className="flex items-center text-sm text-slate-300">
            <div>Price: <span className="font-mono">{formatPrice(price)}</span></div>
          </div>
        </CardHeader>
        <CardContent className="p-4">
          {content}
        </CardContent>
      </Card>
    );
  }
  
  return <div className={cn("p-4", className)}>{content}</div>;
}