import React from 'react';
import { PieChart, Wallet, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Progress } from './progress';

interface PortfolioSummaryProps {
  className?: string;
}

export function PortfolioSummary({ className }: PortfolioSummaryProps) {
  // Example portfolio data
  const portfolioValue = 25784.35;
  const portfolioChange = 3.2;
  const assets = [
    { name: 'Bitcoin', symbol: 'BTC', value: 12540.25, change: 2.7, allocation: 48.6 },
    { name: 'Ethereum', symbol: 'ETH', value: 5830.75, change: 5.2, allocation: 22.6 },
    { name: 'Solana', symbol: 'SOL', value: 3245.80, change: -1.3, allocation: 12.6 },
    { name: 'USD Coin', symbol: 'USDC', value: 2500.00, change: 0, allocation: 9.7 },
    { name: 'Cardano', symbol: 'ADA', value: 1667.55, change: 7.8, allocation: 6.5 }
  ];
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700 flex justify-between items-center">
        <div>
          <div className="font-medium flex items-center">
            <Wallet className="h-4 w-4 mr-2 text-blue-500" />
            Portfolio Summary
          </div>
        </div>
        <div className="flex items-center text-xs">
          <DollarSign className="h-3.5 w-3.5 text-slate-400 mr-1" />
          <span>USD</span>
        </div>
      </div>
      
      <div className="p-4 flex-grow overflow-auto">
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-1">Total Portfolio Value</div>
          <div className="text-xl font-semibold flex items-center">
            ${portfolioValue.toLocaleString()}
            <span className={`ml-2 text-sm ${portfolioChange >= 0 ? 'text-green-500' : 'text-red-500'} flex items-center`}>
              {portfolioChange >= 0 ? (
                <ArrowUpRight className="h-3.5 w-3.5 mr-0.5" />
              ) : (
                <ArrowDownRight className="h-3.5 w-3.5 mr-0.5" />
              )}
              {Math.abs(portfolioChange)}%
            </span>
          </div>
        </div>
        
        <div className="mb-4">
          <div className="text-sm text-slate-400 mb-2 flex items-center">
            <PieChart className="h-4 w-4 mr-1 text-blue-500" />
            Asset Allocation
          </div>
          
          <div className="space-y-3">
            {assets.map((asset, index) => (
              <div key={index}>
                <div className="flex justify-between items-center mb-1">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-2 ${
                      index === 0 ? 'bg-blue-500' :
                      index === 1 ? 'bg-purple-500' :
                      index === 2 ? 'bg-orange-500' :
                      index === 3 ? 'bg-green-500' :
                      'bg-red-500'
                    }`}></div>
                    <span className="font-medium">{asset.symbol}</span>
                  </div>
                  <div className="text-xs text-slate-400">{asset.allocation}%</div>
                </div>
                <Progress value={asset.allocation} className="h-1.5 mb-1" />
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <div className="text-sm text-slate-400 mb-2 flex items-center">
            <TrendingUp className="h-4 w-4 mr-1 text-blue-500" />
            Assets
          </div>
          
          <div className="divide-y divide-slate-700">
            {assets.map((asset, index) => (
              <div key={index} className="py-2 flex justify-between">
                <div>
                  <div className="font-medium">{asset.name}</div>
                  <div className="text-xs text-slate-400">{asset.symbol}</div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${asset.value.toLocaleString()}</div>
                  <div className={`text-xs ${asset.change > 0 ? 'text-green-500' : asset.change < 0 ? 'text-red-500' : 'text-slate-400'} flex items-center justify-end`}>
                    {asset.change > 0 ? (
                      <ArrowUpRight className="h-3 w-3 mr-0.5" />
                    ) : asset.change < 0 ? (
                      <ArrowDownRight className="h-3 w-3 mr-0.5" />
                    ) : null}
                    {asset.change > 0 ? '+' : ''}{asset.change}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}