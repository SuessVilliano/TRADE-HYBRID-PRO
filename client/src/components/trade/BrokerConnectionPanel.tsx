import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, Settings, RefreshCw } from 'lucide-react';
import { SUPPORTED_BROKERS } from '@/lib/constants';

interface BrokerConnectionPanelProps {
  brokerId: string;
  className?: string;
}

export default function BrokerConnectionPanel({ 
  brokerId,
  className 
}: BrokerConnectionPanelProps) {
  // Find broker details from the supported brokers list
  const broker = SUPPORTED_BROKERS.find(b => b.id === brokerId);
  
  // State management
  const [connected, setConnected] = useState<boolean>(false);
  const [connecting, setConnecting] = useState<boolean>(false);
  const [showCredentials, setShowCredentials] = useState<boolean>(false);
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const [lastTested, setLastTested] = useState<string | null>(null);

  // Test connection when credentials change or when requested
  useEffect(() => {
    // Check if this broker is already connected
    const checkConnection = async () => {
      try {
        const response = await fetch(`/api/broker/status/${brokerId}`);
        const data = await response.json();
        
        if (data.success) {
          setConnected(data.connected);
          setLastTested(new Date().toLocaleString());
        }
      } catch (err) {
        console.error(`Failed to check broker connection status: ${err}`);
      }
    };
    
    checkConnection();
  }, [brokerId]);

  // Update credentials
  const handleCredentialChange = (key: string, value: string) => {
    setCredentials(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Connect to the broker
  const handleConnect = async () => {
    if (!broker) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      const response = await fetch('/api/broker/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brokerId,
          credentials
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnected(true);
        setShowCredentials(false);
        setLastTested(new Date().toLocaleString());
      } else {
        setError(data.message || 'Failed to connect to broker');
        setConnected(false);
      }
    } catch (err) {
      setError('Connection failed. Please check your credentials and try again.');
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  // Disconnect from the broker
  const handleDisconnect = async () => {
    if (!broker) return;
    
    try {
      const response = await fetch('/api/broker/disconnect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          brokerId
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnected(false);
        setCredentials({});
      } else {
        setError(data.message || 'Failed to disconnect from broker');
      }
    } catch (err) {
      setError('Disconnect failed. Please try again.');
    }
  };

  // Test the connection
  const handleTestConnection = async () => {
    if (!broker) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/broker/test/${brokerId}`, {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setConnected(true);
        setLastTested(new Date().toLocaleString());
      } else {
        setError(data.message || 'Connection test failed');
        setConnected(false);
      }
    } catch (err) {
      setError('Connection test failed. Please check your network connection.');
      setConnected(false);
    } finally {
      setConnecting(false);
    }
  };

  if (!broker) {
    return (
      <Card className={`border ${className}`}>
        <CardHeader>
          <CardTitle>Unknown Broker</CardTitle>
          <CardDescription>The specified broker is not supported.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={`border ${className}`}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            {broker.logo && (
              <img 
                src={broker.logo} 
                alt={`${broker.name} logo`} 
                className="h-8 w-8 object-contain"
              />
            )}
            <div>
              <CardTitle>{broker.name}</CardTitle>
              <CardDescription className="text-sm">
                {broker.type.charAt(0).toUpperCase() + broker.type.slice(1)} Trading
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {connected ? (
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
          {broker.description}
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {showCredentials && (
          <div className="space-y-4 mb-4">
            <div className="grid gap-4">
              {broker.credentialFields.map(field => (
                <div key={field.key} className="space-y-2">
                  <Label htmlFor={`${brokerId}-${field.key}`}>{field.label}</Label>
                  <Input
                    id={`${brokerId}-${field.key}`}
                    type={field.type}
                    value={credentials[field.key] || ''}
                    onChange={(e) => handleCredentialChange(field.key, e.target.value)}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-2 mt-2">
          <div className="flex items-center gap-2">
            {connected ? (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleDisconnect}
                >
                  Disconnect
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleTestConnection} 
                  disabled={connecting}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${connecting ? 'animate-spin' : ''}`} />
                  Test Connection
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={showCredentials ? "outline" : "default"} 
                  size="sm" 
                  onClick={() => setShowCredentials(!showCredentials)}
                >
                  {showCredentials ? 'Hide' : 'Enter Credentials'}
                </Button>
                {showCredentials && (
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleConnect} 
                    disabled={connecting || Object.keys(credentials).length === 0}
                  >
                    {connecting ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : (
                      'Connect'
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => window.open(broker.url, '_blank')}
            >
              <Settings className="h-4 w-4" />
              <span className="sr-only">Broker Settings</span>
            </Button>
            
            {lastTested && (
              <span className="text-xs text-muted-foreground">
                Last tested: {lastTested}
              </span>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}