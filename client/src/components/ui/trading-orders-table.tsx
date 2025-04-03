import React from 'react';
import { ClipboardList, X, ExternalLink } from 'lucide-react';
import { Button } from './button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs';

interface TradingOrdersTableProps {
  symbol: string;
  className?: string;
}

interface Order {
  id: string;
  symbol: string;
  type: 'limit' | 'market' | 'stop_limit';
  side: 'buy' | 'sell';
  price: number;
  amount: number;
  filled: number;
  status: 'open' | 'filled' | 'canceled' | 'partially_filled';
  time: string;
}

export function TradingOrdersTable({ symbol, className }: TradingOrdersTableProps) {
  // Demo data for open orders
  const openOrders: Order[] = [
    {
      id: '1234567890',
      symbol: 'BTCUSDT',
      type: 'limit',
      side: 'buy',
      price: 29050.50,
      amount: 0.15,
      filled: 0,
      status: 'open',
      time: '2025-04-03 15:23:45'
    },
    {
      id: '1234567891',
      symbol: 'ETHUSDT',
      type: 'stop_limit',
      side: 'sell',
      price: 3590.25,
      amount: 1.5,
      filled: 0,
      status: 'open',
      time: '2025-04-03 16:10:20'
    }
  ];
  
  // Demo data for order history
  const orderHistory: Order[] = [
    {
      id: '1234567880',
      symbol: 'BTCUSDT',
      type: 'market',
      side: 'buy',
      price: 29140.75,
      amount: 0.1,
      filled: 0.1,
      status: 'filled',
      time: '2025-04-03 14:45:30'
    },
    {
      id: '1234567870',
      symbol: 'SOLUSDT',
      type: 'limit',
      side: 'sell',
      price: 195.50,
      amount: 10,
      filled: 10,
      status: 'filled',
      time: '2025-04-03 13:20:15'
    },
    {
      id: '1234567860',
      symbol: 'ETHUSDT',
      type: 'limit',
      side: 'buy',
      price: 3450.25,
      amount: 0.75,
      filled: 0.75,
      status: 'filled',
      time: '2025-04-03 11:05:40'
    },
    {
      id: '1234567850',
      symbol: 'BTCUSDT',
      type: 'limit',
      side: 'sell',
      price: 29800.50,
      amount: 0.08,
      filled: 0,
      status: 'canceled',
      time: '2025-04-03 09:15:10'
    }
  ];
  
  const TableHeader = () => (
    <div className="grid grid-cols-7 text-xs text-slate-400 border-b border-slate-700 pb-2">
      <div>Symbol</div>
      <div>Type</div>
      <div>Side</div>
      <div className="text-right">Price</div>
      <div className="text-right">Amount</div>
      <div className="text-right">Filled</div>
      <div className="text-right">Actions</div>
    </div>
  );
  
  const OrderRow = ({ order, showCancel = false }: { order: Order, showCancel?: boolean }) => (
    <div className="grid grid-cols-7 text-xs py-3 border-b border-slate-700/50">
      <div className="flex items-center">
        <span>{order.symbol}</span>
      </div>
      <div>
        <span className="capitalize">{order.type.replace('_', ' ')}</span>
      </div>
      <div>
        <span className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
          {order.side === 'buy' ? 'Buy' : 'Sell'}
        </span>
      </div>
      <div className="text-right">${order.price.toFixed(2)}</div>
      <div className="text-right">{order.amount.toFixed(order.amount < 1 ? 6 : 2)}</div>
      <div className="text-right">
        {order.filled > 0 ? (
          <span className={order.status === 'filled' ? 'text-green-500' : 'text-blue-500'}>
            {order.filled.toFixed(order.filled < 1 ? 6 : 2)}
          </span>
        ) : (
          <span>-</span>
        )}
      </div>
      <div className="flex justify-end space-x-1">
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <ExternalLink className="h-3.5 w-3.5 text-slate-400" />
        </Button>
        {showCancel && (
          <Button variant="ghost" size="icon" className="h-6 w-6 text-red-400 hover:text-red-300 hover:bg-red-900/20">
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    </div>
  );
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <ClipboardList className="h-4 w-4 text-blue-500 mr-2" />
            <div className="font-medium">Orders</div>
          </div>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-hidden">
        <Tabs defaultValue="open" className="h-full flex flex-col">
          <TabsList className="mb-4 grid w-full grid-cols-2">
            <TabsTrigger value="open">Open Orders</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
          </TabsList>
          
          <TabsContent value="open" className="flex-grow overflow-auto">
            {openOrders.length > 0 ? (
              <div className="space-y-1">
                <TableHeader />
                <div>
                  {openOrders.map((order) => (
                    <OrderRow key={order.id} order={order} showCancel={true} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
                <p>No open orders</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="flex-grow overflow-auto">
            {orderHistory.length > 0 ? (
              <div className="space-y-1">
                <TableHeader />
                <div>
                  {orderHistory.map((order) => (
                    <OrderRow key={order.id} order={order} />
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-slate-400">
                <ClipboardList className="h-10 w-10 mb-2 opacity-30" />
                <p>No order history</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}