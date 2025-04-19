import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AlertCircle, Check, Key, Lock, RefreshCw } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "../ui/alert";

// Validation schemas for different brokers
const alpacaSchema = z.object({
  apiKey: z.string().min(1, "API Key is required"),
  apiSecret: z.string().min(1, "API Secret is required"),
  isPaper: z.boolean().default(true),
});

const oandaSchema = z.object({
  apiToken: z.string().min(1, "API Token is required"),
  accountId: z.string().min(1, "Account ID is required"),
  isPractice: z.boolean().default(true),
});

const ninjaTraderSchema = z.object({
  machineID: z.string().min(1, "Machine ID is required"),
  connectionPort: z.string().min(1, "Connection Port is required"),
});

type BrokerConnectionStatus = {
  broker: string;
  connected: boolean;
  lastChecked: string;
  message?: string;
  accountInfo?: any;
};

export function BrokerApiSettings() {
  const [activeTab, setActiveTab] = useState('alpaca');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<{[key: string]: BrokerConnectionStatus}>({});
  const { toast } = useToast();

  // Alpaca form
  const alpacaForm = useForm<z.infer<typeof alpacaSchema>>({
    resolver: zodResolver(alpacaSchema),
    defaultValues: {
      apiKey: '',
      apiSecret: '',
      isPaper: true,
    },
  });

  // Oanda form
  const oandaForm = useForm<z.infer<typeof oandaSchema>>({
    resolver: zodResolver(oandaSchema),
    defaultValues: {
      apiToken: '',
      accountId: '',
      isPractice: true,
    },
  });

  // NinjaTrader form
  const ninjaTraderForm = useForm<z.infer<typeof ninjaTraderSchema>>({
    resolver: zodResolver(ninjaTraderSchema),
    defaultValues: {
      machineID: '',
      connectionPort: '8000',
    },
  });

  // Load saved broker credentials
  useEffect(() => {
    const loadBrokerCredentials = async () => {
      try {
        const response = await axios.get('/api/user/broker-credentials');
        const data = response.data;
        
        // Set form values based on saved credentials
        if (data.alpaca) {
          alpacaForm.reset({
            apiKey: data.alpaca.apiKey || '',
            apiSecret: data.alpaca.apiSecret || '',
            isPaper: data.alpaca.isPaper !== false,
          });
        }
        
        if (data.oanda) {
          oandaForm.reset({
            apiToken: data.oanda.apiToken || '',
            accountId: data.oanda.accountId || '',
            isPractice: data.oanda.isPractice !== false,
          });
        }
        
        if (data.ninjaTrader) {
          ninjaTraderForm.reset({
            machineID: data.ninjaTrader.machineID || '',
            connectionPort: data.ninjaTrader.connectionPort || '8000',
          });
        }

        // Load connection status if available
        if (data.connectionStatus) {
          setConnectionStatus(data.connectionStatus);
        }
      } catch (error) {
        console.error('Error loading broker credentials:', error);
      }
    };

    loadBrokerCredentials();
  }, []);

  // Save broker credentials
  const saveCredentials = async (broker: string, data: any) => {
    setIsSubmitting(true);
    try {
      await axios.post('/api/user/broker-credentials', {
        broker,
        credentials: data
      });
      
      toast({
        title: 'Credentials saved',
        description: `Your ${broker} credentials have been saved successfully.`,
      });
      
      // Test connection automatically after saving
      testConnection(broker);
    } catch (error) {
      console.error(`Error saving ${broker} credentials:`, error);
      toast({
        title: 'Error saving credentials',
        description: 'There was an error saving your broker credentials.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Test broker connection
  const testConnection = async (broker: string) => {
    setIsTesting(true);
    try {
      const response = await axios.post('/api/user/broker-test-connection', {
        broker
      });
      
      const { success, message, accountInfo } = response.data;
      
      setConnectionStatus(prev => ({
        ...prev,
        [broker]: {
          broker,
          connected: success,
          lastChecked: new Date().toISOString(),
          message,
          accountInfo
        }
      }));
      
      if (success) {
        toast({
          title: 'Connection successful',
          description: `Successfully connected to ${broker}.`,
        });
      } else {
        toast({
          title: 'Connection failed',
          description: message || `Could not connect to ${broker}.`,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error(`Error testing ${broker} connection:`, error);
      
      setConnectionStatus(prev => ({
        ...prev,
        [broker]: {
          broker,
          connected: false,
          lastChecked: new Date().toISOString(),
          message: error.response?.data?.message || error.message || 'Connection failed'
        }
      }));
      
      toast({
        title: 'Connection failed',
        description: error.response?.data?.message || error.message || `Could not connect to ${broker}.`,
        variant: 'destructive'
      });
    } finally {
      setIsTesting(false);
    }
  };

  // Submit handlers for each form
  const onSubmitAlpaca = (data: z.infer<typeof alpacaSchema>) => {
    saveCredentials('alpaca', data);
  };

  const onSubmitOanda = (data: z.infer<typeof oandaSchema>) => {
    saveCredentials('oanda', data);
  };

  const onSubmitNinjaTrader = (data: z.infer<typeof ninjaTraderSchema>) => {
    saveCredentials('ninjaTrader', data);
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <Card className="w-full mt-4">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Broker API Settings</CardTitle>
        <CardDescription>
          Configure your broker API credentials to enable webhook-based trading.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-3 mb-6">
            <TabsTrigger value="alpaca">Alpaca</TabsTrigger>
            <TabsTrigger value="oanda">Oanda</TabsTrigger>
            <TabsTrigger value="ninjaTrader">NinjaTrader</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alpaca">
            <Form {...alpacaForm}>
              <form onSubmit={alpacaForm.handleSubmit(onSubmitAlpaca)} className="space-y-4">
                <FormField
                  control={alpacaForm.control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Key</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="PK1234567890ABCDEFG" 
                            {...field} 
                            className="pl-10"
                          />
                          <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={alpacaForm.control}
                  name="apiSecret"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Secret</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="password" 
                            placeholder="Your API Secret" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={alpacaForm.control}
                  name="isPaper"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Use Paper Trading</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {connectionStatus.alpaca && (
                  <Alert variant={connectionStatus.alpaca.connected ? "success" : "destructive"} className="mt-4">
                    <div className="flex items-start">
                      {connectionStatus.alpaca.connected ? 
                        <Check className="h-5 w-5 mr-2" /> : 
                        <AlertCircle className="h-5 w-5 mr-2" />
                      }
                      <div>
                        <AlertTitle>{connectionStatus.alpaca.connected ? 'Connected' : 'Not Connected'}</AlertTitle>
                        <AlertDescription>
                          {connectionStatus.alpaca.message}
                          {connectionStatus.alpaca.lastChecked && (
                            <div className="text-xs mt-1">Last checked: {formatDate(connectionStatus.alpaca.lastChecked)}</div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => testConnection('alpaca')}
                    disabled={isTesting || isSubmitting}
                  >
                    {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Credentials
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="oanda">
            <Form {...oandaForm}>
              <form onSubmit={oandaForm.handleSubmit(onSubmitOanda)} className="space-y-4">
                <FormField
                  control={oandaForm.control}
                  name="apiToken"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API Token</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="password" 
                            placeholder="Your Oanda API Token" 
                            {...field} 
                            className="pl-10"
                          />
                          <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={oandaForm.control}
                  name="accountId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Account ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Your Oanda Account ID" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={oandaForm.control}
                  name="isPractice"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                      <FormControl>
                        <input
                          type="checkbox"
                          checked={field.value}
                          onChange={field.onChange}
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                      </FormControl>
                      <FormLabel className="font-normal">Use Practice Account</FormLabel>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {connectionStatus.oanda && (
                  <Alert variant={connectionStatus.oanda.connected ? "success" : "destructive"} className="mt-4">
                    <div className="flex items-start">
                      {connectionStatus.oanda.connected ? 
                        <Check className="h-5 w-5 mr-2" /> : 
                        <AlertCircle className="h-5 w-5 mr-2" />
                      }
                      <div>
                        <AlertTitle>{connectionStatus.oanda.connected ? 'Connected' : 'Not Connected'}</AlertTitle>
                        <AlertDescription>
                          {connectionStatus.oanda.message}
                          {connectionStatus.oanda.lastChecked && (
                            <div className="text-xs mt-1">Last checked: {formatDate(connectionStatus.oanda.lastChecked)}</div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => testConnection('oanda')}
                    disabled={isTesting || isSubmitting}
                  >
                    {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Credentials
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
          
          <TabsContent value="ninjaTrader">
            <Form {...ninjaTraderForm}>
              <form onSubmit={ninjaTraderForm.handleSubmit(onSubmitNinjaTrader)} className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-4">
                  <p className="text-sm">
                    <strong>Note:</strong> NinjaTrader integration requires the Trade Hybrid Desktop Companion app 
                    running on the same machine as NinjaTrader. The companion app acts as a bridge between 
                    our webhooks and NinjaTrader's local API.
                  </p>
                  <p className="text-sm mt-2">
                    <a 
                      href="/downloads/trade-hybrid-desktop-connector.exe" 
                      className="text-blue-700 hover:underline"
                      target="_blank"
                      rel="noopener"
                    >
                      Download Trade Hybrid Desktop Connector
                    </a>
                  </p>
                </div>
                
                <FormField
                  control={ninjaTraderForm.control}
                  name="machineID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Machine ID</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Your Desktop Connector Machine ID" 
                            {...field} 
                            className="pl-10"
                          />
                          <Key className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={ninjaTraderForm.control}
                  name="connectionPort"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Connection Port</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input 
                            type="text" 
                            placeholder="Port (default: 8000)" 
                            {...field} 
                            className="pl-10"
                          />
                          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {connectionStatus.ninjaTrader && (
                  <Alert variant={connectionStatus.ninjaTrader.connected ? "success" : "destructive"} className="mt-4">
                    <div className="flex items-start">
                      {connectionStatus.ninjaTrader.connected ? 
                        <Check className="h-5 w-5 mr-2" /> : 
                        <AlertCircle className="h-5 w-5 mr-2" />
                      }
                      <div>
                        <AlertTitle>{connectionStatus.ninjaTrader.connected ? 'Connected' : 'Not Connected'}</AlertTitle>
                        <AlertDescription>
                          {connectionStatus.ninjaTrader.message}
                          {connectionStatus.ninjaTrader.lastChecked && (
                            <div className="text-xs mt-1">Last checked: {formatDate(connectionStatus.ninjaTrader.lastChecked)}</div>
                          )}
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                )}
                
                <div className="flex justify-between pt-2">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => testConnection('ninjaTrader')}
                    disabled={isTesting || isSubmitting}
                  >
                    {isTesting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Test Connection
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Save Credentials
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="bg-slate-50 border-t">
        <div className="text-sm text-muted-foreground">
          <p>Your API credentials are securely stored and encrypted on our servers.</p>
          <p className="mt-1">Each webhook can be associated with a specific broker account in the webhook settings page.</p>
        </div>
      </CardFooter>
    </Card>
  );
}