import React from 'react';
import { useNavigate } from 'react-router-dom';
import { TradingSignal } from '../../lib/stores/useSignals';

interface TradingSignalToastProps {
  signal: TradingSignal;
  onClose: () => void;
}

export const TradingSignalToast: React.FC<TradingSignalToastProps> = ({ signal, onClose }) => {
  const navigate = useNavigate();
  
  // Determine color based on action type
  const getActionColor = (action: 'buy' | 'sell' | 'neutral') => {
    switch (action) {
      case 'buy':
        return 'bg-green-500';
      case 'sell':
        return 'bg-red-500';
      case 'neutral':
      default:
        return 'bg-blue-500';
    }
  };

  // Format confidence as percentage with no decimal places
  const confidenceFormatted = Math.round(signal.confidence) + '%';
  
  // Handle click to view signal details
  const handleViewDetails = () => {
    // Mark the signal as read first
    // Navigate to signals page
    navigate('/trading-signals');
    // Close the toast
    onClose();
  };
  
  return (
    <div className="overflow-hidden rounded-lg shadow-lg transition-all bg-slate-800 border border-slate-700">
      {/* Signal Header */}
      <div className={`px-4 py-2 flex justify-between items-center ${getActionColor(signal.action)}`}>
        <div className="font-bold text-white">{signal.source}</div>
        <div className="text-sm text-white/80">
          {new Date(signal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
      
      {/* Signal Content */}
      <div className="p-4 bg-gradient-to-b from-slate-800 to-slate-900">
        <div className="flex justify-between items-center mb-2">
          <div className="font-bold text-xl">{signal.symbol}</div>
          <div className="px-2 py-1 rounded text-xs font-semibold bg-slate-700">
            {signal.timeframe}
          </div>
        </div>
        
        <div className="flex justify-between mb-3">
          <div className="text-lg font-bold uppercase text-white">
            {signal.action}
          </div>
          <div className="text-sm">
            <span className="text-slate-400 mr-1">Confidence:</span>
            <span className={signal.confidence > 80 ? 'text-green-400' : signal.confidence > 60 ? 'text-yellow-400' : 'text-slate-300'}>
              {confidenceFormatted}
            </span>
          </div>
        </div>
        
        {signal.entryPrice !== undefined && signal.entryPrice > 0 && (
          <div className="mb-1">
            <span className="text-slate-400 mr-1">Entry:</span>
            <span className="font-mono">{signal.entryPrice}</span>
          </div>
        )}
        
        {signal.stopLoss && signal.stopLoss > 0 && (
          <div className="mb-1">
            <span className="text-slate-400 mr-1">Stop Loss:</span>
            <span className="font-mono text-red-400">{signal.stopLoss}</span>
          </div>
        )}
        
        {signal.takeProfit1 && signal.takeProfit1 > 0 && (
          <div className="mb-1">
            <span className="text-slate-400 mr-1">Take Profit:</span>
            <span className="font-mono text-green-400">{signal.takeProfit1}</span>
          </div>
        )}
        
        {/* Signal Footer */}
        <div className="mt-3 flex justify-end">
          <button 
            onClick={handleViewDetails}
            className="px-3 py-1 rounded text-sm bg-slate-700 hover:bg-slate-600 transition-colors"
          >
            View Details
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradingSignalToast;