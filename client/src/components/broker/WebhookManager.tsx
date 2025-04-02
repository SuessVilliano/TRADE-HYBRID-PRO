import React, { useState, useEffect } from 'react';
import { 
  Button, 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Label,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Switch,
  Alert,
  AlertDescription,
  AlertTitle,
  Separator,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui";
import { Copy, ChevronsUpDown, AlertCircle, Check, Cog, Lock, RefreshCw, Clipboard, Loader2, X } from 'lucide-react';
import { toast } from 'sonner';

// The available broker types
const brokerTypes = [
  { id: 'alpaca', name: 'Alpaca' },
  { id: 'oanda', name: 'Oanda' },
  { id: 'ninjatrader', name: 'NinjaTrader' },
  { id: 'tradovate', name: 'Tradovate' },
  { id: 'tradingview', name: 'TradingView' },
  { id: 'other', name: 'Other (Generic)' }
];

interface WebhookConfig {
  id: string;
  userId: string;
  name: string;
  broker: string;
  token: string;
  endpoint?: string;
  isActive: boolean;
  settings?: Record<string, any>;
  createdAt?: Date;
  updatedAt?: Date;
}

// Simplified API client for webhook operations
const webhookApi = {
  getWebhooks: async (): Promise<WebhookConfig[]> => {
    const response = await fetch('/api/webhooks');
    if (!response.ok) {
      throw new Error('Failed to fetch webhooks');
    }
    const data = await response.json();
    return data.webhooks;
  },
  
  createWebhook: async (webhook: Partial<WebhookConfig>): Promise<WebhookConfig> => {
    const response = await fetch('/api/webhooks', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(webhook)
    });
    
    if (!response.ok) {
      throw new Error('Failed to create webhook');
    }
    
    const data = await response.json();
    return data.webhook;
  },
  
  updateWebhook: async (id: string, updates: Partial<WebhookConfig>): Promise<WebhookConfig> => {
    const response = await fetch(`/api/webhooks/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(updates)
    });
    
    if (!response.ok) {
      throw new Error('Failed to update webhook');
    }
    
    const data = await response.json();
    return data.webhook;
  },
  
  deleteWebhook: async (id: string): Promise<void> => {
    const response = await fetch(`/api/webhooks/${id}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new Error('Failed to delete webhook');
    }
  }
};

interface WebhookFormProps {
  onSave: (webhook: Partial<WebhookConfig>) => void;
  onCancel: () => void;
  initialWebhook?: Partial<WebhookConfig>;
}

