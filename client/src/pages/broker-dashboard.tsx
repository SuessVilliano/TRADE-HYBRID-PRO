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
  testBrokerConnection as testBrokerApi, 
  getBrokerAccountInfo,
  type BrokerCredentials
} from '@/lib/services/nexus-service';

export default function BrokerDashboard() {
  const [activeBroker, setActiveBroker] = useState<string>('alpaca');
  const [isLoading, setIsLoading] = useState(false);
  const [useDemoAccount, setUseDemoAccount] = useState(true);
  const [brokerTypes, setBrokerTypes] = useState<{ 
    id: string; 
    name: string; 
    isSupported: boolean;
    hasDemo?: boolean;
    tradingCapabilities?: string[];
    demoUrl?: string;
  }[]>([
    { id: 'alpaca', name: 'Alpaca', isSupported: true, hasDemo: true },
    { id: 'oanda', name: 'Oanda', isSupported: true, hasDemo: true },
    { id: 'interactive_brokers', name: 'Interactive Brokers', isSupported: true, hasDemo: true },
  ]);
  const [showDocsDialog, setShowDocsDialog] = useState(false);
  const [showConnectDialog, setShowConnectDialog] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{
    isConnected: boolean;
    message: string;
    accountInfo?: any;
  } | null>(null);

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

  const handleRefresh = async () => {
    setIsLoading(true);
    try {
      const result = await getBrokerAccountInfo(activeBroker, useDemoAccount);
      if (result.success) {
        setConnectionStatus({
          isConnected: true,
          message: result.message,
          accountInfo: result.accountInfo
        });
      } else {
        setConnectionStatus({
          isConnected: false,
          message: result.message || 'Failed to connect to broker'
        });
      }
    } catch (error) {
      console.error('Error refreshing broker data:', error);
      setConnectionStatus({
        isConnected: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const testConnection = async (credentials: BrokerCredentials): Promise<boolean> => {
    setIsLoading(true);
    try {
      const result = await testBrokerApi(credentials);
      setConnectionStatus({
        isConnected: result.success,
        message: result.message,
        accountInfo: result.accountInfo
      });
      return result.success;
    } catch (error) {
      console.error('Error testing broker connection:', error);
      setConnectionStatus({
        isConnected: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Form state for broker connection
  const [formData, setFormData] = useState<BrokerCredentials>({
    brokerId: activeBroker,
    useDemo: useDemoAccount
  });
  
  // Update form data when active broker changes
  React.useEffect(() => {
    setFormData(prev => ({
      ...prev,
      brokerId: activeBroker,
      useDemo: useDemoAccount
    }));
  }, [activeBroker, useDemoAccount]);
  
  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };
  
  // Find the active broker data
  const activeBrokerData = brokerTypes.find(b => b.id === activeBroker);
  
  // Effect to auto-refresh when changing broker or demo status
  React.useEffect(() => {
    if (activeBroker) {
      handleRefresh();
    }
  }, [activeBroker, useDemoAccount]);

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
          <Dialog open={showConnectDialog} onOpenChange={setShowConnectDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Connect Broker
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Connect Broker</DialogTitle>
                <DialogDescription>
                  Enter your broker API credentials to connect with Trade Hybrid
                </DialogDescription>
              </DialogHeader>
              <form className="space-y-4" onSubmit={(e) => {
                e.preventDefault();
                testConnection(formData);
              }}>
                {/* Demo Account Toggle */}
                {activeBrokerData?.hasDemo && (
                  <div className="flex items-center space-x-2 mb-4">
                    <Switch 
                      id="demoAccount" 
                      name="useDemo"
                      checked={formData.useDemo}
                      onCheckedChange={(checked) => {
                        setFormData(prev => ({...prev, useDemo: checked}));
                      }}
                    />
                    <Label htmlFor="demoAccount" className="cursor-pointer">Use Demo Account</Label>
                    
                    {formData.useDemo && activeBrokerData?.demoUrl && (
                      <a 
                        href={activeBrokerData.demoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="ml-auto text-sm text-blue-500 flex items-center"
                      >
                        Get Demo <ExternalLink className="ml-1 h-3 w-3" />
                      </a>
                    )}
                  </div>
                )}
                
                {/* Based on broker type, show different fields */}
                {activeBroker === 'alpaca' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key</Label>
                      <input
                        type="text"
                        id="apiKey"
                        name="apiKey"
                        value={formData.apiKey || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Your Alpaca API Key"
                        required={!formData.useDemo}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="apiSecret">API Secret</Label>
                      <input
                        type="password"
                        id="apiSecret"
                        name="apiSecret"
                        value={formData.apiSecret || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Your Alpaca API Secret"
                        required={!formData.useDemo}
                      />
                    </div>
                  </>
                )}
                
                {activeBroker === 'oanda' && (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="token">API Token</Label>
                      <input
                        type="text"
                        id="token"
                        name="token"
                        value={formData.token || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Your Oanda API Token"
                        required={!formData.useDemo}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="accountId">Account ID</Label>
                      <input
                        type="text"
                        id="accountId"
                        name="accountId"
                        value={formData.accountId || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Your Oanda Account ID"
                        required={!formData.useDemo}
                      />
                    </div>
                  </>
                )}
                
                {/* Generic fields for other brokers */}
                {!['alpaca', 'oanda'].includes(activeBroker) && (
                  <div className="space-y-2">
                    <Label>API Credentials</Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      Enter the credentials for your {activeBrokerData?.name || ''} account
                    </p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiKey">API Key / Client ID</Label>
                      <input
                        type="text"
                        id="apiKey"
                        name="apiKey"
                        value={formData.apiKey || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="API Key or Client ID"
                        required={!formData.useDemo}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="apiSecret">API Secret / Access Token</Label>
                      <input
                        type="password"
                        id="apiSecret"
                        name="apiSecret"
                        value={formData.apiSecret || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="API Secret or Access Token"
                        required={!formData.useDemo}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="accountId">Account ID (Optional)</Label>
                      <input
                        type="text"
                        id="accountId"
                        name="accountId"
                        value={formData.accountId || ''}
                        onChange={handleInputChange}
                        className="w-full p-2 border rounded"
                        placeholder="Account ID if required"
                      />
                    </div>
                  </div>
                )}
                
                <div className="pt-4 flex justify-between">
                  <Button type="button" variant="outline" onClick={() => setShowConnectDialog(false)}>
                    Cancel
                  </Button>
                  
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Connecting...
                      </>
                    ) : formData.useDemo ? (
                      <>
                        <Gamepad2 className="mr-2 h-4 w-4" />
                        Connect to Demo
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Connect Broker
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
                {activeBrokerData?.hasDemo && (
                  <div className="flex items-center gap-2">
                    <Switch 
                      id="accountDemoMode" 
                      checked={useDemoAccount}
                      onCheckedChange={setUseDemoAccount}
                    />
                    <Label htmlFor="accountDemoMode" className="text-sm cursor-pointer whitespace-nowrap">
                      Demo Mode
                    </Label>
                  </div>
                )}
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
                  useDemo={useDemoAccount}
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