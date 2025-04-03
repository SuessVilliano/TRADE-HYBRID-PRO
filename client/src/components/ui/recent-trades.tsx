import React from 'react';

interface RecentTradesProps {
  symbol: string;
  className?: string;
}

export function RecentTrades({ symbol, className }: RecentTradesProps) {
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="font-medium">Recent Trades</div>
        <div className="text-xs text-slate-400">{symbol}</div>
      </div>
      
      <div className="flex-grow overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400 border-b border-slate-700">
              <th className="p-2 text-left">Time</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-right">Amount</th>
              <th className="p-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {[...Array(12)].map((_, i) => (
              <tr key={i} className="border-b border-slate-700 hover:bg-slate-700/50">
                <td className="p-2 text-xs text-slate-400">12:24:32</td>
                <td className={`p-2 ${i % 3 === 0 ? 'text-red-500' : 'text-green-500'}`}>
                  {`${(Math.random() * 1000 + 28000).toFixed(2)}`}
                </td>
                <td className="p-2 text-right">{`${(Math.random() * 0.1).toFixed(4)}`}</td>
                <td className="p-2 text-right">{`${(Math.random() * 1000 + 1000).toFixed(2)}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}