import React from 'react';
import { BarChart3 } from 'lucide-react';

interface MarketDepthProps {
  symbol: string;
  className?: string;
}

export function MarketDepth({ symbol, className }: MarketDepthProps) {
  // In a real implementation, this would be using actual market data
  // For this demo, we'll use a static visualization
  
  return (
    <div className={`w-full h-full bg-slate-800 rounded-md flex flex-col ${className}`}>
      <div className="p-3 border-b border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BarChart3 className="h-4 w-4 text-blue-500 mr-2" />
            <div className="font-medium">Market Depth</div>
          </div>
          <div className="text-xs text-slate-400">{symbol}</div>
        </div>
      </div>
      
      <div className="flex-grow p-4 flex flex-col justify-center items-center relative">
        {/* This would typically be a Canvas or SVG chart */}
        <div className="w-full h-full relative">
          {/* X-axis (price) */}
          <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-slate-700"></div>
          
          {/* Y-axis (volume) */}
          <div className="absolute top-0 bottom-0 left-0 w-0.5 bg-slate-700"></div>
          
          {/* Current price line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 border-l border-dashed border-blue-500"></div>
          
          {/* Bid curve */}
          <div 
            className="absolute bottom-0 left-0 w-1/2 h-3/4"
            style={{
              background: 'linear-gradient(to bottom right, rgba(34, 197, 94, 0.3), transparent)',
              clipPath: 'polygon(0% 100%, 100% 100%, 100% 0%)'
            }}
          ></div>
          
          {/* Ask curve */}
          <div 
            className="absolute bottom-0 right-0 w-1/2 h-2/3"
            style={{
              background: 'linear-gradient(to bottom left, rgba(239, 68, 68, 0.3), transparent)',
              clipPath: 'polygon(0% 0%, 0% 100%, 100% 100%)'
            }}
          ></div>
          
          {/* Price labels */}
          <div className="absolute bottom-2 left-4 text-xs text-green-500">$29,150</div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-blue-500">$29,250</div>
          <div className="absolute bottom-2 right-4 text-xs text-red-500">$29,350</div>
          
          {/* Volume labels */}
          <div className="absolute top-4 left-2 text-xs text-slate-400">450 BTC</div>
          <div className="absolute top-1/3 left-2 text-xs text-slate-400">300 BTC</div>
          <div className="absolute top-2/3 left-2 text-xs text-slate-400">150 BTC</div>
        </div>
        
        {/* Legend */}
        <div className="mt-2 flex items-center justify-center space-x-4">
          <div className="flex items-center">
            <div className="h-3 w-3 bg-green-500/30 rounded-sm mr-2"></div>
            <span className="text-xs text-slate-400">Bids</span>
          </div>
          <div className="flex items-center">
            <div className="h-3 w-3 bg-red-500/30 rounded-sm mr-2"></div>
            <span className="text-xs text-slate-400">Asks</span>
          </div>
        </div>
      </div>
      
      <div className="p-3 border-t border-slate-700">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-slate-400 mb-1">Bid/Ask Spread</div>
            <div className="font-medium">$5.32 (0.018%)</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Total Bid Vol.</div>
            <div className="font-medium text-green-500">582.4 BTC</div>
          </div>
          <div>
            <div className="text-xs text-slate-400 mb-1">Total Ask Vol.</div>
            <div className="font-medium text-red-500">423.1 BTC</div>
          </div>
        </div>
      </div>
    </div>
  );
}