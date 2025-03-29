import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface TradeRunnerWebBrowserProps {
  className?: string;
}

export function TradeRunnerWebBrowser({ className = '' }: TradeRunnerWebBrowserProps) {
  return (
    <Card className={`overflow-hidden ${className}`}>
      <CardContent className="p-0 relative">
        <iframe
          src="https://app.tradehybrid.club/51411/traderunners/"
          className="w-full border-0"
          style={{ height: 'calc(100vh - 180px)' }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </CardContent>
    </Card>
  );
}