import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { FormControl, FormField, FormItem, FormLabel } from '../ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Input } from '../ui/input';
import { useToast } from '../ui/use-toast';
import axios from 'axios';

export function MCPTestPanel() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [provider, setProvider] = useState('hybrid');
  const [symbol, setSymbol] = useState('BTCUSDT');
  const [direction, setDirection] = useState('buy');
  const [lastSignalId, setLastSignalId] = useState('');

  // Test sending a signal
  const sendTestSignal = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(`/api/mcp-test/signal`, {
        params: {
          provider,
          symbol,
          direction
        }
      });
      
      if (response.status === 200) {
        const data = response.data;
        setLastSignalId(data.signalId);
        
        toast({
          title: `${direction.toUpperCase()} signal for ${symbol} sent via MCP!`,
          description: `Provider: ${provider} | Signal ID: ${data.signalId} | Clients: ${data.clientCount}`,
          variant: direction === 'buy' ? 'default' : 'destructive'
        });
      } else {
        throw new Error(`Failed to send MCP test signal: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending MCP test signal:", error);
      toast({
        title: "Failed to send MCP signal",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Test updating a signal
  const updateSignalStatus = async (status: string) => {
    if (!lastSignalId) {
      toast({
        title: "No signal to update",
        description: "Please send a signal first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.get(`/api/mcp-test/signal-update`, {
        params: {
          signalId: lastSignalId,
          status,
          profit: status === 'tp_hit' ? 250 : (status === 'sl_hit' ? -100 : 0)
        }
      });
      
      if (response.status === 200) {
        toast({
          title: `Signal status updated`,
          description: `Signal ID: ${lastSignalId} | New status: ${status}`,
          variant: status === 'tp_hit' ? 'default' : (status === 'sl_hit' ? 'destructive' : 'default')
        });
      } else {
        throw new Error(`Failed to update signal status: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error updating signal status:", error);
      toast({
        title: "Failed to update signal status",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Send test notification
  const sendTestNotification = async () => {
    setIsLoading(true);
    
    try {
      const response = await axios.get(`/api/mcp-test/notification`, {
        params: {
          title: "MCP System Notification",
          message: "This is a test notification from the MCP system",
          level: "info"
        }
      });
      
      if (response.status === 200) {
        toast({
          title: `System notification sent`,
          description: `Notification sent to ${response.data.clientCount} clients`,
          variant: "default"
        });
      } else {
        throw new Error(`Failed to send notification: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending notification:", error);
      toast({
        title: "Failed to send notification",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Get symbol suggestions based on type
  const getSymbolOptions = () => {
    return [
      { value: 'BTCUSDT', label: 'Bitcoin (BTCUSDT)' },
      { value: 'ETHUSDT', label: 'Ethereum (ETHUSDT)' },
      { value: 'SOLUSDT', label: 'Solana (SOLUSDT)' },
      { value: 'EURUSD', label: 'EUR/USD' },
      { value: 'GBPUSD', label: 'GBP/USD' },
      { value: 'ES1!', label: 'S&P 500 E-mini' },
      { value: 'NQ1!', label: 'Nasdaq E-mini' }
    ];
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>MCP Signal Test</CardTitle>
        <CardDescription>
          Test the Message Control Plane (MCP) system by sending various test signals
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <FormField>
            <FormItem>
              <FormLabel>Provider</FormLabel>
              <Select
                value={provider}
                onValueChange={setProvider}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select provider" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="hybrid">Hybrid AI</SelectItem>
                  <SelectItem value="paradox">Paradox AI</SelectItem>
                  <SelectItem value="solaris">Solaris AI</SelectItem>
                  <SelectItem value="custom">Custom Provider</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
          
          <FormField>
            <FormItem>
              <FormLabel>Symbol</FormLabel>
              <Select
                value={symbol}
                onValueChange={setSymbol}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select symbol" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {getSymbolOptions().map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
          
          <FormField>
            <FormItem>
              <FormLabel>Direction</FormLabel>
              <Select
                value={direction}
                onValueChange={setDirection}
                disabled={isLoading}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select direction" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="buy">Buy / Long</SelectItem>
                  <SelectItem value="sell">Sell / Short</SelectItem>
                </SelectContent>
              </Select>
            </FormItem>
          </FormField>
        </div>
        
        {lastSignalId && (
          <div className="pt-2">
            <FormField>
              <FormItem>
                <FormLabel>Last Signal ID</FormLabel>
                <Input value={lastSignalId} readOnly />
              </FormItem>
            </FormField>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2 sm:flex-row">
        <Button
          onClick={sendTestSignal}
          disabled={isLoading}
          className={`w-full ${direction === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}`}
        >
          Send {direction.toUpperCase()} Signal
        </Button>
        
        {lastSignalId && (
          <>
            <Button
              onClick={() => updateSignalStatus('tp_hit')}
              disabled={isLoading}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              TP Hit
            </Button>
            <Button
              onClick={() => updateSignalStatus('sl_hit')}
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700"
            >
              SL Hit
            </Button>
            <Button
              onClick={sendTestNotification}
              disabled={isLoading}
              variant="outline"
              className="w-full"
            >
              Test Notification
            </Button>
          </>
        )}
      </CardFooter>
    </Card>
  );
}