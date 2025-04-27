import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { toast } from "sonner";
import axios from "axios";
import { TrendingUp, Bot, Sparkles, Share2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Label } from "./label";

interface SignalTestButtonsProps {
  className?: string;
}

export function SignalTestButtons({ className }: SignalTestButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signalType, setSignalType] = useState("crypto");
  const [signalSymbol, setSignalSymbol] = useState("BTCUSDT");
  const [signalDirection, setSignalDirection] = useState("buy");
  const [provider, setProvider] = useState("ParadoxAI");
  
  // Function to send a test signal via Cash Cow webhook format (old method)
  const sendCashCowSignal = async () => {
    try {
      setIsLoading(true);
      
      const response = await axios.post(`/api/test/webhook/cashcow?type=${signalType}`);
      
      if (response.status === 200) {
        toast.success(`Test ${signalType} signal sent successfully!`);
        console.log("Test signal response:", response.data);
      } else {
        throw new Error(`Failed to send test signal: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending test signal:", error);
      toast.error("Failed to send test signal. Check console for details.");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to send a WebSocket test signal directly using the test endpoint
  const sendWebSocketSignal = async () => {
    try {
      setIsLoading(true);
      
      // Create API URL with query parameters for the test signal
      const apiUrl = `/api/test/broadcast-signal?symbol=${signalSymbol}&side=${signalDirection}&provider=${provider}`;
      
      toast.loading("Sending signal via WebSocket...");
      
      const response = await axios.get(apiUrl);
      
      if (response.status === 200) {
        toast.success(`${signalDirection.toUpperCase()} signal for ${signalSymbol} sent!`, {
          description: `Provider: ${provider} | Sent to ${response.data.clientCount} clients`
        });
        console.log("WebSocket signal response:", response.data);
      } else {
        throw new Error(`Failed to send WebSocket signal: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending WebSocket test signal:", error);
      toast.error("Failed to send WebSocket signal", {
        description: "Check console for details"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Main send function that determines which method to use
  const sendTestSignal = async () => {
    // Use the WebSocket broadcast method for better reliability
    await sendWebSocketSignal();
  };
  
  // Get symbol suggestions based on selected type
  const getSymbolSuggestions = () => {
    switch (signalType) {
      case 'crypto':
        return [
          { value: 'BTCUSDT', label: 'Bitcoin (BTCUSDT)' },
          { value: 'ETHUSDT', label: 'Ethereum (ETHUSDT)' },
          { value: 'SOLUSDT', label: 'Solana (SOLUSDT)' },
          { value: 'DOGEUSDT', label: 'Dogecoin (DOGEUSDT)' }
        ];
      case 'forex':
        return [
          { value: 'EURUSD', label: 'EUR/USD' },
          { value: 'GBPUSD', label: 'GBP/USD' },
          { value: 'USDJPY', label: 'USD/JPY' }
        ];
      case 'futures':
        return [
          { value: 'ES', label: 'E-mini S&P 500 (ES)' },
          { value: 'NQ', label: 'E-mini NASDAQ (NQ)' },
          { value: 'CL', label: 'Crude Oil (CL)' }
        ];
      default:
        return [
          { value: 'BTCUSDT', label: 'Bitcoin (BTCUSDT)' },
          { value: 'EURUSD', label: 'EUR/USD' },
          { value: 'ES', label: 'E-mini S&P 500 (ES)' }
        ];
    }
  };
  
  // Provider options based on selected type
  const getProviderOptions = () => {
    switch (signalType) {
      case 'crypto':
        return [
          { value: 'ParadoxAI', label: 'Paradox AI' },
          { value: 'SolarisBot', label: 'Solaris Bot' },
          { value: 'CryptoHybrid', label: 'Crypto Hybrid' }
        ];
      case 'forex':
        return [
          { value: 'ForexMaster', label: 'Forex Master' },
          { value: 'FXHybrid', label: 'FX Hybrid' }
        ];
      case 'futures':
        return [
          { value: 'FuturesOracle', label: 'Futures Oracle' },
          { value: 'IndexHybrid', label: 'Index Hybrid' }
        ];
      case 'hybrid':
        return [
          { value: 'QuantumHybrid', label: 'Quantum Hybrid AI' },
          { value: 'NexusAI', label: 'Nexus AI' }
        ];
      default:
        return [
          { value: 'ParadoxAI', label: 'Paradox AI' },
          { value: 'NexusAI', label: 'Nexus AI' }
        ];
    }
  };
  
  // Get the icon for the current signal type
  const getSignalTypeIcon = () => {
    switch (signalType) {
      case 'forex':
        return <TrendingUp className="h-4 w-4 mr-2 text-blue-500" />;
      case 'futures':
        return <Share2 className="h-4 w-4 mr-2 text-orange-500" />;
      case 'hybrid':
        return <Sparkles className="h-4 w-4 mr-2 text-purple-500" />;
      case 'crypto':
      default:
        return <Bot className="h-4 w-4 mr-2 text-green-500" />;
    }
  };
  
  // Update symbol when type changes
  const handleTypeChange = (type: string) => {
    setSignalType(type);
    // Set default symbol based on type
    const symbols = getSymbolSuggestions();
    if (symbols.length > 0) {
      setSignalSymbol(symbols[0].value);
    }
    
    // Set default provider based on type
    const providers = getProviderOptions();
    if (providers.length > 0) {
      setProvider(providers[0].value);
    }
  };
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base flex items-center">
          {getSignalTypeIcon()}
          Test Trading Signals
        </CardTitle>
        <CardDescription>
          Generate sample AI signals to test the notification system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          {/* Signal Type Selection */}
          <div className="space-y-2">
            <Label>Signal Type</Label>
            <Select value={signalType} onValueChange={handleTypeChange}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select signal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="crypto">Crypto Signal</SelectItem>
                <SelectItem value="forex">Forex Signal</SelectItem>
                <SelectItem value="futures">Futures Signal</SelectItem>
                <SelectItem value="hybrid">Hybrid AI Signal</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          {/* Symbol Selection */}
          <div className="space-y-2">
            <Label>Symbol</Label>
            <Select value={signalSymbol} onValueChange={setSignalSymbol}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select symbol" />
              </SelectTrigger>
              <SelectContent>
                {getSymbolSuggestions().map(symbol => (
                  <SelectItem key={symbol.value} value={symbol.value}>
                    {symbol.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Direction Selection */}
          <div className="space-y-2">
            <Label>Direction</Label>
            <RadioGroup 
              value={signalDirection} 
              onValueChange={setSignalDirection}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="buy" id="buy" />
                <Label htmlFor="buy" className="text-green-600 font-medium">BUY</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="sell" id="sell" />
                <Label htmlFor="sell" className="text-red-600 font-medium">SELL</Label>
              </div>
            </RadioGroup>
          </div>
          
          {/* Provider Selection */}
          <div className="space-y-2">
            <Label>Signal Provider</Label>
            <Select value={provider} onValueChange={setProvider}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                {getProviderOptions().map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <Button 
            variant="default" 
            onClick={sendTestSignal}
            disabled={isLoading}
            className="mt-2"
          >
            {isLoading ? "Sending..." : "Generate Test AI Signal"}
          </Button>
          
          <p className="text-xs text-muted-foreground">
            This will generate a sample AI signal in the format you selected.
            The signal will appear in the signals panel via WebSocket and trigger a notification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}