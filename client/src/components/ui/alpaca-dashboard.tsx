
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { HybridHoldingsService } from '@/lib/services/alpaca-service';
import { 
  LineChart, 
  BarChart2, 
  Users, 
  TrendingUp, 
  AlertTriangle,
  Activity,
  DollarSign,
  Percent
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const BrokerDashboard = ({ isAdmin = false }) => {
  const [accounts, setAccounts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [timeframe, setTimeframe] = useState('1d');
  const [tradeStats, setTradeStats] = useState({
    totalVolume: 0,
    profitLoss: 0,
    winRate: 0,
    activeTraders: 0,
    riskMetrics: {
      drawdown: 0,
      sharpeRatio: 0,
      volatility: 0
    },
    performance: {
      daily: 0,
      weekly: 0,
      monthly: 0,
      yearly: 0
    }
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, [timeframe]);

  const fetchData = async () => {
    try {
      const service = new HybridHoldingsService();
      if (isAdmin) {
        const traderAccounts = await service.getAllTraderAccounts();
        const analytics = await service.getTraderAnalytics(timeframe);
        setAccounts(traderAccounts);
        setTradeStats(analytics);
      } else {
        const positions = await service.getPositions();
        const balance = await service.getAccountBalance();
        const analytics = await service.getPersonalAnalytics(timeframe);
        setPositions(positions);
        setTradeStats(analytics);
      }
    } catch (error) {
      toast({
        title: "Error fetching data",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{isAdmin ? 'Hybrid Holdings Management Portal' : 'Hybrid Holdings Trading Portal'}</CardTitle>
          <CardDescription>
            {isAdmin ? 'Comprehensive broker oversight and analytics' : 'Your trading performance and analytics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center mb-6">
            <Select value={timeframe} onValueChange={setTimeframe}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Timeframe" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1d">1 Day</SelectItem>
                <SelectItem value="1w">1 Week</SelectItem>
                <SelectItem value="1m">1 Month</SelectItem>
                <SelectItem value="1y">1 Year</SelectItem>
              </SelectContent>
            </Select>
            <Button onClick={fetchData} variant="outline" size="sm">
              <Activity className="w-4 h-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <DollarSign className="w-4 h-4 inline mr-1" />
                  Total Volume
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${tradeStats.totalVolume.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  {timeframe === '1d' ? 'Today' : timeframe === '1w' ? 'This Week' : timeframe === '1m' ? 'This Month' : 'This Year'}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <TrendingUp className="w-4 h-4 inline mr-1" />
                  P&L
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${tradeStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {tradeStats.profitLoss >= 0 ? '+' : ''}{tradeStats.profitLoss.toLocaleString()}%
                </div>
                <div className="text-xs text-muted-foreground">
                  Daily: {tradeStats.performance.daily >= 0 ? '+' : ''}{tradeStats.performance.daily}%
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Percent className="w-4 h-4 inline mr-1" />
                  Win Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{tradeStats.winRate}%</div>
                <div className="text-xs text-muted-foreground">
                  Sharpe: {tradeStats.riskMetrics.sharpeRatio.toFixed(2)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  <Users className="w-4 h-4 inline mr-1" />
                  {isAdmin ? 'Active Traders' : 'Risk Score'}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isAdmin ? tradeStats.activeTraders : tradeStats.riskMetrics.volatility.toFixed(1)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {isAdmin ? 'Currently Trading' : 'Volatility Score'}
                </div>
              </CardContent>
            </Card>
          </div>

          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="risk">Risk Analysis</TabsTrigger>
              {isAdmin && <TabsTrigger value="traders">Trader Management</TabsTrigger>}
            </TabsList>

            <TabsContent value="overview">
              {/* Add performance charts here */}
            </TabsContent>

            <TabsContent value="positions">
              <DataTable 
                data={isAdmin ? accounts : positions}
                columns={isAdmin ? [
                  { header: "Trader ID", accessorKey: "traderId" },
                  { header: "Account Value", accessorKey: "accountValue" },
                  { header: "P&L", accessorKey: "pnl" },
                  { header: "Risk Score", accessorKey: "riskScore" }
                ] : [
                  { header: "Symbol", accessorKey: "symbol" },
                  { header: "Quantity", accessorKey: "quantity" },
                  { header: "Entry Price", accessorKey: "averagePrice" },
                  { header: "Current P&L", accessorKey: "unrealizedPnl" }
                ]}
              />
            </TabsContent>

            <TabsContent value="risk">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Risk Metrics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Max Drawdown:</span>
                        <span className="font-medium">{tradeStats.riskMetrics.drawdown}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Sharpe Ratio:</span>
                        <span className="font-medium">{tradeStats.riskMetrics.sharpeRatio.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Volatility:</span>
                        <span className="font-medium">{tradeStats.riskMetrics.volatility.toFixed(2)}%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm">Performance Overview</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Daily:</span>
                        <span className={tradeStats.performance.daily >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {tradeStats.performance.daily >= 0 ? '+' : ''}{tradeStats.performance.daily}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Weekly:</span>
                        <span className={tradeStats.performance.weekly >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {tradeStats.performance.weekly >= 0 ? '+' : ''}{tradeStats.performance.weekly}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Monthly:</span>
                        <span className={tradeStats.performance.monthly >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {tradeStats.performance.monthly >= 0 ? '+' : ''}{tradeStats.performance.monthly}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Yearly:</span>
                        <span className={tradeStats.performance.yearly >= 0 ? 'text-green-500' : 'text-red-500'}>
                          {tradeStats.performance.yearly >= 0 ? '+' : ''}{tradeStats.performance.yearly}%
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {isAdmin && (
              <TabsContent value="traders">
                <Card>
                  <CardHeader>
                    <CardTitle>Trader Management</CardTitle>
                    <CardDescription>Monitor and manage trader accounts</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <DataTable 
                      data={accounts}
                      columns={[
                        { header: "Trader ID", accessorKey: "traderId" },
                        { header: "Risk Level", accessorKey: "riskLevel" },
                        { header: "Account Status", accessorKey: "status" },
                        { header: "Last Active", accessorKey: "lastActive" },
                        { header: "Total P&L", accessorKey: "totalPnl" }
                      ]}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
