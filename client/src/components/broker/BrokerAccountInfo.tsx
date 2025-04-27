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
  useDemo?: boolean;
}

// No demo data - we will only use real API data

const BrokerAccountInfo: React.FC<BrokerAccountInfoProps> = ({ brokerId, onRefresh, useDemo = false }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accountData, setAccountData] = useState<BrokerAccountData | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAccountData = async () => {
    if (refreshing) return;
    
    setRefreshing(true);
    setError(null);
    
    try {
      // Make API call to get broker account info
      const queryParams = new URLSearchParams({
        brokerId,
        ...(useDemo !== undefined && { useDemo: useDemo.toString() })
      });
      
      const response = await fetch(`/api/nexus/broker-account-info?${queryParams.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch account data: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to fetch account data');
      }
      
      // Process the account info into our component data format
      if (result.accountInfo) {
        // Convert from API format to our component's data format
        const formattedData: BrokerAccountData = {
          brokerName: result.accountInfo.brokerName || getBrokerName(brokerId),
          accountId: result.accountInfo.accountId || 'Unknown',
          accountType: result.accountInfo.accountType || (useDemo ? 'DEMO' : 'LIVE'),
          cash: result.accountInfo.cash || result.accountInfo.balance || 0,
          equity: result.accountInfo.equity || result.accountInfo.balance || 0,
          marketValue: result.accountInfo.marketValue || result.accountInfo.longMarketValue || 0,
          buyingPower: result.accountInfo.buyingPower || result.accountInfo.availableFunds || 0,
          status: result.accountInfo.status || 'ACTIVE',
          timestamp: new Date(result.accountInfo.timestamp || Date.now()),
          currency: result.accountInfo.currency || 'USD',
          positions: formatPositions(result.accountInfo.positions || []),
          marginUsed: result.accountInfo.marginUsed,
          marginAvailable: result.accountInfo.marginAvailable,
          dayTradeCount: result.accountInfo.dayTradeCount
        };
        
        setAccountData(formattedData);
      } else {
        throw new Error('No account data received from broker API');
      }
    } catch (err) {
      console.error('Error fetching broker account data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load account data. Please check your broker connection and try again.');
      setAccountData(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Helper function to format positions data
  const formatPositions = (positionsData: any[]): BrokerAccountData['positions'] => {
    return positionsData.map(pos => ({
      symbol: pos.symbol || pos.instrument || 'Unknown',
      quantity: pos.quantity || pos.position || pos.units || pos.volume || 0,
      marketValue: pos.marketValue || pos.value || 0,
      unrealizedPL: pos.unrealizedPL || pos.profit || 0, 
      todayPL: pos.todayPL || pos.dailyPL || 0,
      percentChange: pos.percentChange || pos.changePercent || 0
    }));
  };
  
  // Helper function to get broker name
  const getBrokerName = (id: string): string => {
    const brokerNames: Record<string, string> = {
      'alpaca': 'Alpaca',
      'oanda': 'Oanda',
      'interactive_brokers': 'Interactive Brokers',
      'tradier': 'Tradier',
      'ninjatrader': 'NinjaTrader',
      'tradovate': 'Tradovate',
      'ig': 'IG',
      'saxo_bank': 'Saxo Bank',
      'ctrader': 'cTrader',
      'match_trader': 'Match-Trader',
      'meta_api': 'MetaAPI',
      'td_ameritrade': 'TD Ameritrade',
      'tradingview': 'TradingView',
      'other': 'Broker'
    };
    
    return brokerNames[id] || 'Broker';
  };

  // Initial data load and reload when brokerId or useDemo changes
  useEffect(() => {
    fetchAccountData();
  }, [brokerId, useDemo]);

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
                  {useDemo && (
                    <Badge variant="outline" className="ml-2 text-xs bg-yellow-100 dark:bg-yellow-900 border-yellow-300 dark:border-yellow-700">
                      Demo
                    </Badge>
                  )}
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
            <AlertTitle>Connection Error</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes("No account data") && (
                <div className="mt-2">
                  <p className="font-medium">Possible solutions:</p>
                  <ul className="list-disc pl-5 mt-1">
                    <li>Make sure your broker account is properly connected</li>
                    <li>Check that your API credentials are correct</li>
                    <li>Ensure you have the appropriate permissions set on your API keys</li>
                    <li>Try toggling between Live and Demo accounts if available</li>
                  </ul>
                </div>
              )}
            </AlertDescription>
          </Alert>
        </CardContent>
      )}

      <CardContent className="pb-0">
        {loading ? (
          // Loading state
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* Account Value */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <TrendingUp className="h-4 w-4 mr-1" />
                Account Value
              </div>
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Cash Balance */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <CreditCard className="h-4 w-4 mr-1" />
                Cash Balance
              </div>
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Buying Power */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <Coins className="h-4 w-4 mr-1" />
                Buying Power
              </div>
              <Skeleton className="h-6 w-24" />
            </div>

            {/* Portfolio Value */}
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
              <div className="text-sm text-muted-foreground mb-1 flex items-center">
                <BarChart2 className="h-4 w-4 mr-1" />
                Portfolio Value
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
          </div>
        ) : !accountData ? (
          // No account data state
          <div className="text-center py-12">
            <AlertTriangle className="h-12 w-12 mx-auto text-amber-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">No Account Data Available</h3>
            <p className="text-muted-foreground max-w-md mx-auto mb-4">
              Please connect your broker account to view your portfolio information.
              Make sure your API credentials are correctly set up.
            </p>
            <div className="text-sm text-muted-foreground">
              <p className="mb-1">Account data will display:</p>
              <div className="flex flex-wrap justify-center gap-2 mt-2">
                <Badge variant="outline">Account Balance</Badge>
                <Badge variant="outline">Open Positions</Badge>
                <Badge variant="outline">Portfolio Value</Badge>
                <Badge variant="outline">Buying Power</Badge>
              </div>
            </div>
          </div>
        ) : (
          // Account data loaded
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Account Value */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <TrendingUp className="h-4 w-4 mr-1" />
                  Account Value
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(accountData.equity, accountData.currency)}
                </div>
              </div>

              {/* Cash Balance */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <CreditCard className="h-4 w-4 mr-1" />
                  Cash Balance
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(accountData.cash, accountData.currency)}
                </div>
              </div>

              {/* Buying Power */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <Coins className="h-4 w-4 mr-1" />
                  Buying Power
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(accountData.buyingPower, accountData.currency)}
                </div>
              </div>

              {/* Portfolio Value */}
              <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-md">
                <div className="text-sm text-muted-foreground mb-1 flex items-center">
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Portfolio Value
                </div>
                <div className="text-xl font-semibold">
                  {formatCurrency(accountData.marketValue, accountData.currency)}
                </div>
              </div>
            </div>

            {/* Margin Usage if available */}
            {accountData.marginUsed && (
              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="text-sm text-muted-foreground flex items-center">
                    <DollarSign className="h-4 w-4 mr-1" />
                    Margin Usage
                  </div>
                  <div className="text-sm font-medium">
                    {formatCurrency(accountData.marginUsed, accountData.currency)} / 
                    {formatCurrency((accountData.marginUsed) + (accountData.marginAvailable || 0), accountData.currency)}
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
                Positions ({accountData.positions.length})
              </h3>
              
              {accountData.positions.length > 0 ? (
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
          </>
        )}
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