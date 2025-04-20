import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, ExternalLink, Copy, RefreshCw, Info } from 'lucide-react';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';

export default function TradingViewConnector() {
  // State management
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [webhookToken, setWebhookToken] = useState<string>('');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState<boolean>(false);
  const [isTokenDialogOpen, setIsTokenDialogOpen] = useState<boolean>(false);
  const [copySuccess, setCopySuccess] = useState<boolean>(false);

  // Fetch connection status on component mount
  useEffect(() => {
    checkConnectionStatus();
  }, []);

  // Check if the user is connected to TradingView
  const checkConnectionStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhooks/tradingview/status');
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(data.connected);
        if (data.token) {
          setWebhookToken(data.token);
          setWebhookUrl(`${window.location.origin}/api/webhooks/tradingview/${data.token}`);
        }
        setError(null);
      } else {
        setError(data.message || 'Failed to check TradingView connection status');
      }
    } catch (err) {
      setError('Could not check TradingView connection status. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Connect to TradingView by generating a new webhook token
  const connectToTradingView = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhooks/tradingview/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(true);
        setWebhookToken(data.token);
        setWebhookUrl(`${window.location.origin}/api/webhooks/tradingview/${data.token}`);
        setIsTokenDialogOpen(true);
        setError(null);
      } else {
        setError(data.message || 'Failed to create TradingView webhook connection');
      }
    } catch (err) {
      setError('Could not connect to TradingView. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnect from TradingView by revoking the webhook token
  const disconnectFromTradingView = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/webhooks/tradingview/revoke', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token: webhookToken
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsConnected(false);
        setWebhookToken('');
        setWebhookUrl('');
        setError(null);
      } else {
        setError(data.message || 'Failed to disconnect from TradingView');
      }
    } catch (err) {
      setError('Could not disconnect from TradingView. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Copy webhook URL to clipboard
  const copyWebhookUrl = () => {
    navigator.clipboard.writeText(webhookUrl)
      .then(() => {
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 2000);
      })
      .catch(() => {
        setError('Failed to copy to clipboard. Please try again.');
      });
  };

  // Open TradingView in a new tab
  const openTradingView = () => {
    window.open('https://www.tradingview.com/chart/', '_blank');
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              src="/logos/tradingview.svg" 
              alt="TradingView logo" 
              className="h-8 w-8 object-contain"
            />
            <div>
              <CardTitle>TradingView Connection</CardTitle>
              <CardDescription>
                Connect TradingView alerts to Trade Hybrid
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isConnected ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-gray-50 text-gray-700 dark:bg-gray-900/20 dark:text-gray-400 border-gray-200 dark:border-gray-800">
                Disconnected
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your TradingView account to receive trade signals and alerts directly in Trade Hybrid.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {isConnected && (
          <div className="mb-4 space-y-4">
            <div className="bg-background border rounded-md p-3">
              <Label htmlFor="webhook-url" className="text-xs font-medium text-muted-foreground mb-2 block">
                Your TradingView Webhook URL
              </Label>
              <div className="flex">
                <Input 
                  id="webhook-url"
                  value={webhookUrl}
                  readOnly
                  className="rounded-r-none flex-1"
                />
                <Button
                  onClick={copyWebhookUrl}
                  variant="outline"
                  className="rounded-l-none border-l-0"
                >
                  {copySuccess ? (
                    <CheckCircle className="h-4 w-4" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                  <span className="sr-only">Copy URL</span>
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Use this URL in your TradingView alert webhooks
              </p>
            </div>
            
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium">Alert Setup Tip</p>
                <p className="mt-1">
                  Make sure to format your TradingView alert message as JSON with symbol, side, price, and quantity fields.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            {isConnected ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={disconnectFromTradingView}
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Working...
                    </>
                  ) : (
                    'Disconnect'
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowInstructions(!showInstructions)}
                >
                  {showInstructions ? 'Hide Instructions' : 'Show Instructions'}
                </Button>
              </>
            ) : (
              <Button
                variant="default"
                size="sm"
                onClick={connectToTradingView}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Connect to TradingView'
                )}
              </Button>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1"
            onClick={openTradingView}
          >
            Open TradingView
            <ExternalLink className="h-3 w-3 ml-1" />
          </Button>
        </div>
        
        {isConnected && showInstructions && (
          <div className="mt-6 border-t border-border pt-4 space-y-3">
            <h3 className="text-sm font-medium">How to Set Up TradingView Alerts</h3>
            
            <ol className="text-sm space-y-2 ml-5 list-decimal">
              <li>Go to TradingView and open any chart</li>
              <li>Create a new alert by clicking the bell icon</li>
              <li>Set your alert conditions (price, indicator, etc.)</li>
              <li>In the "Alert actions" section, select "Webhook URL"</li>
              <li>Paste your webhook URL from above</li>
              <li>Format your message as JSON with the following structure:
                <pre className="mt-1 p-2 bg-background border rounded-md text-xs overflow-auto">
{`{
  "symbol": "{{ticker}}",
  "side": "buy", // or "sell"
  "price": {{close}},
  "quantity": 1,
  "strategy": "My Strategy"
}`}
                </pre>
              </li>
              <li>Click "Create" to save your alert</li>
            </ol>
            
            <p className="text-sm text-muted-foreground mt-2">
              When your alert triggers, it will automatically send a signal to Trade Hybrid for processing.
            </p>
          </div>
        )}
      </CardContent>
      
      {/* Webhook Token Dialog */}
      <Dialog open={isTokenDialogOpen} onOpenChange={setIsTokenDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>TradingView Connection Successful</DialogTitle>
            <DialogDescription>
              Your TradingView webhook has been set up successfully. Use the following URL in your TradingView alerts.
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            <Label htmlFor="webhook-url-dialog" className="text-sm font-medium mb-2 block">
              Your Webhook URL
            </Label>
            <div className="flex">
              <Input 
                id="webhook-url-dialog"
                value={webhookUrl}
                readOnly
                className="rounded-r-none flex-1"
              />
              <Button
                onClick={copyWebhookUrl}
                variant="outline"
                className="rounded-l-none border-l-0"
              >
                {copySuccess ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="sr-only">Copy URL</span>
              </Button>
            </div>
            
            <div className="mt-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-900/30 p-3 rounded-md">
              <div className="flex items-start gap-2">
                <Info className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <div className="text-sm text-amber-900 dark:text-amber-300">
                  <p className="font-medium">Important</p>
                  <p className="mt-1">
                    Save this URL securely. It will allow TradingView to send signals to your account. Do not share it with others.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTokenDialogOpen(false)}>Close</Button>
            <Button onClick={openTradingView}>
              Open TradingView
              <ExternalLink className="h-3 w-3 ml-2" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}