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
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog';
import { Label } from '../ui/label';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from '../ui/alert-dialog';
import { useToast } from '../ui/use-toast';
import { Clipboard, Copy, Plus, RefreshCw, Trash2 } from 'lucide-react';

// Define types for our webhooks
interface UserWebhook {
  id: number;
  name: string;
  token: string;
  signalCount: number;
  lastUsedAt: string | null;
  createdAt: string;
  isActive: boolean;
}

export function WebhookSettings() {
  const [webhooks, setWebhooks] = useState<UserWebhook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newWebhookName, setNewWebhookName] = useState('');
  const [webhookToDelete, setWebhookToDelete] = useState<number | null>(null);
  const [webhookToRegenerate, setWebhookToRegenerate] = useState<number | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState<{[key: string]: boolean}>({});
  
  const { toast } = useToast();
  
  // Fetch webhooks on component mount
  useEffect(() => {
    fetchWebhooks();
  }, []);
  
  // Fetch webhooks from server
  const fetchWebhooks = async () => {
    setIsLoading(true);
    try {
      const response = await axios.get('/api/user-webhooks');
      setWebhooks(response.data.webhooks);
    } catch (error) {
      console.error('Error fetching webhooks:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch webhooks',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Create a new webhook
  const createWebhook = async () => {
    if (!newWebhookName.trim()) {
      toast({
        title: 'Error',
        description: 'Webhook name is required',
        variant: 'destructive'
      });
      return;
    }
    
    setIsCreating(true);
    try {
      const response = await axios.post('/api/user-webhooks', {
        name: newWebhookName.trim()
      });
      
      // Update webhooks list
      setWebhooks([response.data.webhook, ...webhooks]);
      
      // Reset form
      setNewWebhookName('');
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Webhook created successfully',
      });
      
      // Copy webhook URL to clipboard
      copyToClipboard(response.data.webhookUrl, 'url-' + response.data.webhook.id);
      
      // Close dialog
      setIsCreating(false);
      
    } catch (error) {
      console.error('Error creating webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to create webhook',
        variant: 'destructive'
      });
      setIsCreating(false);
    }
  };
  
  // Delete a webhook
  const deleteWebhook = async (webhookId: number) => {
    try {
      await axios.delete(`/api/user-webhooks/${webhookId}`);
      
      // Update webhooks list
      setWebhooks(webhooks.filter(webhook => webhook.id !== webhookId));
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Webhook deleted successfully',
      });
      
    } catch (error) {
      console.error('Error deleting webhook:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete webhook',
        variant: 'destructive'
      });
    } finally {
      setWebhookToDelete(null);
    }
  };
  
  // Regenerate webhook token
  const regenerateWebhookToken = async (webhookId: number) => {
    setIsRegenerating(true);
    try {
      const response = await axios.post(`/api/user-webhooks/${webhookId}/regenerate`);
      
      // Update webhooks list
      setWebhooks(webhooks.map(webhook => 
        webhook.id === webhookId ? response.data.webhook : webhook
      ));
      
      // Show success toast
      toast({
        title: 'Success',
        description: 'Webhook token regenerated successfully',
      });
      
      // Copy new webhook URL to clipboard
      copyToClipboard(response.data.webhookUrl, 'url-' + webhookId);
      
    } catch (error) {
      console.error('Error regenerating webhook token:', error);
      toast({
        title: 'Error',
        description: 'Failed to regenerate webhook token',
        variant: 'destructive'
      });
    } finally {
      setIsRegenerating(false);
      setWebhookToRegenerate(null);
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString();
  };
  
  // Copy to clipboard function
  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        setIsCopied({...isCopied, [id]: true});
        setTimeout(() => {
          setIsCopied({...isCopied, [id]: false});
        }, 2000);
      })
      .catch(err => {
        console.error('Error copying to clipboard:', err);
      });
  };
  
  // Get webhook URL
  const getWebhookUrl = (token: string) => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/api/webhooks/user/${token}`;
  };
  
  // Example signal payload format
  const exampleSignalFormat = `{
  "content": "BUY ALERT Symbol: BTCUSDT Entry: 67500 Stop Loss: 66950 Take Profit: 68600",
  "channel_name": "crypto-signals",
  "market_type": "crypto"
}`;

  // TradingView integration example
  const tradingViewBasicFormat = `{
  "symbol": "{{ticker}}",
  "side": "{{strategy.order.action}}",
  "entryPrice": {{close}},
  "stopLoss": {{strategy.position.size > 0 ? strategy.position.stoploss : plot("Stop Loss")}},
  "takeProfit": {{strategy.position.size > 0 ? strategy.position.takeprofit : plot("Take Profit")}},
  "timeframe": "{{interval}}",
  "description": "{{strategy.order.comment}}"
}`;

  const tradingViewAdvancedFormat = `{
  "symbol": "{{ticker}}",
  "side": "{{strategy.order.action}}",
  "entryPrice": {{close}},
  "stopLoss": {{strategy.position.size > 0 ? strategy.position.stoploss : plot("Stop Loss")}},
  "takeProfit": {{strategy.position.size > 0 ? strategy.position.takeprofit : plot("Take Profit")}},
  "timeframe": "{{interval}}",
  "description": "Signal from {{strategy.order.alert_message}}",
  "bar": {
    "time": "{{time}}",
    "open": {{open}},
    "high": {{high}},
    "low": {{low}},
    "close": {{close}},
    "volume": {{volume}}
  },
  "sl": {{plot("Stop Loss")}},
  "tp": {{plot("Take Profit")}},
  "tp1": {{plot("TP1")}},
  "tp2": {{plot("TP2")}},
  "tp3": {{plot("TP3")}},
  "timeframe": "{{interval}}",
  "provider": "TradingView Strategy",
  "notes": "{{strategy.order.comment}}",
  "strategy_position": "{{strategy.market_position}}",
  "strategy_position_size": {{strategy.position_size}}
}`;
  
  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold">Webhook Management</CardTitle>
        <CardDescription>
          Create and manage webhooks to receive trading signals from external systems.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-sm font-medium">Your Webhooks</h3>
            <p className="text-sm text-muted-foreground">
              Send signals from any system to Trade Hybrid using these webhook URLs.
            </p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Webhook
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create a new webhook</DialogTitle>
                <DialogDescription>
                  Create a webhook URL to receive trading signals from external systems.
                </DialogDescription>
              </DialogHeader>
              <div className="py-4">
                <Label htmlFor="webhook-name" className="mb-2 block">
                  Webhook Name
                </Label>
                <Input
                  id="webhook-name"
                  placeholder="My Trading System"
                  value={newWebhookName}
                  onChange={(e) => setNewWebhookName(e.target.value)}
                />
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setNewWebhookName('')}
                  disabled={isCreating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={createWebhook} 
                  disabled={isCreating || !newWebhookName.trim()}
                >
                  {isCreating ? 'Creating...' : 'Create Webhook'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : webhooks.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-background">
            <Clipboard className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No webhooks found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Create a webhook to receive trading signals from external systems.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {webhooks.map((webhook) => (
              <div key={webhook.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="text-base font-medium">{webhook.name}</h4>
                    <div className="mt-1 flex items-center gap-2">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-100 text-green-800">
                        {webhook.signalCount} signals received
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Created: {formatDate(webhook.createdAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 text-orange-500"
                          onClick={() => setWebhookToRegenerate(webhook.id)}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Regenerate webhook token?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will invalidate the current webhook URL. Any systems using the current URL will stop working.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setWebhookToRegenerate(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => regenerateWebhookToken(webhook.id)}
                            disabled={isRegenerating}
                          >
                            {isRegenerating ? 'Regenerating...' : 'Regenerate Token'}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                    
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="icon"
                          className="h-8 w-8 text-red-500"
                          onClick={() => setWebhookToDelete(webhook.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete webhook?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete the webhook.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setWebhookToDelete(null)}>
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteWebhook(webhook.id)}
                            className="bg-red-500 hover:bg-red-600"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-xs font-medium">Webhook URL</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={getWebhookUrl(webhook.token)}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      className="shrink-0"
                      onClick={() => copyToClipboard(getWebhookUrl(webhook.token), 'url-' + webhook.id)}
                    >
                      {isCopied['url-' + webhook.id] ? 'Copied!' : 'Copy URL'}
                      <Copy className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4">
                  <Label className="text-xs font-medium">TradingView Webhook URL</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <Input
                      value={`${window.location.origin}/api/webhooks/tradingview/${webhook.token}`}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="default"
                      size="sm"
                      className="shrink-0"
                      onClick={() => copyToClipboard(`${window.location.origin}/api/webhooks/tradingview/${webhook.token}`, 'tv-url-' + webhook.id)}
                    >
                      {isCopied['tv-url-' + webhook.id] ? 'Copied!' : 'Copy URL'}
                      <Copy className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Use this URL when setting up alerts in TradingView
                  </p>
                </div>
                
                <div className="mt-4">
                  <Label className="text-xs font-medium">
                    Example Payload Format
                  </Label>
                  <div className="mt-1 relative">
                    <pre className="font-mono text-xs p-2 bg-slate-100 rounded-md overflow-auto text-slate-800">
                      {exampleSignalFormat}
                    </pre>
                    <Button
                      variant="outline"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => copyToClipboard(exampleSignalFormat, 'payload-' + webhook.id)}
                    >
                      {isCopied['payload-' + webhook.id] ? 'Copied!' : 'Copy'}
                      <Copy className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
                
                <div className="mt-4 text-xs text-muted-foreground">
                  <p>Last used: {formatDate(webhook.lastUsedAt)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      <CardFooter className="bg-slate-50 flex flex-col items-start border-t">
        <h4 className="font-medium text-sm">How to use webhooks</h4>
        <ol className="text-sm text-muted-foreground mt-2 list-decimal pl-5 space-y-1">
          <li>Create a new webhook and copy the webhook URL</li>
          <li>Configure your trading system to send signals to this URL</li>
          <li>Make sure your payload matches the required format</li>
          <li>Signals will appear in your trading dashboard automatically</li>
        </ol>
        
        <div className="w-full mt-5 pt-4 border-t border-slate-200">
          <h4 className="font-medium text-sm">TradingView Integration</h4>
          <p className="text-xs text-muted-foreground mt-1 mb-2">
            Use these templates to receive alerts directly from TradingView charts. Replace "your-webhook-token-here" with your actual token.
          </p>
          
          <div className="space-y-4 mt-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs font-medium">Basic TradingView Alert Format</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(tradingViewBasicFormat.replace('your-webhook-token-here', webhooks[0]?.token || ''), 'tv-basic')}
                >
                  {isCopied['tv-basic'] ? 'Copied!' : 'Copy'}
                  <Copy className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <pre className="font-mono text-xs p-2 bg-slate-100 rounded-md overflow-auto text-slate-800">
                {tradingViewBasicFormat}
              </pre>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <Label className="text-xs font-medium">Advanced TradingView Alert Format (Strategy)</Label>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2"
                  onClick={() => copyToClipboard(tradingViewAdvancedFormat.replace('your-webhook-token-here', webhooks[0]?.token || ''), 'tv-advanced')}
                >
                  {isCopied['tv-advanced'] ? 'Copied!' : 'Copy'}
                  <Copy className="ml-1 h-3 w-3" />
                </Button>
              </div>
              <pre className="font-mono text-xs p-2 bg-slate-100 rounded-md overflow-auto text-slate-800">
                {tradingViewAdvancedFormat}
              </pre>
            </div>
          </div>
          
          <div className="text-xs bg-blue-50 text-blue-800 p-3 rounded-md mt-3 border border-blue-100">
            <p className="font-medium">How to set up in TradingView:</p>
            <ol className="mt-1 list-decimal pl-5 space-y-1">
              <li>Create a webhook in Trade Hybrid and copy its token</li>
              <li>In TradingView, go to Alerts or Strategy Tester</li>
              <li>Create a new alert or enable alerts in your strategy</li>
              <li>Set webhook URL to: <span className="font-mono">{window.location.origin}/api/webhooks/tradingview/<strong>{webhooks[0]?.token || 'your-token'}</strong></span></li>
              <li>Copy the template format above and paste it in TradingView's "Message" field (use Webhook URL format)</li>
              <li>For best results, name your plots in TradingView for stop loss and take profits (e.g., "Stop Loss", "Take Profit")</li>
              <li>Test your alert - signals will appear instantly in your trading dashboard and signals panel</li>
            </ol>
            <div className="bg-yellow-100 text-yellow-800 p-2 mt-2 rounded-md border border-yellow-200">
              <p className="font-medium">Pro Tip:</p>
              <p>In TradingView, you can create plots for your stop loss and take profit levels, then reference them in the webhook:</p>
              <div className="mt-1 ml-2 font-mono bg-white/50 p-1 rounded">
                plot(strategy.position_size {'>'} 0 ? low - atr : na, "Stop Loss", color.red)<br/>
                plot(strategy.position_size {'>'} 0 ? high + atr*2 : na, "Take Profit", color.green)
              </div>
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}

export default WebhookSettings;