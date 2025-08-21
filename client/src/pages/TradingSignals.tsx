import React, { useState, useEffect } from 'react';
import { Signal, TrendingUp, TrendingDown, Clock, AlertCircle, Copy, ExternalLink, Bell, BellOff, Settings } from 'lucide-react';
import { notificationService, SignalNotification } from '../lib/notifications';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface TradingSignal {
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  entry: number;
  stopLoss: number;
  takeProfit: number;
  timestamp: string;
  source: string;
  risk: number;
  notes: string;
  timeframe: string;
  status: 'active' | 'closed' | 'cancelled';
}

export function TradingSignals() {
  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('active');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [previousSignals, setPreviousSignals] = useState<TradingSignal[]>([]);

  const providers = ['all', 'Paradox', 'Solaris', 'Hybrid'];
  const statusOptions = ['active', 'all', 'closed', 'cancelled'];

  useEffect(() => {
    fetchSignals();
    
    // Initialize notification settings
    setNotificationsEnabled(notificationService.isEnabled());
    
    // Set up real-time updates every 30 seconds
    const interval = setInterval(fetchSignals, 30000);
    
    return () => clearInterval(interval);
  }, []);

  // Check for new signals and send notifications
  useEffect(() => {
    if (previousSignals.length > 0 && signals.length > 0) {
      const newSignals = signals.filter(signal => 
        !previousSignals.some(prev => prev.id === signal.id)
      );

      // Send notifications for new signals
      newSignals.forEach(signal => {
        const signalNotification: SignalNotification = {
          id: signal.id,
          symbol: signal.symbol,
          type: signal.type,
          entry: signal.entry,
          source: signal.source,
          timestamp: signal.timestamp
        };
        
        notificationService.showSignalNotification(signalNotification);
      });
    }
    
    // Update previous signals
    if (signals.length > 0) {
      setPreviousSignals(signals);
    }
  }, [signals, previousSignals]);

  const fetchSignals = async () => {
    try {
      const response = await fetch('/api/signals/trading-signals');
      if (!response.ok) throw new Error('Failed to fetch signals');
      
      const data = await response.json();
      console.log('Raw API response:', data);
      
      // If no signals returned, show message that only real webhook data is displayed
      if (!data.signals || data.signals.length === 0) {
        console.log('No signals returned - only real webhook data from TradingView is displayed');
        setSignals([]);
        setError(null);
        return;
      }
      
      // Transform the API response format to frontend format
      const transformedSignals = (data.signals || []).map((apiSignal: any) => ({
        id: apiSignal.id,
        symbol: apiSignal.Symbol || apiSignal.symbol,
        type: (apiSignal.Direction || apiSignal.type || 'buy').toLowerCase() as 'buy' | 'sell',
        entry: apiSignal['Entry Price'] || apiSignal.entry || 0,
        stopLoss: apiSignal['Stop Loss'] || apiSignal.stopLoss || 0,
        takeProfit: apiSignal['Take Profit'] || apiSignal.takeProfit || apiSignal.TP1 || 0,
        timestamp: apiSignal.Date || apiSignal.timestamp || new Date().toISOString(),
        source: apiSignal.Provider || apiSignal.source || 'Unknown',
        risk: 1,
        notes: apiSignal.Notes || apiSignal.notes || '',
        timeframe: apiSignal.timeframe || (
          apiSignal.Provider?.includes('Hybrid') ? '10m' :
          apiSignal.Provider?.includes('Paradox') ? '30m' :
          apiSignal.Provider?.includes('Solaris') ? '5m' : '1h'
        ),
        status: (apiSignal.Status || apiSignal.status || 'active').toLowerCase() as 'active' | 'closed' | 'cancelled'
      }));
      
      console.log('Transformed signals:', transformedSignals);
      setSignals(transformedSignals);
      setError(null);
    } catch (err) {
      console.error('Error fetching signals:', err);
      setError('Failed to load trading signals. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const filteredSignals = signals.filter(signal => {
    const providerMatch = selectedProvider === 'all' || signal.source === selectedProvider;
    const statusMatch = selectedStatus === 'all' || signal.status === selectedStatus;
    return providerMatch && statusMatch;
  });

  const copySignalToClipboard = async (signal: TradingSignal) => {
    const signalText = `${signal.type.toUpperCase()} ${signal.symbol}
Entry: ${signal.entry}
Stop Loss: ${signal.stopLoss}
Take Profit: ${signal.takeProfit}
Risk: ${signal.risk}%
Provider: ${signal.source}
Notes: ${signal.notes}
Time: ${new Date(signal.timestamp).toLocaleString()}`;

    try {
      await navigator.clipboard.writeText(signalText);
      alert('Signal copied to clipboard!');
    } catch (err) {
      console.error('Failed to copy signal:', err);
    }
  };

  const openInTradingPlatform = (signal: TradingSignal, platform: string) => {
    // Open the trading platform with the signal data
    const platforms = {
      dxtrade: 'https://demo.dx.trade',
      matchtrader: 'https://www.matchtrader.com',
      ctrader: 'https://ctrader.com',
      rithmic: 'https://rithmic.com'
    };
    
    const url = platforms[platform as keyof typeof platforms];
    if (url) {
      window.open(url, '_blank');
      // Copy signal data to clipboard for easy pasting
      copySignalToClipboard(signal);
    }
  };

  const getSignalColor = (type: 'buy' | 'sell') => {
    return type === 'buy' ? 'text-green-400' : 'text-red-400';
  };

  const getSignalIcon = (type: 'buy' | 'sell') => {
    return type === 'buy' ? TrendingUp : TrendingDown;
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-600',
      closed: 'bg-blue-600',
      cancelled: 'bg-red-600'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-600';
  };

  const toggleNotifications = () => {
    if (notificationsEnabled) {
      notificationService.muteAll();
    } else {
      notificationService.unmuteAll();
    }
    setNotificationsEnabled(!notificationsEnabled);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-400 mx-auto"></div>
            <p className="text-white mt-4">Loading trading signals...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4 flex items-center justify-center gap-3">
            <Signal className="h-10 w-10 text-blue-400" />
            Live Trading Signals
          </h1>
          <p className="text-blue-200 text-lg">
            Real-time trading signals from professional providers
          </p>
        </div>

        {error && (
          <Alert className="mb-6 bg-red-900/20 border-red-500/50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-200">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Provider:</label>
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white"
            >
              {providers.map(provider => (
                <option key={provider} value={provider} className="bg-gray-800">
                  {provider === 'all' ? 'All Providers' : provider}
                </option>
              ))}
            </select>
          </div>
          
          <div className="flex items-center gap-2">
            <label className="text-white text-sm">Status:</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-white/10 border border-white/20 rounded px-3 py-1 text-white"
            >
              {statusOptions.map(status => (
                <option key={status} value={status} className="bg-gray-800">
                  {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <Button
            onClick={fetchSignals}
            variant="outline"
            className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white"
          >
            Refresh Signals
          </Button>

          <Button
            onClick={toggleNotifications}
            variant="outline"
            className={`flex items-center gap-2 ${notificationsEnabled 
              ? 'border-green-400 text-green-400 hover:bg-green-400' 
              : 'border-gray-400 text-gray-400 hover:bg-gray-400'} hover:text-white`}
          >
            {notificationsEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
            {notificationsEnabled ? 'Notifications On' : 'Notifications Off'}
          </Button>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{signals.length}</p>
                <p className="text-gray-300 text-sm">Total Signals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">
                  {signals.filter(s => s.status === 'active').length}
                </p>
                <p className="text-gray-300 text-sm">Active Signals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">
                  {signals.filter(s => s.type === 'buy').length}
                </p>
                <p className="text-gray-300 text-sm">Buy Signals</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/5 border-white/10">
            <CardContent className="p-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">
                  {signals.filter(s => s.type === 'sell').length}
                </p>
                <p className="text-gray-300 text-sm">Sell Signals</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Signals Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredSignals.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <Signal className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No trading signals available</p>
              <p className="text-gray-500 text-sm mt-2">
                This page displays only real signals from TradingView webhooks (Paradox AI, Solaris AI, Hybrid AI).
                <br />
                Demo signals have been removed to ensure data integrity.
                <br />
                New signals will appear automatically when webhooks are triggered.
              </p>
            </div>
          ) : (
            filteredSignals.map((signal) => {
              const SignalIcon = getSignalIcon(signal.type);
              
              return (
                <Card key={signal.id} className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <SignalIcon className={`h-5 w-5 ${getSignalColor(signal.type)}`} />
                        <CardTitle className="text-white text-lg">{signal.symbol}</CardTitle>
                      </div>
                      <Badge className={getStatusBadge(signal.status)}>
                        {signal.status}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="border-blue-400 text-blue-400">
                        {signal.source}
                      </Badge>
                      <span className="text-gray-400 text-sm flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {signal.timeframe}
                      </span>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-gray-400">Action</p>
                        <p className={`font-semibold ${getSignalColor(signal.type)}`}>
                          {signal.type.toUpperCase()}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400">Entry</p>
                        <p className="text-white font-semibold">{signal.entry}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Stop Loss</p>
                        <p className="text-red-400 font-semibold">{signal.stopLoss}</p>
                      </div>
                      <div>
                        <p className="text-gray-400">Take Profit</p>
                        <p className="text-green-400 font-semibold">{signal.takeProfit}</p>
                      </div>
                    </div>
                    
                    <div className="border-t border-white/10 pt-3">
                      <p className="text-gray-400 text-sm mb-1">Notes</p>
                      <p className="text-white text-sm">{signal.notes}</p>
                    </div>
                    
                    <div className="text-gray-400 text-xs">
                      {new Date(signal.timestamp).toLocaleString()}
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        size="sm"
                        onClick={() => copySignalToClipboard(signal)}
                        className="bg-blue-600 hover:bg-blue-700 text-white flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1" />
                        Copy
                      </Button>
                      
                      <div className="relative group">
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 text-white"
                        >
                          <ExternalLink className="h-3 w-3 mr-1" />
                          Trade
                        </Button>
                        
                        <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 rounded p-2 space-y-1 min-w-32 z-10">
                          <button
                            onClick={() => openInTradingPlatform(signal, 'dxtrade')}
                            className="block w-full text-left text-white text-xs hover:bg-gray-700 p-1 rounded"
                          >
                            DX Trade
                          </button>
                          <button
                            onClick={() => openInTradingPlatform(signal, 'matchtrader')}
                            className="block w-full text-left text-white text-xs hover:bg-gray-700 p-1 rounded"
                          >
                            Match Trader
                          </button>
                          <button
                            onClick={() => openInTradingPlatform(signal, 'ctrader')}
                            className="block w-full text-left text-white text-xs hover:bg-gray-700 p-1 rounded"
                          >
                            cTrader
                          </button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
        
        {/* Provider Information */}
        <Card className="mt-8 bg-white/5 border-white/10">
          <CardHeader>
            <CardTitle className="text-white">Signal Providers</CardTitle>
            <CardDescription className="text-gray-300">
              Our signals come from verified professional trading providers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Paradox</h3>
                <p className="text-gray-300 text-sm">
                  Specialized in momentum-based trading strategies with high accuracy rates
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Solaris</h3>
                <p className="text-gray-300 text-sm">
                  Technical analysis experts focusing on chart patterns and key levels
                </p>
              </div>
              <div className="p-4 bg-white/5 rounded-lg">
                <h3 className="text-white font-semibold mb-2">Hybrid</h3>
                <p className="text-gray-300 text-sm">
                  Combines fundamental and technical analysis for comprehensive signals
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}