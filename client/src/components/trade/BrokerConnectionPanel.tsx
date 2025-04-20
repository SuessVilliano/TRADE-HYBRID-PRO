import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/components/ui/use-toast';
import { 
  CircleCheck,
  CircleDashed,
  ExternalLink,
  Link as LinkIcon,
  AlertTriangle,
  LucideIcon
} from 'lucide-react';

// Define broker details
interface Broker {
  id: string;
  name: string;
  icon: string;
  description: string;
  apiEndpoint?: string;
  documentationUrl: string;
  status: 'connected' | 'disconnected' | 'pending' | 'error';
  isSupported: boolean;
  credentialFields: { 
    name: string; 
    label: string; 
    type: string; 
    required: boolean;
    readOnly?: boolean; 
  }[];
}

// Mock broker data
const BROKER_DETAILS: Record<string, Broker> = {
  'alpaca': {
    id: 'alpaca',
    name: 'Alpaca',
    icon: '/assets/icons/alpaca-logo.png',
    description: 'Commission-free stock trading API for algorithmic trading.',
    apiEndpoint: 'https://api.alpaca.markets',
    documentationUrl: 'https://alpaca.markets/docs/api-documentation/',
    status: 'connected',
    isSupported: true,
    credentialFields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password', required: true },
      { name: 'isPaper', label: 'Paper Trading', type: 'toggle', required: false }
    ]
  },
  'oanda': {
    id: 'oanda',
    name: 'Oanda',
    icon: '/assets/icons/oanda-logo.png',
    description: 'Forex trading platform with advanced API access.',
    apiEndpoint: 'https://api-fxtrade.oanda.com',
    documentationUrl: 'https://developer.oanda.com/rest-live-v20/introduction/',
    status: 'disconnected',
    isSupported: true,
    credentialFields: [
      { name: 'apiToken', label: 'API Token', type: 'password', required: true },
      { name: 'accountId', label: 'Account ID', type: 'text', required: true },
      { name: 'isPractice', label: 'Practice Account', type: 'toggle', required: false }
    ]
  },
  'ninjatrader': {
    id: 'ninjatrader',
    name: 'NinjaTrader',
    icon: '/assets/icons/ninjatrader-logo.png',
    description: 'Advanced trading platform for futures and forex.',
    documentationUrl: 'https://ninjatrader.com/support/helpGuides/nt8/',
    status: 'disconnected',
    isSupported: true,
    credentialFields: [
      { name: 'endpoint', label: 'Webhook Endpoint', type: 'text', required: true },
      { name: 'apiKey', label: 'API Key', type: 'password', required: true }
    ]
  },
  'tradingview': {
    id: 'tradingview',
    name: 'TradingView',
    icon: '/assets/icons/tradingview-logo.png',
    description: 'Chart and analysis platform with webhook alerts.',
    documentationUrl: 'https://www.tradingview.com/support/solutions/43000529348-about-webhooks/',
    status: 'disconnected',
    isSupported: true,
    credentialFields: [
      { name: 'webhookUrl', label: 'Webhook URL', type: 'text', required: true, readOnly: true }
    ]
  },
  'kraken': {
    id: 'kraken',
    name: 'Kraken',
    icon: '/assets/icons/kraken-logo.png',
    description: 'Cryptocurrency exchange with advanced API features.',
    apiEndpoint: 'https://api.kraken.com',
    documentationUrl: 'https://docs.kraken.com/rest/',
    status: 'disconnected',
    isSupported: false,
    credentialFields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'Private Key', type: 'password', required: true }
    ]
  },
  'binance': {
    id: 'binance',
    name: 'Binance',
    icon: '/assets/icons/binance-logo.png',
    description: 'Leading cryptocurrency exchange with extensive API.',
    apiEndpoint: 'https://api.binance.com',
    documentationUrl: 'https://binance-docs.github.io/apidocs/',
    status: 'disconnected',
    isSupported: false,
    credentialFields: [
      { name: 'apiKey', label: 'API Key', type: 'text', required: true },
      { name: 'apiSecret', label: 'API Secret', type: 'password', required: true }
    ]
  }
};

interface BrokerConnectionPanelProps {
  brokerId: string;
}

