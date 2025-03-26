
import { useEffect, useState } from 'react';
import { OrderHistory } from '../../lib/services/broker-service';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge } from './badge';
import { useBrokerAggregator } from '@/lib/stores/useBrokerAggregator';
import { CircleCheck, Clock, DollarSign } from 'lucide-react';

interface OrderHistoryProps {
  orders?: OrderHistory[];
}

export function OrderHistoryView({ orders: providedOrders }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistory[]>([]);
  const { aggregator, activeBrokers } = useBrokerAggregator();

  useEffect(() => {
    // If orders are provided directly, use them
    if (providedOrders && providedOrders.length > 0) {
      setOrders(providedOrders);
      return;
    }

    // Otherwise fetch orders from all active brokers
    const fetchOrders = async () => {
      if (!aggregator) return;
      
      try {
        const allOrders: OrderHistory[] = [];
        
        // Collect orders from all active brokers
        for (const brokerId of activeBrokers) {
          const broker = aggregator.getBroker(brokerId);
          if (broker) {
            try {
              const brokerOrders = await broker.getOrderHistory();
              allOrders.push(...brokerOrders.map(order => ({
                ...order,
                broker: brokerId // Add broker information
              })));
            } catch (err) {
              console.error(`Failed to fetch orders from ${brokerId}:`, err);
            }
          }
        }
        
        // Sort by timestamp descending (newest first)
        allOrders.sort((a, b) => b.timestamp - a.timestamp);
        setOrders(allOrders);
      } catch (error) {
        console.error('Failed to fetch order history:', error);
      }
    };
    
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [aggregator, activeBrokers, providedOrders]);

  // Generate mock orders if none are available
  useEffect(() => {
    if (orders.length === 0 && !providedOrders) {
      const mockOrders: OrderHistory[] = [
        {
          orderId: 'mock-1',
          symbol: 'BTC/USD',
          side: 'buy',
          quantity: 0.25,
          price: 37650.50,
          status: 'filled',
          timestamp: Date.now() - 1000 * 60 * 15, // 15 minutes ago
          broker: 'alpaca'
        },
        {
          orderId: 'mock-2',
          symbol: 'ETH/USD',
          side: 'sell',
          quantity: 1.5,
          price: 1985.75,
          status: 'filled',
          timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
          broker: 'ironbeam'
        },
        {
          orderId: 'mock-3',
          symbol: 'EUR/USD',
          side: 'buy',
          quantity: 10000,
          price: 1.0825,
          status: 'pending',
          timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
          broker: 'oanda'
        }
      ];
      setOrders(mockOrders);
    }
  }, [orders, providedOrders]);

  // Function to get status badge
  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'filled':
        return <Badge variant="success" className="flex items-center gap-1">
          <CircleCheck className="h-3 w-3" />
          <span>Filled</span>
        </Badge>;
      case 'pending':
        return <Badge variant="outline" className="flex items-center gap-1">
          <Clock className="h-3 w-3" />
          <span>Pending</span>
        </Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center">
          <DollarSign className="h-4 w-4 mr-1" />
          Order History
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {orders.length > 0 ? (
              orders.map((order: any) => (
                <div key={order.orderId} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{order.symbol}</span>
                      {getStatusBadge(order.status)}
                    </div>
                    <Badge 
                      variant={order.side === 'buy' ? "default" : "destructive"}
                      className="uppercase"
                    >
                      {order.side}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    <div>Quantity: <span className="font-medium text-foreground">{order.quantity}</span></div>
                    <div>Price: <span className="font-medium text-foreground">{formatCurrency(order.price)}</span></div>
                    <div>Value: <span className="font-medium text-foreground">{formatCurrency(order.price * order.quantity)}</span></div>
                    <div>Date: <span className="text-foreground">{formatDate(new Date(order.timestamp))}</span></div>
                    {order.broker && (
                      <div className="col-span-2">
                        <span className="text-xs">Executed via: </span>
                        <Badge variant="outline" className="ml-1 text-xs">
                          {order.broker.charAt(0).toUpperCase() + order.broker.slice(1)}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="py-8 text-center text-muted-foreground">
                <p>No order history available</p>
                <p className="text-xs mt-1">Your executed trades will appear here</p>
              </div>
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
