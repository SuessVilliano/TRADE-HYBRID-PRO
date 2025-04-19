import { useState } from 'react';
import { OrderHistory } from '@/components/ui/order-history';
import { ApiKeyManager } from '@/components/ui/api-key-manager';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AppShell } from '@/components/layout/app-shell';

export default function OrderHistoryPage() {
  const [activeTab, setActiveTab] = useState('orders');
  
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Trading History</h1>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="mb-4">
            <TabsTrigger value="orders">Order History</TabsTrigger>
            <TabsTrigger value="settings">API Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="orders">
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