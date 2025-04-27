import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import { 
  Briefcase, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  BarChart2, 
  Coins, 
  DollarSign,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { Badge } from "../ui/badge";
import { Skeleton } from "../ui/skeleton";
import { formatCurrency, formatNumber } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

interface BrokerAccountData {
  brokerName: string;
  accountId: string;
  accountType: string;
  cash: number;
  equity: number;
  marketValue: number;
  buyingPower: number;
  dayTradeCount?: number;
  marginUsed?: number;
  marginAvailable?: number;
  positions: {
    symbol: string;
    quantity: number;
    marketValue: number;
    unrealizedPL: number;
    todayPL: number;
    percentChange: number;
  }[];
  status: string;
  timestamp: Date;
  currency: string;
}

interface BrokerAccountInfoProps {
  brokerId: string;
  onRefresh?: () => void;
}

// Demo data for development - in production, this would be fetched from the API
const getDemoData = (brokerId: string): BrokerAccountData => {
  // This would be removed in production and replaced with real data
  const now = new Date();
  
  const basicData = {
    accountId: 'DEMO123456',
    accountType: 'CASH',
    status: 'ACTIVE',
    timestamp: now,
    currency: 'USD',
    positions: Array(3).fill(null).map((_, i) => ({
      symbol: ['AAPL', 'MSFT', 'AMZN'][i],
      quantity: Math.floor(Math.random() * 10) + 1,
      marketValue: Math.random() * 5000 + 1000,
      unrealizedPL: (Math.random() * 200) - 100,
      todayPL: (Math.random() * 100) - 50,
      percentChange: (Math.random() * 5) - 2.5
    }))
  };
  
  if (brokerId === 'alpaca') {
    return {
      ...basicData,
      brokerName: 'Alpaca',
      cash: 5000.75,
      equity: 12500.33,
      marketValue: 7500.58,
      buyingPower: 10000.00,
      dayTradeCount: 1,
      marginUsed: 2500.00,
      marginAvailable: 7500.00,
      positions: basicData.positions
    };
  } else if (brokerId === 'oanda') {
    return {
      ...basicData,
      brokerName: 'Oanda',
      cash: 3200.90,
      equity: 4800.25,
      marketValue: 1600.65,
      buyingPower: 9600.00,
      marginUsed: 800.00,
      marginAvailable: 3000.00,
      positions: basicData.positions.map(p => ({
        ...p,
        symbol: ['EUR_USD', 'GBP_JPY', 'USD_CAD'][basicData.positions.indexOf(p)]
      }))
    };
  } else if (brokerId === 'interactive_brokers') {
    return {
      ...basicData,
      brokerName: 'Interactive Brokers',
      cash: 15000.50,
      equity: 42500.25,
      marketValue: 27500.75,
      buyingPower: 30000.00,
      marginUsed: 12500.00,
      marginAvailable: 17500.00,
      positions: basicData.positions
    };
  } else {
    return {
      ...basicData,
      brokerName: 'Connected Broker',
      cash: 10000.00,
      equity: 15000.00,
      marketValue: 5000.00,
      buyingPower: 20000.00,
      positions: basicData.positions
    };
  }
};

const BrokerAccountInfo: React.FC<BrokerAccountInfoProps> = ({ brokerId, onRefresh }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<BrokerAccountData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccountData = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // In production, this would be a real API call
      // const response = await fetch(`/api/broker-accounts/${brokerId}`);
      // if (!response.ok) throw new Error('Failed to fetch account data');
      // const data = await response.json();
      // setAccountData(data);
      
      // Using demo data for now
      // This setTimeout simulates a network delay
      setTimeout(() => {
        const demoData = getDemoData(brokerId);
        setAccountData(demoData);
        setLoading(false);
        setRefreshing(false);
      }, 1000);
      
    } catch (err) {
      setError('Failed to load account data. Please try again.');
      setLoading(false);
      setRefreshing(false);
    }
  };

  // Initial data load
  useEffect(() => {
    fetchAccountData();
  }, [brokerId]);

  const handleRefresh = () => {
    fetchAccountData();
    if (onRefresh) onRefresh();
  };

  // Calculate margin usage percentage
  const getMarginUsagePercentage = () => {
    if (!accountData?.marginUsed || !accountData?.marginAvailable) return 0;
    const total = accountData.marginUsed + accountData.marginAvailable;
    return total > 0 ? (accountData.marginUsed / total) * 100 : 0;
  };

  const marginUsagePercentage = accountData ? getMarginUsagePercentage() : 0;

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-xl">
              {loading ? (
                <Skeleton className="h-7 w-48" />
              ) : (
                <>
                  <Briefcase className="inline-block mr-2 h-5 w-5" />
                  {accountData?.brokerName || 'Broker'} Account
                </>
              )}
            </CardTitle>
            <CardDescription>
              {loading ? (
                <Skeleton className="h-4 w-64 mt-2" />
              ) : (
                <>
                  Account {accountData?.accountId} ({accountData?.accountType})
                  <Badge 
                    variant={accountData?.status === 'ACTIVE' ? 'default' : 'secondary'}
                    className="ml-2"
                  >
                    {accountData?.status}
                  </Badge>
                </>
              )}
            </CardDescription>
          </div>
          <Button 
            size="sm" 
            variant="outline" 
            onClick={handleRefresh}
            disabled={refreshing}
          >
            {refreshing ? (
              <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-1" />
            )}
            Refresh
          </Button>
        </div>
      </CardHeader>

      {error && (
        <CardContent className="pb-0">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </CardContent>
      )}

      <CardContent className="pb-0">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Account Value */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <div className="text-sm text-muted-foreground mb-1 flex items-center">
              <TrendingUp className="h-4 w-4 mr-1" />
              Account Value
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-semibold">
                {formatCurrency(accountData?.equity || 0, accountData?.currency || 'USD')}
              </div>
            )}
          </div>

          {/* Cash Balance */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <div className="text-sm text-muted-foreground mb-1 flex items-center">
              <CreditCard className="h-4 w-4 mr-1" />
              Cash Balance
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-semibold">
                {formatCurrency(accountData?.cash || 0, accountData?.currency || 'USD')}
              </div>
            )}
          </div>

          {/* Buying Power */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <div className="text-sm text-muted-foreground mb-1 flex items-center">
              <Coins className="h-4 w-4 mr-1" />
              Buying Power
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-semibold">
                {formatCurrency(accountData?.buyingPower || 0, accountData?.currency || 'USD')}
              </div>
            )}
          </div>

          {/* Portfolio Value */}
          <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
            <div className="text-sm text-muted-foreground mb-1 flex items-center">
              <BarChart2 className="h-4 w-4 mr-1" />
              Portfolio Value
            </div>
            {loading ? (
              <Skeleton className="h-6 w-24" />
            ) : (
              <div className="text-xl font-semibold">
                {formatCurrency(accountData?.marketValue || 0, accountData?.currency || 'USD')}
              </div>
            )}
          </div>
        </div>

        {/* Margin Usage if available */}
        {accountData?.marginUsed && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <div className="text-sm text-muted-foreground flex items-center">
                <DollarSign className="h-4 w-4 mr-1" />
                Margin Usage
              </div>
              <div className="text-sm font-medium">
                {formatCurrency(accountData.marginUsed || 0, accountData.currency)} / 
                {formatCurrency((accountData.marginUsed || 0) + (accountData.marginAvailable || 0), accountData.currency)}
              </div>
            </div>
            <Progress 
              value={marginUsagePercentage} 
              className="h-2"
              indicatorClassName={
                marginUsagePercentage > 80 
                  ? "bg-red-600" 
                  : marginUsagePercentage > 50 
                    ? "bg-yellow-500" 
                    : undefined
              }
            />
          </div>
        )}

        {/* Positions */}
        <div>
          <h3 className="text-sm font-medium mb-3 flex items-center">
            <Briefcase className="h-4 w-4 mr-1" />
            Positions ({loading ? '-' : accountData?.positions.length})
          </h3>
          
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-md p-3">
                  <Skeleton className="h-6 w-full" />
                </div>
              ))}
            </div>
          ) : accountData && accountData.positions.length > 0 ? (
            <div className="space-y-2">
              {accountData.positions.map((position, idx) => (
                <div key={idx} className="border rounded-md p-3">
                  <div className="flex justify-between items-center">
                    <div className="font-medium">{position.symbol}</div>
                    <Badge variant={position.unrealizedPL >= 0 ? 'default' : 'destructive'}>
                      {position.unrealizedPL >= 0 ? '+' : ''}{formatCurrency(position.unrealizedPL, accountData.currency)}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Qty: </span>
                      {formatNumber(position.quantity)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value: </span>
                      {formatCurrency(position.marketValue, accountData.currency)}
                    </div>
                    <div>
                      <span className="text-muted-foreground">Today: </span>
                      <span className={position.todayPL >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {position.todayPL >= 0 ? '+' : ''}{formatCurrency(position.todayPL, accountData.currency)}
                        {' '}({position.percentChange >= 0 ? '+' : ''}{position.percentChange.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center border rounded-md py-8 px-4">
              <Briefcase className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <h3 className="font-medium">No Open Positions</h3>
              <p className="text-sm text-muted-foreground mt-1">
                When you open positions, they will appear here
              </p>
            </div>
          )}
        </div>
      </CardContent>

      <CardFooter className="pt-4 text-xs text-muted-foreground flex items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-3 w-3 mr-1" />
          Last updated: {loading ? 'Loading...' : 
            accountData?.timestamp ? new Date(accountData.timestamp).toLocaleString() : 'Unknown'}
        </div>
        {accountData?.dayTradeCount !== undefined && (
          <div>
            Day trades: {accountData.dayTradeCount}/3
          </div>
        )}
      </CardFooter>
    </Card>
  );
};

export default BrokerAccountInfo;