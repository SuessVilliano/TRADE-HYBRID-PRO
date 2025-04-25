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
      // Create a formatted string of the trade details to copy to clipboard
      const tradeDetails = `
${signal.type.toUpperCase()} ${signal.symbol}
Entry: ${signal.entry}
Stop Loss: ${signal.stopLoss}
Take Profit: ${signal.takeProfit}
Risk/Reward: ${((signal.takeProfit - signal.entry) / (signal.entry - signal.stopLoss)).toFixed(1)}
      `.trim();
      
      // Copy the formatted trade details to clipboard
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(tradeDetails);
      } else {
        // Fallback for browsers that don't support the Clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = tradeDetails;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      
      // Show success message
      toast.success(`Signal copied successfully`, {
        description: `${signal.type.toUpperCase()} ${signal.symbol} at ${signal.entry}`,
        duration: 3000,
      });
      
      // Reset copying state after a delay
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