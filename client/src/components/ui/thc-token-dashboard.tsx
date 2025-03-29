import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/components/ui/use-toast';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  TooltipProps
} from 'recharts';
import {
  Wallet,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  CreditCard,
  Users,
  BarChart2,
  DollarSign,
  Clock,
  ArrowRight,
  Info,
  ExternalLink
} from 'lucide-react';
import { useSolanaAuth } from '@/lib/context/SolanaAuthProvider';
import { THC_TOKEN, THC_TOKEN_PRICE_HISTORY, THC_TOKEN_TRADING_VOLUME } from '@/lib/constants';
import { calculateStakingRewards, calculateStakingApy } from '@/lib/contracts/thc-token-info';

// Define TypeScript interfaces for our data
interface PriceDataPoint {
  timestamp: number;
  price: number;
}

interface VolumeDataPoint {
  date: string;
  volume: number;
}

interface MetricsData {
  priceChange: number;
  priceChangePercent: number;
  totalVolume: number;
  avgVolume: number;
  volatility: number;
}

export function THCTokenDashboard() {
  const solanaAuth = useSolanaAuth();
  const [currentTimeframe, setCurrentTimeframe] = useState('1W');
  const [currentView, setCurrentView] = useState('price');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { toast } = useToast();
  
  // Get visible price history based on selected timeframe
  const getVisiblePriceHistory = () => {
    switch (currentTimeframe) {
      case '1D':
        return THC_TOKEN_PRICE_HISTORY.slice(-24);
      case '1W':
        return THC_TOKEN_PRICE_HISTORY.slice(-168);
      case '1M':
        return THC_TOKEN_PRICE_HISTORY.slice(-720);
      case 'ALL':
      default:
        return THC_TOKEN_PRICE_HISTORY;
    }
  };
  
  // Calculate key metrics
  const calculateMetrics = (): MetricsData => {
    const visibleData = getVisiblePriceHistory();
    
    // Price change calculation
    const startPrice = visibleData[0]?.price || 0;
    const endPrice = visibleData[visibleData.length - 1]?.price || 0;
    const priceChange = endPrice - startPrice;
    const priceChangePercent = startPrice ? (priceChange / startPrice) * 100 : 0;
    
    // Trading volume calculation
    const volumeData = THC_TOKEN_TRADING_VOLUME.filter((v: VolumeDataPoint) => {
      const date = new Date(v.date);
      const now = new Date();
      
      switch (currentTimeframe) {
        case '1D':
          return date >= new Date(now.setDate(now.getDate() - 1));
        case '1W':
          return date >= new Date(now.setDate(now.getDate() - 7));
        case '1M':
          return date >= new Date(now.setMonth(now.getMonth() - 1));
        case 'ALL':
        default:
          return true;
      }
    });
    
    const totalVolume = volumeData.reduce((sum: number, item: VolumeDataPoint) => sum + item.volume, 0);
    const avgVolume = volumeData.length ? totalVolume / volumeData.length : 0;
    
    return {
      priceChange,
      priceChangePercent,
      totalVolume,
      avgVolume,
      volatility: calculateVolatility(visibleData)
    };
  };
  
  // Calculate price volatility
  const calculateVolatility = (data: PriceDataPoint[]): number => {
    if (!data.length) return 0;
    
    const prices = data.map(item => item.price);
    const avgPrice = prices.reduce((sum: number, price: number) => sum + price, 0) / prices.length;
    const squaredDiffs = prices.map(price => Math.pow(price - avgPrice, 2));
    const avgSquaredDiff = squaredDiffs.reduce((sum: number, diff: number) => sum + diff, 0) / squaredDiffs.length;
    return Math.sqrt(avgSquaredDiff) / avgPrice * 100; // Percent volatility
  };
  
  // Metrics derived from calculations
  const metrics = calculateMetrics();
  
  // Simulated refresh
  const handleRefresh = (): void => {
    setIsRefreshing(true);
    
    // Simulate a data refresh delay
    setTimeout(() => {
      setIsRefreshing(false);
      toast({
        title: 'Data Refreshed',
        description: 'THC token data has been updated with the latest information.',
      });
      
      // If wallet is connected, also refresh THC balance
      if (solanaAuth.isWalletAuthenticated) {
        solanaAuth.checkTHCTokenMembership().catch(console.error);
      }
    }, 1500);
  };
  
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: value < 0.01 ? 6 : 2,
      maximumFractionDigits: value < 0.01 ? 6 : 2,
    }).format(value);
  };
  
  const formatNumber = (value: number): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };
  
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    if (currentTimeframe === '1D') {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };
  
  // Custom tooltip component with proper typing
  interface CustomTooltipProps {
    active?: boolean;
    payload?: Array<{ value: number }>;
    label?: number | string;
  }
  
  const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-800 border border-slate-700 p-3 rounded shadow-lg">
          <p className="text-slate-300 mb-1">{formatDate(label as number)}</p>
          <p className="font-medium text-blue-400">
            {currentView === 'price' 
              ? `Price: ${formatCurrency(payload[0].value)}`
              : `Volume: ${formatNumber(payload[0].value)} THC`
            }
          </p>
        </div>
      );
    }
    return null;
  };
  
  return (
    <Card className="overflow-hidden">
      <CardHeader className="bg-slate-850 border-b border-slate-700">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <BarChart2 className="text-purple-500" size={20} />
              THC Token Dashboard
            </CardTitle>
            <CardDescription>
              Real-time analytics and metrics for the THC token
            </CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="flex items-center gap-1"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
            <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="px-0 pt-0 pb-0">
        <div className="grid grid-cols-1 xl:grid-cols-4 bg-slate-50 dark:bg-slate-800/30">
          <div className="p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">Current Price</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(THC_TOKEN.price)}
            </div>
            <div className={`text-sm flex items-center mt-1 ${metrics.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {metrics.priceChangePercent >= 0 ? (
                <TrendingUp size={14} className="mr-1" />
              ) : (
                <TrendingDown size={14} className="mr-1" />
              )}
              {metrics.priceChangePercent.toFixed(2)}% {currentTimeframe}
            </div>
          </div>
          
          <div className="p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">Market Cap</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(THC_TOKEN.marketCap)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Rank #{THC_TOKEN.rank}
            </div>
          </div>
          
          <div className="p-4 border-b xl:border-b-0 xl:border-r border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-500 dark:text-slate-400">24h Volume</div>
            <div className="text-2xl font-bold mt-1">
              {formatCurrency(THC_TOKEN.volume24h)}
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {formatNumber(THC_TOKEN.volume24h / THC_TOKEN.price)} THC
            </div>
          </div>
          
          <div className="p-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">Circulating Supply</div>
            <div className="text-2xl font-bold mt-1">
              {formatNumber(THC_TOKEN.circulatingSupply)} THC
            </div>
            <div className="flex items-center mt-1">
              <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
                <div 
                  className="bg-blue-500 h-full rounded-full" 
                  style={{ width: `${(THC_TOKEN.circulatingSupply / THC_TOKEN.maxSupply) * 100}%` }}
                ></div>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 ml-2">
                {((THC_TOKEN.circulatingSupply / THC_TOKEN.maxSupply) * 100).toFixed(0)}%
              </span>
            </div>
          </div>
        </div>
        
        <div className="p-6">
          <div className="mb-4 flex justify-between items-center">
            <Tabs 
              defaultValue="price" 
              className="w-full" 
              onValueChange={setCurrentView}
            >
              <TabsList>
                <TabsTrigger value="price">Price Chart</TabsTrigger>
                <TabsTrigger value="volume">Volume Chart</TabsTrigger>
              </TabsList>
            </Tabs>
            
            <div className="flex gap-1">
              {['1D', '1W', '1M', 'ALL'].map(timeframe => (
                <Button
                  key={timeframe}
                  variant={currentTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  className="text-xs px-2 h-8"
                  onClick={() => setCurrentTimeframe(timeframe)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
          
          <div className="h-72">
            {currentView === 'price' ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={getVisiblePriceHistory()}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    tickFormatter={formatDate}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatCurrency(value)}
                    stroke="#6B7280"
                    domain={['auto', 'auto']}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#8884d8" 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={THC_TOKEN_TRADING_VOLUME.filter((v: VolumeDataPoint) => {
                    const date = new Date(v.date);
                    const now = new Date();
                    
                    switch (currentTimeframe) {
                      case '1D':
                        return date >= new Date(now.setDate(now.getDate() - 1));
                      case '1W':
                        return date >= new Date(now.setDate(now.getDate() - 7));
                      case '1M':
                        return date >= new Date(now.setMonth(now.getMonth() - 1));
                      case 'ALL':
                      default:
                        return true;
                    }
                  })}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(value) => {
                      const date = new Date(value);
                      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                    }}
                    stroke="#6B7280"
                  />
                  <YAxis 
                    tickFormatter={(value) => formatNumber(value)}
                    stroke="#6B7280"
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="volume" fill="#4f46e5" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
              <div className="flex items-center mb-1">
                <TrendingUp className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">Price Change</span>
              </div>
              <div className={`text-lg font-bold ${metrics.priceChangePercent >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {metrics.priceChangePercent.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(metrics.priceChange)}
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
              <div className="flex items-center mb-1">
                <BarChart2 className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">Volatility</span>
              </div>
              <div className="text-lg font-bold">
                {metrics.volatility.toFixed(2)}%
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {currentTimeframe} period
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
              <div className="flex items-center mb-1">
                <CreditCard className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">Total Volume</span>
              </div>
              <div className="text-lg font-bold">
                {formatNumber(metrics.totalVolume)} THC
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                {formatCurrency(metrics.totalVolume * THC_TOKEN.price)}
              </div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-md">
              <div className="flex items-center mb-1">
                <DollarSign className="mr-2 h-4 w-4 text-slate-500" />
                <span className="text-sm font-medium">AVG Volume</span>
              </div>
              <div className="text-lg font-bold">
                {formatNumber(metrics.avgVolume)} THC
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">
                Per day in {currentTimeframe}
              </div>
            </div>
          </div>
          
          {solanaAuth.isWalletAuthenticated && solanaAuth.tokenMembership && (
            <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-md border border-blue-200 dark:border-blue-800">
              <h3 className="font-medium mb-3 flex items-center">Your THC Balance</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <Wallet className="h-4 w-4 text-blue-500 mr-2" />
                    <span className="text-sm font-medium">Balance</span>
                  </div>
                  <div className="text-xl font-bold">
                    {formatNumber(solanaAuth.tokenMembership.tokenBalance)} THC
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    ≈ {formatCurrency(solanaAuth.tokenMembership.tokenBalance * THC_TOKEN.price)}
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <Users className="h-4 w-4 text-purple-500 mr-2" />
                    <span className="text-sm font-medium">Membership</span>
                  </div>
                  <div className="text-xl font-bold capitalize">
                    {solanaAuth.tokenMembership.tier}
                  </div>
                  <div className="text-sm text-slate-500 mt-1">
                    {solanaAuth.tokenMembership.feeDiscount}% fee discount
                  </div>
                </div>
                
                <div className="bg-white dark:bg-slate-800 p-3 rounded-md shadow-sm">
                  <div className="flex items-center mb-2">
                    <Clock className="h-4 w-4 text-amber-500 mr-2" />
                    <span className="text-sm font-medium">Potential APY</span>
                  </div>
                  <div className="text-xl font-bold">
                    {calculateStakingApy(90)}%
                  </div>
                  <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-1">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    <a href="/thc-staking" className="hover:underline">Stake now</a>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-between items-center">
            <div className="flex items-center">
              <Info size={14} className="text-slate-500 mr-1" />
              <span className="text-xs text-slate-500">Data updates every 5 minutes</span>
            </div>
            <a 
              href={THC_TOKEN.pumpFunUrl} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-xs flex items-center text-blue-500 hover:text-blue-600"
            >
              View on pump.fun
              <ExternalLink size={12} className="ml-1" />
            </a>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}