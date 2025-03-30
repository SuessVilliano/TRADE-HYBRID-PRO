
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { AlpacaService } from '@/lib/services/alpaca-service';

import { LineChart, BarChart } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const BrokerDashboard = ({ isAdmin = false }) => {
  const [accounts, setAccounts] = useState([]);
  const [positions, setPositions] = useState([]);
  const [tradeStats, setTradeStats] = useState({
    totalVolume: 0,
    profitLoss: 0,
    winRate: 0,
    activeTraders: 0
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const alpaca = new AlpacaService();
      if (isAdmin) {
        // Fetch all trader accounts for admin
        const traderAccounts = await alpaca.getAllTraderAccounts();
        setAccounts(traderAccounts);
      } else {
        // Fetch individual trader data
        const positions = await alpaca.getPositions();
        const balance = await alpaca.getAccountBalance();
        setPositions(positions);
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
          <CardTitle>{isAdmin ? 'Hybrid Holdings Broker Portal' : 'Hybrid Holdings Trading Portal'}</CardTitle>
          <CardDescription>
            {isAdmin ? 'Comprehensive broker oversight and analytics' : 'Your trading performance and analytics'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="reports">Reports</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${tradeStats.totalVolume.toLocaleString()}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">P&L</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${tradeStats.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      ${Math.abs(tradeStats.profitLoss).toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tradeStats.winRate}%</div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Active Traders</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{tradeStats.activeTraders}</div>
                  </CardContent>
                </Card>
              </div>
          {isAdmin ? (
            <DataTable
              data={accounts}
              columns={[
                { header: 'Trader', accessorKey: 'name' },
                { header: 'Account ID', accessorKey: 'account_id' },
                { header: 'Balance', accessorKey: 'balance' },
                { header: 'P&L', accessorKey: 'pnl' }
              ]}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle>Positions</CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTable
                    data={positions}
                    columns={[
                      { header: 'Symbol', accessorKey: 'symbol' },
                      { header: 'Qty', accessorKey: 'qty' },
                      { header: 'P&L', accessorKey: 'unrealized_pl' }
                    ]}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
