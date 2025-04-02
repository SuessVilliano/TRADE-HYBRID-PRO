import React, { useState, useEffect } from 'react';
import { Container } from '@/components/ui/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Link,
  ExternalLink,
  Settings,
  ArrowUpRight,
  RefreshCw,
  Activity,
  Wallet,
  Globe,
  Shield,
  Trash2,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Lock,
  Play,
  Pause,
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Mock interfaces
interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: 'crypto' | 'stocks' | 'forex' | 'futures';
  markets: string[];
  connectionStatus: 'connected' | 'disconnected' | 'error';
  lastUpdated?: Date;
  apiUrl?: string;
  documentationUrl?: string;
  supportsSimulation: boolean;
  supportsLiveTrading: boolean;
  userCredentials?: {
    apiKey: string;
    apiSecret: string;
    accountId?: string;
  };
  connectedAccount?: {
    accountId: string;
    accountType: 'demo' | 'live';
    balance: number;
    currency: string;
    positionCount: number;
    orderCount: number;
  };
}

const BrokerConnectionsView: React.FC = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [activeBrokers, setActiveBrokers] = useState<string[]>([]);
  
  // Mock Broker List
  const brokers: Broker[] = [
    {
      id: 'alpaca',
      name: 'Alpaca',
      logo: '/broker-logos/alpaca.svg',
      description: 'Commission-free API-first stock brokerage for developers and traders',
      category: 'stocks',
      markets: ['US Stocks', 'ETFs', 'Options'],
      connectionStatus: 'connected',
      lastUpdated: new Date(),
      apiUrl: 'https://alpaca.markets/docs/api-documentation/',
      documentationUrl: 'https://alpaca.markets/docs/',
      supportsSimulation: true,
      supportsLiveTrading: true,
      userCredentials: {
        apiKey: '***********',
        apiSecret: '***********',
      },
      connectedAccount: {
        accountId: 'ALPCA123456',
        accountType: 'demo',
        balance: 25000,
        currency: 'USD',
        positionCount: 3,
        orderCount: 5,
      },
    },
    {
      id: 'binance',
      name: 'Binance',
      logo: '/broker-logos/binance.svg',
      description: 'The world\'s largest crypto exchange by trading volume',
      category: 'crypto',
      markets: ['Crypto Spot', 'Futures', 'Options'],
      connectionStatus: 'disconnected',
      apiUrl: 'https://binance-docs.github.io/apidocs/',
      documentationUrl: 'https://binance.com/en/support',
      supportsSimulation: false,
      supportsLiveTrading: true,
    },
    {
      id: 'oanda',
      name: 'OANDA',
      logo: '/broker-logos/oanda.svg',
      description: 'Forex and CFD trading, currency data and analytics',
      category: 'forex',
      markets: ['Forex', 'Commodities', 'Indices'],
      connectionStatus: 'disconnected',
      apiUrl: 'https://developer.oanda.com/',
      documentationUrl: 'https://www.oanda.com/us-en/trading/platform/api-trading/',
      supportsSimulation: true,
      supportsLiveTrading: true,
    },
    {
      id: 'tradier',
      name: 'Tradier',
      logo: '/broker-logos/tradier.svg',
      description: 'API-first brokerage services for traders and developers',
      category: 'stocks',
      markets: ['US Stocks', 'Options'],
      connectionStatus: 'disconnected',
      apiUrl: 'https://documentation.tradier.com/',
      documentationUrl: 'https://tradier.com/products/brokerage',
      supportsSimulation: false,
      supportsLiveTrading: true,
    },
    {
      id: 'interactive_brokers',
      name: 'Interactive Brokers',
      logo: '/broker-logos/ibkr.svg',
      description: 'Professional-grade global trading platform',
      category: 'stocks',
      markets: ['Global Stocks', 'Options', 'Futures', 'Forex'],
      connectionStatus: 'disconnected',
      apiUrl: 'https://interactivebrokers.github.io/tws-api/',
      documentationUrl: 'https://www.interactivebrokers.com/en/index.php?f=5041',
      supportsSimulation: true,
      supportsLiveTrading: true,
    },
    {
      id: 'tradovate',
      name: 'Tradovate',
      logo: '/broker-logos/tradovate.svg',
      description: 'Modern platform for futures trading',
      category: 'futures',
      markets: ['Futures'],
      connectionStatus: 'error',
      apiUrl: 'https://api.tradovate.com/',
      documentationUrl: 'https://tradovate.github.io/example-api-js/',
      supportsSimulation: true,
      supportsLiveTrading: true,
    },
  ];

  // Filter brokers by category
  const getBrokersByCategory = (category: string) => {
    if (category === 'all') {
      return brokers;
    }
    return brokers.filter(broker => broker.category === category);
  };

  // Connect to a broker
  const connectToBroker = async (brokerId: string, credentials: Record<string, string>) => {
    setLoading(true);
    
    try {
      // In a real application, this would make an API call to connect to the broker
      console.log(`Connecting to broker: ${brokerId}`, credentials);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update the active brokers list
      if (!activeBrokers.includes(brokerId)) {
        setActiveBrokers([...activeBrokers, brokerId]);
      }
      
      toast({
        title: "Broker Connected",
        description: `Successfully connected to ${brokers.find(b => b.id === brokerId)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Connection Error",
        description: `Failed to connect to broker. Please check your credentials.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setSelectedBroker(null);
    }
  };

  // Disconnect from a broker
  const disconnectBroker = async (brokerId: string) => {
    setLoading(true);
    
    try {
      // In a real application, this would make an API call to disconnect from the broker
      console.log(`Disconnecting from broker: ${brokerId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Update the active brokers list
      setActiveBrokers(activeBrokers.filter(id => id !== brokerId));
      
      toast({
        title: "Broker Disconnected",
        description: `Successfully disconnected from ${brokers.find(b => b.id === brokerId)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Disconnection Error",
        description: `Failed to disconnect from broker. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Refresh broker data
  const refreshBrokerData = async (brokerId: string) => {
    setLoading(true);
    
    try {
      // In a real application, this would make an API call to refresh broker data
      console.log(`Refreshing data for broker: ${brokerId}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Data Refreshed",
        description: `Successfully refreshed data from ${brokers.find(b => b.id === brokerId)?.name}`,
      });
    } catch (error) {
      toast({
        title: "Refresh Error",
        description: `Failed to refresh broker data. Please try again.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Mock API key input for connecting
  const handleConnectClick = (brokerId: string) => {
    setSelectedBroker(brokerId);
    // In a real application, this would open a modal for API key input
  };

  // For demo purposes
  useEffect(() => {
    // Mark Alpaca as active by default for the demo
    setActiveBrokers(['alpaca']);
  }, []);

  return (
    <Container className="py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Broker Connections</h1>
        <p className="text-muted-foreground">
          Connect to your preferred brokers to enable trading directly from Trade Hybrid
        </p>
      </div>

      <Tabs defaultValue="connected" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="connected">Connected</TabsTrigger>
          <TabsTrigger value="all">All Brokers</TabsTrigger>
          <TabsTrigger value="crypto">Crypto</TabsTrigger>
          <TabsTrigger value="tradfi">Traditional Markets</TabsTrigger>
        </TabsList>
        
        {/* Connected Brokers Tab */}
        <TabsContent value="connected" className="space-y-6">
          {brokers.filter(broker => broker.connectionStatus === 'connected').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brokers
                .filter(broker => broker.connectionStatus === 'connected')
                .map(broker => (
                  <Card key={broker.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10">
                            {/* Logo would go here in a real app */}
                            <Globe className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <CardTitle>{broker.name}</CardTitle>
                            <CardDescription className="flex items-center mt-1">
                              <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Connected
                              </Badge>
                              <span className="text-xs ml-2">
                                Last updated: {broker.lastUpdated?.toLocaleTimeString()}
                              </span>
                            </CardDescription>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => refreshBrokerData(broker.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="pb-3">
                      {broker.connectedAccount && (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Account Type</p>
                              <p className="font-medium">
                                {broker.connectedAccount.accountType === 'demo' ? 'Paper Trading' : 'Live Trading'}
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Account ID</p>
                              <p className="font-medium truncate">{broker.connectedAccount.accountId}</p>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2">
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Balance</p>
                              <p className="font-medium">
                                {new Intl.NumberFormat('en-US', {
                                  style: 'currency',
                                  currency: broker.connectedAccount.currency
                                }).format(broker.connectedAccount.balance)}
                              </p>
                            </div>
                            <div className="bg-muted rounded-lg p-2">
                              <p className="text-xs text-muted-foreground">Positions</p>
                              <p className="font-medium">{broker.connectedAccount.positionCount} Active</p>
                            </div>
                          </div>
                          
                          <div className="pt-2">
                            <Button variant="outline" className="w-full" onClick={() => refreshBrokerData(broker.id)}>
                              <Activity className="h-4 w-4 mr-2" />
                              View Account Details
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="flex justify-between pt-0">
                      <Button variant="ghost" className="text-destructive hover:text-destructive" onClick={() => disconnectBroker(broker.id)}>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </Button>
                      
                      <Button variant="ghost" asChild>
                        <a href={broker.documentationUrl} target="_blank" rel="noopener noreferrer">
                          Documentation
                          <ExternalLink className="h-4 w-4 ml-2" />
                        </a>
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/30 rounded-lg">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-4">
                <Link className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Connected Brokers</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Connect to your preferred brokers to enable trading directly from Trade Hybrid.
                You can connect to supported brokers using API keys.
              </p>
              <Button onClick={() => setSelectedBroker('alpaca')}>
                Connect Your First Broker
              </Button>
            </div>
          )}
        </TabsContent>
        
        {/* All Brokers Tab */}
        <TabsContent value="all">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getBrokersByCategory('all').map(broker => (
              <Card key={broker.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                        {/* Logo would go here in a real app */}
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{broker.name}</CardTitle>
                    </div>
                    <Badge variant={
                      broker.connectionStatus === 'connected' ? 'outline' :
                      broker.connectionStatus === 'error' ? 'destructive' : 'secondary'
                    } className={broker.connectionStatus === 'connected' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}>
                      {broker.connectionStatus === 'connected' ? 'Connected' : 
                       broker.connectionStatus === 'error' ? 'Error' : 'Not Connected'}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {broker.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="bg-muted">
                          {market}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm">
                      {broker.supportsSimulation && (
                        <div className="flex items-center text-muted-foreground">
                          <Play className="h-3 w-3 mr-1" />
                          Paper Trading
                        </div>
                      )}
                      
                      {broker.supportsLiveTrading && (
                        <div className="flex items-center text-muted-foreground">
                          <Wallet className="h-3 w-3 mr-1" />
                          Live Trading
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant={broker.connectionStatus === 'connected' ? 'outline' : 'default'}
                    className={broker.connectionStatus === 'connected' ? 'text-destructive hover:text-destructive' : ''}
                    onClick={() => broker.connectionStatus === 'connected' 
                      ? disconnectBroker(broker.id) 
                      : handleConnectClick(broker.id)
                    }
                  >
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <a href={broker.documentationUrl} target="_blank" rel="noopener noreferrer">
                      Docs
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Crypto Tab */}
        <TabsContent value="crypto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getBrokersByCategory('crypto').map(broker => (
              <Card key={broker.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                        {/* Logo would go here in a real app */}
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{broker.name}</CardTitle>
                    </div>
                    <Badge variant={
                      broker.connectionStatus === 'connected' ? 'outline' :
                      broker.connectionStatus === 'error' ? 'destructive' : 'secondary'
                    } className={broker.connectionStatus === 'connected' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}>
                      {broker.connectionStatus === 'connected' ? 'Connected' : 
                       broker.connectionStatus === 'error' ? 'Error' : 'Not Connected'}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {broker.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="bg-muted">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant={broker.connectionStatus === 'connected' ? 'outline' : 'default'}
                    className={broker.connectionStatus === 'connected' ? 'text-destructive hover:text-destructive' : ''}
                    onClick={() => broker.connectionStatus === 'connected' 
                      ? disconnectBroker(broker.id) 
                      : handleConnectClick(broker.id)
                    }
                  >
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <a href={broker.documentationUrl} target="_blank" rel="noopener noreferrer">
                      Docs
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
        
        {/* Traditional Markets Tab */}
        <TabsContent value="tradfi">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {brokers.filter(broker => 
              broker.category === 'stocks' || 
              broker.category === 'forex' || 
              broker.category === 'futures'
            ).map(broker => (
              <Card key={broker.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 flex items-center justify-center rounded-full bg-primary/10">
                        {/* Logo would go here in a real app */}
                        <Globe className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{broker.name}</CardTitle>
                    </div>
                    <Badge variant={
                      broker.connectionStatus === 'connected' ? 'outline' :
                      broker.connectionStatus === 'error' ? 'destructive' : 'secondary'
                    } className={broker.connectionStatus === 'connected' ? 'bg-green-500/10 text-green-600 border-green-200' : ''}>
                      {broker.connectionStatus === 'connected' ? 'Connected' : 
                       broker.connectionStatus === 'error' ? 'Error' : 'Not Connected'}
                    </Badge>
                  </div>
                  <CardDescription className="mt-2">
                    {broker.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="pb-3">
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-1">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="bg-muted">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex justify-between pt-0">
                  <Button 
                    variant={broker.connectionStatus === 'connected' ? 'outline' : 'default'}
                    className={broker.connectionStatus === 'connected' ? 'text-destructive hover:text-destructive' : ''}
                    onClick={() => broker.connectionStatus === 'connected' 
                      ? disconnectBroker(broker.id) 
                      : handleConnectClick(broker.id)
                    }
                  >
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Trash2 className="h-4 w-4 mr-2" />
                        Disconnect
                      </>
                    ) : (
                      <>
                        <Link className="h-4 w-4 mr-2" />
                        Connect
                      </>
                    )}
                  </Button>
                  
                  <Button variant="ghost" size="sm" asChild>
                    <a href={broker.documentationUrl} target="_blank" rel="noopener noreferrer">
                      Docs
                      <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Educational Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Connect with Trade Hybrid</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-primary" />
                Secure Broker Connections
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                We use read-only API keys when possible, and never store your broker passwords. 
                Your trading credentials are encrypted and securely stored with industry-standard 
                practices.
              </p>
              
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="item-1">
                  <AccordionTrigger>How to create API keys?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground mb-2">
                      Most brokers provide API keys in their account settings or developer section.
                      Follow these general steps:
                    </p>
                    <ol className="text-sm text-muted-foreground space-y-2 list-decimal pl-4">
                      <li>Log into your broker account</li>
                      <li>Navigate to API settings or Developer section</li>
                      <li>Create a new API key (often requires 2FA verification)</li>
                      <li>Set appropriate permissions (read-only when possible)</li>
                      <li>Copy the API key and secret to connect to Trade Hybrid</li>
                    </ol>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-2">
                  <AccordionTrigger>Can I use multiple brokers at once?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      Yes, Trade Hybrid is designed to connect with multiple brokers simultaneously.
                      This allows you to execute trades across different markets and asset classes
                      from a single unified interface.
                    </p>
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="item-3">
                  <AccordionTrigger>What if my broker isn't listed?</AccordionTrigger>
                  <AccordionContent>
                    <p className="text-sm text-muted-foreground">
                      We're constantly expanding our broker integrations. If your preferred broker
                      isn't available yet, please let us know through the support section and
                      we'll prioritize adding it to our platform.
                    </p>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2 text-primary" />
                Broker Integration Features
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Real-Time Market Data</h4>
                  <p className="text-sm text-muted-foreground">
                    Access live prices, order book depth, and market movements directly from your broker.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Automated Trade Execution</h4>
                  <p className="text-sm text-muted-foreground">
                    Execute trades programmatically using our platform's strategies or AI recommendations.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Portfolio Monitoring</h4>
                  <p className="text-sm text-muted-foreground">
                    Track your positions, open orders, and account balances across all connected brokers.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="mt-0.5">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <h4 className="font-medium">Multi-Market Trading</h4>
                  <p className="text-sm text-muted-foreground">
                    Seamlessly trade across stocks, crypto, forex, and futures from a single interface.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default BrokerConnectionsView;