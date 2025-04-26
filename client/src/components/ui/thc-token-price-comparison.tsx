import React from 'react';
import { Info } from 'lucide-react';
import { useThcToken } from '@/lib/hooks/useThcToken';
import { formatUsdAmount } from '@/lib/contracts/thc-token-info';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

/**
 * THC Token Price Comparison Component
 * 
 * This component displays THC token price data from both Birdeye and Raydium sources
 * for maximum transparency. It helps users to compare prices between different
 * sources and identify potential arbitrage opportunities.
 */
const THCTokenPriceComparison: React.FC = () => {
  // Get token price data from both sources
  const {
    price,
    priceChange24h,
    lastUpdated,
    raydiumPrice,
    raydiumPriceChange24h,
    raydiumLastUpdated,
    dataSource
  } = useThcToken();

  // Format time since last update for display
  const getTimeSinceUpdate = (date: Date | null | undefined): string => {
    if (!date) return 'N/A';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    // Convert milliseconds to minutes and seconds
    const minutes = Math.floor(diff / 60000);
    const seconds = Math.floor((diff % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}m ${seconds}s ago`;
    } else {
      return `${seconds}s ago`;
    }
  };

  // Render price change with color and arrow
  const renderPriceChange = (change: number | undefined): JSX.Element => {
    if (change === undefined) {
      return <span className="text-xs text-gray-500">No data</span>;
    }
    
    const isPositive = change >= 0;
    const colorClass = isPositive ? 'text-green-500' : 'text-red-500';
    const arrow = isPositive ? '↑' : '↓';
    
    return (
      <span className={`${colorClass} text-xs font-medium`}>
        {arrow} {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
      <h3 className="text-lg font-semibold text-white mb-2">
        THC Token Price Comparison
      </h3>
      
      <p className="text-sm text-gray-400 mb-4">
        Compare THC token prices from multiple decentralized exchange sources for maximum transparency.
      </p>
      
      {/* Birdeye Price Data */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 p-3 rounded-md border border-gray-600">
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 mr-2 bg-blue-800/50 rounded-full flex items-center justify-center">
              <img src="/images/birdeye-logo.svg" alt="Birdeye" className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-gray-300">Birdeye Price</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <Info className="h-3 w-3 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700 text-white text-xs p-2">
                  <p>Price data from Birdeye API, updated {getTimeSinceUpdate(lastUpdated)}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex justify-between mt-2">
            <div className="text-lg font-bold text-white">{formatUsdAmount(price)}</div>
            <div>{renderPriceChange(priceChange24h)}</div>
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            Last updated: {getTimeSinceUpdate(lastUpdated)}
          </div>
        </div>
        
        {/* Raydium Price Data */}
        <div className="bg-gray-700/30 p-3 rounded-md border border-gray-600">
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 mr-2 bg-purple-800/50 rounded-full flex items-center justify-center">
              <img src="/images/raydium-logo.svg" alt="Raydium" className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-gray-300">Raydium LP Price</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <Info className="h-3 w-3 text-gray-400" />
                  </button>
                </TooltipTrigger>
                <TooltipContent className="bg-gray-800 border-gray-700 text-white text-xs p-2">
                  <p>
                    Price data from Raydium USDC/THC liquidity pool, 
                    updated {getTimeSinceUpdate(raydiumLastUpdated)}
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          
          <div className="flex justify-between mt-2">
            <div className="text-lg font-bold text-white">
              {raydiumPrice ? formatUsdAmount(raydiumPrice) : 'N/A'}
            </div>
            <div>
              {raydiumPriceChange24h !== undefined ? 
                renderPriceChange(raydiumPriceChange24h) : 
                <span className="text-xs text-gray-500">No change data</span>
              }
            </div>
          </div>
          
          <div className="text-xs text-gray-400 mt-2">
            Last updated: {getTimeSinceUpdate(raydiumLastUpdated)}
          </div>
        </div>
      </div>
      
      {/* Info alert about price differences */}
      {raydiumPrice && Math.abs((raydiumPrice - price) / price) > 0.03 && (
        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded p-2 text-xs text-yellow-400">
          <div className="flex items-start">
            <Info className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
            <div>
              Price differences between Birdeye and Raydium are normal and reflect real market conditions.
              Larger differences may indicate arbitrage opportunities or varying liquidity between markets.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default THCTokenPriceComparison;