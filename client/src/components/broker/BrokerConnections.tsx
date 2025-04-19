import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui";
import { BadgeCheck, ChevronDown, Eye, EyeOff, PlusCircle, RefreshCw, Shield, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

// Types for broker connections
interface BrokerConnection {
  id?: string;
  broker: string;
  name: string;
  isDefault: boolean;
}

interface AlpacaConnection extends BrokerConnection {
  broker: 'alpaca';
  apiKey: string;
  apiSecret: string;
}

interface OandaConnection extends BrokerConnection {
  broker: 'oanda';
  apiToken: string;
  accountId: string;
  isPractice: boolean;
}

interface NinjaTraderConnection extends BrokerConnection {
  broker: 'ninjatrader';
  endpoint: string;
  apiKey?: string;
  account?: string;
}

type BrokerConnectionType = AlpacaConnection | OandaConnection | NinjaTraderConnection;

// Simplified API for broker connections
const brokerApi = {
  async testAlpacaConnection(apiKey: string, apiSecret: string): Promise<boolean> {
    try {
      const response = await fetch('/api/broker/alpaca/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, apiSecret })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error testing Alpaca connection:', error);
      return false;
    }
  },
  
  async saveAlpacaCredentials(connection: AlpacaConnection): Promise<any> {
    const response = await fetch('/api/broker/alpaca/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiKey: connection.apiKey,
        apiSecret: connection.apiSecret,
        label: connection.name,
        isDefault: connection.isDefault
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save Alpaca credentials');
    }
    
    return response.json();
  },
  
  async testOandaConnection(apiToken: string, accountId: string, isPractice: boolean): Promise<boolean> {
    try {
      const response = await fetch('/api/broker/oanda/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiToken, accountId, isPractice })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error testing Oanda connection:', error);
      return false;
    }
  },
  
  async saveOandaCredentials(connection: OandaConnection): Promise<any> {
    const response = await fetch('/api/broker/oanda/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        apiToken: connection.apiToken,
        accountId: connection.accountId,
        isPractice: connection.isPractice,
        label: connection.name,
        isDefault: connection.isDefault
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save Oanda credentials');
    }
    
    return response.json();
  },
  
  async testNinjaTraderConnection(endpoint: string, apiKey?: string): Promise<boolean> {
    try {
      const response = await fetch('/api/broker/ninjatrader/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ endpoint, apiKey })
      });
      
      const data = await response.json();
      return data.success;
    } catch (error) {
      console.error('Error testing NinjaTrader connection:', error);
      return false;
    }
  },
  
  async saveNinjaTraderConfig(connection: NinjaTraderConnection): Promise<any> {
    const response = await fetch('/api/broker/ninjatrader/config', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: connection.endpoint,
        apiKey: connection.apiKey,
        account: connection.account,
        label: connection.name,
        isDefault: connection.isDefault
      })
    });
    
    if (!response.ok) {
      throw new Error('Failed to save NinjaTrader configuration');
    }
    
    return response.json();
  }
};

