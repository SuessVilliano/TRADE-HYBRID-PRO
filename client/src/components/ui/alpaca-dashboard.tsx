
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { useToast } from "@/components/ui/use-toast";
import { AlpacaService } from '@/lib/services/alpaca-service';

export const AlpacaDashboard = ({ isAdmin = false }) => {
  const [accounts, setAccounts] = useState([]);
  const [positions, setPositions] = useState([]);
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
          <CardTitle>{isAdmin ? 'Broker Dashboard' : 'Trading Dashboard'}</CardTitle>
        </CardHeader>
        <CardContent>
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
