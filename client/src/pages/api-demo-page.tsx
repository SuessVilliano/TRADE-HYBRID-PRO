import { useState, useEffect } from 'react';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { BrokerService } from '@/lib/services/broker-service';
import { ApiKeyManager } from '@/components/ui/api-key-manager';
import { BrokerConfig } from '@/components/ui/broker-config';
import { AdvancedAIAnalysis } from '@/components/ui/advanced-ai-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export default function ApiDemoPage() {
  const [broker, setBroker] = useState<BrokerService | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connected' | 'error'>('disconnected');
  const [accountInfo, setAccountInfo] = useState<any>(null);
  const [positions, setPositions] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Connect to broker service
  const connectBroker = async () => {
    try {
      setIsLoading(true);
      setErrorMessage(null);
      
      // Create broker service
      const service = BrokerFactory.createBrokerService('mock'); // Use 'alpaca' for real API
      
      // Connect to the service
      await service.connect();
      
      // Set the broker service
      setBroker(service);
      setConnectionStatus('connected');
      
      // Load initial data
      const balance = await service.getBalance();
      setAccountInfo(balance);
      
      const positions = await service.getPositions();
      setPositions(positions);
      
      const orders = await service.getOrderHistory();
      setOrders(orders);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to connect to broker:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  // Place a demo order
  const placeDemoOrder = async () => {
    if (!broker) return;
    
    try {
      setIsLoading(true);
      
      const result = await broker.placeOrder({
        symbol: 'AAPL',
        quantity: 1,
        price: 0, // Market order
        side: 'buy',
        type: 'market',
        timeInForce: 'day'
      });
      
      // Refresh orders list
      const orders = await broker.getOrderHistory();
      setOrders(orders);
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to place order:', error);
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
      setIsLoading(false);
    }
  };

  // Connect on component mount
  useEffect(() => {
    connectBroker();
  }, []);

  return (
    <div className="container mx-auto py-8 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Broker API Integration Demo</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-6">
          <BrokerConfig />
          <ApiKeyManager />
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Broker Integration Demo</CardTitle>
              <CardDescription>
                Test broker API integration with real-time data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {connectionStatus === 'error' && (
                <Alert variant="destructive" className="mb-4">
                  <AlertTitle>Connection Error</AlertTitle>
                  <AlertDescription>{errorMessage || 'Could not connect to broker service'}</AlertDescription>
                </Alert>
              )}
              
              {connectionStatus === 'connected' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Portfolio Value</div>
                      <div className="text-2xl font-bold">
                        ${accountInfo?.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Cash Balance</div>
                      <div className="text-2xl font-bold">
                        ${accountInfo?.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                      </div>
                    </div>
                    <div className="p-4 bg-muted rounded-lg">
                      <div className="text-sm text-muted-foreground">Open Positions</div>
                      <div className="text-2xl font-bold">{positions.length}</div>
                    </div>
                  </div>
                  
                  <Tabs defaultValue="positions">
                    <TabsList>
                      <TabsTrigger value="positions">Positions</TabsTrigger>
                      <TabsTrigger value="orders">Orders</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="positions" className="space-y-4">
                      {positions.length === 0 ? (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p>No open positions</p>
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted">
                                <th className="text-left p-2">Symbol</th>
                                <th className="text-right p-2">Quantity</th>
                                <th className="text-right p-2">Value</th>
                                <th className="text-right p-2">P/L</th>
                              </tr>
                            </thead>
                            <tbody>
                              {positions.map((position, index) => (
                                <tr key={index} className={index < positions.length - 1 ? "border-b" : ""}>
                                  <td className="p-2 font-medium">{position.symbol}</td>
                                  <td className="p-2 text-right">{position.quantity}</td>
                                  <td className="p-2 text-right">
                                    ${position.marketValue.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </td>
                                  <td className={`p-2 text-right ${position.unrealizedPL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    ${position.unrealizedPL.toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                      maximumFractionDigits: 2
                                    })}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="orders" className="space-y-4">
                      {orders.length === 0 ? (
                        <div className="text-center p-4 bg-muted rounded-lg">
                          <p>No recent orders</p>
                        </div>
                      ) : (
                        <div className="border rounded-lg">
                          <table className="w-full">
                            <thead>
                              <tr className="border-b bg-muted">
                                <th className="text-left p-2">Symbol</th>
                                <th className="text-right p-2">Side</th>
                                <th className="text-right p-2">Quantity</th>
                                <th className="text-right p-2">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map((order, index) => (
                                <tr key={index} className={index < orders.length - 1 ? "border-b" : ""}>
                                  <td className="p-2 font-medium">{order.symbol}</td>
                                  <td className={`p-2 text-right ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                                    {order.side.toUpperCase()}
                                  </td>
                                  <td className="p-2 text-right">{order.quantity}</td>
                                  <td className="p-2 text-right">
                                    <span className="px-2 py-1 text-xs rounded-full bg-muted">
                                      {order.status}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                      
                      <div className="flex justify-end">
                        <Button 
                          onClick={placeDemoOrder}
                          disabled={isLoading || connectionStatus !== 'connected'}
                        >
                          Place Demo Order (AAPL)
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
              
              {connectionStatus === 'disconnected' && !isLoading && (
                <div className="text-center p-8">
                  <p className="mb-4">Not connected to broker service</p>
                  <Button onClick={connectBroker}>Connect Now</Button>
                </div>
              )}
              
              {isLoading && (
                <div className="text-center p-8">
                  <p>Loading broker data...</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="text-sm text-muted-foreground border-t pt-4">
              <div>Status: {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}</div>
            </CardFooter>
          </Card>
        </div>
      </div>
      
      <div className="mt-8">
        <AdvancedAIAnalysis />
      </div>
    </div>
  );
}