const AlpacaConnectionForm: React.FC<{
  onSave: (connection: AlpacaConnection) => void;
  onTest: (connection: AlpacaConnection) => Promise<boolean>;
  onCancel: () => void;
}> = ({ onSave, onTest, onCancel }) => {
  const [connection, setConnection] = useState<AlpacaConnection>({
    broker: 'alpaca',
    name: 'Alpaca Trading',
    apiKey: '',
    apiSecret: '',
    isDefault: true
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showSecret, setShowSecret] = useState(false);
  
  const handleChange = (field: keyof AlpacaConnection, value: any) => {
    setConnection(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset test result when credentials change
    if (field === 'apiKey' || field === 'apiSecret') {
      setTestResult(null);
    }
  };
  
  const handleTest = async () => {
    if (!connection.apiKey || !connection.apiSecret) {
      toast.error('API key and secret are required');
      return;
    }
    
    try {
      setIsTesting(true);
      const success = await onTest(connection);
      setTestResult(success);
      
      if (success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(false);
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connection.apiKey || !connection.apiSecret) {
      toast.error('API key and secret are required');
      return;
    }
    
    if (testResult !== true) {
      toast.error('Please test the connection first');
      return;
    }
    
    onSave(connection);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input 
          id="name" 
          value={connection.name} 
          onChange={e => handleChange('name', e.target.value)}
          placeholder="My Alpaca Account"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input 
          id="apiKey" 
          value={connection.apiKey} 
          onChange={e => handleChange('apiKey', e.target.value)}
          placeholder="Your Alpaca API Key"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiSecret">API Secret</Label>
        <div className="relative">
          <Input 
            id="apiSecret" 
            type={showSecret ? 'text' : 'password'}
            value={connection.apiSecret} 
            onChange={e => handleChange('apiSecret', e.target.value)}
            placeholder="Your Alpaca API Secret"
            required
          />
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowSecret(!showSecret)}
          >
            {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isDefault" 
          checked={connection.isDefault} 
          onCheckedChange={value => handleChange('isDefault', value)}
        />
        <Label htmlFor="isDefault">Set as default connection</Label>
      </div>
      
      <div className="pt-4 flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTest}
          disabled={isTesting || !connection.apiKey || !connection.apiSecret}
          className="flex items-center"
        >
          {isTesting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            testResult === true ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : testResult === false ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )
          )}
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        
        {testResult === true && (
          <span className="text-sm text-green-500 flex items-center">
            <BadgeCheck className="h-4 w-4 mr-1" />
            Connection verified
          </span>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={testResult !== true}>Save Connection</Button>
      </div>
    </form>
  );
};

const OandaConnectionForm: React.FC<{
  onSave: (connection: OandaConnection) => void;
  onTest: (connection: OandaConnection) => Promise<boolean>;
  onCancel: () => void;
}> = ({ onSave, onTest, onCancel }) => {
  const [connection, setConnection] = useState<OandaConnection>({
    broker: 'oanda',
    name: 'Oanda Trading',
    apiToken: '',
    accountId: '',
    isPractice: true,
    isDefault: true
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showToken, setShowToken] = useState(false);
  
  const handleChange = (field: keyof OandaConnection, value: any) => {
    setConnection(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset test result when credentials change
    if (field === 'apiToken' || field === 'accountId' || field === 'isPractice') {
      setTestResult(null);
    }
  };
  
  const handleTest = async () => {
    if (!connection.apiToken || !connection.accountId) {
      toast.error('API token and account ID are required');
      return;
    }
    
    try {
      setIsTesting(true);
      const success = await onTest(connection);
      setTestResult(success);
      
      if (success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(false);
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connection.apiToken || !connection.accountId) {
      toast.error('API token and account ID are required');
      return;
    }
    
    if (testResult !== true) {
      toast.error('Please test the connection first');
      return;
    }
    
    onSave(connection);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input 
          id="name" 
          value={connection.name} 
          onChange={e => handleChange('name', e.target.value)}
          placeholder="My Oanda Account"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiToken">API Token</Label>
        <div className="relative">
          <Input 
            id="apiToken" 
            type={showToken ? 'text' : 'password'}
            value={connection.apiToken} 
            onChange={e => handleChange('apiToken', e.target.value)}
            placeholder="Your Oanda API Token"
            required
          />
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowToken(!showToken)}
          >
            {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="accountId">Account ID</Label>
        <Input 
          id="accountId" 
          value={connection.accountId} 
          onChange={e => handleChange('accountId', e.target.value)}
          placeholder="Your Oanda Account ID"
          required
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isPractice" 
          checked={connection.isPractice} 
          onCheckedChange={value => handleChange('isPractice', value)}
        />
        <Label htmlFor="isPractice">Practice Account</Label>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isDefault" 
          checked={connection.isDefault} 
          onCheckedChange={value => handleChange('isDefault', value)}
        />
        <Label htmlFor="isDefault">Set as default connection</Label>
      </div>
      
      <div className="pt-4 flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTest}
          disabled={isTesting || !connection.apiToken || !connection.accountId}
          className="flex items-center"
        >
          {isTesting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            testResult === true ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : testResult === false ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )
          )}
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        
        {testResult === true && (
          <span className="text-sm text-green-500 flex items-center">
            <BadgeCheck className="h-4 w-4 mr-1" />
            Connection verified
          </span>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={testResult !== true}>Save Connection</Button>
      </div>
    </form>
  );
};

const NinjaTraderConnectionForm: React.FC<{
  onSave: (connection: NinjaTraderConnection) => void;
  onTest: (connection: NinjaTraderConnection) => Promise<boolean>;
  onCancel: () => void;
}> = ({ onSave, onTest, onCancel }) => {
  const [connection, setConnection] = useState<NinjaTraderConnection>({
    broker: 'ninjatrader',
    name: 'NinjaTrader',
    endpoint: 'http://localhost:8081',
    apiKey: '',
    account: '',
    isDefault: true
  });
  
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<boolean | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  
  const handleChange = (field: keyof NinjaTraderConnection, value: any) => {
    setConnection(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Reset test result when credentials change
    if (field === 'endpoint' || field === 'apiKey') {
      setTestResult(null);
    }
  };
  
  const handleTest = async () => {
    if (!connection.endpoint) {
      toast.error('Endpoint is required');
      return;
    }
    
    try {
      setIsTesting(true);
      const success = await onTest(connection);
      setTestResult(success);
      
      if (success) {
        toast.success('Connection test successful');
      } else {
        toast.error('Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      setTestResult(false);
      toast.error('Connection test failed');
    } finally {
      setIsTesting(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!connection.endpoint) {
      toast.error('Endpoint is required');
      return;
    }
    
    if (testResult !== true) {
      toast.error('Please test the connection first');
      return;
    }
    
    onSave(connection);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Connection Name</Label>
        <Input 
          id="name" 
          value={connection.name} 
          onChange={e => handleChange('name', e.target.value)}
          placeholder="My NinjaTrader"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="endpoint">Local Endpoint</Label>
        <Input 
          id="endpoint" 
          value={connection.endpoint} 
          onChange={e => handleChange('endpoint', e.target.value)}
          placeholder="http://localhost:8081"
          required
        />
        <p className="text-xs text-muted-foreground">
          This should be the URL of the NinjaTrader companion app running on your computer
        </p>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key (Optional)</Label>
        <div className="relative">
          <Input 
            id="apiKey" 
            type={showApiKey ? 'text' : 'password'}
            value={connection.apiKey || ''} 
            onChange={e => handleChange('apiKey', e.target.value)}
            placeholder="API Key (if required by companion app)"
          />
          <Button 
            type="button"
            variant="ghost" 
            size="icon"
            className="absolute right-2 top-1/2 transform -translate-y-1/2"
            onClick={() => setShowApiKey(!showApiKey)}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="account">Account (Optional)</Label>
        <Input 
          id="account" 
          value={connection.account || ''} 
          onChange={e => handleChange('account', e.target.value)}
          placeholder="Default trading account"
        />
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isDefault" 
          checked={connection.isDefault} 
          onCheckedChange={value => handleChange('isDefault', value)}
        />
        <Label htmlFor="isDefault">Set as default connection</Label>
      </div>
      
      <div className="pt-4 flex items-center space-x-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={handleTest}
          disabled={isTesting || !connection.endpoint}
          className="flex items-center"
        >
          {isTesting ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            testResult === true ? (
              <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
            ) : testResult === false ? (
              <XCircle className="h-4 w-4 mr-2 text-red-500" />
            ) : (
              <Shield className="h-4 w-4 mr-2" />
            )
          )}
          {isTesting ? 'Testing...' : 'Test Connection'}
        </Button>
        
        {testResult === true && (
          <span className="text-sm text-green-500 flex items-center">
            <BadgeCheck className="h-4 w-4 mr-1" />
            Connection verified
          </span>
        )}
      </div>
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit" disabled={testResult !== true}>Save Connection</Button>
      </div>
    </form>
  );
};

export const BrokerConnections: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('alpaca');
  const [showConnectionForm, setShowConnectionForm] = useState(false);
  
  // Handle adding Alpaca connection
  const handleAddAlpacaConnection = async (connection: AlpacaConnection) => {
    try {
      await brokerApi.saveAlpacaCredentials(connection);
      toast.success('Alpaca connection saved successfully');
      setShowConnectionForm(false);
    } catch (error) {
      console.error('Error saving Alpaca connection:', error);
      toast.error('Failed to save Alpaca connection');
    }
  };
  
  // Handle testing Alpaca connection
  const handleTestAlpacaConnection = async (connection: AlpacaConnection) => {
    return await brokerApi.testAlpacaConnection(connection.apiKey, connection.apiSecret);
  };
  
  // Handle adding Oanda connection
  const handleAddOandaConnection = async (connection: OandaConnection) => {
    try {
      await brokerApi.saveOandaCredentials(connection);
      toast.success('Oanda connection saved successfully');
      setShowConnectionForm(false);
    } catch (error) {
      console.error('Error saving Oanda connection:', error);
      toast.error('Failed to save Oanda connection');
    }
  };
  
  // Handle testing Oanda connection
  const handleTestOandaConnection = async (connection: OandaConnection) => {
    return await brokerApi.testOandaConnection(connection.apiToken, connection.accountId, connection.isPractice);
  };
  
  // Handle adding NinjaTrader connection
  const handleAddNinjaTraderConnection = async (connection: NinjaTraderConnection) => {
    try {
      await brokerApi.saveNinjaTraderConfig(connection);
      toast.success('NinjaTrader connection saved successfully');
      setShowConnectionForm(false);
    } catch (error) {
      console.error('Error saving NinjaTrader connection:', error);
      toast.error('Failed to save NinjaTrader connection');
    }
  };
  
  // Handle testing NinjaTrader connection
  const handleTestNinjaTraderConnection = async (connection: NinjaTraderConnection) => {
    return await brokerApi.testNinjaTraderConnection(connection.endpoint, connection.apiKey);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Broker Connections</h2>
      </div>
      
      <p className="text-sm text-muted-foreground">
        Connect to your trading accounts to enable auto-trading capabilities.
      </p>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
        <TabsList className="grid grid-cols-3 mb-8">
          <TabsTrigger value="alpaca">Alpaca</TabsTrigger>
          <TabsTrigger value="oanda">Oanda</TabsTrigger>
          <TabsTrigger value="ninjatrader">NinjaTrader</TabsTrigger>
        </TabsList>
        
        <TabsContent value="alpaca">
          <Card>
            <CardHeader>
              <CardTitle>Alpaca Trading API</CardTitle>
              <CardDescription>
                Connect to Alpaca for stocks, ETFs, and crypto trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showConnectionForm ? (
                <AlpacaConnectionForm 
                  onSave={handleAddAlpacaConnection}
                  onTest={handleTestAlpacaConnection}
                  onCancel={() => setShowConnectionForm(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No Alpaca connections configured
                  </p>
                  <Button 
                    onClick={() => setShowConnectionForm(true)}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Alpaca Connection
                  </Button>
                </div>
              )}
            </CardContent>
            {!showConnectionForm && (
              <CardFooter className="flex justify-between border-t p-4 text-xs text-muted-foreground">
                <div>
                  Get your API keys from{' '}
                  <a 
                    href="https://app.alpaca.markets/paper/dashboard/overview" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Alpaca Dashboard
                  </a>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="oanda">
          <Card>
            <CardHeader>
              <CardTitle>Oanda Trading API</CardTitle>
              <CardDescription>
                Connect to Oanda for forex and commodities trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showConnectionForm ? (
                <OandaConnectionForm 
                  onSave={handleAddOandaConnection}
                  onTest={handleTestOandaConnection}
                  onCancel={() => setShowConnectionForm(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No Oanda connections configured
                  </p>
                  <Button 
                    onClick={() => setShowConnectionForm(true)}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Oanda Connection
                  </Button>
                </div>
              )}
            </CardContent>
            {!showConnectionForm && (
              <CardFooter className="flex justify-between border-t p-4 text-xs text-muted-foreground">
                <div>
                  Get your API token from{' '}
                  <a 
                    href="https://www.oanda.com/account/login" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Oanda Account
                  </a>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
        
        <TabsContent value="ninjatrader">
          <Card>
            <CardHeader>
              <CardTitle>NinjaTrader Integration</CardTitle>
              <CardDescription>
                Connect to NinjaTrader for futures and forex trading
              </CardDescription>
            </CardHeader>
            <CardContent>
              {showConnectionForm ? (
                <NinjaTraderConnectionForm 
                  onSave={handleAddNinjaTraderConnection}
                  onTest={handleTestNinjaTraderConnection}
                  onCancel={() => setShowConnectionForm(false)}
                />
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <p className="text-muted-foreground mb-4">
                    No NinjaTrader connections configured
                  </p>
                  <Button 
                    onClick={() => setShowConnectionForm(true)}
                    className="flex items-center"
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add NinjaTrader Connection
                  </Button>
                </div>
              )}
            </CardContent>
            {!showConnectionForm && (
              <CardFooter className="border-t p-4 text-xs text-muted-foreground">
                <div>
                  <p>NinjaTrader requires a companion application running on your computer to receive and execute trade commands.</p>
                  <div className="mt-2 space-y-2">
                    <p>
                      <a 
                        href="/downloads/TradeHybridNinjaTraderConnector.zip" 
                        download
                        className="text-primary hover:underline flex items-center font-medium"
                      >
                        <span className="mr-1">📦</span> Download NinjaTrader Connector Package (ZIP)
                      </a>
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">Individual files:</p>
                    <p>
                      <a 
                        href="/downloads/TradeHybridNinjaConnector.cs" 
                        download
                        className="text-primary hover:underline flex items-center text-xs"
                      >
                        <span className="mr-1">📄</span> Connector Script (.cs)
                      </a>
                    </p>
                    <p>
                      <a 
                        href="/downloads/NinjaTraderConnector_Installation_Guide.md" 
                        download
                        className="text-primary hover:underline flex items-center text-xs"
                      >
                        <span className="mr-1">📝</span> Installation Guide (.md)
                      </a>
                    </p>
                  </div>
                </div>
              </CardFooter>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};