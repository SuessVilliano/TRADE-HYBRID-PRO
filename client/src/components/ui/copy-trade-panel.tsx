import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { Switch } from './switch';
import { Slider } from './slider';
import { Tabs, TabsList, TabsTrigger } from './tabs';
import { Users, AlertCircle } from 'lucide-react';
import { useBrokerAggregator } from '@/lib/hooks/useBrokerAggregator';
import { api } from '@/lib/api';

interface CopyTrader {
  id: number;
  username: string;
  avatar: string;
  settings: {
    profitShare: number;
    riskLevel: string;
    minCopyAmount: number;
    maxFollowers: number;
    description: string;
  };
  stats: {
    profitability: number;
    drawdown: number;
    winRate: number;
    followers: number;
  };
}

export function CopyTradePanel() {
  const { isAuthenticated, currentBroker } = useBrokerAggregator();
  const [traders, setTraders] = useState<CopyTrader[]>([]);
  const [selectedTrader, setSelectedTrader] = useState<CopyTrader | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [copySettings, setCopySettings] = useState({
    riskMultiplier: 1,
    maxExposure: 1000,
    autoClose: true,
    copyStopLoss: true,
    copyTakeProfit: true
  });

  useEffect(() => {
    if (isAuthenticated) {
      fetchCopyTraders();
    }
  }, [isAuthenticated]);

  const fetchCopyTraders = async () => {
    setIsLoading(true);
    try {
      const response = await api.get('/api/copy-trading/traders');
      setTraders(response.data);
    } catch (error) {
      console.error('Failed to fetch copy traders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startCopyTrading = async () => {
    if (!selectedTrader) return;

    try {
      await api.post('/api/copy-trading/follow', {
        traderId: selectedTrader.id,
        settings: copySettings
      });

      setSelectedTrader(null);
      // Refresh traders list
      fetchCopyTraders();
    } catch (error) {
      console.error('Failed to start copy trading:', error);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card className="w-full h-full">
        <CardHeader>
          <CardTitle>Copy Trading</CardTitle>
          <CardDescription>Connect your broker to start copy trading</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center">
          <AlertCircle className="w-12 h-12 text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full h-full">
      <CardHeader>
        <CardTitle>Copy Trading</CardTitle>
        <CardDescription>Follow top-performing traders</CardDescription>
      </CardHeader>
      <CardContent>
        {!selectedTrader ? (
          <div className="space-y-4">
            {traders.map((trader) => (
              <div 
                key={trader.id}
                className="p-4 border rounded-lg hover:bg-accent cursor-pointer"
                onClick={() => setSelectedTrader(trader)}
              >
                <div className="flex items-center gap-4">
                  <img 
                    src={trader.avatar} 
                    alt={trader.username}
                    className="w-12 h-12 rounded-full"
                  />
                  <div>
                    <h3 className="font-semibold">{trader.username}</h3>
                    <p className="text-sm text-muted-foreground">
                      Win Rate: {trader.stats.winRate}% | Followers: {trader.stats.followers}
                    </p>
                  </div>
                  <div className="ml-auto">
                    <p className="text-xl font-bold text-green-500">
                      +{trader.stats.profitability}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-4 border-b pb-4">
              <img 
                src={selectedTrader.avatar}
                alt={selectedTrader.username}
                className="w-16 h-16 rounded-full"
              />
              <div>
                <h2 className="text-xl font-bold">{selectedTrader.username}</h2>
                <p className="text-muted-foreground">{selectedTrader.settings.description}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Risk Multiplier</Label>
                <Slider
                  value={[copySettings.riskMultiplier]}
                  min={0.1}
                  max={2}
                  step={0.1}
                  onValueChange={([value]) => 
                    setCopySettings(prev => ({ ...prev, riskMultiplier: value }))
                  }
                />
              </div>

              <div>
                <Label>Max Exposure ($)</Label>
                <Input
                  type="number"
                  value={copySettings.maxExposure}
                  onChange={(e) => 
                    setCopySettings(prev => ({ 
                      ...prev, 
                      maxExposure: parseFloat(e.target.value) 
                    }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Copy Stop Loss</Label>
                <Switch
                  checked={copySettings.copyStopLoss}
                  onCheckedChange={(checked) =>
                    setCopySettings(prev => ({ ...prev, copyStopLoss: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <Label>Copy Take Profit</Label>
                <Switch
                  checked={copySettings.copyTakeProfit}
                  onCheckedChange={(checked) =>
                    setCopySettings(prev => ({ ...prev, copyTakeProfit: checked }))
                  }
                />
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-end gap-2">
        {selectedTrader && (
          <>
            <Button variant="outline" onClick={() => setSelectedTrader(null)}>
              Cancel
            </Button>
            <Button onClick={startCopyTrading}>
              Start Copy Trading
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}