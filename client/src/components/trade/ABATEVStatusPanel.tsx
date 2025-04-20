import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { abatevService, ABATEVConnection } from '@/lib/services/abatev-service';
import { ABATEV_CONFIG } from '@/lib/constants';

interface ABATEVStatusPanelProps {
  className?: string;
}

export default function ABATEVStatusPanel({ className = '' }: ABATEVStatusPanelProps) {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'error' | 'connecting'>('disconnected');
  const [connection, setConnection] = useState<ABATEVConnection | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Check ABATEV status on component mount
  useEffect(() => {
    updateStatus();

    // Add event listeners for connection status changes
    const handleConnect = (conn: ABATEVConnection) => {
      setStatus('connected');
      setConnection(conn);
    };

    const handleDisconnect = () => {
      setStatus('disconnected');
      setConnection(null);
    };

    const handleStatusUpdate = (data: { status: 'connected' | 'disconnected' | 'error' }) => {
      setStatus(data.status);
    };

    // Subscribe to ABATEV events
    abatevService.subscribe('connect', handleConnect);
    abatevService.subscribe('disconnect', handleDisconnect);
    abatevService.subscribe('status_update', handleStatusUpdate);

    // Periodically check status
    const intervalId = setInterval(() => {
      if (status !== 'connected') {
        updateStatus();
      }
    }, 30000); // Check every 30 seconds

    // Clean up on unmount
    return () => {
      abatevService.unsubscribe('connect', handleConnect);
      abatevService.unsubscribe('disconnect', handleDisconnect);
      abatevService.unsubscribe('status_update', handleStatusUpdate);
      clearInterval(intervalId);
    };
  }, [status]);

  const updateStatus = async () => {
    try {
      const currentStatus = abatevService.getConnectionStatus();
      setStatus(currentStatus);
      setConnection(abatevService.getConnection());
    } catch (error) {
      console.error('Error getting ABATEV status:', error);
      setStatus('error');
    }
  };

  const handleConnect = async () => {
    if (status === 'connecting' || status === 'connected') return;

    setIsLoading(true);
    setStatus('connecting');

    try {
      const success = await abatevService.connect();
      if (success) {
        toast.success('Connected to ABATEV', {
          description: 'Successfully connected to the advanced trade execution protocol'
        });
      } else {
        toast.error('Failed to connect to ABATEV', {
          description: 'Please try again later'
        });
      }
    } catch (error) {
      console.error('Error connecting to ABATEV:', error);
      toast.error('Connection Error', {
        description: 'An error occurred while connecting to ABATEV'
      });
      setStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    if (status !== 'connected') return;

    setIsLoading(true);

    try {
      const success = await abatevService.disconnect();
      if (success) {
        toast.success('Disconnected from ABATEV', {
          description: 'Successfully disconnected from the advanced trade execution protocol'
        });
      } else {
        toast.error('Failed to disconnect from ABATEV', {
          description: 'Please try again later'
        });
      }
    } catch (error) {
      console.error('Error disconnecting from ABATEV:', error);
      toast.error('Disconnection Error', {
        description: 'An error occurred while disconnecting from ABATEV'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // If ABATEV is not enabled in the config, don't render anything
  if (!ABATEV_CONFIG.enabled) {
    return null;
  }

  return (
    <div className={`rounded-lg border border-border bg-card p-4 shadow-sm ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium">ABATEV Status</h3>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {status === 'connected' ? 'Connected' : 
             status === 'connecting' ? 'Connecting...' : 
             status === 'error' ? 'Connection Error' : 'Disconnected'}
          </span>
          <div className={`w-3 h-3 rounded-full ${
            status === 'connected' ? 'bg-green-500' : 
            status === 'connecting' ? 'bg-yellow-500' : 
            status === 'error' ? 'bg-red-500' : 'bg-gray-500'
          }`}></div>
        </div>
      </div>

      {status === 'connected' && connection && (
        <div className="mb-4 space-y-2 text-sm">
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Connection ID:</span>
            <span className="font-mono truncate">{connection.id.substring(0, 12)}...</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Connected:</span>
            <span>{connection.lastConnected ? new Date(connection.lastConnected).toLocaleString() : 'N/A'}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Features:</span>
            <span>{connection.features.length} enabled</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <span className="text-muted-foreground">Brokers:</span>
            <span>{connection.supportedBrokers.length} supported</span>
          </div>
        </div>
      )}

      <div className="flex justify-end space-x-2">
        {status !== 'connected' ? (
          <button
            onClick={handleConnect}
            disabled={isLoading || status === 'connecting'}
            className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading || status === 'connecting' ? 'Connecting...' : 'Connect'}
          </button>
        ) : (
          <button
            onClick={handleDisconnect}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Disconnecting...' : 'Disconnect'}
          </button>
        )}
      </div>

      <div className="mt-4 text-xs text-muted-foreground">
        <p>ABATEV (Advanced Broker Aggregation & Trade Execution View) provides optimal order routing across multiple brokerages for the best execution.</p>
      </div>
    </div>
  );
}