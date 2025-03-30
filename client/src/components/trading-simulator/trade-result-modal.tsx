import React from 'react';
import { Button } from '../ui/button';

interface TradeResultModalProps {
  result: {
    asset: string;
    type: 'buy' | 'sell';
    entryPrice: number;
    exitPrice: number;
    size: number;
    profit: number;
    profitPercentage: number;
    openedAt: Date;
    closedAt: Date;
  };
  onClose: () => void;
}

const TradeResultModal: React.FC<TradeResultModalProps> = ({ result, onClose }) => {
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Format time duration
  const formatDuration = (start: Date, end: Date): string => {
    const diffMs = end.getTime() - start.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    
    if (diffSecs < 60) {
      return `${diffSecs} seconds`;
    } else if (diffSecs < 3600) {
      const mins = Math.floor(diffSecs / 60);
      return `${mins} minute${mins > 1 ? 's' : ''}`;
    } else {
      const hours = Math.floor(diffSecs / 3600);
      const mins = Math.floor((diffSecs % 3600) / 60);
      return `${hours} hour${hours > 1 ? 's' : ''} ${mins} minute${mins > 1 ? 's' : ''}`;
    }
  };
  
  // Get trading tips based on result
  const getTradingTip = (result: TradeResultModalProps['result']): string => {
    if (result.profit > 0) {
      if (result.profitPercentage > 15) {
        return "Great trade! Remember that consistent smaller gains often outperform occasional large wins in the long run.";
      } else {
        return "Good job! Always stick to your trading plan and take profits according to your strategy.";
      }
    } else {
      if (result.profitPercentage < -15) {
        return "Markets can be unpredictable. Consider using stop losses to limit potential losses in future trades.";
      } else {
        return "Even professional traders have losing trades. Focus on your overall win rate and risk management.";
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-900 border border-slate-700 rounded-lg max-w-md w-full shadow-xl">
        <div className={`p-5 rounded-t-lg text-white ${result.profit >= 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
          <h2 className="text-xl font-bold mb-1">
            Trade {result.profit >= 0 ? 'Profit' : 'Loss'}
          </h2>
          <p className="text-sm text-white/80">
            {result.type === 'buy' ? 'Long' : 'Short'} {result.asset}
          </p>
        </div>
        
        <div className="p-5">
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p className="text-slate-400 text-sm">Result</p>
              <p className={`text-xl font-bold ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {formatCurrency(result.profit)}
              </p>
              <p className={`text-sm ${result.profit >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {result.profitPercentage.toFixed(2)}%
              </p>
            </div>
            
            <div>
              <p className="text-slate-400 text-sm">Trade Duration</p>
              <p className="text-lg font-medium">
                {formatDuration(new Date(result.openedAt), new Date(result.closedAt))}
              </p>
            </div>
          </div>
          
          <div className="mb-6 space-y-3">
            <div className="flex justify-between">
              <span className="text-slate-400">Position Size</span>
              <span className="font-medium">{formatCurrency(result.size)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Entry Price</span>
              <span className="font-medium">{formatCurrency(result.entryPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Exit Price</span>
              <span className="font-medium">{formatCurrency(result.exitPrice)}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-slate-400">Price Change</span>
              <span className={`font-medium ${
                result.exitPrice > result.entryPrice ? 'text-green-500' : 
                result.exitPrice < result.entryPrice ? 'text-red-500' : ''}
              `}>
                {((result.exitPrice - result.entryPrice) / result.entryPrice * 100).toFixed(2)}%
              </span>
            </div>
          </div>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-md p-3 mb-6">
            <h3 className="text-blue-300 font-medium mb-1">Trading Tip</h3>
            <p className="text-sm text-slate-300">{getTradingTip(result)}</p>
          </div>
          
          <Button className="w-full" onClick={onClose}>
            Continue Trading
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TradeResultModal;