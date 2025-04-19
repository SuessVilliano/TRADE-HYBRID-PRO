import React from 'react';
import { WebhookLogs } from '../components/settings/WebhookLogs';
import { PageHeader } from '../components/ui/page-header';
import { Helmet } from 'react-helmet-async';
import { Button } from '../components/ui/button';
import { ArrowLeft, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

export function WebhookLogsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Webhook Logs | Trade Hybrid</title>
      </Helmet>
      
      <div className="flex items-center justify-between mb-4">
        <PageHeader
          title="Webhook Logs"
          description="View logs of all webhook executions."
        />
        <Button variant="outline" className="flex items-center gap-2" asChild>
          <Link to="/webhook-settings">
            <ArrowLeft className="h-4 w-4" />
            Back to Webhook Settings
          </Link>
        </Button>
      </div>
      
      <WebhookLogs />
    </div>
  );
}