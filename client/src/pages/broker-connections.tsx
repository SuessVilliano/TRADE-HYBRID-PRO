import React, { useState } from 'react';
import { Container } from '@/components/ui/container';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { BrokerConfig } from '@/components/ui/broker-config';
import { ConnectBrokerModal } from '@/components/broker/connect-broker-modal';
import { brokerService } from '@/lib/services/broker-service';
import { 
  Link2, 
  RefreshCw, 
  CheckCircle2, 
  Unlink, 
  Shield, 
  Share2, 
  Settings, 
  BarChart, 
  TrendingUp,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useBrokerAggregator } from '@/lib/stores/useBrokerAggregator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const BrokerConnectionsPage: React.FC = () => {
  const { activeBrokers, aggregator, useABATEV, toggleABATEV } = useBrokerAggregator();
  const [selectedTab, setSelectedTab] = useState('connect');
  const [brokers, setBrokers] = useState([
    { id: 'alpaca', name: 'Alpaca', type: 'stock', connected: activeBrokers.includes('alpaca'), logo: '🦙' },
    { id: 'tradelocker', name: 'TradeLocker', type: 'unified', connected: activeBrokers.includes('tradelocker'), logo: '🔒' },
    { id: 'oanda', name: 'Oanda', type: 'forex', connected: activeBrokers.includes('oanda'), logo: '💱' },
    { id: 'ibkr', name: 'Interactive Brokers', type: 'stock', connected: activeBrokers.includes('ibkr'), logo: '📈' },
    { id: 'tradestation', name: 'TradeStation', type: 'stock', connected: activeBrokers.includes('tradestation'), logo: '🚉' },
    { id: 'bitfinex', name: 'Bitfinex', type: 'crypto', connected: activeBrokers.includes('bitfinex'), logo: '₿' },
    { id: 'etrade', name: 'E*Trade', type: 'stock', connected: activeBrokers.includes('etrade'), logo: '📊' },
    { id: 'ironbeam', name: 'Ironbeam', type: 'futures', connected: activeBrokers.includes('ironbeam'), logo: '🦾' },
  ]);

  // Mock account data (would normally come from your broker service)
  const accountData = {
    balance: 25000.75,
    equity: 26150.33,
    dayPnL: 1150.58,
    openPositions: 3,
    marginUsed: 8500.25,
    freeMargin: 17650.08
  };

  return (
    <Container className="py-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broker Connections</h1>
          <p className="text-muted-foreground mt-1">
            Connect and manage your trading accounts across multiple brokers
          </p>
        </div>
        <ConnectBrokerModal 
          onConnect={async (brokerId, credentials) => {
            // Connect the broker using broker service
            await brokerService.connectBroker(
              brokerId,
              brokers.find(b => b.id === brokerId)?.name || "Unknown Broker",
              brokers.find(b => b.id === brokerId)?.type || "crypto",
              credentials
            );
            
            // Update local state for immediate UI feedback
            setBrokers(prevBrokers => 
              prevBrokers.map(broker => 
                broker.id === brokerId ? { ...broker, connected: true } : broker
              )
            );
          }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="connect" value={selectedTab} onValueChange={setSelectedTab} className="w-full">
            <TabsList className="grid grid-cols-3 mb-4">
              <TabsTrigger value="connect">Connect Brokers</TabsTrigger>
              <TabsTrigger value="manage">Manage Accounts</TabsTrigger>
              <TabsTrigger value="settings">Connection Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="connect" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {brokers.map(broker => (
                  <Card key={broker.id} className={cn(
                    "hover:shadow-md transition-all",
                    broker.connected && "border-primary/30 bg-primary/5"
                  )}>
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{broker.logo}</span>
                          <CardTitle>{broker.name}</CardTitle>
                        </div>
                        <Badge variant={broker.connected ? "default" : "outline"}>
                          {broker.connected ? "Connected" : "Not Connected"}
                        </Badge>
                      </div>
                      <CardDescription>
                        {broker.type === 'unified' 
                          ? 'Unified brokerage for stocks, options, futures & crypto' 
                          : `${broker.type.charAt(0).toUpperCase()}${broker.type.slice(1)} brokerage`}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      {broker.connected ? (
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Status:</span>
                            <span className="font-medium flex items-center gap-1 text-green-500">
                              <CheckCircle2 className="h-4 w-4" /> Active
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Last synced:</span>
                            <span>2 mins ago</span>
                          </div>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Connect to {broker.name} to trade {broker.type === 'unified' ? 'across multiple markets' : broker.type}
                        </p>
                      )}
                    </CardContent>
                    <CardFooter>
                      {broker.connected ? (
                        <div className="flex gap-2 w-full">
                          <Button variant="outline" size="sm" className="flex-1">
                            <RefreshCw className="h-4 w-4 mr-1" /> Sync
                          </Button>
                          <Button variant="outline" size="sm" className="flex-1 text-destructive hover:text-destructive">
                            <Unlink className="h-4 w-4 mr-1" /> Disconnect
                          </Button>
                        </div>
                      ) : (
                        <ConnectBrokerModal 
                          triggerButton={
                            <Button className="w-full" size="sm">
                              <Link2 className="h-4 w-4 mr-1" /> Connect {broker.name}
                            </Button>
                          }
                          preselectedBroker={broker.id}
                          onConnect={async (brokerId, credentials) => {
                            // Connect the broker
                            await brokerService.connectBroker(
                              brokerId,
                              broker.name,
                              broker.type,
                              credentials
                            );
                            
                            // Update local state
                            setBrokers(prevBrokers => 
                              prevBrokers.map(b => 
                                b.id === brokerId ? { ...b, connected: true } : b
                              )
                            );
                          }}
                        />
                      )}
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="manage" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Account Management</CardTitle>
                  <CardDescription>
                    View and manage your connected trading accounts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px] pr-4">
                    {activeBrokers.length > 0 ? (
                      <div className="space-y-4">
                        {activeBrokers.map((brokerId) => {
                          const broker = brokers.find(b => b.id === brokerId);
                          if (!broker) return null;
                          
                          return (
                            <Card key={brokerId} className="border border-muted">
                              <CardHeader className="pb-2">
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl">{broker.logo}</span>
                                    <CardTitle className="text-lg">{broker.name}</CardTitle>
                                  </div>
                                  <Badge>Active</Badge>
                                </div>
                              </CardHeader>
                              <CardContent className="pb-2">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm text-muted-foreground">Balance</p>
                                    <p className="text-lg font-semibold">${accountData.balance.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Equity</p>
                                    <p className="text-lg font-semibold">${accountData.equity.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Day P&L</p>
                                    <p className={`text-lg font-semibold flex items-center ${accountData.dayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                      {accountData.dayPnL >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                                      ${Math.abs(accountData.dayPnL).toLocaleString()}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm text-muted-foreground">Open Positions</p>
                                    <p className="text-lg font-semibold">{accountData.openPositions}</p>
                                  </div>
                                </div>
                              </CardContent>
                              <CardFooter className="flex gap-2">
                                <Button variant="outline" size="sm" className="flex-1">
                                  <BarChart className="h-4 w-4 mr-1" /> View Positions
                                </Button>
                                <Button variant="outline" size="sm" className="flex-1">
                                  <TrendingUp className="h-4 w-4 mr-1" /> Open Trade
                                </Button>
                              </CardFooter>
                            </Card>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <Link2 className="h-10 w-10 text-muted-foreground mb-4" />
                        <h3 className="text-lg font-medium mb-2">No Connected Brokers</h3>
                        <p className="text-muted-foreground mb-4 max-w-md">
                          Connect a broker to start managing your trading accounts and positions in one place.
                        </p>
                        <ConnectBrokerModal 
                          onConnect={async (brokerId, credentials) => {
                            await brokerService.connectBroker(
                              brokerId,
                              brokers.find(b => b.id === brokerId)?.name || "Unknown Broker",
                              brokers.find(b => b.id === brokerId)?.type || "crypto",
                              credentials
                            );
                            setBrokers(prevBrokers => 
                              prevBrokers.map(broker => 
                                broker.id === brokerId ? { ...broker, connected: true } : broker
                              )
                            );
                          }}
                        />
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Connection Settings</CardTitle>
                  <CardDescription>
                    Configure how Trade Hybrid connects to your brokers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <BrokerConfig />
                    
                    <Separator className="my-4" />
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Data Refresh Interval</h3>
                          <p className="text-sm text-muted-foreground">
                            How often to sync data from your brokers
                          </p>
                        </div>
                        <Button variant="outline" size="sm">
                          5 Minutes
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Connection Security</h3>
                          <p className="text-sm text-muted-foreground">
                            Enhanced security for your broker connections
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Shield className="h-4 w-4" /> Enabled
                        </Button>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-medium">Copy Trading Settings</h3>
                          <p className="text-sm text-muted-foreground">
                            Configure how positions are copied across accounts
                          </p>
                        </div>
                        <Button variant="outline" size="sm" className="gap-1">
                          <Share2 className="h-4 w-4" /> Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Summary</CardTitle>
              <CardDescription>Overview of all connected accounts</CardDescription>
            </CardHeader>
            <CardContent>
              {activeBrokers.length > 0 ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Connected Brokers</span>
                      <span className="font-medium">{activeBrokers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Balance</span>
                      <span className="font-medium">${accountData.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Total Equity</span>
                      <span className="font-medium">${accountData.equity.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Open Positions</span>
                      <span className="font-medium">{accountData.openPositions}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Available Margin</span>
                      <span className="font-medium">${accountData.freeMargin.toLocaleString()}</span>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Day P&L</span>
                    <span className={`font-medium flex items-center ${accountData.dayPnL >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {accountData.dayPnL >= 0 ? <ArrowUpRight className="h-4 w-4 mr-1" /> : <ArrowDownRight className="h-4 w-4 mr-1" />}
                      ${Math.abs(accountData.dayPnL).toLocaleString()}
                    </span>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-6 text-center">
                  <Link2 className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-muted-foreground mb-4">
                    Connect brokers to view your account summary
                  </p>
                  <ConnectBrokerModal 
                    triggerButton={
                      <Button size="sm">
                        <Link2 className="h-4 w-4 mr-1" /> Connect Broker
                      </Button>
                    }
                    onConnect={async (brokerId, credentials) => {
                      await brokerService.connectBroker(
                        brokerId,
                        brokers.find(b => b.id === brokerId)?.name || "Unknown Broker",
                        brokers.find(b => b.id === brokerId)?.type || "crypto",
                        credentials
                      );
                      setBrokers(prevBrokers => 
                        prevBrokers.map(broker => 
                          broker.id === brokerId ? { ...broker, connected: true } : broker
                        )
                      );
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button className="w-full justify-start" variant="outline">
                  <BarChart className="h-4 w-4 mr-2" /> View All Positions
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" /> New Trade
                </Button>
                <Button className="w-full justify-start" variant="outline">
                  <Settings className="h-4 w-4 mr-2" /> Advanced Settings
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-primary/5 border-primary/10">
            <CardHeader>
              <CardTitle>Pro Tip</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Connect multiple brokers to leverage Trade Hybrid's powerful cross-broker portfolio management and trading capabilities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default BrokerConnectionsPage;