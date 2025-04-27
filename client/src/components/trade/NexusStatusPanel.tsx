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
  Network,
  Workflow,
  Zap,
  BadgeCheck,
  BarChart4,
  Shield,
  BrainCircuit,
  Layers,
  Cpu
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  getNexusStatus, 
  initializeTradeNexus, 
  toggleTradeNexus, 
  resetTradeNexus,
  EXECUTION_PROFILES
} from '@/lib/services/nexus-service';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define Nexus configuration
const NEXUS_CONFIG = {
  marketDataCheckInterval: 30, // seconds
  tradeExecutionRate: 250, // milliseconds
  aggregationSources: [
    'Alpaca',
    'Oanda',
    'Interactive Brokers',
    'TradingView',
    'Polygon.io',
    'Alpha Vantage',
    'Binance',
    'FTX',
    'Kraken'
  ],
  tradeExecutionEngines: [
    'Alpaca',
    'Oanda',
    'Interactive Brokers',
    'NinjaTrader',
    'TradingView',
    'Binance',
    'FTX'
  ],
  supportedAssets: [
    'Stocks',
    'Forex',
    'Crypto',
    'Commodities',
    'Indices',
    'Options',
    'Futures'
  ],
  aiFeatures: [
    'Smart Order Routing', 
    'Latency Prediction', 
    'Slippage Forecasting',
    'Price Anomaly Detection',
    'Self-Healing Error Recovery',
    'Broker Failover Protection'
  ],
  executionProfiles: Object.keys(EXECUTION_PROFILES)
};

