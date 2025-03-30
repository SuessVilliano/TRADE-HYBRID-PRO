import React from 'react';
import { PopupContainer } from '../ui/popup-container';
import EducationalTooltip from './educational-tooltip';

interface AssetSelectorProps {
  selectedAsset: string | null;
  onSelectAsset: (asset: string) => void;
  onShowTooltip: () => void;
  tooltipVisible: boolean;
  onCloseTooltip: () => void;
}

const AssetSelector: React.FC<AssetSelectorProps> = ({
  selectedAsset,
  onSelectAsset,
  onShowTooltip,
  tooltipVisible,
  onCloseTooltip
}) => {
  // Available assets for trading
  const assets = [
    { id: 'BTC', name: 'Bitcoin', icon: '/assets/icons/bitcoin.svg' },
    { id: 'AAPL', name: 'Apple Inc.', icon: '/assets/icons/apple.svg' },
    { id: 'COIN', name: 'Coinbase', icon: '/assets/icons/coinbase.svg' },
    { id: 'MCD', name: 'McDonalds', icon: '/assets/icons/mcdonalds.svg' },
    { id: 'AMZN', name: 'Amazon', icon: '/assets/icons/amazon.svg' }
  ];

  return (
    <PopupContainer padding>
      <h2 className="text-lg font-bold mb-4 flex items-center">
        Assets
        <button 
          className="ml-2 bg-blue-500/20 text-blue-300 rounded-md px-2 py-0.5 text-xs"
          onClick={onShowTooltip}
        >
          i
        </button>
      </h2>
      
      {tooltipVisible && (
        <EducationalTooltip 
          title="Trading Assets"
          content="Select an asset to trade from this list. Each asset has its own price movement patterns and volatility. You can only have one open position at a time."
          onClose={onCloseTooltip}
        />
      )}
      
      <div className="space-y-2">
        {assets.map((asset) => (
          <div 
            key={asset.id}
            className={`border ${selectedAsset === asset.id ? 'border-blue-500 bg-blue-500/10' : 'border-slate-700 hover:border-slate-500'} rounded-md p-3 cursor-pointer transition-colors`}
            onClick={() => onSelectAsset(asset.id)}
          >
            <div className="flex items-center">
              <div className="h-8 w-8 mr-3 flex-shrink-0">
                <img 
                  src={asset.icon} 
                  alt={asset.name} 
                  className="h-full w-full object-contain" 
                />
              </div>
              <div>
                <p className="font-medium">{asset.name}</p>
                <p className="text-xs text-slate-400">{asset.id}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </PopupContainer>
  );
};

export default AssetSelector;