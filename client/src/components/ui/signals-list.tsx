import React from 'react';
import { Card, CardContent } from './card';
import { Badge } from './badge';
import { useTradeSignalStore } from '@/lib/stores/useTradeSignalStore';
import { EmptyPlaceholder } from './empty-placeholder';
import { Skeleton } from './skeleton';
import { ArrowUpIcon, ArrowDownIcon, ExternalLinkIcon } from 'lucide-react';
import { CopyTradeButton } from '../trade/copy-trade-button';
import { TradeSignal } from '@/lib/services/trade-signal-service';

export function SignalsList() {
  const { signals, isLoading } = useTradeSignalStore();

  if (isLoading) {
    return <SignalsListSkeleton />;
  }

  if (!signals || signals.length === 0) {
    return (
      <EmptyPlaceholder
        title="No trading signals"
        description="There are no trading signals available at the moment."
        icon="signal"
      />
    );
  }

  return (
    <div className="space-y-4">
      {signals.map((signal) => (
        <Card key={signal.id} className="overflow-hidden transition-all hover:shadow-md">
          <CardContent className="p-0">
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Badge 
                    variant={signal.type === 'buy' ? 'success' : 'destructive'}
                    className="mr-2"
                  >
                    {signal.type.toUpperCase()}
                  </Badge>
                  <h3 className="text-lg font-semibold">{signal.symbol}</h3>
                </div>
                <Badge variant="outline" className="font-mono">
                  {signal.source}
                </Badge>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Entry Price</p>
                  <p className="text-xl font-bold">{signal.entry.toLocaleString()}</p>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Stop Loss</span>
                    <span className={`text-sm font-medium ${signal.type === 'buy' ? 'text-red-500' : 'text-green-500'}`}>
                      {signal.stopLoss?.toLocaleString()}
                      {signal.stopLoss && signal.entry && (
                        <span className="ml-1 text-xs opacity-70">
                          ({signal.type === 'buy' 
                            ? <ArrowDownIcon className="inline h-3 w-3" /> 
                            : <ArrowUpIcon className="inline h-3 w-3" />}
                          {Math.abs(((signal.stopLoss - signal.entry) / signal.entry) * 100).toFixed(2)}%)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Take Profit</span>
                    <span className={`text-sm font-medium ${signal.type === 'buy' ? 'text-green-500' : 'text-red-500'}`}>
                      {signal.takeProfit?.toLocaleString()}
                      {signal.takeProfit && signal.entry && (
                        <span className="ml-1 text-xs opacity-70">
                          ({signal.type === 'buy' 
                            ? <ArrowUpIcon className="inline h-3 w-3" /> 
                            : <ArrowDownIcon className="inline h-3 w-3" />}
                          {Math.abs(((signal.takeProfit - signal.entry) / signal.entry) * 100).toFixed(2)}%)
                        </span>
                      )}
                    </span>
                  </div>
                </div>
              </div>
              
              {signal.notes && (
                <div className="mb-3">
                  <p className="text-sm text-muted-foreground">{signal.notes}</p>
                </div>
              )}
              
              <div className="flex items-center justify-between text-sm">
                <div className="text-muted-foreground">
                  {new Date(signal.timestamp || Date.now()).toLocaleString()}
                </div>
                <div className="flex items-center space-x-2">
                  {signal.status === 'active' && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-200">
                      Active
                    </Badge>
                  )}
                  <Badge variant="outline">
                    {signal.risk ? `Risk: ${signal.risk}%` : 'N/A'}
                  </Badge>
                  
                  <CopyTradeButton signal={signal} />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function SignalsListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Skeleton className="h-6 w-16 mr-2" />
                <Skeleton className="h-6 w-24" />
              </div>
              <Skeleton className="h-6 w-24" />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-28" />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            </div>
            
            <Skeleton className="h-4 w-full mb-4" />
            
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-32" />
              <div className="flex items-center space-x-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-8 w-8" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}