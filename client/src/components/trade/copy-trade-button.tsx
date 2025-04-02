import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import { CopyIcon, CheckIcon, SendIcon } from 'lucide-react';
import { useTradeSignalStore } from '@/lib/stores/useTradeSignalStore';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../ui/alert-dialog';
import { Switch } from '../ui/switch';
import { TradeSignal } from '@/lib/services/trade-signal-service';

interface CopyTradeButtonProps {
  signal: TradeSignal;
}

export function CopyTradeButton({ signal }: CopyTradeButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [autoExecute, setAutoExecute] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const { copySignal } = useTradeSignalStore();

  const handleCopy = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirmCopy = () => {
    copySignal(signal.id, autoExecute);
    setIsConfirmOpen(false);
    setIsCopied(true);
    
    // Reset the copied status after 2 seconds
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button variant="ghost" size="icon" onClick={handleCopy} disabled={isCopied}>
              {isCopied ? <CheckIcon className="h-4 w-4 text-green-500" /> : <CopyIcon className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>{isCopied ? 'Copied to Trading Panel' : 'Copy to Trading Panel'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <AlertDialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Copy Trading Signal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to copy this trading signal for {signal.symbol}?
              <div className="mt-4 p-4 bg-muted rounded-md">
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Symbol:</span>
                  <span>{signal.symbol}</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Side:</span>
                  <span className={signal.type === 'buy' ? 'text-green-500' : 'text-red-500'}>
                    {signal.type.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium">Entry Price:</span>
                  <span>{signal.entry.toLocaleString()}</span>
                </div>
                {signal.stopLoss && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Stop Loss:</span>
                    <span>{signal.stopLoss.toLocaleString()}</span>
                  </div>
                )}
                {signal.takeProfit && (
                  <div className="flex justify-between mb-2">
                    <span className="font-medium">Take Profit:</span>
                    <span>{signal.takeProfit.toLocaleString()}</span>
                  </div>
                )}
              </div>
              
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="auto-execute" 
                    checked={autoExecute} 
                    onCheckedChange={setAutoExecute}
                  />
                  <label htmlFor="auto-execute" className="text-sm font-medium cursor-pointer">
                    Auto-execute via broker
                  </label>
                </div>
                {autoExecute && (
                  <span className="text-xs text-amber-500">
                    This will place an order through your connected broker
                  </span>
                )}
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmCopy}>
              {autoExecute ? (
                <>
                  <SendIcon className="mr-2 h-4 w-4" />
                  Send to Broker
                </>
              ) : (
                <>
                  <CopyIcon className="mr-2 h-4 w-4" />
                  Copy to Panel
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}