import React, { useState, useEffect } from 'react';
import { Button } from './button';

interface Signal {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'neutral';
  price: number;
  stopLoss: number;
  takeProfit: number;
  time: string;
  source: string;
  confidence: number;
  notes?: string;
}

interface TradingSignalsProps {
  className?: string;
}

export default function TradingSignals({ className }: TradingSignalsProps) {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [expandedSignalId, setExpandedSignalId] = useState<string | null>(null);

  useEffect(() => {
    // Simulated signals data fetch
    setTimeout(() => {
      const mockSignals: Signal[] = [
        {
          id: '1',
          symbol: 'BTC/USD',
          action: 'buy',
          price: 63420.5,
          stopLoss: 62000,
          takeProfit: 67000,
          time: '2025-03-28T10:30:00Z',
          source: 'Technical Analysis',
          confidence: 85,
          notes: 'Strong support at $62,000 level with RSI showing oversold conditions. MACD indicating bullish crossover.'
        },
        {
          id: '2',
          symbol: 'ETH/USD',
          action: 'buy',
          price: 3320.75,
          stopLoss: 3100,
          takeProfit: 3800,
          time: '2025-03-28T10:15:00Z',
          source: 'Pattern Recognition',
          confidence: 78,
          notes: 'Forming a cup and handle pattern with increasing volume. Could break resistance at $3,400.'
        },
        {
          id: '3',
          symbol: 'XRP/USD',
          action: 'sell',
          price: 0.735,
          stopLoss: 0.79,
          takeProfit: 0.65,
          time: '2025-03-28T09:45:00Z',
          source: 'AI Prediction',
          confidence: 72,
          notes: 'Bearish divergence on the 4-hour chart. Price could retrace to the 0.65 support level.'
        },
        {
          id: '4',
          symbol: 'SOL/USD',
          action: 'buy',
          price: 140.25,
          stopLoss: 130,
          takeProfit: 165,
          time: '2025-03-28T08:30:00Z',
          source: 'Technical Analysis',
          confidence: 80,
          notes: 'Breaking out of a consolidation phase with increasing volume. Could test previous highs.'
        },
        {
          id: '5',
          symbol: 'ADA/USD',
          action: 'sell',
          price: 0.52,
          stopLoss: 0.57,
          takeProfit: 0.45,
          time: '2025-03-28T07:15:00Z',
          source: 'Pattern Recognition',
          confidence: 65,
          notes: 'Head and shoulders pattern forming on the daily chart. Volume decreasing on recent price increases.'
        }
      ];
      
      setSignals(mockSignals);
      setIsLoading(false);
    }, 1500);
  }, []);

  const filteredSignals = signals.filter(signal => {
    if (activeFilter === 'all') return true;
    return signal.action === activeFilter;
  });

  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleSignalExpansion = (id: string) => {
    if (expandedSignalId === id) {
      setExpandedSignalId(null);
    } else {
      setExpandedSignalId(id);
    }
  };

  return (
    <div className={`bg-slate-800 rounded-lg overflow-hidden shadow-lg ${className}`}>
      <div className="p-4 bg-slate-700">
        <h3 className="text-lg font-semibold text-white">Trading Signals</h3>
      </div>
      
      <div className="p-3 bg-slate-800 border-b border-slate-700">
        <div className="flex space-x-2">
          <Button 
            variant={activeFilter === 'all' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('all')}
          >
            All
          </Button>
          <Button 
            variant={activeFilter === 'buy' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('buy')}
            className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
          >
            Buy
          </Button>
          <Button 
            variant={activeFilter === 'sell' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setActiveFilter('sell')}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
          >
            Sell
          </Button>
        </div>
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <div className="inline-block w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredSignals.length === 0 ? (
          <div className="p-8 text-center text-slate-400">
            No signals match your current filter
          </div>
        ) : (
          <div className="divide-y divide-slate-700">
            {filteredSignals.map(signal => (
              <div 
                key={signal.id} 
                className="p-4 hover:bg-slate-750 transition-colors cursor-pointer"
                onClick={() => toggleSignalExpansion(signal.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div 
                      className={`w-3 h-3 rounded-full ${
                        signal.action === 'buy' 
                          ? 'bg-green-500' 
                          : signal.action === 'sell' 
                          ? 'bg-red-500' 
                          : 'bg-yellow-500'
                      }`}
                    ></div>
                    <span className="font-medium text-white">{signal.symbol}</span>
                  </div>
                  <div className="text-sm text-slate-400">
                    {formatTime(signal.time)}
                  </div>
                </div>
                
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <div className="text-slate-400">Entry</div>
                    <div className={`font-medium ${
                      signal.action === 'buy' ? 'text-green-400' : 'text-red-400'
                    }`}>
                      ${signal.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Stop Loss</div>
                    <div className="font-medium text-red-400">
                      ${signal.stopLoss.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Take Profit</div>
                    <div className="font-medium text-green-400">
                      ${signal.takeProfit.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                    </div>
                  </div>
                </div>
                
                {expandedSignalId === signal.id && (
                  <div className="mt-3 pt-3 border-t border-slate-700">
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Source:</span>
                      <span className="ml-2 text-white">{signal.source}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-slate-400 text-sm">Confidence:</span>
                      <div className="mt-1 h-2 w-full bg-slate-700 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            signal.confidence > 75 
                              ? 'bg-green-500' 
                              : signal.confidence > 50 
                              ? 'bg-yellow-500' 
                              : 'bg-red-500'
                          }`}
                          style={{width: `${signal.confidence}%`}}
                        ></div>
                      </div>
                    </div>
                    {signal.notes && (
                      <div className="mt-2 text-sm text-slate-300">
                        {signal.notes}
                      </div>
                    )}
                    <div className="mt-3 flex space-x-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        Copy Trade
                      </Button>
                      <Button size="sm" className="flex-1">
                        Execute
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}