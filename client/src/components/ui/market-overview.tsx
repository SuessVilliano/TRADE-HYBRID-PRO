import React from 'react';

interface MarketOverviewProps {
  className?: string;
}

export function MarketOverview({ className }: MarketOverviewProps) {
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="font-medium">Market Overview</div>
      </div>
      
      <div className="p-2 flex-grow overflow-y-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-800 text-slate-400">
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-right">Price</th>
              <th className="p-2 text-right">24h %</th>
              <th className="p-2 text-right">7d %</th>
              <th className="p-2 text-right">Market Cap</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-orange-500 rounded-full mr-2"></div>
                  <div>
                    <div>Bitcoin</div>
                    <div className="text-xs text-slate-400">BTC</div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">$28,422.63</td>
              <td className="p-2 text-right text-green-500">+1.24%</td>
              <td className="p-2 text-right text-red-500">-2.54%</td>
              <td className="p-2 text-right">$550.9B</td>
            </tr>
            
            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                  <div>
                    <div>Ethereum</div>
                    <div className="text-xs text-slate-400">ETH</div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">$1,732.84</td>
              <td className="p-2 text-right text-green-500">+2.67%</td>
              <td className="p-2 text-right text-green-500">+1.12%</td>
              <td className="p-2 text-right">$208.2B</td>
            </tr>
            
            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                  <div>
                    <div>Solana</div>
                    <div className="text-xs text-slate-400">SOL</div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">$24.89</td>
              <td className="p-2 text-right text-green-500">+5.34%</td>
              <td className="p-2 text-right text-green-500">+12.76%</td>
              <td className="p-2 text-right">$10.3B</td>
            </tr>
            
            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-yellow-500 rounded-full mr-2"></div>
                  <div>
                    <div>Binance Coin</div>
                    <div className="text-xs text-slate-400">BNB</div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">$213.67</td>
              <td className="p-2 text-right text-red-500">-0.87%</td>
              <td className="p-2 text-right text-red-500">-4.23%</td>
              <td className="p-2 text-right">$32.8B</td>
            </tr>
            
            <tr className="border-b border-slate-700 hover:bg-slate-700/50">
              <td className="p-2">
                <div className="flex items-center">
                  <div className="w-6 h-6 bg-gray-500 rounded-full mr-2"></div>
                  <div>
                    <div>Cardano</div>
                    <div className="text-xs text-slate-400">ADA</div>
                  </div>
                </div>
              </td>
              <td className="p-2 text-right">$0.27</td>
              <td className="p-2 text-right text-green-500">+1.12%</td>
              <td className="p-2 text-right text-green-500">+3.45%</td>
              <td className="p-2 text-right">$9.5B</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}