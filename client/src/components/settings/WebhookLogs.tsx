import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '../ui/card';
import { Badge } from '../ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { RefreshCw, Info, CheckCircle, AlertCircle, Bell } from 'lucide-react';
import { useToast } from '../ui/use-toast';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';

interface WebhookLog {
  id: string;
  webhookId: string;
  userId: string;
  broker: string;
  payload: any;
  result: {
    success: boolean;
    message?: string;
    orderId?: string;
    errors?: string[];
    details?: any;
  };
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  responseTime?: number;
}

export function WebhookLogs() {
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isSendingTest, setIsSendingTest] = useState(false);
  const [lastLogId, setLastLogId] = useState<string | null>(null);
  const { toast } = useToast();

  // Load webhook logs on component mount and set up auto-refresh
  useEffect(() => {
    // Initial load of logs
    const loadLogs = () => {
      fetchLogs(true);
    };
    loadLogs();

    // Set up auto-refresh if enabled
    let intervalId: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        console.log('Auto-refreshing webhook logs...');
        fetchLogs(false); // Don't show loading indicator on auto-refresh
      }, 10000); // Refresh every 10 seconds
    }

    // Cleanup interval on component unmount or when autoRefresh changes
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh]); // Re-run effect when autoRefresh changes

  // Fetch webhook logs from server
  const fetchLogs = async (showLoadingIndicator = true) => {
    if (showLoadingIndicator) {
      setIsRefreshing(true);
    }
    setError(null);
    
    try {
      // Use the public endpoint that doesn't require authentication
      const response = await axios.get('/api/webhooks/logs-public');
      
      if (response.data && response.data.logs) {
        const newLogs = response.data.logs;
        
        if (newLogs.length > logs.length && logs.length > 0) {
          // Check if there are new logs
          const oldIds = new Set(logs.map((log: WebhookLog) => log.id));
          const newLogItems = newLogs.filter((log: WebhookLog) => !oldIds.has(log.id));
          
          if (newLogItems.length > 0) {
            console.log(`Found ${newLogItems.length} new logs!`);
            // Show a notification for new logs
            toast({
              title: `${newLogItems.length} New Webhook${newLogItems.length > 1 ? 's' : ''} Received`,
              description: `${newLogItems.length} new webhook execution${newLogItems.length > 1 ? 's' : ''} have been logged.`,
              variant: 'default',
            });
          }
        }
        
        setLogs(newLogs);
        
        // Check if our test log appeared (if we have a lastLogId)
        if (lastLogId) {
          const foundTestLog = newLogs.find((log: WebhookLog) => log.id === lastLogId);
          if (foundTestLog) {
            console.log('Test log was found in the logs!');
            setLastLogId(null); // Clear the last log ID since we found it
            
            toast({
              title: 'Test Webhook Found',
              description: 'The test webhook was successfully logged and displayed!',
              variant: 'default',
            });
          }
        }
      } else {
        if (showLoadingIndicator) {
          setLogs([]);
          setError('No logs were returned from the server');
        }
      }
    } catch (error: any) {
      console.error('Error fetching webhook logs:', error);
      if (showLoadingIndicator) {
        setError(error.message || 'Failed to fetch webhook logs');
        toast({
          title: 'Error',
          description: 'Failed to fetch webhook logs',
          variant: 'destructive'
        });
      }
    } finally {
      if (showLoadingIndicator) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  };
  
  // Send a test webhook to verify logging works
  const sendTestWebhook = async () => {
    setIsSendingTest(true);
    try {
      // Call our test endpoint to create a test webhook log
      const response = await axios.get('/api/test/create-log');
      
      if (response.data && response.data.success) {
        // Save the test log ID to check for it in subsequent refreshes
        setLastLogId(response.data.log_id);
        
        toast({
          title: 'Test Webhook Sent',
          description: 'A test webhook has been sent to the system. It should appear in the logs shortly.',
          variant: 'default',
        });
        
        // Immediately refresh logs to try to see the new test
        fetchLogs();
      } else {
        toast({
          title: 'Error',
          description: 'Failed to create test webhook log',
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      console.error('Error sending test webhook:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send test webhook',
        variant: 'destructive'
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Format payload for display
  const formatPayload = (payload: any) => {
    try {
      if (typeof payload === 'string') {
        return payload;
      }
      return JSON.stringify(payload, null, 2).substring(0, 100) + (JSON.stringify(payload).length > 100 ? '...' : '');
    } catch (e) {
      return 'Invalid payload format';
    }
  };

  // Get broker display name
  const getBrokerDisplayName = (broker: string) => {
    const brokerMap: { [key: string]: string } = {
      'alpaca': 'Alpaca',
      'oanda': 'Oanda',
      'ninjatrader': 'NinjaTrader',
      'tradingview': 'TradingView',
      'generic': 'Generic',
    };
    
    return brokerMap[broker.toLowerCase()] || broker;
  };
  
  // Get status badge
  const getStatusBadge = (success: boolean) => {
    if (success) {
      return (
        <Badge variant="success" className="bg-green-100 text-green-800 hover:bg-green-100 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Success
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100 flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Failed
        </Badge>
      );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Webhook Execution Logs</CardTitle>
            <CardDescription>
              View recent webhook executions and their results.
            </CardDescription>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="auto-refresh"
                checked={autoRefresh}
                onCheckedChange={setAutoRefresh}
              />
              <Label htmlFor="auto-refresh" className="text-sm">Auto Refresh</Label>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={sendTestWebhook}
              disabled={isSendingTest}
            >
              <Bell className={`h-4 w-4 ${isSendingTest ? 'animate-pulse' : ''}`} />
              Test Log
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => fetchLogs(true)}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="text-center py-12 border rounded-lg bg-background">
            <AlertCircle className="mx-auto h-12 w-12 text-destructive" />
            <h3 className="mt-4 text-lg font-medium">Error loading webhook logs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {error}
            </p>
            <div className="mt-4">
              <Button 
                variant="outline" 
                onClick={(e) => {
                  e.preventDefault();
                  fetchLogs(true);
                }}
              >
                Try Again
              </Button>
            </div>
          </div>
        ) : logs.length === 0 ? (
          <div className="text-center py-12 border rounded-lg bg-background">
            <Info className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No webhook logs found</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Webhook execution logs will appear here once your webhooks are triggered.
            </p>
            <div className="mt-4">
              <Button 
                variant="outline"
                onClick={(e) => {
                  e.preventDefault();
                  fetchLogs(true);
                }}
              >
                Refresh Logs
              </Button>
            </div>
          </div>
        ) : (
          <div className="border rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Broker</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payload</TableHead>
                    <TableHead>Result</TableHead>
                    <TableHead className="text-right">Response Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {formatDate(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="capitalize">
                          {getBrokerDisplayName(log.broker)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(log.result.success)}
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        <code className="text-xs bg-slate-100 p-1 rounded text-black">
                          {formatPayload(log.payload)}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate text-white">
                        {log.result.message || (log.result.success ? 'Success' : 'Failed')}
                        {log.result.errors && log.result.errors.length > 0 && (
                          <div className="text-xs text-red-400 font-semibold">
                            {Array.isArray(log.result.errors) ? log.result.errors[0] : log.result.errors}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right whitespace-nowrap">
                        {log.responseTime ? `${log.responseTime}ms` : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}