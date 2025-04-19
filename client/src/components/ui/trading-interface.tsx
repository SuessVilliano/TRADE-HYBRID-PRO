import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { BrokerService } from '@/lib/services/broker-service';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, AlertCircle, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, formatNumber } from '@/lib/utils/format-utils';

// Form values interface
interface TradeFormValues {
  symbol: string;
  side: 'buy' | 'sell';
  quantity: number;
  type: 'market' | 'limit';
  limitPrice?: number;
}

export function TradingInterface() {
  const [brokerService, setBrokerService] = useState<BrokerService | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [accountInfo, setAccountInfo] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tradeStatus, setTradeStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [tradeResult, setTradeResult] = useState<any | null>(null);
  const [activeTab, setActiveTab] = useState('trade');
  
  // Initialize form
  const form = useForm<TradeFormValues>({
    defaultValues: {
      symbol: '',
      side: 'buy',
      quantity: 1,
      type: 'market',
      limitPrice: undefined
    }
  });
  
  const watchType = form.watch('type');
  
  // Initialize broker service on mount
  useEffect(() => {
    const initBroker = async () => {
      try {
        setIsLoading(true);
        
        // Create broker service (default to mock if not specified)
        const service = BrokerFactory.createBrokerService('mock');
        
        // Connect to the service
        await service.connect();
        
        // Set broker service state
        setBrokerService(service);
        
        // Load account info
        const info = await service.getAccountInfo();
        setAccountInfo(info);
        
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to initialize broker service:', err);
        setError(err instanceof Error ? err.message : 'Failed to initialize broker service');
        setIsLoading(false);
      }
    };
    
    initBroker();
    
    // Cleanup on unmount
    return () => {
      // Cleanup code if needed
    };
  }, []);
  
  // Handle form submission (place trade)
  const onSubmit = async (values: TradeFormValues) => {
    if (!brokerService) {
      setError('Broker service not initialized');
      return;
    }
    
    try {
      setTradeStatus('loading');
      setError(null);
      
      // Format the order
      const order = {
        symbol: values.symbol.toUpperCase(),
        side: values.side,
        quantity: values.quantity,
        type: values.type,
        timeInForce: 'day',
        limit_price: values.type === 'limit' ? values.limitPrice : undefined
      };
      
      // Place the order
      const result = await brokerService.placeOrder(order);
      
      // Update state with result
      setTradeResult(result);
      setTradeStatus('success');
      
      // Refresh account info
      const info = await brokerService.getAccountInfo();
      setAccountInfo(info);
      
      // Reset form
      form.reset();
    } catch (err) {
      console.error('Trade execution failed:', err);
      setTradeStatus('error');
      setError(err instanceof Error ? err.message : 'Trade execution failed');
    }
  };
  
  // Handle symbol validation
  const validateSymbol = (value: string) => {
    return /^[A-Za-z]{1,5}$/.test(value) || 'Symbol must be 1-5 letters';
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Trading Interface</CardTitle>
        <CardDescription>
          Place trades and manage your positions
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
            <TabsTrigger value="trade">Trade</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>
          
          <TabsContent value="trade">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {/* Symbol */}
                <FormField
                  control={form.control}
                  name="symbol"
                  rules={{ 
                    required: 'Symbol is required',
                    validate: validateSymbol
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Symbol</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="AAPL" 
                          className="uppercase"
                          disabled={isLoading || tradeStatus === 'loading'}
                        />
                      </FormControl>
                      <FormDescription>
                        Enter the ticker symbol for the stock (e.g., AAPL, MSFT)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Side */}
                <FormField
                  control={form.control}
                  name="side"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Side</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading || tradeStatus === 'loading'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select buy or sell" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="buy">Buy</SelectItem>
                          <SelectItem value="sell">Sell</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Choose whether to buy or sell
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Quantity */}
                <FormField
                  control={form.control}
                  name="quantity"
                  rules={{ 
                    required: 'Quantity is required',
                    min: { value: 1, message: 'Quantity must be at least 1' },
                    pattern: { value: /^[0-9]+$/, message: 'Quantity must be a whole number' }
                  }}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          {...field}
                          type="number"
                          min={1}
                          step={1}
                          disabled={isLoading || tradeStatus === 'loading'}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            field.onChange(isNaN(value) ? '' : value);
                          }}
                        />
                      </FormControl>
                      <FormDescription>
                        Number of shares to trade
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Order Type */}
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Type</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        defaultValue={field.value}
                        disabled={isLoading || tradeStatus === 'loading'}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select order type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="market">Market</SelectItem>
                          <SelectItem value="limit">Limit</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Market orders execute immediately at the current price, limit orders execute at your specified price or better
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {/* Limit Price (conditional) */}
                {watchType === 'limit' && (
                  <FormField
                    control={form.control}
                    name="limitPrice"
                    rules={{ 
                      required: 'Limit price is required for limit orders',
                      min: { value: 0.01, message: 'Price must be at least 0.01' }
                    }}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Limit Price</FormLabel>
                        <FormControl>
                          <Input 
                            {...field}
                            type="number"
                            min={0.01}
                            step={0.01}
                            disabled={isLoading || tradeStatus === 'loading'}
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              field.onChange(isNaN(value) ? '' : value);
                            }}
                          />
                        </FormControl>
                        <FormDescription>
                          The maximum price for buy orders or minimum price for sell orders
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {/* Submit Button */}
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={isLoading || tradeStatus === 'loading'} 
                >
                  {tradeStatus === 'loading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Executing Trade...
                    </>
                  ) : (
                    'Place Trade'
                  )}
                </Button>
              </form>
            </Form>
            
            {/* Trade Result */}
            {tradeStatus === 'success' && tradeResult && (
              <Alert className="mt-4">
                <TrendingUp className="h-4 w-4" />
                <AlertTitle>Trade Executed</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    <div>
                      <span className="font-semibold">Order ID:</span> {tradeResult.id}
                    </div>
                    <div>
                      <span className="font-semibold">Symbol:</span> {tradeResult.symbol}
                    </div>
                    <div>
                      <span className="font-semibold">Side:</span> {' '}
                      <Badge variant={tradeResult.side === 'buy' ? 'default' : 'destructive'}>
                        {tradeResult.side.toUpperCase()}
                      </Badge>
                    </div>
                    <div>
                      <span className="font-semibold">Quantity:</span> {tradeResult.quantity}
                    </div>
                    <div>
                      <span className="font-semibold">Status:</span> {' '}
                      <Badge variant="outline">{tradeResult.status}</Badge>
                    </div>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="account">
            {isLoading ? (
              <div className="flex justify-center items-center py-10">
                <Loader2 className="h-10 w-10 animate-spin text-muted-foreground" />
              </div>
            ) : accountInfo ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Account Value</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(accountInfo.portfolio_value)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Total account value
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Cash Balance</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(accountInfo.cash)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Available for trading
                    </p>
                  </div>
                  
                  <div className="bg-card rounded-lg border p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-sm font-medium">Buying Power</h3>
                    </div>
                    <p className="text-2xl font-bold">
                      {formatCurrency(accountInfo.buying_power)}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Maximum you can spend
                    </p>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">Account Details</h3>
                  <div className="bg-card rounded-lg border overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 p-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Account ID</p>
                        <p className="font-medium">{accountInfo.id}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Status</p>
                        <Badge variant={accountInfo.status === 'ACTIVE' ? 'default' : 'outline'}>
                          {accountInfo.status}
                        </Badge>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Currency</p>
                        <p className="font-medium">{accountInfo.currency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Pattern Day Trader</p>
                        <p className="font-medium">{accountInfo.pattern_day_trader ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Trading Blocked</p>
                        <p className="font-medium">{accountInfo.trading_blocked ? 'Yes' : 'No'}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Account Blocked</p>
                        <p className="font-medium">{accountInfo.account_blocked ? 'Yes' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-card rounded-lg border p-6 text-center">
                <p className="text-muted-foreground">No account information available</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground flex justify-between items-center border-t pt-4">
        <div>
          Using {brokerService ? 'mock' : 'loading...'} broker service
        </div>
        <div>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </CardFooter>
    </Card>
  );
}