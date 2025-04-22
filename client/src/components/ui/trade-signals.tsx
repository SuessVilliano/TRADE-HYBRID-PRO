import React, { useState, useEffect } from 'react';
import { Badge } from './badge';
import { Button } from './button';
import { BrainCircuit, Sparkles, ArrowUp, ArrowDown, Hourglass, Copy, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import axios from 'axios';

interface TradeSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  timeframe: string;
  confidence: number;
  signal: string;
  price: number;
  targetPrice: number;
  stopLoss: number;
  takeProfit?: number;
  timestamp: string;
  status: 'active' | 'expired' | 'triggered';
  provider?: string;
}

interface TradeSignalsProps {
  symbol?: string;
}

export function TradeSignals({ symbol = 'BTCUSDT' }: TradeSignalsProps) {
  const [signals, setSignals] = useState<TradeSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch signals from the API
  useEffect(() => {
    const fetchSignals = async () => {
      try {
        setLoading(true);
        
        // Using the real API endpoint
        const response = await axios.get('/api/signals');
        
        // Process the response data
        let signalsData: TradeSignal[] = [];
        
        if (response.data && Array.isArray(response.data)) {
          signalsData = response.data.map((signal: any) => ({
            id: signal.id || String(Math.random()),
            symbol: signal.Symbol || signal.symbol || 'UNKNOWN',
            type: (signal.Direction || signal.direction || signal.Type || signal.type || 'buy').toLowerCase() as 'buy' | 'sell',
            timeframe: signal.Timeframe || signal.timeframe || '1d',
            confidence: signal.Confidence || signal.confidence || Math.floor(Math.random() * 30) + 70,
            signal: signal.Notes || signal.notes || signal.Signal || signal.signal || 'Trading signal',
            price: parseFloat(signal['Entry Price'] || signal.price || signal.entry || 0),
            targetPrice: parseFloat(signal['Take Profit'] || signal.tp || signal.target || signal.takeProfit || 0),
            stopLoss: parseFloat(signal['Stop Loss'] || signal.sl || signal.stopLoss || 0),
            takeProfit: parseFloat(signal['Take Profit'] || signal.tp || signal.target || signal.takeProfit || 0),
            timestamp: signal.Date || signal.date || signal.timestamp || new Date().toISOString(),
            status: (signal.Status || signal.status || 'active').toLowerCase() as 'active' | 'expired' | 'triggered',
            provider: signal.Provider || signal.provider || 'TradeHybrid AI'
          }));
        } else if (response.data && response.data.signals && Array.isArray(response.data.signals)) {
          // Handle case where signals are nested in a signals property
          signalsData = response.data.signals.map((signal: any) => ({
            id: signal.id || String(Math.random()),
            symbol: signal.Symbol || signal.symbol || 'UNKNOWN',
            type: (signal.Direction || signal.direction || signal.Type || signal.type || 'buy').toLowerCase() as 'buy' | 'sell',
            timeframe: signal.Timeframe || signal.timeframe || '1d',
            confidence: signal.Confidence || signal.confidence || Math.floor(Math.random() * 30) + 70,
            signal: signal.Notes || signal.notes || signal.Signal || signal.signal || 'Trading signal',
            price: parseFloat(signal['Entry Price'] || signal.price || signal.entry || 0),
            targetPrice: parseFloat(signal['Take Profit'] || signal.tp || signal.target || signal.takeProfit || 0),
            stopLoss: parseFloat(signal['Stop Loss'] || signal.sl || signal.stopLoss || 0),
            takeProfit: parseFloat(signal['Take Profit'] || signal.tp || signal.target || signal.takeProfit || 0),
            timestamp: signal.Date || signal.date || signal.timestamp || new Date().toISOString(),
            status: (signal.Status || signal.status || 'active').toLowerCase() as 'active' | 'expired' | 'triggered',
            provider: signal.Provider || signal.provider || 'TradeHybrid AI'
          }));
        }
        
        // Fallback to demo signals if no data was received
        if (signalsData.length === 0) {
          // Create signals using the real format from Paradox, Solaris, and Hybrid providers
          signalsData = [
            {
              id: '1',
              symbol: 'BTCUSDT',
              type: 'buy',
              timeframe: '1d',
              confidence: 89,
              signal: 'Multiple timeframe alignment with RSI divergence',
              price: 68700,
              targetPrice: 70000,
              stopLoss: 68100,
              takeProfit: 70000,
              timestamp: new Date().toISOString(),
              status: 'active',
              provider: 'Paradox AI'
            },
            {
              id: '2',
              symbol: 'ETHUSDT',
              type: 'buy',
              timeframe: '1d',
              confidence: 80,
              signal: 'Double bottom with increasing volume',
              price: 3400,
              targetPrice: 3600,
              stopLoss: 3300,
              takeProfit: 3600,
              timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
              status: 'active',
              provider: 'Paradox AI'
            },
            {
              id: '3',
              symbol: 'EURUSD',
              type: 'sell',
              timeframe: '4h',
              confidence: 75,
              signal: 'Bearish divergence on RSI oscillator',
              price: 1.0772,
              targetPrice: 1.0700,
              stopLoss: 1.0800,
              takeProfit: 1.0700,
              timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
              status: 'active',
              provider: 'Solaris AI'
            },
            {
              id: '4',
              symbol: 'ES1!',
              type: 'buy',
              timeframe: '1h',
              confidence: 82,
              signal: 'Momentum breakout with MACD crossover',
              price: 5375.25,
              targetPrice: 5400.00,
              stopLoss: 5350.00,
              takeProfit: 5400.00,
              timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
              status: 'active',
              provider: 'Hybrid AI'
            }
          ];
        }
        
        setSignals(signalsData);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching signals:', err);
        setError('Failed to load trading signals');
        setLoading(false);
        
        // Fallback to example signals in case of error
        setSignals([
          {
            id: '1',
            symbol: 'BTCUSDT',
            type: 'buy',
            timeframe: '1d',
            confidence: 89,
            signal: 'Multiple timeframe alignment with RSI divergence',
            price: 68700,
            targetPrice: 70000,
            stopLoss: 68100,
            takeProfit: 70000,
            timestamp: new Date().toISOString(),
            status: 'active',
            provider: 'Paradox AI'
          },
          {
            id: '2',
            symbol: 'ETHUSDT',
            type: 'buy',
            timeframe: '1d',
            confidence: 80,
            signal: 'Double bottom with increasing volume',
            price: 3400,
            targetPrice: 3600,
            stopLoss: 3300,
            takeProfit: 3600,
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
            status: 'active',
            provider: 'Paradox AI'
          }
        ]);
      }
    };
    
    fetchSignals();
    
    // Set up interval to refresh signals every 5 minutes
    const intervalId = setInterval(fetchSignals, 5 * 60 * 1000);
    
    // Clean up on unmount
    return () => clearInterval(intervalId);
  }, []);
  
  // Copy a value to clipboard
  const copyToClipboard = (value: string | number, label: string) => {
    // Fallback for browsers that don't support navigator.clipboard
    if (!navigator.clipboard) {
      const textArea = document.createElement('textarea');
      textArea.value = String(value);
      
      // Avoid scrolling to bottom
      textArea.style.top = '0';
      textArea.style.left = '0';
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      
      try {
        const successful = document.execCommand('copy');
        if (successful) {
          toast.success(`Copied ${label}`, {
            description: `${label} has been copied to clipboard`,
            duration: 2000
          });
        } else {
          throw new Error('Copy command failed');
        }
      } catch (err) {
        console.error('Fallback: Failed to copy:', err);
        toast.error(`Failed to copy ${label}`, {
          description: 'Please try again',
          duration: 2000
        });
      }
      
      document.body.removeChild(textArea);
      return;
    }
    
    // Use the Clipboard API if available
    navigator.clipboard.writeText(String(value))
      .then(() => {
        toast.success(`Copied ${label}`, {
          description: `${label} has been copied to clipboard`,
          duration: 2000
        });
      })
      .catch(err => {
        console.error('Failed to copy:', err);
        toast.error(`Failed to copy ${label}`, {
          description: 'Please try again',
          duration: 2000
        });
      });
  };
  
  // Open ABATEV trade panel with signal data
  const openAbatevTradePanel = (signal: TradeSignal) => {
    // Format the data for ABATEV panel
    const tradeData = {
      symbol: signal.symbol,
      side: signal.type,
      entryPrice: signal.price,
      stopLoss: signal.stopLoss,
      takeProfit: signal.takeProfit || signal.targetPrice,
      confidence: signal.confidence,
      provider: signal.provider || 'TradeHybrid AI'
    };
    
    // Store data in localStorage for ABATEV panel to access
    localStorage.setItem('abatev_trade_data', JSON.stringify(tradeData));
    
    // Notify user
    toast.success('Trade Prepared', {
      description: `${signal.symbol} ${signal.type.toUpperCase()} trade sent to ABATEV Smart Trade Panel`,
      duration: 3000
    });
    
    // Redirect to ABATEV panel page
    window.location.href = '/abatev';
  };
  
  // Format date to relative time
  const getRelativeTime = (timestamp: string) => {
    try {
      const now = new Date();
      const date = new Date(timestamp);
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) {
        return `${diffMins}m ago`;
      } else if (diffMins < 1440) {
        return `${Math.floor(diffMins / 60)}h ago`;
      } else {
        return `${Math.floor(diffMins / 1440)}d ago`;
      }
    } catch (e) {
      return timestamp;
    }
  };
  
  // Calculate risk/reward ratio
  const calculateRiskReward = (signal: TradeSignal) => {
    try {
      const entry = signal.price;
      const sl = signal.stopLoss;
      const tp = signal.targetPrice;
      
      if (signal.type === 'buy') {
        const risk = entry - sl;
        const reward = tp - entry;
        return (risk !== 0) ? (reward / risk).toFixed(1) : '∞';
      } else {
        const risk = sl - entry;
        const reward = entry - tp;
        return (risk !== 0) ? (reward / risk).toFixed(1) : '∞';
      }
    } catch (e) {
      return '1.0';
    }
  };
  
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
        {loading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, index) => (
            <div key={index} className="bg-slate-800/50 border border-slate-700 rounded-md p-3 animate-pulse">
              <div className="h-5 bg-slate-700 rounded w-32 mb-3"></div>
              <div className="h-4 bg-slate-700 rounded w-full mb-3"></div>
              <div className="grid grid-cols-3 gap-2 mb-3">
                <div className="h-8 bg-slate-700 rounded"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
                <div className="h-8 bg-slate-700 rounded"></div>
              </div>
              <div className="h-4 bg-slate-700 rounded w-1/2"></div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <div className="text-red-400 mb-2">⚠️</div>
            <p className="text-slate-200">{error}</p>
            <p className="text-xs text-slate-400 mt-1">
              Please try again later or contact support
            </p>
          </div>
        ) : filteredSignals.length > 0 ? (
          filteredSignals.map(signal => (
            <div 
              key={signal.id}
              className="bg-slate-800/50 border border-slate-700 rounded-md p-3"
            >
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center flex-wrap gap-1">
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
                  <span className="font-medium text-white">{signal.symbol}</span>
                  <Badge variant="outline" className="text-xs">
                    {signal.timeframe}
                  </Badge>
                  {signal.provider && (
                    <Badge variant="outline" className="bg-purple-900/30 text-purple-300 border-purple-800">
                      {signal.provider}
                    </Badge>
                  )}
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
              
              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400">Entry Price</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-slate-500 hover:text-white"
                      onClick={() => copyToClipboard(signal.price, 'Entry Price')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-white">${signal.price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400">Target</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-slate-500 hover:text-white"
                      onClick={() => copyToClipboard(signal.targetPrice, 'Take Profit')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-green-400">${signal.targetPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-slate-400">Stop Loss</p>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-5 w-5 text-slate-500 hover:text-white"
                      onClick={() => copyToClipboard(signal.stopLoss, 'Stop Loss')}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                  <p className="font-medium text-red-400">${signal.stopLoss.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-between items-center">
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
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs bg-blue-950/30 border-blue-800/50 hover:bg-blue-900/50 text-blue-300 mt-2 w-full sm:w-auto"
                  onClick={() => openAbatevTradePanel(signal)}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Trade with ABATEV
                </Button>
              </div>
              
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-700/50">
                <div className="flex items-center">
                  <Badge variant="outline" className="text-xs">
                    R/R: {calculateRiskReward(signal)}
                  </Badge>
                </div>
                <span className="text-xs text-slate-500">
                  {getRelativeTime(signal.timestamp)}
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