import React, { useState, useEffect } from 'react';
import { 
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../ui/card";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Switch } from "../ui/switch";
import { useToast } from "../ui/use-toast";
import { Download, Check, Activity, AlertTriangle, Loader2, RefreshCw } from "lucide-react";
import { Link } from 'react-router-dom';

// Define connection status types
type ConnectionStatus = 'disconnected' | 'connecting' | 'connected' | 'error';

export function NinjaTraderConnection() {
  // State for connection status and UI elements
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('disconnected');
  const [apiKey, setApiKey] = useState<string>('');
  const [autoConnect, setAutoConnect] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [lastSignal, setLastSignal] = useState<string | null>(null);
  const [lastSignalTime, setLastSignalTime] = useState<string | null>(null);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const { toast } = useToast();

  // Simulate a connection check on component mount
  useEffect(() => {
    // Check for stored API key
    const storedApiKey = localStorage.getItem('ninjaTrader_apiKey');
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
    
    // Check for stored connection status
    const storedConnectionStatus = localStorage.getItem('ninjaTrader_connectionStatus');
    if (storedConnectionStatus && ['connected', 'connecting', 'error'].includes(storedConnectionStatus)) {
      setConnectionStatus(storedConnectionStatus as ConnectionStatus);
    }
    
    // Load connection preferences
    const storedAutoConnect = localStorage.getItem('ninjaTrader_autoConnect');
    if (storedAutoConnect === 'false') {
      setAutoConnect(false);
    }
    
    // Check for stored last signal
    const storedLastSignal = localStorage.getItem('ninjaTrader_lastSignal');
    const storedLastSignalTime = localStorage.getItem('ninjaTrader_lastSignalTime');
    if (storedLastSignal) {
      setLastSignal(storedLastSignal);
      setLastSignalTime(storedLastSignalTime);
    }
    
    // Auto-connect if enabled
    if (storedApiKey && autoConnect) {
      handleConnect();
    }
    
    // Simulate receiving a signal occasionally
    const signalInterval = setInterval(() => {
      if (connectionStatus === 'connected' && Math.random() > 0.7) {
        simulateSignalReceived();
      }
    }, 30000);
    
    return () => {
      clearInterval(signalInterval);
    };
  }, []);
  
  // Save connection state when it changes
  useEffect(() => {
    localStorage.setItem('ninjaTrader_connectionStatus', connectionStatus);
  }, [connectionStatus]);
  
  // Save API key when it changes
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('ninjaTrader_apiKey', apiKey);
    }
  }, [apiKey]);
  
  // Save auto-connect preference
  useEffect(() => {
    localStorage.setItem('ninjaTrader_autoConnect', String(autoConnect));
  }, [autoConnect]);
  
  // Handle connection attempt
  const handleConnect = () => {
    if (!apiKey) {
      toast({
        title: "API Key Required",
        description: "Please enter your API key to connect to NinjaTrader",
        variant: "destructive"
      });
      return;
    }
    
    setConnectionStatus('connecting');
    setIsLoading(true);
    
    // Simulate connection process
    setTimeout(() => {
      if (Math.random() > 0.2) { // 80% success rate
        setConnectionStatus('connected');
        toast({
          title: "Connected to NinjaTrader",
          description: "NinjaTrader connection established successfully",
          variant: "default"
        });
      } else {
        setConnectionStatus('error');
        toast({
          title: "Connection Failed",
          description: "Unable to connect to NinjaTrader. Check your API key and try again.",
          variant: "destructive"
        });
      }
      setIsLoading(false);
    }, 2000);
  };
  
  // Handle disconnection
  const handleDisconnect = () => {
    setConnectionStatus('disconnected');
    setIsLoading(true);
    
    // Simulate disconnection process
    setTimeout(() => {
      toast({
        title: "Disconnected",
        description: "NinjaTrader connection has been closed",
        variant: "default"
      });
      setIsLoading(false);
    }, 1000);
  };
  
  // Simulate receiving a signal
  const simulateSignalReceived = () => {
    const symbols = ['ES', 'NQ', 'YM', 'RTY', 'GC', 'CL', 'EURUSD', 'USDJPY'];
    const actions = ['BUY', 'SELL'];
    
    const symbol = symbols[Math.floor(Math.random() * symbols.length)];
    const action = actions[Math.floor(Math.random() * actions.length)];
    const price = (Math.random() * 1000 + 100).toFixed(2);
    
    const signal = `${action} ${symbol} @ ${price}`;
    setLastSignal(signal);
    
    const now = new Date();
    const timeString = now.toLocaleTimeString();
    setLastSignalTime(timeString);
    
    // Store signal info
    localStorage.setItem('ninjaTrader_lastSignal', signal);
    localStorage.setItem('ninjaTrader_lastSignalTime', timeString);
    
    // Show a toast notification
    toast({
      title: "Signal Received",
      description: `${signal}`,
      variant: "default"
    });
  };
  
  // Download the NinjaTrader adapter
  const handleDownload = () => {
    setIsDownloading(true);
    
    // Simulate download preparation
    setTimeout(() => {
      // Trigger download of the ZIP file
      const downloadLink = document.createElement('a');
      downloadLink.href = '/downloads/TradeHybrid_NinjaTrader_Adapter.zip';
      downloadLink.download = 'TradeHybrid_NinjaTrader_Adapter.zip';
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast({
        title: "Download Started",
        description: "The NinjaTrader adapter is being downloaded. Check your downloads folder.",
        variant: "default"
      });
      
      setIsDownloading(false);
    }, 1500);
  };
  
  // Get the appropriate status badge based on connection state
  const getStatusBadge = () => {
    switch (connectionStatus) {
      case 'connected':
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 flex items-center gap-1">
            <Check className="h-3 w-3" />
            Connected
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="outline" className="bg-yellow-100 text-yellow-800 flex items-center gap-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            Connecting
          </Badge>
        );
      case 'error':
        return (
          <Badge variant="outline" className="bg-red-100 text-red-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Connection Error
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="bg-slate-100 text-slate-800 flex items-center gap-1">
            <AlertTriangle className="h-3 w-3" />
            Disconnected
          </Badge>
        );
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">NinjaTrader Connection</CardTitle>
            <CardDescription>
              Connect to NinjaTrader for automated trading signals
            </CardDescription>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="connection" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="connection">Connection</TabsTrigger>
            <TabsTrigger value="status">Status & Logs</TabsTrigger>
          </TabsList>
          
          <TabsContent value="connection" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">API Key</Label>
                <Input 
                  id="apiKey" 
                  placeholder="Enter your NinjaTrader API key" 
                  value={apiKey} 
                  onChange={(e) => setApiKey(e.target.value)} 
                  disabled={connectionStatus === 'connected' || connectionStatus === 'connecting'} 
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Switch 
                  id="auto-connect" 
                  checked={autoConnect} 
                  onCheckedChange={setAutoConnect} 
                />
                <Label htmlFor="auto-connect">Auto-connect on page load</Label>
              </div>
              
              <div className="pt-4">
                <div className="flex flex-col space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                  {connectionStatus !== 'connected' ? (
                    <Button 
                      onClick={handleConnect} 
                      disabled={isLoading || !apiKey} 
                      className="gap-2"
                    >
                      {isLoading && connectionStatus === 'connecting' ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Activity className="h-4 w-4" />
                      )}
                      Connect to NinjaTrader
                    </Button>
                  ) : (
                    <Button 
                      onClick={handleDisconnect} 
                      variant="destructive" 
                      disabled={isLoading} 
                      className="gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <AlertTriangle className="h-4 w-4" />
                      )}
                      Disconnect
                    </Button>
                  )}
                  
                  <Button 
                    variant="outline" 
                    onClick={handleDownload} 
                    disabled={isDownloading} 
                    className="gap-2"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4" />
                    )}
                    Download NinjaTrader Adapter
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="status" className="space-y-4">
            <div className="space-y-4 pt-4">
              <div className="rounded-md border p-4">
                <div className="font-medium">Connection Status</div>
                <div className="text-sm text-muted-foreground">
                  {connectionStatus === 'connected' ? (
                    <span className="text-green-600">Connected and receiving signals</span>
                  ) : connectionStatus === 'connecting' ? (
                    <span className="text-yellow-600">Establishing connection to NinjaTrader...</span>
                  ) : connectionStatus === 'error' ? (
                    <span className="text-red-600">Connection error. Please check your API key and try again.</span>
                  ) : (
                    <span className="text-slate-600">Disconnected. Use the Connection tab to connect.</span>
                  )}
                </div>
              </div>
              
              <div className="rounded-md border p-4">
                <div className="font-medium">Last Signal Received</div>
                <div className="text-sm text-muted-foreground">
                  {lastSignal ? (
                    <div className="flex flex-col space-y-1">
                      <span className="font-semibold">{lastSignal}</span>
                      <span className="text-xs text-slate-500">Received at {lastSignalTime}</span>
                    </div>
                  ) : (
                    <span className="text-slate-600">No signals received yet</span>
                  )}
                </div>
              </div>
              
              <div className="rounded-md bg-black p-4 text-white">
                <div className="mb-2 font-medium text-white">Connection Log</div>
                <div className="text-xs font-mono space-y-1 max-h-[200px] overflow-y-auto">
                  {connectionStatus === 'connected' && (
                    <>
                      <div><span className="text-green-400">[INFO]</span> Connection established with NinjaTrader</div>
                      <div><span className="text-blue-400">[STATUS]</span> Listening for trading signals...</div>
                      {lastSignal && (
                        <div><span className="text-yellow-400">[SIGNAL]</span> Received: {lastSignal} at {lastSignalTime}</div>
                      )}
                    </>
                  )}
                  {connectionStatus === 'connecting' && (
                    <>
                      <div><span className="text-blue-400">[STATUS]</span> Connecting to NinjaTrader...</div>
                      <div><span className="text-blue-400">[STATUS]</span> Authenticating with API key...</div>
                    </>
                  )}
                  {connectionStatus === 'error' && (
                    <>
                      <div><span className="text-red-400">[ERROR]</span> Failed to connect to NinjaTrader</div>
                      <div><span className="text-red-400">[ERROR]</span> Authentication failed. Check your API key.</div>
                    </>
                  )}
                  {connectionStatus === 'disconnected' && (
                    <div><span className="text-slate-400">[STATUS]</span> Connection not established</div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex flex-col items-start space-y-2 border-t p-4">
        <div className="text-sm text-muted-foreground">
          <p>The NinjaTrader Adapter needs to be installed on your computer to receive signals.</p>
          <p className="mt-1">
            <Link href="/downloads/README.md" className="text-blue-600 hover:underline" target="_blank">
              View Documentation
            </Link>
            {" | "}
            <a href="/downloads/NinjaTraderAdapter.html" className="text-blue-600 hover:underline" target="_blank">
              Open Web Adapter
            </a>
          </p>
        </div>
      </CardFooter>
    </Card>
  );
}