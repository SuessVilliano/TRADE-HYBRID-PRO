import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { 
  Power,
  BarChart2,
  CircleSlash,
  CircleCheck,
  Check,
  ChevronUp,
  ChevronDown,
  RefreshCw,
  Network
} from 'lucide-react';
import { Progress } from '@/components/ui/progress';

// Define ABATEV configuration
const ABATEV_CONFIG = {
  marketDataCheckInterval: 60, // seconds
  tradeExecutionRate: 500, // milliseconds
  aggregationSources: [
    'Alpaca',
    'Oanda',
    'Interactive Brokers',
    'TradingView',
    'Polygon.io',
    'Alpha Vantage'
  ],
  tradeExecutionEngines: [
    'Alpaca',
    'Oanda',
    'Interactive Brokers',
    'NinjaTrader',
    'TradingView'
  ],
  supportedAssets: [
    'Stocks',
    'Forex',
    'Crypto',
    'Commodities',
    'Indices'
  ]
};

const ABATEVStatusPanel: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(42);
  const [cpuUsage, setCpuUsage] = useState<number>(23);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [connectedDataSources, setConnectedDataSources] = useState<string[]>(['Alpaca', 'TradingView']);
  const { toast } = useToast();

  // Toggle ABATEV enabled state
  const toggleABATEV = async () => {
    if (!isEnabled) {
      setIsInitializing(true);
      
      // Simulate API call to enable ABATEV service
      try {
        // Call to server API to toggle ABATEV
        // await abatevService.toggle(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        setIsEnabled(true);
        setIsConnected(true);
        setIsInitializing(false);
        
        toast({
          title: "ABATEV Enabled",
          description: "The Advanced Broker Aggregation Trade Execution Vertex is now active.",
        });
      } catch (error) {
        setIsInitializing(false);
        
        toast({
          title: "Failed to Enable ABATEV",
          description: "There was an error enabling the service. Please try again.",
          variant: "destructive",
        });
      }
    } else {
      setIsEnabled(false);
      setIsConnected(false);
      
      toast({
        title: "ABATEV Disabled",
        description: "The Advanced Broker Aggregation Trade Execution Vertex has been disabled.",
      });
    }
  };

  // Simulate updating connection metrics
  useEffect(() => {
    if (!isEnabled) return;
    
    const interval = setInterval(() => {
      // Simulate changing latency
      setLatency(prev => {
        const newValue = prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 5);
        return Math.max(10, Math.min(150, newValue));
      });
      
      // Simulate changing CPU usage
      setCpuUsage(prev => {
        const newValue = prev + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 3);
        return Math.max(5, Math.min(80, newValue));
      });
      
      // Update connection quality based on latency
      if (latency < 30) {
        setConnectionQuality('excellent');
      } else if (latency < 60) {
        setConnectionQuality('good');
      } else if (latency < 100) {
        setConnectionQuality('fair');
      } else {
        setConnectionQuality('poor');
      }
    }, 3000);
    
    return () => clearInterval(interval);
  }, [isEnabled, latency]);

  // Determine connection quality color
  const connectionQualityColor = {
    excellent: 'text-green-400',
    good: 'text-green-500',
    fair: 'text-amber-400',
    poor: 'text-red-500'
  }[connectionQuality];

  // Determine progress color
  const getProgressColor = (value: number): string => {
    if (value < 30) return 'bg-green-500';
    if (value < 60) return 'bg-blue-500';
    if (value < 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="h-full">
      <CardHeader className="bg-gradient-to-r from-purple-800 to-indigo-900 text-white pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-md flex items-center justify-center">
              <Network className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">ABATEV</CardTitle>
              <CardDescription className="text-indigo-200">
                Advanced Broker Aggregation Trade Execution Vertex
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center">
            {isConnected ? (
              <div className="flex items-center text-green-300 text-sm font-medium">
                <CircleCheck className="h-4 w-4 mr-1" />
                Connected
              </div>
            ) : (
              <div className="flex items-center text-slate-300 text-sm font-medium">
                <CircleSlash className="h-4 w-4 mr-1" />
                Inactive
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-slate-500 mb-4">
          The ABATEV system aggregates market data and optimizes trade execution across multiple brokers in real-time.
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="abatev-enabled" 
              checked={isEnabled}
              onCheckedChange={toggleABATEV}
              disabled={isInitializing}
            />
            <Label 
              htmlFor="abatev-enabled" 
              className="font-medium"
            >
              {isEnabled ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
          
          {isInitializing && (
            <div className="flex items-center text-sm text-slate-500">
              <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
              Initializing...
            </div>
          )}
        </div>
        
        {isEnabled && (
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <p className="text-sm font-medium">Connection Quality</p>
                <p className={`text-sm font-medium ${connectionQualityColor}`}>
                  {connectionQuality.charAt(0).toUpperCase() + connectionQuality.slice(1)}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500 mb-1">Latency</p>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={(latency / 150) * 100} 
                      className={`h-2 ${getProgressColor(latency)}`}
                    />
                    <span className="text-xs ml-2 tabular-nums">{latency}ms</span>
                  </div>
                </div>
                <div>
                  <p className="text-xs text-slate-500 mb-1">CPU Usage</p>
                  <div className="flex items-center justify-between">
                    <Progress 
                      value={cpuUsage} 
                      className={`h-2 ${getProgressColor(cpuUsage)}`}
                    />
                    <span className="text-xs ml-2 tabular-nums">{cpuUsage}%</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Active Data Sources</p>
                <span className="text-xs text-slate-500">{connectedDataSources.length} connected</span>
              </div>
              <div className="flex flex-wrap gap-1 mt-1">
                {connectedDataSources.map((source: string) => (
                  <div 
                    key={source}
                    className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-full flex items-center"
                  >
                    <Check className="h-3 w-3 mr-1 text-green-500" />
                    {source}
                  </div>
                ))}
              </div>
            </div>
            
            <Button
              variant="ghost" 
              size="sm"
              className="w-full flex items-center justify-center text-xs mt-2"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Hide Details
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show Details
                </>
              )}
            </Button>
            
            {showDetails && (
              <div className="border rounded-md p-3 text-sm space-y-2 bg-slate-50 dark:bg-slate-900">
                <div>
                  <p className="text-xs font-medium">Market Data Check Interval</p>
                  <p className="text-xs text-slate-500">{ABATEV_CONFIG.marketDataCheckInterval}s</p>
                </div>
                <div>
                  <p className="text-xs font-medium">Trade Execution Rate</p>
                  <p className="text-xs text-slate-500">{ABATEV_CONFIG.tradeExecutionRate}ms</p>
                </div>
                <div>
                  <p className="text-xs font-medium">Supported Asset Classes</p>
                  <p className="text-xs text-slate-500">{ABATEV_CONFIG.supportedAssets.join(', ')}</p>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs" 
          disabled={!isEnabled}
          onClick={() => {
            // Simulate checking service status
            toast({
              title: "ABATEV Status",
              description: `All systems operational. Last health check: ${new Date().toLocaleTimeString()}`,
            });
          }}
        >
          Check Status
        </Button>
        
        <Button 
          variant={isEnabled ? "destructive" : "default"}
          size="sm"
          className="text-xs"
          onClick={toggleABATEV}
          disabled={isInitializing}
        >
          <Power className="h-3 w-3 mr-1" />
          {isEnabled ? 'Disable ABATEV' : 'Enable ABATEV'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ABATEVStatusPanel;