import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { SUPPORTED_BROKERS } from '@/lib/constants';

interface BrokerConnectionPanelProps {
  brokerId: string;
  className?: string;
}

export default function BrokerConnectionPanel({ 
  brokerId, 
  className = '' 
}: BrokerConnectionPanelProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [hasCredentials, setHasCredentials] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState<Record<string, string>>({});
  const [showForm, setShowForm] = useState(false);

  // Find broker details from supported brokers list
  const broker = SUPPORTED_BROKERS.find(b => b.id === brokerId);

  useEffect(() => {
    // Check if we have credentials stored for this broker
    const checkCredentials = async () => {
      try {
        const response = await fetch(`/api/brokers/${brokerId}/credentials-status`);
        if (response.ok) {
          const data = await response.json();
          setHasCredentials(data.hasCredentials);
          // If we have credentials, check the connection status
          if (data.hasCredentials) {
            checkConnection();
          }
        }
      } catch (error) {
        console.error(`Error checking credentials for ${brokerId}:`, error);
      }
    };

    // Initialize the form with empty values for all credential fields
    if (broker) {
      const initialForm: Record<string, string> = {};
      broker.credentialFields.forEach(field => {
        initialForm[field.key] = '';
      });
      setCredentialsForm(initialForm);
    }

    checkCredentials();
  }, [brokerId, broker]);

  // Check connection status
  const checkConnection = async () => {
    try {
      const response = await fetch(`/api/brokers/${brokerId}/status`);
      if (response.ok) {
        const data = await response.json();
        setIsConnected(data.connected);
      }
    } catch (error) {
      console.error(`Error checking connection for ${brokerId}:`, error);
      setIsConnected(false);
    }
  };

  // Connect to broker
  const connectToBroker = async () => {
    if (!hasCredentials) {
      setShowForm(true);
      return;
    }

    setIsConnecting(true);
    try {
      const response = await fetch(`/api/brokers/${brokerId}/connect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setIsConnected(true);
          toast.success(`Connected to ${broker?.name || brokerId}`, {
            description: 'Successfully established connection',
          });
        } else {
          toast.error(`Failed to connect to ${broker?.name || brokerId}`, {
            description: data.message || 'Connection attempt failed',
          });
        }
      } else {
        toast.error(`Error connecting to ${broker?.name || brokerId}`, {
          description: 'Server returned an error response',
        });
      }
    } catch (error) {
      console.error(`Error connecting to ${brokerId}:`, error);
      toast.error(`Connection Error`, {
        description: `An error occurred while connecting to ${broker?.name || brokerId}`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Disconnect from broker
  const disconnectFromBroker = async () => {
    setIsConnecting(true);
    try {
      const response = await fetch(`/api/brokers/${brokerId}/disconnect`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setIsConnected(false);
        toast.success(`Disconnected from ${broker?.name || brokerId}`, {
          description: 'Successfully disconnected',
        });
      } else {
        toast.error(`Failed to disconnect from ${broker?.name || brokerId}`, {
          description: 'Server returned an error response',
        });
      }
    } catch (error) {
      console.error(`Error disconnecting from ${brokerId}:`, error);
      toast.error(`Disconnection Error`, {
        description: `An error occurred while disconnecting from ${broker?.name || brokerId}`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Save credentials
  const saveCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsConnecting(true);

    try {
      const response = await fetch(`/api/brokers/${brokerId}/credentials`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentialsForm),
      });

      if (response.ok) {
        setHasCredentials(true);
        setShowForm(false);
        toast.success(`Saved credentials for ${broker?.name || brokerId}`, {
          description: 'API keys saved successfully',
        });
        // Attempt to connect with the new credentials
        await connectToBroker();
      } else {
        const data = await response.json();
        toast.error(`Failed to save credentials`, {
          description: data.message || 'Server returned an error response',
        });
      }
    } catch (error) {
      console.error(`Error saving credentials for ${brokerId}:`, error);
      toast.error(`Error Saving Credentials`, {
        description: `An error occurred while saving credentials for ${broker?.name || brokerId}`,
      });
    } finally {
      setIsConnecting(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (key: string, value: string) => {
    setCredentialsForm(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  // If broker is not found, don't render anything
  if (!broker) {
    return null;
  }

  return (
    <div className={`rounded-lg border p-4 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src={broker.logo}
            alt={`${broker.name} Logo`}
            className="w-8 h-8"
          />
          <div>
            <h3 className="font-medium">{broker.name}</h3>
            <p className="text-xs text-muted-foreground">{broker.type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {isConnected ? 'Connected' : hasCredentials ? 'Disconnected' : 'Not Configured'}
          </span>
          <div className={`w-3 h-3 rounded-full ${
            isConnected ? 'bg-green-500' : 
            hasCredentials ? 'bg-yellow-500' : 'bg-gray-500'
          }`}></div>
        </div>
      </div>

      <p className="mt-2 text-sm text-muted-foreground">
        {broker.description}
      </p>

      {showForm && (
        <form onSubmit={saveCredentials} className="mt-4 space-y-3">
          {broker.credentialFields.map(field => (
            <div key={field.key} className="space-y-1">
              <label htmlFor={`${brokerId}-${field.key}`} className="text-sm font-medium">
                {field.label}
              </label>
              {field.type === 'checkbox' ? (
                <input
                  type="checkbox"
                  id={`${brokerId}-${field.key}`}
                  checked={credentialsForm[field.key] === 'true'}
                  onChange={e => handleInputChange(field.key, e.target.checked ? 'true' : 'false')}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
              ) : (
                <input
                  type={field.type}
                  id={`${brokerId}-${field.key}`}
                  value={credentialsForm[field.key] || ''}
                  onChange={e => handleInputChange(field.key, e.target.value)}
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  required
                />
              )}
            </div>
          ))}
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="px-3 py-1 text-sm border rounded-md bg-background"
              disabled={isConnecting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 text-sm text-white rounded-md bg-primary"
              disabled={isConnecting}
            >
              {isConnecting ? 'Saving...' : 'Save Credentials'}
            </button>
          </div>
        </form>
      )}

      {!showForm && (
        <div className="mt-4 flex justify-end space-x-2">
          {!hasCredentials ? (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1 text-sm border rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Configure
            </button>
          ) : !isConnected ? (
            <button
              onClick={connectToBroker}
              disabled={isConnecting}
              className="px-3 py-1 text-sm text-white rounded-md bg-primary hover:bg-primary/90 disabled:opacity-50"
            >
              {isConnecting ? 'Connecting...' : 'Connect'}
            </button>
          ) : (
            <button
              onClick={disconnectFromBroker}
              disabled={isConnecting}
              className="px-3 py-1 text-sm rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
            >
              {isConnecting ? 'Disconnecting...' : 'Disconnect'}
            </button>
          )}
          {hasCredentials && (
            <button
              onClick={() => setShowForm(true)}
              className="px-3 py-1 text-sm border rounded-md bg-background hover:bg-accent"
            >
              Edit Credentials
            </button>
          )}
        </div>
      )}
    </div>
  );
}