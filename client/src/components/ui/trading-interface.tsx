import { useState, useEffect } from 'react';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { 
  BrokerService, 
  BrokerPosition, 
  AccountBalance, 
  OrderHistory,
  MarketData
} from '@/lib/services/broker-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Predefined list of popular stocks
const popularStocks = [
  { symbol: 'AAPL', name: 'Apple Inc.' },
  { symbol: 'MSFT', name: 'Microsoft Corp.' },
  { symbol: 'AMZN', name: 'Amazon.com Inc.' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.' },
  { symbol: 'META', name: 'Meta Platforms Inc.' },
  { symbol: 'TSLA', name: 'Tesla Inc.' },
  { symbol: 'NVDA', name: 'NVIDIA Corp.' },
  { symbol: 'JPM', name: 'JPMorgan Chase & Co.' },
  { symbol: 'V', name: 'Visa Inc.' },
  { symbol: 'JNJ', name: 'Johnson & Johnson' },
];

export function TradingInterface() {
  const [brokerService, setBrokerService] = useState<BrokerService | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [positions, setPositions] = useState<BrokerPosition[]>([]);
  const [accountBalance, setAccountBalance] = useState<AccountBalance | null>(null);
  const [orderHistory, setOrderHistory] = useState<OrderHistory[]>([]);
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL');
  const [quantity, setQuantity] = useState(1);
  const [orderType, setOrderType] = useState<'market' | 'limit'>('market');
  const [limitPrice, setLimitPrice] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Connect to broker service on component mount
  useEffect(() => {
    const initBrokerService = async () => {
      try {
        // Create broker service - will use mock or real based on environment setting
        const service = BrokerFactory.createBrokerService('alpaca');
        setBrokerService(service);
        
        await service.connect();
        setIsConnected(true);
        
        // Load initial data
        await fetchAccountData(service);
      } catch (err) {
        console.error('Failed to connect to broker service:', err);
        setError('Failed to connect to broker service. Please check your settings.');
      }
    };
    
    initBrokerService();
    
    // Clean up subscriptions when component unmounts
    return () => {
      if (brokerService && selectedSymbol) {
        brokerService.unsubscribeFromMarketData(selectedSymbol);
      }
    };
  }, []);
  
  // Subscribe to market data when symbol changes
  useEffect(() => {
    if (!brokerService || !isConnected || !selectedSymbol) return;
    
    // Clear existing data
    setMarketData([]);
    setCurrentPrice(null);
    
    // Unsubscribe from previous symbol
    brokerService.unsubscribeFromMarketData(selectedSymbol);
    
    // Subscribe to new symbol
    brokerService.subscribeToMarketData(selectedSymbol, (data) => {
      setCurrentPrice(data.price);
      setMarketData(prev => {
        const newData = [...prev, data];
        // Keep only the last 30 data points
        if (newData.length > 30) {
          return newData.slice(newData.length - 30);
        }
        return newData;
      });
    });
    
  }, [brokerService, isConnected, selectedSymbol]);
  
  // Fetch account data (balance, positions, orders)
  const fetchAccountData = async (service: BrokerService) => {
    try {
      setIsLoading(true);
      
      // Get account balance
      const balance = await service.getBalance();
      setAccountBalance(balance);
      
      // Get positions
      const positionsData = await service.getPositions();
      setPositions(positionsData);
      
      // Get order history
      const orderData = await service.getOrderHistory();
      setOrderHistory(orderData);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching account data:', err);
      setError('Failed to fetch account data.');
      setIsLoading(false);
    }
  };
  
  // Handle placing an order
  const placeOrder = async (side: 'buy' | 'sell') => {
    if (!brokerService || !isConnected) {
      setError('Not connected to broker service.');
      return;
    }
    
    if (quantity <= 0) {
      setError('Quantity must be greater than zero.');
      return;
    }
    
    if (orderType === 'limit' && limitPrice <= 0) {
      setError('Limit price must be greater than zero.');
      return;
    }
    
    try {
      setIsLoading(true);
      setError(null);
      setSuccess(null);
      
      const order = {
        symbol: selectedSymbol,
        side,
        quantity,
        type: orderType,
        limitPrice: orderType === 'limit' ? limitPrice : undefined
      };
      
      const orderId = await brokerService.placeOrder(order);
      
      setSuccess(`Order placed successfully. Order ID: ${orderId}`);
      
      // Refresh account data
      await fetchAccountData(brokerService);
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error placing order:', err);
      setError('Failed to place order. Please try again.');
      setIsLoading(false);
    }
  };
  
  // Calculate chart data from market data
  const getChartData = () => {
    return marketData.map(data => ({
      time: new Date(data.timestamp).toLocaleTimeString(),
      price: data.price,
    }));
  };
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Trading Interface</CardTitle>
          <CardDescription>
            Place trades and monitor your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {success && (
            <Alert className="mb-4">
              <AlertTitle>Success</AlertTitle>
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          
          <Tabs defaultValue="trade" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trade">Trade</TabsTrigger>
              <TabsTrigger value="positions">Positions</TabsTrigger>
              <TabsTrigger value="history">Order History</TabsTrigger>
            </TabsList>
            
            <TabsContent value="trade">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="symbol">Symbol</Label>
                  <Select 
                    defaultValue={selectedSymbol}
                    onValueChange={setSelectedSymbol}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a stock" />
                    </SelectTrigger>
                    <SelectContent>
                      {popularStocks.map(stock => (
                        <SelectItem key={stock.symbol} value={stock.symbol}>
                          {stock.symbol} - {stock.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={getChartData()}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="time" />
                      <YAxis domain={['auto', 'auto']} />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="price" 
                        stroke="#8884d8" 
                        activeDot={{ r: 8 }} 
                        isAnimationActive={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="quantity">Quantity</Label>
                    <Input 
                      id="quantity"
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      min={1}
                    />
                  </div>
                  <div>
                    <Label htmlFor="orderType">Order Type</Label>
                    <Select 
                      defaultValue={orderType}
                      onValueChange={(value) => setOrderType(value as 'market' | 'limit')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select order type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="market">Market</SelectItem>
                        <SelectItem value="limit">Limit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {orderType === 'limit' && (
                  <div>
                    <Label htmlFor="limitPrice">Limit Price</Label>
                    <Input 
                      id="limitPrice"
                      type="number"
                      value={limitPrice}
                      onChange={(e) => setLimitPrice(Number(e.target.value))}
                      min={0.01}
                      step={0.01}
                    />
                  </div>
                )}
                
                <div className="flex justify-between space-x-4 mt-6">
                  <Button 
                    onClick={() => placeOrder('buy')} 
                    disabled={isLoading || !isConnected}
                    className="w-full bg-green-600 hover:bg-green-700"
                  >
                    Buy
                  </Button>
                  <Button 
                    onClick={() => placeOrder('sell')} 
                    disabled={isLoading || !isConnected}
                    className="w-full bg-red-600 hover:bg-red-700"
                  >
                    Sell
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="positions">
              <div>
                {accountBalance && (
                  <div className="mb-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-muted-foreground">Total</div>
                        <div className="text-xl font-bold">${accountBalance.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Cash</div>
                        <div className="text-xl font-bold">${accountBalance.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      <div>
                        <div className="text-sm text-muted-foreground">Positions</div>
                        <div className="text-xl font-bold">${accountBalance.positions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                  </div>
                )}
                
                <Table>
                  <TableCaption>Your current positions</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Symbol</TableHead>
                      <TableHead>Quantity</TableHead>
                      <TableHead>Avg. Price</TableHead>
                      <TableHead>Current Price</TableHead>
                      <TableHead>P&L</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {positions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center">No positions found</TableCell>
                      </TableRow>
                    ) : (
                      positions.map((position) => (
                        <TableRow key={position.symbol}>
                          <TableCell className="font-medium">{position.symbol}</TableCell>
                          <TableCell>{position.quantity}</TableCell>
                          <TableCell>${position.averagePrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell>${position.currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                          <TableCell className={position.pnl >= 0 ? 'text-green-600' : 'text-red-600'}>
                            ${position.pnl.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
            
            <TabsContent value="history">
              <Table>
                <TableCaption>Your order history</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Symbol</TableHead>
                    <TableHead>Side</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderHistory.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">No orders found</TableCell>
                    </TableRow>
                  ) : (
                    orderHistory.map((order) => (
                      <TableRow key={order.orderId}>
                        <TableCell className="font-medium">{order.symbol}</TableCell>
                        <TableCell className={order.side === 'buy' ? 'text-green-600' : 'text-red-600'}>
                          {order.side.toUpperCase()}
                        </TableCell>
                        <TableCell>{order.quantity}</TableCell>
                        <TableCell>${order.price.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</TableCell>
                        <TableCell>{order.status.toUpperCase()}</TableCell>
                        <TableCell>{new Date(order.timestamp).toLocaleString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div>
            {currentPrice && `Current Price (${selectedSymbol}): $${currentPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`}
          </div>
          <div>
            <Button 
              variant="outline" 
              onClick={() => brokerService && fetchAccountData(brokerService)}
              disabled={isLoading || !isConnected}
            >
              Refresh
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}