import React, { useEffect } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { SignalsList } from '@/components/ui/signals-list';
import { SignalIcon, SettingsIcon, FilterIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTradeSignalStore } from '@/lib/stores/useTradeSignalStore';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export default function CopyTradingPage() {
  const { fetchSignals, isLoading } = useTradeSignalStore();

  useEffect(() => {
    fetchSignals();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchSignals();
    }, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [fetchSignals]);

  return (
    <AppShell>
      <div className="container px-4 py-6 md:px-6 max-w-6xl mx-auto">
        <PageHeader
          title="Copy Trading"
          description="Follow and copy trades from professional traders in real-time"
          icon={<SignalIcon />}
          actions={
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FilterIcon className="mr-2 h-4 w-4" />
                    Filter
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>All Signals</DropdownMenuItem>
                  <DropdownMenuItem>Active Signals</DropdownMenuItem>
                  <DropdownMenuItem>Closed Signals</DropdownMenuItem>
                  <DropdownMenuItem>Profitable Signals</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button size="sm" variant="ghost">
                <SettingsIcon className="h-4 w-4 mr-2" />
                Preferences
              </Button>
            </div>
          }
          className="mb-6"
        />
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <SignalsList />
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Copy Trading Stats</CardTitle>
                <CardDescription>Your copy trading performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Signals Copied</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Active Trades</span>
                    <span className="font-medium">0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Win Rate</span>
                    <span className="font-medium">0%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total P&L</span>
                    <span className="font-medium text-green-500">$0.00</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Top Traders</CardTitle>
                <CardDescription>Best performing signal providers</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 text-sm">
                  <p className="text-muted-foreground">No data available yet.</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </AppShell>
  );
}