import { useState } from 'react';
import { TradingInterface } from '@/components/ui/trading-interface';
import { ApiKeyManager } from '@/components/ui/api-key-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell } from '@/components/layout/app-shell';
import { OrderHistory } from '@/components/ui/order-history';

export default function TradingPage() {
  const [activeTab, setActiveTab] = useState('trade');
  
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Trading Platform</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="trade">Place Trades</TabsTrigger>
            <TabsTrigger value="history">Order History</TabsTrigger>
            <TabsTrigger value="settings">API Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade">
            <TradingInterface />
          </TabsContent>
          
          <TabsContent value="history">
            <OrderHistory />
          </TabsContent>
          
          <TabsContent value="settings">
            <ApiKeyManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
}