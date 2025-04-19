import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronUp, ChevronDown, ExternalLink, BarChart2, AlertTriangle } from 'lucide-react';
import { formatCurrency, formatPercent } from '@/lib/utils/formatters';

export interface TradeCardProps {
  symbol: string;
  name?: string;
  price: number;
  change: number;
  changePercent: number;
  high?: number;
  low?: number;
  volume?: number;
  marketCap?: number;
  logoUrl?: string;
  onViewChart?: (symbol: string) => void;
  onTrade?: (symbol: string) => void;
  onAddToWatchlist?: (symbol: string) => void;
  onViewDetails?: (symbol: string) => void;
  loading?: boolean;
}

/**
 * Mobile-optimized card for displaying trade information
 */
export function MobileTradeCard({
  symbol,
  name,
  price,
  change,
  changePercent,
  high,
  low,
  volume,
  marketCap,
  logoUrl,
  onViewChart,
  onTrade,
  onAddToWatchlist,
  onViewDetails,
  loading = false
}: TradeCardProps) {
  if (loading) {
    return (
      <Card className="w-full overflow-hidden opacity-60 animate-pulse">
        <CardHeader className="pb-2">
          <div className="h-6 w-24 rounded bg-muted mb-1"></div>
          <div className="h-4 w-40 rounded bg-muted"></div>
        </CardHeader>
        <CardContent className="pb-3">
          <div className="flex justify-between items-center">
            <div className="h-7 w-20 rounded bg-muted"></div>
            <div className="h-5 w-16 rounded bg-muted"></div>
          </div>
          <div className="flex justify-between mt-3">
            <div className="h-4 w-12 rounded bg-muted"></div>
            <div className="h-4 w-12 rounded bg-muted"></div>
          </div>
        </CardContent>
        <CardFooter className="pt-0 flex justify-between gap-2">
          <div className="h-9 w-full rounded bg-muted"></div>
          <div className="h-9 w-full rounded bg-muted"></div>
        </CardFooter>
      </Card>
    );
  }

  // Format the change as positive or negative
  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const changeIcon = isPositive ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />;
  
  return (
    <Card className="w-full overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img src={logoUrl} alt={symbol} className="h-5 w-5 rounded-full" />
          )}
          <CardTitle className="text-base font-bold">{symbol}</CardTitle>
          {name && (
            <span className="text-xs text-muted-foreground truncate max-w-[140px]">
              {name}
            </span>
          )}
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7"
          onClick={() => onViewDetails && onViewDetails(symbol)}
        >
          <ExternalLink className="h-4 w-4" />
          <span className="sr-only">Details</span>
        </Button>
      </CardHeader>
      <CardContent className="pb-3">
        <div className="flex justify-between items-center">
          <div className="text-xl font-bold">{formatCurrency(price)}</div>
          <div className={`flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium ${changeColor}`}>
            {changeIcon}
            {formatCurrency(Math.abs(change))} ({formatPercent(changePercent)})
          </div>
        </div>
        <div className="flex justify-between mt-3">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">High</span>
            <span className="text-xs font-medium">
              {high !== undefined ? formatCurrency(high) : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Low</span>
            <span className="text-xs font-medium">
              {low !== undefined ? formatCurrency(low) : 'N/A'}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground">Vol</span>
            <span className="text-xs font-medium">
              {volume ? formatNumber(volume) : 'N/A'}
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-0 flex justify-between gap-2">
        <Button 
          variant="outline"
          className="flex-1 h-9" 
          onClick={() => onViewChart && onViewChart(symbol)}
        >
          <BarChart2 className="h-4 w-4 mr-1" />
          Chart
        </Button>
        <Button 
          className="flex-1 h-9" 
          onClick={() => onTrade && onTrade(symbol)}
        >
          Trade
        </Button>
      </CardFooter>
    </Card>
  );
}

// Helper function to format large numbers
function formatNumber(value: number): string {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toString();
}

export default MobileTradeCard;