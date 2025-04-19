import { useState, useEffect } from 'react';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { BrokerService } from '@/lib/services/broker-service';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Order {
  id: string;
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  filledQuantity: number;
  price: number;
  type: string;
  status: string;
  created: string;
  updated: string;
}

export function OrderHistory() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [brokerService, setBrokerService] = useState<BrokerService | null>(null);
  
  // Filter orders based on active tab
  const filteredOrders = orders.filter(order => {
    if (activeTab === 'all') return true;
    if (activeTab === 'open') return ['new', 'partially_filled', 'accepted', 'pending'].includes(order.status.toLowerCase());
    if (activeTab === 'filled') return order.status.toLowerCase() === 'filled';
    if (activeTab === 'canceled') return order.status.toLowerCase() === 'canceled';
    return true;
  });

  // Initialize broker service and fetch order history
  const fetchOrderHistory = async (service: BrokerService) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const orderHistory = await service.getOrderHistory();
      setOrders(orderHistory);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Failed to fetch order history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch order history');
      setIsLoading(false);
    }
  };
  
  // Initialize on component mount
  useEffect(() => {
    const initBroker = async () => {
      try {
        // Create broker service (default to mock if not specified)
        const service = BrokerFactory.createBrokerService('mock');
        
        // Connect to the service
        await service.connect();
        
        // Set broker service
        setBrokerService(service);
        
        // Fetch order history
        await fetchOrderHistory(service);
      } catch (err) {
        console.error('Failed to initialize broker service:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize broker service');
      }
    };
    
    initBroker();
  }, []);
  
  // Refresh order history
  const refreshOrders = async () => {
    if (brokerService) {
      await fetchOrderHistory(brokerService);
    }
  };
  
  // Format date string
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
        <CardDescription>
          View your recent trading orders and their status
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-4">
            <TabsList>
              <TabsTrigger value="all">All Orders</TabsTrigger>
              <TabsTrigger value="open">Open</TabsTrigger>
              <TabsTrigger value="filled">Filled</TabsTrigger>
              <TabsTrigger value="canceled">Canceled</TabsTrigger>
            </TabsList>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshOrders}
              disabled={isLoading}
            >
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>
          
          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="text-center p-6">Loading orders...</div>
            ) : filteredOrders.length === 0 ? (
              <div className="text-center p-6 bg-muted rounded-lg">
                No {activeTab === 'all' ? '' : activeTab} orders found
              </div>
            ) : (
              <div className="border rounded-lg">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted">
                      <th className="text-left p-2">Symbol</th>
                      <th className="text-center p-2">Type</th>
                      <th className="text-center p-2">Side</th>
                      <th className="text-right p-2">Quantity</th>
                      <th className="text-right p-2">Price</th>
                      <th className="text-center p-2">Status</th>
                      <th className="text-right p-2">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="border-b last:border-0">
                        <td className="p-2 font-medium">{order.symbol}</td>
                        <td className="p-2 text-center">{order.type}</td>
                        <td className={`p-2 text-center ${order.side === 'buy' ? 'text-green-600' : 'text-red-600'}`}>
                          {order.side.toUpperCase()}
                        </td>
                        <td className="p-2 text-right">
                          {order.filledQuantity}/{order.quantity}
                        </td>
                        <td className="p-2 text-right">
                          ${order.price.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="p-2 text-center">
                          <span className={`
                            px-2 py-1 text-xs rounded-full
                            ${order.status.toLowerCase() === 'filled' ? 'bg-green-100 text-green-800' : 
                              order.status.toLowerCase() === 'canceled' ? 'bg-red-100 text-red-800' : 
                              'bg-blue-100 text-blue-800'}
                          `}>
                            {order.status}
                          </span>
                        </td>
                        <td className="p-2 text-right text-sm text-muted-foreground">
                          {formatDate(order.created)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground border-t pt-4">
        <div>
          Showing {filteredOrders.length} of {orders.length} orders
        </div>
      </CardFooter>
    </Card>
  );
}