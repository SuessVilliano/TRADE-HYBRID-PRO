import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

interface BrokerStatus {
  connected: boolean;
  available: boolean;
  configuredCredentials: boolean;
  error: string | null;
}

interface BrokerStatusResponse {
  status: string;
  brokers: {
    alpaca: BrokerStatus;
    oanda: BrokerStatus;
  };
  timestamp: string;
}

const BrokerStatusIndicator: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusData, setStatusData] = useState<BrokerStatusResponse | null>(null);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  const fetchBrokerStatus = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get<BrokerStatusResponse>('/api/broker-status');
      
      setStatusData(response.data);
      setLastChecked(new Date());
    } catch (err) {
      console.error('Error checking broker status:', err);
      setError('Failed to check broker status. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrokerStatus();
    
    // Refresh status periodically (every 5 minutes)
    const interval = setInterval(fetchBrokerStatus, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    fetchBrokerStatus();
  };

  const getStatusIcon = (status: BrokerStatus) => {
    if (!status.configuredCredentials) {
      return <AlertCircle className="text-yellow-500" size={16} />;
    }
    
    if (status.connected) {
      return <CheckCircle className="text-green-500" size={16} />;
    }
    
    return <AlertCircle className="text-red-500" size={16} />;
  };

  const getStatusText = (status: BrokerStatus, broker: string) => {
    if (!status.configuredCredentials) {
      return `${broker} API credentials not configured`;
    }
    
    if (status.connected) {
      return `${broker} API connected`;
    }
    
    return status.error || `${broker} API connection failed`;
  };

  if (loading && !statusData) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Clock size={16} />
        <span>Checking broker connections...</span>
      </div>
    );
  }

  if (error && !statusData) {
    return (
      <div className="flex items-center gap-2 text-sm text-red-500">
        <AlertCircle size={16} />
        <span>{error}</span>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="p-1">
          <RefreshCw size={14} />
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-md border border-gray-200 p-3 bg-white shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">Broker Connections</h3>
        <Button variant="ghost" size="sm" onClick={handleRefresh} className="p-1" title="Refresh Status">
          <RefreshCw size={14} />
        </Button>
      </div>
      
      <div className="space-y-2">
        {statusData && (
          <>
            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData.brokers.alpaca)}
                      <span className="text-xs">Alpaca</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getStatusText(statusData.brokers.alpaca, 'Alpaca')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>

            <TooltipProvider>
              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(statusData.brokers.oanda)}
                      <span className="text-xs">Oanda</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{getStatusText(statusData.brokers.oanda, 'Oanda')}</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </>
        )}
      </div>
      
      {lastChecked && (
        <div className="mt-2 text-xs text-gray-400">
          Last checked: {lastChecked.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default BrokerStatusIndicator;