import React, { useState, useEffect } from 'react';
import { PopupContainer } from '../ui/popup-container';
import { Button } from '../ui/button';
import EducationalTooltip from './educational-tooltip';

interface TradeActionPanelProps {
  asset: string | null;
  currentPrice: number | null;
  balance: number;
  positionSize: number;
  setPositionSize: (size: number) => void;
  positionType: 'buy' | 'sell';
  setPositionType: (type: 'buy' | 'sell') => void;
  onOpenPosition: () => void;
  activePosition: any | null;
  onShowTooltip: (tooltipId: string) => void;
  tooltipVisible: string;
  onCloseTooltip: () => void;
}

const TradeActionPanel: React.FC<TradeActionPanelProps> = ({
  asset,
  currentPrice,
  balance,
  positionSize,
  setPositionSize,
  positionType,
  setPositionType,
  onOpenPosition,
  activePosition,
  onShowTooltip,
  tooltipVisible,
  onCloseTooltip
}) => {
  const [error, setError] = useState<string | null>(null);
  const [percentOfBalance, setPercentOfBalance] = useState(10);
  
  // Format currency
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };
  
  // Update position size when percent changes
  useEffect(() => {
    setPositionSize(balance * (percentOfBalance / 100));
  }, [percentOfBalance, balance, setPositionSize]);
  
  // Validate before opening position
  const handleOpenPosition = () => {
    if (!asset) {
      setError('Please select an asset to trade');
      return;
    }
    
    if (positionSize <= 0) {
      setError('Position size must be greater than 0');
      return;
    }
    
    if (positionSize > balance) {
      setError('Position size cannot exceed your balance');
      return;
    }
    
    if (activePosition) {
      setError('You already have an open position. Close it before opening a new one.');
      return;
    }
    
    setError(null);
    onOpenPosition();
  };
  
  return (
    <PopupContainer padding className="relative">
      {error && (
        <div className="absolute top-0 left-0 right-0 bg-red-500/20 border border-red-500 text-red-300 p-3 rounded-t-md">
          {error}
        </div>
      )}
      
      <div className={`${error ? 'mt-12' : ''}`}>
        <h2 className="text-lg font-bold mb-4">New Position</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-sm flex items-center">
                  Asset
                  <button 
                    className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                    onClick={() => onShowTooltip('trade_asset')}
                  >
                    i
                  </button>
                </label>
              </div>
              
              {tooltipVisible === 'trade_asset' && (
                <EducationalTooltip 
                  title="Trading Asset"
                  content="This is the financial instrument you are trading. Each asset has different price movements based on market conditions."
                  onClose={onCloseTooltip}
                />
              )}
              
              <div className="bg-slate-800 border border-slate-700 rounded-md p-3">
                {asset ? (
                  <div className="flex items-center">
                    <div className="h-6 w-6 mr-2">
                      <img 
                        src={`/assets/icons/${asset.toLowerCase()}.svg`} 
                        alt={asset}
                        className="h-full w-full object-contain" 
                      />
                    </div>
                    <span className="font-medium">{asset}</span>
                  </div>
                ) : (
                  <span className="text-slate-400">Select an asset first</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-sm flex items-center">
                  Current Price
                  <button 
                    className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                    onClick={() => onShowTooltip('price')}
                  >
                    i
                  </button>
                </label>
              </div>
              
              {tooltipVisible === 'price' && (
                <EducationalTooltip 
                  title="Current Price"
                  content="This is the current market price of the selected asset. When you open a position, this will be your entry price."
                  onClose={onCloseTooltip}
                />
              )}
              
              <div className="bg-slate-800 border border-slate-700 rounded-md p-3">
                {currentPrice ? (
                  <span className="font-medium">{formatCurrency(currentPrice)}</span>
                ) : (
                  <span className="text-slate-400">N/A</span>
                )}
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-sm flex items-center">
                  Position Type
                  <button 
                    className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                    onClick={() => onShowTooltip('position_type')}
                  >
                    i
                  </button>
                </label>
              </div>
              
              {tooltipVisible === 'position_type' && (
                <EducationalTooltip 
                  title="Position Type"
                  content="Buy (Long): You profit when the price goes up. Sell (Short): You profit when the price goes down. Choose based on your market direction prediction."
                  onClose={onCloseTooltip}
                />
              )}
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  className={`py-2 rounded-md font-medium transition-colors ${
                    positionType === 'buy' 
                      ? 'bg-green-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => setPositionType('buy')}
                >
                  Buy (Long)
                </button>
                
                <button
                  className={`py-2 rounded-md font-medium transition-colors ${
                    positionType === 'sell' 
                      ? 'bg-red-500 text-white' 
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                  onClick={() => setPositionType('sell')}
                >
                  Sell (Short)
                </button>
              </div>
            </div>
          </div>
          
          {/* Right Column */}
          <div className="space-y-6">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-sm flex items-center">
                  Position Size
                  <button 
                    className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                    onClick={() => onShowTooltip('position_size')}
                  >
                    i
                  </button>
                </label>
                <span className="text-xs text-slate-400">Balance: {formatCurrency(balance)}</span>
              </div>
              
              {tooltipVisible === 'position_size' && (
                <EducationalTooltip 
                  title="Position Size"
                  content="This is the amount of money you want to invest in this trade. Using a percentage of your balance for each trade is a good risk management practice."
                  onClose={onCloseTooltip}
                />
              )}
              
              <div className="grid grid-cols-4 gap-2 mb-2">
                {[10, 25, 50, 75].map((percent) => (
                  <button
                    key={percent}
                    className={`px-2 py-1 text-sm rounded ${
                      percentOfBalance === percent 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                    }`}
                    onClick={() => setPercentOfBalance(percent)}
                  >
                    {percent}%
                  </button>
                ))}
              </div>
              
              <div className="bg-slate-800 border border-slate-700 rounded-md p-3 mb-1">
                <span className="font-medium">{formatCurrency(positionSize)}</span>
              </div>
              
              <div className="text-xs text-slate-400 flex justify-between">
                <span>{percentOfBalance}% of your balance</span>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-slate-300 text-sm flex items-center">
                  Risk Management
                  <button 
                    className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
                    onClick={() => onShowTooltip('risk')}
                  >
                    i
                  </button>
                </label>
              </div>
              
              {tooltipVisible === 'risk' && (
                <EducationalTooltip 
                  title="Risk Management"
                  content="Risk management is crucial in trading. Never risk more than you can afford to lose. Consider using stop losses in real trading to protect your capital."
                  onClose={onCloseTooltip}
                />
              )}
              
              <div className="bg-slate-800 border border-slate-700 rounded-md p-3 text-sm text-slate-300">
                <p>• Don't risk more than 1-5% of your account on a single trade</p>
                <p>• Determine your exit strategy before entering a trade</p>
                <p>• In real trading, always use stop losses</p>
              </div>
            </div>
            
            <Button
              className={`w-full ${positionType === 'buy' ? 'bg-green-500 hover:bg-green-600' : 'bg-red-500 hover:bg-red-600'}`}
              disabled={!asset || activePosition !== null}
              onClick={handleOpenPosition}
            >
              {positionType === 'buy' ? 'Buy' : 'Sell'} {asset || 'Asset'}
            </Button>
          </div>
        </div>
      </div>
    </PopupContainer>
  );
};

export default TradeActionPanel;