import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeading } from '@/components/ui/page-heading';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { PageLayout } from '@/components/layout/page-layout';
import { TradingBotsManager } from '@/components/ui/trading-bots-manager';

export default function TradingBotsPage() {
  usePageTitle('Trading Bots');

  return (
    <PageLayout>
      <Helmet>
        <title>Trading Bots | TradeHybrid</title>
        <meta 
          name="description" 
          content="Create and manage automated trading bots to execute your strategies" 
        />
      </Helmet>

      <PageHeading 
        title="Trading Bots" 
        description="Create, customize, and deploy automated trading bots that execute your strategies across multiple markets."
        className="mb-6"
      />

      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8">
          <TradingBotsManager className="w-full" />
        </div>
      </div>
    </PageLayout>
  );
}