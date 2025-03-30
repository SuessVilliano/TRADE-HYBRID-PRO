import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { CircleCheck, ExternalLink, LinkIcon, Lock, LogIn } from 'lucide-react';
import { BrokerType } from '@/lib/services/broker-service';

// Helper for displaying broker info
type BrokerInfo = {
  id: string;
  name: string;
  logo: string;
  description: string;
  website: string;
  type: BrokerType;
  fields: Array<{
    name: string;
    label: string;
    type: 'text' | 'password' | 'email';
    required: boolean;
    placeholder?: string;
  }>;
};

const BROKERS: Record<BrokerType, BrokerInfo[]> = {
  crypto: [
    {
      id: 'binance',
      name: 'Binance',
      logo: '/logos/binance.svg',
      description: 'The world\'s largest cryptocurrency exchange by trading volume.',
      website: 'https://binance.com',
      type: 'crypto',
      fields: [
        {
          name: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
          placeholder: 'Paste your Binance API Key'
        },
        {
          name: 'apiSecret',
          label: 'API Secret',
          type: 'password',
          required: true,
          placeholder: 'Paste your Binance API Secret'
        }
      ]
    },
    {
      id: 'coinbase',
      name: 'Coinbase',
      logo: '/logos/coinbase.svg',
      description: 'A secure platform for buying, selling, and managing cryptocurrency.',
      website: 'https://coinbase.com',
      type: 'crypto',
      fields: [
        {
          name: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
          placeholder: 'Paste your Coinbase API Key'
        },
        {
          name: 'apiSecret',
          label: 'API Secret',
          type: 'password',
          required: true,
          placeholder: 'Paste your Coinbase API Secret'
        },
        {
          name: 'passphrase',
          label: 'Passphrase',
          type: 'password',
          required: true,
          placeholder: 'Paste your Coinbase API Passphrase'
        }
      ]
    }
  ],
  forex: [
    {
      id: 'oanda',
      name: 'Oanda',
      logo: '/logos/oanda.svg',
      description: 'A global provider of forex and CFD trading services.',
      website: 'https://www.oanda.com',
      type: 'forex',
      fields: [
        {
          name: 'apiKey',
          label: 'API Key',
          type: 'text',
          required: true,
          placeholder: 'Paste your Oanda API Key'
        },
        {
          name: 'accountId',
          label: 'Account ID',
          type: 'text',
          required: true,
          placeholder: 'Your Oanda Account ID'
        }
      ]
    }
  ],
  stocks: [
    {
      id: 'alpaca',
      name: 'Alpaca',
      logo: '/logos/alpaca.svg',
      description: 'Commission-free API-first stock trading & investing.',
      website: 'https://alpaca.markets',
      type: 'stocks',
      fields: [
        {
          name: 'apiKey',
          label: 'API Key ID',
          type: 'text',
          required: true,
          placeholder: 'Paste your Alpaca API Key ID'
        },
        {
          name: 'apiSecret',
          label: 'API Secret Key',
          type: 'password',
          required: true,
          placeholder: 'Paste your Alpaca Secret Key'
        }
      ]
    }
  ],
  futures: []
};

interface ConnectBrokerModalProps {
  onConnect: (brokerId: string, credentials: Record<string, string>) => Promise<void>;
}

