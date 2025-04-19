import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { config } from '@/lib/config';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Check, Copy, Eye, EyeOff } from 'lucide-react';

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
            
            <Button type="submit" className="w-full">
              Save Credentials
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="text-sm text-muted-foreground">
        Your API keys are stored locally in your browser.
      </CardFooter>
    </Card>
  );
}