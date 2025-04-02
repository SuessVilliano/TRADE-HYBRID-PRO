import React, { useState } from 'react';
import { TabsContent, Tabs, TabsList, TabsTrigger } from '../components/ui';
import { BrokerConnections } from '../components/broker/BrokerConnections';
import { WebhookManager } from '../components/broker/WebhookManager';
import { AppShell } from '../components/layout/app-shell';

const BrokerIntegrationPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('connections');
  
  return (
    <AppShell>
      <div className="container py-8">
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Broker Integration</h1>
          <p className="text-muted-foreground">
            Connect to your trading accounts and set up automated trading with webhooks
          </p>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="connections">Trading Accounts</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connections" className="space-y-4">
            <BrokerConnections />
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <WebhookManager />
          </TabsContent>
        </Tabs>
      </div>
    </AppShell>
  );
};

export default BrokerIntegrationPage;