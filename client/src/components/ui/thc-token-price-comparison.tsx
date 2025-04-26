/**
 * THC Token Price Comparison Component
 * Displays price data from both Birdeye and Raydium for transparency
 */

import React from 'react';
import { useThcToken } from '../../lib/hooks/useThcToken';
import { Badge } from '@/components/ui/badge';
import { formatUsdAmount } from '../../lib/contracts/thc-token-info';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Info, ArrowUp, ArrowDown, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';

export function THCTokenPriceComparison() {
  const {
    price,
    priceChange24h,
    raydiumPrice,
    raydiumPriceChange24h,
    isLoading,
    lastUpdated,
    raydiumLastUpdated,
    dataSource,
    refreshPrice
  } = useThcToken();

  // Calculate time since last update
  const getTimeSinceUpdate = (updateTime?: Date | null) => {
    if (!updateTime) return 'Never';
    
    const now = new Date();
    const diffMs = now.getTime() - updateTime.getTime();
    const diffSec = Math.floor(diffMs / 1000);
    
    if (diffSec < 60) return `${diffSec} sec ago`;
    if (diffSec < 3600) return `${Math.floor(diffSec / 60)} min ago`;
    return `${Math.floor(diffSec / 3600)} hr ago`;
  };

  // Determine badges and colors based on data source
  const getBadgeForSource = (source: string | undefined) => {
    switch (source) {
      case 'both':
        return <Badge variant="outline" className="bg-green-900/20 text-green-400 border-green-500">Live Data (Multiple Sources)</Badge>;
      case 'birdeye':
        return <Badge variant="outline" className="bg-blue-900/20 text-blue-400 border-blue-500">Birdeye API</Badge>;
      case 'raydium':
        return <Badge variant="outline" className="bg-purple-900/20 text-purple-400 border-purple-500">Raydium API</Badge>;
      case 'fallback':
        return <Badge variant="outline" className="bg-yellow-900/20 text-yellow-400 border-yellow-500">Estimated</Badge>;
      default:
        return <Badge variant="outline" className="bg-gray-900/20 text-gray-400 border-gray-500">Unknown</Badge>;
    }
  };

  // Format price change with proper symbol
  const renderPriceChange = (change: number | undefined) => {
    if (change === undefined) return null;
    
    const isPositive = change >= 0;
    return (
      <span className={cn(
        "px-2 py-1 text-xs rounded flex items-center",
        isPositive ? "bg-green-900/30 text-green-400" : "bg-red-900/30 text-red-400"
      )}>
        {isPositive ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
        {Math.abs(change).toFixed(2)}%
      </span>
    );
  };

  return (
    <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 mb-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-md font-semibold text-white">THC Token Price Comparison</h3>
        <div className="flex items-center space-x-2">
          {getBadgeForSource(dataSource)}
          <button 
            onClick={() => refreshPrice()}
            disabled={isLoading}
            className="p-1 rounded hover:bg-gray-700 transition-colors"
            title="Refresh price data"
          >
            <RefreshCw className={cn("h-4 w-4 text-gray-400", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>
      
      {/* Birdeye Price Data */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-gray-700/30 p-3 rounded-md border border-gray-600">
          <div className="flex items-center mb-1">
            <div className="w-6 h-6 mr-2 bg-blue-800/50 rounded-full flex items-center justify-center">
              <img src="/images/birdeye-logo.png" alt="Birdeye" className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-gray-300">Birdeye Price</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <InfoCircle className="h-3 w-3 text-gray-400" />
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
              <img src="/images/raydium-logo.png" alt="Raydium" className="w-4 h-4" />
            </div>
            <h4 className="text-sm font-medium text-gray-300">Raydium LP Price</h4>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="ml-1">
                    <InfoCircle className="h-3 w-3 text-gray-400" />
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
            <InfoCircle className="h-4 w-4 mr-1 mt-0.5 flex-shrink-0" />
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