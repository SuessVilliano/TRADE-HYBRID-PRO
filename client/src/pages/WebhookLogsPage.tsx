import React from 'react';
import { WebhookLogs } from '../components/settings/WebhookLogs';
import { PageHeader } from '../components/ui/page-header';
import { Helmet } from 'react-helmet-async';

export function WebhookLogsPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <Helmet>
        <title>Webhook Logs | Trade Hybrid</title>
      </Helmet>
      
      <PageHeader
        title="Webhook Logs"
        description="View logs of all webhook executions."
      />
      
      <WebhookLogs />
    </div>
  );
}