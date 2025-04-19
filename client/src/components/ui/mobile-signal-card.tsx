import React from 'react';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowUpRight, ArrowDownRight, ExternalLink, Timer, Check, AlertTriangle, Copy } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';
import { useToast } from '@/components/ui/use-toast';

export interface SignalCardProps {
  id: string;
  symbol: string;
  direction: 'buy' | 'sell';
  entryPrice: number;
  currentPrice?: number;
  stopLoss: number;
  takeProfit1?: number;
  takeProfit2?: number;
  takeProfit3?: number;
  timeframe: string;
  date: Date;
  source: string;
  status: 'active' | 'completed' | 'invalidated';
  success?: boolean;
  onViewChart?: (symbol: string) => void;
  onCopyToBroker?: (id: string) => void;
}

/**
 * Mobile-optimized card for displaying trading signals
 */
export function MobileSignalCard({
  id,
  symbol,
  direction,
  entryPrice,
  currentPrice,
  stopLoss,
  takeProfit1,
  takeProfit2,
  takeProfit3,
  timeframe,
  date,
  source,
  status,
  success,
  onViewChart,
  onCopyToBroker
}: SignalCardProps) {
  const { toast } = useToast();
  
  // Format the date
  const formattedDate = new Date(date).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
  
  // Determine styling based on direction
  const isBuy = direction === 'buy';
  const directionColor = isBuy ? 'bg-green-500' : 'bg-red-500';
  const directionIcon = isBuy 
    ? <ArrowUpRight className="h-3 w-3" /> 
    : <ArrowDownRight className="h-3 w-3" />;
  
  // Calculate profit/loss if current price is available
  let pnl = 0;
  let pnlPercent = 0;
  
  if (currentPrice && currentPrice > 0 && entryPrice > 0) {
    if (isBuy) {
      pnl = currentPrice - entryPrice;
      pnlPercent = (pnl / entryPrice) * 100;
    } else {
      pnl = entryPrice - currentPrice;
      pnlPercent = (pnl / entryPrice) * 100;
    }
  }
  
  // Determine status styling
  let statusBadge;
  switch (status) {
    case 'active':
      statusBadge = (
        <Badge variant="outline" className="gap-1 font-normal border-blue-200 text-blue-700">
          <Timer className="h-3 w-3" />
          Active
        </Badge>
      );
      break;
    case 'completed':
      statusBadge = (
        <Badge variant={success ? "success" : "destructive"} className="gap-1 font-normal">
          <Check className="h-3 w-3" />
          {success ? 'Profit' : 'Loss'}
        </Badge>
      );
      break;
    case 'invalidated':
      statusBadge = (
        <Badge variant="outline" className="gap-1 font-normal border-amber-200 text-amber-700">
          <AlertTriangle className="h-3 w-3" />
          Invalid
        </Badge>
      );
      break;
  }
  
  // Handle copying the signal
  const handleCopy = () => {
    if (onCopyToBroker) {
      onCopyToBroker(id);
    } else {
      // Create a text summary to copy to clipboard
      const summary = `
        Signal: ${symbol} ${direction.toUpperCase()}
        Entry: ${formatCurrency(entryPrice)}
        Stop Loss: ${formatCurrency(stopLoss)}
        ${takeProfit1 ? `Take Profit 1: ${formatCurrency(takeProfit1)}` : ''}
        ${takeProfit2 ? `Take Profit 2: ${formatCurrency(takeProfit2)}` : ''}
        ${takeProfit3 ? `Take Profit 3: ${formatCurrency(takeProfit3)}` : ''}
        Timeframe: ${timeframe}
        Date: ${formattedDate}
        Source: ${source}
      `.replace(/\n\s+/g, '\n').trim();
      
      navigator.clipboard.writeText(summary).then(() => {
        toast({
          title: "Copied to clipboard",
          description: "Signal details have been copied to your clipboard",
        });
      }).catch(err => {
        console.error('Failed to copy:', err);
        toast({
          title: "Failed to copy",
          description: "Could not copy signal to clipboard",
          variant: "destructive",
        });
      });
    }
  };
  
  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge className={`${directionColor} gap-1 text-white`}>
            {directionIcon}
            {direction.toUpperCase()}
          </Badge>
          <span className="font-bold">{symbol}</span>
          <span className="text-xs text-muted-foreground">{timeframe}</span>
        </div>
        {statusBadge}
      </CardHeader>
      <CardContent className="pb-3 grid gap-2">
        <div className="flex justify-between">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Entry</span>
            <span className="text-sm font-medium">{formatCurrency(entryPrice)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Stop Loss</span>
            <span className="text-sm font-medium">{formatCurrency(stopLoss)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Take Profit</span>
            <span className="text-sm font-medium">
              {takeProfit1 ? formatCurrency(takeProfit1) : 'N/A'}
            </span>
          </div>
        </div>
        
        {currentPrice && currentPrice > 0 && (
          <div className="flex justify-between items-center border-t pt-2">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Current</span>
              <span className="text-sm font-medium">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs text-muted-foreground">P/L</span>
              <span className={`text-sm font-medium ${pnl >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(Math.abs(pnl))} ({formatPercent(pnlPercent)})
              </span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>{formattedDate}</span>
          <span>Source: {source}</span>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between gap-2">
        <Button 
          variant="outline"
          className="flex-1 h-9" 
          onClick={() => onViewChart && onViewChart(symbol)}
        >
          <ExternalLink className="h-4 w-4 mr-1" />
          Chart
        </Button>
        <Button 
          variant="secondary"
          className="flex-1 h-9" 
          onClick={handleCopy}
        >
          <Copy className="h-4 w-4 mr-1" />
          Copy
        </Button>
      </CardFooter>
    </Card>
  );
}

export default MobileSignalCard;