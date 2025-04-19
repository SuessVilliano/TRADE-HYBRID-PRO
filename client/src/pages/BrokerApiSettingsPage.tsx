import React from 'react';
import { BrokerApiSettings } from '../components/settings/BrokerApiSettings';
import { PageHeader } from '../components/ui/page-header';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export function BrokerApiSettingsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Broker API Settings | Trade Hybrid</title>
      </Helmet>
      
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title="Broker API Settings"
          description="Connect your broker accounts to enable automated trading via webhooks."
        />
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <Link to="/webhook-settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Webhook Settings
          </Link>
        </Button>
      </div>
      
      <BrokerApiSettings />
    </div>
  );
}

export default BrokerApiSettingsPage;