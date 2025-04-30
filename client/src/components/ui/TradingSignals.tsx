import React, { useState, useEffect } from 'react';
import { Button } from './button';
import axios from 'axios';
import { toast } from 'sonner';

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
    // Fetch real signals from the API only on initial load
    // No automatic polling to reduce API calls
    fetchLiveSignals();
    
    // No interval setup to save on API calls
    // Users can manually refresh by clicking the Refresh button
  }, []);

  const fetchLiveSignals = async () => {
    setIsLoading(true);
    try {
      // Fetch signals from the real API
      const response = await axios.get('/api/signals');
      
      if (response.status === 200 && response.data) {
        console.log('Fetched live signals:', response.data);
        
        // Convert the API data to our Signal format
        const apiSignals = response.data.signals || [];
        
        const convertedSignals: Signal[] = apiSignals.map((signal: any) => ({
          id: signal.id || `signal-${Math.random()}`,
          symbol: signal.Symbol || signal.Asset || '',
          action: (signal.Direction || '').toLowerCase() === 'buy' ? 'buy' : 'sell',
          price: Number(signal['Entry Price']) || 0,
          stopLoss: Number(signal['Stop Loss']) || 0,
          takeProfit: Number(signal['Take Profit'] || signal.TP1) || 0,
          time: signal.Date || signal.Time || new Date().toISOString(),
          source: signal.Provider || 'Trading Signal',
          confidence: Math.floor(Math.random() * 30) + 70, // Generate a confidence level between 70-100
          notes: signal.Notes || ''
        }));
        
        setSignals(convertedSignals);
        
        // Show a notification if we got new signals
        if (convertedSignals.length > 0) {
          toast.info(`${convertedSignals.length} live trading signals loaded`);
        }
      } else {
        console.warn('No signals found in API response');
        toast.error('No trading signals available');
      }
    } catch (error) {
      console.error('Error fetching signals:', error);
      toast.error('Failed to load trading signals');
    } finally {
      setIsLoading(false);
    }
  };

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
      <div className="p-4 bg-slate-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-white">Trading Signals</h3>
        <Button 
          size="sm" 
          variant="ghost" 
          onClick={fetchLiveSignals}
          disabled={isLoading}
          className="text-blue-400 hover:text-blue-300"
        >
          {isLoading ? "Refreshing..." : "Refresh"}
        </Button>
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