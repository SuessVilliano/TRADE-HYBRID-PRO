import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from './dialog';
import { Button } from './button';
import { SUPPORTED_BROKERS } from '../../lib/constants';
import { brokerAggregatorService } from '../../lib/services/broker-aggregator-service';
import { X, Check, AlertTriangle } from 'lucide-react';

interface BrokerConnectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onBrokerConnected?: (brokerId: string) => void;
}

export const BrokerConnectionModal: React.FC<BrokerConnectionModalProps> = ({
  isOpen,
  onClose,
  onBrokerConnected
}) => {
  const [selectedBrokerId, setSelectedBrokerId] = useState<string | null>(null);
  const [credentials, setCredentials] = useState<{[key: string]: string}>({});
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const selectedBroker = SUPPORTED_BROKERS.find(broker => broker.id === selectedBrokerId);
  
  const resetForm = () => {
    setSelectedBrokerId(null);
    setCredentials({});
    setError(null);
    setSuccess(null);
  };
  
  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleConnect = async () => {
    if (!selectedBrokerId) return;
    
    setIsConnecting(true);
    setError(null);
    
    try {
      // Check if all required fields are filled
      const requiredFields = selectedBroker?.credentialFields.map(field => field.key) || [];
      const missingFields = requiredFields.filter(field => !credentials[field]);
      
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }
      
      // Attempt to connect to the broker
      const success = await brokerAggregatorService.connectToBroker(selectedBrokerId);
      
      if (success) {
        setSuccess(`Successfully connected to ${selectedBroker?.name}`);
        if (onBrokerConnected) {
          onBrokerConnected(selectedBrokerId);
        }
        
        // Reset form after 2 seconds
        setTimeout(() => {
          resetForm();
          onClose();
        }, 2000);
      } else {
        throw new Error(`Failed to connect to ${selectedBroker?.name}. Please check your credentials.`);
      }
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred');
    } finally {
      setIsConnecting(false);
    }
  };
  
  const getBrokerLogo = (brokerId: string) => {
    // This would link to actual broker logos in a real implementation
    // For now, we'll use emoji placeholders
    const brokerIcons: {[key: string]: string} = {
      'alpaca': '🦙',
      'binance': '🔶',
      'oanda': '🔵',
      'ironbeam': '⚙️',
      'kraken': '🐙',
      'coinbase': '🪙'
    };
    
    return brokerIcons[brokerId.toLowerCase()] || '🏢';
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      if (!open) {
        resetForm();
        onClose();
      }
    }}>
      <DialogContent className="sm:max-w-[500px] bg-slate-900 border-slate-700 text-slate-100">
        <DialogHeader>
          <DialogTitle className="text-xl">Connect Broker</DialogTitle>
          <DialogDescription className="text-slate-400">
            Connect your trading account to execute trades directly from the platform.
          </DialogDescription>
        </DialogHeader>
        
        {!selectedBrokerId ? (
          // Broker Selection Step
          <div className="space-y-4 mt-4">
            <h3 className="font-medium">Select a broker:</h3>
            <div className="grid grid-cols-2 gap-3">
              {SUPPORTED_BROKERS.map(broker => (
                <button
                  key={broker.id}
                  onClick={() => setSelectedBrokerId(broker.id)}
                  className="p-4 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 flex flex-col items-center transition-colors"
                >
                  <span className="text-3xl mb-2">{getBrokerLogo(broker.id)}</span>
                  <span className="font-medium">{broker.name}</span>
                  <span className="text-xs text-slate-400 mt-1">{broker.type}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // API Key Input Step
          <div className="space-y-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-2xl mr-2">{getBrokerLogo(selectedBrokerId)}</span>
                <h3 className="font-medium">{selectedBroker?.name}</h3>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setSelectedBrokerId(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <p className="text-sm text-slate-400">
              {selectedBroker?.description}
            </p>
            
            <div className="space-y-3">
              {selectedBroker?.credentialFields.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-slate-300 mb-1">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    value={credentials[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    className="w-full bg-slate-800 border border-slate-700 rounded-md p-2 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
            
            {error && (
              <div className="bg-red-900/30 border border-red-700 rounded-md p-3 flex items-center">
                <AlertTriangle className="h-5 w-5 text-red-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-red-200">{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-green-900/30 border border-green-700 rounded-md p-3 flex items-center">
                <Check className="h-5 w-5 text-green-400 mr-2 flex-shrink-0" />
                <p className="text-sm text-green-200">{success}</p>
              </div>
            )}
            
            <div className="pt-2">
              <a 
                href={selectedBroker?.url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-sm text-blue-400 hover:text-blue-300"
              >
                Don't have an account? Sign up here
              </a>
            </div>
          </div>
        )}
        
        <DialogFooter>
          {selectedBrokerId && (
            <Button 
              onClick={handleConnect} 
              disabled={isConnecting || Boolean(success)}
              className="w-full"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};