import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card';
import { Button } from './button';
import { Input } from './input';
import { Label } from './label';
import { AlertTriangle, KeyRound, Check, ExternalLink, HelpCircle, Shield } from 'lucide-react';
import axios from 'axios';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';

interface APICredentialsFormProps {
  onCredentialsSubmit: (credentials: { googleApiKey: string }) => void;
}

export function APICredentialsForm({ onCredentialsSubmit }: APICredentialsFormProps) {
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Attempt to test the API key
      const response = await axios.post('/api/settings/api-keys', {
        googleApiKey
      });
      
      if (response.data.success) {
        setIsSuccess(true);
        onCredentialsSubmit({ googleApiKey });
      } else {
        setError(response.data.error || 'Failed to validate API key');
      }
    } catch (err) {
      console.error('Error saving API key:', err);
      setError('An error occurred while saving API credentials');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto shadow-md">
      <CardHeader className="bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-900 dark:to-slate-800 border-b">
        <CardTitle className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Google Sheets API Credentials
        </CardTitle>
        <CardDescription>
          Connect your Google Sheets API key to enable trading signals and realtime market data
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded mb-4 flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
            <div>{error}</div>
          </div>
        )}
        
        {isSuccess && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 px-4 py-3 rounded mb-4 flex items-center">
            <Check className="h-5 w-5 mr-2" />
            <div>API key successfully validated and saved!</div>
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor="google-api-key">Google API Key</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <HelpCircle className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs">
                      <p>Your Google API key allows the platform to securely access trading signals stored in Google Sheets.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <Input
                id="google-api-key"
                placeholder="Enter your Google API key"
                value={googleApiKey}
                onChange={(e) => setGoogleApiKey(e.target.value)}
                type="password"
                required
                className="font-mono"
              />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-3.5 w-3.5" />
                <p>Your API key is stored securely and used only for accessing trading signals</p>
              </div>
            </div>
            
            <Accordion type="single" collapsible className="border rounded-md mt-4">
              <AccordionItem value="help">
                <AccordionTrigger className="text-sm px-4">How to get your Google API key</AccordionTrigger>
                <AccordionContent className="text-sm px-4 pb-4 pt-2 space-y-2">
                  <p>Follow these steps to obtain a Google Sheets API key:</p>
                  <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
                    <li>Go to the <a href="https://console.developers.google.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline">Google Cloud Console</a></li>
                    <li>Create a new project or select an existing one</li>
                    <li>Navigate to APIs & Services → Library</li>
                    <li>Search for "Google Sheets API" and enable it</li>
                    <li>Go to APIs & Services → Credentials</li>
                    <li>Click "Create credentials" and select "API key"</li>
                    <li>Copy the generated API key</li>
                  </ol>
                  <p className="text-xs mt-2">Note: For security reasons, consider restricting your API key to only the Google Sheets API.</p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </form>
      </CardContent>
      <CardFooter className="flex justify-between border-t p-4 gap-2">
        <Button 
          variant="outline" 
          onClick={() => window.open('https://developers.google.com/sheets/api/guides/authorizing#APIKey', '_blank')}
          className="flex items-center gap-1"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          Get API Key
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={!googleApiKey || isSubmitting}
          className="gap-1"
        >
          {isSubmitting ? (
            <>
              <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
              Saving...
            </>
          ) : (
            <>
              <KeyRound className="h-4 w-4" />
              Save Credentials
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}