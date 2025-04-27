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
    console.log("Copy trade button clicked for signal:", signal);
    
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
      
      console.log("Trade details to copy:", tradeDetails);
      
      // Try modern clipboard API first
      let copySucceeded = false;
      
      // Check if running in a secure context (https or localhost)
      const isSecureContext = window.isSecureContext;
      console.log("Is secure context:", isSecureContext);
      
      if (isSecureContext && navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        try {
          await navigator.clipboard.writeText(tradeDetails);
          console.log("Clipboard API succeeded");
          copySucceeded = true;
        } catch (clipboardError) {
          console.warn('Clipboard API failed:', clipboardError);
        }
      } else {
        console.warn('Clipboard API not available, trying fallback');
      }
      
      // Fallback method if the modern API failed or isn't available
      if (!copySucceeded) {
        const textArea = document.createElement('textarea');
        textArea.value = tradeDetails;
        
        // Make the textarea visible but outside normal view
        textArea.style.position = 'fixed';
        textArea.style.left = '0';
        textArea.style.top = '0';
        textArea.style.width = '2em';
        textArea.style.height = '2em';
        textArea.style.padding = '0';
        textArea.style.border = 'none';
        textArea.style.outline = 'none';
        textArea.style.boxShadow = 'none';
        textArea.style.background = 'transparent';
        
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
          copySucceeded = document.execCommand('copy');
          console.log("execCommand fallback succeeded:", copySucceeded);
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