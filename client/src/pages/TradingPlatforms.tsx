import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Alert, AlertDescription } from '../components/ui/alert';
import { 
  ExternalLink, 
  Settings, 
  Wifi, 
  WifiOff, 
  Loader2, 
  DollarSign, 
  TrendingUp,
  Eye,
  EyeOff,
  Refresh,
  Plus
} from 'lucide-react';

interface TradingPlatform {
  id: number;
  name: string;
  platformType: string;
  webTradeUrl: string;
  authType: string;
  configuration: any;
}

interface PlatformConnection {
  connection: {
    id: number;
    isConnected: boolean;
    lastSyncAt: string;
  };
  platform: TradingPlatform;
  account: {
    accountNumber: string;
    accountName: string;
    accountType: string;
    currency: string;
    balance: string;
    equity: string;
    margin: string;
    freeMargin: string;
    lastUpdated: string;
  } | null;
}

const TradingPlatforms: React.FC = () => {
  const [platforms, setPlatforms] = useState<TradingPlatform[]>([]);
  const [connections, setConnections] = useState<PlatformConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState<number | null>(null);
  const [showCredentials, setShowCredentials] = useState<{ [key: number]: boolean }>({});
  const [connectionForm, setConnectionForm] = useState<any>({});
  const [selectedPlatform, setSelectedPlatform] = useState<TradingPlatform | null>(null);
  const [showConnectionDialog, setShowConnectionDialog] = useState(false);

  useEffect(() => {
    fetchPlatforms();
    fetchConnections();
  }, []);

  const fetchPlatforms = async () => {
    try {
      const response = await fetch('/api/trading-platforms/platforms');
      const data = await response.json();
      setPlatforms(data.platforms);
    } catch (error) {
      console.error('Error fetching platforms:', error);
    }
  };

  const fetchConnections = async () => {
    try {
      const response = await fetch('/api/trading-platforms/connections');
      const data = await response.json();
      setConnections(data.connections);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (platform: TradingPlatform) => {
    setSelectedPlatform(platform);
    setConnectionForm({});
    setShowConnectionDialog(true);
  };

  const submitConnection = async () => {
    if (!selectedPlatform) return;

    setConnecting(selectedPlatform.id);
    try {
      const response = await fetch('/api/trading-platforms/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          platformId: selectedPlatform.id,
          credentials: connectionForm,
        }),
      });

      if (response.ok) {
        setShowConnectionDialog(false);
        fetchConnections();
      } else {
        const error = await response.json();
        alert(error.error || 'Connection failed');
      }
    } catch (error) {
      console.error('Connection error:', error);
      alert('Connection failed');
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (connectionId: number) => {
    try {
      const response = await fetch('/api/trading-platforms/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ connectionId }),
      });

      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  };

  const handleSync = async (connectionId: number) => {
    try {
      const response = await fetch(`/api/trading-platforms/sync/${connectionId}`, {
        method: 'POST',
      });

      if (response.ok) {
        fetchConnections();
      }
    } catch (error) {
      console.error('Sync error:', error);
    }
  };

  const openWebTrader = (url: string) => {
    window.open(url, '_blank', 'width=1200,height=800');
  };

  const renderConnectionForm = () => {
    if (!selectedPlatform) return null;

    const { authType, platformType } = selectedPlatform;

    return (
      <div className="space-y-4">
        {authType === 'credentials' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                value={connectionForm.username || ''}
                onChange={(e) =>
                  setConnectionForm({ ...connectionForm, username: e.target.value })
                }
                placeholder="Enter your username"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={connectionForm.password || ''}
                onChange={(e) =>
                  setConnectionForm({ ...connectionForm, password: e.target.value })
                }
                placeholder="Enter your password"
              />
            </div>
            {platformType === 'rithmic' && (
              <div className="space-y-2">
                <Label htmlFor="server">Server</Label>
                <Input
                  id="server"
                  type="text"
                  value={connectionForm.server || 'Rithmic Test'}
                  onChange={(e) =>
                    setConnectionForm({ ...connectionForm, server: e.target.value })
                  }
                  placeholder="Rithmic Test"
                />
              </div>
            )}
          </>
        )}

        {authType === 'api_key' && (
          <>
            <div className="space-y-2">
              <Label htmlFor="apiKey">API Key</Label>
              <Input
                id="apiKey"
                type="text"
                value={connectionForm.apiKey || ''}
                onChange={(e) =>
                  setConnectionForm({ ...connectionForm, apiKey: e.target.value })
                }
                placeholder="Enter your API key"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="apiSecret">API Secret</Label>
              <Input
                id="apiSecret"
                type="password"
                value={connectionForm.apiSecret || ''}
                onChange={(e) =>
                  setConnectionForm({ ...connectionForm, apiSecret: e.target.value })
                }
                placeholder="Enter your API secret"
              />
            </div>
          </>
        )}

        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="demo"
            checked={connectionForm.demo || true}
            onChange={(e) =>
              setConnectionForm({ ...connectionForm, demo: e.target.checked })
            }
          />
          <Label htmlFor="demo">Demo Account</Label>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Trading Platforms</h1>
        <p className="text-muted-foreground">
          Connect your professional trading platforms to sync data and manage accounts.
        </p>
      </div>

      <Tabs defaultValue="platforms" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="platforms">Available Platforms</TabsTrigger>
          <TabsTrigger value="connections">My Connections</TabsTrigger>
        </TabsList>

        <TabsContent value="platforms">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {platforms.map((platform) => {
              const isConnected = connections.some(
                (conn) => conn.platform?.id === platform.id && conn.connection.isConnected
              );

              return (
                <Card key={platform.id} className="relative">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {platform.name}
                        {isConnected && (
                          <Badge variant="default" className="bg-green-600">
                            <Wifi className="h-3 w-3 mr-1" />
                            Connected
                          </Badge>
                        )}
                      </CardTitle>
                    </div>
                    <CardDescription>
                      Professional trading platform with API integration
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline">
                        {platform.authType === 'credentials' ? 'Username/Password' : 
                         platform.authType === 'api_key' ? 'API Key' : 'OAuth'}
                      </Badge>
                      <Badge variant="outline">Demo Available</Badge>
                      <Badge variant="outline">Web Trading</Badge>
                    </div>

                    <div className="flex gap-2">
                      {!isConnected ? (
                        <Button 
                          onClick={() => handleConnect(platform)}
                          disabled={connecting === platform.id}
                          className="flex-1"
                        >
                          {connecting === platform.id ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Plus className="h-4 w-4 mr-2" />
                          )}
                          Connect
                        </Button>
                      ) : (
                        <Button variant="outline" className="flex-1" disabled>
                          Connected
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        onClick={() => openWebTrader(platform.webTradeUrl)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Web Trader
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="connections">
          <div className="space-y-6">
            {connections.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <WifiOff className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Connected Platforms</h3>
                  <p className="text-muted-foreground text-center mb-4">
                    Connect to trading platforms to sync your account data and manage trades.
                  </p>
                  <Button onClick={() => fetchPlatforms()}>
                    <Plus className="h-4 w-4 mr-2" />
                    Connect Platform
                  </Button>
                </CardContent>
              </Card>
            ) : (
              connections.map((conn) => (
                <Card key={conn.connection.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2">
                        {conn.platform?.name}
                        <Badge variant={conn.connection.isConnected ? "default" : "secondary"}>
                          {conn.connection.isConnected ? (
                            <><Wifi className="h-3 w-3 mr-1" />Connected</>
                          ) : (
                            <><WifiOff className="h-3 w-3 mr-1" />Disconnected</>
                          )}
                        </Badge>
                      </CardTitle>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSync(conn.connection.id)}
                        >
                          <Refresh className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDisconnect(conn.connection.id)}
                        >
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {conn.account && (
                    <CardContent>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <DollarSign className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-sm text-muted-foreground">Balance</div>
                          <div className="font-semibold">
                            {conn.account.currency} {parseFloat(conn.account.balance).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <TrendingUp className="h-5 w-5 mx-auto mb-1 text-primary" />
                          <div className="text-sm text-muted-foreground">Equity</div>
                          <div className="font-semibold">
                            {conn.account.currency} {parseFloat(conn.account.equity).toLocaleString()}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Account</div>
                          <div className="font-semibold">{conn.account.accountNumber}</div>
                          <div className="text-xs text-muted-foreground capitalize">
                            {conn.account.accountType}
                          </div>
                        </div>
                        
                        <div className="text-center p-3 bg-muted rounded-lg">
                          <div className="text-sm text-muted-foreground">Free Margin</div>
                          <div className="font-semibold">
                            {conn.account.currency} {parseFloat(conn.account.freeMargin).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 text-xs text-muted-foreground">
                        Last updated: {new Date(conn.account.lastUpdated).toLocaleString()}
                      </div>
                    </CardContent>
                  )}
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showConnectionDialog} onOpenChange={setShowConnectionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connect to {selectedPlatform?.name}</DialogTitle>
            <DialogDescription>
              Enter your credentials to connect to {selectedPlatform?.name}. Your credentials are encrypted and stored securely.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {renderConnectionForm()}
            
            <Alert>
              <AlertDescription>
                Make sure you're using valid credentials for your {selectedPlatform?.name} account.
                Demo accounts are recommended for testing.
              </AlertDescription>
            </Alert>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowConnectionDialog(false)}>
                Cancel
              </Button>
              <Button onClick={submitConnection} disabled={connecting !== null}>
                {connecting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : null}
                Connect
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TradingPlatforms;