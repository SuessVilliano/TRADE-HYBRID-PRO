import React, { useState, useEffect } from 'react';
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
import { RefreshCw, Info, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '../ui/use-toast';

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
  const { toast } = useToast();

  // Load webhook logs on component mount
  useEffect(() => {
    fetchLogs();
  }, []);

  // Fetch webhook logs from server
  const fetchLogs = async () => {
    setIsRefreshing(true);
    setError(null);
    try {
      // Use the public endpoint that doesn't require authentication
      const response = await axios.get('/api/webhooks/logs-public');
      if (response.data && response.data.logs) {
        setLogs(response.data.logs);
      } else {
        setLogs([]);
        setError('No logs were returned from the server');
      }
    } catch (error: any) {
      console.error('Error fetching webhook logs:', error);
      setError(error.message || 'Failed to fetch webhook logs');
      toast({
        title: 'Error',
        description: 'Failed to fetch webhook logs',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={fetchLogs}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
              <Button variant="outline" onClick={fetchLogs}>
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
              <Button variant="outline" onClick={fetchLogs}>
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