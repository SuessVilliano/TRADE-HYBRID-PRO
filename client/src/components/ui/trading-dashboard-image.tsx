import React from 'react';
import { LineChart, BarChart3, TrendingUp, Activity, DollarSign, Target } from 'lucide-react';

interface TradingDashboardImageProps {
  className?: string;
}

export function TradingDashboardImage({ className = "" }: TradingDashboardImageProps) {
  return (
    <div className={`relative bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg p-6 ${className}`}>
      {/* Mock trading interface */}
      <div className="space-y-4">
        {/* Header with charts */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <LineChart className="h-5 w-5 text-blue-400" />
            <span className="text-white font-medium text-sm">EURUSD</span>
            <span className="text-green-400 text-sm">+0.85%</span>
          </div>
          <div className="text-right">
            <div className="text-white text-lg font-bold">1.0942</div>
            <div className="text-slate-400 text-xs">Real-time</div>
          </div>
        </div>

        {/* Chart area */}
        <div className="h-32 bg-slate-700/50 rounded-lg relative overflow-hidden">
          {/* Simulated candlestick chart */}
          <svg className="w-full h-full" viewBox="0 0 300 100">
            {/* Grid lines */}
            <defs>
              <pattern id="grid" width="20" height="10" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 10" fill="none" stroke="#334155" strokeWidth="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            {/* Price line */}
            <path 
              d="M 20 70 Q 60 60 100 65 T 180 55 T 260 45" 
              stroke="#10B981" 
              strokeWidth="2" 
              fill="none"
            />
            
            {/* Candlesticks */}
            {[40, 80, 120, 160, 200, 240].map((x, i) => {
              const isGreen = i % 2 === 0;
              const high = 30 + Math.random() * 20;
              const low = 60 + Math.random() * 20;
              const open = high + 5;
              const close = low - 5;
              
              return (
                <g key={i}>
                  <line 
                    x1={x} y1={high} x2={x} y2={low} 
                    stroke={isGreen ? "#10B981" : "#EF4444"} 
                    strokeWidth="1"
                  />
                  <rect 
                    x={x-3} 
                    y={Math.min(open, close)} 
                    width="6" 
                    height={Math.abs(open - close)} 
                    fill={isGreen ? "#10B981" : "#EF4444"}
                  />
                </g>
              );
            })}
          </svg>
          
          {/* Volume indicator */}
          <div className="absolute bottom-2 left-2">
            <div className="flex items-center space-x-1">
              <BarChart3 className="h-3 w-3 text-blue-400" />
              <span className="text-xs text-slate-400">Vol: 1.2M</span>
            </div>
          </div>
        </div>

        {/* Trading stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-slate-700/30 rounded p-3">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-400" />
              <span className="text-slate-300 text-xs">P&L Today</span>
            </div>
            <div className="text-green-400 font-bold text-sm">+$2,847.50</div>
          </div>
          <div className="bg-slate-700/30 rounded p-3">
            <div className="flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-400" />
              <span className="text-slate-300 text-xs">Win Rate</span>
            </div>
            <div className="text-blue-400 font-bold text-sm">78.3%</div>
          </div>
        </div>

        {/* Position summary */}
        <div className="bg-slate-700/20 rounded p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Activity className="h-4 w-4 text-yellow-400" />
              <span className="text-slate-300 text-xs">Open Positions</span>
            </div>
            <span className="text-white text-sm font-medium">3 Active</span>
          </div>
          
          {/* Mock positions */}
          <div className="mt-2 space-y-1">
            {['EURUSD Long', 'GBPJPY Short', 'BTCUSD Long'].map((pos, i) => (
              <div key={i} className="flex justify-between text-xs">
                <span className="text-slate-400">{pos}</span>
                <span className={i === 1 ? "text-red-400" : "text-green-400"}>
                  {i === 1 ? "-$125" : "+$892"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trading controls */}
        <div className="flex space-x-2">
          <button className="flex-1 bg-green-600 hover:bg-green-700 text-white text-xs py-2 px-3 rounded font-medium">
            BUY
          </button>
          <button className="flex-1 bg-red-600 hover:bg-red-700 text-white text-xs py-2 px-3 rounded font-medium">
            SELL
          </button>
        </div>
      </div>

      {/* Overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/20 to-transparent rounded-lg pointer-events-none" />
    </div>
  );
}

export default TradingDashboardImage;