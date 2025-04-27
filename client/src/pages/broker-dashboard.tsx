import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BrokerIntegrationDocs from '@/components/broker/BrokerIntegrationDocs';
import BrokerAccountInfo from '@/components/broker/BrokerAccountInfo';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, CircleHelp, Settings, RefreshCw, ExternalLink, Gamepad2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  getSupportedBrokerTypes, 
  testBrokerConnection, 
  getBrokerAccountInfo,
  type BrokerCredentials
} from '@/lib/services/nexus-service';

export default function BrokerDashboard() {
  const [activeBroker, setActiveBroker] = useState<string>('alpaca');
  const [isLoading, setIsLoading] = useState(false);
  const [brokerTypes, setBrokerTypes] = useState<{ id: string; name: string; isSupported: boolean }[]>([
    { id: 'alpaca', name: 'Alpaca', isSupported: true },
    { id: 'oanda', name: 'Oanda', isSupported: true },
    { id: 'interactive_brokers', name: 'Interactive Brokers', isSupported: true },
  ]);
  const [showDocsDialog, setShowDocsDialog] = useState(false);

  // Function to load broker types from API
  const loadBrokerTypes = async () => {
    try {
      const types = await getSupportedBrokerTypes();
      if (types.length > 0) {
        setBrokerTypes(types);
      }
    } catch (error) {
      console.error('Failed to load broker types:', error);
    }
  };

  // Load broker types on component mount
  React.useEffect(() => {
    loadBrokerTypes();
  }, []);

  const handleBrokerChange = (brokerId: string) => {
    setActiveBroker(brokerId);
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh delay
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="container mx-auto p-4 md:p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Broker Dashboard</h1>
          <p className="text-muted-foreground">Manage your broker connections and view account data</p>
        </div>
        <div className="flex gap-2 mt-2 md:mt-0">
          <Dialog open={showDocsDialog} onOpenChange={setShowDocsDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <CircleHelp className="mr-2 h-4 w-4" />
                Broker Documentation
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>Broker Integration Documentation</DialogTitle>
                <DialogDescription>
                  Learn how to connect and use different brokers with Trade Hybrid
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4">
                <BrokerIntegrationDocs />
              </div>
            </DialogContent>
          </Dialog>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Connect Broker
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <div className="flex flex-col md:flex-row justify-between md:items-center">
              <div>
                <CardTitle>Broker Accounts</CardTitle>
                <CardDescription>View and manage your connected broker accounts</CardDescription>
              </div>
              <div className="flex items-center gap-2 mt-2 md:mt-0">
                <Select value={activeBroker} onValueChange={handleBrokerChange}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Select broker" />
                  </SelectTrigger>
                  <SelectContent>
                    {brokerTypes.map((broker) => (
                      <SelectItem key={broker.id} value={broker.id} disabled={!broker.isSupported}>
                        {broker.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button variant="outline" size="icon">
                  <Settings className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isLoading}>
                  <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="account" className="mt-2">
              <TabsList className="mb-4">
                <TabsTrigger value="account">Account Info</TabsTrigger>
                <TabsTrigger value="positions">Positions</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="history">History</TabsTrigger>
              </TabsList>
              <TabsContent value="account">
                <BrokerAccountInfo 
                  brokerId={activeBroker} 
                  onRefresh={handleRefresh}
                />
              </TabsContent>
              <TabsContent value="positions">
                <Card>
                  <CardHeader>
                    <CardTitle>Positions</CardTitle>
                    <CardDescription>Your open positions across markets</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Position data will be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="orders">
                <Card>
                  <CardHeader>
                    <CardTitle>Orders</CardTitle>
                    <CardDescription>Your pending and filled orders</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Order data will be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="history">
                <Card>
                  <CardHeader>
                    <CardTitle>Trading History</CardTitle>
                    <CardDescription>Your historical trading activity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p>Trading history data will be displayed here</p>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common broker functions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" variant="outline">Create New Order</Button>
            <Button className="w-full justify-start" variant="outline">Import Positions</Button>
            <Button className="w-full justify-start" variant="outline">Test API Connection</Button>
            <Button className="w-full justify-start" variant="outline">Broker Settings</Button>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Broker API Status</CardTitle>
            <CardDescription>Connection and service health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium">Connection Status</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <span className="h-2 w-2 rounded-full bg-green-600 mr-2"></span>
                    Connected
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Last Update</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date().toLocaleTimeString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Market Status</p>
                  <p className="text-sm text-green-600">Open</p>
                </div>
                <div>
                  <p className="text-sm font-medium">API Rate Limit</p>
                  <p className="text-sm text-muted-foreground">
                    42/200 requests (Reset in 15m)
                  </p>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">Recent API Calls</p>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>GET /v2/account (200) - 2s ago</p>
                  <p>GET /v2/positions (200) - 3s ago</p>
                  <p>GET /v2/orders (200) - 5s ago</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}