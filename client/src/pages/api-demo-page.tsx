import { useState, useEffect } from 'react';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { BrokerService, OrderTimeInForce } from '@/lib/services/broker-service';
import { AppShell } from '@/components/layout/app-shell';
import { ApiKeyManager } from '@/components/ui/api-key-manager';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatCurrency } from '@/lib/utils/formatters';
import { AlertCircle, Check, Loader2, RefreshCw } from 'lucide-react';

export default function ApiDemoPage() {
  const [brokerService, setBrokerService] = useState<BrokerService | null>(null);
  const [activeTab, setActiveTab] = useState('account');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('AAPL');
  
  // Initialize broker service
  useEffect(() => {
    initBroker();
  }, []);
  
  const initBroker = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Create broker service
      const service = BrokerFactory.createBrokerService('alpaca');
      
      // Connect to the service
      await service.connect();
      
      // Set broker service state
      setBrokerService(service);
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to initialize broker service:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize broker service');
      setIsLoading(false);
    }
  };
  
  // Fetch account info
  const fetchAccountInfo = async () => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const accountInfo = await brokerService.getAccountInfo();
      setResult(accountInfo);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch account info:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch account info');
      setIsLoading(false);
    }
  };
  
  // Fetch positions
  const fetchPositions = async () => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const positions = await brokerService.getPositions();
      setResult(positions);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch positions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch positions');
      setIsLoading(false);
    }
  };
  
  // Fetch order history
  const fetchOrderHistory = async () => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const orderHistory = await brokerService.getOrderHistory();
      setResult(orderHistory);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order history');
      setIsLoading(false);
    }
  };
  
  // Fetch asset details
  const fetchAssetDetails = async () => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Assume broker service has a method for this
      // This might need to be implemented depending on broker API
      const assetDetails = await brokerService.getAssetDetails?.(symbol);
      setResult(assetDetails || { message: 'Asset details not available in this broker implementation' });
      
      setIsLoading(false);
    } catch (err) {
      console.error(`Failed to fetch details for ${symbol}:`, err);
      setError(err instanceof Error ? err.message : `Failed to fetch details for ${symbol}`);
      setIsLoading(false);
    }
  };
  
  // Simulate a market buy
  const executeMarketBuy = async () => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      
      const order = {
        symbol: symbol,
        side: 'buy' as const,
        quantity: 1,
        type: 'market' as const,
        timeInForce: 'day' as OrderTimeInForce
      };
      
      const orderResult = await brokerService.placeOrder(order);
      setResult(orderResult);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to execute market buy:', err);
      setError(err instanceof Error ? err.message : 'Failed to execute market buy');
      setIsLoading(false);
    }
  };
  
  // Render JSON data in a readable format
  const renderJsonData = (data: any) => {
    return (
      <pre className="bg-muted p-4 rounded-md overflow-auto max-h-96 text-sm">
        {JSON.stringify(data, null, 2)}
      </pre>
    );
  };
  
  return (
    <AppShell>
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Broker API Demo</h1>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={initBroker}
              disabled={isLoading}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Reinitialize
            </Button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>API Testing</CardTitle>
                  <CardDescription>
                    Test various broker API endpoints and see real-time responses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {error && (
                    <Alert variant="destructive" className="mb-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="account">Account</TabsTrigger>
                      <TabsTrigger value="positions">Positions</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                      <TabsTrigger value="assets">Assets</TabsTrigger>
                      <TabsTrigger value="trading">Trading</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="account" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Account Information</h3>
                        
                        <Button 
                          onClick={fetchAccountInfo}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Fetch Account Info'
                          )}
                        </Button>
                      </div>
                      
                      {result && activeTab === 'account' && renderJsonData(result)}
                    </TabsContent>
                    
                    <TabsContent value="positions" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Current Positions</h3>
                        
                        <Button 
                          onClick={fetchPositions}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Fetch Positions'
                          )}
                        </Button>
                      </div>
                      
                      {result && activeTab === 'positions' && renderJsonData(result)}
                    </TabsContent>
                    
                    <TabsContent value="orders" className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium">Order History</h3>
                        
                        <Button 
                          onClick={fetchOrderHistory}
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Loading...
                            </>
                          ) : (
                            'Fetch Order History'
                          )}
                        </Button>
                      </div>
                      
                      {result && activeTab === 'orders' && renderJsonData(result)}
                    </TabsContent>
                    
                    <TabsContent value="assets" className="space-y-4">
                      <div className="space-y-4">
                        <div className="flex items-center gap-2">
                          <Input 
                            placeholder="Symbol (e.g., AAPL)"
                            value={symbol}
                            onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                            className="max-w-xs"
                          />
                          
                          <Button 
                            onClick={fetchAssetDetails}
                            disabled={isLoading}
                          >
                            {isLoading ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              'Fetch Asset Details'
                            )}
                          </Button>
                        </div>
                        
                        {result && activeTab === 'assets' && renderJsonData(result)}
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="trading" className="space-y-4">
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-lg font-medium mb-2">Execute Sample Trade</h3>
                          <p className="text-muted-foreground mb-4">
                            This will place a market order to buy 1 share of the selected symbol.
                          </p>
                          
                          <div className="flex items-center gap-2">
                            <Input 
                              placeholder="Symbol (e.g., AAPL)"
                              value={symbol}
                              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
                              className="max-w-xs"
                            />
                            
                            <Button 
                              onClick={executeMarketBuy}
                              disabled={isLoading}
                            >
                              {isLoading ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Executing...
                                </>
                              ) : (
                                'Buy 1 Share'
                              )}
                            </Button>
                          </div>
                        </div>
                        
                        {result && activeTab === 'trading' && renderJsonData(result)}
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <div className="text-sm text-muted-foreground">
                    {brokerService ? 'Connected to broker API' : 'Not connected to broker API'}
                  </div>
                </CardFooter>
              </Card>
            </div>
            
            <div>
              <ApiKeyManager />
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}