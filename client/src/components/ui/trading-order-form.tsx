import React, { useState } from 'react';
import { Button } from './button';
import { Input } from './input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';
import { Switch } from './switch';
import { Label } from './label';
import { Slider } from './slider';

interface TradingOrderFormProps {
  symbol: string;
  className?: string;
}

export function TradingOrderForm({ symbol, className }: TradingOrderFormProps) {
  const [orderType, setOrderType] = useState('limit');
  const [side, setSide] = useState('buy');
  const [price, setPrice] = useState('');
  const [amount, setAmount] = useState('');
  const [total, setTotal] = useState('');
  const [leverage, setLeverage] = useState([5]);
  const [advanced, setAdvanced] = useState(false);
  
  const handleCalculateTotal = (newAmount: string) => {
    if (newAmount && price) {
      const calculatedTotal = parseFloat(newAmount) * parseFloat(price);
      setTotal(calculatedTotal.toFixed(2));
    } else {
      setTotal('');
    }
  };
  
  const handleCalculateAmount = (newTotal: string) => {
    if (newTotal && price && parseFloat(price) > 0) {
      const calculatedAmount = parseFloat(newTotal) / parseFloat(price);
      setAmount(calculatedAmount.toFixed(6));
    } else {
      setAmount('');
    }
  };
  
  const handlePriceChange = (newPrice: string) => {
    setPrice(newPrice);
    if (amount) {
      const calculatedTotal = parseFloat(amount) * parseFloat(newPrice || '0');
      setTotal(calculatedTotal.toFixed(2));
    }
  };
  
  const handlePercentageClick = (percent: number) => {
    // Assume we have a max balance of 1000 USDT for this example
    const maxBalance = 1000;
    const newTotal = (maxBalance * percent / 100).toFixed(2);
    setTotal(newTotal);
    handleCalculateAmount(newTotal);
  };
  
  return (
    <div className={`w-full h-full flex flex-col ${className}`}>
      <Tabs defaultValue="spot" className="w-full">
        <TabsList className="w-full grid grid-cols-2 mb-4">
          <TabsTrigger value="spot">Spot</TabsTrigger>
          <TabsTrigger value="futures">Futures</TabsTrigger>
        </TabsList>
        
        <TabsContent value="spot" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'}
              onClick={() => setSide('buy')}
              className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Buy
            </Button>
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'}
              onClick={() => setSide('sell')}
              className={side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Sell
            </Button>
          </div>
          
          <div>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger>
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop_limit">Stop Limit</SelectItem>
                <SelectItem value="oco">OCO</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {orderType !== 'market' && (
            <div>
              <Label>Price ({symbol.slice(-4)})</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label>Amount ({symbol.slice(0, -4)})</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                handleCalculateTotal(e.target.value);
              }}
            />
          </div>
          
          <div>
            <Label>Total ({symbol.slice(-4)})</Label>
            <Input 
              type="number" 
              placeholder="0.00"
              value={total}
              onChange={(e) => {
                setTotal(e.target.value);
                handleCalculateAmount(e.target.value);
              }}
            />
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(25)}>25%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(50)}>50%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(75)}>75%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(100)}>100%</Button>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch id="advanced-options" checked={advanced} onCheckedChange={setAdvanced} />
            <Label htmlFor="advanced-options">Advanced Options</Label>
          </div>
          
          {advanced && (
            <div className="space-y-3 bg-slate-800 p-3 rounded-md">
              <div>
                <Label>Time In Force</Label>
                <Select defaultValue="gtc">
                  <SelectTrigger>
                    <SelectValue placeholder="Time In Force" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gtc">Good Till Cancelled</SelectItem>
                    <SelectItem value="ioc">Immediate or Cancel</SelectItem>
                    <SelectItem value="fok">Fill or Kill</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <div className="flex justify-between mb-1">
                  <Label>Post Only</Label>
                  <Switch />
                </div>
                <p className="text-xs text-slate-400">Order will only be accepted if it doesn't match immediately</p>
              </div>
            </div>
          )}
          
          <Button 
            className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {side === 'buy' ? 'Buy' : 'Sell'} {symbol.slice(0, -4)}
          </Button>
        </TabsContent>
        
        <TabsContent value="futures" className="space-y-4">
          <div className="grid grid-cols-2 gap-2">
            <Button 
              variant={side === 'buy' ? 'default' : 'outline'}
              onClick={() => setSide('buy')}
              className={side === 'buy' ? 'bg-green-600 hover:bg-green-700' : ''}
            >
              Long
            </Button>
            <Button 
              variant={side === 'sell' ? 'default' : 'outline'}
              onClick={() => setSide('sell')}
              className={side === 'sell' ? 'bg-red-600 hover:bg-red-700' : ''}
            >
              Short
            </Button>
          </div>
          
          <div>
            <Label>Leverage ({leverage}x)</Label>
            <Slider
              value={leverage}
              onValueChange={setLeverage}
              max={20}
              min={1}
              step={1}
            />
          </div>
          
          <div>
            <Select value={orderType} onValueChange={setOrderType}>
              <SelectTrigger>
                <SelectValue placeholder="Order Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="market">Market</SelectItem>
                <SelectItem value="limit">Limit</SelectItem>
                <SelectItem value="stop_market">Stop Market</SelectItem>
                <SelectItem value="stop_limit">Stop Limit</SelectItem>
                <SelectItem value="trailing_stop">Trailing Stop</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {orderType !== 'market' && (
            <div>
              <Label>Price ({symbol.slice(-4)})</Label>
              <Input 
                type="number" 
                placeholder="0.00" 
                value={price}
                onChange={(e) => handlePriceChange(e.target.value)}
              />
            </div>
          )}
          
          <div>
            <Label>Amount ({symbol.slice(0, -4)})</Label>
            <Input 
              type="number" 
              placeholder="0.00" 
              value={amount}
              onChange={(e) => {
                setAmount(e.target.value);
                handleCalculateTotal(e.target.value);
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Take Profit</Label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div>
              <Label>Stop Loss</Label>
              <Input type="number" placeholder="0.00" />
            </div>
          </div>
          
          <div className="grid grid-cols-4 gap-2">
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(25)}>25%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(50)}>50%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(75)}>75%</Button>
            <Button variant="outline" size="sm" onClick={() => handlePercentageClick(100)}>100%</Button>
          </div>
          
          <Button 
            className={`w-full ${side === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {side === 'buy' ? 'Long' : 'Short'} {symbol.slice(0, -4)}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
}