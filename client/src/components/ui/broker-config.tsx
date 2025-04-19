import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { config } from '@/lib/config';
import { BrokerFactory } from '@/lib/services/broker-factory';
import { BrokerService } from '@/lib/services/broker-service';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Form } from '@/components/ui/form';

// Form interface
interface BrokerFormValues {
  alpacaApiKey: string;
  alpacaApiSecret: string;
  usePaperTrading: boolean;
}

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function BrokerConfig() {
  const [useMockService, setUseMockService] = useState<boolean>(config.USE_MOCK_SERVICE === 'true');
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [brokerService, setBrokerService] = useState<BrokerService | null>(null);
  const [accountBalance, setAccountBalance] = useState<{total: number, cash: number, positions: number} | null>(null);

  // Initialize form with default values
  const form = useForm<BrokerFormValues>({
    defaultValues: {
      alpacaApiKey: config.ALPACA_API_KEY || '',
      alpacaApiSecret: config.ALPACA_API_SECRET || '',
      usePaperTrading: true,
    },
  });

  // Handle form submission
  const onSubmit = async (values: BrokerFormValues) => {
    try {
      setConnectionStatus('connecting');
      setErrorMessage(null);
      
      // Create broker service based on form values
      const service = BrokerFactory.createBrokerService('alpaca');
      setBrokerService(service);
      
      // Connect to the service
      await service.connect();
      
      // Get account balance
      const balance = await service.getBalance();
      setAccountBalance(balance);
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Toggle between mock and real service
  const toggleMockService = () => {
    const newValue = !useMockService;
    setUseMockService(newValue);
    
    // Reset connection status
    setConnectionStatus('disconnected');
    setBrokerService(null);
    setAccountBalance(null);
    
    // Save to localStorage for persistence
    localStorage.setItem('useMockService', newValue.toString());
  };

  // Connect using mock service
  const connectMockService = async () => {
    try {
      setConnectionStatus('connecting');
      setErrorMessage(null);
      
      // Create mock broker service
      const service = BrokerFactory.createBrokerService('mock');
      setBrokerService(service);
      
      // Connect to the service
      await service.connect();
      
      // Get account balance
      const balance = await service.getBalance();
      setAccountBalance(balance);
      
      setConnectionStatus('connected');
    } catch (error) {
      console.error('Mock service connection error:', error);
      setConnectionStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred');
    }
  };

  // Auto-connect on component mount if using mock service
  useEffect(() => {
    if (useMockService) {
      connectMockService();
    }
  }, [useMockService]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Broker Connection</CardTitle>
          <CardDescription>
            Configure your broker connection to trade with real or simulated data
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2 mb-6">
            <Switch
              id="mock-switch"
              checked={useMockService}
              onCheckedChange={toggleMockService}
            />
            <Label htmlFor="mock-switch">
              Use Mock Service {useMockService ? 
                <Badge variant="outline" className="ml-2">Enabled</Badge> : 
                <Badge variant="outline" className="ml-2">Disabled</Badge>
              }
            </Label>
          </div>
          
          {connectionStatus === 'error' && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Connection Error</AlertTitle>
              <AlertDescription>{errorMessage || 'Could not connect to broker service'}</AlertDescription>
            </Alert>
          )}
          
          {connectionStatus === 'connected' && (
            <Alert className="mb-4">
              <AlertTitle>Connected {useMockService && '(Mock)'}</AlertTitle>
              <AlertDescription>
                Successfully connected to {useMockService ? 'mock' : 'real'} broker service.
                {accountBalance && (
                  <div className="mt-2">
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="font-semibold">Total</div>
                        <div className="text-lg">${accountBalance.total.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Cash</div>
                        <div className="text-lg">${accountBalance.cash.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                      <div>
                        <div className="font-semibold">Positions</div>
                        <div className="text-lg">${accountBalance.positions.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
                      </div>
                    </div>
                  </div>
                )}
              </AlertDescription>
            </Alert>
          )}
          
          {!useMockService && (
            <Tabs defaultValue="alpaca" className="w-full">
              <TabsList className="grid w-full grid-cols-1">
                <TabsTrigger value="alpaca">Alpaca Trading API</TabsTrigger>
              </TabsList>
              <TabsContent value="alpaca">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="alpacaApiKey"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Key</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Your Alpaca API Key" />
                          </FormControl>
                          <FormDescription>
                            Alpaca Trading API Key (starts with PK)
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="alpacaApiSecret"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>API Secret</FormLabel>
                          <FormControl>
                            <Input {...field} type="password" placeholder="Your Alpaca API Secret" />
                          </FormControl>
                          <FormDescription>
                            Keep your API secret secure
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="usePaperTrading"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                          <div className="space-y-0.5">
                            <FormLabel>Paper Trading</FormLabel>
                            <FormDescription>
                              Use paper trading (simulation) rather than live trading
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      disabled={connectionStatus === 'connecting'}
                      className="w-full"
                    >
                      {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect'}
                    </Button>
                  </form>
                </Form>
              </TabsContent>
            </Tabs>
          )}
          
          {useMockService && connectionStatus !== 'connected' && (
            <Button 
              onClick={connectMockService} 
              disabled={connectionStatus === 'connecting'}
              className="w-full"
            >
              {connectionStatus === 'connecting' ? 'Connecting...' : 'Connect to Mock Service'}
            </Button>
          )}
          
        </CardContent>
        <CardFooter className="flex justify-between text-sm text-gray-500">
          <div>Status: {
            connectionStatus === 'connected' ? 'Connected' : 
            connectionStatus === 'connecting' ? 'Connecting...' : 
            connectionStatus === 'error' ? 'Error' : 'Disconnected'
          }</div>
          <div>{useMockService ? 'Using simulated data' : 'Using real API connection'}</div>
        </CardFooter>
      </Card>
    </div>
  );
}