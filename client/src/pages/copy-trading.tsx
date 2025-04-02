import React from 'react';
import { AppShell, AppShellHeader, AppShellMain } from '@/components/layout/app-shell';
import { PageHeader } from '@/components/ui/page-header';
import { Button } from '@/components/ui/button';
import { CopyTradePanel } from '@/components/ui/copy-trade-panel';
import { Plus } from 'lucide-react';
import { SignalsList } from '@/components/ui/signals-list';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CopyTradingPage() {
  return (
    <AppShell>
      <AppShellHeader className="px-4 py-3">
        <PageHeader 
          title="Copy Trading" 
          description="Follow and copy expert traders in real-time"
          actions={
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Connect Broker
            </Button>
          }
        />
      </AppShellHeader>
      <AppShellMain>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Trading Signals</CardTitle>
              </CardHeader>
              <CardContent>
                <SignalsList />
              </CardContent>
            </Card>
          </div>
          <div>
            <CopyTradePanel className="sticky top-20" />
          </div>
        </div>
      </AppShellMain>
    </AppShell>
  );
}