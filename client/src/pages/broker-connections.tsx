import React, { useState, useEffect } from 'react';
import { Container } from '../components/ui/container';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
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
import { useToast } from '../components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../components/ui/accordion';

// Interface for broker data
interface Broker {
  id: string;
  name: string;
  logo: string;
  description: string;
  category: 'crypto' | 'stocks' | 'forex' | 'futures' | 'multi';
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
  const [loading, setLoading] = useState(true);
  const [selectedBroker, setSelectedBroker] = useState<string | null>(null);
  const [activeBrokers, setActiveBrokers] = useState<string[]>([]);
  const [brokers, setBrokers] = useState<Broker[]>([]);
  
  // Fetch real broker data
  useEffect(() => {
    fetchBrokerData();
  }, []);
  
  const fetchBrokerData = async () => {
    setLoading(true);
    try {
      // Fetch broker status info
      const statusResponse = await fetch('/api/broker-status');
      const statusData = await statusResponse.json();
      
      if (!statusData || statusData.status === 'error') {
        throw new Error('Failed to get broker status data');
      }
      
      // Fetch broker account info
      const accountResponse = await fetch('/api/broker-account');
      const accountData = await accountResponse.json();
      
      if (!accountData || accountData.status === 'error') {
        throw new Error('Failed to get broker account data');
      }
      
      // Available brokers based on our system configuration
      const availableBrokers: Broker[] = [
        {
          id: 'alpaca',
          name: 'Alpaca',
          logo: '/broker-logos/alpaca.svg',
          description: 'Commission-free API-first stock brokerage for developers and traders',
          category: 'stocks',
          markets: ['US Stocks', 'ETFs', 'Options'],
          connectionStatus: statusData.brokers?.alpaca?.connected ? 'connected' : 'disconnected',
          lastUpdated: new Date(),
          apiUrl: 'https://alpaca.markets/docs/api-documentation/',
          documentationUrl: 'https://alpaca.markets/docs/',
          supportsSimulation: true,
          supportsLiveTrading: true,
        },
        {
          id: 'oanda',
          name: 'OANDA',
          logo: '/broker-logos/oanda.svg',
          description: 'Forex and CFD trading, currency data and analytics',
          category: 'forex',
          markets: ['Forex', 'Commodities', 'Indices'],
          connectionStatus: statusData.brokers?.oanda?.connected ? 'connected' : 'disconnected',
          lastUpdated: new Date(),
          apiUrl: 'https://developer.oanda.com/',
          documentationUrl: 'https://www.oanda.com/us-en/trading/platform/api-trading/',
          supportsSimulation: true,
          supportsLiveTrading: true,
        },
        {
          id: 'tradehybrid_system',
          name: 'Trade Hybrid',
          logo: '/logo.png',
          description: 'Platform trading account for executing trades across multiple markets',
          category: 'multi',
          markets: ['Forex', 'Crypto', 'Stocks', 'Futures'],
          connectionStatus: 'connected', // System account is always connected
          lastUpdated: new Date(),
          apiUrl: 'https://tradehybrid.club/docs',
          documentationUrl: 'https://tradehybrid.club/docs',
          supportsSimulation: true,
          supportsLiveTrading: true,
        },
      ];
      
      // Now we need to merge real account data with our predefined broker info
      const enrichedBrokers = availableBrokers.map(broker => {
        // Find this broker's account data if it exists
        const brokerAccountData = accountData.brokers?.find(
          (b: any) => b.brokerId === broker.id && b.connected
        );
        
        if (brokerAccountData?.accountInfo) {
          // Add real account data to the broker object
          return {
            ...broker,
            connectedAccount: {
              accountId: brokerAccountData.accountInfo.accountId || brokerAccountData.accountInfo.id || 'Unknown',
              accountType: brokerAccountData.accountInfo.accountType || 'live',
              balance: brokerAccountData.accountInfo.equity || 
                      brokerAccountData.accountInfo.balance || 
                      brokerAccountData.accountInfo.cash || 0,
              currency: brokerAccountData.accountInfo.currency || 'USD',
              positionCount: (brokerAccountData.accountInfo.positions || []).length,
              orderCount: (brokerAccountData.accountInfo.orders || []).length || 0,
            }
          };
        }
        
        return broker;
      });
      
      console.log('Using real broker data:', enrichedBrokers);
      setBrokers(enrichedBrokers);
      
      // Update active brokers list based on connection status
      setActiveBrokers(
        enrichedBrokers
          .filter(broker => broker.connectionStatus === 'connected')
          .map(broker => broker.id)
      );
      
    } catch (error) {
      console.error('Error fetching broker data:', error);
      toast({
        title: "Error Loading Brokers",
        description: "Failed to load broker information. Using default settings.",
        variant: "destructive",
      });
      
      // Fallback to using predefined broker list without real account data
      const fallbackBrokers: Broker[] = [
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
        },
        {
          id: 'oanda',
          name: 'OANDA',
          logo: '/broker-logos/oanda.svg',
          description: 'Forex and CFD trading, currency data and analytics',
          category: 'forex',
          markets: ['Forex', 'Commodities', 'Indices'],
          connectionStatus: 'disconnected',
          lastUpdated: new Date(),
          apiUrl: 'https://developer.oanda.com/',
          documentationUrl: 'https://www.oanda.com/us-en/trading/platform/api-trading/',
          supportsSimulation: true,
          supportsLiveTrading: true,
        },
        {
          id: 'tradehybrid_system',
          name: 'Trade Hybrid',
          logo: '/logo.png',
          description: 'Platform trading account for executing trades',
          category: 'multi',
          markets: ['Forex', 'Crypto', 'Stocks', 'Futures'],
          connectionStatus: 'connected',
          lastUpdated: new Date(),
          apiUrl: 'https://tradehybrid.club/docs',
          documentationUrl: 'https://tradehybrid.club/docs',
          supportsSimulation: true,
          supportsLiveTrading: true,
        }
      ];
      
      setBrokers(fallbackBrokers);
      setActiveBrokers(['alpaca', 'tradehybrid_system']);
    } finally {
      setLoading(false);
    }
  };

  // Filter brokers by category
  const getBrokersByCategory = (category: string) => {
    if (category === 'all') {
      return brokers;
    }
    return brokers.filter(broker => broker.category === category || 
                         (category === 'tradfi' && 
                          (broker.category === 'stocks' || 
                           broker.category === 'forex' || 
                           broker.category === 'futures')));
  };

  // Connect to a broker
  const connectToBroker = async (brokerId: string, credentials: Record<string, string>) => {
    setLoading(true);
    
    try {
      // In a real application, this would make an API call to connect to the broker
      console.log(`Connecting to broker: ${brokerId}`, credentials);
      
      // Make API call to connect the broker
      const response = await fetch(`/api/broker-connect/${brokerId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to connect broker');
      }
      
      // Update the active brokers list
      if (!activeBrokers.includes(brokerId)) {
        setActiveBrokers([...activeBrokers, brokerId]);
      }
      
      // Refresh data to get updated broker info
      fetchBrokerData();
      
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
      
      const response = await fetch(`/api/broker-disconnect/${brokerId}`, {
        method: 'POST',
      });
      
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to disconnect broker');
      }
      
      // Update the active brokers list
      setActiveBrokers(activeBrokers.filter(id => id !== brokerId));
      
      // Refresh data to get updated broker info
      fetchBrokerData();
      
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
      
      const response = await fetch(`/api/broker-account/${brokerId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to refresh broker data: ${response.statusText}`);
      }
      
      // Refresh all broker data
      fetchBrokerData();
      
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

  // Handle connect button click
  const handleConnectClick = (brokerId: string) => {
    setSelectedBroker(brokerId);
    // In a real application, this would open a modal for API key input
  };
  
  // Render broker logo with fallback to Globe icon
  const renderBrokerLogo = (broker: Broker, size: 'sm' | 'md' = 'sm') => {
    const sizeClasses = size === 'sm' 
      ? { container: 'w-8 h-8', image: 'w-6 h-6', icon: 'h-5 w-5' }
      : { container: 'w-10 h-10', image: 'w-8 h-8', icon: 'h-6 w-6' };
    
    return (
      <div className={`${sizeClasses.container} flex items-center justify-center rounded-full bg-primary/10 overflow-hidden`}>
        {broker.logo ? (
          <img 
            src={broker.logo} 
            alt={`${broker.name} logo`} 
            className={`${sizeClasses.image} object-contain`}
            onError={(e) => {
              // If image fails to load, show fallback icon
              const target = e.currentTarget;
              const sibling = target.nextElementSibling;
              if (sibling && sibling instanceof HTMLElement) {
                target.style.display = 'none';
                sibling.style.display = 'block';
              }
            }} 
          />
        ) : null}
        <Globe className={`${sizeClasses.icon} text-primary`} style={{display: broker.logo ? 'none' : 'block'}} />
      </div>
    );
  };

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
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1, 2].map(i => (
                <Card key={i} className="overflow-hidden">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
                        <div>
                          <div className="h-6 w-24 bg-gray-200 rounded animate-pulse"></div>
                          <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mt-1"></div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-12 bg-gray-200 rounded animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : brokers.filter(broker => broker.connectionStatus === 'connected').length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {brokers
                .filter(broker => broker.connectionStatus === 'connected')
                .map(broker => (
                  <Card key={broker.id} className="overflow-hidden">
                    <CardHeader className="pb-2">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                          {renderBrokerLogo(broker, 'md')}
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
                      {broker.connectedAccount ? (
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
                      ) : (
                        <div className="text-center py-4">
                          <p className="text-muted-foreground">Account info not available</p>
                        </div>
                      )}
                    </CardContent>
                    
                    <CardFooter className="border-t pt-3 pb-3 flex justify-between">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => refreshBrokerData(broker.id)}
                      >
                        <RefreshCw className="h-3.5 w-3.5 mr-1" />
                        Refresh
                      </Button>
                      
                      {broker.id !== 'tradehybrid_system' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => disconnectBroker(broker.id)}
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-1" />
                          Disconnect
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 border rounded-lg">
              <div className="max-w-md mx-auto">
                <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">No Connected Brokers</h3>
                <p className="text-muted-foreground mb-6">
                  Connect to your brokers to view your account information and trade directly from Trade Hybrid
                </p>
                <Button onClick={() => window.location.href = '#all-brokers'}>
                  Browse Available Brokers
                </Button>
              </div>
            </div>
          )}
        </TabsContent>

        {/* All Brokers Tab */}
        <TabsContent value="all" id="all-brokers" className="space-y-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <Card key={i}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                      <div className="h-5 w-24 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent className="pb-3">
                    <div className="h-4 w-full bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-3/4 bg-gray-200 rounded animate-pulse"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {getBrokersByCategory('all').map(broker => (
                <Card key={broker.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderBrokerLogo(broker)}
                        <CardTitle className="text-base">{broker.name}</CardTitle>
                      </div>
                      {broker.connectionStatus === 'connected' && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-3">{broker.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="text-xs">{market}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-3 pb-3 flex justify-between">
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refreshBrokerData(broker.id)}
                        >
                          <Activity className="h-3.5 w-3.5 mr-1" />
                          Account
                        </Button>
                        
                        {broker.id !== 'tradehybrid_system' && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => disconnectBroker(broker.id)}
                          >
                            Disconnect
                          </Button>
                        )}
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(broker.documentationUrl, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Docs
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleConnectClick(broker.id)}
                        >
                          Connect
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        {/* Crypto Brokers Tab */}
        <TabsContent value="crypto" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getBrokersByCategory('crypto').length > 0 ? (
              getBrokersByCategory('crypto').map(broker => (
                <Card key={broker.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderBrokerLogo(broker)}
                        <CardTitle className="text-base">{broker.name}</CardTitle>
                      </div>
                      {broker.connectionStatus === 'connected' && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          Connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-3">{broker.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="text-xs">{market}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-3 pb-3 flex justify-between">
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refreshBrokerData(broker.id)}
                        >
                          <Activity className="h-3.5 w-3.5 mr-1" />
                          Account
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => disconnectBroker(broker.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(broker.documentationUrl, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Docs
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleConnectClick(broker.id)}
                        >
                          Connect
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 border rounded-lg">
                <div className="max-w-md mx-auto">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Crypto Brokers Available</h3>
                  <p className="text-muted-foreground mb-4">
                    We don't have any crypto brokers configured for your account yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
        
        {/* Traditional Markets Tab */}
        <TabsContent value="tradfi" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getBrokersByCategory('tradfi').length > 0 ? (
              getBrokersByCategory('tradfi').map(broker => (
                <Card key={broker.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {renderBrokerLogo(broker)}
                        <CardTitle className="text-base">{broker.name}</CardTitle>
                      </div>
                      {broker.connectionStatus === 'connected' && (
                        <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                          Connected
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <p className="text-sm text-muted-foreground mb-3">{broker.description}</p>
                    
                    <div className="flex flex-wrap gap-1 mb-3">
                      {broker.markets.map(market => (
                        <Badge key={market} variant="secondary" className="text-xs">{market}</Badge>
                      ))}
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t pt-3 pb-3 flex justify-between">
                    {broker.connectionStatus === 'connected' ? (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => refreshBrokerData(broker.id)}
                        >
                          <Activity className="h-3.5 w-3.5 mr-1" />
                          Account
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-red-500 hover:text-red-600 hover:bg-red-50"
                          onClick={() => disconnectBroker(broker.id)}
                        >
                          Disconnect
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => window.open(broker.documentationUrl, '_blank')}
                        >
                          <ExternalLink className="h-3.5 w-3.5 mr-1" />
                          Docs
                        </Button>
                        
                        <Button 
                          size="sm"
                          onClick={() => handleConnectClick(broker.id)}
                        >
                          Connect
                        </Button>
                      </>
                    )}
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-8 border rounded-lg">
                <div className="max-w-md mx-auto">
                  <Globe className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-xl font-medium mb-2">No Traditional Brokers Available</h3>
                  <p className="text-muted-foreground mb-4">
                    We don't have any traditional market brokers configured for your account yet.
                  </p>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Broker Connection Features */}
      <div className="mt-12 border-t pt-8">
        <h2 className="text-2xl font-bold mb-6">Broker Integration Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-blue-500" />
                Secure API Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Your API keys are encrypted and securely stored. We never share your keys with third parties.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="h-5 w-5 mr-2 text-green-500" />
                Real-Time Data
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Get real-time account data, portfolio information, and market updates from your connected brokers.
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Link className="h-5 w-5 mr-2 text-purple-500" />
                Unified Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Manage all your trading accounts from a single interface. One platform for all your financial needs.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
};

export default BrokerConnectionsView;