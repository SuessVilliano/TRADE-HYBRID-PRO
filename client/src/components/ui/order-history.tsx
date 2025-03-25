
import { useEffect, useState } from 'react';
import { OrderHistory } from '../../lib/services/broker-service';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { ScrollArea } from './scroll-area';

interface OrderHistoryProps {
  broker: any;
}

export function OrderHistoryView({ broker }: OrderHistoryProps) {
  const [orders, setOrders] = useState<OrderHistory[]>([]);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const history = await broker.getOrderHistory();
        setOrders(history);
      } catch (error) {
        console.error('Failed to fetch order history:', error);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 30000);
    return () => clearInterval(interval);
  }, [broker]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order History</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <div className="space-y-2">
            {orders.map((order) => (
              <div key={order.orderId} className="p-2 bg-muted/50 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="font-medium">{order.symbol}</span>
                  <span className={order.side === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {order.side.toUpperCase()}
                  </span>
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  <div>Quantity: {order.quantity}</div>
                  <div>Price: ${order.price.toFixed(2)}</div>
                  <div>Status: {order.status}</div>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
