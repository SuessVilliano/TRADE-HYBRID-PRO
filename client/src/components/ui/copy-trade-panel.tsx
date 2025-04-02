import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart3, Settings, RefreshCw, Wallet } from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';

interface CopyTradePanelProps {
  className?: string;
}

export function CopyTradePanel({ className }: CopyTradePanelProps) {
  const [selectedSignal, setSelectedSignal] = useState<TradeSignal | null>(null);
  const [connectedBrokers, setConnectedBrokers] = useState<{ id: string; name: string; connected: boolean }[]>([
    { id: 'alpaca', name: 'Alpaca', connected: true },
    { id: 'binance', name: 'Binance', connected: false },
    { id: 'tradingview', name: 'TradingView', connected: false },
  ]);
  const [selectedBroker, setSelectedBroker] = useState<string | null>('alpaca');
  const [autoCopyEnabled, setAutoCopyEnabled] = useState(false);
  const [riskPercentage, setRiskPercentage] = useState<string>('1.0');
  const [maxOpenTrades, setMaxOpenTrades] = useState<string>('3');

  // Listen for copy trade events
  useEffect(() => {
    const handleCopyTradeEvent = (event: Event) => {
      // Type assertion to access custom event details
      const customEvent = event as CustomEvent;
      if (customEvent.detail && customEvent.detail.signal) {
        setSelectedSignal(customEvent.detail.signal);
      }
    };

    window.addEventListener('copy-trade-signal', handleCopyTradeEvent);

    return () => {
      window.removeEventListener('copy-trade-signal', handleCopyTradeEvent);
    };
  }, []);

  const handleExecuteTrade = () => {
    if (!selectedSignal || !selectedBroker) return;
    
    // Here we would connect to the broker API and execute the trade
    console.log(`Executing ${selectedSignal.type} order for ${selectedSignal.symbol} on ${selectedBroker} broker`);
    
    // Reset after execution
    setTimeout(() => {
      setSelectedSignal(null);
    }, 1500);
  };

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle>Copy Trading</CardTitle>
        <CardDescription>Execute trades from signals across connected platforms</CardDescription>
      </CardHeader>
      <CardContent>
        {selectedSignal ? (
          <div className="space-y-4">
            <div className="p-3 bg-muted rounded-md">
              <h3 className="font-medium mb-2">Selected Signal</h3>
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div>
                  <p className="text-sm text-muted-foreground">Symbol</p>
                  <p className="font-semibold">{selectedSignal.symbol}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Type</p>
                  <p className={`font-semibold ${selectedSignal.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                    {selectedSignal.type.toUpperCase()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Entry</p>
                  <p className="font-semibold">{selectedSignal.entry.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Risk</p>
                  <p className="font-semibold">{selectedSignal.risk}%</p>
                </div>
                {selectedSignal.stopLoss && (
                  <div>
                    <p className="text-sm text-muted-foreground">Stop Loss</p>
                    <p className="font-semibold">{selectedSignal.stopLoss.toLocaleString()}</p>
                  </div>
                )}
                {selectedSignal.takeProfit && (
                  <div>
                    <p className="text-sm text-muted-foreground">Take Profit</p>
                    <p className="font-semibold">{selectedSignal.takeProfit.toLocaleString()}</p>
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{selectedSignal.notes}</p>
            </div>

            <div className="space-y-3">
              <div className="flex flex-col gap-2">
                <Label htmlFor="broker-select">Execute with broker</Label>
                <Select 
                  value={selectedBroker || ''} 
                  onValueChange={(value) => setSelectedBroker(value)}
                >
                  <SelectTrigger id="broker-select">
                    <SelectValue placeholder="Select a broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {connectedBrokers.map(broker => (
                      <SelectItem 
                        key={broker.id}
                        value={broker.id}
                        disabled={!broker.connected}
                      >
                        {broker.name} {!broker.connected && '(Not Connected)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="risk-percentage">Risk per trade (%)</Label>
                <Select 
                  value={riskPercentage} 
                  onValueChange={setRiskPercentage}
                >
                  <SelectTrigger id="risk-percentage">
                    <SelectValue placeholder="Select risk %" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0.5">0.5%</SelectItem>
                    <SelectItem value="1.0">1.0%</SelectItem>
                    <SelectItem value="2.0">2.0%</SelectItem>
                    <SelectItem value="3.0">3.0%</SelectItem>
                    <SelectItem value="5.0">5.0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button 
                  variant="default" 
                  onClick={handleExecuteTrade}
                  disabled={!selectedBroker}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Execute Trade
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Switch 
                  id="auto-copy" 
                  checked={autoCopyEnabled}
                  onCheckedChange={setAutoCopyEnabled}
                />
                <Label htmlFor="auto-copy">Auto-copy signals</Label>
              </div>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-6 border border-dashed rounded-md flex flex-col items-center justify-center text-center space-y-2 text-muted-foreground">
              <BarChart3 className="h-8 w-8 mb-2 opacity-50" />
              <h3 className="font-medium">No Active Signal</h3>
              <p className="text-sm">
                Copy a signal from the Trading Signals tab to execute it with your connected broker.
              </p>
            </div>

            <div className="bg-muted p-3 rounded-md">
              <h3 className="font-medium mb-3 flex items-center">
                <Wallet className="h-4 w-4 mr-2" />
                Connected Brokers
              </h3>
              <div className="space-y-2">
                {connectedBrokers.map(broker => (
                  <div key={broker.id} className="flex justify-between items-center text-sm">
                    <span>{broker.name}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${broker.connected ? 'bg-green-500/20 text-green-600' : 'bg-red-500/20 text-red-600'}`}>
                      {broker.connected ? 'Connected' : 'Disconnected'}
                    </span>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-3" variant="outline" size="sm">
                Connect Broker
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}