const WebhookForm: React.FC<WebhookFormProps> = ({ onSave, onCancel, initialWebhook }) => {
  const [webhook, setWebhook] = useState<Partial<WebhookConfig>>(
    initialWebhook || {
      name: '',
      broker: 'alpaca',
      isActive: true,
      settings: {}
    }
  );
  
  const handleChange = (field: string, value: unknown) => {
    setWebhook(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSave(webhook);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Webhook Name</Label>
        <Input 
          id="name" 
          value={webhook.name || ''} 
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange('name', e.target.value)}
          placeholder="My Trading Webhook"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="broker">Broker</Label>
        <Select 
          value={webhook.broker} 
          onValueChange={(value: string) => handleChange('broker', value)}
        >
          <SelectTrigger id="broker">
            <SelectValue placeholder="Select broker" />
          </SelectTrigger>
          <SelectContent>
            {brokerTypes.map(broker => (
              <SelectItem key={broker.id} value={broker.id}>
                {broker.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="flex items-center space-x-2">
        <Switch 
          id="isActive" 
          checked={webhook.isActive} 
          onCheckedChange={(value: boolean) => handleChange('isActive', value)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      {webhook.broker === 'tradingview' && (
        <div className="space-y-2">
          <Label htmlFor="targetBroker">Target Broker</Label>
          <Select 
            value={webhook.settings?.targetBroker || 'alpaca'} 
            onValueChange={(value: string) => handleChange('settings', { ...webhook.settings, targetBroker: value })}
          >
            <SelectTrigger id="targetBroker">
              <SelectValue placeholder="Select target broker" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="alpaca">Alpaca</SelectItem>
              <SelectItem value="oanda">Oanda</SelectItem>
              <SelectItem value="ninjatrader">NinjaTrader</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            TradingView alerts will be converted to this broker's format
          </p>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Webhook</Button>
      </div>
    </form>
  );
};

interface WebhookListItemProps {
  webhook: WebhookConfig;
  onEdit: (webhook: WebhookConfig) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, isActive: boolean) => void;
}

const WebhookListItem: React.FC<WebhookListItemProps> = ({ 
  webhook, 
  onEdit, 
  onDelete,
  onToggleActive
}) => {
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestResult, setShowTestResult] = useState(false);
  
  // Create shorter, cleaner URLs based on CrossTrade's approach
  const baseUrl = window.location.origin;
  const shortUrl = `${baseUrl}/api/w/${webhook.token}`;
  const tvUrl = `${baseUrl}/api/w/tv/${webhook.token}`;
  
  // Legacy URL for backward compatibility
  const legacyUrl = `${baseUrl}/api/webhooks/receive/${webhook.token}`;
  
  const copyToClipboard = (url: string, message = 'Webhook URL copied to clipboard') => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success(message);
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getBrokerName = (brokerId: string) => {
    const broker = brokerTypes.find(b => b.id === brokerId);
    return broker ? broker.name : brokerId;
  };
  
  // Function to test the webhook with sample data
  const testWebhook = async () => {
    setIsTesting(true);
    setTestResult(null);
    setShowTestResult(true);
    
    try {
      // Prepare a sample payload based on broker type
      let testPayload = {};
      
      switch(webhook.broker) {
        case 'alpaca':
          testPayload = {
            action: "buy",
            symbol: "AAPL",
            qty: 1,
            type: "market",
            time_in_force: "day"
          };
          break;
        case 'oanda':
          testPayload = {
            instrument: "EUR_USD",
            units: 1000,
            type: "MARKET"
          };
          break;
        case 'ninjatrader':
          testPayload = {
            action: "BUY",
            symbol: "ES 09-23",
            quantity: 1,
            orderType: "MARKET"
          };
          break;
        case 'tradingview':
          testPayload = {
            strategy: {
              order_action: "buy",
              order_contracts: 1,
              order_price: 150.00,
              market_position: "long",
              position_size: 1
            },
            ticker: "AAPL",
            time: new Date().toISOString(),
            price: 150.00,
            comment: "Test webhook"
          };
          break;
        default:
          testPayload = {
            action: "TEST",
            message: "Testing webhook connectivity"
          };
      }
      
      // Send test request to the webhook
      const response = await fetch(shortUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testPayload),
      });
      
      const data = await response.json();
      setTestResult({
        status: response.ok ? 'success' : 'error',
        statusCode: response.status,
        data
      });
      
      // Show toast notification
      if (response.ok) {
        toast.success('Webhook test successful!', {
          description: 'Your webhook endpoint is working properly'
        });
      } else {
        toast.error('Webhook test failed', {
          description: `Error: ${data.message || 'Unknown error'}`
        });
      }
    } catch (error: any) {
      console.error('Error testing webhook:', error);
      setTestResult({
        status: 'error',
        error: error.message || 'Failed to test webhook'
      });
      
      toast.error('Webhook test failed', {
        description: error.message || 'Connection error'
      });
    } finally {
      setIsTesting(false);
    }
  };
  
  return (
    <Card className={webhook.isActive ? '' : 'opacity-60'}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">{webhook.name}</CardTitle>
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => testWebhook()}
              disabled={!webhook.isActive || isTesting}
              title="Test webhook"
            >
              {isTesting ? 
                <Loader2 className="h-4 w-4 animate-spin" /> : 
                <RefreshCw className="h-4 w-4" />
              }
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onEdit(webhook)}
              title="Edit webhook"
            >
              <Cog className="h-4 w-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onDelete(webhook.id)}
              title="Delete webhook"
            >
              <AlertCircle className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
        <CardDescription>
          {getBrokerName(webhook.broker)}
          {webhook.broker === 'tradingview' && webhook.settings?.targetBroker && (
            <> → {getBrokerName(webhook.settings.targetBroker)}</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm flex items-center">
          <div className="flex space-x-2 items-center">
            <Switch 
              id={`active-${webhook.id}`}
              checked={webhook.isActive}
              onCheckedChange={(checked: boolean) => onToggleActive(webhook.id, checked)}
            />
            <Label htmlFor={`active-${webhook.id}`} className="cursor-pointer">
              {webhook.isActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
        </div>
        
        {/* Short URL (Main) */}
        <div className="mt-4">
          <div className="text-xs text-muted-foreground mb-1">Webhook URL</div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={shortUrl}
                  readOnly
                  className="w-full bg-transparent border-none focus:outline-none text-xs"
                />
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={() => copyToClipboard(shortUrl)}
              variant="outline"
              className="flex items-center"
            >
              {copied ? <Check className="h-4 w-4 mr-1" /> : <Clipboard className="h-4 w-4 mr-1" />}
              {copied ? 'Copied' : 'Copy'}
            </Button>
          </div>
        </div>
        
        {/* TradingView specific URL */}
        {webhook.broker === 'tradingview' && (
          <div className="mt-3">
            <div className="text-xs text-muted-foreground mb-1">TradingView URL</div>
            <div className="flex items-center space-x-2">
              <div className="relative flex-1">
                <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                  <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <input 
                    type="text" 
                    value={tvUrl}
                    readOnly
                    className="w-full bg-transparent border-none focus:outline-none text-xs"
                  />
                </div>
              </div>
              
              <Button
                size="sm"
                onClick={() => copyToClipboard(tvUrl, 'TradingView URL copied')}
                variant="outline"
                className="flex items-center"
              >
                <Clipboard className="h-4 w-4 mr-1" />
                Copy
              </Button>
            </div>
          </div>
        )}
        
        {/* JSON Payload Direct Endpoint */}
        <div className="mt-3">
          <div className="text-xs text-muted-foreground mb-1">JSON Payload Endpoint</div>
          <div className="flex items-center space-x-2">
            <div className="relative flex-1">
              <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
                <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
                <input 
                  type="text" 
                  value={`${baseUrl}/api/webhooks/execute`}
                  readOnly
                  className="w-full bg-transparent border-none focus:outline-none text-xs"
                />
              </div>
            </div>
            
            <Button
              size="sm"
              onClick={() => copyToClipboard(`${baseUrl}/api/webhooks/execute`, 'JSON Payload URL copied')}
              variant="outline"
              className="flex items-center"
            >
              <Clipboard className="h-4 w-4 mr-1" />
              Copy
            </Button>
          </div>
          
          <div className="mt-2 text-xs text-muted-foreground">
            <p className="mb-1">Include your token in the JSON payload:</p>
            <div className="bg-muted p-2 rounded-md font-mono text-xs overflow-auto">
{`{
  "token": "${webhook.token}", 
  "action": "buy",
  "symbol": "AAPL",
  ...
}`}
            </div>
          </div>
        </div>
        
        {/* Test result display */}
        {showTestResult && testResult && (
          <div className={`mt-3 p-3 text-xs rounded-md ${
            testResult.status === 'success' 
              ? 'bg-green-50 border border-green-200 dark:bg-green-900/20 dark:border-green-800/30' 
              : 'bg-red-50 border border-red-200 dark:bg-red-900/20 dark:border-red-800/30'
          }`}>
            <div className="flex justify-between items-center mb-1">
              <div className={`font-medium ${
                testResult.status === 'success' 
                  ? 'text-green-700 dark:text-green-400' 
                  : 'text-red-700 dark:text-red-400'
              }`}>
                {testResult.status === 'success' ? 'Test successful' : 'Test failed'}
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-5 w-5 p-0" 
                onClick={() => setShowTestResult(false)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
            <div className="max-h-24 overflow-auto bg-background/80 p-2 rounded border text-[10px] font-mono">
              {JSON.stringify(testResult.data || testResult.error, null, 2)}
            </div>
          </div>
        )}
        
        {/* TradingView Setup Guide (shown when clicked) */}
        {webhook.broker === 'tradingview' && (
          <Dialog>
            <DialogTrigger asChild>
              <Button 
                variant="link" 
                size="sm" 
                className="mt-3 p-0 h-auto text-xs"
              >
                How to set up in TradingView →
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[80vh] overflow-auto">
              <DialogHeader>
                <DialogTitle>TradingView Webhook Setup Guide</DialogTitle>
                <DialogDescription>
                  Follow these steps to connect your TradingView alerts to your webhook
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 p-3 rounded-md">
                  <h4 className="font-medium text-blue-700 dark:text-blue-400 mb-1">How to set up in TradingView:</h4>
                  <ol className="list-decimal pl-5 space-y-1">
                    <li>Create a webhook in Trade Hybrid (you've already done this)</li>
                    <li>In TradingView, go to Alerts or Strategy Tester</li>
                    <li>Create a new alert or enable alerts in your strategy</li>
                    <li>Set webhook URL to: <code className="bg-background/80 px-1 py-0.5 rounded">{tvUrl}</code></li>
                    <li>Copy the template format below and paste it in TradingView's "Message" field</li>
                    <li>For best results, name your plots in TradingView for stop loss and take profits (e.g., "Stop Loss", "Take Profit")</li>
                    <li>Test your alert - signals will appear instantly in your trading dashboard and signals panel</li>
                  </ol>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Message Template:</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto whitespace-pre-wrap">
{`{
  "strategy": {
    "order_action": "{{strategy.order.action}}",
    "order_contracts": {{strategy.order.contracts}},
    "order_price": {{strategy.order.price}},
    "market_position": "{{strategy.market_position}}",
    "position_size": {{strategy.position_size}}
  },
  "ticker": "{{ticker}}",
  "time": "{{time}}",
  "price": {{close}},
  "comment": "{{strategy.order.comment}}"
}`}
                    </pre>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const template = `{
  "strategy": {
    "order_action": "{{strategy.order.action}}",
    "order_contracts": {{strategy.order.contracts}},
    "order_price": {{strategy.order.price}},
    "market_position": "{{strategy.market_position}}",
    "position_size": {{strategy.position_size}}
  },
  "ticker": "{{ticker}}",
  "time": "{{time}}",
  "price": {{close}},
  "comment": "{{strategy.order.comment}}"
}`;
                          copyToClipboard(template, "Template copied to clipboard");
                        }}
                      >
                        <Clipboard className="h-3 w-3 mr-1" />
                        Copy Template
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Alternative Setup with Token in JSON:</h4>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-md text-xs">
                    <p className="mb-2">If TradingView doesn't allow you to use a custom URL, you can use our JSON token method:</p>
                    <ol className="list-decimal pl-5 space-y-1">
                      <li>Use <code className="bg-background/80 px-1 py-0.5 rounded">{baseUrl}/api/webhooks/execute</code> as webhook URL</li>
                      <li>Include your token in the message body:</li>
                    </ol>
                    <div className="mt-2 bg-background/80 p-2 rounded font-mono text-[10px]">
{`{
  "token": "${webhook.token}",
  "strategy": {
    "order_action": "{{strategy.order.action}}",
    "order_contracts": {{strategy.order.contracts}},
    "order_price": {{strategy.order.price}},
    "market_position": "{{strategy.market_position}}",
    "position_size": {{strategy.position_size}}
  },
  "ticker": "{{ticker}}",
  "time": "{{time}}",
  "price": {{close}}
}`}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="text-xs"
                        onClick={() => {
                          const tokenTemplate = `{
  "token": "${webhook.token}",
  "strategy": {
    "order_action": "{{strategy.order.action}}",
    "order_contracts": {{strategy.order.contracts}},
    "order_price": {{strategy.order.price}},
    "market_position": "{{strategy.market_position}}",
    "position_size": {{strategy.position_size}}
  },
  "ticker": "{{ticker}}",
  "time": "{{time}}",
  "price": {{close}}
}`;
                          copyToClipboard(tokenTemplate, "Token template copied to clipboard");
                        }}
                      >
                        <Clipboard className="h-3 w-3 mr-1" />
                        Copy Token Template
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-1">Pro Tip:</h4>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="mb-2 text-xs">In TradingView, you can create plots for your stop loss and take profit levels, then reference them in the webhook:</p>
                    <pre className="text-xs overflow-auto">
{`plot(strategy.position_size > 0 ? low - atr : na, "Stop Loss", color.red)
plot(strategy.position_size > 0 ? high + atr*2 : na, "Take Profit", color.green)`}
                    </pre>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        <div className="flex justify-between w-full">
          <span>Created: {new Date(webhook.createdAt || Date.now()).toLocaleDateString()}</span>
          
          {/* TradingView setup instructions */}
          {webhook.broker === 'tradingview' && (
            <Button 
              variant="link" 
              size="sm" 
              className="p-0 h-auto text-xs"
              onClick={() => {
                toast.success('How to set up in TradingView', {
                  description: 'See the webhook setup instructions in the docs panel'
                });
              }}
            >
              View TradingView setup
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export const WebhookManager: React.FC = () => {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  
  // Load webhooks on component mount
  useEffect(() => {
    const loadWebhooks = async () => {
      try {
        setIsLoading(true);
        const data = await webhookApi.getWebhooks();
        setWebhooks(data);
        setError(null);
      } catch (err) {
        console.error('Error loading webhooks:', err);
        setError('Failed to load webhooks. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };
    
    loadWebhooks();
  }, []);
  
  const handleCreateWebhook = async (webhook: Partial<WebhookConfig>) => {
    try {
      setIsLoading(true);
      const newWebhook = await webhookApi.createWebhook(webhook);
      setWebhooks(prev => [...prev, newWebhook]);
      setShowForm(false);
      toast.success('Webhook created successfully');
    } catch (err) {
      console.error('Error creating webhook:', err);
      toast.error('Failed to create webhook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleUpdateWebhook = async (webhook: Partial<WebhookConfig>) => {
    try {
      setIsLoading(true);
      // Make sure webhook.id is available
      if (!webhook.id) {
        throw new Error('Webhook ID is required for update');
      }
      const updated = await webhookApi.updateWebhook(webhook.id, webhook);
      setWebhooks(prev => prev.map(w => w.id === updated.id ? updated : w));
      setEditingWebhook(null);
      toast.success('Webhook updated successfully');
    } catch (err) {
      console.error('Error updating webhook:', err);
      toast.error('Failed to update webhook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteWebhook = async (id: string) => {
    try {
      if (!confirm('Are you sure you want to delete this webhook?')) {
        return;
      }
      
      setIsLoading(true);
      await webhookApi.deleteWebhook(id);
      setWebhooks(prev => prev.filter(w => w.id !== id));
      toast.success('Webhook deleted successfully');
    } catch (err) {
      console.error('Error deleting webhook:', err);
      toast.error('Failed to delete webhook. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleToggleActive = async (id: string, isActive: boolean) => {
    try {
      setIsLoading(true);
      const updated = await webhookApi.updateWebhook(id, { isActive });
      setWebhooks(prev => prev.map(w => w.id === updated.id ? updated : w));
      toast.success(`Webhook ${isActive ? 'activated' : 'deactivated'} successfully`);
    } catch (err) {
      console.error('Error toggling webhook status:', err);
      toast.error('Failed to update webhook status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Webhook Integration</h2>
        
        {!showForm && !editingWebhook && (
          <Button onClick={() => setShowForm(true)}>
            Add Webhook
          </Button>
        )}
      </div>
      
      <p className="text-sm text-muted-foreground">
        Create webhooks to automatically execute trades when receiving signals from external sources.
      </p>
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {showForm && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Add New Webhook</CardTitle>
            <CardDescription>
              Create a new webhook endpoint for receiving trading signals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WebhookForm 
              onSave={handleCreateWebhook}
              onCancel={() => setShowForm(false)}
            />
          </CardContent>
        </Card>
      )}
      
      {editingWebhook && (
        <Card className="mt-4">
          <CardHeader>
            <CardTitle>Edit Webhook</CardTitle>
            <CardDescription>
              Update your webhook configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <WebhookForm 
              onSave={handleUpdateWebhook}
              onCancel={() => setEditingWebhook(null)}
              initialWebhook={editingWebhook}
            />
          </CardContent>
        </Card>
      )}
      
      {!showForm && !editingWebhook && (
        <div className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {isLoading && !webhooks.length ? (
            <div className="col-span-full flex justify-center items-center py-10">
              <RefreshCw className="h-6 w-6 animate-spin text-primary" />
              <span className="ml-2">Loading webhooks...</span>
            </div>
          ) : webhooks.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground mb-4">No webhooks configured yet</p>
              <Button onClick={() => setShowForm(true)}>
                Create Your First Webhook
              </Button>
            </div>
          ) : (
            webhooks.map(webhook => (
              <WebhookListItem
                key={webhook.id}
                webhook={webhook}
                onEdit={setEditingWebhook}
                onDelete={handleDeleteWebhook}
                onToggleActive={handleToggleActive}
              />
            ))
          )}
        </div>
      )}
      
      {webhooks.length > 0 && !showForm && !editingWebhook && (
        <div className="mt-8">
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-2">How to Use Webhooks</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Use your webhook URL to receive trade signals from external platforms. We provide two methods:
            </p>
            
            <div className="mt-4 border rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-medium mb-2">Method 1: Direct URL (Simple)</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Copy the webhook URL from your webhook card</li>
                <li>Configure your external platform to send signals to this URL</li>
                <li>Ensure your payload matches the expected format for the broker</li>
                <li>Trades will execute automatically when signals are received</li>
              </ol>
            </div>
            
            <div className="mt-4 border rounded-md p-4 bg-slate-50/50 dark:bg-slate-900/50">
              <h4 className="font-medium mb-2">Method 2: JSON Token (Advanced Security)</h4>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Use the JSON Payload Endpoint: <code className="bg-muted px-1 py-0.5 rounded">/api/webhooks/execute</code></li>
                <li>Include your webhook token in the JSON payload:</li>
                <div className="bg-muted p-2 mt-1 rounded-md font-mono text-xs overflow-auto">
{`{
  "token": "your-webhook-token",
  "action": "buy",
  "symbol": "AAPL",
  ...other fields
}`}
                </div>
                <li>This method allows you to include your token directly in the payload instead of the URL</li>
                <li>Useful for platforms that don't allow custom webhook URLs but do accept JSON payloads</li>
              </ol>
            </div>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Note</AlertTitle>
              <AlertDescription>
                Keep your webhook URLs and tokens private. Anyone with access to your webhook token can execute trades on your behalf.
              </AlertDescription>
            </Alert>
            
            <div className="mt-6 space-y-4">
              <h4 className="text-base font-medium">Supported Payload Formats</h4>
              
              <Tabs defaultValue="alpaca" className="mt-2">
                <TabsList>
                  <TabsTrigger value="alpaca">Alpaca</TabsTrigger>
                  <TabsTrigger value="oanda">Oanda</TabsTrigger>
                  <TabsTrigger value="ninjatrader">NinjaTrader</TabsTrigger>
                  <TabsTrigger value="tradingview">TradingView</TabsTrigger>
                </TabsList>
                <TabsContent value="alpaca" className="mt-2">
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto">
{`{
  "action": "buy",       // Required: "buy" or "sell"
  "symbol": "AAPL",      // Required: Trading symbol
  "qty": 1,              // Required: Quantity to trade
  "type": "market",      // Optional: "market", "limit", "stop", "stop_limit"
  "time_in_force": "day",// Optional: "day", "gtc", "opg", "cls", "ioc", "fok"
  "limit_price": 150.00, // Required for limit and stop_limit orders
  "stop_price": 145.00,  // Required for stop and stop_limit orders
  "take_profit": 155.00, // Optional: Take profit price
  "stop_loss": 140.00    // Optional: Stop loss price
}`}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="oanda" className="mt-2">
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto">
{`{
  "instrument": "EUR_USD",  // Required: Instrument name
  "units": 1000,            // Required: Positive for buy, negative for sell
  "type": "MARKET",         // Optional: "MARKET", "LIMIT", "STOP", "MARKET_IF_TOUCHED"
  "price": 1.08025,         // Required for non-MARKET orders
  "stopLossOnFill": {       // Optional stop loss
    "price": 1.07800
  },
  "takeProfitOnFill": {     // Optional take profit
    "price": 1.08200
  },
  "timeInForce": "GTC"      // Optional: "GTC", "GTD", "GFD", "FOK", "IOC"
}`}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="ninjatrader" className="mt-2">
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto">
{`{
  "action": "BUY",         // Required: "BUY", "SELL", "FLATTEN"
  "symbol": "ES 09-23",    // Required: Instrument symbol
  "quantity": 1,           // Required: Quantity to trade
  "orderType": "MARKET",   // Optional: "MARKET", "LIMIT", "STOP", "STOP_LIMIT"
  "limitPrice": 4500.00,   // Required for LIMIT and STOP_LIMIT orders
  "stopPrice": 4480.00,    // Required for STOP and STOP_LIMIT orders
  "account": "Sim101",     // Optional: Account name
  "stopLoss": 4470.00,     // Optional: Stop loss price
  "takeProfit": 4530.00    // Optional: Take profit price
}`}
                    </pre>
                  </div>
                </TabsContent>
                <TabsContent value="tradingview" className="mt-2">
                  <div className="bg-muted p-3 rounded-md">
                    <pre className="text-xs overflow-auto">
{`{
  "strategy": {
    "order_action": "buy",      // "buy" or "sell"
    "order_contracts": 1,       // Quantity
    "order_price": 150.00,      // Entry price
    "market_position": "long",  // "flat", "long", "short"
    "position_size": 1          // Current position size
  },
  "ticker": "AAPL",             // Symbol
  "time": "2025-02-15T14:30:00Z",
  "price": 150.00,
  "comment": "Buy AAPL"         // Optional comment
}`}
                    </pre>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};