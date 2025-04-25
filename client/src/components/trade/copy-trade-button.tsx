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
${signal.notes ? `Notes: ${signal.notes}` : ''}
${signal.status === 'active' ? 'Status: ACTIVE' : ''}
      `.trim();
      
      // Try modern clipboard API first
      let copySucceeded = false;
      
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(tradeDetails);
          copySucceeded = true;
        }
      } catch (clipboardError) {
        console.warn('Native clipboard API failed, trying fallback:', clipboardError);
      }
      
      // Fallback method if the modern API failed or isn't available
      if (!copySucceeded) {
        const textArea = document.createElement('textarea');
        textArea.value = tradeDetails;
        
        // Make the textarea out of viewport
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        textArea.style.zIndex = '-1000';
        textArea.style.opacity = '0';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          copySucceeded = document.execCommand('copy');
        } catch (e) {
          console.error('Fallback copy method failed:', e);
        }
        
        document.body.removeChild(textArea);
      }
      
      if (copySucceeded) {
        // Show success message
        toast.success(`Signal copied successfully`, {
          description: `${signal.type.toUpperCase()} ${signal.symbol} at ${signal.entry}`,
          duration: 3000,
        });
      } else {
        throw new Error('Both copy methods failed');
      }
      
      // Also dispatch a custom event for trade panels that might be listening
      const event = new CustomEvent('copy-trade-signal', { 
        detail: { 
          signal,
          timestamp: new Date().toISOString()
        } 
      });
      window.dispatchEvent(event);
      
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