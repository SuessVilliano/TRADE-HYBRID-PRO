import React from 'react';
import { Badge } from './badge';
import { BrainCircuit, Sparkles, ArrowUp, ArrowDown, Hourglass } from 'lucide-react';

interface TradeSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  timeframe: string;
  confidence: number;
  signal: string;
  price: string;
  targetPrice: string;
  stopLoss: string;
  timestamp: string;
  status: 'active' | 'expired' | 'triggered';
}

interface TradeSignalsProps {
  symbol?: string;
}

export function TradeSignals({ symbol = 'BTCUSDT' }: TradeSignalsProps) {
  // In a real implementation, these would be fetched from an API
  const signals: TradeSignal[] = [
    {
      id: '1',
      symbol: 'BTCUSDT',
      type: 'buy',
      timeframe: '4h',
      confidence: 85,
      signal: 'Bull flag breakout with RSI divergence',
      price: '66,412.50',
      targetPrice: '68,750.00',
      stopLoss: '65,200.00',
      timestamp: '2 hours ago',
      status: 'active'
    },
    {
      id: '2',
      symbol: 'ETHUSDT',
      type: 'buy',
      timeframe: '1d',
      confidence: 79,
      signal: 'Support level bounce with increasing volume',
      price: '3,312.75',
      targetPrice: '3,500.00',
      stopLoss: '3,200.00',
      timestamp: '5 hours ago',
      status: 'active'
    },
    {
      id: '3',
      symbol: 'SOLUSDT',
      type: 'sell',
      timeframe: '1h',
      confidence: 72,
      signal: 'Double top formation with MACD crossover',
      price: '142.65',
      targetPrice: '135.00',
      stopLoss: '147.50',
      timestamp: '1 day ago',
      status: 'active'
    },
    {
      id: '4',
      symbol: 'BNBUSDT',
      type: 'buy',
      timeframe: '2h',
      confidence: 68,
      signal: 'Golden cross on MA(50) and MA(200)',
      price: '562.80',
      targetPrice: '595.00',
      stopLoss: '545.00',
      timestamp: '3 days ago',
      status: 'expired'
    }
  ];

  // Filter signals if a specific symbol is requested
  const filteredSignals = symbol 
    ? signals.filter(s => s.symbol.toLowerCase() === symbol.toLowerCase()) 
    : signals;

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-700">
        <div className="flex items-center">
          <BrainCircuit className="h-5 w-5 text-purple-400 mr-2" />
          <h3 className="font-medium">AI Trading Signals</h3>
        </div>
        <Badge variant="secondary" className="bg-purple-900/50 text-purple-300 hover:bg-purple-900">
          <Sparkles className="h-3 w-3 mr-1" /> AI Powered
        </Badge>
      </div>
      
      <div className="space-y-3 overflow-auto">
        {filteredSignals.length > 0 ? (
          filteredSignals.map(signal => (
            <div 
              key={signal.id}
              className="bg-slate-800/50 border border-slate-700 rounded-md p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center">
                  <Badge 
                    variant={signal.type === 'buy' ? 'success' : 'destructive'}
                    className={signal.type === 'buy' 
                      ? 'bg-green-900/30 text-green-400 hover:bg-green-900/50' 
                      : 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                    }
                  >
                    {signal.type === 'buy' ? (
                      <><ArrowUp className="h-3 w-3 mr-1" /> BUY</>
                    ) : (
                      <><ArrowDown className="h-3 w-3 mr-1" /> SELL</>
                    )}
                  </Badge>
                  <span className="font-medium text-white ml-2">{signal.symbol}</span>
                  <Badge variant="outline" className="ml-2 text-xs">
                    {signal.timeframe}
                  </Badge>
                </div>
                <Badge 
                  variant="outline" 
                  className={
                    signal.status === 'active' 
                      ? 'border-green-500/30 text-green-400' 
                      : signal.status === 'expired' 
                        ? 'border-slate-500/30 text-slate-400'
                        : 'border-amber-500/30 text-amber-400'
                  }
                >
                  {signal.status === 'active' ? (
                    'Active'
                  ) : signal.status === 'expired' ? (
                    'Expired'
                  ) : (
                    'Triggered'
                  )}
                </Badge>
              </div>
              
              <p className="text-slate-300 text-sm mb-3">
                {signal.signal}
              </p>
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-2">
                <div>
                  <p className="text-slate-400">Entry Price</p>
                  <p className="font-medium text-white">${signal.price}</p>
                </div>
                <div>
                  <p className="text-slate-400">Target</p>
                  <p className="font-medium text-green-400">${signal.targetPrice}</p>
                </div>
                <div>
                  <p className="text-slate-400">Stop Loss</p>
                  <p className="font-medium text-red-400">${signal.stopLoss}</p>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <div className="h-2 w-24 bg-slate-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full ${
                        signal.confidence >= 80 
                          ? 'bg-green-500' 
                          : signal.confidence >= 60 
                            ? 'bg-amber-500' 
                            : 'bg-red-500'
                      }`}
                      style={{ width: `${signal.confidence}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-slate-400 ml-2">
                    {signal.confidence}% confidence
                  </span>
                </div>
                <span className="text-xs text-slate-500">
                  {signal.timestamp}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Hourglass className="h-8 w-8 text-slate-500 mb-2" />
            <p className="text-slate-500">No signals available for {symbol}</p>
            <p className="text-xs text-slate-600 mt-1">
              Signals are generated based on AI analysis and market conditions
            </p>
          </div>
        )}
      </div>
    </div>
  );
}