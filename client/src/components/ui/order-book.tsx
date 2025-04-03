import React, { useState } from 'react';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';
import { cn } from '../../lib/utils';

interface OrderBookProps {
  symbol: string;
  className?: string;
}

interface OrderData {
  price: string;
  amount: string;
  total: string;
  depth: number; // 0-100 percentage for the bar depth
}

export function OrderBook({ symbol, className }: OrderBookProps) {
  const [displayMode, setDisplayMode] = useState<'combined' | 'buy' | 'sell'>('combined');
  const [depth, setDepth] = useState(10);
  
  // Demo data for order book
  const generateDemoOrders = (count: number, isBuy: boolean, basePrice: number): OrderData[] => {
    const orders: OrderData[] = [];
    for (let i = 0; i < count; i++) {
      const price = basePrice + (isBuy ? -i * 5 : i * 5);
      const amount = Math.round((0.5 + Math.random() * 1.5) * 100) / 100;
      const depth = Math.round(Math.random() * 90 + 10) / (i + 1);
      
      orders.push({
        price: price.toFixed(2),
        amount: amount.toFixed(3),
        total: (price * amount).toFixed(2),
        depth: Math.min(100, depth)
      });
    }
    return orders;
  };
  
  const buyOrders = generateDemoOrders(20, true, 29250);
  const sellOrders = generateDemoOrders(20, false, 29260);
  
  const handleDepthChange = (newDepth: number) => {
    setDepth(newDepth);
  };
  
  const OrderRow = ({ data, type }: { data: OrderData, type: 'buy' | 'sell' }) => {
    return (
      <div className="grid grid-cols-3 py-1 text-xs relative">
        <div
          className={cn(
            "absolute top-0 bottom-0 opacity-20 z-0",
            type === 'buy' ? 'bg-green-600' : 'bg-red-600',
            type === 'buy' ? 'right-0' : 'left-0'
          )}
          style={{ width: `${data.depth}%` }}
        ></div>
        
        <div className="z-10 text-right px-2">
          {data.price}
        </div>
        <div className="z-10 text-right px-2">
          {data.amount}
        </div>
        <div className="z-10 text-right px-2">
          {data.total}
        </div>
      </div>
    );
  };
  
  const OrderHeader = () => (
    <div className="grid grid-cols-3 py-1 border-b border-slate-700 text-xs text-slate-400">
      <div className="text-right px-2">Price</div>
      <div className="text-right px-2">Amount</div>
      <div className="text-right px-2">Total</div>
    </div>
  );
  
  const renderOrderBook = () => {
    switch (displayMode) {
      case 'buy':
        return (
          <div>
            <OrderHeader />
            <div className="max-h-[400px] overflow-y-auto">
              {buyOrders.slice(0, depth).map((order, index) => (
                <OrderRow key={`buy-${index}`} data={order} type="buy" />
              ))}
            </div>
          </div>
        );
      case 'sell':
        return (
          <div>
            <OrderHeader />
            <div className="max-h-[400px] overflow-y-auto">
              {sellOrders.slice(0, depth).map((order, index) => (
                <OrderRow key={`sell-${index}`} data={order} type="sell" />
              ))}
            </div>
          </div>
        );
      case 'combined':
      default:
        return (
          <div>
            <div className="max-h-[200px] overflow-y-auto">
              {sellOrders.slice(0, depth).reverse().map((order, index) => (
                <OrderRow key={`sell-${index}`} data={order} type="sell" />
              ))}
            </div>
            
            <div className="bg-slate-700 py-2 text-center text-sm font-semibold my-1">
              <span className="text-green-500">$29,254.85</span> <span className="text-xs text-slate-400">≈ $29,254.85</span>
            </div>
            
            <div className="max-h-[200px] overflow-y-auto">
              {buyOrders.slice(0, depth).map((order, index) => (
                <OrderRow key={`buy-${index}`} data={order} type="buy" />
              ))}
            </div>
          </div>
        );
    }
  };
  
  return (
    <div className={`h-full flex flex-col ${className}`}>
      <div className="flex justify-between items-center pb-3">
        <div className="text-sm">{symbol}</div>
        
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              displayMode === 'combined' ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => setDisplayMode('combined')}
          >
            Both
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              displayMode === 'buy' ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => setDisplayMode('buy')}
          >
            Bids
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-7 px-2 text-xs",
              displayMode === 'sell' ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => setDisplayMode('sell')}
          >
            Asks
          </Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-hidden">
        {renderOrderBook()}
      </div>
      
      <div className="flex justify-end items-center pt-2 border-t border-slate-700 mt-2">
        <div className="text-xs text-slate-400 mr-2">Depth:</div>
        <div className="flex gap-1">
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs",
              depth === 5 ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => handleDepthChange(5)}
          >
            5
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs",
              depth === 10 ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => handleDepthChange(10)}
          >
            10
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            className={cn(
              "h-6 px-2 text-xs",
              depth === 20 ? 'bg-slate-700' : 'text-slate-400'
            )}
            onClick={() => handleDepthChange(20)}
          >
            20
          </Button>
        </div>
      </div>
    </div>
  );
}