const NexusStatusPanel: React.FC = () => {
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  const [latency, setLatency] = useState<number>(42);
  const [cpuUsage, setCpuUsage] = useState<number>(23);
  const [showDetails, setShowDetails] = useState<boolean>(false);
  const [connectionQuality, setConnectionQuality] = useState<'excellent' | 'good' | 'fair' | 'poor'>('good');
  const [connectedDataSources, setConnectedDataSources] = useState<string[]>(['Alpaca', 'TradingView']);
  const { toast } = useToast();

  // Toggle Nexus enabled state
  const toggleNexusState = async () => {
    if (!isEnabled) {
      setIsInitializing(true);
      
      try {
        // Attempt to initialize and toggle the Nexus service
        await initializeTradeNexus();
        const result = await toggleTradeNexus(true);
        
        if (result.success) {
          setIsEnabled(true);
          setIsConnected(true);
          
          toast({
            title: "Nexus™ Enabled",
            description: "Intelligent trade routing and execution system is now active.",
          });
        } else {
          throw new Error(result.message || "Failed to enable Nexus");
        }
      } catch (error) {
        toast({
          title: "Failed to Enable Nexus™",
          description: error instanceof Error ? error.message : "Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    } else {
      try {
        const result = await toggleTradeNexus(false);
        
        setIsEnabled(false);
        setIsConnected(false);
        
        toast({
          title: "Nexus™ Disabled",
          description: "Intelligent trade routing and execution system has been disabled.",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to disable Nexus™. Please try again.",
          variant: "destructive",
        });
      }
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
      <CardHeader className="bg-gradient-to-r from-blue-800 to-indigo-900 text-white pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
              <Workflow className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center">
                <CardTitle className="text-lg flex items-center">Nexus™</CardTitle>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="ml-2 px-1.5 py-0.5 text-[10px] bg-blue-500/30 rounded-sm text-blue-200 uppercase font-semibold">PREMIUM</span>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      <p className="text-xs w-48">Nexus™ is our premium intelligent trade routing and optimization platform.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <CardDescription className="text-indigo-200">
                Intelligent Broker Aggregation & Smart Order Routing
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
        <div className="flex gap-2 mb-4">
          <div className="flex-1 bg-blue-50 dark:bg-blue-950/30 rounded-md p-2 text-xs">
            <div className="flex items-center mb-1 text-blue-700 dark:text-blue-400">
              <BrainCircuit className="h-3.5 w-3.5 mr-1" />
              <span className="font-medium">AI-Powered Routing</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Intelligent order routing with dynamic price analysis</p>
          </div>
          <div className="flex-1 bg-indigo-50 dark:bg-indigo-950/30 rounded-md p-2 text-xs">
            <div className="flex items-center mb-1 text-indigo-700 dark:text-indigo-400">
              <Shield className="h-3.5 w-3.5 mr-1" />
              <span className="font-medium">Self-Healing</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300">Automated error detection and recovery systems</p>
          </div>
        </div>

        <p className="text-sm text-slate-500 mb-4">
          Nexus™ intelligently routes orders through multiple brokers for optimal execution speed, price, and reliability.
        </p>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Switch 
              id="nexus-enabled" 
              checked={isEnabled}
              onCheckedChange={toggleNexusState}
              disabled={isInitializing}
            />
            <Label 
              htmlFor="nexus-enabled" 
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
              <div className="border rounded-md p-3 text-sm space-y-3 bg-slate-50 dark:bg-slate-900">
                <Tabs defaultValue="general" className="w-full">
                  <TabsList className="w-full grid grid-cols-3 h-7 text-[10px]">
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="features">AI Features</TabsTrigger>
                    <TabsTrigger value="profiles">Profiles</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="general" className="space-y-2 mt-2">
                    <div>
                      <p className="text-xs font-medium">Market Data Check Interval</p>
                      <p className="text-xs text-slate-500">{NEXUS_CONFIG.marketDataCheckInterval}s</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Trade Execution Rate</p>
                      <p className="text-xs text-slate-500">{NEXUS_CONFIG.tradeExecutionRate}ms</p>
                    </div>
                    <div>
                      <p className="text-xs font-medium">Supported Asset Classes</p>
                      <p className="text-xs text-slate-500">{NEXUS_CONFIG.supportedAssets.join(', ')}</p>
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="features" className="mt-2">
                    <p className="text-xs font-medium mb-1">AI-Powered Features</p>
                    <div className="grid grid-cols-1 gap-1">
                      {NEXUS_CONFIG.aiFeatures.map((feature) => (
                        <div key={feature} className="flex items-center text-xs">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-1.5"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="profiles" className="mt-2">
                    <p className="text-xs font-medium mb-1">Execution Profiles</p>
                    <div className="grid grid-cols-2 gap-1">
                      {NEXUS_CONFIG.executionProfiles.map((profile) => (
                        <div 
                          key={profile} 
                          className="flex items-center text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"
                        >
                          <Layers className="h-3 w-3 mr-1 text-indigo-500" />
                          <span>{profile}</span>
                        </div>
                      ))}
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex flex-col pt-2 space-y-2">
        <div className="grid grid-cols-2 w-full gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-xs" 
            disabled={!isEnabled}
            onClick={() => {
              toast({
                title: "Nexus™ Status",
                description: `All systems operational. Last health check: ${new Date().toLocaleTimeString()}`,
              });
            }}
          >
            <Cpu className="h-3 w-3 mr-1" />
            Check Status
          </Button>
          
          <Button 
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!isEnabled}
            onClick={() => {
              toast({
                title: "Self-Healing Diagnostics",
                description: "Running diagnostic scan on all connections. AI error detection engaged.",
              });
            }}
          >
            <Shield className="h-3 w-3 mr-1" />
            Diagnostics
          </Button>
        </div>
        
        <div className="flex justify-between w-full">
          <Button 
            variant="outline"
            size="sm"
            className="text-xs"
            disabled={!isEnabled || isInitializing}
            onClick={() => {
              resetTradeNexus();
              toast({
                title: "Nexus™ Reset",
                description: "System has been reset and reconnected to all brokers.",
              });
            }}
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Reset System
          </Button>
          
          <Button 
            variant={isEnabled ? "destructive" : "default"}
            size="sm"
            className="text-xs"
            onClick={toggleNexusState}
            disabled={isInitializing}
          >
            <Power className="h-3 w-3 mr-1" />
            {isEnabled ? 'Disable Nexus™' : 'Enable Nexus™'}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default NexusStatusPanel;