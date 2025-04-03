import React, { useState } from 'react';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Copy, Check } from 'lucide-react';
import { TradeSignal } from '../../lib/services/trade-signal-service';

interface CopyTradeButtonProps {
  signal: TradeSignal;
  size?: 'default' | 'sm';
}

export function CopyTradeButton({ signal, size = 'default' }: CopyTradeButtonProps) {
  const [copying, setCopying] = useState(false);
  
  const copySignalToTrade = async () => {
    setCopying(true);
    
    try {
      // In a real implementation, this would send the signal to an actual trading system
      // For now we just simulate a successful copy operation
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast.success(`Signal copied successfully`, {
        description: `${signal.type.toUpperCase()} ${signal.symbol} at ${signal.entry}`,
        duration: 3000,
      });
      
      // If you had an API endpoint to create a trade:
      // await fetch('/api/trades/execute', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     signalId: signal.id,
      //     symbol: signal.symbol,
      //     type: signal.type,
      //     entry: signal.entry,
      //     stopLoss: signal.stopLoss,
      //     takeProfit: signal.takeProfit
      //   })
      // });
      
      // Set a successful state
      setCopying(true);
      setTimeout(() => {
        setCopying(false);
      }, 2000);
    } catch (error) {
      console.error('Error copying trade:', error);
      toast.error('Failed to copy trade', {
        description: 'There was an error processing your request',
      });
      setCopying(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      size={size === 'default' ? 'default' : 'icon'}
      className={size === 'default' ? 'gap-1' : 'h-7 w-7'}
      onClick={copySignalToTrade}
      disabled={copying}
    >
      {copying ? (
        <>
          <Check size={14} />
          {size === 'default' && 'Copied'}
        </>
      ) : (
        <>
          <Copy size={14} />
          {size === 'default' && 'Copy Trade'}
        </>
      )}
    </Button>
  );
}