import React, { useState, useEffect } from 'react';

interface TestChartProps {
  symbol?: string;
  className?: string;
}

export function TestChart({ symbol = 'BTCUSDT', className = '' }: TestChartProps) {
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500);
    
    return () => clearTimeout(timer);
  }, []);
  
  return (
    <div className={`rounded-lg border border-gray-700 bg-gray-800 p-4 ${className}`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-white">{symbol} Simple Chart</h3>
        <div className="text-sm text-gray-400">Test Component</div>
      </div>
      
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="h-64 w-full bg-gradient-to-r from-blue-900/30 to-purple-900/30 rounded-md overflow-hidden flex items-center justify-center">
          <div className="text-white text-center">
            <p className="mb-2">Simple Test Chart Component</p>
            <p className="text-sm text-gray-400">Displaying {symbol}</p>
            <div className="mt-3 px-3 py-1 bg-blue-600 rounded-md inline-block">
              Working Component
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TestChart;