import React from 'react';
import { Link } from 'react-router-dom';

const TradingViewDirectChart: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <div className="container mx-auto p-4">
        <div className="mb-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">TradingView Direct Chart</h1>
          <Link to="/" className="text-blue-400 hover:underline">Back to Dashboard</Link>
        </div>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="p-3 border-b border-slate-700 flex justify-between items-center">
            <h2 className="font-medium">TradingView Chart (Direct Trading)</h2>
            <span className="text-sm text-slate-400">Trade directly on this chart</span>
          </div>
          <div className="w-full h-[800px]">
            <iframe 
              src="https://www.tradingview.com/chart/GtJVbpFg/"
              style={{ width: '100%', height: '100%' }}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TradingViewDirectChart;