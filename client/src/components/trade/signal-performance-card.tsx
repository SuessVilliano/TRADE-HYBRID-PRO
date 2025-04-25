import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Copy,
  Check
} from 'lucide-react';
import { TradeSignal } from '@/lib/services/trade-signal-service';
import { SignalPerformanceChart } from './signal-performance-chart';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface SignalPerformanceCardProps {
  signal: TradeSignal;
  className?: string;
}

export function SignalPerformanceCard({ signal, className }: SignalPerformanceCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [copying, setCopying] = useState(false);
  
  // Calculate time elapsed since signal
  const getElapsedTime = () => {
    const now = new Date();
    const elapsed = now.getTime() - signal.timestamp.getTime();
    
    const minutes = Math.floor(elapsed / (1000 * 60));
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
  };
  
  // Format currency with appropriate decimal places
  const formatCurrency = (value: number) => {
    if (value < 0.1) return value.toFixed(6);
    if (value < 1) return value.toFixed(4);
    if (value < 10) return value.toFixed(3);
    if (value < 1000) return value.toFixed(2);
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };
  
  // Calculate risk/reward ratio
  const getRiskRewardRatio = () => {
    const risk = Math.abs(signal.entry - signal.stopLoss);
    const reward = Math.abs(signal.takeProfit - signal.entry);
    return (reward / risk).toFixed(1);
  };
  
  // Copy signal to clipboard
  const copySignal = async () => {
    setCopying(true);
    
    try {
      // Create a formatted string of the trade details
      const tradeDetails = `
${signal.type.toUpperCase()} ${signal.symbol}
Entry: ${formatCurrency(signal.entry)}
Stop Loss: ${formatCurrency(signal.stopLoss)}
Take Profit: ${formatCurrency(signal.takeProfit)}
Risk/Reward: ${getRiskRewardRatio()}
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
      
      // Fallback method if the modern API failed
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
          description: `${signal.type.toUpperCase()} ${signal.symbol} at ${formatCurrency(signal.entry)}`,
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
  
  // Get direction icon
  const DirectionIcon = signal.type === 'buy' ? TrendingUp : TrendingDown;
  const directionColor = signal.type === 'buy' ? 'text-emerald-500' : 'text-rose-500';
  const directionBg = signal.type === 'buy' ? 'bg-emerald-500/10' : 'bg-rose-500/10';
  
  return (
    <motion.div 
      className={cn(
        "overflow-hidden rounded-lg border", 
        expanded ? 'border-primary/50' : 'border-border',
        className
      )}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Card Header */}
      <div className="flex cursor-pointer items-center justify-between p-4" onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <div className={cn("flex h-10 w-10 items-center justify-center rounded-full", directionBg)}>
            <DirectionIcon className={cn("h-5 w-5", directionColor)} />
          </div>
          
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{signal.symbol}</h3>
              {signal.status === 'active' && (
                <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-1.5 py-0.5 text-xs font-medium text-emerald-500">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
                  ACTIVE
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{signal.source}</span>
              <span>•</span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {getElapsedTime()}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={cn(
            "text-sm font-medium",
            signal.type === 'buy' ? 'text-emerald-500' : 'text-rose-500'
          )}>
            {signal.type.toUpperCase()}
          </span>
          <span className="text-sm font-medium">
            {formatCurrency(signal.entry)}
          </span>
          {expanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </div>
      </div>
      
      {/* Expandable Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="border-t px-4 py-3"
          >
            {/* Performance Chart */}
            <SignalPerformanceChart signal={signal} className="mb-4" />
            
            {/* Signal Details */}
            <div className="mb-4 grid grid-cols-3 gap-3 text-center text-sm">
              <div className="flex flex-col rounded-md border p-2">
                <span className="text-xs text-muted-foreground">Entry</span>
                <span className="font-medium">{formatCurrency(signal.entry)}</span>
              </div>
              <div className="flex flex-col rounded-md border p-2">
                <span className="text-xs text-muted-foreground">Stop Loss</span>
                <span className="font-medium text-rose-500">{formatCurrency(signal.stopLoss)}</span>
              </div>
              <div className="flex flex-col rounded-md border p-2">
                <span className="text-xs text-muted-foreground">Take Profit</span>
                <span className="font-medium text-emerald-500">{formatCurrency(signal.takeProfit)}</span>
              </div>
            </div>
            
            {/* Additional Info */}
            <div className="mb-4 flex flex-col gap-2 text-sm">
              {signal.notes && (
                <div className="rounded-md bg-muted/40 p-2">
                  <p className="text-xs text-muted-foreground">{signal.notes}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Risk/Reward Ratio:</span>
                <span className="font-medium">{getRiskRewardRatio()}</span>
              </div>
              
              {signal.timeframe && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Timeframe:</span>
                  <span className="font-medium">{signal.timeframe}</span>
                </div>
              )}
            </div>
            
            {/* Action Button */}
            <Button
              variant="outline"
              className="w-full gap-2"
              onClick={copySignal}
              disabled={copying}
            >
              {copying ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy Trade</span>
                </>
              )}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}