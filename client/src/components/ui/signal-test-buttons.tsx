import { useState } from 'react';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../ui/card';
import { useToast } from '../ui/use-toast';
import axios from 'axios';

export function SignalTestButtons() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const sendTestSignal = async (direction: string, symbol: string = 'BTCUSDT') => {
    setIsLoading(true);
    
    try {
      const response = await axios.post('/api/webhooks/tradingview', {
        passphrase: 'test-signal',
        symbol,
        side: direction,
        entry: direction === 'buy' ? 35000 : 35500,
        stop: direction === 'buy' ? 34500 : 36000,
        target: direction === 'buy' ? 36000 : 34000
      });
      
      if (response.status === 200) {
        toast({
          title: `${direction.toUpperCase()} signal for ${symbol} sent!`,
          description: 'The webhook was processed successfully',
          variant: direction === 'buy' ? 'default' : 'destructive'
        });
      } else {
        throw new Error(`Failed to send test signal: ${response.statusText}`);
      }
    } catch (error) {
      console.error("Error sending test signal:", error);
      toast({
        title: "Failed to send signal",
        description: error instanceof Error ? error.message : "Unknown error",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Legacy Signal Test</CardTitle>
        <CardDescription>
          Test the webhook-based signal system by sending various test signals
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Button
            onClick={() => sendTestSignal('buy', 'BTCUSDT')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            BUY Bitcoin
          </Button>
          <Button
            onClick={() => sendTestSignal('sell', 'BTCUSDT')}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            SELL Bitcoin
          </Button>
          <Button
            onClick={() => sendTestSignal('buy', 'ETHUSD')}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            BUY Ethereum
          </Button>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col sm:flex-row gap-2">
        <Button
          onClick={() => sendTestSignal('buy', 'EURUSD')}
          disabled={isLoading}
          className="w-full bg-green-600 hover:bg-green-700"
        >
          BUY EUR/USD
        </Button>
        <Button
          onClick={() => sendTestSignal('sell', 'EURUSD')}
          disabled={isLoading}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          SELL EUR/USD
        </Button>
      </CardFooter>
    </Card>
  );
}