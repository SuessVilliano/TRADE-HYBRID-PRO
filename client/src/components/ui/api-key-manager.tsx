import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { config } from '@/lib/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Copy, Eye, EyeOff, Info, AlertCircle, Loader2 } from 'lucide-react';
import { AlpacaService } from '@/lib/services/alpaca-service';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BrokerFactory } from '@/lib/services/broker-factory';

// Check if running in browser environment
const isBrowser = typeof window !== 'undefined';

// Form values interface
interface ApiKeyFormValues {
  alpacaApiKey: string;
  alpacaApiSecret: string;
}

export function ApiKeyManager() {
  const [showSecret, setShowSecret] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [testStatus, setTestStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [testMessage, setTestMessage] = useState<string>('');
  const [activeTab, setActiveTab] = useState('alpaca');
  
  // Initialize form with default values (from localStorage or config)
  const form = useForm<ApiKeyFormValues>({
    defaultValues: {
      alpacaApiKey: isBrowser ? localStorage.getItem('alpaca-api-key') || config.ALPACA_API_KEY || '' : '',
      alpacaApiSecret: isBrowser ? localStorage.getItem('alpaca-api-secret') || config.ALPACA_API_SECRET || '' : '',
    },
  });
  
  // Handle form submission
  const onSubmit = (values: ApiKeyFormValues) => {
    // Save to localStorage for persistence
    if (isBrowser) {
      localStorage.setItem('alpaca-api-key', values.alpacaApiKey);
      localStorage.setItem('alpaca-api-secret', values.alpacaApiSecret);
    }
    
    // Show saved notification
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };
  
  // Copy to clipboard
  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 2000);
  };
  
  // Test API connection
  const testConnection = async () => {
    setTestStatus('loading');
    setTestMessage('Testing connection to Alpaca API...');
    
    try {
      const values = form.getValues();
      const apiKey = values.alpacaApiKey;
      const apiSecret = values.alpacaApiSecret;
      
      if (!apiKey || !apiSecret) {
        setTestStatus('error');
        setTestMessage('API key and secret are required');
        return;
      }
      
      // Use our broker service to test
      const brokerService = BrokerFactory.createBrokerService('alpaca');
      
      // Attempt to connect and get account info
      await brokerService.connect();
      
      // If we get here, connection was successful
      setTestStatus('success');
      setTestMessage('Successfully connected to Alpaca API!');
    } catch (error) {
      console.error('API connection test failed:', error);
      setTestStatus('error');
      setTestMessage(error instanceof Error ? error.message : 'Failed to connect to API');
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>API Key Manager</CardTitle>
        <CardDescription>
          Manage your broker API credentials
        </CardDescription>
      </CardHeader>
      <CardContent>
        {saved && (
          <Alert className="mb-4">
            <Check className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>API credentials saved successfully.</AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-4">
          <TabsList className="w-full">
            <TabsTrigger value="alpaca" className="flex-1">Alpaca</TabsTrigger>
            <TabsTrigger value="coinbase" className="flex-1" disabled>Coinbase (Coming Soon)</TabsTrigger>
            <TabsTrigger value="oanda" className="flex-1" disabled>Oanda (Coming Soon)</TabsTrigger>
          </TabsList>
          
          <TabsContent value="alpaca">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="alpacaApiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alpaca API Key</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input {...field} placeholder="Your Alpaca API Key" />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(field.value, 'apiKey')}
                        >
                          {copied === 'apiKey' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormDescription>
                        Alpaca Trading API Key (starts with PK/AK)
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
                      <FormLabel>Alpaca API Secret</FormLabel>
                      <div className="flex items-center gap-2">
                        <FormControl>
                          <Input 
                            {...field} 
                            type={showSecret ? "text" : "password"} 
                            placeholder="Your Alpaca API Secret" 
                          />
                        </FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => setShowSecret(!showSecret)}
                        >
                          {showSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => copyToClipboard(field.value, 'apiSecret')}
                        >
                          {copied === 'apiSecret' ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                        </Button>
                      </div>
                      <FormDescription>
                        Keep your API secret secure
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Button type="submit" className="flex-1">
                    Save Credentials
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1"
                    onClick={testConnection}
                    disabled={testStatus === 'loading'}
                  >
                    {testStatus === 'loading' ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Testing...
                      </>
                    ) : (
                      'Test Connection'
                    )}
                  </Button>
                </div>
                
                {testStatus !== 'idle' && (
                  <Alert 
                    variant={testStatus === 'success' ? 'default' : testStatus === 'error' ? 'destructive' : 'default'} 
                    className="mt-4"
                  >
                    {testStatus === 'success' ? (
                      <Check className="h-4 w-4" />
                    ) : testStatus === 'error' ? (
                      <AlertCircle className="h-4 w-4" />
                    ) : (
                      <Info className="h-4 w-4" />
                    )}
                    <AlertTitle>
                      {testStatus === 'success' ? 'Success' : testStatus === 'error' ? 'Error' : 'Testing'}
                    </AlertTitle>
                    <AlertDescription>{testMessage}</AlertDescription>
                  </Alert>
                )}
              </form>
            </Form>
            
            <div className="mt-6 space-y-2 text-sm">
              <h4 className="font-medium">How to get Alpaca API Keys:</h4>
              <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                <li>Create an <a href="https://app.alpaca.markets/signup" target="_blank" rel="noopener noreferrer" className="text-primary underline">Alpaca account</a></li>
                <li>Go to the Dashboard</li>
                <li>Click on "Paper Trading" for testing or "Live Trading" for real</li>
                <li>Navigate to API Keys section</li>
                <li>Generate a new key pair</li>
                <li>Copy the Key ID and Secret Key</li>
              </ol>
            </div>
          </TabsContent>
          
          <TabsContent value="coinbase">
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Coinbase integration coming soon...</p>
            </div>
          </TabsContent>
          
          <TabsContent value="oanda">
            <div className="flex h-40 items-center justify-center">
              <p className="text-muted-foreground">Oanda integration coming soon...</p>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex flex-col items-start border-t pt-4">
        <div className="text-sm text-muted-foreground">
          Your API keys are stored locally in your browser and used to connect to broker services.
        </div>
        <div className="mt-2 flex items-center text-xs text-muted-foreground">
          <Info className="mr-1 h-3 w-3" />
          For security, we recommend using paper trading API keys during testing.
        </div>
      </CardFooter>
    </Card>
  );
}