export function ConnectBrokerModal({ onConnect }: ConnectBrokerModalProps) {
  const [open, setOpen] = useState(false);
  const [selectedBrokerType, setSelectedBrokerType] = useState<BrokerType>('crypto');
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectSuccess, setConnectSuccess] = useState(false);
  
  // Reset form when modal is closed
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      resetForm();
    }
  };
  
  // Reset the form
  const resetForm = () => {
    setSelectedBrokerId(null);
    setCredentials({});
    setIsConnecting(false);
    setConnectSuccess(false);
  };
  
  // Update credentials when input changes
  const handleCredentialChange = (fieldName: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [fieldName]: value
    }));
  };
  
  // Handle broker connection
  const handleConnect = async () => {
    if (!selectedBrokerId) return;
    
    setIsConnecting(true);
    
    try {
      await onConnect(selectedBrokerId, credentials);
      setConnectSuccess(true);
      
      // Close modal after success
      setTimeout(() => {
        setOpen(false);
      }, 1500);
    } catch (error) {
      console.error('Failed to connect broker:', error);
    } finally {
      setIsConnecting(false);
    }
  };
  
  // Get the selected broker info
  const selectedBroker = selectedBrokerId 
    ? BROKERS[selectedBrokerType].find(broker => broker.id === selectedBrokerId)
    : null;
  
  // Check if form is complete
  const isFormComplete = selectedBroker
    ? selectedBroker.fields.every(field => field.required ? !!credentials[field.name] : true)
    : false;
  
  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="h-7 px-2 py-0.5 ml-1 bg-black text-white hover:bg-gray-800 border-black hover:border-gray-800">
          <LinkIcon className="mr-1 h-4 w-4" />
          Connect Broker
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>Connect Trading Broker</DialogTitle>
          <DialogDescription>
            Connect your broker account to enable live trading and real-time data.
          </DialogDescription>
        </DialogHeader>
        
        {connectSuccess ? (
          <div className="py-6 text-center">
            <CircleCheck className="mx-auto h-12 w-12 text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-1">Successfully Connected</h3>
            <p className="text-slate-500">
              Your broker has been connected successfully. You can now trade directly from the platform.
            </p>
          </div>
        ) : (
          <>
            <Tabs 
              value={selectedBrokerType} 
              onValueChange={value => {
                setSelectedBrokerType(value as BrokerType);
                setSelectedBrokerId(null);
              }}
            >
              <TabsList className="grid grid-cols-4">
                <TabsTrigger value="crypto">Crypto</TabsTrigger>
                <TabsTrigger value="forex">Forex</TabsTrigger>
                <TabsTrigger value="stocks">Stocks</TabsTrigger>
                <TabsTrigger value="futures">Futures</TabsTrigger>
              </TabsList>
              
              <TabsContent value={selectedBrokerType}>
                {selectedBrokerId ? (
                  <div className="space-y-4 py-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-slate-100 rounded-md flex items-center justify-center">
                        <img 
                          src={selectedBroker?.logo || `/logos/${selectedBrokerId}.svg`} 
                          alt={selectedBroker?.name || selectedBrokerId}
                          className="w-8 h-8"
                          onError={e => {
                            (e.target as HTMLImageElement).src = '/logos/default-broker.svg';
                          }}
                        />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold mb-0.5">{selectedBroker?.name}</h3>
                        <div className="flex items-center">
                          <a 
                            href={selectedBroker?.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm text-slate-500 hover:text-slate-800 flex items-center"
                          >
                            {selectedBroker?.website}
                            <ExternalLink size={14} className="ml-1" />
                          </a>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto"
                        onClick={() => setSelectedBrokerId(null)}
                      >
                        Change
                      </Button>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="text-sm text-slate-500 flex items-center">
                        <Lock size={14} className="mr-1" />
                        Enter your API credentials. Your data is stored securely and never shared.
                      </div>
                      
                      {selectedBroker?.fields.map(field => (
                        <div key={field.name} className="space-y-1.5">
                          <Label htmlFor={field.name}>
                            {field.label}
                            {field.required && <span className="text-red-500">*</span>}
                          </Label>
                          <Input
                            id={field.name}
                            type={field.type}
                            placeholder={field.placeholder}
                            value={credentials[field.name] || ''}
                            onChange={(e) => handleCredentialChange(field.name, e.target.value)}
                            required={field.required}
                          />
                        </div>
                      ))}
                    </div>
                    
                    <DialogFooter className="mt-4">
                      <Button
                        onClick={handleConnect}
                        disabled={!isFormComplete || isConnecting}
                        className="w-full bg-black hover:bg-gray-800"
                      >
                        {isConnecting ? (
                          <>Connecting...</>
                        ) : (
                          <>
                            <LogIn size={16} className="mr-2" /> 
                            Connect to {selectedBroker?.name}
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    {BROKERS[selectedBrokerType].map(broker => (
                      <div 
                        key={broker.id}
                        className="border border-slate-200 rounded-md p-4 cursor-pointer transition-colors hover:bg-slate-50"
                        onClick={() => setSelectedBrokerId(broker.id)}
                      >
                        <div className="flex items-center space-x-3 mb-2">
                          <div className="w-10 h-10 bg-slate-100 rounded-md flex items-center justify-center">
                            <img 
                              src={broker.logo} 
                              alt={broker.name}
                              className="w-6 h-6"
                              onError={e => {
                                (e.target as HTMLImageElement).src = '/logos/default-broker.svg';
                              }}
                            />
                          </div>
                          <div className="font-medium">{broker.name}</div>
                        </div>
                        <p className="text-sm text-slate-500">{broker.description}</p>
                      </div>
                    ))}
                    
                    {BROKERS[selectedBrokerType].length === 0 && (
                      <div className="col-span-2 py-8 text-center text-slate-500">
                        No {selectedBrokerType} brokers available yet.
                      </div>
                    )}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ConnectBrokerModal;