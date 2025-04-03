import React, { useState } from 'react';
import { AreaChart, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { cn } from '../../lib/utils';

interface RecentTradesProps {
  symbol: string;
  className?: string;
}

interface Trade {
  id: string;
  price: string;
  amount: string;
  value: string;
  time: string;
  type: 'buy' | 'sell';
}

export function RecentTrades({ symbol, className }: RecentTradesProps) {
  // Example data for recent trades
  const recentTrades: Trade[] = [
    { id: '1', price: '29,241.50', amount: '0.142', value: '4,152.29', time: '19:41:32', type: 'buy' },
    { id: '2', price: '29,238.25', amount: '0.075', value: '2,192.87', time: '19:41:24', type: 'sell' },
    { id: '3', price: '29,239.10', amount: '0.021', value: '614.02', time: '19:41:15', type: 'sell' },
    { id: '4', price: '29,242.75', amount: '0.310', value: '9,065.25', time: '19:41:08', type: 'buy' },
    { id: '5', price: '29,245.00', amount: '0.185', value: '5,410.33', time: '19:40:54', type: 'buy' },
    { id: '6', price: '29,240.00', amount: '0.066', value: '1,929.84', time: '19:40:42', type: 'sell' },
    { id: '7', price: '29,236.50', amount: '0.125', value: '3,654.56', time: '19:40:31', type: 'sell' },
    { id: '8', price: '29,239.80', amount: '0.047', value: '1,374.27', time: '19:40:23', type: 'buy' },
    { id: '9', price: '29,243.75', amount: '0.251', value: '7,340.18', time: '19:40:15', type: 'buy' },
    { id: '10', price: '29,238.00', amount: '0.092', value: '2,689.90', time: '19:40:02', type: 'sell' },
    { id: '11', price: '29,235.60', amount: '0.135', value: '3,946.81', time: '19:39:54', type: 'sell' },
    { id: '12', price: '29,240.30', amount: '0.078', value: '2,280.74', time: '19:39:48', type: 'buy' },
  ];
  
  const [filter, setFilter] = useState<'all' | 'buys' | 'sells'>('all');
  
  const filteredTrades = recentTrades.filter(trade => {
    if (filter === 'all') return true;
    if (filter === 'buys') return trade.type === 'buy';
    if (filter === 'sells') return trade.type === 'sell';
    return true;
  });
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <AreaChart className="h-4 w-4 text-blue-500 mr-2" />
            <div className="font-medium">Recent Trades</div>
          </div>
          <div className="text-xs text-slate-400">{symbol}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-end px-3 py-2 border-b border-slate-700 bg-slate-800">
        <div className="flex space-x-1 text-xs">
          <button 
            className={cn(
              "px-2 py-1 rounded",
              filter === 'all' ? 'bg-slate-700' : 'hover:bg-slate-700/50 text-slate-400'
            )}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          <button 
            className={cn(
              "px-2 py-1 rounded",
              filter === 'buys' ? 'bg-slate-700' : 'hover:bg-slate-700/50 text-slate-400'
            )}
            onClick={() => setFilter('buys')}
          >
            Buys
          </button>
          <button 
            className={cn(
              "px-2 py-1 rounded",
              filter === 'sells' ? 'bg-slate-700' : 'hover:bg-slate-700/50 text-slate-400'
            )}
            onClick={() => setFilter('sells')}
          >
            Sells
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="text-slate-400 bg-slate-800">
              <th className="font-medium text-left px-3 py-2">Price</th>
              <th className="font-medium text-right px-3 py-2">Amount</th>
              <th className="font-medium text-right px-3 py-2">Value</th>
              <th className="font-medium text-right px-3 py-2">Time</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {filteredTrades.map((trade) => (
              <tr key={trade.id} className="hover:bg-slate-700/30">
                <td className="px-3 py-2">
                  <div className="flex items-center">
                    {trade.type === 'buy' ? (
                      <ArrowUpRight className="h-3 w-3 text-green-500 mr-1.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-500 mr-1.5" />
                    )}
                    <span className={trade.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                      ${trade.price}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-2 text-right">{trade.amount}</td>
                <td className="px-3 py-2 text-right">${trade.value}</td>
                <td className="px-3 py-2 text-right text-slate-400">{trade.time}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}