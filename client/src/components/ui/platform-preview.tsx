import React from 'react';

export const PlatformPreview: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
        <h3 className="text-xl font-bold text-white">Trade Hybrid</h3>
      </div>
      
      {/* Main Content */}
      <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Area */}
        <div className="lg:col-span-2 bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Live Market Chart</h4>
          <div className="h-48 bg-gray-900 rounded flex items-center justify-center relative overflow-hidden">
            {/* Simulated Chart Line */}
            <svg width="100%" height="100%" className="absolute inset-0">
              <polyline
                points="20,140 60,120 100,160 140,100 180,130 220,80 260,110 300,60 340,90 380,40"
                stroke="#3b82f6"
                strokeWidth="3"
                fill="none"
                className="drop-shadow-lg"
              />
              <polyline
                points="20,140 60,120 100,160 140,100 180,130 220,80 260,110 300,60 340,90 380,40"
                stroke="#8b5cf6"
                strokeWidth="2"
                fill="none"
                opacity="0.7"
                transform="translate(0, 20)"
              />
            </svg>
            <div className="absolute top-4 left-4 text-green-400 text-sm font-medium">
              BTC/USDT: $68,700 (+2.5%)
            </div>
          </div>
        </div>
        
        {/* Trading Panel */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h4 className="text-lg font-semibold text-white mb-4">Quick Trade</h4>
          <div className="space-y-3">
            <div className="bg-gray-700 rounded px-3 py-2">
              <span className="text-gray-300 text-sm">Symbol: BTC/USDT</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium">
                BUY
              </button>
              <button className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded font-medium">
                SELL
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Bottom Section */}
      <div className="px-6 pb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Portfolio */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h5 className="text-white font-semibold mb-2">Portfolio</h5>
          <p className="text-gray-300 text-sm">Balance: $25,480.50</p>
          <p className="text-green-400 text-sm">P&L: +$1,280.50 (5.3%)</p>
        </div>
        
        {/* Recent Trades */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h5 className="text-white font-semibold mb-2">Recent Trades</h5>
          <div className="space-y-1 text-xs">
            <p className="text-gray-300">BTC/USDT +$240.50</p>
            <p className="text-gray-300">ETH/USDT +$185.20</p>
            <p className="text-gray-300">SOL/USDT -$45.30</p>
          </div>
        </div>
        
        {/* Live Signals */}
        <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          <h5 className="text-white font-semibold mb-2">Live Signals</h5>
          <div className="space-y-2">
            <div className="bg-green-900/30 border border-green-600 rounded p-2">
              <p className="text-green-400 text-xs font-medium">BUY BTC/USDT</p>
              <p className="text-green-300 text-xs">Entry: $68,700</p>
            </div>
            <div className="bg-red-900/30 border border-red-600 rounded p-2">
              <p className="text-red-400 text-xs font-medium">SELL SOL/USDT</p>
              <p className="text-red-300 text-xs">Entry: $152.45</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-gray-800 border-t border-gray-700 px-6 py-3">
        <p className="text-gray-400 text-xs">
          Connected to: Drift Protocol • Jupiter DEX • Live Market Data
        </p>
        <p className="text-gray-500 text-xs mt-1">
          Trade Hybrid Platform - Professional Trading Interface
        </p>
      </div>
    </div>
  );
};