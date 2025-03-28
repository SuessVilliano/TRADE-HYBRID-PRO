import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/components/ui/use-toast';
import { ApiKeyManager } from '@/components/ui/api-key-manager';
import { AiTradingSignals } from '@/components/ui/ai-trading-signals';
import { AiTradeAssistant } from '@/components/ui/ai-trade-assistant';
import { SUPPORTED_BROKERS, TRADING_SYMBOLS } from '@/lib/constants';
import { brokerAggregator, TradePosition, TradeUpdate, AccountBalance, OrderDetails } from '@/lib/services/broker-aggregator-service';
import { 
  RefreshCw, 
  BarChart, 
  LineChart, 
  ArrowRightLeft, 
  Wallet, 
  History, 
  BookOpen, 
  AlertCircle, 
  PlusCircle, 
  Info,
  ThumbsUp,
  ThumbsDown,
  Loader2
} from 'lucide-react';

// API Demo Page
export default function ApiDemoPage() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('brokers');
  const [apiKeyStatus, setApiKeyStatus] = useState(false);
  const [selectedBroker, setSelectedBroker] = useState('');
  const [loading, setLoading] = useState<{[key: string]: boolean}>({});
  const [positions, setPositions] = useState<TradePosition[]>([]);
  const [balances, setBalances] = useState<AccountBalance[]>([]);
  const [orderHistory, setOrderHistory] = useState<TradeUpdate[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  
  // Order form state
  const [orderForm, setOrderForm] = useState<OrderDetails>({
    symbol: 'BTC/USD',
    side: 'buy',
    type: 'market',
    quantity: 0.01,
  });
  
  // Handle API key status change
  const handleApiKeyStatusChange = (status: boolean) => {
    setApiKeyStatus(status);
    
    if (status && !selectedBroker && brokerAggregator.getAvailableBrokers().length > 0) {
      const firstBroker = brokerAggregator.getAvailableBrokers()[0];
      setSelectedBroker(firstBroker);
    }
  };
  
  // Handle broker selection
  const handleBrokerChange = (brokerId: string) => {
    setSelectedBroker(brokerId);
    setIsConnected(false);
  };
  
  // Connect to broker
  const handleConnect = async () => {
    if (!selectedBroker) return;
    
    setLoading(prev => ({ ...prev, connect: true }));
    
    try {
      const connected = await brokerAggregator.connectToBroker(selectedBroker);
      setIsConnected(connected);
      
      if (connected) {
        toast({
          title: "Connected successfully",
          description: `Connected to ${SUPPORTED_BROKERS.find(b => b.id === selectedBroker)?.name || selectedBroker}`,
        });
        
        // Load initial data
        await fetchBalances();
      } else {
        toast({
          title: "Connection failed",
          description: "Failed to connect to broker. Please check your API keys.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Connection error:", error);
      toast({
        title: "Connection error",
        description: "An error occurred while connecting to the broker.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, connect: false }));
    }
  };
  
  // Disconnect from broker
  const handleDisconnect = () => {
    if (!selectedBroker) return;
    
    brokerAggregator.disconnectFromBroker(selectedBroker);
    setIsConnected(false);
    
    toast({
      title: "Disconnected",
      description: `Disconnected from ${SUPPORTED_BROKERS.find(b => b.id === selectedBroker)?.name || selectedBroker}`,
    });
  };
  
  // Fetch account balances
  const fetchBalances = async () => {
    if (!selectedBroker || !isConnected) return;
    
    setLoading(prev => ({ ...prev, balances: true }));
    
    try {
      const data = await brokerAggregator.getAccountBalances(selectedBroker);
      setBalances(data);
    } catch (error) {
      console.error("Error fetching balances:", error);
      toast({
        title: "Error",
        description: "Failed to fetch account balances.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, balances: false }));
    }
  };
  
  // Fetch positions
  const fetchPositions = async () => {
    if (!selectedBroker || !isConnected) return;
    
    setLoading(prev => ({ ...prev, positions: true }));
    
    try {
      const data = await brokerAggregator.getPositions(selectedBroker);
      setPositions(data);
    } catch (error) {
      console.error("Error fetching positions:", error);
      toast({
        title: "Error",
        description: "Failed to fetch positions.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, positions: false }));
    }
  };
  
  // Fetch order history
  const fetchOrderHistory = async () => {
    if (!selectedBroker || !isConnected) return;
    
    setLoading(prev => ({ ...prev, orders: true }));
    
    try {
      const data = await brokerAggregator.getOrderHistory(selectedBroker);
      setOrderHistory(data);
    } catch (error) {
      console.error("Error fetching order history:", error);
      toast({
        title: "Error",
        description: "Failed to fetch order history.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, orders: false }));
    }
  };
  
  // Place order
  const handlePlaceOrder = async () => {
    if (!selectedBroker || !isConnected) return;
    
    setLoading(prev => ({ ...prev, order: true }));
    
    try {
      const result = await brokerAggregator.placeOrder(selectedBroker, orderForm);
      
      toast({
        title: "Order placed",
        description: `${orderForm.side.toUpperCase()} order for ${orderForm.quantity} ${orderForm.symbol} executed at ${result.price?.toFixed(2)}`,
      });
      
      // Refresh data
      fetchBalances();
      fetchPositions();
      fetchOrderHistory();
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Order error",
        description: "Failed to place order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(prev => ({ ...prev, order: false }));
    }
  };
  
  // Update order form
  const updateOrderForm = (field: keyof OrderDetails, value: any) => {
    setOrderForm(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Format currency numbers
  const formatCurrency = (value: number, decimals: number = 2) => {
    return value < 0.01 && value > 0 
      ? value.toFixed(8) 
      : value.toFixed(decimals);
  };
  
  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">API Integration Demo</h1>
        <p className="text-muted-foreground mt-2">
          Test broker connections, AI trading signals, and voice-controlled trading
        </p>
      </div>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <div className="flex justify-between items-center">
          <TabsList>
            <TabsTrigger value="brokers" className="flex items-center gap-1">
              <ArrowRightLeft className="h-4 w-4" />
              Broker Integration
            </TabsTrigger>
            <TabsTrigger value="signals" className="flex items-center gap-1">
              <BarChart className="h-4 w-4" />
              AI Signals
            </TabsTrigger>
            <TabsTrigger value="assistant" className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              Voice Assistant
            </TabsTrigger>
          </TabsList>
        </div>
        
        {/* Broker Integration Tab */}
        <TabsContent value="brokers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-1">
              <ApiKeyManager
                onValidStatusChange={handleApiKeyStatusChange}
                defaultBroker={selectedBroker}
              />
            </div>
            
            <div className="md:col-span-2 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ArrowRightLeft className="h-5 w-5" />
                    Broker Connection
                  </CardTitle>
                  <CardDescription>
                    Connect to your broker and manage your trading account
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="broker-select">Select Broker</Label>
                      <Select 
                        value={selectedBroker} 
                        onValueChange={handleBrokerChange}
                        disabled={!apiKeyStatus || brokerAggregator.getAvailableBrokers().length === 0}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Choose a broker" />
                        </SelectTrigger>
                        <SelectContent>
                          {brokerAggregator.getAvailableBrokers().map(brokerId => {
                            const broker = SUPPORTED_BROKERS.find(b => b.id === brokerId);
                            return (
                              <SelectItem key={brokerId} value={brokerId}>
                                {broker?.name || brokerId}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {!apiKeyStatus ? (
                      <div className="border rounded-md p-4 text-center bg-muted/30">
                        <Info className="h-8 w-8 mx-auto mb-2 text-muted-foreground opacity-50" />
                        <p className="text-sm text-muted-foreground">
                          Configure your API keys in the panel to the left to connect to a broker.
                        </p>
                      </div>
                    ) : brokerAggregator.getAvailableBrokers().length === 0 ? (
                      <div className="border rounded-md p-4 text-center bg-muted/30">
                        <AlertCircle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
                        <p className="text-sm text-muted-foreground">
                          No broker API keys configured. Add API keys in the panel to the left.
                        </p>
                      </div>
                    ) : null}
                    
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        onClick={handleDisconnect}
                        disabled={!selectedBroker || !isConnected}
                      >
                        Disconnect
                      </Button>
                      <Button
                        onClick={handleConnect}
                        disabled={!selectedBroker || isConnected || loading.connect}
                      >
                        {loading.connect ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Connecting...
                          </>
                        ) : (
                          'Connect'
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {selectedBroker && isConnected && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Trading Interface</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="balances">
                      <TabsList className="grid grid-cols-4 mb-4">
                        <TabsTrigger value="balances" className="flex items-center gap-1">
                          <Wallet className="h-3.5 w-3.5" />
                          Balances
                        </TabsTrigger>
                        <TabsTrigger value="positions" className="flex items-center gap-1">
                          <LineChart className="h-3.5 w-3.5" />
                          Positions
                        </TabsTrigger>
                        <TabsTrigger value="orders" className="flex items-center gap-1">
                          <History className="h-3.5 w-3.5" />
                          Orders
                        </TabsTrigger>
                        <TabsTrigger value="new-order" className="flex items-center gap-1">
                          <PlusCircle className="h-3.5 w-3.5" />
                          New Order
                        </TabsTrigger>
                      </TabsList>
                      
                      {/* Balances Tab */}
                      <TabsContent value="balances">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">Account Balances</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchBalances}
                            disabled={loading.balances}
                          >
                            {loading.balances ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {balances.length > 0 ? (
                              balances.map((balance, index) => (
                                <div 
                                  key={index} 
                                  className={`border rounded-md p-3 flex justify-between ${
                                    balance.total > 0 ? 'border-green-200 bg-green-50 dark:bg-green-950/20' : ''
                                  }`}
                                >
                                  <div>
                                    <div className="font-medium">{balance.asset}</div>
                                    <div className="text-xs text-muted-foreground">
                                      Available: {formatCurrency(balance.free)}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="font-medium">
                                      {formatCurrency(balance.total)}
                                    </div>
                                    {balance.locked > 0 && (
                                      <div className="text-xs text-muted-foreground">
                                        Locked: {formatCurrency(balance.locked)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                {loading.balances ? (
                                  <p>Loading balances...</p>
                                ) : (
                                  <p>No balance data available. Click Refresh to load data.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      {/* Positions Tab */}
                      <TabsContent value="positions">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">Open Positions</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchPositions}
                            disabled={loading.positions}
                          >
                            {loading.positions ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {positions.length > 0 ? (
                              positions.map((position, index) => (
                                <div 
                                  key={index} 
                                  className={`border rounded-md p-3 ${
                                    position.unrealizedPnl > 0 
                                      ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
                                      : position.unrealizedPnl < 0
                                        ? 'border-red-200 bg-red-50 dark:bg-red-950/20'
                                        : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                        position.side === 'long' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                        {position.side}
                                      </div>
                                      <div className="font-medium">{position.symbol}</div>
                                    </div>
                                    <div className={`font-medium ${
                                      position.unrealizedPnl > 0 
                                        ? 'text-green-600' 
                                        : position.unrealizedPnl < 0
                                          ? 'text-red-600'
                                          : ''
                                    }`}>
                                      {position.unrealizedPnl > 0 ? '+' : ''}
                                      {formatCurrency(position.unrealizedPnl)}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Size:</span>
                                      <span className="font-mono">{formatCurrency(position.size, 8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Mark Price:</span>
                                      <span className="font-mono">{formatCurrency(position.markPrice)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Entry Price:</span>
                                      <span className="font-mono">{formatCurrency(position.entryPrice)}</span>
                                    </div>
                                    {position.leverage && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Leverage:</span>
                                        <span className="font-mono">{position.leverage}x</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                {loading.positions ? (
                                  <p>Loading positions...</p>
                                ) : (
                                  <p>No open positions. Click Refresh to load data.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      {/* Orders Tab */}
                      <TabsContent value="orders">
                        <div className="flex justify-between items-center mb-4">
                          <h3 className="text-sm font-medium">Order History</h3>
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={fetchOrderHistory}
                            disabled={loading.orders}
                          >
                            {loading.orders ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            ) : (
                              <RefreshCw className="h-3.5 w-3.5" />
                            )}
                          </Button>
                        </div>
                        <ScrollArea className="h-[300px]">
                          <div className="space-y-2">
                            {orderHistory.length > 0 ? (
                              orderHistory.map((order, index) => (
                                <div 
                                  key={index} 
                                  className={`border rounded-md p-3 ${
                                    order.status === 'filled' 
                                      ? 'border-green-200 bg-green-50 dark:bg-green-950/20' 
                                      : order.status === 'rejected' || order.status === 'canceled'
                                        ? 'border-red-200 bg-red-50 dark:bg-red-950/20'
                                        : ''
                                  }`}
                                >
                                  <div className="flex justify-between items-center mb-2">
                                    <div className="flex items-center gap-2">
                                      <div className={`px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                                        order.side === 'buy' 
                                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                                      }`}>
                                        {order.side}
                                      </div>
                                      <div className="font-medium">{order.symbol}</div>
                                    </div>
                                    <div className="text-xs px-1.5 py-0.5 bg-muted rounded">
                                      {order.status.replace('_', ' ')}
                                    </div>
                                  </div>
                                  <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Quantity:</span>
                                      <span className="font-mono">{formatCurrency(order.quantity, 8)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Price:</span>
                                      <span className="font-mono">{formatCurrency(order.price)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-muted-foreground">Date:</span>
                                      <span>
                                        {new Date(order.timestamp).toLocaleString()}
                                      </span>
                                    </div>
                                    {order.fee && (
                                      <div className="flex justify-between">
                                        <span className="text-muted-foreground">Fee:</span>
                                        <span className="font-mono">{formatCurrency(order.fee, 8)}</span>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-8 text-muted-foreground">
                                {loading.orders ? (
                                  <p>Loading order history...</p>
                                ) : (
                                  <p>No order history available. Click Refresh to load data.</p>
                                )}
                              </div>
                            )}
                          </div>
                        </ScrollArea>
                      </TabsContent>
                      
                      {/* New Order Tab */}
                      <TabsContent value="new-order">
                        <div className="space-y-4">
                          <div>
                            <Label htmlFor="symbol">Trading Symbol</Label>
                            <Select 
                              value={orderForm.symbol} 
                              onValueChange={(value) => updateOrderForm('symbol', value)}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select Symbol" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="BTC/USD">BTC/USD (Bitcoin)</SelectItem>
                                <SelectItem value="ETH/USD">ETH/USD (Ethereum)</SelectItem>
                                <SelectItem value="SOL/USD">SOL/USD (Solana)</SelectItem>
                                <SelectItem value="EUR/USD">EUR/USD (Euro/Dollar)</SelectItem>
                                <SelectItem value="AAPL">AAPL (Apple Inc.)</SelectItem>
                                <SelectItem value="MSFT">MSFT (Microsoft)</SelectItem>
                                <SelectItem value="TSLA">TSLA (Tesla)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <Label htmlFor="side">Trade Side</Label>
                              <Select 
                                value={orderForm.side} 
                                onValueChange={(value) => updateOrderForm('side', value as 'buy' | 'sell')}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Side" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="buy">Buy</SelectItem>
                                  <SelectItem value="sell">Sell</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            
                            <div>
                              <Label htmlFor="type">Order Type</Label>
                              <Select 
                                value={orderForm.type} 
                                onValueChange={(value) => updateOrderForm('type', value as OrderDetails['type'])}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Type" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="market">Market</SelectItem>
                                  <SelectItem value="limit">Limit</SelectItem>
                                  <SelectItem value="stop">Stop</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label htmlFor="quantity">Quantity</Label>
                            <Input 
                              id="quantity"
                              type="number" 
                              step="0.01"
                              min="0.01"
                              value={orderForm.quantity}
                              onChange={(e) => updateOrderForm('quantity', parseFloat(e.target.value))}
                            />
                          </div>
                          
                          {orderForm.type !== 'market' && (
                            <div className="space-y-2">
                              <Label htmlFor="price">Price</Label>
                              <Input 
                                id="price"
                                type="number" 
                                step="0.01"
                                min="0.01"
                                value={orderForm.price || ''}
                                onChange={(e) => updateOrderForm('price', parseFloat(e.target.value))}
                              />
                            </div>
                          )}
                          
                          {orderForm.type === 'stop' && (
                            <div className="space-y-2">
                              <Label htmlFor="stopPrice">Stop Price</Label>
                              <Input 
                                id="stopPrice"
                                type="number" 
                                step="0.01"
                                min="0.01"
                                value={orderForm.stopPrice || ''}
                                onChange={(e) => updateOrderForm('stopPrice', parseFloat(e.target.value))}
                              />
                            </div>
                          )}
                          
                          <Button 
                            className="w-full mt-2"
                            onClick={handlePlaceOrder}
                            disabled={loading.order}
                          >
                            {loading.order ? (
                              <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Processing...
                              </>
                            ) : (
                              <>Place Order</>
                            )}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>
        
        {/* AI Signals Tab */}
        <TabsContent value="signals">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>AI Trading Signals</CardTitle>
                  <CardDescription>
                    AI-powered trade ideas with entry, exit and risk management levels
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-0">
                  <div className="mb-8">
                    <AiTradingSignals 
                      apiKeyStatus={apiKeyStatus} 
                      showHeader={false}
                    />
                  </div>
                  
                  <div className="border-t pt-4 pb-2">
                    <h3 className="font-medium mb-2">Signal Feedback</h3>
                    <div className="flex items-center gap-4">
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful
                      </Button>
                      <Button variant="outline" size="sm" className="flex items-center gap-1">
                        <ThumbsDown className="h-4 w-4" />
                        Not Helpful
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* AI Assistant Tab */}
        <TabsContent value="assistant">
          <div className="max-w-4xl mx-auto">
            <AiTradeAssistant apiKeyStatus={apiKeyStatus} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}