import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { AlertTriangle, CheckCircle, RefreshCw, Info, Server } from 'lucide-react';
import { ABATEV_CONFIG } from '@/lib/constants';

export default function ABATEVStatusPanel() {
  // State management
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'initializing'>('initializing');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isEnabled, setIsEnabled] = useState<boolean>(false);
  const [activeConnections, setActiveConnections] = useState<string[]>([]);
  const [stats, setStats] = useState<{
    ordersProcessed: number;
    averageExecutionTime: number;
    activeStrategies: number;
  }>({
    ordersProcessed: 0,
    averageExecutionTime: 0,
    activeStrategies: 0
  });
  const [error, setError] = useState<string | null>(null);

  // Fetch ABATEV status on component mount
  useEffect(() => {
    fetchStatus();
  }, []);

  // Fetch the current status of ABATEV
  const fetchStatus = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/abatev/status');
      const data = await response.json();
      
      if (data.success) {
        setStatus(data.connected ? 'connected' : 'disconnected');
        setIsEnabled(data.enabled || false);
        setActiveConnections(data.activeConnections || []);
        setStats({
          ordersProcessed: data.ordersProcessed || 0,
          averageExecutionTime: data.averageExecutionTime || 0,
          activeStrategies: data.activeStrategies || 0
        });
        setError(null);
      } else {
        setStatus('disconnected');
        setError(data.message || 'Failed to connect to ABATEV service');
      }
    } catch (err) {
      setStatus('disconnected');
      setError('Could not reach ABATEV service. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Toggle ABATEV system enabled state
  const toggleEnabled = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/abatev/toggle', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          enabled: !isEnabled
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setIsEnabled(data.enabled);
        fetchStatus(); // Refresh the status
      } else {
        setError(data.message || 'Failed to update ABATEV status');
      }
    } catch (err) {
      setError('Failed to update ABATEV status. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize or reset ABATEV system
  const initializeSystem = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/abatev/initialize', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStatus('connected');
        fetchStatus(); // Refresh the status
      } else {
        setError(data.message || 'Failed to initialize ABATEV system');
      }
    } catch (err) {
      setError('Failed to initialize ABATEV system. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
              <Server className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>ABATEV System</CardTitle>
              <CardDescription>
                Advanced Broker Aggregation & Trade Execution View
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {status === 'connected' ? (
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : status === 'initializing' ? (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Initializing
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
          ABATEV provides optimized trade execution by aggregating and analyzing multiple broker connections.
        </p>
        
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2 rounded-md mb-4 flex items-center">
            <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0" />
            <p className="text-sm">{error}</p>
          </div>
        )}
        
        {status === 'connected' && (
          <div className="space-y-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background border rounded-md p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Orders Processed</p>
                <p className="text-xl font-semibold">{stats.ordersProcessed}</p>
              </div>
              <div className="bg-background border rounded-md p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Avg. Execution Time</p>
                <p className="text-xl font-semibold">{stats.averageExecutionTime} ms</p>
              </div>
              <div className="bg-background border rounded-md p-3">
                <p className="text-xs font-medium text-muted-foreground mb-1">Active Strategies</p>
                <p className="text-xl font-semibold">{stats.activeStrategies}</p>
              </div>
            </div>
            
            <div className="bg-background border rounded-md p-3">
              <p className="text-xs font-medium text-muted-foreground mb-2">Connected Brokers</p>
              <div className="flex flex-wrap gap-2">
                {activeConnections.length > 0 ? (
                  activeConnections.map(broker => (
                    <Badge key={broker} variant="secondary" className="text-xs">
                      {broker}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No brokers connected</p>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Switch
                id="abatev-enabled"
                checked={isEnabled}
                onCheckedChange={toggleEnabled}
                disabled={isLoading}
              />
              <Label htmlFor="abatev-enabled" className="text-sm font-medium">
                Enable ABATEV Smart Routing
              </Label>
            </div>
            
            <div className="flex items-start gap-2 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-900/30 p-3 rounded-md">
              <Info className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900 dark:text-blue-300">
                <p className="font-medium">Optimal Performance</p>
                <p className="mt-1">
                  For best results, connect at least 2 broker accounts. ABATEV will automatically route trades based on your selected execution preset.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="flex flex-wrap items-center justify-between gap-2 mt-4">
          <div className="flex items-center gap-2">
            {status === 'disconnected' ? (
              <Button 
                variant="default" 
                size="sm" 
                onClick={initializeSystem} 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'Initialize ABATEV'
                )}
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={fetchStatus} 
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                Refresh Status
              </Button>
            )}
          </div>
          
          {status === 'connected' && (
            <div className="text-xs text-muted-foreground">
              Using Execution Preset: <span className="font-medium">{ABATEV_CONFIG.executionPresets.find(p => p.id === ABATEV_CONFIG.defaultExecutionPreset)?.name || ABATEV_CONFIG.defaultExecutionPreset}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}