const BrokerConnectionPanel: React.FC<BrokerConnectionPanelProps> = ({ brokerId }) => {
  const broker = BROKER_DETAILS[brokerId] || {
    id: brokerId,
    name: brokerId.charAt(0).toUpperCase() + brokerId.slice(1),
    icon: '/assets/icons/generic-broker.svg',
    description: 'Trading platform connection.',
    documentationUrl: '#',
    status: 'disconnected',
    isSupported: false,
    credentialFields: []
  };

  const [isConnected, setIsConnected] = useState(broker.status === 'connected');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [formData, setFormData] = useState<Record<string, any>>({});
  const { toast } = useToast();

  // Initialize form data from credentials fields
  useEffect(() => {
    const initialData: Record<string, any> = {};
    broker.credentialFields.forEach(field => {
      if (field.type === 'toggle') {
        initialData[field.name] = false;
      } else {
        initialData[field.name] = '';
      }
    });
    setFormData(initialData);
  }, [broker.credentialFields]);

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleConnect = async () => {
    setIsTesting(true);
    
    // Simulate API connection test
    setTimeout(() => {
      // Success for Alpaca, failure for others (for demo)
      const success = brokerId === 'alpaca';
      
      if (success) {
        setIsConnected(true);
        toast({
          title: "Connection Successful",
          description: `Connected to ${broker.name} successfully.`,
          variant: "default",
        });
      } else {
        toast({
          title: "Connection Failed",
          description: `Could not connect to ${broker.name}. Please check your credentials.`,
          variant: "destructive",
        });
      }
      
      setIsTesting(false);
      setIsDialogOpen(false);
    }, 1500);
  };

  const handleDisconnect = () => {
    setIsConnected(false);
    toast({
      title: "Disconnected",
      description: `Disconnected from ${broker.name}.`,
      variant: "default",
    });
  };

  return (
    <Card className={`overflow-hidden transition-all duration-300 ${!broker.isSupported ? 'opacity-70' : ''}`}>
      <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-900 pb-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-3">
            {broker.icon ? (
              <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center p-1">
                <img src={broker.icon} alt={broker.name} className="max-w-full max-h-full" />
              </div>
            ) : (
              <div className="w-10 h-10 bg-slate-700 rounded-md flex items-center justify-center">
                <LinkIcon className="h-5 w-5 text-slate-300" />
              </div>
            )}
            <div>
              <CardTitle className="text-lg">{broker.name}</CardTitle>
              <CardDescription className="text-slate-300">{broker.isSupported ? 'Supported' : 'Coming Soon'}</CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isConnected ? (
              <div className="flex items-center text-green-400 text-sm font-medium">
                <CircleCheck className="h-4 w-4 mr-1" />
                Connected
              </div>
            ) : broker.isSupported ? (
              <div className="flex items-center text-slate-400 text-sm font-medium">
                <CircleDashed className="h-4 w-4 mr-1" />
                Not Connected
              </div>
            ) : (
              <div className="flex items-center text-amber-400 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 mr-1" />
                Coming Soon
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-4">
        <p className="text-sm text-slate-500 mb-4">{broker.description}</p>
        
        {broker.apiEndpoint && (
          <div className="mb-3">
            <p className="text-xs text-slate-500">API Endpoint:</p>
            <p className="text-sm font-mono">{broker.apiEndpoint}</p>
          </div>
        )}
        
        {isConnected && (
          <div className="bg-slate-100 dark:bg-slate-800 p-3 rounded-md my-3">
            <p className="text-sm text-slate-500">Connection Status</p>
            <div className="flex justify-between items-center">
              <div className="text-sm font-medium">Active</div>
              <div className="text-xs text-slate-500">Last checked: Just now</div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between pt-0">
        <Button variant="outline" size="sm" asChild>
          <a href={broker.documentationUrl} target="_blank" rel="noopener noreferrer" className="flex items-center">
            <span>Documentation</span>
            <ExternalLink className="h-3 w-3 ml-2" />
          </a>
        </Button>
        
        {broker.isSupported && (
          isConnected ? (
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={handleDisconnect}
            >
              Disconnect
            </Button>
          ) : (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">Connect</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect to {broker.name}</DialogTitle>
                  <DialogDescription>
                    Enter your {broker.name} API credentials to establish a connection.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  {broker.credentialFields.map(field => (
                    <div key={field.name} className="space-y-2">
                      {field.type === 'toggle' ? (
                        <div className="flex items-center justify-between">
                          <Label>{field.label}</Label>
                          <Switch 
                            checked={!!formData[field.name]}
                            onCheckedChange={(checked) => handleInputChange(field.name, checked)}
                          />
                        </div>
                      ) : (
                        <>
                          <Label htmlFor={field.name}>{field.label}</Label>
                          <Input 
                            id={field.name}
                            type={field.type} 
                            value={formData[field.name] || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                            readOnly={field.readOnly}
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
                
                <DialogFooter>
                  <Button 
                    onClick={handleConnect} 
                    disabled={isTesting}
                  >
                    {isTesting ? 'Testing Connection...' : 'Connect'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )
        )}
      </CardFooter>
    </Card>
  );
};

export default BrokerConnectionPanel;