import * as React from 'react';
import { Helmet } from 'react-helmet-async';
import { PageHeading } from '@/components/ui/page-heading';
import { usePageTitle } from '@/lib/hooks/usePageTitle';
import { Layout } from '@/components/ui/layout';
import { TradingBotsManager } from '@/components/ui/trading-bots-manager';

export default function TradingBotsPage() {
  usePageTitle('Trading Bots');

  return (
    <Layout>
      <Helmet>
        <title>Trading Bots | TradeHybrid</title>
        <meta 
          name="description" 
          content="Create and manage automated trading bots to execute your strategies" 
        />
      </Helmet>

      <div className="container mx-auto px-4 py-8">
        <PageHeading 
          title="Trading Bots" 
          description="Create, customize, and deploy automated trading bots that execute your strategies across multiple markets."
          className="mb-6"
        />

        <div className="flex flex-col gap-8">
          <TradingBotsManager className="w-full" />
        </div>
      </div>
    </Layout>
  );
}