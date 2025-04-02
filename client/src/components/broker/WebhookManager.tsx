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
  Separator
} from "@/components/ui";
import { Copy, ChevronsUpDown, AlertCircle, Check, Cog, Lock, RefreshCw, Clipboard } from 'lucide-react';
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
  
  const handleChange = (field: string, value: any) => {
    setWebhook(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
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
          onChange={e => handleChange('name', e.target.value)}
          placeholder="My Trading Webhook"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="broker">Broker</Label>
        <Select 
          value={webhook.broker} 
          onValueChange={value => handleChange('broker', value)}
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
          onCheckedChange={value => handleChange('isActive', value)}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>
      
      {webhook.broker === 'tradingview' && (
        <div className="space-y-2">
          <Label htmlFor="targetBroker">Target Broker</Label>
          <Select 
            value={webhook.settings?.targetBroker || 'alpaca'} 
            onValueChange={value => handleChange('settings', { ...webhook.settings, targetBroker: value })}
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
  
  const webhookUrl = `${window.location.origin}/api/webhooks/receive/${webhook.token}`;
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    toast.success('Webhook URL copied to clipboard');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  const getBrokerName = (brokerId: string) => {
    const broker = brokerTypes.find(b => b.id === brokerId);
    return broker ? broker.name : brokerId;
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
              onCheckedChange={checked => onToggleActive(webhook.id, checked)}
            />
            <Label htmlFor={`active-${webhook.id}`} className="cursor-pointer">
              {webhook.isActive ? 'Active' : 'Inactive'}
            </Label>
          </div>
        </div>
        
        <div className="mt-4 flex items-center space-x-2">
          <div className="relative flex-1">
            <div className="flex items-center border rounded-md px-3 py-2 bg-muted">
              <Lock className="h-4 w-4 mr-2 text-muted-foreground" />
              <input 
                type="text" 
                value={webhookUrl}
                readOnly
                className="w-full bg-transparent border-none focus:outline-none text-xs"
              />
            </div>
          </div>
          
          <Button
            size="sm"
            onClick={copyToClipboard}
            variant="outline"
            className="flex items-center"
          >
            {copied ? <Check className="h-4 w-4 mr-1" /> : <Clipboard className="h-4 w-4 mr-1" />}
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </div>
      </CardContent>
      <CardFooter className="text-xs text-muted-foreground">
        Created: {new Date(webhook.createdAt || Date.now()).toLocaleDateString()}
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
  
  const handleUpdateWebhook = async (webhook: WebhookConfig) => {
    try {
      setIsLoading(true);
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
              Use your webhook URL to receive trade signals from external platforms:
            </p>
            <ol className="list-decimal pl-5 space-y-1">
              <li>Copy the webhook URL for the broker you want to use</li>
              <li>Configure your external platform to send signals to this URL</li>
              <li>Ensure your payload matches the expected format for the broker</li>
              <li>Trades will execute automatically when signals are received</li>
            </ol>
            
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Security Note</AlertTitle>
              <AlertDescription>
                Keep your webhook URLs private. Anyone with access to your webhook URL can execute trades on your behalf.
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