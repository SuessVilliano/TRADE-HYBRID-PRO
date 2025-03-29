import { useState } from "react";
import { Button } from "./button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select";
import { toast } from "sonner";
import axios from "axios";

interface SignalTestButtonsProps {
  className?: string;
}

export function SignalTestButtons({ className }: SignalTestButtonsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [signalType, setSignalType] = useState("forex");
  
  const sendTestSignal = async () => {
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
  
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">Test Trading Signals</CardTitle>
        <CardDescription>
          Generate sample trading signals to test the notification system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3">
            <Select value={signalType} onValueChange={setSignalType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select signal type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="forex">Forex Signal</SelectItem>
                <SelectItem value="futures">Futures Signal</SelectItem>
                <SelectItem value="hybrid">Hybrid AI Signal</SelectItem>
                <SelectItem value="crypto">Crypto Signal</SelectItem>
              </SelectContent>
            </Select>
            
            <Button 
              variant="default" 
              onClick={sendTestSignal}
              disabled={isLoading}
            >
              {isLoading ? "Sending..." : "Send Test Signal"}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground">
            This will generate a sample signal from the Cash Cow indicator in the format you selected.
            The signal will appear in the signals panel and trigger a notification.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}